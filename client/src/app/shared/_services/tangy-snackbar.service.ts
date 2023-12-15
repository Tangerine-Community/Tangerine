import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { _TRANSLATE } from './../translation-marker';
import { AppConfigService } from './app-config.service';  
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { Direction } from '@angular/cdk/bidi';

@Injectable()
export class TangySnackbarService {

  constructor(
    private snackbar: MatSnackBar,
    private appConfigService: AppConfigService
   ) { }
   public showText(text: string, duration = 2000) {
    let config = new MatSnackBarConfig();
    config.direction = (this.appConfigService.config?.languageDirection || 'ltr') as Direction;
    config.duration = duration;
    this.snackbar.open(text, _TRANSLATE('Close'), config);
   }
}
