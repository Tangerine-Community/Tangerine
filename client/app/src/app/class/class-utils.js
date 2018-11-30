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
      let htmlCollection = el.children[0].content.children
      let children = []
      for (const item of htmlCollection) {
        let child = item.getProps()
        if (child.name) {
          obj[child.name] = child
        }
        children.push(child)
      }
      obj['children'] = children
      curriculumForms.push(obj)
    }
  return curriculumForms
  }

  decimals(num, decimals) {
    let m;
    m = Math.pow(10, decimals);
    num *= m;
    num = num + (num<0?-0.5:+0.5 >> 0);
    return num /= m;
  }

}


