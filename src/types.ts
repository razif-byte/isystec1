export type Category = 'Security' | 'Solar' | 'Accessories';

export interface Product {
  id: string;
  name: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  category: Category;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}
