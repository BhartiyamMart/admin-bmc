'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft} from 'lucide-react';
import { Switch } from '@radix-ui/react-switch';

const AddMembershipPlans = () => {
  const [color, setColor] = useState('');
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="max-h-[89vh] w-full overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <h2 className="text-lg font-semibold">Add Membership</h2>
          <Link
            href="/membership/membership-plans-list"
            className="flex cursor-pointer items-center gap-2 rounded bg-orange-400 px-3 py-2 text-sm text-white transition hover:bg-orange-500"
          >
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Link>
        </div>

        <form className="space-y-4 rounded-lg bg-white">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block font-medium">Name</label>
              <input type="text" name="Name" required className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block font-medium">Status</label>
              <select name="status" className="w-full rounded border px-3 py-2">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <div>
                <label className="mb-1 block font-medium">Description</label>
                <textarea name="description" required className="w-full rounded border px-3 py-2" />
              </div>
            </div>
            <div>
              <div>
                <label className="mb-1 block font-medium">Icon</label>
                <input
                  type="file"
                  name="file"
                  className="w-full rounded border border-gray-300 px-3 py-1 text-sm file:mr-4 file:rounded file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-white hover:file:bg-orange-600"
                />
              </div>
            </div>
            <div>
              <div>
                <label className="mb-1 block font-medium">Color</label>
                <input
                  type="text"
                  name="color"
                  value={color}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#([0-9A-Fa-f]{0,6})$/.test(value) || value === '') {
                      setColor(value);
                    }
                  }}
                  placeholder="#FFFFFF"
                  maxLength={7}
                  className="w-full rounded border border-gray-300 px-3 py-3 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block font-medium">Sort Order</label>
              <select name="sortorder" className="w-full rounded border px-3 py-3">
                <option value="sortByTime">Sort By Time</option>
                <option value="sortByPrice">Sort By Price</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="isactive" className="font-medium">
                  IsActive
                </label>
                <Switch
                  id="isactive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isActive ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Switch>
              </div>
            </div>
          </div>
          <button type="submit" className="mt-0 w-[320px] rounded bg-orange-500 py-2 text-white">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMembershipPlans;
