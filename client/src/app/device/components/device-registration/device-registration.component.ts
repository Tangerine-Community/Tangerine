import { Subject } from 'rxjs';
import { DeviceService } from './../../services/device.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {_TRANSLATE} from "../../../shared/translation-marker"
import { Device } from '../../classes/device.class';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { v4 as UUID } from 'uuid';

@Component({
  selector: 'app-device-registration',
  templateUrl: './device-registration.component.html',
  styleUrls: ['./device-registration.component.css']
})
export class DeviceRegistrationComponent implements OnInit {

  @ViewChild('container', {static: true}) container: ElementRef
  done$:Subject<any> = new Subject()

  constructor(
    private deviceService: DeviceService,
    private appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.gatherInfo()
  }

  gatherInfo (message = '') {
    this.container.nativeElement.innerHTML = `
      ${message ? `<h2 style="text-align: center; color: red; padding-top: 1em;">${message}</h2>` : ''}
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
            <h2>${_TRANSLATE(`Let's get your device set up.`)}</h2>
          </tangy-box>
          <tangy-radio-buttons label="${_TRANSLATE(`Do you have a Device QR code to scan?`)}" name="has_qr">
            <option value="yes" label="yes">${_TRANSLATE(`yes`)}</option>
            <option value="no" label="no">${_TRANSLATE(`no`)}</option>
          </tangy-radio-buttons>

          <tangy-box name="prompt2" show-if="getValue('has_qr').includes('yes')">
            <h2>${_TRANSLATE(`Great! Use this QR scanner below to scan the code in.`)})</h2>
          </tangy-box>
          <tangy-qr name="qr" show-if="getValue('has_qr').includes('yes')" hide-output error-text="${_TRANSLATE(`Invalid format detected. Try again.`)}" valid-if="
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

          <tangy-radio-buttons label="${_TRANSLATE(`Do you have a Device ID and Token?`)}"
            name="has_device_and_token"
            show-if="getValue('has_qr').includes('no')">
            <option value="yes" label="yes">${_TRANSLATE(`yes`)}</option>
            <option value="no" label="no">${_TRANSLATE(`no`)}</option>
          </tangy-radio-buttons>

          <tangy-box name="prompt3" show-if="getValue('has_device_and_token').includes('yes')">
            <h2>${_TRANSLATE(`Enter the Device ID and Token below.`)}</h2>
          </tangy-box>
          <tangy-input name="device_id" label="Device ID" show-if="getValue('has_device_and_token').includes('yes')"></tangy-input>
          <tangy-input name="device_token" label="Token" show-if="getValue('has_device_and_token').includes('yes')"></tangy-input>

