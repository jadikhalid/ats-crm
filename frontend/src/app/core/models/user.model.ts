import { Role } from './role.enum';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}
