import { Component } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IProduct } from 'src/app/shared/model/product/product.model';
import { OrderService } from 'src/app/shared/services/order/order.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { Database } from '@angular/fire/database';
import { ref, set, child, push } from "firebase/database";
import { ToastrService } from 'ngx-toastr';


@Component({
    selector: 'app-basket',
    templateUrl: './basket.component.html',
    styleUrls: ['./basket.component.scss']
})
export class BasketComponent {

    public product: Array<IProduct> = [];
    public totalPayment!: string;
    public price = 0;
    public basketForm!: UntypedFormGroup;
    public personInfo: any;
    public phone_form: boolean = false;
    public email_form: boolean = false;
    public name_form: boolean = false;
    clickEventSubscription!: Subscription;

    constructor(
        public orderService: OrderService,
        public userService: UserService,
        public fb: FormBuilder,
        public database: Database,
        private toastr: ToastrService

    ) {
        this.clickEventSubscription = this.userService.getClickEvent().subscribe(() => {
            this.checkForm()
        });
    }


    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.getProducts();
        this.LogIn();
        this.initBasketForm();
    }


    checkForm(): void {
        this.LogIn();
        this.initBasketForm();
    }
   

    getProducts(): void {
        if (localStorage.getItem('TuoTown')) {
            this.product = JSON.parse(<string>localStorage.getItem('TuoTown'));
            this.price = this.getTotal(this.product);
        }
    }


    getTotal(products: Array<IProduct>): number {
        return products.reduce((total, prod) => total + (prod.price * prod.count), 0);
    }


    cliker(prod: IProduct, count: boolean): void {
        if (count) {
            prod.count++;
        }
        else if (count == false && prod.count > 1) {
            prod.count--;
        }

        this.price = this.getTotal(this.product);
        localStorage.setItem('TuoTown', JSON.stringify(this.product));
        this.orderService.stream$.next(this.getCount(this.product));
    }


    removeProduct(product: any): void {
        const index = this.product.findIndex(prod => prod.id === product.id);
        this.product.splice(index, 1);
        this.price = this.getTotal(this.product);
        localStorage.setItem('TuoTown', JSON.stringify(this.product));
        this.orderService.stream$.next(this.getCount(this.product));
    }


    getCount(product: Array<IProduct>): number {
        return product.reduce((total, prod) => total + prod.count, 0);
    }


    initBasketForm() {
        let mail;
        let displayName;
        this.personInfo ? mail = this.personInfo.email : mail = null;
        this.personInfo ? displayName = this.personInfo.displayName : displayName = null;

        this.basketForm = this.fb.group({
            name: [displayName],
            email: [mail],
            phone: [null]
        })
    }


    LogIn(): void {
        if (localStorage.getItem('user')) {
            this.personInfo = JSON.parse(<string>localStorage.getItem('user'));
        }
        else (
            this.personInfo = null
        )
    }


    createOrder(): void {
        this.basketForm.value.name == null ? this.name_form = true : this.name_form = false;
        const regExp_EMAIL = /^\S{1,}@([a-z]+)\.([a-z]{2,5})$/;
        regExp_EMAIL.test(this.basketForm.value.email) ? this.email_form = false : this.email_form = true ;
        const regExp_PHONE = /^\+?[\s\-\(\)0-9]{7,17}$/;
        regExp_PHONE.test(this.basketForm.value.phone) ? this.phone_form = false : this.phone_form = true ;

        const orderBasket = {
            ...this.basketForm.value,
            products: this.product,
            totalPrice: this.price
        }
        if (!this.phone_form && !this.email_form && !this.name_form && this.product.length > 0) {
            const newPostKey = push(child(ref(this.database), 'order')).key?.substring(1);
            const order = orderBasket;
            order.id = newPostKey;
            set(ref(this.database, 'order/' + newPostKey), order)
                .then(() => {
                    console.log('Data order saved successfully!');
                    this.phone_form = false;
                    this.email_form = false;
                    this.name_form = false;
                    localStorage.setItem('TuoTown', JSON.stringify([]));
                    this.orderService.stream$.next(0);
                    this.getProducts();
                    this.showSuccess('Очікуйте дзвінка', 'Замовлення відправлено');
                })
                .catch((error) => {
                    console.log(error);
                });

        }
        else if(this.product.length == 0){
            this.showInfo('Кошик пустий', '');
        }
        if(this.phone_form || this.name_form || this.email_form){
            this.showInfo('Заповніть форму для замовлення', '');
        }

    }
    showSuccess(title:string, word:string) {
        this.toastr.success(title, word);
    }
    showInfo(title:string, word:string) {
        this.toastr.info(title, word);
    }
    

}
