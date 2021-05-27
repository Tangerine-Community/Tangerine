import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
import fs from 'fs-extra';

export async function extractPiiVariables(groupId) {
    const contentPath = `/tangerine/groups/${groupId}/client`
    const formsPath = `${contentPath}/forms.json`
    const reportingConfigPath = `/tangerine/groups/${groupId}/reporting-config.json`
    const forms = await fs.readJson(formsPath)
    let pii = []
    for (let form of forms) {
      const formHtmlPath = form['src'].replace('./assets/', '')
      const formPath = `${contentPath}/${formHtmlPath}`
      const formHtml = fs.readFileSync(formPath, 'utf8')
      const dom = new JSDOM(`<!DOCTYPE html>${formHtml}`);
      const items = dom.window.document.querySelectorAll('tangy-form-item')
      for (let item of items) {
        const template = item.querySelector('template')
        let inputEls = []
        if (template) {
          inputEls = [...template.content.querySelectorAll('[identifier]')]
        } else {
          inputEls = [...item.querySelectorAll('[identifier]')]
        }
        pii = [
          ...pii,
          ...inputEls.map(inputEl => inputEl.getAttribute('name'))
        ]
      }
    }
    let reportingConfig = {
      pii: []
    }
    try {
      currentReportingConfig = await fs.readJson(reportingConfigPath)
      reportingConfig = {
        ...reportingConfig,
        ...currentReportingConfig
      }
    } catch (e) {
      // No existing reporting-config.json file, no problem.
    }
    reportingConfig = {
      ...reportingConfig,
      pii: [...new Set([...pii, ...reportingConfig.pii])]
    }
    await fs.writeFile(reportingConfigPath, JSON.stringify(reportingConfig, null, 2));

}