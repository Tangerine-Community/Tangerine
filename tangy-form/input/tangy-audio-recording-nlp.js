import { html } from "@polymer/polymer/polymer-element.js";
import { t } from "../util/t.js";
import "../style/tangy-common-styles.js";
import "../style/tangy-element-styles.js";
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/av-icons.js';
import '@polymer/iron-icons/editor-icons.js';
import '@polymer/iron-icon/iron-icon.js';
import "@polymer/paper-button/paper-button.js";
import "@polymer/paper-item/paper-item.js";
import "@polymer/paper-progress/paper-progress.js";
import { TangyInputBase } from "../tangy-input-base.js";
import "./tangy-audio-playback.js";

export class TangyAudioRecordingNlp extends TangyInputBase {
  static get template() {
    return html`
      <style include="tangy-common-styles"></style>
      <style include="tangy-element-styles"></style>
      <style>
        .nlp-section {
          margin-top: 15px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9f9f9;
        }
        .nlp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .processing-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #666;
          font-style: italic;
        }
        .nlp-results {
          margin-top: 10px;
          padding: 10px;
          border-radius: 4px;
        }
        .nlp-error {
          color: #f44336;
          border-left-color: #f44336;
        }
        .reprocess-button {
          margin-top: 10px;
        }
        .result-section {
          margin: 15px 0;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 4px;
          border-left: 3px solid #f26f10;
        }
        .result-section h5 {
          margin: 0 0 8px 0;
          color: #f26f10;
          font-size: 14px;
          font-weight: 600;
        }
        .result-section p {
          margin: 5px 0;
          line-height: 1.4;
        }
        .cer-score {
          font-size: 18px;
          font-weight: bold;
          color: #dc3545;
          text-align: center;
          padding: 10px;
          background-color: #f8d7da;
          border-radius: 4px;
          margin: 10px 0;
        }
        .csr-score {
          font-size: 18px;
          font-weight: bold;
          color: #28a745;
          text-align: center;
          padding: 10px;
          background-color: #d4edda;
          border-radius: 4px;
          margin: 10px 0;
        }
        .reference-text {
          background-color: #e9ecef;
          padding: 8px;
          border-radius: 4px;
          font-style: italic;
          margin: 5px 0;
        }
        .hypothesis-text {
          background-color: #fff3cd;
          padding: 8px;
          border-radius: 4px;
          margin: 5px 0;
        }
        paper-progress {
          width: 100%;
          margin-top: 5px;
        }
        .hidden {
          display: none;
        }
      </style>
      
      
      <div id="qnum-number"></div>
      <div id="qnum-content">
        <div class="nlp-section" id="nlpSection">
          <div class="nlp-header">
            <h2 class="feedback-title">[[label]]</h2>
          </div>

          <tangy-audio-playback label="Recorded Audio" id="audioPlayback"></tangy-audio-playback>
          
          <!-- Processing Indicator -->
          <div class="processing-indicator" id="processingIndicator" style="display: none;">
            <iron-icon icon="hourglass-empty"></iron-icon>
            <span>[[t.processingAudio]]</span>
            <paper-progress indeterminate></paper-progress>
          </div>
          
          <div class="nlp-results" id="nlpResults">
            <div id="nlpContent"></div>
            <paper-button 
              class="process-button"
              id="processButton"
              on-click="processAudioWithNlp"
              disabled="[[processing]]"
              hidden>
              <iron-icon icon="arrow-forward"></iron-icon>
              Process
            </paper-button>
            <paper-button 
              class="reprocess-button"
              id="reprocessButton"
              on-click="reprocessAudio"
              disabled="[[processing]]"
              hidden>
              <iron-icon icon="refresh"></iron-icon>
              [[t.reprocess]]
            </paper-button>
          </div>
        </div>
      </div>
    `;
  }

  static get is() {
    return 'tangy-audio-recording-nlp'
  }

