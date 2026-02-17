import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    return this.checkAuth(route, state.url);
  }

  private checkAuth(route: ActivatedRouteSnapshot, url: string): Observable<boolean> {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.log('AuthGuard: User not authenticated, redirecting to login');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: url }
      });
      return of(false);
    }

    // Check role-based access if required
    const requiredRole = route.data?.['role'];
    if (requiredRole) {
      const currentUser = this.authService.getCurrentUser();
      
      if (!currentUser || !this.hasRequiredRole(currentUser.role, requiredRole)) {
        console.log(`AuthGuard: Insufficient permissions. Required: ${requiredRole}, Current: ${currentUser?.role}`);
        this.router.navigate(['/unauthorized']);
        return of(false);
      }
    }

    // Check admin access if required
    const requiresAdmin = route.data?.['requiresAdmin'];
    if (requiresAdmin && !this.authService.isAdmin()) {
      console.log('AuthGuard: Admin access required');
      this.router.navigate(['/unauthorized']);
      return of(false);
    }

    return of(true);
  }

  private hasRequiredRole(userRole: string, requiredRole: string | string[]): boolean {
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    return userRole === requiredRole;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      return true;
    }
    
    // Redirect authenticated users away from login/register pages
    this.router.navigate(['/dashboard']);
    return false;
  }
}
