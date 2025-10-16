'use client';

import React from 'react';
import { useMembershipTierStore } from '@/store/membershipTierStore';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { FilePenLine, Plus, Trash2 } from 'lucide-react';

export default function MembershipTierList() {
  const tiers = useMembershipTierStore((state) => state.tiers);
  const router = useRouter();

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="max-h-[89vh] w-full overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-6 flex items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Membership Tier List</p>
          <Link
            href="/membership/membership-tier-create"
            className="flex cursor-pointer rounded bg-orange-400 px-3 py-2 text-sm text-white transition hover:bg-orange-500"
          >
            <Plus className="mr-2 h-5 w-5" /> Create Membership Tier
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membership ID</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Validity Days</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-4 text-center text-gray-500">
                  No membership tiers found.
                </TableCell>
              </TableRow>
            ) : (
              tiers.map((tier, index) => (
                <TableRow key={index}>
                  <TableCell>{tier.memberShipId}</TableCell>
                  <TableCell>{tier.sortOrder}</TableCell>
                  <TableCell>
                    {tier.isActive ? (
                      <span className="font-medium text-green-600">Active</span>
                    ) : (
                      <span className="font-medium text-red-600">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell>{tier.validityDays}</TableCell>
                  <TableCell>₹{tier.amount}</TableCell>
                  <TableCell>{tier.description}</TableCell>
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
  );
}
