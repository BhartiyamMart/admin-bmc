"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Types for the reusable table
export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface TableAction<T> {
  label?: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  className?: string;
  variant?: 'button' | 'icon';
}

export interface SearchFilter {
  enabled: boolean;
  placeholder?: string;
  searchKeys: string[]; // Keys to search in
}

export interface StatusFilter<T> {
  enabled: boolean;
  options: { label: string; value: string | boolean | null }[];
  accessor: keyof T;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  addButton?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  actions?: TableAction<T>[];
  searchFilter?: SearchFilter;
  statusFilter?: StatusFilter<T>;
  pagination?: {
    enabled: boolean;
    itemsPerPage?: number;
  };
  emptyMessage?: string;
  className?: string;
}

function UniTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  addButton,
  actions = [],
  searchFilter,
  statusFilter,
  pagination = { enabled: true, itemsPerPage: 8 },
  emptyMessage = "No data found.",
  className = "",
}: DataTableProps<T>) {
  // Local states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilterValue, setStatusFilterValue] = useState<string | boolean | null>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to get nested value from object
  const getNestedValue = (obj: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((current, prop) => current?.[prop], obj);
    }
    return obj[key as keyof T];
  };

  // Filter data based on search and status
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search filter
      if (searchFilter?.enabled && searchTerm) {
        const matchesSearch = searchFilter.searchKeys.some((key) => {
          const value = getNestedValue(item, key);
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter?.enabled && statusFilterValue !== "all") {
        const statusValue = getNestedValue(item, statusFilter.accessor);
        if (statusValue !== statusFilterValue) return false;
      }

      return true;
    });
  }, [data, searchTerm, statusFilterValue, searchFilter, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / (pagination.itemsPerPage || 8));
  const startIndex = (currentPage - 1) * (pagination.itemsPerPage || 8);
  const currentData = pagination.enabled 
    ? filteredData.slice(startIndex, startIndex + (pagination.itemsPerPage || 8))
    : filteredData;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilterValue]);

  return (
    <div className={`flex min-h-screen justify-center foreground p-4 ${className}`}>
      <div className="w-full rounded-lg bg-white p-4 shadow-lg">
        {/* Header */}
        {(title || addButton) && (
          <div className="mb-4 w-full">
            <div className="flex items-center justify-between">
              {title && <p className="text-md font-semibold">{title}</p>}
              {addButton && (
                addButton.href ? (
                  <Link
                    href={addButton.href}
                    className="flex items-center rounded-sm bg-primary text-background p-2 pr-3 pl-3 text-sm"
                  >
                    <Plus className="mr-2 h-5 w-5" /> {addButton.label}
                  </Link>
                ) : (
                  <button
                    onClick={addButton.onClick}
                    className="flex items-center rounded-sm bg-primary text-background p-2 pr-3 pl-3 text-sm"
                  >
                    <Plus className="mr-2 h-5 w-5" /> {addButton.label}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Search & Filter Section */}
        {(searchFilter?.enabled || statusFilter?.enabled) && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            {searchFilter?.enabled && (
              <input
                type="text"
                placeholder={searchFilter.placeholder || "Search..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-1/3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            )}

            {/* Status Filter */}
            {statusFilter?.enabled && (
              <select
                value={statusFilterValue?.toString() || "all"}
                onChange={(e) => {
                  const value = e.target.value;
                  setStatusFilterValue(
                    value === "all" ? "all" : 
                    value === "true" ? true : 
                    value === "false" ? false : 
                    value
                  );
                }}
                className="w-full sm:w-1/7 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                {statusFilter.options.map((option) => (
                  <option key={option.label} value={option.value?.toString() || "all"}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-primary">
              <TableRow>
                <TableHead className="pl-4 text-background">S. No.</TableHead>
                {columns.map((column) => (
                  <TableHead 
                    key={column.key.toString()} 
                    className={`text-background ${column.headerClassName || ''}`}
                  >
                    {column.header}
                  </TableHead>
                ))}
                {actions.length > 0 && (
                  <TableHead className="text-right pr-4 text-background">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentData.length > 0 ? (
                currentData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="pl-4">
                      {startIndex + index + 1}
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell 
                        key={`${index}-${column.key.toString()}`}
                        className={column.className || ''}
                      >
                        {column.accessor 
                          ? column.accessor(row)
                          : getNestedValue(row, column.key)
                        }
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell className="text-right pr-4">
                        <div className="flex justify-end gap-2">
                          {actions.map((action, actionIndex) => (
                            action.variant === 'icon' ? (
                              <button
                                key={actionIndex}
                                onClick={() => action.onClick(row)}
                                className={`cursor-pointer ${action.className || ''}`}
                              >
                                {action.icon}
                              </button>
                            ) : (
                              <button
                                key={actionIndex}
                                onClick={() => action.onClick(row)}
                                className={`flex cursor-pointer rounded-sm p-1 pr-2 pl-2 text-xs ${action.className || ''}`}
                              >
                                {action.icon && <span className="mr-1">{action.icon}</span>}
                                {action.label}
                              </button>
                            )
                          ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions.length > 0 ? 2 : 1)} className="py-2 text-center text-gray-500">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {pagination.enabled && filteredData.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <p>
              Showing{" "}
              <span className="font-semibold">
                {startIndex + 1}-{Math.min(startIndex + (pagination.itemsPerPage || 8), filteredData.length)}
              </span>{" "}
              of <span className="font-semibold">{filteredData.length}</span> items
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`rounded-md border px-3 py-1 flex items-center gap-1 ${
                  currentPage === 1
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-primary hover:text-white"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`rounded-md border px-3 py-1 flex items-center gap-1 ${
                  currentPage === totalPages
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-primary hover:text-white"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UniTable;
