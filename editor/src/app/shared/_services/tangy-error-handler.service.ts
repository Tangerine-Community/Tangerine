import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { _TRANSLATE } from './translation-marker';

@Injectable()
export class TangyErrorHandler {

  constructor(private snackbar: MatSnackBar) { }
  public handleError(error: string, duration = 10000) {
    this.snackbar.open(error, _TRANSLATE('Close'), { duration });
  }
}
