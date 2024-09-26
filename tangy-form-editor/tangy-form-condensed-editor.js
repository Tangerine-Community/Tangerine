import {html, PolymerElement} from '@polymer/polymer/polymer-element.js'
import {Fab} from '@material/mwc-fab'
import './tangy-form-editor-add-input.js'
import './widget/tangy-text-widget.js'
import './widget/tangy-keyboard-input-widget.js'
import './widget/tangy-number-widget.js'
import './widget/tangy-eftouch-widget.js'
import './widget/tangy-input-groups-widget.js'
import './widget/tangy-checkbox-widget.js'
import './widget/tangy-checkboxes-widget.js'
import './widget/tangy-timed-widget.js'
import './widget/tangy-radio-buttons-widget.js'
import './widget/tangy-radio-blocks-widget.js'
import './widget/tangy-prompt-box-widget.js'
import './widget/tangy-select-widget.js'
import './widget/tangy-gps-widget.js'
import './widget/tangy-gate-widget.js'
import './widget/tangy-location-widget.js'
import './widget/tangy-date-widget.js'
import './widget/tangy-time-widget.js'
import './widget/tangy-image-widget.js'
import './widget/tangy-box-widget.js'
import './widget/tangy-template-widget.js'
import './widget/tangy-email-widget.js'
import './widget/tangy-qr-widget.js'
import './widget/tangy-consent-widget.js'
import './widget/tangy-untimed-grid-widget.js'
import './widget/tangy-acasi-widget.js'
import './widget/tangy-partial-date-widget.js'
import './widget/tangy-ethio-date-widget.js'
import './widget/tangy-signature-widget.js'
import './widget/tangy-toggle-widget.js'
import './widget/tangy-photo-capture-widget'
import './widget/tangy-video-capture-widget'

/**
 * `tangy-form-item-editor`
 * ...
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */

class TangyFormCondensedEditor extends PolymerElement {
  static get template() {
    return html``;
  }

  set markup(value) {
    this.wrap(value);
  }

  get markup() {
    return this.unwrap();
  }

