import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { _TRANSLATE } from '../../shared/_services/translation-marker';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
import { id as generate } from 'rangen';
import { WindowRef } from '../../core/window-ref.service';
import { Loc } from 'tangy-form/util/loc.js';
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class FilesService {

  constructor(
    private windowRef: WindowRef,
    private httpClient: HttpClient,
    private errorHandler: TangyErrorHandler
  ) { }

  async get(groupId: string, filePath:string) {
    return await this.httpClient.get(`/app/${groupId}/assets/${filePath}`).toPromise()
  }

  async save(groupId: string, filePath, fileContents) {
    try {
      const file = {
        groupId,
        filePath,
        fileContents: typeof fileContents === 'object' ? JSON.stringify(fileContents, null, 2) : fileContents 
      };
      await this.httpClient.post('/editor/file/save', file).toPromise();
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }
  async delete(groupId: string, filePath: string) {
    try {
      const params = {
        groupId,
        filePath
      };
      await this.httpClient.delete('/editor/file/save', { params }).toPromise();
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

}
