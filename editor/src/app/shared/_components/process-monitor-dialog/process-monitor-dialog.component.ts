import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { _TRANSLATE } from '../../_services/translation-marker';

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
    public dialog: MatDialog
  ) {}

  cancel() {
    const confirmation = confirm(_TRANSLATE('Warning: Interrupting a process may lead to data corruption and data loss. Are you sure you want to continue?'))
    if (confirmation) {
      this.dialog.closeAll()
    }
  }

}
