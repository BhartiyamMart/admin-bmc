"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, ControllerRenderProps } from "react-hook-form";
import * as Icon from "lucide-react";

interface EditableCustomer {
  name: string;
  phone: string;
  email: string;
  membership: "Gold" | "Silver" | "Bronze" | "Premium";
  wallet: number;
  status: "Active" | "Inactive" | "Suspended";
  address?: string;
}

type FormData = EditableCustomer;

const membershipOptions = [
  { value: "Bronze", label: "Bronze", color: "bg-orange-100 text-orange-800" },
  { value: "Silver", label: "Silver", color: "bg-gray-100 text-gray-800" },
  { value: "Gold", label: "Gold", color: "bg-yellow-100 text-yellow-800" },
  { value: "Premium", label: "Premium", color: "bg-purple-100 text-purple-800" },
] as const;

const statusOptions = [
  { value: "Active", label: "Active", color: "bg-green-100 text-green-800" },
  { value: "Inactive", label: "Inactive", color: "bg-gray-100 text-gray-800" },
  { value: "Suspended", label: "Suspended", color: "bg-red-100 text-red-800" },
] as const;

export default function EditCustomer() {
  const { id } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      name: "Anand Kumar",
      phone: "9876543210",
      email: "anand@example.com",
      membership: "Gold",
      wallet: 1250,
      status: "Active",
      address: "123 Main Street, Mumbai, Maharashtra 400001",
    },
  });

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleSave = async (data: FormData): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Updated Customer:", data);
      router.push(`/customer/view/${id}`);
    } catch (error) {
      console.error("Error updating customer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (): void => {
    router.push(`/customer/view/${id}`);
  };

  return (
    <div className="min-h-screen bg-sidebar p-4 md:p-6 lg:p-8">
      <div className="mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0 "
            >
              <Icon.ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold ">Edit Customer</h1>
              <p className="text-sm">
                Update customer information and account details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="  border-white/20">
              Customer ID: #{id}
            </Badge>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            {/* Customer Profile Preview */}
            <Card className=" border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-sidebar text-primary text-lg font-semibold">
                      {getInitials(form.watch("name") || "Customer")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold ">
                      {form.watch("name") || "Customer Name"}
                    </h3>
                    <p className="">{form.watch("email")}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge 
                        className={
                          statusOptions.find(s => s.value === form.watch("status"))?.color || 
                          "bg-sidebar"
                        }
                      >
                        {form.watch("status")}
                      </Badge>
                      <Badge 
                        className={
                          membershipOptions.find(m => m.value === form.watch("membership"))?.color || 
                          "bg-blue-100 text-blue-800"
                        }
                      >
                        <Icon.Crown className="w-3 h-3 mr-1" />
                        {form.watch("membership")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Personal Information */}
              <Card className="bg-sidebar border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 ">
                    <Icon.User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }: { field: ControllerRenderProps<FormData, "name"> }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-sidebar border-white  placeholder:text-gray-400"
                            placeholder="Enter full name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }: { field: ControllerRenderProps<FormData, "email"> }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="bg-sidebar border-white/20  placeholder:text-gray-400"
                            placeholder="Enter email address"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-400">
                          This will be used for notifications and login
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }: { field: ControllerRenderProps<FormData, "phone"> }) => (
                      <FormItem>
                        <FormLabel className="">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className=" border-white/20  placeholder:text-gray-400"
                            placeholder="Enter phone number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }: { field: ControllerRenderProps<FormData, "address"> }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className=" border-white/20  placeholder:text-gray-400"
                            placeholder="Enter address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card className=" border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 ">
                    <Icon.Settings className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }: { field: ControllerRenderProps<FormData, "status"> }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Account Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className=" border-white/20 ">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    status.value === 'Active' ? 'bg-green-500' :
                                    status.value === 'Suspended' ? 'bg-red-500' : 'bg-gray-500'
                                  }`} />
                                  {status.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="membership"
                    render={({ field }: { field: ControllerRenderProps<FormData, "membership"> }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Membership Tier</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className=" border-white/20 ">
                              <SelectValue placeholder="Select membership" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {membershipOptions.map((membership) => (
                              <SelectItem key={membership.value} value={membership.value}>
                                <div className="flex items-center gap-2">
                                  <Icon.Crown className="w-3 h-3" />
                                  {membership.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-gray-400">
                          Higher tiers provide more benefits and rewards
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wallet"
                    render={({ field }: { field: ControllerRenderProps<FormData, "wallet"> }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Wallet Balance</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              ₹
                            </span>
                            <Input
                              {...field}
                              type="number"
                              className=" border-white/20  placeholder:text-gray-400 pl-8"
                              placeholder="0.00"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(Number(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-gray-400">
                          Current wallet balance available for transactions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <Card className="bg-sidebar border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className=" border-white/20   cursor-pointer"
                  >
                    <Icon.X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={isLoading}
                    className=" border-white/20 cursor-pointer  "
                  >
                    <Icon.RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90 cursor-pointer text-primary-foreground"
                  >
                    {isLoading ? (
                      <>
                        <Icon.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Icon.Check className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
