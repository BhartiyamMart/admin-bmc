'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CommonTableProps } from '@/interface/common.interface';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const CommonTable = <T,>({
  columns,
  data,
  emptyMessage = 'No data found.',
  sortConfig: controlledSortConfig,
  onSort: controlledOnSort,
}: CommonTableProps<T>): React.ReactElement => {
  const [internalSortConfig, setInternalSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  const isControlled = controlledSortConfig !== undefined && controlledOnSort !== undefined;
  const sortConfig = isControlled ? controlledSortConfig! : internalSortConfig;

  const handleSort = (key: string) => {
    if (isControlled) {
      controlledOnSort!(key);
    } else {
      setInternalSortConfig((prev) => {
        if (prev.key === key) {
          return {
            key,
            direction: prev.direction === 'asc' ? 'desc' : 'asc',
          };
        }
        return { key, direction: 'asc' };
      });
    }
  };

  const displayData = React.useMemo(() => {
    // If controlled, we assume data is already sorted by the parent
    if (isControlled) return data;

    if (!internalSortConfig.key) return data;

    return [...data].sort((a, b) => {
      // Handle nested keys if necessary, strictly using the 'key' string for now as simpler CommonTable
      const aValue = (a as any)[internalSortConfig.key!];
      const bValue = (b as any)[internalSortConfig.key!];

      if (aValue < bValue) {
        return internalSortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return internalSortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, isControlled, internalSortConfig]);

  return (
    <div className="overflow-auto rounded border">
      <Table>
        <TableHeader className="bg-primary sticky top-0 z-10">
          <TableRow>
            {columns.map((col, i) => (
              <TableHead
                key={col.key}
                className={`text-background w-40 max-w-40 min-w-40 truncate ${i === columns.length - 1 ? 'text-right pr-5' : ''
                  } ${col.sortable ? 'cursor-pointer select-none hover:bg-primary/90' : ''}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className={`flex items-center gap-2 ${i === columns.length - 1 ? 'justify-end' : ''}`}>
                  {col.label}
                  {col.sortable && (
                    <span>
                      {sortConfig.key === col.key ? (
                        sortConfig.direction === 'asc' ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {displayData.length > 0 ? (
            displayData.map((item, index) => (
              <TableRow key={index}>
                {columns.map((col) => (
                  <TableCell key={col.key} className="w-40 max-w-40 min-w-40 truncate">
                    {col.render ? col.render(item, index) : String(item[col.key as keyof T])}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-2 text-center text-gray-500">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CommonTable;
