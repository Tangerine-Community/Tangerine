import "@polymer/paper-card/paper-card.js";
import "@polymer/paper-button/paper-button.js";
import "tangy-form/input/tangy-video-capture.js";
import "tangy-form/input/tangy-checkbox.js";
import { TangyBaseWidget } from "../tangy-base-widget.js";

class TangyVideoCaptureWidget extends TangyBaseWidget {
  get claimElement() {
    return "tangy-video-capture";
  }

  get defaultConfig() {
    return {
      ...this.defaultConfigCoreAttributes(),
      ...this.defaultConfigQuestionAttributes(),
      ...this.defaultConfigConditionalAttributes(),
      ...this.defaultConfigValidationAttributes(),
      ...this.defaultConfigAdvancedAttributes(),
      ...this.defaultConfigUnimplementedAttributes(),
      codec: 'video/webm;codecs=vp9,opus',
      videoWidth: 1280,
      videoHeight: 720
      
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
      // frontCamera: element.hasAttribute('front-camera'),
      // noVideoConstraints: element.hasAttribute('no-video-constraints'),
    };
  }

  downcast(config) {
    return `
      <tangy-video-capture 
        ${this.downcastCoreAttributes(config)}
        ${this.downcastQuestionAttributes(config)}
        ${this.downcastConditionalAttributes(config)}
        ${this.downcastValidationAttributes(config)}
        ${this.downcastAdvancedAttributes(config)}
        ${this.downcastUnimplementedAttributes(config)}
        ${config.frontCamera ? 'front-camera' : ""}
        ${config.recordAudio ? 'record-audio' : ""}
        ${config.noVideoConstraints ? 'no-video-constraints' : ""}
        ${config.codec ? `codec="${config.codec}"` : ""}
        ${config.videoWidth ? `video-width="${config.videoWidth}"` : ""}
        ${config.videoHeight ? `video-height="${config.videoHeight}"` : ""}
      >
      </tangy-video-capture>
    `;
  }

  renderPrint(config) {
    return `
    <table>
      <tr><td><strong>Variable Name:</strong></td><td>${config.name}</td></tr>
      <tr><td><strong>Required:</strong></td><td>${config.required}</td></tr>
      <tr><td><strong>Disabled:</strong></td><td>${config.disabled}</td></tr>
      <tr><td><strong>Hidden:</strong></td><td>${config.hidden}</td></tr>
      <tr><td><strong>Front Camera:</strong></td><td>${config.frontCamera}</td></tr>
      <tr><td><strong>RecordAudio:</strong></td><td>${config.recordAudio}</td></tr>
      <tr><td><strong>No Video Constraints:</strong></td><td>${config.noVideoConstraints}</td></tr>
      <tr><td><strong>Codec:</strong></td><td>${config.codec}</td></tr>
      <tr><td><strong>Video Width:</strong></td><td>${config.videoWidth}</td></tr>
      <tr><td><strong>Video Height:</strong></td><td>${config.videoHeight}</td></tr>
    </table>
    <hr/>
    `;
  }

  renderInfo(config) {
    console.log(config)
    const icon = (this.shadowRoot.querySelector(
      "#icon"
    ).innerHTML = `<span class="header-text"><mwc-icon>videocam</mwc-icon><span>`);
    const name = (this.shadowRoot.querySelector(
      "#name"
    ).innerHTML = `<span class="header-text">${config.name}</span>`);
    return `${icon} ${name} ${this.downcast(config)}`;
  }

  renderEdit(config) {
    console.log(config)
    const action = config.name ? "Edit" : "Add";
    return `
      <h2>${action} Video Capture</h2>
      <h3><span style="color:red">Warning!</span> This element only works on APK's and not on PWA's. 
      If you want to use video capture for your group, please request activation, otherwise videos will not be saved and will not be uploaded to the server upon sync.
      Using video capture on a tablet has an impact on sync time. 
      Video data is large and can cause a significant delay when uploading to the server. 
      Video uploads are synced after normal Tangerine sync: be sure to alert users about this separate process..</h3>
      <div>
      <h4>Defaults:</h4>
        <ul>
          <li>noVideoConstraints: Default width (1280) and height (720), uses whatever camera device chooses. Overrides frontCamera property.</li>
          <li>frontCamera: false</li>
          <li>codec: 'video/webm;codecs=vp9,opus'</li>
          <li>videoWidth: 1280</li>
          <li>videoHeight: 720</li>
        </ul>
      </div>
      <tangy-form id="tangy-video-capture">
        <tangy-form-item>
          <template>
            <paper-tabs selected="0">
                <paper-tab>General</paper-tab>
                <paper-tab>Conditional Display</paper-tab>
                <paper-tab>Validation</paper-tab>
                <paper-tab>Advanced</paper-tab>
            </paper-tabs>
            <iron-pages selected="">
                <div>
                  ${this.renderEditCoreAttributes(config)}
                  ${this.renderEditQuestionAttributes(config)}
                  
                  <tangy-toggle name="no-video-constraints" help-text="Use the default settings. (default: false)"
                      ${config.noVideoConstraints ? 'value="on"' : ''}>No Video Constraints
                  </tangy-toggle>
                  
                  <tangy-toggle name="front-camera" help-text="Use the front camera? (default: false)"
                      ${config.frontCamera ? 'value="on"' : ''}>Use front camera
                  </tangy-toggle>

                  <tangy-toggle name="record-audio" help-text="Record Audio? (default: false)"
                      ${config.recordAudio ? 'value="on"' : ''}>Record Audio
                  </tangy-toggle>
                  
                  <tangy-input name="codec" type="string" inner-label="Video codec." value="${
        config.codec
    }"></tangy-input>
                  <tangy-input name="video-width" type="number" inner-label="Video width." value="${
        config.videoWidth
    }"></tangy-input>
                  <tangy-input name="video-height" type="number" inner-label="Video hight." value="${
        config.videoHeight
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
      ...this.onSubmitCoreAttributes(config, formEl),
      ...this.onSubmitQuestionAttributes(config, formEl),
      ...this.onSubmitConditionalAttributes(config, formEl),
      ...this.onSubmitValidationAttributes(config, formEl),
      ...this.onSubmitAdvancedAttributes(config, formEl),
      ...this.onSubmitUnimplementedAttributes(config, formEl),
      noVideoConstraints: !!formEl.inputs.find(e=>e.name==='no-video-constraints').value,
      frontCamera: !!formEl.inputs.find(e=>e.name==='front-camera').value,
      recordAudio: !!formEl.inputs.find(e=>e.name==='record-audio').value,
      codec: formEl.values["codec"],
      videoWidth: formEl.values["video-width"],
      videoHeight: formEl.values["video-height"]
    };
  }
}

window.customElements.define("tangy-video-capture-widget", TangyVideoCaptureWidget);
window.tangyFormEditorWidgets.define(
  "tangy-video-capture-widget",
  "tangy-video-capture",
  TangyVideoCaptureWidget
);
