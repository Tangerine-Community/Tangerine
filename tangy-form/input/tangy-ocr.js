import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { t } from '../util/t.js'
import '../style/tangy-common-styles.js'
import '../style/tangy-element-styles.js'
import '../style/uppy-styles.js'
import '@polymer/iron-icon/iron-icon.js'
import '@polymer/iron-icons/hardware-icons.js'
import '@polymer/paper-button/paper-button.js'
import '@polymer/paper-progress/paper-progress.js';
import { TangyInputBase } from '../tangy-input-base.js'
import ImageBlobReduce from 'image-blob-reduce'
// import Tesseract from "tesseract.js";
import { createWorker } from "tesseract.js";
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import ImageEditor from '@uppy/image-editor';
import Webcam from '@uppy/webcam';

// import '@uppy/webcam/dist/style.min.css';
// import '@uppy/core/dist/style.min.css';
// import '@uppy/dashboard/dist/style.min.css';
// import '@uppy/image-editor/dist/style.min.css';


    /**
     * `tangy-photo-ocr`
     *
     *
     * @customElement
     * @polymer
     * @demo demo/index.html
     */
export class TangyOcr extends TangyInputBase {

  static get template () {
    return html`
    <style include="tangy-common-styles"></style>
    <style include="tangy-element-styles"></style>
    <style include="uppy-styles"></style>

    <style>
      video,img {
        width: 75%;
        border:5px solid red;
      }

      .hint-text{
        margin-top:6px;
        margin-left:4px;
      }

      #buttons {
        margin: 15px 0px;
      }

      paper-button {
        background-color: var(--accent-color, #CCC);
      }

      paper-button[disabled] {
        opacity: .2;
      }
      
      .saving {     
        filter: grayscale(100%);
        opacity: 0.4;
      }
      
      .saved {     
        filter: grayscale(0%);
        opacity: 1;
        border:5px solid green;
      }
      /* Centered text */
      .centered {
        position: absolute;
        top: 37.5%;
        left: 37.5%;
        transform: translate(-37.5%, -37.5%);
        font-size: xxx-large;
        color: red;
        display:none;
      }
      #progress-bar {
        display:none;
      }
    </style>
    <div class="flex-container m-y-25">
      <div id="qnum-number"></div>
      <div id="qnum-content">
        <label id="label"></label>
        <!--        <div id="imageDisplay">-->
        <!--          <video autoplay id="video"></video>-->
        <!--          <img src="[[value]]" style='display:none' id="photoCaptureImage"/>-->
        <!--          <div id="centeredText" class="centered">[[t.saving]]</div>-->
        <!--          -->
        <!--        </div>-->
        <!--        <div id="buttons">-->
        <!--          <paper-button id="capture-button" on-click="capturePhoto"><iron-icon icon="camera-enhance"></iron-icon> [[t.capture]] </paper-button>-->
        <!--          <paper-button id="clear-button" on-click="clearPhoto" disabled><iron-icon icon="delete"></iron-icon> [[t.clear]] </paper-button>-->
        <!--          <paper-button id="ocr-button" on-click="onOcrButtonPress"  disabled><iron-icon icon="hardware:scanner"></iron-icon> [[t.ocr]]</paper-button>-->
        <!--        </div>-->
        <label class="hint-text"></label>
        <div id="error-text"></div>
        <div id="warn-text"></div>
        <div id="discrepancy-text"></div>
        <div id="image-editor"
      </div>
      <paper-progress id="progress-bar" indeterminate></paper-progress>
      <div id="ocrResults"></div>
    </div>
    </div>
    
    `
  }

  static get is() {
    return 'tangy-ocr'
  }

  static get properties() {
    return {
      name: {
        type: String,
        value: ''
      },
      maxSizeInKb: {
        type: Number,
        value: 256,
        reflectToAttribute: true
      },
      compression: {
        type: String,
        value: '0.8',
        reflectToAttribute: true
      },
      label: {
        type: String,
        observer: 'reflect',
        value: ''
      },
      hintText: {
        type: String,
        observer: 'onHintTextChange',
        value: ''
      },
      errorText: {
        type: String,
        value: ''
      },
      private: {
        type: Boolean,
        value: false
      },
      disabled: {
        type: Boolean,
        value: false,
        observer: 'onDisabledChange',
        reflectToAttribute: true
      },
      hasWarning: {
        type: Boolean,
        value: false,
        observer: 'onWarnChange',
        reflectToAttribute: true
      },
      hasDiscrepancy: {
        type: Boolean,
        value: false,
        observer: 'onDiscrepancyChange',
        reflectToAttribute: true
      },
      hidden: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      skipped: {
        type: Boolean,
        value: false,
        observer: 'onSkippedChange',
        reflectToAttribute: true
      },
      invalid: {
        type: Boolean,
        value: false,
        observer: 'onInvalidChange',
        reflectToAttribute: true
      },
      incomplete: {
        type: Boolean,
        value: true,
        reflectToAttribute: true
      },
      value: {
        type: String,
        value: '',
        observer: 'reflect'
      },
      warnText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      discrepancyText: {
        type: String,
        value: '',
        reflectToAttribute: true
      },
      identifier: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      front: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      dictionary: {
        type: String,
        value: '',
        notify: true
      }
     }
  }

