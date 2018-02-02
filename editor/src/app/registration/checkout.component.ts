



import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import {PaypalService} from '../registration/services/paypal.service';
import {environment} from '../../environments/environment'//how to distingulish from enfironment.prod (not yet sure how this works) ?????

@Component({
    selector: 'appcheckout',
    templateUrl: './checkout.component.html',
    // providers: [PaypalService]

    //styleUrls: ['./checkout.component.css']
})

export class CheckoutComponent implements OnInit {
    constructor(private sanitizer: DomSanitizer, private paypalService: PaypalService) {

    }

    securetokenid = "0";
    securetoken = "0";
    paypalErrorUrl = null;
    parmList = null;
    url = null;
    paypalCheckoutServer = null;
    paypalUrl = null;
    amt = null;
    plan = "Default plan";
    planRequested = "Default plan";

    ngOnInit() {
        console.log('hello checkout page: ' + this.paypalService.id);
        this.securetokenid = this.paypalService.id;
        this.securetoken = this.paypalService.token;

        this.amt = this.paypalService.amt;
        this.planRequested = this.paypalService.planRequested;
       
        let paypalMode = environment.paypalMode;
        if (paypalMode == "testing") {
            this.paypalCheckoutServer = environment.paypalCheckoutServerTest
            this.parmList = environment.parmListTest
        } else {
            this.paypalCheckoutServer = environment.paypalCheckoutServerLive
            this.parmList = environment.parmListLive
        }
        // this.url = this.paypalCheckoutServer + '?SECURETOKEN=' + this.securetoken + '&SECURETOKENID=' + this.securetokenid;
        this.url = this.paypalCheckoutServer;
        console.log("paypalUrl: " + this.url + " this.securetoken: " + this.securetoken + " this.securetokenid: " + this.securetokenid);
        this.paypalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    }
}

