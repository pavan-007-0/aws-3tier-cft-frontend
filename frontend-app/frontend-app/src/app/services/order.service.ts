import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image?: string;
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  customer_name: string;
  customer_email: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  created_at: string;
  updated_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  items: OrderItem[];
  shipping_address?: ShippingAddress;
  notes?: string;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  total_revenue: number;
  average_order_value: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = 'http://127.0.0.1:5000/api/orders';
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private statsSubject = new BehaviorSubject<OrderStats>({
    total_orders: 0,
    pending_orders: 0,
    shipped_orders: 0,
    delivered_orders: 0,
    total_revenue: 0,
    average_order_value: 0
  });

  public orders$ = this.ordersSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadOrders();
  }

  // Get all orders (admin)
  getAllOrders(): Observable<Order[]> {
    return this.http.get<{success: boolean, orders: Order[]}>(`${this.API_URL}/admin/all`).pipe(
      map(response => response.orders || []),
      catchError(error => {
        console.error('Error fetching orders:', error);
        return this.getDemoOrders();
      })
    );
  }

  // Get orders by user ID
  getUserOrders(userId: number): Observable<Order[]> {
    return this.http.get<{success: boolean, orders: Order[]}>(`${this.API_URL}/user/${userId}`).pipe(
      map(response => response.orders || []),
      catchError(error => {
        console.error('Error fetching user orders:', error);
        return this.getDemoUserOrders(userId);
      })
    );
  }

  // Get order by ID
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<{success: boolean, order: Order}>(`${this.API_URL}/${orderId}`).pipe(
      map(response => response.order),
      catchError(error => {
        console.error('Error fetching order:', error);
        return throwError(() => error);
      })
    );
  }

  // Create new order
  createOrder(orderData: any): Observable<Order> {
    return this.http.post<{success: boolean, order: Order}>(`${this.API_URL}`, orderData).pipe(
      map(response => {
        if (response.success && response.order) {
          this.loadOrders(); // Refresh orders list
          return response.order;
        }
        throw new Error('Failed to create order');
      }),
      catchError(error => {
        console.error('Error creating order:', error);
        return throwError(() => error);
      })
    );
  }

  // Update order status
  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${orderId}/status`, { status }).pipe(
      map(response => {
        if (response.success) {
          this.loadOrders(); // Refresh orders list
          return response;
        }
        throw new Error('Failed to update order status');
      }),
      catchError(error => {
        console.error('Error updating order status:', error);
        // For demo, update locally
        this.updateLocalOrderStatus(orderId, status);
        return new Observable(observer => {
          observer.next({ success: true, message: 'Order status updated' });
          observer.complete();
        });
      })
    );
  }

  // Get order statistics
  getOrderStats(): Observable<OrderStats> {
    return this.http.get<{success: boolean, stats: OrderStats}>(`${this.API_URL}/admin/stats`).pipe(
      map(response => response.stats),
      catchError(error => {
        console.error('Error fetching order stats:', error);
        return this.calculateDemoStats();
      })
    );
  }

  // Search orders
  searchOrders(query: string, filters?: any): Observable<Order[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    return this.http.get<{success: boolean, orders: Order[]}>(`${this.API_URL}/search?${params}`).pipe(
      map(response => response.orders || []),
      catchError(error => {
        console.error('Error searching orders:', error);
        return this.filterDemoOrders(query, filters);
      })
    );
  }

  // Export orders
  exportOrders(format: 'csv' | 'excel' = 'csv', filters?: any): Observable<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    return this.http.get(`${this.API_URL}/export?${params}`, { 
      responseType: 'blob' 
    }).pipe(
      catchError(error => {
        console.error('Error exporting orders:', error);
        return throwError(() => error);
      })
    );
  }

  // Private methods
  private loadOrders(): void {
    this.getAllOrders().subscribe(orders => {
      this.ordersSubject.next(orders);
      this.calculateStats(orders);
    });
  }

  private updateLocalOrderStatus(orderId: number, status: string): void {
    const orders = this.ordersSubject.value;
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = status as any;
      orders[orderIndex].updated_at = new Date().toISOString();
      
      if (status === 'shipped') {
        orders[orderIndex].shipped_at = new Date().toISOString();
      } else if (status === 'delivered') {
        orders[orderIndex].delivered_at = new Date().toISOString();
      }
      
      this.ordersSubject.next([...orders]);
      this.calculateStats(orders);
    }
  }

  private calculateStats(orders: Order[]): void {
    const stats: OrderStats = {
      total_orders: orders.length,
      pending_orders: orders.filter(o => o.status === 'pending').length,
      shipped_orders: orders.filter(o => o.status === 'shipped').length,
      delivered_orders: orders.filter(o => o.status === 'delivered').length,
      total_revenue: orders.reduce((sum, o) => sum + o.total_amount, 0),
      average_order_value: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length : 0
    };
    
    this.statsSubject.next(stats);
  }

  private getDemoOrders(): Observable<Order[]> {
    const demoOrders: Order[] = [
      {
        id: 1,
        order_number: 'ORD-20241230-001',
        user_id: 2,
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        status: 'pending',
        payment_status: 'paid',
        payment_method: 'credit_card',
        subtotal: 299.99,
        tax_amount: 24.00,
        shipping_amount: 0,
        total_amount: 323.99,
        created_at: '2024-12-30T10:30:00Z',
        items: [
          {
            id: 1,
            product_id: 1,
            product_name: 'Premium Wireless Earbuds',
            quantity: 1,
            unit_price: 199.99,
            total_price: 199.99,
            product_image: '/assets/products/earbuds.jpg'
          },
          {
            id: 2,
            product_id: 6,
            product_name: 'Gaming Mouse Pro',
            quantity: 1,
            unit_price: 89.99,
            total_price: 89.99,
            product_image: '/assets/products/mouse.jpg'
          }
        ],
        shipping_address: {
          first_name: 'John',
          last_name: 'Doe',
          address_line_1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'USA',
          phone: '+1 (555) 123-4567'
        }
      },
      {
        id: 2,
        order_number: 'ORD-20241229-002',
        user_id: 3,
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        status: 'shipped',
        payment_status: 'paid',
        payment_method: 'paypal',
        subtotal: 899.99,
        tax_amount: 72.00,
        shipping_amount: 0,
        total_amount: 971.99,
        created_at: '2024-12-29T15:20:00Z',
        shipped_at: '2024-12-30T09:15:00Z',
        items: [
          {
            id: 3,
            product_id: 2,
            product_name: 'Smart Glasses Pro',
            quantity: 1,
            unit_price: 899.99,
            total_price: 899.99,
            product_image: '/assets/products/glasses.jpg'
          }
        ],
        shipping_address: {
          first_name: 'Jane',
          last_name: 'Smith',
          address_line_1: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          postal_code: '90210',
          country: 'USA',
          phone: '+1 (555) 987-6543'
        }
      },
      {
        id: 3,
        order_number: 'ORD-20241228-003',
        user_id: 4,
        customer_name: 'Mike Johnson',
        customer_email: 'mike@example.com',
        status: 'delivered',
        payment_status: 'paid',
        payment_method: 'credit_card',
        subtotal: 1599.98,
        tax_amount: 128.00,
        shipping_amount: 0,
        total_amount: 1727.98,
        created_at: '2024-12-28T08:45:00Z',
        shipped_at: '2024-12-29T14:20:00Z',
        delivered_at: '2024-12-30T16:45:00Z',
        items: [
          {
            id: 4,
            product_id: 5,
            product_name: 'Flagship Smartphone',
            quantity: 1,
            unit_price: 1199.99,
            total_price: 1199.99,
            product_image: '/assets/products/mobile.jpg'
          },
          {
            id: 5,
            product_id: 8,
            product_name: 'Smart Watch Elite',
            quantity: 1,
            unit_price: 399.99,
            total_price: 399.99,
            product_image: '/assets/products/smartwatch.jpg'
          }
        ],
        shipping_address: {
          first_name: 'Mike',
          last_name: 'Johnson',
          address_line_1: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          postal_code: '60601',
          country: 'USA',
          phone: '+1 (555) 456-7890'
        }
      }
    ];

    return new Observable<Order[]>(observer => {
      observer.next(demoOrders);
      observer.complete();
    });
  }

  private getDemoUserOrders(userId: number): Observable<Order[]> {
    return this.getDemoOrders().pipe(
      map(orders => orders.filter(order => order.user_id === userId))
    );
  }

  private calculateDemoStats(): Observable<OrderStats> {
    return this.getDemoOrders().pipe(
      map(orders => {
        return {
          total_orders: orders.length,
          pending_orders: orders.filter(o => o.status === 'pending').length,
          shipped_orders: orders.filter(o => o.status === 'shipped').length,
          delivered_orders: orders.filter(o => o.status === 'delivered').length,
          total_revenue: orders.reduce((sum, o) => sum + o.total_amount, 0),
          average_order_value: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length : 0
        };
      })
    );
  }

  private filterDemoOrders(query: string, filters?: any): Observable<Order[]> {
    return this.getDemoOrders().pipe(
      map(orders => {
        let filtered = orders;
        
        if (query) {
          const q = query.toLowerCase();
          filtered = filtered.filter(order => 
            order.order_number.toLowerCase().includes(q) ||
            order.customer_name.toLowerCase().includes(q) ||
            order.customer_email.toLowerCase().includes(q)
          );
        }
        
        if (filters?.status) {
          filtered = filtered.filter(order => order.status === filters.status);
        }
        
        return filtered;
      })
    );
  }
}