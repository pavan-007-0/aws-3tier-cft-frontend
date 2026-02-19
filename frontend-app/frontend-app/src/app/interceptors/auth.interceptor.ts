import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService, AuthResponse } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth token to requests
    const authToken = this.authService.getToken();
    
    if (authToken) {
      req = this.addTokenToRequest(req, authToken);
    }

    // Add security headers
    req = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 errors with token refresh
        if (error.status === 401 && authToken) {
          return this.handle401Error(req, next);
        }

        // Handle other errors
        return this.handleError(error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();
      
      if (refreshToken) {
        return this.authService.refreshToken().pipe(
          switchMap((response: AuthResponse) => {
            this.isRefreshing = false;
            
            if (response.success && response.access_token) {
              this.refreshTokenSubject.next(response.access_token);
              return next.handle(this.addTokenToRequest(request, response.access_token));
            }
            
            // Refresh failed, logout user
            this.authService.logout().subscribe();
            this.router.navigate(['/login']);
            return throwError(() => new Error('Token refresh failed'));
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.authService.logout().subscribe();
            this.router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      } else {
        // No refresh token, logout user
        this.authService.logout().subscribe();
        this.router.navigate(['/login']);
        return throwError(() => new Error('No refresh token available'));
      }
    } else {
      // Wait for refresh to complete
      return this.refreshTokenSubject.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addTokenToRequest(request, token)))
      );
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad Request';
          break;
        case 403:
          errorMessage = 'You do not have permission to access this resource';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || `Server Error: ${error.status}`;
      }
    }

    console.error('HTTP Error:', {
      status: error.status,
      message: errorMessage,
      url: error.url,
      timestamp: new Date().toISOString()
    });

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      originalError: error
    }));
  }
}