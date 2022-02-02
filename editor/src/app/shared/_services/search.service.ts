import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
    private httpClient: HttpClient,
  ) { }


  async search(username:string, phrase:string, searchType:string, limit = 50, skip = 0):Promise<Array<SearchDoc>> {

    const searchResults = <Array<any>>await this.httpClient.post(`/group-responses/search/${window.location.pathname.split('/')[2]}`, {
      phrase: phrase,
      index: searchType,
      limit: limit,
      skip: skip
    }).toPromise()
    
    // Deduplicate the search results since the same case may match on multiple variables.
    let uniqueResults = searchResults.reduce((uniqueResults, result) => {
      return uniqueResults.find(x => x._id === result._id)
        ? uniqueResults
        : [ ...uniqueResults, result ]
    }, [])

    return uniqueResults.sort(function (a, b) {
        return b.lastModified - a.lastModified;
      })
  }

}

