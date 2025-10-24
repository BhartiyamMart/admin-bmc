"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import useDocumentTypeStore from "@/store/documentTypeStore";
import { createDocumentType } from "@/apis/create-document-type.api"; //  your new API
import toast from "react-hot-toast";

const DocumentTypeForm = () => {
  const [form, setForm] = useState({
    code: "",
    label: "",
  });

  const addDocumentType = useDocumentTypeStore((state) => state.addDocumentType);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.code.trim()) {
      toast.error("Code is required");
      return;
    }

    try {
      const payload = {
        code: form.code.trim(),
        label: form.label.trim(), 
        };

      const response = await createDocumentType(payload);

      if (!response.error && response.status === 200) {
        // Add to store only if backend confirms success
        addDocumentType({
          code: form.code.trim(),
          label: form.label.trim(),
        });

        toast.success("Document type created successfully");
        router.push("/employee-management/document-typelist");
      } else {
        toast.error(response.message || "Failed to create document type");
      }
    } catch (err) {
      console.error("Error creating document type:", err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center bg-sidebar p-4">
      <div className="w-full overflow-y-auto rounded-lg  p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">Add Document Type</p>
          <Link
            href="/employee-management/document-typelist"
            className="flex cursor-pointer items-center gap-2 rounded bg-primary text-background px-3 py-2 text-sm transition "
          >
            <ChevronLeft className="h-4 w-4" /> Back to List
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input
              className="mt-1 w-full rounded-sm border p-2"
              id="code"
              placeholder="Enter document code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              className="mt-1 w-full rounded-sm border p-2"
              id="label"
              placeholder="Enter label"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            className="mt-5 w-full rounded-sm bg-primary text-background px-20 py-2 transition"
          >
            Save
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DocumentTypeForm;
