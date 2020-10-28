import { createSearchIndex } from './create-search-index';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';

export class SearchDoc {
  _id: string
  formId: string
  formType: string
  lastModified:number
  variables: any
  matchesOn: string
  doc: any
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private readonly userService:UserService,
    private readonly formsInfoService:TangyFormsInfoService
  ) { }

  async createIndex(username:string = '') {
    let db
    if (!username) {
      db = await this.userService.getUserDatabase()
    } else {
      db = await this.userService.getUserDatabase(username)
    }
    const formsInfo = await this.formsInfoService.getFormsInfo()
    await createSearchIndex(db, formsInfo) 
  }

  async search(username:string, phrase:string, limit = 50, skip = 0):Promise<Array<SearchDoc>> {
    const db = await this.userService.getUserDatabase(username)
    const result = await db.query(
      'search',
      phrase
        ? { 
          startkey: `${phrase}`.toLocaleLowerCase(),
          endkey: `${phrase}\uffff`.toLocaleLowerCase(),
          include_docs: true,
          limit,
          skip
        }
        : {
          include_docs: true,
          limit,
          skip
        } 
    )
    const searchResults = result.rows.map(row => {
      const variables = row.doc.items.reduce((variables, item) => {
        return {
          ...variables,
          ...item.inputs.reduce((variables, input) => {
            return {
              ...variables,
              [input.name] : input.value
            }
          }, {})
        }
      }, {})
      return {
        _id: row.doc._id,
        matchesOn: row.value,
        formId: row.doc.form.id,
        formType: row.doc.type,
        lastModified: row.doc.lastModified,
        doc: row.doc,
        variables
      }
    })
    // Deduplicate the search results since the same case may match on multiple variables.
    return searchResults.reduce((uniqueResults, result) => {
      return uniqueResults.find(x => x.id === result.id)
        ? uniqueResults
        : [ ...uniqueResults, result ]
    }, [])
  }

}

