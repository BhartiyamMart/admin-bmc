'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Check, ChevronDown, X } from 'lucide-react';
import useEmployeeRoleStore, { RoleState } from '@/store/employeeRoleStore';
import toast from 'react-hot-toast';
import { getEmployeeRole } from '@/apis/employee-role.api';
import { getEmployeePermission } from '@/apis/create-employeepermission.api';
import { createEmployee } from '@/apis/create-employee.api';

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

interface Role {
  id: string;
  name: string;
  status: boolean;
}

interface Permission {
  id: string;
  name: string;
  
}

// API payload type
interface RolePermissionPayload {
  assignedPermissions: { id: string; name: string }[];
  allPermissions: { id: string; name: string }[];
}

export default function AddEmployee() {
  const router = useRouter();
  const roles = useEmployeeRoleStore((state: RoleState) => state.roles);
  const setRoles = useEmployeeRoleStore((state: RoleState) => state.setRoles);

  // Permissions
  const [preAssignedPermissions, setPreAssignedPermissions] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [employee, setEmployee] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    storeId: '',
    warehouseId: '',
    employeeId: '',
    phoneNumber: '',
    roleId: '',
    password: '',
    permissions: [] as string[],
  });

  // UI states
  const [openRoleDropdown, setOpenRoleDropdown] = useState(false);
  const [roleSearchValue, setRoleSearchValue] = useState('');
  const [openPermDropdown, setOpenPermDropdown] = useState(false);
  const [permSearchValue, setPermSearchValue] = useState('');

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const resp = await getEmployeeRole();
        if (!resp.error && resp.payload) {
          const arr = Array.isArray(resp.payload) ? resp.payload : [resp.payload];
          const mapped: Role[] = arr.map((r) => ({ id: r.id, name: r.name, status: r.status }));
          setRoles(mapped);
        } else {
          toast.error(resp.message || 'Failed to fetch roles');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch roles');
      }
    };
    fetchRoles();
  }, [setRoles]);

  // Fetch permissions when role changes
  useEffect(() => {
    const fetchPerms = async () => {
      if (!employee.roleId) {
        setPermissions([]);
        setPreAssignedPermissions([]);
        setEmployee((prev) => ({ ...prev, permissions: [] }));
        return;
      }
      try {
        const resp = await getEmployeePermission(employee.roleId);
        if (!resp.error && resp.payload) {
          const pl = resp.payload as unknown as RolePermissionPayload;
          
          const assigned = pl.assignedPermissions;
          setPermissions(assigned)
          console.log(assigned);
          console.log(permissions);
          const all = pl.allPermissions;

          const assignedIds = assigned.map((p) => p.id);
          setPreAssignedPermissions(assignedIds);

          const allMapped: Permission[] = all.map((p) => ({ id: p.id, name: p.name, status: true }));
          setPermissions(allMapped);

          // Initially select assigned permissions
          setEmployee((prev) => ({ ...prev, permissions: assignedIds }));
        } else {
          
          setPreAssignedPermissions([]);
          setEmployee((prev) => ({ ...prev, permissions: [] }));
        }
      } catch (err) {
        console.error(err);
       
        setPreAssignedPermissions([]);
      }
    };
    fetchPerms();
  }, [employee.roleId]);

  // Filtered roles and permissions
  const filteredRoles = useMemo(
    () => roles.filter((r) => r.name.toLowerCase().includes(roleSearchValue.toLowerCase())),
    [roles, roleSearchValue]
  );

  const filteredPerms = useMemo(
    () => permissions.filter((p) => p.name.toLowerCase().includes(permSearchValue.toLowerCase())),
    [permissions, permSearchValue]
  );

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    const empIdRegex = /^[A-Z]+[0-9]+$/;
    if (!employee.employeeId.trim() || !empIdRegex.test(employee.employeeId)) {
      toast.error('Employee ID must start with uppercase letters followed by numbers (e.g., K2503).');
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!employee.phoneNumber.trim() || !phoneRegex.test(employee.phoneNumber)) {
      toast.error('Phone number must be exactly 10 digits.');
      return;
    }
    if (!employee.roleId) {
      toast.error('Please select a role.');
      return;
    }

    // Merge assigned + selected
    const merged = Array.from(new Set([...preAssignedPermissions, ...employee.permissions]));

    const payload = {
      password: employee.password.trim(),
      employeeId: employee.employeeId.trim(),
      firstName: employee.firstName.trim(),
      middleName: employee.middleName?.trim() || '',
      lastName: employee.lastName.trim(),
      roleId: employee.roleId,
      email: employee.email?.trim() || '',
      phoneNumber: employee.phoneNumber.trim(),
      storeId: employee.storeId?.trim() || '',
      warehouseId: employee.warehouseId?.trim() || '',
      permissionIds: merged,
    };

    try {
      const res = await createEmployee(payload);
      if (res.error) {
        toast.error(res.message || 'Failed to create employee');
        return;
      }
      toast.success('Employee created successfully');
      router.push('/employee-management/employee-list');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="bg-sidebar max-h-[89vh] w-full overflow-y-auto rounded-lg p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Add Employee</p>
          <Link
            href="/employee-management/employee-list"
            className="bg-primary text-background flex items-center rounded px-3 py-2 text-sm"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Name fields */}
          <div>
            <label className="block text-sm font-medium">First Name *</label>
            <input type="text" name="firstName" value={employee.firstName} onChange={handleEmployeeChange} required className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium">Middle Name</label>
            <input type="text" name="middleName" value={employee.middleName} onChange={handleEmployeeChange} className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name *</label>
            <input type="text" name="lastName" value={employee.lastName} onChange={handleEmployeeChange} required className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" name="email" value={employee.email} onChange={handleEmployeeChange} className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium">Password *</label>
            <input type="password" name="password" value={employee.password} onChange={handleEmployeeChange} required className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium">Role *</label>
            <Popover open={openRoleDropdown} onOpenChange={setOpenRoleDropdown}>
              <PopoverTrigger asChild>
                <button type="button" role="combobox" aria-expanded={openRoleDropdown} className="flex w-full items-center justify-between rounded border px-3 py-2">
                  {employee.roleId ? roles.find((r) => r.id === employee.roleId)?.name : 'Select Role'}
                  <ChevronDown className="ml-2" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                <Command>
                  <CommandInput placeholder="Search role..." value={roleSearchValue} onValueChange={setRoleSearchValue} className="h-9" />
                  <CommandList>
                    <CommandEmpty>No role found.</CommandEmpty>
                    <CommandGroup>
                      {filteredRoles.map((r) => (
                        <CommandItem key={r.id} value={r.id} onSelect={(val) => { setEmployee((prev) => ({ ...prev, roleId: val, permissions: [] })); setOpenRoleDropdown(false); }}>
                          {r.name}
                          <Check className={`ml-auto ${employee.roleId === r.id ? 'opacity-100' : 'opacity-0'}`} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Permissions */}
          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-medium">Permissions</label>

            {/* Pre-assigned permissions */}
            <div className="flex flex-wrap gap-2 mb-2">
              {preAssignedPermissions.map((permId) => {
                const perm = permissions.find((p) => p.id === permId);
                if (!perm) return null;
                return (
                  <div key={permId} className="flex items-center rounded bg-gray-300 px-3 py-1 text-sm text-gray-700" title="Pre-assigned permission">
                    {perm.name}
                  </div>
                );
              })}
            </div>

            {/* Selected permissions */}
            <div className="flex flex-wrap gap-2 mb-2">
              {employee.permissions.filter((id) => !preAssignedPermissions.includes(id)).map((permId) => {
                const perm = permissions.find((p) => p.id === permId);
                if (!perm) return null;
                return (
                  <div key={permId} className="flex items-center rounded bg-blue-100 px-3 py-1 text-sm text-blue-800">
                    {perm.name}
                    <button type="button" onClick={() => setEmployee((prev) => ({ ...prev, permissions: prev.permissions.filter((id) => id !== permId) }))} className="ml-2 p-0.5 hover:bg-blue-300 rounded" aria-label={`Remove permission ${perm.name}`}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Permissions dropdown */}
            <Popover open={openPermDropdown} onOpenChange={setOpenPermDropdown}>
              <PopoverTrigger asChild>
                <button type="button" role="combobox" aria-expanded={openPermDropdown} className="flex w-full items-center justify-between rounded border px-3 py-2">
                  {employee.permissions.length > 0 ? `${employee.permissions.length} selected` : 'Select Permissions'}
                  <ChevronDown className="ml-2" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                <Command>
                  <CommandInput placeholder="Search permissions..." value={permSearchValue} onValueChange={setPermSearchValue} className="h-9" />
                  <CommandList>
                    <CommandEmpty>No permission found.</CommandEmpty>
                    <CommandGroup>
                      {filteredPerms.map((p) => (
                        <CommandItem key={p.id} value={p.id} onSelect={(val) => {
                          setEmployee((prev) => {
                            const exists = prev.permissions.includes(val);
                            const newList = exists ? prev.permissions.filter((x) => x !== val) : [...prev.permissions, val];
                            return { ...prev, permissions: newList };
                          });
                        }}>
                          {p.name}
                          <Check className={`ml-auto ${employee.permissions.includes(p.id) ? 'opacity-100' : 'opacity-0'}`} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Other fields */}
          <div>
            <label className="block text-sm font-medium">Store ID</label>
            <input type="text" name="storeId" value={employee.storeId} onChange={handleEmployeeChange} className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium">Employee ID *</label>
            <input type="text" name="employeeId" value={employee.employeeId} onChange={handleEmployeeChange} required className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium">Warehouse ID</label>
            <input type="text" name="warehouseId" value={employee.warehouseId} onChange={handleEmployeeChange} className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone Number *</label>
            <input type="text" name="phoneNumber" value={employee.phoneNumber} onChange={handleEmployeeChange} required maxLength={10} className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Submit */}
          <div className="mt-4 md:col-span-3">
            <button type="submit" className="bg-primary text-background rounded px-20 py-2">Add Employee</button>
          </div>
        </form>
      </div>
    </div>
  );
}
