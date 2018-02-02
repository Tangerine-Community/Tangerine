import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, Params } from '@angular/router';
import { ValidationService } from '../validation/validation.service';//not an injectable service
import { RegistrationService } from './services/registration.service'
import { ControlMessages } from '../validation/validation.component';

declare var componentHandler: any;//needed to get js in materia.js to work with forms


@Component({
    //selector: 'app-username-form',
    templateUrl: './username-form.component.html',
    styles: [`
        .success {
            color: #3c763d;
        }
        .hideit {
            display: none;
        }
    `],
})


export class UsernameFormComponent {

    //user: User;
    passwordForm: FormGroup;
    sentPW: boolean = false;
    emailFound: boolean = true;
    error: string;
    submitted: boolean = false;
    loggedIn: boolean = false;

    constructor(private _registrationService: RegistrationService, private _formBuilder: FormBuilder, private _router: Router) //private _routeParams: RouteParams
    {    }

    ngAfterViewInit() {
        componentHandler.upgradeDom();
    }

    onSubmit() {
        this.submitted = true;
        if (this.passwordForm.dirty && this.passwordForm.valid) {
            //alert(`Username: ${this.loginForm.value.username} Password: ${this.loginForm.value.password}`);
        }
        this._registrationService.retrieveID(this.passwordForm.value)
            .subscribe(
            data => {console.log("useridData: " + JSON.stringify(data)); this.sentPW = true; this.emailFound = data.IDSent; },//  window.location.href="/"; temporarily using windows.location until fixin issue with js library not loading on redirect. //this.result = data, //this._router.navigate(['Projects']);
            err => {
                if(err.status == "404")//404 if not found
                { 
                    var jsErr = JSON.parse(err._body);// to get error
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
        //console.log('hello again `LoginForm` component');
        this.passwordForm = this._formBuilder.group({
            'email': ['', Validators.compose([Validators.required, ValidationService.emailValidator])]
        });        
    }

    

    get value(): string {
        return JSON.stringify(this.passwordForm.value, null, 2);
    }

    /////////////////////////////

}