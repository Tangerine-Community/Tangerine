import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {UsageService} from './home.service';
import {RegistrationService} from '../registration/services/registration.service';

declare var twitterFetcher: any;
declare var ProgressBar: any;

@Component({
  //selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  readyForDisplay: boolean = false;
  urlReadyForDisplay: boolean = false;
  //passwordReadyForDisplay: boolean = false;
  resultsUsed: number = 0;
  resultsAllowed: number = 2000;
  fractionUsed: number = 0;
  percentRounded: number = 0;//used as angular pipe broken in safari
  //dateStarted: Date;
  dateExpired: Date;
  dateExpiredString: string = "";//angular pipe not working in safari, so created this
  daysToExpiration: number = 360;
  plan: string = "Free";
  url: string = "";
  TSIPassword: string = "";
  TSILabel: string = "Retrieve user1 Password";
  //todo: update this to reflect billing date if that is used: 
  //added one year to signup date

  tweets: any = {};
  //readyForDisplay: boolean = false;

  //345170787868762112
  config1 = {
    "id": '726102570368905217',
    "domId": 'example1',
    "maxTweets": 2,
    "enableLinks": true,
    "showInteraction": false
  };

  // config8 = {
  // "id": '502160051226681344',
  // "dataOnly": true,
  // "customCallback": this.populateTpl
  // };
  // TypeScript public modifiers
  constructor(private _usageService: UsageService, private _registrationService: RegistrationService, private _router: Router) {

  }

  ngOnInit() {
    console.log('hello `Home` component');

    //this._halfCircleGenerate(20/100);//temoporary there to see twitter feed and circle, remove and add two lines below when ready
    this.getUsage();
    this.getUrl();

  }

  // populateTpl(tweets){
  //   this.tweets = tweets;   
  //   this.readyForDisplay = true;
  // }
  
  // loginStatusCall = this._registrationService.getSession(localStorage.getItem('token'), localStorage.getItem('password'))
  //       .subscribe(
  //       data => { console.log('data returned from getSession call' + data);  },//this.result = data,
  //       err => { if (err.status && err.status == 401) { /*this._router.navigate(['Verify']);*/ window.location.href = "/login" } }, //returns status 401 if not logged in
  //       () => console.log('done')
  //       );

  getUsage() {
    this._usageService.getResultsCount(localStorage.getItem('token'), localStorage.getItem('password')).subscribe(
      data => {
        this.resultsUsed = data.resultsUsed;
        this.resultsAllowed = data.resultsAllowed
        this.fractionUsed = (this.resultsUsed / this.resultsAllowed)
        this.percentRounded  = Math.round((this.resultsUsed / this.resultsAllowed)*100)
        if (isNaN(this.percentRounded)) {this.percentRounded = 0}// to ensure we have number initially
        if (isNaN(this.resultsUsed)) {this.resultsUsed = 0}// to ensure we have number initially
        if (data.timestamp) { var dateStarted = new Date(this.convertISO8601toDate(data.timestamp)) } else { var dateStarted = new Date() }//all users have dates, but in case not set a default to avoid errors (shoud never happen)
        //todo: later we can pull from actual billing date if available, depending on type of plan           
        //alert(dateStarted);
        let expTime = dateStarted.setFullYear(dateStarted.getFullYear() + 1)  //NOTE THIS REWRITES THE VALUE ON DATESTARTED AS WELL
        this.dateExpired = new Date(expTime); //alert('expTime: ' + this.dateExpired)
        this.dateExpiredString = this.parseOutDateStringFromDate(this.dateExpired);//get date as pipe broken in safari
        this.daysToExpiration = this.daysBetween(this.dateExpired, new Date()) //if lt 90 have warning
        //alert(this.renewalWarningDate)
        this.plan = data.plan || "Free"
        this.readyForDisplay = true;

        this._halfCircleGenerate(this.percentRounded/100);

      },
      err => console.error(err),
      () => console.log('done with usage call')
    );
  }

  getUrl() {
    this._usageService.getUrl().subscribe(
      data => {
        this.url = data.url;
        this.urlReadyForDisplay = true;
      },
      err => console.error(err),
      () => console.log('done with url info call')
    );
  }

  getTSIPassword() {
    this._usageService.getTSIPassword().subscribe(
      data => {
        this.TSILabel = '';
        this.TSIPassword = data.TSIPassword;
        //this.passwordReadyForDisplay = true;
      },
      err => console.error(err),
      () => console.log('done with password info call')
    );
  }

  _halfCircleGenerate(number){
    // this.title.getData().subscribe(data => this.data = data);
    //number = 0.0;
    twitterFetcher.fetch(this.config1);
    //document.getElementById("example1").innerHTML = "Paragraph changed!";
    var containerCircle = document.getElementById('containerCircle');//change this to use elementRef later to not be coupled with DOM.
    var bar = new ProgressBar.SemiCircle(containerCircle, {
      strokeWidth: 6,
      color: '#FFEA82', 
      trailColor: 'green',
      trailWidth: 3,
      easing: 'easeInOut',
      duration: 1400,
      svgStyle: null,
      text: {
        value: '',
        alignToBottom: false
      },
      from: {color: '#FFEA82'},
      to: {color: '#ED6A5A'},
      // Set default step function for all animate calls
      step: (state, bar) => {
        bar.path.setAttribute('stroke', state.color);
        var value = Math.round(bar.value() * 100);
        if (value == 0) {
          bar.setText('No Usage');
          bar.text.style.color = '#669999';
        } else {
          bar.setText("Your Usage: " + value + "%");
          //bar.text.style.color = state.color;
          bar.text.style.color = '#669999';
        }
      }
    });
    bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
    bar.text.style.fontSize = '1.0rem';

    bar.animate(number);  // Number from 0.0 to 1.0

  }
  
  
  parseOutDateStringFromDate(dateObj){//angular pipe throwing errors in safar, so had to do this for now
    let ds = dateObj.toString();
    let dtStringToUse = ds.substring(4, 15); //May 24 2015
    return (dtStringToUse)
  }
   

  daysBetween(date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime()
    var date2_ms = date2.getTime()

    // Calculate the difference in milliseconds
    var difference_ms = (date1_ms - date2_ms) //math.abs if absolute

    // Convert back to days and return
    return Math.round(difference_ms / ONE_DAY)

  }
  
  

convertISO8601toDate(dtstr) {

  // replace anything but numbers by spaces
  dtstr = dtstr.replace(/\D/g," ");

  // trim any hanging white space
  dtstr = dtstr.replace(/\s+$/,"");

  // split on space
  var dtcomps = dtstr.split(" ");

  // not all ISO 8601 dates can convert, as is
  // unless month and date specified, invalid
  if (dtcomps.length < 3) return "invalid date";
  // if time not provided, set to zero
  if (dtcomps.length < 4) {
    dtcomps[3] = 0;
    dtcomps[4] = 0;
    dtcomps[5] = 0;
  }

  // modify month between 1 based ISO 8601 and zero based Date
  dtcomps[1]--;

  var convdt = new
Date(Date.UTC(dtcomps[0],dtcomps[1],dtcomps[2],dtcomps[3],dtcomps[4],dtcomps[5]));

  return convdt.toUTCString();
}


}
