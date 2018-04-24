/**
 * This file processes the result of an assessment.
 * The processed result will serve as the values for CSV generation.
 *
 * Module: generateResult.
 */

/**
 * Module dependencies.
 */

const _ = require('lodash');
const PouchDB = require('pouchdb');
const moment = require('moment');



/**
 * Pseudo Code
 *
 * 1. Fetch document from pouchDB using the form._id properties
 * 2. process all data in the items array.
 * 3. all data to be processed are located in the inputs array of the item
 *
 * - identify input type by their ids
 * - use the title of an element as the header name
 *
 * For text inputs
 * - inputs = array of objects i.e. [{},{}]
 * - title = column header name  (string)
 * - value = result (string)
 *
 * For check boxes
 * - inputs = array of objects i.e. [{},{}]
 * - title = column header name (string)
 * - value = result (string)
 *
 * For radio buttons
 * - inputs = array of objects i.e. [{},{}]
 * - title = column header name (string)
 * - value = array of objects i.e. [{},{}]
 *
 * For select options
 * - inputs = array of objects i.e. [{},{}]
 * - title = column header name (string)
 * - value = string
 *
 * For location data
 * - inputs = array of objects i.e. [{},{}]
 * - title = column header name (string)
 * - value = array of objects i.e. [{},{}]
 *
 * For GPS data
 * - inputs = array of objects i.e. [{},{}]
 * - title = column header name (string)
 * - value = objects  i.e. {}
 *
 * For date time data
 * - inputs = array of objects i.e. [{},{}]
 * - title = column header name (string)
 * - value = string
 *
 * For Timed Grids
 * - inputs = array of objects i.e. [{},{}]
 * - title = column header name (string)
 * - value = array of objects i.e. [{},{}]
 *
 * For Complete options
 * - inputs = array of objects i.e. [{},{}]
 * - title = column header name (string)
 * - value = string
 *
 * For summary and feedbacks
 * - they don't have "value" properties.
 *
 *
 */




/**
 * Creating headers and keys
 *
 *
 *  EXample =
 *    {
 *      header: items[0].title,
 *      key: response._id.items[0].title.elementName
 *    }
 *
 * -  Does each field demo create a new _id ?
 * -  if so we need to have unique id for each observation conducted.
 *
 */

let data = {
  "id": "text_inputs",
  "src": "../content/field-demo/text-inputs.html",
  "title": "Text Inputs",
  "summary": false,
  "hideButtons": false,
  "hideBackButton": true,
  "hideNextButton": true,
  "inputs": [
    {
      "name": "text_input_1",
      "private": false,
      "label": "This is an input for text.",
      "type": "text",
      "errorMessage": "",
      "required": false,
      "disabled": true,
      "hidden": false,
      "invalid": false,
      "incomplete": true,
      "value": "good",
      "allowedPattern": "",
      "tagName": "TANGY-INPUT"
    },
    {
      "name": "text_input_2",
      "private": false,
      "label": "This is an input for text that is required.",
      "type": "text",
      "errorMessage": "This is required.",
      "required": true,
      "disabled": true,
      "hidden": false,
      "invalid": false,
      "incomplete": true,
      "value": "bad",
      "allowedPattern": "",
      "tagName": "TANGY-INPUT"
    },
    {
      "name": "text_input_3",
      "private": false,
      "label": "This text input is disabled.",
      "type": "text",
      "errorMessage": "",
      "required": false,
      "disabled": true,
      "hidden": false,
      "invalid": false,
      "incomplete": true,
      "value": "",
      "allowedPattern": "",
      "tagName": "TANGY-INPUT"
    },
    {
      "name": "text_input_4",
      "private": false,
      "label": "This text input requires a valid email address.",
      "type": "email",
      "errorMessage": "A valid email address is required.",
      "required": false,
      "disabled": true,
      "hidden": false,
      "invalid": false,
      "incomplete": true,
      "value": "ugly@gmail.com",
      "allowedPattern": "",
      "tagName": "TANGY-INPUT"
    },
    {
      "name": "text_input_5",
      "private": false,
      "label": "This is a text input that only uses `allowed-pattern` to prevent users from entering input other than numbers 1 - 7. See http://www.html5pattern.com/ for more examples of patterns.",
      "type": "text",
      "errorMessage": "",
      "required": false,
      "disabled": true,
      "hidden": false,
      "invalid": false,
      "incomplete": true,
      "value": "73432",
      "allowedPattern": "[1-7]",
      "tagName": "TANGY-INPUT"
    }
  ],
  "open": false,
  "incomplete": false,
  "disabled": false,
  "hidden": false,
  "locked": true,
  "tagName": "TANGY-FORM-ITEM"
};

