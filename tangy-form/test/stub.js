const stub = {
  locationList: {
    "locationsLevels": ["county", "school"],
    "locations": {
      "county1": {
        "id": "county1",
        "label": "County 1",
        "children": {
          "school1": {
            "id": "school1",
            "label": "School 1",
            "latitude": 44.46567,
            "longitude": -73.21911
          },
          "school2": {
            "id": "school2",
            "label": "School 2",
            "latitude": 44.45308,
            "longitude": -73.19576
          }
        }
      },
      "county2": {
        "id": "county2",
        "label": "County 2",
        "children": {
          "school3": {
            "id": "school3",
            "label": "School 3",
            "latitude": 44.46567,
            "longitude": -73.21911

          },
          "school4": {
            "id": "school4",
            "label": "School 4",
            "latitude": 44.46567,
            "longitude": -73.21911

          }
        }
      }
    }
  },

  flatLocationList: {"locationsLevels":["county","school"],"locations":[{"id":"county2","label":"County 2","children":{},"parent":"root"},{"id":"school4","label":"School 4","latitude":44.46567,"longitude":-73.21911,"parent":"county2","children":{}},{"id":"school3","label":"School 3","latitude":44.46567,"longitude":-73.21911,"parent":"county2","children":{}},{"id":"county1","label":"County 1","children":{},"parent":"root"},{"id":"school2","label":"School 2","latitude":44.45308,"longitude":-73.19576,"parent":"county1","children":{}},{"id":"school1","label":"School 1","latitude":44.46567,"longitude":-73.21911,"parent":"county1","children":{}}]},

  tangyCardFormResponse: {"_id":"c9321c69-e423-44c6-9173-9218c59c1490","collection":"TangyFormResponse","form":{"title":"My Form","complete":true,"linearMode":false,"hideClosedItems":false,"hideCompleteFab":false,"tabIndex":1,"showResponse":true,"showSummary":false,"hasSummary":false,"onSubmit":"","id":"tangy-cards-demo","tagName":"TANGY-FORM"},"items":[{"id":"item1","title":"People","summary":false,"hideButtons":false,"hideBackButton":true,"rightToLeft":false,"hideNextButton":true,"showCompleteButton":true,"inputs":[{"tagName":"TANGY-CARDS","name":"person","value":[{"tagName":"TANGY-CARD","name":"020cf043-61e0-4522-9637-d7965631fe23","value":[{"name":"first_name","private":false,"label":"First name","type":"","errorMessage":"","required":false,"disabled":false,"hidden":false,"invalid":false,"incomplete":true,"value":"a","allowedPattern":"","min":"","max":"","tagName":"TANGY-INPUT"},{"name":"last_name","private":false,"label":"Last name","type":"","errorMessage":"","required":false,"disabled":false,"hidden":false,"invalid":false,"incomplete":true,"value":"b","allowedPattern":"","min":"","max":"","tagName":"TANGY-INPUT"},{"name":"location","value":[{"level":"county","value":"county1"},{"level":"school","value":"school1"}],"required":false,"invalid":false,"locationSrc":"./location-list.json","showLevels":"county,school","hidden":false,"disabled":false,"filterBy":"","filterByGlobal":false,"tagName":"TANGY-LOCATION"}],"label":"","disabled":false,"invalid":false,"incomplete":true,"hidden":false},{"tagName":"TANGY-CARD","name":"b113bd52-ea99-47ff-bf2d-b9d5dfffa49d","value":[{"name":"first_name","private":false,"label":"First name","type":"","errorMessage":"","required":false,"disabled":false,"hidden":false,"invalid":false,"incomplete":true,"value":"c","allowedPattern":"","min":"","max":"","tagName":"TANGY-INPUT"},{"name":"last_name","private":false,"label":"Last name","type":"","errorMessage":"","required":false,"disabled":false,"hidden":false,"invalid":false,"incomplete":true,"value":"d","allowedPattern":"","min":"","max":"","tagName":"TANGY-INPUT"},{"name":"location","value":[{"level":"county","value":"county2"},{"level":"school","value":"school4"}],"required":false,"invalid":false,"locationSrc":"./location-list.json","showLevels":"county,school","hidden":false,"disabled":false,"filterBy":"","filterByGlobal":false,"tagName":"TANGY-LOCATION"}],"label":"","disabled":false,"invalid":false,"incomplete":true,"hidden":false}],"label":"","disabled":true,"invalid":false,"incomplete":true,"hidden":false}],"open":false,"incomplete":false,"disabled":false,"hidden":false,"locked":true,"tagName":"TANGY-FORM-ITEM"}],"complete":true,"focusIndex":0,"nextFocusIndex":1,"previousFocusIndex":-1,"startDatetime":"10/6/2018, 4:55:49 PM","startUnixtime":1538859349096,"uploadDatetime":""}, 

  tangyFormResponse: {
    "_id": "108b56dc-a34c-4d5b-bbee-f6b815e7ccc6",
    "collection": "TangyFormResponse",
    "form": {
      "fullscreen": false,
      "title": "My Form",
      "complete": true,
      "linearMode": false,
      "hideClosedItems": false,
      "hideCompleteFab": false,
      "tabIndex": 1,
      "showResponse": true,
      "showSummary": false,
      "hasSummary": false,
      "fullScreenGranted": false,
      "recordItemFirstOpenTimes": false,
      "id": "my-form",
      "tagName": "TANGY-FORM",
      "fullscreenEnabled": false
    },
    "items": [
      {
        "id": "item1",
        "title": "",
        "summary": false,
        "fullscreen": false,
        "fullscreenEnabled": false,
        "hideButtons": false,
        "hideBackButton": true,
        "hideNavIcons": false,
        "hideNavLabels": false,
        "rightToLeft": false,
        "hideNextButton": true,
        "showCompleteButton": true,
        "inputs": [
          {
            "name": "input1",
            "private": false,
            "label": "What is your first name?",
            "innerLabel": "",
            "placeholder": "",
            "hintText": "",
            "type": "",
            "required": true,
            "disabled": true,
            "hidden": false,
            "skipped": false,
            "invalid": false,
            "hasWarning": false,
            "hasDiscrepancy": false,
            "incomplete": true,
            "value": "Foo",
            "min": "",
            "max": "",
            "questionNumber": "",
            "errorText": "",
            "allowedPattern": "",
            "errorMessage": "",
            "warnText": "",
            "discrepancyText": "",
            "identifier": false,
            "tagName": "TANGY-INPUT"
          }
        ],
        "open": false,
        "incomplete": false,
        "disabled": false,
        "hidden": false,
        "locked": true,
        "isDirty": false,
        "firstOpenTime": 1592319269404,
        "tagName": "TANGY-FORM-ITEM"
      }
    ],
    "complete": true,
    "focusIndex": 0,
    "nextFocusIndex": 1,
    "previousFocusIndex": -1,
    "startDatetime": "6/16/2020, 10:54:29 AM",
    "startUnixtime": 1592319269404,
    "uploadDatetime": "",
    "location": {},
    "type": "response",
    "lastSaveUnixtime": 1592319277854,
    "endUnixtime": 1592319277854
  }
}

export default stub
