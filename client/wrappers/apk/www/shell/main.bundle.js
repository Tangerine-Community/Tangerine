webpackJsonp(["main"],{

/***/ "./src/$$_gendir lazy recursive":
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_gendir lazy recursive";

/***/ }),

/***/ "./src/app/app-routing.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppRoutingModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_app_shared_components_redirect_to_default_route_redirect_to_default_route_component__ = __webpack_require__("./src/app/shared/_components/redirect-to-default-route/redirect-to-default-route.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_app_user_profile_create_profile_guard_service__ = __webpack_require__("./src/app/user-profile/create-profile-guard.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__core_auth_guards_login_guard_service__ = __webpack_require__("./src/app/core/auth/_guards/login-guard.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





var routes = [
    { path: '**', redirectTo: '/redirect' },
    { path: 'redirect', component: __WEBPACK_IMPORTED_MODULE_2_app_shared_components_redirect_to_default_route_redirect_to_default_route_component__["a" /* RedirectToDefaultRouteComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_4__core_auth_guards_login_guard_service__["a" /* LoginGuard */], __WEBPACK_IMPORTED_MODULE_3_app_user_profile_create_profile_guard_service__["a" /* CreateProfileGuardService */]] }
];
var AppRoutingModule = (function () {
    function AppRoutingModule() {
    }
    return AppRoutingModule;
}());
AppRoutingModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* NgModule */])({
        imports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */].forRoot(routes, { useHash: true })],
        exports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */]]
    })
], AppRoutingModule);

//# sourceMappingURL=app-routing.module.js.map

/***/ }),

/***/ "./src/app/app.component.css":
/***/ (function(module, exports) {

module.exports = ".home-icon{\n  padding-top: 7px;\n  padding-right: 7px;\n}\n\nmat-toolbar.mat-tangy-custom-toolbar {\n  background: #212a3f;\n}\n"

/***/ }),

/***/ "./src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<mat-toolbar color=\"primary\" class=\"mat-typography mat-tangy-custom-toolbar\">\n  <span class=\"home-icon\">\n    <a class=\"tangy-no-text-decoration tangy-app-name\" routerLink=\"/home\">\n      <app-tangy-svg-logo [tangyLogoStyle]=\"{'height':'45px'}\"></app-tangy-svg-logo>\n    </a>\n  </span>\n\n  <span>\n    <a class=\"tangy-no-text-decoration tangy-app-name\" routerLink=\"home\">Tangerine</a>\n  </span>\n  <span class=\"tangy-spacer\"></span>\n\n  <button *ngIf=\"showNav\" [matMenuTriggerFor]=\"appMenu\" mat-button>\n    <i class=\"material-icons\">account_box</i>\n  </button>\n  <mat-menu #appMenu=\"matMenu\">\n    <button routerLink=\"manage-user-profile\" mat-menu-item>\n      <mat-icon class=\"material-icons menu-tangy-location-list-icon\">create</mat-icon>\n      <span>Manage Profile</span>\n    </button>\n    <button routerLink=\"/home\" mat-menu-item>\n      <mat-icon class=\"material-icons menu-tangy-location-list-icon\">settings</mat-icon>\n      <span>My Settings</span>\n    </button>\n    <button routerLink=\"/sync-records\" mat-menu-item>\n      <mat-icon class=\"material-icons menu-tangy-location-list-icon\">autorenew</mat-icon>\n      <span>Sync</span>\n    </button>\n    <button mat-menu-item (click)=\"updateApp()\" *ngIf=\"showUpdateAppLink\">\n      <mat-icon class=\"material-icons menu-tangy-location-list-icon\">cloud_download</mat-icon>\n      <span>Update App</span>\n    </button>\n    <button mat-menu-item (click)=\"updateApp()\" *ngIf=\"!showUpdateAppLink\">\n      <mat-icon class=\"material-icons menu-tangy-location-list-icon\">cloud_download</mat-icon>\n      <span>Check for Update</span>\n    </button>\n    <button mat-menu-item (click)=\"logout()\">\n      <mat-icon class=\"material-icons menu-tangy-location-list-icon\">exit_to_app</mat-icon>\n      <span>Log Out</span>\n    </button>\n\n  </mat-menu>\n\n</mat-toolbar>\n<div class=\"tangerine-app-content mat-typography\">\n  <router-outlet></router-outlet>\n</div>\n\n<!-- <mat-sidenav-container style=\"margin-top:64px\">\n  <mat-sidenav #sidenav class=\"sidenav mat-typography\">\n    <mat-nav-list>\n      <mat-list-item>\n        <a class=\"tangy-no-text-decoration tangy-foreground-primary\" routerLink=\"forms-list\">Forms List</a>\n      </mat-list-item>\n      <br>\n      <mat-list-item>\n        <a class=\"tangy-no-text-decoration tangy-foreground-primary\" routerLink=\"case-management\">Case Management</a>\n      </mat-list-item>\n      <br>\n      <mat-list-item>\n        <a class=\"tangy-no-text-decoration tangy-foreground-primary\" routerLink=\"sync-records\">Sync Records</a>\n      </mat-list-item>\n    </mat-nav-list>\n  </mat-sidenav>\n  <div class=\"tangerine-app-content mat-typography\">\n    <router-outlet></router-outlet>\n  </div>\n</mat-sidenav-container> -->"

/***/ }),

/***/ "./src/app/app.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__("./node_modules/@angular/http/@angular/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_pouchdb__ = __webpack_require__("./node_modules/pouchdb/lib/index-browser.es.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_Observable__ = __webpack_require__("./node_modules/rxjs/_esm5/Observable.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__core_auth_services_authentication_service__ = __webpack_require__("./src/app/core/auth/_services/authentication.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__core_auth_services_user_service__ = __webpack_require__("./src/app/core/auth/_services/user.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__core_window_ref_service__ = __webpack_require__("./src/app/core/window-ref.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};









var AppComponent = (function () {
    function AppComponent(windowRef, userService, authenticationService, http, router) {
        this.windowRef = windowRef;
        this.userService = userService;
        this.authenticationService = authenticationService;
        this.http = http;
        this.router = router;
        this.title = 'Tangerine Client v3.x.x';
        windowRef.nativeWindow.PouchDB = __WEBPACK_IMPORTED_MODULE_4_pouchdb__;
    }
    AppComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var window, res, getPosition;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        window = this.windowRef.nativeWindow;
                        return [4 /*yield*/, this.http.get('../content/location-list.json').toPromise()];
                    case 1:
                        res = _a.sent();
                        window.locationList = res.json();
                        this.showNav = this.authenticationService.isLoggedIn();
                        this.authenticationService.currentUserLoggedIn$.subscribe(function (isLoggedIn) {
                            _this.showNav = isLoggedIn;
                        });
                        this.isAppUpdateAvailable();
                        this.getGeolocationPosition();
                        getPosition = __WEBPACK_IMPORTED_MODULE_5_rxjs_Observable__["a" /* Observable */].timer(0, 300000);
                        getPosition.subscribe(function () { return _this.getGeolocationPosition(); });
                        return [2 /*return*/];
                }
            });
        });
    };
    AppComponent.prototype.logout = function () {
        this.authenticationService.logout();
        this.router.navigate(['login']);
        location.reload(); // @TODO find a way to load the page contents without reloading
    };
    AppComponent.prototype.isAppUpdateAvailable = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, foundReleaseUuid, storedReleaseUuid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.http.get('../../release-uuid.txt').toPromise()];
                    case 1:
                        response = _a.sent();
                        foundReleaseUuid = (response.text()).replace(/\n|\r/g, '');
                        storedReleaseUuid = localStorage.getItem('release-uuid');
                        this.showUpdateAppLink = foundReleaseUuid === storedReleaseUuid ? false : true;
                        return [2 /*return*/];
                }
            });
        });
    };
    AppComponent.prototype.updateApp = function () {
        var currentPath = window.location.pathname;
        var storedReleaseUuid = localStorage.getItem('release-uuid');
        window.location.href = (currentPath.replace(storedReleaseUuid + "/shell/", ''));
    };
    AppComponent.prototype.getGeolocationPosition = function () {
        var options = {
            enableHighAccuracy: true
        };
        var currentPosition = navigator.geolocation.getCurrentPosition(function (position) {
            localStorage.setItem('currentLatitude', position.coords.latitude.toString());
            localStorage.setItem('currentLongitude', position.coords.longitude.toString());
            localStorage.setItem('currentAccuracy', position.coords.accuracy.toString());
        }, function (err) { }, options);
    };
    return AppComponent;
}());
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_16" /* ViewChild */])(__WEBPACK_IMPORTED_MODULE_2__angular_material__["i" /* MatSidenav */]),
    __metadata("design:type", typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["Z" /* QueryList */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["Z" /* QueryList */]) === "function" && _a || Object)
], AppComponent.prototype, "sidenav", void 0);
AppComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
        selector: 'app-root',
        template: __webpack_require__("./src/app/app.component.html"),
        styles: [__webpack_require__("./src/app/app.component.css")]
    }),
    __metadata("design:paramtypes", [typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_8__core_window_ref_service__["a" /* WindowRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_8__core_window_ref_service__["a" /* WindowRef */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_7__core_auth_services_user_service__["a" /* UserService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_7__core_auth_services_user_service__["a" /* UserService */]) === "function" && _c || Object, typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_6__core_auth_services_authentication_service__["a" /* AuthenticationService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_6__core_auth_services_authentication_service__["a" /* AuthenticationService */]) === "function" && _d || Object, typeof (_e = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Http */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Http */]) === "function" && _e || Object, typeof (_f = typeof __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */]) === "function" && _f || Object])
], AppComponent);

var _a, _b, _c, _d, _e, _f;
//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ "./src/app/app.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shared_shared_module__ = __webpack_require__("./src/app/shared/shared.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_hammerjs__ = __webpack_require__("./node_modules/hammerjs/hammer.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_hammerjs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_hammerjs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_forms__ = __webpack_require__("./node_modules/@angular/forms/@angular/forms.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_http__ = __webpack_require__("./node_modules/@angular/http/@angular/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__angular_platform_browser__ = __webpack_require__("./node_modules/@angular/platform-browser/@angular/platform-browser.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__angular_platform_browser_animations__ = __webpack_require__("./node_modules/@angular/platform-browser/@angular/platform-browser/animations.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_ng2_uuid__ = __webpack_require__("./node_modules/ng2-uuid/index.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__app_routing_module__ = __webpack_require__("./src/app/app-routing.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__app_component__ = __webpack_require__("./src/app/app.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__case_management_case_management_module__ = __webpack_require__("./src/app/case-management/case-management.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__core_auth_auth_module__ = __webpack_require__("./src/app/core/auth/auth.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__core_sync_records_sync_records_module__ = __webpack_require__("./src/app/core/sync-records/sync-records.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__core_window_ref_service__ = __webpack_require__("./src/app/core/window-ref.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__core_location_service__ = __webpack_require__("./src/app/core/location.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__core_update_update_module__ = __webpack_require__("./src/app/core/update/update.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__tangy_forms_tangy_forms_module__ = __webpack_require__("./src/app/tangy-forms/tangy-forms.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__user_profile_user_profile_module__ = __webpack_require__("./src/app/user-profile/user-profile.module.ts");
/* unused harmony reexport AppComponent */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



















// import { CaseManagementModule } from './case-management/case-management.module';

var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_2__angular_core__["M" /* NgModule */])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_10__app_component__["a" /* AppComponent */]
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_6__angular_platform_browser__["a" /* BrowserModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_forms__["c" /* FormsModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_http__["b" /* HttpModule */],
            __WEBPACK_IMPORTED_MODULE_7__angular_platform_browser_animations__["a" /* BrowserAnimationsModule */],
            __WEBPACK_IMPORTED_MODULE_5__angular_material__["b" /* MatButtonModule */], __WEBPACK_IMPORTED_MODULE_5__angular_material__["d" /* MatCheckboxModule */], __WEBPACK_IMPORTED_MODULE_5__angular_material__["e" /* MatInputModule */], __WEBPACK_IMPORTED_MODULE_5__angular_material__["m" /* MatToolbarModule */], __WEBPACK_IMPORTED_MODULE_5__angular_material__["j" /* MatSidenavModule */], __WEBPACK_IMPORTED_MODULE_5__angular_material__["g" /* MatMenuModule */],
            __WEBPACK_IMPORTED_MODULE_8_ng2_uuid__["b" /* UuidModule */],
            __WEBPACK_IMPORTED_MODULE_17__tangy_forms_tangy_forms_module__["a" /* TangyFormsModule */],
            __WEBPACK_IMPORTED_MODULE_12__core_auth_auth_module__["a" /* AuthModule */],
            __WEBPACK_IMPORTED_MODULE_11__case_management_case_management_module__["a" /* CaseManagementModule */],
            __WEBPACK_IMPORTED_MODULE_18__user_profile_user_profile_module__["a" /* UserProfileModule */],
            __WEBPACK_IMPORTED_MODULE_16__core_update_update_module__["a" /* UpdateModule */],
            __WEBPACK_IMPORTED_MODULE_13__core_sync_records_sync_records_module__["a" /* SyncRecordsModule */],
            __WEBPACK_IMPORTED_MODULE_9__app_routing_module__["a" /* AppRoutingModule */],
            __WEBPACK_IMPORTED_MODULE_0__shared_shared_module__["a" /* SharedModule */]
        ],
        providers: [__WEBPACK_IMPORTED_MODULE_14__core_window_ref_service__["a" /* WindowRef */],
            __WEBPACK_IMPORTED_MODULE_15__core_location_service__["a" /* Loc */], { provide: __WEBPACK_IMPORTED_MODULE_5__angular_material__["a" /* MATERIAL_COMPATIBILITY_MODE */], useValue: true }],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_10__app_component__["a" /* AppComponent */]]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ "./src/app/case-management/_services/case-management.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CaseManagementService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_rxjs_add_operator_toPromise__ = __webpack_require__("./node_modules/rxjs/_esm5/add/operator/toPromise.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_rxjs_add_operator_toPromise___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_rxjs_add_operator_toPromise__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_http__ = __webpack_require__("./node_modules/@angular/http/@angular/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_pouchdb__ = __webpack_require__("./node_modules/pouchdb/lib/index-browser.es.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__core_auth_services_authentication_service__ = __webpack_require__("./src/app/core/auth/_services/authentication.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__core_auth_services_user_service__ = __webpack_require__("./src/app/core/auth/_services/user.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__core_location_service__ = __webpack_require__("./src/app/core/location.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};







function _window() {
    return window;
}
var CaseManagementService = (function () {
    function CaseManagementService(authenticationService, loc, userService, http) {
        this.http = http;
        this.loc = loc;
        this.userService = userService;
        this.userDB = new __WEBPACK_IMPORTED_MODULE_3_pouchdb__["default"](authenticationService.getCurrentUserDBPath());
    }
    CaseManagementService.prototype.getMyLocationVisits = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, locationList, userProfile, myLocations, location, locations, visits, locationId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.http.get('../content/location-list.json').toPromise()];
                    case 1:
                        res = _a.sent();
                        locationList = res.json();
                        return [4 /*yield*/, this.userService.getUserProfile()];
                    case 2:
                        userProfile = _a.sent();
                        myLocations = locationList.locations;
                        location = userProfile.items[0].inputs.find(function (input) { return input.name === 'location'; });
                        location.value.forEach(function (levelObject) { return myLocations = myLocations[levelObject.value].children; });
                        locations = [];
                        return [4 /*yield*/, this.getVisitsThisMonthByLocation()];
                    case 3:
                        visits = _a.sent();
                        /**
                         *  Check for ownProperty in myLocations
                         * for ...in  iterate over all enumerable properties of the object
                         * Also enumerates and those the object inherits from its constructor's prototype
                         * You may get unexpected properties from the prototype chain
                         */
                        for (locationId in myLocations) {
                            if (myLocations.hasOwnProperty(locationId)) {
                                locations.push({
                                    location: myLocations[locationId].label,
                                    visits: countUnique(visits, myLocations[locationId]['id'].toString())
                                });
                            }
                        }
                        return [2 /*return*/, locations];
                }
            });
        });
    };
    CaseManagementService.prototype.getFormList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var forms, visits, formList, _i, formList_1, form;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        forms = [];
                        return [4 /*yield*/, this.getResponsesByFormId()];
                    case 1:
                        visits = _a.sent();
                        return [4 /*yield*/, this.http.get('../content/forms.json')
                                .toPromise()
                                .then(function (response) { return response.json(); }).catch(function (data) { return console.error(data); })];
                    case 2:
                        formList = _a.sent();
                        for (_i = 0, formList_1 = formList; _i < formList_1.length; _i++) {
                            form = formList_1[_i];
                            forms.push({
                                title: form['title'],
                                count: countUnique(visits, form['id']),
                                src: form['src'],
                                id: form['id']
                            });
                        }
                        return [2 /*return*/, forms];
                }
            });
        });
    };
    CaseManagementService.prototype.getVisitsThisMonthByLocation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userDB.query('tangy-form/responsesThisMonthByLocationId')];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.rows];
                }
            });
        });
    };
    CaseManagementService.prototype.getResponsesByLocationId = function (locationId) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userDB.query('tangy-form/responsesByLocationId', { key: locationId, include_docs: true })];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.rows];
                }
            });
        });
    };
    CaseManagementService.prototype.getResponsesByFormId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userDB.query('tangy-form/responsesByFormId')];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.rows];
                }
            });
        });
    };
    return CaseManagementService;
}());
CaseManagementService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["C" /* Injectable */])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_4__core_auth_services_authentication_service__["a" /* AuthenticationService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_4__core_auth_services_authentication_service__["a" /* AuthenticationService */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_6__core_location_service__["a" /* Loc */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_6__core_location_service__["a" /* Loc */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_5__core_auth_services_user_service__["a" /* UserService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_5__core_auth_services_user_service__["a" /* UserService */]) === "function" && _c || Object, typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_2__angular_http__["a" /* Http */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__angular_http__["a" /* Http */]) === "function" && _d || Object])
], CaseManagementService);

