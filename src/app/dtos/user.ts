export interface UserInfoUpdateDto {
  name: string;
  lastname: string;
}

export interface UserUpdatePasswordDto {
  passwordActual: string;
  newPassword: string;
  confirmNewPassword: string;
}
