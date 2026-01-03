'use client';

import React, { useEffect, useState } from 'react';
import { Switch } from '@radix-ui/react-switch';
import { Check, ChevronDown, ChevronLeft, Plus, Trash2, Layout, FileText, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { createBanner, createPreassignedUrl, getAllTags } from '@/apis/create-banners.api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export default function CreateBanner() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    tag: '',
    bannerUrl: '',
    description: '',
    status: false,
  });

  const [imageUrls, setImageUrls] = useState({ small: '', tablet: '', large: '' });
  const [previews, setPreviews] = useState({ small: '', tablet: '', large: '' });
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState({ small: false, tablet: false, large: false });
  const [tagOpen, setTagOpen] = useState(false);
  const fetchTags = async () => {
    try {
      const response = await getAllTags();
      if (response?.payload?.bannerTags) setTags(response.payload.bannerTags);
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target as { name: 'small' | 'tablet' | 'large'; files: FileList | null };
    if (!files || !files[0]) return;

    const file = files[0];
    const fileType = file.type;
    const fileName = `banner-${name}-${Date.now()}-${file.name}`;

    if (!fileType.startsWith('image/')) return toast.error('Please upload a valid image file');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image size should not exceed 5MB');

    try {
      setUploading((prev) => ({ ...prev, [name]: true }));
      const previewUrl = URL.createObjectURL(file);
      if (previews[name]) URL.revokeObjectURL(previews[name]);
      setPreviews((prev) => ({ ...prev, [name]: previewUrl }));

      const response = await createPreassignedUrl({ fileName, fileType });
      if (response.error || !response.payload) throw new Error(response.message);

      const { presignedUrl, fileUrl } = response.payload;
      await fetch(presignedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': fileType } });

      setImageUrls((prev) => ({ ...prev, [name]: fileUrl }));
      toast.success(`${name} image uploaded`);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading((prev) => ({ ...prev, [name]: false }));
      e.target.value = '';
    }
  };

  const handleDeleteImage = (imageType: 'small' | 'tablet' | 'large') => {
    if (previews[imageType]) URL.revokeObjectURL(previews[imageType]);
    setPreviews((prev) => ({ ...prev, [imageType]: '' }));
    setImageUrls((prev) => ({ ...prev, [imageType]: '' }));
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

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar max-h-[89vh] w-full overflow-y-auto rounded p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h1 className="text-lg font-semibold">Create Banner</h1>
          <Link
            href="/banner/banner-list"
            className="bg-primary text-background flex items-center rounded px-3 py-2 text-sm transition hover:opacity-90"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        <form onSubmit={handlebannerSubmit} className="space-y-6">
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
                                    {form.tag ? tags.find((t) => t === form.tag) : 'Select a tag'}
                                    <ChevronDown className="ml-2 h-6 w-6" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-(--radix-popover-trigger-width) p-2"
                                  onOpenAutoFocus={(e) => e.preventDefault()}
                                >
                                  {/* 1. Removed shouldFilter={false} to enable the built-in search logic */}
                                  <Command>
                                    <CommandInput placeholder="Search tag..." className="h-9" />
                                    <CommandList>
                                      <CommandEmpty>No tag found.</CommandEmpty>
                                      <CommandGroup>
                                        {tags.map((tag) => (
                                          <CommandItem
                                            key={tag}
                                            value={tag} // 2. Ensure value is provided for the filter to match against
                                            onSelect={(currentValue) => {
                                              // 3. Use the value from the map or the callback to update state
                                              setForm((prev) => ({ ...prev, tag: tag, priority: 0 }));
                                              setTagOpen(false);
                                            }}
                                            className="cursor-pointer"
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
            </h3>
            <hr className="mt-7" />
            <div className="mt-4 grid gap-6 p-4 md:grid-cols-2 lg:grid-cols-3">
              {(['small', 'large'] as const).map((type) => (
                <div key={type} className="flex flex-col">
                  <label className="mb-2 block text-sm font-medium capitalize">
                    {type}  <span className="text-xs text-red-500">*</span>
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
              {loading ? 'Processing...' : 'Create Banner'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
