import { requestAPI } from '@/lib/axios';
import { ApiResponse } from '@/interface/api.interface';

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
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'admin', 'create-delivery-time-slot', data);
};

// ✅ Get all
export const getTimeSlots = async () => {
  return requestAPI<ApiResponse<Response>>('get', 'v1', 'admin', 'get-delivery-time-slots');
};

// ✅ Update
export const updateTimeSlot = async (data: TimeSlotPayload) => {
  return requestAPI<ApiResponse<Response>>('patch', 'v1', 'admin', 'update-delivery-time-slot', data);
};

// ✅ Delete
export const deleteTimeSlot = async (id: string) => {
  return requestAPI<ApiResponse<Response>>('delete', 'v1', 'admin', 'delete-delivery-time-slot', { id });
};
