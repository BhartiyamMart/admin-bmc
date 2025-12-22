'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useEmployeeRoleStore from '@/store/employeeRoleStore';
import { createEmployeeRole, updateEmployeeRole } from '@/apis/employee-role.api';
import toast from 'react-hot-toast';

const EmployeeRole = () => {
  const [form, setForm] = useState({ name: '', status: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const addRole = useEmployeeRoleStore((state) => state.addRole);
  const updateRole = useEmployeeRoleStore((state) => state.updateRole);
  const getRoleById = useEmployeeRoleStore((state) => state.getRoleById);

  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  // Load role data for editing
  useEffect(() => {
    if (editId) {
      setIsEditMode(true);
      console.log('Editing role with id:', editId);
      const role = getRoleById(editId);
      console.log('Role data:', role);
      if (role) {
        setForm({
          name: role.name,
          status: role.status,
        });
      }
    }
  }, [editId, getRoleById]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!form.name.trim()) {
      setError('Name is required');
      toast.error('Name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const roleData = {
        name: form.name.trim(),
        status: form.status,
      };

      let response;

      if (isEditMode && editId) {
        // Update existing role
        console.log('id is ', editId);
        const { name, status } = roleData;
        const id = editId;
        const data = { id, name, status };
        response = await updateEmployeeRole(data);

        if (!response.error) {
          // Update local store
          updateRole(editId, { name: form.name, status: form.status });
          toast.success('Role updated successfully!');
        }
      } else {
        // Create new role
        response = await createEmployeeRole(roleData);

        if (!response.error) {
          // Add to local store
          addRole({ name: form.name, status: form.status });
          toast.success('Role created successfully!');
        }
      }

      if (!response.error) {
        router.push('/employee-management/employee-rolelist');
      } else {
        setError(response.message || `Failed to ${isEditMode ? 'update' : 'create'} role`);
        toast.error(response.message || `Failed to ${isEditMode ? 'update' : 'create'} role`);
      }
    } catch (error: unknown) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} role:`, error);

      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-sidebar flex h-[calc(100vh-8vh)] justify-center p-4">
      <div className="w-full overflow-y-auto rounded p-4 shadow-lg">
        <div className="mb-4 flex w-full items-center justify-between border-b pb-2">
          <p className="text-md font-semibold">{isEditMode ? 'Edit Employee Role' : 'Employee Role'}</p>
          <Link
            href="/employee-management/employee-rolelist"
            className="bg-primary text-background flex cursor-pointer rounded p-2 pr-3 pl-3 text-sm transition"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Back to List
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Enter Role</Label>
            <Input
              className="mt-1 w-full rounded border p-2"
              id="name"
              placeholder="Enter name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={isLoading}
            />
          </div>

          {/* Status Field */}
          <div className="flex items-center justify-between">
            <Label htmlFor="status">Status</Label>
            <Switch
              id="status"
              checked={form.status}
              onCheckedChange={(checked) => setForm({ ...form, status: checked })}
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !form.name.trim()}
            className="bg-primary text-background mt-5 flex w-full cursor-pointer items-center justify-center rounded px-20 py-2 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : isEditMode ? (
              'Update'
            ) : (
              'Save'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRole;
