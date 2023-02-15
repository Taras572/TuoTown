import { Component } from '@angular/core';
import { Database } from '@angular/fire/database';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ref, set, onValue, get, remove, child, push } from "firebase/database";

import { ProductsService } from 'src/app/shared/services/products/products.service';
import { IProduct } from 'src/app/shared/model/product/product.model';

import { uploadBytes, deleteObject } from "firebase/storage";
import { Storage } from '@angular/fire/storage';



@Component({
    selector: 'app-admin-products',
    templateUrl: './admin-products.component.html',
    styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent {
    public productForm!: UntypedFormGroup;
    public product: Array<any> = [];
    public category: Array<any> = [];

    public image: string = '';
    public imageStatus: boolean = true;
    public imgt!: string;

    public editProductID!: number;
    public editStatus: boolean = false;



    constructor(
        private productService: ProductsService,
        private fb: UntypedFormBuilder,
        public storage: Storage,
        public database: Database
    ) {

    }

    ngOnInit(): void {
        this.initProductForm();
        this.loadCategory();
        this.loadProduct();
    }


    initProductForm(): void {
        this.productForm = this.fb.group({
            image: [null, Validators.required],
            category: [null, Validators.required],
            series: [null, Validators.required],
            path: [null, Validators.required],
            appointment: [null, Validators.required],
            length: [null, Validators.required],
            blade_length: [null, Validators.required],
            blade_material: [null, Validators.required],
            steel_brand: [null, Validators.required],
            sharpening_blade: [null, Validators.required],
            producing_country: [null, Validators.required],
            price: [null, Validators.required],
            count: [1]
        })
    }


    loadCategory(): void {
        const starCountRef = ref(this.database, 'category/');
        onValue(starCountRef, (snapshot) => {
            this.category = Object.values(snapshot.val());
        });
    }


    loadProduct(): void {
        const starCountRef = ref(this.database, 'product/');
        onValue(starCountRef, (snapshot) => {
            this.product = Object.values(snapshot.val());
        });
    }


    removeProduct(id: any): void {
        //bug error)
        if (this.product.length == 1) {
            set(ref(this.database, 'product/'), '')
                .then(() => {
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        else {
            remove(ref(this.database, 'product/' + id));
        }
    }


    createProduct(): void {
        const newPostKey = push(child(ref(this.database), 'product')).key?.substring(1);
        const prod = this.productForm.value;
        prod.id = newPostKey;
        set(ref(this.database, 'product/' + newPostKey), prod)
            .then(() => {
                console.log('Data saved successfully!');
            })
            .catch((error) => {
                console.log(error);
            });
        this.initProductForm();
        this.image = '';
        this.imgt = '';
    }


    uploadFile(event: any): void {
        const file = event.target.files[0];
        this.productService.upload(file);
        const task = uploadBytes(this.productService.upload(file), file).then((snapshot) => {
            this.productService.getFile(file)
                .then((img) => {
                    this.image = img;
                    this.productForm.patchValue({
                        image: this.image
                    });
                    this.imageStatus = false;
                });
        });
        this.imgt = '';
    };


    deleteFile(product?: IProduct): void {
        const pathImage = product?.image || this.image;
        this.productService.delete(pathImage);
        deleteObject(this.productService.delete(pathImage)).then(() => {
            this.image = '';
            this.imageStatus = true;
        }).catch((error) => {
            console.log(error);
        });
    };



    editProduct(product: IProduct): void {
        this.productForm.patchValue({
            category: [product.category.name],
            series: product.series,
            path: product.path,
            appointment: product.appointment,
            length: product.length,
            blade_length: product.blade_length,
            blade_material: product.blade_material,
            steel_brand: product.steel_brand,
            sharpening_blade: product.sharpening_blade,
            producing_country: product.producing_country,
            price: product.price,
            image: product.image,
        });
        this.editProductID = product.id as number;
        this.editStatus = true;
        this.image = product.image
    }


    saveProduct() {
        const newPostKey = this.editProductID;
        const prod = this.productForm.value;
        prod.id = newPostKey;
        set(ref(this.database, 'product/' + newPostKey), prod)
            .then(() => {
                console.log('Data saved successfully!');
            })
            .catch((error) => {
                console.log(error);
            });
        this.initProductForm();
        this.image = '';
        this.imgt = '';
    }

}