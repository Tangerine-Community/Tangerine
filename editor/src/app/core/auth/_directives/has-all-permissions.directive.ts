import { Directive, Input, AfterViewInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';
@Directive({
  selector: '[appHasAllPermissions]'
})
export class HasAllPermissionsDirective implements AfterViewInit {
  private _groupId;
  private _permissions;
  @Input()
  set appHasAllPermissionsGroup(value: string) {
    this._groupId = value;
  }
  @Input()
  set appHasAllPermissionsPermissions(value: string[]) {
    this._permissions = value;
  }

  constructor(private authenticationService: AuthenticationService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef) { }
  async ngAfterViewInit() {
    const t = await this.authenticationService.doesUserHaveAllPermissions(this._groupId, this._permissions);
    if (t) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
