"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommonTable from "@/components/v1/common/common-table/common-table";
import {
  getDocumentType,
  deleteDocumentType,
} from "@/apis/create-document-type.api"; // adjust import path if needed

interface DocumentType {
  id: string;
  code: string;
  label: string;
}

const DocumentTypeList = () => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch document types from API
  const fetchDocumentTypes = async () => {
    setLoading(true);
    try {
      const response = await getDocumentType();
      if (response && response.payload) {
        setDocumentTypes(response.payload); // ✅ API returns `payload`
      } else {
        console.warn("No payload found in response:", response);
      }
    } catch (error) {
      console.error("Failed to fetch document types", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  // Delete document type
  const handleDelete = async (id: string) => {
  
    try {
      const response = await deleteDocumentType(id);
      if (!response.error) {
        setDocumentTypes((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert("Failed to delete: " + response.message);
      }
    } catch (error) {
      console.error("Error deleting document type", error);
    }
  };

  // Table columns
  const columns = [
    {
      key: "sno",
      label: "S.No",
      render: (_: DocumentType, index: number) => index + 1,
    },
    { key: "code", label: "Document Code" },
    { key: "label", label: "Label" },
    {
      key: "actions",
      label: "Actions",
      render: (doc: DocumentType) => (
        <div className="flex justify-end gap-2 pr-4">
          
          <Trash2
            className="cursor-pointer w-5 text-red-600"
            onClick={() => handleDelete(doc.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center bg-sidebar p-4">
      <div className="w-full max-h-[89vh] overflow-y-auto rounded-lg  p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex w-full items-center justify-between">
          <p className="text-md font-semibold">Document Types</p>
          <Link href="/employee-management/document-typeform">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Document Type
            </Button>
          </Link>
        </div>

        <div className="min-w-[300px] w-full sm:w-[560px]  md:w-[640px] lg:w-[900px] xl:w-[1100px]"> 

        {/* Table */}
        <CommonTable
          columns={columns}
          data={documentTypes}
          emptyMessage={loading ? "Loading..." : "No Document Types Found"}
        />
      </div>
      </div>
    </div>
  );
};

export default DocumentTypeList;
