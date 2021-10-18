import { CaseDefinitionsService } from './case/services/case-definitions.service';
import { CasesService } from './case/services/cases.service';
import { HttpClient } from '@angular/common/http';
import { TangyFormsInfoService } from './tangy-forms/tangy-forms-info-service';
import { TangyFormService } from './tangy-forms/tangy-form.service';
import { MenuService } from './shared/_services/menu.service';
import {Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from './core/auth/_services/authentication.service';
import { WindowRef } from './core/window-ref.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { UserService } from './core/auth/_services/user.service';
import { AppConfigService } from './shared/_services/app-config.service';
import { _TRANSLATE } from './shared/_services/translation-marker';
import { NgxPermissionsService } from 'ngx-permissions';
import { CaseService } from './case/services/case.service';
import { Get } from 'tangy-form/helpers.js'
import {ProcessMonitorService} from "./shared/_services/process-monitor.service";
import {LoadingUiComponent} from "./core/loading-ui.component";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProcessMonitorDialogComponent } from './shared/_components/process-monitor-dialog/process-monitor-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  loggedIn = false;
  validSession: boolean;
  user_id: string = localStorage.getItem('user_id');
  private childValue: string;
  history: string[] = [];
  titleToUse: string;
  mobileQuery: MediaQueryList;
  window: any;
  menuService: MenuService;
  sessionTimeoutCheckTimerID;
  isConfirmDialogActive = false;
  dialogRef:any

  @ViewChild('snav', {static: true}) snav: MatSidenav;
  @ViewChild('loadingUi', { static: true }) loadingUi: ElementRef<LoadingUiComponent>;
  
  private _mobileQueryListener: () => void;

  constructor(
    private http: HttpClient,
    private windowRef: WindowRef,
    private router: Router,
    private userService: UserService,
    menuService: MenuService,
    private authenticationService: AuthenticationService,
    private tangyFormService: TangyFormService,
    private caseService:CaseService,
    private caseDefinitionsService:CaseDefinitionsService,
    private tangyFormsInfoService:TangyFormsInfoService,
    private casesService:CasesService,
    translate: TranslateService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private appConfigService: AppConfigService,
    private permissionService: NgxPermissionsService,
    private processMonitorService:ProcessMonitorService,
    public dialog: MatDialog
  ) {
    translate.setDefaultLang('translation');
    translate.use('translation');
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQuery.addEventListener('change', (event => this.snav.opened = !event.matches));
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.window = this.windowRef.nativeWindow;
    // Tell tangyFormService which groupId to use.
    tangyFormService.initialize(window.location.pathname.split('/')[2]);
    this.menuService = menuService;
    this.window.T = {
      form: {
        Get: Get
      },
      router,
      http,
      user: userService,
      appConfig: appConfigService,
      tangyFormsInfo: tangyFormsInfoService,
      tangyForms: tangyFormService,
      case: caseService,
      cases: casesService,
      caseDefinition: caseDefinitionsService,
      translate: window['t'],
      process:processMonitorService
    }
  }

  async logout() {
    clearInterval(this.sessionTimeoutCheckTimerID);
    await this.authenticationService.logout();
    this.loggedIn = false;
    this.permissionService.flushPermissions();
    this.user_id = null;
    this.router.navigate(['/login']);
  }

  async ngOnInit() {
    this.snav.opened = true
    this.authenticationService.currentUserLoggedIn$.subscribe(async isLoggedIn => {
      if (isLoggedIn) {
        this.loggedIn = isLoggedIn;
        if(Object.entries(this.permissionService.getPermissions()).length===0){
          const permissions = JSON.parse(localStorage.getItem('permissions'));
          this.permissionService.loadPermissions(permissions.sitewidePermissions);
        }
        this.user_id = localStorage.getItem('user_id');
        this.sessionTimeoutCheck();
        this.sessionTimeoutCheckTimerID =
        setInterval(await this.sessionTimeoutCheck.bind(this), 10 * 60 * 1000); // check every 10 minutes
      } else {
        this.loggedIn = false;
        this.permissionService.flushPermissions();
        this.user_id = null;
        this.router.navigate(['/login']);
      }
    });
    this.window.translation = await this.appConfigService.getTranslations();
    this.processMonitorService.change.subscribe((isDone) => {
      if (this.processMonitorService.processes.length === 0) {
        this.dialog.closeAll()
      } else {
        this.dialog.closeAll()
        this.dialogRef = this.dialog.open(ProcessMonitorDialogComponent, {
          data: {
            messages: this.processMonitorService.processes.map(process => process.description).reverse()
          }
        })
      }
    })
    let appStartProcess = this.processMonitorService.start('init', "App starting...")
    setTimeout(() => this.processMonitorService.stop(appStartProcess.id), 1000)
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  async sessionTimeoutCheck() {
    const token = localStorage.getItem('token');
    const claims = JSON.parse(atob(token.split('.')[1]));
    const expiryTimeInMs = claims['exp'] * 1000;
    const minutesBeforeExpiry = expiryTimeInMs - (15 * 60 * 1000); // warn 15 minutes before expiry of token
    if (Date.now() >= minutesBeforeExpiry && !this.isConfirmDialogActive) {
      this.isConfirmDialogActive = true;
      const extendSession = confirm(_TRANSLATE('You are about to be logged out from Tangerine. Should we extend your session?'));
      if (extendSession) {
        await this.authenticationService.extendUserSession();
        this.isConfirmDialogActive = false;
      } else {
        await this.logout();
      }
    }
  }

}
