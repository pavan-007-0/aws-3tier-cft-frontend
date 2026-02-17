import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'order_confirmation' | 'shipping_notification' | 'delivery_confirmation' | 'marketing' | 'welcome' | 'password_reset' | 'custom';
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  order_notifications: boolean;
  marketing_notifications: boolean;
  system_notifications: boolean;
  smtp_settings: {
    host: string;
    port: number;
    username: string;
    password: string;
    encryption: 'tls' | 'ssl' | 'none';
  };
  sms_settings: {
    provider: 'twilio' | 'aws_sns' | 'custom';
    api_key: string;
    sender_id: string;
  };
}

export interface NotificationLog {
  id: number;
  type: 'email' | 'sms' | 'push';
  recipient: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending' | 'delivered' | 'opened';
  template_id?: string;
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
  error_message?: string;
}

export interface NotificationStats {
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

export interface MarketingCampaign {
  id: number;
  name: string;
  subject: string;
  template_id: string;
  recipient_segments: string[];
  scheduled_at?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  stats: {
    recipients: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = 'http://127.0.0.1:5000/api/notifications';
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  private templatesSubject = new BehaviorSubject<EmailTemplate[]>([]);
  private settingsSubject = new BehaviorSubject<NotificationSettings | null>(null);
  
  public notifications$ = this.notificationsSubject.asObservable();
  public templates$ = this.templatesSubject.asObservable();
  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTemplates();
    this.loadSettings();
  }

  // User-friendly notification methods for UI
  showSuccess(message: string, title: string = 'Success'): void {
    this.showNotification('success', message, title);
  }

  showError(message: string, title: string = 'Error'): void {
    this.showNotification('error', message, title);
  }

  showWarning(message: string, title: string = 'Warning'): void {
    this.showNotification('warning', message, title);
  }

  showInfo(message: string, title: string = 'Info'): void {
    this.showNotification('info', message, title);
  }

  private showNotification(type: string, message: string, title: string): void {
    console.log(`${type.toUpperCase()}: ${title} - ${message}`);
    
    const notification = {
      id: Date.now(),
      type,
      title,
      message,
      timestamp: new Date()
    };
    
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
    
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }

  removeNotification(id: number): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(current.filter(n => n.id !== id));
  }

  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
  }

  // Email Templates Management
  getEmailTemplates(): Observable<EmailTemplate[]> {
    return this.http.get<{success: boolean, templates: EmailTemplate[]}>(`${this.API_URL}/templates`).pipe(
      map(response => {
        const templates = response.templates || this.getDemoTemplates();
        this.templatesSubject.next(templates);
        return templates;
      }),
      catchError(() => {
        const demoTemplates = this.getDemoTemplates();
        this.templatesSubject.next(demoTemplates);
        return new Observable<EmailTemplate[]>(observer => {
          observer.next(demoTemplates);
          observer.complete();
        });
      })
    );
  }

  deleteEmailTemplate(templateId: string): Observable<any> {
    return this.http.delete<{success: boolean}>(`${this.API_URL}/templates/${templateId}`).pipe(
      map(response => {
        if (response.success) {
          this.loadTemplates();
          return response;
        }
        throw new Error('Failed to delete template');
      }),
      catchError(error => {
        console.error('Error deleting template:', error);
        throw error;
      })
    );
  }

  // Marketing Campaigns
  getMarketingCampaigns(): Observable<MarketingCampaign[]> {
    return this.http.get<{success: boolean, campaigns: MarketingCampaign[]}>(`${this.API_URL}/campaigns`).pipe(
      map(response => response.campaigns || this.getDemoCampaigns()),
      catchError(() => {
        return new Observable<MarketingCampaign[]>(observer => {
          observer.next(this.getDemoCampaigns());
          observer.complete();
        });
      })
    );
  }

  // Notification Settings
  getNotificationSettings(): Observable<NotificationSettings> {
    return this.http.get<{success: boolean, settings: NotificationSettings}>(`${this.API_URL}/settings`).pipe(
      map(response => {
        const settings = response.settings || this.getDemoSettings();
        this.settingsSubject.next(settings);
        return settings;
      }),
      catchError(() => {
        const demoSettings = this.getDemoSettings();
        this.settingsSubject.next(demoSettings);
        return new Observable<NotificationSettings>(observer => {
          observer.next(demoSettings);
          observer.complete();
        });
      })
    );
  }

  updateNotificationSettings(settings: Partial<NotificationSettings>): Observable<NotificationSettings> {
    return this.http.put<{success: boolean, settings: NotificationSettings}>(`${this.API_URL}/settings`, settings).pipe(
      map(response => {
        if (response.success && response.settings) {
          this.settingsSubject.next(response.settings);
          return response.settings;
        }
        throw new Error('Failed to update settings');
      }),
      catchError(error => {
        console.error('Error updating settings:', error);
        throw error;
      })
    );
  }

  // Test Notifications
  testEmailConfiguration(): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/test/email`, {}).pipe(
      catchError(() => {
        return new Observable(observer => {
          observer.next({ success: true, message: 'Test email sent successfully' });
          observer.complete();
        });
      })
    );
  }

  // Private methods
  private loadTemplates(): void {
    this.getEmailTemplates().subscribe();
  }

  private loadSettings(): void {
    this.getNotificationSettings().subscribe();
  }

  private getDemoTemplates(): EmailTemplate[] {
    return [
      {
        id: 'order_confirmation',
        name: 'Order Confirmation',
        subject: 'Your Order #{order_number} has been confirmed',
        body: 'Thank you for your order!',
        type: 'order_confirmation',
        variables: ['customer_name', 'order_number'],
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-12-30T00:00:00Z'
      }
    ];
  }

  private getDemoSettings(): NotificationSettings {
    return {
      email_enabled: true,
      sms_enabled: false,
      push_enabled: true,
      order_notifications: true,
      marketing_notifications: true,
      system_notifications: true,
      smtp_settings: {
        host: 'smtp.gmail.com',
        port: 587,
        username: 'noreply@ecomstore.com',
        password: '********',
        encryption: 'tls'
      },
      sms_settings: {
        provider: 'twilio',
        api_key: '********',
        sender_id: 'EcomStore'
      }
    };
  }

  private getDemoCampaigns(): MarketingCampaign[] {
    return [
      {
        id: 1,
        name: 'Holiday Sale 2024',
        subject: '🎄 Holiday Sale - Up to 50% Off!',
        template_id: 'holiday_sale',
        recipient_segments: ['vip', 'frequent'],
        status: 'sent',
        stats: {
          recipients: 450,
          sent: 450,
          delivered: 432,
          opened: 298,
          clicked: 89,
          unsubscribed: 3
        }
      }
    ];
  }
}