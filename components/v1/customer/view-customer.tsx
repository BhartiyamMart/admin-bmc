'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as Icon from 'lucide-react';
import { viewCustomerDetails } from '@/apis/create-customer.api';
import { CustomerDetails } from '@/interface/customer.interface';
import toast from 'react-hot-toast';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Fetch customer details on component mount
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!id) {
        toast.error('Customer ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Convert id to string if it's an array
        const customerId = Array.isArray(id) ? id[0] : id;

        const response = await viewCustomerDetails(customerId);

        console.log('Customer Details Response:', JSON.stringify(response, null, 2));

        if (response.error || !response.payload) {
          toast.error(response?.message || 'Failed to fetch customer details');
          setCustomer(null);
          return;
        }

        // ✅ Destructure with proper typing
        const { customer: customerData, profile, orders, membership, wallet } = response.payload;

        // ✅ Map the API response to CustomerDetails interface
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

  const getInitials = (name: string) => {
    if (!name || name === 'N/A') return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="bg-sidebar flex h-[calc(100vh-8vh)] items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="flex flex-col items-center gap-4">
          <Icon.Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-foreground text-sm">Loading customer details...</p>
        </div>
      </div>
    );
  }

  // ✅ Error state - if customer not found
  if (!customer) {
    return (
      <div className="bg-sidebar flex h-[calc(100vh-8vh)] items-center justify-center p-4 md:p-6 lg:p-8">
        <Card className="bg-sidebar w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Icon.AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="text-foreground mb-2 text-xl font-semibold">Customer Not Found</h2>
            <p className="text-foreground mb-4 text-sm">
              The customer you are looking for does not exist or has been removed.
            </p>
            <Button onClick={() => router.back()} className="cursor-pointer">
              <Icon.ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-sidebar h-[calc(100vh-8vh)] overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button size="icon" onClick={() => router.back()} className="cursor-pointer">
              <Icon.ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-foreground text-2xl font-bold">Customer Details</h1>
              <p className="text-foreground text-sm">Manage customer information and order history</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/customer/edit/${id}`)}
              className="flex cursor-pointer items-center gap-2"
            >
              <Icon.Edit className="h-4 w-4" />
              Edit Customer
            </Button>
          </div>
        </div>

        {/* Customer Profile Card */}
        <Card className="bg-sidebar border">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-foreground text-xl font-semibold">{customer.name}</h2>
                    <p className="text-foreground text-sm">{customer.email || customer.phone}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusColor(customer.status)}>
                      <Icon.Circle className="mr-1 h-2 w-2 fill-current" />
                      {customer.status}
                    </Badge>
                    {customer.membership && (
                      <Badge className={getMembershipColor(customer.membership)}>
                        <Icon.Crown className="mr-1 h-3 w-3" />
                        {customer.membership}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="bg-sidebar rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Icon.Wallet className="h-4 w-4 text-green-600" />
                      <span className="text-foreground text-xs font-medium">Wallet</span>
                    </div>
                    <p className="text-foreground mt-1 text-lg font-semibold">
                      ₹{formatCurrency(customer.wallet || 0)}
                    </p>
                  </div>
                  <div className="bg-sidebar rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Icon.TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-foreground text-xs font-medium">Total Spent</span>
                    </div>
                    <p className="text-foreground mt-1 text-lg font-semibold">₹{formatCurrency(customer.spent)}</p>
                  </div>
                  <div className="bg-sidebar rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Icon.ShoppingBag className="h-4 w-4 text-purple-600" />
                      <span className="text-foreground text-xs font-medium">Total Orders</span>
                    </div>
                    <p className="text-foreground mt-1 text-lg font-semibold">{customer.orders.length}</p>
                  </div>
                  <div className="bg-sidebar rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Icon.Gift className="h-4 w-4 text-orange-600" />
                      <span className="text-foreground text-xs font-medium">Reward Coins</span>
                    </div>
                    <p className="text-foreground mt-1 text-lg font-semibold">{customer.rewardCoins}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-sidebar grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex cursor-pointer items-center gap-2">
              <Icon.User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex cursor-pointer items-center gap-2">
              <Icon.ShoppingBag className="h-4 w-4" />
              Orders ({customer.orders.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex cursor-pointer items-center gap-2">
              <Icon.Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Personal Information */}
              <Card className="bg-sidebar border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Icon.User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="text-foreground text-sm font-medium">Full Name</span>
                      <span className="text-foreground text-sm">{customer.name}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-foreground text-sm font-medium">Email</span>
                      <span className="text-foreground text-sm">{customer.email || 'Not provided'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-foreground text-sm font-medium">Phone</span>
                      <span className="text-foreground text-sm">{customer.phone}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-foreground text-sm font-medium">Gender</span>
                      <span className="text-foreground text-sm">{customer.gender || 'Not provided'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-foreground text-sm font-medium">Date of Birth</span>
                      <span className="text-foreground text-sm">{formatDate(customer.dateOfBirth)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card className="bg-sidebar border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Icon.Settings className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="text-foreground text-sm font-medium">Customer ID</span>
                      <span className="text-foreground font-mono text-xs">#{customer.id.slice(0, 8)}...</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-foreground text-sm font-medium">Status</span>
                      <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-foreground text-sm font-medium">Membership</span>
                      <Badge className={getMembershipColor(customer.membership)}>
                        {customer.membership || 'Standard'}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-foreground text-sm font-medium">Referrals</span>
                      <span className="text-foreground text-sm">{customer.referrals}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-foreground text-sm font-medium">Member Since</span>
                      <span className="text-foreground text-sm">{customer.createdAt}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-foreground text-sm font-medium">Last Login</span>
                      <span className="text-foreground text-sm">{customer.lastLogin}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="bg-sidebar border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Icon.ShoppingBag className="h-5 w-5" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-sidebar border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Icon.Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
