import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService, User } from './auth.service';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number;
  is_system_role: boolean;
}

export interface UserPermissions {
  user_id: number;
  roles: string[];
  permissions: string[];
  can_access_admin: boolean;
  can_manage_users: boolean;
  can_manage_products: boolean;
  can_manage_orders: boolean;
  can_view_analytics: boolean;
  can_manage_settings: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private userPermissionsSubject = new BehaviorSubject<UserPermissions | null>(null);
  public userPermissions$ = this.userPermissionsSubject.asObservable();

  private readonly defaultPermissions: Permission[] = [
    // Product permissions
    { id: 'products.create', name: 'Create Products', description: 'Create new products', resource: 'products', action: 'create' },
    { id: 'products.read', name: 'View Products', description: 'View product listings', resource: 'products', action: 'read' },
    { id: 'products.update', name: 'Edit Products', description: 'Edit existing products', resource: 'products', action: 'update' },
    { id: 'products.delete', name: 'Delete Products', description: 'Delete products', resource: 'products', action: 'delete' },
    { id: 'products.manage', name: 'Manage Products', description: 'Full product management', resource: 'products', action: 'manage' },

    // Order permissions
    { id: 'orders.create', name: 'Create Orders', description: 'Create new orders', resource: 'orders', action: 'create' },
    { id: 'orders.read', name: 'View Orders', description: 'View order listings', resource: 'orders', action: 'read' },
    { id: 'orders.update', name: 'Edit Orders', description: 'Edit existing orders', resource: 'orders', action: 'update' },
    { id: 'orders.delete', name: 'Delete Orders', description: 'Delete orders', resource: 'orders', action: 'delete' },
    { id: 'orders.manage', name: 'Manage Orders', description: 'Full order management', resource: 'orders', action: 'manage' },

    // Customer permissions
    { id: 'customers.create', name: 'Create Customers', description: 'Create new customers', resource: 'customers', action: 'create' },
    { id: 'customers.read', name: 'View Customers', description: 'View customer listings', resource: 'customers', action: 'read' },
    { id: 'customers.update', name: 'Edit Customers', description: 'Edit existing customers', resource: 'customers', action: 'update' },
    { id: 'customers.delete', name: 'Delete Customers', description: 'Delete customers', resource: 'customers', action: 'delete' },
    { id: 'customers.manage', name: 'Manage Customers', description: 'Full customer management', resource: 'customers', action: 'manage' },

    // Analytics permissions
    { id: 'analytics.read', name: 'View Analytics', description: 'View analytics and reports', resource: 'analytics', action: 'read' },
    { id: 'analytics.manage', name: 'Manage Analytics', description: 'Full analytics management', resource: 'analytics', action: 'manage' },

    // Settings permissions
    { id: 'settings.read', name: 'View Settings', description: 'View system settings', resource: 'settings', action: 'read' },
    { id: 'settings.update', name: 'Edit Settings', description: 'Edit system settings', resource: 'settings', action: 'update' },
    { id: 'settings.manage', name: 'Manage Settings', description: 'Full settings management', resource: 'settings', action: 'manage' },

    // User permissions
    { id: 'users.create', name: 'Create Users', description: 'Create new users', resource: 'users', action: 'create' },
    { id: 'users.read', name: 'View Users', description: 'View user listings', resource: 'users', action: 'read' },
    { id: 'users.update', name: 'Edit Users', description: 'Edit existing users', resource: 'users', action: 'update' },
    { id: 'users.delete', name: 'Delete Users', description: 'Delete users', resource: 'users', action: 'delete' },
    { id: 'users.manage', name: 'Manage Users', description: 'Full user management', resource: 'users', action: 'manage' },

    // Admin permissions
    { id: 'admin.access', name: 'Admin Access', description: 'Access admin dashboard', resource: 'admin', action: 'read' },
    { id: 'admin.manage', name: 'Admin Management', description: 'Full admin management', resource: 'admin', action: 'manage' }
  ];

