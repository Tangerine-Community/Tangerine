import { SafeUrlPipe } from './safe-url.pipe';
import {BrowserModule, DomSanitizer} from "@angular/platform-browser";
import {ComponentFixture, TestBed} from "@angular/core/testing";

describe('SafeUrlPipe', () => {

    let componentService: DomSanitizer;
    let fixture: ComponentFixture<SafeUrlPipe>;

    beforeEach(() => {
      TestBed
        .configureTestingModule({
          imports: [
            BrowserModule
          ],
          providers: [
            {
              provide: DomSanitizer,
              useValue: {
                sanitize: () => 'safeString',
                bypassSecurityTrustHtml: () => 'safeString'
              }
            },
            // more providers
          ]
        });
    });
  it('create an instance', () => {
    componentService = fixture.debugElement.injector.get(DomSanitizer);
    const pipe = new SafeUrlPipe(componentService);
    expect(pipe).toBeTruthy();
  });
});
