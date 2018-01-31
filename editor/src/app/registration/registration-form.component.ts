import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {FormBuilder, ReactiveFormsModule, FormGroup, FormControl, Validators} from '@angular/forms';
import {ValidationService} from '../validation/validation.service';//not an injectable service
import { RegistrationService } from './services/registration.service'
import {CountriesService} from './services/countries.service';
import {StatesService} from './services/states.service';
import {TruncatePipe} from '../pipes/truncate';

declare var componentHandler: any;//needed to get js in materia.js to work with forms

@Component({
  //selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent implements OnInit {

  //user: User;
    registerForm: FormGroup;
    //username: AbstractControl;
    usernameInUse: boolean;//hack var for form until I get asynch observable value to work (not sure why it was not working).
    emailInUse: boolean;
    urlInUse: boolean;
    error: boolean = false;
    errorMessage: string;
    states;
    locations;
    hideElement: boolean = false;
    hideElementUrl: boolean = false;

    constructor(
        private _registrationService: RegistrationService, private _countriesService: CountriesService, private _statesService: StatesService, private _formBuilder: FormBuilder, private _router: Router) {
    }

    submitted = false;

    ngAfterViewInit() {
        componentHandler.upgradeDom();
    }

    onSubmit() {
        if (this.registerForm.dirty && this.registerForm.valid) {
            //alert(`First Name: ${this.registerForm.value.firstName} Email: ${this.registerForm.value.email}`);
            if (this.registerForm.value.url == '') this.registerForm.value.url = 'demo'
            if (this.registerForm.value.group == '') {
                var emailStr = this.registerForm.value.email 
                var group = emailStr.replace(/\.|@|-|\!|#|\$|%|&|'|\+|-|\/|=|\?|\^|`|{|}|\||~|;/g, "_");
                this.registerForm.value.group = group;
         }
        }
        this._registrationService.registerUser(this.registerForm.value)
            .subscribe(
                data => {
                    console.log(data);
                    this._router.navigate(['verify']);
                },//this.result = data,
                //WHEN TIME CAN ADD THIS BACK AS WE NO LONGER ARE CHAINING WE CAN GET THE ERROR MESSAGE AND PROVIDE TO USER: err => {this.error = JSON.parse(err._body); console.log(err); alert(JSON.stringify(err, null, 2)); console.log(JSON.stringify(err, null, 2))}, //let pJ = JSON.parse(err._body); alert(pJ.message);
                err => {
                    this.error = true;
                    let errorObj = JSON.parse(err._body);
                    let emailError = errorObj.error.validationErrors["email"]
                    if (typeof emailError !== 'undefined') {
                        this.errorMessage = errorObj.error.validationErrors["email"][0];
                    }
                    console.log("this.errorMessage: " + this.errorMessage)
                    this.submitted = false;
                    console.log(err);
                    console.log(JSON.stringify(err, null, 2))
                },
                () => console.log('done')
            );
        this.submitted = true;
        //this._router.navigate(['Home']); //don't need injection for router as it is injected at root componenet (jw)
    }

    ngOnInit() {
        console.log('hello again `RegistrationForm` component');
        this.registerForm = this._formBuilder.group({
            'firstName': ['', Validators.required],
            'lastName': ['', Validators.required],
            'email': ['', Validators.compose([Validators.required, ValidationService.emailValidator])],
            'organizationName': ['', Validators.required],
            'organizationType': ['', Validators.required],
            'title': ['', Validators.required],
            'location': ['', Validators.required],
            // 'city': ['', Validators.required],
            'state': ['', Validators.required],
            'plan': ['', Validators.required],
            'termsOfUse': ['', Validators.required],//does not work for some reason on the checkbox, not sure why so added validation in form
            'emailOptOut': [''],
            'url': [''],
            'group': [''],
            'username': ['', Validators.required],
            //'username': [this._routeParams.get('username'), Validators.required, this.usernameExists.bind(this)],//bind to this to avoid errors in this scope when used in method as it does not know the correct this (jw note)
            'password': ['', Validators.compose([Validators.required, ValidationService.passwordValidator])],
            //'confirmPassword': ['', Validators.compose([ValidationService.passwordValidator, this.passwordMatchValidator.bind(this)])]//todo: when multiple validator bug is fixed, make a validator that compares value of password to confirmPassword, right now this is in the view instead. similar to this: http://stackoverflow.com/questions/35413693/cross-field-validation-in-angular2/35414956#35414956
            'confirmPassword': ['', ValidationService.passwordValidator]

        });

        this.getCounties();
        this.getStates();
        //this.username = this.registerForm.controls['username'];

    }

    getCounties() {
        this._countriesService.getData().subscribe(
            data => { this.locations = data },
            err => console.error(err),
            () => console.log('done getting countries')
        );
    }
    getStates() {
        this._statesService.getData().subscribe(
            data => { this.states = data },
            err => console.error(err),
            () => console.log('done getting states')
        );
    }

    requireState(selectedValue) {
       if (selectedValue == "United States") {
            this.registerForm.controls["state"].setValidators(Validators.required);
            this.registerForm.controls["state"].setErrors( { 'stateRequired': true })
            this.hideElement = true;
       } else {
            this.registerForm.controls["state"].setErrors(null)
            this.registerForm.controls["state"].setValidators(null);
            this.hideElement = false;
       };
    }
    requireUrl(selectedValue) {
        if (selectedValue != "Free" && selectedValue != "") {
            this.registerForm.controls["url"].setValidators(Validators.required);
            this.registerForm.controls['url'].setErrors(
                        { 'Url is required': true })
            this.hideElementUrl = true;
        } else {
            this.registerForm.controls['url'].setErrors(null)
            this.registerForm.controls["url"].setValidators(null);
            this.hideElementUrl = false;
        }
    };
    transformUsername() {
      let username = this.registerForm.get('username');
      username.setValue(username.value.toLowerCase());
      username.setValue(username.value.replace(/[^a-z]/, ''));
    }

    emailExists(email) {        //make this cleaner when documentatoin on async validators come out, had to manually set control to invalid as nothing worked, and no documentation (jw note)
        //alert('protocol:' + window.location.protocol + 'host: ' + window.location.hostname)
        this._registrationService.emailCheck(email.value)
            .subscribe(
            data => {
                console.log(data);
                //alert(data.rows.length) is the same as below
                //alert(data["rows"].length);
                if (data.rows.length) //empty array if nothing is found
                {
                    console.log("email found in db: ");
                    this.emailInUse = true; this.registerForm.controls['email'].setErrors(
                        { 'invalidEmailAsUsed': true })
                }
                else { this.emailInUse = false; }
            },// holds "value": "Username In Use" if taken
            err => console.log(err), //this.error = err, 
            () => console.log('done checking email')
            );
    }

    usernameExists(username) {        //make this cleaner when documentatoin on async validators come out, had to manually set control to invalid as nothing worked, and no documentation (jw note)
        //alert('protocol:' + window.location.protocol + 'host: ' + window.location.hostname)
        this._registrationService.usernameCheck(username.value)
            .subscribe(
            data => {
                console.log(data);
                //alert(data.rows.length) is the same as below
                //alert(data["rows"].length);
                if (data.rows.length) //empty array if nothing is found
                {
                    console.log("username found in db: ");
                    this.usernameInUse = true; this.registerForm.controls['username'].setErrors(
                        { 'invalidUsernameAsUsed': true })
                }
                else { this.usernameInUse = false; }
            },// holds "value": "Username In Use" if taken
            err => console.log(err), //this.error = err, 
            () => console.log('done checking username')
            );
    }

    urlExists(url) {        //make this cleaner when documentatoin on async validators come out, had to manually set control to invalid as nothing worked, and no documentation (jw note)
        //alert('protocol:' + window.location.protocol + 'host: ' + window.location.hostname)
        this._registrationService.urlCheck(url.value)
            .subscribe(
            data => {
                console.log(data);
                if (data.rows.length) //empty array if nothing is found
                {
                    console.log("urlExists found in db: ");
                    this.urlInUse = true; this.registerForm.controls['url'].setErrors(
                        { 'invalidUrlAsUsed': true })
                }
                else { this.urlInUse = false; }
            },
            err => console.log(err), //this.error = err, 
            () => console.log('done checking url')
            );
    }

    passwordsMatch() {
        if (this.registerForm.controls['password'].value == this.registerForm.controls['confirmPassword'].value) {
            //this.registerForm.controls['confirmPassword'].valid
        } else {
            this.registerForm.controls['confirmPassword'].setErrors({ 'passwordsDontMatch': true });
        }
    }

    get value(): string {
        return JSON.stringify(this.registerForm.value, null, 2);
    }


}
