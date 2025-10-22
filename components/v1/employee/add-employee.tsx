'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Check, ChevronDown, X } from 'lucide-react';
import useEmployeeRoleStore, { RoleState } from '@/store/employeeRoleStore';
import toast from 'react-hot-toast';
import { getEmployeeRole, getStores, getWarehouses } from '@/apis/employee-role.api';
import { getEmployeePermission } from '@/apis/create-employeepermission.api';
import { createEmployee, generateEmployeeId } from '@/apis/create-employee.api';

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

  // Only keep preAssigned for tracking - removed additional permissions state
  const [preAssignedPermissions, setPreAssignedPermissions] = useState<string[]>([]);
  const [allAvailablePermissions, setAllAvailablePermissions] = useState<Permission[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);

  const [openWarehouseDropdown, setOpenWarehouseDropdown] = useState(false);
  const [warehouseSearchValue, setWarehouseSearchValue] = useState('');

  const [openStoreDropdown, setOpenStoreDropdown] = useState(false);
  const [storeSearchValue, setStoreSearchValue] = useState('');

  const [employee, setEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    storeId: '',
    warehouseId: '',
    employeeId: '',
    phoneNumber: '',
    roleId: '',
    password: '',
    permissions: [] as Permission[], // Changed to Permission[] instead of string[]
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

    const generateId = async () => {
      try {
        const resp = await generateEmployeeId();

        console.log('Full response:', resp);
        console.log('Response payload:', resp.payload);

        let employeeId;
        if (resp.payload?.employeeId) {
          employeeId = resp.payload.employeeId;
        } else {
          console.error('Employee ID not found in response:', resp);
          toast.error('Failed to generate employee ID - invalid response format');
          return;
        }

        setEmployee(prev => ({
          ...prev,
          employeeId: employeeId
        }));

      } catch (err) {
        console.error(err);
        toast.error('Failed to generate employee ID');
      }
    };

    generateId();
    fetchRoles();
  }, [setRoles]);
  useEffect(() => {
    const fetchStoresAndWarehouses = async () => {
      try {
        const storeResp = await getStores(); // your API
        if (!storeResp.error && Array.isArray(storeResp.payload?.allStore)) {
          setStores(storeResp.payload.allStore.map((s: any) => ({ id: s.id, name: s.name })));
        }

        const warehouseResp = await getWarehouses(); // your API
        if (!warehouseResp.error && Array.isArray(warehouseResp.payload?.allWarehouse)) {
          setWarehouses(warehouseResp.payload.allWarehouse.map((w: any) => ({ id: w.id, name: w.name })));
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load stores or warehouses');
      }
    };
    fetchStoresAndWarehouses();
  }, []);

  // Fetch permissions when role changes
  useEffect(() => {
    const fetchPerms = async () => {
      if (!employee.roleId) {
        setAllAvailablePermissions([]);
        setPreAssignedPermissions([]);
        setEmployee((prev) => ({ ...prev, permissions: [] }));
        return;
      }
      try {
        const resp = await getEmployeePermission(employee.roleId);
        console.log("resp", resp);

        if (!resp.error && resp.payload) {
          const pl = resp.payload as unknown as RolePermissionPayload;

          const assigned = pl.assignedPermissions; // This is Permission[] with {id, name}
          const all = pl.allPermissions;

          const assignedIds = assigned.map((p) => p.id);
          setPreAssignedPermissions(assignedIds);

          // Store all available permissions for dropdown
          setAllAvailablePermissions(all);

          // Set employee.permissions to assigned permissions (Permission objects)
          setEmployee((prev) => ({
            ...prev,
            permissions: assigned // Store full Permission objects
          }));

          console.log("employee permissions set to:", assigned);
        } else {
          setAllAvailablePermissions([]);
          setPreAssignedPermissions([]);
          setEmployee((prev) => ({ ...prev, permissions: [] }));
        }
      } catch (err) {
        console.error(err);
        setAllAvailablePermissions([]);
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
    () => allAvailablePermissions.filter((p) => p.name.toLowerCase().includes(permSearchValue.toLowerCase())),
    [allAvailablePermissions, permSearchValue]
  );

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔹 Validations
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

    if (!employee.password.trim()) {
      toast.error('Password is required.');
      return;
    }

    // 🔹 Build payload for API
    // 🔹 Build payload for API
    const payload: {
      firstName: string;
      middleName?: string;
      lastName: string;
      employeeId: string;
      roleId: string;
      email?: string;
      storeId?: string;
      warehouseId?: string;
      phoneNumber: string;
      password: string;
      permissionIds: string[];
    } = {
      firstName: employee.firstName.trim(),
      lastName: employee.lastName.trim(),
      employeeId: employee.employeeId.trim(),
      roleId: employee.roleId,
      phoneNumber: employee.phoneNumber.trim(),
      password: employee.password.trim(),
      permissionIds: employee.permissions.map(p => p.id),
    };

    // Conditionally add optional fields
    if (employee.email?.trim()) payload.email = employee.email.trim();
    if (employee.storeId?.trim()) payload.storeId = employee.storeId.trim();
    if (employee.warehouseId?.trim()) payload.warehouseId = employee.warehouseId.trim();

    // Call API
    try {
      const resp = await createEmployee(payload);
      if (!resp.error) {
        toast.success('Employee created successfully!');
        router.push('/employee-management/employee-list');  
      } else {
        toast.error(resp.message || 'Failed to create employee');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Failed to save employee data');
    }
  }
  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4"> 
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
            <input
              type="text"
              name="firstName"
              value={employee.firstName}
              onChange={handleEmployeeChange}
              required
              className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={employee.lastName}
              onChange={handleEmployeeChange}
              className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium">Email(optional)</label>
            <input
              type="email"
              name="email"
              value={employee.email}
              onChange={handleEmployeeChange}
              className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium">Password *</label>
            <input
              name="password"
              minLength={6}
              value={employee.password}
              onChange={handleEmployeeChange}
              required
              className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium">Role *</label>
            <Popover open={openRoleDropdown} onOpenChange={setOpenRoleDropdown}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  role="combobox"
                  aria-expanded={openRoleDropdown}
                  aria-controls="role-dropdown"
                  className="flex w-full items-center justify-between rounded border px-3 py-2"
                >
                  {employee.roleId ? roles.find((r) => r.id === employee.roleId)?.name : 'Select Role'}
                  <ChevronDown className="ml-2" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                <Command>
                  <CommandInput
                    placeholder="Search role..."
                    value={roleSearchValue}
                    onValueChange={setRoleSearchValue}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No role found.</CommandEmpty>
                    <CommandGroup>
                      {filteredRoles.map((r) => (
                        <CommandItem
                          key={r.id}
                          value={r.id}
                          onSelect={(val) => {
                            setEmployee((prev) => ({ ...prev, roleId: val, permissions: [] }));
                            setOpenRoleDropdown(false);
                          }}
                        >
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

         

          {/* Other fields */}
          <div>
            <label className="block text-sm font-medium">Store ID (optional)</label>
            <Popover open={openStoreDropdown} onOpenChange={setOpenStoreDropdown}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded border px-3 py-2"
                >
                  {employee.storeId ? stores.find(s => s.id === employee.storeId)?.name : 'Select Store'}
                  <ChevronDown className="ml-2" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                <Command>
                  <CommandInput
                    placeholder="Search store..."
                    value={storeSearchValue}
                    onValueChange={setStoreSearchValue}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No store found.</CommandEmpty>
                    <CommandGroup>
                      {stores.filter(s => s.name.toLowerCase().includes(storeSearchValue.toLowerCase())).map(s => (
                        <CommandItem
                          key={s.id}
                          value={s.id}
                          onSelect={val => {
                            setEmployee(prev => ({ ...prev, storeId: val }));
                            setOpenStoreDropdown(false);
                          }}
                        >
                          {s.name}
                          <Check className={`ml-auto ${employee.storeId === s.id ? 'opacity-100' : 'opacity-0'}`} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block text-sm font-medium">Employee ID *</label>
            <input
              type="text"
              name="employeeId"
              value={employee.employeeId}
              onChange={handleEmployeeChange}
              required
              className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Warehouse ID (optional)</label>
            <Popover open={openWarehouseDropdown} onOpenChange={setOpenWarehouseDropdown}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded border px-3 py-2"
                >
                  {employee.warehouseId ? warehouses.find(w => w.id === employee.warehouseId)?.name : 'Select Warehouse'}
                  <ChevronDown className="ml-2" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                <Command>
                  <CommandInput
                    placeholder="Search warehouse..."
                    value={warehouseSearchValue}
                    onValueChange={setWarehouseSearchValue}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No warehouse found.</CommandEmpty>
                    <CommandGroup>
                      {warehouses.filter(w => w.name.toLowerCase().includes(warehouseSearchValue.toLowerCase())).map(w => (
                        <CommandItem
                          key={w.id}
                          value={w.id}
                          onSelect={val => {
                            setEmployee(prev => ({ ...prev, warehouseId: val }));
                            setOpenWarehouseDropdown(false);
                          }}
                        >
                          {w.name}
                          <Check className={`ml-auto ${employee.warehouseId === w.id ? 'opacity-100' : 'opacity-0'}`} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="block text-sm font-medium">Phone Number *</label>
            <input
              type="text"
              name="phoneNumber"
              value={employee.phoneNumber}
              onChange={handleEmployeeChange}
              required
              maxLength={10}
              className="mt-1 w-full rounded-sm border p-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

           {/* Permissions */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium">Permissions*</label>

            {/* Permissions dropdown */}
            <Popover open={openPermDropdown} onOpenChange={setOpenPermDropdown}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  role="combobox"
                  aria-expanded={openPermDropdown}
                  aria-controls="perm-dropdown"
                  className="flex w-full items-center justify-between rounded border px-3 py-2"
                >
                  {employee.permissions.length > 0 ? `${employee.permissions.length} permissions selected` : 'Select Permissions'}
                  <ChevronDown className="ml-2" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                <Command>
                  <CommandInput
                    placeholder="Search permissions..."
                    value={permSearchValue}
                    onValueChange={setPermSearchValue}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No permission found.</CommandEmpty>
                    <CommandGroup>
                      {filteredPerms.map((p) => {
                        const isPreAssigned = preAssignedPermissions.includes(p.id);
                        const isSelected = employee.permissions.some(perm => perm.id === p.id);

                        return (
                          <CommandItem
                            key={p.id}
                            value={p.id}
                            onSelect={(val) => {
                              // Don't allow deselecting pre-assigned permissions
                              if (isPreAssigned) return;

                              setEmployee((prev) => {
                                const exists = prev.permissions.some(perm => perm.id === val);
                                const newList = exists
                                  ? prev.permissions.filter((perm) => perm.id !== val)
                                  : [...prev.permissions, p]; // Add full Permission object
                                return { ...prev, permissions: newList };
                              });
                            }}
                            className={isPreAssigned ? 'opacity-60 cursor-not-allowed' : ''}
                          >
                            <span className="flex items-center gap-2">
                              {p.name}
                              {isPreAssigned && <span className="text-xs text-gray-500">(Required)</span>}
                            </span>
                            <Check
                              className={`ml-auto ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                            />
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {/* All permissions display */}
            <div className='h-24 overflow-auto py-2'>
            <div className="mb-2 flex flex-wrap gap-2">
              {employee.permissions.map((permission) => {
                const isPreAssigned = preAssignedPermissions.includes(permission.id);

                return (
                  <div
                    key={permission.id}
                    className={`flex items-center rounded px-3 py-1 text-sm ${'bg-blue-100 text-blue-800'  // User-selected additional
                      }`}
                    title={isPreAssigned ? 'Pre-assigned from role' : 'Additional permission'}
                  >
                    {permission.name}
                    {/* Only show X for user-selected permissions */}  
                    <button
                      type="button"
                      onClick={() =>
                        setEmployee((prev) => ({
                          ...prev,
                          permissions: prev.permissions.filter((p) => p.id !== permission.id),
                        }))
                      }
                      className="ml-2 rounded p-0.5 hover:bg-blue-300"
                      aria-label={`Remove permission ${permission.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>

                  </div>
                );
              })}
            </div>
          </div>
          </div>

          {/* Submit */}
          <div className="mt-4 md:col-span-3">
            <button type="submit" className="bg-primary text-background cursor-pointer rounded px-20 py-2">
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
