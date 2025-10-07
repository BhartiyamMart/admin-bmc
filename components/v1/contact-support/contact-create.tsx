"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useContactSupportStore } from "@/store/contactSupportStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ContactSupportForm() {
  const router = useRouter();
  const addContact = useContactSupportStore((state) => state.addContact);

  const [form, setForm] = useState({ 
    title: "",
    description: "",
    name: "",
    phoneNumber: "",
    link: "",
    icon: "",
    address: "", 
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> 
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, icon: url }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    addContact({
      id: Math.random().toString(36).substr(2, 9),
      createdAt: now,
      updatedAt: now,
      ...form,
    });
    router.push("/contact-support"); 
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="max-h-[89vh] w-full overflow-y-auto rounded-lg bg-white p-4 shadow-lg">  

        <div className="flex justify-between items-center border-b pb-2  mb-6"> 
          <p className="text-md font-semibold">Create contact</p>
          <Link
            href="/contact-support/contact-list"
            className="flex cursor-pointer rounded bg-orange-400 px-3 py-2 text-sm text-white transition hover:bg-orange-500"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List 
          </Link> 
        </div>


      <form onSubmit={handleSubmit} className="space-y-4"> 
         <div className="mt-5 gap-4 grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3"> 
        <div>
          <Label className="block mb-1 font-normal" htmlFor="title">Title</Label> 
          <Input
            className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}   
            required
          />
        </div> 
        <div>
          <Label className="block mb-1 font-normal" htmlFor="name">Name</Label>
          <Input
            className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Select or type name"  
            required
          />
        </div>
        <div>
          <Label className="block mb-1 font-normal" htmlFor="phoneNumber">Phone Number</Label>
          <Input
            className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            id="phoneNumber"
            name="phoneNumber"
            value={form.phoneNumber} 
            onChange={handleChange}
            required
          />
        </div>
        </div>

         <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label className="block mb-1 font-normal" htmlFor="link">Link</Label> 
          <Input
            className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            id="link"
            name="link"
            value={form.link}
            onChange={handleChange} 
          />
        </div>

        <div>
          <Label className="block mb-1 font-normal" htmlFor="icon">Icon / Image</Label>  
          <Input
            className="mt-1 w-full rounded-sm border p-1 px-2 outline-none focus:ring-2 focus:ring-blue-500 "
            id="icon"
            name="icon"
            type="file"
            accept="image/*"
            onChange={handleFileChange} 
            required
          />
          {form.icon && (
            <img
              src={form.icon}
              alt="icon preview"
              className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div> 
        </div>

        
      <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label className="block mb-1 font-normal" htmlFor="address">Address</Label>
          <Textarea
            className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange} 
            required
          />
        </div>
        <div>
          <Label className="block mb-1 font-normal" htmlFor="description">Description</Label>
          <Textarea
            className="mt-1 w-full rounded-sm border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            id="description"
            name="description" 
            value={form.description} 
            onChange={handleChange}  
            required
          />
        </div>
        </div>

        <div className="flex space-x-2"> 
          <Button className="mt-5 rounded-sm bg-orange-400 px-20 py-2 text-white transition hover:bg-orange-500" type="submit">Save</Button>
          
        </div>
      </form>
    </div>
    </div>
  );
}
