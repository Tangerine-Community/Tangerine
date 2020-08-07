import { Component, OnInit } from '@angular/core';
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
  locationEntries = [];
  locationObject = {};
  nextLevelProcessed = '';
  locationLevels = [];
  coreProperties = ['level', 'label', 'id', 'children', 'parent', 'descendantsCount'];
  constructor(private groupService: GroupsService, private route: ActivatedRoute) { }

  async ngOnInit() {
  }
  async export() {
    const data = await this.groupService.getLocationList(this.route.snapshot.paramMap.get('groupId'));
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
    this.nextLevelProcessed = '';
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
}
