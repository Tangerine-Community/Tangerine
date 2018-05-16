# Reporting Service

Manipulate and write processed data to a new database.

Basically, the reporting application watches for changes in a particular group database, processes the changed document in near real time and saves the output in a result database.

## Contents

<ul>
  <li><a href="#generate-headers">Generate Headers</a></li>
  <li><a href="#process-results">Process Results</a></li>
  <li><a href="#csv-generation">CSV Generation</a></li>
  <li><a href="#monitoring-and-processing-document">Monitoring and Processing Document</a></li>
</ul>

## Generate Headers

The `createColumnHeaders` function [here](https://github.com/Tangerine-Community/Tangerine/blob/master/reporting/controllers/assessment.js#L130-#L220) is responsible for generating assessment headers while the `createWorkflowHeaders` is for generating workflow headers as found [here](https://github.com/Tangerine-Community/Tangerine/blob/master/reporting/controllers/workflow.js#L125-#L158)

The generated header is saved using the assessment id and workflow id as the *key* for assessment and workflow document respectively. The function for saving the generated headers is found [here](https://github.com/Tangerine-Community/Tangerine/blob/master/reporting/utils/dbQuery.js#L23-#L49)

A sample output will look like the json below.

```json
{
  "_id": "0d24f980-xxxx-xxxx-xxxx",
  "_rev": "1-8a0d9dxxxxxxxxxxxx",
  "name": "assessment_name",
  "updated_at": "2018-05-10T10:39:12.105Z",
  "column_headers": [
    {
      "header": "assessment_id",
      "key": "0d24f980-xxxx-xxxx-xxxx.assessmentId"
    },
    {
      "header": "assessment_name",
      "key": "0d24f980-xxxx-xxxx-xxxx.assessmentName"
    },
    {
      "header": "enumerator",
      "key": "0d24f980-xxxx-xxxx-xxxx.enumerator"
    },
    ...
  ]
}
```

## Process Results

The `generateResult` function [here](https://github.com/Tangerine-Community/Tangerine/blob/master/reporting/controllers/result.js#L179-#L290) is responsible for processing assessment results while the `processWorkflowResult` is for processing workflow results as found [here](https://github.com/Tangerine-Community/Tangerine/blob/master/reporting/controllers/trip.js#L79-#L119)

The processed result for assessment is saved using the `_id` of the document as the *key* while the workflow result is saved using the `tripId` as the *key*. This is to avoid document update conflict

The function for saving the processed result is found [here](https://github.com/Tangerine-Community/Tangerine/blob/master/reporting/utils/dbQuery.js#L60-#L92)

A sample output will look like the json below.

```json
{
  "_id": "07B5AB2F-XXX-XXX-XXXXX",
  "_rev": "1-8e65a6xxxxxxxxxxxxx",
  "updated_at": "2018-05-10T10:40:34.160Z",
  "parent_id": "c6f2a0c7-xxxx-xxxxx",
  "result_day": 15,
  "result_month": "Feb",
  "result_year": 2017,
  "processed_results": {
    "c6f2a0c7-xxxx-xxxxx.assessmentId": "c6f2a0c7-xxxx-xxxxx",
    "c6f2a0c7-xxxx-xxxxx.assessmentName": "Book_Distribution_Reporting_Issues",
    "c6f2a0c7-xxxx-xxxxx.enumerator": "lakello",
    "c6f2a0c7-xxxx-xxxxx.order_map": "0,1,2,3",
    "e7d000f8-xxxx-xxxx-xxxxx.year": "2017",
    "e7d000f8-xxxx-xxxx-xxxxx.month": "feb",
    "e7d000f8-xxxx-xxxx-xxxxx.day": "15",
    "isValid": true,
    "isValidReason": "Validation params not enabled."
  }
}

```

## CSV Generation

The Generate CSV function simply fetches the generated headers and processed results and write spreadsheet data to XLSX.

* One can generate CSV report for all results of a particular workflow or assessment. Simply, make a POST request to the route `http://<TANGERINE_URL>/reporting/generate_csv/<DOC_ID>/<RESULT_DB>` where doc_id is the assessment or workflow id for the document.

* To generate CSV report for all results during a specific period simply provide the year, month and workflow or assessment id of the document. make a request to this route: `http://<TANGERINE_URL>/reporting/generate_csv/<DOC_ID>/<RESULT_DB>/<YEAR>/<MONTH>`

## Monitoring and Processing Document

CouchDB has an event emitter that emits a `change` event on each document change in a database. This event emitter list changes made to documents in the database, in the order they were made. This is how we monitor changed document in the database.

The reporting application uses this change event to process the changed document provided its collection type is a result, workflow, assessment, curriculum, subtest or a question.

When the tangerine application loads the first time we have to notify the reporting service the database(s) to monitor. This is done [here](https://github.com/Tangerine-Community/Tangerine/blob/master/server/index.js#L87)

When a new group or database is created we also want to notify the reporting server to monitor it and process changes in the database. You can find that [here](https://github.com/Tangerine-Community/Tangerine/blob/master/server/routes/group/new-group.js#L77-#L83)

To process old results in a database starting from sequence 0, run the curl command below in your server. You can change the `startPoint` property to start at any sequence.

```shell
curl -H "Content-Type: application/json" -X POST -d '{"baseDb": "http://admin:xxxxxxxxx@localhost/db/group-name", "isLive": false, "startPoint": 0, "resultDb": "http://admin:xxxxxxxxx@localhost/db/group-name-result"}' http://localhost/reporting/tangerine_changes
```
