"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FilePenLine, Plus, Trash2 } from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table"; // ✅ Reusable table

const DocumentList = () => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Anand",
      customerName: "Anand Hindustanii",
      rating: 1,
      createdAt: "05 Oct 2025",
    },
  ]);

  // 🔍 Search
  const [searchTerm, setSearchTerm] = useState("");

  // 🧭 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 🧠 Filter + Search logic
  const filteredDocuments = useMemo(() => {
    return documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 🧭 Pagination controls
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // ✅ Table columns
  const columns = [
    { key: "sno", label: "S.No", render: (_:any, index:any) => startIndex + index + 1 },
    { key: "name", label: "Name" },
    { key: "customerName", label: "Customer Name" },
    { key: "rating", label: "Rating" },
    { key: "createdAt", label: "Created At" },
    {
      key: "actions",
      label: "Actions",
      render: (doc:any) => (
        <div className="flex justify-end gap-2 pr-4">
          <FilePenLine className="cursor-pointer w-5 text-blue-600" />
          <Trash2 className="cursor-pointer w-5 text-red-600" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="w-full rounded-lg bg-white p-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-md font-semibold">Documents</p>
          <Link href="/employee-management/document-upload">
            <Button
              className="flex rounded-sm p-2 pr-3 pl-3 text-sm text-white"
              style={{ backgroundColor: "#f07d02" }}
            >
              <Plus className="mr-2 h-5 w-5" /> Upload
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <input
            type="text"
            placeholder="Search by name or customer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-1/3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {/* ✅ CommonTable */}
        <CommonTable
          columns={columns}
          data={currentDocuments}
          emptyMessage="No documents found."
        />

        {/* 🧭 Pagination */}
        {filteredDocuments.length > 0 && (
          <div className="mt-4 flex w-[30%] float-end justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`rounded-md border px-3 py-1 ${
                currentPage === 1
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-primary hover:text-white"
              }`}
            >
              Previous
            </button>
            <span className="font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`rounded-md border px-3 py-1 ${
                currentPage === totalPages
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-primary hover:text-white"
              }`}
            >
              Next
            </button> 
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
