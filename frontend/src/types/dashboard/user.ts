export interface User {
  id: string;
  user_id: string;
  role?: string;
  email?: string;
  display_name: string;
  relevance_score: number;
}

export interface BanResponse {
  message: string;
  reason: string;
  end_at: string;
  status: number;
}