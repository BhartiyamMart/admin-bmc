// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { ChevronLeft, Loader2, Plus, CalendarIcon } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { format, startOfDay } from 'date-fns';
// import Image from 'next/image';

// import { Button } from '@/components/ui/button';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { Calendar } from '@/components/ui/calendar';
// import { Command, CommandList, CommandItem } from '@/components/ui/command';
// import { cn } from '@/lib/utils';

// import {
//   getCouponById,
//   updateCoupon,
// } from '@/apis/create-coupon.api';

// import { createPreassignedUrl } from '@/apis/create-banners.api';

// /* ---------------- Types ---------------- */

// interface CouponForm {
//   code: string;
//   title: string;
//   description: string;
//   type: 'PERCENT' | 'FIXED';
//   discountValue: number;
//   currentUsageCount: number;
//   status: 'ACTIVE' | 'INACTIVE';
//   expiryType: 'FIXED' | 'RELATIVE';
//   validFrom: Date;
//   validUntil?: Date;
//   relativeDays?: number;
//   targetNewUsers: boolean;
//   targetExistingUsers: boolean;
//   isAutoApplied: boolean;
//   couponImage: string;
//   termsAndConditions: string;
// }

// /* ---------------- Component ---------------- */

// export default function EditCoupon() {
//   const { id } = useParams<{ id: string }>();
//   const router = useRouter();
//   const today = startOfDay(new Date());

//   const [loading, setLoading] = useState(false);
//   const [pageLoading, setPageLoading] = useState(true);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string>('');

//   const [form, setForm] = useState<CouponForm | null>(null);

//   /* ---------------- Fetch coupon ---------------- */

//   useEffect(() => {
//     const fetchCoupon = async () => {
//       try {
//         const res = await getCouponById(id);
//         if (res.error || !res.payload) throw new Error(res.message);

//         const c = res.payload;

//         setForm({
//           code: c.code,
//           title: c.title,
//           description: c.description?.[0] ?? '',
//           type: c.discountUnit === 'PERCENTAGE' ? 'PERCENT' : 'FIXED',
//           discountValue: Number(c.discountValue),
//           currentUsageCount: c.currentUsageCount ?? 0,
//           status: c.status ? 'ACTIVE' : 'INACTIVE',
//           expiryType: c.expiryType,
//           validFrom: new Date(c.validFrom),
//           validUntil: c.validUntil ? new Date(c.validUntil) : undefined,
//           relativeDays: c.relativeDays ?? undefined,
//           targetNewUsers: c.targetNewUsers ?? false,
//           targetExistingUsers: c.targetExistingUsers ?? true,
//           isAutoApplied: c.isAutoApplied ?? false,
//           couponImage: c.couponImage,
//           termsAndConditions: c.termsAndConditions?.[0] ?? '',
//         });

//         setPreviewUrl(c.couponImage);
//       } catch (err: any) {
//         toast.error(err.message || 'Failed to load coupon');
//         router.push('/offers/coupon-list');
//       } finally {
//         setPageLoading(false);
//       }
//     };

//     fetchCoupon();
//   }, [id, router]);

//   /* ---------------- Helpers ---------------- */

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value, type } = e.target;
//     const val =
//       type === 'checkbox'
//         ? (e.target as HTMLInputElement).checked
//         : type === 'number'
//         ? Number(value)
//         : value;

//     setForm((p) => (p ? { ...p, [name]: val } : p));
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (previewUrl) URL.revokeObjectURL(previewUrl);
//     const url = URL.createObjectURL(file);

//     setPreviewUrl(url);
//     setSelectedFile(file);
//     e.target.value = '';
//   };

//   const uploadToS3 = async (file: File): Promise<string> => {
//     const response = await createPreassignedUrl({
//       fileName: `coupon-${Date.now()}-${file.name}`,
//       fileType: file.type,
//     });

//     if (response.error || !response.payload)
//       throw new Error('Failed to get upload URL');

//     const { presignedUrl, fileUrl } = response.payload;

//     const upload = await fetch(presignedUrl, {
//       method: 'PUT',
//       body: file,
//       headers: { 'Content-Type': file.type },
//     });

//     if (!upload.ok) throw new Error('Upload failed');

//     return fileUrl;
//   };

//   /* ---------------- Submit ---------------- */

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form) return;

//     try {
//       setLoading(true);

//       let imageUrl = form.couponImage;
//       if (selectedFile) imageUrl = await uploadToS3(selectedFile);

//       const payload = {
//         ...form,
//         couponImage: imageUrl,
//         validFrom: format(form.validFrom, 'dd-MM-yyyy'),
//         validUntil: form.validUntil
//           ? format(form.validUntil, 'dd-MM-yyyy')
//           : '',
//         status: form.status === 'ACTIVE',
//         description: [form.description.trim()],
//         termsAndConditions: [form.termsAndConditions.trim()],
//       };

//       const res = await updateCoupon(id, payload);
//       if (res.error) throw new Error(res.message);

//       toast.success('Coupon updated successfully');
//       router.push('/offers/coupon-list');
//     } catch (err: any) {
//       toast.error(err.message || 'Update failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- UI ---------------- */

//   if (pageLoading || !form) {
//     return (
//       <div className="flex h-[calc(100vh-8vh)] items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-[calc(100vh-8vh)] justify-center p-4">
//       <div className="bg-sidebar w-full overflow-y-auto rounded p-4 shadow-lg">
//         <div className="mb-4 flex items-center justify-between border-b pb-2">
//           <h2 className="text-lg font-semibold">Edit Coupon</h2>
//           <Link
//             href="/offers/coupon-list"
//             className="bg-primary text-primary-foreground flex items-center gap-2 rounded px-3 py-1.25 text-sm"
//           >
//             <ChevronLeft className="h-4 w-4" /> Back
//           </Link>
//         </div>

//         {/* 🔁 SAME FORM LAYOUT AS ADD COUPON */}
//         {/* You can paste the SAME JSX form body here */}
//         {/* Only difference is handleSubmit & initial state */}

//         {/* Banner Upload */}
//         <label className="mb-1 block text-sm font-medium">Coupon Banner</label>
//         <input type="file" id="couponImage" onChange={handleImageChange} hidden />
//         <label
//           htmlFor="couponImage"
//           className="relative flex h-52 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed"
//         >
//           {previewUrl ? (
//             <Image src={previewUrl} alt="Preview" fill className="object-contain p-4" unoptimized />
//           ) : (
//             <Plus className="h-8 w-8" />
//           )}
//         </label>

//         <Button
//           onClick={handleSubmit}
//           disabled={loading}
//           className="mt-6 w-[320px]"
//         >
//           {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Coupon'}
//         </Button>
//       </div>
//     </div>
//   );
// }
