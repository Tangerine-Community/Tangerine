import { Injectable } from '@angular/core';
import {HttpClient, HttpRequest, HttpEvent, HttpErrorResponse, HttpEventType} from '@angular/common/http';
import {last, Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from "rxjs/operators";
import { MessageService } from '../../message.service';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
    private messenger: MessageService
  ) { }

  // upload(file: File): Observable<HttpEvent<any>> {
  upload(file: File) {
    if (!file) { return of<string>(); }
    // const formData: FormData = new FormData();

    // formData.append('file', file);

    // const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
    const req = new HttpRequest('POST', `./media-upload`, file, {
      reportProgress: true,
    });

    return this.http.request(req).pipe(
      map(event => this.getEventMessage(event, file)),
      tap(message => this.showProgress(message)),
      last(), // return last (completed) message to caller
      catchError(this.handleError(file))
    );
  }

  /** Return distinct message for sent, upload progress, & response events */
  private getEventMessage(event: HttpEvent<any>, file: File) {
    switch (event.type) {
      case HttpEventType.Sent:
        return `Uploading file "${file.name}" of size ${file.size}.`;

      case HttpEventType.UploadProgress:
        // Compute and show the % done:
        const percentDone = event.total ? Math.round(100 * event.loaded / event.total) : 0;
        return `File "${file.name}" is ${percentDone}% uploaded.`;

      case HttpEventType.Response:
        return `File "${file.name}" was completely uploaded!`;

      default:
        return `File "${file.name}" surprising upload event: ${event.type}.`;
    }
  }

  private handleError(file: File) {
    const userMessage = `${file.name} upload failed.`;

    return (error: HttpErrorResponse) => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      const message = (error.error instanceof Error) ?
        error.error.message :
        `server returned code ${error.status} with body "${error.error}"`;

      this.messenger.add(`${userMessage} ${message}`);

      // Let app keep running but indicate failure.
      return of(userMessage);
    };
  }


  private showProgress(message: string) {
    this.messenger.add(message);
  }

  // getFiles(): Observable<any> {
  //   // return this.http.get(`${this.baseUrl}/files`);
  //   return this.http.get(`./media-upload`);
  // }
}
