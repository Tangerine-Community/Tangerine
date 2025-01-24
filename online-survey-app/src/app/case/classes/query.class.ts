class Query {
  queryId: string;

  associatedCaseId: string;
  associatedCaseType: string;
  associatedEventId: string;
  associatedFormId: string;
  associatedCaseName: string;
  associatedEventName: string;
  associatedFormName: string;
  associatedFormLink: string;
  associatedVariable: string;

  queryTypeId: string;
  queryLink: string;
  queryText: string;
  queryResponse: string;
  queryStatus: string;
  queryDate: string;
  queryResponseDate: string;

  constructor(queryId, associatedCaseId, associatedEventId, associatedFormId, associatedCaseName,
    associatedEventName, associatedFormName, associatedFormLink, associatedCaseType, queryLink, queryDate, queryText,
    queryStatus, queryResponse?, queryResponseDate?, associatedVariable?, queryTypeId?) {

    this.queryId = queryId;
    this.associatedCaseId = associatedCaseId;
    this.associatedCaseType = associatedCaseType;
    this.associatedEventId = associatedEventId;
    this.associatedFormId = associatedFormId;
    this.associatedEventName = associatedEventName;
    this.associatedFormName = associatedFormName;
    this.associatedFormLink = associatedFormLink;
    this.associatedCaseName = associatedCaseName;
    this.associatedVariable = associatedVariable;
    this.queryTypeId = queryTypeId;
    this.queryLink = queryLink;
    this.queryDate = queryDate;
    this.queryText = queryText;
    this.queryStatus = queryStatus;
    this.queryResponse = queryResponse;
    this.queryResponseDate = queryResponseDate;
  }
}

export { Query };
