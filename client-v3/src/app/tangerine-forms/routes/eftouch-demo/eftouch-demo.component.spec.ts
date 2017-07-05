import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EftouchDemoComponent } from './eftouch-demo.component';

describe('EftouchDemoComponent', () => {
  let component: EftouchDemoComponent;
  let fixture: ComponentFixture<EftouchDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EftouchDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EftouchDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
