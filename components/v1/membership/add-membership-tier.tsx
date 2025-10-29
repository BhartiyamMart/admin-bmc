'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Switch } from '@radix-ui/react-switch';
import { Check, ChevronLeft, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const AddMembershipTier = () => {
  const [openDoc, setOpenDoc] = useState(false);
  const [valueDoc, setValueDoc] = useState('');
  const [isActive, setIsActive] = useState(false);
  const frameworks = [
    { value: 'type1', label: 'Document Type 1' },
    { value: 'type2', label: 'Document Type 2' },
  ];
  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full overflow-y-auto rounded-lg p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <h2 className="text-lg font-semibold">Add Membership Tier</h2>
          <Link
            href="/membership/membership-tier-list"
            className="bg-primary text-background flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm transition"
          >
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Link>
        </div>

        <form className="space-y-4 rounded-lg bg-white">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {/* Name */}
            <div>
              <label className="mb-1 block font-medium">Name</label>
              <input type="text" name="Name" required className="w-full rounded border px-3 py-2" />
            </div>

            {/* Membership Plan */}
            <div>
              <label className="mb-1 block font-medium">Membership Plan *</label>
              <Popover open={openDoc} onOpenChange={setOpenDoc}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openDoc}
                    className="w-full justify-between py-5 focus:ring-2 focus:ring-orange-500"
                  >
                    {valueDoc ? frameworks.find((f) => f.value === valueDoc)?.label : 'Select Plan'}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                  <Command>
                    <CommandInput placeholder="Search Plan..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No plan found.</CommandEmpty>
                      <CommandGroup>
                        {frameworks.map((f) => (
                          <CommandItem
                            key={f.value}
                            onSelect={() => {
                              setValueDoc(f.value === valueDoc ? '' : f.value);
                              setOpenDoc(false);
                            }}
                          >
                            {f.label}
                            <Check className={cn('ml-auto', valueDoc === f.value ? 'opacity-100' : 'opacity-0')} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block font-medium">Description</label>
              <textarea name="description" className="w-full rounded border px-3 py-2" />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1 block font-medium">Amount</label>
              <input type="text" name="amount" required className="w-full rounded border px-3 py-2" />
            </div>

            {/* Valid Days */}
            <div>
              <label className="mb-1 block font-medium">Valid Days</label>
              <input type="text" name="validDays" required className="w-full rounded border px-3 py-2" />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block font-medium">Status</label>
              <select name="status" className="w-full rounded border px-3 py-2">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* IsActive */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="status" className="font-medium">
                  IsActive
                </label>
                <Switch
                  id="isactive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isActive ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Switch>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="mt-0 w-full rounded bg-orange-500 py-2 text-white sm:w-[320px]">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMembershipTier;
