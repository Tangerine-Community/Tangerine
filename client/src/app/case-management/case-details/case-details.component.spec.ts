import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseDetailsComponent } from './case-details.component';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CaseManagementModule } from '../case-management.module';
import { AppRoutingModule } from 'src/app/app-routing.module';
export function HttpClientLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/', '.json');
}

describe('CaseDetailsComponent', () => {
  let component: CaseDetailsComponent;
  let fixture: ComponentFixture<CaseDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ 
        CaseManagementModule,
        AppRoutingModule
      ]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
