import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyFormComponent } from './copy-form.component';

describe('CopyFormComponent', () => {
  let component: CopyFormComponent;
  let fixture: ComponentFixture<CopyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
