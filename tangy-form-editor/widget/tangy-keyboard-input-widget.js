import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-select.js";
import "tangy-form/input/tangy-keyboard-input.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyKeboardInputWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-keyboard-input[type=text], tangy-keyboard-input:not([type])";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigQuestionAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      prefix: '',
      postfix: '',
      keys: '',
    };
  }

  upcast(config, element) {
    return {
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastQuestionAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastValidationAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      ...element.getProps(),
    };
  }

  downcast(config) {
    return `
      <tangy-keyboard-input 
        prefix="${config.prefix}"
        postfix="${config.postfix}"
        keys="${config.keys}"
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
      ></tangy-keyboard-input>
    `;
  }

  renderPrint(config) {
    return `
    <table>
      <tr><td><strong>Prompt:</strong></td><td>${config.label}</td></tr>
      <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
      <tr><td><strong>Hint:</strong></td><td>${config.hintText}</td></tr>
      <tr><td><strong>Error Message:</strong></td><td>${config.errorText}</td></tr>
      <tr><td><strong>Prefix:</strong></td><td>${config.prefix}</td></tr>
      <tr><td><strong>Postfix:</strong></td><td>${config.postfix}</td></tr>
      <tr><td><strong>Keys:</strong></td><td>${config.keys}</td></tr>
      <tr><td><strong>Private:</strong></td><td>${config.private}</td></tr>
      <tr><td><strong>Required:</strong></td><td>${config.required}</td></tr>
      <tr><td><strong>Disabled:</strong></td><td>${config.disabled}</td></tr>
      <tr><td><strong>Hidden:</strong></td><td>${config.hidden}</td></tr>
    </table>
    <hr/>
    `;
  }

  renderInfo(config) {
    const icon = (this.shadowRoot.querySelector(
      "#icon"
    ).innerHTML = `<span class="header-text"><mwc-icon>keyboard</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} Keyboard Input</h2>
      <tangy-form id="tangy-keyboard-input">
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
                  <tangy-input
                    name="keys"
                    inner-label="Keys"
                    hint-text="Keys: Space-separated. Example: 1 2 3 4 5 6 7 8 9 0"
                    value="${config.keys}">
                  </tangy-input>
                  <tangy-input
                    name="prefix"
                    inner-label="Prefix"
                    hint-text="Prefix: Text before the values entered"
                    value="${config.prefix}">
                  </tangy-input>
                  <tangy-input
                    name="postfix"
                    inner-label="Postfix"
                    hint-text="Postfix: Text after the values entered"
                    value="${config.postfix}">
                  </tangy-input>
                </div>
                <div>
                  ${this.renderEditConditionalAttributes(config)}
                </div>
                <div>
                  <h3>Question Validation Options</h3>
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

  onSubmit(config, formEl) {
    return {
      ...config,
      ...this.onSubmitCoreAttributes(config, formEl),
      ...this.onSubmitQuestionAttributes(config, formEl),
      ...this.onSubmitConditionalAttributes(config, formEl),
      ...this.onSubmitValidationAttributes(config, formEl),
      ...this.onSubmitAdvancedAttributes(config, formEl),
      keys: formEl.response.items[0].inputs.find(
        (input) => input.name === "keys"
      ).value,
      prefix: formEl.response.items[0].inputs.find(
        (input) => input.name === "prefix"
      ).value,
      postfix: formEl.response.items[0].inputs.find(
        (input) => input.name === "postfix"
      ).value,
    };
  }
}

window.customElements.define("tangy-keyboard-input-widget", TangyKeboardInputWidget);
window.tangyFormEditorWidgets.define(
  "tangy-keyboard-input-widget",
  "tangy-keyboard-input[type=text], tangy-keyboard-input:not([type])",
  TangyKeboardInputWidget
);
