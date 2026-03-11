import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

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

  private API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API}/products`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API}/products/${id}`);
  }

  addProduct(product: Product): Observable<any> {
    return this.http.post(`${this.API}/products`, product);
  }

  updateProduct(product: Product): Observable<any> {
    return this.http.put(`${this.API}/products/${product.id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.API}/products/${id}`);
  }

  resolveProductImage(product: Product): string {
    return product.image || '/assets/products/default.jpg';
  }
}