function countUnique(array, key) {
    var count = 0;
    array.forEach(function (item) {
        count += item.key.toString() === key ? 1 : 0;
    });
    return count;
}
var _a, _b, _c, _d;
//# sourceMappingURL=case-management.service.js.map

/***/ }),

/***/ "./src/app/case-management/case-management-routing.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CaseManagementRoutingModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__core_auth_guards_login_guard_service__ = __webpack_require__("./src/app/core/auth/_guards/login-guard.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__user_profile_create_profile_guard_service__ = __webpack_require__("./src/app/user-profile/create-profile-guard.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__case_management_component__ = __webpack_require__("./src/app/case-management/case-management.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__form_list_form_list_component__ = __webpack_require__("./src/app/case-management/form-list/form-list.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};






var routes = [{
        path: 'case-management',
        component: __WEBPACK_IMPORTED_MODULE_4__case_management_component__["a" /* CaseManagementComponent */],
        canActivate: [__WEBPACK_IMPORTED_MODULE_2__core_auth_guards_login_guard_service__["a" /* LoginGuard */], __WEBPACK_IMPORTED_MODULE_3__user_profile_create_profile_guard_service__["a" /* CreateProfileGuardService */]]
    }, {
        path: 'forms-list',
        component: __WEBPACK_IMPORTED_MODULE_5__form_list_form_list_component__["a" /* FormListComponent */],
        canActivate: [__WEBPACK_IMPORTED_MODULE_2__core_auth_guards_login_guard_service__["a" /* LoginGuard */], __WEBPACK_IMPORTED_MODULE_3__user_profile_create_profile_guard_service__["a" /* CreateProfileGuardService */]]
    }];
var CaseManagementRoutingModule = (function () {
    function CaseManagementRoutingModule() {
    }
    return CaseManagementRoutingModule;
}());
CaseManagementRoutingModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* NgModule */])({
        imports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */].forChild(routes)],
        exports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */]],
        declarations: []
    })
], CaseManagementRoutingModule);

//# sourceMappingURL=case-management-routing.module.js.map

/***/ }),

/***/ "./src/app/case-management/case-management.component.css":
/***/ (function(module, exports) {

module.exports = ".tangy-foreground-primary {\n    font-weight: 700;\n    font-size: 18px;\n    text-transform: capitalize;\n  }\n  \n  .tangy-location-list-icon {\n    color: #f26f10;\n    font-weight: 700;\n    font-size: 20px;\n  }\n  \n  mat-icon {\n    color: #f26f10;\n  }\n  \n  .mat-title {\n    color: #3c5b8d;\n    font-size: 1.75em;\n    font-weight: 400;\n    font-family: Roboto, \"Helvetica Nue\", sans-serif;\n    margin:.75em;\n  }\n  \n  mat-form-field.tangy-half-width {\n    display:inline-block;\n    float:right;\n    position: relative;\n    top: 5px;\n  }\n  \n  mat-list {\n    display:block;\n    width: 100%;\n  }"

/***/ }),

/***/ "./src/app/case-management/case-management.component.html":
/***/ (function(module, exports) {

module.exports = "<mat-tab-group id=\"locations\">\n  <mat-tab label=\"Locations\">\n    <mat-card class=\"tangy-card-content-container\">\n      <div class=\"tangy-full-width\">\n        <div class=\"mat-title tangy-half-width\">\n          My Locations\n        </div>\n        <mat-form-field class=\"tangy-half-width\">\n        <input name=\"locationName\" #search type=\"text\" matInput>\n        <mat-placeholder>\n          Filter Location By Name\n          <span>\n            <i class=\"material-icons mat-14 search-icon\">search</i>\n          </span>\n        </mat-placeholder>\n      </mat-form-field>\n      </div>\n      <br/>\n      <mat-list>\n        <mat-list-item class=\"tangy-location-list\">\n          <span class=\"tangy-foreground-primary\">Locations Not yet Visited This Month</span>\n          <span class=\"tangy-spacer\"></span>\n          <span class=\"tangy-foreground-primary\">Visits</span>\n        </mat-list-item>\n        <mat-list-item class=\"tangy-location-list\" *ngFor=\"let location of notYetVisitedLocations\">\n          <a class=\"tangy-foreground-primary\" routerLink=\"/forms-list\">\n            <i class=\"material-icons mat-18 tangy-location-list-icon\">open_in_new</i>\n          </a>\n          <span>{{location.location}}</span>\n          <span class=\"tangy-spacer\"></span>\n          <span>{{location.visits}}</span>\n        </mat-list-item>\n      </mat-list>\n      <mat-list>\n        <mat-list-item class=\"tangy-location-list\">\n          <span class=\"tangy-foreground-primary\">Locations Already Visited This Month</span>\n          <span class=\"tangy-spacer\"></span>\n          <span class=\"tangy-foreground-primary\">Visits</span>\n        </mat-list-item>\n        <mat-list-item class=\"tangy-location-list\" *ngFor=\"let location of alreadyVistedLocations\">\n          <a class=\"tangy-foreground-primary\" routerLink=\"/forms-list\">\n            <i class=\"material-icons mat-18 tangy-location-list-icon\">open_in_new</i>\n          </a>\n          <span>{{location.location}}</span>\n          <span class=\"tangy-spacer\"></span>\n          <span>{{location.visits}}</span>\n        </mat-list-item>\n      </mat-list>\n    </mat-card>\n  </mat-tab>\n  <!--<mat-tab label=\"Monthly Report\">Content 2</mat-tab>-->\n\n  <!-- <mat-tab label=\"Manage Schools\">Manage My Schools List</mat-tab> -->\n</mat-tab-group>\n  "

/***/ }),

/***/ "./src/app/case-management/case-management.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CaseManagementComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs_Rx__ = __webpack_require__("./node_modules/rxjs/_esm5/Rx.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_case_management_service__ = __webpack_require__("./src/app/case-management/_services/case-management.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_map__ = __webpack_require__("./node_modules/rxjs/_esm5/add/operator/map.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};




var CaseManagementComponent = (function () {
    function CaseManagementComponent(caseManagementService) {
        this.caseManagementService = caseManagementService;
        this.isVisited = true;
    }
    CaseManagementComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.getMyLocations();
                return [2 /*return*/];
            });
        });
    };
    CaseManagementComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        /**
         *The `(res.length < 1 || res.trim())` expression checks if the string entered in the searchbox is a series of whitespace or
         * a non-empty string after removing the whitespace.
         * If the length of the string is <1, no text has been entered and thus cannot be a series of whitespace.
         **/
        __WEBPACK_IMPORTED_MODULE_1_rxjs_Rx__["a" /* Observable */].fromEvent(this.search.nativeElement, 'keyup')
            .debounceTime(500)
            .map(function (val) { return val['target'].value; })
            .distinctUntilChanged()
            .subscribe(function (res) { return (res.length < 1 || res.trim()) && _this.searchLocation(res.trim()); });
    };
    CaseManagementComponent.prototype.getMyLocations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = this;
                        return [4 /*yield*/, this.caseManagementService.getMyLocationVisits()];
                    case 1:
                        _a.result = _b.sent();
                        this.notYetVisitedLocations = this.filterLocationsByVisitStatus(this.result, !this.isVisited);
                        this.alreadyVistedLocations = this.filterLocationsByVisitStatus(this.result, this.isVisited);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        console.error(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CaseManagementComponent.prototype.filterLocationsByVisitStatus = function (data, isVisited) {
        return data.filter(function (item) {
            return (isVisited && item.visits > 0) || (!isVisited && item.visits < 1);
        });
    };
    CaseManagementComponent.prototype.searchLocation = function (locationName) {
        this.notYetVisitedLocations =
            this.filterRecordsBySearchTerm(this.filterLocationsByVisitStatus(this.result, !this.isVisited), locationName);
        this.alreadyVistedLocations =
            this.filterRecordsBySearchTerm(this.filterLocationsByVisitStatus(this.result, this.isVisited), locationName);
    };
    CaseManagementComponent.prototype.filterRecordsBySearchTerm = function (records, filterText) {
        if (Array.isArray(records)) {
            return records.filter(function (data) {
                var location = data.location.toLowerCase();
                return location.includes(filterText.toLowerCase());
            });
        }
        else {
            console.error('Could not load records');
        }
    };
    return CaseManagementComponent;
}());
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_16" /* ViewChild */])('search'),
    __metadata("design:type", typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["v" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["v" /* ElementRef */]) === "function" && _a || Object)
], CaseManagementComponent.prototype, "search", void 0);
CaseManagementComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
        selector: 'app-case-management',
        template: __webpack_require__("./src/app/case-management/case-management.component.html"),
        styles: [__webpack_require__("./src/app/case-management/case-management.component.css")]
    }),
    __metadata("design:paramtypes", [typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2__services_case_management_service__["a" /* CaseManagementService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__services_case_management_service__["a" /* CaseManagementService */]) === "function" && _b || Object])
], CaseManagementComponent);

var _a, _b;
//# sourceMappingURL=case-management.component.js.map

/***/ }),

/***/ "./src/app/case-management/case-management.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CaseManagementModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_cdk_table__ = __webpack_require__("./node_modules/@angular/cdk/esm5/table.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common__ = __webpack_require__("./node_modules/@angular/common/@angular/common.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_forms__ = __webpack_require__("./node_modules/@angular/forms/@angular/forms.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__shared_shared_module__ = __webpack_require__("./src/app/shared/shared.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__services_case_management_service__ = __webpack_require__("./src/app/case-management/_services/case-management.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__case_management_routing_module__ = __webpack_require__("./src/app/case-management/case-management-routing.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__case_management_component__ = __webpack_require__("./src/app/case-management/case-management.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__form_list_form_list_component__ = __webpack_require__("./src/app/case-management/form-list/form-list.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__form_responses_list_form_responses_list_component__ = __webpack_require__("./src/app/case-management/form-responses-list/form-responses-list.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};











var CaseManagementModule = (function () {
    function CaseManagementModule() {
    }
    return CaseManagementModule;
}());
CaseManagementModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_2__angular_core__["M" /* NgModule */])({
        imports: [
            __WEBPACK_IMPORTED_MODULE_1__angular_common__["b" /* CommonModule */],
            __WEBPACK_IMPORTED_MODULE_7__case_management_routing_module__["a" /* CaseManagementRoutingModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_material__["l" /* MatTabsModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_material__["e" /* MatInputModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_forms__["c" /* FormsModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_material__["f" /* MatListModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_material__["c" /* MatCardModule */],
            __WEBPACK_IMPORTED_MODULE_0__angular_cdk_table__["m" /* CdkTableModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_material__["k" /* MatTableModule */],
            __WEBPACK_IMPORTED_MODULE_5__shared_shared_module__["a" /* SharedModule */]
        ],
        declarations: [__WEBPACK_IMPORTED_MODULE_8__case_management_component__["a" /* CaseManagementComponent */], __WEBPACK_IMPORTED_MODULE_9__form_list_form_list_component__["a" /* FormListComponent */], __WEBPACK_IMPORTED_MODULE_10__form_responses_list_form_responses_list_component__["a" /* FormResponsesListComponent */]],
        providers: [__WEBPACK_IMPORTED_MODULE_6__services_case_management_service__["a" /* CaseManagementService */]]
    })
], CaseManagementModule);

//# sourceMappingURL=case-management.module.js.map

/***/ }),

/***/ "./src/app/case-management/form-list/form-list.component.css":
/***/ (function(module, exports) {

module.exports = ".tangy-foreground-primary {\n    font-weight: 700;\n    font-size: 18px;\n    text-transform: capitalize;\n  }\n  \n  .tangy-location-list-icon {\n    color: #f26f10;\n    font-weight: 700;\n    font-size: 20px;\n  }\n  \n  .mat-title {\n    color: #3c5b8d;\n    font-size: 1.75em;\n    font-weight: 400;\n    font-family: Roboto, \"Helvetica Nue\", sans-serif;\n    margin:.75em;\n  }\n  \n  mat-form-field.tangy-half-width {\n    display:inline-block;\n    float:right;\n    position: relative;\n    top: 5px;\n  }\n  \n  mat-list {\n    display:block;\n    width: 100%;\n  }\n  \n  "

/***/ }),

/***/ "./src/app/case-management/form-list/form-list.component.html":
/***/ (function(module, exports) {

module.exports = "<mat-tab-group>\n  <mat-tab label=\"My Forms\">\n    <mat-card class=\"tangy-card-content-container\">\n      <div class=\"tangy-full-width\">\n        <div class=\"mat-title tangy-half-width\">\n          My Forms\n        </div>\n        <mat-form-field class=\"tangy-half-width\">\n          <input name=\"formName\" #search type=\"text\" matInput>\n          <mat-placeholder>\n            Filter Form By Name\n            <span>\n              <i class=\"material-icons mat-14 search-icon\">search</i>\n            </span>\n          </mat-placeholder>\n        </mat-form-field>\n      </div>\n      <mat-list>\n        <mat-list-item class=\"tangy-location-list\">\n          <span class=\"tangy-foreground-primary\">Select Form</span>\n          <span class=\"tangy-spacer\"></span>\n          <span class=\"tangy-foreground-primary\">Count</span>\n        </mat-list-item>\n        <mat-list-item class=\"tangy-location-list\" *ngFor=\"let form of formList; let formIndex=index\">\n          <a class=\"tangy-foreground-primary\" [routerLink]=\"['/tangy-forms-player/']\" [queryParams]={formIndex:formIndex}>\n            <i class=\"material-icons md-24 tangy-location-list-icon\">play_circle_filled</i>\n          </a>\n          <span>{{form.title}}</span>\n          <span class=\"tangy-spacer\"></span>\n          <span>{{form.count}}</span>\n        </mat-list-item>\n      </mat-list>\n\n      <p *ngIf=\"!formList\" class=\"mat-h3\">No Forms Currently Defined</p>\n    </mat-card>\n\n  </mat-tab>\n  <!-- <mat-tab label=\"Monthly Report\">Content 2</mat-tab> -->\n  <mat-tab label=\"Summary\">\n    <br>\n    <mat-card class=\"tangy-card-content-container\">\n      <app-form-responses-list></app-form-responses-list>\n    </mat-card>\n  </mat-tab>\n</mat-tab-group>"

/***/ }),

/***/ "./src/app/case-management/form-list/form-list.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return FormListComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_rxjs_add_operator_map__ = __webpack_require__("./node_modules/rxjs/_esm5/add/operator/map.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_Rx__ = __webpack_require__("./node_modules/rxjs/_esm5/Rx.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__services_case_management_service__ = __webpack_require__("./src/app/case-management/_services/case-management.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};




var FormListComponent = (function () {
    function FormListComponent(caseManagementService) {
        this.caseManagementService = caseManagementService;
    }
    FormListComponent.prototype.ngOnInit = function () {
        this.getFormList();
    };
    FormListComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        /**
         *The `(res.length < 1 || res.trim())` expression checks if the string entered in the searchbox is a series of whitespace or
         * a non-empty string after removing the whitespace.
         * If the length of the string is <1, no text has been entered and thus cannot be a series of whitespace.
         **/
        __WEBPACK_IMPORTED_MODULE_2_rxjs_Rx__["a" /* Observable */].fromEvent(this.search.nativeElement, 'keyup')
            .debounceTime(500)
            .map(function (val) { return val['target'].value.trim(); })
            .distinctUntilChanged()
            .subscribe(function (res) { return _this.searchForm(res.trim()); });
    };
    FormListComponent.prototype.getFormList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = this;
                        return [4 /*yield*/, this.caseManagementService.getFormList()];
                    case 1:
                        _a.formList = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        console.error(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    FormListComponent.prototype.searchForm = function (formName) {
        return __awaiter(this, void 0, void 0, function () {
            var list;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.caseManagementService.getFormList()];
                    case 1:
                        list = _a.sent();
                        this.formList = list.filter(function (data) {
                            var title = data.title.toLowerCase();
                            return title.includes(formName.toLowerCase());
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return FormListComponent;
}());
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["_16" /* ViewChild */])('search'),
    __metadata("design:type", typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_core__["v" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_core__["v" /* ElementRef */]) === "function" && _a || Object)
], FormListComponent.prototype, "search", void 0);
FormListComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["o" /* Component */])({
        selector: 'app-form-list',
        template: __webpack_require__("./src/app/case-management/form-list/form-list.component.html"),
        styles: [__webpack_require__("./src/app/case-management/form-list/form-list.component.css")]
    }),
    __metadata("design:paramtypes", [typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_3__services_case_management_service__["a" /* CaseManagementService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__services_case_management_service__["a" /* CaseManagementService */]) === "function" && _b || Object])
], FormListComponent);

var _a, _b;
//# sourceMappingURL=form-list.component.js.map

/***/ }),

