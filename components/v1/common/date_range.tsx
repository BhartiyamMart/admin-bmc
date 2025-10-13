"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

interface DateRangePickerProps {
  dateRange?: DateRange;
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  onApply?: () => void;
  onClear?: () => void;
}

export function DateRangePicker({ dateRange, onDateRangeChange, onApply, onClear }: DateRangePickerProps) {
  const [localDate, setLocalDate] = React.useState<DateRange | undefined>(dateRange);
  const [open, setOpen] = React.useState(false);

  // Update local state when props change
  React.useEffect(() => {
    setLocalDate(dateRange);
  }, [dateRange]);

  const handleQuickSelect = (type: string) => {
    const today = new Date();
    let newDateRange: DateRange | undefined;

    switch (type) {
      case "today":
        newDateRange = { from: today, to: today };
        break;
      case "yesterday":
        const y = subDays(today, 1);
        newDateRange = { from: y, to: y };
        break;
      case "thisWeek":
        newDateRange = { from: startOfWeek(today), to: endOfWeek(today) };
        break;
      case "lastWeek":
        const lwStart = startOfWeek(subDays(today, 7));
        const lwEnd = endOfWeek(subDays(today, 7));
        newDateRange = { from: lwStart, to: lwEnd };
        break;
      case "thisMonth":
        newDateRange = { from: startOfMonth(today), to: endOfMonth(today) };
        break;
      case "lastMonth":
        const prev = subDays(startOfMonth(today), 1);
        newDateRange = { from: startOfMonth(prev), to: endOfMonth(prev) };
        break;
      default:
        newDateRange = undefined;
    }

    setLocalDate(newDateRange);
    // Immediately apply the filter for quick selections
    if (onDateRangeChange) {
      onDateRangeChange(newDateRange);
    }
    setOpen(false);
  };

  const handleApply = () => {
    console.log("Applying date range:", localDate);
    if (onDateRangeChange) {
      onDateRangeChange(localDate);
    }
    if (onApply) {
      onApply();
    }
    setOpen(false);
  };

  const handleClear = () => {
    const clearedDate = undefined;
    setLocalDate(clearedDate);
    if (onDateRangeChange) {
      onDateRangeChange(clearedDate);
    }
    if (onClear) {
      onClear();
    }
    setOpen(false);
  };

  const handleCalendarSelect = (selectedRange: DateRange | undefined) => {
    console.log("Calendar selection:", selectedRange);
    setLocalDate(selectedRange);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
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
        {dateRange?.from ? (
          dateRange.to ? (
            <>
              {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
            </>
          ) : (
            format(dateRange.from, "MMM dd, yyyy")
          )
        ) : (
          <span>Pick a date range</span>
        )}
      </Button>

      {/* Modal Overlay */}
      {open && (
        <div 
          className="fixed inset-0  flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-sidebar shadow-xl rounded-lg border w-[680px] max-w-[95vw] max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b rounded-t-lg">
              <h3 className="text-primary font-semibold text-sm">Date Range</h3>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4 text-primary" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex max-h-[calc(90vh-60px)] overflow-hidden">
              {/* Left Sidebar */}
              <div className="w-40 border-r text-sm p-2 flex flex-col gap-1 overflow-y-auto">
                <Button variant="ghost" className="justify-start text-primary " onClick={() => handleQuickSelect("today")}>
                  Today
                </Button>
                <Button variant="ghost" className="justify-start text-primary " onClick={() => handleQuickSelect("yesterday")}>
                  Yesterday
                </Button>
                <Button variant="ghost" className="justify-start text-primary " onClick={() => handleQuickSelect("thisWeek")}>
                  This Week
                </Button>
                <Button variant="ghost" className="justify-start text-primary " onClick={() => handleQuickSelect("lastWeek")}>
                  Last Week
                </Button>
                <Button variant="ghost" className="justify-start text-primary " onClick={() => handleQuickSelect("thisMonth")}>
                  This Month
                </Button>
                <Button variant="ghost" className="justify-start text-primary " onClick={() => handleQuickSelect("lastMonth")}>
                  Last Month
                </Button>
              </div>

              {/* Right Calendar Area */}
              <div className="flex-1 flex flex-col items-center justify-between p-4 overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    readOnly
                    className="border rounded-md px-3 py-1 text-sm text-primary w-40 "
                    value={localDate?.from ? format(localDate.from, "MMM dd, yyyy") : ""}
                    placeholder="Start date"
                  />
                  <input
                    type="text"
                    readOnly
                    className="border rounded-md px-3 py-1 text-sm text-primary w-40 "
                    value={localDate?.to ? format(localDate.to, "MMM dd, yyyy") : ""}
                    placeholder="End date"
                  />
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={localDate?.from}
                    selected={localDate}
                    onSelect={handleCalendarSelect}
                    numberOfMonths={2}
                    className="rounded-md"
                  />
                </div>

                <div className="flex justify-end w-full mt-3 gap-2">
                  <Button
                    variant="outline"
                    className="text-sm px-5 "
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                  <Button
                    className="text-sm px-5 "
                    onClick={handleApply}
                  >
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
