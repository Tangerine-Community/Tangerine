import {Component, Inject, OnInit} from '@angular/core';
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import {AppConfigService} from "../../../shared/_services/app-config.service";

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css']
})
export class StudentDetailsComponent implements OnInit {

  constructor(private _bottomSheetRef: MatBottomSheetRef<StudentDetailsComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
              private appConfigService: AppConfigService,) { }

  units: string[] = []
  
  async ngOnInit(): Promise<void> {
    const appConfig = await this.appConfigService.getAppConfig()
    const teachConfiguration = appConfig.teachProperties
    this.units = appConfig.teachProperties?.units
  }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

}
