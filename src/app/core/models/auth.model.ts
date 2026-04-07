export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  message?: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
}