/***/ "./src/app/case-management/form-responses-list/form-responses-list.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/case-management/form-responses-list/form-responses-list.component.html":
/***/ (function(module, exports) {

module.exports = "<mat-table #table [dataSource]=\"dataSource\">\n\n  <!--- Note that these columns can be defined in any order.\n          The actual rendered columns are set as a property on the row definition\" -->\n\n  <!-- Form Name Column -->\n  <ng-container cdkColumnDef=\"formTitle\">\n    <mat-header-cell *cdkHeaderCellDef> Form </mat-header-cell>\n    <mat-cell *cdkCellDef=\"let formResponse\">\n      <app-tangy-tooltip [tangyToolTipText]=\"formResponse.formId\" truncateLength=\"10\"></app-tangy-tooltip>\n    </mat-cell>\n  </ng-container>\n\n  <!-- Date Column -->\n  <ng-container cdkColumnDef=\"startDatetime\">\n    <mat-header-cell *cdkHeaderCellDef> Date Started</mat-header-cell>\n    <mat-cell *cdkCellDef=\"let formResponse\"> {{formResponse.startDatetime| date:'MMM d, y, h:mm a'}} </mat-cell>\n  </ng-container>\n\n  <!-- Class Column -->\n  <ng-container cdkColumnDef=\"class\">\n    <mat-header-cell *cdkHeaderCellDef> Class </mat-header-cell>\n    <mat-cell style=\"text-align:center\" *cdkCellDef=\"let formResponse\"> {{formResponse.class}} </mat-cell>\n  </ng-container>\n\n  <!-- Subject Column -->\n  <ng-container cdkColumnDef=\"subject\">\n    <mat-header-cell *cdkHeaderCellDef> Subject </mat-header-cell>\n    <mat-cell *cdkCellDef=\"let formResponse\"> {{formResponse.subject}} </mat-cell>\n  </ng-container>\n\n  <!-- Stream Column -->\n  <ng-container cdkColumnDef=\"stream\">\n    <mat-header-cell *cdkHeaderCellDef> Stream </mat-header-cell>\n    <mat-cell *cdkCellDef=\"let formResponse\"> {{formResponse.stream}} </mat-cell>\n  </ng-container>\n\n  <!-- Stream Column -->\n  <ng-container cdkColumnDef=\"action\">\n    <mat-header-cell *cdkHeaderCellDef> </mat-header-cell>\n    <mat-cell *cdkCellDef=\"let formResponse\">\n      <i class=\"material-icons md-24\">feedback</i>\n      <a [routerLink]=\"['/tangy-forms-player/']\" [queryParams]=\"{formIndex:formResponse.formIndex, 'responseId':formResponse._id}\">\n        <i class=\"material-icons md-24 \">speaker_notes</i>\n      </a>\n    </mat-cell>\n  </ng-container>\n\n  <mat-header-row *cdkHeaderRowDef=\"displayedColumns \"></mat-header-row>\n  <mat-row *cdkRowDef=\"let row; columns: displayedColumns; \"></mat-row>\n</mat-table>"

/***/ }),

/***/ "./src/app/case-management/form-responses-list/form-responses-list.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return FormResponsesListComponent; });
/* unused harmony export FormResponsesListDataSource */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_rxjs_add_observable_merge__ = __webpack_require__("./node_modules/rxjs/_esm5/add/observable/merge.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs_add_observable_of__ = __webpack_require__("./node_modules/rxjs/_esm5/add/observable/of.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_catch__ = __webpack_require__("./node_modules/rxjs/_esm5/add/operator/catch.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_map__ = __webpack_require__("./node_modules/rxjs/_esm5/add/operator/map.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_startWith__ = __webpack_require__("./node_modules/rxjs/_esm5/add/operator/startWith.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_switchMap__ = __webpack_require__("./node_modules/rxjs/_esm5/add/operator/switchMap.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__angular_cdk_table__ = __webpack_require__("./node_modules/@angular/cdk/esm5/table.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_pouchdb__ = __webpack_require__("./node_modules/pouchdb/lib/index-browser.es.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_rxjs_Rx__ = __webpack_require__("./node_modules/rxjs/_esm5/Rx.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__core_auth_services_user_service__ = __webpack_require__("./src/app/core/auth/_services/user.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__services_case_management_service__ = __webpack_require__("./src/app/case-management/_services/case-management.service.ts");
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};












var FormResponsesListComponent = (function () {
    function FormResponsesListComponent(userService, caseManagementService) {
        this.userService = userService;
        this.caseManagementService = caseManagementService;
        this.displayedColumns = ['formTitle', 'startDatetime', 'class', 'subject', 'stream', 'action'];
        this.initialize();
    }
    FormResponsesListComponent.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.userService.getUserDatabase()];
                    case 1:
                        _a.userDatabase = _c.sent();
                        _b = this;
                        return [4 /*yield*/, this.caseManagementService.getFormList()];
                    case 2:
                        _b.formList = _c.sent();
                        this.dataSource = new FormResponsesListDataSource(this.userDatabase, this.formList);
                        return [2 /*return*/];
                }
            });
        });
    };
    return FormResponsesListComponent;
}());
FormResponsesListComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_7__angular_core__["o" /* Component */])({
        selector: 'app-form-responses-list',
        template: __webpack_require__("./src/app/case-management/form-responses-list/form-responses-list.component.html"),
        styles: [__webpack_require__("./src/app/case-management/form-responses-list/form-responses-list.component.css")]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_10__core_auth_services_user_service__["a" /* UserService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_10__core_auth_services_user_service__["a" /* UserService */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_11__services_case_management_service__["a" /* CaseManagementService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_11__services_case_management_service__["a" /* CaseManagementService */]) === "function" && _b || Object])
], FormResponsesListComponent);

var FormResponsesListDataSource = (function (_super) {
    __extends(FormResponsesListDataSource, _super);
    function FormResponsesListDataSource(userDatabase, formList) {
        var _this = _super.call(this) || this;
        _this.userDatabase = userDatabase;
        _this.formList = formList;
        _this.DB = new __WEBPACK_IMPORTED_MODULE_8_pouchdb__["default"](_this.userDatabase);
        return _this;
    }
    FormResponsesListDataSource.prototype.getListOfResponses = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.DB.query('tangy-form/responsesByFormId', { include_docs: true })];
                    case 1:
                        results = _a.sent();
                        if (results.rows.length === 0) {
                            return [2 /*return*/, false];
                        }
                        else {
                            return [2 /*return*/, results.rows];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    FormResponsesListDataSource.prototype.connect = function () {
        var _this = this;
        return __WEBPACK_IMPORTED_MODULE_9_rxjs_Rx__["a" /* Observable */].merge()
            .startWith(null).switchMap(function () {
            return _this.getListOfResponses();
        })
            .map(function (data) {
            var flattenedData = [];
            data.forEach(function (item) {
                if (item.doc.form.id !== 'user-profile') {
                    var index = _this.formList.findIndex(function (c) { return c.id === item.doc.form.id; });
                    var doc = {
                        formId: item.doc.form.id,
                        formTitle: item.doc.formTitle,
                        startDatetime: item.doc.startDatetime,
                        _id: item.doc._id,
                        formIndex: index,
                        formSrc: index > -1 ? _this.formList[index].src : ''
                    };
                    flattenedData.push(doc);
                }
            });
            return flattenedData;
        })
            .map(function (data) {
            return data;
        }).catch(function () {
            console.error('Could Not Load Form Responses');
            return __WEBPACK_IMPORTED_MODULE_9_rxjs_Rx__["a" /* Observable */].of(null);
        });
    };
    FormResponsesListDataSource.prototype.disconnect = function () {
    };
    return FormResponsesListDataSource;
}(__WEBPACK_IMPORTED_MODULE_6__angular_cdk_table__["n" /* DataSource */]));

var _a, _b;
//# sourceMappingURL=form-responses-list.component.js.map

/***/ }),

/***/ "./src/app/core/auth/_guards/login-guard.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LoginGuard; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_authentication_service__ = __webpack_require__("./src/app/core/auth/_services/authentication.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var LoginGuard = (function () {
    function LoginGuard(router, authenticationService) {
        this.router = router;
        this.authenticationService = authenticationService;
    }
    LoginGuard.prototype.canActivate = function (route, state) {
        if (this.authenticationService.isLoggedIn()) {
            return true;
        }
        //  else if (!this.authenticationService.isLoggedIn() && this.authenticationService.isNoPasswordMode()) {
        //   this.router.navigate(['/login-nopassword'], { queryParams: { returnUrl: state.url } });
        //   return true;
        // }
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    };
    return LoginGuard;
}());
LoginGuard = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2__services_authentication_service__["a" /* AuthenticationService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__services_authentication_service__["a" /* AuthenticationService */]) === "function" && _b || Object])
], LoginGuard);

var _a, _b;
//# sourceMappingURL=login-guard.service.js.map

/***/ }),

/***/ "./src/app/core/auth/_guards/upload-guard.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UploadGuardService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_authentication_service__ = __webpack_require__("./src/app/core/auth/_services/authentication.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var UploadGuardService = (function () {
    function UploadGuardService(router, authenticationService) {
        this.router = router;
        this.authenticationService = authenticationService;
    }
    UploadGuardService.prototype.canActivate = function (route, state) {
        if (this.authenticationService.isLoggedInForUpload()) {
            return true;
        }
        this.router.navigate(['/loginRemoteServer'], { queryParams: { returnUrl: state.url } });
        return false;
    };
    return UploadGuardService;
}());
UploadGuardService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2__services_authentication_service__["a" /* AuthenticationService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__services_authentication_service__["a" /* AuthenticationService */]) === "function" && _b || Object])
], UploadGuardService);

var _a, _b;
//# sourceMappingURL=upload-guard.service.js.map

/***/ }),

/***/ "./src/app/core/auth/_services/authentication.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AuthenticationService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_rxjs_add_observable_pairs__ = __webpack_require__("./node_modules/rxjs/_esm5/add/observable/pairs.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_bcryptjs__ = __webpack_require__("./node_modules/bcryptjs/dist/bcrypt.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_bcryptjs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_bcryptjs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_pouchdb__ = __webpack_require__("./node_modules/pouchdb/lib/index-browser.es.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_Subject__ = __webpack_require__("./node_modules/rxjs/_esm5/Subject.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__shared_services_app_config_service__ = __webpack_require__("./src/app/shared/_services/app-config.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__environments_environment__ = __webpack_require__("./src/environments/environment.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__user_service__ = __webpack_require__("./src/app/core/auth/_services/user.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};








var AuthenticationService = (function () {
    function AuthenticationService(userService, appConfigService) {
        this.userService = userService;
        this.appConfigService = appConfigService;
        this.DB = new __WEBPACK_IMPORTED_MODULE_3_pouchdb__["default"]('users');
        this.currentUserLoggedIn$ = new __WEBPACK_IMPORTED_MODULE_4_rxjs_Subject__["b" /* Subject */]();
    }
    AuthenticationService.prototype.login = function (username, password) {
        return __awaiter(this, void 0, void 0, function () {
            var isCredentialsValid, userExists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isCredentialsValid = false;
                        return [4 /*yield*/, this.userService.doesUserExist(username)];
                    case 1:
                        userExists = _a.sent();
                        if (!userExists) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.confirmPassword(username, password)];
                    case 2:
                        /**
                         *@TODO if Security policy require password is false, then no need to check password. Just login the user
                         */
                        isCredentialsValid = _a.sent();
                        if (isCredentialsValid) {
                            localStorage.setItem('currentUser', username);
                            this._currentUserLoggedIn = true;
                            this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/, isCredentialsValid];
                }
            });
        });
    };
    AuthenticationService.prototype.confirmPassword = function (username, password) {
        return __awaiter(this, void 0, void 0, function () {
            var doesPasswordMatch, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        doesPasswordMatch = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.DB.find({ selector: { username: username } })];
                    case 2:
                        result = _a.sent();
                        if (!(result.docs.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, __WEBPACK_IMPORTED_MODULE_2_bcryptjs__["compare"](password, result.docs[0].password)];
                    case 3:
                        doesPasswordMatch = _a.sent();
                        if (doesPasswordMatch) {
                            /**
                             * @TODO we will probably need to save the current timestamp when the user logged in for security policy use
                             * Security policy Example: 1) Expire user after 5 minutes or 2) never
                             * @TODO Refactor for Redux send Action to Current User store. Dont do this until our ngrx stores are backed up by local storage
                             */
                        }
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, doesPasswordMatch];
                }
            });
        });
    };
    ;
    AuthenticationService.prototype.logout = function () {
        localStorage.removeItem('currentUser');
        this._currentUserLoggedIn = false;
        this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
    };
    AuthenticationService.prototype.isLoggedIn = function () {
        this._currentUserLoggedIn = false;
        this._currentUserLoggedIn = !!localStorage.getItem('currentUser');
        this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
        return this._currentUserLoggedIn;
    };
    AuthenticationService.prototype.isLoggedInForUpload = function () {
        if (localStorage.getItem('loggedInForUploadUser')) {
            return true;
        }
        return false;
    };
    AuthenticationService.prototype.loginForUpload = function (username, password) {
        return __awaiter(this, void 0, void 0, function () {
            var uploadUser, isCredentialsValid;
            return __generator(this, function (_a) {
                uploadUser = __WEBPACK_IMPORTED_MODULE_6__environments_environment__["a" /* environment */].uploadUserCredentials;
                isCredentialsValid = false;
                if (username === uploadUser.username && password === uploadUser.password) {
                    isCredentialsValid = true;
                    localStorage.setItem('loggedInForUploadUser', username);
                }
                return [2 /*return*/, isCredentialsValid];
            });
        });
    };
    AuthenticationService.prototype.getSecurityPolicy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var appConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.appConfigService.getAppConfig()];
                    case 1:
                        appConfig = _a.sent();
                        return [2 /*return*/, appConfig.securityPolicy];
                }
            });
        });
    };
    AuthenticationService.prototype.isNoPasswordMode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var policy, isNoPasswordMode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSecurityPolicy()];
                    case 1:
                        policy = _a.sent();
                        return [4 /*yield*/, policy.find(function (p) { return p === 'noPassword'; })];
                    case 2:
                        isNoPasswordMode = _a.sent();
                        return [2 /*return*/, isNoPasswordMode === 'noPassword'];
                }
            });
        });
    };
    AuthenticationService.prototype.getCurrentUser = function () {
        return localStorage.getItem('currentUser');
    };
    AuthenticationService.prototype.getCurrentUserDBPath = function () {
        return localStorage.getItem('currentUser');
    };
    return AuthenticationService;
}());
AuthenticationService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["C" /* Injectable */])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_7__user_service__["a" /* UserService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_7__user_service__["a" /* UserService */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_5__shared_services_app_config_service__["a" /* AppConfigService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_5__shared_services_app_config_service__["a" /* AppConfigService */]) === "function" && _b || Object])
], AuthenticationService);

var _a, _b;
//# sourceMappingURL=authentication.service.js.map

/***/ }),

