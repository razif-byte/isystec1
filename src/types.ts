export type Category = 'Security' | 'Solar' | 'Accessories';

export interface Product {
  id: string;
  name: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  category: Category;
  image: string;
  gallery: string[];
  sku: string;
  stockLabel: string;
  badge?: string;
  shopifyVariantId?: string;
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

export type PaymentMethod = 'shopify' | 'fpx' | 'duitnow' | 'whatsapp';
