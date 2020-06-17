import { Directive, Input, TemplateRef, ViewContainerRef, AfterViewInit } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';

@Directive({
  selector: '[appHasSomePermissions]'
})
export class HasSomePermissionsDirective implements AfterViewInit {
  private _groupId;
  private _permissions;
  @Input()
  set appHasSomePermissionsGroup(value: string) {
    this._groupId = value;
  }
  @Input()
  set appHasSomePermissionsPermissions(value: string[]) {
    this._permissions = value;
  }

  constructor(private authenticationService: AuthenticationService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef) { }
  async ngAfterViewInit() {
    const isPermitted = await this.authenticationService.doesUserHaveSomePermissions(this._groupId, this._permissions);
    if (isPermitted) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

}
