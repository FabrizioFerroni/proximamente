export interface NotificationReportDto {
  total: number;
  hoy: number;
  semana: number;
}

export interface NotifyResponseDto {
  id: string;
  name: string;
  email: string;
  status: string;
  fecha: string;
  row_num?: number;
}

export interface CreateNotificationDto {
  name: string;
  email: string;
}

export interface CNotificationResponse {
  message: string;
}
