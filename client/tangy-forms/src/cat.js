window.sleep = (ms) => new Promise((res, rej) => { 
  setTimeout(res, ms)
})

window.serializeElement = (element) => {
  let attributes = [].slice.call(element.attributes)
  let serial = {}
  attributes.forEach((attr) => serial[attr.name] = attr.value)
  return serial
}