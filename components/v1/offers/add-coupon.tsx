// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { ChevronLeft } from "lucide-react";
// import { useCouponStore } from "@/store/couponStore";
// import Link from "next/link";

// export default function AddCoupon() {
//   const router = useRouter();
//   const addCoupon = useCouponStore((state) => state.addCoupon);

//   const [form, setForm] = useState({
//     code: "",
//     title: "",
//     description: "",
//     type: "PERCENT",
//     discountValue: 0,
//     currentUsageCount: 0,
//     status: "ACTIVE",
//     expiryType: "FIXED" as "FIXED" | "RELATIVE",
//     validFrom: new Date().toISOString().split("T")[0],
//     validUntil: "",
//     relativeDays: undefined as number | undefined,
//     targetNewUsers: false,
//     targetExistingUsers: true,
//     eligibleCities: [] as string[],
//     eligibleUserTypes: ["CUSTOMER"] as string[],
//     isAutoApplied: false,
//     bannerImage: "",
//     termsAndConditions: "",
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value, type } = e.target;
//     setForm({
//       ...form,
//       [name]:
//         type === "checkbox" && e.target instanceof HTMLInputElement
//           ? e.target.checked
//           : value,
//     });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     addCoupon(form);
//     router.push("/coupons"); // Navigate back to list
//   };

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-lg font-semibold">Add Coupon</h2>

//         <Link
//             href="/offers/coupon-list"
//             className="flex cursor-pointer items-center gap-2 rounded bg-orange-400 px-3 py-2 text-sm text-white transition hover:bg-orange-500"
//           >
//             <ChevronLeft className="h-4 w-4" /> Back to List
//           </Link>

        
//       </div>

//       <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4 max-w-2xl">
//         <div>
//           <label className="block mb-1 font-medium">Code</label>
//           <input name="code" value={form.code} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
//         </div>

//         <div>
//           <label className="block mb-1 font-medium">Title</label>
//           <input name="title" value={form.title} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
//         </div>

//         <div>
//           <label className="block mb-1 font-medium">Description</label>
//           <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block mb-1 font-medium">Type</label>
//             <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded px-3 py-2">
//               <option value="PERCENT">Percentage</option>
//               <option value="FIXED">Fixed Amount</option>
//             </select>
//           </div>

//           <div>
//             <label className="block mb-1 font-medium">Discount Value</label>
//             <input type="number" name="discountValue" value={form.discountValue} onChange={handleChange} className="w-full border rounded px-3 py-2" />
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block mb-1 font-medium">Valid From</label>
//             <input type="date" name="validFrom" value={form.validFrom} onChange={handleChange} className="w-full border rounded px-3 py-2" />
//           </div>

//           {form.expiryType === "FIXED" && (
//             <div>
//               <label className="block mb-1 font-medium">Valid Until</label>
//               <input type="date" name="validUntil" value={form.validUntil} onChange={handleChange} className="w-full border rounded px-3 py-2" />
//             </div>
//           )}
//         </div>

//         <div className="flex items-center gap-4">
//           <label className="flex items-center gap-2">
//             <input type="checkbox" name="targetNewUsers" checked={form.targetNewUsers} onChange={handleChange} /> Target New Users
//           </label>
//           <label className="flex items-center gap-2">
//             <input type="checkbox" name="targetExistingUsers" checked={form.targetExistingUsers} onChange={handleChange} /> Target Existing Users
//           </label>
//           <label className="flex items-center gap-2">
//             <input type="checkbox" name="isAutoApplied" checked={form.isAutoApplied} onChange={handleChange} /> Auto Apply
//           </label>
//         </div>

//         <button type="submit" className="bg-orange-500 text-white w-full py-2 rounded">Save</button>
//       </form>
//     </div>
//   );
// }



"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useCouponStore } from "@/store/couponStore";
import Link from "next/link";

export default function AddCoupon() {
  const router = useRouter();
  const addCoupon = useCouponStore((state) => state.addCoupon);

  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    type: "PERCENT",
    discountValue: 0,
    currentUsageCount: 0,
    status: "ACTIVE",
    expiryType: "FIXED" as "FIXED" | "RELATIVE",
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: "",
    relativeDays: undefined as number | undefined,
    targetNewUsers: false,
    targetExistingUsers: true,
    eligibleCities: [] as string[],
    eligibleUserTypes: ["CUSTOMER"] as string[],
    isAutoApplied: false,
    bannerImage: "",
    termsAndConditions: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]:
        type === "checkbox" && e.target instanceof HTMLInputElement
          ? e.target.checked
          : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCoupon(form);
    router.push("/offers/coupon-list"); // Navigate back to list 
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="w-full max-h-[89vh] overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
      <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
        <h2 className="text-lg font-semibold">Add Coupon</h2>
        <Link
            href="/offers/coupon-list"
            className="flex cursor-pointer items-center gap-2 rounded bg-orange-400 px-3 py-2 text-sm text-white transition hover:bg-orange-500"
          >
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg  space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-normal">Code</label>
            <input name="code" value={form.code} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-normal">Title</label>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-normal">Type</label>
            <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="PERCENT">Percentage</option>
              <option value="FIXED">Fixed Amount</option>
            </select>
          </div>
          
        </div>

    

        {/* Status and Usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <div>
            <label className="block mb-1 font-normal">Discount Value</label>
            <input type="number" name="discountValue" value={form.discountValue} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-normal">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-normal">Current Usage Count</label>
            <input type="number" name="currentUsageCount" value={form.currentUsageCount} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        {/* Expiry */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-normal">Expiry Type</label>
            <select name="expiryType" value={form.expiryType} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="FIXED">Fixed</option>
              <option value="RELATIVE">Relative</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-normal">Valid From</label>
            <input type="date" name="validFrom" value={form.validFrom} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>

          {form.expiryType === "FIXED" ? (
            <div>
              <label className="block mb-1 font-normal">Valid Until</label>
              <input type="date" name="validUntil" value={form.validUntil} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          ) : (
            <div>
              <label className="block mb-1 font-normal">Relative Days</label>
              <input type="number" name="relativeDays" value={form.relativeDays || ""} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          )}
        </div>

        

        {/* Eligible Users & Cities */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-normal">Eligible User Types</label>
            <input
              name="eligibleUserTypes"
              value={form.eligibleUserTypes.join(",")}
              onChange={(e) =>
                setForm({ ...form, eligibleUserTypes: e.target.value.split(",").map((v) => v.trim()) })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-normal">Eligible Cities</label>
            <input
              name="eligibleCities"
              value={form.eligibleCities.join(",")}
              onChange={(e) =>
                setForm({ ...form, eligibleCities: e.target.value.split(",").map((v) => v.trim()) })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
          <label className="block mb-1 font-normal">Banner Image URL</label>
          <input type="text" name="bannerImage" value={form.bannerImage} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        </div>

        {/* Banner and Terms */}
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">      
        <div>
          <label className="block mb-1 font-normal">Terms and Conditions</label>
          <textarea name="termsAndConditions" value={form.termsAndConditions} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1 font-normal">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        </div>

        {/* Targets */}
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="targetNewUsers" checked={form.targetNewUsers} onChange={handleChange} /> Target New Users
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="targetExistingUsers" checked={form.targetExistingUsers} onChange={handleChange} /> Target Existing Users
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isAutoApplied" checked={form.isAutoApplied} onChange={handleChange} /> Auto Apply
          </label>
        </div>

        <button type="submit" className="bg-orange-500 mt-0 text-white w-[320px] py-2 rounded">Save</button>
      </form>
    </div>
    </div>
  );
}

