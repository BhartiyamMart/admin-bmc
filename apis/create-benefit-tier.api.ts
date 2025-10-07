import { ApiResponse } from '@/interface/api.interface';
import { requestAPI } from '@/lib/axios';



export const createBenefitTier = async (payload: { tierCode: string;       
  benefitType: string;
  benefitValue: string;
  description: string;
  isActive: boolean; }) => {
  return requestAPI<ApiResponse<Response>>('post', 'v1', 'admin', 'create-tier-benefit', payload);
};

export const deleteBenefitTier = async (id:string) => {
  return requestAPI<ApiResponse<Response>>('delete', 'v1', 'admin', 'delete-tier-benefit',{id} );
}

export const updateBenefitTier = async (payload: { id: string; // UUID format
    tierCode: string;       
    benefitType: string;        
    benefitValue: string;
    description: string;
    isActive: boolean; }) => {
    return requestAPI<ApiResponse<Response>>('patch', 'v1', 'admin', 'update-tier-benefit', payload);
  } 