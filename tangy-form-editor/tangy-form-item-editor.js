import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "./tangy-widgets.js";
import "./tangy-form-condensed-editor.js";
import '@polymer/paper-toggle-button/paper-toggle-button.js'

class TangyFormItemEditor extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          color: var(--primary-text-color);
          font-size: medium;
        }

        .rightCategories {
          margin-left: 2em;
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
          background: var(--primary-color-lighter);
          color: var(--accent-text-color);
          border-radius: 5px 5px 0px 0px;
        }
        #edit-button {
          margin-right: 10px;
          cursor: pointer;
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

        .gray-background {
          background: #ebebeb;
        }
        .tangy-action-buttons {
          color: var(--accent-text-color);
          background-color: var(--accent-color);
          font-size: 12px;
          font-weight: 500;
          height: 2rem;
        }
      </style>
      <div id="container"></div>
      <slot></slot>
    `;
  }

  static get properties() {
    return {
      item: {
        type: Object,
        value: undefined,
        observer: "render",
      },
      categories: {
        type: Array,
        value: false,
        reflectToAttribute: true,
      },
      scoringFields: {
        type: Array,
        value: [],
        reflectToAttribute: true,
      },
      customScoringLogic: {
        type: String,
        value: "",
        reflectToAttribute: true,
      },
      scoringSection: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      hideSkipIf: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      hideShowIf: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      filesEndpoint: {
        type: String,
        value: "",
      },
    };
  }

  connectedCallback() {
    super.connectedCallback();
  }

  render() {
    this.$.container.innerHTML = `
      <div>
        <div>
          <paper-button id="back-to-forms" 
            class="tangy-action-buttons">
            <iron-icon icon="arrow-back"></iron-icon>
            ${t("Back")}
          </paper-button>
        </div>
        
      </div>
      <paper-card id="item-info" class="gray-background">
        <div class="card-header">
          <span class="span-spacer"><iron-icon id="item-icon" icon="icons:assignment"></iron-icon></span>
          <span class="span-spacer">${this.item.id}</span>
          <span class="tangy-spacer span-spacer">${t("Item Details")}</span>
          <span id="edit-button"><iron-icon icon="create"></iron-icon></span>
        </div>
        <div class="card-content">
          <div id="details-content-edit">
            <paper-input id="itemTitle" value="${
              this.item.title
            }" label="title" always-float-label></paper-input>
            <p>Item id: ${this.item.id}</p>
            <p><paper-checkbox id="summary-checkbox" ${
              this.item.summary ? "checked" : ""
            }>${t(
      "Show this item in the summary at the end"
    )}</paper-checkbox></p>
            <p><paper-checkbox id="hide-back-button-checkbox" ${
              this.item.hideBackButton ? "checked" : ""
            }>${t("Hide the back button")}</paper-checkbox></p>
            <p><paper-checkbox id="hide-next-button-checkbox" ${
              this.item.hideNextButton ? "checked" : ""
            }>${t("Hide the next button")}</paper-checkbox></p>
            <p><paper-checkbox id="right-to-left-checkbox" ${
              this.item.rightToLeft ? "checked" : ""
            }>${t("right-to-left orientation")}</paper-checkbox></p>
            <p><paper-checkbox id="hide-nav-labels-checkbox" ${
              this.item.hideNavLabels ? "checked" : ""
            }>${t("Hide navigation labels")}</paper-checkbox></p>
            <p><paper-checkbox id="hide-nav-icons-checkbox" ${
              this.item.hideNavIcons ? "checked" : ""
            }>${t("Hide navigation icons")}</paper-checkbox></p>
            <p><paper-checkbox id="scoring-section-checkbox" ${
              this.item.scoringSection ? "checked" : ""
            }>${t("This section includes scoring in section header")}</paper-checkbox></p>
