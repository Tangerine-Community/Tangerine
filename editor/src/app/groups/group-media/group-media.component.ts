import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Component, OnInit, ViewChild, ElementRef, AfterContentChecked, AfterContentInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-group-media',
  templateUrl: './group-media.component.html',
  styleUrls: ['./group-media.component.css']
})
export class GroupMediaComponent implements OnInit, AfterContentInit {

  title = _TRANSLATE('Media Library')
  breadcrumbs:Array<Breadcrumb> = []
 
  thereIsSelection = false
  selection = []
  @ViewChild('list', {static: true}) listEl: ElementRef;
  @ViewChild('upload', {static: true}) uploadEl: ElementRef;
  private groupId: string;

  constructor(
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.groupId = window.location.hash.split('/')[2]
  }

  ngAfterContentInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Media Library'),
        url: 'media-library'
      }
    ] 
    //debugger
    //this.listEl.nativeElement.addEventListener('change', () => this.onListChange())
    try {
      this.listEl.nativeElement.setAttribute('endpoint', './media-list')
    } catch (e) {
      console.log(e)
    }
    this.uploadEl.nativeElement.addEventListener('upload-success', () => this.listEl.nativeElement.setAttribute('endpoint', './media-list'))
  }

  async onDeleteClick() {
    const pathsThatAreSelected = this.listEl.nativeElement.shadowRoot.querySelector('file-list').files.reduce((pathsThatAreSelected, file) => {
      return file.selected
        ? [...pathsThatAreSelected, file.path]
        : pathsThatAreSelected
    }, []) 
    await this.http.post('./media-delete', { paths: pathsThatAreSelected }).toPromise()
    this.listEl.nativeElement.setAttribute('endpoint', './media-list')
  }

}
