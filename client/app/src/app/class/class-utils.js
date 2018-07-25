export class ClassUtils {

  getInputValues(doc) {
    let inputs = doc.items.reduce((acc, item) => [...acc, ...item.inputs], [])
    let obj = {}
    for (const el of inputs) {
      var attrs = inputs.attributes;
      for(let i = inputs.length - 1; i >= 0; i--) {
        obj[inputs[i].name] = inputs[i].value;
      }
    }
    return obj;
  }

  async createCurriculumFormsList(curriculumFormHtml, container) {
    let curriculumForms = [];
      let templateEl = document.createElement("template")
      templateEl.innerHTML = curriculumFormHtml
      let formEl = templateEl.content.querySelectorAll('tangy-form-item')
      var output = "";
      for (const el of formEl) {
        let obj = el.getProps()
        let nodeList = el.querySelectorAll('tangy-timed')
        if (nodeList.length > 0) {
          obj['prototype'] = "grid";
        }
        curriculumForms.push(obj)
      }
  return curriculumForms
  }

}
