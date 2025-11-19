'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Check, ChevronDown, X, Upload } from 'lucide-react';
import useEmployeeRoleStore, { RoleState } from '@/store/employeeRoleStore';
import toast from 'react-hot-toast';
import { getEmployeeRole, getStores, getWarehouses } from '@/apis/employee-role.api';
import { getEmployeePermission } from '@/apis/create-employeepermission.api';
import { createEmployee, generateEmployeeId } from '@/apis/create-employee.api';

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import Image from 'next/image';

interface Role {
  id: string;
  name: string;
  status: boolean;
}

interface Permission {
  id: string;
  name: string;
}

interface RolePermissionPayload {
  assignedPermissions: { id: string; name: string }[];
  allPermissions: { id: string; name: string }[];
}

export default function AddEmployee() {
  const router = useRouter();
  const roles = useEmployeeRoleStore((state: RoleState) => state.roles);
  const setRoles = useEmployeeRoleStore((state: RoleState) => state.setRoles);

  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  const [preAssignedPermissions, setPreAssignedPermissions] = useState<string[]>([]);
  const [allAvailablePermissions, setAllAvailablePermissions] = useState<Permission[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [openBloodDropdown, setOpenBloodDropdown] = useState(false);
  const [bloodSearchValue, setBloodSearchValue] = useState('');

  const [openWarehouseDropdown, setOpenWarehouseDropdown] = useState(false);
  const [warehouseSearchValue, setWarehouseSearchValue] = useState('');

  const [openStoreDropdown, setOpenStoreDropdown] = useState(false);
  const [storeSearchValue, setStoreSearchValue] = useState('');

  const [openRoleDropdown, setOpenRoleDropdown] = useState(false);
  const [roleSearchValue, setRoleSearchValue] = useState('');

  const [openPermDropdown, setOpenPermDropdown] = useState(false);
  const [permSearchValue, setPermSearchValue] = useState('');

  // File upload states
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const [documents, setDocuments] = useState<File[]>([]);

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
    permissions: [] as Permission[],
    // New fields
    gender: '',
    dob: '',
    bloodGroup: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
  });

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const page = 1;
        const limit = 100;
        const resp = await getEmployeeRole(page, limit);
        console.log('Full API response:', resp);

        if (!resp.error && resp.payload && resp.payload) {
          const rolesArray = resp.payload.roles;
          const mapped: Role[] = rolesArray.map((r) => ({
            id: r.id,
            name: r.name,
            status: r.status,
          }));

          console.log('Mapped roles:', mapped);
          setRoles(mapped);
        } else {
          console.error('Invalid response structure:', resp);
          toast.error(resp.message || 'Failed to fetch roles');
        }
      } catch (err) {
        console.error('Error fetching roles:', err);
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

        setEmployee((prev) => ({
          ...prev,
          employeeId: employeeId,
        }));
      } catch (err) {
        console.error(err);
        toast.error('Failed to generate employee ID');
      }
    };

    generateId();
    fetchRoles();
  }, [setRoles]);

  // Fixed filtering with useMemo - this prevents the search bug
  const filteredRoles = useMemo(() => {
    if (!roleSearchValue.trim()) return roles ?? [];
    return (roles ?? []).filter((r) => r?.name && r.name.toLowerCase().includes(roleSearchValue.toLowerCase()));
  }, [roles, roleSearchValue]);

  useEffect(() => {
    const fetchStoresAndWarehouses = async () => {
      try {
        const storeResp = await getStores();
        if (!storeResp.error && Array.isArray(storeResp.payload?.allStore)) {
          type StoreApiType = { id: string; name: string };
          setStores(storeResp.payload.allStore.map((s: StoreApiType) => ({ id: s.id, name: s.name })));
        }

        const warehouseResp = await getWarehouses();
        if (!warehouseResp.error && Array.isArray(warehouseResp.payload?.allWarehouse)) {
          type WarehouseApiType = { id: string; name: string };
          setWarehouses(warehouseResp.payload.allWarehouse.map((w: WarehouseApiType) => ({ id: w.id, name: w.name })));
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
        console.log('resp', resp);

        if (!resp.error && resp.payload) {
          const pl = resp.payload as unknown as RolePermissionPayload;

          const assigned = pl.assignedPermissions;
          const all = pl.allPermissions;

          const assignedIds = assigned.map((p) => p.id);
          setPreAssignedPermissions(assignedIds);

          setAllAvailablePermissions(all);

          setEmployee((prev) => ({
            ...prev,
            permissions: assigned,
          }));

          console.log('employee permissions set to:', assigned);
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

  // Fixed filtering for permissions
  const filteredPerms = useMemo(() => {
    if (!permSearchValue.trim()) return allAvailablePermissions;
    return allAvailablePermissions.filter((p) => p.name.toLowerCase().includes(permSearchValue.toLowerCase()));
  }, [allAvailablePermissions, permSearchValue]);

  // Fixed filtering for stores
  const filteredStores = useMemo(() => {
    if (!storeSearchValue.trim()) return stores;
    return stores.filter((s) => s.name.toLowerCase().includes(storeSearchValue.toLowerCase()));
  }, [stores, storeSearchValue]);

  // Fixed filtering for warehouses
  const filteredWarehouses = useMemo(() => {
    if (!warehouseSearchValue.trim()) return warehouses;
    return warehouses.filter((w) => w.name.toLowerCase().includes(warehouseSearchValue.toLowerCase()));
  }, [warehouses, warehouseSearchValue]);

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    let newValue = value;
    if (name === 'phoneNumber' || name === 'emergencyContactNumber') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setEmployee((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : newValue,
    }));
  };

  // Handle profile picture
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Profile picture must be less than 5MB');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle documents
  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 10MB`);
        return false;
      }
      return true;
    });
    setDocuments((prev) => [...prev, ...validFiles]);
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview('');
  };

  // Step 1 validation
  const validateStep1 = () => {
    const empIdRegex = /^[A-Z]+[0-9]+$/;
    if (!employee.employeeId.trim() || !empIdRegex.test(employee.employeeId)) {
      toast.error('Employee ID must start with uppercase letters followed by numbers (e.g., K2503).');
      return false;
    }

    if (!employee.firstName.trim()) {
      toast.error('First name is required.');
      return false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!employee.phoneNumber.trim() || !phoneRegex.test(employee.phoneNumber)) {
      toast.error('Phone number must be exactly 10 digits.');
      return false;
    }

    if (!employee.roleId) {
      toast.error('Please select a role.');
      return false;
    }

    if (!employee.password.trim()) {
      toast.error('Password is required.');
      return false;
    }

    if (!employee.gender) {
      toast.error('Please select gender.');
      return false;
    }

    if (!employee.dob) {
      toast.error('Date of birth is required.');
      return false;
    }

    if (!employee.city.trim()) {
      toast.error('City is required.');
      return false;
    }

    if (!employee.state.trim()) {
      toast.error('State is required.');
      return false;
    }

    if (!employee.addressLine1.trim()) {
      toast.error('Address line 1 is required.');
      return false;
    }

    if (!employee.emergencyContactName.trim()) {
      toast.error('Emergency contact name is required.');
      return false;
    }

    if (!employee.emergencyContactNumber.trim() || !phoneRegex.test(employee.emergencyContactNumber)) {
      toast.error('Emergency contact number must be exactly 10 digits.');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build payload
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
      gender: string;
      dob: string;
      bloodGroup?: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      emergencyContactName: string;
      emergencyContactNumber: string;
    } = {
      firstName: employee.firstName.trim(),
      lastName: employee.lastName.trim(),
      employeeId: employee.employeeId.trim(),
      roleId: employee.roleId,
      phoneNumber: employee.phoneNumber.trim(),
      password: employee.password.trim(),
      permissionIds: employee.permissions.map((p) => p.id),
      gender: employee.gender,
      dob: employee.dob,
      addressLine1: employee.addressLine1.trim(),
      city: employee.city.trim(),
      state: employee.state.trim(),
      emergencyContactName: employee.emergencyContactName.trim(),
      emergencyContactNumber: employee.emergencyContactNumber.trim(),
    };

    // Conditionally add optional fields
    if (employee.email?.trim()) payload.email = employee.email.trim();
    if (employee.storeId?.trim()) payload.storeId = employee.storeId.trim();
    if (employee.warehouseId?.trim()) payload.warehouseId = employee.warehouseId.trim();
    if (employee.addressLine2?.trim()) payload.addressLine2 = employee.addressLine2.trim();
    if (employee.bloodGroup) payload.bloodGroup = employee.bloodGroup;

    // TODO: Handle file uploads (profilePicture, documents)
    // You'll need to convert this to FormData if your API supports file uploads
    // For now, we're keeping the original JSON payload structure

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
  };

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar max-h-[89vh] w-full overflow-y-auto rounded-lg p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Add Employee {currentStep === 2 && '- Documents & Profile'}</p>
          <Link
            href="/employee-management/employee-list"
            className="bg-primary text-background flex items-center rounded px-3 py-2 text-sm"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Name fields */}
              <div>
                <label className="block text-sm font-medium">
                  First Name<span className="text-xs text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={employee.firstName}
                  onChange={handleEmployeeChange}
                  required
                  className="mt-1 w-full rounded-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={employee.lastName}
                  onChange={handleEmployeeChange}
                  className="mt-1 w-full rounded-sm border p-2"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium">Email (optional)</label>
                <input
                  type="email"
                  name="email"
                  value={employee.email}
                  onChange={handleEmployeeChange}
                  className="mt-1 w-full rounded-sm border p-2"
                />
              </div>
              {/* Password */}
              <div>
                <label className="block text-sm font-medium">
                  Password<span className="text-xs text-red-500"> *</span>
                </label>
                <input
                  type="password"
                  name="password"
                  minLength={6}
                  value={employee.password}
                  onChange={handleEmployeeChange}
                  required
                  className="mt-1 w-full rounded-sm border p-2"
                />
              </div>
              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium">
                  Role<span className="text-xs text-red-500"> *</span>
                </label>
                <Popover open={openRoleDropdown} onOpenChange={setOpenRoleDropdown}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      role="combobox"
                      aria-expanded={openRoleDropdown}
                      aria-controls="role-dropdown"
                      className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2"
                    >
                      {employee.roleId ? roles.find((r) => r.id === employee.roleId)?.name : 'Select Role'}
                      <ChevronDown className="ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                    <Command shouldFilter={false}>
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
                              className="cursor-pointer"
                              value={r.id}
                              onSelect={(val) => {
                                setEmployee((prev) => ({ ...prev, roleId: val, permissions: [] }));
                                setOpenRoleDropdown(false);
                                setRoleSearchValue('');
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
              {/* Store */}
              <div>
                <label className="block text-sm font-medium">Store ID (optional)</label>
                <Popover open={openStoreDropdown} onOpenChange={setOpenStoreDropdown}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2"
                    >
                      {employee.storeId ? stores.find((s) => s.id === employee.storeId)?.name : 'Select Store'}
                      <ChevronDown className="ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search store..."
                        value={storeSearchValue}
                        onValueChange={setStoreSearchValue}
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No store found.</CommandEmpty>
                        <CommandGroup>
                          {filteredStores.map((s) => (
                            <CommandItem
                              className="cursor-pointer"
                              key={s.id}
                              value={s.id}
                              onSelect={(val) => {
                                setEmployee((prev) => ({ ...prev, storeId: val }));
                                setOpenStoreDropdown(false);
                                setStoreSearchValue('');
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
                <label className="block text-sm font-medium">
                  Employee ID<span className="text-xs text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={employee.employeeId}
                  onChange={handleEmployeeChange}
                  required
                  className="mt-1 w-full rounded-sm border p-2"
                />
              </div>
              {/* Warehouse */}
              <div>
                <label className="block text-sm font-medium">Warehouse ID (optional)</label>
                <Popover open={openWarehouseDropdown} onOpenChange={setOpenWarehouseDropdown}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2"
                    >
                      {employee.warehouseId
                        ? warehouses.find((w) => w.id === employee.warehouseId)?.name
                        : 'Select Warehouse'}
                      <ChevronDown className="ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search warehouse..."
                        value={warehouseSearchValue}
                        onValueChange={setWarehouseSearchValue}
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No warehouse found.</CommandEmpty>
                        <CommandGroup>
                          {filteredWarehouses.map((w) => (
                            <CommandItem
                              className="cursor-pointer"
                              key={w.id}
                              value={w.id}
                              onSelect={(val) => {
                                setEmployee((prev) => ({ ...prev, warehouseId: val }));
                                setOpenWarehouseDropdown(false);
                                setWarehouseSearchValue('');
                              }}
                            >
                              {w.name}
                              <Check
                                className={`ml-auto ${employee.warehouseId === w.id ? 'opacity-100' : 'opacity-0'}`}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Phone Number<span className="text-xs text-red-500"> *</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="phoneNumber"
                  value={employee.phoneNumber}
                  onChange={handleEmployeeChange}
                  required
                  maxLength={10}
                  className="bg-sidebar mt-1 w-full rounded-sm border p-2"
                />
              </div>
              {/* New Fields - Personal Info */}
              <div>
                <label className="block text-sm font-medium">
                  Gender<span className="text-xs text-red-500"> *</span>
                </label>
                <select
                  name="gender"
                  value={employee.gender}
                  onChange={handleEmployeeChange}
                  required
                  className="mt-1 w-full rounded-sm border p-2"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Date of Birth<span className="text-xs text-red-500"> *</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={employee.dob}
                  onChange={handleEmployeeChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="mt-1 w-full rounded-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Blood Group (optional)</label>

                <Popover open={openBloodDropdown} onOpenChange={setOpenBloodDropdown}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2"
                    >
                      {employee.bloodGroup ? employee.bloodGroup : 'Select Blood Group'}
                      <ChevronDown className="ml-2" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search blood group..."
                        value={bloodSearchValue}
                        onValueChange={setBloodSearchValue}
                        className="h-9"
                      />

                      <CommandList>
                        <CommandEmpty>No blood group found.</CommandEmpty>

                        <CommandGroup>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
                            .filter((bg) => bg.toLowerCase().includes(bloodSearchValue.toLowerCase()))
                            .map((bg) => (
                              <CommandItem
                                key={bg}
                                value={bg}
                                className="cursor-pointer"
                                onSelect={(val) => {
                                  setEmployee((prev) => ({ ...prev, bloodGroup: val }));
                                  setOpenBloodDropdown(false);
                                  setBloodSearchValue('');
                                }}
                              >
                                {bg}
                                <Check
                                  className={`ml-auto ${employee.bloodGroup === bg ? 'opacity-100' : 'opacity-0'}`}
                                />
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Address Fields */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">
                  Address Line 1 <span className="text-xs text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={employee.addressLine1}
                  onChange={handleEmployeeChange}
                  required
                  className="mt-1 w-full rounded-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Address Line 2 (optional)</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={employee.addressLine2}
                  onChange={handleEmployeeChange}
                  className="mt-1 w-full rounded-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  City<span className="text-xs text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={employee.city}
                  onChange={handleEmployeeChange}
                  required
                  className="mt-1 w-full rounded-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  State <span className="text-xs text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={employee.state}
                  onChange={handleEmployeeChange}
                  required
                  className="mt-1 w-full rounded-sm border p-2"
                />
              </div>
              {/* Emergency Contact */}
              <div>
                <label className="block text-sm font-medium">
                  Emergency Contact Name<span className="text-xs text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={employee.emergencyContactName}
                  onChange={handleEmployeeChange}
                  required
                  className="mt-1 w-full rounded-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Emergency Contact Number <span className="text-xs text-red-500"> *</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="emergencyContactNumber"
                  value={employee.emergencyContactNumber}
                  onChange={handleEmployeeChange}
                  required
                  maxLength={10}
                  className="mt-1 w-full rounded-sm border p-2"
                />
              </div>
              {/* Permissions */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium">
                  Permissions <span className="text-xs text-red-500"> *</span>
                </label>

                <Popover open={openPermDropdown} onOpenChange={setOpenPermDropdown}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      role="combobox"
                      aria-expanded={openPermDropdown}
                      aria-controls="perm-dropdown"
                      className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2"
                    >
                      {employee.permissions.length > 0
                        ? `${employee.permissions.length} permissions selected`
                        : 'Select Permissions'}
                      <ChevronDown className="ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                    <Command shouldFilter={false}>
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
                            const isSelected = employee.permissions.some((perm) => perm.id === p.id);

                            return (
                              <CommandItem
                                key={p.id}
                                value={p.id}
                                onSelect={(val) => {
                                  if (isPreAssigned) return;

                                  setEmployee((prev) => {
                                    const exists = prev.permissions.some((perm) => perm.id === val);
                                    const newList = exists
                                      ? prev.permissions.filter((perm) => perm.id !== val)
                                      : [...prev.permissions, p];
                                    return { ...prev, permissions: newList };
                                  });
                                }}
                                className={isPreAssigned ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                              >
                                <span className="flex items-center gap-2">
                                  {p.name}
                                  {isPreAssigned && <span className="text-xs text-red-500"> *(Required)</span>}
                                </span>
                                <Check className={`ml-auto ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div className="mt-2 flex h-24 flex-wrap gap-2 overflow-auto">
                  {employee.permissions.map((permission) => {
                    const isPreAssigned = preAssignedPermissions.includes(permission.id);

                    return (
                      <div
                        key={permission.id}
                        className="bg-primary text-background flex h-fit items-center rounded px-3 py-1 text-sm"
                        title={isPreAssigned ? 'Pre-assigned from role' : 'Additional permission'}
                      >
                        {permission.name}
                        {!isPreAssigned && (
                          <button
                            type="button"
                            onClick={() =>
                              setEmployee((prev) => ({
                                ...prev,
                                permissions: prev.permissions.filter((p) => p.id !== permission.id),
                              }))
                            }
                            className="ml-2 rounded p-0.5 hover:bg-red-500"
                            aria-label={`Remove permission ${permission.name}`}
                          >
                            <X className="h-4 w-4 cursor-pointer" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Next Button */}
              <div className="mt-4 md:col-span-3">
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-primary text-background cursor-pointer rounded px-20 py-2"
                >
                  Next: Upload Documents
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 - Documents & Profile Picture */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 gap-6">
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium">Profile Picture (optional, max 5MB)</label>
                <div className="mt-2 rounded-lg border-2 border-dashed p-6">
                  {!profilePicturePreview ? (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Click to upload profile picture</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="mt-4 w-full"
                      />
                    </div>
                  ) : (
                    <div className="relative flex items-center gap-4">
                      <Image
                        src={profilePicturePreview || '/placeholder-avatar.png'}
                        alt="Profile preview"
                        width={128}
                        height={128}
                        className="h-32 w-32 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{profilePicture?.name}</p>
                        <p className="text-xs text-gray-500">
                          {((profilePicture?.size || 0) / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeProfilePicture}
                        className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div>
                <label className="block text-sm font-medium">
                  Documents (optional, ID proof, certificates, etc. - max 10MB each)
                </label>
                <div className="mt-2 rounded-lg border-2 border-dashed p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Click to upload documents</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleDocumentsChange}
                      className="mt-4 w-full"
                    />
                  </div>

                  {documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Uploaded Documents ({documents.length})</p>
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between rounded bg-gray-100 p-3">
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button
                            type="button"
                            onClick={removeProfilePicture}
                            className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit buttons */}
              <div className="mt-4 flex gap-4">
                <button type="button" onClick={handleBack} className="rounded border px-6 py-2 hover:bg-gray-100">
                  Back
                </button>
                <button type="submit" className="bg-primary text-background cursor-pointer rounded px-20 py-2">
                  Add Employee
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
