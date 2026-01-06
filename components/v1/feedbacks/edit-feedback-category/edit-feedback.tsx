'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Switch } from '@radix-ui/react-switch';
import { Check, ChevronDown, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// import { getFeedbackCategoryById, updateFeedbackCategory,} from '@/apis/create-time-slot.api';

import { FeedbackCategory } from '@/interface/common.interface';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function EditFeedbackCategory() {
    const { id } = useParams();
    const router = useRouter();

    const [openDropdown, setOpenDropdown] = useState(false);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        categoryName: '',
        categoryCode: '',
        description: '',
        icon: '',
        color: '',
        sortOrder: 1,
        ratingType: '',
        maximumRating: 5,
        labels: '',
        status: true,
    });

    const ratingOptions = [
        { value: 'STAR_RATING', label: 'Star Rating' },
        { value: 'EMOJI_SCALE', label: 'Emoji Scale' },
        { value: 'NUMERIC', label: 'Number Rating' },
        { value: 'THUMBS', label: 'Thumbs Rating' },
    ];

    /* ---------------- Fetch Existing Data ---------------- */
    // useEffect(() => {
    //     if (!id) return;

    //     const fetchCategory = async () => {
    //         try {
    //             const res = "hello";
    //             const data: FeedbackCategory = res.hello;

    //             setForm({
    //                 categoryName: data.categoryName,
    //                 categoryCode: data.categoryCode,
    //                 description: data.description,
    //                 icon: data.icon,
    //                 color: data.color,
    //                 sortOrder: data.sortOrder,
    //                 ratingType: data.ratingType,
    //                 maximumRating: data.maxRating,
    //                 labels: Object.values(data.ratingLabels).join(', '),
    //                 status: data.isActive,
    //             });
    //         } catch (err) {
    //             toast.error('Failed to load feedback category');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchCategory();
    // }, [id]);

    /* ---------------- Handlers ---------------- */
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]:
                name === 'sortOrder' || name === 'maximumRating'
                    ? Number(value)
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const labelArray = form.labels.split(',').map((l) => l.trim());
        const ratingLabels: Record<string, string> = {};
        labelArray.forEach((label, index) => {
            ratingLabels[(index + 1).toString()] = label;
        });

        const payload = {
            categoryName: form.categoryName,
            categoryCode: form.categoryCode,
            description: form.description,
            icon: form.icon,
            color: form.color,
            sortOrder: form.sortOrder,
            ratingType: form.ratingType as any,
            maxRating: form.maximumRating,
            ratingLabels,
            isActive: form.status,
        };

        // try {
        //     await updateFeedbackCategory(id as string, payload);
        //     toast.success('Feedback Category Updated Successfully');
        //     router.push('/feedbacks/feedback-category');
        // } catch {
        //     toast.error('Update failed');
        // }
    };

    if (loading) return <p className="p-4">Loading...</p>;

    return (
        <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
            <div className="bg-sidebar w-full rounded p-4 shadow">
                <div className="mb-4 flex items-center justify-between border-b pb-2">
                    <p className="text-md font-semibold">Edit Feedback Category</p>

                    <Link href="/feedbacks/feedback-category">
                        <Button className="flex items-center gap-2">
                            <ChevronLeft className="h-5 w-5" /> Back
                        </Button>
                    </Link>
                </div>


                <form onSubmit={handleSubmit} >
                    <div className='w-full bg-sidebar border shadow-sm py-6 px-6 my-5 grid grid-cols-1 gap-4 md:grid-cols-3'>

                        {/* Row 1: Core Identification */}
                        <div>
                            <label className="block text-sm font-medium">
                                Category Name<span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="text"
                                name="categoryName"
                                value={form.categoryName}
                                onChange={handleChange}
                                placeholder="e.g. Customer Service"
                                required
                                className="mt-1 w-full rounded border bg-transparent p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Category Code<span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="text"
                                name="categoryCode"
                                value={form.categoryCode}
                                onChange={handleChange}
                                placeholder="CUSTOMER_SERVICE"
                                required
                                className="mt-1 w-full rounded border bg-transparent p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Rating Type<span className="text-red-500"> *</span>
                            </label>

                            <Popover open={openDropdown} onOpenChange={setOpenDropdown}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm"
                                    >
                                        {form.ratingType
                                            ? ratingOptions.find((opt) => opt.value === form.ratingType)?.label
                                            : 'Select rating type'}
                                        <ChevronDown className="ml-2" />
                                    </button>
                                </PopoverTrigger>

                                <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
                                    <Command shouldFilter={true}>
                                        <CommandInput placeholder="Search rating type..." className="h-9" />

                                        <CommandList>
                                            <CommandEmpty>No rating type found.</CommandEmpty>
                                            <CommandGroup>
                                                {ratingOptions.map((option) => (
                                                    <CommandItem
                                                        key={option.value}
                                                        value={option.value}
                                                        className="cursor-pointer"
                                                        onSelect={(value) => {
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                ratingType: value,
                                                            }));
                                                            setOpenDropdown(false);
                                                        }}
                                                    >
                                                        {option.label}
                                                        <Check
                                                            className={`ml-auto ${form.ratingType === option.value ? 'opacity-100' : 'opacity-0'}`}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Row 2: UI & Sorting */}
                        <div>
                            <label className="block text-sm font-medium">
                                Icon (Emoji or Text)<span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="text"
                                name="icon"
                                value={form.icon}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full rounded border bg-transparent p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Theme Color<span className="text-red-500"> *</span>
                            </label>
                            <div className="mt-1 flex items-center gap-2">
                                <input
                                    type="color"
                                    name="color"
                                    value={form.color}
                                    onChange={handleChange}
                                    className="h-10 w-16 cursor-pointer rounded border bg-transparent p-1"
                                />
                                <input
                                    type="text"
                                    name="color"
                                    value={form.color}
                                    onChange={handleChange}
                                    className="w-full rounded border bg-transparent p-2 text-xs"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Sort Order<span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="number"
                                name="sortOrder"
                                value={form.sortOrder}
                                onChange={handleChange}
                                min={1}
                                required
                                className="mt-1 w-full [appearance:textfield] rounded border bg-transparent p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                        </div>

                        {/* Row 3: Rating Logic */}
                        <div>
                            <label className="block text-sm font-medium">
                                Max Rating Value<span className="text-red-500"> *</span>
                            </label>

                            <input
                                type="number"
                                name="maximumRating"
                                value={form.maximumRating}
                                onChange={handleChange}
                                min={1}
                                required
                                inputMode="numeric"
                                className="mt-1 w-full [appearance:textfield] rounded border bg-transparent p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium">
                                Rating Labels (Comma Separated)<span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="text"
                                name="labels"
                                value={form.labels}
                                onChange={handleChange}
                                placeholder="1, 2, 3..."
                                required
                                className="mt-1 w-full rounded border bg-transparent p-2"
                            />
                        </div>

                        {/* Row 4: Final Details */}
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                                className="mt-1 h-20 w-full resize-none rounded border bg-transparent px-3 py-2"
                            />
                        </div>

                        <div className="md:col-span-3">
                            <div className="flex items-center justify-between rounded border p-4">
                                <div>
                                    <label htmlFor="isactive" className="block text-sm font-medium">
                                        Feedback Category Status
                                    </label>
                                    <p className="text-foreground/60 text-xs">
                                        {form.status ? 'Feedback category is active and visible' : 'Feedback category is inactive'}
                                    </p>
                                </div>
                                <Switch
                                    id="isactive"
                                    checked={form.status}
                                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, status: checked }))}
                                    className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${form.status ? 'bg-orange-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.status ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </Switch>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-3">
                        <Button type="submit" className="bg-primary flex cursor-pointer items-center gap-2">
                            Update Feedback Category
                        </Button>
                    </div>
                </form>


            </div>
        </div>
    );
}
