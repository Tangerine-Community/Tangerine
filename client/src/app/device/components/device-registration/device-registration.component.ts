import { Subject } from 'rxjs';
import { DeviceService } from './../../services/device.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {_TRANSLATE} from "../../../shared/translation-marker"
import { Device } from '../../classes/device.class';

@Component({
  selector: 'app-device-registration',
  templateUrl: './device-registration.component.html',
  styleUrls: ['./device-registration.component.css']
})
export class DeviceRegistrationComponent implements OnInit {

  @ViewChild('container') container: ElementRef
  done$ = new Subject()

  constructor(
    private deviceService:DeviceService
  ) { }

  ngOnInit() {
    this.gatherInfo()
  }

  gatherInfo (message = '') {
    this.container.nativeElement.innerHTML = `
      ${message ? `<h2 style="align:center">${message}</h2>` : ''}
      <tangy-form id="device-registration">
        <tangy-form-item id="device-registration" on-change="
            if (getValue('qr')) {
              try {
                const data = JSON.parse(getValue('qr'))
                if (data.id && data.token) {
                  inputs.device_id.value = data.id
                  inputs.device_token.value = data.token
                }
              } catch(e) {
                // Do nothing.
              }
            }
          ">
      
          <tangy-box name="prompt1">
            <h2>Let's get your device set up.</h2>
          </tangy-box>
          <tangy-radio-buttons label="Do you have a Device QR code to scan?" name="has_qr">
            <option value="yes" label="yes">yes</option>
            <option value="no" label="no">no</option>
          </tangy-radio-buttons>
      
          <tangy-box name="prompt2" show-if="getValue('has_qr').includes('yes')">
            <h2>Great! Use this QR scanner below to scan the code in.</h2>
          </tangy-box>   
          <tangy-qr name="qr" show-if="getValue('has_qr').includes('yes')" hide-output error-text="Invalid format detected. Try again." valid-if="
            let isValid
            try {
              const data = JSON.parse(getValue('qr'))
              if (data.id && data.token) {
                isValid = true
              } else {
                isValid = false
              }
            } catch(e) {
              isValid = false
            }
            // Using return is not valid here, but just putting the idValid variable on the last line works. Eval is weird.
            isValid
          "></tangy-qr>
      
          <tangy-box name="prompt3" show-if="getValue('has_qr').includes('no')">
            <h2>That's ok. Enter the device ID and token below.</h2>
          </tangy-box>   
          <tangy-input name="device_id" label="Device ID" show-if="getValue('has_qr').includes('no')"></tangy-input>
          <tangy-input name="device_token" label="Token" show-if="getValue('has_qr').includes('no')"></tangy-input>
      
        </tangy-form-item>
      </tangy-form> 
    `
    const deviceRegistrationFormEl = this.container
      .nativeElement
      .querySelector('tangy-form')
    deviceRegistrationFormEl
      .addEventListener('submit', async (event) => {
        let deviceId = event.target.getValue('device_id')
        let deviceToken = event.target.getValue('device_token')
        this.confirmRegistration(deviceId, deviceToken)
      })
    deviceRegistrationFormEl.newResponse()
  }

  async confirmRegistration(deviceId, deviceToken) {
    let device:Device
    try {
      device = await this.deviceService.register(deviceId, deviceToken)
    } catch (error) {
      this.gatherInfo('Something went wrong, try again.')
    }
    this.container.nativeElement.innerHTML = `
      <tangy-form id="confirm-registration">
        <tangy-form-item id="confirm-registration">
          <h2>Success!</h2>
          <h2>Before continuing, let's review this info to make sure you registered with the right device info.</h2>
          <tangy-input name="device_id" label="Device ID" value="${device._id}" disabled></tangy-input>
          <tangy-input name="device_token" label="Token" value="${device.token}" hidden></tangy-input>
          <tangy-location name="device_location" label="Location" value='${JSON.stringify(device.assignedLocation.value)}' show-levels="${device.assignedLocation.showLevels.join(',')}"} disabled></tangy-location>
          <tangy-radio-buttons name="confirmation" label="Does the above info look like the right device info?" required>
            <option value="yes" label="yes">yes</option>
            <option value="no" label="no">no</option> 
          </tangy-radio-buttons>
        </tangy-form-item>
      </tangy-form>

    `
    const confirmRegistrationFormEl = this.container
      .nativeElement
      .querySelector('tangy-form')
    confirmRegistrationFormEl
      .addEventListener('submit', async (event) => {
        if (event.target.getValue('confirmation')) {
          this.done$.next(true)
        } else {
          this.gatherInfo("Let's try again.")
        }
      })
    confirmRegistrationFormEl.newResponse()
  }


}