/***/ "./src/app/core/auth/_services/user.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UserService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_rxjs_add_observable_from__ = __webpack_require__("./node_modules/rxjs/_esm5/add/observable/from.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs_add_operator_filter__ = __webpack_require__("./node_modules/rxjs/_esm5/add/operator/filter.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_bcryptjs__ = __webpack_require__("./node_modules/bcryptjs/dist/bcrypt.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_bcryptjs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_bcryptjs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_ng2_uuid__ = __webpack_require__("./node_modules/ng2-uuid/index.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_pouchdb__ = __webpack_require__("./node_modules/pouchdb/lib/index-browser.es.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_pouchdb_find__ = __webpack_require__("./node_modules/pouchdb-find/lib/index-browser.es.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rxjs_Observable__ = __webpack_require__("./node_modules/rxjs/_esm5/Observable.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__tangy_forms_tangy_form_service_js__ = __webpack_require__("./src/app/tangy-forms/tangy-form-service.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__update_update_updates__ = __webpack_require__("./src/app/core/update/update/updates.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};










var UserService = (function () {
    function UserService(uuid) {
        this.uuid = uuid;
        this.userData = {};
        this.DB = new __WEBPACK_IMPORTED_MODULE_5_pouchdb__["default"]('users');
        this.USER_DATABASE_NAME = 'currentUser';
    }
    UserService.prototype.create = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            var userUUID, salt, hash, postUserdata, userDb, result, tangyFormService, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userUUID = this.uuid.v1();
                        salt = __WEBPACK_IMPORTED_MODULE_3_bcryptjs__["genSaltSync"](10);
                        hash = __WEBPACK_IMPORTED_MODULE_3_bcryptjs__["hashSync"](payload.password, salt);
                        this.userData = payload;
                        this.userData['userUUID'] = userUUID;
                        this.userData['password'] = hash;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, this.DB.post(this.userData)];
                    case 2:
                        postUserdata = _a.sent();
                        userDb = new __WEBPACK_IMPORTED_MODULE_5_pouchdb__["default"](this.userData['username']);
                        if (!postUserdata) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.initUserProfile(this.userData['username'], userUUID)];
                    case 3:
                        result = _a.sent();
                        tangyFormService = new __WEBPACK_IMPORTED_MODULE_8__tangy_forms_tangy_form_service_js__["a" /* TangyFormService */]({ databaseName: this.userData['username'] });
                        return [4 /*yield*/, tangyFormService.initialize()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, userDb.put({
                                _id: 'info',
                                atUpdateIndex: __WEBPACK_IMPORTED_MODULE_9__update_update_updates__["a" /* updates */].length - 1
                            })];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.initUserProfile = function (userDBPath, profileId) {
        return __awaiter(this, void 0, void 0, function () {
            var userDB, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!userDBPath) return [3 /*break*/, 4];
                        userDB = new __WEBPACK_IMPORTED_MODULE_5_pouchdb__["default"](userDBPath);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, userDB.put({
                                _id: profileId,
                                collection: 'user-profile'
                            })];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 3:
                        error_2 = _a.sent();
                        console.error(error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.getUserUUID = function () {
        return __awaiter(this, void 0, void 0, function () {
            var username, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserDatabase()];
                    case 1:
                        username = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        __WEBPACK_IMPORTED_MODULE_5_pouchdb__["default"].plugin(__WEBPACK_IMPORTED_MODULE_6_pouchdb_find__["a" /* default */]);
                        return [4 /*yield*/, this.DB.find({ selector: { username: username } })];
                    case 3:
                        result = _a.sent();
                        if (result.docs.length > 0) {
                            return [2 /*return*/, result.docs[0]['userUUID']];
                        }
                        else {
                            console.error('Unsuccessful');
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        console.error(error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.getUserProfileId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userDBPath, userDB, userProfileId, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserDatabase()];
                    case 1:
                        userDBPath = _a.sent();
                        if (!userDBPath) return [3 /*break*/, 6];
                        userDB = new __WEBPACK_IMPORTED_MODULE_5_pouchdb__["default"](userDBPath);
                        userProfileId = void 0;
                        __WEBPACK_IMPORTED_MODULE_5_pouchdb__["default"].plugin(__WEBPACK_IMPORTED_MODULE_6_pouchdb_find__["a" /* default */]);
                        userDB.createIndex({
                            index: { fields: ['collection'] }
                        }).then(function (data) { console.log('Indexing Succesful'); })
                            .catch(function (err) { return console.error(err); });
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, userDB.find({ selector: { collection: 'user-profile' } })];
                    case 3:
                        result = _a.sent();
                        if (result.docs.length > 0) {
                            userProfileId = result.docs[0]['_id'];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        console.error(error_4);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, userProfileId];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.getUserProfile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var databaseName, tangyFormService, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUserDatabase()];
                    case 1:
                        databaseName = _a.sent();
                        tangyFormService = new __WEBPACK_IMPORTED_MODULE_8__tangy_forms_tangy_form_service_js__["a" /* TangyFormService */]({ databaseName: databaseName });
                        return [4 /*yield*/, tangyFormService.getResponsesByFormId('user-profile')];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, results[0]];
                }
            });
        });
    };
    UserService.prototype.doesUserExist = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var userExists, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!username) return [3 /*break*/, 5];
                        __WEBPACK_IMPORTED_MODULE_5_pouchdb__["default"].plugin(__WEBPACK_IMPORTED_MODULE_6_pouchdb_find__["a" /* default */]);
                        /**
                         * @TODO We may want to run this on the first time when the app runs.
                         */
                        this.DB.createIndex({
                            index: { fields: ['username'] }
                        }).then(function (data) { console.log('Indexing Succesful'); })
                            .catch(function (err) { return console.error(err); });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.DB.find({ selector: { username: username } })];
                    case 2:
                        result = _a.sent();
                        if (result.docs.length > 0) {
                            userExists = true;
                        }
                        else {
                            userExists = false;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        userExists = true;
                        console.error(error_5);
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        userExists = true;
                        return [2 /*return*/, userExists];
                    case 6: return [2 /*return*/, userExists];
                }
            });
        });
    };
    UserService.prototype.getAllUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, users_1, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.DB.allDocs({ include_docs: true })];
                    case 1:
                        result = _a.sent();
                        users_1 = [];
                        __WEBPACK_IMPORTED_MODULE_7_rxjs_Observable__["a" /* Observable */].from(result.rows).map(function (doc) { return doc; }).filter(function (doc) { return !doc['id'].startsWith('_design'); }).subscribe(function (doc) {
                            users_1.push({
                                username: doc['doc'].username,
                                email: doc['doc'].email
                            });
                        });
                        return [2 /*return*/, users_1];
                    case 2:
                        error_6 = _a.sent();
                        console.error(error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.setUserDatabase = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, localStorage.setItem(this.USER_DATABASE_NAME, username)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UserService.prototype.getUserDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, localStorage.getItem(this.USER_DATABASE_NAME)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    UserService.prototype.removeUserDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                localStorage.removeItem(this.USER_DATABASE_NAME);
                return [2 /*return*/];
            });
        });
    };
    return UserService;
}());
UserService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_2__angular_core__["C" /* Injectable */])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_4_ng2_uuid__["a" /* Uuid */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_4_ng2_uuid__["a" /* Uuid */]) === "function" && _a || Object])
], UserService);

var _a;
//# sourceMappingURL=user.service.js.map

/***/ }),

/***/ "./src/app/core/auth/auth-routing.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AuthRoutingModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__guards_login_guard_service__ = __webpack_require__("./src/app/core/auth/_guards/login-guard.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__login_remote_server_login_remote_server_component__ = __webpack_require__("./src/app/core/auth/login-remote-server/login-remote-server.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__login_login_component__ = __webpack_require__("./src/app/core/auth/login/login.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__register_remote_server_register_remote_server_component__ = __webpack_require__("./src/app/core/auth/register-remote-server/register-remote-server.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__registration_registration_component__ = __webpack_require__("./src/app/core/auth/registration/registration.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};







// @TODO Add edit-profile component.
// import { EditProfileComponent } from './edit-profile/edit-profile.component';
var routes = [{
        path: 'login',
        component: __WEBPACK_IMPORTED_MODULE_4__login_login_component__["a" /* LoginComponent */]
    }, {
        path: 'register',
        component: __WEBPACK_IMPORTED_MODULE_6__registration_registration_component__["a" /* RegistrationComponent */]
    }, {
        path: 'registerRemoteServer',
        component: __WEBPACK_IMPORTED_MODULE_5__register_remote_server_register_remote_server_component__["a" /* RegisterRemoteServerComponent */],
        canActivate: [__WEBPACK_IMPORTED_MODULE_2__guards_login_guard_service__["a" /* LoginGuard */]]
    }, {
        path: 'loginRemoteServer',
        component: __WEBPACK_IMPORTED_MODULE_3__login_remote_server_login_remote_server_component__["a" /* LoginRemoteServerComponent */],
        canActivate: [__WEBPACK_IMPORTED_MODULE_2__guards_login_guard_service__["a" /* LoginGuard */]]
    }
    // @TODO Add edit-profile component.
    /*, {
      path: 'edit-user-profile',
      component: EditProfileComponent
    }*/
];
var AuthRoutingModule = (function () {
    function AuthRoutingModule() {
    }
    return AuthRoutingModule;
}());
AuthRoutingModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* NgModule */])({
        imports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */].forChild(routes)],
        exports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */]]
    })
], AuthRoutingModule);

//# sourceMappingURL=auth-routing.module.js.map

/***/ }),

/***/ "./src/app/core/auth/auth.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AuthModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_common__ = __webpack_require__("./node_modules/@angular/common/@angular/common.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__("./node_modules/@angular/forms/@angular/forms.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_platform_browser_animations__ = __webpack_require__("./node_modules/@angular/platform-browser/@angular/platform-browser/animations.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__guards_login_guard_service__ = __webpack_require__("./src/app/core/auth/_guards/login-guard.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__services_authentication_service__ = __webpack_require__("./src/app/core/auth/_services/authentication.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__services_user_service__ = __webpack_require__("./src/app/core/auth/_services/user.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__auth_routing_module__ = __webpack_require__("./src/app/core/auth/auth-routing.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__login_remote_server_login_remote_server_component__ = __webpack_require__("./src/app/core/auth/login-remote-server/login-remote-server.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__login_login_component__ = __webpack_require__("./src/app/core/auth/login/login.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__register_remote_server_register_remote_server_component__ = __webpack_require__("./src/app/core/auth/register-remote-server/register-remote-server.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__registration_registration_component__ = __webpack_require__("./src/app/core/auth/registration/registration.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};













var AuthModule = (function () {
    function AuthModule() {
    }
    return AuthModule;
}());
AuthModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["M" /* NgModule */])({
        imports: [
            __WEBPACK_IMPORTED_MODULE_0__angular_common__["b" /* CommonModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_material__["e" /* MatInputModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_material__["b" /* MatButtonModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_material__["h" /* MatSelectModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_forms__["c" /* FormsModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_forms__["h" /* ReactiveFormsModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_platform_browser_animations__["a" /* BrowserAnimationsModule */],
            __WEBPACK_IMPORTED_MODULE_8__auth_routing_module__["a" /* AuthRoutingModule */]
        ],
        providers: [__WEBPACK_IMPORTED_MODULE_5__guards_login_guard_service__["a" /* LoginGuard */], __WEBPACK_IMPORTED_MODULE_6__services_authentication_service__["a" /* AuthenticationService */], __WEBPACK_IMPORTED_MODULE_7__services_user_service__["a" /* UserService */]],
        declarations: [__WEBPACK_IMPORTED_MODULE_10__login_login_component__["a" /* LoginComponent */], __WEBPACK_IMPORTED_MODULE_12__registration_registration_component__["a" /* RegistrationComponent */], __WEBPACK_IMPORTED_MODULE_9__login_remote_server_login_remote_server_component__["a" /* LoginRemoteServerComponent */], __WEBPACK_IMPORTED_MODULE_11__register_remote_server_register_remote_server_component__["a" /* RegisterRemoteServerComponent */]]
    })
], AuthModule);

//# sourceMappingURL=auth.module.js.map

/***/ }),

/***/ "./src/app/core/auth/login-remote-server/login-remote-server.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/core/auth/login-remote-server/login-remote-server.component.html":
/***/ (function(module, exports) {

module.exports = "<mat-grid-list cols=\"2\" rowHeight=\"2:1\">\n  <h2>Log in to Remote Server</h2>\n  <mat-grid-tile>\n    <mat-form-field>\n      <label>Username</label>\n      <input matInput [(ngModel)]=\"user.username\" place>\n    </mat-form-field>\n    <mat-form-field>\n      <label>Password</label>\n      <input matInput [(ngModel)]=\"user.password\" type=\"password\">\n    </mat-form-field>\n    <button mat-raised-button (click)=\"loginForUpload()\">Login</button>\n  </mat-grid-tile>\n  <mat-grid-tile></mat-grid-tile>\n</mat-grid-list>\n"

/***/ }),

/***/ "./src/app/core/auth/login-remote-server/login-remote-server.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LoginRemoteServerComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__ = __webpack_require__("./node_modules/rxjs/_esm5/Observable.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_observable_fromPromise__ = __webpack_require__("./node_modules/rxjs/_esm5/add/observable/fromPromise.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__services_authentication_service__ = __webpack_require__("./src/app/core/auth/_services/authentication.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var LoginRemoteServerComponent = (function () {
    function LoginRemoteServerComponent(authenticationService, route, router) {
        this.authenticationService = authenticationService;
        this.route = route;
        this.router = router;
        this.user = { username: '', password: '' };
    }
    LoginRemoteServerComponent.prototype.ngOnInit = function () {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    };
    LoginRemoteServerComponent.prototype.loginForUpload = function () {
        var _this = this;
        __WEBPACK_IMPORTED_MODULE_2_rxjs_Observable__["a" /* Observable */].fromPromise(this.authenticationService.loginForUpload(this.user.username, this.user.password)).subscribe(function (data) {
            if (data) {
                _this.router.navigate(['' + _this.returnUrl]);
            }
            else {
                alert('Login Unsuccessful');
            }
        }, function (error) {
            alert('Login Unsuccessful');
        });
    };
    return LoginRemoteServerComponent;
}());
LoginRemoteServerComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
        selector: 'app-login-remote-server',
        template: __webpack_require__("./src/app/core/auth/login-remote-server/login-remote-server.component.html"),
        styles: [__webpack_require__("./src/app/core/auth/login-remote-server/login-remote-server.component.css")]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_4__services_authentication_service__["a" /* AuthenticationService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_4__services_authentication_service__["a" /* AuthenticationService */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* ActivatedRoute */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* ActivatedRoute */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === "function" && _c || Object])
], LoginRemoteServerComponent);

var _a, _b, _c;
//# sourceMappingURL=login-remote-server.component.js.map

/***/ }),

/***/ "./src/app/core/auth/login/login.component.css":
/***/ (function(module, exports) {

module.exports = ".mat-title {\n    color: #3c5b8d;\n    font-size: 1.75em;\n    font-weight: 400;\n    font-family: Roboto, \"Helvetica Nue\", sans-serif;\n  }\n  \n  mat-placeholder i {\n    margin-right:.075em;\n  \n  }\n  \n  mat-placeholder span{\n  \n  }\n  \n  label span {\n  \n  }\n  \n  input.mat-input-element {\n    margin-top: 1em;\n  }\n  \n  .mat-placeholder-required.mat-form-field-required-marker.ng-tns-c6-2 .mat-form-field-invalid .mat-form-field-placeholder.mat-accent, .mat-form-field-invalid .mat-form-field-placeholder .mat-form-field-required-marker {\n  position:relative;\n    bottom: 1em !important;\n  }"

/***/ }),

/***/ "./src/app/core/auth/login/login.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"login-app-content\">\n  <div class=\"group\">\n    <form role=\"form\" (submit)=\"login()\">\n      <br>\n      <h3 class=\"mat-title\">Log in to Tangerine</h3>\n      <mat-form-field>\n        <input matInput type=\"text\" required [(ngModel)]=\"user.username\" id=\"username\" name=\"username\">\n        <mat-placeholder>\n          <i class=\"material-icons app-input-icon\">face</i><span>Username</span>\n        </mat-placeholder>\n      </mat-form-field>\n      <br>\n      <br>\n      <mat-form-field>\n        <input matInput type=\"password\" required [(ngModel)]=\"user.password\" id=\"password\" name=\"password\">\n        <mat-placeholder>\n          <i class=\"material-icons app-input-icon\">lock_open</i><span>Password</span>\n        </mat-placeholder>\n      </mat-form-field>\n      <br>\n      <br>\n      <button mat-raised-button color=\"accent\" type=\"submit\" name=\"action\">LOGIN</button>\n      <a href=\"index.html#/register\">REGISTER</a>\n      <br>\n      <br>\n      <span id=\"err\">\n        <small>{{errorMessage}}</small>\n      </span>\n    </form>\n  </div>\n</div>"

/***/ }),

/***/ "./src/app/core/auth/login/login.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LoginComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_rxjs_add_observable_fromPromise__ = __webpack_require__("./node_modules/rxjs/_esm5/add/observable/fromPromise.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_app_shared_services_app_config_service__ = __webpack_require__("./src/app/shared/_services/app-config.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__ = __webpack_require__("./node_modules/rxjs/_esm5/Observable.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__services_user_service__ = __webpack_require__("./src/app/core/auth/_services/user.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__services_authentication_service__ = __webpack_require__("./src/app/core/auth/_services/authentication.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};







var LoginComponent = (function () {
    function LoginComponent(authenticationService, route, router, usersService, appConfigService) {
        this.authenticationService = authenticationService;
        this.route = route;
        this.router = router;
        this.usersService = usersService;
        this.appConfigService = appConfigService;
        this.loading = false;
        this.errorMessage = '';
        this.user = { username: '', password: '' };
        this.users = [];
    }
    LoginComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var home_url, isNoPasswordMode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.appConfigService.getDefaultURL()];
                    case 1:
                        home_url = _a.sent();
                        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || home_url;
                        isNoPasswordMode = this.authenticationService.isNoPasswordMode();
                        // TODO List users on login page
                        // Observable.fromPromise(this.usersService.getAllUsers()).subscribe(data => {
                        //   this.users = data;
                        // });
                        if (this.authenticationService.isLoggedIn() || isNoPasswordMode) {
                            this.router.navigate([this.returnUrl]);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    LoginComponent.prototype.login = function () {
        var _this = this;
        this.loading = true;
        __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__["a" /* Observable */].fromPromise(this.authenticationService.login(this.user.username, this.user.password)).subscribe(function (data) {
            if (data) {
                _this.router.navigate(['' + _this.returnUrl]);
            }
            else {
                _this.errorMessage = 'Login Unsuccessful';
            }
        }, function (error) {
            _this.loading = false;
            _this.errorMessage = 'Login Unsuccessful';
        });
    };
    LoginComponent.prototype.register = function () {
        this.router.navigate(['/register']);
    };
    return LoginComponent;
}());
LoginComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["o" /* Component */])({
        selector: 'app-login',
        template: __webpack_require__("./src/app/core/auth/login/login.component.html"),
        styles: [__webpack_require__("./src/app/core/auth/login/login.component.css")]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_6__services_authentication_service__["a" /* AuthenticationService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_6__services_authentication_service__["a" /* AuthenticationService */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2__angular_router__["a" /* ActivatedRoute */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__angular_router__["a" /* ActivatedRoute */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_2__angular_router__["b" /* Router */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__angular_router__["b" /* Router */]) === "function" && _c || Object, typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_5__services_user_service__["a" /* UserService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_5__services_user_service__["a" /* UserService */]) === "function" && _d || Object, typeof (_e = typeof __WEBPACK_IMPORTED_MODULE_3_app_shared_services_app_config_service__["a" /* AppConfigService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3_app_shared_services_app_config_service__["a" /* AppConfigService */]) === "function" && _e || Object])
], LoginComponent);

var _a, _b, _c, _d, _e;
//# sourceMappingURL=login.component.js.map

/***/ }),

/***/ "./src/app/core/auth/register-remote-server/register-remote-server.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/core/auth/register-remote-server/register-remote-server.component.html":
/***/ (function(module, exports) {

module.exports = "<p>\n  register-remote-server works!\n</p>\n"

/***/ }),

