// TypeScript types for Dahila Crochet database

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Color {
  id: string;
  name: string;
  hex: string;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category_id: string | null;
  badge: string | null;
  status: 'active' | 'soldout' | 'draft';
  base_price_uyu: number | null;
  sort_order: number;
  lead_time_weeks_min: number;
  lead_time_weeks_max: number;
  material: string | null;
  care_instructions: string | null;
  is_custom_only: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: Category;
  media?: ProductMedia[];
  sizes?: ProductSize[];
  colors?: Color[];
}

export interface ProductMedia {
  id: string;
  product_id: string;
  url: string;
  type: 'image' | 'video';
  alt: string | null;
  position: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: string;
  price_uyu: number | null;
  available: boolean;
  sort_order: number;
}

export interface ProductColor {
  product_id: string;
  color_id: string;
  color?: Color;
}

export interface CustomOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  whatsapp: string | null;
  garment_type: string;
  size: string | null;
  measurements: { busto?: string; cintura?: string; largo?: string } | null;
  color_preference: string | null;
  message: string | null;
  status: 'new' | 'replied' | 'in_progress' | 'done' | 'cancelled';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  size: string;
  qty: number;
  added_at: string;
  // Joined
  product?: Product;
}

export interface SiteSetting {
  key: string;
  value: string;
  updated_at: string;
}

// Helper: get the effective price for a product + size
export function getEffectivePrice(product: Product, sizeLabel?: string): number {
  if (sizeLabel && product.sizes) {
    const sizeObj = product.sizes.find(s => s.size === sizeLabel);
    if (sizeObj?.price_uyu) return sizeObj.price_uyu;
  }
  return product.base_price_uyu || 0;
}

// Helper: format price in UYU
export function formatPrice(price: number): string {
  return `UYU ${price.toLocaleString('es-UY')}`;
}

// Neutral placeholder for products without media. Beats reusing a real
// photo from another product as a fallback (which is misleading) and lives
// in /public so next/image can serve it normally.
export const PHOTO_PLACEHOLDER = '/placeholder-product.svg';

// Helper: get primary photo URL
export function getPrimaryPhoto(product: Product): string {
  if (!product.media || product.media.length === 0) {
    return PHOTO_PLACEHOLDER;
  }
  const primary = product.media.find(m => m.is_primary && m.type === 'image');
  return primary?.url || product.media[0].url || PHOTO_PLACEHOLDER;
}
