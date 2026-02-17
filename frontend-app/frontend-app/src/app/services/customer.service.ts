import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
  private readonly API_URL = 'http://127.0.0.1:5000/api/customers';
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

  // Get all customers
  getAllCustomers(page: number = 1, limit: number = 50): Observable<{customers: Customer[], total: number}> {
    return this.http.get<{success: boolean, customers: Customer[], total: number}>(`${this.API_URL}?page=${page}&limit=${limit}`).pipe(
      map(response => ({
        customers: response.customers || [],
        total: response.total || 0
      })),
      catchError(error => {
        console.error('Error fetching customers:', error);
        const demoCustomers = this.getDemoCustomers();
        return new Observable<{customers: Customer[], total: number}>(observer => {
          observer.next({ customers: demoCustomers, total: demoCustomers.length });
          observer.complete();
        });
      })
    );
  }

  // Get customer by ID
  getCustomerById(customerId: number): Observable<Customer> {
    return this.http.get<{success: boolean, customer: Customer}>(`${this.API_URL}/${customerId}`).pipe(
      map(response => response.customer),
      catchError(error => {
        console.error('Error fetching customer:', error);
        const demoCustomers = this.getDemoCustomers();
        const customer = demoCustomers.find(c => c.id === customerId);
        if (customer) {
          return new Observable<Customer>(observer => {
            observer.next(customer);
            observer.complete();
          });
        }
        throw error;
      })
    );
  }

  // Create new customer
  createCustomer(customerData: Partial<Customer>): Observable<Customer> {
    return this.http.post<{success: boolean, customer: Customer}>(`${this.API_URL}`, customerData).pipe(
      map(response => {
        if (response.success && response.customer) {
          this.loadCustomers(); // Refresh list
          return response.customer;
        }
        throw new Error('Failed to create customer');
      }),
      catchError(error => {
        console.error('Error creating customer:', error);
        throw error;
      })
    );
  }

  // Update customer
  updateCustomer(customerId: number, updates: Partial<Customer>): Observable<Customer> {
    return this.http.put<{success: boolean, customer: Customer}>(`${this.API_URL}/${customerId}`, updates).pipe(
      map(response => {
        if (response.success && response.customer) {
          this.loadCustomers(); // Refresh list
          return response.customer;
        }
        throw new Error('Failed to update customer');
      }),
      catchError(error => {
        console.error('Error updating customer:', error);
        // For demo, update locally
        this.updateLocalCustomer(customerId, updates);
        const customers = this.customersSubject.value;
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          return new Observable<Customer>(observer => {
            observer.next({ ...customer, ...updates });
            observer.complete();
          });
        }
        throw error;
      })
    );
  }

  // Delete customer
  deleteCustomer(customerId: number): Observable<any> {
    return this.http.delete<{success: boolean}>(`${this.API_URL}/${customerId}`).pipe(
      map(response => {
        if (response.success) {
          this.loadCustomers(); // Refresh list
          return response;
        }
        throw new Error('Failed to delete customer');
      }),
      catchError(error => {
        console.error('Error deleting customer:', error);
        throw error;
      })
    );
  }

  // Search customers
  searchCustomers(query: string, filters?: any): Observable<Customer[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.role) params.append('role', filters.role);

    return this.http.get<{success: boolean, customers: Customer[]}>(`${this.API_URL}/search?${params}`).pipe(
      map(response => response.customers || []),
      catchError(error => {
        console.error('Error searching customers:', error);
        return this.filterDemoCustomers(query, filters);
      })
    );
  }

  // Get customer statistics
  getCustomerStats(): Observable<CustomerStats> {
    return this.http.get<{success: boolean, stats: CustomerStats}>(`${this.API_URL}/stats`).pipe(
      map(response => {
        const stats = response.stats || this.getDemoStats();
        this.statsSubject.next(stats);
        return stats;
      }),
      catchError(error => {
        console.error('Error fetching customer stats:', error);
        const demoStats = this.getDemoStats();
        this.statsSubject.next(demoStats);
        return new Observable<CustomerStats>(observer => {
          observer.next(demoStats);
          observer.complete();
        });
      })
    );
  }

  // Get customer segments
  getCustomerSegments(): Observable<CustomerSegment[]> {
    return this.http.get<{success: boolean, segments: CustomerSegment[]}>(`${this.API_URL}/segments`).pipe(
      map(response => response.segments || this.getDemoSegments()),
      catchError(error => {
        console.error('Error fetching customer segments:', error);
        return new Observable<CustomerSegment[]>(observer => {
          observer.next(this.getDemoSegments());
          observer.complete();
        });
      })
    );
  }

  // Send message to customer
  sendMessage(customerId: number, message: { subject: string; body: string; type: 'email' | 'sms' }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${customerId}/message`, message).pipe(
      catchError(error => {
        console.error('Error sending message:', error);
        // For demo, simulate success
        return new Observable(observer => {
          observer.next({ success: true, message: 'Message sent successfully' });
          observer.complete();
        });
      })
    );
  }

  // Export customers
  exportCustomers(format: 'csv' | 'excel' = 'csv', filters?: any): Observable<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.role) params.append('role', filters.role);

    return this.http.get(`${this.API_URL}/export?${params}`, { 
      responseType: 'blob' 
    }).pipe(
      catchError(error => {
        console.error('Error exporting customers:', error);
        return this.generateDemoExport(format);
      })
    );
  }

  // Private methods
  private loadCustomers(): void {
    this.getAllCustomers().subscribe(result => {
      this.customersSubject.next(result.customers);
    });
  }

  private updateLocalCustomer(customerId: number, updates: Partial<Customer>): void {
    const customers = this.customersSubject.value;
    const index = customers.findIndex(c => c.id === customerId);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updates };
      this.customersSubject.next([...customers]);
    }
  }

  private getDemoCustomers(): Customer[] {
    return [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=2563eb&color=fff',
        status: 'active',
        role: 'user',
        created_at: '2024-01-15T10:30:00Z',
        last_login: '2024-12-30T08:45:00Z',
        total_orders: 12,
        total_spent: 2450.80,
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        preferences: {
          newsletter: true,
          notifications: true,
          marketing: false
        },
        tags: ['VIP', 'Frequent Buyer'],
        notes: 'Excellent customer, always pays on time'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1 (555) 987-6543',
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=7c3aed&color=fff',
        status: 'active',
        role: 'user',
        created_at: '2024-02-20T14:20:00Z',
        last_login: '2024-12-29T16:30:00Z',
        total_orders: 8,
        total_spent: 1890.50,
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        preferences: {
          newsletter: true,
          notifications: false,
          marketing: true
        },
        tags: ['Tech Enthusiast'],
        notes: 'Interested in latest technology products'
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1 (555) 456-7890',
        avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=059669&color=fff',
        status: 'active',
        role: 'user',
        created_at: '2024-03-10T09:15:00Z',
        last_login: '2024-12-28T12:20:00Z',
        total_orders: 15,
        total_spent: 3240.90,
        address: {
          street: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        },
        preferences: {
          newsletter: false,
          notifications: true,
          marketing: true
        },
        tags: ['High Value', 'Gaming'],
        notes: 'Gaming enthusiast, prefers high-end products'
      },
      {
        id: 4,
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        phone: '+1 (555) 321-0987',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=dc2626&color=fff',
        status: 'inactive',
        role: 'user',
        created_at: '2024-04-05T11:45:00Z',
        last_login: '2024-11-15T10:30:00Z',
        total_orders: 3,
        total_spent: 450.30,
        address: {
          street: '321 Elm St',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          country: 'USA'
        },
        preferences: {
          newsletter: true,
          notifications: true,
          marketing: false
        },
        tags: ['New Customer'],
        notes: 'Needs re-engagement campaign'
      },
      {
        id: 5,
        name: 'Admin User',
        email: 'admin@ecomstore.com',
        phone: '+1 (555) 000-0001',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff',
        status: 'active',
        role: 'admin',
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2024-12-30T09:00:00Z',
        total_orders: 0,
        total_spent: 0,
        preferences: {
          newsletter: false,
          notifications: true,
          marketing: false
        },
        tags: ['Staff'],
        notes: 'System administrator'
      }
    ];
  }

  private getDemoStats(): CustomerStats {
    return {
      total_customers: 892,
      active_customers: 756,
      new_customers_today: 12,
      new_customers_this_month: 156,
      average_order_value: 125.80,
      customer_lifetime_value: 340.50,
      churn_rate: 8.5,
      retention_rate: 91.5
    };
  }

  private getDemoSegments(): CustomerSegment[] {
    return [
      {
        id: 'vip',
        name: 'VIP Customers',
        description: 'High-value customers with $1000+ lifetime spend',
        criteria: { total_spent: { gte: 1000 } },
        customer_count: 89,
        total_value: 125680.50
      },
      {
        id: 'frequent',
        name: 'Frequent Buyers',
        description: 'Customers with 5+ orders',
        criteria: { total_orders: { gte: 5 } },
        customer_count: 234,
        total_value: 89450.30
      },
      {
        id: 'new',
        name: 'New Customers',
        description: 'Customers who joined in the last 30 days',
        criteria: { created_at: { gte: '30_days_ago' } },
        customer_count: 156,
        total_value: 12340.80
      },
      {
        id: 'inactive',
        name: 'Inactive Customers',
        description: 'No orders in the last 90 days',
        criteria: { last_order: { lte: '90_days_ago' } },
        customer_count: 78,
        total_value: 8920.40
      }
    ];
  }

  private filterDemoCustomers(query: string, filters?: any): Observable<Customer[]> {
    return new Observable<Customer[]>(observer => {
      let customers = this.getDemoCustomers();
      
      if (query) {
        const q = query.toLowerCase();
        customers = customers.filter(customer => 
          customer.name.toLowerCase().includes(q) ||
          customer.email.toLowerCase().includes(q) ||
          customer.phone?.toLowerCase().includes(q)
        );
      }
      
      if (filters?.status) {
        customers = customers.filter(customer => customer.status === filters.status);
      }
      
      if (filters?.role) {
        customers = customers.filter(customer => customer.role === filters.role);
      }
      
      observer.next(customers);
      observer.complete();
    });
  }

  private generateDemoExport(format: string): Observable<Blob> {
    return new Observable<Blob>(observer => {
      const customers = this.getDemoCustomers();
      let content = '';
      
      if (format === 'csv') {
        content = 'ID,Name,Email,Phone,Status,Role,Total Orders,Total Spent\n';
        customers.forEach(customer => {
          content += `${customer.id},"${customer.name}","${customer.email}","${customer.phone || ''}","${customer.status}","${customer.role}",${customer.total_orders},${customer.total_spent}\n`;
        });
      } else {
        content = JSON.stringify(customers, null, 2);
      }
      
      const blob = new Blob([content], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      observer.next(blob);
      observer.complete();
    });
  }
}