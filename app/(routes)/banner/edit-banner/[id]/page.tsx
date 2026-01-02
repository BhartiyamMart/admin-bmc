'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Switch } from '@radix-ui/react-switch';
import { Check, ChevronDown, ChevronLeft, Plus, Trash2 } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

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
  // Inside your EditBannerPage component
  const [uploading, setUploading] = useState<{
    small: boolean;
    tablet: boolean;
    large: boolean;
  }>({
    small: false,
    tablet: false,
    large: false,
  });
  const [tagOpen, setTagOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<number[]>([]);
  const [allPriorities, setAllPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingBanner, setFetchingBanner] = useState<boolean>(true);
  const [previews, setPreviews] = useState<{
    small: string;
    tablet: string;
    large: string;
  }>({
    small: '',
    tablet: '',
    large: '',
  });

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
  // Place this inside your EditBannerPage component
  const handleDeleteImage = (imageType: 'small' | 'tablet' | 'large') => {
    // 1. Revoke the temporary preview URL to free up browser memory
    if (previews && previews[imageType]) {
      URL.revokeObjectURL(previews[imageType]);
    }

    // 2. Clear all related states for this image type
    setPreviews((prev) => ({ ...prev, [imageType]: '' }));
    setImages((prev) => ({ ...prev, [imageType]: null }));
    setImageUrls((prev) => ({ ...prev, [imageType]: '' }));

    // 3. Reset the hidden file input so the same file can be selected again
    const inputElement = document.getElementById(`upload-${imageType}`) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }
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
  const fieldClass =
    'mt-1 h-10 w-full rounded border px-3 text-sm flex items-center justify-between focus:border-primary focus:outline-none';

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

          <div>
            <label className="block text-sm font-medium">
              Tag <span className="text-red-500">*</span>
            </label>
            <Popover open={tagOpen} onOpenChange={setTagOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="focus:border-primary flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm focus:outline-none"
                >
                  {form.tag ? tags.find((t) => t === form.tag) : 'Select a tag'}
                  <ChevronDown className="ml-2 h-6 w-6" />
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
                          onSelect={(val) => {
                            setForm((prev) => ({ ...prev, tag: val, priority: 0 }));
                            fetchPriorities(val);
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

          {/* Priority Dropdown - Optional */}
          <div>
            <label className="block text-sm font-medium">Order</label>
            <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 w-full items-center justify-between rounded border px-3 text-sm focus:outline-none"
                >
                  {form.priority ? `Priority ${form.priority}` : 'Select Priority'}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>
              </PopoverTrigger>

              <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-2">
                <Command className="w-full">
                  <CommandInput placeholder="Search priority..." className="h-9" />
                  <CommandList>
                    <CommandItem
                      value="0"
                      onSelect={() => {
                        setForm((prev) => ({ ...prev, priority: 0 }));
                        setPriorityOpen(false);
                      }}
                    >
                      No Priority
                    </CommandItem>

                    {priorities.map((p) => (
                      <CommandItem
                        key={p}
                        value={p.toString()}
                        onSelect={() => {
                          setForm((prev) => ({ ...prev, priority: p }));
                          setPriorityOpen(false);
                        }}
                      >
                        Priority {p}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Status Messages */}
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
            <label className="block text-sm font-medium">
              Banner URL <span className="text-red-500">*</span>
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

          {/* ✅ IMAGES IN A SINGLE ROW - ALL OPTIONAL */}
          <div className="md:col-span-3">
            <label className="mb-4 block text-sm font-medium">
              Banner Images <span className="text-xs text-gray-500">(Click edit to upload new)</span>
            </label>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {(['small', 'large'] as const).map((type) => (
                <div key={type}>
                  <label className="mb-2 block text-xs font-medium text-gray-600 capitalize">
                    {type === 'small' ? 'Small (Mobile)' : 'Large (Desktop)'} <span className="text-red-500">*</span>
                  </label>

                  {/*  Hidden Input Field */}
                  <input
                    type="file"
                    id={`upload-${type}`}
                    name={type}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploading[type]}
                  />

                  {/*  Fixed size container with Edit Overlay */}
                  <div className="group relative flex h-40 w-full items-center justify-center overflow-hidden rounded border-2 border-dashed border-gray-300 bg-gray-50 transition-all">
                    {/* Image or Placeholder */}
                    {images[type] || imageUrls[type] ? (
                      <Image
                        height={160}
                        width={320}
                        src={images[type] ? URL.createObjectURL(images[type] as File) : imageUrls[type]}
                        alt={`${type} preview`}
                        className="h-full w-full object-contain"
                        unoptimized={!!images[type]}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Plus className="h-6 w-6 text-gray-400" />
                        <p className="text-xs text-gray-400">No image uploaded</p>
                      </div>
                    )}

                    {/* Trash Button */}
                    {(images[type] || imageUrls[type]) && !uploading[type] && (
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(type)}
                        className="absolute top-2 right-2 z-20 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    {/* Edit Overlay */}
                    <label
                      htmlFor={`upload-${type}`}
                      className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <div className="flex flex-col items-center text-white">
                        <Plus className="mb-1 h-6 w-6" />
                        <span className="text-[10px] font-bold tracking-wider uppercase">
                          {images[type] || imageUrls[type] ? 'Change Image' : 'Upload New'}
                        </span>
                      </div>
                    </label>

                    {/* Loading Overlay */}
                    {uploading[type] && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80">
                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                      </div>
                    )}
                  </div>

                  {/* Status indicator */}
                  {imageUrls[type] && (
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-[10px] font-medium text-green-600">
                        {images[type] ? '✓ Ready to Update' : '✓ Current Banner'}
                      </p>
                      {/* {images[type] && (
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(type)}
                          className="cursor-pointer text-[10px] text-red-500"
                        >
                          Cancel Changes
                        </button>
                      )} */}
                    </div>
                  )}
                </div>
              ))}
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
