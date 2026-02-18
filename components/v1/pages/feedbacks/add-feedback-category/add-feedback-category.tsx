'use client';

import React, { useState } from 'react';
import { Switch } from '@radix-ui/react-switch';
import { Check, ChevronDown, ChevronLeft, Sparkles, Star, ThumbsUp, Smile, Hash } from 'lucide-react';
import Link from 'next/link';
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
    { value: 'STAR_RATING', label: 'Star Rating', icon: <Star className="h-4 w-4" /> },
    { value: 'EMOJI_SCALE', label: 'Emoji Scale', icon: <Smile className="h-4 w-4" /> },
    { value: 'NUMERIC', label: 'Number Rating', icon: <Hash className="h-4 w-4" /> },
    { value: 'THUMBS', label: 'Thumbs Rating', icon: <ThumbsUp className="h-4 w-4" /> },
  ];

  const [openDropdown, setOpenDropdown] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'sortOrder' || name === 'maximumRating' ? Number(value) : value,
      ...(name === 'categoryName' && { categoryCode: value.toUpperCase().replace(/\s+/g, '_') }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      // const res = await createFeedbackCategory(payload as unknown as FeedbackCategory);
      // if (!res.error) {
      //   toast.success('Feedback Category Added Successfully!');
      // } else {
      //   toast.error('Failed to add category');
      // }
      console.log(payload);
      toast.success('Form submitted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    }
  };

  return (
    <div className="bg-muted/30 min-h-[calc(100vh-8vh)] p-4 md:p-6">
      <div className="">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold">
              <Sparkles className="text-primary h-6 w-6" />
              Add Feedback Category
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">Create a new feedback category for your customers</p>
          </div>
          <Link href="/feedbacks/feedback-category">
            <Button variant="outline" className="w-full sm:w-auto">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to List
            </Button>
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <Sparkles className="text-primary h-4 w-4" />
              </div>
              <h2 className="text-card-foreground text-lg font-semibold">Basic Information</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Category Name */}
              <div className="space-y-2">
                <label htmlFor="categoryName" className="text-foreground text-sm font-medium">
                  Category Name
                  <span className="text-destructive ml-1">*</span>
                </label>
                <input
                  id="categoryName"
                  type="text"
                  name="categoryName"
                  value={form.categoryName}
                  onChange={handleChange}
                  placeholder="e.g. Customer Service"
                  required
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Category Code */}
              <div className="space-y-2">
                <label htmlFor="categoryCode" className="text-foreground text-sm font-medium">
                  Category Code
                  <span className="text-destructive ml-1">*</span>
                </label>
                <input
                  id="categoryCode"
                  type="text"
                  name="categoryCode"
                  value={form.categoryCode}
                  onChange={handleChange}
                  placeholder="CUSTOMER_SERVICE"
                  required
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 font-mono text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Icon */}
              <div className="space-y-2">
                <label htmlFor="icon" className="text-foreground text-sm font-medium">
                  Icon (Emoji)
                  <span className="text-destructive ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    id="icon"
                    type="text"
                    name="icon"
                    value={form.icon}
                    onChange={handleChange}
                    required
                    maxLength={2}
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-2xl">
                    {form.icon}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Configuration Card */}
          <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <Star className="text-primary h-4 w-4" />
              </div>
              <h2 className="text-card-foreground text-lg font-semibold">Rating Configuration</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Rating Type */}
              <div className="space-y-2">
                <label htmlFor="ratingType" className="text-foreground text-sm font-medium">
                  Rating Type
                  <span className="text-destructive ml-1">*</span>
                </label>
                <Popover open={openDropdown} onOpenChange={setOpenDropdown}>
                  <PopoverTrigger asChild>
                    <button
                      id="ratingType"
                      type="button"
                      className="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        {form.ratingType ? ratingOptions.find((opt) => opt.value === form.ratingType)?.icon : null}
                        {form.ratingType
                          ? ratingOptions.find((opt) => opt.value === form.ratingType)?.label
                          : 'Select rating type'}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
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
                              <div className="flex items-center gap-2">
                                {option.icon}
                                {option.label}
                              </div>
                              <Check
                                className={`ml-auto h-4 w-4 ${form.ratingType === option.value ? 'opacity-100' : 'opacity-0'}`}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Max Rating */}
              <div className="space-y-2">
                <label htmlFor="maximumRating" className="text-foreground text-sm font-medium">
                  Maximum Rating
                  <span className="text-destructive ml-1">*</span>
                </label>
                <input
                  id="maximumRating"
                  type="number"
                  name="maximumRating"
                  value={form.maximumRating}
                  onChange={handleChange}
                  min={1}
                  max={10}
                  required
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full [appearance:textfield] rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label htmlFor="sortOrder" className="text-foreground text-sm font-medium">
                  Sort Order
                  <span className="text-destructive ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    id="sortOrder"
                    type="number"
                    value={form.sortOrder}
                    readOnly
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full [appearance:textfield] rounded-md border px-3 py-2 pr-12 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <div className="absolute top-1/2 right-1 flex -translate-y-1/2 flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          sortOrder: p.sortOrder + 1,
                        }))
                      }
                      className="bg-muted hover:bg-muted-foreground/20 flex h-4 w-8 items-center justify-center rounded text-xs transition-colors"
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
                      className="bg-muted hover:bg-muted-foreground/20 flex h-4 w-8 items-center justify-center rounded text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              {/* Rating Labels */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label htmlFor="labels" className="text-foreground text-sm font-medium">
                  Rating Labels (Comma Separated)
                  <span className="text-destructive ml-1">*</span>
                </label>
                <input
                  id="labels"
                  type="text"
                  name="labels"
                  value={form.labels}
                  onChange={handleChange}
                  placeholder="Very Poor, Poor, Average, Good, Excellent"
                  required
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-muted-foreground text-xs">
                  Separate each label with a comma. Number of labels should match the maximum rating.
                </p>
              </div>
            </div>
          </div>

          {/* Appearance Card */}
          <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <div className="bg-primary h-4 w-4 rounded-full"></div>
              </div>
              <h2 className="text-card-foreground text-lg font-semibold">Appearance & Details</h2>
            </div>

            <div className="space-y-6">
              {/* Theme Color */}
              <div className="space-y-2">
                <label htmlFor="color" className="text-foreground text-sm font-medium">
                  Theme Color
                  <span className="text-destructive ml-1">*</span>
                </label>
                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      className="border-input h-10 w-20 cursor-pointer rounded-md border"
                      title="Pick a color"
                    />
                  </div>
                  <input
                    id="color"
                    type="text"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    placeholder="#4A90E2"
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 flex-1 rounded-md border px-3 py-2 font-mono text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-foreground text-sm font-medium">
                  Description
                  <span className="text-destructive ml-1">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe the purpose of this feedback category..."
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full resize-none rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Status Toggle */}
              <div className="border-border bg-muted/50 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <label htmlFor="isactive" className="text-foreground text-sm font-medium">
                      Category Status
                    </label>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {form.status
                        ? '✓ This category is active and visible to customers'
                        : '✗ This category is currently inactive'}
                    </p>
                  </div>
                  <Switch
                    id="isactive"
                    checked={form.status}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, status: checked }))}
                    className={`focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      form.status ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span
                      className={`bg-background pointer-events-none inline-block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
                        form.status ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </Switch>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/feedbacks/feedback-category">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="min-w-[160px]">
              <Sparkles className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
