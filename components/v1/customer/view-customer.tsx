'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback,  } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as Icon from 'lucide-react';

interface CustomerOrder {
  id: number;
  orderId: string;
  total: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

interface CustomerDetails {
  id: string | string[];
  name: string;
  phone: string;
  email: string;
  createdAt: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  membership: 'Gold' | 'Silver' | 'Bronze' | 'Premium';
  wallet: number;
  spent: number;
  orders: CustomerOrder[];
  address?: string;
  lastLogin?: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'suspended':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getMembershipColor = (membership: string) => {
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
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ViewCustomer() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const customer: CustomerDetails = {
    id: id as string,
    name: 'Anand Kumar',
    phone: '9876543210',
    email: 'anand@example.com',
    createdAt: '04 Oct 2025',
    status: 'Active',
    membership: 'Gold',
    wallet: 1250,
    spent: 5400,
    address: '123 Main Street, Mumbai, Maharashtra 400001',
    lastLogin: '10 Oct 2025, 2:30 PM',
    orders: [
      {
        id: 1,
        orderId: 'ORD-001',
        total: 1500,
        date: '05 Oct 2025',
        status: 'completed',
      },
      {
        id: 2,
        orderId: 'ORD-002',
        total: 3900,
        date: '07 Oct 2025',
        status: 'pending',
      },
      {
        id: 3,
        orderId: 'ORD-003',
        total: 2100,
        date: '09 Oct 2025',
        status: 'completed',
      },
    ],
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="h-[calc(100vh-8vh)]  p-4 md:p-6 lg:p-8">
      <div className="mx-auto bg-sidebar space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
              <Button
              
              size="icon"
              onClick={() => router.back()}
              className="cursor-pointer"
            >
              <Icon.ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold ">Customer Details</h1>
              <p className="text-sm ">Manage customer information and order history</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/customer/edit/${id}`)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Icon.Edit className="h-4 w-4" />
              Edit Customer
            </Button>
            
          </div>
        </div>

        {/* Customer Profile Card */}
        <Card>
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
                    <h2 className="text-xl font-semibold">{customer.name}</h2>
                    <p className="">{customer.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(customer.status)}>
                      <Icon.Circle className="mr-1 h-2 w-2 fill-current" />
                      {customer.status}
                    </Badge>
                    <Badge className={getMembershipColor(customer.membership)}>
                      <Icon.Crown className="mr-1 h-3 w-3" />
                      {customer.membership}
                    </Badge>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 ">
                  <div className="rounded-lg bg-sidebar p-3">
                    <div className="flex items-center gap-2">
                      <Icon.Wallet className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium ">Wallet</span>
                    </div>
                    <p className="text-lg font-semibold text-white">₹{customer.wallet.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-sidebar p-3">
                    <div className="flex items-center gap-2">
                      <Icon.TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium ">Total Spent</span>
                    </div>
                    <p className="text-lg font-semibold text-white">₹{customer.spent.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-sidebar p-3">
                    <div className="flex items-center gap-2">
                      <Icon.ShoppingBag className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium ">Total Orders</span>
                    </div>
                    <p className="text-lg font-semibold ">{customer.orders.length}</p>
                  </div>
                  <div className="rounded-lg bg-sidebar p-3">
                    <div className="flex items-center gap-2">
                      <Icon.Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium ">Member Since</span>
                    </div>
                    <p className="text-lg font-semibold ">{customer.createdAt}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 ">
            <TabsTrigger value="overview" className="flex items-center gap-2 cursor-pointer">
              <Icon.User className="h-4 w-4 " />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 cursor-pointer">
              <Icon.ShoppingBag className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2 cursor-pointer">
              <Icon.Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon.User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium ">Full Name</span>
                      <span className="text-sm ">{customer.name}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm font-medium ">Email</span>
                      <span className="text-sm ">{customer.email}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm font-medium ">Phone</span>
                      <span className="text-sm ">{customer.phone}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm font-medium ">Address</span>
                      <span className="text-right text-sm ">{customer.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon.Settings className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium ">Customer ID</span>
                      <span className="text-sm ">#{customer.id}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm font-medium ">Status</span>
                      <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm font-medium ">Membership</span>
                      <Badge className={getMembershipColor(customer.membership)}>{customer.membership}</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm font-medium ">Last Login</span>
                      <span className="text-sm ">{customer.lastLogin}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon.ShoppingBag className="h-5 w-5" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderId}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Badge className={getOrderStatusColor(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">₹{order.total.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className='cursor-pointer'>
                            <Icon.Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon.Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <Icon.ShoppingBag className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Order #ORD-002 placed</p>
                      <p className="text-xs ">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Icon.LogIn className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Logged into account</p>
                      <p className="text-xs ">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-purple-100 p-2">
                      <Icon.CreditCard className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Wallet recharged ₹500</p>
                      <p className="text-xs ">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
