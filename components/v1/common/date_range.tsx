'use client';

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X, ChevronLeft, ChevronDown } from "lucide-react";
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
  const [showQuickSelect, setShowQuickSelect] = React.useState(true);
  const [isSmallMobile, setIsSmallMobile] = React.useState(false);
  const [screenWidth, setScreenWidth] = React.useState(0);

  // Responsive breakpoint detection
  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsSmallMobile(width < 640); // sm breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Sync prop updates
  React.useEffect(() => {
    setLocalDate(dateRange);
  }, [dateRange]);

  // Reset mobile view when opening
  React.useEffect(() => {
    if (open && isSmallMobile) {
      setShowQuickSelect(true);
    }
  }, [open, isSmallMobile]);

  const quickSelectOptions = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'thisWeek', label: 'This Week' },
    { key: 'lastWeek', label: 'Last Week' },
    { key: 'thisMonth', label: 'This Month' },
    { key: 'lastMonth', label: 'Last Month' },
  ];

  // Determine number of months based on screen size
  const getNumberOfMonths = () => {
    if (isSmallMobile) return 1; // < 640px: 1 month
    return 2; // >= 640px (sm to lg): 2 months
  };

  // Handle quick-select
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
    
    if (!isSmallMobile) {
      setOpen(false);
    } else {
      setShowQuickSelect(false);
    }
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    console.log('Range selected:', range);

    if (range) {
      setLocalDate(range);
      onDateRangeChange?.(range);
    } else {
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

  // Responsive label rendering
  const renderLabel = () => {
    if (localDate?.from && localDate?.to) {
      if (localDate.from.toDateString() === localDate.to.toDateString()) {
        return format(localDate.from, !isSmallMobile ? 'MMM dd, yyyy' : 'MMM dd');
      }
      return !isSmallMobile 
        ? `${format(localDate.from, 'MMM dd, yyyy')} - ${format(localDate.to, 'MMM dd, yyyy')}`
        : `${format(localDate.from, 'MMM dd')} - ${format(localDate.to, 'MMM dd')}`;
    }
    if (localDate?.from) {
      return format(localDate.from, !isSmallMobile ? 'MMM dd, yyyy' : 'MMM dd');
    }
    return <span>{!isSmallMobile ? 'Pick a date range' : 'Pick date'}</span>;
  };

  // Desktop/Tablet Layout (sm to lg: 640px - 1024px) - Always 2 months
  const DesktopTabletLayout = () => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-sidebar max-h-[90vh] w-full max-w-[680px] sm:w-[680px] overflow-hidden rounded-lg border shadow-xl">
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
          <div className="flex w-32 sm:w-40 flex-col gap-1 overflow-y-auto border-r p-2 text-sm">
            {quickSelectOptions.map(({ key, label }) => (
              <Button
                key={key}
                variant="ghost"
                className="text-primary justify-start text-xs sm:text-sm h-8 sm:h-auto"
                onClick={() => handleQuickSelect(key)}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Right Calendar Area */}
          <div className="flex flex-1 flex-col items-center justify-between overflow-y-auto p-2 sm:p-4">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={localDate?.from || new Date()}
              selected={localDate}
              onSelect={handleCalendarSelect}
              numberOfMonths={2} // Always 2 months for sm to lg
              className="rounded-md"
              showOutsideDays={false}
              fixedWeeks={true}
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
            />

            <div className="mt-3 flex w-full justify-end gap-2">
              <Button variant="outline" className="px-3 sm:px-5 text-sm" onClick={handleClear}>
                Clear
              </Button>
              <Button className="px-3 sm:px-5 text-sm" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Layout (< 640px) - Always 1 month
  const MobileLayout = () => (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/20"
      onClick={handleBackdropClick}
    >
      <div className="bg-background w-full max-h-[85vh] overflow-hidden rounded-t-xl border-t shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            {!showQuickSelect && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowQuickSelect(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <h3 className="text-primary text-base font-semibold">
              {showQuickSelect ? 'Select Date Range' : 'Pick Custom Dates'}
            </h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="text-primary h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(85vh-70px)] overflow-hidden">
          {showQuickSelect ? (
            /* Quick Select View */
            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(85vh-70px)]">
              {quickSelectOptions.map(({ key, label }) => (
                <Button
                  key={key}
                  variant="outline"
                  className="w-full justify-start h-12 text-left"
                  onClick={() => handleQuickSelect(key)}
                >
                  {label}
                </Button>
              ))}
              
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                  onClick={() => setShowQuickSelect(false)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Custom Range
                </Button>
              </div>
            </div>
          ) : (
            /* Calendar View */
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4 overflow-y-auto">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={localDate?.from || new Date()}
                  selected={localDate}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={1} // Always 1 month for mobile
                  className="rounded-md w-full"
                  showOutsideDays={false}
                  fixedWeeks={true}
                  classNames={{
                    months: "flex flex-col space-y-4",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-1 relative items-center text-sm font-medium",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-8 w-8 bg-transparent p-0 hover:bg-accent hover:text-accent-foreground",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex w-full",
                    head_cell: "text-muted-foreground rounded-md w-full font-normal text-xs",
                    row: "flex w-full",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                    day: "h-10 w-full p-0 font-normal hover:bg-accent hover:text-accent-foreground rounded-md",
                  }}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 p-4 border-t bg-background">
                <Button 
                  variant="outline" 
                  className="flex-1 h-11" 
                  onClick={handleClear}
                >
                  Clear
                </Button>
                <Button 
                  className="flex-1 h-11" 
                  onClick={handleApply}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Responsive Trigger Button */}
      <Button
        id="date"
        variant="outline"
        className={`justify-start text-left font-normal ${
          !isSmallMobile ? 'w-[280px]' : 'w-full max-w-[280px] min-w-[200px]'
        }`}
        onClick={() => setOpen(true)}
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
        <span className="truncate">{renderLabel()}</span>
        {isSmallMobile && <ChevronDown className="ml-auto h-4 w-4 shrink-0" />}
      </Button>

      {/* Conditional Layout Rendering */}
      {open && (!isSmallMobile ? <DesktopTabletLayout /> : <MobileLayout />)}
    </>
  );
}
