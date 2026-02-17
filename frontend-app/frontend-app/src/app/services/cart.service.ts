import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  maxQuantity?: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

// Backward compatibility interface
export interface CartEntry {
  product: any;
  qty: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  
  public items$ = this.itemsSubject.asObservable();
  public isOpen$ = this.isOpenSubject.asObservable();
  public itemCount$ = new BehaviorSubject<number>(0);
  public total$ = new BehaviorSubject<number>(0);

  private items: CartItem[] = [];

  constructor() {
    this.loadCartFromStorage();
  }

  // Add item to cart
  addItem(product: any, quantity: number = 1): boolean {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock && newQuantity > product.stock) {
        return false; // Not enough stock
      }
      existingItem.quantity = newQuantity;
    } else {
      const cartItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '/assets/placeholder-product.jpg',
        quantity: quantity,
        maxQuantity: product.stock
      };
      this.items.push(cartItem);
    }
    
    this.updateCart();
    this.saveCartToStorage();
    return true;
  }

  // Remove item from cart
  removeItem(productId: number): void {
    this.items = this.items.filter(item => item.id !== productId);
    this.updateCart();
    this.saveCartToStorage();
  }

  // Update item quantity
  updateQuantity(productId: number, quantity: number): boolean {
    const item = this.items.find(item => item.id === productId);
    if (!item) return false;
    
    if (quantity <= 0) {
      this.removeItem(productId);
      return true;
    }
    
    if (item.maxQuantity && quantity > item.maxQuantity) {
      return false;
    }
    
    item.quantity = quantity;
    this.updateCart();
    this.saveCartToStorage();
    return true;
  }

  // Increase quantity
  increaseQuantity(productId: number): boolean {
    const item = this.items.find(item => item.id === productId);
    if (!item) return false;
    
    return this.updateQuantity(productId, item.quantity + 1);
  }

  // Decrease quantity
  decreaseQuantity(productId: number): boolean {
    const item = this.items.find(item => item.id === productId);
    if (!item) return false;
    
    return this.updateQuantity(productId, item.quantity - 1);
  }

  // Clear cart
  clearCart(): void {
    this.items = [];
    this.updateCart();
    this.saveCartToStorage();
  }

  // Clear cart (for logout/security)
  clearCartData(): void {
    this.items = [];
    this.updateCart();
    localStorage.removeItem('cart');
  }

  // Get cart items
  getCartItems(): CartItem[] {
    return [...this.items];
  }

  // Get total
  getTotal(): number {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Get item count
  getItemCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  // Cart drawer controls
  openCart(): void {
    this.isOpenSubject.next(true);
  }

  closeCart(): void {
    this.isOpenSubject.next(false);
  }

  toggleCart(): void {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  // Update all observables
  private updateCart(): void {
    this.itemsSubject.next([...this.items]);
    this.itemCount$.next(this.getItemCount());
    this.total$.next(this.getTotal());
  }

  // Persistence
  private saveCartToStorage(): void {
    try {
      localStorage.setItem('cart', JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  private loadCartFromStorage(): void {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        this.items = JSON.parse(saved);
        this.updateCart();
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      this.items = [];
    }
  }

  // Place order (enhanced)
  placeOrder(customerInfo: any): any {
    const order = {
      id: Date.now(),
      orderNumber: `ORD-${Date.now()}`,
      items: [...this.items],
      customerInfo,
      subtotal: this.getTotal(),
      tax: this.getTotal() * 0.08,
      shipping: this.getTotal() >= 100 ? 0 : 10,
      total: this.getTotal() + (this.getTotal() * 0.08) + (this.getTotal() >= 100 ? 0 : 10),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Clear cart after order
    this.clearCart();
    
    return order;
  }

  // Utility methods
  isItemInCart(productId: number): boolean {
    return this.items.some(item => item.id === productId);
  }

  getItemQuantity(productId: number): number {
    const item = this.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  }

  // Quick add with notification
  quickAdd(product: any): { success: boolean; message: string } {
    const success = this.addItem(product, 1);
    if (success) {
      this.openCart(); // Auto-open cart drawer
      return {
        success: true,
        message: `${product.name} added to cart!`
      };
    } else {
      return {
        success: false,
        message: `Not enough stock for ${product.name}`
      };
    }
  }

  // Check if cart is open
  isCartOpen(): boolean {
    return this.isOpenSubject.value;
  }

  // Backward compatibility methods
  addToCart(product: any, quantity: number = 1): boolean {
    return this.addItem(product, quantity);
  }

  getItems(): CartItem[] {
    return this.getCartItems();
  }

  increaseQty(productId: number): void {
    this.increaseQuantity(productId);
  }

  decreaseQty(productId: number): void {
    this.decreaseQuantity(productId);
  }
}
