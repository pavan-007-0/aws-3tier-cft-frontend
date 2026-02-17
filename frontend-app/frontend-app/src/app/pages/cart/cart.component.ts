import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(public cartService: CartService) {}

  ngOnInit() {
    // Subscribe to cart updates to trigger change detection
    this.subscriptions.push(
      this.cartService.items$.subscribe(() => {
        // This will trigger change detection when cart items change
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  increase(id: number) {
    this.cartService.increaseQuantity(id);
  }

  decrease(id: number) {
    this.cartService.decreaseQuantity(id);
  }

  remove(id: number) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      this.cartService.removeItem(id);
    }
  }

  getTotal(): number {
    return this.cartService.getTotal() + this.getTax() + this.getShippingCost();
  }

  getSubtotal(): number {
    return this.cartService.getTotal();
  }

  getTax(): number {
    return this.getSubtotal() * 0.08; // 8% tax
  }

  getShippingCost(): number {
    return this.getSubtotal() >= 100 ? 0 : 10;
  }

  getTotalItems(): number {
    return this.cartService.getItemCount();
  }

  trackByItemId(index: number, item: CartItem): number {
    return item.id;
  }

  onImageError(event: any) {
    event.target.src = '/assets/placeholder-product.jpg';
  }
}
