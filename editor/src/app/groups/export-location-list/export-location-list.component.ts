import { Component, OnInit, Input } from '@angular/core';
import { GroupsService } from '../services/groups.service';
import { ActivatedRoute } from '@angular/router';
import { Loc } from 'tangy-form/util/loc.js';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-export-location-list',
  templateUrl: './export-location-list.component.html',
  styleUrls: ['./export-location-list.component.css']
})
export class ExportLocationListComponent implements OnInit {

  @Input() locationListFileName;

  groupId:string;
  locationEntries = [];
  locationObject = {};
  locationLevels = [];
  coreProperties = ['level', 'label', 'id', 'children', 'parent', 'descendantsCount'];
  isExportingCSV = false;
  isExportingJSON = false;
  constructor(private groupService: GroupsService, private route: ActivatedRoute) { }

  async ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupId')
  }

  async exportAsCSV() {
    this.isExportingCSV = true;
    const data = await this.groupService.getLocationList(this.groupId, this.locationListFileName);
    this.locationLevels = data['locationsLevels'] as [];
    Object.values(data['locations']).forEach(e => {
      this.unwrap(e);
    });
    const worksheet = XLSX.utils.json_to_sheet(this.locationEntries);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'location-list');
    XLSX.writeFile(workbook, 'location-list.xlsx');
    this.resetValues();
  }

  resetValues() {
    this.locationEntries = [];
    this.locationObject = {};
    this.isExportingCSV = false;
  }
  /**
   *
   * @param data  location node containing id:string, level:string, label:string, children:object and any metadata properties
   * The unwrap method is used to create an array of location objects.
   * Each of the objects correspond to the leaf node of the location tree with corresponding properties of the parent
   * It also adds any metadata for each of the location levels
   */
  unwrap(data) {
    this.locationObject = { ...this.locationObject, [`${data.level}_id`]: data.id, [data.level]: data.label };
    Object.keys(data).forEach(e => {
      if (!this.coreProperties.includes(e)) {
        this.locationObject[e] = data[e];
      }
    });
    if (data.children && Object.keys(data.children).length > 0) {
      Object.values(data.children).map(e => this.unwrap(e));
    } else {
      this.locationEntries.push(this.locationObject);
    }
  }

  async exportAsJSON() {
    this.isExportingJSON = true;
    const groupId = this.route.snapshot.paramMap.get('groupId')
    const data = await this.groupService.getLocationList(groupId);
    const jsonData = JSON.stringify(data)
    const fileName = `${groupId}-location-list.json`
    var downloader = document.createElement('a');
    downloader.setAttribute('href', "data:text/json;charset=UTF-8," + encodeURIComponent(jsonData));
    downloader.setAttribute('download', fileName);
    downloader.click();

    this.isExportingJSON = false;
  }
}