let formID = 'a1q23456789z';


/** Result processing
 *
 * @param {object} data
 */

function processTextInputs(data, formID) {
  let textResult = {};

  data.inputs.forEach(element => {
    textResult[`${formID}.${data.title}.${element.name}`] = element.value;
  });

  return textResult;
}

/**
 *
 * RESULT PROCESSING
 *
 */


/** Process text inputs
 *
 * @param {object} data
 */

function processTextInputs(data, formID) {
  let textResult = {};

  data.inputs.forEach(element => {
    textResult[`${formID}.${data.title}.${element.name}`] = element.value;
  });

  return textResult;
}


/** Process check box inputs
 *
 * @param {object} data
 */

function processCheckboxInputs(data, formID) {
  let checkboxResult = {};

  data.inputs.forEach(element => {
    if (typeof element.value == 'string') {
      checkboxResult[`${formID}.${data.title}.${element.name}`] = element.value;
    }
    if (Array.isArray(element.value)) {
      let groupResponse = element.value;
      groupResponse.forEach(response => {
        checkboxResult[`${formID}.${data.title}.${response.name}`] = response.value;
      });
    }
  });

  return textResult;
}

/** Process radio button inputs
 *
 * @param {object} data
 */

function processRadioInputs(data, formID) {
  let radioResult = {};

  data.inputs.forEach(element => {
    if (typeof element.value == 'string') {
      radioResult[`${formID}.${data.title}.${element.name}`] = element.value;
    }
    if (Array.isArray(element.value)) {
      let radioButtonValue = element.value;
      radioButtonValue.forEach(response => {
        radioResult[`${formID}.${data.title}.${response.name}`] = response.value;
      });
    }
  });

  return textResult;
}


/** Process select inputs
 *
 * @param {object} data
 */

function processSelectInputs(data, formID) {
  let selectResult = {};

  data.inputs.forEach(element => {
    selectResult[`${formID}.${data.title}.${element.name}`] = element.value;
  });

  return selectResult;
}


/** Process location data
 *
 * @param {object} data
 */

function processLocationData(data, formID) {
  let locationResult = {};

  data.inputs.forEach(element => {
    if (Array.isArray(element.value)) {
      let locationValue = element.value;
      locationValue.forEach(response => {
        locationResult[`${formID}.${data.title}.${response.level}`] = response.value;
      });
    }
  });

  return locationResult;
}


/** Process GPS inputs
 *
 * @param {object} data
 */

function processGps(data, formID) {
  let gpsResult = {};

  data.inputs.forEach(element => {
    gpsResult[`${formID}.${data.title}.${element.name}.latitude`] = element.value.latitude;
    gpsResult[`${formID}.${data.title}.${element.name}.longitude`] = element.value.longitude;
    gpsResult[`${formID}.${data.title}.${element.name}.accuracy`] = element.value.accuracy;
  });

  return gpsResult;
}


/** Process date time inputs
 *
 * @param {object} data
 */

function processDateTime(data, formID) {
  let dateTimeResult = {};

  data.inputs.forEach(element => {
    dateTimeResult[`${formID}.${data.title}.${element.name}`] = element.value;
  });

  return dateTimeResult;
}

/** Process time grid inputs
 *
 * @param {object} data
 */

function processTimedGrid(data, formID) {
  let timedGridResult = {};

  data.inputs.forEach(element => {
    let input = element.value;
    input.forEach(response => {
      timedGridResult[`${formID}.${data.title}.${response.name}`] = response.value;
    });
  });

  return timedGridResult;
}

/** Process complete inputs
 *
 * @param {object} data
 */

function processComplete(data, formID) {
  let completeResult = {};

  data.inputs.forEach(element => {
    completeResult[`${formID}.${data.title}.${element.name}`] = element.value;
  });

  return completeResult;
}




