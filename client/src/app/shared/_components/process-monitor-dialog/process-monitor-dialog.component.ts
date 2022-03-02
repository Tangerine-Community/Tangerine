import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { _TRANSLATE } from '../../translation-marker';
import {ProcessMonitorService} from "../../_services/process-monitor.service";

interface DialogData {
  messages: Array<string>
}

@Component({
  selector: 'app-process-monitor-dialog',
  templateUrl: 'process-monitor-dialog.component.html',
})
export class ProcessMonitorDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public processMonitorService: ProcessMonitorService,
    public dialog: MatDialog
  ) {}

  cancel() {
    const confirmation = confirm(_TRANSLATE('Warning: Interrupting a process may lead to data corruption and data loss. Are you sure you want to continue?'))
    if (confirmation) {
      this.processMonitorService
        .processes
        .forEach(process => this.processMonitorService.stop(process.id))
    }
  }

}
