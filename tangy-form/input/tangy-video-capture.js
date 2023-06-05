import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {t} from '../util/t.js'
import '../style/tangy-common-styles.js'
import '../style/tangy-element-styles.js'
import '@polymer/iron-icon/iron-icon.js'
import '@polymer/paper-button/paper-button.js'
import {TangyInputBase} from '../tangy-input-base.js'

/**
 * `tangy-video-capture`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class TangyVideoCapture extends TangyInputBase {

    static get template() {
        return html`
            <style include="tangy-common-styles"></style>
            <style include="tangy-element-styles"></style>

            <style>
                video, img {
                    width: 75%;
                }
                
                .recording-active {
                    border: 10px dashed red;
                }
                .recording-stopped {
                    border: 10px solid green;
                }
                .playback {
                    border: 5px solid black;
                }

                .hint-text {
                    margin-top: 6px;
                    margin-left: 4px;
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
                    border: 5px solid green;
                }

                /* Centered text */
                .centered {
                    position: absolute;
                    top: 37.5%;
                    left: 37.5%;
                    transform: translate(-37.5%, -37.5%);
                    font-size: xxx-large;
                    color: red;
                    display: none;
                }
                iron-icon {
                    margin-right: 5px;
                }
            </style>
            <div class="flex-container m-y-25">
                <div id="qnum-number"></div>
                <div id="qnum-content">
                    <label id="label"></label>
                    <div id="imageDisplay">
                        <video id="gum" playsinline autoplay muted></video>
                        <video id="recorded" playsinline></video>
                        <!--          <img src="[[value]]" style='display:none' id="photoCaptureImage"/>-->
                        <div id="centeredText" class="centered">[[t.saving]]</div>
                    </div>
                    <div id="buttons">
                        <paper-button id="record">
                            <iron-icon icon="camera-enhance"></iron-icon>
                            [[t.record]]
                        </paper-button>
