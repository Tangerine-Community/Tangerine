import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { LoginGuard } from './_guards/login-guard.service';
import { ServerConfigService } from './_services/server-config.service';
import { UnsanitizeHtmlPipe } from './../pipes/unsanitize.pipe';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { AppConfigService } from "../shared/_services/app-config.service";
import { TangyLoadingComponent } from './_components/tangy-loading/tangy-loading.component';
import { BreadcrumbComponent } from './_components/breadcrumb/breadcrumb.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { HasAPermissionDirective } from '../core/auth/_directives/has-a-permission.directive';
import { HasSomePermissionsDirective } from '../core/auth/_directives/has-some-permissions.directive';
import { HasAllPermissionsDirective } from '../core/auth/_directives/has-all-permissions.directive';
import { DynamicTableComponent } from './_components/dynamic-table/dynamic-table.component';
import { MatMenuModule } from '@angular/material/menu';
import {ProcessMonitorService} from "./_services/process-monitor.service";
import {ProcessGuard} from "./_guards/process-guard.service";
import { ProcessMonitorDialogComponent } from './_components/process-monitor-dialog/process-monitor-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatProgressBarModule} from "@angular/material/progress-bar";

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        MatTableModule,
        MatMenuModule,
        MatIconModule,
        MatDialogModule,
        MatButtonModule,
        MatProgressBarModule
    ],
  providers: [
    AppConfigService,
    ServerConfigService,
    LoginGuard,
    ProcessMonitorService,
    ProcessGuard
  ],
  exports: [
    TranslateModule,
    DynamicTableComponent,
    MatSnackBarModule,
    TangyLoadingComponent,
    BreadcrumbComponent,
    UnsanitizeHtmlPipe,
    NgxPermissionsModule,
    HasAPermissionDirective,
    HasSomePermissionsDirective,
    HasAllPermissionsDirective
  ],
  declarations: [
    TangyLoadingComponent,
    UnsanitizeHtmlPipe,
    BreadcrumbComponent,
    HasAPermissionDirective,
    HasSomePermissionsDirective,
    HasAllPermissionsDirective,
    DynamicTableComponent,
    ProcessMonitorDialogComponent
  ]
})
export class SharedModule { }
