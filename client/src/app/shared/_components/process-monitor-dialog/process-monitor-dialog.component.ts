import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { _TRANSLATE } from '../../translation-marker';
import {ProcessMonitorService} from "../../_services/process-monitor.service";
// import { interval } from 'rxjs';
// import { take } from 'rxjs/operators';
import {timer, of, interval} from 'rxjs';
import {finalize, scan, take} from "rxjs/operators";

interface DialogData {
  messages: Array<string>
  cancellable: boolean
  cancelButtonDisplayDelay: number
}

@Component({
  selector: 'app-process-monitor-dialog',
  templateUrl: 'process-monitor-dialog.component.html',
})
export class ProcessMonitorDialogComponent {
  startTime: Date;
  cancelButtonDisplayDelay: number;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public processMonitorService: ProcessMonitorService,
    public dialog: MatDialog
  ) {}

  ngAfterContentInit() {
    this.startTime = new Date()
    this.cancelButtonDisplayDelay = this.data.cancelButtonDisplayDelay
    if (this.data.cancellable === false && this.cancelButtonDisplayDelay && this.cancelButtonDisplayDelay > 0) {
      console.log("Starting countdown for cancel button at " + this.startTime)
      const counter$ = interval(1000); // rxjs creation operator - will fire every second
      const numberOfSeconds = this.cancelButtonDisplayDelay
      // credit: https://stackoverflow.com/a/65552351 
      const sub = counter$.pipe(
        scan((accumulator, _current) =>  accumulator - 1, numberOfSeconds + 1),
        take(numberOfSeconds + 1),
        finalize(() => {
          console.log('The cancel button should appear now.')
          this.data.cancellable = true
        })
      )
      sub.subscribe(next => {
        console.log("Countdown to display Cancel button: " + next)
      });
    }
    
  }

  cancel() {
    const confirmation = confirm(_TRANSLATE('Warning: Interrupting a process may lead to data corruption and data loss. Are you sure you want to continue?'))
    if (confirmation) {
      this.processMonitorService
        .processes
        .forEach(process => this.processMonitorService.stop(process.id))
    }
  }

}