<!--                        <paper-button id="save">-->
<!--                            <iron-icon icon="icons:save"></iron-icon>-->
<!--                            [[t.save]]-->
<!--                        </paper-button>-->
                        <paper-button id="play">
                            <iron-icon icon="av:play-circle-filled"></iron-icon>
                            [[t.play]]
                        </paper-button>
                    </div>

                    <div>
                        <span id="errorMsg"></span>
                    </div>
                    <label class="hint-text"></label>
                    <div id="error-text"></div>
                    <div id="warn-text"></div>
                    <div id="discrepancy-text"></div>
                </div>
            </div>
        `
    }

    static get is() {
        return 'tangy-video-capture'
    }

    static get properties() {
        return {
            name: {
                type: String,
                value: ''
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
            frontCamera: {
                type: Boolean,
                value: true,
                reflectToAttribute: true
            },
            recordAudio: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            noVideoConstraints: {
                type: Boolean,
                reflectToAttribute: true
            },
            codec: {
                type: String,
                value: '',
                reflectToAttribute: true
            },
            videoWidth: {
                type: Number,
                reflectToAttribute: true
            },
            videoHeight: {
                type: Number,
                reflectToAttribute: true
            },
            dataType: {
                type: String,
                value: 'video',
                reflectToAttribute: true
            },
        }
    }

    constructor() {
        super()
        this.currentStream = null
        this.recordedBlobs = []
        this.mediaRecorder = null
        this.sourceBuffer = null
        this.recording = false
        this.handleDataAvailable = (event) => {
            console.log('handleDataAvailable', event);
            if (event.data && event.data.size > 0) {
                if (typeof this.recordedBlobs === 'undefined') {
                    this.recordedBlobs = [];
                }
                this.recordedBlobs.push(event.data);
            }
        }
        this.handleSuccess = (stream) => {
            this.currentStream = stream
            this.enableButtons(["#record"])
            window.stream = stream;

            const gumVideo = this.shadowRoot.querySelector('video#gum');
            gumVideo.srcObject = stream;
            if (this.getSupportedMimeTypes().find(el => el === this.codec) === undefined) {
                const errorMsg = `${this.codec} is not supported; choosing one available.`
                console.error(errorMsg);
                this.errorMsgElement.innerHTML = errorMsg;
                // pick the first one.
                if (this.getSupportedMimeTypes().length > 0) {
                    this.codec = this.getSupportedMimeTypes()[0];
                    const errorMsg = ` ${this.codec} will be used instead.`
                    console.error(errorMsg);
                    this.errorMsgElement.innerHTML += errorMsg;
                } else {
                    alert('No supported codecs found.');
                }
            }
        }
        if (this.saveToFile) {
            if (!window['isCordovaApp']) {
                console.log("This feature is only available in the Tangerine Mobile app.")
            }
        }
        this.getConstraints = () => {
            if (typeof this.noVideoConstraints === 'undefined' || this.noVideoConstraints === 'true') {
                return {video: {width: this.videoWidth, height: this.videoHeight}, audio:this.recordAudio}
            } else {
                if (this.frontCamera) {
                    return {video: {facingMode: {exact: "user"}, width: this.videoWidth, height: this.videoHeight}, audio:this.recordAudio}
                } else {
                    return {video: {facingMode: {exact: "environment"}, width: this.videoWidth, height: this.videoHeight}, audio:this.recordAudio}
                }
            }
        }

        this.startRecording = () => {
            this.recording = true;
            this.clearVideo()
            this.shadowRoot.querySelector('#gum').style.display = 'block'
            this.$.gum.classList.remove('recording-stopped')
            this.$.gum.classList.add('recording-active')
            this.$.record.innerHTML = '<iron-icon icon="av:stop"></iron-icon> Stop'
            this.recordedBlobs = [];
            const mimeType = this.codec
            const options = {mimeType};

            try {
                this.mediaRecorder = new MediaRecorder(window.stream, options);
            } catch (e) {
                console.error('Exception while creating MediaRecorder:', e);
                this.errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
                return;
            }

            // console.log('Created MediaRecorder', this.mediaRecorder, 'with options', options);
            // this.disableButtons(["#record", "#play"])
            this.disableButtons(["#play"])
            // this.enableButtons(["#save"])
            this.mediaRecorder.onstop = (event) => {
                console.log('Recorder stopped: ', event);
                const blob = new Blob(this.recordedBlobs, {type: 'video/webm'});
                const url = URL.createObjectURL(blob);
                this.value = url
                console.log('Recorded Blobs: ', this.recordedBlobs);
                this.dispatchEvent(new CustomEvent('TANGY_MEDIA_UPDATE', {detail: {value: this}}))
                this.$.gum.classList.remove('recording-active')
                this.$.gum.classList.add('recording-stopped')
                const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
                sleep(500).then(() => {
                    this.shadowRoot.querySelector('#centeredText').style.display = 'none'
                    this.$.record.innerHTML = '<iron-icon icon="camera-enhance"></iron-icon> Record'
                })
            };
            this.mediaRecorder.ondataavailable = this.handleDataAvailable;
            this.mediaRecorder.start();
            console.log('MediaRecorder started', this.mediaRecorder);
        }
    }

    connectedCallback() {
        super.connectedCallback()
        this.shadowRoot.querySelector('#qnum-number').innerHTML = this.hasAttribute('question-number')
            ? `<label>${this.getAttribute('question-number')}</label>`
            : ''
    }

    disconnectedCallback() {
        this.stopMediaTracks(this.currentStream)
    }

    async ready() {
        super.ready();
        this.t = {
            record: t('Record'),
            play: t('Play'),
            save: t('Save'),
            download: t('Download'),
            accept: t('accept'),
            clear: t('clear'),
            saving: t('Saving...')
        }
        this.shadowRoot.querySelector('#label').innerHTML = this.label
        this.errorMsgElement = this.shadowRoot.querySelector('span#errorMsg');
        this.recordedVideo = this.shadowRoot.querySelector('video#recorded');
        this.recordButton = this.shadowRoot.querySelector('paper-button#record');
        this.saveButton = this.shadowRoot.querySelector('paper-button#save');
        this.recordButton.addEventListener('click', () => {
            this.recordButton = this.shadowRoot.querySelector('paper-button#record');
            if (this.recording) {
                this.recording = false;
                this.stopRecording();
                this.enableButtons(["#play"]);
            } else {
                this.startRecording();
            }
        });

        if (this.codec === '') {
            this.codec = 'video/webm;codecs=vp9'
        }
        if (!this.videoWidth) {
            this.videoWidth = 1280
        }
        if (!this.videoHeight) {
            this.videoHeight = 720
        }

        this.playButton = this.shadowRoot.querySelector('paper-button#play');
        this.playButton.addEventListener('click', () => {
            this.recording = false;
            this.$.gum.classList.remove('recording-active')
            this.$.gum.classList.remove('recording-stopped')
            this.shadowRoot.querySelector('#gum').style.display = 'none'
            this.shadowRoot.querySelector('#recorded').style.display = 'block'
            this.$.recorded.classList.add('playback')
            const mimeType = this.codec
            const superBuffer = new Blob(this.recordedBlobs, {type: mimeType});
            this.recordedVideo.src = null;
            this.recordedVideo.srcObject = null;
            this.recordedVideo.src = window.URL.createObjectURL(superBuffer);
            this.recordedVideo.controls = true;
            this.recordedVideo.play();
            this.disableButtons(["#play"]);
            this.enableButtons(["#record"]);
        });
        // this.saveButton.addEventListener('click', () => {
        //     this.saveButton = this.shadowRoot.querySelector('paper-button#save');
        //     this.stopRecording();
        //     this.enableButtons(["#play"]);
        //     this.disableButtons(["#save"]);
        // });
        const constraints = this.getConstraints()
        // console.log('Using media constraints:', constraints);
        await this.init(constraints);
        this.disableButtons(["#play"]);
    }

    reflect() {
        if (!this.ready) return
        // if (this.shadowRoot.querySelector('#photoCaptureImage') && (this.shadowRoot.querySelector('#photoCaptureImage').src === '')) return
        this.shadowRoot.querySelector('#recorded').style.display = 'none'
        // this.shadowRoot.querySelector('#photoCaptureImage').style.display = 'block'
    }

    onHintTextChange(value) {
        this.shadowRoot.querySelector('.hint-text').innerHTML = value
    }

    onInvalidChange(value) {
        this.shadowRoot.querySelector('#error-text').innerHTML = this.invalid
            ? `<iron-icon icon="error"></iron-icon> <div> ${this.hasAttribute('error-text') ? this.getAttribute('error-text') : ''} </div>`
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
        ids.forEach((id) =>
            this.shadowRoot.querySelector(id).setAttribute('disabled', '')
        )
    }

    enableButtons(ids) {
        ids.forEach((id) =>
            this.shadowRoot.querySelector(id).removeAttribute('disabled')
        )
    }

    clearVideo() {
        this.value = null;
        this.shadowRoot.querySelector('#recorded').style.display = 'none'
    }

    getSupportedMimeTypes() {
        const possibleTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264,opus',
            'video/mp4;codecs=h264,aac',
        ];
        return possibleTypes.filter(mimeType => {
            return MediaRecorder.isTypeSupported(mimeType);
        });
    }

    stopRecording() {
        this.shadowRoot.querySelector('#centeredText').style.display = 'block'
        this.mediaRecorder.stop();
    }

    async init(constraints) {
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({...constraints, audio: this.recordAudio});
        } catch (e) {
            let message = `navigator.getUserMedia error: ${e} Constraint:  ${e.constraint} `;
            console.error(message);
            if (e.name === 'OverconstrainedError') {
                constraints = {video: {width: this.videoWidth, height: this.videoHeight}, audio:this.recordAudio}
                stream = await navigator.mediaDevices.getUserMedia({...constraints, audio: this.recordAudio});
                message = `Constraint: the properties for ${e.constraint} will not work for this device; using default settings.`
            }
            this.errorMsgElement.innerHTML = message;
        }

        try {
            this.handleSuccess(stream);
        } catch (e) {
            console.error(`handleSuccess error: ${e} Constraint:  ${e.constraint} `);
            this.errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
        }

    }

    stopMediaTracks(stream) {
        if (stream) {
            stream.getTracks().forEach(track => {
                // stream.removeTrack(track)
                track.stop();
            })
        }
    }

    onDiscrepancyChange(value) {
        this.shadowRoot.querySelector('#discrepancy-text').innerHTML = this.hasDiscrepancy
            ? `<iron-icon icon="flag"></iron-icon> <div> ${this.hasAttribute('discrepancy-text') ? this.getAttribute('discrepancy-text') : ''} </div>`
            : ''
    }

    onWarnChange(value) {
        this.shadowRoot.querySelector('#warn-text').innerHTML = this.hasWarning
            ? `<iron-icon icon="warning"></iron-icon> <div> ${this.hasAttribute('warn-text') ? this.getAttribute('warn-text') : ''} </div>`
            : ''
    }

    onSkippedChange(newValue, oldValue) {
        if (newValue === true) {
            this.value = this.constructor.properties.value.value
        }
    }

}

window.customElements.define(TangyVideoCapture.is, TangyVideoCapture)
