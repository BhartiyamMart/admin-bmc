'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronDown,
  Check,
  X,
  Upload,
  Plus,
  EyeOff,
  Eye,
  CalendarIcon,
  RefreshCw,
  User,
  MapIcon,
  FileText,
  CheckCircle,
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
// Add this import near your other local imports
import { getStatesByCountry, getCitiesByState } from '@/lib/state';

import useEmployeeRoleStore, { RoleState } from '@/store/employeeRoleStore';
import { getEmployeeRole, getStores, getWarehouses } from '@/apis/employee-role.api';
import { getEmployeePermission } from '@/apis/create-employeepermission.api';
import { createEmployee, generateEmployeeId } from '@/apis/create-employee.api';

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { createPreassignedUrl } from '@/apis/create-banners.api';
import { getDocumentType } from '@/apis/create-document-type.api';
import { MyDocumentType } from '@/interface/common.interface';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { formatDate } from 'date-fns';
import { cn } from '@/lib/utils';

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
  // const [currentStep, setCurrentStep] = useState<number>(1);
  const today = new Date();
  const minAllowedDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  // Lookups & dropdown states
  const [preAssignedPermissions, setPreAssignedPermissions] = useState<string[]>([]);
  const [allAvailablePermissions, setAllAvailablePermissions] = useState<Permission[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [openGenderDropdown, setOpenGenderDropdown] = useState(false);

  const [openBloodDropdown, setOpenBloodDropdown] = useState(false);
  const [bloodSearchValue, setBloodSearchValue] = useState('');
  const DOCUMENT_RULES: Record<string, { maxLength: number; regex: RegExp; placeholder: string; error: string }> = {
    // Aadhaar Card - Exactly 12 digits
    '68bb5d7c-a027-474b-9e11-3898445a91ab': {
      maxLength: 16,
      regex: /^\d{16}$/,
      placeholder: 'Enter 16-digit Aadhaar number',
      error: 'Aadhaar must be exactly 16 digits',
    },
    // PAN Card - Exactly 10 alphanumeric
    '9b0d7c6c-1be1-4841-8bc4-1a82e76c7538': {
      maxLength: 10,
      regex: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      placeholder: 'ABCDE1234F',
      error: 'PAN must be 10 characters (5 letters + 4 digits + 1 letter)',
    },
    // Passport - 8 characters alphanumeric
    '371879df-a082-40e5-a878-c2b1eafafc2e': {
      // PASSPORT
      maxLength: 9,
      regex: /^[A-Z]{1}[0-9]{7}$|^[A-Z]{2}[0-9]{7}$/,
      placeholder: 'P1234567 or Z1234567',
      error: 'Passport must be 8-9 characters (letters + digits)',
    },
    // Voter ID - 10 digits
    '60962845-a26c-4d9d-8df0-4ee333951317': {
      maxLength: 10,
      regex: /^\d{10}$/,
      placeholder: '1234567890',
      error: 'Voter ID must be exactly 10 digits',
    },
    // Driving License - Variable (up to 15 chars)
    '5aaf854d-11c1-4f8e-8d78-93663c19485f': {
      // passport ID (assuming DL)
      maxLength: 15,
      regex: /^.{5,15}$/,
      placeholder: 'DL1234567890123',
      error: 'Driving License must be 5-15 characters',
    },
    // Default for other documents
    default: {
      maxLength: 50,
      regex: /^.+$/,
      placeholder: 'Enter ID Number',
      error: 'ID number is required',
    },
  };

  const getDocumentMaxLength = (documentTypeId: string | undefined): number => {
    return documentTypeId && DOCUMENT_RULES[documentTypeId] ? DOCUMENT_RULES[documentTypeId].maxLength : 50;
  };

  const getDocumentPlaceholder = (documentTypeId: string | undefined): string => {
    return documentTypeId && DOCUMENT_RULES[documentTypeId]?.placeholder
      ? DOCUMENT_RULES[documentTypeId].placeholder
      : 'Enter ID Number';
  };

  const getDocumentErrorMessage = (documentTypeId: string | undefined, value: string): string => {
    return documentTypeId && DOCUMENT_RULES[documentTypeId]?.error
      ? DOCUMENT_RULES[documentTypeId].error
      : 'Invalid format';
  };

  const isValidDocumentNumber = (documentTypeId: string | undefined, value: string): boolean => {
    if (!documentTypeId || !value.trim()) return false;

    const rule = DOCUMENT_RULES[documentTypeId] || DOCUMENT_RULES['default'];
    return rule.regex.test(value.trim());
  };

  const [openWarehouseDropdown, setOpenWarehouseDropdown] = useState(false);
  const [warehouseSearchValue, setWarehouseSearchValue] = useState('');

  const [isTypePopoverOpen, setIsTypePopoverOpen] = useState<Record<number, boolean>>({});

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
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const [documents, setDocuments] = useState<DocRow[]>([
    { documentTypeId: '', documentNumber: '', fileUrl: '', fileName: '' },
  ]);
  const [openStateDropdown, setOpenStateDropdown] = useState(false);
  const [stateSearchValue, setStateSearchValue] = useState('');

  const [openCityDropdown, setOpenCityDropdown] = useState(false);
  const [citySearchValue, setCitySearchValue] = useState('');

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

  // --------------------- Location Logic ---------------------
  const statesList = useMemo(() => getStatesByCountry('IN'), []);

  const filteredStates = useMemo(() => {
    if (!stateSearchValue.trim()) return statesList;
    return statesList.filter((s) => s.name.toLowerCase().includes(stateSearchValue.toLowerCase()));
  }, [statesList, stateSearchValue]);

  const availableCities = useMemo(() => {
    return employee.state ? getCitiesByState('IN', employee.state) : [];
  }, [employee.state]);

  const filteredCities = useMemo(() => {
    if (!citySearchValue.trim()) return availableCities;
    return availableCities.filter((c) => c.name.toLowerCase().includes(citySearchValue.toLowerCase()));
  }, [availableCities, citySearchValue]);

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
  const generateId = async () => {
    setIsGeneratingId(true); // Start spinning
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
    } finally {
      // Stop spinning after a short delay for better visual feedback
      setTimeout(() => setIsGeneratingId(false), 500);
    }
  };

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
  // below: const [employee, setEmployee] = useState(...)
  // state (near other hooks)
  const [dobDate, setDobDate] = useState<Date | undefined>(employee.dob ? new Date(employee.dob) : undefined);

  // handler
  const handleDobChange = (date: Date | undefined) => {
    setDobDate(date);
    setEmployee((prev) => ({
      ...prev,
      dob: date ? date.toISOString().split('T')[0] : '',
    }));
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
      console.log('res', res);

      const uploadUrl = res?.payload?.presignedUrl;
      const fileUrl = res?.payload?.fileUrl; // must be something like:
      // https://kamna-erp.s3.ap-south-1.amazonaws.com/your-key.jpg
      console.log('fileUrl', fileUrl);
      if (!uploadUrl || !fileUrl) {
        toast.error('Failed to get upload URL or file URL');
        console.error('Presigned response', res);
        return;
      }

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      // always use fileUrl
      setProfile({ profileImageUrl: fileUrl, fileName: file.name });
      toast.success('Profile image uploaded');
    } catch (err) {
      console.error('Profile upload error', err);
      toast.error('Failed to upload profile image');
    }
  };

  useEffect(() => {
    if (profile.profileImageUrl) {
      console.log('Uploaded profile image URL (effect):', profile.profileImageUrl);
    }
  }, [profile.profileImageUrl]);

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
    if (index === 0) return;
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Check file size
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Document size must be less than 10MB');

      // Clear the input field so the user can try again
      e.target.value = '';
      return;
    }

    try {
      const res = await createPreassignedUrl({ fileName: file.name, fileType: file.type });
      const uploadUrl = res?.payload?.presignedUrl;
      const fileUrl = res?.payload?.fileUrl;

      if (!uploadUrl) {
        toast.error('Failed to get upload URL for document');
        e.target.value = ''; // Optional: Clear on server-side failure too
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
      e.target.value = ''; // Reset input on network/catch error
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
      email: employee.email,
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
    const getAgeFromDob = (dobStr: string): number => {
      const dob = new Date(dobStr); // dobStr = "yyyy-mm-dd"
      if (isNaN(dob.getTime())) return -1;

      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    };

    const handleDobChange = (date: Date | undefined) => {
      setDobDate(date);
      setEmployee((prev) => ({
        ...prev,
        // store as yyyy-mm-dd (works with your formatDate payload helper)
        dob: date ? date.toISOString().split('T')[0] : '',
      }));
    };

    // inside validateStep1
    if (!employee.dob) {
      toast.error('Date of birth is required.');
      return false;
    }

    const age = getAgeFromDob(employee.dob);
    if (age < 0) {
      toast.error('Invalid date of birth.');
      return false;
    }
    if (age < 18) {
      toast.error('Employee must be at least 18 years old.');
      return false;
    }
    // --------------------- API Call ---------------------
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
      <div className="bg-sidebar max-h-[89vh] w-full overflow-y-auto rounded p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h1 className="font-semibold">Add Employee</h1>

          <Link
            href="/employee-management/employee-list"
            className="bg-primary text-background flex items-center rounded px-3 py-2 text-sm"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          {/* STEP 1 */}

          <div className="bg-sidebar border shadow-sm">
            {/* First Name */}
            <h3 className="flex items-center pt-8 pl-4 text-base font-semibold sm:text-lg">
              <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Personal Details
            </h3>
            <hr className="mt-7"></hr>
            <div className="mt-2 grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium">
                  First Name<span className="text-xs text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter the first name"
                  value={employee.firstName}
                  onChange={handleEmployeeChange}
                  required
                  className="mt-1 w-full rounded border p-2"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter the last name"
                  value={employee.lastName}
                  onChange={handleEmployeeChange}
                  className="mt-1 w-full rounded border p-2"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter the email"
                  value={employee.email}
                  onChange={handleEmployeeChange}
                  className="mt-1 w-full rounded border p-2"
                />
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium">
                  Phone Number<span className="text-xs text-red-500"> *</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter the phone number"
                  pattern="[0-9]*"
                  name="phoneNumber"
                  value={employee.phoneNumber}
                  onChange={handleEmployeeChange}
                  required
                  maxLength={10}
                  className="bg-sidebar mt-1 w-full rounded border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Date of Birth
                  <span className="text-xs text-red-500"> *</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-1 h-[41px] w-full cursor-pointer justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dobDate ? (
                        formatDate(dobDate, 'dd-MM-yyyy')
                      ) : (
                        <span className="text-foreground">Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dobDate}
                      onSelect={handleDobChange}
                      // open initially at 18 years ago
                      defaultMonth={new Date(new Date().getFullYear() - 18, new Date().getMonth(), 1)}
                      // allow navigation from 1900 to today
                      startMonth={new Date(1900, 0, 1)}
                      endMonth={new Date()}
                      // only allow selecting 18+ dates
                      disabled={(date) => {
                        const min = new Date();
                        min.setFullYear(min.getFullYear() - 18);
                        return date > min;
                      }}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Blood group */}
              <div>
                <label className="block text-sm font-medium">Blood Group (optional)</label>

                <Popover open={openBloodDropdown} onOpenChange={setOpenBloodDropdown}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm"
                    >
                      {employee.bloodGroup ? employee.bloodGroup : 'Select Blood Group'}
                      <ChevronDown className="ml-2" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
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

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium">
                  Gender<span className="text-xs text-red-500"> *</span>
                </label>

                <Popover open={openGenderDropdown} onOpenChange={setOpenGenderDropdown}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-left"
                    >
                      {employee.gender
                        ? employee.gender === 'male'
                          ? 'Male'
                          : employee.gender === 'female'
                            ? 'Female'
                            : 'Other'
                        : 'Select Gender'}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
                    <Command shouldFilter={false}>
                      <CommandList>
                        <CommandGroup>
                          <CommandItem
                            value="male"
                            className="cursor-pointer"
                            onSelect={() => {
                              setEmployee((prev) => ({ ...prev, gender: 'male' }));
                              setOpenGenderDropdown(false);
                            }}
                          >
                            Male
                            {employee.gender === 'male' && <Check className="ml-auto h-4 w-4 opacity-100" />}
                          </CommandItem>

                          <CommandItem
                            value="female"
                            className="cursor-pointer"
                            onSelect={() => {
                              setEmployee((prev) => ({ ...prev, gender: 'female' }));
                              setOpenGenderDropdown(false);
                            }}
                          >
                            Female
                            {employee.gender === 'female' && <Check className="ml-auto h-4 w-4 opacity-100" />}
                          </CommandItem>

                          <CommandItem
                            value="other"
                            className="cursor-pointer"
                            onSelect={() => {
                              setEmployee((prev) => ({ ...prev, gender: 'other' }));
                              setOpenGenderDropdown(false);
                            }}
                          >
                            Other
                            {employee.gender === 'other' && <Check className="ml-auto h-4 w-4 opacity-100" />}
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-medium">
                  Password<span className="text-xs text-red-500"> *</span>
                </label>

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter the password"
                  minLength={6}
                  value={employee.password}
                  onChange={handleEmployeeChange}
                  required
                  className="mt-1 w-full rounded border p-2 pr-10"
                />

                {/* Eye Icon */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-foreground absolute top-[45px] right-3 -translate-y-1/2 transform cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {/* Emergency contact name */}
              <div>
                <label className="block text-sm font-medium">
                  Emergency Contact Name<span className="text-xs text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  placeholder="Enter the emergency contact name"
                  value={employee.emergencyContactName}
                  onChange={handleEmployeeChange}
                  required
                  className="mt-1 w-full rounded border p-2"
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
                  placeholder="Enter the emergency contact number"
                  pattern="[0-9]*"
                  name="emergencyContactNumber"
                  value={employee.emergencyContactNumber}
                  onChange={handleEmployeeChange}
                  required
                  maxLength={10}
                  className="mt-1 w-full rounded border p-2"
                />
              </div>
            </div>
          </div>

          <div className="bg-sidebar mt-6 rounded border shadow-sm">
            <div className="">
              <h3 className="flex items-center pt-8 pl-4 text-base font-semibold sm:text-lg">
                <MapIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Address
              </h3>
              <hr className="mt-7"></hr>
              <div className="mt-4 grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Address Line 1 */}
                <div className="">
                  <label className="block text-sm font-medium">
                    Address Line 1 <span className="text-xs text-red-500"> *</span>
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    placeholder="Enter the address line 1"
                    value={employee.addressLine1}
                    onChange={handleEmployeeChange}
                    required
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <label className="block text-sm font-medium">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    name="addressLine2"
                    placeholder="Enter the address line 2"
                    value={employee.addressLine2}
                    onChange={handleEmployeeChange}
                    className="mt-1 w-full rounded border p-2"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium">
                    State <span className="text-xs text-red-500"> *</span>
                  </label>
                  <Popover
                    open={openStateDropdown}
                    onOpenChange={(open) => {
                      setOpenStateDropdown(open);
                      // Clear search value when the dropdown is opened
                      if (open) setStateSearchValue('');
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        role="combobox"
                        className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm"
                      >
                        {employee.state || 'Select State'}
                        <ChevronDown className="ml-2 h-6 w-6" />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search states..."
                          value={stateSearchValue}
                          onValueChange={setStateSearchValue}
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No state found.</CommandEmpty>
                          <CommandGroup>
                            {filteredStates.map((s) => (
                              <CommandItem
                                key={s.code}
                                value={s.code}
                                // Inside State CommandItem onSelect
                                onSelect={(val) => {
                                  // Find the full name object using the selected code
                                  const selectedStateObj = statesList.find((s) => s.code === val);

                                  setEmployee((prev) => ({
                                    ...prev,
                                    state: selectedStateObj ? selectedStateObj.name : val, // Store NAME, not code
                                    city: '', // Reset city when state changes
                                  }));

                                  setStateSearchValue('');
                                  setOpenStateDropdown(false);
                                }}
                              >
                                {s.name}
                                <Check
                                  className={`ml-auto h-4 w-4 ${employee.state === s.code ? 'opacity-100' : 'opacity-0'}`}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                {/* City */}
                <div>
                  <label className="block text-sm font-medium">
                    City<span className="text-xs text-red-500"> *</span>
                  </label>
                  <Popover
                    open={openCityDropdown}
                    onOpenChange={(open) => {
                      setOpenCityDropdown(open);
                      // Clear the search value whenever the city popover opens
                      if (open) setCitySearchValue('');
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        role="combobox"
                        disabled={!employee.state}
                        aria-expanded={openCityDropdown}
                        className={`mt-1 flex w-full items-center justify-between rounded border px-3 py-2 text-sm ${
                          !employee.state ? 'cursor-not-allowed bg-gray-50 opacity-60' : 'cursor-pointer'
                        }`}
                      >
                        {employee.city ? availableCities.find((c) => c.name === employee.city)?.name : 'Select City'}
                        <ChevronDown className="ml-2 h-6 w-6" />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search cities..."
                          value={citySearchValue}
                          onValueChange={setCitySearchValue}
                          className="h-9"
                        />
                        <CommandList className="max-h-60 overflow-y-auto">
                          <CommandEmpty>No city found.</CommandEmpty>
                          <CommandGroup>
                            {filteredCities.map((c) => (
                              <CommandItem
                                key={c.id}
                                value={c.name}
                                onSelect={(val) => {
                                  setEmployee((prev) => ({ ...prev, city: val }));
                                  // Clear search and close dropdown on selection
                                  setCitySearchValue('');
                                  setOpenCityDropdown(false);
                                }}
                                className="cursor-pointer"
                              >
                                {c.name}
                                <Check
                                  className={`ml-auto h-4 w-4 ${employee.city === c.name ? 'opacity-100' : 'opacity-0'}`}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-sidebar mt-6 rounded border shadow-sm">
            <div>
              <h3 className="flex items-center pt-8 pl-4 text-base font-semibold sm:text-lg">
                <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Job Information
              </h3>
              <hr className="mt-7"></hr>
              <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
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
                        <span className="truncate">
                          {employee.roleId ? roles.find((r) => r.id === employee.roleId)?.name : 'Select Role'}
                        </span>
                        <ChevronDown className="ml-2 shrink-0" />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-2">
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
                                className="cursor-pointer"
                                onSelect={(val) => {
                                  setEmployee((prev) => ({
                                    ...prev,
                                    roleId: val,
                                    permissions: [],
                                  }));
                                  setOpenRoleDropdown(false);
                                  setRoleSearchValue('');
                                }}
                              >
                                {r.name}
                                <Check
                                  className={`ml-auto ${employee.roleId === r.id ? 'opacity-100' : 'opacity-0'}`}
                                />
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

                    <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
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
                                className="cursor-pointer"
                                onSelect={(val) => {
                                  setEmployee((prev) => ({ ...prev, storeId: val }));
                                  setOpenStoreDropdown(false);
                                  setStoreSearchValue('');
                                }}
                              >
                                {s.name}
                                <Check
                                  className={`ml-auto ${employee.storeId === s.id ? 'opacity-100' : 'opacity-0'}`}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Employee ID (readonly) */}
                <div className="relative">
                  <label className="block text-sm font-medium">
                    Employee ID<span className="text-xs text-red-500"> *</span>
                  </label>
                  <input
                    name="employeeId"
                    value={employee.employeeId}
                    onChange={handleEmployeeChange}
                    required
                    readOnly
                    className="mt-1 w-full rounded border p-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={generateId}
                    disabled={isGeneratingId}
                    className={`text-muted-foreground hover:text-foreground absolute top-[45px] right-3 -translate-y-1/2 transform cursor-pointer transition-colors ${
                      isGeneratingId ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    title="Regenerate Employee ID"
                  >
                    <RefreshCw className={`h-4 w-4 ${isGeneratingId ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Warehouse */}
                <div>
                  <label className="block text-sm font-medium">Warehouse ID (optional)</label>

                  <Popover open={openWarehouseDropdown} onOpenChange={setOpenWarehouseDropdown}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm"
                      >
                        {employee.warehouseId
                          ? warehouses.find((w) => w.id === employee.warehouseId)?.name
                          : 'Select Warehouse'}
                        <ChevronDown className="ml-2" />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
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
                                className="cursor-pointer"
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

                <div className="">
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
                        disabled={!employee.roleId}
                        className={cn(
                          'mt-1 flex w-full items-center justify-between rounded border px-3 py-2 text-sm',
                          !employee.roleId && 'cursor-not-allowed bg-gray-50 opacity-60' // ✅ Same visual treatment as City
                        )}
                      >
                        <span className="truncate">
                          {employee.permissions.length > 0
                            ? `${employee.permissions.length} permissions selected`
                            : 'Select Permissions'}
                        </span>
                        <ChevronDown className="ml-2" />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
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
              </div>
            </div>
          </div>
          <div className="">
            <div className="mt-6 grid grid-cols-1 gap-6">
              {/* Profile Picture Upload */}
              <section className="bg-sidebar border p-4 shadow-sm">
                <label className="text-foreground block text-sm font-medium">
                  Profile Picture <span className="text-muted-foreground text-xs">(optional,"max 5mb")</span>
                </label>

                <div className="border-foreground mt-2 rounded border-2 border-dashed p-6">
                  {!profile.profileImageUrl ? (
                    <div
                      className="flex cursor-pointer flex-col items-center text-center"
                      onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                    >
                      <Upload className="text-foreground h-12 w-12" />
                      <p className="text-foreground mt-2 text-sm">Upload profile picture</p>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        className="mt-4 hidden cursor-pointer text-sm"
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
                        unoptimized
                      />

                      <div className="flex-1">
                        <p className="text-foreground text-sm font-medium">{profile.fileName}</p>
                      </div>

                      <button
                        type="button"
                        onClick={removeProfileImage}
                        className="text-foreground h-6 w-6 cursor-pointer rounded-full bg-red-500 px-1"
                        aria-label="Remove profile picture"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Documents Upload */}
              <section className="bg-sidebar mt-6 rounded border shadow-sm">
                {/* EXACT Header Structure from Edit Page */}
                <div className="flex flex-col space-y-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-6">
                  <h2 className="flex items-center text-base font-semibold sm:text-lg">
                    <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Documents
                  </h2>
                </div>

                {/* EXACT Body Structure from Edit Page - EDIT MODE ONLY */}
                <div className="p-4 sm:p-6">
                  <div className="scrollbar-thin scrollbar-thumb-gray-300 max-h-[500px] space-y-6 overflow-y-auto pr-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="border-foreground bg-sidebar rounded-lg border p-6 shadow-sm">
                        {/* EXACT Remove Button Position */}
                        <div className="mb-4 flex items-center justify-end">
                          {index !== 0 && (
                            <button
                              onClick={() => removeDocument(index)}
                              className="cursor-pointer text-xs font-medium hover:text-red-500"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {/* EXACT Grid Layout */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          {/* Document Type - EXACT Edit Page Logic */}
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Type <span className="text-xs text-red-500">*</span>
                            </label>
                            <Popover
                              open={isTypePopoverOpen[index]}
                              onOpenChange={(open) => setIsTypePopoverOpen((prev) => ({ ...prev, [index]: open }))}
                            >
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className={`border-foreground mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-xs ${
                                    !doc.documentTypeId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                  }`}
                                >
                                  {doc.documentTypeId
                                    ? documentTypes.find((t) => t.id === doc.documentTypeId)?.label || 'Select type'
                                    : 'Select document type'}
                                  <ChevronDown className="ml-2 h-4 w-4" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-md min-w-0 p-0">
                                <Command shouldFilter={false} className="w-full">
                                  <CommandList>
                                    <CommandEmpty className="px-3 py-2 text-sm text-gray-500">
                                      No active document type found.
                                    </CommandEmpty>
                                    <CommandGroup className="max-h-60 overflow-auto">
                                      {documentTypes
                                        .filter((type) => type.status === true)
                                        .map((type) => {
                                          const isTypeUsed = documents.some(
                                            (d, i) => i !== index && d.documentTypeId === type.id
                                          );
                                          return (
                                            <CommandItem
                                              key={type.id}
                                              value={type.id}
                                              className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${
                                                isTypeUsed
                                                  ? 'cursor-not-allowed opacity-60'
                                                  : 'aria-selected:bg-primary aria-selected:text-background'
                                              }`}
                                              onSelect={() => {
                                                if (!isTypeUsed) {
                                                  updateDocument(index, 'documentTypeId', type.id);
                                                  setIsTypePopoverOpen((prev) => ({ ...prev, [index]: false }));
                                                }
                                              }}
                                            >
                                              <div className="flex w-full items-center justify-between">
                                                <span>{type.label}</span>
                                                {isTypeUsed && (
                                                  <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                                                    Used
                                                  </span>
                                                )}
                                                <Check
                                                  className={`ml-2 h-4 w-4 ${
                                                    doc.documentTypeId === type.id ? 'opacity-100' : 'opacity-0'
                                                  }`}
                                                />
                                              </div>
                                            </CommandItem>
                                          );
                                        })}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Document Number - EXACT Edit Page Logic */}
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              Number <span className="text-xs text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={doc.documentNumber || ''}
                              disabled={!doc.documentTypeId}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9a-zA-Z\/-]/g, '');
                                updateDocument(index, 'documentNumber', value);
                              }}
                              maxLength={getDocumentMaxLength(doc.documentTypeId)}
                              className={`focus:ring-primary w-full rounded border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                                doc.documentTypeId && !String(doc.documentNumber ?? '').trim()
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-300'
                              } ${!doc.documentTypeId ? 'cursor-not-allowed bg-gray-50 opacity-60' : ''}`}
                              placeholder={getDocumentPlaceholder(doc.documentTypeId) || 'Enter document number'}
                            />
                          </div>

                          {/* File Upload - EXACT Edit Page Style */}
                          <div>
                            <label className="mb-1 block text-sm font-medium">
                              File <span className="text-xs text-red-500">*</span>
                            </label>
                            {!doc.fileUrl ? (
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => handleDocumentUpload(e, index)}
                                className="hover:border-primary/50 w-full cursor-pointer rounded border border-dashed border-gray-300 p-2 text-sm file:cursor-pointer"
                              />
                            ) : (
                              <div className="flex items-center justify-between rounded border bg-green-50 p-1.5">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="max-w-[150px] truncate text-xs font-medium">{doc.fileName}</span>
                                </div>
                                <button
                                  onClick={() => removeDocumentFile(index)}
                                  className="cursor-pointer rounded-full p-1 text-red-500 hover:bg-red-50"
                                  title="Remove file"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* EXACT Add Button Logic */}
                    {documents[documents.length - 1]?.documentTypeId &&
                    String(documents[documents.length - 1]?.documentNumber || '').trim() &&
                    documents[documents.length - 1]?.fileUrl ? (
                      <div className="border-t pt-4">
                        <button
                          type="button"
                          onClick={addNewDocument}
                          className="hover:border-primary hover:bg-primary/5 hover:text-primary flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-sm font-medium text-gray-600"
                        >
                          <Plus className="h-5 w-5" />
                          Add Another Document
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              {/* Form Actions */}
              <div className="mt-4 flex items-center gap-4">
                <Button type="submit" className="border-foreground bg-primary cursor-pointer rounded border px-6 py-2">
                  Add Employee
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
