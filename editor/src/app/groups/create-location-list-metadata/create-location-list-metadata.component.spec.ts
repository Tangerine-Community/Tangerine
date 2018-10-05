import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLocationListMetadataComponent } from './create-location-list-metadata.component';

describe('CreateLocationListMetadataComponent', () => {
  let component: CreateLocationListMetadataComponent;
  let fixture: ComponentFixture<CreateLocationListMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLocationListMetadataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLocationListMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
