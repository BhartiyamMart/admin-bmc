'use client';

import React, { useEffect, useState } from 'react';
import { Switch } from '@radix-ui/react-switch';
import { Check, ChevronDown, ChevronLeft, Plus, Trash2, Layout, FileText, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { createBanner, editBanner, getBannerById, getAllTags } from '@/apis/banners.api';
import toast from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { uploadFile } from '@/utils/file-upload.utils';
import { ITag } from '@/interface/banner.interface';

export default function CreateEditBanner() {
  const router = useRouter();
  const params = useParams();
  const bannerId = params?.id as string | undefined; // Get ID from URL
  const isEditMode = !!bannerId; // Determine if editing

  const [form, setForm] = useState({
    title: '',
    tag: '',
    priority: 0,
    bannerUrl: '',
    description: '',
    status: false,
  });

  // ✅ Store UUIDs instead of S3 URLs
  const [imageIds, setImageIds] = useState({
    small: '',
    large: '',
  });

  // Store S3 URLs only for preview
  const [previews, setPreviews] = useState({
    small: '',
    large: '',
  });

  const [tags, setTags] = useState<ITag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState({
    small: false,
    large: false,
  });
  const [tagOpen, setTagOpen] = useState(false);

  // ✅ Fetch existing banner data if editing
  const fetchBannerData = async (id: string) => {
    try {
      setInitialLoading(true);
      const response = await getBannerById(id);

      if (response.error || !response.payload) {
        toast.error(response.message || 'Failed to fetch banner details');
        router.push('/banner/banner-list');
        return;
      }

      const banner = response.payload;

      // ✅ Populate form with existing data
      setForm({
        title: banner.banner.title,
        tag: banner.banner.tag,
        priority: banner.banner.priority,
        bannerUrl: banner.banner.bannerUrl || '',
        description: banner.banner.description || '',
        status: banner.banner.status,
      });

      // ✅ Set image previews (S3 URLs)
      setPreviews({
        small: banner.banner.imageSmall.url,
        large: banner.banner.imageLarge.url,
      });

      // ✅ Store image IDs (you need to extract file IDs from URLs if needed)
      // If your backend returns file IDs, use those. Otherwise, keep URLs.
      // For now, assuming you'll upload new images or keep existing URLs
      setImageIds({
        small: '', // Will be set only if user uploads new image
        large: '',
      });
    } catch (error) {
      console.error('Error fetching banner:', error);
      toast.error('Failed to load banner details');
      router.push('/banner/banner-list');
    } finally {
      setInitialLoading(false);
    }
  };

  // ✅ Fetch tags
  const fetchTags = async () => {
    try {
      const response = await getAllTags();

      if (response.error) {
        toast.error('Failed to fetch tags');
        return;
      }

      if (response?.payload?.tags && Array.isArray(response.payload.tags)) {
        setTags(response.payload.tags);
      } else {
        console.warn('Tags not found in expected format:', response);
        setTags([]);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
      toast.error('Error fetching tags');
    }
  };

  // ✅ Initial data loading
  useEffect(() => {
    fetchTags();

    if (isEditMode && bannerId) {
      fetchBannerData(bannerId);
    }
  }, [bannerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // ✅ Parse number inputs to actual numbers
    const parsedValue = type === 'number' ? (value === '' ? 0 : Number(value)) : value;

    setForm((prev) => ({ ...prev, [name]: parsedValue }));
  };

  // ✅ Upload handler
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target as {
      name: 'small' | 'large';
      files: FileList | null;
    };

    if (!files || !files[0]) return;

    const file = files[0];

    try {
      setUploading((prev) => ({ ...prev, [name]: true }));

      // Upload using utility
      const result = await uploadFile({
        file,
        path: 'BANNER',
        fileType: 'IMAGE',
        maxSizeInMB: 5,
        compressToMB: 2,
        maxDimension: name === 'large' ? 2560 : 1024,
        showToast: true,
      });

      if (!result.success || !result.fileId) {
        throw new Error(result.error || 'Upload failed');
      }

      // ✅ Store UUID for backend
      setImageIds((prev) => ({ ...prev, [name]: result.fileId! }));

      // ✅ Store S3 URL for preview only
      setPreviews((prev) => ({ ...prev, [name]: result.fileUrl! }));
    } catch (error) {
      console.error('Image upload error:', error);
      // Clean up on error
      setPreviews((prev) => ({ ...prev, [name]: '' }));
      setImageIds((prev) => ({ ...prev, [name]: '' }));
    } finally {
      setUploading((prev) => ({ ...prev, [name]: false }));
      e.target.value = '';
    }
  };

  const handleDeleteImage = (imageType: 'small' | 'large') => {
    if (previews[imageType]) URL.revokeObjectURL(previews[imageType]);
    setPreviews((prev) => ({ ...prev, [imageType]: '' }));
    setImageIds((prev) => ({ ...prev, [imageType]: '' }));
  };

  // ✅ Submit handler with proper create/edit logic
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.tag) {
      toast.error('Please select a tag');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Description is required');
      return;
    }

    // ✅ In edit mode, images are optional (only upload if changed)
    // In create mode, images are required
    if (!isEditMode) {
      if (!imageIds.small || !imageIds.large) {
        toast.error('Please upload both small and large banner images');
        return;
      }
    }

    try {
      setLoading(true);

      // ✅ Create payload
      const payload = {
        title: form.title.trim(),
        tag: form.tag,
        priority: form.priority || 0,
        bannerUrl: form.bannerUrl.trim() || '',
        description: form.description.trim(),
        isActive: form.status,
        // Use new image IDs if uploaded, otherwise keep existing (in edit mode)
        imageUrlSmall: imageIds.small || previews.small, // ✅ Fallback to existing
        imageUrlLarge: imageIds.large || previews.large, // ✅ Fallback to existing
      };

      console.log('Submitting payload:', payload);

      let response;

      if (isEditMode && bannerId) {
        // ✅ Edit existing banner
        response = await editBanner(bannerId, payload);
        if (!response.error) {
          toast.success('Banner updated successfully!');
        }
      } else {
        // ✅ Create new banner
        response = await createBanner(payload);
        if (!response.error) {
          toast.success('Banner created successfully!');
        }
      }

      if (response.error) {
        throw new Error(response.message || `Failed to ${isEditMode ? 'update' : 'create'} banner`);
      }

      router.push('/banner/banner-list');
    } catch (error: any) {
      console.error('Banner operation error:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get tag label from value
  const getTagLabel = (value: string) => {
    const tag = tags.find((t) => t.value === value);
    return tag ? tag.label : value;
  };

  // Show loading spinner while fetching banner data
  if (initialLoading) {
    return (
      <div className="flex h-[calc(100vh-8vh)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
          <p className="text-gray-600">Loading banner details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar max-h-[89vh] w-full overflow-y-auto rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h1 className="text-lg font-semibold">{isEditMode ? 'Edit Banner' : 'Create Banner'}</h1>
          <Link
            href="/banner/banner-list"
            className="bg-primary text-background flex items-center rounded px-3 py-2 text-sm transition hover:opacity-90"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleBannerSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <div className="bg-sidebar rounded border-t shadow-sm">
            <h3 className="flex items-center pt-8 pl-4 text-base font-semibold sm:text-lg">
              <Layout className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Basic Details
            </h3>
            <hr className="mt-7" />
            <div className="mt-2 grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium">
                  Title <span className="text-xs text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter banner title"
                  className="focus:border-primary mt-1 w-full rounded border p-2 focus:outline-none"
                />
              </div>

              {/* Tag Selection */}
              <div>
                <label className="block text-sm font-medium">
                  Tag <span className="text-red-500">*</span>
                </label>
                <Popover open={tagOpen} onOpenChange={setTagOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="focus:border-primary mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm focus:outline-none"
                    >
                      {form.tag ? getTagLabel(form.tag) : 'Select a tag'}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-(--radix-popover-trigger-width) p-2"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <Command>
                      <CommandInput placeholder="Search tag..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No tag found.</CommandEmpty>
                        <CommandGroup>
                          {tags.map((tag) => (
                            <CommandItem
                              key={tag.value}
                              value={tag.label}
                              onSelect={() => {
                                setForm((prev) => ({ ...prev, tag: tag.value }));
                                setTagOpen(false);
                              }}
                              className="cursor-pointer"
                            >
                              {tag.label}
                              <Check
                                className={`ml-auto h-4 w-4 ${form.tag === tag.value ? 'opacity-100' : 'opacity-0'}`}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium">Priority</label>
                <input
                  type="number"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className="focus:border-primary mt-1 w-full rounded border p-2 focus:outline-none"
                />
              </div>

              {/* Banner URL */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium">Redirect URL</label>
                <input
                  type="text"
                  name="bannerUrl"
                  value={form.bannerUrl}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="focus:border-primary mt-1 w-full rounded border p-2 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Description & Status */}
          <div className="bg-sidebar rounded border-t shadow-sm">
            <h3 className="flex items-center pt-8 pl-4 text-base font-semibold sm:text-lg">
              <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Content & Visibility
            </h3>
            <hr className="mt-7" />
            <div className="mt-2 space-y-4 p-4">
              <div>
                <label className="block text-sm font-medium">
                  Description <span className="text-xs text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Enter banner description"
                  className="focus:border-primary mt-1 w-full rounded border p-2 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between rounded border p-4">
                <div>
                  <label htmlFor="isactive" className="block text-sm font-medium">
                    Status
                  </label>
                  <p className="text-foreground/60 text-xs">
                    {form.status ? 'Banner is active and visible' : 'Banner is currently hidden'}
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
          </div>

          {/* Section 3: Media Upload */}
          <div className="bg-sidebar rounded border-t shadow-sm">
            <h3 className="flex items-center pt-8 pl-4 text-base font-semibold sm:text-lg">
              <ImageIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Banner Media
              {isEditMode && (
                <span className="ml-2 text-xs text-gray-500">(Upload new images to replace existing)</span>
              )}
            </h3>
            <hr className="mt-7" />
            <div className="mt-4 grid gap-6 p-4 md:grid-cols-2">
              {(['small', 'large'] as const).map((type) => (
                <div key={type} className="flex flex-col">
                  <label className="mb-2 block text-sm font-medium capitalize">
                    {type} Banner {!isEditMode && <span className="text-xs text-red-500">*</span>}
                  </label>
                  <div className="border-foreground/20 hover:border-primary relative rounded-lg border-2 border-dashed p-2 transition-colors">
                    <input
                      type="file"
                      name={type}
                      id={`upload-${type}`}
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploading[type]}
                    />
                    <label
                      htmlFor={`upload-${type}`}
                      className="flex h-40 cursor-pointer flex-col items-center justify-center bg-gray-50/50"
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
                        <div className="text-muted-foreground flex flex-col items-center gap-1">
                          <Plus className="h-6 w-6" />
                          <span className="text-[10px]">Upload {type} image</span>
                        </div>
                      )}
                    </label>
                    {previews[type] && !uploading[type] && (
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(type)}
                        className="absolute -top-2 -right-2 z-10 cursor-pointer rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex items-center gap-4 px-2">
            <Button
              type="submit"
              disabled={loading || uploading.small || uploading.large}
              className="bg-primary text-background border-foreground cursor-pointer rounded border px-8 py-2 font-medium transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update Banner' : 'Create Banner'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
