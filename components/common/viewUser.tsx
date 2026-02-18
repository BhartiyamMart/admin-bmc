'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import * as Icon from 'lucide-react';
import { viewUserDetails, editUser } from '@/apis/user.api';
import { IUserViewApiResponse } from '@/interface/user.interface';
import { ICreateEmployeePayload } from '@/interface/employee.interface';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

const getStatusColor = (status: boolean) => {
  return status ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Not provided';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'Not available';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export interface ViewUserProps {
  type: string;
}

export default function ViewUser({ type }: ViewUserProps) {
  const { id } = useParams();
  const router = useRouter();

  const [userData, setUserData] = useState<IUserViewApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [userImage, setUserImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const [editSections, setEditSections] = useState({
    personal: false,
    account: false,
  });

  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
  });

  const [accountData, setAccountData] = useState({
    status: true,
    isDeleted: false,
  });

  // Fetch customer details
  useEffect(() => {
    const fetchuserData = async () => {
      if (!id) {
        toast.error('Customer ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const customerId = Array.isArray(id) ? id[0] : id;
        const response = await viewUserDetails(customerId, type);

        if (response.error || !response.payload) {
          toast.error(response?.message || 'Failed to fetch customer details');
          setUserData(null);
          return;
        }

        const data = response.payload;
        setUserData(data);

        // Set profile image
        setUserImage(data.profile.photo || '/images/avatar.jpg');

        // Set personal data for editing
        setPersonalData({
          name: data.profile.name || '',
          email: data.basicInfo.email || data.basicInfo.autoMail || '',
          phone: data.basicInfo.phone || '',
          dateOfBirth: data.profile.dateOfBirth || '',
          gender: data.profile.gender || '',
        });

        // Set account data for editing
        setAccountData({
          status: data.basicInfo.status,
          isDeleted: data.basicInfo.isDeleted,
        });
      } catch (error) {
        console.error('Error fetching customer details:', error);
        toast.error('Failed to load customer details');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchuserData();
  }, [id, type]);

  console.log('user Data ', userData);

  // Toggle edit section
  const toggleEditSection = (section: 'personal' | 'account') => {
    setEditSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Cancel edit
  const handleCancelEdit = (section: 'personal' | 'account') => {
    if (!userData) return;

    if (section === 'personal') {
      setPersonalData({
        name: userData.profile.name || '',
        email: userData.basicInfo.email || userData.basicInfo.autoMail || '',
        phone: userData.basicInfo.phone || '',
        dateOfBirth: userData.profile.dateOfBirth || '',
        gender: userData.profile.gender || '',
      });
    } else if (section === 'account') {
      setAccountData({
        status: userData.basicInfo.status,
        isDeleted: userData.basicInfo.isDeleted,
      });
    }

    toggleEditSection(section);
  };

  // Handle update
  const handleUpdate = async (section: 'personal' | 'account') => {
    if (!userData) return;

    try {
      setUpdating(true);

      // Prepare payload based on ICreateEmployeePayload interface
      const payload: ICreateEmployeePayload = {
        employeeId: userData.employee?.employeeId,
        personalDetails: {
          name: section === 'personal' ? personalData.name : userData.profile.name,
          email: section === 'personal' ? personalData.email : userData.basicInfo.email || userData.basicInfo.autoMail,
          phone: section === 'personal' ? personalData.phone : userData.basicInfo.phone,
          dateOfBirth: section === 'personal' ? personalData.dateOfBirth : userData.profile.dateOfBirth || '',
          bloodGroup: userData.profile.bloodGroup || '',
          gender: section === 'personal' ? personalData.gender : userData.profile.gender || '',
          photo: userData.profile.photo || '',
          password: '', // Not updating password here
          requirePasswordChange: false,
          address: {
            addressLineOne: userData.addresses[0]?.street || '',
            addressLineTwo: '',
            state: userData.addresses[0]?.state || '',
            city: userData.addresses[0]?.city || '',
            pincode: userData.addresses[0]?.pincode || '',
          },
          emergencyContacts: [],
          documents: [],
        },
        roleIds: userData.roles?.map((role) => role.id) || [],
        permissionIds: userData.individualPermissions?.map((perm) => perm.permission.id) || [],
        locationId: undefined,
      };

      const response = await editUser(payload);

      if (response.error) {
        toast.error(response.message || 'Failed to update user details');
        return;
      }

      toast.success('User details updated successfully!');

      // Refresh user data
      const customerId = Array.isArray(id) ? id[0] : id;
      const updatedResponse = await viewUserDetails(customerId as string, type);
      if (updatedResponse.payload) {
        setUserData(updatedResponse.payload);
      }

      // Close edit mode
      toggleEditSection(section);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user details');
    } finally {
      setUpdating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="foreground flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="mt-4 text-gray-600">Loading customer details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!userData) {
    return (
      <div className="foreground flex h-[calc(100vh-8vh)] items-center justify-center p-4">
        <div className="text-center">
          <Icon.AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Customer Not Found</h2>
          <button
            onClick={() => router.back()}
            className="text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer rounded px-4 py-2"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  const { basicInfo, profile, employee, wallet, referral, activity, stats, addresses, roles, individualPermissions } =
    userData;

  return (
    <div className="foreground min-h-screen p-2 sm:p-4">
      <div className="mx-auto space-y-4 sm:space-y-6">
        {/* Header Section - Mobile Responsive */}
        <div className="flex justify-end">
          <Link
            onClick={() => router.back()}
            href="/employee-management/add-employee"
            className="bg-primary text-background flex cursor-pointer items-center rounded p-2 pr-3 pl-3 text-sm"
          >
            <Icon.ArrowLeft className="mr-2 h-5 w-5" /> Back to list
          </Link>
        </div>
        <div className="bg-sidebar rounded p-4 shadow-sm sm:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Profile Image Section */}
              <div className="relative">
                <div className="border-sidebar h-15 w-15 rounded-full">
                  <Image
                    src={userImage}
                    alt={profile.name || 'User'}
                    width={1000}
                    height={1000}
                    quality={100}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </div>
              </div>

              <div>
                <h1 className="text-lg font-bold sm:text-2xl">{profile.name || 'Unknown User'}</h1>
                <div className="flex flex-col space-y-1 text-xs sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 sm:text-sm">
                  <span>{basicInfo.email || basicInfo.autoMail || basicInfo.phone}</span>
                </div>
              </div>
            </div>

            {type === 'customer' && (
              <div className="flex items-center justify-between sm:justify-end">
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm">Referral Code</p>
                  <div className="flex items-center space-x-1">
                    <Icon.Gift className="h-4 w-4 text-blue-500" />
                    <span className="text-lg font-semibold">{referral.myCode?.code || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Section */}
        {type === 'customer' && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="bg-sidebar rounded border p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Icon.Wallet className="h-4 w-4 text-green-600" />
                <span className="text-foreground text-xs font-medium">Wallet</span>
              </div>
              <p className="text-foreground mt-1 text-lg font-semibold">
                ₹{wallet ? formatCurrency(wallet.balance) : '0.00'}
              </p>
            </div>
            <div className="bg-sidebar rounded border p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Icon.MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-foreground text-xs font-medium">Addresses</span>
              </div>
              <p className="text-foreground mt-1 text-lg font-semibold">{stats.totalAddresses}</p>
            </div>
            <div className="bg-sidebar rounded border p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Icon.Users className="h-4 w-4 text-orange-600" />
                <span className="text-foreground text-xs font-medium">Referrals Given</span>
              </div>
              <p className="text-foreground mt-1 text-lg font-semibold">{stats.totalReferralsGiven}</p>
            </div>
            <div className="bg-sidebar rounded border p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Icon.Activity className="h-4 w-4 text-purple-600" />
                <span className="text-foreground text-xs font-medium">Wallet Transactions</span>
              </div>
              <p className="text-foreground mt-1 text-lg font-semibold">{stats.totalWalletTransactions}</p>
            </div>
          </div>
        )}

        {/* Personal Details Section */}
        <div className="bg-sidebar rounded shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base font-semibold sm:text-lg">
              <Icon.User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Personal Details
            </h2>
            <button
              onClick={() => (editSections.personal ? handleCancelEdit('personal') : toggleEditSection('personal'))}
              className="bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors"
            >
              {editSections.personal ? (
                <>
                  <Icon.X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Icon.Edit2 className="h-4 w-4" />
                  Edit
                </>
              )}
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Full Name</label>
                {editSections.personal ? (
                  <input
                    type="text"
                    value={personalData.name}
                    onChange={(e) => setPersonalData((prev) => ({ ...prev, name: e.target.value }))}
                    className="focus:ring-primary w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    placeholder="Enter full name"
                  />
                ) : (
                  <p className="py-2 text-sm">{profile.name || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Email</label>
                {editSections.personal ? (
                  <input
                    type="email"
                    value={personalData.email}
                    onChange={(e) => setPersonalData((prev) => ({ ...prev, email: e.target.value }))}
                    className="focus:ring-primary w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    placeholder="Enter email address"
                  />
                ) : (
                  <p className="py-2 text-sm break-all">{basicInfo.email || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Phone Number</label>
                {editSections.personal ? (
                  <input
                    type="tel"
                    value={personalData.phone}
                    onChange={(e) => setPersonalData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="focus:ring-primary w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="py-2 text-sm">{basicInfo.phone}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Gender</label>
                {editSections.personal ? (
                  <select
                    value={personalData.gender}
                    onChange={(e) => setPersonalData((prev) => ({ ...prev, gender: e.target.value }))}
                    className="focus:ring-primary w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                ) : (
                  <p className="py-2 text-sm">{profile.gender || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Date of Birth</label>
                {editSections.personal ? (
                  <input
                    type="date"
                    value={personalData.dateOfBirth}
                    onChange={(e) => setPersonalData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="focus:ring-primary w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                  />
                ) : (
                  <p className="flex items-center py-2 text-sm">
                    <Icon.Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {formatDate(profile.dateOfBirth)}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Auto-Mail</label>
                <p className="py-2 font-mono text-xs break-all">{basicInfo.autoMail}</p>
              </div>
            </div>

            {/* Update Button */}
            {editSections.personal && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => handleCancelEdit('personal')}
                  className="border-input hover:bg-accent rounded border px-4 py-2 text-sm"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate('personal')}
                  disabled={updating}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded px-4 py-2 text-sm disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <Icon.Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Icon.Save className="h-4 w-4" />
                      Update
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Information Section */}
        <div className="bg-sidebar rounded shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base font-semibold sm:text-lg">
              <Icon.Settings className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Account Information
            </h2>
            <button
              onClick={() => (editSections.account ? handleCancelEdit('account') : toggleEditSection('account'))}
              className="bg-primary/10 hover:bg-primary/20 text-primary flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors"
            >
              {editSections.account ? (
                <>
                  <Icon.X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Icon.Edit2 className="h-4 w-4" />
                  Edit
                </>
              )}
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Customer ID</label>
                <p className="py-2 font-mono text-xs break-all">{basicInfo.id}</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Account Status</label>
                {editSections.account ? (
                  <select
                    value={accountData.status ? 'true' : 'false'}
                    onChange={(e) => setAccountData((prev) => ({ ...prev, status: e.target.value === 'true' }))}
                    className="focus:ring-primary w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                ) : (
                  <div className="py-2">
                    <Badge className={getStatusColor(basicInfo.status)}>
                      {basicInfo.status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Deleted</label>
                {editSections.account ? (
                  <select
                    value={accountData.isDeleted ? 'true' : 'false'}
                    onChange={(e) => setAccountData((prev) => ({ ...prev, isDeleted: e.target.value === 'true' }))}
                    className="focus:ring-primary w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                ) : (
                  <div className="py-2">
                    <Badge className={basicInfo.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {basicInfo.isDeleted ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Referred By</label>
                <p className="py-2 text-sm">{referral.referredBy || 'None'}</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Member Since</label>
                <p className="py-2 text-sm">{formatDate(basicInfo.createdAt)}</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Last Updated</label>
                <p className="py-2 text-sm">{formatDateTime(basicInfo.updatedAt)}</p>
              </div>
            </div>

            {/* Update Button */}
            {editSections.account && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => handleCancelEdit('account')}
                  className="border-input hover:bg-accent rounded border px-4 py-2 text-sm"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate('account')}
                  disabled={updating}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded px-4 py-2 text-sm disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <Icon.Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Icon.Save className="h-4 w-4" />
                      Update
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Roles & Permissions Section */}
        {((roles?.length ?? 0) > 0 || (individualPermissions?.length ?? 0) > 0) && (
          <div className="bg-sidebar rounded shadow-sm">
            <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
              <h2 className="flex items-center text-base font-semibold sm:text-lg">
                <Icon.Shield className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Roles & Permissions
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              {(roles?.length ?? 0) > 0 && (
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-medium sm:text-sm">Assigned Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {roles?.map((role) => (
                      <Badge key={role.id} className="bg-blue-100 text-blue-800">
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(individualPermissions?.length ?? 0) > 0 && (
                <div>
                  <label className="mb-2 block text-xs font-medium sm:text-sm">Individual Permissions</label>
                  <div className="flex flex-wrap gap-2">
                    {individualPermissions?.map((permission) => (
                      <Badge key={permission.id} className="bg-purple-100 text-purple-800">
                        {permission.permission.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Addresses Section */}
        {addresses.length > 0 && (
          <div className="bg-sidebar rounded shadow-sm">
            <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
              <h2 className="flex items-center text-base font-semibold sm:text-lg">
                <Icon.MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Saved Addresses ({addresses.length})
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {addresses.map((address, index) => (
                  <div key={address.id} className="rounded border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Address {index + 1}</p>
                        <p className="mt-1 text-xs">
                          {address.street}, {address.city}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity Section */}
        <div className="bg-sidebar rounded shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base font-semibold sm:text-lg">
              <Icon.Activity className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Activity & Login Stats
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <Icon.LogIn className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">Last Login</p>
                  <p className="text-foreground/60 text-xs">{formatDateTime(activity.lastLogin)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-red-100 p-2">
                  <Icon.XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">Last Failed Login</p>
                  <p className="text-foreground/60 text-xs">{formatDateTime(activity.lastFailedLogin)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <Icon.CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">Successful Logins</p>
                  <p className="text-foreground/60 text-xs">{activity.successLoginCount}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-orange-100 p-2">
                  <Icon.AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">Failed Login Attempts</p>
                  <p className="text-foreground/60 text-xs">{activity.failedLoginCount}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-purple-100 p-2">
                  <Icon.Monitor className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">Active Sessions</p>
                  <p className="text-foreground/60 text-xs">{stats.activeSessionsCount}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-teal-100 p-2">
                  <Icon.UserPlus className="h-4 w-4 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">Account Created</p>
                  <p className="text-foreground/60 text-xs">{formatDate(basicInfo.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
