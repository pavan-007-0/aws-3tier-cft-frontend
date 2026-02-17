import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-success.html',
  styleUrl: './order-success.css'
})
export class OrderSuccessComponent implements OnInit {
  order: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    if (typeof window !== 'undefined' && history.state?.['order']) {
      this.order = history.state['order'];
    }
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }

  backToHome() {
    this.router.navigate(['/']);
  }

  viewOrders() {
    this.router.navigate(['/orders']);
  }
}
