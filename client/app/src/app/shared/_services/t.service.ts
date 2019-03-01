import { Injectable } from '@angular/core';
import { WindowRef } from '../../core/window-ref.service';


@Injectable()
export class TService {

  window:any

  constructor(
    private windowRef: WindowRef
  ) { 
    this.window = this.windowRef.nativeWindow;
  }

  t(fragment) {
    if (!this.window.translation) return fragment
    if (this.window.translation[fragment]) {
      return this.window.translation[fragment]
    } else {
      console.warn(`i18n: Translation not found for "${fragment}"`)
      return fragment
    }
  }
  
  
}