<!--            <paper-expansion-panel header="scoring logic" id="scoring-editor" opened></paper-expansion-panel>-->
            <div id="scoring-editor"></div>
            <paper-expansion-panel header="on-open logic" id="on-open-editor"></paper-expansion-panel>
            <paper-expansion-panel header="on-change logic" id="on-change-editor"></paper-expansion-panel>
            ${
              this.categories
                ? '<paper-expansion-panel header="categories" id="categories-editor"></paper-expansion-panel>'
                : ""
            }
            <paper-input type="hidden" id="scoring-fields" value="${
              this.item.scoringFields
            }" ></paper-input>
            <p><paper-input type="number" id="incorrectThreshold" value="${
              this.item.incorrectThreshold
            }" label="Threshold: Number of incorrect answers before disabling remaining questions" always-float-label></paper-input>
            <label id="hintText">Currently limited to radio-buttons; disables remaining questions when threshold of incorrect answers is reached.</label></p>
          </div>
          <div id="details-content-view">
            ${this.item.title}<br/>
            <p><paper-checkbox disabled id="summary-checkbox" ${
              this.item.summary ? "checked" : ""
            }>${t(
      "Show this item in the summary at the end"
    )}</paper-checkbox></p>
            <p><paper-checkbox disabled id="hide-back-button-checkbox" ${
              this.item.hideBackButton ? "checked" : ""
            }>${t("Hide the back button")}</paper-checkbox></p>
            <p><paper-checkbox disabled id="hide-next-button-checkbox" ${
              this.item.hideNextButton ? "checked" : ""
            }>${t("Hide the next button")}</paper-checkbox></p>
            <p><paper-checkbox disabled id="right-to-left-checkbox" ${
              this.item.rightToLeft ? "checked" : ""
            }>right-to-left orientation</paper-checkbox></p>
            <p><paper-checkbox disabled id="hide-nav-labels-checkbox" ${
              this.item.hideNavLabels ? "checked" : ""
            }>${t("Hide navigation labels")}</paper-checkbox></p>
            <p><paper-checkbox disabled id="hide-nav-icons-checkbox" ${
              this.item.hideNavIcons ? "checked" : ""
            }>${t("Hide navigation icons")}</paper-checkbox></p>
            <p><paper-checkbox disabled id="scoring-section-checkbox" ${
              this.item.scoringSection ? "checked" : ""
            }>${t("This section includes scoring in section header")}</paper-checkbox></p>
            <paper-input type="hidden" id="scoring-fields" value="${
              this.item.scoringFields
            }" ></paper-input>
            <p><paper-input disabled type="number" id="incorrectThreshold" value="${
              this.item.incorrectThreshold
            }" label="Threshold: Number of incorrect answers before disabling remaining questions" always-float-label></paper-input>
            </div>
        </div>
        <div id="details-content-edit-actions" class="card-actions-edit">
          <paper-button class="tangy-action-buttons" id="save" style="float:right" role="button" tabindex="0" animated="" elevation="0">${t(
            "Submit"
          )}</paper-button>
        </div>
      </paper-card>
        
     <tangy-form-condensed-editor files-endpoint="${this.filesEndpoint}"
      ${this.hideSkipIf ? `hide-skip-if` : ""}
      ${this.hideShowIf ? `hide-show-if` : ""}
     >
        <template>
          ${this.item.template}
        </template>
      </tangy-form-condensed-editor>
      </div>
    `;
    if (!this.edit) {
      this.$.container.querySelector("#details-content-edit").style =
        "display:none";
      this.$.container.querySelector("#details-content-edit-actions").style =
        "display:none";
    } else {
      this.$.container.querySelector("#details-content-view").style =
        "display:none";
      // this.$.container.querySelector('#details-content-view-actions').style = 'display:none'
      // this.$.container.querySelector('#details-card').style = "display:block"
    }
    this.$.container
      .querySelector("#back-to-forms")
      .addEventListener("click", this.onBackToForms.bind(this));
    this.$.container
      .querySelector("#edit-button")
      .addEventListener("click", this._onEditClick.bind(this));
    this.$.container
        .querySelector("#scoring-section-checkbox")
        .addEventListener("click", this.onRevealScoringSection.bind(this));

    if(this.item.scoringSection){
      const checkbox = this.$.container.querySelector("#scoring-section-checkbox")
      checkbox.click()
      checkbox.checked = true
    }
    // on-open-editor
    let onOpenEditorEl = document.createElement("juicy-ace-editor");
    onOpenEditorEl.setAttribute("mode", "ace/mode/javascript");
    // Convert HTML double quote character to standard double quote character.
    onOpenEditorEl.value = this.item.onOpen
      ? this.item.onOpen.replace(/&#34;/g, '"')
      : "";
    onOpenEditorEl.style.height = `${window.innerHeight * 0.6}px`;
    onOpenEditorEl.addEventListener("change", (_) => _.stopPropagation());
    const clearOnOpenLogicButton = document.createElement('div')
    clearOnOpenLogicButton.innerHTML = `<paper-button id="clear-on-open-logic" class="tangy-action-buttons"> <iron-icon icon="delete"></iron-icon>${t("Clear On Open Logic")}</paper-button>`
    this.shadowRoot
      .querySelector("#on-open-editor")
      .appendChild(clearOnOpenLogicButton);
   
    this.shadowRoot
      .querySelector("#on-open-editor")
      .appendChild(onOpenEditorEl);
    // on-change-editor
    let onChangeEditorEl = document.createElement("juicy-ace-editor");
    onChangeEditorEl.setAttribute("mode", "ace/mode/javascript");
    // Convert HTML double quote character to standard double quote character.
    onChangeEditorEl.value = this.item.onChange
      ? this.item.onChange.replace(/&#34;/g, '"')
      : "";
    onChangeEditorEl.style.height = `${window.innerHeight * 0.6}px`;
    onChangeEditorEl.addEventListener("change", (_) => _.stopPropagation());
    const clearOnChangeLogicButton = document.createElement('div')
    clearOnChangeLogicButton.innerHTML = `<paper-button id="clear-on-change-logic" class="tangy-action-buttons"> <iron-icon icon="delete"></iron-icon>${t("Clear On Change Logic")}</paper-button>`
    
    this.shadowRoot
      .querySelector("#on-change-editor")
      .appendChild(clearOnChangeLogicButton);
    this.shadowRoot
      .querySelector("#on-change-editor")
      .appendChild(onChangeEditorEl);
    this.$.container
    .querySelector("#clear-on-open-logic")
    .addEventListener("click", this.clearOnOpenLogic.bind(this));
    this.$.container
    .querySelector("#clear-on-change-logic")
    .addEventListener("click", this.clearOnChangeLogic.bind(this));
    // categories
    if (this.categories !== null && this.categories.length > 0) {
      let select_str =
        "<div class='rightCategories'>Select a category: <select id='category'>\n";
      select_str += '<option value="">Select one</option>\n';
      let categoryValue = this.item.category;
      if (typeof categoryValue !== "undefined" && categoryValue !== null) {
        categoryValue = categoryValue.trim();
      }
      this.categories.forEach((category) => {
        if (
          typeof categoryValue !== "undefined" &&
          categoryValue === category
        ) {
          select_str +=
            '<option value="' +
            category +
            '" selected>' +
            category +
            "</option>\n";
        } else {
          select_str +=
            '<option value="' + category + '">' + category + "</option>\n";
        }
      });
      select_str += "</select></div>\n";
      let template = document.createElement("template");
      template.innerHTML = select_str;
      let categoriesEditor = this.shadowRoot.querySelector(
        "#categories-editor"
      );
      categoriesEditor.innerHTML = select_str;
    }

    this.$.container
      .querySelector("#save")
      .addEventListener("click", this.save.bind(this));
    this.shadowRoot
      .querySelector("tangy-form-condensed-editor")
      .addEventListener(
        "tangy-form-condensed-editor-changed",
        this.save.bind(this)
      );
  }

  onBackToForms(event) {
    this.save();
    this.dispatchEvent(new CustomEvent("cancel"));
  }
  revealCustomScoringEditor(){
    const expansionPanel = document.createElement('div')
    expansionPanel.innerHTML = `<paper-expansion-panel header="Enter custom scoring logic" id="custom-scoring-logic-editor"></paper-expansion-panel>`
    this.shadowRoot
          .querySelector("#scoring-editor")
          .appendChild(expansionPanel);
    // custom-logic-editor
    let customScoringLogicEditorEl = document.createElement("juicy-ace-editor");
    customScoringLogicEditorEl.setAttribute("mode", "ace/mode/javascript");
    // Convert HTML double quote character to standard double quote character.
    customScoringLogicEditorEl.value = this.item.customScoringLogic
      ? this.item.customScoringLogic.replace(/&#34;/g, '"')
      : "";
    customScoringLogicEditorEl.style.height = `${window.innerHeight * 0.6}px`;
    customScoringLogicEditorEl.addEventListener("change", (_) => _.stopPropagation());
    const clearCustomScoringLogicButton = document.createElement('div')
    clearCustomScoringLogicButton.innerHTML = `<paper-button id="clear-custom-scoring-logic" class="tangy-action-buttons"> <iron-icon icon="delete"></iron-icon>${t("Clear Custom Scoring Logic")}</paper-button>`
    this.shadowRoot
      .querySelector("#custom-scoring-logic-editor")
      .appendChild(clearCustomScoringLogicButton);
    this.shadowRoot
      .querySelector("#custom-scoring-logic-editor")
      .appendChild(customScoringLogicEditorEl);
      this.$.container
      .querySelector("#clear-custom-scoring-logic")
      .addEventListener("click", this.clearCustomScoringLogic.bind(this));
  }
  onRevealScoringSection(event) {
    if (this.shadowRoot.querySelector("#scoring-editor").innerHTML == '') {
      console.log("Reveal scoring section.")
      let templateEl = document.createElement("template");
      templateEl.innerHTML = this.shadowRoot.querySelector(
          "tangy-form-condensed-editor"
      ).markup;
      const items = [...templateEl.content.querySelectorAll('[name]')]
          .map(el => {
            const propsData = el.getProps()
            const optionsData = [...el.querySelectorAll('option')].map(optionEl => {
              return {
                label: optionEl.innerHTML,
                value: optionEl.hasAttribute('name') ? optionEl.getAttribute('name') : optionEl.getAttribute('value')
              }
            })
            return {
              ...propsData,
              value: optionsData.length > 0 ? optionsData : propsData.value
            }
          })
      let scoringSectionEl = document.createElement("div");
      let scoringSectionItems = `${t("<p>Toggle the items that should be automatically scored.</p>\n")}`
      items.forEach(item => {
        let isItemChecked = false;
        if(this.item.scoringSection){
          isItemChecked = String(this.item.scoringFields).split(',').includes(item.name)
        }
        const toggleEl = `<paper-toggle-button id="${item.name}" ${isItemChecked?'checked':''}>${item.label}</paper-toggle-button>\n`
        scoringSectionItems = scoringSectionItems + toggleEl
      })
      this.revealCustomScoringEditor()
      scoringSectionEl.innerHTML = scoringSectionItems
      this.shadowRoot
          .querySelector("#scoring-editor")
          .appendChild(scoringSectionEl);
    } else {
      this.shadowRoot.querySelector("#scoring-editor").innerHTML = ''
    }
  }
  save() {
    let templateEl = document.createElement("template");
    templateEl.innerHTML = this.shadowRoot.querySelector(
      "tangy-form-condensed-editor"
    ).markup;
    // Do not allow defaults selected in the DOM for value. This will confuse.
    templateEl.content.querySelectorAll("[value]").forEach((el) => {
      if (el.hasAttribute("name")) el.removeAttribute("value");
    });
    let categoryEl = this.shadowRoot.querySelector("#category");
    let categoryValue = null;
    if (categoryEl !== null) {
      categoryValue = categoryEl.value;
    }
    let scoreEditorEl = this.shadowRoot.querySelector("#scoring-editor")
    let selections = scoreEditorEl.innerHTML !== ''&& [...scoreEditorEl.querySelectorAll('paper-toggle-button')].map(e=>e.checked&&e.id).filter(e=>e)
    // If selections already made, subsequent reads should be from the stored value
    if(!Array.isArray(selections)){
      selections = this.$.container.querySelector("#scoring-fields").value.split(',').map(e=>e.trim())
    }
    this.$.container.querySelector("#scoring-fields").value = selections
    this.dispatchEvent(
      new CustomEvent("save", {
        detail: Object.assign({}, this.item, {
          // Convert standard double quote character to safe HTML double quote character.
          onOpen: this.shadowRoot
            .querySelector("#on-open-editor juicy-ace-editor")
            .value.replace(/"/g, "&#34;"),
          onChange: this.shadowRoot
            .querySelector("#on-change-editor juicy-ace-editor")
            .value.replace(/"/g, "&#34;"),
          customScoringLogic:this.shadowRoot
          .querySelector("#custom-scoring-logic-editor juicy-ace-editor")
          ? this.shadowRoot
          .querySelector("#custom-scoring-logic-editor juicy-ace-editor")
          .value.replace(/"/g, "&#34;"):"",
          category: categoryValue,
          title: this.$.container.querySelector("#itemTitle").value,
          incorrectThreshold: this.$.container.querySelector(
            "#incorrectThreshold"
          ).value,
          summary: this.$.container.querySelector("#summary-checkbox").checked,
          hideBackButton: this.$.container.querySelector(
            "#hide-back-button-checkbox"
          ).checked,
          hideNextButton: this.$.container.querySelector(
            "#hide-next-button-checkbox"
          ).checked,
          hideNavLabels: this.$.container.querySelector(
            "#hide-nav-labels-checkbox"
          ).checked,
          hideNavIcons: this.$.container.querySelector(
            "#hide-nav-icons-checkbox"
          ).checked,
          scoringSection: this.$.container.querySelector(
            "#scoring-section-checkbox"
          ).checked,
          rightToLeft: this.$.container.querySelector("#right-to-left-checkbox")
            .checked,
          template: templateEl.innerHTML,
          scoringFields:this.$.container.querySelector("#scoring-section-checkbox" ).checked? selections:[]
        }),
      })
    );
  }

  evaluateCustomScoringLogic(){
    const str = this.shadowRoot
    .querySelector("#custom-scoring-logic-editor juicy-ace-editor")
    .value.replace(/"/g, "&#34;")
    return Function(`"use strict";return (${str})`)();
  }
  _onEditClick() {
    // this.dispatchEvent(new CustomEvent('edit-input', {bubbles: true}))
    this.edit = true;
    this.render();
  }

  onAddClick() {
    let addInputEl = this.$.container.querySelector(
      "tangy-form-editor-add-input"
    );
    let condensedEditor = this.$.container.querySelector(
      "tangy-form-condensed-editor"
    ).shadowRoot;
    !addInputEl
      ? condensedEditor.dispatchEvent(
          new CustomEvent("add-input", { bubbles: true, composed: true })
        )
      : this.$.container.querySelector(".card-content").removeChild(addInputEl);
  }

  clearCustomScoringLogic(){
    this.$.container.querySelector("#custom-scoring-logic-editor juicy-ace-editor").value = "  "
   }

  clearOnOpenLogic(){
   this.$.container.querySelector("#on-open-editor juicy-ace-editor").value = "  "
  }

  clearOnChangeLogic(){
    this.$.container.querySelector("#on-change-editor juicy-ace-editor").value = "  "
  }
}

window.customElements.define("tangy-form-item-editor", TangyFormItemEditor);