  static get properties() {
    return {
      print: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      hideShowIf: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      hideSkipIf: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      filesEndpoint: {
        type: String,
        value: "",
      },
      locationListsMetadata: {
        type: Object,
        value: ''
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.addEventListener("add-input", (event) =>
      this.addInput(event.target)
    );
    this.shadowRoot.addEventListener("copy-input", (event) =>
      this.copyInput(event.target)
    );
    this.shadowRoot.addEventListener("edit-input", (event) => this.editInput());
    this.shadowRoot.addEventListener("submit-input", (event) =>
      this.submitInput()
    );
    this.wrap(this.querySelector("template").innerHTML);
  }

  // Iterate through declared Editor Widgets and wrap them around their corresponding claimed elements.
  wrap(markup) {
    const template = document.createElement("template");
    template.innerHTML = markup;

    // Wrap all nodes (1 level deep) with their corresponding widget elements.
    template.content.childNodes.forEach((childNode) => {
      if (childNode.nodeName !== "#text") {
        let foundWidget = window.tangyFormEditorWidgets.widgets.find(
          (widgetInfo) => childNode.matches(widgetInfo.claimElement)
        );
        if (foundWidget) {
          const widgetEl = document.createElement(foundWidget.widgetName);
          widgetEl.setAttribute("widget", "");
          widgetEl.setAttribute(
            "mode",
            this.print ? "MODE_PRINT" : "MODE_INFO"
          );
          widgetEl.setAttribute("files-endpoint", this.filesEndpoint);
          if (foundWidget.widgetName == 'tangy-location-widget') {
            widgetEl.setAttribute("location-lists-metadata", `${JSON.stringify(this.locationListsMetadata)}`);
          }
          if (this.hideSkipIf) widgetEl.setAttribute("hide-skip-if", "");
          if (this.hideShowIf) widgetEl.setAttribute("hide-show-if", "");
          wrap(childNode, widgetEl);
        }
      }
    });

    // Wrap all unclaimed nodes with tangy-box.
    template.content.childNodes.forEach((node) => {
      if (
        (node.hasAttribute && !node.hasAttribute("widget")) ||
        (node.nodeName === "#text" &&
          !!node.wholeText.replace(/ /g, "").replace(/\s+/g, ""))
      ) {
        const tangyEl = document.createElement("tangy-box");
        wrap(node, tangyEl);
        const widgetEl = document.createElement("tangy-box-widget");
        wrap(tangyEl, widgetEl);
      }
    });
    this.shadowRoot.innerHTML = `
      <style>
        #add-button {
          margin-top: 10px;
        }
        .tangy-action-buttons{
          color: var(--accent-text-color);
          background-color: var(--accent-color);
          font-size: 12px;
          font-weight: 500;
          height: 2rem;
        }

        tangy-form-editor-add-input {
          width: 100%;
        }

        /* Grid
        –––––––––––––––––––––––––––––––––––––––––––––––––– */
        .grid-container {
          position: relative;
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          padding: 0 20px;
          box-sizing: border-box; }
        .column,
        .columns {
          width: 100%;
          float: left;
          box-sizing: border-box; }

        /* For devices larger than 400px */
        @media (min-width: 400px) {
          .grid-container {
            width: 85%;
            padding: 0; }
        }

        /* For devices larger than 550px */
        @media (min-width: 550px) {
          .grid-container {
            width: 80%; }
          .column,
          .columns {
            margin-left: 4%; }
          .column:first-child,
          .columns:first-child {
            margin-left: 0; }

          .one.column,
          .one.columns                    { width: 4.66666666667%; }
          .two.columns                    { width: 13.3333333333%; }
          .three.columns                  { width: 22%;            }
          .four.columns                   { width: 30.6666666667%; }
          .five.columns                   { width: 39.3333333333%; }
          .six.columns                    { width: 48%;            }
          .seven.columns                  { width: 56.6666666667%; }
          .eight.columns                  { width: 65.3333333333%; }
          .nine.columns                   { width: 74.0%;          }
          .ten.columns                    { width: 82.6666666667%; }
          .eleven.columns                 { width: 91.3333333333%; }
          .twelve.columns                 { width: 100%; margin-left: 0; }

          .one-third.column               { width: 30.6666666667%; }
          .two-thirds.column              { width: 65.3333333333%; }

          .one-half.column                { width: 48%; }

          /* Offsets */
          .offset-by-one.column,
          .offset-by-one.columns          { margin-left: 8.66666666667%; }
          .offset-by-two.column,
          .offset-by-two.columns          { margin-left: 17.3333333333%; }
          .offset-by-three.column,
          .offset-by-three.columns        { margin-left: 26%;            }
          .offset-by-four.column,
          .offset-by-four.columns         { margin-left: 34.6666666667%; }
          .offset-by-five.column,
          .offset-by-five.columns         { margin-left: 43.3333333333%; }
          .offset-by-six.column,
          .offset-by-six.columns          { margin-left: 52%;            }
          .offset-by-seven.column,
          .offset-by-seven.columns        { margin-left: 60.6666666667%; }
          .offset-by-eight.column,
          .offset-by-eight.columns        { margin-left: 69.3333333333%; }
          .offset-by-nine.column,
          .offset-by-nine.columns         { margin-left: 78.0%;          }
          .offset-by-ten.column,
          .offset-by-ten.columns          { margin-left: 86.6666666667%; }
          .offset-by-eleven.column,
          .offset-by-eleven.columns       { margin-left: 95.3333333333%; }

          .offset-by-one-third.column,
          .offset-by-one-third.columns    { margin-left: 34.6666666667%; }
          .offset-by-two-thirds.column,
          .offset-by-two-thirds.columns   { margin-left: 69.3333333333%; }

          .offset-by-one-half.column,
          .offset-by-one-half.columns     { margin-left: 52%; }

        }
      </style>
      <paper-button id="add-button" class="tangy-action-buttons">
        <iron-icon icon="add"></iron-icon>
        Insert Here
      </paper-button>
      <sortable-list style="width: 100%">${template.innerHTML}</sortable-list>
    `;
    this.shadowRoot
      .querySelector("#add-button")
      .addEventListener("click", (event) => this.addInput());
    this.shadowRoot
      .querySelector("sortable-list")
      .addEventListener("sort-finish", (event) => this.onSortFinish(event));
  }

  // Iterate through widgets and unwrap them by calling TangyWidget.downcast() to convert them to HTML.
  unwrap() {
    return [...this.shadowRoot.querySelectorAll("[widget]")]
      .map((el) => el.downcast(el._config))
      .join("");
  }

  addInput(insertAfterEl) {
    if (this.shadowRoot.querySelector("tangy-form-editor-add-input")) {
      return this.shadowRoot
        .querySelector("tangy-form-editor-add-input")
        .remove();
    }
    const addInputEl = document.createElement("tangy-form-editor-add-input");
    addInputEl.setAttribute("files-endpoint", this.filesEndpoint);
    addInputEl.setAttribute("location-lists-metadata", `${JSON.stringify(this.locationListsMetadata)}`);
    if (this.hasAttribute('hide-skip-if')) addInputEl.setAttribute('hide-skip-if', '')
    if (this.hasAttribute('hide-show-if')) addInputEl.setAttribute('hide-show-if', '')
    if (insertAfterEl) {
      insertAfterEl.after(addInputEl);
    } else {
      // making the first element
      this.shadowRoot.querySelector("sortable-list").prepend(addInputEl);
    }
    setTimeout(
      (_) =>
        this.shadowRoot
          .querySelector("tangy-form-editor-add-input")
          .scrollIntoView({ behavior: "smooth", block: "start" }),
      50
    );
    this.shadowRoot.querySelector("sortable-list").disabled = true;
  }

  editInput() {
    this.shadowRoot.querySelector("sortable-list").disabled = true;
  }

  copyInput(el) {
    let clone = el.cloneNode();
    clone.innerHTML = el.innerHTML;
    clone.children[0].setAttribute("name", "widget_" + UUID());
    el.after(clone);
    clone._onEditClick();
    setTimeout(
      (_) =>
        clone.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        }),
      50
    );
    this.shadowRoot.querySelector("sortable-list").disabled = true;
  }

