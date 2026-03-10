import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ViewedProduct {
    id: number;
    name: string;
    price: number;
    image: string;
    rating?: number;
    category?: string;
}

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
    private readonly KEY = 'shopkart_recently_viewed';
    private readonly MAX = 10;
    private itemsSubject = new BehaviorSubject<ViewedProduct[]>(this.load());
    public items$ = this.itemsSubject.asObservable();

    private load(): ViewedProduct[] {
        try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
        catch { return []; }
    }

    private save(items: ViewedProduct[]) {
        localStorage.setItem(this.KEY, JSON.stringify(items));
        this.itemsSubject.next(items);
    }

    add(product: ViewedProduct) {
        let items = this.itemsSubject.value.filter(p => p.id !== product.id);
        items = [product, ...items].slice(0, this.MAX);
        this.save(items);
    }

    getItems(): ViewedProduct[] {
        return this.itemsSubject.value;
    }
}
