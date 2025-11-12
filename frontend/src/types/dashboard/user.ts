export interface User {
  user_id: string;
  role?: string;
  email?: string;
  display_name?: string;
}

export interface BanResponse {
  message: string;
  reason: string;
  end_at: string;
  status: number;
}