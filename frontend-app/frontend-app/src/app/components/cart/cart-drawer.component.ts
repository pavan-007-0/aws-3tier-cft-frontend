import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Backdrop -->
    <div 
      *ngIf="isOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
      [class.opacity-100]="isOpen"
      [class.opacity-0]="!isOpen"
      (click)="closeCart()"
    ></div>

    <!-- Cart Drawer -->
    <div 
      class="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
      [class.translate-x-0]="isOpen"
      [class.translate-x-full]="!isOpen"
      *ngIf="isOpen || isAnimating"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <svg class="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-.5"></path>
          </svg>
          Shopping Cart ({{ itemCount }})
        </h2>
        <button 
          (click)="closeCart()"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Cart Content -->
      <div class="flex flex-col" style="height: calc(100% - 80px);">
        <!-- Empty Cart -->
        <div *ngIf="items.length === 0" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div class="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-.5"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">Add some products to get started!</p>
          <button
            (click)="continueShopping()"
            class="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium"
          >
            Continue Shopping
          </button>
        </div>

        <!-- Cart Items -->
        <div *ngIf="items.length > 0" class="flex-1 overflow-y-auto">
          <div class="p-4 space-y-4">
            <div 
              *ngFor="let item of items; trackBy: trackByItemId" 
              class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <!-- Product Image -->
              <div class="flex-shrink-0">
                <img 
                  [src]="item.image" 
                  [alt]="item.name"
                  class="w-16 h-16 object-cover rounded-lg bg-gray-200 dark:bg-gray-600"
                  (error)="onImageError($event)"
                />
              </div>

              <!-- Product Info -->
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ item.name }}</h4>
                <p class="text-sm text-primary-600 dark:text-primary-400 font-medium">\${{ item.price | number:'1.2-2' }}</p>
                
                <!-- Quantity Controls -->
                <div class="flex items-center mt-2 space-x-2">
                  <button 
                    (click)="decreaseQuantity(item.id)"
                    class="w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-sm text-gray-700 dark:text-gray-200"
                    [disabled]="item.quantity <= 1"
                  >
                    -
                  </button>
                  
                  <span class="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">{{ item.quantity }}</span>
                  
                  <button 
                    (click)="increaseQuantity(item.id)"
                    class="w-7 h-7 flex items-center justify-center bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-sm text-gray-700 dark:text-gray-200"
                    [disabled]="item.maxQuantity && item.quantity >= item.maxQuantity"
                  >
                    +
                  </button>
                  
                  <button 
                    (click)="removeItem(item.id)"
                    class="ml-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Remove item"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Item Total -->
              <div class="flex-shrink-0 text-right">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  \${{ (item.price * item.quantity) | number:'1.2-2' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Footer -->
        <div *ngIf="items.length > 0" class="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-white dark:bg-gray-800 flex-shrink-0">
          <!-- Subtotal -->
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span class="text-lg font-bold text-gray-900 dark:text-white">\${{ total | number:'1.2-2' }}</span>
          </div>

          <!-- Shipping Info -->
          <div class="text-xs text-center text-gray-500 dark:text-gray-400">
            <span *ngIf="total >= 100; else shippingCost">🎉 Free shipping!</span>
            <ng-template #shippingCost>
              Add \${{ (100 - total) | number:'1.2-2' }} more for free shipping
            </ng-template>
          </div>

          <!-- Checkout Button -->
          <button
            (click)="goToCheckout()"
            class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-md flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            Checkout (\${{ total | number:'1.2-2' }})
          </button>
          
          <!-- View Cart Button -->
          <button
            (click)="goToCart()"
            class="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            View Full Cart
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `]
})
export class CartDrawerComponent implements OnInit, OnDestroy {
  isOpen = false;
  isAnimating = false;
  items: CartItem[] = [];
  itemCount = 0;
  total = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to cart state
    this.subscriptions.push(
      this.cartService.isOpen$.subscribe(isOpen => {
        if (isOpen !== this.isOpen) {
          this.isOpen = isOpen;
          if (isOpen) {
            this.isAnimating = true;
          } else {
            setTimeout(() => this.isAnimating = false, 300);
          }
        }
      }),

      this.cartService.items$.subscribe(items => {
        this.items = items;
      }),

      this.cartService.itemCount$.subscribe(count => {
        this.itemCount = count;
      }),

      this.cartService.total$.subscribe(total => {
        this.total = total;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  closeCart() {
    this.cartService.closeCart();
  }

  continueShopping() {
    this.closeCart();
  }

  increaseQuantity(productId: number) {
    this.cartService.increaseQuantity(productId);
  }

  decreaseQuantity(productId: number) {
    this.cartService.decreaseQuantity(productId);
  }

  removeItem(productId: number) {
    this.cartService.removeItem(productId);
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  goToCheckout() {
    this.closeCart();
    this.router.navigate(['/checkout']);
  }

  goToCart() {
    this.closeCart();
    this.router.navigate(['/cart']);
  }

  trackByItemId(index: number, item: CartItem): number {
    return item.id;
  }

  onImageError(event: any) {
    // Fallback to a default product image
    event.target.src = '/assets/products/mobile.jpg';
  }
}