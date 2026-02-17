import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private notificationService: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): void {
    let message = 'An unexpected error occurred';
    let title = 'Error';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      message = error.error.message;
      title = 'Network Error';
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          title = 'Bad Request';
          message = error.error?.message || 'Invalid request data';
          break;
        case 401:
          title = 'Unauthorized';
          message = 'Please log in to continue';
          break;
        case 403:
          title = 'Access Denied';
          message = 'You do not have permission to perform this action';
          break;
        case 404:
          title = 'Not Found';
          message = 'The requested resource was not found';
          break;
        case 429:
          title = 'Rate Limited';
          message = 'Too many requests. Please wait before trying again';
          break;
        case 500:
          title = 'Server Error';
          message = 'Internal server error. Please try again later';
          break;
        case 0:
          title = 'Network Error';
          message = 'Unable to connect to the server. Please check your internet connection';
          break;
        default:
          title = `Error ${error.status}`;
          message = error.error?.message || 'An unexpected error occurred';
      }
    }

    // Log error for debugging
    console.error('HTTP Error Details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.error?.message,
      timestamp: new Date().toISOString(),
      error: error
    });

    // Show user-friendly notification
    // Only show notifications for errors that aren't handled elsewhere
    if (error.status !== 401) { // Auth errors are handled by AuthInterceptor
      this.notificationService.showError(message, title);
    }
  }
}