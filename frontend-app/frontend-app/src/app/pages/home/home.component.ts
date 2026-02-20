import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { AnimatedButtonComponent } from '../../components/ui/animated-button.component';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, AnimatedButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html'
})
export class HomeComponent {
  featuredProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      description: 'The most advanced iPhone ever with titanium design and A17 Pro chip.',
      price: 1199,
      compare_price: 1299,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      brand: 'Apple',
      featured: true,
      rating: 4.8,
      review_count: 1250,
      stock: 15,
      category: 'Smartphones'
    },
    {
      id: 2,
      name: 'MacBook Pro 14"',
      description: 'Supercharged by M3 Pro chip for extreme performance and battery life.',
      price: 1999,
      compare_price: 2199,
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
      brand: 'Apple',
      featured: true,
      rating: 4.9,
      review_count: 890,
      stock: 8,
      category: 'Laptops'
    },
    {
      id: 3,
      name: 'AirPods Pro (3rd Gen)',
      description: 'Active Noise Cancellation and Spatial Audio for immersive sound.',
      price: 249,
      compare_price: 279,
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400',
      brand: 'Apple',
      featured: true,
      rating: 4.7,
      review_count: 2100,
      stock: 25,
      category: 'Audio'
    },
    {
      id: 4,
      name: 'Apple Watch Series 9',
      description: 'Advanced health features and the brightest Apple Watch display ever.',
      price: 399,
      compare_price: 429,
      image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
      brand: 'Apple',
      featured: false,
      rating: 4.6,
      review_count: 1580,
      stock: 12,
      category: 'Wearables'
    }
  ];

  constructor(private cartService: CartService, private router: Router) {}

  navigateToShop() {
    this.router.navigate(['/products']).catch(err => console.error('Navigation error:', err));
  }

  onAddToCart(product: any) {
    const result = this.cartService.quickAdd(product);
    if (result.success) {
      console.log('✅', result.message);
    } else {
      console.log('❌', result.message);
      alert(result.message);
    }
  }

  onQuickView(product: any) {
    console.log('👁️ Quick view:', product.name);
    alert(`👁️ Quick viewing ${product.name}`);
  }

  onToggleWishlist(product: any) {
    console.log('❤️ Toggle wishlist:', product.name);
    alert(`❤️ ${product.name} added to wishlist!`);
  }

  onCompare(product: any) {
    console.log('⚖️ Compare product:', product.name);
    alert(`⚖️ ${product.name} added to comparison!`);
  }

  trackByProductId(index: number, product: any): number {
    return product.id;
  }
}
