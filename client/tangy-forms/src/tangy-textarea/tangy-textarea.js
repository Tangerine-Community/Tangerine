/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
// import './build/ckeditor.js'
import '../tangy-form/tangy-common-styles.js'


/**
 * `tangy-textarea`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class TangyTextarea extends PolymerElement {

  static get template () {
    return `
        <style include="tangy-common-styles"></style>
        <template id="special-template" preserve-content>
            <textarea id="editor" hidden></textarea>
        </template>
  `
  }

  static get is() { return 'tangy-textarea'; }

  static get properties() {
    return {
      value: {
        type: String,
      }
    }
  }

  connectedCallback() {
    super.connectedCallback()
    CKEDITOR.replace( 'editorCK' );
    CKEDITOR.on('dialogDefinition', function(e) {
      var dialogName = e.data.name;
      var dialogDefinition = e.data.definition;
      dialogDefinition.onShow = function() {
        this.move(this.getPosition().x,0); // Top center
      }
    })
  }

  ready() {
    super.ready();
    // retrieve the nested template
    let template = this.shadowRoot.querySelector('#special-template');
    document.querySelector("#content").appendChild(document.importNode(template.content, true));
  }

  created() {
    console.log(this.localName + '#' + this.id + ' was created');
  }

  attached() {
    super.attached();
    console.log(this.localName + '#' + this.id + ' was attached');

  }

  detached() {
    console.log(this.localName + '#' + this.id + ' was detached');
  }

  attributeChanged(name, type) {
    console.log(this.localName + '#' + this.id + ' attribute ' + name +
      ' was changed to ' + this.getAttribute(name));
  }

}
window.customElements.define(TangyTextarea.is, TangyTextarea);