  submitInput() {
    this.dispatchEvent(
      new CustomEvent("tangy-form-condensed-editor-changed", { bubbles: true })
    );
    this.shadowRoot.querySelector("sortable-list").disabled = false;
  }

  onSortFinish() {
    this.dispatchEvent(
      new CustomEvent("tangy-form-condensed-editor-changed", { bubbles: true })
    );
  }
}

function wrap(el, wrapper) {
  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);
}

// TODO: Create a utilities class for this function? It is a duplicate from tangy-form-editor-reducer
function UUID(separator) {
  if (typeof separator === "undefined") {
    separator = "";
  }
  var self = {};
  var lut = [];
  for (var i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? "0" : "") + i.toString(16);
  }
  /**
   * Generates a UUID
   * @returns {string}
   */
  self.generate = function (separator) {
    var d0 = (Math.random() * 0xffffffff) | 0;
    var d1 = (Math.random() * 0xffffffff) | 0;
    var d2 = (Math.random() * 0xffffffff) | 0;
    var d3 = (Math.random() * 0xffffffff) | 0;
    return (
      lut[d0 & 0xff] +
      lut[(d0 >> 8) & 0xff] +
      lut[(d0 >> 16) & 0xff] +
      lut[(d0 >> 24) & 0xff] +
      separator +
      lut[d1 & 0xff] +
      lut[(d1 >> 8) & 0xff] +
      separator +
      lut[((d1 >> 16) & 0x0f) | 0x40] +
      lut[(d1 >> 24) & 0xff] +
      separator +
      lut[(d2 & 0x3f) | 0x80] +
      lut[(d2 >> 8) & 0xff] +
      separator +
      lut[(d2 >> 16) & 0xff] +
      lut[(d2 >> 24) & 0xff] +
      lut[d3 & 0xff] +
      lut[(d3 >> 8) & 0xff] +
      lut[(d3 >> 16) & 0xff] +
      lut[(d3 >> 24) & 0xff]
    );
  };
  return self.generate(separator);
}

window.customElements.define(
  "tangy-form-condensed-editor",
  TangyFormCondensedEditor
);
