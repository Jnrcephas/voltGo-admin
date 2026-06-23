export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminRoleSummary {
  id: string;
  name: string;
}

export interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  reset_required: boolean;
  role: AdminRoleSummary;
}

export interface AdminLoginData {
  token: string;
  admin: AdminProfile;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}
