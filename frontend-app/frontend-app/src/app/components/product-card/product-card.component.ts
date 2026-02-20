import { Component, Input, Output, EventEmitter, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnimatedButtonComponent } from '../ui/animated-button.component';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  compare_price?: number;
  image?: string;
  brand?: string;
  featured?: boolean;
  rating?: number;
  review_count?: number;
  stock?: number;
  category?: string;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, AnimatedButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      #cardElement
      class="product-card group cursor-pointer"
      (mouseenter)="onMouseEnter($event)"
      (mouseleave)="onMouseLeave()"
      (mousemove)="onMouseMove($event)"
      [class.is-flipped]="isFlipped"
    >
      <!-- Card Inner -->
      <div class="card-inner">
        <!-- Front Side -->
        <div class="card-front">
          <!-- Product Image Container -->
          <div class="image-container relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
            <!-- Skeleton Loader -->
            <div *ngIf="!imageLoaded" class="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 animate-pulse"></div>
            
            <!-- Product Image with Lazy Loading -->
            <img 
              [src]="getProductImageUrl()" 
              [alt]="product.name"
              loading="lazy"
              decoding="async"
              class="product-image w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              [class.loaded]="imageLoaded"
              (load)="onImageLoad()"
              (error)="onImageError($event)"
            />
            
            <!-- Image Overlay -->
            <div class="image-overlay absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <!-- Badges -->
            <div class="absolute top-3 left-3 flex flex-col gap-2">
              <span *ngIf="product.featured" class="badge badge-featured">
                ⭐ Featured
              </span>
              <span *ngIf="getDiscountPercentage() > 0" class="badge badge-discount">
                -{{ getDiscountPercentage() }}%
              </span>
              <span *ngIf="product.stock && product.stock < 10" class="badge badge-stock">
                Only {{ product.stock }} left
              </span>
            </div>
            
            <!-- Quick Actions -->
            <div class="quick-actions absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <button 
                (click)="onQuickView($event)"
                class="action-btn"
                title="Quick View"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
              
              <button 
                (click)="onToggleWishlist($event)"
                class="action-btn"
                [class.active]="isInWishlist"
                title="Add to Wishlist"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                </svg>
              </button>
              
              <button 
                (click)="onCompare($event)"
                class="action-btn"
                title="Compare"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </button>
            </div>
            
            <!-- Hover Overlay with Add to Cart -->
            <div class="cart-overlay absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <app-animated-button
                text="Add to Cart"
                variant="primary"
                size="md"
                [rippleEffect]="true"
                (clicked)="onAddToCart()"
                icon="<svg class='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0V19a2 2 0 002 2h7a2 2 0 002-2v-.5'></path></svg>"
              ></app-animated-button>
            </div>
          </div>
          
          <!-- Product Info -->
          <div class="product-info p-4 space-y-3">
            <!-- Category & Brand -->
            <div class="flex items-center justify-between text-xs">
              <span *ngIf="product.category" class="category-tag">{{ product.category }}</span>
              <span *ngIf="product.brand" class="brand-tag">{{ product.brand }}</span>
            </div>
            
            <!-- Product Name -->
            <h3 class="product-name font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              <a [routerLink]="['/products', product.id]">{{ product.name }}</a>
            </h3>
            
            <!-- Rating -->
            <div *ngIf="product.rating" class="rating flex items-center gap-2">
              <div class="stars flex">
                <span *ngFor="let star of getStarArray()" class="star">★</span>
                <span *ngFor="let star of getEmptyStarArray()" class="star-empty">★</span>
              </div>
              <span class="rating-text text-sm text-gray-500 dark:text-gray-400">
                ({{ product.review_count || 0 }})
              </span>
            </div>
            
            <!-- Price -->
            <div class="price-container flex items-center gap-2">
              <span class="current-price text-lg font-bold text-gray-900 dark:text-white">
                {{ product.price | currency }}
              </span>
              <span *ngIf="product.compare_price && product.compare_price > product.price" 
                    class="original-price text-sm text-gray-500 line-through">
                {{ product.compare_price | currency }}
              </span>
            </div>
            
            <!-- Description Preview -->
            <p class="description text-sm text-gray-600 dark:text-gray-400 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {{ product.description }}
            </p>
          </div>
        </div>
        
        <!-- Back Side (for flip effect) -->
        <div class="card-back">
          <div class="p-6 h-full flex flex-col justify-between">
            <div>
              <h4 class="text-lg font-semibold text-white mb-4">{{ product.name }}</h4>
              <p class="text-gray-200 text-sm mb-4">{{ product.description }}</p>
              
              <!-- Features -->
              <ul class="space-y-2 text-sm text-gray-300">
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Premium Quality
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  Fast Shipping
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                  30-Day Return
                </li>
              </ul>
            </div>
            
            <div class="space-y-3">
              <app-animated-button
                text="View Details"
                variant="outline"
                size="md"
                [fullWidth]="true"
                (clicked)="onViewDetails()"
              ></app-animated-button>
              
              <app-animated-button
                text="Add to Cart"
                variant="primary"
                size="md"
                [fullWidth]="true"
                (clicked)="onAddToCart()"
              ></app-animated-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
      <div *ngIf="!imageLoaded" class="loading-overlay absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div class="loading-spinner"></div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      @apply relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden;
      perspective: 1000px;
      transition: all 0.3s ease;
    }

    .product-card:hover {
      @apply shadow-xl;
      transform: translateY(-4px);
    }

    .card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.6s;
      transform-style: preserve-3d;
    }

    .is-flipped .card-inner {
      transform: rotateY(180deg);
    }

    .card-front, .card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: inherit;
    }

    .card-back {
      background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800));
      transform: rotateY(180deg);
    }

    .badge {
      @apply px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm;
    }

    .badge-featured {
      @apply bg-yellow-500/90 text-white;
    }

    .badge-discount {
      @apply bg-red-500/90 text-white;
    }

    .badge-stock {
      @apply bg-orange-500/90 text-white;
    }

    .action-btn {
      @apply w-8 h-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-primary-500 hover:text-white transition-all duration-200;
    }

    .action-btn.active {
      @apply bg-red-500 text-white;
    }

    .category-tag, .brand-tag {
      @apply px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md font-medium;
    }

    .stars .star {
      @apply text-yellow-400;
    }

    .stars .star-empty {
      @apply text-gray-300 dark:text-gray-600;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .loading-spinner {
      @apply w-8 h-8 border-2 border-gray-300 border-t-primary-500 rounded-full;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .quick-actions {
        opacity: 1;
        transform: translateX(0);
      }
      
      .cart-overlay {
        opacity: 0;
        pointer-events: none;
      }
      
      .description {
        opacity: 1;
      }
    }
  `]
})
export class ProductCardComponent implements OnInit {
  @ViewChild('cardElement', { static: true }) cardElement!: ElementRef;
  
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();
  @Output() toggleWishlist = new EventEmitter<Product>();
  @Output() compare = new EventEmitter<Product>();

  imageLoaded = false;
  isFlipped = false;
  isInWishlist = false;

  ngOnInit() {
    // Check if product is in wishlist
    this.checkWishlistStatus();
  }

  /* ===== IMAGE OPTIMIZATION ===== */
  
  getProductImageUrl(): string {
    if (!this.product.image) {
      return '/assets/placeholder.jpg';
    }

    let imageUrl = this.product.image;

    // Handle relative URLs
    if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
      imageUrl = `/assets/products/${imageUrl}`;
    }

    // Return clean URL without cache buster - rely on HTTP cache headers instead
    return imageUrl;
  }

  onImageLoad() {
    this.imageLoaded = true;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.warn(`Product image failed to load: ${img.src} for product ${this.product.id}`);
    img.src = '/assets/placeholder.jpg';
    img.classList.add('image-error');
  }

  onMouseEnter(event: MouseEvent) {
    this.apply3DTilt(event);
  }

  onMouseLeave() {
    this.reset3DTilt();
  }

  onMouseMove(event: MouseEvent) {
    this.apply3DTilt(event);
  }

  private apply3DTilt(event: MouseEvent) {
    const card = this.cardElement.nativeElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  }

  private reset3DTilt() {
    const card = this.cardElement.nativeElement;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  }

  private checkWishlistStatus() {
    // Check if product is in wishlist (implement your logic)
    this.isInWishlist = false;
  }

  getDiscountPercentage(): number {
    if (!this.product.compare_price || this.product.compare_price <= this.product.price) {
      return 0;
    }
    return Math.round(((this.product.compare_price - this.product.price) / this.product.compare_price) * 100);
  }

  getStarArray(): number[] {
    const rating = this.product.rating || 0;
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStarArray(): number[] {
    const rating = this.product.rating || 0;
    return Array(5 - Math.floor(rating)).fill(0);
  }

  onAddToCart(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.addToCart.emit(this.product);
  }

  onQuickView(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.quickView.emit(this.product);
  }

  onToggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isInWishlist = !this.isInWishlist;
    this.toggleWishlist.emit(this.product);
  }

  onCompare(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.compare.emit(this.product);
  }

  onViewDetails(): void {
    // Navigate to product details
    console.log('View details for:', this.product.id);
  }
}
