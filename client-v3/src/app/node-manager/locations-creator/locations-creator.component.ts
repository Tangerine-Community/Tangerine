import {Component, Input, OnInit} from '@angular/core';

import { Validators, FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from 'ng-formly';
import { DataService } from './../../core/data-service.service';
// import {TangerinePageConfig} from "../../tangerine-forms/tangerine-page/tangerine-page-config";
import {NodeValue} from "../node-value";
import {NodeResult} from "../node-result";


@Component({
  selector: 'app-locations-creator',
  templateUrl: './locations-creator.component.html',
  styleUrls: ['./locations-creator.component.css'],
  providers: [DataService],
})
export class LocationsCreatorComponent implements OnInit {

  // IO.
  @Input() model:NodeValue;
  @Input() result: NodeResult;

  nodes = [];
  // form: FormGroup = new FormGroup({});
  // userFields: FormlyFieldConfig;
  constructor(private dataService: DataService) { }

  ngOnInit() {
    if (!this.result) {
      this.result = new NodeResult();
    }
    this.getNodes();
  }

  getNodes(): void {
    this.dataService.getParentNodes().then((data) => {
      data.map(i => {
        this.nodes.push({
          nodeName: i.doc.nodeName,
          parentID: i.doc.parent,
        });
      });
    });
  }
  onSubmit(tangerineFormCard) {
    console.log(tangerineFormCard.model);
    Object.assign(this.result.variables, tangerineFormCard.model);
    this.save(this.result.variables)
  }

  save(datum) {
    console.log("Saving to pouch - datum: " + JSON.stringify(datum))
    this.dataService.createNode(datum);
    this.nodes = []
    this.getNodes();
  }
}
