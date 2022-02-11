import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import {GroupsService} from "../services/groups.service";
import {AuthenticationService} from "../../core/auth/_services/authentication.service";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-group-database-conflicts',
  templateUrl: './group-database-conflicts.component.html',
  styleUrls: ['./group-database-conflicts.component.css']
})
export class GroupDatabaseConflictsComponent implements OnInit {

  title = _TRANSLATE('Database Conflicts')
  @ViewChild('container', {static: true}) container: ElementRef;
  breadcrumbs:Array<Breadcrumb> = []
  group;
  issueId:string
  docId:string

  constructor(
    private http: HttpClient,
    private groupsService: GroupsService,
    private authenticationService: AuthenticationService,
    private route:ActivatedRoute
  ) {}

  async ngOnInit() {
    this.group = await this.groupsService.getGroupInfo(window.location.hash.split('/')[2])
    console.log("group: ", this.group)
    this.route.params.subscribe(async params => {
      this.issueId = params['issueId']
      this.docId = params['docId']
    })
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Database Conflicts'),
        url: 'database-conflicts'
      }
    ]

    const canAdministerCouchdbServer = await this.authenticationService.doesUserHaveAPermission(this.group._id, 'can_administer_couchdb_server');
    if (canAdministerCouchdbServer) {
        const username = localStorage.getItem('user_id');
        try {
          const data = await this.http.post('/nest/group/start-session', {group: this.group._id, username: username, type: 'admin'}, {observe: 'response'}).toPromise();
          if (data.status === 201) {
            const dbUrlWithCredentials = data.body["dbUrlWithCredentials"]
            this.container.nativeElement.innerHTML = `
      <couchdb-conflict-manager dbUrl="${dbUrlWithCredentials}" username="${username}" issueId="${(this.issueId)}" docId="${(this.docId)}"></couchdb-conflict-manager>
    `
          } else {
            // return false;
          }
        } catch (error) {
          console.log(error);
          let errorMessage = error.error? error.error : JSON.stringify(error)
          this.container.nativeElement.innerHTML = `<p>Unable to display database conflicts. Error: ${errorMessage}`
        }
      
    }
    
    
  }

}
