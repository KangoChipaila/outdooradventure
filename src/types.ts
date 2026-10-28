export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  reviewCount: number;
  description: string;
  sizes: string[];
  colors: string[];
  img: string;
  gallery: string[];
  category: string;
  stock?: number;
}
