'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Check, ChevronDown, ChevronLeft, Plus, Trash2, Layout, FileText, Image as ImageIcon } from 'lucide-react';
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
import { Button } from '@/components/ui/button';

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

  const [imageUrls, setImageUrls] = useState({ small: '', tablet: '', large: '' });
  const [images, setImages] = useState<{ small: File | null; tablet: File | null; large: File | null }>({
    small: null,
    tablet: null,
    large: null,
  });
  const [uploading, setUploading] = useState({ small: false, tablet: false, large: false });
  const [tagOpen, setTagOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<number[]>([]);
  const [allPriorities, setAllPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingBanner, setFetchingBanner] = useState<boolean>(true);

  const fetchPriorities = async (tag: string) => {
    if (!tag) return;
    try {
      const response = await getPrioritiesByTag(tag);
      if (!response || response.error) return;
      let allPriorityList: Priority[] = [];
      if (response.payload?.availablePriorities) allPriorityList = response.payload.availablePriorities;
      const available = allPriorityList
        .filter((p) => !p.isOccupied)
        .map((p) => p.value)
        .sort((a, b) => a - b);
      setAllPriorities(allPriorityList);
      setPriorities(available);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [tagRes, bannerRes] = await Promise.all([getAllTags(), getBannerById(id as string)]);
        if (tagRes?.payload?.bannerTags) setTags(tagRes.payload.bannerTags);
        if (!bannerRes.error) {
          const data = bannerRes.payload;
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
          if (data.tag) await fetchPriorities(data.tag);
        }
      } catch (err) {
        toast.error('Error loading data');
      } finally {
        setFetchingBanner(false);
      }
    };
    if (id) initializeData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;
    const file = files[0];
    try {
      setUploading((prev) => ({ ...prev, [name]: true }));
      const response = await createPreassignedUrl({ fileName: file.name, fileType: file.type });
      if (response.error) throw new Error();
      await fetch(response.payload.presignedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      setImageUrls((prev) => ({ ...prev, [name]: response.payload.fileUrl }));
      setImages((prev) => ({ ...prev, [name]: file }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleDeleteImage = (type: 'small' | 'tablet' | 'large') => {
    setImageUrls((prev) => ({ ...prev, [type]: '' }));
    setImages((prev) => ({ ...prev, [type]: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload: UpdateBannerPayload = {
        id: id as string,
        title: form.title.trim(),
        tag: form.tag,
        bannerUrl: form.bannerUrl.trim(),
        description: form.description.trim(),
        isActive: form.status,
        imageUrlSmall: imageUrls.small,
        imageUrlMedium: imageUrls.tablet,
        imageUrlLarge: imageUrls.large,
        priority: form.priority,
      };
      const response = await updateBanner(payload);
      if (response.error) throw new Error(response.message);
      toast.success('Banner updated');
      router.push('/banner/banner-list');
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingBanner) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="bg-sidebar max-h-[89vh] w-full overflow-y-auto rounded p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h1 className="text-lg font-semibold">Edit Banner</h1>
          <Link
            href="/banner/banner-list"
            className="bg-primary text-background flex items-center rounded px-3 py-2 text-sm transition hover:opacity-90"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-sidebar rounded border shadow-sm">
            <h3 className="flex items-center pt-8 pl-4 text-base font-semibold sm:text-lg">
              <Layout className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Basic Details
            </h3>
            <hr className="mt-7" />
            <div className="mt-2 grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
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
                  className="focus:border-primary mt-1 w-full rounded border p-2 focus:outline-none"
                />
              </div>

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
                                fetchPriorities(tag);
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

              <div>
                <label className="block text-sm font-medium">Order</label>
                <Popover open={priorityOpen} onOpenChange={setPriorityOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="focus:border-primary mt-1 flex w-full cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm focus:outline-none"
                    >
                      {form.priority ? `Priority ${form.priority}` : 'Select Priority'}
                      <ChevronDown className="h-6 w-6" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    /* FIX: Use var() syntax for Tailwind v4 and ensure p-0 if you want the list to touch the edges */
                    className="w-(--radix-popover-trigger-width) overflow-hidden p-0"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <Command className="max-h-none w-full">
                      <CommandInput placeholder="Search priority..." className="h-9 w-full" />
                      <CommandList className="max-h-none w-full">
                        <CommandEmpty>No priority found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="0 no priority"
                            className="cursor-pointer"
                            onSelect={() => {
                              setForm((prev) => ({ ...prev, priority: 0 }));
                              setPriorityOpen(false);
                            }}
                          >
                            No Priority
                            <Check className={`ml-auto h-4 w-4 ${form.priority === 0 ? 'opacity-100' : 'opacity-0'}`} />
                          </CommandItem>
                          {priorities.map((p) => (
                            <CommandItem
                              key={p}
                              value={`priority ${p}`}
                              className="cursor-pointer"
                              onSelect={() => {
                                setForm((prev) => ({ ...prev, priority: p }));
                                setPriorityOpen(false);
                              }}
                            >
                              Priority {p}
                              <Check
                                className={`ml-auto h-4 w-4 ${form.priority === p ? 'opacity-100' : 'opacity-0'}`}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

        

          <div className="bg-sidebar rounded border shadow-sm">
            <h3 className="flex items-center pt-8 pl-4 text-base font-semibold sm:text-lg">
              <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Content & Visibility
            </h3>
            <hr className="mt-7" />
            <div className="mt-2 space-y-4 p-4">
              <div>
                <label className="block text-sm font-medium">Redirect URL</label>
                <input
                  type="text"
                  name="bannerUrl"
                  value={form.bannerUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="focus:border-primary mt-1 w-full rounded border p-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="focus:border-primary mt-1 w-full rounded border p-2 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between rounded border p-4">
                <div>
                  <p className="text-sm font-medium">Banner Status</p>
                  <p className="text-muted-foreground text-xs">{form.status ? 'Active and visible' : 'Inactive'}</p>
                </div>
                <Switch
                  checked={form.status}
                  onCheckedChange={(c) => setForm((p) => ({ ...p, status: c }))}
                  className="cursor-pointer data-[state=checked]:bg-orange-500"
                />
              </div>
            </div>
          </div>
            <div className="bg-sidebar rounded border shadow-sm">
            <h3 className="flex items-center pt-8 pl-4 text-base font-semibold sm:text-lg">
              <ImageIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Banner Media
            </h3>
            <hr className="mt-7" />
            <div className="mt-4 grid gap-6 p-4 md:grid-cols-2 lg:grid-cols-3">
              {(['small', 'large'] as const).map((type) => (
                <div key={type} className="flex flex-col">
                  <label className="mb-2 block text-sm font-medium capitalize">{type} <span className='text-orange-500'>*</span></label>
                  <div className="group border-foreground/20 hover:border-primary relative flex h-40 items-center justify-center  rounded-lg border-2 border-dashed bg-gray-50/30 p-2 transition-colors">
                    <input
                      type="file"
                      id={`upload-${type}`}
                      onChange={handleImageChange}
                      name={type}
                      className="hidden"
                      accept="image/*"
                    />
                    {imageUrls[type] ? (
                      <Image
                        src={images[type] ? URL.createObjectURL(images[type]!) : imageUrls[type]}
                        alt="preview"
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    ) : (
                      <div className="text-muted-foreground flex flex-col items-center">
                        <Plus className="h-6 w-6" />
                        <span className="text-[10px]">Upload {type}</span>
                      </div>
                    )}
                    <label
                      htmlFor={`upload-${type}`}
                      className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <span className="text-xs font-bold text-white uppercase">Change Image</span>
                    </label>
                    {imageUrls[type] && (
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(type)}
                        className="absolute -top-3 -right-3 cursor-pointer rounded-full z-50 bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 px-2 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-background cursor-pointer rounded px-10 py-2 font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              className="border-foreground rounded border px-10 py-2 cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
