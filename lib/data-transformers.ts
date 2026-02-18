// lib/transformers/category.transformer.ts
import { ICategoriesNestedListRES, ICategory } from '@/interface/categories.interface';

interface CategoryNode {
  id: string;
  name: string;
  type: 'category' | 'subcategory' | 'product';
  children?: CategoryNode[];
  productCount?: number;
  status: 'active' | 'inactive';
  slug?: string;
  imageUrl?: string;
  depth?: number;
  priority?: number;
}

export const transformCategoriesToNodes = (apiResponse: ICategoriesNestedListRES): CategoryNode[] => {
  const transformCategory = (category: ICategory, level: number = 0): CategoryNode => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl,
      type: level === 0 ? 'category' : 'subcategory',
      status: category.status ? 'active' : 'inactive',
      depth: category.depth,
      priority: category.priority,
      children: hasSubcategories ? category.subcategories?.map((sub) => transformCategory(sub, level + 1)) : undefined,
    };
  };

  return apiResponse.categories.map((cat) => transformCategory(cat, 0));
};
