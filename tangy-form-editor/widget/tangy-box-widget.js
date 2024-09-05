import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-select.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyBoxWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-box";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      htmlCode: "",
    };
  }

  upcast(config, element) {
    return {
      ...config,
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      htmlCode: element.innerHTML,
    };
  }

  downcast(config) {
    return `
      <tangy-box 
        ${this.downcastCoreAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
      >${config.htmlCode}</tangy-box>
    `;
  }

  renderInfo(config) {
    const icon = (this.shadowRoot.querySelector(
      "#icon"
    ).innerHTML = `<span class="header-text"><mwc-icon>code</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} HTML Content Container</h2>
      <tangy-form id="tangy-box">
        <tangy-form-item>
          <template>
            <paper-tabs selected="0">
                <paper-tab>Content</paper-tab>
                <paper-tab>Conditional Display</paper-tab>
                <paper-tab>Advanced</paper-tab>
            </paper-tabs>
            <iron-pages selected="">
                <div>
                  ${this.renderEditCoreAttributes(config)}
                  <h3>Template HTML</h3>
                  <tangy-code mode="ace/mode/html" name="htmlCode" height="600" required>${
                    config.htmlCode
                  }</tangy-code>
                </div>
                <div>
                  ${this.renderEditConditionalAttributes(config)}
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
      ...this.onSubmitAdvancedAttributes(config, formEl),
      ...this.onSubmitUnimplementedAttributes(config, formEl),
      htmlCode: formEl.response.items[0].inputs.find(
        (input) => input.name === "htmlCode"
      ).value,
    };
  }
}

window.customElements.define("tangy-box-widget", TangyBoxWidget);
window.tangyFormEditorWidgets.define(
  "tangy-box-widget",
  "tangy-box",
  TangyBoxWidget
);
