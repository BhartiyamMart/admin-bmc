"use client";

import React, { useEffect } from "react";
import { FilePenLine, View } from "lucide-react";
import { employeeList } from "@/interface/employeelList";
import useEmployeeRoleStore from "@/store/employeeRoleStore";
import { getEmployeeRole } from "@/apis/employee-role.api";
import toast from "react-hot-toast";
import UniTable, { TableAction, TableColumn } from "@/components/v1/common/uni-table";

const Employee = () => {
  const setRoles = useEmployeeRoleStore((state: any) => state.setRoles);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getEmployeeRole();
        if (!response.error && response.payload) {
          const rolesArray = Array.isArray(response.payload)
            ? response.payload
            : [response.payload];
          const transformedRoles = rolesArray.map((role) => ({
            id: role.id,
            name: role.name,
            status: role.status,
            createdAt: undefined,
            updatedAt: undefined,
          }));
          setRoles(transformedRoles);
        } else {
          toast.error(response.message || "Failed to fetch roles");
        }
      } catch (error) {
        console.error("Failed to fetch employee roles:", error);
        toast.error("Failed to fetch employee roles");
      }
    };
    fetchRoles();
  }, [setRoles]);

  // Define columns
  const columns: TableColumn<any>[] = [
    {
      key: "name",
      header: "Name",
      accessor: (row) => `${row.firstName} ${row.middleName || ''} ${row.lastName}`.trim()
    },
    { key: "email", header: "Email" },
    { key: "phoneNumber", header: "Phone Number" },
    { key: "role", header: "Role" },
    { key: "storeId", header: "Store Id" },
    { 
      key: "warehouseId", 
      header: "Warehouse",
      accessor: (row) => row.warehouseId || "-"
    },
    {
      key: "status",
      header: "Status",
      accessor: (row) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            row.status
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.status ? "Active" : "Inactive"}
        </span>
      )
    }
  ];

  // Define actions
  const actions: TableAction<any>[] = [
    {
      icon: <FilePenLine className="w-5" />,
      onClick: (row) => console.log("Edit", row),
      className: "text-blue-600",
      variant: "icon"
    },
    {
      icon: <View className="w-5" />,
      onClick: (row) => console.log("View", row),
      className: "text-green-600",
      variant: "icon"
    },
    {
      label: "Change Password",
      onClick: (row) => console.log("Change password", row),
      className: "text-white",
      style: { backgroundColor: "#f07d02" }
    }
  ];

  return (
    <UniTable
      data={employeeList}
      columns={columns}
      title="Employee"
      addButton={{
        label: "Add Employee",
        href: "/employee-management/add-employee"
      }}
      actions={actions}
      searchFilter={{
        enabled: true,
        placeholder: "Search by name or email...",
        searchKeys: ["firstName", "lastName", "email"]
      }}
      statusFilter={{
        enabled: true,
        accessor: "status",
        options: [
          { label: "All Status", value: "all" },
          { label: "Active", value: true },
          { label: "Inactive", value: false }
        ]
      }}
      pagination={{ enabled: true, itemsPerPage: 8 }}
      emptyMessage="No employees found."
    />
  );
};

export default Employee;
