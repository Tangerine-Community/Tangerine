import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-select.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyDateWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-input[type=date]";
  }

  get defaultConfig() {
    return {
      type: "date",
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
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        type="date"
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
        <tr><td><strong>Min:</strong></td><td>${config.min}</td></tr>
        <tr><td><strong> Max:</strong></td><td>${config.max}</td></tr>
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
    ).innerHTML = `<span class="header-text"><mwc-icon>event</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} Date</h2>
      <tangy-form id="tangy-date-widget">
        <tangy-form-item>
          <template>
            <paper-tabs selected="0">
                <paper-tab>Question</paper-tab>
                <paper-tab>Conditional Display</paper-tab>
                <paper-tab>Validation</paper-tab>
                <paper-tab>Advanced</paper-tab>
            </paper-tabs>
            <iron-pages selected="">
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
}

window.customElements.define("tangy-date-widget", TangyDateWidget);
window.tangyFormEditorWidgets.define(
  "tangy-date-widget",
  "tangy-input[type=date]",
  TangyDateWidget
);
