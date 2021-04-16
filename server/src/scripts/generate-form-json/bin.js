#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('  generate-form-json <groupId> ')
  console.log('Example:')
  console.log(`  generate-form-json group-uuid`)
  process.exit()
}

import fs from 'fs';
import pkg from 'happy-dom';
// import Window  from 'happy-dom' ;
const {Window} = pkg
const window = new Window();
const document = window.document;

import serverRendering from '@happy-dom/server-rendering';
const { HappyDOMContext } = serverRendering;
// import VM from 'vm';
// import { Script } from 'vm';
import * as VM from 'vm';


// __dirname = path.resolve();
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const URL = 'https://localhost:8080/this/is/a/path';
const SCRIPT = fs.readFileSync(`${__dirname}/mock-data/HappyDOMContextScript.js`).toString();
const tangy_form_file = fs.readFileSync(`${__dirname}/mock-data/tangy-form/tangy-form.js`).toString();
const tangy_form_item_file = fs.readFileSync(`${__dirname}/mock-data/tangy-form/tangy-form-item.js`).toString();
const HappyDOMContextHTML = `
    <html>
    <head>
        <title>Title</title>
    </head>
    <body>
        <div class="class1 class2" id="id">
            <b>Bold</b>
        </div>
        <div class="container">
        <tangy-form id="registration-role-1" title="Form 1">
          <tangy-form-item id="item1" title="Item 1" >
            <tangy-input name="ce1" identifier="true"></tangy-input>
          </tangy-form-item>
          <tangy-form-item id="item2" title="Item 2" >
            <tangy-input name="ce2"></tangy-input>
          </tangy-form-item>
        </tangy-form>   
        </div>
    </body>
    </html>
`
const baseTemplate = `
    <html>
    <head>
        <title>Title</title>
    </head>
    <body>
        <div class="container">
        </div>
    </body>
    </html>
`
const params = {
  groupId: process.argv[2]
}

if (params.groupId) {
  console.log("Processing group: " + params.groupId)
} else {
  console.error("Missing groupId! ")
  // return true
}

let context = null;
// const contentPath = `/tangerine/groups/${params.groupId}/client/${formResponse.form.id}/form.json`
// const contentPath = `/tangerine/groups/${params.groupId}/client`
const contentPath = `/Users/ckelley/Documents/GitHub/Tangerine-Community/Tangerine/data/groups/${params.groupId}/client`
// const forms = JSON.parse(await readFile(`${contentPath}/forms.json`))
const formsPath = `${contentPath}/forms.json`
let forms;
try {
  const formsData = fs.readFileSync(formsPath, 'utf8')
  forms = JSON.parse(formsData)
  // console.log(data)
} catch (err) {
  console.error(err)
}

// for (let index = 0; index < forms.length; index++) {
//   const form = forms[index]
  // console.log("form: " + JSON.stringify(form))
  // const formId = form['id']
  const formId = 'registration-role-1'
  const formPath = `${contentPath}/${formId}/form.html` 
  console.log("Processing " + formId + " at " + formPath)
  try {
    const formHtml = fs.readFileSync(formPath, 'utf8')
    const body = document.querySelector('body');
    body.innerHTML = baseTemplate
    const initialBodySize = body.innerHTML.length
    console.log("initialBodySize: " + initialBodySize)
    const container = body.querySelector('.container');

    // document.body.innerHTML = HappyDOMContextHTML
    container.innerHTML = formHtml
    
    // console.log("container: " + container);
    const innerHtmlMinusBaseTemplateSize = formHtml.length + initialBodySize 
    // console.log("formHtml length: " + formHtml.length + " innerHtmlMinusBaseTemplateSize: " + innerHtmlMinusBaseTemplateSize + " total container innerHTML length: " + container.innerHTML.length);
    const items = document.querySelectorAll('tangy-form-item')
    console.log("tangy-form children: " + items);
    let i;

    for (i = 0; i < items.length; ++i) {
      console.log("item " + [i] + ": " + items[i]);
      let item = items[i]
      let inputEls = [...item.querySelectorAll('[name]')]
      console.log("inputEls: " + inputEls.length);
      let inputElsWithoutIdentifiers = [...item.querySelectorAll('[name]')]
        .filter(element => !element.hasAttribute('identifier'))
      console.log("inputEls without identifiers: " + inputElsWithoutIdentifiers);
    }
    
    let formDefinition = {
      form: {
        name: 'registration-role-1',
        items: [
          {
            id: 'item1',
            inputEls: [
              {
                name: 'ce1',
                identifier: true
              },
              {
                name: 'ce2',
                identifier: false
              }
            ]
          }
        ]
      }
    }
    
  } catch (err) {
    console.error(err)
  }
// }