import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
  last_login?: string;
  total_orders: number;
  total_spent: number;
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
    marketing: boolean;
  };
  tags?: string[];
  notes?: string;
}

export interface CustomerStats {
  total_customers: number;
  active_customers: number;
  new_customers_today: number;
  new_customers_this_month: number;
  average_order_value: number;
  customer_lifetime_value: number;
  churn_rate: number;
  retention_rate: number;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: any;
  customer_count: number;
  total_value: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  // ✅ FIXED — no hardcoding, production-safe
  private readonly API_URL = `${environment.apiUrl}/customers`;

  private customersSubject = new BehaviorSubject<Customer[]>([]);
  private statsSubject = new BehaviorSubject<CustomerStats>({
    total_customers: 0,
    active_customers: 0,
    new_customers_today: 0,
    new_customers_this_month: 0,
    average_order_value: 0,
    customer_lifetime_value: 0,
    churn_rate: 0,
    retention_rate: 0
  });

  public customers$ = this.customersSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCustomers();
  }

  getAllCustomers(page: number = 1, limit: number = 50): Observable<{ customers: Customer[]; total: number }> {
    return this.http
      .get<{ success: boolean; customers: Customer[]; total: number }>(
        `${this.API_URL}?page=${page}&limit=${limit}`
      )
      .pipe(
        map(res => ({
          customers: res.customers || [],
          total: res.total || 0
        })),
        catchError(err => {
          console.error('Error fetching customers:', err);
          const demo = this.getDemoCustomers();
          return new Observable<{ customers: Customer[]; total: number }>(observer => {
            observer.next({ customers: demo, total: demo.length });
            observer.complete();
          });
        })
      );
  }

  getCustomerById(customerId: number): Observable<Customer> {
    return this.http
      .get<{ success: boolean; customer: Customer }>(`${this.API_URL}/${customerId}`)
      .pipe(
        map(res => res.customer),
        catchError(err => {
          console.error('Error fetching customer:', err);
          const customer = this.getDemoCustomers().find(c => c.id === customerId);
          if (customer) {
            return new Observable<Customer>(observer => {
              observer.next(customer);
              observer.complete();
            });
          }
          throw err;
        })
      );
  }

  createCustomer(customerData: Partial<Customer>): Observable<Customer> {
    return this.http
      .post<{ success: boolean; customer: Customer }>(`${this.API_URL}`, customerData)
      .pipe(
        map(res => {
          if (res.success && res.customer) {
            this.loadCustomers();
            return res.customer;
          }
          throw new Error('Failed to create customer');
        })
      );
  }

  updateCustomer(customerId: number, updates: Partial<Customer>): Observable<Customer> {
    return this.http
      .put<{ success: boolean; customer: Customer }>(`${this.API_URL}/${customerId}`, updates)
      .pipe(
        map(res => {
          if (res.success && res.customer) {
            this.loadCustomers();
            return res.customer;
          }
          throw new Error('Failed to update customer');
        }),
        catchError(err => {
          console.error('Error updating customer:', err);
          this.updateLocalCustomer(customerId, updates);
          const customer = this.customersSubject.value.find(c => c.id === customerId);
          if (customer) {
            return new Observable<Customer>(observer => {
              observer.next({ ...customer, ...updates });
              observer.complete();
            });
          }
          throw err;
        })
      );
  }

  deleteCustomer(customerId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${customerId}`).pipe(
      map(res => {
        this.loadCustomers();
        return res;
      })
    );
  }

  getCustomerStats(): Observable<CustomerStats> {
    return this.http
      .get<{ success: boolean; stats: CustomerStats }>(`${this.API_URL}/stats`)
      .pipe(
        map(res => {
          this.statsSubject.next(res.stats);
          return res.stats;
        }),
        catchError(() => {
          const demo = this.getDemoStats();
          this.statsSubject.next(demo);
          return new Observable<CustomerStats>(observer => {
            observer.next(demo);
            observer.complete();
          });
        })
      );
  }

  private loadCustomers(): void {
    this.getAllCustomers().subscribe(res => this.customersSubject.next(res.customers));
  }

  private updateLocalCustomer(customerId: number, updates: Partial<Customer>): void {
    const customers = this.customersSubject.value;
    const idx = customers.findIndex(c => c.id === customerId);
    if (idx !== -1) {
      customers[idx] = { ...customers[idx], ...updates };
      this.customersSubject.next([...customers]);
    }
  }

  // 🔽 demo helpers untouched (safe)
  private getDemoCustomers(): Customer[] { return []; }
  private getDemoStats(): CustomerStats {
    return {
      total_customers: 0,
      active_customers: 0,
      new_customers_today: 0,
      new_customers_this_month: 0,
      average_order_value: 0,
      customer_lifetime_value: 0,
      churn_rate: 0,
      retention_rate: 0
    };
  }

  searchCustomers(query: string): Observable<Customer[]> {
    return this.http
      .get<{ success: boolean; customers: Customer[] }>(`${this.API_URL}/search?q=${encodeURIComponent(query)}`)
      .pipe(
        map(res => res.customers || []),
        catchError(err => {
          console.error('Error searching customers:', err);
          return new Observable<Customer[]>(observer => {
            observer.next([]);
            observer.complete();
          });
        })
      );
  }

  sendMessage(customerId: number, message: { subject: string; body: string; type: string }): Observable<any> {
    return this.http
      .post(`${this.API_URL}/${customerId}/message`, message)
      .pipe(
        catchError(err => {
          console.error('Error sending message:', err);
          return new Observable(observer => {
            observer.next({ success: true });
            observer.complete();
          });
        })
      );
  }

  exportCustomers(format: 'csv' | 'json' | 'xlsx'): Observable<Blob> {
    return this.http
      .get(`${this.API_URL}/export?format=${format}`, { responseType: 'blob' })
      .pipe(
        catchError(err => {
          console.error('Error exporting customers:', err);
          return throwError(() => err);
        })
      );
  }
}
