import { Component, OnInit, ViewChild } from '@angular/core';
import { LocationFormControlTypesService } from './../location-form-control-types.service';
import { LocationParentNodesService } from '../location-parent-nodes.service';
import { StepState } from '@covalent/core';
import { DataService } from './../../core/data-service.service';
@Component({
  selector: 'app-node-creator',
  templateUrl: './node-creator.component.html',
  styleUrls: ['./node-creator.component.css'],
  providers: [LocationFormControlTypesService, LocationParentNodesService, DataService],
})
export class NodeCreatorComponent implements OnInit {
  formElements = [];
  nodeElements: any = { metadata: [] };
  formValue: any = {};
  form: any = { metadata: {} };
  parentNodes = [];
  controlTypes = [];
  selectedParentNode: any;

  stateStep1: StepState = StepState.Required;
  stateStep3: StepState = StepState.Complete;

  constructor(
    private locationFormControlTypesService: LocationFormControlTypesService,
    private locationParentNodesService: LocationParentNodesService, private dataService: DataService
  ) { }


  toggleRequiredStep2(): void {
    this.stateStep1 = (this.stateStep1 === StepState.Required ? StepState.None : StepState.Required);
  }

  toggleCompleteStep3(): void {
    this.stateStep3 = (this.stateStep3 === StepState.Complete ? StepState.None : StepState.Complete);
  }
  ngOnInit() {
    this.dataService.getParentNodes().then(data => {
      data.map((items) => {
        this.parentNodes.push({
          uuid: items.doc._id,
          label: items.doc.nodeName
        });
      });
    });
    this.controlTypes = this.locationFormControlTypesService.getControlTypes();
  }

  createMetadata(): void {
    this.nodeElements.metadata.push({
      label: this.form.metadata.metadata,
      metadataType: this.form.metadata.metadataType,
      metadataRequired: this.form.metadata.metadataRequired
    });
    this.form.metadata = {};
  }

  createNode(): void {
    this.nodeElements.nodeName = this.form.nodeName;
    this.nodeElements.parent = this.form.selectedParentNode;
    this.dataService.createNode(this.nodeElements);
  }

}
