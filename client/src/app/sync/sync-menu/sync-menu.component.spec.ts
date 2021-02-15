import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncMenuComponent } from './sync-menu.component';

describe('SyncMenuComponent', () => {
  let component: SyncMenuComponent;
  let fixture: ComponentFixture<SyncMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
