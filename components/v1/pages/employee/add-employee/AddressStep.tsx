import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { EmployeeFormData } from './add-employee';
import { IEditEmployeeMasterDataRES } from '@/interface/common.interface';
import { getIndianStates, fetchCitiesFromAPI, IndianCity } from '@/utils/indian-states-cities';

interface AddressStepProps {
  formData: EmployeeFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
  masterData: IEditEmployeeMasterDataRES;
}

export default function AddressStep({ formData, setFormData, masterData }: AddressStepProps) {
  const [openStateDropdown, setOpenStateDropdown] = useState(false);
  const [stateSearchValue, setStateSearchValue] = useState('');
  const [openCityDropdown, setOpenCityDropdown] = useState(false);
  const [citySearchValue, setCitySearchValue] = useState('');
  const [availableCities, setAvailableCities] = useState<IndianCity[]>([]);
  const [isFetchingCities, setIsFetchingCities] = useState(false);

  // Get states (now returns ISO2 codes as values)
  const statesList = useMemo(() => getIndianStates(), []);

  const filteredStates = useMemo(() => {
    if (!stateSearchValue.trim()) return statesList;
    return statesList.filter((s) => s.label.toLowerCase().includes(stateSearchValue.toLowerCase()));
  }, [statesList, stateSearchValue]);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.state) {
        setAvailableCities([]);
        return;
      }

      setIsFetchingCities(true);
      try {
        // formData.state now contains ISO2 code (e.g., 'DL', 'KA')
        const cities = await fetchCitiesFromAPI(formData.state);
        setAvailableCities(cities);

        if (cities.length === 0) {
          toast.error('No cities found for this state');
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        toast.error('Failed to load cities');
        setAvailableCities([]);
      } finally {
        setIsFetchingCities(false);
      }
    };

    fetchCities();
  }, [formData.state]);

  const filteredCities = useMemo(() => {
    if (!citySearchValue.trim()) return availableCities;
    return availableCities.filter((c) => c.label.toLowerCase().includes(citySearchValue.toLowerCase()));
  }, [availableCities, citySearchValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'pincode') {
      newValue = value.replace(/\D/g, '').slice(0, 6);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  // Helper to get state label from ISO2 code
  const getStateLabel = (stateValue: string) => {
    const state = statesList.find((s) => s.value === stateValue);
    return state?.label || 'Select State';
  };

  // Helper to get city label from value
  const getCityLabel = (cityValue: string) => {
    const city = availableCities.find((c) => c.value === cityValue);
    return city?.label || cityValue || 'Select City';
  };

  return (
    <div className="bg-sidebar border shadow-sm">
      <h3 className="flex items-center pt-8 pl-4 text-base font-semibold sm:text-lg">
        <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        Address
      </h3>
      <hr className="mt-7" />
      <div className="mt-2 grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Address Line 1 */}
        <div>
          <label className="block text-sm font-medium">
            Address Line 1<span className="text-xs text-red-500"> *</span>
          </label>
          <input
            type="text"
            name="addressLine1"
            placeholder="Enter address line 1"
            value={formData.addressLine1}
            onChange={handleChange}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        {/* Address Line 2 */}
        <div>
          <label className="block text-sm font-medium">Address Line 2 (optional)</label>
          <input
            type="text"
            name="addressLine2"
            placeholder="Enter address line 2"
            value={formData.addressLine2}
            onChange={handleChange}
            className="mt-1 w-full rounded border p-2"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium">
            State<span className="text-xs text-red-500"> *</span>
          </label>
          <Popover
            open={openStateDropdown}
            onOpenChange={(open) => {
              setOpenStateDropdown(open);
              if (open) setStateSearchValue('');
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2"
              >
                {formData.state ? getStateLabel(formData.state) : 'Select State'}
                <ChevronDown className="ml-2" />
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
                        key={s.value}
                        value={s.value}
                        onSelect={(val) => {
                          setFormData((prev) => ({
                            ...prev,
                            state: val, // Now stores ISO2 code (e.g., 'DL', 'KA')
                            city: '', // Clear city when state changes
                          }));
                          setStateSearchValue('');
                          setOpenStateDropdown(false);
                        }}
                        className="cursor-pointer"
                      >
                        {s.label}
                        <Check className={`ml-auto ${formData.state === s.value ? 'opacity-100' : 'opacity-0'}`} />
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
            {isFetchingCities && <span className="ml-2 text-xs text-blue-600">Loading cities...</span>}
          </label>
          <Popover
            open={openCityDropdown}
            onOpenChange={(open) => {
              setOpenCityDropdown(open);
              if (open) setCitySearchValue('');
            }}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={!formData.state || isFetchingCities}
                className={cn(
                  'mt-1 flex w-full items-center justify-between rounded border px-3 py-2',
                  (!formData.state || isFetchingCities) && 'cursor-not-allowed bg-gray-50 opacity-60'
                )}
              >
                {formData.city
                  ? getCityLabel(formData.city)
                  : isFetchingCities
                    ? 'Loading cities...'
                    : formData.state
                      ? 'Select City'
                      : 'Select state first'}
                <ChevronDown className="ml-2" />
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
                  <CommandEmpty>{isFetchingCities ? 'Loading cities...' : 'No city found.'}</CommandEmpty>
                  <CommandGroup>
                    {filteredCities.map((c) => (
                      <CommandItem
                        key={c.value}
                        value={c.value}
                        onSelect={(val) => {
                          setFormData((prev) => ({ ...prev, city: val }));
                          setCitySearchValue('');
                          setOpenCityDropdown(false);
                        }}
                        className="cursor-pointer"
                      >
                        {c.label}
                        <Check className={`ml-auto ${formData.city === c.value ? 'opacity-100' : 'opacity-0'}`} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-sm font-medium">
            Pincode<span className="text-xs text-red-500"> *</span>
          </label>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            name="pincode"
            placeholder="Enter pincode"
            value={formData.pincode}
            onChange={handleChange}
            maxLength={6}
            className="mt-1 w-full rounded border p-2"
          />
        </div>
      </div>
    </div>
  );
}
