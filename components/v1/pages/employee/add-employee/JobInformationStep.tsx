import React, { useState, useEffect, useMemo } from 'react';
import { Briefcase, ChevronDown, Check, RefreshCw, CalendarIcon, X, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from 'date-fns';

import { generateEmployeeId, getPermissionsByRoleRES, getLocations } from '@/apis/common.api';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { EmployeeFormData, Permission } from './add-employee';
import { IEditEmployeeMasterDataRES, ILocationData } from '@/interface/common.interface';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface JobInformationStepProps {
  formData: EmployeeFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
  masterData: IEditEmployeeMasterDataRES;
}

interface RolePermissionPayload {
  permissions: { label: string; value: string }[];
  rolePermissions: { label: string; value: string }[];
}

export default function JobInformationStep({ formData, setFormData, masterData }: JobInformationStepProps) {
  const [joiningDate, setJoiningDate] = useState<Date | undefined>(
    formData.joiningDate ? new Date(formData.joiningDate) : undefined
  );
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const [isFetchingPermissions, setIsFetchingPermissions] = useState(false);
  const [isFetchingLocations, setIsFetchingLocations] = useState(false);

  // Permissions state
  const [preAssignedPermissions, setPreAssignedPermissions] = useState<string[]>([]);
  const [allAvailablePermissions, setAllAvailablePermissions] = useState<{ label: string; value: string }[]>([]);

  // Locations state
  const [locations, setLocations] = useState<ILocationData[]>([]);
  const [selectedLocationType, setSelectedLocationType] = useState<string>('');

  // Dropdown states
  const [openRoleDropdown, setOpenRoleDropdown] = useState(false);
  const [roleSearchValue, setRoleSearchValue] = useState('');
  const [openLocationTypeDropdown, setOpenLocationTypeDropdown] = useState(false);
  const [locationTypeSearchValue, setLocationTypeSearchValue] = useState('');
  const [openLocationDropdown, setOpenLocationDropdown] = useState(false);
  const [locationSearchValue, setLocationSearchValue] = useState('');
  const [openPermDropdown, setOpenPermDropdown] = useState(false);
  const [permSearchValue, setPermSearchValue] = useState('');

  // Generate employee ID on mount
  useEffect(() => {
    const generateId = async () => {
      if (formData.employeeId) return;
      try {
        const resp = await generateEmployeeId();
        const employeeId = resp?.payload?.employeeCode;
        if (!employeeId) {
          toast.error('Failed to generate employee ID');
          return;
        }
        setFormData((prev) => ({ ...prev, employeeId }));
      } catch (err) {
        console.error('Error generating id:', err);
        toast.error('Failed to generate employee ID');
      }
    };
    generateId();
  }, [setFormData, formData.employeeId]);

  // Fetch permissions when role changes
  useEffect(() => {
    const fetchPerms = async () => {
      if (!formData.roleId) {
        setAllAvailablePermissions([]);
        setPreAssignedPermissions([]);
        setFormData((prev) => ({ ...prev, permissions: [] }));
        return;
      }

      setIsFetchingPermissions(true);
      try {
        const resp = await getPermissionsByRoleRES(formData.roleId);
        if (!resp.error && resp.payload) {
          const payload = resp.payload as unknown as RolePermissionPayload;
          const rolePerms = payload.rolePermissions || [];
          const allPerms = payload.permissions || [];

          setPreAssignedPermissions(rolePerms.map((p) => p.value));
          setAllAvailablePermissions(allPerms);
          setFormData((prev) => ({
            ...prev,
            permissions: rolePerms.map((p) => ({ id: p.value, name: p.label })),
          }));

          toast.success(`${rolePerms.length} default permissions loaded`);
        } else {
          setAllAvailablePermissions([]);
          setPreAssignedPermissions([]);
          toast.error('Failed to fetch role permissions');
        }
      } catch (err) {
        console.error('Error fetching permissions', err);
        setAllAvailablePermissions([]);
        setPreAssignedPermissions([]);
        toast.error('Failed to fetch role permissions');
      } finally {
        setIsFetchingPermissions(false);
      }
    };
    fetchPerms();
  }, [formData.roleId]);

  // Fetch locations when location type changes
  useEffect(() => {
    const fetchLocs = async () => {
      if (!selectedLocationType) {
        setLocations([]);
        return;
      }

      setIsFetchingLocations(true);
      try {
        const resp = await getLocations(selectedLocationType, true);
        if (!resp.error && resp.payload) {
          setLocations(resp.payload.locations || []);
          toast.success(`${resp.payload.locations?.length || 0} locations loaded`);
        } else {
          setLocations([]);
          toast.error('Failed to fetch locations');
        }
      } catch (err) {
        console.error('Error fetching locations', err);
        setLocations([]);
        toast.error('Failed to fetch locations');
      } finally {
        setIsFetchingLocations(false);
      }
    };
    fetchLocs();
  }, [selectedLocationType]);

  const regenerateId = async () => {
    setIsGeneratingId(true);
    try {
      const resp = await generateEmployeeId();
      const employeeId = resp?.payload?.employeeCode;
      if (!employeeId) {
        toast.error('Failed to generate employee ID');
        return;
      }
      setFormData((prev) => ({ ...prev, employeeId }));
      toast.success('Employee ID regenerated');
    } catch (err) {
      console.error('Error generating id:', err);
      toast.error('Failed to generate employee ID');
    } finally {
      setTimeout(() => setIsGeneratingId(false), 500);
    }
  };

  const handleJoiningDateChange = (date: Date | undefined) => {
    setJoiningDate(date);
    setFormData((prev) => ({
      ...prev,
      joiningDate: date ? date.toISOString().split('T')[0] : '',
    }));
  };

  // Handle location type selection
  const handleLocationTypeSelect = (locationType: string) => {
    setSelectedLocationType(locationType);
    // Clear previously selected location when type changes
    setFormData((prev) => ({ ...prev, locationId: '', locationType }));
    setOpenLocationTypeDropdown(false);
    setLocationTypeSearchValue('');
  };

  // Clear location type
  const clearLocationType = () => {
    setSelectedLocationType('');
    setLocations([]);
    setFormData((prev) => ({ ...prev, locationId: '', locationType: '' }));
  };

  // Handle location selection
  const handleLocationSelect = (locationId: string) => {
    setFormData((prev) => ({ ...prev, locationId }));
    setOpenLocationDropdown(false);
    setLocationSearchValue('');
  };

  // Clear location
  const clearLocation = () => {
    setFormData((prev) => ({ ...prev, locationId: '' }));
  };

  // Filters
  const filteredRoles = useMemo(() => {
    if (!roleSearchValue.trim()) return masterData.roles ?? [];
    return (masterData.roles ?? []).filter((r) => r?.label?.toLowerCase().includes(roleSearchValue.toLowerCase()));
  }, [masterData.roles, roleSearchValue]);

  const filteredLocationTypes = useMemo(() => {
    if (!locationTypeSearchValue.trim()) return masterData.locationTypes ?? [];
    return (masterData.locationTypes ?? []).filter((lt) =>
      lt?.label?.toLowerCase().includes(locationTypeSearchValue.toLowerCase())
    );
  }, [masterData.locationTypes, locationTypeSearchValue]);

  const filteredLocations = useMemo(() => {
    if (!locationSearchValue.trim()) return locations;
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(locationSearchValue.toLowerCase()) ||
        loc.searchText?.toLowerCase().includes(locationSearchValue.toLowerCase())
    );
  }, [locations, locationSearchValue]);

  const filteredPerms = useMemo(() => {
    if (!permSearchValue.trim()) return allAvailablePermissions;
    return allAvailablePermissions.filter((p) => p.label.toLowerCase().includes(permSearchValue.toLowerCase()));
  }, [allAvailablePermissions, permSearchValue]);

  // Helper functions
  const getRoleLabel = (roleId: string) => {
    const role = masterData.roles.find((r) => r.id === roleId);
    return role?.label || 'Select Role';
  };

  const getLocationTypeLabel = (locationType: string) => {
    const type = masterData.locationTypes.find((lt) => lt.value === locationType);
    return type?.label || 'Select Location Type';
  };

  const getLocationLabel = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    return location?.name || 'Select Location';
  };

  return (
    <div className="bg-sidebar border shadow-sm">
      <h3 className="flex items-center pt-8 pl-4 text-base font-semibold sm:text-lg">
        <Briefcase className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        Job Information
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground hover:text-foreground ml-2 inline-flex cursor-pointer items-center">
                <Info className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" align="start">
              <p>Fill all the job informations</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h3>
      <hr className="mt-7" />
      <div className="mt-2 grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Role */}
        <div>
          <label className="block text-sm font-medium">
            Role<span className="text-xs text-red-500"> *</span>
          </label>
          <Popover open={openRoleDropdown} onOpenChange={setOpenRoleDropdown}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2"
              >
                {formData.roleId ? getRoleLabel(formData.roleId) : 'Select Role'}
                <ChevronDown className="ml-2" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
              <Command shouldFilter={false}>
                <CommandInput placeholder="Search role..." value={roleSearchValue} onValueChange={setRoleSearchValue} />
                <CommandList>
                  <CommandEmpty>No role found.</CommandEmpty>
                  <CommandGroup>
                    {filteredRoles.map((r) => (
                      <CommandItem
                        key={r.value}
                        value={r.id}
                        className="cursor-pointer"
                        onSelect={(val) => {
                          setFormData((prev) => ({ ...prev, roleId: val }));
                          setOpenRoleDropdown(false);
                          setRoleSearchValue('');
                        }}
                      >
                        {r.label}
                        <Check className={`ml-auto ${formData.roleId === r.value ? 'opacity-100' : 'opacity-0'}`} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Location Type */}
        <div>
          <label className="block text-sm font-medium">
            Location Type<span className="text-xs text-red-500"> *</span>
          </label>
          <div className="relative">
            <Popover open={openLocationTypeDropdown} onOpenChange={setOpenLocationTypeDropdown}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2"
                >
                  {selectedLocationType ? getLocationTypeLabel(selectedLocationType) : 'Select Location Type'}
                  <ChevronDown className="ml-2" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search location type..."
                    value={locationTypeSearchValue}
                    onValueChange={setLocationTypeSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>No location type found.</CommandEmpty>
                    <CommandGroup>
                      {filteredLocationTypes.map((lt) => (
                        <CommandItem
                          key={lt.value}
                          value={lt.value}
                          className="cursor-pointer"
                          onSelect={handleLocationTypeSelect}
                        >
                          {lt.label}
                          <Check
                            className={`ml-auto ${selectedLocationType === lt.value ? 'opacity-100' : 'opacity-0'}`}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedLocationType && (
              <button
                type="button"
                onClick={clearLocationType}
                className="absolute top-1/2 right-10 -translate-y-1/2 rounded-full p-1 hover:bg-gray-200"
                title="Clear location type"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium">
            Location<span className="text-xs text-red-500"> *</span>
            {isFetchingLocations && <span className="ml-2 text-xs text-blue-600">Loading...</span>}
          </label>
          <div className="relative">
            <Popover open={openLocationDropdown} onOpenChange={setOpenLocationDropdown}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={!selectedLocationType || isFetchingLocations}
                  className={cn(
                    'mt-1 flex w-full items-center justify-between rounded border px-3 py-2',
                    (!selectedLocationType || isFetchingLocations) && 'cursor-not-allowed bg-gray-50 opacity-60'
                  )}
                >
                  {formData.locationId
                    ? getLocationLabel(formData.locationId)
                    : selectedLocationType
                      ? 'Select Location'
                      : 'Select location type first'}
                  <ChevronDown className="ml-2" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search location..."
                    value={locationSearchValue}
                    onValueChange={setLocationSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>No location found.</CommandEmpty>
                    <CommandGroup>
                      {filteredLocations.map((loc) => (
                        <CommandItem
                          key={loc.id}
                          value={loc.id}
                          className="cursor-pointer"
                          onSelect={handleLocationSelect}
                        >
                          <div className="flex flex-col">
                            <span>{loc.name}</span>
                            <span className="text-muted-foreground text-xs">{loc.fullAddress}</span>
                          </div>
                          <Check
                            className={`ml-auto ${formData.locationId === loc.id ? 'opacity-100' : 'opacity-0'}`}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {formData.locationId && (
              <button
                type="button"
                onClick={clearLocation}
                className="absolute top-1/2 right-10 -translate-y-1/2 rounded-full p-1 hover:bg-gray-200"
                title="Clear location"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Employee ID */}
        <div className="relative">
          <label className="block text-sm font-medium">
            Employee ID<span className="text-xs text-red-500"> *</span>
          </label>
          <input
            name="employeeId"
            value={formData.employeeId}
            readOnly
            className="mt-1 w-full rounded border bg-gray-50 p-2 pr-10"
          />
          <button
            type="button"
            onClick={regenerateId}
            disabled={isGeneratingId}
            className="hover:text-primary absolute top-[45px] right-3 -translate-y-1/2 transform cursor-pointer"
            title="Regenerate Employee ID"
          >
            <RefreshCw className={`h-4 w-4 ${isGeneratingId ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Joining Date */}
        <div>
          <label className="block text-sm font-medium">
            Joining Date<span className="text-xs text-red-500"> *</span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="mt-1 h-[41px] w-full cursor-pointer justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {joiningDate ? formatDate(joiningDate, 'dd-MM-yyyy') : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                captionLayout="dropdown"
                selected={joiningDate}
                onSelect={handleJoiningDateChange}
                defaultMonth={new Date()}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Permissions */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium">
            Permissions<span className="text-xs text-red-500"> *</span>
            {isFetchingPermissions && <span className="ml-2 text-xs text-blue-600">Loading...</span>}
          </label>
          <Popover open={openPermDropdown} onOpenChange={setOpenPermDropdown}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={!formData.roleId || isFetchingPermissions}
                className={cn(
                  'mt-1 flex w-full items-center justify-between rounded border px-3 py-2',
                  (!formData.roleId || isFetchingPermissions) && 'cursor-not-allowed bg-gray-50 opacity-60'
                )}
              >
                {formData.permissions.length > 0
                  ? `${formData.permissions.length} permissions selected`
                  : formData.roleId
                    ? 'Select Permissions'
                    : 'Select a role first'}
                <ChevronDown className="ml-2" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search permissions..."
                  value={permSearchValue}
                  onValueChange={setPermSearchValue}
                />
                <CommandList>
                  <CommandEmpty>No permission found.</CommandEmpty>
                  <CommandGroup>
                    {filteredPerms.map((p) => {
                      const isPreAssigned = preAssignedPermissions.includes(p.value);
                      const isSelected = formData.permissions.some((perm) => perm.id === p.value);

                      return (
                        <CommandItem
                          key={p.value}
                          value={p.value}
                          onSelect={(val) => {
                            if (isPreAssigned) {
                              toast.error('This permission is required for the selected role');
                              return;
                            }
                            setFormData((prev) => {
                              const exists = prev.permissions.some((perm) => perm.id === val);
                              const newList = exists
                                ? prev.permissions.filter((perm) => perm.id !== val)
                                : [...prev.permissions, { id: p.value, name: p.label }];
                              return { ...prev, permissions: newList };
                            });
                          }}
                          className={isPreAssigned ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                        >
                          <span className="flex items-center gap-2">
                            {p.label}
                            {isPreAssigned && <span className="text-xs text-red-500">*(Required)</span>}
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

          <div className="mt-2 flex max-h-24 min-h-[96px] flex-wrap gap-2 overflow-auto rounded border p-2">
            {formData.permissions.length === 0 ? (
              <span className="text-muted-foreground text-sm">No permissions selected</span>
            ) : (
              formData.permissions.map((permission) => {
                const isPreAssigned = preAssignedPermissions.includes(permission.id);
                return (
                  <div
                    key={permission.id}
                    className={cn(
                      'flex h-fit items-center rounded px-3 py-1 text-sm',
                      isPreAssigned
                        ? 'border border-blue-300 bg-blue-100 text-blue-800'
                        : 'bg-primary text-primary-foreground'
                    )}
                  >
                    {permission.name}
                    {isPreAssigned && <span className="ml-1 text-xs">*</span>}
                    {!isPreAssigned && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            permissions: prev.permissions.filter((p) => p.id !== permission.id),
                          }))
                        }
                        className="ml-2 rounded p-0.5 hover:bg-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">* Required permissions cannot be removed</p>
        </div>
      </div>
    </div>
  );
}
