"use client";

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

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  onApply,
  onClear,
}: DateRangePickerProps) {
  const [localDate, setLocalDate] = React.useState<DateRange | undefined>(dateRange);
  const [open, setOpen] = React.useState(false);

  // Sync prop updates
  React.useEffect(() => {
    setLocalDate(dateRange);
  }, [dateRange]);

  // 🟢 Handle quick-select (like "This Month", "Last Week")
  const handleQuickSelect = (type: string) => {
    const today = new Date();
    let newRange: DateRange | undefined;

    switch (type) {
      case "today":
        newRange = { from: today, to: today };
        break;
      case "yesterday":
        const y = subDays(today, 1);
        newRange = { from: y, to: y };
        break;
      case "thisWeek":
        newRange = { from: startOfWeek(today), to: endOfWeek(today) };
        break;
      case "lastWeek":
        const lwStart = startOfWeek(subDays(today, 7));
        const lwEnd = endOfWeek(subDays(today, 7));
        newRange = { from: lwStart, to: lwEnd };
        break;
      case "thisMonth":
        newRange = { from: startOfMonth(today), to: endOfMonth(today) };
        break;
      case "lastMonth":
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

  // 🟢 Handle manual calendar selection (update instantly)
  const handleCalendarSelect = (range: DateRange | undefined) => {
    setLocalDate(range);
    onDateRangeChange?.(range);
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
    setOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setOpen(false);
  };

  // 🟢 Show selected range in button text
  const renderLabel = () => {
    if (localDate?.from && localDate?.to) {
      return `${format(localDate.from, "MMM dd, yyyy")} - ${format(localDate.to, "MMM dd, yyyy")}`;
    }
    if (localDate?.from) {
      return format(localDate.from, "MMM dd, yyyy");
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
          className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/20"
          onClick={handleBackdropClick}
        >
          <div className="bg-sidebar shadow-xl rounded-lg border w-[680px] max-w-[95vw] max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b rounded-t-lg">
              <h3 className="text-primary font-semibold text-sm">Select Date Range</h3>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4 text-primary" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex max-h-[calc(90vh-60px)] overflow-hidden">
              {/* Left Quick-select Sidebar */}
              <div className="w-40 border-r text-sm p-2 flex flex-col gap-1 overflow-y-auto">
                {["today", "yesterday", "thisWeek", "lastWeek", "thisMonth", "lastMonth"].map((key) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className="justify-start text-primary"
                    onClick={() => handleQuickSelect(key)}
                  >
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (s) => s.toUpperCase())}
                  </Button>
                ))}
              </div>

              {/* Right Calendar Area */}
              <div className="flex-1 flex flex-col items-center justify-between p-4 overflow-y-auto">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={localDate?.from}
                  selected={localDate}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={2}
                  className="rounded-md"
                />

                <div className="flex justify-end w-full mt-3 gap-2">
                  <Button variant="outline" className="text-sm px-5" onClick={handleClear}>
                    Clear
                  </Button>
                  <Button className="text-sm px-5" onClick={handleApply}>
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
