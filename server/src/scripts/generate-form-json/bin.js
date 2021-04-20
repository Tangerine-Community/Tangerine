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

// import {Window, XMLParser} from 'happy-dom';
import pkg from 'happy-dom';
const {Window, XMLParser} = pkg;
// const window = new Window();
// const document = window.document;

import * as VM from 'vm';
import {TangyForm} from './mock-data/tangy-form/tangy-form.js';
import {TangyFormItem} from './mock-data/tangy-form/tangy-form-item.js';
import {TangyInput} from './mock-data/tangy-form/tangy-input.js';

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

const contentPath = `/tangerine/groups/${params.groupId}/client`
// const contentPath = `/Users/ckelley/Documents/GitHub/Tangerine-Community/Tangerine/data/groups/${params.groupId}/client`
const formsPath = `${contentPath}/forms.json`
let forms;
try {
  const formsData = fs.readFileSync(formsPath, 'utf8')
  forms = JSON.parse(formsData)
  // console.log(data)
} catch (err) {
  console.error(err)
}

for (let index = 0; index < forms.length; index++) {
  const form = forms[index]
  const formId = form['id']
  // Use src instead of id, because id is not consistent...
  //     "src": "./assets/mnh01_screening_and_enrollment/form.html",
  const formHtmlPath = form['src'].replace('./assets/', '')
  const formDir = formHtmlPath.replace('/form.html','')
  // if (formId === 'mnh_screening_and_enrollment_v2') {
  //   const formPath = `${contentPath}/${formId}/form.html`
    const formPath = `${contentPath}/${formHtmlPath}`
    console.log("Processing " + formHtmlPath + " at " + formPath)

    try {
      const formHtml = fs.readFileSync(formPath, 'utf8')
      const window = VM.createContext(new Window());
      let customElements = new window['CustomElementRegistry']()
      customElements.define('tangy-form', TangyForm);
      customElements.define('tangy-form-item', TangyFormItem);
      customElements.define('tangy-input', TangyInput);
      const document = window.document;
      document.write(baseTemplate)
      const body = document.querySelector('body');
      body.innerHTML = baseTemplate
      const container = body.querySelector('.container');
      container.innerHTML = formHtml
      const items = document.querySelectorAll('tangy-form-item')
      let i;
      let formDefinition = {
        name: formId,
        items: []
      }
      console.log("number of items: " + items.length)
      for (i = 0; i < items.length; ++i) {
        // console.log("item " + [i] + ": " + items[i]);
        let item = items[i]
        let itemDefinition = {
          id: item['id'],
          inputEls: []
        }
        // console.log("childNodes : " + item.childNodes)
        const template = item.querySelector('template')
        // console.log("template : " + template + " type: " + typeof template)
        let inputEls = []
        if (template) {
          // console.log("template inner: " + template.content)
          // console.log("template inner children: " + template.content.children)
          // const root = await XMLParser.parse(window.document, template.content.toString());
          // console.log("template root: " + root.childNodes)
          inputEls = [...template.content.querySelectorAll('[name]')]
        } else {
          // console.log("normal itemEls ")
          inputEls = [...item.querySelectorAll('[name]')]
        }

        // console.log("number of item els: " + inputEls.length)
        let j=0
        for (j = 0; j < inputEls.length; ++j) {
          let input = inputEls[j]
          // console.log("input:  " + input)
          if (typeof input !== 'undefined') {
            // console.log("typeof input: " + typeof input)
            const root = await XMLParser.parse(window.document, input.toString());
            const name = root.childNodes[0].getAttribute('name')
            const label = root.childNodes[0].getAttribute('label')
            // const identifier = root.childNodes[0].getAttribute('identifier')
            const identifier = root.childNodes[0].getAttribute('identifier') === "" ? true : false
            if (identifier === true) {
              console.log("field: " + name + " identifier: " + identifier )
            }
            const required = root.childNodes[0].getAttribute('required')
            const tagName = root.childNodes[0].tagName
            // console.log("input name:  " + name)
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
      // console.log('formDefinition: ' + JSON.stringify(formDefinition, null, 2))
      const formJsonPath = `${contentPath}/${formDir}/form.json`
      console.log('writing json to formJsonPath: ' + formJsonPath)
      fs.writeFileSync(formJsonPath, JSON.stringify(formDefinition, null, 2));
    } catch (err) {
      console.error(err)
    }
  }
// }