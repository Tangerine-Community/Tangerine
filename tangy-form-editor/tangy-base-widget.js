import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";

const MODE_INFO = "MODE_INFO";
const MODE_EDIT = "MODE_EDIT";
const MODE_PRINT = "MODE_PRINT";

class TangyBaseWidget extends PolymerElement {
  /*
   * Implement API.
   */

  get claimElement() {
    return "tangy-base";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigQuestionAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
    };
  }

  upcast(config, element) {
    return {
      ...config,
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastQuestionAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastValidationAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      ...this.getProps(),
    };
  }

  // Convert configuration to HTML.
  downcast(config) {
    return `<tangy-base 
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
      ></tangy-base>`;
  }

  // Return markup for use when in info mode.
  renderInfo(config) {
    return `${this.renderInfoCommonAttributes(config)}`;
  }

  // Return markup for use when in edit mode.
  renderEdit(config) {
    return `
      <tangy-form id="tangy-input">
        <tangy-form-item>
          <template>
            <paper-tabs selected="0">
                <paper-tab>Question</paper-tab>
                <paper-tab>Conditional Display</paper-tab>
                <paper-tab>Validation</paper-tab>
                <paper-tab>Advanced</paper-tab>
            </paper-tabs>
            <iron-pages selected="0">
                <div>
                  ${this.renderEditCoreAttributes(config)}
                  ${this.renderEditQuestionAttributes(config)}
                </div>
                <div>
                  ${this.renderEditConditionalAttributes(config)}
                </div>
                <div>
                  ${this.renderEditValidationAttributes(config)}
                </div>
                <div>
                  ${this.renderEditAdvancedAttributes(config)}
                </div>
            </iron-pages>
          </template>
        </tangy-form-item>
      </tangy-form>
    `;
  }

  // On save of edit form, return updated _config.
  onSubmit(config, formEl) {
    return {
      ...this.onSubmitCoreAttributes(config, formEl),
      ...this.onSubmitQuestionAttributes(config, formEl),
      ...this.onSubmitConditionalAttributes(config, formEl),
      ...this.onSubmitValidationAttributes(config, formEl),
      ...this.onSubmitAdvancedAttributes(config, formEl),
      ...this.onSubmitUnimplementedAttributes(config, formEl),
    };
  }

  /*
   * Public API.
   */

  set markup(markup) {
    this.innerHTML = markup;
    if (!this.querySelector(this.claimElement)) {
      this.innerHTML = this.downcast(this.defaultConfig);
    }
    this._element = this.querySelector(this.claimElement);
    this._config = { ...this.defaultConfig };
    this._config = this.upcast(this._config, this._element);
  }

  get markup() {
    return this.downcast(this._config);
  }

  // Need it?
  /*
  detach() {

  }
  */

  /*
   * Helpers.
   */
  // ****************************  Begin Config Attributes ****************************
  defaultConfigCoreAttributes() {
    return {
      name: "",
      required: true,
      disabled: false,
      hidden: false,
      identifier: false,
    };
  }

  defaultConfigQuestionAttributes() {
    return {
      questionNumber: "",
      label: "",
      hintText: "",
    };
  }

  defaultConfigConditionalAttributes() {
    return {
      showIf: "",
      skipIf: "",
    };
  }

  defaultConfigValidationAttributes() {
    return {
      validIf: "",
      errorText: "",
      warnIf: "",
      warnText: "",
    };
  }

  defaultConfigAdvancedAttributes() {
    return {
      class: "",
      style: "",
    };
  }

  defaultConfigUnimplementedAttributes() {
    return {
      dontSkipIf: "",
      discrepancyIf: "",
      discrepancyText: "",
    };
  }

  // ****************************  Begin Upcast Attributes ****************************
  upcastCoreAttributes(config, element) {
    return {
      name: element.hasAttribute("name") ? element.getAttribute("name") : "",
      required: element.hasAttribute("required") ? true : false,
      hidden: element.hasAttribute("hidden") ? true : false,
      disabled: element.hasAttribute("disabled") ? true : false,
      identifier: element.hasAttribute("identifier") ? true : false,
    };
  }

  upcastQuestionAttributes(config, element) {
    return {
      questionNumber: element.hasAttribute("question-number")
        ? element.getAttribute("question-number")
        : "",
      label: element.hasAttribute("label") ? element.getAttribute("label") : "",
      hintText: element.hasAttribute("hint-text")
        ? element.getAttribute("hint-text")
        : "",
    };
  }

  upcastConditionalAttributes(config, element) {
    return {
      showIf: (element.hasAttribute("show-if")
        ? element.getAttribute("show-if")
        : element.hasAttribute("tangy-if")
          ? element.getAttribute("tangy-if")
          : ""
      ).replace(/&quot;/g, '"'),
      skipIf: element.hasAttribute("skip-if")
        ? element.getAttribute("skip-if").replace(/&quot;/g, '"')
        : "",
    };
  }

  upcastValidationAttributes(config, element) {
    return {
      validIf: element.hasAttribute("valid-if")
        ? element.getAttribute("valid-if").replace(/&quot;/g, '"')
        : "",
      errorText: element.hasAttribute("error-text")
        ? element.getAttribute("error-text")
        : "",
      warnIf: element.hasAttribute("warn-if")
        ? element.getAttribute("warn-if").replace(/&quot;/g, '"')
        : "",
      warnText: element.hasAttribute("warn-text")
        ? element.getAttribute("warn-text")
        : "",
    };
  }

  upcastAdvancedAttributes(config, element) {
    return {
      class: element.hasAttribute("class") ? element.getAttribute("class") : "",
      style: element.hasAttribute("style") ? element.getAttribute("style") : "",
    };
  }

  upcastUnimplementedAttributes(config, element) {
    return {
      dontSkipIf: element.hasAttribute("dont-skip-if")
        ? element.getAttribute("dont-skip-if").replace(/&quot;/g, '"')
        : "",
      discrepancyIf: element.hasAttribute("discrepancy-if")
        ? element.getAttribute("discrepancy-if").replace(/&quot;/g, '"')
        : "",
      discrepancyText: element.hasAttribute("discrepancy-text")
        ? element.getAttribute("discrepancy-text")
        : "",
    };
  }

  // ****************************  Begin Downcast Attributes ****************************
  downcastCoreAttributes(config) {
    return `
      name="${config.name}"
      ${config.required ? "required" : ""}
      ${config.disabled ? "disabled" : ""}
      ${config.hidden ? "hidden" : ""}
      ${config.identifier ? "identifier" : ""}
    `;
  }

  downcastQuestionAttributes(config) {
    return `
      question-number="${config.questionNumber}"
      label="${config.label}"
      hint-text="${config.hintText}"
    `;
  }

  downcastConditionalAttributes(config) {
    return `
      ${ config.showIf === "" ? "" : `show-if="${config.showIf.replace(/"/g, "&quot;")}"` }
      ${ config.skipIf === "" ? "" : `skip-if="${config.skipIf.replace(/"/g, "&quot;")}"` }
    `;
  }

  downcastValidationAttributes(config) {
    return `
      ${ config.validIf === "" ? "" : `valid-if="${config.validIf.replace(/"/g, "&quot;")}"` }
      error-text="${config.errorText}"
      ${ config.warnIf === "" ? "" : `warn-if="${config.warnIf.replace(/"/g, "&quot;")}"` }
      warn-text="${config.warnText}"
    `;
  }

  downcastAdvancedAttributes(config) {
    return `
      class="${config.class}"
      style="${config.style}"
    `;
  }

  downcastUnimplementedAttributes(config) {
    return `
      ${ (!config.dontSkipIf || config.dontSkipIf === "") ? "" : `dont-skip-if="${config.dontSkipIf.replace(/"/g, "&quot;")}"` }
      ${ (!config.discrepancyIf || config.discrepancyIf === "") ? "" : `discrepancy-if="${config.discrepancyIf.replace(/"/g, "&quot;")}"` }
      ${ (!config.discrepancyText || config.discrepancyText === "") ? "" : `discrepancy-text="${config.discrepancyText}"` }
    `;
  }

  // ****************************  Begin Render Info Attributes ****************************
  renderInfoCommonAttributes(config) {
    return `Name: ${config.name}`;
  }

  // ****************************  Begin Render Edit Attributes ****************************
  renderEditCoreAttributes(
    config,
    showRequired = true,
    showHidden = true,
    showDisabled = true,
    showIdentifier = true
  ) {
    return `
      <div class="grid-container">

        <!-- columns should be the immediate child of a .row -->
        <div class="grid-row">
          <div class="eight columns">
            <h3>Data Variable</h3>
            <tangy-input 
              name="name" 
              valid-if="input.value.match(/^[a-zA-Z]{1,}[a-zA-Z0-9\_]{1,}$/)" 
              inner-label="Variable name"
              value="${config.name}"
              hint-text="Enter the variable name that you would like displayed on all data outputs. Valid variable names start with a letter (a-z) with proceeding characters consisting of letters (a-z), underscore (_), and numbers (0-9)."
              error-text="You must define a variable name"
              required>
            </tangy-input>
          </div>
          <div class="four columns">
            <h3>Properties</h3>
            ${
              showRequired
                ? `
                <tangy-toggle
                  name="required" 
                  ${config.required ? 'value="on"' : ""}>
                  Required
                </tangy-toggle>
                `
                : ""
            }
            ${
              showHidden
                ? `
                <tangy-toggle
                  name="hidden"
                  ${config.hidden ? 'value="on"' : ""}>
                  Hidden
                </tangy-toggle>
                `
                : ""
            }
            ${
              showDisabled
                ? `
                <tangy-toggle
                  name="disabled" 
                  ${config.disabled ? 'value="on"' : ""}>
                  Disabled
                </tangy-toggle>
                `
                : ""
            }
            ${
              showIdentifier
                ? `
                <tangy-toggle
                  name="identifier" 
                  ${config.identifier ? 'value="on"' : ""}>
                  Is Identifier (PII/PHI)
                </tangy-toggle>
                `
                : ""
            }
          </div>
        </div>
      </div>
    `;
  }

  renderEditQuestionAttributes(config) {
    return `
      <h3>Question Details</h3>
      <tangy-input
        name="question-number"
        inner-label="Question number"
        value="${config.questionNumber || ''}">
      </tangy-input>
      <tangy-input
        name="label"
        inner-label="Label"
        value="${config.label || ''}">
      </tangy-input>
      <tangy-input
        name="hint-text"
        inner-label="Hint text"
        value="${config.hintText || ''}">
      </tangy-input>
    `;
  }

  renderEditConditionalAttributes(config) {
    return `
      <h3>Conditional Display Logic</h3>
      ${
        config.skipIf || !this.hasAttribute("hide-skip-if")
          ? `
        <tangy-input 
          name="skip_if"
          inner-label="Skip if"
          hint-text="Enter logic for whether or not this should be skipped. Values entered while shown will not persist after hiding (e.g. getValue('should_proceed') === '')"
          value="${config.skipIf.replace(/"/g, "&quot;")}">
        </tangy-input>
      `
          : ""
      }
      ${
        config.showIf || !this.hasAttribute("hide-show-if")
          ? `
      <tangy-input
        name="show_if"
        inner-label="Show if"
        hint-text="Enter any conditional display logic. Values that users enter while shown will persist after hiding. (e.g. getValue('isEmployee') === true)"
        value="${config.showIf.replace(/"/g, "&quot;")}">
      </tangy-input>
      `
          : ""
      }
    `;
  }

  renderEditValidationAttributes(config) {
    return `
      <h3>Warning Validation</h3>
      <p>Use warning validation if you would like to alert the user to a possible data problem but <strong>would not</strong> like to stop them from proceeding with the form.</p>
      <tangy-input 
        name="warn_if"
        inner-label="Warn if"
        hint-text="Enter any conditional validation logic. (e.g. input.value.length > 5)"
        value="${config.warnIf.replace(/"/g, "&quot;")}">
      </tangy-input>
      <tangy-input
        name="warn-text"
        inner-label="Warning text"
        value="${config.warnText}">
      </tangy-input>

      <h3>Error Validation</h3>
      <p>Use error validation if you would like to check for serious data problems. The user <strong>will not</strong> be able to proceed with the form until these errors are corrected.</p>
      <tangy-input 
        name="valid_if"
        inner-label="Valid if"
        hint-text="Enter any conditional validation logic. (e.g. input.value.length > 5)"
        value="${config.validIf.replace(/"/g, "&quot;")}">
      </tangy-input>
      <tangy-input
        name="error-text"
        inner-label="Error text"
        value="${config.errorText}">
      </tangy-input>
    `;
  }

  renderEditAdvancedAttributes(config) {
    return `
      <h3>Advanced Settings</h3>
      <tangy-input 
        name="class" 
        inner-label="CSS Class"
        value="${config.class}"
        hint-text="Enter CSS classes this element may belong to."
        >
      </tangy-input>
      <tangy-input
        name="style"
        inner-label="CSS Style"
        hint-text="Enter CSS for this element."
        value="${config.style.replace(/"/g, "&quot;")}">
      </tangy-input>
    `;
  }

  // ****************************  Begin On Submit Attributes ****************************
  onSubmitCoreAttributes(
    config,
    formEl,
    showRequired = true,
    showHidden = true,
    showDisabled = true,
    showIdentifier = true
  ) {
    return {
      name: formEl.response.items[0].inputs.find(
        (input) => input.name === "name"
      ).value,
      required: showRequired
        ? formEl.response.items[0].inputs.find(
            (input) => input.name === "required"
          ).value === "on"
          ? true
          : false
        : false,
      hidden: showHidden
        ? formEl.response.items[0].inputs.find(
            (input) => input.name === "hidden"
          ).value === "on"
          ? true
          : false
        : false,
      disabled: showDisabled
        ? formEl.response.items[0].inputs.find(
            (input) => input.name === "disabled"
          ).value === "on"
          ? true
          : false
        : false,
      identifier: showIdentifier
        ? formEl.response.items[0].inputs.find(
            (input) => input.name === "identifier"
          ).value === "on"
          ? true
          : false
        : false,
    };
  }

  onSubmitQuestionAttributes(config, formEl) {
    return {
      questionNumber: formEl.response.items[0].inputs.find(
        (input) => input.name === "question-number"
      ).value,
      label: formEl.response.items[0].inputs.find(
        (input) => input.name === "label"
      ).value,
      hintText: formEl.response.items[0].inputs.find(
        (input) => input.name === "hint-text"
      ).value,
    };
  }

  onSubmitConditionalAttributes(config, formEl) {
    return {
      skipIf: formEl.response.items[0].inputs.find((input) => input.name === "skip_if")
        ? formEl.response.items[0].inputs.find(
            (input) => input.name === "skip_if"
          ).value
        : '',
      showIf: formEl.response.items[0].inputs.find((input) => input.name === "show_if")
        ? formEl.response.items[0].inputs.find(
          (input) => input.name === "show_if"
        ).value
        : ''
    };
  }

  onSubmitValidationAttributes(config, formEl) {
    return {
      validIf: formEl.response.items[0].inputs.find(
        (input) => input.name === "valid_if"
      ).value,
      errorText: formEl.response.items[0].inputs.find(
        (input) => input.name === "error-text"
      ).value,
      warnIf: formEl.response.items[0].inputs.find(
        (input) => input.name === "warn_if"
      ).value,
      warnText: formEl.response.items[0].inputs.find(
        (input) => input.name === "warn-text"
      ).value,
    };
  }

  onSubmitAdvancedAttributes(config, formEl) {
    return {
      style: formEl.response.items[0].inputs.find(
        (input) => input.name === "style"
      ).value,
      class: formEl.response.items[0].inputs.find(
        (input) => input.name === "class"
      ).value,
    };
  }

  onSubmitUnimplementedAttributes(config, formEl) {
    return {
      dontSkipIf: config.dontSkipIf ? config.dontSkipIf : "",
      discrepancyIf: config.discrepancyIf ? config.discrepancyIf : "",
      discrepancyText: config.discrepancyText ? config.discrepancyText : "",
    };
  }

  // @Deprecated
  editResponse(config) {
    return false;
  }

  // ?? So we can do event listeners on dynamic items?? Could also make form components for things like <tangy-list>.
  afterRenderEdit() {}

  /*
   * PolymerElement usage.
   */

  static get template() {
    return html`
      <style>
        :host {
          display: block;
          width: 100%;
          cursor: move;
        }

        paper-button {
          background: var(--accent-color);
          color: var(--accent-text-color);
          margin-top: 10px;
        }

        :host([mode="MODE_EDIT"]) paper-card {
          background-color: lightgrey;
        }
        .tangy-spacer {
          flex: 1 1 auto;
        }
        .span-spacer {
          margin-left: 10px;
        }
        .card-header {
          display: flex;
          height: 20px;
          height: 34px;
          padding-top: 10px;
          background: var(--lighter-accent-color);
          color: var(--accent-text-color);
          border-radius: 5px 5px 0px 0px;
        }
        paper-card {
          text-align: left;
          width: 98%;
          margin: 30px 0px 0px;
        }

        .card-content {
          text-align: left;
          padding: 15px;
        }

        .card-actions {
          border-top: none;
        }
        .card-actions-edit {
          margin-top: 3em;
          margin-right: 3em;
          margin-bottom: 100px;
        }

        .card-actions-edit paper-button {
          float: right;
          line-height: 1em;
          background: var(--accent-color);
        }

        .tangy-action-buttons {
          color: var(--accent-text-color);
          background-color: var(--accent-color);
          font-size: 12px;
          font-weight: 500;
          height: 2rem;
        }

        .action-buttons {
          margin-right: 10px;
          cursor: pointer;
        }

        :host([mode="MODE_PRINT"]) #info-edit-card {
          display: none;
        }
        :host(:not([mode="MODE_PRINT"])) #print-container {
          display: none;
        }
        span span .header-text,
        #container span mwc-icon {
          display: none;
        }

        tangy-form-item {
          --tangy-form-item--paper-card-content--padding: 0px;
          --tangy-form-item--paper-card--header: {
            display: none;
          }
        }
        paper-tabs {
          --paper-tabs-selection-bar-color: var(--primary-color-dark);
          background-color: var(--primary-color-lighter);
          color: #fff;
          --paper-tabs-selection-bar: {
            border-bottom: 4px solid
              var(--paper-tabs-selection-bar-color, var(--paper-yellow-a100));
          }
        }

        iron-pages > div {
          padding: 0px 10px;
        }

        tangy-input {
          --tangy-form-widget--margin: 0;
        }

        /* Grid
        –––––––––––––––––––––––––––––––––––––––––––––––––– */
        .grid-container {
          position: relative;
          width: 100%;
          max-width: 960px;
          margin: 0 0;
          padding: 0 0;
          box-sizing: border-box; }
        .column,
        .columns {
          width: 100%;
          float: left;
          box-sizing: border-box; }

        /* For devices larger than 400px */
        @media (min-width: 400px) {
          .grid-container {
            width: 100%;
            padding: 0; }
        }

        /* For devices larger than 550px */
        @media (min-width: 550px) {
          .grid-container {
            width: 100%; }
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

          /* Self Clearing Goodness */
        .grid-container:after,
        .grid-row:after {
          content: "";
          display: table;
          clear: both; }
      </style>

      <paper-card id="info-edit-card">
        <div class="card-header">
          <span class="span-spacer" id="icon"></span>
          <span class="span-spacer tangy-spacer" id="name"></span>
          <span id="edit-button" class="action-buttons" on-click="_onEditClick"
            ><iron-icon icon="create"></iron-icon
          ></span>
          <span id="copy-button" class="action-buttons" on-click="_onCopyClick"
            ><iron-icon icon="content-copy"></iron-icon
          ></span>
          <span
            id="remove-button"
            class="action-buttons"
            on-click="_onRemoveClick"
            ><iron-icon icon="delete"></iron-icon
          ></span>
        </div>
        <div class="card-content" id="container"></div>
      </paper-card>
      <paper-button
        id="add-button"
        class="tangy-action-buttons"
        on-click="_onAddClick"
      >
        <iron-icon icon="add"></iron-icon>
        Insert Here
      </paper-button>

      <span id="print-container"></span>
    `;
  }

  static get properties() {
    return {
      name: {
        type: String,
        value: "",
      },
      widget: {
        type: Boolean,
        value: true,
        reflectToAttribute: true,
      },
      mode: {
        type: String,
        value: MODE_INFO,
        observer: "_render",
        reflectToAttribute: true,
      },
      _config: {
        type: Object,
        value: {},
        observer: "_render",
        reflectToAttribute: true,
      },
    };
  }

  constructor() {
    super();
    this._config = this.defaultConfig;
  }

  connectedCallback() {
    super.connectedCallback();
    this.markup = this.innerHTML;
    // A useful selector from higher in the DOM.
    this.widget = true;
  }

  /*
   *Private API
   */

  // Proxy for render to the #container element.
  _render() {
    if (this.mode === MODE_EDIT) {
      this.shadowRoot.querySelector("#container").innerHTML = `
        
        ${this.renderEdit(this._config)}
        `;

      if (this.editResponse(this._config)) {
        this.shadowRoot
          .querySelector("#container")
          .querySelector("tangy-form").response = this.editResponse(
          this._config
        );
      } else {
        this.shadowRoot
          .querySelector("#container")
          .querySelector("tangy-form")
          .newResponse();
      }

      if (this.shadowRoot.querySelector("paper-tabs")) {
        this.shadowRoot
          .querySelector("paper-tabs")
          .addEventListener("click", (event) => {
            this.shadowRoot.querySelector(
              "iron-pages"
            ).selected = this.shadowRoot.querySelector("paper-tabs").selected;
          });
      }

      this.shadowRoot
        .querySelector("#container")
        .querySelector("tangy-form")
        .addEventListener("submit", (event) => this._onSubmit());
    } else if (this.mode === MODE_INFO) {
      this.shadowRoot.querySelector("#container").innerHTML = this.renderInfo(
        this._config
      );
    } else if (this.mode === MODE_PRINT) {
      // Make implementing renderPrint optional.
      this.shadowRoot.querySelector("#container").innerHTML = ``;
      this.shadowRoot.querySelector("#print-container").innerHTML = this
        .renderPrint
        ? this.renderPrint(this._config)
        : this.renderInfo(this._config);
    }
  }

  _onSubmit() {
    this.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
    this._config = this.onSubmit(
      this._config,
      this.shadowRoot.querySelector("tangy-form")
    );
    this.innerHTML = this.downcast(this._config);
    this.dispatchEvent(new CustomEvent("submit-input", { bubbles: true }));
    this.mode = MODE_INFO;
    this.sparkle = "now";
  }

  _onRemoveClick() {
    this.remove();
  }

  _onEditClick() {
    this.dispatchEvent(new CustomEvent("edit-input", { bubbles: true }));
    this.mode = MODE_EDIT;
  }

  _onAddClick() {
    let addInputEl = this.parentElement.querySelector(
      "tangy-form-editor-add-input"
    );
    !addInputEl
      ? this.dispatchEvent(new CustomEvent("add-input", { bubbles: true }))
      : this.parentElement.removeChild(addInputEl);
  }

  _onCopyClick() {
    this.dispatchEvent(new CustomEvent("copy-input", { bubbles: true }));
  }
}

export { TangyBaseWidget };
