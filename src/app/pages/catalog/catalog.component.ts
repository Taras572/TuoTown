import { Component } from '@angular/core';
import { Database, onValue, ref } from '@angular/fire/database';

@Component({
    selector: 'app-catalog',
    templateUrl: './catalog.component.html',
    styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent {

    public category: Array<any> = [];

    constructor(
        public database: Database,
    ) {

    }

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.loadCategory();
    }


    loadCategory(): void {
        const starCountRef = ref(this.database, 'category/');
        onValue(starCountRef, (snapshot) => {
            this.category = Object.values(snapshot.val());
        });
    }


}
