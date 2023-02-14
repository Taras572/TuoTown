import { Component } from '@angular/core';
import { Database } from '@angular/fire/database';
import { NavigationEnd, Router } from '@angular/router';
import { onValue, ref } from 'firebase/database';
import { ToastrService } from 'ngx-toastr';
import { IProduct } from 'src/app/shared/model/product/product.model';
import { OrderService } from 'src/app/shared/services/order/order.service';

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss']
})
export class ProductComponent {
    public product: Array<IProduct> = [];
    public category_name!: string;
    public prodName!: string;
    public basket: Array<IProduct> = [];

    constructor(
        public database: Database,
        private router: Router,
        public orderService: OrderService,
        private toastr: ToastrService
    ) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                const categoryName = event.url.substring(9);
                if(categoryName){
                    this.loadProduct(categoryName as string);
                }
            }
        })
    }


    ngOnInit(): void {
    }


    loadProduct(URL: string): void {
        let obj: Array<any>;
        const starCountRef = ref(this.database, 'product/');
        onValue(starCountRef, (snapshot) => {
            obj = Object.values(snapshot.val());
            this.product = obj.filter(elem => elem.category.path == URL);
            this.category_name = this.product[0].category.name;
        });
    }

    
    addBasket(products: IProduct, e: Event): void {
        this.orderService.addBasket(products,e);
        this.showSuccess(products.series);
    }


    showSuccess(name:string) {
        this.toastr.success(name,'Добавлено в кошик');
    }

}
