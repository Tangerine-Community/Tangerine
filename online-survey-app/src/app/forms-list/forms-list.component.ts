import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-forms-list',
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.css']
})
export class FormsListComponent implements OnInit {

  constructor(private httpClient: HttpClient) { }
  formsList;
  async ngOnInit(): Promise<any> {
    this.formsList = await this.httpClient.get('./assets/forms.json').toPromise();
  }

}
