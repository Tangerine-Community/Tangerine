import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/tangy-form.js";
import "tangy-form/input/tangy-checkboxes.js";
import "tangy-form/input/tangy-input.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyCheckboxesWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-checkboxes";
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
          mutuallyExclusive: option.hasAttribute("mutually-exclusive"),
        };
      }),
    };
  }

  downcast(config) {
    return `
      <tangy-checkboxes
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
          <option value="${option.value}" ${
              option.mutuallyExclusive ? "mutually-exclusive" : ""
            }>${option.label}</option>
        `
          )
          .join("")}
      </tangy-checkboxes>
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
    ).innerHTML = `<span class="header-text"><mwc-icon>check_box_outline_blank</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${
      config.options.length > 0 ? this.downcast(config) : ""
    }`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} Checkbox Group</h2>
      <tangy-form id="tangy-checkboxes">
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
                      <tangy-input name="value" allowed-pattern="[a-zA-Z0-9\-_]" inner-label="Value" hint-text="Enter the variable value if checkbox is chosen" type="text"></tangy-input>
                      <tangy-input name="label" inner-label="Label" hint-text="Enter the display label of the checkbox" type="text"></tangy-input>
                      <tangy-checkbox name="mutuallyExclusive" hint-text="This option is mutually exclusive from the other options. If enabled, when this option is selected all other selections will be undone.">Mutually exlusive</tangy-checkbox>
                    </template>
                    ${
                      config.options.length > 0
                        ? `
                      <template type="tangy-list/initial-items">
                        ${config.options
                          .map(
                            (option) => `
                          <tangy-list-item>
                            <tangy-input name="value" allowed-pattern="[a-zA-Z0-9\-_]" inner-label="Value" hint-text="Enter the variable value if checkbox is chosen" type="text" value="${
                              option.value
                            }"></tangy-input>
                            <tangy-input name="label" hint-text="Enter the display label of the checkbox" inner-label="Label" type="text" value="${
                              option.label.
                              replace(/&/g, "&amp;")
                              .replace(/</g, "&lt;")
                              .replace(/>/g, "&gt;")
                              .replace(/"/g, "&quot;")
                              .replace(/'/g, "&#039;")
                            }"></tangy-input>
                            <tangy-checkbox name="mutuallyExclusive" value="${
                              option.mutuallyExclusive ? "on" : ""
                            }" hint-text="This option is mutually exclusive from the other options. If enabled, when this option is selected all other selections will be undone.">Mutually exlusive</tangy-checkbox>
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
    const data = {
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
    return data;
  }
}

window.customElements.define("tangy-checkboxes-widget", TangyCheckboxesWidget);
window.tangyFormEditorWidgets.define(
  "tangy-checkboxes-widget",
  "tangy-checkboxes",
  TangyCheckboxesWidget
);
