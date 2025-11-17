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

  // ✅ Fetch all tags
  const fetchTags = async () => {
    try {
      const response = await getAllTags();
      console.log('Tags API Response:', JSON.stringify(response, null, 2));

      if (!response || response.error) {
        toast.error(response?.message || 'Failed to fetch tags');
        return;
      }

      let tagsList: string[] = [];

      if (response.payload?.bannerTags && Array.isArray(response.payload.bannerTags)) {
        tagsList = response.payload.bannerTags;
      } else if (Array.isArray(response.payload)) {
        tagsList = response.payload;
      }

      if (tagsList && tagsList.length > 0) {
        setTags(tagsList);
        console.log('Tags loaded successfully:', tagsList);
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

  // ✅ Fetch tags on component mount
  useEffect(() => {
    fetchTags();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;

    const file = files[0];
    const fileType = file.type;
    const fileName = `banner-${name}-${Date.now()}-${file.name}`;

    try {
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
        console.error('Could not extract presignedUrl or fileUrl from response:', response.payload);
        toast.error('Invalid upload URL received from server');
        return;
      }

      console.log('Uploading to S3:', presignedUrl);

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

      setImageUrls((prev) => ({
        ...prev,
        [name]: fileUrl,
      }));

      setImages((prev) => ({
        ...prev,
        [name]: file,
      }));

      toast.success(`${name} image uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  // ✅ NEW: Delete image handler
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

    toast.success(`${imageType} image removed`);
  };

  const handlebannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (!imageUrls.small && !imageUrls.tablet && !imageUrls.large) {
        toast.error('Please upload at least one banner image');
        return;
      }

      if (!form.tag) {
        toast.error('Please select a tag');
        return;
      }

      const payload = {
        title: form.title.trim(),
        tag: form.tag.trim(),
        bannerUrl: form.bannerUrl.trim(),
        description: form.description.trim(),
        isActive: form.status,
        imageUrlSmall: '',
        imageUrlMedium: '',
        imageUrlLarge: '',
      };

      if (imageUrls.small) {
        payload.imageUrlSmall = imageUrls.small;
      }
      if (imageUrls.tablet) {
        payload.imageUrlMedium = imageUrls.tablet;
      }
      if (imageUrls.large) {
        payload.imageUrlLarge = imageUrls.large;
      }

      console.log('Submitting payload:', payload);

      const response = await createBanner(payload);

      if (response.error) {
        toast.error(response.message || 'Failed to create banner');
        return;
      }

      router.push('/banner/banner-list');
      toast.success('Banner created successfully!');
      console.log('Banner created:', response.payload);

      setForm({
        title: '',
        tag: '',
        bannerUrl: '',
        description: '',
        status: false,
      });
      setImageUrls({ small: '', tablet: '', large: '' });
      setImages({ small: null, tablet: null, large: null });
    } catch (error) {
      console.error('Create banner error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded-lg p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Create Banner</p>
          <Link
            href="/banner/banner-list"
            className="bg-primary text-background flex cursor-pointer rounded px-3 py-2 text-sm transition hover:opacity-90"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        <form onSubmit={handlebannerSubmit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
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
              className="focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Tag *</label>
            <select
              name="tag"
              value={form.tag}
              onChange={handleChange}
              required
              className="text-foreground bg-sidebar w-full rounded border px-3 py-2"
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

          {/* ✅ IMAGE UPLOAD WITH DELETE BUTTON */}
          <div className="md:col-span-3">
            <label className="mb-4 block text-sm font-medium">Banner Images</label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Small Image */}
              <div>
                <label className="text-foreground mb-2 block text-xs font-medium">Small</label>
                <input
                  type="file"
                  name="small"
                  id="upload-small"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
                <div className="relative">
                  <label
                    htmlFor="upload-small"
                    className="bg-sidebar border-foreground relative flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed"
                  >
                    {images.small || imageUrls.small ? (
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
                      </div>
                    )}
                  </label>
                  {/* ✅ Delete Button - Only shown when image exists */}
                  {(images.small || imageUrls.small) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage('small')}
                      className="text-foreground absolute top-2 right-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-500 shadow-lg transition-all"
                      title="Delete image"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {imageUrls.small && <p className="mt-2 text-xs font-medium text-green-600">✓ Uploaded</p>}
              </div>

              {/* Large Image */}
              <div>
                <label className="text-foreground mb-2 block text-xs font-medium">Large</label>
                <input
                  type="file"
                  name="large"
                  id="upload-large"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
                <div className="relative">
                  <label
                    htmlFor="upload-large"
                    className="border-foreground relative flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed"
                  >
                    {images.large || imageUrls.large ? (
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
                      </div>
                    )}
                  </label>
                  {/* ✅ Delete Button */}
                  {(images.large || imageUrls.large) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage('large')}
                      className="text-foreground absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 shadow-lg transition-all"
                      title="Delete image"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {imageUrls.large && <p className="mt-2 text-xs font-medium text-green-600">✓ Uploaded</p>}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              className="focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
            />
          </div>

          {/* Status Switch */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between">
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

          {/* Submit Button */}
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-background mt-5 cursor-pointer rounded-sm px-20 py-2 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
