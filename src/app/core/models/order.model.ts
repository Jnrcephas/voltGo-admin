export type OrderStatus =
  | 'pending'
  | 'searching'
  | 'assigned'
  | 'rider_arriving'
  | 'collected'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export type OrderVehicleType = 'motorcycle' | 'bicycle';

export interface AdminOrderCustomerSummary {
  id: string;
  full_name: string;
  phone?: string;
}

export interface AdminOrderRiderSummary {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
}

export interface AdminOrder {
  id: string;
  tracking_no?: string;
  customer: AdminOrderCustomerSummary;
  rider?: AdminOrderRiderSummary | null;
  pickup_address: string;
  dropoff_address: string;
  zone?: string;
  status: OrderStatus;
  price: number;
  vehicle_type: OrderVehicleType;
  sla_breach?: boolean;
  proof_of_delivery_url?: string;
  cancellation_reason?: string;
  created_at: string;
}

export interface AdminOrderListData {
  total: number;
  page: number;
  pages: number;
  orders: AdminOrder[];
}

export interface AdminOrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  vehicle_type?: OrderVehicleType;
  rider_id?: string;
  customer_id?: string;
}

export interface AssignRiderToOrderRequest {
  rider_id: string;
}

export interface CancelOrderRequest {
  cancellation_reason: string;
}
