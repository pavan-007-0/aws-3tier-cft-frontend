import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  brand?: string;
  stock?: number;
  rating?: number;
  review_count?: number;
  featured?: boolean;
  compare_price?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {

  private API_URL = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) {}

  // Get all products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products`);
  }

  // Get product by ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/products/${id}`);
  }

  // Add product
  addProduct(product: Product): Observable<any> {
    return this.http.post(`${this.API_URL}/products`, product);
  }

  // Update product
  updateProduct(product: Product): Observable<any> {
    return this.http.put(`${this.API_URL}/products/${product.id}`, product);
  }

  // Delete product
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/products/${id}`);
  }
}
