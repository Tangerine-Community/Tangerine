import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupDeployComponent } from './group-deploy.component';

describe('GroupDeployComponent', () => {
  let component: GroupDeployComponent;
  let fixture: ComponentFixture<GroupDeployComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupDeployComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDeployComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
