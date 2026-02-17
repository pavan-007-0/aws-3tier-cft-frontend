import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AnimatedButtonComponent } from '../../components/ui/animated-button.component';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule, AnimatedButtonComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Success Animation -->
        <div class="text-center mb-12">
          <div class="success-checkmark mx-auto mb-6">
            <svg class="w-24 h-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-fade-in">
            Order Placed Successfully! 🎉
          </h1>
          
          <p class="text-xl text-gray-600 dark:text-gray-300 animate-slide-up">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>
        </div>

        <!-- Order Details Card -->
        <div *ngIf="orderData" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 animate-scale-in">
          <div class="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Order Details</h2>
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Order Number</p>
                <p class="text-lg font-mono font-semibold text-purple-600 dark:text-purple-400">
                  {{ orderData.orderNumber }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
                <p class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ formatDate(orderData.createdAt) }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  {{ orderData.status | titlecase }}
                </span>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items Ordered</h3>
            <div class="space-y-4">
              <div *ngFor="let item of orderData.items" class="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img 
                  [src]="item.image" 
                  [alt]="item.name"
                  class="w-16 h-16 object-cover rounded-lg bg-gray-200 dark:bg-gray-600"
                />
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ item.name }}</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Quantity: {{ item.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">
                    \${{ (item.price * item.quantity) | number:'1.2-2' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span class="text-gray-900 dark:text-white">\${{ orderData.subtotal | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Tax</span>
                <span class="text-gray-900 dark:text-white">\${{ orderData.tax | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Shipping</span>
                <span class="text-gray-900 dark:text-white">
                  {{ orderData.shipping === 0 ? 'Free' : ('$' + (orderData.shipping | number:'1.2-2')) }}
                </span>
              </div>
              <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div class="flex justify-between text-lg font-bold">
                  <span class="text-gray-900 dark:text-white">Total</span>
                  <span class="text-purple-600 dark:text-purple-400">\${{ orderData.total | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Information -->
        <div *ngIf="orderData?.customerInfo" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 animate-slide-up">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Customer Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Customer Details</h4>
              <div class="space-y-1">
                <p class="text-gray-900 dark:text-white">
                  {{ orderData.customerInfo.firstName }} {{ orderData.customerInfo.lastName }}
                </p>
                <p class="text-gray-600 dark:text-gray-300">{{ orderData.customerInfo.email }}</p>
                <p class="text-gray-600 dark:text-gray-300">{{ orderData.customerInfo.phone }}</p>
              </div>
            </div>
            <div *ngIf="orderData.shipping">
              <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Shipping Address</h4>
              <div class="space-y-1 text-gray-600 dark:text-gray-300">
                <p>{{ orderData.shipping.address }}</p>
                <p>{{ orderData.shipping.city }}, {{ orderData.shipping.state }} {{ orderData.shipping.zipCode }}</p>
                <p>{{ orderData.shipping.country }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 mb-8 animate-fade-in">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">What's Next?</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Order Confirmation</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                You'll receive an email confirmation with your order details shortly.
              </p>
            </div>
            
            <div class="text-center">
              <div class="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Processing</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Your order is being prepared and will be shipped within 1-2 business days.
              </p>
            </div>
            
            <div class="text-center">
              <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Delivery</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Track your package and receive updates via email and SMS.
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <app-animated-button
            text="Continue Shopping"
            variant="primary"
            size="lg"
            [glowEffect]="true"
            (clicked)="continueShopping()"
            icon="<svg class='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-.5'></path></svg>"
          ></app-animated-button>
          
          <app-animated-button
            text="View Order History"
            variant="outline"
            size="lg"
            (clicked)="viewOrderHistory()"
            icon="<svg class='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'></path></svg>"
          ></app-animated-button>
          
          <app-animated-button
            text="Download Receipt"
            variant="outline"
            size="lg"
            (clicked)="downloadReceipt()"
            icon="<svg class='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'></path></svg>"
          ></app-animated-button>
        </div>

        <!-- Support Information -->
        <div class="text-center mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Need Help?</h4>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Our customer support team is here to help with any questions about your order.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@ecomstore.com" class="text-purple-600 hover:text-purple-700 font-medium">
              📧 support@ecomstore.com
            </a>
            <a href="tel:+1-800-123-4567" class="text-purple-600 hover:text-purple-700 font-medium">
              📞 1-800-123-4567
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-checkmark {
      animation: checkmark 0.6s ease-in-out;
    }

    @keyframes checkmark {
      0% {
        transform: scale(0) rotate(45deg);
        opacity: 0;
      }
      50% {
        transform: scale(1.2) rotate(45deg);
        opacity: 1;
      }
      100% {
        transform: scale(1) rotate(45deg);
        opacity: 1;
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.8s ease-out;
    }

    .animate-slide-up {
      animation: slideUp 0.6s ease-out 0.2s both;
    }

    .animate-scale-in {
      animation: scaleIn 0.5s ease-out 0.4s both;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(30px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes scaleIn {
      from { 
        opacity: 0;
        transform: scale(0.9);
      }
      to { 
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class OrderSuccessComponent implements OnInit {
  orderData: any = null;

  constructor(private router: Router) {
    // Get order data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.orderData = navigation.extras.state['order'];
    }
  }

  ngOnInit() {
    // If no order data, redirect to home
    if (!this.orderData) {
      this.router.navigate(['/']);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }

  viewOrderHistory() {
    this.router.navigate(['/orders']);
  }

  downloadReceipt() {
    // Implement receipt download functionality
    console.log('Downloading receipt for order:', this.orderData?.orderNumber);
    
    // Create a simple receipt content
    const receiptContent = this.generateReceiptContent();
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${this.orderData?.orderNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private generateReceiptContent(): string {
    if (!this.orderData) return '';

    return `
ECOMSTORE RECEIPT
================

Order Number: ${this.orderData.orderNumber}
Order Date: ${this.formatDate(this.orderData.createdAt)}
Status: ${this.orderData.status}

CUSTOMER INFORMATION
-------------------
Name: ${this.orderData.customerInfo?.firstName} ${this.orderData.customerInfo?.lastName}
Email: ${this.orderData.customerInfo?.email}
Phone: ${this.orderData.customerInfo?.phone}

SHIPPING ADDRESS
---------------
${this.orderData.shipping?.address}
${this.orderData.shipping?.city}, ${this.orderData.shipping?.state} ${this.orderData.shipping?.zipCode}
${this.orderData.shipping?.country}

ITEMS ORDERED
------------
${this.orderData.items?.map((item: any) => 
  `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

ORDER SUMMARY
------------
Subtotal: $${this.orderData.subtotal?.toFixed(2)}
Tax: $${this.orderData.tax?.toFixed(2)}
Shipping: ${this.orderData.shipping === 0 ? 'Free' : '$' + this.orderData.shipping?.toFixed(2)}
Total: $${this.orderData.total?.toFixed(2)}

Thank you for your business!
Visit us at: https://ecomstore.com
Support: support@ecomstore.com | 1-800-123-4567
    `.trim();
  }
}
