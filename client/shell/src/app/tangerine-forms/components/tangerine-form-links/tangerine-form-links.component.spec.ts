import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { TangerineFormLinksComponent } from './tangerine-form-links.component';
import { TangerineFormsModule } from '../../tangerine-forms.module';

describe('TangerineFormLinksComponent', () => {
  let component: TangerineFormLinksComponent;
  let fixture: ComponentFixture<TangerineFormLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TangerineFormsModule, RouterTestingModule  ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
