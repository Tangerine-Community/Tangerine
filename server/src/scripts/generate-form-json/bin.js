#!/usr/bin/env node

if (process.argv[2] === '--help') {
  console.log('Usage:')
  console.log('  generate-form-json <groupId> ')
  console.log('Example:')
  console.log(`  generate-form-json group-uuid`)
  process.exit()
}

import fs from 'fs';
// import pkg, {XMLParser} from 'happy-dom';
// import {Window,XMLParser} from 'happy-dom';
// import Window from 'happy-dom' ;
// const {Window} = pkg
import {Window, XMLParser} from 'happy-dom';
// const window = new Window();
// const document = window.document;

let window, document
import serverRendering from '@happy-dom/server-rendering';
const { HappyDOMContext } = serverRendering;
// import VM from 'vm';
// import { Script } from 'vm';
import * as VM from 'vm';
import {TangyForm} from './mock-data/tangy-form/tangy-form.js';
import {TangyFormItem} from './mock-data/tangy-form/tangy-form-item.js';
import {TangyInput} from './mock-data/tangy-form/tangy-input.js';
// import pkg from './mock-data/tangy-form/tangy-form.js';
// const {TangyForm} = pkg;

// __dirname = path.resolve();
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const URL = 'https://localhost:8080/this/is/a/path';
const SCRIPT = fs.readFileSync(`${__dirname}/mock-data/HappyDOMContextScript.js`).toString();
const tangy_form_file = fs.readFileSync(`${__dirname}/mock-data/tangy-form/tangy-form.js`).toString();
const tangy_form_item_file = fs.readFileSync(`${__dirname}/mock-data/tangy-form/tangy-form-item.js`).toString();

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
    const inspector = `
      const container = document.querySelector('.container');
      console.log("container: " + container)
      container.innerHTML = '${formHtml}'
      const items = document.querySelectorAll('tangy-form-item')
      const tangyForm = document.querySelector('tangy-form')
      console.log("tangyForm: " + tangyForm);
      console.log("tangy-form children: " + items);
      let i;
      let formDefinition = {
      name: '${formId}',
      items: [
      ]
      }
      
      for (i = 0; i < items.length; ++i) {
      // console.log("item " + [i] + ": " + items[i]);
      let item = items[i]
      let itemDefinition = {
      id: item['id'],
      inputEls: []
      }
      // let inputEls = [...item.querySelectorAll('[name]')]
      // console.log("inputEls: " + inputEls.length);
      let inputElsWithoutIdentifiers = [...item.querySelectorAll('[name]')]
      .filter(element => !element.hasAttribute('identifier'))
      // console.log("inputEls without identifiers: " + inputElsWithoutIdentifiers);
      // inputElsWithoutIdentifiers.forEach(input => {
      for (i = 0; i < inputElsWithoutIdentifiers.length; ++i) {
      let input = inputElsWithoutIdentifiers[i]
      console.log("input:  " + input)
      if (typeof input !== 'undefined') {
      // const inputObject = XMLParser.parse(window.document, input);
      const parser = new DOMParser();
      const dom = parser.parseFromString(input, "application/xml");
      console.log("dom:  " + dom)
      
              const name = inputObject['name']
              console.log("input name:  " + name)
              let inputDefinition = {
                name: name
              }
              itemDefinition.inputEls.push(inputDefinition)
            }
          }
          formDefinition.items.push(itemDefinition)
      }
      console.log('formDefinition: ' + JSON.stringify(formDefinition))
`

    // context = new HappyDOMContext();
    // const TangyForm = new VM.Script(tangy_form_file);
    // const TangyFormItem = new VM.Script(tangy_form_item_file);
    // const inspectorScript = new VM.Script(inspector);

    // window = new Window();
    const window = VM.createContext(new Window());
    // customElements = new CustomElementRegistry();

    let customElements = new window['CustomElementRegistry']()
    console.log("customElements: " + customElements)
    customElements.define('tangy-form', TangyForm);
    customElements.define('tangy-form-item', TangyFormItem);
    customElements.define('tangy-input', TangyInput);
    const document = window.document;
    document.write(baseTemplate)
    // TangyForm.runInContext(window);
    // TangyFormItem.runInContext(window);
    // inspectorScript.runInContext(window);

    // window.customElements.define('tangy-form', TangyForm);
    // window.customElements.define('tangy-form-item', TangyFormItem);
//     document = window.document;
    const body = document.querySelector('body');
    body.innerHTML = baseTemplate
    const initialBodySize = body.innerHTML.length
    console.log("initialBodySize: " + initialBodySize)
    const container = body.querySelector('.container');


    // document.body.innerHTML = HappyDOMContextHTML
    container.innerHTML = formHtml
    const items = document.querySelectorAll('tangy-form-item')
    // const tangyForm = document.querySelector('tangy-form')
    // console.log("tangyForm: " + tangyForm);
    // console.log("tangy-form children: " + items);
    let i;
    let formDefinition = {
      name: formId,
      items: [
      ]
    }

    for (i = 0; i < items.length; ++i) {
// console.log("item " + [i] + ": " + items[i]);
      let item = items[i]
      let itemDefinition = {
        id: item['id'],
        inputEls: []
      }
let inputEls = [...item.querySelectorAll('[name]')]
// console.log("inputEls: " + inputEls.length);
      let inputElsWithoutIdentifiers = [...item.querySelectorAll('[name]')]
        .filter(element => !element.hasAttribute('identifier'))
// console.log("inputEls without identifiers: " + inputElsWithoutIdentifiers);
// inputElsWithoutIdentifiers.forEach(input => {
      for (i = 0; i < inputEls.length; ++i) {
        let input = inputEls[i]
        console.log("input:  " + input)
        if (typeof input !== 'undefined') {
          console.log("typeof input: " + typeof input)
          const root = await XMLParser.parse(window.document, input.toString());
//           const parser = new DOMParser();
//           const dom = parser.parseFromString(input, "application/xml");
//           console.log("dom:  " + dom)

          const name = root.childNodes[0].getAttribute('name')
          const label = root.childNodes[0].getAttribute('label')
          const identifier = root.childNodes[0].getAttribute('identifier')
          const required = root.childNodes[0].getAttribute('required')
          const tagName = root.childNodes[0].tagName
          // console.log("inputObject:  " + root.childNodes[0].tagName);
          // console.log("inputObject name:  " + JSON.stringify(root.childNodes[0].getAttribute('name')));
          console.log("input name:  " + name)
          let inputDefinition = {
            name: name,
            label: label,
            identifier: identifier,
            required: required,
            tagName: tagName
          }
          itemDefinition.inputEls.push(inputDefinition)
        }
      }
      formDefinition.items.push(itemDefinition)
    }
    console.log('formDefinition: ' + JSON.stringify(formDefinition, null, 2))
    const formJsonPath = `${contentPath}/${formId}/form.json`
    console.log('writing json to formJsonPath: ' + formJsonPath)
    fs.writeFileSync(formJsonPath, JSON.stringify(formDefinition));
  } catch (err) {
    console.error(err)
  }
// }