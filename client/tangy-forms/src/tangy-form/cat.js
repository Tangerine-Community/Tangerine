import {TangyForm} from './tangy-form.js'
import {TangyFormItem} from './tangy-form-item.js'
import {TangyInput} from '../tangy-input/tangy-input.js'
import {TangyCheckbox} from '../tangy-checkbox/tangy-checkbox.js'

window.sleep = (ms) => new Promise((res, rej) => {
  setTimeout(res, ms)
})

// Perhaps props should always be based on the attributes... Stop dealing with this transformation of naming and deal with the fact a prop not existing means it is set to false.

HTMLElement.prototype.getAttributes = function () {
  let attributes = [].slice.call(this.attributes)
  let serial = {}
  attributes.forEach((attr) => serial[attr.name] = attr.value)
  return serial
}

HTMLElement.prototype.setAttributes = function (attributes = {}) {
  for (let attributeName in attributes) this.setAttribute(attributeName, attributes[attributeName])
}

HTMLElement.prototype.getProps = function () {
  let propertyInfo = this.constructor.properties
  // If no property info, then go off what attributes we do have.
  if (!propertyInfo) {
    return Object.assign({}, this.getAttributes(), {tagName: this.tagName, constructorName: this.constructor.name})
  }
  let props = {}
  for (let propName in propertyInfo) {
    if (propertyInfo[propName].type === Boolean) {
      if (!this.hasOwnProperty(propName) || this[propName] === false) props[propName] = false
      if (this[propName] === '' || this[propName] === true) props[propName] = true
    } else {
      props[propName] = this[propName] 
    }
  }
  return Object.assign({}, props, {tagName: this.tagName})
}

HTMLElement.prototype.setProps = function (props = {}) {
  let propsObject = Object.assign({}, props)
  delete propsObject.tagName
  delete propsObject.constructorName
  Object.assign(this, propsObject)
}

window.serializeElement = (element) => {
  let attributes = [].slice.call(element.attributes)
  let serial = {}
  attributes.forEach((attr) => serial[attr.name] = attr.value)
  return serial
}
