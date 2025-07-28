export interface UserProfile {
  id: string;
  name: string;
  lastname: string;
  username: string;
  is_2fa_enabled: boolean;
  twofa_temp_secret: string | null;
}
