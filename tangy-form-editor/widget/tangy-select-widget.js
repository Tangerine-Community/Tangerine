import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/tangy-form.js";
import "tangy-form/input/tangy-select.js";
import "tangy-form/input/tangy-input.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangySelectWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-select";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigQuestionAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      options: [],
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
      options: [...element.querySelectorAll("option")].map((option) => {
        return {
          value: option.getAttribute("value"),
          label: option.innerHTML,
        };
      }),
    };
  }

  downcast(config) {
    return `
      <tangy-select
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
      >
        ${config.options
          .map(
            (option) => `
          <option value="${option.value}">${option.label}</option>
        `
          )
          .join("")}
      </tangy-select>
    `;
  }

  renderPrint(config) {
    let keyValuePairs = "";
    config.options.map((option) => {
      keyValuePairs += `<li>${option.value}: ${option.label}</li>`;
    });
    return `
    <table>
      <tr><td><strong>Prompt:</strong></td><td>${config.label}</td></tr>
      <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
      <tr><td><strong>Hint:</strong></td><td>${config.hintText}</td></tr>
      <tr><td><strong>Required:</strong></td><td>${config.required}</td></tr>
      <tr><td><strong>Disabled:</strong></td><td>${config.disabled}</td></tr>
      <tr><td><strong>Hidden:</strong></td><td>${config.hidden}</td></tr>
      <tr><td><strong>Options:</strong></td><td><ul>${keyValuePairs}</ul></td></tr>
    </table>
    <hr/>
    `;
  }

  renderInfo(config) {
    const icon = (this.shadowRoot.querySelector(
      "#icon"
    ).innerHTML = `<span class="header-text"><mwc-icon>looks_one</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name}${
      config.options.length > 0 ? this.downcast(config) : ""
    }`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} Dropdown (Select)</h2>
      <tangy-form id="tangy-select">
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
                  <tangy-list name="options">
                    <template type="tangy-list/new-item">
                      <tangy-input name="value" hint-text="Enter the variable name of this drop-down option." allowed-pattern="[a-zA-Z0-9\-_]" inner-label="Value" type="text"></tangy-input>
                      <tangy-input name="label" hint-text="Enter the label for this drop-down option." label="Label" type="text"></tangy-input>
                    </template>
                    ${
                      config.options.length > 0
                        ? `
                      <template type="tangy-list/initial-items">
                        ${config.options
                          .map(
                            (option) => `
                          <tangy-list-item>
                            <tangy-input hint-text="Enter the variable name of this drop-down option." name="value" allowed-pattern="[a-zA-Z0-9\-_]" label="Value" type="text" value="${option.value}"></tangy-input>
                            <tangy-input hint-text="Enter the label for this drop-down option." name="label" label="Label" type="text" value="${option.label}"></tangy-input>
                          </tangy-list-item>  
                        `
                          )
                          .join("")}
                      </template>
                    `
                        : ""
                    }
                  </tangy-list>
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
      options: formEl.values.options.map((item) =>
        item.reduce((acc, input) => {
          return { ...acc, [input.name]: input.value };
        }, {})
      ),
    };
  }
}

window.customElements.define("tangy-select-widget", TangySelectWidget);
window.tangyFormEditorWidgets.define(
  "tangy-select-widget",
  "tangy-select",
  TangySelectWidget
);
