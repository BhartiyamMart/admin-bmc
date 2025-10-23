'use client';

import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const DocumentUpload = () => {
  const form={
    employee: '',
    documentType: '',
    documentNumber: '',
    image: '',
    notes: '',
  };

  const handleChange = () => {};
  const [openEmployee, setOpenEmployee] = useState(false);
  const [valueEmployee, setValueEmployee] = useState('');
  const [openDoc, setOpenDoc] = useState(false);
  const [valueDoc, setValueDoc] = useState('');

  const frameworks = [
    { value: 'type1', label: 'Document Type 1' },
    { value: 'type2', label: 'Document Type 2' },
  ];

  const frameworks1 = [
    { value: 'emp1', label: 'Employee 1' },
    { value: 'emp2', label: 'Employee 2' },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center bg-sidebar p-4">
      <div className="w-full rounded-lg  p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Upload Documennt</p>
          <Link
            href="/employee-management/document-list"
            className="flex cursor-pointer rounded px-3 py-2 text-sm  transition bg-primary text-background"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        {/* Form */}
        <form className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Employee *</label>
            <Popover open={openEmployee} onOpenChange={setOpenEmployee}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openEmployee}
                  className="w-full max-w-full justify-between py-2 focus:ring-2 "
                >
                  {valueEmployee ? frameworks1.find((f) => f.value === valueEmployee)?.label : 'Select Employee'}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>

              {/* ✅ Perfectly aligned and responsive content */}
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                <Command>
                  <CommandInput placeholder="Search employee..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No employee found.</CommandEmpty>
                    <CommandGroup>
                      {frameworks1.map((f) => (
                        <CommandItem
                          key={f.value}
                          value={f.value}
                          onSelect={(currentValue) => {
                            setValueEmployee(currentValue === valueEmployee ? '' : currentValue);
                            setOpenEmployee(false);
                          }}
                        >
                          {f.label}
                          <Check className={cn('ml-auto', valueEmployee === f.value ? 'opacity-100' : 'opacity-0')} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium">Document Type *</label>
            <Popover open={openDoc} onOpenChange={setOpenDoc}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openDoc}
                  className="w-full max-w-full justify-between py-2 focus:ring-2 focus:ring-orange-500"
                >
                  {valueDoc ? frameworks.find((f) => f.value === valueDoc)?.label : 'Select Document'}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>

              {/* ✅ PopoverContent matches button width */}
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                <Command>
                  <CommandInput placeholder="Search document..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No document found.</CommandEmpty>
                    <CommandGroup>
                      {frameworks.map((f) => (
                        <CommandItem
                          key={f.value}
                          // ✅ Remove `value` prop (not needed)
                          onSelect={() => {
                            setValueDoc(f.value === valueDoc ? '' : f.value);
                            setOpenDoc(false);
                          }}
                        >
                          {/* ✅ Text here makes it searchable */}
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
            <label className="block text-sm font-medium">Document Number *</label>
            <input
              type="text"
              name="documentNumber"
              value={form.documentNumber}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-1.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Image *</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Notes</label>
            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="mt-5 rounded-sm bg-primary text-background px-20 py-2 transition "
            >
              upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUpload;