/***/ "./src/app/core/auth/register-remote-server/register-remote-server.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RegisterRemoteServerComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var RegisterRemoteServerComponent = (function () {
    function RegisterRemoteServerComponent() {
    }
    RegisterRemoteServerComponent.prototype.ngOnInit = function () {
    };
    return RegisterRemoteServerComponent;
}());
RegisterRemoteServerComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
        selector: 'app-register-remote-server',
        template: __webpack_require__("./src/app/core/auth/register-remote-server/register-remote-server.component.html"),
        styles: [__webpack_require__("./src/app/core/auth/register-remote-server/register-remote-server.component.css")]
    }),
    __metadata("design:paramtypes", [])
], RegisterRemoteServerComponent);

//# sourceMappingURL=register-remote-server.component.js.map

/***/ }),

/***/ "./src/app/core/auth/registration/registration.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/core/auth/registration/registration.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"login-app-content\">\n  <div class=\"group\">\n\n    <form role=\"form\" #registration='ngForm' novalidate (submit)=\"register()\">\n      <br>\n      <h3 class=\"tangy-foreground-primary\">Register on Tangerine</h3>\n      <mat-form-field>\n        <input name=\"username\" type=\"text\" matInput [(ngModel)]=\"user.username\" (blur)=\"doesUserExist(user.username)\" required>\n        <mat-placeholder>\n          <i class=\"material-icons mat-11 app-input-icon\">face</i>Username\n        </mat-placeholder>\n      </mat-form-field>\n      <mat-form-field>\n        <input name=\"email\" type=\"email\" matInput [(ngModel)]=\"user.email\" pattern=\"^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$\"\n          required>\n        <mat-placeholder>\n          <i class=\"material-icons mat-11\">mail_outline</i>Email\n        </mat-placeholder>\n      </mat-form-field>\n      <br>\n      <mat-form-field>\n        <input name=\"password\" matInput [(ngModel)]=\"user.password\" type=\"password\" required>\n        <mat-placeholder>\n          <i class=\"material-icons mat-11 app-input-icon\">lock_open</i>Password\n        </mat-placeholder>\n      </mat-form-field>\n      <mat-form-field>\n        <input name=\"confirmPassword\" matInput [(ngModel)]=\"user.confirmPassword\" type=\"password\" required>\n        <mat-placeholder>\n          <i class=\"material-icons mat-11 app-input-icon\">lock_open</i>Confirm Password\n        </mat-placeholder>\n      </mat-form-field>\n      <br>\n      <button mat-raised-button color=\"accent\" type=\"submit\" [disabled]=\"registration.invalid||user.password!==user.confirmPassword\">REGISTER</button>\n      <button color=\"accent\" mat-button routerLink=\"#/login\">LOGIN</button>\n      <span [id]=\"statusMessage.type\">\n        <small>{{statusMessage.message}}</small>\n      </span>\n    </form>\n  </div>\n</div>\n"

/***/ }),

/***/ "./src/app/core/auth/registration/registration.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RegistrationComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_rxjs_add_observable_fromPromise__ = __webpack_require__("./node_modules/rxjs/_esm5/add/observable/fromPromise.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_app_shared_services_app_config_service__ = __webpack_require__("./src/app/shared/_services/app-config.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__ = __webpack_require__("./node_modules/rxjs/_esm5/Observable.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__services_authentication_service__ = __webpack_require__("./src/app/core/auth/_services/authentication.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__services_user_service__ = __webpack_require__("./src/app/core/auth/_services/user.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};







var RegistrationComponent = (function () {
    function RegistrationComponent(userService, authenticationService, route, router, appConfigService) {
        this.userService = userService;
        this.authenticationService = authenticationService;
        this.route = route;
        this.router = router;
        this.appConfigService = appConfigService;
        this.user = {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        };
        this.userNameUnavailableMessage = { type: 'error', message: 'Username Unavailable.' };
        this.userNameAvailableMessage = { type: 'success', message: 'Username Available.' };
        this.loginUnsucessfulMessage = { type: 'error', message: 'Login Unsuccessful' };
        this.couldNotCreateUserMessage = { type: 'error', message: 'Could Not Create User' };
        this.statusMessage = { type: '', message: '' };
    }
    RegistrationComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var home_url, isNoPasswordMode;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.appConfigService.getDefaultURL()];
                    case 1:
                        home_url = _a.sent();
                        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || home_url;
                        return [4 /*yield*/, this.authenticationService.isNoPasswordMode()];
                    case 2:
                        isNoPasswordMode = _a.sent();
                        if (isNoPasswordMode) {
                        }
                        if (this.authenticationService.isLoggedIn() || isNoPasswordMode) {
                            this.router.navigate([this.returnUrl]);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    RegistrationComponent.prototype.register = function () {
        var _this = this;
        delete this.user.confirmPassword;
        var userData = Object.assign({}, this.user);
        if (!this.isUsernameTaken) {
            __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__["a" /* Observable */].fromPromise(this.userService.create(userData)).subscribe(function (data) {
                _this.loginUserAfterRegistration(userData.username, _this.user.password);
            }, function (error) {
                console.log(error);
                _this.statusMessage = _this.couldNotCreateUserMessage;
            });
        }
        else {
            this.statusMessage = this.userNameUnavailableMessage;
        }
    };
    RegistrationComponent.prototype.doesUserExist = function (user) {
        var _this = this;
        __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__["a" /* Observable */].fromPromise(this.userService.doesUserExist(user.trim())).subscribe(function (data) {
            _this.isUsernameTaken = data;
            _this.isUsernameTaken ?
                _this.statusMessage = _this.userNameUnavailableMessage :
                _this.statusMessage = _this.userNameAvailableMessage;
            return _this.isUsernameTaken;
        });
    };
    RegistrationComponent.prototype.loginUserAfterRegistration = function (username, password) {
        var _this = this;
        __WEBPACK_IMPORTED_MODULE_4_rxjs_Observable__["a" /* Observable */].fromPromise(this.authenticationService.login(username, password)).subscribe(function (data) {
            if (data) {
                _this.router.navigate(['' + '/manage-user-profile']);
            }
            else {
                _this.statusMessage = _this.loginUnsucessfulMessage;
            }
        }, function (error) {
            _this.statusMessage = _this.loginUnsucessfulMessage;
        });
    };
    return RegistrationComponent;
}());
RegistrationComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["o" /* Component */])({
        selector: 'app-registration',
        template: __webpack_require__("./src/app/core/auth/registration/registration.component.html"),
        styles: [__webpack_require__("./src/app/core/auth/registration/registration.component.css")]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_6__services_user_service__["a" /* UserService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_6__services_user_service__["a" /* UserService */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_5__services_authentication_service__["a" /* AuthenticationService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_5__services_authentication_service__["a" /* AuthenticationService */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_2__angular_router__["a" /* ActivatedRoute */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__angular_router__["a" /* ActivatedRoute */]) === "function" && _c || Object, typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_2__angular_router__["b" /* Router */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__angular_router__["b" /* Router */]) === "function" && _d || Object, typeof (_e = typeof __WEBPACK_IMPORTED_MODULE_3_app_shared_services_app_config_service__["a" /* AppConfigService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3_app_shared_services_app_config_service__["a" /* AppConfigService */]) === "function" && _e || Object])
], RegistrationComponent);

var _a, _b, _c, _d, _e;
//# sourceMappingURL=registration.component.js.map

/***/ }),

/***/ "./src/app/core/location.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Loc; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var Loc = (function () {
    function Loc() {
    }
    Loc.prototype.query = function (levels, criteria, locationList) {
        var currentLevelIndex, i, j, len, level, levelIDs, levelMap, locationLevels, locations, targetLevelIndex;
        if (criteria == null) {
            criteria = {};
        }
        locations = locationList.locations;
        locationLevels = locationList.locationsLevels;
        targetLevelIndex = 0;
        levelIDs = [];
        levelMap = [];
        for (i = j = 0, len = locationLevels.length; j < len; i = ++j) {
            level = locationLevels[i];
            if (levels.indexOf(function (aLevel) { return aLevel === level; }) === -1) {
                levelMap[i] = null;
            }
            else {
                levelMap[i] = level;
            }
        }
        // currentLevelIndex = this.getCurrentLevelIndex(levels, criteria, levelMap);
        // return this._query(0, currentLevelIndex, locations, levelMap, criteria);
        return this._query(0, 2, locations, levels, criteria);
    };
    Loc.prototype._query = function (depth, targetDepth, data, levelMap, criteria) {
        var allChildren, i, j, len, levelData, v;
        if (depth === targetDepth) {
            return data.map(function (obj) {
                return {
                    id: obj.id,
                    label: obj.label
                };
            });
        }
        if ((levelMap[depth] != null) && (depth < targetDepth)) {
            if (criteria[levelMap[depth]] && data[criteria[levelMap[depth]]] && data[criteria[levelMap[depth]]].hasOwnProperty('children')) {
                return this._query(depth + 1, targetDepth, data[criteria[levelMap[depth]]].children, levelMap, criteria);
            }
        }
        if ((levelMap[depth] == null) && (depth < targetDepth)) {
            levelData = {};
            allChildren = data.map(function (loc) {
                return loc.children;
            });
            for (i = j = 0, len = allChildren.length; j < len; i = ++j) {
                v = allChildren[i];
                Object.assign(levelData, v);
            }
            return this._query(depth + 1, targetDepth, levelData, levelMap, criteria);
        }
        return {};
    };
    Loc.prototype.getCurrentLevelIndex = function (levels, criteria, levelMap) {
        var i, j, len, level;
        for (i = j = 0, len = levels.length; j < len; i = ++j) {
            level = levels[i];
            if (criteria[level] == null) {
                return levelMap.indexOf(level);
            }
        }
        return levelMap.indexOf((function (levelItem) { return levelItem === levels[levels.length - 1]; }));
    };
    return Loc;
}());
Loc = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])()
], Loc);

//# sourceMappingURL=location.service.js.map

/***/ }),

/***/ "./src/app/core/sync-records/_services/syncing.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SyncingService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__("./node_modules/@angular/http/@angular/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_pouchdb__ = __webpack_require__("./node_modules/pouchdb/lib/index-browser.es.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_pouchdb_upsert__ = __webpack_require__("./node_modules/pouchdb-upsert/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_pouchdb_upsert___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_pouchdb_upsert__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__shared_services_app_config_service__ = __webpack_require__("./src/app/shared/_services/app-config.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__auth_services_user_service__ = __webpack_require__("./src/app/core/auth/_services/user.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};






var SyncingService = (function () {
    function SyncingService(appConfigService, http, userService) {
        this.appConfigService = appConfigService;
        this.http = http;
        this.userService = userService;
    }
    SyncingService.prototype.getUserDB = function () {
        return localStorage.getItem('currentUser');
    };
    // @TODO refactor this to use node server
    SyncingService.prototype.getRemoteHost = function () {
        return __awaiter(this, void 0, void 0, function () {
            var appConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.appConfigService.getAppConfig()];
                    case 1:
                        appConfig = _a.sent();
                        return [2 /*return*/, appConfig.uploadUrl];
                }
            });
        });
    };
    SyncingService.prototype.getDocsNotUploaded = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getIDsFormsLockedAndNotUploaded()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SyncingService.prototype.pushAllrecords = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userDB, userProfile, remoteHost, DB, doc_ids, userUUID, _i, doc_ids_1, doc_id, doc, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 13, , 14]);
                        return [4 /*yield*/, this.getUserDB()];
                    case 1:
                        userDB = _a.sent();
                        return [4 /*yield*/, this.userService.getUserProfile()];
                    case 2:
                        userProfile = _a.sent();
                        return [4 /*yield*/, this.getRemoteHost()];
                    case 3:
                        remoteHost = _a.sent();
                        DB = new __WEBPACK_IMPORTED_MODULE_2_pouchdb__["default"](userDB);
                        return [4 /*yield*/, this.getIDsFormsLockedAndNotUploaded()];
                    case 4:
                        doc_ids = _a.sent();
                        return [4 /*yield*/, this.userService.getUserUUID()];
                    case 5:
                        userUUID = _a.sent();
                        if (!(doc_ids && doc_ids.length > 0)) return [3 /*break*/, 11];
                        _i = 0, doc_ids_1 = doc_ids;
                        _a.label = 6;
                    case 6:
                        if (!(_i < doc_ids_1.length)) return [3 /*break*/, 10];
                        doc_id = doc_ids_1[_i];
                        return [4 /*yield*/, DB.get(doc_id)];
                    case 7:
                        doc = _a.sent();
                        doc['inputs'].push({ name: 'userUUID', value: userUUID });
                        doc['inputs'].push(userProfile['inputs']);
                        return [4 /*yield*/, this.http.post(remoteHost, { doc: doc }).toPromise()];
                    case 8:
                        _a.sent();
                        this.markDocsAsUploaded([doc_id]);
                        _a.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 6];
                    case 10:
                        Promise.resolve('Sync Succesfull');
                        return [3 /*break*/, 12];
                    case 11:
                        Promise.resolve('No Items to Sync');
                        _a.label = 12;
                    case 12: return [2 /*return*/, true];
                    case 13:
                        error_1 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_1)];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    SyncingService.prototype.getIDsFormsLockedAndNotUploaded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userDB, DB, results, docIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userDB = this.getUserDB();
                        DB = new __WEBPACK_IMPORTED_MODULE_2_pouchdb__["default"](userDB);
                        return [4 /*yield*/, DB.query('tangy-form/responsesLockedAndNotUploaded')];
                    case 1:
                        results = _a.sent();
                        docIds = results.rows.map(function (row) { return row.key; });
                        return [2 /*return*/, docIds];
                }
            });
        });
    };
    SyncingService.prototype.getFormsLockedAndUploaded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userDB, DB, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userDB = this.getUserDB();
                        DB = new __WEBPACK_IMPORTED_MODULE_2_pouchdb__["default"](userDB);
                        return [4 /*yield*/, DB.query('tangy-form/responsesLockedAndUploaded')];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.rows];
                }
            });
        });
    };
    SyncingService.prototype.getNumberOfFormsLockedAndUploaded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getFormsLockedAndUploaded()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length || 0];
                }
            });
        });
    };
    SyncingService.prototype.markDocsAsUploaded = function (replicatedDocIds) {
        return __awaiter(this, void 0, void 0, function () {
            var userDB, DB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        __WEBPACK_IMPORTED_MODULE_2_pouchdb__["default"].plugin(__WEBPACK_IMPORTED_MODULE_3_pouchdb_upsert__);
                        return [4 /*yield*/, this.getUserDB()];
                    case 1:
                        userDB = _a.sent();
                        DB = new __WEBPACK_IMPORTED_MODULE_2_pouchdb__["default"](userDB);
                        return [4 /*yield*/, Promise.all(replicatedDocIds.map(function (docId) {
                                DB.upsert(docId, function (doc) {
                                    doc.uploadDatetime = new Date();
                                    return doc;
                                });
                            }))];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return SyncingService;
}());
SyncingService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_4__shared_services_app_config_service__["a" /* AppConfigService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_4__shared_services_app_config_service__["a" /* AppConfigService */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Http */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Http */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_5__auth_services_user_service__["a" /* UserService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_5__auth_services_user_service__["a" /* UserService */]) === "function" && _c || Object])
], SyncingService);

var _a, _b, _c;
//# sourceMappingURL=syncing.service.js.map

/***/ }),

/***/ "./src/app/core/sync-records/sync-records-routing.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SyncRecodsRoutingModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_app_user_profile_create_profile_guard_service__ = __webpack_require__("./src/app/user-profile/create-profile-guard.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__auth_guards_login_guard_service__ = __webpack_require__("./src/app/core/auth/_guards/login-guard.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__sync_records_sync_records_component__ = __webpack_require__("./src/app/core/sync-records/sync-records/sync-records.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





var routes = [{
        path: 'sync-records',
        component: __WEBPACK_IMPORTED_MODULE_4__sync_records_sync_records_component__["a" /* SyncRecordsComponent */],
        canActivate: [__WEBPACK_IMPORTED_MODULE_3__auth_guards_login_guard_service__["a" /* LoginGuard */], __WEBPACK_IMPORTED_MODULE_2_app_user_profile_create_profile_guard_service__["a" /* CreateProfileGuardService */]]
    }];
var SyncRecodsRoutingModule = (function () {
    function SyncRecodsRoutingModule() {
    }
    return SyncRecodsRoutingModule;
}());
SyncRecodsRoutingModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* NgModule */])({
        imports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */].forChild(routes)],
        exports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */]],
        declarations: []
    })
], SyncRecodsRoutingModule);

//# sourceMappingURL=sync-records-routing.module.js.map

/***/ }),

/***/ "./src/app/core/sync-records/sync-records.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SyncRecordsModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_common__ = __webpack_require__("./node_modules/@angular/common/@angular/common.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common_http__ = __webpack_require__("./node_modules/@angular/common/@angular/common/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_forms__ = __webpack_require__("./node_modules/@angular/forms/@angular/forms.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__auth_guards_upload_guard_service__ = __webpack_require__("./src/app/core/auth/_guards/upload-guard.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__services_syncing_service__ = __webpack_require__("./src/app/core/sync-records/_services/syncing.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__sync_records_routing_module__ = __webpack_require__("./src/app/core/sync-records/sync-records-routing.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__sync_records_sync_records_component__ = __webpack_require__("./src/app/core/sync-records/sync-records/sync-records.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};









var SyncRecordsModule = (function () {
    function SyncRecordsModule() {
    }
    return SyncRecordsModule;
}());
SyncRecordsModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_2__angular_core__["M" /* NgModule */])({
        imports: [
            __WEBPACK_IMPORTED_MODULE_0__angular_common__["b" /* CommonModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_forms__["c" /* FormsModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_forms__["h" /* ReactiveFormsModule */],
            __WEBPACK_IMPORTED_MODULE_7__sync_records_routing_module__["a" /* SyncRecodsRoutingModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_material__["b" /* MatButtonModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_material__["e" /* MatInputModule */],
            __WEBPACK_IMPORTED_MODULE_4__angular_material__["c" /* MatCardModule */]
        ],
        declarations: [__WEBPACK_IMPORTED_MODULE_8__sync_records_sync_records_component__["a" /* SyncRecordsComponent */]],
        providers: [__WEBPACK_IMPORTED_MODULE_6__services_syncing_service__["a" /* SyncingService */], __WEBPACK_IMPORTED_MODULE_5__auth_guards_upload_guard_service__["a" /* UploadGuardService */], __WEBPACK_IMPORTED_MODULE_1__angular_common_http__["a" /* HttpClientModule */]],
    })
], SyncRecordsModule);

