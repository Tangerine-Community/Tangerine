import { Component, OnInit, ViewChild, ElementRef, AfterContentChecked, AfterContentInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-group-media',
  templateUrl: './group-media.component.html',
  styleUrls: ['./group-media.component.css']
})
export class GroupMediaComponent implements AfterContentInit {

  thereIsSelection = false
  selection = []
  @ViewChild('list') listEl: ElementRef;
  @ViewChild('upload') uploadEl: ElementRef;

  constructor(
    private http: HttpClient
  ) { }

  ngAfterContentInit() {
    //debugger
    //this.listEl.nativeElement.addEventListener('change', () => this.onListChange())
    this.listEl.nativeElement.setAttribute('endpoint', './media-list')
    this.uploadEl.nativeElement.addEventListener('upload-success', () => this.listEl.nativeElement.setAttribute('endpoint', './media-list'))
  }

  async onDeleteClick() {
    const paths = this.listEl.nativeElement.shadowRoot.querySelector('file-list').files.reduce((selection, file) => {
      return file.selected
        ? [...selection, file.path]
        : selection
    }, []) 
    //await this.http.post('./media-delete', { params: new HttpParams().set('paths', paths) }).toPromise()
    await this.http.post('./media-delete', { paths }).toPromise()
    this.listEl.nativeElement.setAttribute('endpoint', './media-list')
  }

}
