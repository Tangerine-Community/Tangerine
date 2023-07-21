import {AfterContentInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import {FileUploadService} from "./services/file-upload.service";
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
})
export class FileUploadComponent implements OnInit, AfterContentInit {

  currentFile?: File;
  progress = 0;
  message = '';

  fileName = 'Select File';
  // fileInfos?: Observable<any>;
  @ViewChild('list', {static: true}) listEl: ElementRef;

  constructor(
    private uploadService: FileUploadService,
    private http: HttpClient
  ) { }

  ngAfterContentInit(): void {
    try {
      this.listEl.nativeElement.setAttribute('endpoint', './media-list')
    } catch (e) {
      console.log(e)
    }
    }

  ngOnInit(): void {
    // this.fileInfos = this.uploadService.getFiles();
    console.log("file-upload.component.ts")
  }

  selectFile(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];
      this.currentFile = file;
      this.fileName = this.currentFile.name;
    } else {
      this.fileName = 'Select File';
    }
  }

  onPicked(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (file) {
      this.uploadService.upload(file).subscribe(
        msg => {
          input.value = '';
          this.message = msg;
        }
      );
    }
  }

  upload(): void {
    this.progress = 0;
    this.message = "";

    if (this.currentFile) {
      this.uploadService.upload(this.currentFile).subscribe({
        next: (event: any) => {
          // (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progress = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            this.message = event.body.message;
            // this.fileInfos = this.uploadService.getFiles();
          } else {
            console.log(event)
          }
        },
        error: (err: any) => {
          console.log(err);
          this.progress = 0;

          if (err.error && err.error.message) {
            this.message = err.error.message;
          } else {
            this.message = 'Could not upload the file!';
          }

          this.currentFile = undefined;
        }
        // complete: () => {
        //   console.info('complete')
        //   // this.dispatchEvent(new CustomEvent('FILE_UPLOADED'))
        //   // this.listEl.nativeElement.addEventListener('change', () => this.onListChange())
        //   this.listEl.nativeElement.setAttribute('endpoint', './media-list')
        // }
      });
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  /** POST: add a new hero to the database */
  deleteFile(pathsThatAreSelected): Observable<any> {
    return this.http.post('./media-delete', { paths: pathsThatAreSelected })
      .pipe(
        catchError(this.handleError)
      );
  }

  async onDeleteClick() {
    const pathsThatAreSelected = this.listEl.nativeElement.shadowRoot.querySelector('file-list').files.reduce((pathsThatAreSelected, file) => {
      return file.selected
        ? [...pathsThatAreSelected, file.path]
        : pathsThatAreSelected
    }, [])
    if (!pathsThatAreSelected.length) return
    // this.http.post('./media-delete', { paths: pathsThatAreSelected })
    this.deleteFile(pathsThatAreSelected)
    this.listEl.nativeElement.setAttribute('endpoint', './media-list')
  }
}
