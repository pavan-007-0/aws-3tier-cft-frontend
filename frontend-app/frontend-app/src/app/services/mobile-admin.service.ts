import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface MobileAdminConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
}

export interface MobileNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MobileAdminService {
  private configSubject = new BehaviorSubject<MobileAdminConfig>(this.getInitialConfig());
  private notificationsSubject = new BehaviorSubject<MobileNotification[]>([]);
  private sidebarOpenSubject = new BehaviorSubject<boolean>(false);

  public config$ = this.configSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();
  public sidebarOpen$ = this.sidebarOpenSubject.asObservable();

  constructor() {
    // Listen for window resize events
    fromEvent(window, 'resize').pipe(
      startWith(null),
      map(() => this.getInitialConfig())
    ).subscribe(config => {
      this.configSubject.next(config);
    });

    // Listen for orientation changes
    fromEvent(window, 'orientationchange').subscribe(() => {
      setTimeout(() => {
        this.configSubject.next(this.getInitialConfig());
      }, 100);
    });

    // Initialize with demo notifications
    this.initializeDemoNotifications();
  }

  private getInitialConfig(): MobileAdminConfig {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      screenWidth: width,
      screenHeight: height,
      orientation: width > height ? 'landscape' : 'portrait',
      touchSupported: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };
  }

  private initializeDemoNotifications(): void {
    const demoNotifications: MobileNotification[] = [
      {
        id: '1',
        title: 'New Order Received',
        message: 'Order #ORD-20241230-001 from John Doe',
        type: 'info',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        actionUrl: '/admin?tab=orders'
      },
      {
        id: '2',
        title: 'Low Stock Alert',
        message: 'Premium Wireless Earbuds - Only 3 left in stock',
        type: 'warning',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: false,
        actionUrl: '/admin?tab=products'
      },
      {
        id: '3',
        title: 'Payment Received',
        message: 'Payment of $299.99 received for Order #ORD-20241229-002',
        type: 'success',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true
      },
      {
        id: '4',
        title: 'System Update',
        message: 'Analytics data has been updated with latest sales figures',
        type: 'info',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        read: true,
        actionUrl: '/admin?tab=analytics'
      }
    ];

    this.notificationsSubject.next(demoNotifications);
  }

  // Get current device configuration
  getCurrentConfig(): MobileAdminConfig {
    return this.configSubject.value;
  }

  // Check if current device is mobile
  isMobile(): boolean {
    return this.configSubject.value.isMobile;
  }

  // Check if current device is tablet
  isTablet(): boolean {
    return this.configSubject.value.isTablet;
  }

  // Check if current device is desktop
  isDesktop(): boolean {
    return this.configSubject.value.isDesktop;
  }

  // Check if device supports touch
  isTouchDevice(): boolean {
    return this.configSubject.value.touchSupported;
  }

  // Get screen orientation
  getOrientation(): 'portrait' | 'landscape' {
    return this.configSubject.value.orientation;
  }

  // Sidebar management for mobile
  toggleSidebar(): void {
    this.sidebarOpenSubject.next(!this.sidebarOpenSubject.value);
  }

  openSidebar(): void {
    this.sidebarOpenSubject.next(true);
  }

  closeSidebar(): void {
    this.sidebarOpenSubject.next(false);
  }

  isSidebarOpen(): boolean {
    return this.sidebarOpenSubject.value;
  }

  // Notification management
  getNotifications(): MobileNotification[] {
    return this.notificationsSubject.value;
  }

  getUnreadNotifications(): MobileNotification[] {
    return this.notificationsSubject.value.filter(n => !n.read);
  }

  getUnreadCount(): number {
    return this.getUnreadNotifications().length;
  }

  markNotificationAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.value.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
  }

  markAllNotificationsAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(notifications);
  }

  addNotification(notification: Omit<MobileNotification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: MobileNotification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      read: false
    };

    const notifications = [newNotification, ...this.notificationsSubject.value];
    this.notificationsSubject.next(notifications);

    // Auto-remove notification after 24 hours
    setTimeout(() => {
      this.removeNotification(newNotification.id);
    }, 24 * 60 * 60 * 1000);
  }

  removeNotification(notificationId: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(notifications);
  }

  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
  }

  // Mobile-specific UI helpers
  getOptimalColumnCount(): number {
    const config = this.getCurrentConfig();
    
    if (config.isMobile) {
      return 1;
    } else if (config.isTablet) {
      return config.orientation === 'portrait' ? 2 : 3;
    } else {
      return config.screenWidth > 1400 ? 4 : 3;
    }
  }

  getOptimalTablePageSize(): number {
    const config = this.getCurrentConfig();
    
    if (config.isMobile) {
      return 10;
    } else if (config.isTablet) {
      return 20;
    } else {
      return 50;
    }
  }

  shouldUseCompactLayout(): boolean {
    return this.isMobile() || (this.isTablet() && this.getOrientation() === 'portrait');
  }

  shouldShowSidebarOverlay(): boolean {
    return this.isMobile() || this.isTablet();
  }

  getCardSpacing(): string {
    const config = this.getCurrentConfig();
    
    if (config.isMobile) {
      return 'gap-4';
    } else if (config.isTablet) {
      return 'gap-6';
    } else {
      return 'gap-8';
    }
  }

  getPaddingClass(): string {
    const config = this.getCurrentConfig();
    
    if (config.isMobile) {
      return 'p-4';
    } else if (config.isTablet) {
      return 'p-6';
    } else {
      return 'p-8';
    }
  }

  // PWA-like features
  canInstallPWA(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return Notification.requestPermission();
    }
    return Promise.resolve('denied');
  }

  sendPushNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }

  // Haptic feedback for mobile devices
  vibrate(pattern: number | number[] = 100): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // Quick actions for mobile
  getQuickActions(): Array<{id: string, label: string, icon: string, action: string}> {
    return [
      {
        id: 'new-product',
        label: 'Add Product',
        icon: '📦',
        action: 'products.create'
      },
      {
        id: 'view-orders',
        label: 'View Orders',
        icon: '📋',
        action: 'orders.view'
      },
      {
        id: 'customer-support',
        label: 'Support',
        icon: '💬',
        action: 'support.view'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: '📊',
        action: 'analytics.view'
      }
    ];
  }

  // Offline support
  isOnline(): boolean {
    return navigator.onLine;
  }

  onlineStatus(): Observable<boolean> {
    return fromEvent(window, 'online').pipe(
      startWith(navigator.onLine),
      map(() => navigator.onLine)
    );
  }

  // Performance optimization for mobile
  shouldLazyLoad(): boolean {
    return this.isMobile() || this.isTablet();
  }

  getImageQuality(): 'low' | 'medium' | 'high' {
    const config = this.getCurrentConfig();
    
    if (config.isMobile) {
      return 'medium';
    } else if (config.isTablet) {
      return 'high';
    } else {
      return 'high';
    }
  }

  shouldUseVirtualScrolling(): boolean {
    return this.isMobile();
  }
}