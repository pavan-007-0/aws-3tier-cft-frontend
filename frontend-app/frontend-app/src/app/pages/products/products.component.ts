import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

/**
 * Maps product name keywords to actual image filenames in /assets/products/.
 * This ensures products get the correct image even if the DB stores a different filename.
 */
const PRODUCT_IMAGE_MAP: { keywords: string[]; image: string }[] = [
  { keywords: ['earbuds', 'earbud', 'airpods', 'buds', 'bluetooth earbuds'], image: 'earbuds.jpg' },
  { keywords: ['glasses', 'glass', 'meta', 'ar', 'vr', 'quest'], image: 'glasses.jpg' },
  { keywords: ['headphones', 'headphone', 'headset', 'over-ear'], image: 'headphones.jpg' },
  { keywords: ['laptop', 'stand', 'macbook', 'ipad'], image: 'laptopstand.jpg' },
  { keywords: ['mobile', 'phone', 'smartphone', 'iphone'], image: 'mobile.jpg' },
  { keywords: ['mouse', 'gaming mouse'], image: 'mouse.jpg' },
  { keywords: ['power', 'powerbank', 'bank', 'charger'], image: 'powerbank.jpg' },
  { keywords: ['watch', 'smartwatch', 'wearable'], image: 'smartwatch.jpg' },
  { keywords: ['speaker', 'bluetooth speaker', 'portable speaker'], image: 'speaker.jpg' },
  { keywords: ['webcam', 'camera', 'cam', 'streaming'], image: 'webcam.jpg' },
  { keywords: ['keyboard', 'magic keyboard', 'keys'], image: 'laptopstand.jpg' },
];

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
  ) { }

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
    if (this.isLoadingProducts) {
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
          const rawProducts = Array.isArray(data) ? data : (data.products || data.data || []);

          // Resolve correct image for every product ONCE at load time
          this.products = rawProducts.map((product: any) => ({
            ...product,
            category: product.category || product.category_name || '',
            image: this.resolveProductImage(product)
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
          console.error('Failed to load products from API:', err);
          this.error = 'Failed to load products. Please try again.';
          this.loading = false;
          this.isLoadingProducts = false;
          this.cdr.markForCheck();
          // Fallback to sample products if API fails
          this.loadSampleProducts();
        }
      });

    this.subscriptions.push(sub);
  }

  /**
   * Resolves the correct image for a product by:
   * 1. Checking if the DB image filename exists in our known assets
   * 2. Falling back to keyword matching against the product name
   * 3. Using the default placeholder as a last resort
   */
  private resolveProductImage(product: any): string {
    const KNOWN_ASSETS = [
      'earbuds.jpg', 'glasses.jpg', 'headphones.jpg', 'laptopstand.jpg',
      'mobile.jpg', 'mouse.jpg', 'powerbank.jpg', 'smartwatch.jpg',
      'speaker.jpg', 'webcam.jpg'
    ];

    const dbImage = (product.image || '').replace(/^.*[\/\\]/, ''); // extract filename

    // 1. If the DB image filename matches an existing asset, use it
    if (dbImage && KNOWN_ASSETS.includes(dbImage)) {
      return `/assets/products/${dbImage}`;
    }

    // 2. Fall back: match product name keywords to an image
    const name = (product.name || '').toLowerCase();
    for (const mapping of PRODUCT_IMAGE_MAP) {
      if (mapping.keywords.some(kw => name.includes(kw))) {
        return `/assets/products/${mapping.image}`;
      }
    }

    // 3. Last resort: placeholder
    return '/assets/products/default-product.jpg';
  }

  private loadSampleProducts(): void {
    this.products = [
      {
        id: 1,
        name: 'Bluetooth Earbuds',
        description: 'Waterproof, Touch controls, Active Noise Cancellation.',
        price: 1299,
        compare_price: 1428,
        image: '/assets/products/earbuds.jpg',
        brand: 'AudioTech',
        featured: true,
        rating: 4.8,
        review_count: 1250,
        stock: 50,
        category: 'Electronics'
      },
      {
        id: 2,
        name: 'Gaming Mouse',
        description: 'RGB lighting, 6 programmable buttons, 16000 DPI.',
        price: 899,
        compare_price: 998,
        image: '/assets/products/mouse.jpg',
        brand: 'GameGear',
        featured: true,
        rating: 4.7,
        review_count: 1890,
        stock: 40,
        category: 'Accessories'
      },
      {
        id: 3,
        name: 'Laptop Stand',
        description: 'Aluminum, Adjustable height, Ergonomic design.',
        price: 849,
        compare_price: 933,
        image: '/assets/products/laptopstand.jpg',
        brand: 'ErgoDesk',
        featured: true,
        rating: 4.7,
        review_count: 890,
        stock: 30,
        category: 'Accessories'
      },
      {
        id: 4,
        name: 'Meta Glasses',
        description: 'AR Smart Glasses, Immersive VR experience.',
        price: 5999,
        compare_price: 6598,
        image: '/assets/products/glasses.jpg',
        brand: 'Meta',
        featured: true,
        rating: 4.6,
        review_count: 456,
        stock: 15,
        category: 'Electronics'
      },
      {
        id: 5,
        name: 'Portable Speaker',
        description: '360° sound, Waterproof, 12hr battery.',
        price: 599,
        compare_price: 699,
        image: '/assets/products/speaker.jpg',
        brand: 'SoundWave',
        rating: 4.6,
        review_count: 1456,
        stock: 45,
        category: 'Electronics'
      },
      {
        id: 6,
        name: 'Power Bank',
        description: '20000mAh, Fast charging, USB-C.',
        price: 499,
        compare_price: 599,
        image: '/assets/products/powerbank.jpg',
        brand: 'PowerMax',
        rating: 4.5,
        review_count: 2340,
        stock: 60,
        category: 'Accessories'
      },
      {
        id: 7,
        name: 'Smart Mobile',
        description: 'iPhone Pro, Triple camera, A17 Pro chip.',
        price: 1199,
        compare_price: 1399,
        image: '/assets/products/mobile.jpg',
        brand: 'Apple',
        featured: true,
        rating: 4.8,
        review_count: 3200,
        stock: 25,
        category: 'Electronics'
      },
      {
        id: 8,
        name: 'Smart Watch',
        description: 'GPS + Cellular, Health monitoring, AMOLED display.',
        price: 429,
        compare_price: 499,
        image: '/assets/products/smartwatch.jpg',
        brand: 'WearTech',
        featured: true,
        rating: 4.8,
        review_count: 1567,
        stock: 35,
        category: 'Wearables'
      },
      {
        id: 9,
        name: 'Webcam HD Pro',
        description: '4K Ultra HD, Auto-focus, Streaming ready.',
        price: 349,
        compare_price: 399,
        image: '/assets/products/webcam.jpg',
        brand: 'StreamCam',
        rating: 4.7,
        review_count: 987,
        stock: 30,
        category: 'Electronics'
      },
      {
        id: 10,
        name: 'Headphones Pro',
        description: 'Studio-grade, Over-ear, 40hr battery.',
        price: 799,
        compare_price: 899,
        image: '/assets/products/headphones.jpg',
        brand: 'SoundMaster',
        featured: true,
        rating: 4.9,
        review_count: 2100,
        stock: 20,
        category: 'Electronics'
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
    // Prevent infinite loop: only swap once
    if (!img.src.endsWith('default-product.jpg')) {
      img.src = '/assets/products/default-product.jpg';
    }
    img.classList.add('image-error');
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
