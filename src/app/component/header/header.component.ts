import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Database, onValue, ref } from '@angular/fire/database';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ICategory } from 'src/app/shared/model/category/category.model';
import { IProduct } from 'src/app/shared/model/product/product.model';
import { OrderService } from 'src/app/shared/services/order/order.service';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithRedirect, deleteUser, getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Auth } from '@angular/fire/auth';
import { UserService } from 'src/app/shared/services/user/user.service';
import { ToastrService } from 'ngx-toastr';
import disableScroll from 'disable-scroll';



@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
    public modal: boolean = true;
    public category: Array<ICategory> = [];
    public countBasket: any = 0;
    public product: Array<IProduct> = [];
    public sign: boolean = false;
    public signUpForm!: UntypedFormGroup;
    public signInForm!: UntypedFormGroup;

    //valid form Singin
    public singInEmail: boolean = false;
    public singInPassword: boolean = false;
    public singInMassage: string = '';

    //valid form Singup
    public singUpEmail: boolean = false;
    public singUpPassword: boolean = false;
    public singUpMassage: string = '';
    public singUpPasswordMassage: string = '';
    //user
    public accountLog: boolean = true;
    public personInfo: any;
    public mail: string = '';
    public mailMassage: string = '';
    public mailStyle: boolean = false;
    public admin!: boolean;

    message!: string;
    @ViewChild('closebutton') closebutton: any; // for close bootstrap modal

    constructor(
        public database: Database,
        public router: Router,
        public orderService: OrderService,
        public userService: UserService,
        private fb: UntypedFormBuilder,
        public auth: Auth,
        private toastr: ToastrService

    ) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                const categoryName = event.url.substring(9);
            }
        });


    }




    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this.loadCategory();
        this.getProducts();
        this.basketProduct();

        this.initSignInForm();
        this.initSignUpForm();
        this.LogIn();
        this.admin = this.userService.getUid();
    }


    //disable scroll bar
    
    scrollDisable(){
        if(!this.modal){
            disableScroll.on();
        }
        else{
            disableScroll.off();
        }
    }


    sendcheckForm(info: any) {
        this.userService.sendClickEvent(info);
    }

    /* @HostListener("document:scroll") */

    public CloseModal() {
        this.closebutton.nativeElement.click();
    }


    loadCategory(): void {
        const starCountRef = ref(this.database, 'category/');
        onValue(starCountRef, (snapshot) => {
            this.category = Object.values(snapshot.val());
        });
    }


    basketProduct(): void {
        this.orderService.stream$.subscribe(val => this.countBasket = val);
    }


    getProducts(): void {
        if (localStorage.getItem('TuoTown')) {
            this.product = JSON.parse(<string>localStorage.getItem('TuoTown'));
            this.countBasket = this.getCount(this.product);
        }
    }


    getCount(product: Array<IProduct>): number {
        return product.reduce((total, prod) => total + prod.count, 0);
    }


    initSignUpForm(): void {
        this.signUpForm = this.fb.group({
            email: [null, Validators.required],
            password: [null, Validators.required],
            passwordRepeat: [null, Validators.required]
        })
    }


    initSignInForm(): void {
        this.signInForm = this.fb.group({
            email: [null, Validators.required],
            password: [null, Validators.required]
        })
    }


    SingUp(): void {
        const { email, password, passwordRepeat } = this.signUpForm.value;
        let pass;
        if (password == passwordRepeat) {
            pass = password;
        }
        createUserWithEmailAndPassword(this.auth, email, pass)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                this.defoltInputLogin();
                this.CloseModal();
                localStorage.setItem('user', JSON.stringify(user));
                this.sendcheckForm('good');
                this.showSuccess('', 'Користувач успішно зареєстрований');
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                if (errorCode == 'auth/email-already-in-use') {
                    this.singUpMassage = 'Користувач вже зареєстрований';
                    this.singUpEmail = true;
                }
                else if (errorCode == 'auth/invalid-email') {
                    this.singUpMassage = 'Недійсна електронна адреса';
                    this.singUpEmail = true;
                }
                if (errorCode == 'auth/weak-password') {
                    this.singUpPasswordMassage = 'Слабкий пароль';
                    this.singUpPassword = true;
                }
                else if (errorCode == 'auth/internal-error') {
                    this.singUpPasswordMassage = 'Неправильно введений пароль';
                    this.singUpPassword = true;
                }

            });

    }


    SingIn() {
        const { email, password } = this.signInForm.value;
        signInWithEmailAndPassword(this.auth, email, password,)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                this.defoltInputLogin();
                this.CloseModal();
                localStorage.setItem('user', JSON.stringify(user));
                this.sendcheckForm('good');
                this.admin = this.userService.getUid();
                console.log(this.admin);
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                if (errorCode == 'auth/user-not-found') {
                    this.singInMassage = 'Користувач не зареєстрований';
                    this.singInEmail = true;
                }
                else if (errorCode == 'auth/invalid-email') {
                    this.singInMassage = 'Недійсна електронна адреса';
                    this.singInEmail = true;
                }
                if (errorCode == 'auth/wrong-password') this.singInPassword = true;
            });
    }


    SingInWhithGoogle() {
        const provider = new GoogleAuthProvider();
        signInWithPopup(this.auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential?.accessToken;
                // The signed-in user info.
                const user = result.user;
                this.CloseModal();
                this.defoltInputLogin();
                localStorage.setItem('user', JSON.stringify(user));
                this.sendcheckForm('good');

                // ...
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
            });
    }

    deleteProfil() {
        const user = this.auth.currentUser;
        if (user?.uid == '5eCIwJ9wUgXDH6zg2NzCbqJjDww1') {
            this.router.navigate(['/admin']);
        }
        else {
            this.userService.deleteUser(user);
            this.logOut();
        }

    }


    defoltInputLogin() {
        this.singInEmail = false;
        this.singInPassword = false;
        this.singUpEmail = false;
        this.singUpPassword = false;
        this.initSignUpForm();
        this.initSignInForm();
    }

    LogIn(): void {
        if (localStorage.getItem('user')) {
            this.personInfo = JSON.parse(<string>localStorage.getItem('user'));
            this.accountLog = false;
        }
    }

    logOut() {
        localStorage.removeItem('user');
        this.accountLog = true;
        this.sendcheckForm('good');
        this.admin = this.userService.getUid();
        console.log(this.admin);
    }

    resetPassword(email: string) {
        sendPasswordResetEmail(this.auth, email)
            .then(() => {
                // Password reset email sent!
                this.mailStyle = false;
                this.mailMassage = 'Посилання відправлено на вашу пошту';
                this.mail = '';
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode);
                if (errorCode == 'auth/user-not-found') {
                    this.mailMassage = 'Користувач не зареєстрований';
                    this.mailStyle = true;
                }
                else if (errorCode == 'auth/invalid-email') {
                    this.mailMassage = 'Недійсна електронна адреса';
                    this.mailStyle = true;
                }
            });
    }

    showSuccess(info: string, infoTo: string) {
        this.toastr.success(info, infoTo);
    }


}