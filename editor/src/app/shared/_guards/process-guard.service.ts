import {Injectable} from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import {Observable} from "rxjs";
import {ProcessMonitorService} from "../_services/process-monitor.service";
import {TangyFormsPlayerComponent} from "../../tangy-forms/tangy-forms-player/tangy-forms-player.component";

@Injectable()
export class ProcessGuard  {
  constructor(
    private processMonitorService:ProcessMonitorService
  ) { }

  canDeactivate(component: TangyFormsPlayerComponent,
                currentRoute: ActivatedRouteSnapshot,
                currentState: RouterStateSnapshot,
                nextState?: RouterStateSnapshot): Observable<boolean>|Promise<boolean>|boolean {
    // If no processes being busy
    if (this.processMonitorService.processes.length > 0) {
      return false;
    } else {
      return true;
    }

  }

}