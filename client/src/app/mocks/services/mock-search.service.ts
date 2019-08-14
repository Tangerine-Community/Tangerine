import { SearchDoc } from "src/app/shared/_services/search.service";
const SEARCH_DOCS = [
      <SearchDoc>{
        _id: 'response1',
        formId: 'form1',
        formType: 'form',
        variables: {
          foo: "Foo",
          bar: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }
      },
      <SearchDoc>{
        _id: 'response2',
        formId: 'case1',
        formType: 'case',
        variables: {
          foo: "Foo 2",
          bar: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }
      }
    ]
export class MockSearchService {
  search(username, searchString) {
    return SEARCH_DOCS
  }
  async getIndexedDoc(username:string, docId):Promise<SearchDoc> {
    return SEARCH_DOCS.find(doc => doc._id === docId)
  }
}