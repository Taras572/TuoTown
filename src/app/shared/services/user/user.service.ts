import { Injectable } from '@angular/core';
import { deleteUser } from "firebase/auth";
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor() { }

    private subject = new Subject<any>();

    sendClickEvent(info: any) {
        this.subject.next(info);
    }

    getClickEvent(): Observable<any> {
        return this.subject.asObservable();
    }


    deleteUser(user: any) {
        deleteUser(user).then(() => {

        }).catch((error) => {
            console.log(error);
        });
    }

    getUid(){
        const UID = JSON.parse(<string>localStorage.getItem('user'));
        if(UID && UID.uid == '5eCIwJ9wUgXDH6zg2NzCbqJjDww1'){
            return true;
        }
        else{
            return false;
        }
    }

   
}
