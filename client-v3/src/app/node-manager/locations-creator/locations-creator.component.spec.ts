import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationsCreatorComponent } from './locations-creator.component';
import {By} from "@angular/platform-browser";
import {NodeValue} from "../node-value";
import {NodeManagerModule} from "../node-manager.module";

describe('LocationsCreatorComponent', () => {
  let component: LocationsCreatorComponent;
  let fixture: ComponentFixture<LocationsCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NodeManagerModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationsCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show one input elements', () => {
    const inputElements = fixture.debugElement.queryAll(By.css('input'));
    expect(inputElements.length).toEqual(1);
  });

});
