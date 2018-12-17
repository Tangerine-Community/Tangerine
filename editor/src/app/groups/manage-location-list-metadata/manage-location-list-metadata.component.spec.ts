import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageLocationListMetadataComponent } from './manage-location-list-metadata.component';

describe('ManageLocationListMetadataComponent', () => {
  let component: ManageLocationListMetadataComponent;
  let fixture: ComponentFixture<ManageLocationListMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageLocationListMetadataComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageLocationListMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