//# sourceMappingURL=sync-records.module.js.map

/***/ }),

/***/ "./src/app/core/sync-records/sync-records/sync-records.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/core/sync-records/sync-records/sync-records.component.html":
/***/ (function(module, exports) {

module.exports = "<br>\n<br>\n<mat-card>\n    <mat-card-content>\n        <p class=\"mat-headline\">Syncing Status</p>\n        <span *ngIf=\"isSyncSuccesful\">Sync Successful</span>\n        <span *ngIf=\"!isSyncSuccesful&&isSyncSuccesful!==undefined\">Sync Was Unsuccessful. Please Retry</span>\n        <br/>\n        <br>\n        <p>Last Succesful Sync Timestamp:</p>\n        <p>Docs uploaded: {{docsUploaded}}</p>\n        <p>Docs not uploaded: {{docsNotUploaded}}</p>\n        <p>Percentage Complete: {{syncPercentageComplete|number:'1.2-2'}}%</p>\n    </mat-card-content>\n    <mat-card-actions>\n        <button color=\"primary\" mat-raised-button (click)=\"pushAllRecords()\">SYNC</button>\n    </mat-card-actions>\n</mat-card>\n<br>"

/***/ }),

/***/ "./src/app/core/sync-records/sync-records/sync-records.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SyncRecordsComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_syncing_service__ = __webpack_require__("./src/app/core/sync-records/_services/syncing.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};


var SyncRecordsComponent = (function () {
    function SyncRecordsComponent(syncingService) {
        this.syncingService = syncingService;
        this.isSyncSuccesful = undefined;
        this.syncStatus = '';
    }
    SyncRecordsComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.calculateUploadProgress();
                return [2 /*return*/];
            });
        });
    };
    SyncRecordsComponent.prototype.calculateUploadProgress = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.syncingService.getDocsNotUploaded()];
                    case 1:
                        result = _b.sent();
                        this.docsNotUploaded = result ? result.length : 0;
                        _a = this;
                        return [4 /*yield*/, this.syncingService.getNumberOfFormsLockedAndUploaded()];
                    case 2:
                        _a.docsUploaded = _b.sent();
                        this.syncPercentageComplete =
                            ((this.docsUploaded / (this.docsNotUploaded + this.docsUploaded)) * 100) || 0;
                        return [2 /*return*/];
                }
            });
        });
    };
    SyncRecordsComponent.prototype.pushAllRecords = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isSyncSuccesful = undefined;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.syncingService.pushAllrecords()];
                    case 2:
                        result = _a.sent();
                        if (result) {
                            this.isSyncSuccesful = true;
                            this.calculateUploadProgress();
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error(error_1);
                        this.isSyncSuccesful = false;
                        this.calculateUploadProgress();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return SyncRecordsComponent;
}());
SyncRecordsComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
        selector: 'app-sync-records',
        template: __webpack_require__("./src/app/core/sync-records/sync-records/sync-records.component.html"),
        styles: [__webpack_require__("./src/app/core/sync-records/sync-records/sync-records.component.css")]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__services_syncing_service__["a" /* SyncingService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__services_syncing_service__["a" /* SyncingService */]) === "function" && _a || Object])
], SyncRecordsComponent);

var _a;
//# sourceMappingURL=sync-records.component.js.map

/***/ }),

/***/ "./src/app/core/update/update-routing.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UpdateRoutingModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__update_update_component__ = __webpack_require__("./src/app/core/update/update/update.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



var routes = [
    {
        path: 'update',
        component: __WEBPACK_IMPORTED_MODULE_2__update_update_component__["a" /* UpdateComponent */]
    }
];
var UpdateRoutingModule = (function () {
    function UpdateRoutingModule() {
    }
    return UpdateRoutingModule;
}());
UpdateRoutingModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* NgModule */])({
        imports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */].forChild(routes)],
        exports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */]]
    })
], UpdateRoutingModule);

//# sourceMappingURL=update-routing.module.js.map

/***/ }),

/***/ "./src/app/core/update/update.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UpdateModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common__ = __webpack_require__("./node_modules/@angular/common/@angular/common.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__update_routing_module__ = __webpack_require__("./src/app/core/update/update-routing.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__update_update_component__ = __webpack_require__("./src/app/core/update/update/update.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};




var UpdateModule = (function () {
    function UpdateModule() {
    }
    return UpdateModule;
}());
UpdateModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* NgModule */])({
        imports: [
            __WEBPACK_IMPORTED_MODULE_1__angular_common__["b" /* CommonModule */],
            __WEBPACK_IMPORTED_MODULE_2__update_routing_module__["a" /* UpdateRoutingModule */]
        ],
        declarations: [__WEBPACK_IMPORTED_MODULE_3__update_update_component__["a" /* UpdateComponent */]]
    })
], UpdateModule);

//# sourceMappingURL=update.module.js.map

/***/ }),

/***/ "./src/app/core/update/update/update.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/core/update/update/update.component.html":
/***/ (function(module, exports) {

module.exports = "<br>\n<br>\n\n<h1>\n  {{message}} \n</h1>\n<h1 *ngIf=\"needsUpdating\">\n  Total updates applied: {{totalUpdatesApplied}}\n</h1>\n"

/***/ }),

/***/ "./src/app/core/update/update/update.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UpdateComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__window_ref_service__ = __webpack_require__("./src/app/core/window-ref.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__tangy_forms_tangy_form_service__ = __webpack_require__("./src/app/tangy-forms/tangy-form-service.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__updates__ = __webpack_require__("./src/app/core/update/update/updates.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_pouchdb__ = __webpack_require__("./node_modules/pouchdb/lib/index-browser.es.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};





var UpdateComponent = (function () {
    function UpdateComponent(windowRef) {
        this.windowRef = windowRef;
        this.message = 'Checking for updates...';
        this.totalUpdatesApplied = 0;
        this.needsUpdating = false;
    }
    UpdateComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var window, usersDb, response, usernames, _i, usernames_1, username, userDb, infoDoc, atUpdateIndex, lastUpdateIndex, requiresViewsRefresh, tangyFormService;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        window = this.windowRef.nativeWindow;
                        usersDb = new __WEBPACK_IMPORTED_MODULE_4_pouchdb__["default"]('users');
                        return [4 /*yield*/, usersDb.allDocs({ include_docs: true })];
                    case 1:
                        response = _a.sent();
                        usernames = response
                            .rows
                            .map(function (row) { return row.doc; })
                            .filter(function (doc) { return doc.hasOwnProperty('username'); })
                            .map(function (doc) { return doc.username; });
                        _i = 0, usernames_1 = usernames;
                        _a.label = 2;
                    case 2:
                        if (!(_i < usernames_1.length)) return [3 /*break*/, 12];
                        username = usernames_1[_i];
                        return [4 /*yield*/, new __WEBPACK_IMPORTED_MODULE_4_pouchdb__["default"](username)];
                    case 3:
                        userDb = _a.sent();
                        return [4 /*yield*/, userDb.get('info')];
                    case 4:
                        infoDoc = _a.sent();
                        atUpdateIndex = infoDoc.hasOwnProperty('atUpdateIndex') ? infoDoc.atUpdateIndex : 0;
                        lastUpdateIndex = __WEBPACK_IMPORTED_MODULE_3__updates__["a" /* updates */].length - 1;
                        if (!(lastUpdateIndex !== atUpdateIndex)) return [3 /*break*/, 11];
                        this.needsUpdating = true;
                        this.message = "Applying updates...";
                        requiresViewsRefresh = false;
                        _a.label = 5;
                    case 5:
                        if (!(lastUpdateIndex >= atUpdateIndex)) return [3 /*break*/, 7];
                        if (__WEBPACK_IMPORTED_MODULE_3__updates__["a" /* updates */][atUpdateIndex].requiresViewsUpdate) {
                            requiresViewsRefresh = true;
                        }
                        return [4 /*yield*/, __WEBPACK_IMPORTED_MODULE_3__updates__["a" /* updates */][atUpdateIndex].script(userDb)];
                    case 6:
                        _a.sent();
                        this.totalUpdatesApplied++;
                        atUpdateIndex++;
                        return [3 /*break*/, 5];
                    case 7:
                        atUpdateIndex--;
                        if (!requiresViewsRefresh) return [3 /*break*/, 9];
                        tangyFormService = new __WEBPACK_IMPORTED_MODULE_2__tangy_forms_tangy_form_service__["a" /* TangyFormService */](username);
                        return [4 /*yield*/, tangyFormService.initialize()];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        infoDoc.atUpdateIndex = atUpdateIndex;
                        return [4 /*yield*/, userDb.put(infoDoc)];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11:
                        _i++;
                        return [3 /*break*/, 2];
                    case 12:
                        this.message = '✓ Yay! You are up to date.';
                        return [2 /*return*/];
                }
            });
        });
    };
    return UpdateComponent;
}());
UpdateComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
        selector: 'app-update',
        template: __webpack_require__("./src/app/core/update/update/update.component.html"),
        styles: [__webpack_require__("./src/app/core/update/update/update.component.css")]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__window_ref_service__["a" /* WindowRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__window_ref_service__["a" /* WindowRef */]) === "function" && _a || Object])
], UpdateComponent);

var _a;
//# sourceMappingURL=update.component.js.map

/***/ }),

/***/ "./src/app/core/update/update/updates.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return updates; });
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var updates = [
    {
        requiresViewsUpdate: true,
        script: function (userDb) {
            return new Promise(function (resolve) {
                console.log("This update will never run :-).");
                resolve();
            });
        }
    },
    // Transform array style input.value from ['foo', 'bar'] to [{name: 'foo', value: 'on'}, {name: 'bar', value: 'on'}]
    {
        requiresViewsUpdate: false,
        script: function (userDb) {
            return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                var res, responseDocs, _i, responseDocs_1, responseDoc, _loop_1, _a, _b, input;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, userDb.allDocs({ include_docs: true })];
                        case 1:
                            res = _c.sent();
                            responseDocs = res.rows
                                .map(function (row) { return row.doc; })
                                .filter(function (doc) {
                                if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse') {
                                    return doc;
                                }
                            });
                            _i = 0, responseDocs_1 = responseDocs;
                            _c.label = 2;
                        case 2:
                            if (!(_i < responseDocs_1.length)) return [3 /*break*/, 5];
                            responseDoc = responseDocs_1[_i];
                            _loop_1 = function (input) {
                                if (input['tagName'] === 'TANGY-LOCATION') {
                                    if (input['value'] && Array.isArray(input['value'])) {
                                        var newValue_1 = [];
                                        input['value'].forEach(function (subInput) { return newValue_1.push({ name: subInput['level'], value: subInput['value'] }); });
                                        input['value'] = newValue_1;
                                    }
                                    else {
                                        input['value'] = [];
                                    }
                                }
                                if (input['tagName'] === 'TANGY-GPS') {
                                    if (input['value']) {
                                        var newValue = [];
                                        if (input['value']['recordedLatitude']) {
                                            newValue.push({ name: 'recordedLatitude', value: input['value']['recordedLatitude'] });
                                        }
                                        if (input['value']['recordedLongitude']) {
                                            newValue.push({ name: 'recordedLongitude', value: input['value']['recordedLongitude'] });
                                        }
                                        if (input['value']['recordedAccuracy']) {
                                            newValue.push({ name: 'recordedAccuracy', value: input['value']['recordedAccuracy'] });
                                        }
                                        input['value'] = newValue;
                                    }
                                    else {
                                        input['value'] = [];
                                    }
                                }
                                if (input['tagName'] === 'TANGY-RADIO-BUTTONS') {
                                    if (input['value']) {
                                        var newValue = [];
                                        newValue.push({ name: input['value'], value: 'on' });
                                        input['value'] = newValue;
                                    }
                                    else {
                                        input['value'] = [];
                                    }
                                }
                                if (input['tagName'] === 'TANGY-CHECKBOXES' || input['tagName'] === 'TANGY-TIMED') {
                                    var newValue_2 = [];
                                    if (Array.isArray(input['value'])) {
                                        input['value'].forEach(function (subinputName) { return newValue_2.push({ name: subinputName, value: 'on' }); });
                                        input['value'] = newValue_2;
                                    }
                                    else {
                                        input['value'] = [];
                                    }
                                }
                            };
                            for (_a = 0, _b = responseDoc['inputs']; _a < _b.length; _a++) {
                                input = _b[_a];
                                _loop_1(input);
                            }
                            return [4 /*yield*/, userDb.put(responseDoc)];
                        case 3:
                            _c.sent();
                            _c.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5:
                            resolve();
                            return [2 /*return*/];
                    }
                });
            }); });
        }
    },
    // Move inputs from TangyFormResponse.inputs to TangyFormResponse.items[index].inputs.
    {
        requiresViewsUpdate: false,
        script: function (userDb) {
            return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                var res, responseDocs, _loop_2, _i, responseDocs_2, responseDoc;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, userDb.allDocs({ include_docs: true })];
                        case 1:
                            res = _a.sent();
                            responseDocs = res.rows
                                .map(function (row) { return row.doc; })
                                .filter(function (doc) {
                                if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse') {
                                    return doc;
                                }
                            });
                            _loop_2 = function (responseDoc) {
                                var _loop_3, _i, _a, item;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _loop_3 = function (item) {
                                                if (item['inputs'] && Array.isArray(item['inputs'])) {
                                                    item['inputs'].forEach(function (inputName, itemInputIndex) {
                                                        if (typeof inputName === 'string') {
                                                            var input = responseDoc['inputs'].find(function (input) { return (inputName === input['name']); });
                                                            if (input) {
                                                                item['inputs'][itemInputIndex] = Object.assign({}, input);
                                                            }
                                                        }
                                                    });
                                                }
                                            };
                                            for (_i = 0, _a = responseDoc['items']; _i < _a.length; _i++) {
                                                item = _a[_i];
                                                _loop_3(item);
                                            }
                                            return [4 /*yield*/, userDb.put(responseDoc)];
                                        case 1:
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            _i = 0, responseDocs_2 = responseDocs;
                            _a.label = 2;
                        case 2:
                            if (!(_i < responseDocs_2.length)) return [3 /*break*/, 5];
                            responseDoc = responseDocs_2[_i];
                            return [5 /*yield**/, _loop_2(responseDoc)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5:
                            resolve();
                            return [2 /*return*/];
                    }
                });
            }); });
        }
    }
];
//# sourceMappingURL=updates.js.map

/***/ }),

/***/ "./src/app/core/window-ref.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return WindowRef; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

function _window() {
    // return the global native browser window object
    return window;
}
var WindowRef = (function () {
    function WindowRef() {
    }
    Object.defineProperty(WindowRef.prototype, "nativeWindow", {
        get: function () {
            return _window();
        },
        enumerable: true,
        configurable: true
    });
    return WindowRef;
}());
WindowRef = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])()
], WindowRef);

//# sourceMappingURL=window-ref.service.js.map

/***/ }),

/***/ "./src/app/shared/_components/redirect-to-default-route/redirect-to-default-route.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/shared/_components/redirect-to-default-route/redirect-to-default-route.component.html":
/***/ (function(module, exports) {

module.exports = "<p>\n\n</p>"

/***/ }),

/***/ "./src/app/shared/_components/redirect-to-default-route/redirect-to-default-route.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RedirectToDefaultRouteComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_app_config_service__ = __webpack_require__("./src/app/shared/_services/app-config.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};



var RedirectToDefaultRouteComponent = (function () {
    function RedirectToDefaultRouteComponent(router, appConfigService, activatedRoute) {
        this.router = router;
        this.appConfigService = appConfigService;
        this.activatedRoute = activatedRoute;
    }
    RedirectToDefaultRouteComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var defaultUrl, home_url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        defaultUrl = '/case-management';
                        return [4 /*yield*/, this.appConfigService.getDefaultURL()];
                    case 1:
                        home_url = _a.sent();
                        this.router.navigate([home_url]).then(function (data) {
                            /**
                             * When the user has supplied a route that cannot be matched from the
                             * app-config.json redirect the user to the default url
                             * It checks if the  current route after the  first router.navigate
                             * call is still the register route and redirects to the default url
                             */
                            if (_this.router.url === '/redirect') {
                                _this.router.navigate([defaultUrl]);
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return RedirectToDefaultRouteComponent;
}());
RedirectToDefaultRouteComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
        selector: 'app-redirect-to-default-route',
        template: __webpack_require__("./src/app/shared/_components/redirect-to-default-route/redirect-to-default-route.component.html"),
        styles: [__webpack_require__("./src/app/shared/_components/redirect-to-default-route/redirect-to-default-route.component.css")]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2__services_app_config_service__["a" /* AppConfigService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__services_app_config_service__["a" /* AppConfigService */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* ActivatedRoute */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* ActivatedRoute */]) === "function" && _c || Object])
], RedirectToDefaultRouteComponent);

var _a, _b, _c;
//# sourceMappingURL=redirect-to-default-route.component.js.map

