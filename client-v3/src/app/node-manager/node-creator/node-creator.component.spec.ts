import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {  ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NodeCreatorComponent } from './node-creator.component';
import { MdButtonModule, MdInputModule, MdGridListModule,
  MdListModule, MdCardModule, MdSelectModule, MdSlideToggleModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('NodeCreatorComponent', () => {
  let component: NodeCreatorComponent;
  let fixture: ComponentFixture<NodeCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeCreatorComponent ],
      imports: [ ReactiveFormsModule, FormsModule, MdButtonModule, MdInputModule, MdGridListModule,
        MdListModule, MdCardModule, MdSelectModule, MdSlideToggleModule, BrowserAnimationsModule]
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
