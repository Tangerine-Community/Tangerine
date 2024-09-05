import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-select.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";
class TangyInputGroupsWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-input-groups";
  }

  upcast(config, element) {
    return {
      template: element._template || '',
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastQuestionAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastValidationAttributes(config, element),
      ...this.upcastAdvancedAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
    };
  }

  downcast(config) {
    return `
      <tangy-input-groups 
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
      >
        ${config.template || ''}
      </tangy-input-groups>
    `;
  }

  renderInfo(config) {
    const icon = (this.shadowRoot.querySelector(
      "#icon"
    ).innerHTML = `<span class="header-text"><mwc-icon>repeat</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} Repeatable HTML Group</h2>
      <tangy-form id="tangy-toggle">
        <tangy-form-item>
          <template>
            <paper-tabs selected="0">
                <paper-tab>Template</paper-tab>
                <paper-tab>Conditional Display</paper-tab>
                <paper-tab>Validation</paper-tab>
                <paper-tab>Advanced</paper-tab>
            </paper-tabs>
            <iron-pages selected="">
                <div>
                  <tangy-input 
                    name="name" 
                    label="Namespace"
                    valid-if="input.value.match(/^[a-zA-Z]{1,}[a-zA-Z0-9\_]{1,}$/)" 
                    required
                    hint-text="This is like a variable name, but it's the variable name that all children inputs will be namespaced with."
                    inner-label=" "
                    ${config.name ? `value='${config.name}'` : ''}
                  ></tangy-input>
                  <tangy-input name="template" label="Template: Enter question markup below" inner-label=" " ${config.template ? `value='${config.template}'` : `value=''`}></tangy-input>
                </div>
                <div>
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
      ...this.onSubmitQuestionAttributes(config, formEl),
      ...this.onSubmitConditionalAttributes(config, formEl),
      ...this.onSubmitValidationAttributes(config, formEl),
      ...this.onSubmitAdvancedAttributes(config, formEl),
      ...this.onSubmitUnimplementedAttributes(config, formEl),
      template: formEl.response.items[0].inputs.find((input) => input.name === "template").value || '',
      name: formEl.response.items[0].inputs.find((input) => input.name === "name").value || '',
    };
  }

}

window.customElements.define("tangy-input-groups-widget", TangyInputGroupsWidget);
window.tangyFormEditorWidgets.define(
  "tangy-input-groups-widget",
  "tangy-input-groups",
  TangyInputGroupsWidget
);
