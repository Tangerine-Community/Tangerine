import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ValidationService } from '../validation/validation.service';//not an injectable service
import { RegistrationService } from './services/registration.service'
import { ControlMessages } from '../validation/validation.component';

import 'rxjs/add/operator/switchMap';

declare var componentHandler: any;//needed to get js in materia.js to work with forms

@Component({
    //selector: 'app-pwchange-form',
    templateUrl: './pwchange-form.component.html',
    styles: [`
        .success {
            color: #3c763d;
        }
        .hideit {
            display: none;
        }
    `]
})


export class PasswordChangeFormComponent implements OnInit{

    //user: User;
    pwchangeForm: FormGroup;
    sentPW: boolean = false;
    error: string;
    submitted: boolean = false;
    loggedIn: boolean = false;
    public token = "";
    private sub: any;

    constructor(private _registrationService: RegistrationService, private _formBuilder: FormBuilder, private _router: Router, private _activatedRoute: ActivatedRoute,) //private _routeParams: RouteParams
    {    }

    ngAfterViewInit() {
        componentHandler.upgradeDom();
    }

    onSubmit() {
        this.submitted = true;
        if (this.pwchangeForm.dirty && this.pwchangeForm.valid) {
            //alert(`Username: ${this.loginForm.value.username} Password: ${this.loginForm.value.password}`);
        }
        this._registrationService.changePW(this.pwchangeForm.value)
            .subscribe(
            data => {
                console.log(data); this.sentPW = true;
                this._router.navigate(['login']);
                },//  window.location.href="/"; temporarily using windows.location until fixin issue with js library not loading on redirect. //this.result = data, 
            
            err => { console.log(err); 
                if(err.status == "404")//404 if not found
                { 
                    var jsErr = JSON.parse(err._body);// to get error (if not token was sent, should never happen)
                    this.error = jsErr.error + ': ' + jsErr.validationErrors.token;
                } 
                else if(err.status = "400") //not sure if we will get this code
                {
                    var jsErr = JSON.parse(err._body);// to get error (if not token was sent, should never happen)
                    this.error = "Error: " + jsErr.error;
                }
                else 
                {   // could be 500 or other error, and don't always know format of msg
                    var jsErr = JSON.parse(err._body);// to get error
                    this.error = "Error: " + jsErr.message;
                    
                } 
            
                this.submitted = false;
                console.log(err); //console.log(JSON.stringify(err, null, 2))
            }, //let pJ = JSON.parse(err._body); alert(pJ.message);
            () => console.log('done')
            );
            //alert('after done');
        
        //this._router.navigate(['Home']); //don't need injection for router as it is injected at root componenet (jw)
      
    }

    ngOnInit() {
        //console.log('hello `changePW` component');  
        this.sub = this._activatedRoute.params.subscribe(params => this.token = params['token']).toString();
        
        this.pwchangeForm = this._formBuilder.group({
            'password': ['', Validators.compose([Validators.required, ValidationService.passwordValidator])],
            'confirmPassword': ['', ValidationService.passwordValidator],
            'token': [this.token, Validators.required]
        });  
        //(<Control>this.pwchangeForm.controls['token']).updateValue(this.token);      
    }
    
    passwordsMatch() {
        if (this.pwchangeForm.controls['password'].value == this.pwchangeForm.controls['confirmPassword'].value) {
            //this.registerForm.controls['confirmPassword'].valid
        } else {
            this.pwchangeForm.controls['confirmPassword'].setErrors({ 'passwordsDontMatch': true });
        }
    }

    

    get value(): string {
        return JSON.stringify(this.pwchangeForm.value, null, 2);
    }

    /////////////////////////////

}