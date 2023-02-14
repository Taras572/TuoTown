import { Component } from '@angular/core';
import { Database } from '@angular/fire/database';
import { NavigationEnd, Router } from '@angular/router';
import { child, get, getDatabase, onValue, ref } from 'firebase/database';
import { ToastrService } from 'ngx-toastr';
import { IProduct } from 'src/app/shared/model/product/product.model';
import { OrderService } from 'src/app/shared/services/order/order.service';


@Component({
    selector: 'app-product-details',
    templateUrl: './product-details.component.html',
    styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent {
    public product: Array<IProduct> = [];
    
    
    constructor(
        public database: Database,
        public router: Router,
        public orderService: OrderService,
        private toastr: ToastrService
    ) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                const id = event.url.substring(17);
                this.loadProductByID(id as string);
            }
        })

    }

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.order();
    }

    loadProductByID(id: string) {
        const starCountRef = ref(this.database, `product/${id}`);
        onValue(starCountRef, (snapshot) => {
            this.product.push(snapshot.val());
        });
    }


    addBasket(product: IProduct, e: Event): void {
        this.orderService.addBasket(product,e);
        product.count = 1;
        this.showSuccess();
    }


    cliker(count: boolean): void {
        if (count) {
            this.product[0].count++;
        }
        else if (count == false && this.product[0].count > 1) {
            this.product[0].count--;
        }
    }

    showSuccess() {
        this.toastr.success('Добавлено в кошик');
    }

    order(){
        let check = JSON.parse(<string>localStorage.getItem('TuoTown'));
        if (localStorage.getItem('TuoTown')) {
            if(check.length > 0 ){

            }
        }
    }


}






