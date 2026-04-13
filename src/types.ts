export type Category = 'Security' | 'Solar' | 'Accessories';

export interface Product {
  id: string;
  name: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  category: Category;
  image: string;
  rating?: number;
  reviewCount?: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem extends Product {
  quantity: number;
}
