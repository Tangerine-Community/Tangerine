import { Injectable } from '@angular/core';
import { NativeDateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Platform, PlatformModule } from '@angular/cdk/platform';
import { LanguagesService } from './languages.service';

@Injectable({
  providedIn: 'root'
})
export class TangyDateAdapterService extends NativeDateAdapter {

  constructor(
    private languagesService: LanguagesService
  ) {
    super('en-US', new Platform({}));

    this.languagesService.getCurrentLanguageLocale().then(locale => {
      this.setLocale(locale);
    });
  }

  getFirstDayOfWeek(): number {
    if (this.locale != 'en') {
      return 1; // Monday
    }
    return 0; // Sunday
 }
}