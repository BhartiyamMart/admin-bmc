'use client';

import React, { useState } from 'react';
import { Switch } from '@radix-ui/react-switch';
import { Check, ChevronLeft, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function CreateOrder() {
  const [form, setForm] = useState({
    phone: '',
    name: '',
    address: '',
    paymentMethod: '',
    is_express: false,
    timeSlot: '',
    date: '',
    offers: '',
    coupons: '',
    instructions: '',
  });

  const [openEmployee, setOpenEmployee] = useState(false);
  const [valueEmployee, setValueEmployee] = useState('');

  const [openDoc, setOpenDoc] = useState(false);
  const [valueDoc, setValueDoc] = useState('');

  const [openCoupon, setOpenCoupon] = useState(false);
  const [valueCoupon, setValueCoupon] = useState('');

  const frameworks = [
    { value: 'type1', label: 'Document Type 1' },
    { value: 'type2', label: 'Document Type 2' },
  ];

  const frameworks1 = [
    { value: 'emp1', label: 'Employee 1' },
    { value: 'emp2', label: 'Employee 2' },
  ];

  const frameworks2 = [
    { value: 'emp1', label: 'Employee 1' },
    { value: 'emp2', label: 'Employee 2' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log('Form Submitted:', form);
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="max-h-[89vh] w-full overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Create Order</p>
          <Link
            href="/orders/order-list"
            className="flex cursor-pointer rounded bg-orange-400 px-3 py-2 text-sm text-white transition hover:bg-orange-500"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Phone Number *</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Payment Method</label>
            <select name="paymentMethod" required className="w-full rounded border px-3 py-2">
              <option value="">select payment method</option>
              <option value="stripe">Stripe</option>
              <option value="rozorpay">Pozorpay</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Time Slot</label>
            <select name="timeSlot" className="w-full rounded border px-3 py-2">
              <option value="">select time slot</option>
              <option value="stripe">12:20</option>
              <option value="rozorpay">1:20</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Estimated Delivery Date *</label>
            <input
              type="date"
              name="date"
              value={form.date || ''}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Products *</label>
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
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                <Command>
                  <CommandInput placeholder="Search document..." className="h-9" />
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
            <label className="mb-1 block text-sm font-medium">Offers *</label>
            <Popover open={openEmployee} onOpenChange={setOpenEmployee}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openEmployee}
                  className="w-full max-w-full justify-between py-2 focus:ring-2 focus:ring-orange-500"
                >
                  {valueEmployee ? frameworks1.find((f) => f.value === valueEmployee)?.label : 'Select Employee'}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
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
            <label className="mb-1 block text-sm font-medium">Coupons *</label>
            <Popover open={openCoupon} onOpenChange={setOpenCoupon}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCoupon}
                  className="w-full max-w-full justify-between py-2 focus:ring-2 focus:ring-orange-500"
                >
                  {valueCoupon ? frameworks2.find((f) => f.value === valueCoupon)?.label : 'Select Document'}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2">
                <Command>
                  <CommandInput placeholder="Search document..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No document found.</CommandEmpty>
                    <CommandGroup>
                      {frameworks2.map((f) => (
                        <CommandItem
                          key={f.value}
                          value={f.value}
                          onSelect={(currentValue) => {
                            setValueCoupon(currentValue === valueCoupon ? '' : currentValue);
                            setOpenCoupon(false);
                          }}
                        >
                          {f.label}
                          <Check className={cn('ml-auto', valueCoupon === f.value ? 'opacity-100' : 'opacity-0')} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium">Instructions</label>
            <input
              type="text"
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <div className="mt-7 flex items-center justify-between">
              <label htmlFor="is_express" className="block text-sm font-medium">
                is_express
              </label>
              <Switch
                id="is_express"
                checked={form.is_express}
                required
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_express: checked }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.is_express ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.is_express ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </Switch>
            </div>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="mt-5 rounded-sm bg-orange-400 px-20 py-2 text-white transition hover:bg-orange-500"
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
