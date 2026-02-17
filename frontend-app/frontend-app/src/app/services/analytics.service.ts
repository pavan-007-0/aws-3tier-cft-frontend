import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface ProductAnalytics {
  product_id: number;
  product_name: string;
  total_sales: number;
  total_revenue: number;
  average_rating: number;
  views: number;
  conversion_rate: number;
  image?: string;
}

export interface CustomerAnalytics {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  customer_lifetime_value: number;
  churn_rate: number;
}

export interface RevenueAnalytics {
  total_revenue: number;
  revenue_growth: number;
  average_order_value: number;
  revenue_by_category: { category: string; revenue: number; percentage: number }[];
  revenue_by_month: { month: string; revenue: number }[];
}

export interface TrafficAnalytics {
  total_visitors: number;
  unique_visitors: number;
  page_views: number;
  bounce_rate: number;
  conversion_rate: number;
  top_pages: { page: string; views: number }[];
}

export interface AnalyticsDashboard {
  sales_data: SalesData[];
  product_analytics: ProductAnalytics[];
  customer_analytics: CustomerAnalytics;
  revenue_analytics: RevenueAnalytics;
  traffic_analytics: TrafficAnalytics;
  kpi_summary: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    conversion_rate: number;
    average_order_value: number;
    customer_acquisition_cost: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly API_URL = 'http://127.0.0.1:5000/api/analytics';
  private analyticsSubject = new BehaviorSubject<AnalyticsDashboard | null>(null);
  
  public analytics$ = this.analyticsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get complete analytics dashboard
  getAnalyticsDashboard(dateRange?: { start: string; end: string }): Observable<AnalyticsDashboard> {
    const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
    
    return this.http.get<{success: boolean, data: AnalyticsDashboard}>(`${this.API_URL}/dashboard${params}`).pipe(
      map(response => {
        const analytics = response.data || this.getDemoAnalytics();
        this.analyticsSubject.next(analytics);
        return analytics;
      }),
      catchError(error => {
        console.error('Error fetching analytics:', error);
        const demoAnalytics = this.getDemoAnalytics();
        this.analyticsSubject.next(demoAnalytics);
        return new Observable<AnalyticsDashboard>(observer => {
          observer.next(demoAnalytics);
          observer.complete();
        });
      })
    );
  }

  // Get sales trends
  getSalesTrends(period: 'daily' | 'weekly' | 'monthly' = 'daily', days: number = 30): Observable<SalesData[]> {
    return this.http.get<{success: boolean, data: SalesData[]}>(`${this.API_URL}/sales-trends?period=${period}&days=${days}`).pipe(
      map(response => response.data || this.getDemoSalesData()),
      catchError(error => {
        console.error('Error fetching sales trends:', error);
        return new Observable<SalesData[]>(observer => {
          observer.next(this.getDemoSalesData());
          observer.complete();
        });
      })
    );
  }

  // Get product performance
  getProductAnalytics(limit: number = 10): Observable<ProductAnalytics[]> {
    return this.http.get<{success: boolean, data: ProductAnalytics[]}>(`${this.API_URL}/products?limit=${limit}`).pipe(
      map(response => response.data || this.getDemoProductAnalytics()),
      catchError(error => {
        console.error('Error fetching product analytics:', error);
        return new Observable<ProductAnalytics[]>(observer => {
          observer.next(this.getDemoProductAnalytics());
          observer.complete();
        });
      })
    );
  }

  // Get customer insights
  getCustomerAnalytics(): Observable<CustomerAnalytics> {
    return this.http.get<{success: boolean, data: CustomerAnalytics}>(`${this.API_URL}/customers`).pipe(
      map(response => response.data || this.getDemoCustomerAnalytics()),
      catchError(error => {
        console.error('Error fetching customer analytics:', error);
        return new Observable<CustomerAnalytics>(observer => {
          observer.next(this.getDemoCustomerAnalytics());
          observer.complete();
        });
      })
    );
  }

  // Get revenue breakdown
  getRevenueAnalytics(): Observable<RevenueAnalytics> {
    return this.http.get<{success: boolean, data: RevenueAnalytics}>(`${this.API_URL}/revenue`).pipe(
      map(response => response.data || this.getDemoRevenueAnalytics()),
      catchError(error => {
        console.error('Error fetching revenue analytics:', error);
        return new Observable<RevenueAnalytics>(observer => {
          observer.next(this.getDemoRevenueAnalytics());
          observer.complete();
        });
      })
    );
  }

  // Export analytics report
  exportReport(format: 'pdf' | 'excel' | 'csv', dateRange?: { start: string; end: string }): Observable<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (dateRange) {
      params.append('start', dateRange.start);
      params.append('end', dateRange.end);
    }

