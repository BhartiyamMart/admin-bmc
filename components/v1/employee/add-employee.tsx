'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, Check, X, Upload, Plus, EyeOff, Eye } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

import useEmployeeRoleStore, { RoleState } from '@/store/employeeRoleStore';
import { getEmployeeRole, getStores, getWarehouses } from '@/apis/employee-role.api';
import { getEmployeePermission } from '@/apis/create-employeepermission.api';
import { createEmployee, generateEmployeeId } from '@/apis/create-employee.api';

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { createPreassignedUrl } from '@/apis/create-banners.api';
import { getDocumentType } from '@/apis/create-document-type.api';
import { MyDocumentType } from '@/interface/common.interface';

// --------------------- Presigned URL function (use your original implementation) ---------------------

// --------------------- Types ---------------------
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

type DocRow = {
  documentTypeId: string;
  documentNumber: string | number;
  fileUrl: string;
  fileName: string;
};

// --------------------- Component ---------------------
export default function AddEmployee() {
  const router = useRouter();
  const roles = useEmployeeRoleStore((state: RoleState) => state.roles);
  const setRoles = useEmployeeRoleStore((state: RoleState) => state.setRoles);

  // Steps
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Lookups & dropdown states
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
  const [documentTypes, setDocumentTypes] = useState<MyDocumentType[]>([]);

  // Profile & files state
  const [profile, setProfile] = useState({
    profileImageUrl: '',
    fileName: '',
  });

  const [documents, setDocuments] = useState<DocRow[]>([
    { documentTypeId: '', documentNumber: '', fileUrl: '', fileName: '' },
  ]);
  const [showPassword, setShowPassword] = useState(false);
  // Basic employee form state
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

    // personal
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

  // --------------------- Fetch Roles & Generate Employee ID ---------------------
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const resp = await getEmployeeRole();

        if (!resp?.error && resp?.payload?.roles) {
          const rolesArray = resp.payload.roles;
          const mapped: Role[] = rolesArray.map((r) => ({
            id: r.id,
            name: r.name,
            status: r.status,
          }));
          setRoles(mapped);
        } else {
          toast.error(resp?.message || 'Failed to fetch roles');
        }
      } catch (err) {
        console.error('Error fetching roles:', err);
        toast.error('Failed to fetch roles');
      }
    };

    const generateId = async () => {
      try {
        const resp = await generateEmployeeId();
        const employeeId = resp?.payload?.employeeId;
        if (!employeeId) {
          toast.error('Failed to generate employee ID - invalid response');
          return;
        }
        setEmployee((prev) => ({ ...prev, employeeId }));
      } catch (err) {
        console.error('Error generating id:', err);
        toast.error('Failed to generate employee ID');
      }
    };

    fetchRoles();
    generateId();
  }, [setRoles]);

  // --------------------- Fetch stores & warehouses ---------------------
  useEffect(() => {
    const fetchStoresAndWarehouses = async () => {
      try {
        const storeResp = await getStores();
        console.log('STORE RESPONSE:', storeResp);

        const storesArr = storeResp?.payload.stores;

        if (Array.isArray(storesArr)) {
          setStores(storesArr.map((s) => ({ id: s.id, name: s.name })));
        } else {
          console.error('Invalid store format:', storesArr);
        }

        const warehouseResp = await getWarehouses();
        console.log('WAREHOUSE RESPONSE:', warehouseResp);

        const warehouseArr = warehouseResp?.payload?.allWarehouse;

        if (Array.isArray(warehouseArr)) {
          setWarehouses(warehouseArr.map((w) => ({ id: w.id, name: w.name })));
        } else {
          console.error('Invalid warehouse format:', warehouseArr);
        }
      } catch (err) {
        console.error('ERROR IN API:', err);
        toast.error('Failed to load stores or warehouses');
      }
    };

    fetchStoresAndWarehouses();
  }, []);

  // --------------------- Fetch permissions on role change ---------------------
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
        if (!resp.error && resp.payload) {
          const pl = resp.payload as unknown as RolePermissionPayload;
          const assigned = pl.assignedPermissions || [];
          const all = pl.allPermissions || [];

          setPreAssignedPermissions(assigned.map((p) => p.id));
          setAllAvailablePermissions(all);
          setEmployee((prev) => ({ ...prev, permissions: assigned }));
        } else {
          setAllAvailablePermissions([]);
          setPreAssignedPermissions([]);
          setEmployee((prev) => ({ ...prev, permissions: [] }));
        }
      } catch (err) {
        console.error('Error fetching permissions', err);
        setAllAvailablePermissions([]);
        setPreAssignedPermissions([]);
      }
    };
    fetchPerms();
  }, [employee.roleId]);

  // --------------------- Filters with useMemo ---------------------
  const filteredRoles = useMemo(() => {
    if (!roleSearchValue.trim()) return roles ?? [];
    return (roles ?? []).filter((r) => r?.name?.toLowerCase().includes(roleSearchValue.toLowerCase()));
  }, [roles, roleSearchValue]);

  const filteredPerms = useMemo(() => {
    if (!permSearchValue.trim()) return allAvailablePermissions;
    return allAvailablePermissions.filter((p) => p.name.toLowerCase().includes(permSearchValue.toLowerCase()));
  }, [allAvailablePermissions, permSearchValue]);

  const filteredStores = useMemo(() => {
    if (!storeSearchValue.trim()) return stores;
    return stores.filter((s) => s.name.toLowerCase().includes(storeSearchValue.toLowerCase()));
  }, [stores, storeSearchValue]);

  const filteredWarehouses = useMemo(() => {
    if (!warehouseSearchValue.trim()) return warehouses;
    return warehouses.filter((w) => w.name.toLowerCase().includes(warehouseSearchValue.toLowerCase()));
  }, [warehouses, warehouseSearchValue]);

  // --------------------- Handlers ---------------------
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
  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        const res = await getDocumentType();
        setDocumentTypes(res.payload.documentTypes); // adjust based on your API response structure
      } catch (error) {
        console.error('Error fetching document types:', error);
      }
    };
    fetchDocTypes();
  }, []);
  // --------------------- Step 1 validation ---------------------
  const validateStep1 = () => {
    const empIdRegex = /^[A-Z]+[0-9]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!employee.employeeId.trim() || !empIdRegex.test(employee.employeeId)) {
      toast.error('Employee ID must start with uppercase letters followed by numbers (e.g., K2503).');
      return false;
    }
    if (!employee.firstName.trim()) {
      toast.error('First name is required.');
      return false;
    }
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

  // --------------------- Profile Image Upload ---------------------
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile picture must be less than 5MB');
      return;
    }

    try {
      const res = await createPreassignedUrl({ fileName: file.name, fileType: file.type });
      // handle different response shapes
      const uploadUrl = res?.payload?.presignedUrl;
      const fileUrl = res?.payload?.fileUrl;

      if (!uploadUrl) {
        toast.error('Failed to get upload URL for profile image');
        console.error('Presigned response', res);
        return;
      }

      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });

      // if backend returns a fileUrl use it, otherwise try to infer from uploadUrl (not recommended)
      const finalUrl = fileUrl || uploadUrl.split('?')[0];

      setProfile({ profileImageUrl: finalUrl, fileName: file.name });
      toast.success('Profile image uploaded');
    } catch (err) {
      console.error('Profile upload error', err);
      toast.error('Failed to upload profile image');
    }
  };

  const removeProfileImage = () => {
    setProfile({ profileImageUrl: '', fileName: '' });
  };

  // --------------------- Documents CRUD & Upload ---------------------
  const addNewDocument = () => {
    setDocuments((prev) => [...prev, { documentTypeId: '', documentNumber: '', fileUrl: '', fileName: '' }]);
  };

  const updateDocument = (index: number, key: keyof DocRow, value: string) => {
    setDocuments((prev) => prev.map((d, i) => (i === index ? { ...d, [key]: value } : d)));
  };

  const removeDocumentFile = (index: number) => {
    updateDocument(index, 'fileUrl', '');
    updateDocument(index, 'fileName', '');
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Document size must be less than 10MB');
      return;
    }

    try {
      const res = await createPreassignedUrl({ fileName: file.name, fileType: file.type });

      const uploadUrl = res?.payload?.presignedUrl;
      const fileUrl = res?.payload?.fileUrl;

      if (!uploadUrl) {
        toast.error('Failed to get upload URL for document');
        console.error('Presigned response', res);
        return;
      }

      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });

      const finalUrl = fileUrl || uploadUrl.split('?')[0];

      updateDocument(index, 'fileUrl', finalUrl);
      updateDocument(index, 'fileName', file.name);

      toast.success(`${file.name} uploaded`);
    } catch (err) {
      console.error('Document upload failed', err);
      toast.error('Document upload failed');
    }
  };

  // --------------------- Final Submit ---------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate step2: ensure required document fields are present (if documents provided)
    for (let i = 0; i < documents.length; i++) {
      const d = documents[i];
      if (!d.documentTypeId?.toString().trim()) {
        toast.error(`Document ${i + 1}: type is required`);
        return;
      }
      if (!d.documentNumber?.toString().trim()) {
        toast.error(`Document ${i + 1}: number is required`);
        return;
      }
      if (!d.fileUrl?.toString().trim()) {
        toast.error(`Document ${i + 1}: uploaded file is required`);
        return;
      }
    }
    const formatDate = (isoDate: string) => {
      if (!isoDate) return '';
      const [year, month, day] = isoDate.split('-');
      return `${day}-${month}-${year}`;
    };

    // Build final payload following your schema idea
    const payload = {
      firstName: employee.firstName.trim(),
      lastName: employee.lastName.trim(),
      employeeId: employee.employeeId.trim(),
      roleId: employee.roleId,
      storeId: employee.storeId || undefined,
      warehouseId: employee.warehouseId || undefined,
      phoneNumber: employee.phoneNumber.trim(),
      password: employee.password.trim(),
      permissionIds: employee.permissions.map((p) => p.id),

      profile: {
        gender: employee.gender.toUpperCase(),
        dateOfBirth: employee.dob ? formatDate(employee.dob) : '',
        profileImageUrl: profile.profileImageUrl || undefined,
        addressLine1: employee.addressLine1.trim(),
        addressLine2: employee.addressLine2?.trim() || undefined,
        city: employee.city.trim(),
        state: employee.state.trim(),
        bloodGroup: employee.bloodGroup || undefined,
        emergencyName: employee.emergencyContactName.trim(),
        emergencyPhone: employee.emergencyContactNumber.trim(),
      },

      documents: documents.map((d) => ({
        documentTypeId: d.documentTypeId,
        documentNumber: d.documentNumber,
        fileUrl: d.fileUrl,
      })),
    };

    // Optional fields
    // if (employee.email?.trim()) payload.email = employee.email.trim();
    // if (employee.storeId?.trim()) payload.storeId = employee.storeId.trim();
    // if (employee.warehouseId?.trim()) payload.warehouseId = employee.warehouseId.trim();

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

  // --------------------- Render ---------------------
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
              {/* First Name */}
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

              {/* Last Name */}
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
              <div className="relative">
                <label className="block text-sm font-medium">
                  Password<span className="text-xs text-red-500"> *</span>
                </label>

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  minLength={6}
                  value={employee.password}
                  onChange={handleEmployeeChange}
                  required
                  className="mt-1 w-full rounded-sm border p-2 pr-10"
                />

                {/* Eye Icon */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-foreground absolute right-3 -translate-y-1/2 transform cursor-pointer pt-[50px]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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

              {/* Employee ID (readonly) */}
              <div>
                <label className="block text-sm font-medium">
                  Employee ID<span className="text-xs text-red-500"> *</span>
                </label>
                <input
                  name="employeeId"
                  value={employee.employeeId}
                  onChange={handleEmployeeChange}
                  required
                  readOnly
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

              {/* Phone */}
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

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium">
                  Gender<span className="text-xs text-red-500"> *</span>
                </label>
                <select
                  name="gender"
                  value={employee.gender}
                  onChange={handleEmployeeChange}
                  required
                  className="mt-1 w-full cursor-pointer rounded-sm border p-2"
                >
                  <option className="cursor-pointer" value="">
                    Select Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* DOB */}
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

              {/* Blood group */}
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

              {/* Address Line 1 */}
              <div className="md:col-span-1">
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

              {/* Address Line 2 */}
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

              {/* City */}
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

              {/* State */}
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

              {/* Emergency contact name */}
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

              {/* Emergency contact number */}
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
              <div className="md:col-span-1">
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
              <div className="mt-2 md:col-span-3">
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
            <div className="grid grid-cols-2 gap-6">
              {/* Profile Picture Upload */}
              <section className="">
                <label className="text-foreground block text-sm font-medium">
                  Profile Picture <span className="text-foreground">(optional, max 5MB)</span>
                </label>

                <div className="border-foreground mt-2 rounded-lg border-2 border-dashed p-6">
                  {!profile.profileImageUrl ? (
                    <div className="flex flex-col items-center text-center">
                      <Upload className="text-foreground h-12 w-12 cursor-pointer" />
                      <p className="text-foreground mt-2 text-sm">Upload profile picture</p>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        className="mt-4 cursor-pointer text-sm"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Image
                        src={profile.profileImageUrl}
                        alt="Profile preview"
                        width={128}
                        height={128}
                        className="h-32 w-32 rounded-full object-cover"
                      />

                      <div className="flex-1">
                        <p className="text-foreground text-sm font-medium">{profile.fileName}</p>
                      </div>

                      <button
                        type="button"
                        onClick={removeProfileImage}
                        className="text-foreground rounded-full bg-red-500 p-2"
                        aria-label="Remove profile picture"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Documents Upload */}
              <section>
                <label className="text-foreground block text-sm font-medium">
                  Documents <span className="text-foreground">(ID proof, certificates, max 10MB each)</span>
                </label>

                <div className="mt-4 space-y-6">
                  {documents.map((doc, index) => (
                    <div key={index} className="border-foreground bg-sidebar rounded-lg border p-4 shadow-sm">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <label className="text-sm font-medium">Document Type *</label>

                          <select
                            value={doc.documentTypeId}
                            onChange={(e) => updateDocument(index, 'documentTypeId', e.target.value)}
                            className="bg-sidebar text-foreground mt-1 w-full cursor-pointer rounded border px-3 py-2 text-sm"
                            required
                          >
                            <option value="">Select document type</option>

                            {documentTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Document Number *</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={String(doc.documentNumber)}
                            onChange={(e) => updateDocument(index, 'documentNumber', e.target.value)}
                            placeholder="Enter document number"
                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Document File *</label>
                          {!doc.fileUrl ? (
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => handleDocumentUpload(e, index)}
                              className="text-foreground mt-1 w-full cursor-pointer rounded border p-2 text-sm"
                            />
                          ) : doc.fileUrl.match(/\.(jpg|jpeg|png)$/i) ? (
                            <div className="mt-1 flex items-center gap-4">
                              <Image
                                height={1000}
                                width={1000}
                                src={doc.fileUrl}
                                alt={doc.fileName}
                                className="h-24 w-24 rounded border object-cover"
                              />
                              <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium">{doc.fileName}</p>
                                <button
                                  type="button"
                                  onClick={() => removeDocumentFile(index)}
                                  className="text-foreground h-6 w-6 cursor-pointer rounded-full bg-red-500 px-1"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-sidebar mt-1 flex items-center justify-between rounded p-2">
                              <p className="text-foreground truncate text-xs">{doc.fileName}</p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => removeDocumentFile(index)}
                                  className="text-foreground cursor-pointer bg-red-500 p-2"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="cursor-pointer text-sm text-red-600"
                        >
                          Remove Document
                        </button>

                        {index === documents.length - 1 && (
                          <div className=" ">
                            <button
                              type="button"
                              onClick={addNewDocument}
                              className="bg-foreground text-background flex cursor-pointer items-center gap-1 rounded px-3 py-1 text-sm"
                            >
                              <Plus className="h-4 w-4" /> Add Another
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Form Actions */}
              <div className="mt-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="border-foreground text-foreground cursor-pointer rounded border px-6 py-2 transition hover:bg-gray-100"
                >
                  Back
                </button>

                <button
                  type="submit"
                  className="border-foreground text-foreground cursor-pointer rounded border px-6 py-2"
                >
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