/***/ }),

/***/ "./src/app/shared/_components/tangy-svg-logo/tangy-svg-logo.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/shared/_components/tangy-svg-logo/tangy-svg-logo.component.html":
/***/ (function(module, exports) {

module.exports = "<svg [ngStyle]=\"tangyLogoStyle\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 83.41 83.43\">\n  <defs>\n    <style>\n      .cls-1 {\n        fill: #fcb814;\n      }\n\n      .cls-2 {\n        fill: #f8f185;\n      }\n\n      .cls-3 {\n        fill: #f2682c;\n      }\n\n      .cls-4 {\n        fill: #f47820;\n      }\n\n      .cls-5 {\n        fill: #f2672b;\n      }\n\n      .cls-6 {\n        fill: #fff;\n      }\n    </style>\n  </defs>\n  <g id=\"Layer_2\" data-name=\"Layer 2\">\n    <g id=\"Layer_1-2\" data-name=\"Layer 1\">\n      <path d=\"M35.79 6.93a3.24 3.24 0 0 1 4.62 3.15l.71 25.74c.07 2.62-1.2 3.09-2.83 1l-16-20.22a3.23 3.23 0 0 1 1.52-5.36z\" class=\"cls-1\"\n      />\n      <circle cx=\"41.71\" cy=\"41.72\" r=\"40.28\" class=\"cls-2\" transform=\"rotate(-44.86 41.725 41.72)\" />\n      <path d=\"M41.72 83.43a41.72 41.72 0 0 1-29.43-71.28 41.72 41.72 0 1 1 58.85 59.13 41.45 41.45 0 0 1-29.42 12.15zm0-80.57a38.85 38.85 0 0 0-27.54 66.26 38.85 38.85 0 1 0 55.07-54.81A38.59 38.59 0 0 0 41.71 2.86z\"\n        class=\"cls-3\" />\n      <path d=\"M35.12 78.08a3.25 3.25 0 0 1-3.26-4.54L40 49.11c.83-2.49 2.19-2.49 3 0l8.15 24.49a3.23 3.23 0 0 1-3.26 4.52z\" class=\"cls-4\"\n      />\n      <path d=\"M59.5 74a3.24 3.24 0 0 1-5.42-1.38L44.61 48.7c-1-2.44.07-3.31 2.31-1.94l22 13.52a3.23 3.23 0 0 1 .4 5.56z\" class=\"cls-1\"\n      />\n      <path d=\"M75.56 55.24a3.25 3.25 0 0 1-5 2.43L47.88 45.41c-2.31-1.25-2.07-2.58.52-3l25.52-3.77a3.23 3.23 0 0 1 3.88 4z\" class=\"cls-5\"\n      />\n      <path d=\"M75.8 30.53a3.25 3.25 0 0 1-2.3 5.09l-25.23 5.17c-2.57.53-3.25-.65-1.51-2.61l17.13-19.29a3.23 3.23 0 0 1 5.54.57z\"\n        class=\"cls-4\" />\n      <path d=\"M60.09 11.45a3.24 3.24 0 0 1 1.52 5.38L45.6 37c-1.63 2.06-2.9 1.59-2.83-1l.72-25.79a3.23 3.23 0 0 1 4.61-3.15z\"\n        class=\"cls-5\" />\n      <path d=\"M35.79 6.93a3.24 3.24 0 0 1 4.62 3.15l.71 25.74c.07 2.62-1.2 3.09-2.83 1l-16-20.22a3.23 3.23 0 0 1 1.52-5.36z\" class=\"cls-1\"\n      />\n      <path d=\"M14.28 19.08a3.24 3.24 0 0 1 5.56-.56l17.09 19.27c1.74 2 1.06 3.14-1.51 2.61l-25.27-5.19a3.23 3.23 0 0 1-2.28-5.09z\"\n        class=\"cls-5\" />\n      <path d=\"M5.6 42.23a3.24 3.24 0 0 1 3.9-4L35 42c2.6.38 2.83 1.72.52 3L12.81 57.24a3.23 3.23 0 0 1-5-2.43z\" class=\"cls-4\"\n      />\n      <path d=\"M13.84 65.53a3.24 3.24 0 0 1 .41-5.53l21.94-13.53c2.24-1.37 3.27-.5 2.31 1.94l-9.5 24a3.23 3.23 0 0 1-5.41 1.36z\"\n        class=\"cls-1\" />\n      <path d=\"M26 74.83a3.84 3.84 0 0 1-2.46-1l-9.76-8.23a3.36 3.36 0 0 1 .43-5.77l21.92-13.46A3.73 3.73 0 0 1 38 45.7a1 1 0 0 1 .83.39c.32.46.26 1.28-.17 2.36l-9.5 24A3.42 3.42 0 0 1 26 74.83zm12-28.89a3.56 3.56 0 0 0-1.7.63L14.31 60.06a3.13 3.13 0 0 0-.4 5.38l9.76 8.23a3.6 3.6 0 0 0 2.3.93 3.19 3.19 0 0 0 2.91-2.24l9.5-24c.39-1 .46-1.75.2-2.14a.71.71 0 0 0-.58-.28z\"\n        class=\"cls-1\" />\n      <circle cx=\"41.72\" cy=\"42.53\" r=\"2.06\" class=\"cls-5\" transform=\"rotate(-44.86 41.72 42.527)\" />\n      <path d=\"M10.36 30.55c.42-.9 1.7-.75 2.84.33s.8 1.82-.77 1.64-2.5-1.06-2.07-1.97zm14.99 1.14c.42-.9 1.7-.75 2.85.33s.8 1.82-.77 1.64-2.5-1.07-2.08-1.97zm-1.5 36.02c-.83-.55-.5-1.79.74-2.77s1.91-.53 1.51 1-1.42 2.32-2.25 1.77zM54.39 57.6c-.82.56-1.85-.22-2.28-1.73s.24-2 1.49-1 1.61 2.13.79 2.73z\"\n        class=\"cls-6\" />\n    </g>\n  </g>\n</svg>\n"

/***/ }),

/***/ "./src/app/shared/_components/tangy-svg-logo/tangy-svg-logo.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TangySvgLogoComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var TangySvgLogoComponent = (function () {
    function TangySvgLogoComponent() {
    }
    TangySvgLogoComponent.prototype.ngOnInit = function () {
    };
    return TangySvgLogoComponent;
}());
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* Input */])(),
    __metadata("design:type", Object)
], TangySvgLogoComponent.prototype, "tangyLogoStyle", void 0);
TangySvgLogoComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
        selector: 'app-tangy-svg-logo',
        template: __webpack_require__("./src/app/shared/_components/tangy-svg-logo/tangy-svg-logo.component.html"),
        styles: [__webpack_require__("./src/app/shared/_components/tangy-svg-logo/tangy-svg-logo.component.css")]
    }),
    __metadata("design:paramtypes", [])
], TangySvgLogoComponent);

//# sourceMappingURL=tangy-svg-logo.component.js.map

/***/ }),

/***/ "./src/app/shared/_components/tangy-tooltip/tangy-tooltip.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/shared/_components/tangy-tooltip/tangy-tooltip.component.html":
/***/ (function(module, exports) {

module.exports = "<span [matTooltip]=\"tangyToolTipText\">{{tangyToolTipText|truncateValuePipe:truncateLength}}</span>"

/***/ }),

/***/ "./src/app/shared/_components/tangy-tooltip/tangy-tooltip.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TangyTooltipComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var TangyTooltipComponent = (function () {
    function TangyTooltipComponent() {
    }
    TangyTooltipComponent.prototype.ngOnInit = function () {
    };
    return TangyTooltipComponent;
}());
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* Input */])(),
    __metadata("design:type", Object)
], TangyTooltipComponent.prototype, "tangyToolTipText", void 0);
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["F" /* Input */])(),
    __metadata("design:type", Object)
], TangyTooltipComponent.prototype, "truncateLength", void 0);
TangyTooltipComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
        selector: 'app-tangy-tooltip',
        template: __webpack_require__("./src/app/shared/_components/tangy-tooltip/tangy-tooltip.component.html"),
        styles: [__webpack_require__("./src/app/shared/_components/tangy-tooltip/tangy-tooltip.component.css")]
    }),
    __metadata("design:paramtypes", [])
], TangyTooltipComponent);

//# sourceMappingURL=tangy-tooltip.component.js.map

/***/ }),

/***/ "./src/app/shared/_directives/seamless-with-window.directive.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SeamlessWithWindowDirective; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__core_window_ref_service__ = __webpack_require__("./src/app/core/window-ref.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var SeamlessWithWindowDirective = (function () {
    function SeamlessWithWindowDirective(el, windowRef) {
        this.el = el;
        this.windowRef = windowRef;
        this.setIframeDimensions();
    }
    SeamlessWithWindowDirective.prototype.onResize = function (event) {
        this.setIframeDimensions();
    };
    SeamlessWithWindowDirective.prototype.setIframeDimensions = function () {
        this.el.nativeElement.style.width = this.windowRef.nativeWindow.innerWidth + 'px';
        this.el.nativeElement.style.position = 'fixed';
        this.el.nativeElement.style.height = this.windowRef.nativeWindow.innerHeight - 73 + 'px';
        this.el.nativeElement.style.left = 0;
    };
    return SeamlessWithWindowDirective;
}());
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["A" /* HostListener */])('window:resize', ['$event']),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SeamlessWithWindowDirective.prototype, "onResize", null);
SeamlessWithWindowDirective = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["u" /* Directive */])({
        selector: '[appSeamlessWithWindow]'
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["v" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["v" /* ElementRef */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__core_window_ref_service__["a" /* WindowRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__core_window_ref_service__["a" /* WindowRef */]) === "function" && _b || Object])
], SeamlessWithWindowDirective);

var _a, _b;
//# sourceMappingURL=seamless-with-window.directive.js.map

/***/ }),

/***/ "./src/app/shared/_pipes/truncate-value.pipe.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TruncateValuePipe; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var TruncateValuePipe = (function () {
    function TruncateValuePipe() {
    }
    /**
     * @ngModule SharedModule
     * @whatItDoes Transforms text by truncating it
     * @howToUse `value | truncateString[:characters:[ellipsis]]`
     *
     * @param value is any valid JavaScript Value
     * @param characters is the number of characters to show
     * @param ellipsis is the text that is appended to the transformed value to show that
     *  the value is truncated
     * @returns {string} the transformed text
     * @TODO: add examples
     *
     */
    TruncateValuePipe.prototype.transform = function (value, characters, ellipsis) {
        value = value ? value.toString() : '';
        characters = characters ? characters : value.length;
        if (value.length <= characters || value.characters < 1) {
            return value.toString();
        }
        ellipsis = ellipsis ? ellipsis : '...';
        value = value.slice(0, characters);
        return value + ellipsis;
    };
    return TruncateValuePipe;
}());
TruncateValuePipe = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["X" /* Pipe */])({
        name: 'truncateValuePipe'
    })
], TruncateValuePipe);

//# sourceMappingURL=truncate-value.pipe.js.map

/***/ }),

/***/ "./src/app/shared/_services/app-config.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppConfigService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__("./node_modules/@angular/http/@angular/http.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};


var AppConfigService = (function () {
    function AppConfigService(http) {
        this.http = http;
    }
    AppConfigService.prototype.getAppConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, appConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.http.get('../content/app-config.json').toPromise()];
                    case 1:
                        res = _a.sent();
                        appConfig = res.json();
                        return [2 /*return*/, appConfig];
                }
            });
        });
    };
    AppConfigService.prototype.getDefaultURL = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAppConfig()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.homeUrl];
                }
            });
        });
    };
    return AppConfigService;
}());
AppConfigService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Http */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Http */]) === "function" && _a || Object])
], AppConfigService);

var _a;
//# sourceMappingURL=app-config.service.js.map

/***/ }),

/***/ "./src/app/shared/shared.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SharedModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_common__ = __webpack_require__("./node_modules/@angular/common/@angular/common.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_material_tooltip__ = __webpack_require__("./node_modules/@angular/material/esm5/tooltip.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_app_shared_services_app_config_service__ = __webpack_require__("./src/app/shared/_services/app-config.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__tangy_forms_safe_url_pipe__ = __webpack_require__("./src/app/tangy-forms/safe-url.pipe.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__components_redirect_to_default_route_redirect_to_default_route_component__ = __webpack_require__("./src/app/shared/_components/redirect-to-default-route/redirect-to-default-route.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__components_tangy_svg_logo_tangy_svg_logo_component__ = __webpack_require__("./src/app/shared/_components/tangy-svg-logo/tangy-svg-logo.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__components_tangy_tooltip_tangy_tooltip_component__ = __webpack_require__("./src/app/shared/_components/tangy-tooltip/tangy-tooltip.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__directives_seamless_with_window_directive__ = __webpack_require__("./src/app/shared/_directives/seamless-with-window.directive.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__pipes_truncate_value_pipe__ = __webpack_require__("./src/app/shared/_pipes/truncate-value.pipe.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};










var SharedModule = (function () {
    function SharedModule() {
    }
    return SharedModule;
}());
SharedModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["M" /* NgModule */])({
        imports: [
            __WEBPACK_IMPORTED_MODULE_0__angular_common__["b" /* CommonModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_material_tooltip__["a" /* MatTooltipModule */]
        ],
        providers: [__WEBPACK_IMPORTED_MODULE_3_app_shared_services_app_config_service__["a" /* AppConfigService */]],
        declarations: [__WEBPACK_IMPORTED_MODULE_4__tangy_forms_safe_url_pipe__["a" /* SafeUrlPipe */],
            __WEBPACK_IMPORTED_MODULE_8__directives_seamless_with_window_directive__["a" /* SeamlessWithWindowDirective */], __WEBPACK_IMPORTED_MODULE_6__components_tangy_svg_logo_tangy_svg_logo_component__["a" /* TangySvgLogoComponent */],
            __WEBPACK_IMPORTED_MODULE_9__pipes_truncate_value_pipe__["a" /* TruncateValuePipe */], __WEBPACK_IMPORTED_MODULE_7__components_tangy_tooltip_tangy_tooltip_component__["a" /* TangyTooltipComponent */],
            __WEBPACK_IMPORTED_MODULE_5__components_redirect_to_default_route_redirect_to_default_route_component__["a" /* RedirectToDefaultRouteComponent */]],
        exports: [__WEBPACK_IMPORTED_MODULE_5__components_redirect_to_default_route_redirect_to_default_route_component__["a" /* RedirectToDefaultRouteComponent */], __WEBPACK_IMPORTED_MODULE_4__tangy_forms_safe_url_pipe__["a" /* SafeUrlPipe */],
            __WEBPACK_IMPORTED_MODULE_8__directives_seamless_with_window_directive__["a" /* SeamlessWithWindowDirective */], __WEBPACK_IMPORTED_MODULE_6__components_tangy_svg_logo_tangy_svg_logo_component__["a" /* TangySvgLogoComponent */],
            __WEBPACK_IMPORTED_MODULE_9__pipes_truncate_value_pipe__["a" /* TruncateValuePipe */], __WEBPACK_IMPORTED_MODULE_7__components_tangy_tooltip_tangy_tooltip_component__["a" /* TangyTooltipComponent */]]
    })
], SharedModule);

//# sourceMappingURL=shared.module.js.map

/***/ }),

/***/ "./src/app/tangy-forms/safe-url.pipe.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SafeUrlPipe; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__("./node_modules/@angular/platform-browser/@angular/platform-browser.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var SafeUrlPipe = (function () {
    function SafeUrlPipe(sanitizer) {
        this.sanitizer = sanitizer;
    }
    SafeUrlPipe.prototype.transform = function (url) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    };
    return SafeUrlPipe;
}());
SafeUrlPipe = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["X" /* Pipe */])({
        name: 'safeUrl'
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["c" /* DomSanitizer */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["c" /* DomSanitizer */]) === "function" && _a || Object])
], SafeUrlPipe);

var _a;
//# sourceMappingURL=safe-url.pipe.js.map

/***/ }),

/***/ "./src/app/tangy-forms/tangy-form-service.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export tangyFormDesignDoc */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_pouchdb__ = __webpack_require__("./node_modules/pouchdb/lib/index-browser.es.js");


class TangyFormService {

  constructor(props) {
    this.databaseName = 'tangy-forms'
    Object.assign(this, props)
    this.db = new __WEBPACK_IMPORTED_MODULE_0_pouchdb__["default"](this.databaseName)
  }

  async initialize() {
    try { 
      let designDoc = await this.db.get('_design/tangy-form')
      if (designDoc.version !== tangyFormDesignDoc.version) {
        let updatedDesignDoc = Object.assign({}, designDoc, tangyFormDesignDoc)
        await this.db.put(updatedDesignDoc)
      }
    } catch (e) {
      ``
      this.loadDesignDoc()
    }
  }


  async loadDesignDoc() {
    await this.db.put(tangyFormDesignDoc)
  }

  async getForm(formId) {
    let results = await this.db.query('tangy-form/formByFormId', { key: formId, include_docs: true })
    if (results.rows.length == 0) {
      return false
    } else {
      return results.rows[0].doc
    }
  }

  async saveForm(formDoc) {
    let r
    if (!formDoc._id) {
      r = await this.db.post(formDoc)
    }
    else {
      r = await this.db.put(formDoc)
    }
    return await this.db.get(r.id)
  }

  // Would be nice if this was queue based so if two saves get called at the same time, the differentials are sequentials updated
  // into the database. Using a getter and setter for property fields, this would be one way to queue.
  async saveResponse(responseDoc) {
    let r
    if (!responseDoc._id) {
      r = await this.db.post(responseDoc)
    }
    else {
      r = await this.db.put(responseDoc)
    }
    return await this.db.get(r.id)

  }

