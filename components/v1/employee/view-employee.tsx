"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { 
  User, 
  FileText, 
  Shield, 
  Award, 
  Truck,
  Edit3,
  Save,
  X,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Upload,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Star,
  Package,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { getEmployeeById, updateEmployee } from "@/apis/create-employee.api";

const EmployeeDetailView = () => {
  const router = useRouter();
  const { id } = router.query;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State Management
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit Mode States
  const [editSections, setEditSections] = useState({
    personal: false,
    job: false,
    documents: false,
    permissions: false,
    password: false
  });

  // Form Data States
  const [personalData, setPersonalData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    bloodGroup: "",
    maritalStatus: ""
  });

  const [jobData, setJobData] = useState({
    role: "",
    department: "",
    storeId: "",
    warehouseId: "",
    salary: "",
    joinDate: "",
    status: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showPassword: false
  });

  // Document Management
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Permissions
  const [permissions, setPermissions] = useState<any[]>([]);
  const [availablePermissions] = useState([
    { id: 'read_employees', name: 'Read Employees', category: 'Employee Management' },
    { id: 'write_employees', name: 'Write Employees', category: 'Employee Management' },
    { id: 'delete_employees', name: 'Delete Employees', category: 'Employee Management' },
    { id: 'manage_inventory', name: 'Manage Inventory', category: 'Inventory' },
    { id: 'view_reports', name: 'View Reports', category: 'Reports' },
    { id: 'manage_orders', name: 'Manage Orders', category: 'Orders' },
    { id: 'admin_access', name: 'Admin Access', category: 'System' }
  ]);

  // Reward Coins
  const [rewardHistory, setRewardHistory] = useState<any[]>([]);
  const [newReward, setNewReward] = useState({ coins: "", reason: "" });

  // Deliveries (for delivery boys)
  const [deliveries, setDeliveries] = useState<any[]>([]);

  // Form Validation Errors
  const [errors, setErrors] = useState<any>({});

  // Fetch Employee Data
  useEffect(() => {
    if (id) {
      fetchEmployeeData();
    }
  }, [id]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const response = await getEmployeeById(id as string);
      
      if (!response.error && response.payload) {
        const emp = response.payload;
        setEmployee(emp);
        
        // Initialize form data
        setPersonalData({
          firstName: emp.firstName || "",
          middleName: emp.middleName || "",
          lastName: emp.lastName || "",
          email: emp.email || "",
          phoneNumber: emp.phoneNumber || "",
          dateOfBirth: emp.dateOfBirth || "",
          address: emp.address || "",
          emergencyContact: emp.emergencyContact || "",
          bloodGroup: emp.bloodGroup || "",
          maritalStatus: emp.maritalStatus || ""
        });

        setJobData({
          role: emp.role || "",
          department: emp.department || "",
          storeId: emp.storeId || "",
          warehouseId: emp.warehouseId || "",
          salary: emp.salary || "",
          joinDate: emp.joinDate || "",
          status: emp.status
        });

        setDocuments(emp.documents || []);
        setPermissions(emp.permissions || []);
        setRewardHistory(emp.rewardHistory || []);
        setDeliveries(emp.deliveries || []);
      } else {
        toast.error("Failed to fetch employee data");
        router.push("/employee-management");
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
      toast.error("Failed to fetch employee data");
      router.push("/employee-management");
    } finally {
      setLoading(false);
    }
  };

  // Validation Functions
  const validatePersonalData = () => {
    const newErrors: any = {};
    
    if (!personalData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!personalData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!personalData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(personalData.email)) {
      newErrors.email = "Email format is invalid";
    }
    
    if (!personalData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(personalData.phoneNumber.replace(/\D/g, ""))) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: any = {};
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save Functions
  const savePersonalData = async () => {
    if (!validatePersonalData()) return;
    
    try {
      setSaving(true);
      const response = await updateEmployee(employee.id, personalData);
      
      if (!response.error) {
        setEmployee({ ...employee, ...personalData });
        setEditSections(prev => ({ ...prev, personal: false }));
        toast.success("Personal details updated successfully");
      } else {
        toast.error("Failed to update personal details");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update personal details");
    } finally {
      setSaving(false);
    }
  };

  const saveJobData = async () => {
    try {
      setSaving(true);
      const response = await updateEmployee(employee.id, jobData);
      
      if (!response.error) {
        setEmployee({ ...employee, ...jobData });
        setEditSections(prev => ({ ...prev, job: false }));
        toast.success("Job information updated successfully");
      } else {
        toast.error("Failed to update job information");
      }
    } catch (error) {
      console.error("Error updating job info:", error);
      toast.error("Failed to update job information");
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (!validatePassword()) return;
    
    try {
      setSaving(true);
      // API call to update password
      // const response = await updateEmployeePassword(employee.id, passwordData);
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        showPassword: false
      });
      setEditSections(prev => ({ ...prev, password: false }));
      toast.success("Password updated successfully");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  // Document Management Functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingDoc(true);
    
    try {
      // Simulate file upload
      const newDocs = Array.from(files).map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file)
      }));
      
      setDocuments(prev => [...prev, ...newDocs]);
      toast.success("Documents uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload documents");
    } finally {
      setUploadingDoc(false);
    }
  };

  const deleteDocument = async (docId: number) => {
    try {
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      toast.success("Document deleted successfully");
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  // Permission Management
  const togglePermission = (permissionId: string) => {
    setPermissions(prev => {
      const exists = prev.find(p => p.id === permissionId);
      if (exists) {
        return prev.filter(p => p.id !== permissionId);
      } else {
        const permission = availablePermissions.find(p => p.id === permissionId);
        return [...prev, { ...permission, grantedAt: new Date().toISOString() }];
      }
    });
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      // API call to update permissions
      setEmployee({ ...employee, permissions });
      setEditSections(prev => ({ ...prev, permissions: false }));
      toast.success("Permissions updated successfully");
    } catch (error) {
      toast.error("Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  // Reward Coins Management
  const addRewardCoins = async () => {
    if (!newReward.coins || !newReward.reason) {
      toast.error("Please enter coins amount and reason");
      return;
    }
    
    try {
      const reward = {
        id: Date.now(),
        coins: parseInt(newReward.coins),
        reason: newReward.reason,
        addedBy: "Admin", // Current user
        addedAt: new Date().toISOString()
      };
      
      setRewardHistory(prev => [reward, ...prev]);
      setEmployee(prev => ({
        ...prev,
        rewardCoins: (prev.rewardCoins || 0) + reward.coins
      }));
      
      setNewReward({ coins: "", reason: "" });
      toast.success("Reward coins added successfully");
    } catch (error) {
      toast.error("Failed to add reward coins");
    }
  };

  // Toggle Edit Functions
  const toggleEdit = (section: keyof typeof editSections) => {
    setEditSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    setErrors({});
  };

  const cancelEdit = (section: keyof typeof editSections) => {
    setEditSections(prev => ({
      ...prev,
      [section]: false
    }));
    setErrors({});
    
    // Reset form data
    if (section === 'personal') {
      setPersonalData({
        firstName: employee.firstName || "",
        middleName: employee.middleName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        phoneNumber: employee.phoneNumber || "",
        dateOfBirth: employee.dateOfBirth || "",
        address: employee.address || "",
        emergencyContact: employee.emergencyContact || "",
        bloodGroup: employee.bloodGroup || "",
        maritalStatus: employee.maritalStatus || ""
      });
    }
  };

  if (loading) {
    return (
      <div className="foreground flex min-h-screen justify-center items-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="foreground flex min-h-screen justify-center items-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Employee Not Found</h2>
          <button 
            onClick={() => router.push("/employee-management")}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="foreground min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6"> 
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push("/employee-management")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {employee.firstName?.[0]}{employee.lastName?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {employee.firstName} {employee.middleName} {employee.lastName}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span>{employee.role}</span>
                  <span>•</span>
                  <span>{employee.employeeId}</span>
                  <span>•</span>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.status 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {employee.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Reward Coins</p>
              <div className="flex items-center space-x-1">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-lg">{employee.rewardCoins || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{employee.phoneNumber}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium">{employee.department || "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Details
            </h2>
            <div className="flex items-center space-x-2">
              {editSections.personal ? (
                <>
                  <button
                    onClick={savePersonalData}
                    disabled={saving}
                    className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? "Saving..." : "Save"}</span>
                  </button>
                  <button
                    onClick={() => cancelEdit('personal')}
                    className="flex items-center space-x-1 bg-gray-500 text-white px-3 py-1.5 rounded-md hover:bg-gray-600 text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit('personal')}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                {editSections.personal ? (
                  <div>
                    <input
                      type="text"
                      value={personalData.firstName}
                      onChange={(e) => setPersonalData(prev => ({ ...prev, firstName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2">{employee.firstName || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                {editSections.personal ? (
                  <input
                    type="text"
                    value={personalData.middleName}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, middleName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter middle name"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{employee.middleName || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                {editSections.personal ? (
                  <div>
                    <input
                      type="text"
                      value={personalData.lastName}
                      onChange={(e) => setPersonalData(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2">{employee.lastName || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {editSections.personal ? (
                  <div>
                    <input
                      type="email"
                      value={personalData.email}
                      onChange={(e) => setPersonalData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2">{employee.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                {editSections.personal ? (
                  <div>
                    <input
                      type="tel"
                      value={personalData.phoneNumber}
                      onChange={(e) => setPersonalData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2">{employee.phoneNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                {editSections.personal ? (
                  <input
                    type="date"
                    value={personalData.dateOfBirth}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <p className="text-gray-900 py-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : "Not specified"}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                {editSections.personal ? (
                  <textarea
                    value={personalData.address}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter complete address"
                  />
                ) : (
                  <p className="text-gray-900 py-2 flex items-start">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                    {employee.address || "Not specified"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact
                </label>
                {editSections.personal ? (
                  <input
                    type="tel"
                    value={personalData.emergencyContact}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Emergency contact number"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{employee.emergencyContact || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                {editSections.personal ? (
                  <select
                    value={personalData.bloodGroup}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                ) : (
                  <p className="text-gray-900 py-2">{employee.bloodGroup || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marital Status
                </label>
                {editSections.personal ? (
                  <select
                    value={personalData.maritalStatus}
                    onChange={(e) => setPersonalData(prev => ({ ...prev, maritalStatus: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                ) : (
                  <p className="text-gray-900 py-2 capitalize">{employee.maritalStatus || "Not specified"}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Job Information Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <User className="w-5 h-5 mr-2" />
              Job Information
            </h2>
            <div className="flex items-center space-x-2">
              {editSections.job ? (
                <>
                  <button
                    onClick={saveJobData}
                    disabled={saving}
                    className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? "Saving..." : "Save"}</span>
                  </button>
                  <button
                    onClick={() => cancelEdit('job')}
                    className="flex items-center space-x-1 bg-gray-500 text-white px-3 py-1.5 rounded-md hover:bg-gray-600 text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit('job')}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                {editSections.job ? (
                  <input
                    type="text"
                    value={jobData.role}
                    onChange={(e) => setJobData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter job role"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{employee.role || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                {editSections.job ? (
                  <input
                    type="text"
                    value={jobData.department}
                    onChange={(e) => setJobData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter department"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{employee.department || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store ID
                </label>
                {editSections.job ? (
                  <input
                    type="text"
                    value={jobData.storeId}
                    onChange={(e) => setJobData(prev => ({ ...prev, storeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter store ID"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{employee.storeId || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warehouse ID
                </label>
                {editSections.job ? (
                  <input
                    type="text"
                    value={jobData.warehouseId}
                    onChange={(e) => setJobData(prev => ({ ...prev, warehouseId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter warehouse ID"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{employee.warehouseId || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary
                </label>
                {editSections.job ? (
                  <input
                    type="number"
                    value={jobData.salary}
                    onChange={(e) => setJobData(prev => ({ ...prev, salary: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter salary"
                  />
                ) : (
                  <p className="text-gray-900 py-2">₹{employee.salary || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                {editSections.job ? (
                  <select
                    value={jobData.status.toString()}
                    onChange={(e) => setJobData(prev => ({ ...prev, status: e.target.value === 'true' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                ) : (
                  <span 
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      employee.status 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {employee.status ? "Active" : "Inactive"}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <p className="text-gray-900 py-2 bg-gray-50 px-3 rounded-md">{employee.employeeId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Join Date
                </label>
                <p className="text-gray-900 py-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(employee.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <p className="text-gray-900 py-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {new Date(employee.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Documents ({documents.length})
            </h2>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingDoc}
                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{uploadingDoc ? "Uploading..." : "Upload"}</span>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <span className="font-medium text-sm truncate">{doc.name}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Size: {(doc.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(doc.url, '_blank')}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No documents uploaded</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-blue-600 hover:text-blue-700"
                >
                  Upload your first document
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Permissions Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Permissions ({permissions.length})
            </h2>
            <div className="flex items-center space-x-2">
              {editSections.permissions ? (
                <>
                  <button
                    onClick={savePermissions}
                    disabled={saving}
                    className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? "Saving..." : "Save"}</span>
                  </button>
                  <button
                    onClick={() => cancelEdit('permissions')}
                    className="flex items-center space-x-1 bg-gray-500 text-white px-3 py-1.5 rounded-md hover:bg-gray-600 text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit('permissions')}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {editSections.permissions ? (
              <div className="space-y-4">
                {Object.entries(
                  availablePermissions.reduce((acc, perm) => {
                    if (!acc[perm.category]) acc[perm.category] = [];
                    acc[perm.category].push(perm);
                    return acc;
                  }, {} as Record<string, typeof availablePermissions>)
                ).map(([category, perms]) => (
                  <div key={category}>
                    <h3 className="font-medium text-gray-900 mb-3">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {perms.map((perm) => (
                        <label key={perm.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.some(p => p.id === perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <div>
                            <p className="font-medium text-sm">{perm.name}</p>
                            <p className="text-xs text-gray-500">{perm.category}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {permissions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissions.map((perm) => (
                      <div key={perm.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium text-sm">{perm.name}</p>
                          <p className="text-xs text-gray-500">{perm.category}</p>
                          {perm.grantedAt && (
                            <p className="text-xs text-gray-400">
                              Granted: {new Date(perm.grantedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No permissions assigned</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reward Coins Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Reward Coins
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-yellow-600 flex items-center">
                  <Award className="w-6 h-6 mr-1" />
                  {employee.rewardCoins || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Add New Reward */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Add Reward Coins</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="number"
                    placeholder="Coins amount"
                    value={newReward.coins}
                    onChange={(e) => setNewReward(prev => ({ ...prev, coins: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Reason for reward"
                    value={newReward.reason}
                    onChange={(e) => setNewReward(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <button
                    onClick={addRewardCoins}
                    className="w-full flex items-center justify-center space-x-1 bg-yellow-600 text-white px-3 py-2 rounded-md hover:bg-yellow-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Reward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Reward History */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Reward History</h3>
              {rewardHistory.length > 0 ? (
                <div className="space-y-3">
                  {rewardHistory.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Award className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">{reward.reason}</p>
                          <p className="text-sm text-gray-500">
                            Added by {reward.addedBy} on {new Date(reward.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-yellow-600">+{reward.coins}</p>
                        <p className="text-sm text-gray-500">coins</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reward history available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deliveries Section (Only for Delivery Boys) */}
        {employee.role?.toLowerCase() === "delivery boy" && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Deliveries ({deliveries.length})
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Deliveries</p>
                  <p className="text-2xl font-bold text-blue-600">{deliveries.length}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {deliveries.length > 0 ? (
                <div className="space-y-4">
                  {deliveries.map((delivery) => (
                    <div key={delivery.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            delivery.status === 'completed' ? 'bg-green-100' :
                            delivery.status === 'pending' ? 'bg-yellow-100' :
                            'bg-red-100'
                          }`}>
                            <Package className={`w-5 h-5 ${
                              delivery.status === 'completed' ? 'text-green-600' :
                              delivery.status === 'pending' ? 'text-yellow-600' :
                              'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">Order #{delivery.orderId}</p>
                            <p className="text-sm text-gray-500">{delivery.customerName}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          delivery.status === 'completed' ? 'bg-green-100 text-green-700' :
                          delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {delivery.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Address</p>
                          <p>{delivery.address}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Amount</p>
                          <p className="font-medium">₹{delivery.amount}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date</p>
                          <p>{new Date(delivery.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No deliveries assigned yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Password Management Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Password Management
            </h2>
            <div className="flex items-center space-x-2">
              {editSections.password ? (
                <>
                  <button
                    onClick={updatePassword}
                    disabled={saving}
                    className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? "Updating..." : "Update"}</span>
                  </button>
                  <button
                    onClick={() => cancelEdit('password')}
                    className="flex items-center space-x-1 bg-gray-500 text-white px-3 py-1.5 rounded-md hover:bg-gray-600 text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit('password')}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {editSections.password ? (
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordData.showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary pr-10"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {passwordData.showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type={passwordData.showPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password"
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={passwordData.showPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Password must be at least 8 characters long and contain a mix of letters and numbers.
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Password Management</p>
                <p className="text-sm text-gray-400">
                  Last password change: {employee.passwordCount > 0 ? "Recently" : "Never"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailView;