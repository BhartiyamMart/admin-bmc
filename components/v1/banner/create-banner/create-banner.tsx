'use client';

import React, { useEffect, useState } from 'react';
import { Switch } from '@radix-ui/react-switch';
import { Check, ChevronDown, ChevronLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createBanner, createPreassignedUrl, getAllTags } from '@/apis/create-banners.api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function CreateBanner() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    tag: '',
    bannerUrl: '',
    description: '',
    status: false,
  });

  // Final S3 URLs
  const [imageUrls, setImageUrls] = useState({
    small: '',
    tablet: '',
    large: '',
  });

  // ✅ NEW: Stable preview URLs to prevent "twinkling" / flickering
  const [previews, setPreviews] = useState({
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
      if (response?.payload?.bannerTags) {
        setTags(response.payload.bannerTags);
      }
    } catch (err) {
      toast.error('Error fetching tags');
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Updated: Handles upload and stable preview generation
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target as { name: 'small' | 'tablet' | 'large'; files: FileList | null };
    if (!files || !files[0]) return;

    const file = files[0];
    const fileType = file.type;
    const fileName = `banner-${name}-${Date.now()}-${file.name}`;

    if (!fileType.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should not exceed 5MB');
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [name]: true }));

      // 1. Generate stable preview to fix flickering
      const previewUrl = URL.createObjectURL(file);

      // Clean up old preview if it exists
      if (previews[name]) URL.revokeObjectURL(previews[name]);

      setPreviews((prev) => ({ ...prev, [name]: previewUrl }));
      setImages((prev) => ({ ...prev, [name]: file }));

      // 2. S3 Upload Logic
      const response = await createPreassignedUrl({ fileName, fileType });
      if (response.error || !response.payload) {
        toast.error(response?.message || 'Failed to get upload URL');
        return;
      }

      const { presignedUrl, fileUrl } = response.payload;
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': fileType },
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      setImageUrls((prev) => ({ ...prev, [name]: fileUrl }));
      toast.success(`${name} image uploaded`);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading((prev) => ({ ...prev, [name]: false }));
      // Reset input value so same file can be re-selected if deleted
      e.target.value = '';
    }
  };

  // Updated: Added URL revocation for memory management
  const handleDeleteImage = (imageType: 'small' | 'tablet' | 'large') => {
    if (previews[imageType]) {
      URL.revokeObjectURL(previews[imageType]);
    }

    setPreviews((prev) => ({ ...prev, [imageType]: '' }));
    setImages((prev) => ({ ...prev, [imageType]: null }));
    setImageUrls((prev) => ({ ...prev, [imageType]: '' }));
    toast.success(`${imageType} image removed`);
  };

  const handlebannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.tag || !imageUrls.small) {
      toast.error('Please fill required fields and upload main banner');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: form.title.trim(),
        tag: form.tag,
        bannerUrl: form.bannerUrl.trim(),
        description: form.description.trim(),
        isActive: form.status,
        imageUrlSmall: imageUrls.small,
        imageUrlMedium: imageUrls.tablet,
        imageUrlLarge: imageUrls.large,
      };

      const response = await createBanner(payload);
      if (response.error) throw new Error(response.message);

      toast.success('Banner created!');
      router.push('/banner/banner-list');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    Object.values(previews).forEach((url) => url && URL.revokeObjectURL(url));
    setForm({ title: '', tag: '', bannerUrl: '', description: '', status: false });
    setPreviews({ small: '', tablet: '', large: '' });
    setImageUrls({ small: '', tablet: '', large: '' });
    setImages({ small: null, tablet: null, large: null });
  };
  const fieldClass =
    ' h-10 w-full rounded border px-3 text-sm flex items-center justify-between focus:border-primary focus:outline-none';

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded p-4 shadow-lg">
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
              className={fieldClass}
            />
          </div>

          {/* Tag */}
          <div>
            <label className="block text-sm font-medium">
              Tag <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="focus:border-primary flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm focus:outline-none"
                >
                  {form.tag ? tags.find((t) => t === form.tag) : 'Select a tag'}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-2">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search tag..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No tag found.</CommandEmpty>
                    <CommandGroup>
                      {tags.map((tag) => (
                        <CommandItem
                          key={tag}
                          value={tag}
                          className="cursor-pointer"
                          onSelect={(val) => setForm((prev) => ({ ...prev, tag: val }))}
                        >
                          {tag}
                          <Check className={`ml-auto h-4 w-4 ${form.tag === tag ? 'opacity-100' : 'opacity-0'}`} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Banner URL */}
          <div>
            <label className="block text-sm font-medium">
              Banner URL <span className="text-red-500"></span>
            </label>
            <input
              type="text"
              name="bannerUrl"
              value={form.bannerUrl}
              onChange={handleChange}
              placeholder="https://example.com"
              required
              className={fieldClass}
            />
          </div>

          {/* Image Upload Section */}
          <div className="grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-3">
            {(['small', 'large'] as const).map((type) => (
              <div key={type}>
                <label className="mb-2 block text-xs font-medium capitalize">
                  {type} <span className="text-red-500">*</span>
                </label>

                <input
                  type="file"
                  name={type}
                  id={`upload-${type}`}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploading[type]}
                />

                <div className="relative">
                  <label
                    htmlFor={`upload-${type}`}
                    className={`bg-sidebar flex h-40 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed transition-all ${uploading[type] ? 'opacity-50' : 'hover:border-primary'}`}
                  >
                    {uploading[type] ? (
                      <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
                    ) : previews[type] ? (
                      <Image
                        src={previews[type]}
                        alt={`${type} preview`}
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Plus className="text-muted-foreground h-6 w-6" />
                        <span className="text-muted-foreground text-[10px]">Upload {type} banner</span>
                      </div>
                    )}
                  </label>

                  {previews[type] && !uploading[type] && (
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(type)}
                      className="absolute top-2 right-2 z-10 cursor-pointer rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
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
            <div className="flex items-center justify-between rounded border p-4">
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
                className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${
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

          {/* Action Buttons */}
          <div className="md:col-span-3">
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || uploading.small || uploading.tablet || uploading.large}
                className="bg-primary text-background cursor-pointer rounded px-8 py-2 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="border-foreground text-foreground cursor-pointer rounded border px-8 py-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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
