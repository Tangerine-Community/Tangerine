import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-consent.js";
import "tangy-form/input/tangy-checkbox.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyConsentWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-consent";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      metaDataTemplate: "",
      prompt: "",
      confirmNo: false
    };
  }

  upcast(config, element) {
    // @TODO We have to do that final thing for tangyIf because it's not declared a prop in TangyQr.props thus won't get picked up by TangyQr.getProps().
    return {
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastValidationAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      ...element.getProps(),
    };
  }

  downcast(config) {
    return `
      <tangy-consent 
        ${this.downcastCoreAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        prompt="${config.prompt}"
        ${config.confirmNo ? `confirm-no` : ''}
      >
        ${config.metaDataTemplate}
      </tangy-consent>
    `;
  }

  renderPrint(config) {
    return `
    <table>
      <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
      <tr><td><strong>Prompt:</strong></td><td>${config.prompt}</td></tr>
      <tr><td><strong>Confirm if No?:</strong></td><td>${config.confirmNo}</td></tr>
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
    ).innerHTML = `<span class="header-text"><mwc-icon>thumbs_up_down</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} Consent</h2>
      <tangy-form id="tangy-consent">
        <tangy-form-item>
          <template>
            <paper-tabs selected="0">
                <paper-tab>Consent</paper-tab>
                <paper-tab>Conditional Display</paper-tab>
                <paper-tab>Validation</paper-tab>
                <paper-tab>Advanced</paper-tab>
            </paper-tabs>
            <iron-pages selected="">
                <div>
                  ${this.renderEditCoreAttributes(config)}
                  <tangy-input
                    name="prompt"
                    inner-label="Prompt" 
                    value="${config.prompt}"
                    required>
                  </tangy-input>
                  <tangy-checkbox name="confirm-no" ${
        config.confirmNo ? 'value="on"' : ''
    }>Display confirmation message if No?</tangy-checkbox>
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
      ...this.onSubmitConditionalAttributes(config, formEl),
      ...this.onSubmitValidationAttributes(config, formEl),
      ...this.onSubmitAdvancedAttributes(config, formEl),
      ...this.onSubmitUnimplementedAttributes(config, formEl),
      prompt: formEl.response.items[0].inputs.find(
        (input) => input.name === "prompt"
      ).value,
      confirmNo: formEl.values['confirm-no'] === 'on' ? true : false,

    };
  }
}

window.customElements.define("tangy-consent-widget", TangyConsentWidget);
window.tangyFormEditorWidgets.define(
  "tangy-consent-widget",
  "tangy-consent",
  TangyConsentWidget
);
