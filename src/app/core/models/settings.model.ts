/**
 * The backend currently exposes exactly two runtime-configurable settings:
 * `bundle_overlap_behaviour` and `bundle_carryover_expiry`. This is far
 * narrower than the Settings page UI (which also has Pricing, AI, Notification
 * and Security tabs with no backend support yet) — those other tabs remain on
 * local mock state and are clearly labelled as such in the UI.
 */
export type SettingKey =
  | 'bundle_overlap_behaviour'
  | 'bundle_carryover_expiry'
  | 'bundle_expiry_enabled';
  
export interface SystemSetting {
  key: SettingKey;
  value: string;
  description?: string;
  allowed_values: string[] | null;  // must be nullable, not just string[]
  updated_at?: string;
}

export interface UpdateSettingRequest {
  value: string;
}

export interface UpdateSettingResponseData {
  key: SettingKey;
  value: string;
}
