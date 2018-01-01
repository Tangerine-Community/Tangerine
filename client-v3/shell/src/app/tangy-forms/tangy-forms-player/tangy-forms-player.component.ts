import { UserService } from '../../core/auth/_services/user.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CaseManagementService } from '../../case-management/_services/case-management.service';
import { Component, Input, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-tangy-forms-player',
  templateUrl: './tangy-forms-player.component.html',
  styleUrls: ['./tangy-forms-player.component.css']
})
export class TangyFormsPlayerComponent implements OnInit {
  formUrl;
  formIndex: number;
  constructor(
    private caseManagementService: CaseManagementService,
    private route: ActivatedRoute,
    private userService: UserService,
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.formIndex = +params['formIndex'] || 0;
      this.getForm(this.formIndex);
    });
  }
  async getForm(index = 0) {
    try {
      const userDB = await this.userService.getUserDatabase();
      const form = await this.caseManagementService.getFormList();
      if (!(index >= form.length)) {
        this.elementRef.nativeElement.innerHTML = `<iframe src="../tangy-forms/index.html#form=/content/${form[index]['src']}&database=${userDB}"></iframe>`
        let iframeEl = this.elementRef.nativeElement.querySelector('iframe')
        iframeEl.style.border = `none`
        iframeEl.style.height = `${window.innerHeight - 70}px`
        iframeEl.style.width = '100%'
        //this.formUrl = `../tangy-forms/index.html#form=/content/${form[index]['src']}&database=${userDB}`;
        //setTimout(() => {
        //this.formUrl = `../tangy-forms/index.html#form=/content/${form[index]['src']}&database=${userDB}`;
        //}, 2000)
      } else {
        console.error('Item not Found');
      }
    } catch (error) {
      console.error('Could not load list of Forms');
    }
  }

}
