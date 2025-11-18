import { ApiResponse } from '@/interface/api.interface';
import { requestAPI } from '@/lib/axios';

export const createDocumentType = async (payload: { code: string; label: string }) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'employee', 'create-employee-document-type', payload);
};
export const getDocumentType = async () => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'employee', 'get-employee-document-types');
};
export const deleteDocumentType = async (id: string) => {
  return requestAPI<ApiResponse<Response>>('delete', 'v1', 'employee', 'delete-employee-document-type', { id });
};

export const uploadDocument = async (payload: {
  employeeId: string;
  documentTypeId: string;
  documentNumber: string;
  fileUrl: string;
  issuedDate: string;
  expiryDate: string;
  isVerified: boolean;
  notes: string;
}) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'employee', 'create-employee-document', payload);
};
