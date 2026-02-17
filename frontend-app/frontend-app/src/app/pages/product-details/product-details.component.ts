import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {

  product: Product | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('product-details: route id=', id);

    this.productService.getProductById(id).subscribe({
      next: (data: any) => {
        console.log('product-details: raw API response ->', data);

        // backend returns: { product: {...}, success: true }
        this.product = data.product;
        console.log('product-details: resolved product ->', this.product);

        this.loading = false;

        // force angular to refresh UI
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.loading = false;
        this.product = null;
      }
    });
  }
}
