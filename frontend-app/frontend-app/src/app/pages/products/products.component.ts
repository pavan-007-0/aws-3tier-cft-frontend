import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class ProductsComponent implements OnInit, OnDestroy {

  products: Product[] = [];
  filteredProducts: Product[] = [];

  loading = true;
  error = '';

  searchTerm = '';
  selectedCategory = 'all';
  sortBy = 'name';
  categories: string[] = ['all'];

  private subscriptions: Subscription[] = [];
  private productCache: Map<string, any> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private destroy$ = new Subject<void>();
  private isLoadingProducts = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProductsFromAPI();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetProductsState(): void {
    this.products = [];
    this.filteredProducts = [];
    this.loading = true;
    this.error = '';
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.isLoadingProducts = false;
    this.cdr.markForCheck();
    this.loadProductsFromAPI();
  }

  /* ---------------------------
     PRODUCT LOADING FROM API
  ---------------------------- */

  private loadProductsFromAPI(): void {
    // Prevent double loading
    if (this.isLoadingProducts || this.loading) {
      return;
    }

    this.isLoadingProducts = true;
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    const cacheKey = 'products_all';
    const cached = this.productCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      this.products = cached.data;
      this.filteredProducts = [...this.products];
      this.extractCategories();
      this.loading = false;
      this.isLoadingProducts = false;
      this.cdr.markForCheck();
      return;
    }

    const sub = this.productService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          // Handle both direct array and paginated response
          this.products = Array.isArray(data) ? data : (data.products || data.data || []);
          
          // Ensure all products have valid image URLs
          this.products = this.products.map(product => ({
            ...product,
            image: this.sanitizeImageUrl(product.image)
          }));

          this.filteredProducts = [...this.products];
          this.extractCategories();
          
          // Cache the results
          this.productCache.set(cacheKey, {
            data: this.products,
            timestamp: Date.now()
          });

          this.loading = false;
          this.isLoadingProducts = false;
          this.error = '';
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to load products from API:', err);\n          this.error = 'Failed to load products. Please try again.';\n          this.loading = false;\n          this.isLoadingProducts = false;\n          this.cdr.markForCheck();
        
        // Fallback to sample products if API fails
        this.loadSampleProducts();
      }
    });

    this.subscriptions.push(sub);
  }

  private sanitizeImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return '/assets/placeholder.jpg';
    }

    // If URL doesn't start with /, it might be relative to products
    if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
      return `/assets/products/${imageUrl}`;
    }

    // Return clean URL - rely on HTTP cache headers for caching
    return imageUrl;
  }

  private loadSampleProducts(): void {
    this.products = [
      {
        id: 1,
        name: 'Premium Wireless Earbuds',
        description: 'High-quality wireless earbuds with active noise cancellation.',
        price: 199,
        compare_price: 249,
        image: '/assets/products/earbuds.jpg',
        brand: 'AudioTech',
        featured: true,
        rating: 4.8,
        review_count: 1250,
        stock: 25,
        category: 'Audio'
      },
      {
        id: 2,
        name: 'Smart Glasses Pro',
        description: 'Revolutionary smart glasses with AR display.',
        price: 899,
        compare_price: 999,
        image: '/assets/products/glasses.jpg',
        brand: 'VisionTech',
        rating: 4.6,
        review_count: 456,
        stock: 8,
        category: 'Wearables'
      },
      {
        id: 3,
        name: 'Professional Headphones',
        description: 'Studio-grade headphones with exceptional clarity.',
        price: 299,
        compare_price: 349,
        image: '/assets/products/headphones.jpg',
        brand: 'SoundMaster',
        rating: 4.9,
        review_count: 2100,
        stock: 15,
        category: 'Audio'
      },
      {
        id: 4,
        name: 'Ergonomic Laptop Stand',
        description: 'Adjustable aluminum laptop stand.',
        price: 79,
        compare_price: 99,
        image: '/assets/products/laptopstand.jpg',
        brand: 'ErgoDesk',
        rating: 4.7,
        review_count: 890,
        stock: 32,
        category: 'Accessories'
      },
      {
        id: 5,
        name: 'Flagship Smartphone',
        description: 'Latest flagship smartphone with premium camera.',
        price: 1199,
        compare_price: 1299,
        image: '/assets/products/mobile.jpg',
        brand: 'TechPhone',
        rating: 4.8,
        review_count: 3200,
        stock: 18,
        category: 'Smartphones'
      },
      {
        id: 6,
        name: 'Gaming Mouse Pro',
        description: 'High-precision gaming mouse.',
        price: 89,
        compare_price: 119,
        image: '/assets/products/mouse.jpg',
        brand: 'GameGear',
        rating: 4.7,
        review_count: 1890,
        stock: 45,
        category: 'Gaming'
      },
      {
        id: 7,
        name: 'Ultra-Fast Power Bank',
        description: 'High-capacity fast-charging power bank.',
        price: 59,
        compare_price: 79,
        image: '/assets/products/powerbank.jpg',
        brand: 'PowerMax',
        rating: 4.5,
        review_count: 2340,
        stock: 67,
        category: 'Accessories'
      },
      {
        id: 8,
        name: 'Smart Watch Elite',
        description: 'Advanced smartwatch with health monitoring.',
        price: 399,
        compare_price: 449,
        image: '/assets/products/smartwatch.jpg',
        brand: 'WearTech',
        rating: 4.8,
        review_count: 1567,
        stock: 22,
        category: 'Wearables'
      },
      {
        id: 9,
        name: 'Bluetooth Speaker Max',
        description: 'Portable speaker with 360° sound.',
        price: 149,
        compare_price: 179,
        image: '/assets/products/speaker.jpg',
        brand: 'SoundWave',
        rating: 4.6,
        review_count: 1456,
        stock: 38,
        category: 'Audio'
      },
      {
        id: 10,
        name: '4K Webcam Pro',
        description: 'Ultra HD webcam for streaming.',
        price: 129,
        compare_price: 159,
        image: '/assets/products/webcam.jpg',
        brand: 'StreamCam',
        rating: 4.7,
        review_count: 987,
        stock: 29,
        category: 'Accessories'
      }
    ];

    this.filteredProducts = [...this.products];
    this.extractCategories();
    this.loading = false;
    this.error = '';
  }

  /* ---------------------------
     FILTERING & SORTING
  ---------------------------- */

  extractCategories(): void {
    const set = new Set<string>(['all']);
    this.products.forEach(p => p.category && set.add(p.category));
    this.categories = Array.from(set);
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.filterProducts();
  }

  onCategoryChange(event: Event): void {
    this.selectedCategory = (event.target as HTMLSelectElement).value;
    this.filterProducts();
  }

  onSortChange(event: Event): void {
    this.sortBy = (event.target as HTMLSelectElement).value;
    this.sortProducts();
  }

  filterProducts(): void {
    let filtered = [...this.products];

    if (this.searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(this.searchTerm) ||
        (p.description && p.description.toLowerCase().includes(this.searchTerm))
      );
    }

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    this.filteredProducts = filtered;
    this.sortProducts();
  }

  sortProducts(): void {
    this.filteredProducts.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'newest': return b.id - a.id;
        default: return a.name.localeCompare(b.name);
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.filteredProducts = [...this.products];
    this.sortProducts();
  }

  /* ---------------------------
     IMAGE SAFETY (CRITICAL) - PRODUCTION FIX
  ---------------------------- */

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.warn(`Image failed to load: ${img.src}`);
    
    // Use a stable placeholder, not the mobile image
    img.src = '/assets/placeholder.jpg';
    
    // Add error class for styling
    img.classList.add('image-error');
  }

  getImageUrlWithBuster(product: Product): string {
    return this.sanitizeImageUrl(product.image);
  }

  /* ---------------------------
     CART
  ---------------------------- */

  addToCart(product: Product): void {
    this.cartService.addItem(product, 1);
  }

  /* ---------------------------
     TRACK BY (IMPORTANT)
  ---------------------------- */

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
