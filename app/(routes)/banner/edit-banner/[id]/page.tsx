'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Switch } from '@radix-ui/react-switch';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import {
  getBannerById,
  updateBanner,
  createPreassignedUrl,
  getAllTags,
  getPrioritiesByTag,
} from '@/apis/create-banners.api';
import { UpdateBannerPayload } from '@/interface/common.interface';

type Priority = {
  value: number;
  isOccupied: boolean;
};

export default function EditBannerPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    tag: '',
    priority: 0,
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
  const [priorities, setPriorities] = useState<number[]>([]);
  const [allPriorities, setAllPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingBanner, setFetchingBanner] = useState<boolean>(true);

  // ✅ Fetch all tags

  // ✅ Fetch priorities for selected tag - Filter only isOccupied: false
  const fetchPriorities = async (tag: string) => {
    if (!tag) {
      setPriorities([]);
      setAllPriorities([]);
      return;
    }

    try {
      const response = await getPrioritiesByTag(tag);

      if (!response || response.error) {
        console.warn('No priorities available for tag:', tag);
        setPriorities([]);
        setAllPriorities([]);
        return;
      }

      let allPriorityList: Priority[] = [];
      // CASE 1 → API gives correct Priority[]
      if (
        'payload' in response &&
        response.payload &&
        !Array.isArray(response.payload) &&
        Array.isArray(response.payload.availablePriorities)
      ) {
        allPriorityList = response.payload.availablePriorities;
      }

      // CASE 2 → API gives number[]
      else if (response.payload && Array.isArray(response.payload)) {
        allPriorityList = response.payload.map((p: number) => ({
          value: p,
          isOccupied: false,
        }));
      }

      // Available priorities = isOccupied: false
      const availablePriorities = allPriorityList
        .filter((p) => p.isOccupied === false)
        .map((p) => p.value)
        .sort((a, b) => a - b);

      setAllPriorities(allPriorityList);
      setPriorities(availablePriorities);

      console.log('All Priorities:', allPriorityList);
      console.log('Available Priorities:', availablePriorities);
    } catch (error) {
      console.error('Fetch Priority Error:', error);
      setPriorities([]);
      setAllPriorities([]);
    }
  };

  // ✅ Fetch banner details

  useEffect(() => {
    const initializeData = async () => {
      // 🔽 fetchTags logic moved here
      try {
        const response = await getAllTags();
        if (!response || response.error) {
          toast.error(response?.message || 'Failed to fetch tags');
        } else {
          let tagsList: string[] = [];

          if (response.payload?.bannerTags && Array.isArray(response.payload.bannerTags)) {
            tagsList = response.payload.bannerTags;
          } else if (Array.isArray(response.payload)) {
            tagsList = response.payload;
          }

          setTags(tagsList || []);
        }
      } catch (err) {
        console.error('Fetch Tags Error:', err);
        toast.error('Error fetching tags');
      }

      // 🔽 fetchBannerDetails logic moved here
      try {
        setFetchingBanner(true);
        const response = await getBannerById(id as string);

        if (response.error) {
          toast.error(response.message || 'Failed to fetch banner');
          router.push('/banner/banner-list');
          return;
        }

        const data = response.payload;

        setForm({
          title: data.title || '',
          tag: data.tag || '',
          priority: data.priority || 0,
          bannerUrl: data.bannerUrl || '',
          description: data.description || '',
          status: data.isActive ?? true,
        });

        setImageUrls({
          small: data.imageUrlSmall || '',
          tablet: data.imageUrlMedium || '',
          large: data.imageUrlLarge || '',
        });

        if (data.tag) {
          await fetchPriorities(data.tag);
        }
      } catch (err) {
        console.error('Fetch Banner Error:', err);
        toast.error('Error fetching banner details');
        router.push('/banner/banner-list');
      } finally {
        setFetchingBanner(false);
      }
    };

    if (id) initializeData();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTag = e.target.value;
    setForm((prev) => ({ ...prev, tag: newTag, priority: 0 }));
    await fetchPriorities(newTag);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = parseInt(e.target.value, 10);
    setForm((prev) => ({ ...prev, priority: newPriority }));
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

      if (response.error || !response.payload) {
        toast.error(response?.message || 'Failed to get upload URL');
        return;
      }

      // ✅ CORRECT: presignedUrl and fileUrl are directly in response.payload
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (!imageUrls.small && !imageUrls.tablet && !imageUrls.large) {
        toast.error('At least one banner image is required');
        return;
      }

      if (!form.tag) {
        toast.error('Please select a tag');
        return;
      }

      const payload: UpdateBannerPayload = {
        id: id as string,
        title: form.title.trim(),
        tag: form.tag.trim(),
        bannerUrl: form.bannerUrl.trim(),
        description: form.description.trim(),
        isActive: form.status,
      };

      if (imageUrls.small) payload.imageUrlSmall = imageUrls.small;
      if (imageUrls.tablet) payload.imageUrlMedium = imageUrls.tablet;
      if (imageUrls.large) payload.imageUrlLarge = imageUrls.large;

      if (form.priority > 0) payload.priority = form.priority;

      const response = await updateBanner(payload);

      if (response.error) {
        toast.error(response.message || 'Failed to update banner');
        return;
      }

      toast.success('Banner updated successfully');
      router.push('/banner/banner-list');
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Error updating banner');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingBanner) {
    return (
      <div className="bg-sidebar flex h-[calc(100vh-8vh)] items-center justify-center">
        <p className="text-center text-gray-500">Loading banner details...</p>
      </div>
    );
  }

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Edit Banner</p>
          <Link
            href="/banner/banner-list"
            className="bg-primary text-background flex cursor-pointer rounded px-3 py-2 text-sm transition hover:opacity-90"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Title *</label>
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
              onChange={handleTagChange}
              required
              className="focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
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

          {/* ✅ Priority Dropdown - Optional */}
          <div>
            <label className="block text-sm font-medium">Order</label>
            <select
              name="priority"
              value={form.priority || ''}
              onChange={handlePriorityChange}
              disabled={!form.tag || priorities.length === 0}
              className="focus:border-primary w-full rounded border px-3 py-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value={0}>No Priority</option>
              {priorities.map((p) => (
                <option key={p} value={p}>
                  Priority {p}
                </option>
              ))}
            </select>
            {form.tag && priorities.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">No available priorities (all occupied)</p>
            )}
            {form.tag && priorities.length > 0 && allPriorities.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                Available: {priorities.length} / {allPriorities.length}
              </p>
            )}
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
              className="focus:border-primary w-full rounded border px-3 py-2 focus:outline-none"
            />
          </div>

          {/* ✅ IMAGES IN A SINGLE ROW - ALL OPTIONAL */}
          <div className="md:col-span-3">
            <label className="mb-4 block text-sm font-medium">
              Banner Images <span className="text-xs text-gray-500">(Keep existing or upload new)</span>
            </label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Small Image - OPTIONAL */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-600">
                  Small (Mobile) <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="file"
                  name="small"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-2 w-full rounded border px-3 py-2 text-sm"
                />
                {/* ✅ Fixed size container */}
                <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded border-2 border-dashed border-gray-300 bg-gray-100">
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
                    <p className="text-center text-xs text-gray-400">No image</p>
                  )}
                </div>
                {imageUrls.small && (
                  <p className="mt-2 text-xs font-medium text-green-600">{images.small ? '✓ Updated' : '✓ Existing'}</p>
                )}
              </div>

              {/* Tablet Image - OPTIONAL */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-600">
                  Tablet <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="file"
                  name="tablet"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-2 w-full rounded border px-3 py-2 text-sm"
                />
                {/* ✅ Fixed size container */}
                <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded border-2 border-dashed border-gray-300 bg-gray-100">
                  {images.tablet || imageUrls.tablet ? (
                    <Image
                      height={160}
                      width={320}
                      src={images.tablet ? URL.createObjectURL(images.tablet) : imageUrls.tablet}
                      alt="Tablet preview"
                      className="h-full w-full object-contain"
                      priority
                    />
                  ) : (
                    <p className="text-center text-xs text-gray-400">No image</p>
                  )}
                </div>
                {imageUrls.tablet && (
                  <p className="mt-2 text-xs font-medium text-green-600">
                    {images.tablet ? '✓ Updated' : '✓ Existing'}
                  </p>
                )}
              </div>

              {/* Large Image - OPTIONAL */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-600">
                  Large (Desktop) <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="file"
                  name="large"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-2 w-full rounded border px-3 py-2 text-sm"
                />
                {/* ✅ Fixed size container */}
                <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded border-2 border-dashed border-gray-300 bg-gray-100">
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
                    <p className="text-center text-xs text-gray-400">No image</p>
                  )}
                </div>
                {imageUrls.large && (
                  <p className="mt-2 text-xs font-medium text-green-600">{images.large ? '✓ Updated' : '✓ Existing'}</p>
                )}
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
              className="bg-primary text-background mt-5 cursor-pointer rounded px-20 py-2 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
