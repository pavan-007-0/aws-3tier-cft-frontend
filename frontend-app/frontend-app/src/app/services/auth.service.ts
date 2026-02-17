import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://127.0.0.1:5000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  // Token storage keys
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // Enhanced Login with security improvements
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);
    
    // Input validation
    if (!this.isValidEmail(credentials.email)) {
      this.isLoadingSubject.next(false);
      return throwError(() => ({ message: 'Invalid email format' }));
    }

    if (!credentials.password || credentials.password.length < 8) {
      this.isLoadingSubject.next(false);
      return throwError(() => ({ message: 'Password must be at least 8 characters' }));
    }
    
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password
    }).pipe(
      tap(response => {
        if (response.success && response.access_token && response.user) {
          this.setCurrentUser(response.user, response.access_token, response.refresh_token, credentials.rememberMe);
        }
      }),
      catchError(this.handleError.bind(this)),
      tap(() => this.isLoadingSubject.next(false))
    );
  }

  // Enhanced Registration with validation
  register(data: RegisterData): Observable<AuthResponse> {
    this.isLoadingSubject.next(true);
    
    // Client-side validation
    const validationError = this.validateRegistrationData(data);
    if (validationError) {
      this.isLoadingSubject.next(false);
      return throwError(() => ({ message: validationError }));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/register`, {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password,
      phone: data.phone?.trim()
    }).pipe(
      catchError(this.handleError.bind(this)),
      tap(() => this.isLoadingSubject.next(false))
    );
  }

  // Token refresh functionality
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => ({ message: 'No refresh token available' }));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, {
      refresh_token: refreshToken
    }).pipe(
      tap(response => {
        if (response.success && response.access_token) {
          this.setToken(response.access_token);
        }
      }),
      catchError(error => {
        this.logout().subscribe(); // Clear invalid tokens
        return throwError(() => error);
      })
    );
  }

  // Secure logout
  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {}).pipe(
      tap(() => this.clearUserData()),
      catchError(() => {
        // Even if logout fails on server, clear local data
        this.clearUserData();
        return throwError(() => ({ message: 'Logout completed locally' }));
      })
    );
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY) || sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setToken(token: string): void {
    const storage = localStorage.getItem(this.ACCESS_TOKEN_KEY) ? localStorage : sessionStorage;
    storage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  // User management
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic token validation (you might want to decode and check expiry)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Backward compatibility methods
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  getUserOrders(): Observable<any[]> {
    return this.getDemoOrders();
  }

  // Private helper methods
  private setCurrentUser(user: User, accessToken: string, refreshToken?: string, rememberMe?: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    storage.setItem(this.USER_KEY, JSON.stringify(user));
    
    if (refreshToken) {
      storage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    
    this.currentUserSubject.next(user);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
    
    if (userStr && this.isAuthenticated()) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearUserData();
      }
    } else {
      this.clearUserData();
    }
  }

  private clearUserData(): void {
    // Clear from both storages
    [localStorage, sessionStorage].forEach(storage => {
      storage.removeItem(this.ACCESS_TOKEN_KEY);
      storage.removeItem(this.REFRESH_TOKEN_KEY);
      storage.removeItem(this.USER_KEY);
    });
    
    // Clear cart data on logout for security
    localStorage.removeItem('cart');
    
    this.currentUserSubject.next(null);
  }

  private validateRegistrationData(data: RegisterData): string | null {
    if (!data.name?.trim()) {
      return 'Name is required';
    }

    if (!this.isValidEmail(data.email)) {
      return 'Invalid email format';
    }

    if (!data.password || data.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (data.password !== data.confirmPassword) {
      return 'Passwords do not match';
    }

    if (!data.acceptTerms) {
      return 'You must accept the terms and conditions';
    }

    // Password strength validation
    if (!/(?=.*[a-z])/.test(data.password)) {
      return 'Password must contain at least one lowercase letter';
    }

    if (!/(?=.*[A-Z])/.test(data.password)) {
      return 'Password must contain at least one uppercase letter';
    }

    if (!/(?=.*\d)/.test(data.password)) {
      return 'Password must contain at least one number';
    }

    return null;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email?.trim());
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to server';
    } else {
      errorMessage = `Server error: ${error.status}`;
    }

    console.error('Auth Service Error:', {
      status: error.status,
      message: errorMessage,
      error: error
    });

    return throwError(() => ({ message: errorMessage, status: error.status }));
  }

  // Demo methods for backward compatibility
  demoLogin(email: string, password: string = 'password'): Observable<any> {
    // Create demo user for testing
    const demoUser: User = {
      id: 1,
      name: email.split('@')[0],
      email: email,
      role: email.includes('admin') ? 'admin' : 'customer',
      avatar: 'https://via.placeholder.com/150',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Simulate API response
    const response: AuthResponse = {
      success: true,
      access_token: this.generateDemoToken(demoUser),
      user: demoUser
    };

    this.setCurrentUser(demoUser, response.access_token!, undefined, false);
    return new Observable(observer => {
      observer.next(response);
      observer.complete();
    });
  }

  demoRegister(userData: any): Observable<any> {
    const demoUser: User = {
      id: Math.floor(Math.random() * 1000),
      name: userData.name,
      email: userData.email,
      role: 'customer',
      avatar: 'https://via.placeholder.com/150',
      createdAt: new Date().toISOString()
    };

    return new Observable(observer => {
      observer.next({
        success: true,
        message: 'Registration successful',
        user: demoUser
      });
      observer.complete();
    });
  }

  private generateDemoToken(user: User): string {
    // Simple demo token (not secure, for demo only)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      user_id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    }));
    const signature = btoa('demo-signature');
    return `${header}.${payload}.${signature}`;
  }

  // Additional demo methods for orders
  getDemoOrders(): Observable<any[]> {
    const orders = [
      {
        id: 1,
        date: '2024-01-15',
        status: 'Delivered',
        total: 129.99,
        items: [
          { name: 'Wireless Headphones', quantity: 1, price: 129.99 }
        ]
      },
      {
        id: 2,
        date: '2024-01-10',
        status: 'Processing',
        total: 89.50,
        items: [
          { name: 'Phone Case', quantity: 2, price: 44.75 }
        ]
      }
    ];

    return new Observable(observer => {
      observer.next(orders);
      observer.complete();
    });
  }

  updateProfile(profileData: Partial<User>): Observable<any> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return throwError(() => ({ message: 'No user logged in' }));
    }

    const updatedUser = { ...currentUser, ...profileData };
    this.currentUserSubject.next(updatedUser);
    
    // Update storage
    const storage = localStorage.getItem(this.USER_KEY) ? localStorage : sessionStorage;
    storage.setItem(this.USER_KEY, JSON.stringify(updatedUser));

    return new Observable(observer => {
      observer.next({ success: true, user: updatedUser });
      observer.complete();
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    // Validate new password
    const validationError = this.validatePassword(newPassword);
    if (validationError) {
      return throwError(() => ({ message: validationError }));
    }

    return new Observable(observer => {
      observer.next({ success: true, message: 'Password changed successfully' });
      observer.complete();
    });
  }

  private validatePassword(password: string): string | null {
    if (!password || password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }

    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }

    return null;
  }
}