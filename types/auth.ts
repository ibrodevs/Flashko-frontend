export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  sets_count?: number;
  cards_count?: number;
  quiz_sessions_count?: number;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh?: string;
}

export interface RefreshResponse {
  access: string;
  refresh?: string;
}
