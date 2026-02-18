'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

// import { createEmployee } from '@/apis/create-employee.api';
import PersonalDetailsStep from './PersonalDetailsStep';
import JobInformationStep from './JobInformationStep';
import AddressStep from './AddressStep';
import EmergencyContactsStep from './EmergencyContactsStep';
import DocumentsStep from './DocumentsStep';
import StepIndicator from './StepIndicator';
import { getMasterData } from '@/apis/common.api';
import { IEditEmployeeMasterDataRES } from '@/interface/common.interface';
import { editUser } from '@/apis/user.api';

// --------------------- Types ---------------------
export interface Permission {
  id: string;
  name: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  address: string;
  relation: string;
}

export interface Document {
  documentTypeId: string;
  documentNumber: string;
  fileUrl: string;
  fileName: string;
}

export interface EmployeeFormData {
  // Personal Details
  name: string;
  email: string;
  phoneNumber: string;
  dob: string;
  bloodGroup: string;
  gender: string;
  password: string;
  oneTimePassword: boolean;
  profileImageUrl: string;
  profileImageFileName: string;

  // Job Information
  roleId: string;
  locationType: string; // NEW: Location type (STORE, WAREHOUSE, etc.)
  locationId: string; // NEW: Selected location ID
  employeeId: string;
  permissions: Permission[];
  joiningDate: string;

  // Address Details
  addressLine1: string;
  addressLine2: string;
  state: string;
  city: string;
  pincode: string;

  // ememrgency

  // documents
}

export interface Permission {
  id: string;
  name: string;
}

