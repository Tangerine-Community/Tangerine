import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-location-list-editor',
  templateUrl: './location-list-editor.component.html',
  styleUrls: ['./location-list-editor.component.css']
})
export class LocationListEditorComponent implements OnInit {

  locationList: any;
  currentPath = []
  currentLocation: any;
  locationChildren = []
  breadcrumbs = []

  constructor() { }

  ngOnInit() {
    this.setLocationList({
      "locationsLevels": ["county", "school"],
      "locations": {
        "county1": {
          "id": "county1",
          "label": "County 1",
          "children": {
            "school1": {
              "id": "school1",
              "label": "School 1"
            },
            "school2": {
              "id": "school2",
              "label": "School 2"
            }
          }
        },
        "county2": {
          "id": "county2",
          "label": "County 2",
          "children": {
            "school3": {
              "id": "school3",
              "label": "School 3"
            },
            "school4": {
              "id": "school4",
              "label": "School 4"
            }
          }
        }
      }
    })
  }

  setLocationList(locationList) {
    this.locationList = locationList
    this.openPath([])
  }

  openPath(path) {
    this.currentPath = path
    let currentChildren = []
    let currentLocation = { id: 'root', label: 'root', children: this.locationList.locations }
    let breadcrumbs = [currentLocation]
    for (let fragment of this.currentPath) {
      currentLocation = currentLocation.children[fragment]
      breadcrumbs.push(currentLocation)
    }
    for (let prop in currentLocation.children) {
      currentChildren.push(currentLocation.children[prop])
    }
    this.locationChildren = currentChildren 
    this.currentLocation = currentLocation
    this.breadcrumbs = breadcrumbs
  }

  onChildClick(id) {
    this.openPath([...this.currentPath, ...id])
  }

  onClickBreadcrumb(id) {
    this.openPath(this.currentPath.slice(0, this.currentPath.indexOf(id)+1))
  }

}