  connectedCallback () {
    super.connectedCallback()
    this.shadowRoot.querySelector('#qnum-number').innerHTML = this.hasAttribute('question-number') 
      ? `<label>${this.getAttribute('question-number')}</label>`
      : ''
    // let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    // let devices = navigator.mediaDevices.enumerateDevices().then(function(devices) {
    //   var arrayLength = devices.length;
    // })
    this.constraints = {video: { facingMode: { exact: "environment" } }}
    this.currentStream = null;
    this.parentElement.querySelectorAll('[name]')
        .forEach(input => {
          console.log("hey")
          debugger;
        })
  }

  disconnectedCallback() {
    // this.stopMediaTracks(this.currentStream)
  }

  ready() {
    super.ready();
    this.t = {
      capture: t('capture'),
      accept: t('accept'),
      clear: t('clear'),
      saving: t('Saving...'),
      ocr: t('OCR')
    }
    this.shadowRoot.querySelector('#label').innerHTML = this.label

    // Start streaming video
    // const constraints = this.getConstraints()
    // navigator.mediaDevices.getUserMedia(constraints)
    // .then(mediaStream => {
    //   this.currentStream = mediaStream
    //   this.shadowRoot.querySelector('video').srcObject = mediaStream;
    //   const track = mediaStream.getVideoTracks()[0];
    //   this.imageCapture = new ImageCapture(track);
    // }).catch(error => {
    //       if (error.constraint && error.constraint === 'facingMode') {
    //         // Workaround for testing on Chrome, not on Android device
    //         navigator.mediaDevices.getUserMedia({video: true})
    //             .then(mediaStream => {
    //               this.currentStream = mediaStream
    //               this.shadowRoot.querySelector('video').srcObject = mediaStream;
    //               const track = mediaStream.getVideoTracks()[0];
    //               this.imageCapture = new ImageCapture(track);
    //             });
    //       } else {
    //         console.log("error: " + error)
    //       }
    //     }
    //   )
    //
    // if (this.value) {
    //   this.shadowRoot.querySelector('video').style.display = 'none'
    //   this.shadowRoot.querySelector('#photoCaptureImage').style.display = 'block'
    //   // this.enableButtons(["#accept-button","#clear-button"])
    //   this.enableButtons(["#clear-button", "#ocr-button"])
    //   this.disableButtons(["#capture-button"])
    // }
    const editorEl = this.shadowRoot.querySelector('#image-editor')
    const constraints = this.getConstraints()
    const uppy = new Uppy({restrictions: {maxNumberOfFiles:1}})
        .use(Dashboard, { inline: true, target: editorEl, autoOpenFileEditor: true, hideUploadButton:true,
          disableLocalFiles:true, proudlyDisplayPoweredByUppy:false, singleFileFullScreen:true,
          locale: {
            strings: {
              importFiles: 'Import via:',
            },
          },})
        // .use(Webcam, { target: Dashboard, modes:['picture'], mirror:false, videoConstraints: constraints, mobileNativeCamera:true })
        // .use(Webcam, { target: Dashboard, modes:['picture'], mirror:false, mobileNativeCamera:true })
        .use(Webcam, { target: Dashboard, modes:['picture'], mirror:false, videoConstraints: constraints, mobileNativeCamera:false, showVideoSourceDropdown:true })
        .use(ImageEditor, { target: Dashboard });
    uppy.on('file-editor:complete', async (updatedFile) => {
      // console.log(updatedFile);
      this.shadowRoot.querySelector('#ocrResults').innerHTML = ``
      this.shadowRoot.querySelector('#progress-bar').style.display = 'block'
      // Tesseract.recognize(
      //     updatedFile.data,
      //     'spa',
      //     { logger: m => console.log(m) }
      // ).then(({ data: { text } }) => {
      //   this.shadowRoot.querySelector('#progress-bar').style.display = 'none'
      //   console.log(text);
      //   this.shadowRoot.querySelector('#ocrResults').innerHTML = `<br/><pre>${text}</pre>`
      // })

      const worker = await createWorker({
        corePath:'./assets/config/tesseract.js-core/tesseract-core-simd.wasm.js',
        workerPath:'./assets/config/tesseract.js/dist/worker.min.js',
        langPath:'./assets/config/spa.user-words',
        CONFIGFILE: './assets/config/tesseract-config' });
      // await worker.loadLanguage('spa');
      // await worker.initialize('spa');
      await worker.initialize('spa', "0", {load_number_dawg: "0", user_words_suffix: './assets/config/user-words'});
      // await worker.initialize('spa', "0", {load_number_dawg: "0", CONFIGFILE: './assets/config/tesseract-config'});
      await worker.setParameters({
        user_words_suffix: this.dictionary,
      });
      const { data: { text } } = await worker.recognize(updatedFile.data,{user_words_suffix: this.dictionary});
      this.shadowRoot.querySelector('#progress-bar').style.display = 'none'
      console.log(text);
      this.shadowRoot.querySelector('#ocrResults').innerHTML = `<br/><pre>${text}</pre>`
    });
  }