  async getResponse(responseId) {
    try {
      let doc = await this.db.get(responseId)
      return doc
    } catch (e) {
      return false
    }
  }

  async getResponsesByFormId(formId) {
    let r = await this.db.query('tangy-form/responsesByFormId', { key: formId, include_docs: true })
    return r.rows.map((row) => row.doc)
  }

  async getResponsesByLocationId(locationId) {
    let r = await this.db.query('tangy-form/responsesByLocationId', { key: locationId, include_docs: true })
    return r.rows.map((row) => row.doc)
  }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = TangyFormService;


var tangyFormDesignDoc = {
  _id: '_design/tangy-form',
  version: '14',
  views: {
    responsesByFormId: {
      map: function (doc) {
        if (doc.collection !== 'TangyFormResponse') return
        emit(`${doc.form.id}`, true)
      }.toString()
    },
    responsesLockedAndNotUploaded: {
      map: function (doc) {
        if (doc.collection === 'TangyFormResponse' && doc.complete === true && !doc.uploadDatetime) {
          emit(doc._id, true)
        }
      }.toString()
    },
    responsesLockedAndUploaded: {
      map: function (doc) {
        if (doc.collection === 'TangyFormResponse' && doc.complete === true && !!doc.uploadDatetime) {
          emit(doc._id, true)
        }
      }.toString()
    },
    responsesByLocationId: {
      map: function (doc) {
        if (doc.hasOwnProperty('collection') && doc.collection === 'TangyFormResponse' && doc.complete === true && doc.hasOwnProperty('inputs')) {
          const locationFields = doc.inputs.filter(input => input.hasOwnProperty('tagName') && input.tagName === 'TANGY-LOCATION')
          if (!locationFields || locationFields.length === 0) {
            return;
          }
          locationFields.forEach((field) => {
            const thisLocationId = field.value[field.value.length - 1].value;
            emit(thisLocationId, true)
          })
        }
      }.toString()
    },
    responsesThisMonthByLocationId: {
      map: function (doc) {
        const currentDate = new Date();
        const startDatetime = new Date(doc.startDatetime)
        if (doc.hasOwnProperty('collection')
          && doc.collection === 'TangyFormResponse'
          && startDatetime.getMonth() === currentDate.getMonth() && startDatetime.getFullYear() === currentDate.getFullYear()
          && doc.complete === true && doc.hasOwnProperty('inputs')) {
          const locationFields = doc.inputs.filter(input => input.hasOwnProperty('tagName') && input.tagName === 'TANGY-LOCATION')
          if (!locationFields || locationFields.length === 0) {
            return;
          }
          locationFields.forEach((field) => {
            const thisLocationId = field.value[field.value.length - 1].value;
            emit(thisLocationId, true)
          })
        }
      }.toString()
    },
    responsesByFormIdAndStartDatetime: {
      map: function (doc) {
        if (doc.collection !== 'TangyFormResponse') return
        emit(`${doc.form.id}-${doc.startDatetime}`, true)
      }.toString()
    },
    responseByUploadDatetime: {
      map: function (doc) {
        if (doc.collection !== 'TangyFormResponse') return
        emit(doc.uploadDatetime, true)
      }.toString()
    }
  }
}




/***/ }),

/***/ "./src/app/tangy-forms/tangy-forms-player/tangy-forms-player.component.css":
/***/ (function(module, exports) {

module.exports = "iframe {\n    border: none;\n    /* position: fixed; */\n    /* top: 80px; */\n    /* left: 0px; */\n    width: 100%;\n    height: 100vh;\n}\n"

/***/ }),

/***/ "./src/app/tangy-forms/tangy-forms-player/tangy-forms-player.component.html":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/tangy-forms/tangy-forms-player/tangy-forms-player.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TangyFormsPlayerComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__case_management_services_case_management_service__ = __webpack_require__("./src/app/case-management/_services/case-management.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__core_auth_services_user_service__ = __webpack_require__("./src/app/core/auth/_services/user.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__core_window_ref_service__ = __webpack_require__("./src/app/core/window-ref.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};





var TangyFormsPlayerComponent = (function () {
    function TangyFormsPlayerComponent(caseManagementService, route, userService, windowRef) {
        this.caseManagementService = caseManagementService;
        this.route = route;
        this.userService = userService;
        this.windowRef = windowRef;
    }
    TangyFormsPlayerComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.queryParams.subscribe(function (params) {
            _this.formIndex = +params['formIndex'] || 0;
            _this.responseId = params['responseId'];
            _this.getForm(_this.formIndex);
        });
    };
    TangyFormsPlayerComponent.prototype.getForm = function (index) {
        if (index === void 0) { index = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var userDB, form, formUrl, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.userService.getUserDatabase()];
                    case 1:
                        userDB = _a.sent();
                        return [4 /*yield*/, this.caseManagementService.getFormList()];
                    case 2:
                        form = _a.sent();
                        if (!(index >= form.length)) {
                            formUrl = "../tangy-forms/index.html#form_src=" + form[index]['src'] + "&database_name=" + userDB;
                            if (this.responseId) {
                                formUrl += "&response_id=" + this.responseId;
                            }
                            this.windowRef.nativeWindow.location = formUrl;
                        }
                        else {
                            console.error('Item not Found');
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Could not load list of Forms');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return TangyFormsPlayerComponent;
}());
TangyFormsPlayerComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
        selector: 'app-tangy-forms-player',
        template: __webpack_require__("./src/app/tangy-forms/tangy-forms-player/tangy-forms-player.component.html"),
        styles: [__webpack_require__("./src/app/tangy-forms/tangy-forms-player/tangy-forms-player.component.css")]
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_2__case_management_services_case_management_service__["a" /* CaseManagementService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__case_management_services_case_management_service__["a" /* CaseManagementService */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* ActivatedRoute */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* ActivatedRoute */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_3__core_auth_services_user_service__["a" /* UserService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__core_auth_services_user_service__["a" /* UserService */]) === "function" && _c || Object, typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_4__core_window_ref_service__["a" /* WindowRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_4__core_window_ref_service__["a" /* WindowRef */]) === "function" && _d || Object])
], TangyFormsPlayerComponent);

var _a, _b, _c, _d;
//# sourceMappingURL=tangy-forms-player.component.js.map

/***/ }),

/***/ "./src/app/tangy-forms/tangy-forms-routing.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TangyFormsRoutingModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_app_user_profile_create_profile_guard_service__ = __webpack_require__("./src/app/user-profile/create-profile-guard.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__core_auth_guards_login_guard_service__ = __webpack_require__("./src/app/core/auth/_guards/login-guard.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__tangy_forms_player_tangy_forms_player_component__ = __webpack_require__("./src/app/tangy-forms/tangy-forms-player/tangy-forms-player.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





var routes = [{
        path: 'tangy-forms-player',
        component: __WEBPACK_IMPORTED_MODULE_4__tangy_forms_player_tangy_forms_player_component__["a" /* TangyFormsPlayerComponent */],
        canActivate: [__WEBPACK_IMPORTED_MODULE_3__core_auth_guards_login_guard_service__["a" /* LoginGuard */], __WEBPACK_IMPORTED_MODULE_2_app_user_profile_create_profile_guard_service__["a" /* CreateProfileGuardService */]]
    }
];
var TangyFormsRoutingModule = (function () {
    function TangyFormsRoutingModule() {
    }
    return TangyFormsRoutingModule;
}());
TangyFormsRoutingModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* NgModule */])({
        imports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */].forChild(routes)],
        exports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */]]
    })
], TangyFormsRoutingModule);

//# sourceMappingURL=tangy-forms-routing.module.js.map

/***/ }),

/***/ "./src/app/tangy-forms/tangy-forms.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TangyFormsModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__shared_shared_module__ = __webpack_require__("./src/app/shared/shared.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_common__ = __webpack_require__("./node_modules/@angular/common/@angular/common.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__tangy_forms_routing_module__ = __webpack_require__("./src/app/tangy-forms/tangy-forms-routing.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__tangy_forms_player_tangy_forms_player_component__ = __webpack_require__("./src/app/tangy-forms/tangy-forms-player/tangy-forms-player.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};





var TangyFormsModule = (function () {
    function TangyFormsModule() {
    }
    return TangyFormsModule;
}());
TangyFormsModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["M" /* NgModule */])({
        imports: [
            __WEBPACK_IMPORTED_MODULE_2__angular_common__["b" /* CommonModule */],
            __WEBPACK_IMPORTED_MODULE_3__tangy_forms_routing_module__["a" /* TangyFormsRoutingModule */],
            __WEBPACK_IMPORTED_MODULE_0__shared_shared_module__["a" /* SharedModule */]
        ],
        declarations: [__WEBPACK_IMPORTED_MODULE_4__tangy_forms_player_tangy_forms_player_component__["a" /* TangyFormsPlayerComponent */]]
    })
], TangyFormsModule);

//# sourceMappingURL=tangy-forms.module.js.map

/***/ }),

/***/ "./src/app/user-profile/create-profile-guard.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CreateProfileGuardService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_app_core_auth_services_user_service__ = __webpack_require__("./src/app/core/auth/_services/user.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_pouchdb__ = __webpack_require__("./node_modules/pouchdb/lib/index-browser.es.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};




var CreateProfileGuardService = (function () {
    function CreateProfileGuardService(router, userService) {
        this.router = router;
        this.userService = userService;
    }
    CreateProfileGuardService.prototype.canActivate = function (route, state) {
        return __awaiter(this, void 0, void 0, function () {
            var isProfileComplete, _a, results, responseDoc;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        isProfileComplete = false;
                        _a = this;
                        return [4 /*yield*/, this.userService.getUserDatabase()];
                    case 1:
                        _a.userDatabase = _b.sent();
                        this.DB = new __WEBPACK_IMPORTED_MODULE_3_pouchdb__["default"](this.userDatabase);
                        return [4 /*yield*/, this.DB.query('tangy-form/responsesByFormId', {
                                key: 'user-profile',
                                include_docs: true
                            })];
                    case 2:
                        results = _b.sent();
                        if (results.rows.length === 0) {
                            isProfileComplete = false;
                        }
                        else {
                            responseDoc = results.rows[0].doc;
                            isProfileComplete = responseDoc.items.find(function (item) {
                                return (item.incomplete === true);
                            }) ? false : true;
                        }
                        if (!isProfileComplete) {
                            this.router.navigate(['/manage-user-profile'], { queryParams: { returnUrl: state.url } });
                        }
                        return [2 /*return*/, isProfileComplete];
                }
            });
        });
    };
    return CreateProfileGuardService;
}());
CreateProfileGuardService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2_app_core_auth_services_user_service__["a" /* UserService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2_app_core_auth_services_user_service__["a" /* UserService */]) === "function" && _b || Object])
], CreateProfileGuardService);

var _a, _b;
//# sourceMappingURL=create-profile-guard.service.js.map

/***/ }),

/***/ "./src/app/user-profile/user-profile-routing.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UserProfileRoutingModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__core_auth_guards_login_guard_service__ = __webpack_require__("./src/app/core/auth/_guards/login-guard.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__user_profile_component__ = __webpack_require__("./src/app/user-profile/user-profile.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};




var routes = [{
        path: 'manage-user-profile',
        component: __WEBPACK_IMPORTED_MODULE_3__user_profile_component__["a" /* UserProfileComponent */],
        canActivate: [__WEBPACK_IMPORTED_MODULE_2__core_auth_guards_login_guard_service__["a" /* LoginGuard */]]
    }];
var UserProfileRoutingModule = (function () {
    function UserProfileRoutingModule() {
    }
    return UserProfileRoutingModule;
}());
UserProfileRoutingModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* NgModule */])({
        imports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */].forChild(routes)],
        exports: [__WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */]],
        declarations: []
    })
], UserProfileRoutingModule);

//# sourceMappingURL=user-profile-routing.module.js.map

/***/ }),

/***/ "./src/app/user-profile/user-profile.component.css":
/***/ (function(module, exports) {

module.exports = "iframe {\n    border: none;\n    /* position: fixed; */\n    /* top: 80px; */\n    /* left: 0px; */\n  \n    position: absolute; height:100%; width:100%;\n}\n"

/***/ }),

/***/ "./src/app/user-profile/user-profile.component.html":
/***/ (function(module, exports) {

module.exports = "<iframe *ngIf=\"formUrl\" id=\"ifr\" [src]=\"formUrl|safeUrl\" appSeamlessWithWindow #iframe>\n</iframe>\n"

/***/ }),

/***/ "./src/app/user-profile/user-profile.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UserProfileComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__core_auth_services_user_service__ = __webpack_require__("./src/app/core/auth/_services/user.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__tangy_forms_tangy_form_service_js__ = __webpack_require__("./src/app/tangy-forms/tangy-form-service.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};




var UserProfileComponent = (function () {
    function UserProfileComponent(route, router, userService) {
        this.route = route;
        this.router = router;
        this.userService = userService;
    }
    UserProfileComponent.prototype.ngOnInit = function () {
        this.getForm();
    };
    UserProfileComponent.prototype.ngAfterContentInit = function () {
    };
    UserProfileComponent.prototype.getForm = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var userDbName, tangyFormService, profileDocs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userService.getUserDatabase()];
                    case 1:
                        userDbName = _a.sent();
                        tangyFormService = new __WEBPACK_IMPORTED_MODULE_3__tangy_forms_tangy_form_service_js__["a" /* TangyFormService */]({ databaseName: userDbName });
                        return [4 /*yield*/, tangyFormService.getResponsesByFormId('user-profile')];
                    case 2:
                        profileDocs = _a.sent();
                        if (profileDocs.length > 0) {
                            this.formUrl = "../tangy-forms/index.html#form_src=../content/user-profile/form.html&hide_top_bar=true&database_name=" + userDbName + "&response_id=" + profileDocs[0]._id;
                        }
                        else {
                            this.formUrl = "../tangy-forms/index.html#form_src=../content/user-profile/form.html&hide_top_bar=true&database_name=" + userDbName;
                        }
                        // This protects against binding again an element that does not yet exist because the
                        // the this.formUrl property was just set, the *ngIf="formUrl" on iframe will be in the
                        // process of producing that element.
                        setTimeout(function () {
                            _this.iframe.nativeElement.addEventListener('ALL_ITEMS_CLOSED', function () {
                                // navigate to homescreen
                                _this.router.navigate(['/case-management']);
                            });
                        }, 1500);
                        return [2 /*return*/];
                }
            });
        });
    };
    return UserProfileComponent;
}());
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_16" /* ViewChild */])('iframe'),
    __metadata("design:type", typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["v" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["v" /* ElementRef */]) === "function" && _a || Object)
], UserProfileComponent.prototype, "iframe", void 0);
UserProfileComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
        selector: 'app-user-profile',
        template: __webpack_require__("./src/app/user-profile/user-profile.component.html"),
        styles: [__webpack_require__("./src/app/user-profile/user-profile.component.css")]
    }),
    __metadata("design:paramtypes", [typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* ActivatedRoute */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* ActivatedRoute */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === "function" && _c || Object, typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_2__core_auth_services_user_service__["a" /* UserService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__core_auth_services_user_service__["a" /* UserService */]) === "function" && _d || Object])
], UserProfileComponent);

var _a, _b, _c, _d;
//# sourceMappingURL=user-profile.component.js.map

/***/ }),

/***/ "./src/app/user-profile/user-profile.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UserProfileModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_common__ = __webpack_require__("./node_modules/@angular/common/@angular/common.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__shared_shared_module__ = __webpack_require__("./src/app/shared/shared.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__create_profile_guard_service__ = __webpack_require__("./src/app/user-profile/create-profile-guard.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__user_profile_routing_module__ = __webpack_require__("./src/app/user-profile/user-profile-routing.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__user_profile_component__ = __webpack_require__("./src/app/user-profile/user-profile.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};







var UserProfileModule = (function () {
    function UserProfileModule() {
    }
    return UserProfileModule;
}());
UserProfileModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["M" /* NgModule */])({
        providers: [__WEBPACK_IMPORTED_MODULE_4__create_profile_guard_service__["a" /* CreateProfileGuardService */]],
        imports: [
            __WEBPACK_IMPORTED_MODULE_0__angular_common__["b" /* CommonModule */],
            __WEBPACK_IMPORTED_MODULE_5__user_profile_routing_module__["a" /* UserProfileRoutingModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_material__["f" /* MatListModule */],
            __WEBPACK_IMPORTED_MODULE_3__shared_shared_module__["a" /* SharedModule */]
        ],
        declarations: [__WEBPACK_IMPORTED_MODULE_6__user_profile_component__["a" /* UserProfileComponent */]]
    })
], UserProfileModule);

//# sourceMappingURL=user-profile.module.js.map

/***/ }),

/***/ "./src/environments/environment.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
// The file contents for the current environment will overwrite these during build.
var environment = {
    production: false,
    securityPolicy: ['password'],
    uploadUserCredentials: {
        username: 'admin',
        password: 'password'
    },
    remoteCouchDBHost: 'http://admin:password@localhost:5984/',
    databasesToSync: ['tangerine-form-sessions', 'groups', 'locations']
};
//# sourceMappingURL=environment.js.map

/***/ }),

/***/ "./src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__("./node_modules/@angular/platform-browser-dynamic/@angular/platform-browser-dynamic.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__("./src/app/app.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__("./src/environments/environment.ts");




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_23" /* enableProdMode */])();
}
Object(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("./src/main.ts");


/***/ })

},[0]);
//# sourceMappingURL=main.bundle.js.map