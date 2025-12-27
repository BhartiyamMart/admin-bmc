'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, ChevronDown, Check, Plus, Trash2, CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { createCoupon } from '@/apis/create-coupon.api';
import { createPreassignedUrl } from '@/apis/create-banners.api'; // Ensure this is exported
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandList, CommandItem } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CouponForm {
  code: string;
  title: string;
  description: string;
  type: 'PERCENT' | 'FIXED';
  discountValue: number;
  currentUsageCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  expiryType: 'FIXED' | 'RELATIVE';
  validFrom: Date;
  validUntil: Date | undefined;
  relativeDays: number | undefined;
  targetNewUsers: boolean;
  targetExistingUsers: boolean;
  eligibleCities: string[];
  eligibleUserTypes: string[];
  isAutoApplied: boolean;
  bannerImage: string;
  couponImage: string;
  termsAndConditions: string;
}

export default function AddCoupon() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [form, setForm] = useState<CouponForm>({
    code: '',
    title: '',
    description: '',
    type: 'PERCENT',
    discountValue: 0,
    currentUsageCount: 0,
    status: 'ACTIVE',
    expiryType: 'FIXED',
    validFrom: new Date(),
    validUntil: undefined,
    relativeDays: undefined,
    targetNewUsers: false,
    targetExistingUsers: true,
    eligibleCities: [],
    eligibleUserTypes: ['CUSTOMER'],
    isAutoApplied: false,
    bannerImage: '',
    couponImage: '',
    termsAndConditions: '',
  });

  const formatDateForAPI = (date: Date | undefined) => (date ? format(date, 'dd-MM-yyyy') : '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') return;
    const val =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    e.target.value = '';
  };

  // ✅ Preassigned URL + S3 Upload Logic
  const uploadToS3 = async (file: File): Promise<string> => {
    const fileName = `coupon-${Date.now()}-${file.name}`;
    const fileType = file.type;

    const response = await createPreassignedUrl({ fileName, fileType });
    if (response.error || !response.payload) throw new Error('Failed to get upload URL');

    const { presignedUrl, fileUrl } = response.payload;
    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': fileType },
    });

    if (!uploadRes.ok) throw new Error('S3 Upload Failed');
    return fileUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      let finalImageUrl = form.couponImage;

      // 1. Upload image if selected
      if (selectedFile) {
        finalImageUrl = await uploadToS3(selectedFile);
      }

      // 2. Prepare payload
      const payload: any = {
        ...form,
        couponImage: finalImageUrl,
        validFrom: formatDateForAPI(form.validFrom),
        validUntil: formatDateForAPI(form.validUntil),
        status: form.status === 'ACTIVE',
        description: [form.description.trim()],
        termsAndConditions: [form.termsAndConditions.trim()],
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
      <div className="bg-sidebar w-full overflow-y-auto rounded p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <h2 className="text-lg font-semibold">Add Coupon</h2>
          <Link
            href="/offers/coupon-list"
            className="bg-primary text-primary-foreground flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm transition hover:opacity-90"
          >
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Code, Title, Type */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Code</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                className="focus:outline-primary mt-1 w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="focus:outline-primary mt-1 w-full rounded border px-3 py-2"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Type</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="mt-1 w-full cursor-pointer justify-between font-normal">
                    {form.type === 'PERCENT' ? 'Percentage' : 'Fixed Amount'}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                  <Command>
                    <CommandList>
                      <CommandItem
                        className="cursor-pointer"
                        onSelect={() => setForm((p) => ({ ...p, type: 'PERCENT' }))}
                      >
                        Percentage{' '}
                        <Check
                          className={cn('ml-auto h-4 w-4', form.type === 'PERCENT' ? 'opacity-100' : 'opacity-0')}
                        />
                      </CommandItem>
                      <CommandItem
                        className="cursor-pointer"
                        onSelect={() => setForm((p) => ({ ...p, type: 'FIXED' }))}
                      >
                        Fixed Amount{' '}
                        <Check className={cn('ml-auto h-4 w-4', form.type === 'FIXED' ? 'opacity-100' : 'opacity-0')} />
                      </CommandItem>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Row 2: Large Image Area */}
          <div className="md:col-span-3">
            <label className="mb-1 block text-sm font-medium">
              Coupon Banner <span className="text-red-500">*</span>
            </label>
            <input type="file" id="couponImage" onChange={handleImageChange} className="hidden" accept="image/*" />
            <label
              htmlFor="couponImage"
              className="group hover:border-primary bg-muted/30 relative flex h-52 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-all"
            >
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview" fill className="object-contain p-4" unoptimized />
              ) : (
                <div className="text-muted-foreground group-hover:text-primary flex flex-col items-center gap-2">
                  <Plus className="h-8 w-8" />
                  <span className="text-sm font-light">Upload large banner</span>
                </div>
              )}
            </label>
          </div>

          {/* Row 3: Status, Usage, Expiry Type */}
          <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Status</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="mt-1 w-full cursor-pointer justify-between font-normal">
                    {form.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                  <Command>
                    <CommandList>
                      <CommandItem
                        className="cursor-pointer"
                        onSelect={() => setForm((p) => ({ ...p, status: 'ACTIVE' }))}
                      >
                        Active{' '}
                        <Check
                          className={cn('ml-auto h-4 w-4', form.status === 'ACTIVE' ? 'opacity-100' : 'opacity-0')}
                        />
                      </CommandItem>
                      <CommandItem
                        className="cursor-pointer"
                        onSelect={() => setForm((p) => ({ ...p, status: 'INACTIVE' }))}
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
            <div>
              <label className="text-sm font-medium">Usage Count</label>
              <input
                type="number"
                name="currentUsageCount"
                value={form.currentUsageCount}
                onChange={handleChange}
                className="mt-1 w-full [appearance:textfield] rounded border px-3 py-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Expiry Type</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="mt-1 w-full cursor-pointer justify-between font-normal">
                    {form.expiryType === 'FIXED' ? 'Fixed Date' : 'Relative Days'}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                  <Command>
                    <CommandList>
                      <CommandItem
                        className="cursor-pointer"
                        onSelect={() => setForm((p) => ({ ...p, expiryType: 'FIXED' }))}
                      >
                        Fixed Date{' '}
                        <Check
                          className={cn('ml-auto h-4 w-4', form.expiryType === 'FIXED' ? 'opacity-100' : 'opacity-0')}
                        />
                      </CommandItem>
                      <CommandItem
                        className="cursor-pointer"
                        onSelect={() => setForm((p) => ({ ...p, expiryType: 'RELATIVE' }))}
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
          </div>

          {/* Row 4: Dates & Discount */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Valid From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="mt-1 w-full cursor-pointer justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.validFrom ? format(form.validFrom, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.validFrom}
                    onSelect={(d) => setForm((p) => ({ ...p, validFrom: d || new Date() }))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {form.expiryType === 'FIXED' ? (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Valid Until</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="mt-1 w-full cursor-pointer justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.validUntil ? format(form.validUntil, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.validUntil}
                      onSelect={(d) => setForm((p) => ({ ...p, validUntil: d }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium">Relative Days</label>
                <input
                  type="number"
                  name="relativeDays"
                  value={form.relativeDays || ''}
                  onChange={handleChange}
                  className="mt-1 w-full rounded border px-3 py-2"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Discount Value</label>
              <input
                type="number"
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          {/* Row 5: Text Areas */}
          <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Terms & Conditions</label>
              <textarea
                name="termsAndConditions"
                value={form.termsAndConditions}
                onChange={handleChange}
                rows={3}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap items-center gap-6 border-t pt-4">
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

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground flex w-full cursor-pointer items-center justify-center gap-2 rounded py-2 transition-all hover:opacity-90 disabled:opacity-50 md:w-[320px]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Coupon'}
          </button>
        </form>
      </div>
    </div>
  );
}
