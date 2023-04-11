import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-select.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyTextWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-input[type=text], tangy-input:not([type])";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigQuestionAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      allowedPattern: "",
      innerLabel: "",
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
      <tangy-input 
        type="text"
        allowed-pattern="${config.allowedPattern}"
        inner-label="${config.innerLabel}"
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
      ></tangy-input>
    `;
  }

  renderPrint(config) {
    return `
    <table>
      <tr><td><strong>Prompt:</strong></td><td>${config.label}</td></tr>
      <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
      <tr><td><strong>Hint:</strong></td><td>${config.hintText}</td></tr>
      <tr><td><strong>Type:</strong></td><td>${config.type}</td></tr>
      <tr><td><strong>Error Message:</strong></td><td>${config.errorText}</td></tr>
      <tr><td><strong>Allowed Pattern:</strong></td><td>${config.allowedPattern}</td></tr>
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
    ).innerHTML = `<span class="header-text"><mwc-icon>text_fields</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} Text Input</h2>
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
                  <tangy-input
                    name="inner-label"
                    inner-label="Inner Label"
                    value="${config.innerLabel}">
                  </tangy-input>
                </div>
                <div>
                  ${this.renderEditConditionalAttributes(config)}
                </div>
                <div>
                  <h3>Question Validation Options</h3>
                  <tangy-input
                    name="allowed-pattern"
                    inner-label="Allowed pattern"
                    hint-text="Optional Javascript RegExp pattern to validate text (e.g. minimum length of 5 characters would be [a-zA-Z]{5,})"
                    value="${config.allowedPattern}">
                  </tangy-input>
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
      innerLabel: formEl.response.items[0].inputs.find(
        (input) => input.name === "inner-label"
      ).value,
      allowedPattern: formEl.response.items[0].inputs.find(
        (input) => input.name === "allowed-pattern"
      ).value,
    };
  }
}

window.customElements.define("tangy-text-widget", TangyTextWidget);
window.tangyFormEditorWidgets.define(
  "tangy-text-widget",
  "tangy-input[type=text], tangy-input:not([type])",
  TangyTextWidget
);
