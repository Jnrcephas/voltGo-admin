export type VehicleType = 'motorcycle' | 'bicycle';
export type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'inactive';

export interface AdminVehicle {
  id: string;
  type: VehicleType;
  plate_no?: string | null;
  gps_tracker_id: string;
  dashcam_id?: string | null;
  battery_percent: number;
  status: VehicleStatus;
  is_active: boolean;
  assigned_rider?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  } | null;
  created_at: string;
}

export interface AdminVehicleListData {
  total: number;
  page: number;
  pages: number;
  vehicles: AdminVehicle[];
}

export interface AdminVehicleListParams {
  page?: number;
  limit?: number;
  type?: VehicleType;
  status?: VehicleStatus;
  is_active?: boolean;
}

export interface CreateVehicleRequest {
  type: VehicleType;
  plate_no?: string;
  gps_tracker_id: string;
  dashcam_id?: string;
  battery_percent?: number;
}

export interface UpdateVehicleRequest {
  plate_no?: string;
  gps_tracker_id?: string;
  dashcam_id?: string;
}

export interface UpdateVehicleStatusRequest {
  status: VehicleStatus;
}
