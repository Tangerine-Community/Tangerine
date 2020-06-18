import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';

@Directive({
  selector: '[appHasSomePermissions]'
})
export class HasSomePermissionsDirective implements OnInit {
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
  async ngOnInit() {
    const isPermitted = await this.authenticationService.doesUserHaveSomePermissions(this._groupId, this._permissions);
    if (isPermitted) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

}
