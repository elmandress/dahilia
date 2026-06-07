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
  discount_percent: number;   // 0-90, per-product discount
  discount_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: Category;
  media?: ProductMedia[];
  sizes?: ProductSize[];
  colors?: Color[];
}

export interface Discount {
  id: string;
  label: string;
  scope: 'all' | 'category';
  category_id: string | null;
  percent: number;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
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

// Helper: get the LIST price for a product + size (before any discount).
export function getEffectivePrice(product: Product, sizeLabel?: string): number {
  if (sizeLabel && product.sizes) {
    const sizeObj = product.sizes.find(s => s.size === sizeLabel);
    if (sizeObj?.price_uyu) return sizeObj.price_uyu;
  }
  return product.base_price_uyu || 0;
}

// Resolve the discount percentage that applies to a product, taking the best
// (highest) between the per-product discount and any active batch rule passed in.
export function resolveDiscountPercent(product: Product, batch?: Discount[]): number {
  let pct = product.discount_active ? (product.discount_percent || 0) : 0;
  if (batch && batch.length > 0) {
    const now = Date.now();
    for (const d of batch) {
      if (!d.active) continue;
      if (d.starts_at && new Date(d.starts_at).getTime() > now) continue;
      if (d.ends_at && new Date(d.ends_at).getTime() < now) continue;
      const applies =
        d.scope === 'all' ||
        (d.scope === 'category' && d.category_id && d.category_id === product.category_id);
      if (applies) pct = Math.max(pct, d.percent || 0);
    }
  }
  return Math.min(90, Math.max(0, pct));
}

// Final price a customer pays: list price minus the resolved discount.
export function getFinalPrice(product: Product, sizeLabel?: string, batch?: Discount[]): number {
  const list = getEffectivePrice(product, sizeLabel);
  const pct = resolveDiscountPercent(product, batch);
  if (pct <= 0) return list;
  return Math.round((list * (100 - pct)) / 100);
}

// Helper: format price in UYU
export function formatPrice(price: number): string {
  return `UYU ${price.toLocaleString('es-UY')}`;
}

// Neutral placeholder for products without media. Beats reusing a real
// photo from another product as a fallback (which is misleading) and lives
// in /public so next/image can serve it normally.
export const PHOTO_PLACEHOLDER = '/placeholder-product.svg';

// Tiny cream-tone blur placeholder for next/image `placeholder="blur"`.
// A single solid colour keeps the data URL small (good for LCP) while
// avoiding the harsh empty→image pop. Cream = #FAF1DF.
export const BLUR_DATA_URL =
  'data:image/svg+xml;base64,' +
  (typeof btoa !== 'undefined'
    ? btoa('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="5"><rect width="4" height="5" fill="#FAF1DF"/></svg>')
    : Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="5"><rect width="4" height="5" fill="#FAF1DF"/></svg>').toString('base64'));

// Helper: get primary photo URL
export function getPrimaryPhoto(product: Product): string {
  if (!product.media || product.media.length === 0) {
    return PHOTO_PLACEHOLDER;
  }
  const primary = product.media.find(m => m.is_primary && m.type === 'image');
  return primary?.url || product.media[0].url || PHOTO_PLACEHOLDER;
}
