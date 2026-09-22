export type Role = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id: number;
  username: string;
  fullname: string;
  role: Role;
  active: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface LoginPayload {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  fullname: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: Role;
}
