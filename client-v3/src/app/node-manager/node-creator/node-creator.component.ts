import { Component, OnInit, ViewChild } from '@angular/core';
import { LocationFormControlTypesService } from './../location-form-control-types.service';
import { DataService } from './../../core/data-service.service';
@Component({
  selector: 'app-node-creator',
  templateUrl: './node-creator.component.html',
  styleUrls: ['./node-creator.component.css'],
  providers: [LocationFormControlTypesService, DataService],
})
export class NodeCreatorComponent implements OnInit {
  formElements = [];
  nodeElements: any = { metadata: [] };
  formValue: any = {};
  form: any = { metadata: {} };
  parentNodes = [];
  controlTypes = [];
  selectedParentNode: any;
  isViewOnFirstPage = true;
  isEditingMetaData = false;
  editedMetadataIndex;
  constructor(
    private locationFormControlTypesService: LocationFormControlTypesService,
    private dataService: DataService
  ) { }

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

  switchPages(): void {
    this.isViewOnFirstPage = !this.isViewOnFirstPage;
  }
  createMetadata(): void {
    this.nodeElements.metadata.push({
      label: this.form.metadata.metadata,
      metadataType: this.form.metadata.metadataType,
      metadataRequired: this.form.metadata.metadataRequired || false
    });
    this.clearMetaDataForm();
  }

  createNode(): void {
    this.nodeElements.nodeName = this.form.nodeName;
    this.nodeElements.parent = this.form.selectedParentNode || null;
    this.dataService.createNode(this.nodeElements);
  }

  editMetaData(data, index): void {
    this.editedMetadataIndex = index;
    this.isEditingMetaData = true;
    this.form.metadata.metadata = data.label;
    this.form.metadata.metadataType = data.metadataType;
    this.form.metadata.metadataRequired = data.metadataRequired;
  }
  deleteMetaData(index): void {
    this.nodeElements.metadata.splice(index, 1);
  }

  saveEditedMetaData(): void {
    this.isEditingMetaData = false;
    this.nodeElements.metadata[this.editedMetadataIndex] = {
      label: this.form.metadata.metadata,
      metadataType: this.form.metadata.metadataType,
      metadataRequired: this.form.metadata.metadataRequired || false
    };
    this.clearMetaDataForm();
  }

  clearMetaDataForm(): void {
    this.form.metadata = {};
  }
}
