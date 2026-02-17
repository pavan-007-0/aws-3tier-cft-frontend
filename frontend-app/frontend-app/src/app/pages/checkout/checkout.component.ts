import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';
import { AnimatedButtonComponent } from '../../components/ui/animated-button.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AnimatedButtonComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  checkoutForm: FormGroup;
  loading = false;
  currentStep = 1;
  totalSteps = 3;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.checkoutForm = this.fb.group({
      // Customer Information
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]],
      
      // Shipping Address
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      country: ['United States', [Validators.required]],
      
      // Payment Information
      paymentMethod: ['card', [Validators.required]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardName: ['', [Validators.required, Validators.minLength(2)]],
      
      // Billing Address
      sameAsShipping: [true],
      billingAddress: [''],
      billingCity: [''],
      billingState: [''],
      billingZipCode: [''],
      billingCountry: ['United States']
    });
  }

  ngOnInit() {
    this.loadCartItems();
    this.setupFormWatchers();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCartItems() {
    const subscription = this.cartService.items$.subscribe(items => {
      this.cartItems = items;
      if (items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
    this.subscriptions.push(subscription);
  }

  setupFormWatchers() {
    // Watch for same as shipping checkbox
    const sameAsShippingSubscription = this.checkoutForm.get('sameAsShipping')?.valueChanges.subscribe(value => {
      const billingFields = ['billingAddress', 'billingCity', 'billingState', 'billingZipCode', 'billingCountry'];
      
      if (value) {
        billingFields.forEach(field => {
          this.checkoutForm.get(field)?.clearValidators();
          this.checkoutForm.get(field)?.updateValueAndValidity();
        });
      } else {
        this.checkoutForm.get('billingAddress')?.setValidators([Validators.required, Validators.minLength(5)]);
        this.checkoutForm.get('billingCity')?.setValidators([Validators.required, Validators.minLength(2)]);
        this.checkoutForm.get('billingState')?.setValidators([Validators.required]);
        this.checkoutForm.get('billingZipCode')?.setValidators([Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]);
        this.checkoutForm.get('billingCountry')?.setValidators([Validators.required]);
        
        billingFields.forEach(field => {
          this.checkoutForm.get(field)?.updateValueAndValidity();
        });
      }
    });
    
    if (sameAsShippingSubscription) {
      this.subscriptions.push(sameAsShippingSubscription);
    }
  }

  get subtotal(): number {
    return this.cartService.getTotal();
  }

  get tax(): number {
    return this.subtotal * 0.08; // 8% tax
  }

  get shipping(): number {
    return this.subtotal >= 100 ? 0 : 10; // Free shipping over $100
  }

  get total(): number {
    return this.subtotal + this.tax + this.shipping;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      if (this.validateCurrentStep()) {
        this.currentStep++;
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateCurrentStep(): boolean {
    const step1Fields = ['firstName', 'lastName', 'email', 'phone'];
    const step2Fields = ['address', 'city', 'state', 'zipCode', 'country'];
    const step3Fields = ['paymentMethod', 'cardNumber', 'expiryDate', 'cvv', 'cardName'];

    let fieldsToValidate: string[] = [];
    
    switch (this.currentStep) {
      case 1:
        fieldsToValidate = step1Fields;
        break;
      case 2:
        fieldsToValidate = step2Fields;
        if (!this.checkoutForm.get('sameAsShipping')?.value) {
          fieldsToValidate.push('billingAddress', 'billingCity', 'billingState', 'billingZipCode', 'billingCountry');
        }
        break;
      case 3:
        fieldsToValidate = step3Fields;
        break;
    }

    let isValid = true;
    fieldsToValidate.forEach(field => {
      const control = this.checkoutForm.get(field);
      if (control && control.invalid) {
        control.markAsTouched();
        isValid = false;
      }
    });

    return isValid;
  }

  async placeOrder() {
    if (!this.checkoutForm.valid) {
      this.markAllFieldsAsTouched();
      alert('Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const orderData = {
        customer: {
          firstName: this.checkoutForm.get('firstName')?.value,
          lastName: this.checkoutForm.get('lastName')?.value,
          email: this.checkoutForm.get('email')?.value,
          phone: this.checkoutForm.get('phone')?.value
        },
        shipping: {
          address: this.checkoutForm.get('address')?.value,
          city: this.checkoutForm.get('city')?.value,
          state: this.checkoutForm.get('state')?.value,
          zipCode: this.checkoutForm.get('zipCode')?.value,
          country: this.checkoutForm.get('country')?.value
        },
        billing: this.checkoutForm.get('sameAsShipping')?.value ? null : {
          address: this.checkoutForm.get('billingAddress')?.value,
          city: this.checkoutForm.get('billingCity')?.value,
          state: this.checkoutForm.get('billingState')?.value,
          zipCode: this.checkoutForm.get('billingZipCode')?.value,
          country: this.checkoutForm.get('billingCountry')?.value
        },
        payment: {
          method: this.checkoutForm.get('paymentMethod')?.value,
          cardNumber: this.checkoutForm.get('cardNumber')?.value,
          expiryDate: this.checkoutForm.get('expiryDate')?.value,
          cvv: this.checkoutForm.get('cvv')?.value,
          cardName: this.checkoutForm.get('cardName')?.value
        }
      };

      const order = this.cartService.placeOrder(orderData);
      
      alert('Order placed successfully!');
      this.router.navigate(['/order-success'], { state: { order } });
      
    } catch (error) {
      console.error('Order placement failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      this.loading = false;
    }
  }

  markAllFieldsAsTouched() {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      this.checkoutForm.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['pattern']) return `Please enter a valid ${fieldName}`;
    }
    return '';
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      event.target.value = parts.join(' ');
      this.checkoutForm.patchValue({ cardNumber: value });
    } else {
      event.target.value = '';
    }
  }

  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value;
    this.checkoutForm.patchValue({ expiryDate: value });
  }
}
