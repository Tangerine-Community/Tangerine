
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
  if (this.constructor.hasOwnProperty('_props') && Array.isArray(this.constructor._props)) {
    let props = this.constructor._props.reduce((props, propName) => {
      return Object.assign({}, props, { [propName]: this[propName]})
    }, {tagName: this.tagName})
    return props
  }
  let propertyInfo = this.constructor.properties
  // If no property info, then go off what attributes we do have.
  if (!propertyInfo) {
    return Object.assign({}, this.getAttributes(), { tagName: this.tagName, constructorName: this.constructor.name })
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
  if (this.hasAttribute('id')) props['id'] = this.getAttribute('id')
  return Object.assign({}, props, { tagName: this.tagName })
}

HTMLElement.prototype.setProps = function (props = {}) {
  let propsObject = Object.assign({}, props)
  delete propsObject.tagName
  delete propsObject.constructorName
  // Special cases for some properties that need to be set early so they are set when Setters get called later.
  if (propsObject.hasOwnProperty('locked')) {
    this.locked = propsObject.locked
  }
  // Defer some properties being set.
  if (propsObject.hasOwnProperty('value')) {
    Object.assign(this, {...propsObject, value: this.value})
    this.value = propsObject.value
  } else {
    Object.assign(this, propsObject)
  }
}