  reflect() {
    if (!this.ready) return
    // if (this.shadowRoot.querySelector('#photoCaptureImage') && (this.shadowRoot.querySelector('#photoCaptureImage').src === '')) return
    // this.shadowRoot.querySelector('video').style.display = 'none'
    // this.shadowRoot.querySelector('#photoCaptureImage').style.display = 'block'
    }

  onHintTextChange(value) {
    this.shadowRoot.querySelector('.hint-text').innerHTML = value
  }

  onInvalidChange(value) {
    this.shadowRoot.querySelector('#error-text').innerHTML = this.invalid
      ? `<iron-icon icon="error"></iron-icon> <div> ${ this.hasAttribute('error-text') ? this.getAttribute('error-text') : ''} </div>`
      : ''
  }

  validate() {
    if (this.hasAttribute('required') && !this.value) {
      this.invalid = true
      return false
    } else {
      this.invalid = false
      return true
    }
  }

  disableButtons(ids) {
    ids.forEach( (id) =>
      this.shadowRoot.querySelector(id).setAttribute('disabled', '')
    )
  }

  enableButtons(ids) {
    ids.forEach( (id) =>
      this.shadowRoot.querySelector(id).removeAttribute('disabled')
    )
  }
  
  async capturePhoto() {
    this.disableButtons(["#capture-button"])
    const { imageWidth, imageHeight } = await this.imageCapture.getPhotoCapabilities();
    this.blob = await this.imageCapture.takePhoto({
      imageWidth: imageWidth.max,
      imageHeight: imageHeight.max
    })
    this.shadowRoot.querySelector('video').style.display = 'none'
    // this.shadowRoot.querySelector('#placeholder').style.display = 'block'
    const photoCaptureImageEl = this.shadowRoot.querySelector('#photoCaptureImage')
    photoCaptureImageEl.style.display = 'block'
    this.$.photoCaptureImage.classList.add('saving');
    this.shadowRoot.querySelector('#centeredText').style.display = 'block'
    // Lay in the placeholder image while processing
    this.$.photoCaptureImage.src = URL.createObjectURL(this.blob);
    // this.$.photoCaptureImage.src = placeholder
    this.$.photoCaptureImage.onload = () => { URL.revokeObjectURL(this.src); }

    // const ImageReducer = new ImageBlobReduce()
    // const compression = parseFloat(this.compression)
    // // Forces the output to be a JPG of .8 quality
    // ImageReducer._create_blob = function (env) {
    //   return this.pica.toBlob(env.out_canvas, 'image/jpeg', compression)
    //     .then(function (blob) {
    //       env.out_blob = blob;
    //       return env;
    //     });
    // };
    // this.blob = await ImageReducer.toBlob(this.blob, {max: this.maxSizeInKb})
    // this.$.photoCaptureImage.src = URL.createObjectURL(this.blob);
    // this.$.photoCaptureImage.onload = () => {
    //   URL.revokeObjectURL(this.src);
    //   // const cropper = new Cropper(photoCaptureImageEl,{
    //   //   viewMode: 1,
    //   //   dragMode: 'crop',
    //   //   // autoCrop: true,
    //   //   preview: photoCaptureImageEl
    //   // });
    //
    // }

    this.shadowRoot.querySelector('video').style.display = 'none'
    this.shadowRoot.querySelector('#photoCaptureImage').style.display = 'block'
    this.shadowRoot.querySelector('#centeredText').style.display = 'none'
    this.$.photoCaptureImage.classList.add('saved');
    this.enableButtons(["#clear-button","#ocr-button"])
    await this.acceptPhoto()
  }

