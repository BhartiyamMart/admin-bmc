import { ICategoriesNestedListRES } from '@/interface/categories.interface';
import { requestAPI } from '@/lib/axios';

export const getCategoriesData = async () => {
  return requestAPI<ICategoriesNestedListRES>('get', 'v1', 'admin/category', 'nested-list');
};
