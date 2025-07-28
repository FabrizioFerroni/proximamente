export interface LoginDto {
  username: string;
  password: string;
}

export interface Login2FaDto {
  loginSecret: string;
  token: string;
}

export interface LoginResponse {
  message?: string;
  twoFactorEnabled?: boolean;
  loginSecret?: string;
  id?: string;
  name?: string;
  lastname?: string;
  username?: string;
  is_2fa_enabled?: boolean;
  twofa_temp_secret?: string;
  token?: string;
  refreshToken?: string;
}
