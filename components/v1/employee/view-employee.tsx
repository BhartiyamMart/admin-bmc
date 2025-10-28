'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  MapPin,
  Package,
  Plus,
  Save,
  Shield,
  Trash2,
  Truck,
  Upload,
  User,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getEmployeeById, updateEmployee } from '@/apis/create-employee.api';
import { EmployeeResponse, Delivery, EmployeeDocument } from '@/interface/employeelList';

// ---------- Types ----------
interface DocumentItem {
  id: number;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url: string;
}

interface PermissionItem {
  id: string;
  name: string;
  category: string;
  grantedAt?: string;
}

interface RewardItem {
  id: number;
  coins: number;
  reason: string;
  addedBy: string;
  addedAt: string;
}

interface ErrorMessages {
  [key: string]: string;
}

// ---------- Component ----------
const EmployeeDetailView: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- State ----------
  // Extended employee includes a few optional UI-only fields used in this component
  type ExtendedEmployee = EmployeeResponse & Partial<{
    rewardCoins: number;
    totalEarned: number;
    totalRedeemed: number;
    employeeId: string;
    passwordCount: number;
    deliveries: Delivery[];
  }>;

  const [employee, setEmployee] = useState<ExtendedEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ErrorMessages>({});

  const [editSections, setEditSections] = useState({
    personal: false,
    job: false,
    documents: false,
    permissions: false,
    password: false,
  });

  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
  });

  const [jobData, setJobData] = useState({
    role: '',
    department: '',
    storeId: '',
    warehouseId: '',
    joinDate: '',
    status: true,
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    showPassword: false,
  });

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [availablePermissions] = useState<PermissionItem[]>([
    { id: 'read_employees', name: 'Read Employees', category: 'Employee Management' },
    { id: 'write_employees', name: 'Write Employees', category: 'Employee Management' },
    { id: 'delete_employees', name: 'Delete Employees', category: 'Employee Management' },
    { id: 'manage_inventory', name: 'Manage Inventory', category: 'Inventory' },
    { id: 'view_reports', name: 'View Reports', category: 'Reports' },
    { id: 'manage_orders', name: 'Manage Orders', category: 'Orders' },
    { id: 'admin_access', name: 'Admin Access', category: 'System' },
  ]);

  const [rewardHistory, setRewardHistory] = useState<RewardItem[]>([]);
  const [newReward, setNewReward] = useState({ coins: '', reason: '' });

  // ---------- Fetch Employee ----------
  const fetchEmployeeData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await getEmployeeById(id);

      if (!response.error && response.payload) {
        // API returns EmployeeResponse in payload directly
        const payload = response.payload as EmployeeResponse;
        const emp = payload as EmployeeResponse;

        setEmployee(emp);

        setPersonalData({
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          email: emp.email || '',
          phoneNumber: emp.phoneNumber || '',
          dateOfBirth: emp.dateOfBirth || '',
          address: emp.address || '',
        });

        setJobData({
          role: emp.role || '',
          department: emp.department || '',
          storeId: emp.storeId || '',
          warehouseId: emp.warehouseId || '',
          joinDate: emp.createdAt || '',
          status: emp.status ?? true,
        });

        // Map backend documents into the UI DocumentItem shape
        const mappedDocs: DocumentItem[] = (payload.documents || []).map((d: EmployeeDocument) => ({
          id: Number(d.id) || Date.now(),
          name: d.name || '',
          type: d.type || '',
          size: 0,
          uploadedAt: d.uploadedAt || '',
          url: d.url || '',
        }));
        setDocuments(mappedDocs);

        setPermissions((payload.permissions as PermissionItem[]) || []);

        // Optional wallet handling if backend includes it — narrow from unknown
        const wallet = (payload as unknown as { wallet?: {
          currentBalance?: number;
          totalEarned?: number;
          totalRedeemed?: number;
          recentTransactions?: RewardItem[];
        } }).wallet;
        if (wallet && emp) {
          setEmployee({
            ...emp,
            rewardCoins: wallet.currentBalance || 0,
            totalEarned: wallet.totalEarned || 0,
            totalRedeemed: wallet.totalRedeemed || 0,
          } as ExtendedEmployee);
          setRewardHistory((wallet.recentTransactions as RewardItem[]) || []);
        }
      } else {
        toast.error('Failed to fetch employee data');
        router.push('/employee-management/employee-list');
      }
    } catch (err) {
      console.error('Error fetching employee:', err);
      toast.error('Failed to fetch employee data');
      router.push('/employee-management/employee-list');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) fetchEmployeeData();
  }, [id, fetchEmployeeData]);

  // Helpers for toggling and cancelling edit sections
  const toggleEdit = (section: keyof typeof editSections) => {
    setEditSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const cancelEdit = (section: keyof typeof editSections) => {
    setEditSections((prev) => ({ ...prev, [section]: false }));
  };

  // Stubs for saving job/permission/password that can be improved later
  const saveJobData = async () => {
    // Minimal behavior: close the job edit section and show toast
    setEditSections((prev) => ({ ...prev, job: false }));
    toast.success('Job details saved (local stub)');
  };

  const savePermissions = async () => {
    setEditSections((prev) => ({ ...prev, permissions: false }));
    toast.success('Permissions saved (local stub)');
  };

  const updatePassword = async () => {
    setEditSections((prev) => ({ ...prev, password: false }));
    toast.success('Password updated (local stub)');
  };

  // ---------- Validation ----------
  const validatePersonalData = (): boolean => {
    const newErrors: ErrorMessages = {};

    if (!personalData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!personalData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!personalData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(personalData.email)) newErrors.email = 'Invalid email';
    if (!personalData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone is required';
    else if (!/^\d{10}$/.test(personalData.phoneNumber)) newErrors.phoneNumber = 'Phone must be 10 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- Save Data ----------
  const savePersonalData = async () => {
    if (!employee || !validatePersonalData()) return;
    try {
      setSaving(true);
      const response = await updateEmployee(employee.id, personalData);
      if (!response.error) {
        setEmployee({ ...employee, ...personalData });
        setEditSections((prev) => ({ ...prev, personal: false }));
        toast.success('Personal details updated');
      } else toast.error('Failed to update');
    } catch (err) {
      console.error(err);
      toast.error('Error updating employee');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Document Upload ----------
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingDoc(true);

    try {
      const newDocs: DocumentItem[] = Array.from(files).map((file, i) => ({
        id: Date.now() + i,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file),
      }));
      setDocuments((prev) => [...prev, ...newDocs]);
      toast.success('Documents uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingDoc(false);
    }
  };

  const deleteDocument = (docId: number) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    toast.success('Document deleted');
  };

  // ---------- Permissions ----------
  const togglePermission = (permissionId: string) => {
    setPermissions((prev) => {
      const exists = prev.find((p) => p.id === permissionId);
      if (exists) return prev.filter((p) => p.id !== permissionId);
      const permission = availablePermissions.find((p) => p.id === permissionId);
      return permission ? [...prev, { ...permission, grantedAt: new Date().toISOString() }] : prev;
    });
  };

  // ---------- Reward Coins ----------
  const addRewardCoins = () => {
    if (!newReward.coins || !newReward.reason) {
      toast.error('Enter coins and reason');
      return;
    }
    const reward: RewardItem = {
      id: Date.now(),
      coins: parseInt(newReward.coins),
      reason: newReward.reason,
      addedBy: 'Admin',
      addedAt: new Date().toISOString(),
    };
    setRewardHistory((prev) => [reward, ...prev]);
    setEmployee((prev: ExtendedEmployee | null) =>
      prev ? { ...prev, rewardCoins: (prev.rewardCoins || 0) + reward.coins } : prev
    );
    setNewReward({ coins: '', reason: '' });
    toast.success('Reward added');
  };

  // ---------- UI ----------
  if (loading) {
    return (
      <div className="foreground flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="mt-4 text-gray-600">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="foreground flex h-[calc(100vh-8vh)] items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Employee Not Found</h2>
          <button
            onClick={() => router.push('/employee-management/employee-list')}
            className="bg-primary hover:bg-primary/90 rounded-md px-4 py-2"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="foreground min-h-screen p-2 sm:p-4">
      <div className="mx-auto  space-y-4 sm:space-y-6">
        {/* Header - Mobile Responsive */}
        <div className="rounded-lg bg-sidebar p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => router.push('/employee-management/employee-list')}
                className="rounded-full p-2 cursor-pointer "
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br bg-primary text-background text-lg sm:text-xl font-bold">
                   <User className='w-16'/>
                  {employee.firstName?.[0]}
                  {employee.lastName?.[0]}
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold"> 
                    {employee.firstName} {employee.lastName}
                  </h1>
                  <div className="flex flex-col space-y-1 text-xs sm:text-sm sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                    <span>{employee.role}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{employee.employeeId}</span>
                    <span className="hidden sm:inline">•</span>
                    <span
                      className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium ${
                        employee.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {employee.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end">
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm">Total Reward Coins</p>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-lg font-semibold">{employee.rewardCoins || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact Info - Mobile Responsive */}
        {/* <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-sidebar p-3 sm:p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5  flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm ">Email</p>
                <p className="font-medium text-sm sm:text-base truncate">{employee.email}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-sidebar p-3 sm:p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm">Phone</p>
                <p className="font-medium text-sm sm:text-base">{employee.phoneNumber}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-sidebar p-3 sm:p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm">Department</p>
                <p className="font-medium text-sm sm:text-base">{employee.department || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div> */}


        {/* Personal Details Section - Mobile Responsive */}
        <div className="rounded-lg bg-sidebar shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base sm:text-lg font-semibold">
              <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Personal Details
            </h2>
            <div className="flex items-center space-x-2">
              {editSections.personal ? (
                <>
                  <button
                    onClick={savePersonalData}
                    disabled={saving}
                    className="flex items-center space-x-1 rounded-md bg-primary text-background  px-3 py-1.5 text-xs sm:text-sm disabled:opacity-50"
                  >
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => cancelEdit('personal')}
                    className="flex items-center space-x-1 rounded-md  px-3 py-1.5 text-xs sm:text-sm bg-primary text-background"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit('personal')}
                  className="flex items-center space-x-1 rounded-md px-3 py-1.5 text-xs sm:text-sm foreground bg-primary text-background">
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* UPDATED: Removed middleName, emergencyContact, bloodGroup, maritalStatus */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium">First Name</label>
                {editSections.personal ? (
                  <div>
                    <input
                      type="text"
                      value={personalData.firstName}
                      onChange={(e) => setPersonalData((prev) => ({ ...prev, firstName: e.target.value }))}
                      className={`focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                  </div>
                ) : (
                  <p className="py-2 text-sm">{employee.firstName || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium">Last Name</label>
                {editSections.personal ? (
                  <div>
                    <input
                      type="text"
                      value={personalData.lastName}
                      onChange={(e) => setPersonalData((prev) => ({ ...prev, lastName: e.target.value }))}
                      className={`focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                  </div>
                ) : (
                  <p className="py-2 text-sm">{employee.lastName || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium">Email</label>
                {editSections.personal ? (
                  <div>
                    <input
                      type="email"
                      value={personalData.email}
                      onChange={(e) => setPersonalData((prev) => ({ ...prev, email: e.target.value }))}
                      className={`focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                ) : (
                  <p className="py-2 text-sm break-all">{employee.email}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium">Phone Number</label>
                {editSections.personal ? (
                  <div>
                    <input
                      type="tel"
                      value={personalData.phoneNumber}
                      onChange={(e) => setPersonalData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                      className={`focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                    {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>}
                  </div>
                ) : (
                  <p className="py-2 text-sm">{employee.phoneNumber}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium">Date of Birth</label>
                {editSections.personal ? (
                  <input
                    type="date"
                    value={personalData.dateOfBirth}
                    onChange={(e) => setPersonalData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                  />
                ) : (
                  <p className="flex items-center py-2 text-sm">
                    <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'Not specified'}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs sm:text-sm font-medium">Address</label>
                {editSections.personal ? (
                  <textarea
                    value={personalData.address}
                    onChange={(e) => setPersonalData((prev) => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    placeholder="Enter complete address"
                  />
                ) : (
                  <p className="flex items-start py-2 text-sm">
                    <MapPin className="mt-0.5 mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    {employee.address || 'Not specified'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Job Information Section - Mobile Responsive */}
        <div className="rounded-lg bg-sidebar shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base sm:text-lg font-semibold">
              <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Job Information
            </h2>
            <div className="flex items-center space-x-2">
              {editSections.job ? (
                <>
                  <button
                    onClick={saveJobData}
                    disabled={saving}
                    className="flex items-center space-x-1 rounded-md bg-primary text-background px-3 py-1.5 text-xs sm:text-sm foreground  disabled:opacity-50"
                  >
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => cancelEdit('job')}
                    className="flex items-center space-x-1 rounded-md bg-primary text-background px-3 py-1.5 text-xs sm:text-sm foreground"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit('job')}
                  className="flex items-center space-x-1 rounded-md bg-primary text-background px-3 py-1.5 text-xs sm:text-sm foreground"
                >
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* UPDATED: Removed salary field */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium">Role</label>
                {editSections.job ? (
                  <input
                    type="text"
                    value={jobData.role}
                    onChange={(e) => setJobData((prev) => ({ ...prev, role: e.target.value }))}
                    className="focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    placeholder="Enter job role"
                  />
                ) : (
                  <p className="py-2 text-sm text-gray-900">{employee.role || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium">Department</label>
                {editSections.job ? (
                  <input
                    type="text"
                    value={jobData.department}
                    onChange={(e) => setJobData((prev) => ({ ...prev, department: e.target.value }))}
                    className="focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    placeholder="Enter department"
                  />
                ) : (
                  <p className="py-2 text-sm text-gray-900">{employee.department || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium">Store ID</label>
                {editSections.job ? (
                  <input
                    type="text"
                    value={jobData.storeId}
                    onChange={(e) => setJobData((prev) => ({ ...prev, storeId: e.target.value }))}
                    className="focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    placeholder="Enter store ID"
                  />
                ) : (
                  <p className="py-2 text-sm text-gray-900">{employee.storeId || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium">Warehouse ID</label>
                {editSections.job ? (
                  <input
                    type="text"
                    value={jobData.warehouseId}
                    onChange={(e) => setJobData((prev) => ({ ...prev, warehouseId: e.target.value }))}
                    className="focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    placeholder="Enter warehouse ID"
                  />
                ) : (
                  <p className="py-2 text-sm text-gray-900">{employee.warehouseId || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium">Status</label>
                {editSections.job ? (
                  <select
                    value={jobData.status.toString()}
                    onChange={(e) => setJobData((prev) => ({ ...prev, status: e.target.value === 'true' }))}
                    className="focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                ) : (
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      employee.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {employee.status ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium">Employee ID</label>
                <p className="rounded-md px-3 py-2 text-sm">{employee.employeeId}</p>
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium">Join Date</label>
                <p className="flex items-center py-2 text-sm">
                  <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'Not specified'}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs sm:text-sm font-medium">Last Updated</label>
                <p className="flex items-center py-2 text-sm">
                  <Clock className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  {employee.updatedAt ? new Date(employee.updatedAt).toLocaleDateString() : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section - Mobile Responsive */}
        <div className="rounded-lg bg-sidebar shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base sm:text-lg font-semibold">
              <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> 
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
                className="flex items-center space-x-1 cursor-pointer rounded-md bg-primary text-background px-3 py-1.5 text-xs sm:text-sm foreground  disabled:opacity-50"
              >
                <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{uploadingDoc ? 'Uploading...' : 'Upload'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="rounded-lg border p-3 sm:p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex items-center space-x-2">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                          <span className="truncate text-xs sm:text-sm font-medium">{doc.name}</span>
                        </div>
                        <p className="text-xs text-gray-500">Size: {(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => window.open(doc.url, '_blank')}
                          className="rounded cursor-pointer p-1.5 text-blue-600 hover:bg-blue-50"
                          title="View Document"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="rounded p-1.5 cursor-pointer text-red-600 hover:bg-red-50"
                          title="Delete Document"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <FileText className="mx-auto mb-4 h-8 w-8 sm:h-12 sm:w-12" />
                <p className="text-sm text-gray-500">No documents uploaded</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-sm cursor-pointer text-blue-600 hover:text-blue-700"
                >
                  Upload your first document
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Permissions Section - Mobile Responsive */}
        <div className="rounded-lg bg-sidebar shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base sm:text-lg font-semibold">
              <Shield className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Permissions ({permissions.length})
            </h2>
            <div className="flex items-center space-x-2">
              {editSections.permissions ? (
                <>
                  <button
                    onClick={savePermissions}
                    disabled={saving}
                    className="flex items-center space-x-1 bg-primary text-background rounded-md px-3 py-1.5 text-xs sm:text-sm foreground disabled:opacity-50"
                  >
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => cancelEdit('permissions')}
                    className="flex items-center bg-primary text-background space-x-1 rounded-md  px-3 py-1.5 text-xs sm:text-sm foreground"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit('permissions')}
                  className="flex items-center space-x-1 rounded-md bg-primary text-background px-3 py-1.5 text-xs sm:text-sm foreground"
                >
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {editSections.permissions ? (
              <div className="space-y-4">
                {Object.entries(
                  availablePermissions.reduce(
                    (acc, perm) => {
                      if (!acc[perm.category]) acc[perm.category] = [];
                      acc[perm.category].push(perm);
                      return acc;
                    },
                    {} as Record<string, typeof availablePermissions>
                  )
                ).map(([category, perms]) => (
                  <div key={category}>
                    <h3 className="mb-3 text-sm sm:text-base font-medium text-gray-900">{category}</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {perms.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={permissions.some((p) => p.id === perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium truncate">{perm.name}</p>
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
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {permissions.map((perm) => (
                      <div key={perm.id} className="flex items-center space-x-3 rounded-lg border p-3">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium truncate">{perm.name}</p>
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
                  <div className="py-8 text-center">
                    <Shield className="mx-auto mb-4 h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                    <p className="text-sm text-gray-500">No permissions assigned</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reward Coins Section - Mobile Responsive */}
        <div className="rounded-lg bg-sidebar shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base sm:text-lg font-semibold">
              <Award className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Reward Coins
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm">Total Balance</p>
                <p className="flex items-center text-xl sm:text-2xl font-bold text-yellow-600">
                  <Award className="mr-1 h-5 w-5 sm:h-6 sm:w-6" />
                  {employee.rewardCoins || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Add New Reward - Mobile Responsive */}
            <div className="mb-6 rounded-lg border p-3 sm:p-4">
              <h3 className="mb-3 text-sm sm:text-base font-medium text-gray-900">Add Reward Coins</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
                <div>
                  <input
                    type="number"
                    placeholder="Coins amount"
                    value={newReward.coins}
                    onChange={(e) => setNewReward((prev) => ({ ...prev, coins: e.target.value }))}
                    className="focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Reason for reward"
                    value={newReward.reason}
                    onChange={(e) => setNewReward((prev) => ({ ...prev, reason: e.target.value }))}
                    className="focus:ring-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                  />
                </div>
                <div>
                  <button
                    onClick={addRewardCoins}
                    className="flex w-full bg-primary text-background items-center justify-center space-x-1 rounded-md border-gray-300 px-3 py-2 text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Add Reward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Reward History - Mobile Responsive */}
            <div>
              <h3 className="mb-4 text-sm sm:text-base font-medium">Reward History</h3>
              {rewardHistory.length > 0 ? (
                <div className="space-y-3">
                  {rewardHistory.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between rounded-lg border p-3 sm:p-4">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full flex-shrink-0">
                          <Award className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{reward.reason}</p>
                          <p className="text-xs">
                            Added by {reward.addedBy} on {new Date(reward.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-lg font-bold">+{reward.coins}</p>
                        <p className="text-xs">coins</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Award className="mx-auto mb-4 h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <p className="text-sm">No reward history available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deliveries Section (Only for Delivery Boys) - Mobile Responsive */}
        {employee.role?.toLowerCase() === 'delivery boy' && (
          <div className="rounded-lg bg-sidebar shadow-sm">
            <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
              <h2 className="flex items-center text-base sm:text-lg font-semibold">
                <Truck className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Deliveries ({employee.deliveries.length})
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-600">Total Deliveries</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{employee.deliveries.length}</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {employee.deliveries.length > 0 ? (
                <div className="space-y-4">
                  {employee.deliveries.map((delivery: Delivery) => (
                    <div key={delivery.id} className="rounded-lg border p-3 sm:p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div
                            className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full flex-shrink-0 ${
                              delivery.status === 'completed'
                                ? 'bg-green-100'
                                : delivery.status === 'pending'
                                  ? 'bg-yellow-100'
                                  : 'bg-red-100'
                            }`}
                          >
                            <Package
                              className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                delivery.status === 'completed'
                                  ? 'text-green-600'
                                  : delivery.status === 'pending'
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                              }`}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">Order #{delivery.orderId}</p>
                            <p className="text-xs text-gray-500 truncate">{delivery.customerName}</p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium flex-shrink-0 ${
                            delivery.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : delivery.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {delivery.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 text-xs sm:text-sm sm:grid-cols-3">
                        <div>
                          <p className="text-gray-600">Address</p>
                          <p className="truncate">{delivery.address}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Amount</p>
                          <p className="font-medium">₹{delivery.amount}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date</p>
                          <p>{delivery.date ? new Date(delivery.date).toLocaleDateString() : 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Truck className="mx-auto mb-4 h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <p className="text-sm text-gray-500">No deliveries assigned yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Password Management Section - Mobile Responsive */}
        <div className="rounded-lg bg-sidebar shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base sm:text-lg font-semibold">
              <Shield className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Password Management
            </h2>
            <div className="flex items-center space-x-2">
              {editSections.password ? (
                <>
                  <button
                    onClick={updatePassword}
                    disabled={saving}
                    className="flex items-center space-x-1 rounded-md bg-green-600 px-3 py-1.5 text-xs sm:text-sm foreground hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{saving ? 'Updating...' : 'Update'}</span>
                  </button>
                  <button
                    onClick={() => cancelEdit('password')}
                    className="flex items-center space-x-1 rounded-md bg-gray-500 px-3 py-1.5 text-xs sm:text-sm foreground hover:bg-gray-600"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit('password')}
                  className="flex items-center space-x-1 rounded-md bg-primary text-background  px-3 py-1.5 text-xs sm:text-sm foreground">
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Change Password</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {editSections.password ? (
              <div className="max-w-md space-y-4">
                {/* REMOVED currentPassword field */}
                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type={passwordData.showPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className={`focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password"
                  />
                  {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs sm:text-sm font-medium text-gray-700">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={passwordData.showPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`focus:ring-primary w-full rounded-md border px-3 py-2 pr-10 text-sm focus:ring-1 focus:outline-none ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordData((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {passwordData.showPassword ? (
                        <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>

                <div className="text-xs text-gray-500">
                  Password must be at least 8 characters long and contain a mix of letters and numbers.
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Shield className="mx-auto mb-4 h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">Password Management</p>
                <p className="text-xs text-gray-400">
                  Last password change: {(employee.passwordCount ?? 0) > 0 ? 'Recently' : 'Never'}
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
