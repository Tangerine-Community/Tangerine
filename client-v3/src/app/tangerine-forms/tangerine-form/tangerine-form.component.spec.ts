import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormComponent } from './tangerine-form.component';
import { TangerineFormsModule } from '../tangerine-forms.module';
import { TangerineFormsServiceTestDouble } from '../tangerine-forms-service-test-double';

describe('TangerineFormComponent', () => {
  let component: TangerineFormComponent;
  let fixture: ComponentFixture<TangerineFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TangerineFormsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormComponent);
    component = fixture.componentInstance;
    const tangerineFormsService = new TangerineFormsServiceTestDouble;
    component.form = tangerineFormsService.get('simpleForm');
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display a Tangerine Page', () => {
  });

  it('should submit a Tangerine Page', () => {
  });

  it('should step to the next Tangerine Page', () => {
  });

  it('should step through a tree of sections', () => {
  });

  it('should skip to the next section', () => {
  });

  it('should resume', () => {
  });
});
