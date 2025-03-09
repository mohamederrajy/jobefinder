export interface SignupData {
  email: string;
  password: string;
  zipCode: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    email: string;
    role: string;
  };
}

export interface ApiResponse {
  token?: string;
  message?: string;
  error?: string;
  user?: {
    email: string;
    role: string;
  };
} 