/* jshint esversion: 6 */

import {Element as PolymerElement} from '../../node_modules/@polymer/polymer/polymer-element.js'
import './build/ckeditor.js'


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
    const config = {
//            toolbar: [ 'headings', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'acasi', 'dumpdata' ],
      toolbar: [ 'headings', 'bold', 'italic', 'link', 'bulletedList', 'numberedList' ],
//            plugins: [ 'Heading', 'Bold', 'Italic', 'Link', 'List', 'Paragraph', 'typing',  'Image', 'ImageToolbar', 'ImageCaption', 'ImageStyle', 'ImageUpload', 'Acasi', 'Dumpdata' ],
      plugins: [ 'Paragraph', 'Heading', 'Bold', 'Italic', 'Link', 'List', 'BlockQuote', 'Image', 'ImageUpload' ],
      image: {
        toolbar: [ 'imageTextAlternative', '|', 'imageStyleFull', 'imageStyleSide' ]
      },
      ckfinder: {
        uploadUrl: '/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
      }
    };
    ClassicEditor
    // .create( window.document.querySelector("#editor"), config )
      .create( window.document.querySelector("#editor") )
      .then( editor => {
        console.log( editor );
        if (typeof Tangy == 'undefined') {
          window.Tangy = new Object()
          window.Tangy.editor = editor
        } else {
          window.Tangy.editor = editor
        }
      } )
      .catch( error => {
        console.error( error );
      } );
  }

  ready() {
    super.ready();
    // retrieve the nested template
    let template = this.shadowRoot.querySelector('#special-template');

    //
//        for (let i=0; i<10; i++) {
//          this.shadowRoot.appendChild(document.importNode(template.content, true));
    document.querySelector("#content").appendChild(document.importNode(template.content, true));
//        }

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
