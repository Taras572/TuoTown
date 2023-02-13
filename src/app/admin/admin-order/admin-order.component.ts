import { Component } from '@angular/core';
import { Database, update } from '@angular/fire/database';
import { ref, set, onValue, get, remove, child, push } from "firebase/database";


@Component({
    selector: 'app-admin-order',
    templateUrl: './admin-order.component.html',
    styleUrls: ['./admin-order.component.scss']
})
export class AdminOrderComponent {
    public order: Array<any> = [];

    constructor(
        public database: Database
    ) {

    }
    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.loadCategory();
    }


    loadCategory(): void {
        const starCountRef = ref(this.database, 'order/');
        onValue(starCountRef, (snapshot) => {
            this.order = Object.values(snapshot.val());
        });
    }


    removeOrder(id: any): void {
        //bug error)
        if (this.order.length == 1) {
            set(ref(this.database, 'order/'), '')
                .then(() => {
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        else {
            remove(ref(this.database, 'order/' + id));
        }
    }

}
