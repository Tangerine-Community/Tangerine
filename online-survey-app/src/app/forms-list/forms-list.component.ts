import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Form } from '../shared/classes/form';

@Component({
  selector: 'app-forms-list',
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.css']
})
export class FormsListComponent implements OnInit {

  constructor(private httpClient: HttpClient, private router: Router) { }
  formsList;
  async ngOnInit(): Promise<any> {
    const forms = await this.httpClient.get('./assets/forms.json').toPromise() as Form[];
    if (forms.length > 1) {
      this.formsList = forms;
    } else {
      this.router.navigate([`/tangy-forms/new/${forms[0].id}`]);
    }
  }

}
