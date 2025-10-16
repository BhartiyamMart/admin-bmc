// "use client";

// import React from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import Link from "next/link";
// import useEmployeePermissionStore from "@/store/employeePermissionStore";
// import { FilePenLine, Plus, Trash2 } from "lucide-react";

// const EmployeePermissionList = () => {
//   const employeePermissions = useEmployeePermissionStore(
//     (state) => state.employeePermissions
//   );

//   return (
//     <div className="flex min-h-screen justify-center bg-gray-100 p-4">
//       <div className="max-h-[89vh] w-full overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4">
//         <p className="text-md font-semibold">Employee Permissions</p> 
//         <Link href="/employee-management/emp-permissionform" className="flex cursor-pointer rounded bg-orange-400 px-3 py-2 text-sm text-white transition hover:bg-orange-500">
//           <Plus className="mr-2 h-5 w-5" /> Assign Permission
//         </Link>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto border rounded-lg">
//         <Table>
//           <TableHeader className="sticky top-0 bg-gray-100 z-10">
//             <TableRow>
//               <TableHead className="pl-4">S.No</TableHead>
//               <TableHead>Employee ID</TableHead>
//               <TableHead>Employee Name</TableHead>
//               <TableHead>Permission Assigned</TableHead>
//               <TableHead>Created At</TableHead>
//               <TableHead className="pr-4 text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {employeePermissions.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={6} className="text-center">
//                   No permissions assigned yet.
//                 </TableCell>
//               </TableRow>
//             ) : (
//               employeePermissions.map((ep, index) => (
//                 <TableRow key={ep.id}>
//                   <TableCell className="pl-4">{index + 1}</TableCell>
//                   <TableCell>{ep.employeeId}</TableCell>
//                   <TableCell>{ep.employeeName}</TableCell>
//                   <TableCell>{ep.permissionName}</TableCell>
//                   <TableCell>{ep.createdAt}</TableCell>
//                   <TableCell className="pr-4 text-right">
//                     <div className="flex justify-end gap-2">
//                         <FilePenLine className="cursor-pointer w-5 text-blue-600"/>
//                         <Trash2 className="cursor-pointer w-5 text-red-600" />
//                       </div>
//                   </TableCell> 
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//     </div>
//   );
// };

// export default EmployeePermissionList;



"use client";

import React from "react";
import Link from "next/link";
import { Plus, FilePenLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommonTable from "@/components/v1/common/common-table/common-table"; // ✅ Reusable common table
import useEmployeePermissionStore from "@/store/employeePermissionStore";

const EmployeePermissionList = () => {
  const employeePermissions = useEmployeePermissionStore(
    (state) => state.employeePermissions
  );

  // ✅ Define table columns
  const columns = [
    {
      key: "sno",
      label: "S.No",
      render: (_:any, index:any) => index + 1,
    },
    { key: "employeeId", label: "Employee ID" },
    { key: "employeeName", label: "Employee Name" },
    { key: "permissionName", label: "Permission Assigned" },
    { key: "createdAt", label: "Created At" },
    {
      key: "actions",
      label: "Actions",
      render: (ep:any) => (
        <div className="flex justify-end gap-2 pr-4">
          <FilePenLine className="cursor-pointer w-5 text-primary"/>
          <Trash2 className="cursor-pointer w-5 text-primary"/>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen justify-center bg-gray-100 p-4">
      <div className="w-full max-h-[89vh] overflow-y-auto rounded-lg bg-white p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-md font-semibold">Employee Permissions</p>
          <Link
            href="/employee-management/emp-permissionform"
            className="flex cursor-pointer rounded bg-primary text-background px-3 py-2 text-sm"
          >
            <Plus className="mr-2 h-5 w-5" /> Assign Permission
          </Link>
        </div>

        {/* ✅ Common Table */}
        <CommonTable
          columns={columns}
          data={employeePermissions}
          emptyMessage="No permissions assigned yet."
        />
      </div>
    </div>
  );
};

export default EmployeePermissionList;
