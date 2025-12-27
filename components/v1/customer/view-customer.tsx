'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as Icon from 'lucide-react';
import { viewCustomerDetails } from '@/apis/create-customer.api';
import { CustomerDetails } from '@/interface/customer.interface';
import { createPreassignedUrl } from '@/apis/create-banners.api';
import toast from 'react-hot-toast';
import Image from 'next/image';

const getStatusColor = (status: string | undefined | null) => {
  const value = String(status || '').toUpperCase();
  switch (value) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'SUSPENDED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getMembershipColor = (membership: string | null) => {
  if (!membership) return 'bg-gray-100 text-gray-800 border-gray-200';

  switch (membership.toLowerCase()) {
    case 'gold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'silver':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'bronze':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'premium':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

const getOrderStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
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

const formatDateTime = (dateString: string) => {
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

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0' : num.toLocaleString('en-IN');
};

export default function ViewCustomer() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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

  // Fetch customer details
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!id) {
        toast.error('Customer ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const customerId = Array.isArray(id) ? id[0] : id;
        const response = await viewCustomerDetails(customerId);

        if (response.error || !response.payload) {
          toast.error(response?.message || 'Failed to fetch customer details');
          setCustomer(null);
          return;
        }

        const { customer: customerData, profile, orders, membership, wallet } = response.payload;
        const profileImageUrl = response.payload.profile.imageUrl;

        const mappedCustomer: CustomerDetails = {
          id: customerData.id,
          name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'N/A',
          phone: customerData.phoneNumber,
          email: profile.email,
          createdAt: formatDate(customerData.createdAt),
          status: customerData.status,
          membership: membership,
          wallet: wallet,
          spent: profile.totalSpent,
          rewardCoins: profile.rewardCoins,
          orders: orders || [],
          referrals: customerData.referrals || 0,
          lastLogin: formatDateTime(customerData.lastLogin),
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
        };

        setCustomer(mappedCustomer);
        setUserImage(profileImageUrl || '/images/avatar.jpg');

        setPersonalData({
          name: mappedCustomer.name,
          email: mappedCustomer.email || '',
          phone: mappedCustomer.phone,
          dateOfBirth: mappedCustomer.dateOfBirth || '',
          gender: mappedCustomer.gender || '',
        });
      } catch (error) {
        console.error('Error fetching customer details:', error);
        toast.error('Failed to load customer details');
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  // Handle profile image upload
  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const presignResponse = await createPreassignedUrl({
        fileName: file.name,
        fileType: file.type,
      });

      if (presignResponse.error) {
        toast.error('Failed to generate upload URL');
        return;
      }

      const { presignedUrl, fileUrl } = presignResponse.payload;

      await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      // TODO: Update customer profile with new image URL via API
      // await updateCustomer(customerId, { profileImageUrl: fileUrl });

      setUserImage(fileUrl);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong while uploading image');
    } finally {
      setUploading(false);
    }
  };

  const toggleEdit = (section: keyof typeof editSections) => {
    setEditSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const cancelEdit = (section: keyof typeof editSections) => {
    setEditSections((prev) => ({ ...prev, [section]: false }));
  };

  const savePersonalData = async () => {
    // TODO: Implement save logic
    setEditSections((prev) => ({ ...prev, personal: false }));
    toast.success('Personal details saved');
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
  if (!customer) {
    return (
      <div className="foreground flex h-[calc(100vh-8vh)] items-center justify-center p-4">
        <div className="text-center">
          <Icon.AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Customer Not Found</h2>
          <button
            onClick={() => router.back()}
            className="bg-primary hover:bg-primary/90 cursor-pointer rounded px-4 py-2"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="foreground min-h-screen p-2 sm:p-4">
      <div className="mx-auto space-y-4 sm:space-y-6">
        {/* Header Section - Mobile Responsive */}
        <div className="bg-sidebar rounded p-4 shadow-sm sm:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button onClick={() => router.back()} className="hover:bg-muted cursor-pointer rounded-full p-2">
                <Icon.ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* Profile Image Section */}
              <div className="relative">
                <div className="border-sidebar h-15 w-15 rounded-full">
                  <Image
                    src={userImage}
                    alt={customer.name}
                    width={1000}
                    height={1000}
                    quality={100}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </div>

                <button
                  onClick={() => profileImageInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-background/70 hover:bg-background absolute right-0 bottom-0 cursor-pointer rounded-full p-1 shadow-md transition"
                >
                  <Icon.Camera className="text-foreground h-4 w-4 cursor-pointer" />
                </button>

                <input
                  type="file"
                  ref={profileImageInputRef}
                  onChange={handleProfileImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <h1 className="text-lg font-bold sm:text-2xl">{customer.name}</h1>
                <div className="flex flex-col space-y-1 text-xs sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 sm:text-sm">
                  <span>{customer.email || customer.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end">
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm">Reward Coins</p>
                <div className="flex items-center space-x-1">
                  <Icon.Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-lg font-semibold">{customer.rewardCoins || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="bg-sidebar rounded border p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Icon.Wallet className="h-4 w-4 text-green-600" />
              <span className="text-foreground text-xs font-medium">Wallet</span>
            </div>
            <p className="text-foreground mt-1 text-lg font-semibold">₹{formatCurrency(customer.wallet || 0)}</p>
          </div>
          <div className="bg-sidebar rounded border p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Icon.TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-foreground text-xs font-medium">Total Spent</span>
            </div>
            <p className="text-foreground mt-1 text-lg font-semibold">₹{formatCurrency(customer.spent)}</p>
          </div>
          <div className="bg-sidebar rounded border p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Icon.ShoppingBag className="h-4 w-4 text-purple-600" />
              <span className="text-foreground text-xs font-medium">Total Orders</span>
            </div>
            <p className="text-foreground mt-1 text-lg font-semibold">{customer.orders.length}</p>
          </div>
          <div className="bg-sidebar rounded border p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Icon.Users className="h-4 w-4 text-orange-600" />
              <span className="text-foreground text-xs font-medium">Referrals</span>
            </div>
            <p className="text-foreground mt-1 text-lg font-semibold">{customer.referrals}</p>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="bg-sidebar rounded shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base font-semibold sm:text-lg">
              <Icon.User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Personal Details
            </h2>
            {/* <div className="flex items-center space-x-2">
              {editSections.personal ? (
                <>
                  <button
                    onClick={savePersonalData}
                    className="bg-primary text-background flex cursor-pointer items-center space-x-1 rounded px-3 py-1.5 text-xs sm:text-sm"
                  >
                    <Icon.Save className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => cancelEdit('personal')}
                    className="bg-primary text-background flex cursor-pointer items-center space-x-1 rounded px-3 py-1.5 text-xs sm:text-sm"
                  >
                    <Icon.X className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleEdit('personal')}
                  className="bg-primary text-background flex cursor-pointer items-center space-x-1 rounded px-3 py-1.5 text-xs sm:text-sm"
                >
                  <Icon.Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div> */}
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
                  <p className="py-2 text-sm">{customer.name || 'Not specified'}</p>
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
                  <p className="py-2 text-sm break-all">{customer.email || 'Not provided'}</p>
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
                  <p className="py-2 text-sm">{customer.phone}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Gender</label>
                {editSections.personal ? (
                  <input
                    type="text"
                    value={personalData.gender}
                    onChange={(e) => setPersonalData((prev) => ({ ...prev, gender: e.target.value }))}
                    className="focus:ring-primary w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    placeholder="Enter gender"
                  />
                ) : (
                  <p className="py-2 text-sm">{customer.gender || 'Not provided'}</p>
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
                    {formatDate(customer.dateOfBirth)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information Section */}
        <div className="bg-sidebar rounded shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base font-semibold sm:text-lg">
              <Icon.Settings className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Account Information
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Customer ID</label>
                <p className="py-2 font-mono text-xs">#{customer.id.slice(0, 8)}...</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Status</label>
                <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Membership</label>
                <Badge className={getMembershipColor(customer.membership)}>{customer.membership || 'Standard'}</Badge>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Referrals</label>
                <p className="py-2 text-sm">{customer.referrals}</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Member Since</label>
                <p className="py-2 text-sm">{customer.createdAt}</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium sm:text-sm">Last Login</label>
                <p className="py-2 text-sm">{customer.lastLogin}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order History Section */}
        <div className="bg-sidebar rounded shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base font-semibold sm:text-lg">
              <Icon.ShoppingBag className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Order History ({customer.orders.length})
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {customer.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-foreground">Order ID</TableHead>
                      <TableHead className="text-foreground">Date</TableHead>
                      <TableHead className="text-foreground">Status</TableHead>
                      <TableHead className="text-foreground text-right">Amount</TableHead>
                      <TableHead className="text-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-foreground font-medium">{order.orderId}</TableCell>
                        <TableCell className="text-foreground">{order.date}</TableCell>
                        <TableCell>
                          <Badge className={getOrderStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground text-right font-medium">
                          ₹{formatCurrency(order.total)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => router.push(`/orders/${order.id}`)}
                          >
                            <Icon.Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Icon.ShoppingBag className="text-foreground mx-auto mb-4 h-12 w-12 opacity-30" />
                <p className="text-foreground text-sm font-medium">No orders found</p>
                <p className="text-foreground/60 mt-1 text-xs">This customer hasn&apos;t placed any orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Section */}
        <div className="bg-sidebar rounded shadow-sm">
          <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
            <h2 className="flex items-center text-base font-semibold sm:text-lg">
              <Icon.Activity className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Recent Activity
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <Icon.LogIn className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">Last logged in</p>
                  <p className="text-foreground/60 text-xs">{customer.lastLogin}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <Icon.UserPlus className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">Account created</p>
                  <p className="text-foreground/60 text-xs">{customer.createdAt}</p>
                </div>
              </div>
              {customer.referrals > 0 && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-purple-100 p-2">
                      <Icon.Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">
                        Referred {customer.referrals} {customer.referrals === 1 ? 'user' : 'users'}
                      </p>
                      <p className="text-foreground/60 text-xs">Total referrals</p>
                    </div>
                  </div>
                </>
              )}
              {customer.orders.length > 0 && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-orange-100 p-2">
                      <Icon.ShoppingBag className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">
                        Placed {customer.orders.length} {customer.orders.length === 1 ? 'order' : 'orders'}
                      </p>
                      <p className="text-foreground/60 text-xs">Total order count</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
