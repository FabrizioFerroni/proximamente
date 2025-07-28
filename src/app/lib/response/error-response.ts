export interface ErrorResponse {
  messageException?: string;
  message: string;
  path: string;
  status_code: number;
  timestamp: Date;
}
