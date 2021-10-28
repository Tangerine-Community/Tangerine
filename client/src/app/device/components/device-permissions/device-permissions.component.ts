import { _TRANSLATE } from '../../../shared/translation-marker';
import { Subject } from 'rxjs';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-device-permissions',
  templateUrl: './device-permissions.component.html',
  styleUrls: ['./device-permissions.component.css']
})
export class DevicePermissionsComponent implements OnInit {

  @ViewChild('container', {static: true}) container: ElementRef
  done$:Subject<string> = new Subject<string>()

  constructor(
  ) { }


  async ngOnInit() {
    this.container.nativeElement.innerHTML = `
      <tangy-form id="device-permissions">
        <tangy-form-item 
          title="Device Permissions"
          id="device-permissions"
          on-open="
          (async () => {
            var sleep = function(delay) { return new Promise((resolve, reject) => setTimeout(resolve, delay))}
            // Notifications API.
            while((await Notification.requestPermission()) === 'denied') {
              // Do nothing.
              await sleep(1*1000)
            }
            inputs.notifications_permission.value = true
            // Camera and Microphone API.
            while ((await navigator.permissions.query({name:'camera'})).state !== 'granted') {
              navigator.getUserMedia(
                {
                   video: true,
                   audio: false
                },
                function() { },
                function() { }
              )
              await sleep(1*1000)
            }
            inputs.camera_permission.value = true
            // Geolocation API.
            while ((await navigator.permissions.query({name:'geolocation'})).state !== 'granted') {
              try {
                navigator.geolocation.getCurrentPosition()
              } catch (e) {
                // Do nothing.
              }
              await sleep(1*1000)
            }
            inputs.geolocation_permission.value = true
            // Persistent Storage API.
            while (!await navigator.storage.persist()) {
              await sleep(1*1000)
            }
            inputs.persistent_storage_permission.value = true
 
          })()

          "
        >
          <tangy-gate required name="notifications_permission" inProgress="Authorize notifications." success="Notifications authorized."></tangy-gate><br>
          <tangy-gate required name="camera_permission" inProgress="Authorize camera." success="Camera authorized."></tangy-gate><br>
          <tangy-gate required name="geolocation_permission" inProgress="Authorize geolocation." success="Geolocation authorized."></tangy-gate><br>
          <tangy-gate required name="persistent_storage_permission" inProgress="Authorize peristent storage." success="Persistent storage authorized."></tangy-gate>
        </tangy-form-item>
      </tangy-form>
    `
    const languageSelectFormEl = this.container
      .nativeElement
      .querySelector('tangy-form')
    languageSelectFormEl
      .addEventListener('submit', async (event) => {
        const permissions = event.target.getValue('permissions')
        this.done$.next(permissions)
      })
    languageSelectFormEl.newResponse()
  }


}
