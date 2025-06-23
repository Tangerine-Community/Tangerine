import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { IndexedDBService } from './indexdb.service';

@Injectable({
  providedIn: 'root'
})
export class XapiService {
  private lrsEndpointUrl:string;
  private username:string;
  private password:string;

  constructor(private http: HttpClient, private dbService: IndexedDBService) { }

  private getHeaders(auth: string[] = []) {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`)
    });
  }

  buildXapiStatementFromForm(
  result: Record<string, any>,
  user: { name: string; email: string },
  activityId: string,
  activityName: string,
  activityDesc: string,
  lang: string,
  lrsEndpointUrl: string
): any {
  const statement = {
    actor: {
      objectType: 'Agent',
      name: user.name,
      mbox: `mailto:${user.email}`
    },
    verb: {
      id: 'http://adlnet.gov/expapi/verbs/completed',
      display: { [lang]: 'completed' }
    },
    object: {
      id: activityId,
      objectType: 'Activity',
      definition: {
        name: { [lang]: activityName },
        description: { [lang]: activityDesc }
      }
    },
    result: {...result},
    context: {
      extensions: {
        [`${lrsEndpointUrl}/survey`]: result.formData
      }
    },
    timestamp: new Date().toISOString()
  };

  return statement;
  }


  async sendStatement(statement: any) {
    const headers = this.getHeaders();
     if (navigator.onLine) {
      try {
        await this.http.post(this.lrsEndpointUrl, statement, { headers }).toPromise();
      } catch (err) {
        console.warn('Failed to send, saving offline', err);
        await this.dbService.addStatement(statement);
      }
    } else {
      await this.dbService.addStatement(statement);
    }
  };

  async syncStoredStatements(lrsEndpointUrl:string, auth:string[]): Promise<void> {
    this.lrsEndpointUrl = lrsEndpointUrl;
    this.username = auth[0];
    this.password = auth[1];
    const storedStatements = await this.dbService.getAllStatements();
    const headers = this.getHeaders();
    const successfullySyncedIds: number[] = [];

    for (const record of storedStatements) {
      try {
        await this.http.post(lrsEndpointUrl, record.data, { headers }).toPromise();
        successfullySyncedIds.push(record.id);
      } catch (err) {
        console.error('Failed to sync a statement', err);
        break;
      }
    }

    if (successfullySyncedIds.length > 0) {
      await this.dbService.deleteStatementsByIds(successfullySyncedIds);
    } else {
      console.log('No statements were synced.');
    }
  }

  getStatementsByActor(actor: { name?: string; mbox: string }) {
    const headers = this.getHeaders();
    const params = new HttpParams().set('agent', JSON.stringify(actor));

    return this.http.get(`${this.lrsEndpointUrl}/statements`, { headers, params });
  }
}
