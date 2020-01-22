import { DeviceService } from './../../services/device.service';
import { Subject } from 'rxjs';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-device-password',
  templateUrl: './device-password.component.html',
  styleUrls: ['./device-password.component.css']
})
export class DevicePasswordComponent implements OnInit {

  @ViewChild('container') container: ElementRef
  done$ = new Subject()

  constructor(
    private deviceService:DeviceService
  ) { }

  async ngOnInit() {
    this.container.nativeElement.innerHTML = `
      <tangy-form id="device-password">
        <tangy-form-item id="device-password">
          <div style="text-align: center">
            <h2>Set a password to administer your device.</h2>
          </div>
          <tangy-input inner-label=" " label="Password" type="password" name="password" required>
          </tangy-input>
        </tangy-form-item>
      </tangy-form>
    `
    const languageSelectFormEl = this.container
      .nativeElement
      .querySelector('tangy-form')
    languageSelectFormEl
      .addEventListener('submit', async (event) => {
        const password = event.target.getValue('password')
        this.deviceService.setPassword(password)
        this.done$.next(true)

      })
    languageSelectFormEl.newResponse()
  }


}
