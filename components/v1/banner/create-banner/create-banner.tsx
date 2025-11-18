'use client';

import React, { useEffect, useState } from 'react';
import { Switch } from '@radix-ui/react-switch';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createBanner, createPreassignedUrl, getAllTags } from '@/apis/create-banners.api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CreateBanner() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    tag: '',
    bannerUrl: '',
    description: '',
    status: false,
  });

  const [imageUrls, setImageUrls] = useState({
    small: '',
    tablet: '',
    large: '',
  });

  const [images, setImages] = useState<{
    small: File | null;
    tablet: File | null;
    large: File | null;
  }>({
    small: null,
    tablet: null,
    large: null,
  });

  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<{
    small: boolean;
    tablet: boolean;
    large: boolean;
  }>({
    small: false,
    tablet: false,
    large: false,
  });

  // ✅ Fetch all tags on mount
  const fetchTags = async () => {
    try {
      const response = await getAllTags();
      console.log('Tags API Response:', JSON.stringify(response, null, 2));

      if (!response || response.error) {
        toast.error(response?.message || 'Failed to fetch tags');
        return;
      }

      if (response.payload?.bannerTags && Array.isArray(response.payload.bannerTags)) {
        setTags(response.payload.bannerTags);
        console.log('Tags loaded successfully:', response.payload.bannerTags);
      } else {
        console.warn('No tags found in response');
        setTags([]);
      }
    } catch (err) {
      console.error('Fetch tags error:', err);
      toast.error('Error fetching tags');
      setTags([]);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // ✅ Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle image upload to S3
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;

    const file = files[0];
    const fileType = file.type;
    const fileName = `banner-${name}-${Date.now()}-${file.name}`;

    // Validate file type
    if (!fileType.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size should not exceed 5MB');
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [name]: true }));

      // Step 1: Get presigned URL
      const response = await createPreassignedUrl({
        fileName,
        fileType,
      });

      console.log('Presigned URL Response:', JSON.stringify(response, null, 2));

      if (response.error || !response.payload) {
        toast.error(response?.message || 'Failed to get upload URL');
        return;
      }

      const { presignedUrl, fileUrl } = response.payload;

      if (!presignedUrl || !fileUrl) {
        console.error('Missing presignedUrl or fileUrl in response');
        toast.error('Invalid upload URL received from server');
        return;
      }

      console.log('Uploading to S3:', presignedUrl);

      // Step 2: Upload file to S3
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': fileType,
        },
      });

      if (!uploadResponse.ok) {
        console.error('Upload failed with status:', uploadResponse.status);
        toast.error(`Failed to upload image (Status: ${uploadResponse.status})`);
        return;
      }

      // Step 3: Update state with uploaded file URL
      setImageUrls((prev) => ({
        ...prev,
        [name]: fileUrl,
      }));

      setImages((prev) => ({
        ...prev,
        [name]: file,
      }));

      toast.success(`${name.charAt(0).toUpperCase() + name.slice(1)} image uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading((prev) => ({ ...prev, [name]: false }));
    }
  };

  // ✅ Handle image deletion
  const handleDeleteImage = (imageType: 'small' | 'tablet' | 'large') => {
    setImages((prev) => ({
      ...prev,
      [imageType]: null,
    }));

    setImageUrls((prev) => ({
      ...prev,
      [imageType]: '',
    }));

    // Reset the file input
    const inputElement = document.getElementById(`upload-${imageType}`) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }

    toast.success(`${imageType.charAt(0).toUpperCase() + imageType.slice(1)} image removed`);
  };

  // ✅ Handle form submission
  const handlebannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!form.tag) {
      toast.error('Please select a tag');
      return;
    }

    if (!form.bannerUrl.trim()) {
      toast.error('Please enter a banner URL');
      return;
    }

    if (!form.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (!imageUrls.small && !imageUrls.large) {
      toast.error('Please upload at least Small or Large banner image');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: form.title.trim(),
        tag: form.tag.trim(),
        bannerUrl: form.bannerUrl.trim(),
        description: form.description.trim(),
        isActive: form.status,
        imageUrlSmall: imageUrls.small || '',
        imageUrlMedium: imageUrls.tablet || '',
        imageUrlLarge: imageUrls.large || '',
      };

      console.log('Submitting payload:', payload);

      const response = await createBanner(payload);

      if (response.error) {
        toast.error(response.message || 'Failed to create banner');
        return;
      }

      toast.success('Banner created successfully!');
      console.log('Banner created:', response.payload);

      // Redirect to banner list
      router.push('/banner/banner-list');
    } catch (error) {
      console.error('Create banner error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset form
  const handleReset = () => {
    setForm({
      title: '',
      tag: '',
      bannerUrl: '',
      description: '',
      status: false,
    });
    setImageUrls({ small: '', tablet: '', large: '' });
    setImages({ small: null, tablet: null, large: null });

    // Reset all file inputs
    ['small', 'tablet', 'large'].forEach((type) => {
      const inputElement = document.getElementById(`upload-${type}`) as HTMLInputElement;
      if (inputElement) {
        inputElement.value = '';
      }
    });
  };

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded-lg p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Create Banner</p>
          <Link
            href="/banner/banner-list"
            className="bg-primary text-background flex cursor-pointer items-center rounded px-3 py-2 text-sm transition hover:opacity-90"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handlebannerSubmit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Enter banner title"
              className="focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
            />
          </div>

          {/* Tag */}
          <div>
            <label className="block text-sm font-medium">
              Tag <span className="text-red-500">*</span>
            </label>
            <select
              name="tag"
              value={form.tag}
              onChange={handleChange}
              required
              className="text-foreground bg-sidebar focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
            >
              <option value="">Select Tag</option>
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))
              ) : (
                <option disabled>No tags available</option>
              )}
            </select>
          </div>

          {/* Banner URL */}
          <div>
            <label className="block text-sm font-medium">
              Banner URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="bannerUrl"
              value={form.bannerUrl}
              onChange={handleChange}
              placeholder="category/grocery"
              required
              className="focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
            />
          </div>

          {/* Image Upload Section */}
          <div className="md:col-span-3">
            <label className="mb-4 block text-sm font-medium">
              Banner Images <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Small Image */}
              <div>
                <label className="text-foreground mb-2 block text-xs font-medium">
                  Small <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  name="small"
                  id="upload-small"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploading.small}
                />
                <div className="relative">
                  <label
                    htmlFor="upload-small"
                    className={`bg-sidebar border-foreground hover:border-primary relative flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-all ${
                      uploading.small ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    {uploading.small ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="border-t-primary mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300"></div>
                        <p className="text-foreground text-xs">Uploading...</p>
                      </div>
                    ) : images.small || imageUrls.small ? (
                      <Image
                        height={160}
                        width={320}
                        src={images.small ? URL.createObjectURL(images.small) : imageUrls.small}
                        alt="Small preview"
                        className="h-full w-full object-contain"
                        priority
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-sidebar mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                          <Plus className="h-6 w-6" />
                        </div>
                        <p className="text-foreground text-center text-xs">Click to upload</p>
                        <p className="text-foreground/60 mt-1 text-center text-xs">Max 5MB</p>
                      </div>
                    )}
                  </label>
                  {(images.small || imageUrls.small) && !uploading.small && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage('small')}
                      className="absolute top-2 right-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600"
                      title="Delete image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {imageUrls.small && <p className="mt-2 text-xs font-medium text-green-600">✓ Uploaded</p>}
              </div>

              {/* Tablet/Medium Image */}
              <div>
                <label className="text-foreground mb-2 block text-xs font-medium">Medium (Optional)</label>
                <input
                  type="file"
                  name="tablet"
                  id="upload-tablet"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploading.tablet}
                />
                <div className="relative">
                  <label
                    htmlFor="upload-tablet"
                    className={`bg-sidebar border-foreground hover:border-primary relative flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-all ${
                      uploading.tablet ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    {uploading.tablet ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="border-t-primary mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300"></div>
                        <p className="text-foreground text-xs">Uploading...</p>
                      </div>
                    ) : images.tablet || imageUrls.tablet ? (
                      <Image
                        height={160}
                        width={320}
                        src={images.tablet ? URL.createObjectURL(images.tablet) : imageUrls.tablet}
                        alt="Tablet preview"
                        className="h-full w-full object-contain"
                        priority
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-sidebar mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                          <Plus className="h-6 w-6" />
                        </div>
                        <p className="text-foreground text-center text-xs">Click to upload</p>
                        <p className="text-foreground/60 mt-1 text-center text-xs">Max 5MB</p>
                      </div>
                    )}
                  </label>
                  {(images.tablet || imageUrls.tablet) && !uploading.tablet && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage('tablet')}
                      className="absolute top-2 right-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600"
                      title="Delete image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {imageUrls.tablet && <p className="mt-2 text-xs font-medium text-green-600">✓ Uploaded</p>}
              </div>

              {/* Large Image */}
              <div>
                <label className="text-foreground mb-2 block text-xs font-medium">
                  Large <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  name="large"
                  id="upload-large"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploading.large}
                />
                <div className="relative">
                  <label
                    htmlFor="upload-large"
                    className={`bg-sidebar border-foreground hover:border-primary relative flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-all ${
                      uploading.large ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    {uploading.large ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="border-t-primary mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300"></div>
                        <p className="text-foreground text-xs">Uploading...</p>
                      </div>
                    ) : images.large || imageUrls.large ? (
                      <Image
                        height={160}
                        width={320}
                        src={images.large ? URL.createObjectURL(images.large) : imageUrls.large}
                        alt="Large preview"
                        className="h-full w-full object-contain"
                        priority
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-sidebar mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                          <Plus className="h-6 w-6" />
                        </div>
                        <p className="text-foreground text-center text-xs">Click to upload</p>
                        <p className="text-foreground/60 mt-1 text-center text-xs">Max 5MB</p>
                      </div>
                    )}
                  </label>
                  {(images.large || imageUrls.large) && !uploading.large && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage('large')}
                      className="absolute top-2 right-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600"
                      title="Delete image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {imageUrls.large && <p className="mt-2 text-xs font-medium text-green-600">✓ Uploaded</p>}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Enter banner description"
              className="focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
            />
          </div>

          {/* Status Switch */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <label htmlFor="isactive" className="block text-sm font-medium">
                  Status
                </label>
                <p className="text-foreground/60 text-xs">
                  {form.status ? 'Banner is active and visible' : 'Banner is inactive'}
                </p>
              </div>
              <Switch
                id="isactive"
                checked={form.status}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, status: checked }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.status ? 'bg-primary' : 'bg-gray-300'
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

          {/* Action Buttons */}
          <div className="md:col-span-3">
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || uploading.small || uploading.tablet || uploading.large}
                className="bg-primary text-background cursor-pointer rounded-sm px-8 py-2 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Creating...
                  </span>
                ) : (
                  'Create Banner'
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="border-foreground text-foreground cursor-pointer rounded-sm border px-8 py-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
