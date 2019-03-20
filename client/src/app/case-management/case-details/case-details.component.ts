import { AfterContentInit, OnInit, ElementRef, Component, ViewChild } from '@angular/core';
import { UserService } from '../../core/auth/_services/user.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-case-details',
  templateUrl: './case-details.component.html',
  styleUrls: ['./case-details.component.css']
})
export class CaseDetailsComponent implements OnInit, AfterContentInit {
  locationId;
  constructor(
    private userService: UserService,
    private http: HttpClient,
    private route: ActivatedRoute) { }
  @ViewChild('reports_container') reportsContainer: ElementRef;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.locationId = params['locationId'];
      this.setURL();
    });
  }

  async ngAfterContentInit() {
    const container = this.reportsContainer.nativeElement
    let formHtml =  await this.http.get('./assets/reports/form.html', {responseType: 'text'}).toPromise();
    container.innerHTML = formHtml
  }

  async setURL() {
    const userDbName = await this.userService.getUserDatabase();
  }

}
