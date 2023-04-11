/* jshint esversion: 6 */

import { t } from "tangy-form/util/t"

const initialState = {
  openItem: '',
  form: {},
  items: [],
  print: false
}

const itemModel = {
  id: 'item1',
  title: 'Item 1',
  summary: false,
  hideNextButton: false,
  hideBackButton: false,
  template: ``
}

const tangyFormEditorReducer = function (state = initialState, action) {
  var newState
  var itemIndex 
  switch(action.type) {
    case 'WARN':
      return Object.assign({}, state, {warningMessage: action.payload} )
    case 'FORM_OPEN':
      return Object.assign({}, initialState, action.payload )
    case 'FORM_PRINT':
      return Object.assign({}, state, {print: true} )
    case 'FORM_EDIT':
      return Object.assign({}, state, {openItem: 'form.html'} )
    case 'FORM_UPDATE':
      return Object.assign({}, state, {form: Object.assign({}, state.form, action.payload) })
    case 'ITEM_CREATE':
      return Object.assign({}, state, {
        items: [...state.items, Object.assign({}, itemModel, {id: 'section_'+UUID(), title: 'New Section'})]
      })
    case 'ITEM_OPEN':
      return Object.assign({}, state, { openItem: action.payload })
    case 'ITEM_CLOSE':
      return Object.assign({}, state, { openItem: '' })
    case 'ITEM_UPDATE':
      itemIndex = state.items.findIndex(item => item.id === action.payload.id)
      newState = Object.assign({}, state)
      newState.items[itemIndex] = action.payload
      return newState
    case 'ITEM_DELETE':
      newState = Object.assign({}, state, { items: [...state.items.filter(item => item.id !== action.payload)]})
      return newState
    case 'ITEM_COPY':
      itemIndex = state.items.findIndex(item => item.id === action.payload)
      let item = state.items.find(item => item.id === action.payload)
      const parentEl = document.createElement('div')
      parentEl.append(document.createRange().createContextualFragment(item.template))
      const template = parentEl.querySelectorAll(':scope > *')
      template.forEach(e=>e.name&&e.setAttribute('name',`copy_of_${e.name}_${UUID()}`))
      const templateHtml = Array.from(template).reduce((acc,curr)=>acc+(curr.outerHTML||curr.nodeValue),"")
      item = {...item, id:`copy_of_${item.id}_${UUID()}`, title:`${t('Copy of')} ${item.title}`, template: templateHtml}
      newState = Object.assign({}, state, { items: [...state.items.slice(0,itemIndex+1),item,...state.items.slice(itemIndex+1)]})
      return newState
    case 'SORT_ITEMS':
      return Object.assign({}, state, { 
        items: action.payload.map(itemId => state.items[state.items.findIndex(item => item.id === itemId)])
      })
    default: 
      return state
  }
  return state
}
function UUID(separator) {
  if (typeof separator === 'undefined') {
    separator = '';
  }
  var self = {};
  var lut = [];
  for (var i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
  }
  /**
   * Generates a UUID
   * @returns {string}
   */
  self.generate = function (separator) {
    var d0 = Math.random() * 0xffffffff | 0;
    var d1 = Math.random() * 0xffffffff | 0;
    var d2 = Math.random() * 0xffffffff | 0;
    var d3 = Math.random() * 0xffffffff | 0;
    return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + separator +
      lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + separator + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + separator +
      lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + separator + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
      lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
  };
  return self.generate(separator);
}
export {tangyFormEditorReducer}
