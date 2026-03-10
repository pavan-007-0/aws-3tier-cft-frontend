import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './product.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
    private readonly KEY = 'shopkart_wishlist';
    private itemsSubject = new BehaviorSubject<Product[]>(this.load());
    public items$ = this.itemsSubject.asObservable();

    private load(): Product[] {
        try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
        catch { return []; }
    }

    private save(items: Product[]) {
        localStorage.setItem(this.KEY, JSON.stringify(items));
        this.itemsSubject.next(items);
    }

    toggle(product: Product): boolean {
        const items = this.itemsSubject.value;
        const idx = items.findIndex(p => p.id === product.id);
        if (idx >= 0) {
            this.save(items.filter(p => p.id !== product.id));
            return false; // removed
        } else {
            this.save([...items, product]);
            return true; // added
        }
    }

    isWishlisted(productId: number): boolean {
        return this.itemsSubject.value.some(p => p.id === productId);
    }

    remove(productId: number) {
        this.save(this.itemsSubject.value.filter(p => p.id !== productId));
    }

    getItems(): Product[] {
        return this.itemsSubject.value;
    }

    getCount(): number {
        return this.itemsSubject.value.length;
    }

    clear() {
        this.save([]);
    }
}
