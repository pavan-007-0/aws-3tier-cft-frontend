import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { Product, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  template: `
    <div class="min-h-screen" style="background:#f1f3f6">
      <!-- Header -->
      <div class="bg-white shadow-sm px-4 py-3 border-b border-gray-200">
        <div class="max-w-5xl mx-auto flex items-center gap-3">
          <h1 class="text-lg font-semibold text-gray-900">My Wishlist</h1>
          <span class="text-sm text-gray-500">({{ items.length }} item{{ items.length !== 1 ? 's' : '' }})</span>
        </div>
      </div>

      <div class="max-w-5xl mx-auto px-4 py-4">
        <!-- Empty state -->
        <div *ngIf="items.length === 0" class="bg-white shadow-sm p-12 text-center">
          <div class="text-6xl mb-4">🤍</div>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p class="text-gray-500 mb-6">Save items you love by clicking the ♡ on any product</p>
          <button routerLink="/products"
            class="bg-[#2874f0] text-white font-bold px-8 py-3 text-sm tracking-wider hover:bg-blue-700 transition-colors"
            style="transform:none!important">
            CONTINUE SHOPPING
          </button>
        </div>

        <!-- Wishlist Grid -->
        <div *ngIf="items.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div *ngFor="let product of items"
            class="bg-white shadow-sm hover:shadow-md transition-shadow relative group">
            <!-- Remove -->
            <button (click)="remove(product.id)"
              class="absolute top-2 right-2 z-10 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:border-red-400 transition-colors"
              title="Remove from wishlist" style="transform:none!important">
              ✕
            </button>

            <a [routerLink]="['/products', product.id]" class="block p-3">
              <img [src]="getImage(product)" [alt]="product.name" loading="lazy"
                class="w-full h-36 object-contain" (error)="onImgErr($event)">
            </a>

            <!-- Info -->
            <div class="px-3 pb-3">
              <a [routerLink]="['/products', product.id]"
                class="text-xs text-gray-800 font-medium line-clamp-2 hover:text-[#2874f0] block mb-1">
                {{ product.name }}
              </a>
              <div class="flex items-baseline gap-2 mb-2">
                <span class="text-sm font-bold text-gray-900">{{ product.price | currency:'INR':'symbol':'1.0-0' }}</span>
                <span *ngIf="product.compare_price && product.compare_price > product.price"
                  class="text-xs text-[#388e3c] font-medium">
                  {{ getDiscount(product) }}% off
                </span>
              </div>
              <button (click)="addToCart(product)"
                class="w-full bg-[#ff9f00] text-white text-xs font-bold py-2 hover:bg-[#e8900a] transition-colors"
                style="transform:none!important">
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div id="fk-toast-container" class="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none"></div>
  `
})
export class WishlistComponent implements OnInit, OnDestroy {
  items: Product[] = [];
  private sub!: Subscription;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    public productService: ProductService,
    private router: Router
  ) { }

  ngOnInit() {
    this.sub = this.wishlistService.items$.subscribe(items => this.items = items);
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  remove(id: number) { this.wishlistService.remove(id); }

  addToCart(product: Product) {
    const itemWithResolvedImage = { ...product, image: this.getImage(product) };
    this.cartService.addItem(itemWithResolvedImage, 1);
    this.wishlistService.remove(product.id);
    this.showToast(`✅ Moved to cart!`);
  }

  getDiscount(p: Product): number {
    if (!p.compare_price || p.compare_price <= p.price) return 0;
    return Math.round(((p.compare_price - p.price) / p.compare_price) * 100);
  }

  getImage(p: Product): string {
    return this.productService.resolveProductImage(p);
  }

  onImgErr(e: any) { e.target.src = '/assets/products/laptopstand.jpg'; }

  private showToast(msg: string) {
    const c = document.getElementById('fk-toast-container'); if (!c) return;
    const t = document.createElement('div');
    t.className = 'fk-toast success'; t.textContent = msg; c.appendChild(t);
    setTimeout(() => t.classList.add('show'), 50);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => c.contains(t) && c.removeChild(t), 300); }, 2500);
  }
}