// --------------------- Component ---------------------
export default function AddEmployee() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Data
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    dob: '',
    bloodGroup: '',
    gender: '',
    password: '',
    oneTimePassword: false,
    profileImageUrl: '',
    profileImageFileName: '',

    roleId: '',
    locationType: '', // NEW: Location type (STORE, WAREHOUSE, etc.)
    locationId: '',
    employeeId: '',
    permissions: [],
    joiningDate: '',

    addressLine1: '',
    addressLine2: '',
    state: '',
    city: '',
    pincode: '',
  });

  const [masterData, setMasterData] = useState<IEditEmployeeMasterDataRES>({
    bloodGroups: [],
    roles: [],
    relations: [],
    documentTypes: [],
    locationTypes: [],
    genders: [],
  });

  const fetchMasterData = async () => {
    try {
      const response = await getMasterData();
      if (response.status === 200) {
        setMasterData(response.payload);
      }
    } catch (error) {
      toast.error('master data not fetched');
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: '', phone: '', address: '', relation: '' },
  ]);

  const [documents, setDocuments] = useState<Document[]>([
    { documentTypeId: '', documentNumber: '', fileUrl: '', fileName: '' },
  ]);

  // --------------------- Step Validation ---------------------
  const getAgeFromDob = (dobStr: string): number => {
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return -1;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const validateStep1 = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length !== 10) {
      toast.error('Valid 10-digit phone number is required');
      return false;
    }
    if (!formData.dob) {
      toast.error('Date of birth is required');
      return false;
    }
    const age = getAgeFromDob(formData.dob);
    if (age < 18) {
      toast.error('Employee must be at least 18 years old');
      return false;
    }
    if (!formData.gender) {
      toast.error('Gender is required');
      return false;
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.roleId) {
      toast.error('Role is required');
      return false;
    }
    if (!formData.locationType && !formData.locationId) {
      toast.error('Either Store or Warehouse must be selected');
      return false;
    }
    if (!formData.employeeId.trim()) {
      toast.error('Employee ID is required');
      return false;
    }
    if (formData.permissions.length === 0) {
      toast.error('At least one permission is required');
      return false;
    }
    if (!formData.joiningDate) {
      toast.error('Joining date is required');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!formData.addressLine1.trim()) {
      toast.error('Address Line 1 is required');
      return false;
    }
    if (!formData.state) {
      toast.error('State is required');
      return false;
    }
    if (!formData.city) {
      toast.error('City is required');
      return false;
    }
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      toast.error('Valid 6-digit pincode is required');
      return false;
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    for (let i = 0; i < emergencyContacts.length; i++) {
      const contact = emergencyContacts[i];
      if (!contact.name.trim()) {
        toast.error(`Emergency Contact ${i + 1}: Name is required`);
        return false;
      }
      if (!contact.phone.trim() || contact.phone.length !== 10) {
        toast.error(`Emergency Contact ${i + 1}: Valid 10-digit phone is required`);
        return false;
      }
      if (!contact.address.trim()) {
        toast.error(`Emergency Contact ${i + 1}: Address is required`);
        return false;
      }
      if (!contact.relation.trim()) {
        toast.error(`Emergency Contact ${i + 1}: Relation is required`);
        return false;
      }
    }
    return true;
  };

  const validateStep5 = (): boolean => {
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      if (!doc.documentTypeId) {
        toast.error(`Document ${i + 1}: Type is required`);
        return false;
      }
      if (!doc.documentNumber.toString().trim()) {
        toast.error(`Document ${i + 1}: Number is required`);
        return false;
      }
      if (!doc.fileUrl) {
        toast.error(`Document ${i + 1}: File upload is required`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    let isValid = false;
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // --------------------- Final Submit ---------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep5()) return;

    const formatDate = (isoDate: string) => {
      if (!isoDate) return '';
      const [year, month, day] = isoDate.split('-');
      return `${day}-${month}-${year}`;
    };

    // Transform payload to match required API format
    const payload = {
      employeeId: formData.employeeId.trim(),
      personalDetails: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phoneNumber.trim(),
        dateOfBirth: formData.dob ? formatDate(formData.dob) : '',
        bloodGroup: formData.bloodGroup || undefined,
        gender: formData.gender, // Already in uppercase format (e.g., "MALE", "FEMALE")
        photo: formData.profileImageUrl || undefined,
        password: formData.password.trim(),
        requirePasswordChange: formData.oneTimePassword,
        address: {
          addressLineOne: formData.addressLine1.trim(),
          addressLineTwo: formData.addressLine2?.trim() || undefined,
          state: formData.state.trim(),
          city: formData.city.trim(),
          pincode: formData.pincode.trim(),
        },
        emergencyContacts: emergencyContacts.map((c) => ({
          name: c.name.trim(),
          phone: c.phone.trim(),
          address: c.address.trim(),
          relation: c.relation.toUpperCase(), // Should be uppercase like "FATHER", "MOTHER", etc.
        })),
        documents: documents.map((d) => ({
          type: d.documentTypeId, // documentTypeId is the type (e.g., "AADHAR_CARD")
          number: d.documentNumber.trim(),
          fileUrl: d.fileUrl,
        })),
      },
      roleIds: [formData.roleId], // Array of role IDs
      permissionIds: formData.permissions.map((p) => p.id), // Array of permission IDs
      locationId: formData.locationId || undefined,
    };

    try {
      const resp = await editUser(payload);
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
            onClick={() => router.back()}
            href="/employee-management/add-employee"
            className="bg-primary text-background flex cursor-pointer items-center rounded p-2 pr-3 pl-3 text-sm"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        {/* Steps Indicator */}
        <StepIndicator currentStep={currentStep} />

        <form onSubmit={handleSubmit}>
          {/* Render Current Step */}
          {currentStep === 1 && (
            <PersonalDetailsStep formData={formData} setFormData={setFormData} masterData={masterData} />
          )}
          {currentStep === 2 && (
            <JobInformationStep formData={formData} setFormData={setFormData} masterData={masterData} />
          )}
          {currentStep === 3 && <AddressStep formData={formData} setFormData={setFormData} masterData={masterData} />}
          {currentStep === 4 && (
            <EmergencyContactsStep
              contacts={emergencyContacts}
              setContacts={setEmergencyContacts}
              masterData={masterData}
            />
          )}
          {currentStep === 5 && (
            <DocumentsStep documents={documents} setDocuments={setDocuments} masterData={masterData} />
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex cursor-pointer items-center rounded border px-4 py-2 hover:bg-gray-100"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </button>
            )}

            <div className="ml-auto">
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-primary text-background flex cursor-pointer items-center rounded px-4 py-2"
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              ) : (
                <button type="submit" className="flex items-center rounded bg-green-600 px-4 py-2 text-white">
                  Submit <Check className="ml-1 h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
