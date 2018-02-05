
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, Params } from '@angular/router';
import { UUID } from 'angular2-uuid';
import { DomSanitizer} from '@angular/platform-browser';
import {environment} from '../../environments/environment'//how to distingulish from enfironment.prod (not yet sure how this works) ?????
//import {RegistrationService} from '../registration/services/registration.service';
import {PaypalService} from '../registration/services/paypal.service';
import {BillingService} from '../billing/services/billing.service';
import {ValidationService} from '../validation/validation.service';//not an injectable service
import {Http, Response, Headers, RequestOptions} from '@angular/http';

declare var componentHandler: any;//needed to get js in materia.js to work with forms

@Component({
    //selector: 'app-plan',
    templateUrl: './plan.component.html',
})

export class PlanComponent implements OnInit {

    planForm: FormGroup;
    error: boolean = false;

    constructor(public http: Http, private _billingService: BillingService, private _paypalService: PaypalService, private _router: Router, private sanitizer: DomSanitizer,private _formBuilder: FormBuilder, _formsModule: FormsModule) { } //private _registrationService: RegistrationService,

    uuid :string;
    securetokenid :string;
    securetoken :string;
    id :string;
    planRequested :string;
    amt :string;

    url = null;
    paypalCheckoutServer = null;
    paypalUrl = null;

    // loginStatusCall = this._registrationService.getSession(localStorage.getItem('token'), localStorage.getItem('password'))
    //     .subscribe(
    //     data => { console.log('data returned from getSession call' + data);  },//this.result = data,
    //     err => { if (err.status && err.status == 401) { /*this._router.navigate(['Verify']);*/ window.location.href = "/login" } }, //returns status 401 if not logged in
    //     () => console.log('done')
    //     );
    
    ngOnInit() {
        console.log('hello again `PlanForm` component');
        this.uuid = UUID.UUID();
        this.planForm = this._formBuilder.group({
            'business': ['', Validators.required],
            'no_shipping': ['', Validators.required],
            'CREATESECURETOKEN': ['Y', Validators.required],
            'SECURETOKENID': [this.uuid, Validators.required]
        });
    }


    ngAfterViewInit() {
        componentHandler.upgradeDom();
    }
   
    onSubmitPlan(plan) {

            console.log("Submitting Plan" + plan );

            var billData = {
                planRequested:plan
            };
            this.requestBill(billData);
        // } else {
        //     console.log("Cancelled plan submission for $5000 package.");
        // }
    }

    private requestBill(billData) {

        this._paypalService.createBill(billData)
            .subscribe(
                data => {
                    // var dataObj = JSON.parse('{"' + data[1].replace(/&/g, '","').replace(/=/g, '":"') + '"}');
                    // this.id = data["id"];
                    console.log("data: " + JSON.stringify(data));
                    // console.log("data: " + data[1]);
                    // var dataObj = JSON.parse('{"' + data[1].replace(/&/g, '","').replace(/=/g, '":"') + '"}');
                    var paypalResult = data.RESULT;
                    var paypalMessage = data.RESPMSG;
                    if (paypalResult == "0") {
                        this.securetokenid = data.SECURETOKENID;
                        this.securetoken = data.SECURETOKEN;
                        this.planRequested = data.planRequested;
                        this.amt = data.amt;
                        this._paypalService.setSecuretokenid(this.securetokenid);
                        this._paypalService.setSecuretoken(this.securetoken);
                        this._paypalService.id = this.securetokenid;
                        this._paypalService.token = this.securetoken;
                        this._paypalService.planRequested = this.planRequested;
                        this._paypalService.amt = this.amt;
                        console.log("setting the paypal id and token:" + this._paypalService.id);
                        let paypalMode = environment.paypalMode;
                        if (paypalMode == "testing") {
                            this.paypalCheckoutServer = environment.paypalCheckoutServerTest
                        } else {
                            this.paypalCheckoutServer = environment.paypalCheckoutServerLive

                        }
                        // this.url = this.paypalCheckoutServer + '?SECURETOKEN=' + this.securetoken + '&SECURETOKENID=' + this.securetokenid;
                        this.url = this.paypalCheckoutServer;
                        console.log("paypalUrl: " + this.url);
                        //
                        // var body = "SECURETOKEN=" + this.securetoken + "&SECURETOKENID=" + this.securetokenid;
                        // var headers = new Headers();
                        // headers.append('Content-Type', 'application/x-www-form-urlencoded');
                        // let options  = new RequestOptions({ headers: headers }); // Create a request option
                        // this.http.post(this.paypalCheckoutServer, body, options) // ...using post request
                        //     // .map((res:Response) =>
                        //     .map((res:Response) =>
                        //     res.json()
                        //     ) // ...and calling .json() on the response to return data
                        this._router.navigate(['checkout']);
                    } else {
                        let message = "Problem with Paypal service: " + paypalMessage;
                        console.log(message);
                        alert(message);
                    }

                },//this.result = data,
                //WHEN TIME CAN ADD THIS BACK AS WE NO LONGER ARE CHAINING WE CAN GET THE ERROR MESSAGE AND PROVIDE TO USER: err => {this.error = JSON.parse(err._body); console.log(err); alert(JSON.stringify(err, null, 2)); console.log(JSON.stringify(err, null, 2))}, //let pJ = JSON.parse(err._body); alert(pJ.message);
                err => {
                    this.error = true;
                    console.log(err);
                    console.log(JSON.stringify(err, null, 2))
                },//generic error for now until time to fix (no longer chaining login so error message is now available)
                () => console.log('done')
            );

    }

    goToBilling() {
        this._router.navigate(['billingform']);
    }

    goToHome() {
        this._router.navigate(['home']);
    }

    get value(): string {
        return JSON.stringify(this.planForm.value, null, 2);
    }

}
