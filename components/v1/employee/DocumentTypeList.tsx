"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FilePenLine, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommonTable from "@/components/v1/common/common-table/common-table";

interface DocumentType {
  id: string | number;
  code: string;
  label: string;
}

const LOCAL_STORAGE_KEY = "documentTypes";

const DocumentTypeList = () => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);

  // Load document types from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: DocumentType[] = JSON.parse(stored);
        setDocumentTypes(parsed);
      } catch (error) {
        console.error("Failed to parse document types from localStorage", error);
      }
    }
  }, []);

  // Save document types to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(documentTypes));
  }, [documentTypes]);

  // Table columns
  const columns = [
    {
      key: "sno",
      label: "S.No",
      render: (_: DocumentType, index: number) => index + 1,
    },
    { key: "id", label: "ID" },
    { key: "code", label: "Document Code" },
    { key: "label", label: "Label" },
    {
      key: "actions",
      label: "Actions",
      render: (doc: DocumentType) => (
        <div className="flex justify-end gap-2 pr-4">
          <FilePenLine
            className="cursor-pointer w-5 text-blue-600"
            // example edit handler
            onClick={() => alert(`Edit document type: ${doc.id}`)}
          />
          <Trash2
            className="cursor-pointer w-5 text-red-600"
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to delete document type: ${doc.label}?`
                )
              ) {
                setDocumentTypes((prev) =>
                  prev.filter((d) => d.id !== doc.id)
                );
              }
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="w-full max-h-[89vh] overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between">
          <p className="text-md font-semibold">Document Types</p>
          <Link href="/employee-management/document-typeform">
            <Button className="bg-orange-400 hover:bg-orange-500 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Document Type
            </Button>
          </Link>
        </div>

        {/* Table */}
        <CommonTable
          columns={columns}
          data={documentTypes}
          emptyMessage="No Document Types Added"
        />
      </div>
    </div>
  );
};

export default DocumentTypeList;
