import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ErrorResponse } from '../lib/response/error-response';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = {
        message: '',
        statusCode: 500,
        server: false,
      };

      if (error.error instanceof ErrorEvent) {
        errorMessage = {
          message: `Client-side error: ${error.error.message}`,
          statusCode: error.status,
          server: false,
        };
      } else {
        const serverError = error.error as ErrorResponse;

        if (serverError && serverError.message) {
          errorMessage = {
            message: serverError.message,
            statusCode: serverError.status_code,
            server: true,
          };
        } else {
          errorMessage = {
            message: 'An unexpected error occurred',
            statusCode: error.status,
            server: true,
          };
        }
      }

      return throwError(() => errorMessage);
    })
  );
};
