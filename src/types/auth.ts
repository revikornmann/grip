export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isAnonymous: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}
