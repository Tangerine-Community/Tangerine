import { TangyFormService } from './../../../tangy-forms/tangy-form.service';
import { Component, OnInit } from '@angular/core';
import { Case } from '../../classes/case.class'

@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.css']
})
export class CasesComponent implements OnInit {

  cases:Array<Case> = []
  numberOfOpenCases:number 

  constructor(
    private tangyFormService:TangyFormService 
  ) { }

  async ngOnInit() {
    this.cases = (await this.tangyFormService.getAllResponses())
      .filter(doc => doc.collection === 'TangyFormResponse' && doc.type === 'Case')
    this.numberOfOpenCases = this.cases.filter(caseInstance => caseInstance.complete === false).length
  }

}