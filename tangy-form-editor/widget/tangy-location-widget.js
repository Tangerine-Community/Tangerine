import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-location.js";
import "tangy-form/input/tangy-checkbox.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyLocationWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-location";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigQuestionAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      showMetaData: false,
      metaDataTemplate: "",
      filterByGlobal: false,
      showLevels: "",
    };
  }

  upcast(config, element) {
    return {
      ...config,
      ...element.getProps(),
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastQuestionAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastValidationAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      metaDataTemplate: element.innerHTML,
    };
  }

  downcast(config) {
    return `
      <tangy-location 
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        show-levels="${config.showLevels}"
        ${config.filterByGlobal ? "filter-by-global" : ""}
        ${config.showMetaData ? "show-meta-data" : ""}
      >
        ${config.metaDataTemplate}
      </tangy-location>
    `;
  }

  renderPrint(config) {
    return `
    <table>
      <tr><td><strong>Location Levels:</strong></td><td>${config.showLevels}</td></tr>
      <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
      <tr><td><strong>Label:</strong></td><td>${config.label}</td></tr>
      <tr><td><strong>Hint:</strong></td><td>${config.hintText}</td></tr>
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
    ).innerHTML = `<span class="header-text"><mwc-icon>location_city</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} Location</h2>
      <tangy-form id="tangy-input">
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
                  <tangy-checkbox name="filterByGlobal" ${
                    config.filterByGlobal ? 'value="on"' : ""
                  }>Filter by locations in the user profile?</tangy-checkbox>
                  <tangy-input name="showLevels" inner-label="Show levels" hint-text="e.g. county,subcounty" value="${
                    config.showLevels
                  }"></tangy-input>
                  <tangy-checkbox name="show-meta-data" ${
                    config.showMetaData ? 'value="on"' : ""
                  }>show meta-data</tangy-checkbox>
                  <tangy-input name="meta-data-template" label="Meta-data template" value="${
                    config.metaDataTemplate
                  }"></tangy-input>
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
      ...config,
      ...this.onSubmitCoreAttributes(config, formEl),
      ...this.onSubmitQuestionAttributes(config, formEl),
      ...this.onSubmitConditionalAttributes(config, formEl),
      ...this.onSubmitValidationAttributes(config, formEl),
      ...this.onSubmitAdvancedAttributes(config, formEl),
      ...this.onSubmitUnimplementedAttributes(config, formEl),
      filterByGlobal:
        formEl.response.items[0].inputs.find(
          (input) => input.name === "filterByGlobal"
        ).value === "on"
          ? true
          : false,
      showLevels: formEl.response.items[0].inputs.find(
        (input) => input.name === "showLevels"
      ).value,
      showMetaData:
        formEl.response.items[0].inputs.find(
          (input) => input.name === "show-meta-data"
        ).value === "on"
          ? true
          : false,
      metaDataTemplate: formEl.response.items[0].inputs.find(
        (input) => input.name === "meta-data-template"
      ).value,
    };
  }
}

window.customElements.define("tangy-location-widget", TangyLocationWidget);
window.tangyFormEditorWidgets.define(
  "tangy-location-widget",
  "tangy-location",
  TangyLocationWidget
);
