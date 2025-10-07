// "use client";

// import React from "react";
// import Link from "next/link";
// import { Plus, FilePenLine, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
// } from "@/components/ui/dropdown-menu";
// import useDocumentTypeStore from "@/store/documentTypeStore";

// const DocumentTypeList = () => {
//   const { documentTypes } = useDocumentTypeStore();

 

//   return (
//     <div className="flex min-h-screen justify-center bg-gray-100 p-4">
//       <div className="w-full max-h-[89vh] overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
//         {/* Header */}
//         <div className="mb-4 flex w-full items-center justify-between">
//           <p className="text-md font-semibold">Document Types</p>
//           <Link href="/employee-management/document-typeform">
//             <Button className="bg-orange-400 hover:bg-orange-500 text-white">
//               <Plus className="mr-2 h-4 w-4" /> Add Document Type 
//             </Button>
//           </Link>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto border rounded-lg">
//         <Table>
//           <TableHeader className="sticky top-0 bg-gray-100 z-10">
//             <TableRow>
//               <TableHead className="pl-4">S.No</TableHead> 
//               <TableHead>ID</TableHead>
//               <TableHead>Document Code</TableHead>
//               <TableHead>Label</TableHead>
//               <TableHead className="text-right pr-4">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {documentTypes.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={5} className="text-center text-gray-500">
//                   No Document Types Added
//                 </TableCell>
//               </TableRow>
//             ) : (
//               documentTypes.map((doc, index) => (
//                 <TableRow key={doc.id}>
//                   <TableCell className="pl-4">{index + 1}</TableCell>
//                   <TableCell>{doc.id}</TableCell>
//                   <TableCell>{doc.code}</TableCell>
//                   <TableCell>{doc.label}</TableCell>
//                   <TableCell className="text-right pr-4">
//                       <div className="flex justify-end gap-2">
//                         <FilePenLine className="cursor-pointer w-5 text-blue-600"/>
//                         <Trash2 className="cursor-pointer w-5 text-red-600" />
//                       </div>
//                     </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DocumentTypeList;


"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FilePenLine, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommonTable from "@/components/v1/common/common-table/common-table"; // ✅ import the common table
import useDocumentTypeStore from "@/store/documentTypeStore";

const DocumentTypeList = () => {
  const { documentTypes } = useDocumentTypeStore();

  const columns = [
    {
      key: "sno",
      label: "S.No",
      render: (_:any, index:any) => index + 1,
    },
    { key: "id", label: "ID" },
    { key: "code", label: "Document Code" },
    { key: "label", label: "Label" },
    {
      key: "actions",
      label: "Actions",
      render: () => (
        <div className="flex justify-end gap-2 pr-4">
          <FilePenLine className="cursor-pointer w-5 text-blue-600" />
          <Trash2 className="cursor-pointer w-5 text-red-600" />
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
              <Plus className="mr-2 h-4 w-4" /> Add Document Type
            </Button>
          </Link>
        </div>

        {/* Common Table */}
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
