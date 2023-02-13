import { Component } from '@angular/core';
import { Database } from '@angular/fire/database';
import { onValue, ref } from 'firebase/database';
import { ToastrService } from 'ngx-toastr';
import { IProduct } from 'src/app/shared/model/product/product.model';
import { OrderService } from 'src/app/shared/services/order/order.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent {
    public product: Array<IProduct> = [];


    constructor(
        public database: Database,
        public orderService: OrderService,
        private toastr: ToastrService
    ) { }


    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.loadProduct();
    }


    loadProduct(): void {
        const starCountRef = ref(this.database, 'product/');
        onValue(starCountRef, (snapshot) => {
            this.product = Object.values(snapshot.val());
        });
    }


    addBasket(product: IProduct, e: Event): void {
        this.orderService.addBasket(product ,e);
        this.showSuccess(product.series);
    }


    showSuccess(name:string) {
        this.toastr.success(name,'Добавлено в кошик');
    }

}