export interface AdminBundleProduct {
  id: string;
  name: string;
  credits: number;
  price_ghs: number;
  validity_days: number;
  discount_percent: number;
  is_active: boolean;
  subscriber_count?: number;
  created_at?: string;
}

export interface AdminBundleListParams {
  is_active?: boolean;
}

export interface CreateBundleProductRequest {
  name: string;
  credits: number;
  price_ghs: number;
  validity_days: number;
  discount_percent: number;
}

export interface UpdateBundleProductRequest {
  name?: string;
  credits?: number;
  price_ghs?: number;
  validity_days?: number;
  discount_percent?: number;
}
