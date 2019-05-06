import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { AppConfigService } from "../shared/_services/app-config.service";
import { TangyLoadingComponent } from './_components/tangy-loading/tangy-loading.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [AppConfigService],
  exports: [TranslateModule, MatSnackBarModule, TangyLoadingComponent],
  declarations: [TangyLoadingComponent]
})
export class SharedModule { }
