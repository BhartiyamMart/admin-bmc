"use client";

import React from "react";
import Link from "next/link";
import { Plus, FilePenLine, Trash2 } from "lucide-react";
import CommonTable from "@/components/v1/common/common-table/common-table"; // Reusable common table
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
      render: (_: unknown, index: number) => index + 1,
    },
    { key: "employeeId", label: "Employee ID" },
    { key: "employeeName", label: "Employee Name" },
    { key: "permissionName", label: "Permission Assigned" },
    { key: "createdAt", label: "Created At" },
    {
      key: "actions",
      label: "Actions",
      render: () => (
        <div className="flex justify-end gap-2 pr-4">
          <FilePenLine className="cursor-pointer w-5 text-primary"/>
          <Trash2 className="cursor-pointer w-5 text-primary"/>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-[calc(100vh-8vh)] justify-center bg-sidebar p-4">
      <div className="w-full  overflow-y-auto rounded-lg  p-4 shadow-lg">
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
        <div className="min-w-[300px] w-full sm:w-[560px]  md:w-[640px] lg:w-[900px] xl:w-[1100px]  min-w-full"> 
        {/* ✅ Common Table */}
        <CommonTable
          columns={columns}
          data={employeePermissions}
          emptyMessage="No permissions assigned yet."
        />
      </div>
      </div>
    </div>
  );
};

export default EmployeePermissionList;
