"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export function DateRangePicker() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const [open, setOpen] = React.useState(false);

  const handleQuickSelect = (type: string) => {
    const today = new Date();

    switch (type) {
      case "today":
        setDate({ from: today, to: today });
        break;
      case "yesterday":
        const y = subDays(today, 1);
        setDate({ from: y, to: y });
        break;
      case "thisWeek":
        setDate({ from: startOfWeek(today), to: endOfWeek(today) });
        break;
      case "lastWeek":
        const lwStart = startOfWeek(subDays(today, 7));
        const lwEnd = endOfWeek(subDays(today, 7));
        setDate({ from: lwStart, to: lwEnd });
        break;
      case "thisMonth":
        setDate({ from: startOfMonth(today), to: endOfMonth(today) });
        break;
      case "lastMonth":
        const prev = subDays(startOfMonth(today), 1);
        setDate({ from: startOfMonth(prev), to: endOfMonth(prev) });
        break;
    }
  };

  const handleApply = () => {
    console.log("Applied:", date?.from, "to", date?.to);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className="w-[280px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "MMM dd, yyyy")} - {format(date.to, "MMM dd, yyyy")}
              </>
            ) : (
              format(date.from, "MMM dd, yyyy")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-[680px] bg-white shadow-lg rounded-lg border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-[#f9fafb] rounded-t-lg">
          <h3 className="text-blue-700 font-semibold text-sm">Date Range</h3>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex">
          {/* Left Sidebar */}
          <div className="w-40 border-r bg-[#f9fafb] text-sm p-2 flex flex-col gap-1">
            <Button variant="ghost" className="justify-start text-gray-700" onClick={() => handleQuickSelect("today")}>
              Today
            </Button>
            <Button variant="ghost" className="justify-start text-gray-700" onClick={() => handleQuickSelect("yesterday")}>
              Yesterday
            </Button>
            <Button variant="ghost" className="justify-start text-gray-700" onClick={() => handleQuickSelect("thisWeek")}>
              This Week
            </Button>
            <Button variant="ghost" className="justify-start text-gray-700" onClick={() => handleQuickSelect("lastWeek")}>
              Last Week
            </Button>
            <Button variant="ghost" className="justify-start text-gray-700" onClick={() => handleQuickSelect("thisMonth")}>
              This Month
            </Button>
            <Button variant="ghost" className="justify-start text-gray-700" onClick={() => handleQuickSelect("lastMonth")}>
              Last Month
            </Button>
          </div>

          {/* Right Calendar Area */}
          <div className="flex-1 flex flex-col items-center justify-between p-4 left-0">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                readOnly
                className="border rounded-md px-3 py-1 text-sm text-gray-700 w-40"
                value={date?.from ? format(date.from, "MMM dd, yyyy") : ""}
              />
              <input
                type="text"
                readOnly
                className="border rounded-md px-3 py-1 text-sm text-gray-700 w-40"
                value={date?.to ? format(date.to, "MMM dd, yyyy") : ""}
              />
            </div>

            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              className="rounded-md"
            />

            <div className="flex justify-end w-full mt-3">
              <Button
                className="bg-blue-600 text-white text-sm px-5 hover:bg-blue-700"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
