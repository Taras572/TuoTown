import { Component } from '@angular/core';
import { Database, update } from '@angular/fire/database';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ref, set, onValue, get, remove, child, push } from "firebase/database";

import { CategoryService } from 'src/app/shared/services/category/category.service';
import { ICategory } from 'src/app/shared/model/category/category.model';


import { uploadBytes, deleteObject } from "firebase/storage";


@Component({
    selector: 'app-admin-category',
    templateUrl: './admin-category.component.html',
    styleUrls: ['./admin-category.component.scss']
})
export class AdminCategoryComponent {
    public categoryForm!: UntypedFormGroup;
    public category: Array<ICategory> = [];


    public image: string = '';
    public imageStatus: boolean = true;
    public imgt!: string;
    public editCategoryID!: number;
    public editStatus: boolean = false;


    constructor(
        public database: Database,
        private fb: UntypedFormBuilder,
        private categoryService: CategoryService
    ) {

    }

    ngOnInit(): void {
        this.loadCategory();
        this.initCategoryForm();
    }


    initCategoryForm(): void {
        this.categoryForm = this.fb.group({
            name: [null, Validators.required],
            path: [null, Validators.required],
            image: [null, Validators.required]
        });
    }


    loadCategory(): void {
        const starCountRef = ref(this.database, 'category/');
        onValue(starCountRef, (snapshot) => {
            this.category = Object.values(snapshot.val());
        });
    }


    removeCategory(id: any): void {
        //bug error)
        if (this.category.length == 1) {
            set(ref(this.database, 'category/'), '')
                .then(() => {
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        else {
            remove(ref(this.database, 'category/' + id));
        }
    }


    createCategory(): void {
        const newPostKey = push(child(ref(this.database), 'category')).key?.substring(1);
        const categ = this.categoryForm.value;
        categ.id = newPostKey;
        set(ref(this.database, 'category/' + newPostKey), categ)
            .then(() => {
                console.log('Data saved successfully!');
            })
            .catch((error) => {
                console.log(error);
            });
        this.initCategoryForm();
        this.image = '';
        this.imgt = '';
    }


    uploadFile(event: any): void {
        const file = event.target.files[0];
        this.categoryService.upload(file);
        const task = uploadBytes(this.categoryService.upload(file), file).then((snapshot) => {
            this.categoryService.getFile(file)
                .then((img) => {
                    this.image = img;
                    this.categoryForm.patchValue({
                        image: this.image
                    });
                    this.imageStatus = false;
                });
        });

    };


    deleteFile(category?: ICategory): void {
        const pathImage = category?.image || this.image;
        this.categoryService.delete(pathImage);
        deleteObject(this.categoryService.delete(pathImage)).then(() => {
            this.image = '';
            this.imageStatus = true;
        }).catch((error) => {
            console.log(error);
        });
        this.imgt = '';
    };


    editCategory(category: ICategory): void {
        this.categoryForm.patchValue({
            name: category.name,
            path: category.path,
            image: category.image
        });
        this.editCategoryID = category.id as number;
        this.editStatus = true;
        this.image = category.image
    }


    saveCategory() {
        const newPostKey = this.editCategoryID;
        const categ = this.categoryForm.value;
        categ.id = newPostKey;
        update(ref(this.database, 'category/' + newPostKey), categ)
            .then(() => {
                console.log('Data saved successfully!');
            })
            .catch((error) => {
                console.log(error);
            });
        this.initCategoryForm();
        this.image = '';
        this.imgt = '';
    }

}