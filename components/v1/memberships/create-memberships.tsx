"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import { useMembershipStore } from "@/store/membershipStore";
import Link from "next/link";

export default function CreateMembership() {
    const router = useRouter();
    const addMembership = useMembershipStore((state) => state.addMembership);

    const [form, setForm] = useState({
        name: "",
        description: "",
        icon: "",
        color: "",
        sortOrder: 0,
        isActive: true,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addMembership(form);
        router.push("/membership/membership-list");
    };

    return (
        <div className="flex min-h-screen justify-center bg-gray-100 p-4">
            <div className="max-h-[89vh] w-full overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
                <div className="flex justify-between items-center border-b mb-6">
                    <p className="text-md font-semibold">Create Membership</p>
                    <Link
                        href="/membership/membership-list"
                        className="flex cursor-pointer rounded bg-orange-400 px-3 py-2 text-sm text-white transition hover:bg-orange-500"
                    >
                        <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
                    </Link>

                </div>

                <form onSubmit={handleSubmit} className="bg-white  rounded-lg  space-y-4 max-w-2xl">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-normal">Name</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="w-full border rounded px-3 py-2" />
                        </div>
                        <div>
                            <label className="block mb-1 font-normal">Icon URL</label>
                            <input
                                name="icon"
                                value={form.icon}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-normal">Color (Hex)</label>
                            <input
                                name="color"
                                value={form.color}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                                placeholder="#FF5733"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-normal">Sort Order</label>
                            <input
                                type="number"
                                name="sortOrder"
                                value={form.sortOrder}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block mb-1 font-normal">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={form.isActive}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 checked:bg-orange-500"
                            />
                            <label className="font-medium">Active</label>
                        </div> 
                    </div>

                    <button
                        type="submit"
                        className="bg-orange-500 cursor-pointer w-[320px] text-white py-2 rounded"
                    >
                        Save Membership
                    </button>
                </form>
            </div>
        </div>
    );
}
