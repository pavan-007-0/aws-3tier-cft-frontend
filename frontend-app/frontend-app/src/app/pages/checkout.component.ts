import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {

  cartItems: CartItem[] = [];

  customer = {
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    full_name: ''
  };

  error = '';
  submitting = false;
  paymentMethod = 'card';

  constructor(
    private cartService: CartService,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cartItems = this.cartService.getCartItems();
    
    // Check if user is authenticated
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.customer.name = user.name || '';
        this.customer.email = user.email || '';
        this.customer.phone = user.phone || '';
      }
    });

    // If cart is empty, redirect
    if (this.cartItems.length === 0) {
      this.notificationService.error('Cart is empty');
      this.router.navigate(['/products']);
    }
  }

  subtotal(entry: CartItem) {
    return (Number(entry.price) || 0) * entry.quantity;
  }

  total() {
    return this.cartService.getTotal();
  }

  getTax() {
    return this.cartService.getTotal() * 0.08;
  }

  getShipping() {
    return this.cartService.getTotal() >= 100 ? 0 : 10;
  }

  getFinalTotal() {
    return this.total() + this.getTax() + this.getShipping();
  }

  validate() {
    const { name, email, phone, street, city, state, zip_code, country } = this.customer;
    if (!name.trim()) return 'Full name required';
    if (!email.includes('@')) return 'Valid email required';
    if (!phone.trim()) return 'Phone number required';
    if (!street.trim()) return 'Street address required';
    if (!city.trim()) return 'City required';
    if (!state.trim()) return 'State/Province required';
    if (!zip_code.trim()) return 'ZIP code required';
    if (!country.trim()) return 'Country required';
    return '';
  }

  placeOrder() {
    this.error = '';
    const v = this.validate();
    if (v) {
      this.error = v;
      this.notificationService.error(v);
      return;
    }

    if (this.cartItems.length === 0) {
      this.error = 'Cart is empty';
      this.notificationService.error('Cart is empty');
      return;
    }

    this.submitting = true;

    // Prepare order data for backend
    const orderData = {
      shipping_address: {
        street: this.customer.street,
        city: this.customer.city,
        state: this.customer.state,
        zip_code: this.customer.zip_code,
        country: this.customer.country,
        full_name: this.customer.name,
        phone: this.customer.phone
      },
      payment_method: this.paymentMethod,
      notes: ''
    };

    // Call backend API to create order
    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        this.submitting = false;
        this.notificationService.success('Order placed successfully!');
        
        // Clear cart after successful order
        this.cartService.clearCart();
        
        // Navigate to order success page with order data
        this.router.navigate(['/order-success'], { state: { order } });
      },
      error: (err) => {
        this.submitting = false;
        const errMsg = err.error?.message || 'Failed to place order. Please try again.';
        this.error = errMsg;
        this.notificationService.error(errMsg);
      }
    });
  }
}
