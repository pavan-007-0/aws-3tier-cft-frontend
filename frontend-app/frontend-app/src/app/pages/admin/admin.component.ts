import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService, Product } from '../../services/product.service';
import { AuthService, User } from '../../services/auth.service';
import { OrderService, Order, OrderStats } from '../../services/order.service';
import { AnalyticsService, AnalyticsDashboard, SalesData, ProductAnalytics } from '../../services/analytics.service';
import { CustomerService, Customer, CustomerStats } from '../../services/customer.service';
import { NotificationService, EmailTemplate, NotificationSettings, MarketingCampaign } from '../../services/notification.service';
import { PermissionsService } from '../../services/permissions.service';
import { MobileAdminService } from '../../services/mobile-admin.service';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: Order[];
  topProducts: any[];
  salesData: any[];
}

interface AdminState {
  showProductModal: boolean;
  showCustomerModal: boolean;
  showTemplateModal: boolean;
  showCampaignModal: boolean;
  editingProduct: Product | null;
  editingCustomer: Customer | null;
  editingTemplate: EmailTemplate | null;
  editingCampaign: MarketingCampaign | null;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <!-- Admin Dashboard -->
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p class="text-gray-600 dark:text-gray-400">Manage your e-commerce platform</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <p class="text-sm text-gray-500 dark:text-gray-400">Welcome back,</p>
                <p class="font-semibold text-gray-900 dark:text-white">{{ currentUser?.name }}</p>
              </div>
              <div class="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">{{ getUserInitials() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Navigation Tabs -->
        <div class="mb-8">
          <nav class="flex space-x-8 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm" [class]="shouldUseCompactLayout() ? 'overflow-x-auto' : ''">
            <button 
              *ngFor="let tab of getVisibleTabs()"
              (click)="activeTab = tab.id"
              [class]="activeTab === tab.id ? 'bg-primary-100 dark:bg-primary-900/20 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
              class="px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 whitespace-nowrap"
              [class.text-sm]="shouldUseCompactLayout()"
            >
              <span [innerHTML]="tab.icon"></span>
              <span [class.hidden]="isMobile() && tab.id !== activeTab">{{ tab.name }}</span>
            </button>
          </nav>
        </div>

        <!-- Dashboard Overview -->
        <div *ngIf="activeTab === 'dashboard'" class="space-y-8">
          
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 gap-6" [ngClass]="shouldUseCompactLayout() ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700" [ngClass]="getPaddingClass()">
              <div class="flex items-center">
                <div class="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalProducts }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700" [ngClass]="getPaddingClass()">
              <div class="flex items-center">
                <div class="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalOrders }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700" [ngClass]="getPaddingClass()">
              <div class="flex items-center">
                <div class="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">\${{ stats.totalRevenue | number:'1.2-2' }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700" [ngClass]="getPaddingClass()">
              <div class="flex items-center">
                <div class="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalCustomers }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Orders & Top Products -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Recent Orders -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div *ngFor="let order of stats.recentOrders" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ order.order_number }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ order.customer_name }}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold text-gray-900 dark:text-white">\${{ order.total_amount }}</p>
                      <span class="px-2 py-1 text-xs rounded-full"
                            [ngClass]="getOrderStatusClass(order.status)">
                        {{ order.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Top Products -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Top Products</h3>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div *ngFor="let product of stats.topProducts" class="flex items-center space-x-4">
                    <img [src]="product.image" [alt]="product.name" class="w-12 h-12 rounded-lg object-cover">
                    <div class="flex-1">
                      <p class="font-medium text-gray-900 dark:text-white">{{ product.name }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ product.sales }} sold</p>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold text-gray-900 dark:text-white">\${{ product.revenue }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Management -->
        <div *ngIf="activeTab === 'products'" class="space-y-6">
          
          <!-- Products Header -->
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Products Management</h2>
            <button 
              (click)="openProductModal()"
              class="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>Add Product</span>
            </button>
          </div>

          <!-- Products Table -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr *ngFor="let product of products" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <img [src]="product.image" [alt]="product.name" class="w-12 h-12 rounded-lg object-cover">
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900 dark:text-white">{{ product.name }}</div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">{{ product.brand || 'No brand' }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ product.category || 'Uncategorized' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">\${{ product.price }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ product.stock || 0 }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 py-1 text-xs font-medium rounded-full"
                            [ngClass]="(product.stock || 0) > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'">
                        {{ (product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        (click)="editProduct(product)"
                        class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        (click)="deleteProduct(product.id)"
                        class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Orders Management -->
        <div *ngIf="activeTab === 'orders'" class="space-y-6">
          
          <!-- Orders Header -->
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Orders Management</h2>
            <div class="flex space-x-4">
              <select class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          <!-- Orders Table -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr *ngFor="let order of orders" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ order.order_number }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ order.items.length || 0 }} items</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ order.customer_name }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ order.customer_email }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ formatDate(order.created_at) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <select 
                        [value]="order.status"
                        (change)="updateOrderStatus(order.id, $event)"
                        class="px-3 py-1 text-xs rounded-full border-0 focus:ring-2 focus:ring-purple-500"
                        [ngClass]="getOrderStatusClass(order.status)"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">\${{ order.total_amount }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        (click)="viewOrderDetails(order)"
                        class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Customers Management -->
        <div *ngIf="activeTab === 'customers'" class="space-y-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Customers Management</h2>
          
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Customer Management</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">Customer management features coming soon!</p>
          </div>
        </div>

        <!-- Analytics -->
        <div *ngIf="activeTab === 'analytics'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
            <div class="flex space-x-4">
              <select [(ngModel)]="selectedDateRange" (change)="loadAnalytics()" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button (click)="exportAnalytics()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Export Report
              </button>
            </div>
          </div>

          <!-- KPI Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">\${{ analyticsData?.kpi_summary?.total_revenue | number:'1.2-2' }}</p>
                </div>
                <div class="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ analyticsData?.kpi_summary?.conversion_rate }}%</p>
                </div>
                <div class="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Order Value</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">\${{ analyticsData?.kpi_summary?.average_order_value | number:'1.2-2' }}</p>
                </div>
                <div class="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Customer LTV</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">\${{ customerStats?.customer_lifetime_value | number:'1.2-2' }}</p>
                </div>
                <div class="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Sales Trend Chart -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Sales Trend</h3>
              </div>
              <div class="p-6">
                <div class="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div class="text-center">
                    <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    <p>Sales trend chart will be displayed here</p>
                    <p class="text-sm mt-2">Revenue: \${{ getTotalRevenue() | number:'1.2-2' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Top Products -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Products</h3>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div *ngFor="let product of topProducts" class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <img [src]="product.image" [alt]="product.product_name" class="w-10 h-10 rounded-lg object-cover">
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ product.product_name }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ product.total_sales }} sold</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold text-gray-900 dark:text-white">\${{ product.total_revenue | number:'1.2-2' }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ product.conversion_rate }}% conv.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Customers Management -->
        <div *ngIf="activeTab === 'customers'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Customer Management</h2>
            <div class="flex space-x-4">
              <input 
                type="text" 
                [(ngModel)]="customerSearchQuery"
                (input)="searchCustomers()"
                placeholder="Search customers..."
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
              <button 
                (click)="openCustomerModal()"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Customer
              </button>
              <button 
                (click)="exportCustomers()"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Export
              </button>
            </div>
          </div>

          <!-- Customer Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center">
                <div class="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ customerStats?.total_customers }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center">
                <div class="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">New This Month</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ customerStats?.new_customers_this_month }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center">
                <div class="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active Customers</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ customerStats?.active_customers }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-center">
                <div class="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Retention Rate</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ customerStats?.retention_rate }}%</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Customers Table -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Spent</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr *ngFor="let customer of customers" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <img [src]="customer.avatar || getDefaultAvatar(customer.name)" [alt]="customer.name" class="w-10 h-10 rounded-full">
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900 dark:text-white">{{ customer.name }}</div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">{{ customer.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 py-1 text-xs font-medium rounded-full"
                            [ngClass]="getCustomerStatusClass(customer.status)">
                        {{ customer.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ customer.total_orders }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">\${{ customer.total_spent | number:'1.2-2' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ formatDate(customer.last_login || customer.created_at) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        (click)="editCustomer(customer)"
                        class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 mr-4"
                      >
                        Edit
                      </button>
                      <button 
                        (click)="sendCustomerMessage(customer)"
                        class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Message
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Notifications Management -->
        <div *ngIf="activeTab === 'notifications'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Email & Notifications</h2>
            <div class="flex space-x-4">
              <button 
                (click)="openTemplateModal()"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                New Template
              </button>
              <button 
                (click)="openCampaignModal()"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                New Campaign
              </button>
            </div>
          </div>

          <!-- Notification Tabs -->
          <div class="border-b border-gray-200 dark:border-gray-700">
            <nav class="-mb-px flex space-x-8">
              <button 
                *ngFor="let tab of notificationTabs"
                (click)="activeNotificationTab = tab.id"
                [class]="activeNotificationTab === tab.id ? 'border-primary-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'"
                class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>

          <!-- Email Templates -->
          <div *ngIf="activeNotificationTab === 'templates'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div *ngFor="let template of emailTemplates" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ template.name }}</h3>
                  <span class="px-2 py-1 text-xs rounded-full"
                        [ngClass]="template.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'">
                    {{ template.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ template.subject }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ template.type }}</span>
                  <div class="flex space-x-2">
                    <button 
                      (click)="editTemplate(template)"
                      class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      (click)="deleteTemplate(template.id)"
                      class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Marketing Campaigns -->
          <div *ngIf="activeNotificationTab === 'campaigns'" class="space-y-4">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recipients</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Open Rate</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sent Date</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr *ngFor="let campaign of marketingCampaigns" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">{{ campaign.name }}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">{{ campaign.subject }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs font-medium rounded-full"
                              [ngClass]="getCampaignStatusClass(campaign.status)">
                          {{ campaign.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ campaign.stats.recipients }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ campaign.stats.recipients > 0 ? ((campaign.stats.opened / campaign.stats.recipients) * 100).toFixed(1) : 0 }}%
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {{ campaign.sent_at ? formatDate(campaign.sent_at) : 'Not sent' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          (click)="viewCampaignStats(campaign)"
                          class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 mr-4"
                        >
                          View Stats
                        </button>
                        <button 
                          (click)="editCampaign(campaign)"
                          class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div *ngIf="activeNotificationTab === 'settings'" class="space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notification Settings</h3>
              
              <div class="space-y-6">
                <!-- Email Settings -->
                <div>
                  <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4">Email Configuration</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SMTP Host</label>
                      <input 
                        type="text" 
                        [(ngModel)]="notificationSettings.smtp_settings.host"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SMTP Port</label>
                      <input 
                        type="number" 
                        [(ngModel)]="notificationSettings.smtp_settings.port"
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                    </div>
                  </div>
                  <div class="mt-4 flex space-x-4">
                    <button 
                      (click)="testEmailConfiguration()"
                      class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Test Email
                    </button>
                    <button 
                      (click)="saveNotificationSettings()"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <div *ngIf="showProductModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingProduct ? 'Edit Product' : 'Add New Product' }}
          </h3>
        </div>
        
        <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
              <input 
                type="text" 
                formControlName="name"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</label>
              <input 
                type="text" 
                formControlName="brand"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select 
                formControlName="category"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Category</option>
                <option value="Audio">Audio</option>
                <option value="Wearables">Wearables</option>
                <option value="Accessories">Accessories</option>
                <option value="Smartphones">Smartphones</option>
                <option value="Gaming">Gaming</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (\$)</label>
              <input 
                type="number" 
                formControlName="price"
                step="0.01"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Quantity</label>
              <input 
                type="number" 
                formControlName="stock"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
              <input 
                type="text" 
                formControlName="image"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea 
              formControlName="description"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button 
              type="button"
              (click)="closeProductModal()"
              class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              [disabled]="productForm.invalid || saving"
              class="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span *ngIf="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span>{{ saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Customer Modal -->
    <div *ngIf="showCustomerModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingCustomer ? 'Edit Customer' : 'Add New Customer' }}
          </h3>
        </div>
        
        <div class="p-6">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            <p class="text-gray-500 dark:text-gray-400">Customer management form coming soon!</p>
          </div>
          
          <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button 
              type="button"
              (click)="showCustomerModal = false"
              class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Modal -->
    <div *ngIf="showTemplateModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingTemplate ? 'Edit Email Template' : 'Create New Email Template' }}
          </h3>
        </div>
        
        <div class="p-6">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2z"></path>
            </svg>
            <p class="text-gray-500 dark:text-gray-400">Email template editor coming soon!</p>
          </div>
          
          <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button 
              type="button"
              (click)="showTemplateModal = false"
              class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Campaign Modal -->
    <div *ngIf="showCampaignModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingCampaign ? 'Edit Marketing Campaign' : 'Create New Marketing Campaign' }}
          </h3>
        </div>
        
        <div class="p-6">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
            </svg>
            <p class="text-gray-500 dark:text-gray-400">Marketing campaign builder coming soon!</p>
          </div>
          
          <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button 
              type="button"
              (click)="showCampaignModal = false"
              class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdminComponent implements OnInit, OnDestroy {
  activeTab = 'dashboard';
  activeNotificationTab = 'templates';
  currentUser: User | null = null;
  
  // Data
  products: Product[] = [];
  orders: Order[] = [];
  customers: Customer[] = [];
  emailTemplates: EmailTemplate[] = [];
  marketingCampaigns: MarketingCampaign[] = [];
  analyticsData: AnalyticsDashboard | null = null;
  customerStats: CustomerStats | null = null;
  topProducts: ProductAnalytics[] = [];
  
  // Search and filters
  customerSearchQuery = '';
  selectedDateRange = '30d';
  
  // Settings
  notificationSettings: NotificationSettings = {
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
    order_notifications: true,
    marketing_notifications: true,
    system_notifications: true,
    smtp_settings: {
      host: '',
      port: 587,
      username: '',
      password: '',
      encryption: 'tls'
    },
    sms_settings: {
      provider: 'twilio',
      api_key: '',
      sender_id: ''
    }
  };
  
  stats: DashboardStats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    recentOrders: [],
    topProducts: [],
    salesData: []
  };

  // UI State
  showProductModal = false;
  showCustomerModal = false;
  showTemplateModal = false;
  showCampaignModal = false;
  editingProduct: Product | null = null;
  editingCustomer: Customer | null = null;
  editingTemplate: EmailTemplate | null = null;
  editingCampaign: MarketingCampaign | null = null;
  saving = false;
  
  // Forms
  productForm: FormGroup;

  // Navigation
  tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>' },
    { id: 'products', name: 'Products', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>' },
    { id: 'orders', name: 'Orders', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>' },
    { id: 'customers', name: 'Customers', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path></svg>' },
    { id: 'analytics', name: 'Analytics', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>' },
    { id: 'notifications', name: 'Notifications', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2z"></path></svg>' }
  ];

  notificationTabs = [
    { id: 'templates', name: 'Email Templates' },
    { id: 'campaigns', name: 'Marketing Campaigns' },
    { id: 'settings', name: 'Settings' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private orderService: OrderService,
    private analyticsService: AnalyticsService,
    private customerService: CustomerService,
    private notificationService: NotificationService,
    private permissionsService: PermissionsService,
    private mobileAdminService: MobileAdminService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      brand: [''],
      category: [''],
      stock: [0, [Validators.required, Validators.min(0)]],
      image: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
    
    this.loadData();
    this.loadAnalytics();
    this.loadCustomers();
    this.loadNotificationData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getUserInitials(): string {
    if (!this.currentUser?.name) return 'A';
    return this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  loadData() {
    this.loadProducts();
    this.loadOrders();
    this.loadStats();
  }

  // Analytics Methods
  loadAnalytics() {
    this.analyticsService.getAnalyticsDashboard().subscribe({
      next: (data) => {
        this.analyticsData = data;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
      }
    });

    this.analyticsService.getProductAnalytics(5).subscribe({
      next: (products) => {
        this.topProducts = products;
      },
      error: (error) => {
        console.error('Error loading product analytics:', error);
      }
    });
  }

  exportAnalytics() {
    this.analyticsService.exportReport('pdf').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting analytics:', error);
      }
    });
  }

  getTotalRevenue(): number {
    return this.analyticsData?.kpi_summary?.total_revenue || 0;
  }

  // Customer Management Methods
  loadCustomers() {
    this.customerService.getAllCustomers().subscribe({
      next: (result) => {
        this.customers = result.customers;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      }
    });

    this.customerService.getCustomerStats().subscribe({
      next: (stats) => {
        this.customerStats = stats;
      },
      error: (error) => {
        console.error('Error loading customer stats:', error);
      }
    });
  }

  searchCustomers() {
    if (this.customerSearchQuery.trim()) {
      this.customerService.searchCustomers(this.customerSearchQuery).subscribe({
        next: (customers) => {
          this.customers = customers;
        },
        error: (error) => {
          console.error('Error searching customers:', error);
        }
      });
    } else {
      this.loadCustomers();
    }
  }

  openCustomerModal() {
    this.showCustomerModal = true;
    this.editingCustomer = null;
  }

  editCustomer(customer: Customer) {
    this.editingCustomer = customer;
    this.showCustomerModal = true;
  }

  sendCustomerMessage(customer: Customer) {
    const message = {
      subject: 'Message from EcomStore',
      body: 'Hello ' + customer.name + ',\n\nThank you for being a valued customer!',
      type: 'email' as const
    };

    this.customerService.sendMessage(customer.id, message).subscribe({
      next: (response) => {
        console.log('Message sent successfully');
      },
      error: (error) => {
        console.error('Error sending message:', error);
      }
    });
  }

  exportCustomers() {
    this.customerService.exportCustomers('csv').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting customers:', error);
      }
    });
  }

  getDefaultAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`;
  }

  getCustomerStatusClass(status: string): string {
    const classes = {
      'active': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'inactive': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'suspended': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return classes[status as keyof typeof classes] || classes.active;
  }

  // Notification Management Methods
  loadNotificationData() {
    this.notificationService.getEmailTemplates().subscribe({
      next: (templates) => {
        this.emailTemplates = templates;
      },
      error: (error) => {
        console.error('Error loading email templates:', error);
      }
    });

    this.notificationService.getMarketingCampaigns().subscribe({
      next: (campaigns) => {
        this.marketingCampaigns = campaigns;
      },
      error: (error) => {
        console.error('Error loading marketing campaigns:', error);
      }
    });

    this.notificationService.getNotificationSettings().subscribe({
      next: (settings) => {
        this.notificationSettings = settings;
      },
      error: (error) => {
        console.error('Error loading notification settings:', error);
      }
    });
  }

  openTemplateModal() {
    this.showTemplateModal = true;
    this.editingTemplate = null;
  }

  editTemplate(template: EmailTemplate) {
    this.editingTemplate = template;
    this.showTemplateModal = true;
  }

  deleteTemplate(templateId: string) {
    if (confirm('Are you sure you want to delete this template?')) {
      this.notificationService.deleteEmailTemplate(templateId).subscribe({
        next: () => {
          this.loadNotificationData();
        },
        error: (error) => {
          console.error('Error deleting template:', error);
        }
      });
    }
  }

  openCampaignModal() {
    this.showCampaignModal = true;
    this.editingCampaign = null;
  }

  editCampaign(campaign: MarketingCampaign) {
    this.editingCampaign = campaign;
    this.showCampaignModal = true;
  }

  viewCampaignStats(campaign: MarketingCampaign) {
    console.log('Campaign stats:', campaign.stats);
  }

  getCampaignStatusClass(status: string): string {
    const classes = {
      'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      'scheduled': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'sending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'sent': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'paused': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    };
    return classes[status as keyof typeof classes] || classes.draft;
  }

  testEmailConfiguration() {
    this.notificationService.testEmailConfiguration().subscribe({
      next: (response) => {
        console.log('Email test successful:', response);
      },
      error: (error) => {
        console.error('Email test failed:', error);
      }
    });
  }

  saveNotificationSettings() {
    this.notificationService.updateNotificationSettings(this.notificationSettings).subscribe({
      next: (settings) => {
        this.notificationSettings = settings;
        console.log('Settings saved successfully');
      },
      error: (error) => {
        console.error('Error saving settings:', error);
      }
    });
  }

  // Permission helper methods
  canManageProducts(): boolean {
    return this.permissionsService.hasPermission('products.manage') || 
           this.permissionsService.hasPermission('products.update');
  }

  canManageOrders(): boolean {
    return this.permissionsService.hasPermission('orders.manage') || 
           this.permissionsService.hasPermission('orders.update');
  }

  canManageCustomers(): boolean {
    return this.permissionsService.hasPermission('customers.manage') || 
           this.permissionsService.hasPermission('customers.read');
  }

  canViewAnalytics(): boolean {
    return this.permissionsService.hasPermission('analytics.read');
  }

  canManageNotifications(): boolean {
    return this.permissionsService.hasPermission('settings.manage') || 
           this.permissionsService.isAdmin();
  }

  // Mobile helper methods
  isMobile(): boolean {
    return this.mobileAdminService.isMobile();
  }

  isTablet(): boolean {
    return this.mobileAdminService.isTablet();
  }

  shouldUseCompactLayout(): boolean {
    return this.mobileAdminService.shouldUseCompactLayout();
  }

  getCardSpacing(): string {
    return this.mobileAdminService.getCardSpacing();
  }

  getPaddingClass(): string {
    return this.mobileAdminService.getPaddingClass();
  }

  getUnreadNotificationCount(): number {
    return this.mobileAdminService.getUnreadCount();
  }

  // Enhanced mobile notifications
  showMobileNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    this.mobileAdminService.addNotification({
      title,
      message,
      type
    });

    // Add haptic feedback for mobile
    if (this.mobileAdminService.isTouchDevice()) {
      this.mobileAdminService.vibrate(100);
    }
  }

  // Get visible tabs based on permissions
  getVisibleTabs() {
    return this.tabs.filter(tab => {
      switch (tab.id) {
        case 'dashboard':
          return true; // Always visible
        case 'products':
          return this.canManageProducts();
        case 'orders':
          return this.canManageOrders();
        case 'customers':
          return this.canManageCustomers();
        case 'analytics':
          return this.canViewAnalytics();
        case 'notifications':
          return this.canManageNotifications();
        default:
          return true;
      }
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.products = response;
        } else if (response && response.products) {
          this.products = response.products;
        } else {
          // Load demo products
          this.loadDemoProducts();
        }
      },
      error: (err) => {
        console.error("Error fetching products:", err);
        this.loadDemoProducts();
      }
    });
  }

  loadDemoProducts() {
    this.products = [
      {
        id: 1,
        name: 'Premium Wireless Earbuds',
        description: 'High-quality wireless earbuds with active noise cancellation',
        price: 199,
        image: '/assets/products/earbuds.jpg',
        brand: 'AudioTech',
        category: 'Audio',
        stock: 25
      },
      {
        id: 2,
        name: 'Smart Glasses Pro',
        description: 'Revolutionary smart glasses with AR display',
        price: 899,
        image: '/assets/products/glasses.jpg',
        brand: 'VisionTech',
        category: 'Wearables',
        stock: 8
      },
      {
        id: 3,
        name: 'Professional Headphones',
        description: 'Studio-grade headphones with exceptional sound clarity',
        price: 299,
        image: '/assets/products/headphones.jpg',
        brand: 'SoundMaster',
        category: 'Audio',
        stock: 15
      }
    ];
  }

  loadOrders() {
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loadStats(); // Refresh stats after loading orders
      },
      error: (err) => {
        console.error("Error fetching orders:", err);
        // Fallback to demo orders
        this.orders = [
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
            items: []
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
            items: []
          }
        ];
      }
    });
  }

  loadStats() {
    this.stats = {
      totalProducts: this.products.length,
      totalOrders: this.orders.length,
      totalRevenue: this.orders.reduce((sum, order) => sum + order.total_amount, 0),
      totalCustomers: 156,
      recentOrders: this.orders.slice(0, 5),
      topProducts: [
        { name: 'Premium Wireless Earbuds', sales: 45, revenue: 8955, image: '/assets/products/earbuds.jpg' },
        { name: 'Smart Watch Elite', sales: 32, revenue: 12768, image: '/assets/products/smartwatch.jpg' },
        { name: 'Gaming Mouse Pro', sales: 28, revenue: 2492, image: '/assets/products/mouse.jpg' }
      ],
      salesData: []
    };
  }

  // Product Management
  openProductModal() {
    this.showProductModal = true;
    this.editingProduct = null;
    this.productForm.reset();
  }

  closeProductModal() {
    this.showProductModal = false;
    this.editingProduct = null;
    this.productForm.reset();
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.productForm.patchValue(product);
    this.showProductModal = true;
  }

  saveProduct() {
    if (this.productForm.valid) {
      this.saving = true;
      const productData = this.productForm.value;
      
      if (this.editingProduct) {
        productData.id = this.editingProduct.id;
        // Update existing product
        const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
        if (index !== -1) {
          this.products[index] = { ...productData };
        }
      } else {
        // Add new product
        productData.id = Math.max(...this.products.map(p => p.id), 0) + 1;
        this.products.push(productData);
      }
      
      setTimeout(() => {
        this.saving = false;
        this.closeProductModal();
        this.loadStats(); // Refresh stats
      }, 1000);
    }
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.products = this.products.filter(p => p.id !== id);
      this.loadStats(); // Refresh stats
    }
  }

  // Order Management
  updateOrderStatus(orderId: number, event: any) {
    const newStatus = event.target.value;
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (response) => {
        console.log('Order status updated successfully');
        // The order list will be automatically refreshed by the service
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        // Revert the change in UI if needed
      }
    });
  }

  viewOrderDetails(order: Order) {
    // Implement order details modal
    console.log('View order details:', order);
  }

  // Utility Methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getOrderStatusClass(status: string): string {
    const classes = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'confirmed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'processing': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'shipped': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      'delivered': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return classes[status as keyof typeof classes] || classes.pending;
  }
}