  clearPhoto() {
    this.value = null;
    this.$.photoCaptureImage.src = ''
    this.enableButtons(["#capture-button"])
    this.disableButtons(["#clear-button", "#ocr-button"])
    this.shadowRoot.querySelector('video').style.display = 'block'
    this.shadowRoot.querySelector('#photoCaptureImage').style.display = 'none'
    this.shadowRoot.querySelector('#ocrResults').style.display = 'none'
    this.shadowRoot.querySelector('#ocrResults').innerHTML = ``
  }

  async acceptPhoto() {
    // If the application cancels the event, save to the local db.
    this.value = this.$.photoCaptureImage.src
    const saveToFileSystemCancelled = !this.dispatchEvent(new CustomEvent('TANGY_MEDIA_UPDATE', {bubbles: true, detail: {value: this}, cancelable: true}))
    if (saveToFileSystemCancelled) {
      // Convert blob to base64 string
      const arrayBuffer = await this.blob.arrayBuffer()
      // convert arrayBuffer to a base64String
      const base64String = window.btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      // turn it into a data:image
      const nudata = 'data:image/jpeg;base64,' + base64String
      this.value = nudata
      console.log("Image data prepared to save to database.")
    } else {
      console.log("Image url saved to database; image file should be saved to file system.")
    }
    this.disableButtons(["#capture-button"])
  }

  getConstraints() {
    if (this.front) {
      return { facingMode: "user" }
    } else {
      return { facingMode: "environment" }
    }
  }

  stopMediaTracks(stream) {
    stream.getTracks().forEach(track => {
      // stream.removeTrack(track)
      track.stop();
    })
  }

  toggleCamera() {
    if (this.front) {
      this.front = false
    } else {
      this.front = true
    }
    const constraints = this.getConstraints()
    this.stopMediaTracks(this.currentStream)
    navigator.mediaDevices.getUserMedia(constraints)
        .then(mediaStream => {
          this.currentStream = mediaStream
          this.shadowRoot.querySelector('video').srcObject = mediaStream;
          const track = mediaStream.getVideoTracks()[0];
          this.imageCapture = new ImageCapture(track);
        })
  }

  onDiscrepancyChange(value) {
    this.shadowRoot.querySelector('#discrepancy-text').innerHTML = this.hasDiscrepancy
      ? `<iron-icon icon="flag"></iron-icon> <div> ${ this.hasAttribute('discrepancy-text') ? this.getAttribute('discrepancy-text') : ''} </div>`
      : ''
  }

  onWarnChange(value) {
    this.shadowRoot.querySelector('#warn-text').innerHTML = this.hasWarning
      ? `<iron-icon icon="warning"></iron-icon> <div> ${ this.hasAttribute('warn-text') ? this.getAttribute('warn-text') : ''} </div>`
      : ''
  }

  onSkippedChange(newValue, oldValue) {
    if (newValue === true) {
      this.value = this.constructor.properties.value.value
    }
  }

  async onOcrButtonPress() {
    this.disableButtons(["#ocr-button"])
    this.shadowRoot.querySelector('#progress-bar').style.display = 'block'
    // this.shadowRoot.querySelector('#photoCaptureImage').style.display = 'none'
    console.log("Tangy-ocr says hello. ")
    const img = this.value

    Tesseract.recognize(
        img,
        'eng',
        { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
      this.shadowRoot.querySelector('#progress-bar').style.display = 'none'
      console.log(text);
      this.shadowRoot.querySelector('#ocrResults').innerHTML = `<br/><pre>${text}</pre>`
    })

    // await worker.load();
    // await worker.loadLanguage('eng');
    // // await worker.initialize('eng', OEM.LSTM_ONLY);
    // await worker.initialize('eng');
    // // await worker.setParameters({
    // //   tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    // // });
    // const {data: {text}} = await worker.recognize(img);
    // console.log(text);

    // const { data: { text } } = await worker.recognize(img, 'eng', {
    //   corePath: '../../node_modules/tesseract.js-core/tesseract-core.wasm.js',
    //   workerPath: "../../node_modules/tesseract.js/dist/worker.min.js",
    //   logger: m => console.log(m),
    // });


    // const worker = createWorker({
    //   logger: m => console.log(m),
    // });
    // await worker.load();
    // await worker.loadLanguage('eng');
    // await worker.initialize('eng');
    // const { data: { text } } = await worker.recognize(img, 'eng');
    // console.log(text);
    // await worker.terminate();
  }

}
window.customElements.define(TangyOcr.is, TangyOcr)
