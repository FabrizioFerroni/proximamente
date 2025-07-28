export type SessionsResponse = {
  id: string;
  jti: string;
  ip: string;
  user_agent: string;
  system_operative: string;
  browser: string;
  device: string;
  location: Location;
  is_revoked: boolean;
  expires_at: Date;
  user: User;
  createdAt: Date;
  timeAlive: string;
  isCurrent?: boolean;
};

type User = {
  name: string;
  lastname: string;
  username: string;
};
