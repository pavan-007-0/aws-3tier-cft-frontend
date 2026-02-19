import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

/* =======================
   Interfaces
======================= */

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  avatar?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  createdAt?: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  user?: User;
  message?: string;
}

/* =======================
   Service
======================= */

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  /* =======================
     AUTH
  ======================= */

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);

    if (!this.isValidEmail(credentials.email)) {
      this.isLoadingSubject.next(false);
      return throwError(() => ({ message: 'Invalid email format' }));
    }

    if (!credentials.password || credentials.password.length < 8) {
      this.isLoadingSubject.next(false);
      return throwError(() => ({ message: 'Password must be at least 8 characters' }));
    }

    return this.http.post<AuthResponse>(`${this.API}/login`, {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password
    }).pipe(
      tap(response => {
        if (response.success && response.access_token && response.user) {
          this.setCurrentUser(
            response.user,
            response.access_token,
            response.refresh_token,
            credentials.rememberMe
          );
        }
      }),
      catchError(err => this.handleError(err)),
      tap(() => this.isLoadingSubject.next(false))
    );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);

    const validationError = this.validateRegistrationData(data);
    if (validationError) {
      this.isLoadingSubject.next(false);
      return throwError(() => ({ message: validationError }));
    }

    return this.http.post<AuthResponse>(`${this.API}/register`, {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password,
      phone: data.phone?.trim()
    }).pipe(
      catchError(err => this.handleError(err)),
      tap(() => this.isLoadingSubject.next(false))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => ({ message: 'No refresh token available' }));
    }

    return this.http.post<AuthResponse>(`${this.API}/refresh`, {
      refresh_token: refreshToken
    }).pipe(
      tap(response => {
        if (response.success && response.access_token) {
          this.setToken(response.access_token);
        }
      }),
      catchError(error => {
        this.clearUserData();
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API}/logout`, {}).pipe(
      tap(() => this.clearUserData()),
      catchError(() => {
        this.clearUserData();
        return throwError(() => ({ message: 'Logout completed locally' }));
      })
    );
  }

  /* =======================
     TOKEN & USER
  ======================= */

  getToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY) ||
           sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) ||
           sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  /* =======================
     INTERNAL HELPERS
  ======================= */

  private setToken(token: string): void {
    const storage = localStorage.getItem(this.ACCESS_TOKEN_KEY)
      ? localStorage
      : sessionStorage;

    storage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  private setCurrentUser(
    user: User,
    accessToken: string,
    refreshToken?: string,
    rememberMe?: boolean
  ): void {
    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    storage.setItem(this.USER_KEY, JSON.stringify(user));

    if (refreshToken) {
      storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    this.currentUserSubject.next(user);
  }

  private loadUserFromStorage(): void {
    const userStr =
      localStorage.getItem(this.USER_KEY) ||
      sessionStorage.getItem(this.USER_KEY);

    if (userStr && this.isAuthenticated()) {
      try {
        this.currentUserSubject.next(JSON.parse(userStr));
      } catch {
        this.clearUserData();
      }
    }
  }

  private clearUserData(): void {
    [localStorage, sessionStorage].forEach(storage => {
      storage.removeItem(this.ACCESS_TOKEN_KEY);
      storage.removeItem(this.REFRESH_TOKEN_KEY);
      storage.removeItem(this.USER_KEY);
    });

    localStorage.removeItem('cart');
    this.currentUserSubject.next(null);
  }

  private validateRegistrationData(data: RegisterData): string | null {
    if (!data.name?.trim()) return 'Name is required';
    if (!this.isValidEmail(data.email)) return 'Invalid email format';
    if (data.password.length < 8) return 'Password too short';
    if (data.password !== data.confirmPassword) return 'Passwords do not match';
    if (!data.acceptTerms) return 'You must accept terms';
    return null;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.error?.message ||
      (error.status === 0 ? 'Unable to connect to server' : `Server error ${error.status}`);

    return throwError(() => ({ message, status: error.status }));
  }
}
