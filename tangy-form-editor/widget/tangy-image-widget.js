import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-select.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyImageWidget extends TangyBaseWidget {
  get claimElement() {
    return "div.tangy-image";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      src: "",
      width: "50%",
    };
  }

  upcast(config, element) {
    // @TODO We have to do that final thing for tangyIf because it's not declared a prop in TangyImage.props thus won't get picked up by TangyImage.getProps().
    return {
      ...config,
      ...this.upcastCoreAttributes(config, element),
      ...this.upcastConditionalAttributes(config, element),
      ...this.upcastUnimplementedAttributes(config, element),
      src: element.querySelector("img").getAttribute("src"),
      width: element.querySelector("img").getAttribute("width"),
    };
  }

  downcast(config) {
    return `
      <div 
        name="${config.name}"
        class="tangy-image"
        style="text-align:center"
        ${this.downcastCoreAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
      >
        <img src="${config.src}" width="${config.width}">
      </div>
    `;
  }

  renderInfo(config) {
    const icon = (this.shadowRoot.querySelector(
      "#icon"
    ).innerHTML = `<span class="header-text"><mwc-icon>image</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} Image</h2>
      <tangy-form id="tangy-image">
        <tangy-form-item>
          <template>
            <paper-tabs selected="0">
                <paper-tab>Image</paper-tab>
                <paper-tab>Conditional Display</paper-tab>
            </paper-tabs>
            <iron-pages selected="">
                <div>
                  ${this.renderEditCoreAttributes(config, false, true, false)}
                  
                  <h3>Select Image File</h3>
                  <file-list-select
                    name="src"
                    endpoint="${this.getAttribute("files-endpoint")}"
                    value="${config.src ? config.src : ""}"
                  ></file-list-select>
                  <br/>
                  <tangy-input 
                    name="width" 
                    label="Define Image Width"
                    inner-label="Width" 
                    hint-text="This may be in pixels or in a percentage. Example: 150 or 75%"
                    value="${config.width}">
                  </tangy-input>

                  
                </div>
                <div>
                  ${this.renderEditConditionalAttributes(config)}
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
      ...this.onSubmitCoreAttributes(config, formEl, false, true, false),
      ...this.onSubmitConditionalAttributes(config, formEl),
      ...this.onSubmitUnimplementedAttributes(config, formEl),
      width: formEl.response.items[0].inputs.find(
        (input) => input.name === "width"
      ).value,
      src: formEl.querySelector("tangy-form-item").querySelector("[name=src]")
        .value,
    };
  }
}

window.customElements.define("tangy-image-widget", TangyImageWidget);
window.tangyFormEditorWidgets.define(
  "tangy-image-widget",
  "div",
  TangyImageWidget
);
