'use client';

import React, { useState } from 'react';
import { Switch } from '@radix-ui/react-switch';
import { Check, ChevronDown, ChevronLeft, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { createFeedbackCategory } from '@/apis/create-time-slot.api';
import { FeedbackCategory } from '@/interface/common.interface';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function AddFeedbackCustomer() {
  const [form, setForm] = useState({
    categoryName: '',
    categoryCode: '',
    description: '',
    icon: '👨‍💼',
    color: '#4A90E2',
    sortOrder: 1,
    ratingType: 'STAR_RATING',
    maximumRating: 5,
    labels: 'Very Poor, Poor, Average, Good, Excellent',
    status: true,
  });
  const ratingOptions = [
    { value: 'STAR_RATING', label: 'Star Rating' },
    { value: 'EMOJI_SCALE', label: 'Emoji Scale' },
    { value: 'NUMERIC', label: 'Number Rating' },
    { value: 'THUMBS', label: 'Thumbs Rating' },
  ];

  const [openDropdown, setOpenDropdown] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'sortOrder' || name === 'maximumRating' ? Number(value) : value,
      // Auto-generate code if categoryName is changed, but keep it editable
      ...(name === 'categoryName' && { categoryCode: value.toUpperCase().replace(/\s+/g, '_') }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Transform comma-separated labels into the required object format: { "1": "Label1", "2": "Label2" }
    const labelArray = form.labels.split(',').map((l) => l.trim());
    const ratingLabels: Record<string, string> = {};
    labelArray.forEach((label, index) => {
      ratingLabels[(index + 1).toString()] = label;
    });

    const payload: Omit<FeedbackCategory, 'id' | 'createdAt' | 'updatedAt'> = {
      categoryName: form.categoryName,
      categoryCode: form.categoryCode,
      description: form.description,
      icon: form.icon,
      color: form.color,
      sortOrder: form.sortOrder,
      ratingType: form.ratingType as any,
      maxRating: form.maximumRating,
      ratingLabels: ratingLabels,
      isActive: form.status,
    };

    try {
      const res = await createFeedbackCategory(payload as unknown as FeedbackCategory);
      if (!res.error) {
        toast.success('Feedback Category Added Successfully!');
      } else {
        toast.error('Failed to add category');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar text-foreground w-full overflow-y-auto rounded p-4 shadow">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Add Feedback Category</p>
          <Link
            href="/feedbacks/feedback-category"
          // className="bg-sidebar text-foreground border flex cursor-pointer rounded px-3 py-2 text-sm transition "
          >
            <Button className="bg-primary flex cursor-pointer items-center gap-2">
              {' '}
              <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
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
              <div className="relative">
                <input
                  type="number"
                  value={form.sortOrder}
                  readOnly
                  tabIndex={-1}
                  onKeyDown={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  className="mt-1 w-full [appearance:textfield] rounded border bg-transparent p-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />

                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        sortOrder: p.sortOrder + 1,
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
                        sortOrder: Math.max(0, p.sortOrder - 1),
                      }))
                    }
                    disabled={form.sortOrder <= 0}
                    className="flex cursor-pointer h-4 w-6 items-center justify-center rounded hover:bg-muted disabled:opacity-50"
                  >
                    ▼
                  </button>
                </div>
              </div>
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
              <label className="block text-sm font-medium">Description <span className="text-red-500">*</span></label>
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
              Add Feedback Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
