import { Injectable } from '@angular/core';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { Storage } from '@angular/fire/storage';


@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    constructor(
        public storage: Storage
    ) { }


    upload(file: any) {
        const filePath = `images/${file.name}`;
        const storage = getStorage();
        const storageRef = ref(storage, filePath);
        return storageRef;
    }
    
    getFile(file:any){
        const storage = getStorage();
        const filePath = `images/${file.name}`;
        return getDownloadURL(ref(storage, filePath))
    }


    delete(pathImage: any) {
        const storage = getStorage();
        const desertRef = ref(storage, pathImage);
        return desertRef;
    } 

}
