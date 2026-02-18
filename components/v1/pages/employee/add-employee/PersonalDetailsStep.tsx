import React, { useState } from 'react';
import { User, Upload, X, Eye, EyeOff, CalendarIcon, ChevronDown, Check, Info, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { formatDate } from 'date-fns';

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { EmployeeFormData } from './add-employee';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { IEditEmployeeMasterDataRES } from '@/interface/common.interface';
import { compressImage } from '@/utils/file-compression';
import { getPreSignedUrl } from '@/apis/common.api';
import { uploadFile } from '@/utils/file-upload.utils';

interface PersonalDetailsStepProps {
  formData: EmployeeFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
  masterData: IEditEmployeeMasterDataRES;
}

export default function PersonalDetailsStep({ formData, setFormData, masterData }: PersonalDetailsStepProps) {
  const today = new Date();
  const maxDobDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  const [dobDate, setDobDate] = useState<Date | undefined>(formData.dob ? new Date(formData.dob) : undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [openGenderDropdown, setOpenGenderDropdown] = useState(false);
  const [openBloodDropdown, setOpenBloodDropdown] = useState(false);
  const [bloodSearchValue, setBloodSearchValue] = useState('');
  const [genderSearchValue, setGenderSearchValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let newValue: string | boolean = type === 'checkbox' ? checked : value;

    if (name === 'phoneNumber' && type !== 'checkbox') {
      newValue = (value as string).replace(/\D/g, '').slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const getBloodGroupLabel = (blood: string) => {
    const role = masterData.bloodGroups.find((r) => r.value === blood);
    return role?.label || 'Select Blood Group';
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData((prev) => ({ ...prev, password }));
    toast.success('Password generated');
  };

  const handleDobChange = (date: Date | undefined) => {
    if (!date) return;
    if (date > maxDobDate) return;

    setDobDate(date);
    setFormData((prev) => ({
      ...prev,
      dob: date ? date.toISOString().split('T')[0] : '',
    }));
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const result = await uploadFile({
      file,
      path: 'USER_PROFILE',
      fileType: 'IMAGE',
      maxSizeInMB: 5,
      compressToMB: 1,
      maxDimension: 1920,
      showToast: true,
    });

    setIsUploading(false);

    if (result.success && result.fileUrl) {
      setFormData((prev) => ({
        ...prev,
        profileImageUrl: result.fileUrl!,
        profileImageFileName: result.fileName!,
      }));
    }
  };

  const removeProfileImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImageUrl: '',
      profileImageFileName: '',
    }));
    toast.success('Profile image removed');
  };

  // Helper function to get the display label for selected gender
  const getGenderLabel = (value: string) => {
    const gender = masterData.genders.find((g) => g.value === value);
    return gender?.label || 'Select Gender';
  };

  return (
    <div className="bg-sidebar rounded-lg border shadow-sm">
      {/* Header Section */}
      <div className="bg-muted/30 border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <User className="text-primary h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Personal Details</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center transition-colors">
                    <Info className="h-4 w-4" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="start">
                  <p>Basic information about the user</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Profile Picture - Moved to top for better visibility */}
        <div className="bg-muted/20 mb-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6">
          <label className="mb-2 block text-sm font-medium">Profile Picture (optional)</label>
          <div className="flex flex-col items-center gap-4">
            {formData.profileImageUrl ? (
              <div className="relative">
                <Image
                  src={formData.profileImageUrl}
                  alt="Profile"
                  width={160}
                  height={160}
                  className="border-background ring-primary/20 rounded-full border-4 object-cover shadow-lg ring-2"
                />
                <button
                  type="button"
                  onClick={removeProfileImage}
                  className="bg-destructive text-accent-foreground hover:bg-destructive/90 absolute -top-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-md transition-transform hover:scale-110"
                  disabled={isUploading}
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                className={`group flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-full border-2 border-dashed transition-all ${
                  isUploading
                    ? 'cursor-not-allowed opacity-50'
                    : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
                }`}
              >
                <Upload className="text-muted-foreground group-hover:text-primary h-8 w-8 transition-colors" />
                <span className="text-muted-foreground group-hover:text-primary text-xs font-medium">
                  Click to upload
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}
            {isUploading && (
              <div className="flex items-center gap-2">
                <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                <span className="text-muted-foreground text-sm">Uploading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium">
              Name<span className="text-destructive ml-1">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium">
              Email<span className="text-destructive ml-1">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium">
              Phone Number<span className="text-destructive ml-1">*</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Enter phone number"
              pattern="[0-9]*"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              maxLength={10}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium">
              Date of Birth<span className="text-destructive ml-1">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="h-10 w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dobDate ? (
                    formatDate(dobDate, 'dd-MM-yyyy')
                  ) : (
                    <span className="text-muted-foreground">Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dobDate}
                  onSelect={handleDobChange}
                  captionLayout="dropdown"
                  defaultMonth={new Date(maxDobDate.getFullYear(), maxDobDate.getMonth(), 1)}
                  startMonth={new Date(1900, 0, 1)}
                  endMonth={maxDobDate}
                  disabled={{
                    after: maxDobDate, // 🚫 cannot select dates making age < 18
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Blood Group */}
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium">Blood Group (optional)</label>
            <Popover open={openBloodDropdown} onOpenChange={setOpenBloodDropdown}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <span className={formData.bloodGroup ? '' : 'text-muted-foreground'}>
                    {formData.bloodGroup ? getBloodGroupLabel(formData.bloodGroup) : 'Select Gender'}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
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
                      {masterData.bloodGroups.map((bg, index) => (
                        <CommandItem
                          key={index}
                          value={bg.value}
                          className="cursor-pointer"
                          onSelect={(val) => {
                            setFormData((prev) => ({ ...prev, bloodGroup: val }));
                            setOpenBloodDropdown(false);
                            setBloodSearchValue('');
                          }}
                        >
                          {bg.label}
                          <Check
                            className={`ml-auto h-4 w-4 ${formData.bloodGroup === bg.value ? 'opacity-100' : 'opacity-0'}`}
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
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium">
              Gender<span className="text-destructive ml-1">*</span>
            </label>
            <Popover open={openGenderDropdown} onOpenChange={setOpenGenderDropdown}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <span className={formData.gender ? '' : 'text-muted-foreground'}>
                    {formData.gender ? getGenderLabel(formData.gender) : 'Select Gender'}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search gender..."
                    value={genderSearchValue}
                    onValueChange={setGenderSearchValue}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No gender found.</CommandEmpty>
                    <CommandGroup>
                      {masterData.genders.map((gender, index) => (
                        <CommandItem
                          key={index}
                          value={gender.value}
                          className="cursor-pointer"
                          onSelect={(val) => {
                            setFormData((prev) => ({ ...prev, gender: val }));
                            setOpenGenderDropdown(false);
                            setGenderSearchValue('');
                          }}
                        >
                          {gender.label}
                          <Check
                            className={`ml-auto h-4 w-4 ${formData.gender === gender.value ? 'opacity-100' : 'opacity-0'}`}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Password - Full width on mobile, spans 1 column on larger screens */}
          <div className="col-span-1 space-y-2">
            <label className="text-sm leading-none font-medium">
              Password<span className="text-destructive ml-1">*</span>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter password"
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pr-10 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring flex h-10 items-center justify-center gap-2 rounded-md px-6 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <RefreshCw size={16} />
                Generate
              </button>
            </div>

            {/* One-time Password Checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="oneTimePassword"
                name="oneTimePassword"
                checked={formData.oneTimePassword}
                onChange={handleChange}
                className="text-primary focus:ring-primary h-4 w-4 cursor-pointer rounded border-gray-300 focus:ring-2 focus:ring-offset-2"
              />
              <label htmlFor="oneTimePassword" className="cursor-pointer text-sm leading-none font-medium">
                Password is valid for one time only
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
