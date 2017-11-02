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
  let attributes = [].slice.call(this.attributes)
  let serial = {}
  attributes.forEach((attr) => serial[attr.name] = attr.value)
  return serial
}

HTMLElement.prototype.setProps = function (props = {}) {
  if (this.hasOwnProperty('setProperties') && typeof this.setProperties === 'function') {
    // Use Polymer's setProperties method.
    this.setProperties(props)
  } else {
    // Ensure both HTMLElement Properties and Attributes reflect props.
    Object.assign(this, props)
    for (let propKey in props) this.setAttribute(propKey, props[propKey])
  }
}

window.serializeElement = (element) => {
  let attributes = [].slice.call(element.attributes)
  let serial = {}
  attributes.forEach((attr) => serial[attr.name] = attr.value)
  return serial
}