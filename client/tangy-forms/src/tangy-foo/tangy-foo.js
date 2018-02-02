/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
// import '../../node_modules/@polymer/paper-input/paper-input.js'

/**
 * `tangy-foo`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class TangyFoo extends PolymerElement {
  static get template () {
    return `<div id="mememe">I am a meme. Will it build?</div><slot></slot>`
    // return `
    // I am a meme. Will it build?
    // `
  }
  static get is() {
    return 'tangy-foo'
  }

  ready() {
    super.ready()
    console.log("foody!")
    this.innerHTML = "<tangy-input></tangy-input>"
    setTimeout(() => this.innerHTML = 'changing soon', 2000)
    setTimeout(() => this.innerHTML = '<tangy-input></tangy-input>', 4000)
  }
}


window.customElements.define(TangyFoo.is, TangyFoo);
