// ─────────────────────────────────────────────────────────────────────────────
// Shared domain types for Green Rock Outdoor Gear
// Used by both the server and (via copy / shared package) the React frontend.
// ─────────────────────────────────────────────────────────────────────────────

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface SignUpBody {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserPublic;
}

// ── Users ────────────────────────────────────────────────────────────────────

/** Full user row as stored in the DB (never send password_hash to the client) */
export interface UserRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  member_tier: string;
  is_admin: boolean;
  notif_order_updates: boolean;
  notif_deals: boolean;
  notif_new_arrivals: boolean;
  notif_newsletter: boolean;
  created_at: Date;
  updated_at: Date;
}

/** Safe user shape returned to the client */
export interface UserPublic {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  memberSince: string; // formatted date string
  memberTier: string;
  avatarInitials: string;
  isAdmin: boolean;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  deals: boolean;
  newArrivals: boolean;
  newsletter: boolean;
}

export interface UpdatePersonalBody {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface UpdatePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateNotificationsBody {
  orderUpdates: boolean;
  deals: boolean;
  newArrivals: boolean;
  newsletter: boolean;
}

// ── Addresses ────────────────────────────────────────────────────────────────

export interface AddressRow {
  id: number;
  user_id: number;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  country: string;
  is_default: boolean;
}

export interface AddressPublic {
  id: number;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  country: string;
  isDefault: boolean;
}

export interface UpsertAddressBody {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  country: string;
  isDefault?: boolean;
}

// ── Products ─────────────────────────────────────────────────────────────────

export interface ProductRow {
  id: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  review_count: number;
  description: string;
  sizes: string[];        // stored as text[] in Postgres
  colors: string[];       // stored as text[] in Postgres
  img: string;
  gallery: string[];      // stored as text[] in Postgres
  category: string;
  stock: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductPublic {
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
  stock: number;
}

export interface UpdateStockBody {
  stock: number;
}

// ── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface OrderRow {
  id: string;   // e.g. "ORD-00142"
  user_id: number;
  status: OrderStatus;
  total: number;
  created_at: Date;
}

export interface OrderItemRow {
  id: number;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderPublic {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: string[];
}

// ── Saved Items ───────────────────────────────────────────────────────────────

export interface SavedItemRow {
  id: number;
  user_id: number;
  product_id: number;
  created_at: Date;
}

export interface SavedItemPublic {
  id: number;         // saved_item row id
  productId: number;
  name: string;
  price: number;
  img: string;
}

// ── Activity Preferences ──────────────────────────────────────────────────────

export interface ActivityPreferenceRow {
  id: number;
  user_id: number;
  activity: string;
}

// ── API utility types ─────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
}
