import { Component, OnInit } from '@angular/core';
// import {FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, AbstractControl} from '@angular/common';
import {RegistrationService} from '../registration/services/registration.service';
// import {ValidationService} from '../validation.service';//not an injectable service
import {BillingService} from './services/billing.service';
// import {TruncatePipe2} from '../pipes/truncate2';
// import { TruncatePipe } from '../pipes/truncate';
import {DatePipe} from '@angular/common';

declare var componentHandler: any;//needed to get js in materia.js to work with forms

@Component({
    selector: 'h-billing',
    template: require('./billing.html'),
    styles: [`
        @media print {
            .no-print {
                display :  none;
            }
            .mdl-card {
                width:100%;
            }
        }
    `],
    //providers: [RegistrationService],
    // providers: [BillingService, TruncatePipe]
    providers: [BillingService, DatePipe]
    // pipes: [TruncatePipe]
    // directives: [
    //     ...FORM_DIRECTIVES
    // ]
    //outputs: ['childChanged']
})


export class BillsComponent implements OnInit {

    readyForDisplay: boolean = false;
    load_error: boolean = false;
    billingData = [];
    constructor(private _billingService: BillingService, private _registrationService: RegistrationService) {
        console.log('billing1 ran in constructor');
    }


    ngOnInit() {
        console.log('hello Billing component');
        this.getBills()
    }

    ngAfterViewInit() {
        componentHandler.upgradeDom();
    }

    print() {
        window.print();      
    }

    loginStatusCall = this._registrationService.getSession(localStorage.getItem('token'), localStorage.getItem('password'))
        .subscribe(
            data => { console.log('data returned from getSession call' + data);  },//this.result = data,
            err => { if (err.status && err.status == 401) { /*this._router.navigate(['Verify']);*/ window.location.href = "/login" } }, //returns status 401 if not logged in
            () => console.log('done')
        );

    getBills() {
        //let username = localStorage.getItem('user_id'); this._billingService.billingCheck(username);
        this._billingService.billingCheck()
            .subscribe(
            data => {
                console.log(data);
                //alert(data.rows.length) is the same as below
                //alert(data["rows"].length);
                if (data.rows.length) //empty array if nothing is found
                {
                    console.log("got data for billing ");
                    this.billingData = data.rows;
                    this.readyForDisplay = true;

                }
                else { this.readyForDisplay = false; }
            },// holds "value": "Username In Use" if taken
            err => {
                console.log(err)
                this.load_error = true;
            }, //this.error = err, 
            () => console.log('done billing')
            );
    }

    /////////////////////////////

}
