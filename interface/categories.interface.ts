// interface/categories.interface.ts
export interface ICategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  parentId: string | null;
  priority: number;
  depth: number;
  status: boolean;
  subcategories?: ICategory[]; // Make it recursive
}

export interface ICategoriesNestedListRES {
  total: number;
  categories: ICategory[];
  stats: {
    totalMain: number;
    activeMain: number;
    inactiveMain: number;
    totalCategories: number;
    maxDepth: number;
  };
}
