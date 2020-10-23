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
    return result.rows.map(row => {
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
  }

}

export const createSearchIndex = async (db, formsInfo) => {
  const variablesToIndexByFormId = formsInfo.reduce((variablesToIndexByFormId, formInfo) => {
    return formInfo.searchSettings.shouldIndex
      ? {
        ...variablesToIndexByFormId,
        [formInfo.id]: formInfo.searchSettings.variablesToIndex
      }
      : variablesToIndexByFormId
  }, {})
  const map = `
    function(doc) {
      const variablesToIndexByFormId = ${JSON.stringify(variablesToIndexByFormId)}
      if (
        doc.collection === 'TangyFormResponse' &&
        doc.items &&
        Array.isArray(doc.items) &&
        doc.form &&
        doc.form.id &&
        variablesToIndexByFormId.hasOwnProperty(doc.form.id)
      ) {
        let allInputsValueByName = doc.items.reduce((allInputsValueByName, item) => {
          return {
            ...allInputsValueByName,
            ...item.inputs.reduce((itemInputsValueByName, input) => {
              return {
                ...itemInputsValueByName,
                [input.name]: \`\${input.value}\`.toLocaleLowerCase()
              }
            }, {})
          }
        }, {})
        for (let variableToIndex of variablesToIndexByFormId[doc.form.id]) {
          if (allInputsValueByName.hasOwnProperty(variableToIndex)) {
            emit(
              allInputsValueByName[variableToIndex], 
              variableToIndex,
            )
          }
        }
      }
    }
  `
  const doc = {
    _id: '_design/search',
    views: {
      'search': {
        map
      }
    }
  }
  try {
    const existingSearchDoc = await db.get('_design/search')
    doc['_rev'] = existingSearchDoc._rev
  } catch (e) { }
  await db.put(doc)
}
