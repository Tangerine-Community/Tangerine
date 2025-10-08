import { PolymerElement, html } from "@polymer/polymer/polymer-element.js";
import { t } from "../util/t.js";
import "../style/tangy-common-styles.js";
import "../style/tangy-element-styles.js";
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/av-icons.js';
import '@polymer/iron-icons/editor-icons.js';
import '@polymer/iron-icon/iron-icon.js';
import "@polymer/paper-button/paper-button.js";
import { TangyInputBase } from "../tangy-input-base.js";
import { getWaveBlob } from "../util/webmToWavConverter.js";
import AudioMotionAnalyzer from 'audiomotion-analyzer';

export class TangyAudioRecording extends TangyInputBase {
  static get template() {
    return html`
      <style include="tangy-common-styles"></style>
      <style include="tangy-element-styles"></style>
      <style>
         .hint-text {
           margin-top: 6px;
           margin-left: 4px;
         }
         #buttons {
           margin: 15px 0px;
         }
         #recording-time{
             align: right;
             font-size: 12px;
             font-style bold;
         }
        :host([show-button]) paper-button {
            display:block;
        }
        paper-button[disabled] {
          opacity: 0.2;
        }
        paper-button#startRecording {
            width: 100%;
        }
        paper-button#startRecording {
            width: 100%;
        }
        paper-button {
           background-color: var(--accent-color, #ccc);
        }
        audio#audioPlayback {
           display: none;
        }
        .audio-row {
          display: flex;
          align-items: center;
          gap: 4px; /* Optional: adds space between analyzer and button */
        }
      </style>
      <div id="qnum-number"></div>
      <div id="qnum-content">
        <label id="label"></label>
        <label id="hintText" class="hint-text"></label>
        <div>
          <paper-button id="startRecording" on-click="startRecording"
            disabled="[[isRecording]]"
            ><iron-icon icon="settings-voice"></iron-icon> [[t.record]]
          </paper-button>
        <div class="audio-row">
          <paper-button id="stopRecording" on-click="stopRecording"
            ><iron-icon icon="av:stop"></iron-icon>
          </paper-button>
          <paper-button id="playRecording"
              on-click="playRecording"
              disabled="[[!audioBlob]]"
              ><iron-icon icon="av:play-arrow"></iron-icon>
          </paper-button>
          <paper-button id="pausePlayback" on-click="pausePlayback"
            ><iron-icon icon="av:pause"></iron-icon>
          </paper-button>
          <paper-button
            id="deleteRecording"
            on-click="deleteRecording"
            disabled="[[!audioBlob]]"
            ><iron-icon icon="delete"></iron-icon>
          </paper-button>
          <span id="audio-motion-container"></span>
          <span id="recording-time">[[recordingTime]]</span>
        </div>
         <!-- this element is hidden, and used for playback only -->
        <audio id="audioPlayback" src="[[value]]"></audio>
        <div id="error-text"></div>
        <div id="warn-text"></div>
        <div id="discrepancy-text"></div>
      </div>
    `;
  }
  static get is() {
    return 'tangy-audio-recording'
}
  static get properties() {
    return {
      name: {
        type: String,
        value: "",
      },
      hintText: {
        type: String,
        value: "",
        reflectToAttribute: true,
      },
      label: {
        type: String,
        observer: "reflect",
        value: "",
      },
      errorText: {
        type: String,
        value: "",
      },
      private: {
        type: Boolean,
        value: false,
      },
      disabled: {
        type: Boolean,
        value: false,
        observer: "onDisabledChange",
        reflectToAttribute: true,
      },
      hidden: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      skipped: {
        type: Boolean,
        value: false,
        observer: "onSkippedChange",
        reflectToAttribute: true,
      },
      invalid: {
        type: Boolean,
        value: false,
        observer: "onInvalidChange",
        reflectToAttribute: true,
      },
      incomplete: {
        type: Boolean,
        value: true,
        reflectToAttribute: true,
      },
      value: {
        type: String,
        value: "",
        observer: "reflect",
        reflectToAttribute: true
      },
      identifier: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      mediaRecorder: Object,
      audioChunks: {
        type: Array,
        value: () => [],
      },
      audioBlob: {
        type: Object,
        value: null,
      },
      isRecording: {
        type: Boolean,
        value: false,
      },
      isPlaying: {
        type: Boolean,
        value: false,
      },
      recordingTime: {
        type: String,
        value: "00:00",
        observer: "reflect",
        reflectToAttribute: true
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
        this.shadowRoot.querySelector("#qnum-number").innerHTML = this.hasAttribute(
      "question-number"
    )
      ? `<label>${this.getAttribute("question-number")}</label>`
      : "";

    // initial state of hiding/showing elements -- only show the record button
    this.shadowRoot.querySelector("#stopRecording").style.display = "none";
    this.shadowRoot.querySelector("#playRecording").style.display = "none";
    this.shadowRoot.querySelector("#pausePlayback").style.display = "none";
    this.shadowRoot.querySelector("#deleteRecording").style.display = "none";
    this.shadowRoot.querySelector("#recording-time").style.display = "none";
    this.shadowRoot.querySelector("#audio-motion-container").style.display = "none";
  }

  disconnectedCallback() {
    if (this.isRecording && this.mediaRecorder) {
      this.isRecording = false;
      if (this.mediaRecorder.state == "active") {
        this.mediaRecorder.stop();
      }
      clearInterval(this.recordingInterval);
    }
    if (this.$.audioPlayback) {
          this.$.audioPlayback.pause();
    }
    this.audioChunks = [];
    this.audioBlob = null;
    this.audioMotion.disconnectInput(this.micStream);
    this.audioMotion.volume = 1;
    this.audioMotion = null;
    this.mediaRecorder = null;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    this.mediaStream = null;
    if (this.micStream) {
      this.micStream.disconnect();
    }
    this.micStream = null;

    super.disconnectedCallback();
  }

  ready() {
    super.ready()
    this.t = {
      record: t("record"),
      stop: t("stop"),
      play: t("play"),
      delete: t("delete")
    };

    this.shadowRoot.querySelector("#hintText").innerHTML = this.hintText;
    this.shadowRoot.querySelector("#label").innerHTML = this.label;

    // Options pulled from https://audiomotion.dev/demo/fluid.html -- click the getOptions() button and see the console
    const audioMotionContainer = this.shadowRoot.getElementById('audio-motion-container')
    const options = {
      "alphaBars": false,
      "ansiBands": false,
      "barSpace": 0.25,
      "bgAlpha": 0.7,
      "channelLayout": "single",
      "colorMode": "bar-level",
      "fadePeaks": false,
      "fftSize": 8192,
      "fillAlpha": 1,
      "frequencyScale": "log",
      //"gradient": "orangered", // defined below
      "gravity": 3.8,
      "ledBars": false,
      "linearAmplitude": true,
      "linearBoost": 1.6,
      "lineWidth": 0,
      "loRes": false,
      "lumiBars": false,
      "maxDecibels": -25,
      "maxFPS": 0,
      "maxFreq": 16000,
      "minDecibels": -85,
      "minFreq": 30,
      "mirror": 0,
      "mode": 2,
      "noteLabels": false,
      "outlineBars": false,
      "overlay": false,
      "peakFadeTime": 750,
      "peakHoldTime": 500,
      "peakLine": false,
      "radial": false,
      "radialInvert": false,
      "radius": 0.3,
      "reflexAlpha": 1,
      "reflexBright": 1,
      "reflexFit": true,
      "reflexRatio": 0.5,
      "roundBars": true,
      "showBgColor": true,
      "showFPS": false,
      "showPeaks": false,
      "showScaleX": false,
      "showScaleY": false,
      "smoothing": 0.7,
      "spinSpeed": 0,
      "splitGradient": false,
      "trueLeds": false,
      "useCanvas": true,
      "volume": 1,
      "weightingFilter": "D"
    }
    this.audioMotion = new AudioMotionAnalyzer(
      audioMotionContainer, options
    );
    this.audioMotion.registerGradient( 'tangyGradient', {
      bgColor: '#eee', // background color (optional) - defaults to '#111'
      dir: 'h',           // add this property to create a horizontal gradient (optional)
      colorStops: [       // list your gradient colors in this array (at least one color is required)
          { color: 'orangered', pos: .6 }, // in an object, use `pos` to adjust the offset (0 to 1) of a colorStop
          { color: 'orange', level: .5 }  // use `level` to set the max bar amplitude (0 to 1) to use this color
      ]
    });
    this.audioMotion.gradient = 'tangyGradient';
    this.audioPlaybackSource = this.audioMotion.audioCtx.createMediaElementSource(this.$.audioPlayback);
    this.audioMotion.connectInput(this.audioPlaybackSource);
  }

  reflect() {
    if (!this.$.audioPlayback || this.$.audioPlayback.src == '') return;

    this.value = this.$.audioPlayback.src
    if (this.value && this.value !== '') {
      this.shadowRoot.querySelector("#startRecording").style.display = "none";

      this.shadowRoot.querySelector("#audio-motion-container").style.display = "inline-flex";
      this.shadowRoot.querySelector("#recording-time").style.display = "inline-flex";

      if (this.isRecording) {
        this.shadowRoot.querySelector("#playRecording").style.display = "none";
        this.shadowRoot.querySelector("#pausePlayback").style.display = "none";
        this.shadowRoot.querySelector("#stopRecording").style.display = "inline-flex";
        this.shadowRoot.querySelector("#deleteRecording").style.display = "none";
      } else if (this.isPlaying) {
        this.shadowRoot.querySelector("#playRecording").style.display = "none";
        this.shadowRoot.querySelector("#pausePlayback").style.display = "inline-flex";
        this.shadowRoot.querySelector("#deleteRecording").style.display = "inline-flex";
      } else {
        this.shadowRoot.querySelector("#playRecording").style.display = "inline-flex";
        this.shadowRoot.querySelector("#pausePlayback").style.display = "none";
        this.shadowRoot.querySelector("#deleteRecording").style.display = "inline-flex";
      }
    }

  }

  onInvalidChange(value) {
    if (this.shadowRoot.querySelector('#error-text')) {
      this.shadowRoot.querySelector('#error-text').innerHTML = this.invalid
        ? `<iron-icon icon="error"></iron-icon> 
           <div> ${ this.hasAttribute('error-text') ? this.getAttribute('error-text') : this.errorText } </div>`
        : ''
    }
  }

  onSkippedChange(newValue, oldValue) {
    if (newValue === true) {
      this.value = this.constructor.properties.value.value
    }
  }

  validate() {
    if (this.isRecording) {
      this.errorText = t("Stop the recording before continuing"); // do this before setting invalid to true
      this.invalid = true;
      return false;
    }
    if (this.hasAttribute('required') && !this.value) {
      this.errorText = t("Recording is required"); // do this before setting invalid to true
      this.invalid = true
      return false
    } else {
      this.errorText = "";
      this.invalid = false
      return true
    }
  }

  onDisabledChange() {
    if (this.disabled) {
      this.shadowRoot.querySelector("#startRecording").setAttribute("disabled", "disabled");
      this.shadowRoot.querySelector("#stopRecording").setAttribute("disabled", "disabled");
      this.shadowRoot.querySelector("#playRecording").setAttribute("disabled", "disabled");
      this.shadowRoot.querySelector("#pausePlayback").setAttribute("disabled", "disabled");
      this.shadowRoot.querySelector("#deleteRecording").setAttribute("disabled", "disabled");
    } else {
      this.shadowRoot.querySelector("#startRecording").removeAttribute("disabled");
      this.shadowRoot.querySelector("#stopRecording").removeAttribute("disabled");
      this.shadowRoot.querySelector("#playRecording").removeAttribute("disabled");
      this.shadowRoot.querySelector("#pausePlayback").removeAttribute("disabled");
      this.shadowRoot.querySelector("#deleteRecording").removeAttribute("disabled");
    }
  }

  validate_back() {
    if (this.isRecording) {
      this.errorText =  t("Stop the recording before continuing"); // do this before setting invalid to true
      this.invalid = true;
      return false;
    }
    return true;
  }
  
  startRecording() {
    if (this.isRecording) return;
    this.isRecording = true;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaStream = stream;
        this.mediaRecorder = new MediaRecorder(this.mediaStream);
        this.mediaRecorder.onstop = (async () => {
          const webmBlob = new Blob(this.audioChunks);
          this.audioChunks = [];
          const webmURL = URL.createObjectURL(webmBlob);
          const response = await fetch(webmURL);
          const arrayBuffer = await response.arrayBuffer()
          const audioContext = this.audioMotion.audioCtx;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          this.audioBlob = getWaveBlob(audioBuffer, false)
          const audioURL = URL.createObjectURL(this.audioBlob);
          this.value = audioURL;
          this.dispatchEvent(
            new CustomEvent("TANGY_MEDIA_UPDATE", { detail: { value: this } })
          );
          this.invalid = false;
          this.audioMotion.disconnectInput( this.micStream );
          this.audioMotion.volume = 1; // restore volume to normal
          this.micStream.disconnect();
          this.mediaStream.getTracks().forEach(track => track.stop());
        });

        this.mediaRecorder.start();
        this.audioBlob = null;
        this.shadowRoot.querySelector("#startRecording").style.display = "none";
        this.shadowRoot.querySelector("#stopRecording").style.display = "inline-flex";
        this.shadowRoot.querySelector("#audio-motion-container").style.display = "inline-flex";
        this.shadowRoot.querySelector("#recording-time").style.display = "inline-flex";

        // create stream using audioMotion audio context
        this.micStream = this.audioMotion.audioCtx.createMediaStreamSource(this.mediaStream);
        // connect microphone stream to analyzer
        this.audioMotion.connectInput( this.micStream );
        // mute output to prevent feedback loops from the speakers
        this.audioMotion.volume = 0;

        this.recordingInterval = setInterval(() => {
          const currentTime = new Date().getTime();
          const elapsedTime = currentTime - this.startTime;
          const minutes = Math.floor(elapsedTime / 60000);
          const seconds = Math.floor((elapsedTime % 60000) / 1000);
          this.recordingTime = `${String(minutes).padStart(2, "0")}:${String(
            seconds
          ).padStart(2, "0")}`;
        }, 1000);
        this.startTime = new Date().getTime();
        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data);
        };
      })
      .catch((error) => {
        this.isRecording = false;
        console.error("Error accessing microphone", error);
      });
  }

  stopRecording() {
    this.isRecording = false;

    if (this.mediaRecorder.state == "recording") {
      this.mediaRecorder.stop();
    }
    clearInterval(this.recordingInterval);
    this.shadowRoot.querySelector("#stopRecording").style.display = "none";
    this.shadowRoot.querySelector("#startRecording").style.display = "none";
    this.shadowRoot.querySelector("#playRecording").style.display = "inline-flex";
    this.shadowRoot.querySelector("#deleteRecording").style.display = "inline-flex";
    this.shadowRoot.querySelector("#recording-time").style.display = "inline-flex";
  }

  playRecording() {
    if (this.isRecording || this.isPlaying) return;
    if (this.audioBlob) {
      this.shadowRoot.querySelector("#playRecording").style.display = "none";
      this.shadowRoot.querySelector("#pausePlayback").style.display = "inline-flex";

      this.$.audioPlayback.play();
      this.isPlaying = true;
      this.$.audioPlayback.addEventListener('ended', () => {
        // Handle end of audio playback here
        this.isPlaying = false;
        this.shadowRoot.querySelector("#playRecording").style.display = "inline-flex";
        this.shadowRoot.querySelector("#pausePlayback").style.display = "none";
      });

    } else {
      console.warn("No audio recording available to play.");
    }
  }

  pausePlayback() {
    if (this.isRecording || !this.isPlaying) return;
    if (this.$.audioPlayback) {
      this.$.audioPlayback.pause();
      this.isPlaying = false;
      this.shadowRoot.querySelector("#playRecording").style.display = "inline-flex";
      this.shadowRoot.querySelector("#pausePlayback").style.display = "none";
    }
  }

  deleteRecording() {
    if (this.isRecording) return;
    this.isPlaying = false;
    this.audioBlob = null;
    this.recordingTime = "00:00";
 
    this.$.audioPlayback.removeAttribute("src");
    this.value = "";

    this.shadowRoot.querySelector("#startRecording").style.display = "inline-flex";
    this.shadowRoot.querySelector("#stopRecording").style.display = "none";
    this.shadowRoot.querySelector("#playRecording").style.display = "none";
    this.shadowRoot.querySelector("#pausePlayback").style.display = "none";
    this.shadowRoot.querySelector("#deleteRecording").style.display = "none";
    this.shadowRoot.querySelector("#recording-time").style.display = "none";
    this.shadowRoot.querySelector("#audio-motion-container").style.display = "none";
  }
}

window.customElements.define(TangyAudioRecording.is, TangyAudioRecording);
