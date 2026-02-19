import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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

  private readonly API_URL = `${environment.apiUrl}/orders`;

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

  // ===================== API CALLS =====================

  getAllOrders(): Observable<Order[]> {
    return this.http
      .get<{ success: boolean; orders: Order[] }>(`${this.API_URL}/admin/all`)
      .pipe(
        map(res => res.orders || []),
        catchError(() => this.getDemoOrders())
      );
  }

  getUserOrders(userId: number): Observable<Order[]> {
    return this.http
      .get<{ success: boolean; orders: Order[] }>(`${this.API_URL}/user/${userId}`)
      .pipe(
        map(res => res.orders || []),
        catchError(() => this.getDemoUserOrders(userId))
      );
  }

  getOrderById(orderId: number): Observable<Order> {
    return this.http
      .get<{ success: boolean; order: Order }>(`${this.API_URL}/${orderId}`)
      .pipe(
        map(res => res.order),
        catchError(err => throwError(() => err))
      );
  }

  createOrder(orderData: any): Observable<Order> {
    return this.http
      .post<{ success: boolean; order: Order }>(this.API_URL, orderData)
      .pipe(
        map(res => {
          if (!res.success) throw new Error('Order creation failed');
          this.loadOrders();
          return res.order;
        })
      );
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http
      .put(`${this.API_URL}/${orderId}/status`, { status })
      .pipe(
        map(res => {
          this.loadOrders();
          return res;
        }),
        catchError(() => {
          this.updateLocalOrderStatus(orderId, status);
          return new Observable(obs => {
            obs.next({ success: true });
            obs.complete();
          });
        })
      );
  }

  getOrderStats(): Observable<OrderStats> {
    return this.http
      .get<{ success: boolean; stats: OrderStats }>(`${this.API_URL}/admin/stats`)
      .pipe(
        map(res => res.stats),
        catchError(() => this.calculateDemoStats())
      );
  }

  // ===================== LOCAL HELPERS =====================

  private loadOrders(): void {
    this.getAllOrders().subscribe(orders => {
      this.ordersSubject.next(orders);
      this.calculateStats(orders);
    });
  }

  private updateLocalOrderStatus(orderId: number, status: string): void {
    const orders = [...this.ordersSubject.value];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = status as any;
    order.updated_at = new Date().toISOString();

    if (status === 'shipped') order.shipped_at = new Date().toISOString();
    if (status === 'delivered') order.delivered_at = new Date().toISOString();

    this.ordersSubject.next(orders);
    this.calculateStats(orders);
  }

  private calculateStats(orders: Order[]): void {
    this.statsSubject.next({
      total_orders: orders.length,
      pending_orders: orders.filter(o => o.status === 'pending').length,
      shipped_orders: orders.filter(o => o.status === 'shipped').length,
      delivered_orders: orders.filter(o => o.status === 'delivered').length,
      total_revenue: orders.reduce((s, o) => s + o.total_amount, 0),
      average_order_value: orders.length
        ? orders.reduce((s, o) => s + o.total_amount, 0) / orders.length
        : 0
    });
  }

  // ===================== DEMO FALLBACK =====================

  private getDemoOrders(): Observable<Order[]> {
    return new Observable(obs => {
      obs.next([]);
      obs.complete();
    });
  }

  private getDemoUserOrders(userId: number): Observable<Order[]> {
    return this.getDemoOrders().pipe(
      map(orders => orders.filter(o => o.user_id === userId))
    );
  }

  private calculateDemoStats(): Observable<OrderStats> {
    return new Observable(obs => {
      obs.next({
        total_orders: 0,
        pending_orders: 0,
        shipped_orders: 0,
        delivered_orders: 0,
        total_revenue: 0,
        average_order_value: 0
      });
      obs.complete();
    });
  }
}