  private readonly defaultRoles: Role[] = [
    {
      id: 'super_admin',
      name: 'Super Administrator',
      description: 'Full system access with all permissions',
      permissions: this.defaultPermissions.map(p => p.id),
      level: 100,
      is_system_role: true
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Administrative access with most permissions',
      permissions: [
        'products.manage', 'orders.manage', 'customers.manage',
        'analytics.read', 'settings.update', 'users.read',
        'admin.access'
      ],
      level: 80,
      is_system_role: true
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Management access with limited permissions',
      permissions: [
        'products.read', 'products.update', 'orders.manage',
        'customers.read', 'customers.update', 'analytics.read',
        'admin.access'
      ],
      level: 60,
      is_system_role: true
    },
    {
      id: 'staff',
      name: 'Staff',
      description: 'Staff access with basic permissions',
      permissions: [
        'products.read', 'orders.read', 'orders.update',
        'customers.read', 'admin.access'
      ],
      level: 40,
      is_system_role: true
    },
    {
      id: 'customer',
      name: 'Customer',
      description: 'Customer access with minimal permissions',
      permissions: ['products.read'],
      level: 10,
      is_system_role: true
    }
  ];

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadUserPermissions(user);
      } else {
        this.userPermissionsSubject.next(null);
      }
    });
  }

  // Load user permissions based on their role
  private loadUserPermissions(user: User): void {
    const userRole = user.role || 'customer';
    const role = this.defaultRoles.find(r => r.id === userRole);
    
    if (role) {
      const permissions: UserPermissions = {
        user_id: user.id,
        roles: [userRole],
        permissions: role.permissions,
        can_access_admin: role.permissions.includes('admin.access'),
        can_manage_users: role.permissions.includes('users.manage'),
        can_manage_products: role.permissions.includes('products.manage') || role.permissions.includes('products.update'),
        can_manage_orders: role.permissions.includes('orders.manage') || role.permissions.includes('orders.update'),
        can_view_analytics: role.permissions.includes('analytics.read'),
        can_manage_settings: role.permissions.includes('settings.manage') || role.permissions.includes('settings.update')
      };
      
      this.userPermissionsSubject.next(permissions);
    }
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    const userPermissions = this.userPermissionsSubject.value;
    if (!userPermissions) return false;
    
    return userPermissions.permissions.includes(permission) || 
           userPermissions.permissions.includes(permission.split('.')[0] + '.manage');
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Check if user can access admin dashboard
  canAccessAdmin(): boolean {
    const userPermissions = this.userPermissionsSubject.value;
    return userPermissions?.can_access_admin || false;
  }

  // Check if user can manage specific resource
  canManageResource(resource: string): boolean {
    return this.hasPermission(`${resource}.manage`);
  }

  // Check if user can perform specific action on resource
  canPerformAction(resource: string, action: string): boolean {
    return this.hasPermission(`${resource}.${action}`);
  }

  // Get all available permissions
  getAllPermissions(): Permission[] {
    return [...this.defaultPermissions];
  }

  // Get all available roles
  getAllRoles(): Role[] {
    return [...this.defaultRoles];
  }

  // Get user's current permissions
  getCurrentUserPermissions(): UserPermissions | null {
    return this.userPermissionsSubject.value;
  }

  // Get role by ID
  getRoleById(roleId: string): Role | undefined {
    return this.defaultRoles.find(role => role.id === roleId);
  }

  // Get permissions for role
  getPermissionsForRole(roleId: string): Permission[] {
    const role = this.getRoleById(roleId);
    if (!role) return [];
    
    return this.defaultPermissions.filter(permission => 
      role.permissions.includes(permission.id)
    );
  }

  // Check if user has higher or equal role level
  hasRoleLevel(minLevel: number): boolean {
    const userPermissions = this.userPermissionsSubject.value;
    if (!userPermissions || !userPermissions.roles.length) return false;
    
    const userRole = this.getRoleById(userPermissions.roles[0]);
    return userRole ? userRole.level >= minLevel : false;
  }

  // Get user's role level
  getUserRoleLevel(): number {
    const userPermissions = this.userPermissionsSubject.value;
    if (!userPermissions || !userPermissions.roles.length) return 0;
    
    const userRole = this.getRoleById(userPermissions.roles[0]);
    return userRole ? userRole.level : 0;
  }

  // Check if user is admin or higher
  isAdmin(): boolean {
    return this.hasRoleLevel(80);
  }

  // Check if user is super admin
  isSuperAdmin(): boolean {
    return this.hasRoleLevel(100);
  }

  // Check if user is manager or higher
  isManager(): boolean {
    return this.hasRoleLevel(60);
  }

  // Check if user is staff or higher
  isStaff(): boolean {
    return this.hasRoleLevel(40);
  }
}