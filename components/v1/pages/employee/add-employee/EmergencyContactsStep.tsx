import React, { useState, useMemo } from 'react';
import { AlertCircle, Plus, X, ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty } from '@/components/ui/command';
import { EmergencyContact } from './add-employee';
import { IEditEmployeeMasterDataRES } from '@/interface/common.interface';

interface EmergencyContactsStepProps {
  contacts: EmergencyContact[];
  setContacts: React.Dispatch<React.SetStateAction<EmergencyContact[]>>;
  masterData: IEditEmployeeMasterDataRES;
}

export default function EmergencyContactsStep({ contacts, setContacts, masterData }: EmergencyContactsStepProps) {
  const [openRelationDropdown, setOpenRelationDropdown] = useState<Record<number, boolean>>({});
  const [relationSearchValues, setRelationSearchValues] = useState<Record<number, string>>({});

  const addEmergencyContact = () => {
    if (contacts.length >= 2) {
      toast.error('Maximum 2 emergency contacts allowed');
      return;
    }
    setContacts((prev) => [...prev, { name: '', phone: '', address: '', relation: '' }]);
  };

  const updateEmergencyContact = (index: number, key: keyof EmergencyContact, value: string) => {
    setContacts((prev) => prev.map((c, i) => (i === index ? { ...c, [key]: value } : c)));
  };

  const removeEmergencyContact = (index: number) => {
    if (contacts.length === 1) {
      toast.error('At least one emergency contact is required');
      return;
    }
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePhoneChange = (index: number, value: string) => {
    const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
    updateEmergencyContact(index, 'phone', cleanedValue);
  };

  // Filter relations based on search for each contact
  const getFilteredRelations = (contactIndex: number) => {
    const searchValue = relationSearchValues[contactIndex] || '';
    if (!searchValue.trim()) return masterData.relations || [];
    return (masterData.relations || []).filter((rel) => rel.label.toLowerCase().includes(searchValue.toLowerCase()));
  };

  return (
    <div className="bg-sidebar border shadow-sm">
      <div className="flex items-center justify-between px-4 pt-8">
        <h3 className="flex items-center text-base font-semibold sm:text-lg">
          <AlertCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Emergency Contacts (Max 2)
        </h3>
        {contacts.length < 2 && (
          <button
            type="button"
            onClick={addEmergencyContact}
            className="bg-primary text-background flex items-center rounded px-3 py-1 text-sm"
          >
            <Plus className="mr-1 h-4 w-4" /> Add Contact
          </button>
        )}
      </div>
      <hr className="mt-7" />

      {contacts.map((contact, contactIndex) => (
        <div key={contactIndex} className="border-b p-4 last:border-b-0">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-medium">Contact {contactIndex + 1}</h4>
            {contacts.length > 1 && (
              <button
                type="button"
                onClick={() => removeEmergencyContact(contactIndex)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium">
                Name<span className="text-xs text-red-500"> *</span>
              </label>
              <input
                type="text"
                placeholder="Enter name"
                value={contact.name}
                onChange={(e) => updateEmergencyContact(contactIndex, 'name', e.target.value)}
                className="mt-1 w-full rounded border p-2"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium">
                Phone<span className="text-xs text-red-500"> *</span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter phone number"
                value={contact.phone}
                onChange={(e) => handlePhoneChange(contactIndex, e.target.value)}
                maxLength={10}
                className="mt-1 w-full rounded border p-2"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium">
                Address<span className="text-xs text-red-500"> *</span>
              </label>
              <input
                type="text"
                placeholder="Enter address"
                value={contact.address}
                onChange={(e) => updateEmergencyContact(contactIndex, 'address', e.target.value)}
                className="mt-1 w-full rounded border p-2"
              />
            </div>

            {/* Relation */}
            <div>
              <label className="block text-sm font-medium">
                Relation<span className="text-xs text-red-500"> *</span>
              </label>
              <Popover
                open={openRelationDropdown[contactIndex]}
                onOpenChange={(open) => {
                  setOpenRelationDropdown((prev) => ({ ...prev, [contactIndex]: open }));
                  if (open) {
                    setRelationSearchValues((prev) => ({ ...prev, [contactIndex]: '' }));
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2"
                  >
                    {contact.relation || 'Select Relation'}
                    <ChevronDown className="ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search relation..."
                      value={relationSearchValues[contactIndex] || ''}
                      onValueChange={(value) => setRelationSearchValues((prev) => ({ ...prev, [contactIndex]: value }))}
                    />
                    <CommandList>
                      <CommandEmpty>No relation found.</CommandEmpty>
                      <CommandGroup>
                        {getFilteredRelations(contactIndex).map((rel, relIndex) => (
                          <CommandItem
                            key={`${contactIndex}-${relIndex}`}
                            value={rel.value}
                            className="cursor-pointer"
                            onSelect={(val) => {
                              // Find the selected relation to get its label
                              const selectedRelation = masterData.relations.find((r) => r.value === val);
                              if (selectedRelation) {
                                updateEmergencyContact(contactIndex, 'relation', selectedRelation.label);
                              }
                              setOpenRelationDropdown((prev) => ({ ...prev, [contactIndex]: false }));
                              setRelationSearchValues((prev) => ({ ...prev, [contactIndex]: '' }));
                            }}
                          >
                            {rel.label}
                            <Check
                              className={`ml-auto ${contact.relation === rel.label ? 'opacity-100' : 'opacity-0'}`}
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
      ))}
    </div>
  );
}
