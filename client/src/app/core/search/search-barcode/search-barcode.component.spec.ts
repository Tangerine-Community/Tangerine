import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBarcodeComponent } from './search-barcode.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'src/app/shared/shared.module';


class MockAppConfigService {
  async getAppConfig() {
    return {
      barcodeSearchMapFunction: 'if ((JSON.parse(data)).foo) { return (JSON.parse(data)).foo } else { throw "Incorrect format"} '
    }
  }
}

describe('SearchBarcodeComponent', () => {
  let component: SearchBarcodeComponent;
  let fixture: ComponentFixture<SearchBarcodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: AppConfigService,
          useClass: MockAppConfigService 
        }
      ],
      declarations: [ SearchBarcodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBarcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start scan', () => {
    component.startScanning()
    fixture.detectChanges();
    expect(component.state).toBe('STATE_SCANNING')
  })

  it('should cancel', (done) => {
    component.startScanning()
    fixture.detectChanges()
    component.cancel.addListener('cancel', event => {
      expect(component.state).toBe('STATE_READY')
      done()
    })
    setTimeout(() => {
      fixture.nativeElement.querySelector('tangy-qr').stopScanning()
    }, 300)
  })

  it('should scan and parse successfully', (done) => {
    fixture.nativeElement.querySelector('tangy-qr').value = '{"foo": "bar"}'
    component.change.addListener('change', event => {
      expect(component.value).toBe('bar')
      done()
    })
    setTimeout(() => {
      fixture.nativeElement.querySelector('tangy-qr').dispatchEvent(new Event('change'))
    }, 300)
  });

  it('should scan and parse unsuccessfully', (done) => {
    fixture.nativeElement.querySelector('tangy-qr').value = '{"differentFormat": "bar"}'
    component.error.addListener('error', event => {
      expect(component.state).toEqual('STATE_ERROR')
      done()
    })
    setTimeout(() => {
      fixture.nativeElement.querySelector('tangy-qr').dispatchEvent(new Event('change'))
    }, 300)
  });


});
