/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
import './ckeditor/ckeditor.js'

    /**
     * `tangy-ckeditor`
     *
     *
     * @customElement
     * @polymer
     * @demo demo/index.html
     */
export class TangyCkeditor extends PolymerElement {
  static get template () {
    return `
     <slot></slot>
    `
  }

  static get is () {
    return 'tangy-ckeditor'
  }

  static get properties () {
    return {

    }
  }

  static get content () {
    return this._content;
  }

  static set content (content) {
    if (content !== this._content) {
      this._content = content;
      if (this._editor !== null) {
        this._editor.setData(this._content);
      }
    }
  }

  connectedCallback () {
    super.connectedCallback()
    this._content = this.innerHTML;
    this.value = this.innerHTML;
    this._editor = null;
    this._contentUpdate = null;
    this.innerHTML = `<div id="tangy-ckeditor-instance" contenteditable="true">${this._content}</div>`
    this._editor = CKEDITOR.inline('tangy-ckeditor-instance', {
      // Allow some non-standard markup that we used in the introduction.
      // extraAllowedContent: 'a(documentation);abbr[title];code',
      allowedContent: true,
      // fillEmptyBlocks: false,
      // ignoreEmptyParagraph: true,
      // Use disableAutoInline when explicitly using CKEDITOR.inline( 'editorCK' );
      disableAutoInline: true,
      // Show toolbar on startup (optional).
      startupFocus: true
    });
    var base = this;
    base._editor.on('change', function (e) {
        var content = base._editor.getData();
        base.value = content
        base._content = content;
        var event = new CustomEvent(
            'ckeditorchange',
            {detail: content});
        base.dispatchEvent(event);
    });
  }

  disconnectedCallback() {
    this._editor.destroy();
    this._editor = null;
  }

}
window.customElements.define(TangyCkeditor.is, TangyCkeditor)
