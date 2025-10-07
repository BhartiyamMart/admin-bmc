'use client';

import React, { useState } from 'react';
import { Switch } from '@radix-ui/react-switch';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddFeedbackCustomer() {
  const [form, setForm] = useState({
    categoryName: '',
    description: '',
    sortOrder: 1,
    maximumRating: '1',
    labels: '',
    status: false,
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log('Form Submitted:', form);
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="max-h-[89vh] w-full overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Add Feedback Category</p>
          <Link
            href="/feedbacks/feedback-category"
            className="flex cursor-pointer rounded bg-orange-400 px-3 py-2 text-sm text-white transition hover:bg-orange-500"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Category Name *</label>
            <input
              type="text"
              name="categoryName"
              value={form.categoryName}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Sort Order *</label>
            <input
              type="number"
              name="sortOrder"
              value={form.sortOrder}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2"
              min={1}
              step={1}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Maximum Rating *</label>
            <input
              type="text"
              name="maximumRating"
              value={form.maximumRating}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Labels</label>
            <input
              type="text"
              name="labels"
              value={form.labels}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <div className="mt-7 flex items-center justify-between">
              <label htmlFor="isactive" className="block text-sm font-medium">
                Status
              </label>
              <Switch
                id="isactive"
                checked={form.status}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, status: checked }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.status ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.status ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </Switch>
            </div>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="mt-5 rounded-sm bg-orange-400 px-20 py-2 text-white transition hover:bg-orange-500"
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
