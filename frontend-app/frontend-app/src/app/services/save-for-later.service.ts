import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from './cart.service';

@Injectable({ providedIn: 'root' })
export class SaveForLaterService {
    private readonly KEY = 'shopkart_save_later';
    private itemsSubject = new BehaviorSubject<CartItem[]>(this.load());
    public items$ = this.itemsSubject.asObservable();

    private load(): CartItem[] {
        try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
        catch { return []; }
    }

    private save(items: CartItem[]) {
        localStorage.setItem(this.KEY, JSON.stringify(items));
        this.itemsSubject.next(items);
    }

    saveItem(item: CartItem) {
        const items = this.itemsSubject.value;
        if (!items.find(i => i.id === item.id)) {
            this.save([...items, item]);
        }
    }

    remove(id: number) {
        this.save(this.itemsSubject.value.filter(i => i.id !== id));
    }

    getItems(): CartItem[] { return this.itemsSubject.value; }
    getCount(): number { return this.itemsSubject.value.length; }
}
