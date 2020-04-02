import { TestBed, inject } from '@angular/core/testing';

import { AppModule } from '../../app.module'

import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule, JsonPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { SharedModule } from '../../shared/shared.module';
import { CaseManagementService } from '../_services/case-management.service';
import { CaseManagementRoutingModule } from '../case-management-routing.module';
import { FormListComponent } from '../form-list/form-list.component';
import { SchoolsVisitedComponent } from '../schools-visited/schools-visited.component';
import { CaseDetailsComponent } from '../case-details/case-details.component';
import { ObservationsByLocationComponent } from '../observations-by-location/observations-by-location.component';

// App module imports
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpClientLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/', '.json');
}
import { CaseManagementModule } from '../case-management.module';

describe('CaseManagementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
//        RouterModule,
//        AuthModule,
//        HttpClientModule,
        CaseManagementModule,
        SharedModule
      ]
    });
    localStorage.setItem('currentUser', 'test-user')
  });

  it('should be created', inject([CaseManagementService], (service: CaseManagementService) => {
    expect(service).toBeTruthy();
  }));
});