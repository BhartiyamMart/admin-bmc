'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, ChevronDown, Check, Trash2, CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { createCoupon } from '@/apis/create-coupon.api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandList, CommandItem } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { startOfDay, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CouponForm {
  code: string;
  title: string;
  description: string;
  type: 'PERCENT' | 'FIXED';
  discountValue: number;
  discountUnit: 'PERCENTAGE' | 'FIXED' | 'FLAT';
  maxDiscountValue: number;
  minPurchaseAmount: number;
  minQuantity: number;
  usagePerPerson: number;
  currentUsageCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  expiryType: 'FIXED' | 'RELATIVE';
  validFrom: Date;
  validUntil: Date | undefined;
  relativeDays: number | undefined;
  targetNewUsers: boolean;
  targetExistingUsers: boolean;
  isAutoApplied: boolean;
  termsAndConditions: string;
}

export default function AddCoupon() {
  const today = startOfDay(new Date());
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<CouponForm>({
    code: '',
    title: '',
    description: '',
    type: 'PERCENT',
    discountValue: 0,
    discountUnit: 'PERCENTAGE',
    maxDiscountValue: 0,
    minPurchaseAmount: 0,
    minQuantity: 0,
    usagePerPerson: 0,
    currentUsageCount: 0,
    status: 'ACTIVE',
    expiryType: 'FIXED',
    validFrom: new Date(),
    validUntil: undefined,
    relativeDays: undefined,
    targetNewUsers: false,
    targetExistingUsers: true,
    isAutoApplied: false,
    termsAndConditions: '',
  });

  // Popover open states
  const [openPopovers, setOpenPopovers] = useState({
    status: false,
    type: false,
    discountUnit: false,
    expiryType: false,
    validFrom: false,
    validUntil: false,
  });

  const togglePopover = (key: keyof typeof openPopovers, isOpen: boolean) => {
    setOpenPopovers((prev) => ({ ...prev, [key]: isOpen }));
  };

  const formatDateForAPI = (date?: Date) => {
    if (!date) return undefined;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Calculate Relative Days automatically
  React.useEffect(() => {
    if (form.validFrom && form.validUntil) {
      const diff = differenceInDays(form.validUntil, form.validFrom);
      setForm(prev => ({ ...prev, relativeDays: diff > 0 ? diff : 0 }));
    }
  }, [form.validFrom, form.validUntil]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Prevent non-numeric for number types
    if (type === 'number') {
      if (value === '') {
        setForm((prev) => ({ ...prev, [name]: '' }));
        return;
      }
      const numVal = Number(value);
      if (isNaN(numVal) || numVal < 0) return;
      setForm((prev) => ({ ...prev, [name]: numVal }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload: any = {
        ...form,
        validFrom: formatDateForAPI(form.validFrom),
        validUntil: formatDateForAPI(form.validUntil),
        createdAt: new Date().toISOString(),
        status: form.status === 'ACTIVE',
        description: [form.description.trim()],
        termsAndConditions: [form.termsAndConditions.trim()],
        type: form.discountUnit === 'PERCENTAGE' ? 'PERCENT' : 'FIXED',
      };

      const response = await createCoupon(payload);
      if (response?.error) throw new Error(response.message);

      toast.success('Coupon created!');
      router.push('/offers/coupon-list');
    } catch (err: any) {
      toast.error(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <h2 className="text-lg font-semibold">Add Coupon</h2>
          <Link
            href="/offers/coupon-list"
            className="bg-primary text-primary-foreground flex cursor-pointer items-center gap-2 rounded px-3 py-1.25 text-sm transition hover:opacity-90"
          >
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BLOCK 1: General Info & Discount */}
          <div className='w-full bg-sidebar border shadow-sm py-6 px-6'>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* 1. Code */}
              <div>
                <label className="text-sm font-medium">Code</label>
                <input
                  name="code"
                  placeholder='Enter coupon code..'
                  value={form.code}
                  onChange={handleChange}
                  required
                  className="focus:outline-primary mt-1 w-full rounded border px-3 py-1.25"
                />
              </div>
              {/* 2. Title */}
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  name="title"
                  placeholder='Enter coupon title..'
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="focus:outline-primary mt-1 w-full rounded border px-3 py-1.25"
                />
              </div>
              {/* 3. Status */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Status</label>
                <Popover
                  open={openPopovers.status}
                  onOpenChange={(isOpen) => togglePopover('status', isOpen)}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="mt-1 w-full cursor-pointer justify-between font-normal">
                      {form.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandList>
                        <CommandItem
                          className="cursor-pointer"
                          onSelect={() => {
                            setForm((p) => ({ ...p, status: 'ACTIVE' }));
                            togglePopover('status', false);
                          }}
                        >
                          Active{' '}
                          <Check
                            className={cn('ml-auto h-4 w-4', form.status === 'ACTIVE' ? 'opacity-100' : 'opacity-0')}
                          />
                        </CommandItem>
                        <CommandItem
                          className="cursor-pointer"
                          onSelect={() => {
                            setForm((p) => ({ ...p, status: 'INACTIVE' }));
                            togglePopover('status', false);
                          }}
                        >
                          Inactive{' '}
                          <Check
                            className={cn('ml-auto h-4 w-4', form.status === 'INACTIVE' ? 'opacity-100' : 'opacity-0')}
                          />
                        </CommandItem>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* 4. Type */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Type</label>
                <Popover
                  open={openPopovers.type}
                  onOpenChange={(isOpen) => togglePopover('type', isOpen)}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="mt-1 w-full cursor-pointer justify-between font-normal">
                      {form.type === 'PERCENT' ? 'Percentage' : 'Fixed Amount'}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandList>
                        <CommandItem
                          className="cursor-pointer"
                          onSelect={() => {
                            setForm((p) => ({ ...p, type: 'PERCENT', discountUnit: 'PERCENTAGE' }));
                            togglePopover('type', false);
                          }}
                        >
                          Percentage{' '}
                          <Check
                            className={cn('ml-auto h-4 w-4', form.type === 'PERCENT' ? 'opacity-100' : 'opacity-0')}
                          />
                        </CommandItem>
                        <CommandItem
                          className="cursor-pointer"
                          onSelect={() => {
                            setForm((p) => ({ ...p, type: 'FIXED', discountUnit: 'FIXED' }));
                            togglePopover('type', false);
                          }}
                        >
                          Fixed Amount{' '}
                          <Check className={cn('ml-auto h-4 w-4', form.type === 'FIXED' ? 'opacity-100' : 'opacity-0')} />
                        </CommandItem>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* 5. Discount Unit */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Discount Unit</label>
                <Popover
                  open={openPopovers.discountUnit}
                  onOpenChange={(isOpen) => togglePopover('discountUnit', isOpen)}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="mt-1 w-full cursor-pointer justify-between font-normal">
                      {form.discountUnit}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandList>
                        {(form.type === 'PERCENT' ? ['PERCENTAGE'] : ['FIXED', 'FLAT']).map((unit) => (
                          <CommandItem
                            key={unit}
                            className="cursor-pointer"
                            onSelect={() => {
                              setForm((p) => ({ ...p, discountUnit: unit as any }));
                              togglePopover('discountUnit', false);
                            }}
                          >
                            {unit}
                            <Check className={cn('ml-auto h-4 w-4', form.discountUnit === unit ? 'opacity-100' : 'opacity-0')} />
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* 6. Discount Value */}
              <div>
                <label className="text-sm font-medium">Discount Value</label>
                <input
                  type="number"
                  name="discountValue"
                  min={0}
                  value={form.discountValue === 0 ? '' : form.discountValue}
                  onChange={handleChange}
                  placeholder="Enter discount value"
                  className="focus:outline-primary mt-1 w-full rounded border px-3 py-1.25"
                  onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                />
              </div>

              {/* 7. Max Discount Value */}
              <div>
                <label className="text-sm font-medium">Max Discount Value</label>
                <input
                  type="number"
                  name="maxDiscountValue"
                  min={0}
                  value={form.maxDiscountValue === 0 ? '' : form.maxDiscountValue}
                  onChange={handleChange}
                  placeholder="Enter max discount value"
                  className="focus:outline-primary mt-1 w-full rounded border px-3 py-1.25"
                  onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                />
              </div>
            </div>
          </div>

          {/* BLOCK 2: Usage & Dates */}
          <div className='w-full bg-sidebar border shadow-sm py-6 px-6'>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* 1. Min Purchase Amount */}
              <div>
                <label className="text-sm font-medium">Min Purchase Amount</label>
                <input
                  type="number"
                  name="minPurchaseAmount"
                  min={0}
                  value={form.minPurchaseAmount === 0 ? '' : form.minPurchaseAmount}
                  onChange={handleChange}
                  placeholder="Enter min purchase amount"
                  className="focus:outline-primary mt-1 w-full rounded border px-3 py-1.25"
                  onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                />
              </div>

              {/* 2. Min Quantity */}
              <div>
                <label className="text-sm font-medium">Min Quantity</label>
                <input
                  type="number"
                  name="minQuantity"
                  min={1}
                  value={form.minQuantity === 0 ? '' : form.minQuantity}
                  onChange={handleChange}
                  placeholder="Enter min quantity"
                  className="focus:outline-primary mt-1 w-full rounded border px-3 py-1.25"
                  onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                />
              </div>

              {/* 3. Usage Per Person */}
              <div>
                <label className="text-sm font-medium">Usage Per Person</label>
                <input
                  type="number"
                  name="usagePerPerson"
                  min={1}
                  value={form.usagePerPerson === 0 ? '' : form.usagePerPerson}
                  onChange={handleChange}
                  placeholder="Enter usage per person"
                  className="focus:outline-primary mt-1 w-full rounded border px-3 py-1.25"
                  onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                />
              </div>

              {/* 4. Total Usage Limit */}
              <div>
                <label className="text-sm font-medium">Total Usage Limit (Count)</label>
                <input
                  type="number"
                  name="currentUsageCount"
                  min={0}
                  value={form.currentUsageCount === 0 ? '' : form.currentUsageCount}
                  onChange={handleChange}
                  placeholder="Enter total usage limit"
                  className="w-full [appearance:textfield] rounded border px-3 py-1.25 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                />
              </div>

              {/* 5. Expiry Type */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Expiry Type</label>
                <Popover
                  open={openPopovers.expiryType}
                  onOpenChange={(isOpen) => togglePopover('expiryType', isOpen)}
                >
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full cursor-pointer justify-between font-normal">
                      {form.expiryType === 'FIXED' ? 'Fixed Date' : 'Relative Days'}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandList>
                        <CommandItem
                          className="cursor-pointer"
                          onSelect={() => {
                            setForm((p) => ({ ...p, expiryType: 'FIXED' }));
                            togglePopover('expiryType', false);
                          }}
                        >
                          Fixed Date{' '}
                          <Check
                            className={cn('ml-auto h-4 w-4', form.expiryType === 'FIXED' ? 'opacity-100' : 'opacity-0')}
                          />
                        </CommandItem>
                        <CommandItem
                          className="cursor-pointer"
                          onSelect={() => {
                            setForm((p) => ({ ...p, expiryType: 'RELATIVE' }));
                            togglePopover('expiryType', false);
                          }}
                        >
                          Relative Days{' '}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              form.expiryType === 'RELATIVE' ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* 6. Relative Days */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Relative Days</label>
                <input
                  type="number"
                  value={form.relativeDays || 0}
                  readOnly
                  disabled
                  className="w-full rounded border px-3 py-1.25 cursor-not-allowed"
                />
              </div>

              {/* 7. Valid From */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Valid From</label>
                <Popover
                  open={openPopovers.validFrom}
                  onOpenChange={(isOpen) => togglePopover('validFrom', isOpen)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full cursor-pointer justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.validFrom
                        ? format(form.validFrom, 'dd-MM-yyyy')
                        : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.validFrom}
                      disabled={(date) => date < today}
                      onSelect={(d) => {
                        if (!d) return;
                        const now = new Date();
                        d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

                        setForm((p) => {
                          const shouldResetValidUntil =
                            p.validUntil && d > p.validUntil;

                          return {
                            ...p,
                            validFrom: d,
                            validUntil: shouldResetValidUntil ? undefined : p.validUntil,
                          };
                        });
                        togglePopover('validFrom', false);
                      }}

                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* 8. Valid Until */}
              {form.expiryType === 'FIXED' ? (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Valid Until</label>
                  <Popover
                    open={openPopovers.validUntil}
                    onOpenChange={(isOpen) => togglePopover('validUntil', isOpen)}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.validUntil
                          ? format(form.validUntil, 'dd-MM-yyyy')
                          : <span>Pick a date</span>}

                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.validUntil}
                        disabled={(date) => {
                          const minDate = form.validFrom ?? today;
                          return date < minDate;
                        }}
                        onSelect={(d) => {
                          if (!d) return;
                          const now = new Date();
                          d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
                          setForm((p) => ({ ...p, validUntil: d }));
                          togglePopover('validUntil', false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <div></div> /* Empty div to keep grid alignment if needed, or null */
              )}
            </div>
          </div>

          {/* BLOCK 3: Description, Terms, Checkboxes */}
          <div className='w-full bg-sidebar border shadow-sm py-6 px-6'>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 w-full rounded border px-3 py-1.25"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Terms & Conditions</label>
                <textarea
                  name="termsAndConditions"
                  value={form.termsAndConditions}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 w-full rounded border px-3 py-1.25"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap items-center gap-6 border-t mt-4 pt-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="targetNewUsers"
                  checked={form.targetNewUsers}
                  onChange={handleChange}
                  className="h-4 w-4 cursor-pointer"
                />{' '}
                Target New Users
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="targetExistingUsers"
                  checked={form.targetExistingUsers}
                  onChange={handleChange}
                  className="h-4 w-4 cursor-pointer"
                />{' '}
                Target Existing Users
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isAutoApplied"
                  checked={form.isAutoApplied}
                  onChange={handleChange}
                  className="h-4 w-4 cursor-pointer"
                />{' '}
                Auto Apply
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground flex w-full cursor-pointer items-center justify-center gap-2 rounded py-1.25 transition-all hover:opacity-90 disabled:opacity-50 md:w-[320px]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Coupon'}
          </button>
        </form>
      </div>
    </div>
  );
}