  static get properties() {
    return {
      name: {
        type: String,
        value: ""
      },
      label: {
        type: String,
        value: "",
      },
      nlpModelUrl: {
        type: String,
        value: "",
        reflectToAttribute: true
      },
      stimuliText: {
        type: String,
        value: "",
        reflectToAttribute: true
      },
      language: {
        type: String,
        value: "en",
        reflectToAttribute: true
      },
      processing: {
        type: Boolean,
        value: false
      },
      nlpResults: {
        type: Object,
        value: null
      },
      nlpError: {
        type: String,
        value: ""
      },
      audioRecordingInputName: {
        type: String,
        value: ''
      },
      value: {
        type: Object,
        reflectToAttribute: true
      },
      disabled: {
        type: Boolean,
        value: false,
        observer: 'onDisabledChange',
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
  }

  ready() {
    super.ready();
    
    this.t = {
      ...this.t,
      processingAudio: t("Processing Audio"),
      reprocess: t("Reprocess"),
      offlineError: t("Offline Error: You must be online to process the audio."),
      processingError: t("Processing Error"),
      noResults: t("No Results")
    };
  
    const tangyForm = document.querySelector("tangy-form");
    if (tangyForm) {
      let audioRecordingNlpInput = tangyForm.inputs.find(input => input.name === this.name);
      if (audioRecordingNlpInput) {
        this.value = audioRecordingNlpInput.value;
        if (this.value) {
          this.nlpResults = this.value;
          this.displayNlpResults();
          this.showReprocessButton();
        }
      }

      let audioRecordingInput = tangyForm.inputs.find(input => input.name === this.audioRecordingInputName);
      if (!audioRecordingInput) {
        // if not found, try to find it in the DOM -- this will happen if the audio recording input is on the same page as this NLP input
        audioRecordingInput = tangyForm.querySelector(`tangy-audio-recording[name="${this.audioRecordingInputName}"]`);

        // subscribe to the TANGY_MEDIA_UPDATE event coming from the audio recording input
        audioRecordingInput.addEventListener("TANGY_MEDIA_UPDATE", (event) => {
          if (event.target && event.target.audioBlob) {
            this.shadowRoot.querySelector("#audioPlayback").setAttribute("src", event.target.value);
            this.showProcessButton();
          }
        });
      }

      if (audioRecordingInput) {
        this.audioRecordingInput = audioRecordingInput;
        if (this.audioRecordingInput.value) {
          this.shadowRoot.querySelector("#audioPlayback").setAttribute("src", this.audioRecordingInput.value);
          this.showProcessButton();
        }
      }
    }
  }

  showProcessButton() {
    const nlpResults = this.shadowRoot.querySelector("#nlpResults");
    const processBtn = this.shadowRoot.querySelector("#processButton");
    const reprocessBtn = this.shadowRoot.querySelector("#reprocessButton");

    if (nlpResults) nlpResults.style.display = "block";
    if (processBtn) {
      processBtn.removeAttribute('hidden');
    }
    if (reprocessBtn) {
      reprocessBtn.setAttribute('hidden', '');
    }
  }

  showReprocessButton() { 
    const processBtn = this.shadowRoot.querySelector("#processButton");
    const reprocessBtn = this.shadowRoot.querySelector("#reprocessButton");
    
    if (processBtn) {
      processBtn.setAttribute('hidden', '');
    }
    if (reprocessBtn) {
      reprocessBtn.removeAttribute('hidden');
    }
  }

  async processAudioWithNlp() {

    if (!navigator.onLine) {
      this.nlpError = this.t.offlineError;
      this.displayNlpError();
      return;
    }

    if (!this.audioRecordingInput) {
      console.error('No audio recording input found');
      return;
    }

    const audioBlob = this.audioRecordingInput.audioBlob;
    if (!audioBlob || !this.nlpModelUrl) {
      this.nlpError = this.t.processingError;
      this.displayNlpError();
      return;
    }
    this.processing = true;
    this.shadowRoot.querySelector("#processingIndicator").style.display = "flex";
    this.shadowRoot.querySelector("#nlpResults").style.display = "none";
    this.nlpError = "";
    try {
      const formData = new FormData();
      if (audioBlob) {
          formData.append('audio', audioBlob, 'recording.wav');
      } else {
        this.nlpError = this.t.processingError;
        this.displayNlpError();
        return;
      }
      if (this.stimuliText) {
        const preparedStimuli = this.stimuliText.toLowerCase().replace(/[,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");
        formData.append('stimuli', preparedStimuli);
      }
      const response = await fetch(this.nlpModelUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        this.nlpError = this.t.processingError;
        this.displayNlpError();
        return;
      }

      let result = await response.json();
      this.nlpResults = result;
      this.value = this.nlpResults;

      this.displayNlpResults();
      this.showReprocessButton();
      
    } catch (error) {
      console.error("NLP processing error:", error);
      this.nlpError = this.t.processingError;
      this.displayNlpError();
    } finally {
      this.processing = false;
      this.shadowRoot.querySelector("#processingIndicator").style.display = "none";
    }
  }

  annotateReferenceText() {
    const sentence_split = this.nlpResults.annotated_reference.split(' ');

    let annotatedHtml = '';

    // if the word is correct, use normal text, if the word is surrounded by **, like **word**, then highlight it in red, if the word is surrounded by ~~, like ~~word~, then highlight it in grey with a strikethrough
    sentence_split.forEach(chunk => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        const word = chunk.slice(2, -2);
        annotatedHtml += `<span style="color: #f44336; background-color: #ffc8baff; font-weight: bold;">${word}</span> `;
      } else if (chunk.startsWith('~~') && chunk.endsWith('~~')) {
        const word = chunk.slice(2, -2);
        annotatedHtml += `<span style="color: #6c757d; background-color: #e9ecef; text-decoration: line-through;">${word}</span> `;
      } else {
        annotatedHtml += `<span>${chunk} </span>`;
      }
    });

    return annotatedHtml;
  }

  displayNlpResults() {
    const resultsContainer = this.shadowRoot.querySelector("#nlpResults");
    const contentDiv = this.shadowRoot.querySelector("#nlpContent");
    if (this.nlpResults) {
      const correct_wpm = parseFloat(this.nlpResults.measures.correct_wpm).toFixed(2) || 0.0;
      
      const html = `
        <div class="csr-score">
          Correct Words Per Minute: ${correct_wpm}
        </div>
        
        <div class="result-section">
          <h5>Reference Text</h5>
          <div class="reference-text">${this.nlpResults.reference || 'No reference text provided'}</div>
        </div>
        
        <div class="result-section">
          <h5>Child's Reading</h5>
          <div class="hypothesis-text">${this.nlpResults.hypothesis || 'No hypothesis provided'}</div>
        </div>

        <div class="result-section">
          <h5>Annotated Reference Text</h5>
          <div class="hypothesis-text">${this.annotateReferenceText()}</div>
        </div>
        
        <div class="result-section">
          <h5>Analysis</h5>
          <p>${this.nlpResults.analysis || 'No analysis provided'}</p>
        </div>
        
        <div class="result-section">
          <h5>Recommendation</h5>
          <p>${this.nlpResults.recommendation || 'No recommendation provided'}</p>
        </div>
        
        <div class="result-section">
          <h5>Teaching Tip</h5>
          <p>${this.nlpResults.tip || 'No tip provided'}</p>
        </div>
      `;
      
      contentDiv.innerHTML = html;
    } else {
      contentDiv.innerHTML = `<p>${this.t.noResults}</p>`;
    }

    resultsContainer.style.display = "block";
    resultsContainer.classList.remove("nlp-error");
  }

  displayNlpError() {
    const resultsContainer = this.shadowRoot.querySelector("#nlpResults");
    const contentDiv = this.shadowRoot.querySelector("#nlpContent");
    
    contentDiv.innerHTML = `
      <p class="nlp-error">${this.t.processingError}: ${this.nlpError}</p>
    `;
    
    resultsContainer.style.display = "block";
    resultsContainer.classList.add("nlp-error");
  }

  reprocessAudio() {
    this.processAudioWithNlp();
  }

  validate() {
    if (!navigator.onLine) {
      return true;
    }
    if (this.hasAttribute('required') && !this.nlpResults) {
      this.invalid = true;
      return false;
    }
    
    return true;
  }

  onDisabledChange() {
    const processBtn = this.shadowRoot.querySelector("#processButton");
    const reprocessBtn = this.shadowRoot.querySelector("#reprocessButton");
    if (this.disabled) {
      if (processBtn) processBtn.setAttribute('disabled', 'disabled');
      if (reprocessBtn) reprocessBtn.setAttribute('disabled', 'disabled');
    } else {
      if (processBtn) processBtn.removeAttribute('disabled');
      if (reprocessBtn) reprocessBtn.removeAttribute('disabled');
    }
  }

}

window.customElements.define(TangyAudioRecordingNlp.is, TangyAudioRecordingNlp);