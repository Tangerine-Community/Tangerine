import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-select.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyTemplateWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-template";
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
    // @TODO We have to do that final thing for tangyIf because it's not declared a prop in TangyTemplate.props thus won't get picked up by TangyTemplate.getProps().
    return {
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      htmlCode: element.innerHTML,
    };
  }

  downcast(config) {
    return `
      <tangy-template 
        ${this.downcastCoreAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
      >${config.htmlCode}</tangy-template>
    `;
  }

  renderInfo(config) {
    const icon = (this.shadowRoot.querySelector(
      "#icon"
    ).innerHTML = `<span class="header-text"><mwc-icon>attach_money</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} (output only available in preview mode)`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} HTML Template</h2>
      <tangy-form id="tangy-template">
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

window.customElements.define("tangy-template-widget", TangyTemplateWidget);
window.tangyFormEditorWidgets.define(
  "tangy-template-widget",
  "tangy-template",
  TangyTemplateWidget
);
