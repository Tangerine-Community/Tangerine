import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeCreatorComponent } from './node-creator.component';

describe('NodeCreatorComponent', () => {
  let component: NodeCreatorComponent;
  let fixture: ComponentFixture<NodeCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
