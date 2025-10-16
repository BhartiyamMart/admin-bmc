'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronLeft, ChevronsUpDown } from 'lucide-react';
import { Switch } from '@radix-ui/react-switch';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const AddBenefits = () => {
  const [isActive, setIsActive] = useState(false);

  const form ={
    membershipPlane: '',
    isActive: '',
    description: '',
    benefitValue: '',
  };

  const [openDoc, setOpenDoc] = useState(false);
  const [valueDoc, setValueDoc] = useState('');

  const frameworks = [
    { value: 'type1', label: 'Document Type 1' },
    { value: 'type2', label: 'Document Type 2' },
  ];

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="max-h-[89vh] w-full overflow-y-auto rounded-lg bg-sidebar p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <h2 className="text-lg font-semibold">Add Benefit</h2>
          <Link
            href="/membership/benefit-list"
            className="flex cursor-pointer items-center gap-2 rounded bg-primary text-background px-3 py-2 text-sm transition"
          >
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Link>
        </div>

        <form className="space-y-4 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block font-medium">Membership Plan *</label>
              <Popover open={openDoc} onOpenChange={setOpenDoc}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openDoc}
                    className="w-full max-w-full justify-between py-5 focus:ring-2 bg-primary text-background"
                  >
                    {valueDoc ? frameworks.find((f) => f.value === valueDoc)?.label : 'Select Plan'}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                  <Command>
                    <CommandInput placeholder="Search Plan..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No document found.</CommandEmpty>
                      <CommandGroup>
                        {frameworks.map((f) => (
                          <CommandItem
                            key={f.value}
                            value={f.value}
                            onSelect={(currentValue) => {
                              setValueDoc(currentValue === valueDoc ? '' : currentValue);
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

            <div>
              <div>
                <label className="mb-1 block font-medium">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  required
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>
            <div>
              <div>
                <label className="mb-1 block font-medium">Benefit value</label>
                <input
                  type="text"
                  name="benefitValue"
                  value={form.benefitValue}
                  required
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="isactive" className="font-medium">
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
          <button type="submit" className="mt-0 w-[320px] rounded bg-primary text-background py-2">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBenefits;
