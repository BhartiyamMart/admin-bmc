'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandList, CommandItem, CommandGroup, CommandEmpty } from '@/components/ui/command';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Calendar,
  Camera,
  Check,
  CheckCircle,
  ChevronDown,
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
import { formatDateToDDMMYYYY } from '@/lib/utils';
import Image from 'next/image';
import { createPreassignedUrl } from '@/apis/create-banners.api';

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

// Add a proper interface for the parsed user data from localStorage
interface LocalStorageUser {
  profileImage?: string;
  firstName?: string;
  email?: string;
}

// Define gender type explicitly
type Gender = 'male' | 'female' | 'other' | 'prefer_not_say' | '';

// ---------- Component ----------
const EmployeeDetailView: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- State ----------
  // Extended employee includes a few optional UI-only fields used in this component
  type ExtendedEmployee = EmployeeResponse &
    Partial<{
      rewardCoins: number;
      totalEarned: number;
      totalRedeemed: number;
      employeeId: string;
      passwordCount: number;
      deliveries: Delivery[];
      gender: Gender;
    }>;

  const [employee, setEmployee] = useState<ExtendedEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ErrorMessages>({});
  const [empId, setEmpId] = useState<string>('');
  const [editSections, setEditSections] = useState({
    personal: false,
    job: false,
    documents: false,
    permissions: false,
    password: false,
  });
  const [openGenderDropdown, setOpenGenderDropdown] = useState(false);
  const [genderSearchValue, setGenderSearchValue] = useState('');

  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    gender: '' as Gender,
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
  const [userimage, setUserimage] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [profiledata, setProfiledata] = useState<EmployeeResponse | null>(null);
  const [address, setAddress] = useState<string>('');
  console.log('employee', employee);
  // const [userImage, setUserImage] = useState(employee.profile?.profileImageUrl || '/default-profile.png');

  const img = localStorage.getItem('user');
  useEffect(() => {
    if (!img) return;
    try {
      const parsed: LocalStorageUser = JSON.parse(img);
      if (parsed) {
        if (parsed.profileImage) setUserimage(parsed.profileImage);
        setPersonalData((prev) => ({
          ...prev,
          firstName: parsed.firstName ?? prev.firstName,
          email: parsed.email ?? prev.email,
        }));
      }
    } catch (e) {
      console.error('Failed to parse local user', e);
    }
  }, [img]);

  //---------update the profile image when changed -----------
  // ✅ Keep the ref separate
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  // ✅ Create a properly named handler function
  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Step 1️⃣ Get presigned URL
      const presignResponse = await createPreassignedUrl({
        fileName: file.name,
        fileType: file.type,
      });

      if (presignResponse.error) {
        toast.error('Failed to generate upload URL');
        return;
      }

      console.log('Presign Response:', presignResponse);

      const { presignedUrl, fileUrl } = presignResponse.payload;

      // Step 2️⃣ Upload to S3
      await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      // Step 3️⃣ Update employee profile with new image URL
      const updateResponse = await updateEmployee(empId, {
        profileImageUrl: fileUrl,
      });

      if (updateResponse.error) {
        toast.error('Failed to update employee profile');
        return;
      }

      // Step 4️⃣ Update UI
      setUserimage(fileUrl);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong while uploading image');
    } finally {
      setUploading(false);
    }
  };

  // ---------- Fetch Employee ----------
  const fetchEmployeeData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await getEmployeeById(id);

      if (response.payload) {
        const emp = response.payload.employee;
        const profile = response.payload.profile;
        setProfiledata(profile);

        // ✅ Store values in local variables
        const addresss = profile?.addressLine1 + profile?.addressLine2;
        setAddress(addresss);
        const employeeid = emp.employeeId;
        setEmpId(employeeid);
        setUserimage(profile?.profileImageUrl || '/images/avatar.jpg');

        const documents = emp.documents || [];
        const permissions = emp.permissions || [];
        const wallet = emp.wallet as
          | number
          | {
              currentBalance?: number;
              totalEarned?: number;
              totalRedeemed?: number;
            }
          | undefined;

        // ✅ Set employee data
        setEmployee({
          ...(emp as unknown as ExtendedEmployee),
          rewardCoins: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          rewardHistory: [],
          deliveries: [],
        });

        // ✅ Set personal data - USE LOCAL VARIABLE 'addresss' NOT STATE 'address'
        setPersonalData({
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          email: emp.email || '',
          phoneNumber: emp.phoneNumber || '',
          dateOfBirth: emp.dateOfBirth || '',
          address: addresss || '', // ✅ FIXED: Use local variable 'addresss'
          gender: (profile?.gender as Gender) || '',
        });

        // ✅ Set job data
        setJobData({
          role: emp.role || '',
          department: emp.department || '',
          storeId: emp.storeId || '',
          warehouseId: emp.warehouseId || '',
          joinDate: emp.createdAt || '',
          status: emp.status ?? true,
        });

        // ✅ Map and set documents
        const mappedDocs: DocumentItem[] = documents.map((d: EmployeeDocument) => ({
          id: Number(d.id) || Date.now(),
          name: d.name || '',
          type: d.type || '',
          size: 0,
          uploadedAt: d.uploadedAt || '',
          url: d.url || '',
        }));
        setDocuments(mappedDocs);

        // ✅ Set permissions
        setPermissions((permissions as PermissionItem[]) || []);

        // ✅ Handle wallet data
        if (wallet && emp) {
          const currentBalance = typeof wallet === 'number' ? wallet : (wallet?.currentBalance ?? 0);
          const totalEarned = typeof wallet === 'number' ? 0 : (wallet?.totalEarned ?? 0);
          const totalRedeemed = typeof wallet === 'number' ? 0 : (wallet?.totalRedeemed ?? 0);

          const updatedEmployee: ExtendedEmployee = {
            ...(emp as unknown as ExtendedEmployee),
            rewardCoins: currentBalance,
            totalEarned,
            totalRedeemed,
            rewardHistory: [],
            deliveries: [],
          };

          setEmployee(updatedEmployee);
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
  }, [id, router]); // ✅ No ESLint warning - only dependencies you actually read

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
    else if (!/^\d{10}$/.test(personalData.phoneNumber)) newErrors.phoneNumber = 'Phone number must be 10 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- Save Data ----------
  const savePersonalData = async () => {
    if (!employee || !validatePersonalData()) return;

    try {
      setSaving(true);

      const formattedData = {
        ...personalData,
        dateOfBirth: formatDateToDDMMYYYY(personalData.dateOfBirth),
        gender: personalData.gender?.toUpperCase() || undefined,
      };

      const response = await updateEmployee(empId, formattedData);

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
            className="bg-primary hover:bg-primary/90 cursor-pointer rounded-md px-4 py-2"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="foreground min-h-screen p-2 sm:p-4">
      <div className="mx-auto space-y-4 sm:space-y-6">
        {/* Header - Mobile Responsive */}
        <div className="bg-sidebar rounded-lg p-4 shadow-sm sm:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => router.push('/employee-management/employee-list')}
                className="hover:bg-muted cursor-pointer rounded-full p-2"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* Profile Image Section */}
              <div className="relative">
                <div className="border-sidebar h-15 w-15 rounded-full">
                  <Image
                    src={userimage}
                    alt={`${employee.firstName} ${employee.lastName}`}
                    width={1000}
                    height={1000}
                    quality={100}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </div>

                {/* ✅ Upload button - using the CORRECT ref */}
                <button
                  onClick={() => profileImageInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-background/70 hover:bg-background absolute right-0 bottom-0 cursor-pointer rounded-full p-1 shadow-md transition"
                >
                  <Camera className="text-foreground h-4 w-4 cursor-pointer" />
                </button>

                {/* ✅ Hidden file input - using the CORRECT handler */}
                <input
                  type="file"
                  ref={profileImageInputRef}
                  onChange={handleProfileImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <h1 className="text-lg font-bold sm:text-2xl">
                  {employee.firstName} {employee.lastName}
                </h1>
                <div className="flex flex-col space-y-1 text-xs sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 sm:text-sm">
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

        {/* Personal Details Section - Mobile Responsive */}
        <div className="bg-sidebar rounded-lg shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base font-semibold sm:text-lg">
              <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Personal Details
            </h2>
            <div className="flex items-center space-x-2">
              {editSections.personal ? (
                <>
                  <button
                    onClick={savePersonalData}
                    disabled={saving}
                    className="bg-primary text-background flex cursor-pointer items-center space-x-1 rounded-md px-3 py-1.5 text-xs disabled:opacity-50 sm:text-sm"
                  >
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => cancelEdit('personal')}
                    className="bg-primary text-background flex cursor-pointer items-center space-x-1 rounded-md px-3 py-1.5 text-xs sm:text-sm"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit('personal')}
                  className="foreground bg-primary text-background flex cursor-pointer items-center space-x-1 rounded-md px-3 py-1.5 text-xs sm:text-sm"
                >
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">
                  First Name<span className="text-red-500"> *</span>
                </label>
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
                <label className="mb-1 block text-xs font-medium sm:text-sm">Last Name</label>
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
                <label className="mb-1 block text-xs font-medium sm:text-sm">
                  Email<span className="text-red-500"> *</span>
                </label>
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
                <label className="mb-1 block text-xs font-medium sm:text-sm">
                  Phone Number<span className="text-red-500"> *</span>
                </label>

                {editSections.personal ? (
                  <div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={personalData.phoneNumber}
                      onChange={(e) => {
                        // allow only digits
                        const numericValue = e.target.value.replace(/[^0-9]/g, '');

                        setPersonalData((prev) => ({ ...prev, phoneNumber: numericValue }));

                        // 🔥 remove error automatically when 10 digits are filled
                        if (numericValue.length === 10) {
                          setErrors((prev) => ({ ...prev, phoneNumber: '' }));
                        }
                      }}
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
                <label className="block text-sm font-medium">
                  Gender <span className="text-red-500">*</span>
                </label>

                {editSections.personal ? (
                  // Editable Mode
                  <Popover open={openGenderDropdown} onOpenChange={setOpenGenderDropdown}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2"
                      >
                        {personalData.gender
                          ? personalData.gender.charAt(0).toUpperCase() + personalData.gender.slice(1)
                          : 'Select Gender'}
                        <ChevronDown className="ml-2" />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                      <Command shouldFilter={false}>
                        <CommandList>
                          <CommandEmpty>No gender found.</CommandEmpty>

                          <CommandGroup>
                            {['male', 'female', 'other']
                              .filter((g) => g.toLowerCase().includes(genderSearchValue.toLowerCase()))
                              .map((g) => (
                                <CommandItem
                                  key={g}
                                  value={g}
                                  className="cursor-pointer"
                                  onSelect={(val) => {
                                    setPersonalData((prev) => ({ ...prev, gender: val as Gender }));
                                    setOpenGenderDropdown(false);
                                    setGenderSearchValue('');
                                  }}
                                >
                                  {g.charAt(0).toUpperCase() + g.slice(1)}
                                  <Check
                                    className={`ml-auto ${personalData.gender === g ? 'opacity-100' : 'opacity-0'}`}
                                  />
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                ) : (
                  // Non-Editable Mode
                  <p className="py-2 text-sm">
                    {personalData.gender
                      ? personalData.gender.charAt(0).toUpperCase() + personalData.gender.slice(1)
                      : '—'}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">
                  Date of Birth<span className="text-red-500"> *</span>
                </label>
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
                    {profiledata?.dateOfBirth}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium sm:text-sm">Address</label>
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
                    <MapPin className="mt-0.5 mr-2 h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                    {address || 'Not specified'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Job Information Section - Mobile Responsive */}
        <div className="bg-sidebar rounded-lg shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base font-semibold sm:text-lg">
              <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Job Information
            </h2>
            <div className="flex items-center space-x-2">
              {editSections.job ? (
                <>
                  <button
                    onClick={saveJobData}
                    disabled={saving}
                    className="bg-primary text-background foreground flex cursor-pointer items-center space-x-1 rounded-md px-3 py-1.5 text-xs disabled:opacity-50 sm:text-sm"
                  >
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => cancelEdit('job')}
                    className="bg-primary text-background foreground flex cursor-pointer items-center space-x-1 rounded-md px-3 py-1.5 text-xs sm:text-sm"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit('job')}
                  className="bg-primary text-background foreground flex cursor-pointer items-center space-x-1 rounded-md px-3 py-1.5 text-xs sm:text-sm"
                >
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Role</label>
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
                <label className="mb-1 block text-xs font-medium sm:text-sm">Store ID</label>
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
                <label className="mb-1 block text-xs font-medium sm:text-sm">Warehouse ID</label>
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
                <label className="mb-1 block text-xs font-medium sm:text-sm">Status</label>
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
                <label className="mb-1 block text-xs font-medium sm:text-sm">Employee ID</label>
                <p className="rounded-md px-3 py-2 text-sm">{employee.employeeId}</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Join Date</label>
                <p className="flex items-center py-2 text-sm">
                  <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  {employee?.createdAt}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-sidebar rounded-lg shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base font-semibold sm:text-lg">
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
                className="bg-primary text-background foreground flex cursor-pointer items-center space-x-1 rounded-md px-3 py-1.5 text-xs disabled:opacity-50 sm:text-sm"
              >
                <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{uploadingDoc ? 'Uploading...' : 'Upload'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="rounded-lg border p-3 transition-shadow hover:shadow-md sm:p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center space-x-2">
                          <FileText className="h-4 w-4 flex-shrink-0 text-blue-500 sm:h-5 sm:w-5" />
                          <span className="truncate text-xs font-medium sm:text-sm">{doc.name}</span>
                        </div>
                        <p className="text-xs text-gray-500">Size: {(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-2 flex items-center space-x-1">
                        <button
                          onClick={() => window.open(doc.url, '_blank')}
                          className="cursor-pointer rounded p-1.5 text-blue-600 hover:bg-blue-50"
                          title="View Document"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="cursor-pointer rounded p-1.5 text-red-600 hover:bg-red-50"
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
                  className="mt-2 cursor-pointer text-sm text-blue-600 hover:text-blue-700"
                >
                  Upload first document
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Permissions Section */}
        <div className="bg-sidebar rounded-lg shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base font-semibold sm:text-lg">
              <Shield className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Permissions ({permissions.length})
            </h2>
            <div className="flex items-center space-x-2">
              {editSections.permissions ? (
                <>
                  <button
                    onClick={savePermissions}
                    disabled={saving}
                    className="bg-primary text-background foreground flex cursor-pointer items-center space-x-1 rounded-md px-3 py-1.5 text-xs disabled:opacity-50 sm:text-sm"
                  >
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => cancelEdit('permissions')}
                    className="bg-primary text-background foreground flex cursor-pointer items-center space-x-1 rounded-md px-3 py-1.5 text-xs sm:text-sm"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit('permissions')}
                  className="bg-primary text-background foreground flex cursor-pointer items-center space-x-1 rounded-md px-3 py-1.5 text-xs sm:text-sm"
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
                    {} as Record<string, PermissionItem[]>
                  )
                ).map(([category, perms]) => (
                  <div key={category}>
                    <h3 className="mb-3 text-sm font-medium text-gray-900 sm:text-base">{category}</h3>
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
                            <p className="truncate text-xs font-medium sm:text-sm">{perm.name}</p>
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                    {permissions.map((perm) => (
                      <div key={perm.id} className="flex items-center space-x-3 rounded-lg border p-3">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500 sm:h-5 sm:w-5" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium sm:text-sm">{perm.name}</p>
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
                    <Shield className="mx-auto mb-4 h-8 w-8 text-gray-400 sm:h-12 sm:w-12" />
                    <p className="text-sm text-gray-500">No permissions assigned</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reward Coins Section */}
        <div className="bg-sidebar rounded-lg shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base font-semibold sm:text-lg">
              <Award className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Reward Coins
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm">Total Balance</p>
                <p className="flex items-center text-xl font-bold text-yellow-600 sm:text-2xl">
                  <Award className="mr-1 h-5 w-5 sm:h-6 sm:w-6" />
                  {employee.rewardCoins || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-6 rounded-lg border p-3 sm:p-4">
              <h3 className="mb-3 text-sm font-medium text-gray-900 sm:text-base">Add Reward Coins</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
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
                    className="bg-primary text-background flex w-full cursor-pointer items-center justify-center space-x-1 rounded-md border-gray-300 px-3 py-2 text-sm"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Add Reward</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-medium sm:text-base">Reward History</h3>
              {rewardHistory.length > 0 ? (
                <div className="space-y-3">
                  {rewardHistory.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between rounded-lg border p-3 sm:p-4">
                      <div className="flex min-w-0 flex-1 items-center space-x-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10">
                          <Award className="h-4 w-4 text-yellow-600 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{reward.reason}</p>
                          <p className="text-xs">
                            Added by {reward.addedBy} on {new Date(reward.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 text-right">
                        <p className="text-lg font-bold">+{reward.coins}</p>
                        <p className="text-xs">coins</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Award className="mx-auto mb-4 h-8 w-8 text-gray-400 sm:h-12 sm:w-12" />
                  <p className="text-sm">No reward history available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deliveries Section (Only for Delivery Boys) */}
        {employee.role?.toLowerCase() === 'delivery_partner' && employee.deliveries && (
          <div className="bg-sidebar rounded-lg shadow-sm">
            <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
              <h2 className="flex items-center text-base font-semibold sm:text-lg">
                <Truck className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Deliveries ({employee.deliveries?.length || 0})
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-left sm:text-right">
                  <p className="text-xs text-gray-600 sm:text-sm">Total Deliveries</p>
                  <p className="text-xl font-bold text-blue-600 sm:text-2xl">{employee.deliveries?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {employee.deliveries && employee.deliveries.length > 0 ? (
                <div className="space-y-4">
                  {employee.deliveries.map((delivery: Delivery) => (
                    <div key={delivery.id} className="rounded-lg border p-3 sm:p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex min-w-0 flex-1 items-center space-x-3">
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
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
                            <p className="truncate text-sm font-medium">Order #{delivery.orderId}</p>
                            <p className="truncate text-xs text-gray-500">{delivery.customerName}</p>
                          </div>
                        </div>
                        <span
                          className={`flex-shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
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

                      <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3 sm:text-sm">
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
                  <Truck className="mx-auto mb-4 h-8 w-8 text-gray-400 sm:h-12 sm:w-12" />
                  <p className="text-sm text-gray-500">No deliveries assigned yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Password Management Section */}
        <div className="bg-sidebar rounded-lg shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base font-semibold sm:text-lg">
              <Shield className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Password Management
            </h2>
            <div className="flex items-center space-x-2">
              {editSections.password ? (
                <>
                  <button
                    onClick={updatePassword}
                    disabled={saving}
                    className="foreground flex cursor-pointer items-center space-x-1 rounded-md bg-green-600 px-3 py-1.5 text-xs hover:bg-green-700 disabled:opacity-50 sm:text-sm"
                  >
                    <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{saving ? 'Updating...' : 'Update'}</span>
                  </button>
                  <button
                    onClick={() => cancelEdit('password')}
                    className="foreground flex cursor-pointer items-center space-x-1 rounded-md bg-gray-500 px-3 py-1.5 text-xs hover:bg-gray-600 sm:text-sm"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit('password')}
                  className="bg-primary text-background foreground flex cursor-pointer items-center space-x-1 rounded-md px-3 py-1.5 text-xs sm:text-sm"
                >
                  <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Change Password</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {editSections.password ? (
              <div className="max-w-md space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">New Password</label>
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
                  <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                    Confirm New Password
                  </label>
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
                      className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
                    >
                      {passwordData.showPassword ? (
                        <EyeOff className="h-3 w-3 text-gray-500 sm:h-4 sm:w-4" />
                      ) : (
                        <Eye className="h-3 w-3 text-gray-500 sm:h-4 sm:w-4" />
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
                <Shield className="mx-auto mb-4 h-8 w-8 text-gray-400 sm:h-12 sm:w-12" />
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
