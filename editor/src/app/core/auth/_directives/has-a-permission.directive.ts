import { Directive, Input, TemplateRef, ViewContainerRef, AfterViewInit } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';

@Directive({
  selector: '[appHasAPermission]'
})
export class HasAPermissionDirective  implements AfterViewInit {
  private _groupId;
  private _permission;
  @Input()
  set appHasAPermissionGroup(value: string) {
    this._groupId = value;
  }
  @Input()
  set appHasAPermissionPermission(value: string[]) {
    this._permission = value;
  }

  constructor(private authenticationService: AuthenticationService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef) { }
  async ngAfterViewInit() {
    const isPermitted = await this.authenticationService.doesUserHaveAPermission(this._groupId, this._permission);
    if (isPermitted) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

}
