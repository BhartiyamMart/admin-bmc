import { requestAPI } from '@/lib/axios';
import { ApiResponse } from '@/interface/api.interface';
import { FeedbackCategory, FeedbackCategoryResponse } from '@/interface/common.interface';

export interface TimeSlotPayload {
  id?: string;
  label: string;
  startTime: string;
  endTime: string;
  status: boolean;
  sortOrder: number;
}

// ✅ Create
export const createTimeSlot = async (data: TimeSlotPayload) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'employee', 'create-delivery-time-slot', data);
};

// ✅ Get all
export const getTimeSlots = async () => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'employee', 'get-delivery-time-slots');
};

// ✅ Update
export const updateTimeSlot = async (data: TimeSlotPayload) => {
  return requestAPI<ApiResponse<Response>>('patch', 'v1', 'employee', 'update-delivery-time-slot', data);
};

// ✅ Delete
export const deleteTimeSlot = async (id: string, isParmanent: boolean) => {
  return requestAPI<ApiResponse<Response>>('delete', 'v1', 'employee', 'delete-delivery-time-slot', {
    id,
    isParmanent,
  });
};

export const createFeedbackCategory = async (payload: FeedbackCategory) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'employee', 'feedback-category', payload);
};

export const getAllFeedbackCategories = async (page: number, limit: number) => {
  return requestAPI<FeedbackCategoryResponse>('post', 'v1', 'employee', 'get-all-feedback-categories', {
    page: 1,
    limit: 10,
  });
};