          <tangy-location name="device_location" label="Location" show-if="getValue('has_device_and_token').includes('no')"></tangy-location>

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
        let deviceLocation = event.target.inputs.find(input => input.name == 'device_location').value
        if (deviceId && deviceToken) {
          this.confirmRegistration(deviceId, deviceToken)
        } else if (deviceLocation) {
          this.registerOpenDevice(deviceLocation)
        }
      })
    deviceRegistrationFormEl.newResponse()
  }

  async confirmRegistration(deviceId, deviceToken) {
    let device:Device
    const isSandbox = window.location.hostname === 'localhost' ? true : false
    try {
      device = await this.deviceService.getRemoteDeviceInfo(deviceId, deviceToken, isSandbox)
    } catch (error) {
      if (typeof error !== 'undefined') {
        if (typeof error.error !== 'undefined' && typeof error.error.error !== 'undefined') {
          // TODO: do something with the errorDetails object, which has the groupId that was passed in.
          this.gatherInfo(error.error.error)
        } else if ((typeof error.message !== 'undefined') && (error.message.includes('Http failure response'))) {
          const errorMessage = error.message.slice(0, 50) + '...'
          this.gatherInfo(_TRANSLATE('Something went wrong; you may not have Internet access.') + ` <br/>Error:  ${errorMessage}`)
        } else {
          this.gatherInfo(_TRANSLATE('Something went wrong, please try again.') + ` Error:  ${error.message}`)
        }
      } else {
        this.gatherInfo(_TRANSLATE('Something went wrong, please try again.'))
      }
    }
    this.container.nativeElement.innerHTML = `
      <tangy-form id="confirm-registration">
        <tangy-form-item id="confirm-registration">
          <h2>${_TRANSLATE(`Success!`)}</h2>
          <h2>${_TRANSLATE(`Before continuing, let's review this info to make sure you registered with the right device info.`)}</h2>
          <tangy-input name="device_id" label="${_TRANSLATE(`Device ID`)}" value="${device._id}" disabled></tangy-input>
          <tangy-input name="device_token" label="Token" value="${device.token}" hidden></tangy-input>
          <tangy-location name="device_location" label="${_TRANSLATE(`Location`)}" value='${JSON.stringify(device.assignedLocation.value)}' show-levels="${device.assignedLocation.showLevels.join(',')}"} disabled></tangy-location>
          <tangy-radio-buttons name="confirmation" label="${_TRANSLATE(`Does the above info look like the right device info?`)}" required>
            <option value="yes" label="yes">${_TRANSLATE(`yes`)}</option>
            <option value="no" label="no">${_TRANSLATE(`no`)}</option>
          </tangy-radio-buttons>
        </tangy-form-item>
      </tangy-form>

    `
    const confirmRegistrationFormEl = this.container
      .nativeElement
      .querySelector('tangy-form')
    confirmRegistrationFormEl
      .addEventListener('submit', async (event) => {
        if (event.target.getValue('confirmation') && event.target.getValue('confirmation').includes('yes')) {
          this.done$.next(device)
        } else {
          this.gatherInfo(_TRANSLATE(`Let's try again.`))
        }
      })
    confirmRegistrationFormEl.newResponse()
  }

  async registerOpenDevice(location) {
    let device:Device
    const isSandbox = window.location.hostname === 'localhost' ? true : false
    try {
      const appConfig = await this.appConfigService.getAppConfig();
      device = await this.deviceService.registerOpenDevice(appConfig.uploadToken, location, isSandbox)
    } catch (error) {
      if (typeof error !== 'undefined') {
        if (typeof error.error !== 'undefined' && typeof error.error.error !== 'undefined') {
          // TODO: do something with the errorDetails object, which has the groupId that was passed in.
          this.gatherInfo(error.error.error)
        } else if ((typeof error.message !== 'undefined') && (error.message.includes('Http failure response'))) {
          const errorMessage = error.message.slice(0, 50) + '...'
          this.gatherInfo(_TRANSLATE('Something went wrong; you may not have Internet access.') + ` <br/>Error:  ${errorMessage}`)
        } else {
          this.gatherInfo(_TRANSLATE('Something went wrong, please try again.') + ` Error:  ${error.message}`)
        }
      } else {
        this.gatherInfo(_TRANSLATE('Something went wrong, please try again.'))
      }
    }
        this.container.nativeElement.innerHTML = `
      <tangy-form id="confirm-registration">
        <tangy-form-item id="confirm-registration">
          <h2>${_TRANSLATE(`Success!`)}</h2>
          <h2>${_TRANSLATE(`Before continuing, let's review this info to make sure you registered with the right device info.`)}</h2>
          <tangy-input name="device_id" label="${_TRANSLATE(`Device ID`)}" value="${device._id}" disabled></tangy-input>
          <tangy-input name="device_token" label="Token" value="${device.token}" hidden></tangy-input>
          <tangy-location name="device_location" label="${_TRANSLATE(`Location`)}" value='${JSON.stringify(device.assignedLocation.value)}' show-levels="${device.assignedLocation.showLevels.join(',')}"} disabled></tangy-location>
          <tangy-radio-buttons name="confirmation" label="${_TRANSLATE(`Does the above info look like the right device info?`)}" required>
            <option value="yes" label="yes">${_TRANSLATE(`yes`)}</option>
            <option value="no" label="no">${_TRANSLATE(`no`)}</option>
          </tangy-radio-buttons>
        </tangy-form-item>
      </tangy-form>

    `
    const confirmRegistrationFormEl = this.container
      .nativeElement
      .querySelector('tangy-form')
    confirmRegistrationFormEl
      .addEventListener('submit', async (event) => {
        if (event.target.getValue('confirmation') && event.target.getValue('confirmation').includes('yes')) {
          this.done$.next(device)
        } else {
          this.gatherInfo(_TRANSLATE(`Let's try again.`))
        }
      })
    confirmRegistrationFormEl.newResponse()
  }

}
