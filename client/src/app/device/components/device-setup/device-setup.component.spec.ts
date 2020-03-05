import { DeviceService } from './../../services/device.service';
import { LanguagesService } from './../../../shared/_services/languages.service';
import { DeviceModule } from './../../device.module';
import { SettingsModule } from './../../../core/settings/settings.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceSetupComponent } from './device-setup.component';
import { Device } from '../../classes/device.class';

/*
const MOCK_DEVICE_ID = 'MOCK_DEVICE_ID'
const MOCK_DEVICE_TOKEN = 'MOCK_DEVICE_TOKEN'
const MOCK_DEVICE_LOCATION = {
  city: 'portland',
  state: 'oregon'
}

class MockDeviceService {
  async register(id, token) {
    return <Device>{
      _id: id,
      token: token,
      location: MOCK_DEVICE_LOCATION
    }
  }
}

describe('DeviceSetupComponent', () => {
  let component: DeviceSetupComponent;
  let fixture: ComponentFixture<DeviceSetupComponent>;
  let languagesService: LanguagesService

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DeviceModule],
      providers: [
        {
          provide: DeviceService,
          useClass: MockDeviceService
        }
      ],
      declarations: [  ]
    })
    .compileComponents();
    languagesService = TestBed.get(LanguagesService)
  }));

  beforeEach(async () => {
    await languagesService.uninstall()
    await languagesService.install()
    fixture = TestBed.createComponent(DeviceSetupComponent);
    component = fixture.componentInstance;
    component.testing = true
    fixture.detectChanges();
  });

  afterEach(async () => {
    await languagesService.uninstall()
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should flow', (done) => {
    component.testing = true
    component.ready$.subscribe(async () => {
      fixture.detectChanges();
      // Pick language.
      const formEl = component.stepLanguageSelect.container.nativeElement.querySelector('tangy-form')
      formEl.querySelector('tangy-select').value = 'fr'
      formEl.querySelector('tangy-form-item').next()
      const languageInfo = await languagesService.getCurrentLanguage()
      expect(languageInfo.languageCode).toEqual('fr')
      fixture.detectChanges();
      // Enter device codes.

      // Fail manual entry.

      // Confirm device.

      // First sync.

      // Forward to on device account registration.



    })
  }, 987654321)
});
*/
