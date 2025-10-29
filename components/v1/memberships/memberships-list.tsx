'use client';

import React from 'react';
import { useMembershipStore } from '@/store/membershipStore';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { FilePenLine, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function MembershipList() {
  const memberships = useMembershipStore((state) => state.memberships);
  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="max-h-[89vh] w-full overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Membership List</p>
          <Link
            href="/membership/create-membership"
            className="flex cursor-pointer rounded bg-orange-400 px-3 py-2 text-sm text-white transition hover:bg-orange-500"
          >
            <Plus className="mr-2 h-5 w-5" /> Create Membership
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableCaption className="mt-0 py-2">A list of your recent invoices.</TableCaption>
            <TableHeader className="sticky top-0 z-10 bg-gray-100">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-4 text-center text-gray-500">
                    No memberships found.
                  </TableCell>
                </TableRow>
              ) : (
                memberships.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell>{m.name}</TableCell>
                    <TableCell>{m.description || '-'}</TableCell>
                    <TableCell>
                      {m.icon ? (
                        <Image height={1000} width={1000} src={m.icon} alt="icon" className="inline-block h-6 w-6" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {m.color ? (
                        <span className="rounded px-2 py-1 text-white" style={{ backgroundColor: m.color }}>
                          {m.color}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{m.sortOrder}</TableCell>
                    <TableCell>
                      {m.isActive ? (
                        <span className="font-medium text-green-600">Active</span>
                      ) : (
                        <span className="font-medium text-red-600">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <FilePenLine className="w-5 cursor-pointer text-blue-600" />
                        <Trash2 className="w-5 cursor-pointer text-red-600" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
