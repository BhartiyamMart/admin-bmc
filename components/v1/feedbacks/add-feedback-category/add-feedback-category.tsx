'use client';

import React, { useState } from 'react';
import { Switch } from '@radix-ui/react-switch';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { addFeedBackCategory } from '@/apis/create-document-type.api'; // <-- use your correct API path

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      categoryName: form.categoryName,
      description: form.description,
      sortOrder: Number(form.sortOrder),
      maximumRating: Number(form.maximumRating),
      labels: form.labels.split(',').map((l) => l.trim()), // convert to array
      status: form.status,
    };

    console.log('Submitting Payload:', payload);

    try {
      const res = await addFeedBackCategory(payload);
      console.log('API Response:', res);
      alert('Feedback Category Added Successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar w-full overflow-y-auto rounded p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Add Feedback Category</p>
          <Link
            href="/feedbacks/feedback-category"
            className="bg-primary text-background flex cursor-pointer rounded px-3 py-2 text-sm transition"
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
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Sort Order *</label>
            <input
              type="number"
              name="sortOrder"
              value={form.sortOrder}
              onChange={handleChange}
              min={1}
              step={1}
              required
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Maximum Rating *</label>
            <input
              type="number"
              name="maximumRating"
              value={form.maximumRating}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Labels (comma separated)</label>
            <input
              type="text"
              name="labels"
              value={form.labels}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded border px-3 py-2"
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
              className="bg-primary text-background mt-5 cursor-pointer rounded px-20 py-2 transition"
            >
              Add Feedback Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
