
window.t = (fragment) => {
  if (window.translation && window.translation[fragment]) {
    return window.translation[fragment]
  } else {
    return fragment
  }
}

window.fillUp = async (numberOfDocs, templateDoc, destroy = true) => {
  let initialEstimate = await navigator.storage.estimate()
  let dbName = `test-${new Date().getTime()}`
  let db = new PouchDB(dbName)
  delete templateDoc._rev
  let i = 0
  while (numberOfDocs > i) {
    let doc = Object.assign({}, templateDoc, { _id: `${i}` })
    await db.put(doc)
    i++
  }
  let concludingEstimate = await navigator.storage.estimate()
  console.log(`
    Initial Estimate: ${JSON.stringify(initialEstimate)}
    Concluding estimate: ${JSON.stringify(concludingEstimate)}
    Usage Difference: ${concludingEstimate.usage - initialEstimate.usage} bytes
    Average Doc Size: ${(concludingEstimate.usage - initialEstimate.usage) / numberOfDocs} bytes
  `)
  if (destroy) await db.destroy()
}

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
  return Object.assign({}, props, { tagName: this.tagName })
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
