'use client';

import React, { useEffect, useState } from 'react';
import { Switch } from '@radix-ui/react-switch';
import { ChevronLeft } from 'lucide-react';
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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

  const handlebannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // ✅ Only require at least one image
      if (!imageUrls.small && !imageUrls.tablet && !imageUrls.large) {
        toast.error('Please upload at least one banner image');
        return;
      }

      if (!form.tag) {
        toast.error('Please select a tag');
        return;
      }

      // ✅ Build payload - send only the images that were uploaded
      const payload: any = {
        title: form.title.trim(),
        tag: form.tag.trim(),
        bannerUrl: form.bannerUrl.trim(),
        description: form.description.trim(),
        isActive: form.status,
      };

      // ✅ Add image URLs only if they exist
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

      // Reset form after successful submission
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
            <label className="block text-sm font-medium">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2 focus:border-primary focus:outline-none"
            />
          </div>

          {/* ✅ Tag Dropdown */}
          <div>
            <label className="block text-sm font-medium">Tag *</label>
            <select
              name="tag"
              value={form.tag}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2 focus:border-primary focus:outline-none"
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
              className="w-full rounded border px-3 py-2 focus:border-primary focus:outline-none"
            />
          </div>

          {/* ✅ IMAGES IN A SINGLE ROW - ALL OPTIONAL */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium mb-4">
              Banner Images <span className="text-gray-500 text-xs">(Upload at least one image)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Small Image */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Small (Mobile) (Optional)</label>
                <input
                  type="file"
                  name="small"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded border px-3 py-2 mb-2 text-sm"
                />
                {/* ✅ Fixed size container */}
                <div className="relative w-full h-40 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {images.small || imageUrls.small ? (
                    <Image
                      height={160}
                      width={320}
                      src={images.small ? URL.createObjectURL(images.small) : imageUrls.small}
                      alt="Small preview"
                      className="w-full h-full object-contain"
                      priority
                    />
                  ) : (
                    <p className="text-gray-400 text-xs text-center">No image selected</p>
                  )}
                </div>
                {imageUrls.small && (
                  <p className="mt-2 text-xs text-green-600 font-medium">✓ Uploaded</p>
                )}
              </div>

              {/* Tablet Image */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Tablet (Optional)</label>
                <input
                  type="file"
                  name="tablet"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded border px-3 py-2 mb-2 text-sm"
                />
                {/* ✅ Fixed size container */}
                <div className="relative w-full h-40 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {images.tablet || imageUrls.tablet ? (
                    <Image
                      height={160}
                      width={320}
                      src={images.tablet ? URL.createObjectURL(images.tablet) : imageUrls.tablet}
                      alt="Tablet preview"
                      className="w-full h-full object-contain"
                      priority
                    />
                  ) : (
                    <p className="text-gray-400 text-xs text-center">No image selected</p>
                  )}
                </div>
                {imageUrls.tablet && (
                  <p className="mt-2 text-xs text-green-600 font-medium">✓ Uploaded</p>
                )}
              </div>

              {/* Large Image */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Large (Desktop) (Optional)</label>
                <input
                  type="file"
                  name="large"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded border px-3 py-2 mb-2 text-sm"
                />
                {/* ✅ Fixed size container */}
                <div className="relative w-full h-40 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {images.large || imageUrls.large ? (
                    <Image
                      height={160}
                      width={320}
                      src={images.large ? URL.createObjectURL(images.large) : imageUrls.large}
                      alt="Large preview"
                      className="w-full h-full object-contain"
                      priority
                    />
                  ) : (
                    <p className="text-gray-400 text-xs text-center">No image selected</p>
                  )}
                </div>
                {imageUrls.large && (
                  <p className="mt-2 text-xs text-green-600 font-medium">✓ Uploaded</p>
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
              className="w-full rounded border px-3 py-2 focus:border-primary focus:outline-none"
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
