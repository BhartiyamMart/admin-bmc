'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import useEmployeeRoleStore, { RoleState } from '@/store/employeeRoleStore';
import toast from 'react-hot-toast';
import { getEmployeeRole } from '@/apis/employee-role.api';
import { createEmployee } from '@/apis/create-employee.api';
export default function AddEmployee() {
  const router = useRouter();
  const roles = useEmployeeRoleStore((state: RoleState) => state.roles);
  const setRoles = useEmployeeRoleStore((state: RoleState) => state.setRoles);

  const [employee, setEmployee] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    storeId: "",
    warehouseId: "",
    employeeId:"",
    phoneNumber: '',
    roleId: '',
    password: '',
  });

  // 🔹 fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
       
        const response = await getEmployeeRole();

        if (!response.error && response.payload) {
          const rolesArray = Array.isArray(response.payload)
            ? response.payload
            : [response.payload];

          const transformedRoles = rolesArray.map((role) => ({
            id: role.id,
            name: role.name,
            status: role.status,
          }));

          setRoles(transformedRoles);
        } else {
         
          toast.error(response.message || 'Failed to fetch roles');
        }
      } catch (error) {
        console.error('Failed to fetch employee roles:', error);
        
        toast.error('Failed to fetch employee roles');
      } finally {
       
      }
    };

    fetchRoles();
  }, [setRoles]);

  const activeRoles = roles.filter((role) => role.status === true);

  // 🔹 handle change
  const handleEmployeeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setEmployee((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value,
    }));
  };

  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Employee ID validation
  const empIdRegex = /^[A-Z]+[0-9]+$/;
  if (!employee.employeeId.trim() || !empIdRegex.test(employee.employeeId)) {
    toast.error("Employee ID must start with uppercase letters followed by numbers (e.g., K2503).");
    return;
  }



  // Phone number validation
  const phoneRegex = /^\d{10}$/;
  if (!employee.phoneNumber.trim() || !phoneRegex.test(employee.phoneNumber)) {
    toast.error("Phone number must be exactly 10 digits.");
    return;
  }

  if (!employee.roleId) {
    toast.error("Please select a role."); 
    return;
  }

  const payload: any = {
  password: employee.password.trim(),
  employeeId: employee.employeeId.trim(),
  firstName: employee.firstName.trim(),
  middleName: employee.middleName?.trim() || "",
  lastName: employee.lastName?.trim() || "",
  roleId: employee.roleId,
  phoneNumber: employee.phoneNumber.trim(),
  storeId: employee.storeId ? employee.storeId.trim() : "",
  warehouseId: employee.warehouseId ? employee.warehouseId.trim() : "",
};

if (employee.email.trim()) {
  payload.email = employee.email.trim(); 
}

  try {
    const res = await createEmployee(payload);

    if (res.error) {
      toast.error(res.message || "Failed to add employee");
      return;
    }

    toast.success("Employee added successfully!");
    router.push("/employee-management/employee-list");
  } catch (err: any) { 
    toast.error(err.message || "Something went wrong");
  }
};



  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="max-h-[89vh] w-full overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Add Employee</p>
          <Link
            href="/employee-management/employee-list"
            className="flex cursor-pointer rounded bg-primary text-background  px-3 py-2 text-sm transition">
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>  
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Name Fields */}
          <div>
            <label className="block text-sm font-medium">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={employee.firstName}
              onChange={handleEmployeeChange}
              required
              className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Middle Name</label>
            <input
              type="text"
              name="middleName"
              value={employee.middleName}
              onChange={handleEmployeeChange}
              className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={employee.lastName}
              onChange={handleEmployeeChange}
              className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium">Role *</label>
            <select
              name="roleId"
              value={employee.roleId}
              onChange={handleEmployeeChange}
              className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a Role --</option>
              {activeRoles.map((role:any) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={employee.email}
              onChange={handleEmployeeChange}
             
              className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
           <div>
            <label className="block text-sm font-medium">Password *</label>
            <input
              type="password"
              name="password"
              value={employee.password}
              onChange={handleEmployeeChange}
              required
              className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Store & Warehouse */}
          <div>
            <label className="block text-sm font-medium">Store ID</label>
            <input
              type="text"
              name="storeId"
              value={employee.storeId}
              onChange={handleEmployeeChange}
              className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={employee.employeeId}
              onChange={handleEmployeeChange}
              className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Warehouse ID</label>
            <input
              type="text"
              name="warehouseId"
              value={employee.warehouseId}
              onChange={handleEmployeeChange}
              className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium">Phone Number *</label>
            <input
              type="text"
              name="phoneNumber"
              value={employee.phoneNumber}
              onChange={handleEmployeeChange}
              required
              maxLength={10}
              className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
            <div className="md:col-span-3">
            <button
              type="submit"
              className="mt-5 rounded-sm  px-20 py-2 transition bg-primary text-background"
            >
              Add Employee
            </button>
            </div>
        </form>
      </div>
    </div>
  );
}





