import { ApiResponse } from '@/interface/api.interface';
import { DocumentTypeResponse, FeedbackCategoryPayload } from '@/interface/common.interface';
import { requestAPI } from '@/lib/axios';

export const createDocumentType = async (payload: { code: string; label: string }) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'employee', 'create-employee-document-type', payload);
};
export const getDocumentType = async () => {
  return requestAPI<DocumentTypeResponse>('post', 'v1', 'employee', 'get-employee-document-types', {
    page: 1,
    limit: 10,
  });
};
export const deleteDocumentType = async (id: string, permanentdelete: boolean) => {
  return requestAPI<ApiResponse<Response>>('delete', 'v1', 'employee', 'delete-employee-document-type', {
    id,
    permanentDelete: permanentdelete,
  });
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

export const addFeedBackCategory = async (payload: FeedbackCategoryPayload) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'employee', 'feedback-category', payload);
};
