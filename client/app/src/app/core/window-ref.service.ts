import { Injectable } from '@angular/core';

function _window(): any {
    // return the global native browser window object
    let foo:any = window
    return foo;
}

@Injectable()
export class WindowRef {
    get nativeWindow(): any {
        return _window();
    }
}
