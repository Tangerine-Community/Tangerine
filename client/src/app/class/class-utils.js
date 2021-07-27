export class ClassUtils {

  /**
   * Provides an object with key/value pairs for a document
   * @param doc
   * @returns {{}} 
   */
  getInputValues(doc) {
    let inputs = doc.items.reduce((acc, item) => [...acc, ...item.inputs], [])
    let obj = {}
    for (const el of inputs) {
      for(let i = inputs.length - 1; i >= 0; i--) {
        obj[inputs[i].name] = inputs[i].value;
      }
    }
    return obj;
  }

  /**
   * Creates an array of tangy-form-items; each item has an array of children elements populated with the item's children with a name attribute
   * @param curriculumFormHtml
   * @returns {Promise<*[]>}
   */
  async createCurriculumFormsList(curriculumFormHtml) {
    let templateEl = document.createElement("template")
    templateEl.innerHTML = curriculumFormHtml
    let curriculumForms = [...templateEl.content.querySelectorAll('tangy-form-item')].map(itemEl => {
      let obj = itemEl.getProps()
      let children = [...itemEl.children[0].content.querySelectorAll('[name]')].map(child =>  child.getProps())
      obj['children'] = children
      return obj
    })
  return curriculumForms
  }

  decimals(num, decimals) {
    var m;
    m = Math.pow(10, decimals);
    num *= m;
    num = num + num<0?-0.5:+0.5 >> 0;
    return num /= m;
  }

  // decimals = function(num, decimals) {
  //   var m;
  //   m = Math.pow(10, decimals);
  //   num *= m;
  //   num = num + num<0?-0.5:+0.5 >> 0;
  //   return num /= m;
  // };

   round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

}


