
window.sleep = (ms) => new Promise((res, rej) => {
  setTimeout(res, ms)
})

// For parsing window.location.hash parameters.
window.getHashParams = () => {
  var params = {}
  var qstr = window.location.hash;
  var a = (qstr[0] === '#' ? qstr.substr(1) : qstr).split('&');
  for (var i = 0; i < a.length; i++) {
    var b = a[i].split('=');
    params[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
  }
  return params;
}

window.setHashParam = (name, value) => {
  let params = getHashParams()
  params[name] = value
  let hash = '#'
  for (let key in params) {
    hash += `${key}=${params[key]}&`
  }
  window.location.hash = hash
}

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

// @TODO See one liner that TimvdLippe suggested https://github.com/Polymer/polymer/issues/4918#issuecomment-355835087
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
