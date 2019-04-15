import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportLocationListComponent } from './import-location-list.component';

describe('ImportLocationListComponent', () => {
  let component: ImportLocationListComponent;
  let fixture: ComponentFixture<ImportLocationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportLocationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportLocationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
