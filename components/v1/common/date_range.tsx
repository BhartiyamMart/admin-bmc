'use client';

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  
} from "date-fns";

interface DateRangePickerProps {
  dateRange?: DateRange;
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  onApply?: () => void;
  onClear?: () => void;
}

export function DateRangePicker({ dateRange, onDateRangeChange, onApply, onClear }: DateRangePickerProps) {
  const [localDate, setLocalDate] = React.useState<DateRange | undefined>(dateRange);
  const [open, setOpen] = React.useState(false);

  // Sync prop updates
  React.useEffect(() => {
    setLocalDate(dateRange);
  }, [dateRange]);

  // Handle quick-select (like "This Month", "Last Week")
  const handleQuickSelect = (type: string) => {
    const today = new Date();
    let newRange: DateRange | undefined;

    switch (type) {
      case 'today':
        newRange = { from: today, to: today };
        break;
      case 'yesterday':
        const y = subDays(today, 1);
        newRange = { from: y, to: y };
        break;
      case 'thisWeek':
        newRange = { from: startOfWeek(today), to: endOfWeek(today) };
        break;
      case 'lastWeek':
        const lwStart = startOfWeek(subDays(today, 7));
        const lwEnd = endOfWeek(subDays(today, 7));
        newRange = { from: lwStart, to: lwEnd };
        break;
      case 'thisMonth':
        newRange = { from: startOfMonth(today), to: endOfMonth(today) };
        break;
      case 'lastMonth':
        const prev = subDays(startOfMonth(today), 1);
        newRange = { from: startOfMonth(prev), to: endOfMonth(prev) };
        break;
      default:
        newRange = undefined;
    }

    setLocalDate(newRange);
    onDateRangeChange?.(newRange);
    setOpen(false);
  };

  // Handle manual calendar selection with proper validation
  const handleCalendarSelect = (range: DateRange | undefined) => {
    console.log('Range selected:', range);

    // Validate and set the range
    if (range) {
      // If we have a valid range or partial range, use it
      setLocalDate(range);
      onDateRangeChange?.(range);
    } else {
      // Clear selection
      setLocalDate(undefined);
      onDateRangeChange?.(undefined);
    }
  };

  const handleApply = () => {
    onDateRangeChange?.(localDate);
    onApply?.();
    setOpen(false);
  };

  const handleClear = () => {
    setLocalDate(undefined);
    onDateRangeChange?.(undefined);
    onClear?.();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  // Show selected range in button text
  const renderLabel = () => {
    if (localDate?.from && localDate?.to) {
      // Check if it's the same date
      if (localDate.from.toDateString() === localDate.to.toDateString()) {
        return format(localDate.from, 'MMM dd, yyyy');
      }
      return `${format(localDate.from, 'MMM dd, yyyy')} - ${format(localDate.to, 'MMM dd, yyyy')}`;
    }
    if (localDate?.from) {
      return format(localDate.from, 'MMM dd, yyyy');
    }
    return <span>Pick a date range</span>;
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        id="date"
        variant="outline"
        className="w-[280px] justify-start text-left font-normal"
        onClick={() => setOpen(true)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {renderLabel()}
      </Button>

      {/* Modal Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-sidebar max-h-[90vh] w-[680px] max-w-[95vw] overflow-hidden rounded-lg border shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-lg border-b px-4 py-2">
              <h3 className="text-primary text-sm font-semibold">Select Date Range</h3>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="text-primary h-4 w-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex max-h-[calc(90vh-60px)] overflow-hidden">
              {/* Left Quick-select Sidebar */}
              <div className="flex w-40 flex-col gap-1 overflow-y-auto border-r p-2 text-sm">
                {['today', 'yesterday', 'thisWeek', 'lastWeek', 'thisMonth', 'lastMonth'].map((key) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className="text-primary justify-start"
                    onClick={() => handleQuickSelect(key)}
                  >
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  </Button>
                ))}
              </div>

              {/* Right Calendar Area */}
              <div className="flex flex-1 flex-col items-center justify-between overflow-y-auto p-4">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={localDate?.from || new Date()}
                  selected={localDate}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={2}
                  className="rounded-md"
                  // Add these props to fix the dual selection issue
                  showOutsideDays={false}
                  fixedWeeks={true}
                  // Custom modifiers to ensure proper range display
                  modifiers={{
                    range_start: localDate?.from,
                    range_end: localDate?.to,
                    range_middle:
                      localDate?.from && localDate?.to
                        ? (date: Date) => {
                            if (!localDate.from || !localDate.to) return false;
                            return date > localDate.from && date < localDate.to;
                          }
                        : undefined,
                  }}
                  modifiersClassNames={{
                    range_start: 'bg-primary text-primary-foreground rounded-l-md',
                    range_end: 'bg-primary text-primary-foreground rounded-r-md',
                    range_middle: 'bg-primary/20 text-primary-foreground',
                  }}
                  // Disable future dates if needed (optional)
                />

                <div className="mt-3 flex w-full justify-end gap-2">
                  <Button variant="outline" className="px-5 text-sm" onClick={handleClear}>
                    Clear
                  </Button>
                  <Button className="px-5 text-sm" onClick={handleApply}>
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
