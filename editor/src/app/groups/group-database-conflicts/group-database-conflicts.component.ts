import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';

@Component({
  selector: 'app-group-database-conflicts',
  templateUrl: './group-database-conflicts.component.html',
  styleUrls: ['./group-database-conflicts.component.css']
})
export class GroupDatabaseConflictsComponent implements OnInit {

  title = _TRANSLATE('Database Conflicts')
  @ViewChild('container', {static: true}) container: ElementRef;
  breadcrumbs:Array<Breadcrumb> = []

  async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Database Conflicts'),
        url: 'database-conflicts'
      }
    ]
    const username = prompt('CouchDB Username:')
    const password = prompt('CouchDB Password:')
    const dbUrlWithCredentials = `${window.location.protocol}//${username}:${password}@${window.location.hostname}/db/${window.location.pathname.split('/')[2]}`
    this.container.nativeElement.innerHTML = `
      <couchdb-conflict-manager dbUrl="${dbUrlWithCredentials}" username="${window['userId']}"></couchdb-conflict-manager>
    `
  }

}
