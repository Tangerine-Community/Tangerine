import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RegistrationService } from './services/registration.service' //is this neeed or can it be put higher up?
import { FormBuilder, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';//can some of these be taken out as in module?
import { ValidationService } from '../validation/validation.service';//not an injectable service
import { AuthService } from '../auth.service';

declare var componentHandler: any;//needed to get js in materia.js to work with forms

@Component({
    //selector: 'app-login-form',
    templateUrl: './login-form.component.html'//,
//styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {


    //user: User;
    loginForm: FormGroup;
    public locations;
    error: string;
    loggedIn: boolean = false;
    loginStatus;

    constructor(private authService: AuthService, private _registrationService: RegistrationService, private _formBuilder: FormBuilder, private _router: Router) //private _routeParams: RouteParams
    { }


    submitted = false;

    ngAfterViewInit() {
        componentHandler.upgradeDom();
    }

    onSubmit() {
        if (this.loginForm.dirty && this.loginForm.valid) {
            //alert(`Username: ${this.loginForm.value.username} Password: ${this.loginForm.value.password}`);
        }
        this._registrationService.loginUser(this.loginForm.value)
            .subscribe(
                data => {
                    console.log(data); this.loggedIn = true;
                    this.loginStatus = data;
                    this.authService.setLoggedIn();// set subscription to logged in 
                    // let urlToNavigate = this.authService.redirectUrl || '/home';
                    // alert(this.loginStatus.firstTimeLoggin);
                    // if (this.loginStatus.firstTimeLoggin) this._router.navigate(['/plan']);//{window.location.href="/plan"}
                    // else { this._router.navigate([urlToNavigate]); }
                    this._router.navigate(['/projects']);

                },
                err => {
                    if (err.status === '401') {
                        let jsErr = JSON.parse(err._body); // to get error
                        this.error = 'Error: ' + jsErr.message;
                    }
                    console.log(err); console.log(JSON.stringify(err, null, 2));
                }, // let pJ = JSON.parse(err._body); alert(pJ.message);
                () => console.log('done')
            );
        // alert('after done');
        this.submitted = true;
        // this._router.navigate(['Home']); //don't need injection for router as it is injected at root componenet (jw)

    }

    // ngOnInit() {
    //   console.log('hello again `LoginForm` component');
    //   this.loginForm = new FormGroup({
    //     username: new FormControl('', Validators.required),
    //     password: new FormControl('', Validators.required)
    //   });
    // }

    ngOnInit() {
        console.log('hello again `LoginForm` component');
        this.loginForm = this._formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }



    get value(): string {
        return JSON.stringify(this.loginForm.value, null, 2);
    }

}
