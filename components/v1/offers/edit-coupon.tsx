'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { startOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, Loader2, ChevronDown, Check, Plus, Trash2, CalendarIcon } from 'lucide-react';
import { Command, CommandList, CommandItem } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { createPreassignedUrl } from '@/apis/create-banners.api';
import { cn } from '@/lib/utils';
import { getCouponById, updateCoupon } from '@/apis/create-coupon.api';

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
    discountUnit: 'PERCENT';        // only percentage
    maxDiscountValue: number;
    minPurchaseAmount: number;
    minQuantity: number;
    usagePerPerson: number;
    createdAt: Date;
    updatedAt: Date;
}

export default function EditCoupon() {
    const router = useRouter();
    const today = startOfDay(new Date());
    const { id } = useParams<{ id: string }>();
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
        discountUnit: 'PERCENT',
        maxDiscountValue: 0,
        minPurchaseAmount: 0,
        minQuantity: 1,
        usagePerPerson: 1,

        createdAt: new Date(),
        updatedAt: new Date(),
    });
    const formatDateTime = (date?: Date) =>
        date ? format(date, 'dd-MM-yyyy || hh:mm a') : '';


    const formatDateForAPI = (date: Date | undefined) =>
        date ? format(date, 'dd-MM-yyyy') : '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'file') return;
        const val =
            type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : type === 'number'
                    ? Number(value)
                    : value;
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

    const uploadToS3 = async (file: File) => {
        const fileName = `coupon-${Date.now()}-${file.name}`;
        const { payload } = await createPreassignedUrl({
            fileName,
            fileType: file.type,
        });

        await fetch(payload.presignedUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
        });

        return payload.fileUrl;
    };
    const DateTimePicker = ({
        label,
        value,
        onChange,
        disabled = false,
        minDate,
    }: {
        label: string;
        value?: Date;
        onChange: (d: Date) => void;
        disabled?: boolean;
        minDate?: Date;
    }) => (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">{label}</label>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={disabled}
                        className="w-full justify-start text-left font-normal disabled:cursor-not-allowed"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(value, 'dd-MM-yyyy || hh:mm a') : 'Pick date & time'}
                    </Button>
                </PopoverTrigger>

                {!disabled && (
                    <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
                        <Calendar
                            mode="single"
                            selected={value}
                            disabled={(date) =>
                                minDate ? date < startOfDay(minDate) : false
                            }
                            onSelect={(d) => d && onChange(d)}
                        />


                        <input
                            type="time"
                            onClick={(e) => e.currentTarget.showPicker()}
                            className="mt-2 w-full cursor-pointer rounded border px-2 py-1"
                            onChange={(e) => {
                                if (!value) return;
                                const [h, m] = e.target.value.split(':');
                                const updated = new Date(value);
                                updated.setHours(+h, +m);
                                onChange(updated);
                            }}
                        />
                    </PopoverContent>
                )}
            </Popover>
        </div>
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        try {
            setLoading(true);

            const now = new Date();

            const payload = {
                id,
                code: form.code.trim(),
                title: form.title.trim(),
                description: form.description.trim(),
                type: form.type,
                discountValue: form.discountValue,
                status: String(form.status),
                expiryType: form.expiryType,
                validFrom: format(form.validFrom, 'dd-MM-yyyy'),
                validUntil:
                    form.expiryType === 'FIXED' && form.validUntil
                        ? format(form.validUntil, 'dd-MM-yyyy')
                        : '',
                relativeDays: form.expiryType === 'RELATIVE' ? form.relativeDays ?? 0 : 0,
                targetNewUsers: form.targetNewUsers,
                targetExistingUsers: form.targetExistingUsers,
                eligibleCities: [],
                eligibleUserTypes: [],
                isAutoApplied: form.isAutoApplied,
                termsAndConditions: form.termsAndConditions.trim(),
                discountUnit: 'PERCENT',
                maxDiscountValue: form.maxDiscountValue,
                minPurchaseAmount: form.minPurchaseAmount,
                minQuantity: form.minQuantity,
                usagePerPerson: form.usagePerPerson,

                createdAt: formatDateTime(form.createdAt),
                updatedAt: formatDateTime(now),
            };

            const response = await updateCoupon(payload);
            if (!response.error) {
                toast.success('Coupon updated successfully');
                router.push('/offers/coupon-list');
            } else {
                toast.error(response.message || 'Update failed');
            }
        } catch (error) {
            toast.error('Something went wrong while updating coupon');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!id) return;

        const fetchCouponById = async () => {
            try {
                setLoading(true);
                const response = await getCouponById(id);

                if (!response.error && response.payload) {
                    const coupon = response.payload as any;

                    setForm((prev) => ({
                        ...prev,

                        code: coupon.code ?? '',
                        title: coupon.title ?? '',
                        description: coupon.description ?? '',
                        type: (coupon.type ?? 'PERCENT') as 'PERCENT' | 'FIXED',
                        discountValue: coupon.discountValue ?? 0,
                        currentUsageCount: coupon.currentUsageCount ?? 0,
                        status: (coupon.status ?? 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
                        expiryType: (coupon.expiryType ?? 'FIXED') as 'FIXED' | 'RELATIVE',

                        validFrom: coupon.validFrom
                            ? new Date(coupon.validFrom)
                            : prev.validFrom,

                        validUntil: coupon.validUntil
                            ? new Date(coupon.validUntil)
                            : undefined,

                        relativeDays: coupon.relativeDays ?? undefined,

                        targetNewUsers: coupon.targetNewUsers ?? false,
                        targetExistingUsers: coupon.targetExistingUsers ?? false,
                        isAutoApplied: coupon.isAutoApplied ?? false,

                        termsAndConditions: coupon.termsAndConditions ?? '',

                        // 🔹 New fields added earlier
                        discountUnit: 'PERCENT',
                        maxDiscountValue: coupon.maxDiscountValue ?? 0,
                        minPurchaseAmount: coupon.minPurchaseAmount ?? 0,
                        minQuantity: coupon.minQuantity ?? 1,
                        usagePerPerson: coupon.usagePerPerson ?? 1,

                        createdAt: coupon.createdAt
                            ? new Date(coupon.createdAt)
                            : prev.createdAt,

                        updatedAt: coupon.updatedAt
                            ? new Date(coupon.updatedAt)
                            : prev.updatedAt,
                    }));

                } else {
                    toast.error(response.message || 'Failed to load coupon');
                }
            } catch (err) {
                toast.error('Failed to fetch coupon details');
            } finally {
                setLoading(false);
            }
        };

        fetchCouponById();
    }, [id]);


    return (
        <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
            <div className="bg-sidebar w-full overflow-y-auto rounded p-4 shadow-lg">
                <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
                    <h2 className="text-lg font-semibold">Edit Coupon</h2>
                    <Link
                        href="/offers/coupon-list"
                        className="bg-primary text-primary-foreground flex cursor-pointer items-center gap-2 rounded px-3 py-1.25 text-sm transition hover:opacity-90"
                    >
                        <ChevronLeft className="h-4 w-4" /> Back to List
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className='border p-4'>

                        {/* Row 1: Code, Title, Type */}
                        <div className="grid grid-cols-1 gap-4  sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="text-sm font-medium">Code</label>
                                <input
                                    name="code"
                                    value={form.code}
                                    onChange={handleChange}
                                    required
                                    className="focus:outline-primary mt-1 w-full rounded border px-3 py-1.25"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Title</label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                    className="focus:outline-primary mt-1 w-full rounded border px-3 py-1.25"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Type</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className=" w-full cursor-pointer justify-between font-normal">
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
                                                    <Check
                                                        className={cn('ml-auto h-4 w-4', form.type === 'FIXED' ? 'opacity-100' : 'opacity-0')}
                                                    />
                                                </CommandItem>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>



                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            <div className='mt-2'>
                                <label className="text-sm font-medium">Discount Value</label>
                                <div className="relative">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={form.discountValue}
                                            readOnly
                                            tabIndex={-1}
                                            onKeyDown={(e) => e.preventDefault()}
                                            onPaste={(e) => e.preventDefault()}
                                            className="w-full  rounded border bg-muted px-3 py-1.25 pr-9"
                                        />
                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        discountValue: p.discountValue + 1,
                                                    }))
                                                }
                                                className="flex cursor-pointer h-4 w-6 items-center justify-center rounded hover:bg-muted"
                                            >
                                                ▲
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setForm((p) => ({
                                                        ...p,
                                                        discountValue: Math.max(0, p.discountValue - 1),
                                                    }))
                                                }
                                                disabled={form.discountValue <= 0}
                                                className="flex cursor-pointer h-4 w-6 items-center justify-center rounded hover:bg-muted disabled:opacity-50"
                                            >
                                                ▼
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='mt-2'>
                                <label className="text-sm font-medium">Max Discount Value</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={form.maxDiscountValue}
                                        readOnly
                                        tabIndex={-1}
                                        onKeyDown={(e) => e.preventDefault()}
                                        onPaste={(e) => e.preventDefault()}
                                        className="w-full  rounded border bg-muted px-3 py-1.25 pr-9"
                                    />

                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setForm((p) => ({
                                                    ...p,
                                                    maxDiscountValue: p.maxDiscountValue + 1,
                                                }))
                                            }
                                            className="flex h-4 w-6 items-center justify-center rounded hover:bg-muted"
                                        >
                                            ▲
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setForm((p) => ({
                                                    ...p,
                                                    maxDiscountValue: Math.max(0, p.maxDiscountValue - 1),
                                                }))
                                            }
                                            disabled={form.maxDiscountValue <= 0}
                                            className="flex h-4 w-6 items-center justify-center rounded hover:bg-muted disabled:opacity-50"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className='mt-2'>
                                <label className="text-sm font-medium">Min Purchase Amount</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={form.minPurchaseAmount}
                                        readOnly
                                        tabIndex={-1}
                                        onKeyDown={(e) => e.preventDefault()}
                                        onPaste={(e) => e.preventDefault()}
                                        className="w-full  rounded border bg-muted px-3 py-1.25 pr-9"
                                    />

                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setForm((p) => ({
                                                    ...p,
                                                    minPurchaseAmount: p.minPurchaseAmount + 1,
                                                }))
                                            }
                                            className="flex cursor-pointer h-4 w-6 items-center justify-center rounded hover:bg-muted"
                                        >
                                            ▲
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setForm((p) => ({
                                                    ...p,
                                                    minPurchaseAmount: Math.max(0, p.minPurchaseAmount - 1),
                                                }))
                                            }
                                            disabled={form.minPurchaseAmount <= 0}
                                            className="flex cursor-pointer h-4 w-6 items-center justify-center rounded hover:bg-muted disabled:opacity-50"
                                        >
                                            ▼
                                        </button>
                                    </div>

                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Min Quantity</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={form.minQuantity}
                                        readOnly
                                        tabIndex={-1}
                                        onKeyDown={(e) => e.preventDefault()}
                                        onPaste={(e) => e.preventDefault()}
                                        className="w-full  rounded border bg-muted px-3 py-1.25 pr-9"
                                    />

                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setForm((p) => ({
                                                    ...p,
                                                    minQuantity: p.minQuantity + 1,
                                                }))
                                            }
                                            className="flex cursor-pointer h-4 w-6 items-center justify-center rounded hover:bg-muted"
                                        >
                                            ▲
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setForm((p) => ({
                                                    ...p,
                                                    minQuantity: Math.max(0, p.minQuantity - 1),
                                                }))
                                            }
                                            disabled={form.minQuantity <= 0}
                                            className="flex cursor-pointer h-4 w-6 items-center justify-center rounded hover:bg-muted disabled:opacity-50"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className='w-full bg-sidebar border  py-6 px-6'>

                        <div className='grid pt-2 gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
                            <DateTimePicker
                                label="Valid From"
                                value={form.validFrom}
                                minDate={new Date()}
                                onChange={(d) =>
                                    setForm((p) => ({
                                        ...p,
                                        validFrom: d,
                                        validUntil: undefined,
                                    }))
                                }
                            />
                            <DateTimePicker
                                label="Valid Until"
                                value={form.validUntil}
                                disabled={!form.validFrom}
                                minDate={
                                    form.validFrom
                                        ? new Date(form.validFrom.getTime() + 24 * 60 * 60 * 1000)
                                        : undefined
                                }
                                onChange={(d) => setForm((p) => ({ ...p, validUntil: d }))}
                            />

                            <DateTimePicker
                                label="Created At"
                                value={form.createdAt}
                                onChange={(d) => setForm((p) => ({ ...p, createdAt: d }))}
                            />

                            <DateTimePicker
                                label="Updated At"
                                value={form.updatedAt}
                                onChange={(d) => setForm((p) => ({ ...p, updatedAt: d }))}
                            />
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Expiry Type</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full cursor-pointer justify-between font-normal">
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
                                                        className={cn(
                                                            'ml-auto h-4 w-4',
                                                            form.expiryType === 'FIXED' ? 'opacity-100' : 'opacity-0'
                                                        )}
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

                            <div>
                                <label className="text-sm font-medium">Relative Days</label>
                                <input
                                    type="number"
                                    name="relativeDays"
                                    value={form.relativeDays || ''}
                                    onChange={handleChange}
                                    className="w-full rounded border px-3 py-1.25"
                                />
                            </div>
                        </div>
                    </div>
                    <div className='border p-4'>
                        {/* Row 3: Status, Usage, Expiry Type */}
                        <div className="grid grid-cols-1 gap-4  sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">Status</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full cursor-pointer justify-between px-3 py-1.25 font-normal">
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
                                <label className="text-sm font-medium">Usage Per Person</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={form.usagePerPerson}
                                        readOnly
                                        tabIndex={-1}
                                        onKeyDown={(e) => e.preventDefault()}
                                        onPaste={(e) => e.preventDefault()}
                                        className="w-full  rounded border bg-muted px-3 py-1.25 pr-9"
                                    />

                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setForm((p) => ({
                                                    ...p,
                                                    usagePerPerson: p.usagePerPerson + 1,
                                                }))
                                            }
                                            className="flex cursor-pointer h-4 w-6 items-center justify-center rounded hover:bg-muted"
                                        >
                                            ▲
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setForm((p) => ({
                                                    ...p,
                                                    usagePerPerson: Math.max(0, p.usagePerPerson - 1),
                                                }))
                                            }
                                            disabled={form.usagePerPerson <= 0}
                                            className="flex cursor-pointer h-4 w-6 items-center justify-center rounded hover:bg-muted disabled:opacity-50"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="gap-1">
                                <label className="text-sm font-medium">Usage Count</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={form.currentUsageCount}
                                        readOnly
                                        tabIndex={-1}
                                        onKeyDown={(e) => e.preventDefault()}
                                        onPaste={(e) => e.preventDefault()}
                                        className="w-full  rounded border bg-muted px-3 py-1.25 pr-9"
                                    />

                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setForm((p) => ({
                                                    ...p,
                                                    currentUsageCount: p.currentUsageCount + 1,
                                                }))
                                            }
                                            className="flex cursor-pointer h-4 w-6 items-center justify-center rounded hover:bg-muted"
                                        >
                                            ▲
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setForm((p) => ({
                                                    ...p,
                                                    currentUsageCount: Math.max(0, p.currentUsageCount - 1),
                                                }))
                                            }
                                            disabled={form.currentUsageCount <= 0}
                                            className="flex cursor-pointer h-4 w-6 items-center justify-center rounded hover:bg-muted disabled:opacity-50"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                </div>
                            </div>





                        </div>


                        {/* Row 5: Text Areas */}
                        <div className="grid grid-cols-1 pt-2 gap-4 md:grid-cols-2">
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
                        <div className="flex flex-wrap items-center gap-6 pt-2 ">
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
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Coupon'}
                    </button>
                </form>
            </div>
        </div>
    );
}
