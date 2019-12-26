import { DeviceModule } from './../../device.module';
import { LanguagesService } from './../../../shared/_services/languages.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceLanguageComponent } from './device-language.component';
/* @TODO
describe('DeviceLanguageComponent', () => {
  let component: DeviceLanguageComponent;
  let fixture: ComponentFixture<DeviceLanguageComponent>;
  let languagesService: LanguagesService

  beforeEach(async( async () => {
   TestBed.configureTestingModule({
      imports: [DeviceModule]
    })
    .compileComponents();
    languagesService = TestBed.get(LanguagesService)
    await languagesService.uninstall()
    await languagesService.install()
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceLanguageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should create set language', async(done) => {
    component.done$.subscribe(async(value) => {
      if (value === true) {
        const languageInfo = await languagesService.getCurrentLanguage()
        expect(languageInfo.languageCode).toEqual('fr')
        done()
      }
    })
    setTimeout(async () => {

      const formEl = component.container.nativeElement.querySelector('tangy-form')
      formEl.querySelector('tangy-select').value = 'fr'
      formEl.querySelector('tangy-form-item').next()
    }, 500)
  })

});
*/
