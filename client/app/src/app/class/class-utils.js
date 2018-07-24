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
      container.innerHTML = curriculumFormHtml
      let formEl = container.querySelectorAll('tangy-form-item')
      var output = "";
      for (const el of formEl) {
        var attrs = el.attributes;
        let obj = {}
        for(let i = attrs.length - 1; i >= 0; i--) {
          // output = attrs[i].name + "->" + attrs[i].value;
          obj[attrs[i].name] = attrs[i].value;
          // console.log("this.formEl:" + output )
        }
        curriculumForms.push(obj)
      }
  return curriculumForms
  }

}
