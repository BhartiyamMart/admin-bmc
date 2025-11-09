'use client';

import React, { useState } from 'react';

import { Switch } from '@radix-ui/react-switch';
import { ChevronLeft} from 'lucide-react';
import Link from 'next/link';
import { createBanner, createPreassignedUrl } from '@/apis/create-banners.api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';


export default function CreateBanner() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    tag: '',
    bannerUrl: '', // ✅ added
    small: null,
    tablet: null,
    large: null,
    description: '',
    status: false,
  });

  const [imageUrls, setImageUrls] = useState({
    small: '',
    tablet: '',
    large: '',
  });

  const [images, setImages] = useState({
    small: null,
    tablet: null,
    large: null,
  });
   
 

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlebannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate image uploads first
      if (!imageUrls.small || !imageUrls.tablet || !imageUrls.large) {
        toast.error('Please upload all banner images first');
        return;
      }

      // Prepare the payload
      const payload = {
        title: form.title.trim().toUpperCase(),
        tag: form.tag.trim().toUpperCase(),
        priority: 1,
        imageUrlSmall: imageUrls.small,
        imageUrlMedium: imageUrls.tablet,
        imageUrlLarge: imageUrls.large,
        bannerUrl: form.bannerUrl.trim(),
        description: form.description.trim().toUpperCase(),
        isActive: form.status,
      };

      console.log('Submitting payload:', payload);

      // Call the backend API once
      const response = await createBanner(payload);

      if (response.error) {
        toast.error(response.message || 'Failed to create banner');
        return;
      }
     
      router.push('/banner/banner-list');
      toast.success('Banner created successfully!');
      console.log('Banner created:', response.payload);

      // Reset form after successful submission
      setForm({
        title: '',
        tag: '',
        bannerUrl: '',
        small: null,
        tablet: null,
        large: null,
        description: '',
        status: false,
      });
      setImageUrls({ small: '', tablet: '', large: '' });
      setImages({ small: null, tablet: null, large: null });
    } catch (error) {
      console.error('Create banner error:', error);
      toast.error('Something went wrong');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;

    const file = files[0];
    const fileType = file.type;
    const fileName = `banner-${name}-${Date.now()}-${file.name}`;

    try {
      // Get pre-signed URL
      const response = await createPreassignedUrl({
        fileName,
        fileType,
      });

      if (response.error || !response.payload) {
        toast.error('Failed to get upload URL');
        return;
      }

      const { presignedUrl, fileUrl } = response.payload.payload;

      // Upload image to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': fileType,
        },
      });

      if (!uploadResponse.ok) {
        toast.error('Failed to upload image');
        return;
      }

      // Save image URLs
      setImageUrls((prev) => ({
        ...prev,
        [name]: fileUrl,
      }));

      // Save file info for preview
      setImages((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Store URLs in localStorage (optional)
      localStorage.setItem(
        'bannerImages',
        JSON.stringify({
          ...JSON.parse(localStorage.getItem('bannerImages') || '{}'),
          [name]: fileUrl,
        })
      );

      toast.success(`${name} image uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded-lg p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Create Banner</p>
          <Link
            href="/banner/banner-list"
            className="bg-primary text-background flex cursor-pointer rounded px-3 py-2 text-sm transition"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        <form onSubmit={handlebannerSubmit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Tag</label>
            <input
              type="text"
              name="tag"
              value={form.tag}
              onChange={handleChange}
              required

              className="w-full rounded border px-3 py-2 mt-1"
            />
          </div>

          {/* ✅ New Banner URL Field */}
          <div>
            <label className="block text-sm font-medium">Banner URL *</label>
            <input
              type="text"
              name="bannerUrl"
              value={form.bannerUrl}
              onChange={handleChange}
              placeholder="https://example.com"
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          {/* Small Image */}
          <div>
            <label className="block text-sm font-medium">Upload Image for Small Screen*</label>
            <input
              type="file"
              name="small"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded border px-3 py-2 mt-1"
            />
            {images.small && (
              <div className="mt-2">
                <Image
                 height={1000}
                 width={1000}
                  src={URL.createObjectURL(images.small)}
                  alt="Small preview"
                  className="h-20 w-auto object-contain"
                  
                />
                <p className="mt-1 text-xs text-gray-500">
                  {imageUrls.small ? '✓ Uploaded' : 'Uploading...'}
                </p>
              </div>
            )}
          </div>

          {/* Tablet Image */}
          <div>
            <label className="block text-sm font-medium">Upload Image for Tablet Screen*</label>
            <input
              type="file"
              name="tablet"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded border px-3 py-2 mt-1"
            />
            {images.tablet && (
              <div className="mt-2">
                <Image
                  height={1000}
                  width={1000}
                  src={URL.createObjectURL(images.tablet)}
                  alt="Tablet preview"
                  className="h-20 w-auto object-contain"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {imageUrls.tablet ? '✓ Uploaded' : 'Uploading...'}
                </p>
              </div>
            )}
          </div>

          {/* Large Image */}
          <div>
            <label className="block text-sm font-medium">Upload Image for Large Screen*</label>
            <input
              type="file"
              name="large"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded border px-3 py-2 mt-1"
            />
            {images.large && (
              <div className="mt-2">
                <Image
                  height={1000}
                  width={1000}
                  src={URL.createObjectURL(images.large)}
                  alt="Large preview"
                  className="h-20 w-auto object-contain"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {imageUrls.large ? '✓ Uploaded' : 'Uploading...'}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
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


          {/* Status Switch */}

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
          <div className='col-span-2'>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2 mt-1"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-3">
            <button
              type="submit"
              className="bg-primary text-background mt-5 cursor-pointer rounded-sm px-20 py-2 transition"
            >
              Create Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