    return this.http.get(`${this.API_URL}/export?${params}`, { 
      responseType: 'blob' 
    }).pipe(
      catchError(error => {
        console.error('Error exporting report:', error);
        // Generate demo report
        return this.generateDemoReport(format);
      })
    );
  }

  // Real-time analytics updates
  getRealtimeMetrics(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/realtime`).pipe(
      catchError(error => {
        console.error('Error fetching realtime metrics:', error);
        return new Observable(observer => {
          observer.next({
            active_users: Math.floor(Math.random() * 50) + 10,
            current_sales: Math.floor(Math.random() * 1000) + 500,
            conversion_rate: (Math.random() * 5 + 2).toFixed(2)
          });
          observer.complete();
        });
      })
    );
  }

  // Private demo data methods
  private getDemoAnalytics(): AnalyticsDashboard {
    return {
      sales_data: this.getDemoSalesData(),
      product_analytics: this.getDemoProductAnalytics(),
      customer_analytics: this.getDemoCustomerAnalytics(),
      revenue_analytics: this.getDemoRevenueAnalytics(),
      traffic_analytics: {
        total_visitors: 12450,
        unique_visitors: 8920,
        page_views: 45680,
        bounce_rate: 32.5,
        conversion_rate: 3.8,
        top_pages: [
          { page: '/products', views: 15420 },
          { page: '/', views: 12350 },
          { page: '/products/earbuds', views: 8940 },
          { page: '/cart', views: 6780 },
          { page: '/checkout', views: 4560 }
        ]
      },
      kpi_summary: {
        total_revenue: 125680.50,
        total_orders: 1247,
        total_customers: 892,
        conversion_rate: 3.8,
        average_order_value: 100.75,
        customer_acquisition_cost: 25.40
      }
    };
  }

  private getDemoSalesData(): SalesData[] {
    const data: SalesData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 50) + 10,
        customers: Math.floor(Math.random() * 30) + 5
      });
    }
    
    return data;
  }

  private getDemoProductAnalytics(): ProductAnalytics[] {
    return [
      {
        product_id: 1,
        product_name: 'Premium Wireless Earbuds',
        total_sales: 245,
        total_revenue: 48755,
        average_rating: 4.8,
        views: 12450,
        conversion_rate: 1.97,
        image: '/assets/products/earbuds.jpg'
      },
      {
        product_id: 5,
        product_name: 'Flagship Smartphone',
        total_sales: 89,
        total_revenue: 106791,
        average_rating: 4.7,
        views: 8920,
        conversion_rate: 1.00,
        image: '/assets/products/mobile.jpg'
      },
      {
        product_id: 8,
        product_name: 'Smart Watch Elite',
        total_sales: 156,
        total_revenue: 62244,
        average_rating: 4.9,
        views: 9870,
        conversion_rate: 1.58,
        image: '/assets/products/smartwatch.jpg'
      },
      {
        product_id: 3,
        product_name: 'Professional Headphones',
        total_sales: 134,
        total_revenue: 40066,
        average_rating: 4.6,
        views: 7650,
        conversion_rate: 1.75,
        image: '/assets/products/headphones.jpg'
      },
      {
        product_id: 6,
        product_name: 'Gaming Mouse Pro',
        total_sales: 198,
        total_revenue: 17622,
        average_rating: 4.5,
        views: 6540,
        conversion_rate: 3.03,
        image: '/assets/products/mouse.jpg'
      }
    ];
  }

  private getDemoCustomerAnalytics(): CustomerAnalytics {
    return {
      total_customers: 892,
      new_customers: 156,
      returning_customers: 736,
      customer_lifetime_value: 340.50,
      churn_rate: 12.5
    };
  }

  private getDemoRevenueAnalytics(): RevenueAnalytics {
    return {
      total_revenue: 125680.50,
      revenue_growth: 15.8,
      average_order_value: 100.75,
      revenue_by_category: [
        { category: 'Audio', revenue: 45230.20, percentage: 36.0 },
        { category: 'Smartphones', revenue: 38940.80, percentage: 31.0 },
        { category: 'Wearables', revenue: 25150.30, percentage: 20.0 },
        { category: 'Gaming', revenue: 10890.10, percentage: 8.7 },
        { category: 'Accessories', revenue: 5469.10, percentage: 4.3 }
      ],
      revenue_by_month: [
        { month: 'Jan', revenue: 18450.30 },
        { month: 'Feb', revenue: 22340.80 },
        { month: 'Mar', revenue: 19870.20 },
        { month: 'Apr', revenue: 25680.50 },
        { month: 'May', revenue: 28940.70 },
        { month: 'Jun', revenue: 10398.10 }
      ]
    };
  }

  private generateDemoReport(format: string): Observable<Blob> {
    return new Observable<Blob>(observer => {
      // Generate a simple demo report
      const content = `E-commerce Analytics Report\n\nGenerated: ${new Date().toISOString()}\n\nTotal Revenue: $125,680.50\nTotal Orders: 1,247\nTotal Customers: 892\nConversion Rate: 3.8%`;
      const blob = new Blob([content], { type: 'text/plain' });
      observer.next(blob);
      observer.complete();
    });
  }
}