import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IProduct } from '../../model/product/product.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    public stream$ = new Subject<number>();
    constructor() { }

    
    addBasket(product: IProduct, e: Event ): void {
        e.stopPropagation();
        let basket: Array<IProduct> = [];
        if (localStorage.getItem('TuoTown')) {
            basket = JSON.parse(<string>localStorage.getItem('TuoTown'));
            if (basket.some(prod => prod.id === product.id)) {
                const index = basket.findIndex(prod => prod.id === product.id);
                basket[index].count += product.count;
            } else {
                basket.push(product);
            }
        } else {
            basket.push(product);
        }
        localStorage.setItem('TuoTown', JSON.stringify(basket));
        this.stream$.next(this.getCount(basket));
    }

    getCount(product: Array<IProduct>): number {
        return product.reduce((total, prod) => total + prod.count, 0);
    }
}
