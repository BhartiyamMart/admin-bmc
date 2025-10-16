"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CommonTableProps } from "@/interface/common.interface";

const CommonTable = <T,>({
  columns,
  data,
  emptyMessage = "No data found.",
}: CommonTableProps<T>): React.ReactElement => {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader className="sticky top-0 z-1 bg-primary">
          <TableRow>
            {columns.map((col, i) => (
              <TableHead
                key={col.key}
                className={`text-background ${i === columns.length - 1 ? "text-right" : ""}`}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <TableRow key={index}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render ? col.render(item, index) : String(item[col.key as keyof T])}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-2 text-center text-gray-500"
              >
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
