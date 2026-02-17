import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../services/cart.service';

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
    address: ''
  };

  error = '';
  submitting = false;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartItems = this.cartService.getCartItems();  // ✔ Correct
  }

  subtotal(entry: CartItem) {
    return (Number(entry.price) || 0) * entry.quantity;
  }

  total() {
    return this.cartService.getTotal();  // ✔ Correct
  }

  validate() {
    const { name, email, phone, address } = this.customer;
    if (!name.trim()) return 'Name required';
    if (!email.includes('@')) return 'Valid email required';
    if (!phone.trim()) return 'Phone required';
    if (!address.trim()) return 'Address required';
    return '';
  }

  placeOrder() {
    this.error = '';
    const v = this.validate();
    if (v) {
      this.error = v;
      return;
    }

    if (this.cartItems.length === 0) {
      this.error = 'Cart is empty';
      return;
    }

    this.submitting = true;

    try {
      const order = this.cartService.placeOrder(this.customer);
      this.router.navigate(['/order-success'], { state: { order } });
    } finally {
      this.submitting = false;
    }
  }
}
