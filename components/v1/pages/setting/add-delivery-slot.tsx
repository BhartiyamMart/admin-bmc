'use client';

import React, { useState } from 'react';
import { Switch } from '@radix-ui/react-switch';
import { Clock, ChevronLeft, Calendar, AlertCircle, CheckCircle2, Zap, Save } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

interface TimeSlotForm {
  slotName: string;
  startTime: string;
  endTime: string;
  description: string;
  maxCapacity: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isActive: boolean;
  daysOfWeek: string[];
  cutoffTime: string;
}

const AddDeliveryTimeSlot = () => {
  const [form, setForm] = useState<TimeSlotForm>({
    slotName: '',
    startTime: '',
    endTime: '',
    description: '',
    maxCapacity: 10,
    priority: 'MEDIUM',
    isActive: true,
    daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    cutoffTime: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TimeSlotForm, string>>>({});

  const priorityOptions = [
    {
      value: 'LOW',
      label: 'Low Priority',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      value: 'MEDIUM',
      label: 'Medium Priority',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      value: 'HIGH',
      label: 'High Priority',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    { value: 'URGENT', label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  ];

  const daysOfWeek = [
    { value: 'MON', label: 'Mon' },
    { value: 'TUE', label: 'Tue' },
    { value: 'WED', label: 'Wed' },
    { value: 'THU', label: 'Thu' },
    { value: 'FRI', label: 'Fri' },
    { value: 'SAT', label: 'Sat' },
    { value: 'SUN', label: 'Sun' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'maxCapacity' ? Number(value) : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof TimeSlotForm]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day) ? prev.daysOfWeek.filter((d) => d !== day) : [...prev.daysOfWeek, day],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TimeSlotForm, string>> = {};

    if (!form.slotName.trim()) {
      newErrors.slotName = 'Slot name is required';
    }

    if (!form.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!form.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (form.daysOfWeek.length === 0) {
      newErrors.daysOfWeek = 'Select at least one day';
    }

    if (form.maxCapacity < 1) {
      newErrors.maxCapacity = 'Capacity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      // API call would go here
      console.log('Submitting:', form);
      toast.success('Delivery time slot created successfully!');

      // Reset form
      setForm({
        slotName: '',
        startTime: '',
        endTime: '',
        description: '',
        maxCapacity: 10,
        priority: 'MEDIUM',
        isActive: true,
        daysOfWeek: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        cutoffTime: '',
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create time slot');
    }
  };

  const selectedPriority = priorityOptions.find((opt) => opt.value === form.priority);

  return (
    <div className="bg-muted/30 min-h-[calc(100vh-8vh)] p-4 md:p-6">
      <div className="">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold">
              <Clock className="text-primary h-6 w-6" />
              Create Delivery Time Slot
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Set up a new scheduled delivery window for your customers
            </p>
          </div>
          <Link href="/delivery/time-slots">
            <Button variant="outline" className="w-full sm:w-auto">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Slots
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
            <div className="border-border mb-6 flex items-center gap-2 border-b pb-4">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Calendar className="text-primary h-5 w-5" />
              </div>
              <div>
                <h2 className="text-card-foreground text-lg font-semibold">Basic Information</h2>
                <p className="text-muted-foreground text-xs">Define the time slot name and schedule</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Slot Name */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="slotName" className="text-foreground text-sm font-medium">
                  Time Slot Name
                  <span className="text-destructive ml-1">*</span>
                </label>
                <input
                  id="slotName"
                  type="text"
                  name="slotName"
                  value={form.slotName}
                  onChange={handleChange}
                  placeholder="e.g. Morning Delivery (9 AM - 12 PM)"
                  className={`flex h-11 w-full rounded-md border ${
                    errors.slotName ? 'border-destructive' : 'border-input'
                  } bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                />
                {errors.slotName && (
                  <p className="text-destructive flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {errors.slotName}
                  </p>
                )}
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <label htmlFor="startTime" className="text-foreground text-sm font-medium">
                  Start Time
                  <span className="text-destructive ml-1">*</span>
                </label>
                <div className="relative">
                  <Clock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    id="startTime"
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    className={`flex h-11 w-full rounded-md border ${
                      errors.startTime ? 'border-destructive' : 'border-input'
                    } bg-background ring-offset-background focus-visible:ring-ring py-2 pr-3 pl-10 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                  />
                </div>
                {errors.startTime && (
                  <p className="text-destructive flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {errors.startTime}
                  </p>
                )}
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <label htmlFor="endTime" className="text-foreground text-sm font-medium">
                  End Time
                  <span className="text-destructive ml-1">*</span>
                </label>
                <div className="relative">
                  <Clock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    id="endTime"
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    className={`flex h-11 w-full rounded-md border ${
                      errors.endTime ? 'border-destructive' : 'border-input'
                    } bg-background ring-offset-background focus-visible:ring-ring py-2 pr-3 pl-10 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                  />
                </div>
                {errors.endTime && (
                  <p className="text-destructive flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {errors.endTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Priority & Days */}
          <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
            <div className="border-border mb-6 flex items-center gap-2 border-b pb-4">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <Zap className="text-primary h-5 w-5" />
              </div>
              <div>
                <h2 className="text-card-foreground text-lg font-semibold">Priority & Availability</h2>
                <p className="text-muted-foreground text-xs">Set priority level and available days</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Priority Selection */}
              <div className="space-y-3">
                <label className="text-foreground text-sm font-medium">
                  Delivery Priority
                  <span className="text-destructive ml-1">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, priority: option.value as any }))}
                      className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                        form.priority === option.value
                          ? `${option.borderColor} ${option.bgColor} shadow-sm`
                          : 'border-border bg-background hover:border-muted-foreground/30'
                      }`}
                    >
                      {form.priority === option.value && (
                        <div className="bg-primary absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full">
                          <CheckCircle2 className="text-primary-foreground h-4 w-4" />
                        </div>
                      )}
                      <Zap
                        className={`h-5 w-5 ${form.priority === option.value ? option.color : 'text-muted-foreground'}`}
                      />
                      <span
                        className={`text-sm font-medium ${form.priority === option.value ? option.color : 'text-foreground'}`}
                      >
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Days of Week */}
              <div className="space-y-3">
                <label className="text-foreground text-sm font-medium">
                  Available Days
                  <span className="text-destructive ml-1">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`flex h-10 w-14 items-center justify-center rounded-md border-2 text-sm font-medium transition-all hover:shadow-sm ${
                        form.daysOfWeek.includes(day.value)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-foreground hover:border-muted-foreground/30'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {errors.daysOfWeek && (
                  <p className="text-destructive flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {errors.daysOfWeek}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description & Status */}
          <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
            <div className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-foreground text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add any additional notes or instructions for this delivery slot..."
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full resize-none rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Status Toggle */}
              <div className="border-border bg-muted/50 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <label htmlFor="isActive" className="text-foreground flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      Time Slot Status
                    </label>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {form.isActive
                        ? '✓ This time slot is active and available for booking'
                        : '✗ This time slot is currently inactive'}
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
                    className={`focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                      form.isActive ? 'bg-primary' : 'bg-input'
                    }`}
                  >
                    <span
                      className={`bg-background pointer-events-none inline-block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
                        form.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </Switch>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="border-primary/20 bg-primary/5 rounded-lg border p-6">
            <h3 className="text-foreground mb-4 flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="text-primary h-4 w-4" />
              Time Slot Summary
            </h3>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Time Range:</span>
                <span className="text-foreground ml-2 font-medium">
                  {form.startTime || '--:--'} - {form.endTime || '--:--'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Priority:</span>
                <span className={`ml-2 font-medium ${selectedPriority?.color || 'text-foreground'}`}>
                  {selectedPriority?.label || 'Not set'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Capacity:</span>
                <span className="text-foreground ml-2 font-medium">{form.maxCapacity} deliveries</span>
              </div>
              <div>
                <span className="text-muted-foreground">Days:</span>
                <span className="text-foreground ml-2 font-medium">
                  {form.daysOfWeek.length > 0 ? form.daysOfWeek.join(', ') : 'None selected'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Link href="/delivery/time-slots">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="min-w-[180px]">
              <Save className="mr-2 h-4 w-4" />
              Create Time Slot
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeliveryTimeSlot;
