'use client';

import Link from 'next/link';
import { Plus, TrashIcon, View } from 'lucide-react';
import useEmployeeRoleStore from '@/store/employeeRoleStore';
import toast from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import { getEmployeeRole } from '@/apis/employee-role.api';
import CommonTable from '@/components/v1/common/common-table/common-table';
import { deleteEmployee, getEmployee } from '@/apis/create-employee.api';
import type { Employee } from '@/interface/common.interface';

const Employee = () => {
  const setRoles = useEmployeeRoleStore((state) => state.setRoles);
  const [employees, setEmployees] = useState<Employee[]>([]);
  // const [loading, setLoading] = useState(false);

  //  Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  //  Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  //  Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const page = 3;
        const limit = 50;
        const response = await getEmployeeRole(page, limit);

        if (!response.error && response.payload) {
          const rolesArray = Array.isArray(response.payload) ? response.payload : [response.payload];

          const transformedRoles = rolesArray.map((role) => ({
            id: role.id,
            name: role.name,
            status: role.status,
            createdAt: undefined,
            updatedAt: undefined,
          }));

          setRoles(transformedRoles);
        } else {
          toast.error(response.message || 'Failed to fetch roles');
        }
      } catch (error) {
        console.error('Failed to fetch employee roles:', error);
        toast.error('Failed to fetch employee roles');
      }
    };

    fetchRoles();
  }, [setRoles]);

  // 👥 Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = 10;
        const page = 1;
        const response = await getEmployee(data, page);

        if (!response.error && response.payload.employees) {
          const employeeArray = response.payload.employees;

          const employees = employeeArray.map((employee) => ({
            id: employee.id || employee.employeeId,
            employeeId: employee.employeeId,
            firstName: employee.firstName || '',
            middleName: employee.middleName || '',
            lastName: employee.lastName || '',
            email: employee.email || '',
            phoneNumber: employee.phoneNumber || '',
            roleId: employee.roleId,
            role: employee.role,
            storeId: employee.storeId || '',
            warehouseId: employee.warehouseId || '',
            status: employee.status,
            passwordCount: employee.passwordCount,
            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt,
            permissions: employee.permissions || [],
          }));

          setEmployees(employees);
        } else {
          toast.error(response.message || 'Failed to fetch employees');
        }
      } catch (error) {
        console.error('Failed to fetch employee data:', error);
        toast.error('Failed to fetch employee data');
      } finally {
        // setLoading(false);
      }
    };

    fetchEmployees();
  }, []);
  const handleDelete = (employeeId: string) => {
    // Implement delete functionality here
   deleteEmployee(employeeId);
  }

  // Filter logic ( using `employees` now)
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      (emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? emp.status === true : emp.status === false;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="foreground flex  justify-center p-4">
      <div className="bg-sidebar w-full rounded-lg p-4 shadow-lg">
        {/*  Header */}
        <div className="mb-4 w-full">
          <div className="flex items-center justify-between">
            <p className="text-md font-semibold">Employees</p>
            <Link
              href="/employee-management/add-employee"
              className="bg-primary text-background flex cursor-pointer items-center rounded-sm p-2 pr-3 pl-3 text-sm"
            >
              <Plus className="mr-2 h-5 w-5" /> Add Employee
            </Link>
          </div>
        </div>

        {/*  Search & Filter */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none sm:w-1/3"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="focus:border-primary bg-sidebar w-full cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none sm:w-1/7"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Employee Table */}

        <div className="w-full min-w-[300px] min-w-full sm:w-[560px] md:w-[640px] lg:w-[900px] xl:w-[1100px]">
          <CommonTable
            columns={[
              {
                key: 'sno',
                label: 'S.No.',
                render: (_, index) => startIndex + index + 1,
              },
              {
                key: 'name',
                label: 'Name',
                render: (emp) => `${emp.firstName} ${emp.middleName || ''} ${emp.lastName || ''}`.trim(),
              },
              { key: 'email', label: 'Email' },
              { key: 'phoneNumber', label: 'Phone Number' },
              { key: 'role', label: 'Role' },
              { key: 'storeId', label: 'Store Id' },
              {
                key: 'warehouseId',
                label: 'Warehouse',
                render: (emp) => emp.warehouseId || '-',
              },
              {
                key: 'status',
                label: 'Status',
                render: (emp) => (
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      emp.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {emp.status ? 'Active' : 'Inactive'}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (emp) => (
                  <div className="flex justify-end gap-2">
                    <Link href={`/employee-management/employee/${emp.employeeId}`}>
                      <View className="text-primary w-5 cursor-pointer" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(emp.employeeId)}>
                        <TrashIcon className="text-primary w-5 cursor-pointer" />
                    </button>
                   
                  </div>
                ),
              },
            ]}
            data={currentEmployees}
            emptyMessage="No employees found."
            // loading={loading}
          />

          {/* Pagination */}
          {filteredEmployees.length > 0 && (
            <div className="mt-4 flex flex-col items-start justify-between gap-2 text-sm sm:flex-row sm:items-center sm:gap-0">
              {/* Showing X-Y of Z employees */}
              <p className="text-sm">
                Showing{' '}
                <span className="font-semibold">
                  {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredEmployees.length)}
                </span>{' '}
                of <span className="font-semibold">{filteredEmployees.length}</span> employees
              </p>

              {/* Pagination Buttons */}
              <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0 sm:flex-nowrap">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`rounded-md border px-3 py-1 ${
                    currentPage === 1
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-primary cursor-pointer hover:text-white'
                  }`}
                >
                  Previous
                </button>

                <span className="font-medium">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`rounded-md border px-3 py-1 ${
                    currentPage === totalPages
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-primary cursor-pointer hover:text-white'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Employee;
