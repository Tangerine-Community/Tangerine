/**
 * `t-number`
 * 
 * @customElement
 * @demo demo/index.html
 */

import { tNumber } from "./t-number.util"


export class TNumber extends HTMLElement {

  _originalContents:string
  _isTranslating = false
  observer:any

  connectedCallback() {
    const onMutation = (mutationsList, observer) => {
      observer.disconnect()
      this.setup()
      this.render()
      this.observer = new MutationObserver(onMutation)
      this.observer.observe(this, {characterData: true, childList: true, attributes: false});
    }
    this.setup()
    this.render()
    const observer = new MutationObserver(onMutation)
    observer.observe(this, {characterData: true, childList: true, attributes: false});
    document.body.addEventListener('lang-change', this.render.bind(this))
  }

  setup() {
    this.innerHTML = `
      <span style="display:none" class="original">${this.innerHTML}</span>
      <span class="translation"></span>
    `
  }

  render() {
    const originalContents = this.querySelector('.original').innerHTML
    this.querySelector('.translation').innerHTML = tNumber(originalContents)  
  }

}

window.customElements.define('t-number', TNumber);

