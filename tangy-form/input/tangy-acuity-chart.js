import {html, css} from 'lit';
import '../util/html-element-props.js'
import '../style/tangy-common-styles.js'
import '../style/tangy-element-styles.js'
import {TangyInputLitBase} from '../tangy-input-lit-base.js'
import { Coords, VisionChart } from '../util/acuity-chart.js';

/**
 * `tangy-acuity-chart`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class TangyAcuityChart extends TangyInputLitBase {

    static get styles() {
        return [
            css`
              #erase {
                padding: 0.375rem 0.75rem;
              }

              .btn {
                display: inline-block;
                font-weight: 400;
                text-align: center;
                vertical-align: middle;
                user-select: none;
                padding: 0;
                margin: 0.4rem;
                font-family: 'Andika', sans-serif;
                line-height: 1.5;
                border-radius: 0.5rem;
                color: #2a3f55;
                border: 1px solid #ffbf09;
                text-decoration: none;
                box-shadow: 0px 1px 6px 3px #ffaa004d;
                background-color: #ffbf09;
                transition-duration: 0.4s;
                position: relative;
                font-size: 2rem;
                width: 12rem;
              }

              .btn:after {
                content: "";
                display: block;
                position: absolute;
                border-radius: 4em;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                transition: all 0.5s;
                box-shadow: 0 0 10px 40px #ffaa004d;
              }

              .btn:active:after {
                box-shadow: 0 0 0 0 #ffaa004d;
                position: absolute;
                border-radius: 4em;
                left: 0;
                top: 0;
                opacity: 1;
                transition: 0s;
              }

              #qnum-content {
                width: 80vw;
                /*height: 90vh;*/
                display: flex;
                flex-direction: column;
              }

              .keys {
                margin-left: -5vw;
                margin-right: -5vw;
                text-align: center;
                display: block;
              }

              #input-container {
                background-color: #fff;
                border-radius: 1rem;
                padding: 4rem 1.2rem;
                font-size: 4rem;
                font-weight: 700;
                text-align: center;
                flex-grow: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                text-transform: lowercase;
                margin-top: 1rem;
                margin-bottom: 1rem;
                letter-spacing: .4rem;
                position: relative;
                min-height: 1.5em;
              }

              #erase {
                position: absolute;
                right: 1rem;
                top: 1rem;
              }

              .flex-container {
                /* min-height: 100vh; */
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: 'Andika', sans-serif;
                font-size: 1.3rem;
                font-weight: 400;
                line-height: 1.5;
                margin: 0;
                color: #212121;
                background-size: cover;
                background-attachment: fixed;
                background-repeat: no-repeat;
              }

              #bottom-spacer {
                height: var(--bottom-spacer-height);
              }

              @keyframes highlight {
                0% {
                  background: yellow
                }
                100% {
                  background: none;
                }
              }

              .highlight {
                animation: highlight 1s;
              }

              #error-text {
                color: red;
                font-size: smaller;
                text-transform: none;
                letter-spacing: normal;
              }
            `
        ]
    }

    render() {
        return html`
            <style include="tangy-common-styles"></style>
            <style include="tangy-element-styles"></style>
            <style>
                :host {
                    --tangy-element-border: 0;
                }
            </style>
            <div class="flex-container">
                ${this.questionNumber ? html`
                    <div id="qnum-number">
                        <label>${this.questionNumber}</label>
                    </div>
                ` : ''}
                <div id="qnum-content">
                    <label>${this.label}</label>
                    <div id="configuration">
                        <div>
                            <label>Pixels per Inch:</label>
                            <input id="inputPixelsPerInch" type="number"></input>
                        </div>


<!--                        <div>-->
<!--                            <label>Chart Size in Inches:</label>-->
                            <input type="hidden" id="inputChartSizeInInchesX" type="number" value="5"></input>
<!--                            <label>x</label>-->
                            <input type="hidden" id="inputChartSizeInInchesY" type="number" value="2"></input>
<!--                        </div>-->

<!--                        <div>-->
<!--                            <label>Size of Top Line in Inches:</label>-->
<!--                            <input id="inputTopLineSizeInInches" type="number" value="1"></input>-->
                            <input type="hidden" id="inputTopLineSizeInInches" type="number" value="1"></input>
<!--                        </div>-->

<!--                        <div>-->
<!--                            <label>Number of Lines:</label>-->
<!--                            <input id="inputNumberOfLines" type="number" value="8"></input>-->
<!--                        </div>-->

<!--                        <div>-->
<!--                            <label>sequenceNumber:</label>-->
<!--                            <input id="sequenceNumber" type="number" value="1"></input>-->
<!--                        </div>-->
                    </div>

                    <div id="divOutput"></div>
<!--                    <button class="btn" @click="${() => this.generateDiagram()}">Next</button>-->
                    ${this.hintText ? html`}
                    <div id="hint-text" class="hint-text">${this.hintText}</div>
                    ` : ''}
                    ${this.invalid ? html`
                        <div id="error-text">
                            <iron-icon icon="error" class="larger"></iron-icon>
                            <div> ${this.hasAttribute('error-text') ? this.getAttribute('error-text') : ''}</div>
                        </div>
                    ` : ''}
                    ${this.hasWarning ? html`
                        <div id="warn-text"></div>
                        <iron-icon icon="warning"></iron-icon>
                        <div> ${this.warnText || ''}</div>
                    ` : ''}
                    ${this.hasDiscrepancy ? html`
                        <div id="discrepancy-text">
                            <iron-icon icon="flag"></iron-icon>
                            <div> ${this.discrepancyText || ''}</div>
                        </div>
                    ` : ''}
                </div>
                <div id="bottom-spacer"></div>
            </div>
            </div>
            </div>
        `
    }

    constructor() {
        super()
        this.value = ''
    }

    static get is() {
        return 'tangy-acuity-chart'
    }

    static get properties() {
        return {
            name: {
                type: String,
                value: '',
                reflectToAttribute: true
            },
            questionNumber: {
                type: String,
                value: '',
                reflectToAttribute: true
            },
            label: {
                type: String,
                value: '',
                observer: 'applyLabel',
                reflectToAttribute: true
            },
            required: {
                type: Boolean,
                value: false,
                observer: 'onRequiredChange',
                reflectToAttribute: true
            },
            disabled: {
                type: Boolean,
                value: false,
                observer: 'onDisabledChange',
                reflectToAttribute: true
            },
            invalid: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            hintText: {
                type: String,
                value: '',
                reflectToAttribute: true
            },
            hasWarning: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            hasDiscrepancy: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            incomplete: {
                type: Boolean,
                value: true,
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
                reflectToAttribute: true
            },
            value: {
                type: String,
                value: '',
                reflectToAttribute: true
            },
            errorText: {
                type: String,
                value: '',
                reflectToAttribute: true
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
            sequenceNumber: {
                type: Number,
                value: 1,
                reflectToAttribute: true
            },
            numberOfSequences: {
                type: Number,
                value: 8,
                reflectToAttribute: true
            },
            calcPpi: {
                type: Number,
                value: undefined,
                reflectToAttribute: true
            }
        }
    }

    connectedCallback() {
        super.connectedCallback()
        this.calcPpi = this.calcScreenDPI()
    }

    firstUpdated(changedProperties) {

        const calcPpiElement =
            this.shadowRoot.getElementById("inputPixelsPerInch");
        calcPpiElement.value = this.calcPpi;
        this.generateDiagram()
    }

    generateDiagram() {
        const inputPixelsPerInch =
            this.shadowRoot.getElementById("inputPixelsPerInch");
        const pixelsPerInchAsString = inputPixelsPerInch.value;
        const pixelsPerInch = parseInt(pixelsPerInchAsString);

        const inputChartSizeInInchesX =
            this.shadowRoot.getElementById("inputChartSizeInInchesX");
        const inputChartSizeInInchesY =
            this.shadowRoot.getElementById("inputChartSizeInInchesY");

        const chartSizeInInches = new Coords
        (
            parseFloat(inputChartSizeInInchesX.value),
            parseFloat(inputChartSizeInInchesY.value)
        );

        const inputTopLineSizeInInches =
            this.shadowRoot.getElementById("inputTopLineSizeInInches");
        const topLineSizeInInchesAsString =
            inputTopLineSizeInInches.value;
        const topLineSizeInInches =
            parseFloat(topLineSizeInInchesAsString);

        // const inputNumberOfLines =
        //     this.shadowRoot.getElementById("inputNumberOfLines");
        // const numberOfLinesAsString =
        //     inputNumberOfLines.value;
        const numberOfLinesAsString = this.numberOfSequences
        const numberOfLines =
            parseInt(numberOfLinesAsString);

        // const sequenceNumber = parseInt(this.shadowRoot.getElementById("sequenceNumber").value);

        const visionChart = new VisionChart
        (
            pixelsPerInch,
            chartSizeInInches,
            topLineSizeInInches,
            numberOfLines
        );

        const visionChartAsCanvas = visionChart.toCanvas(this.sequenceNumber);

        const divOutput = this.shadowRoot.getElementById("divOutput");
        divOutput.innerHTML = "";
        divOutput.appendChild(visionChartAsCanvas);
    }

    calcScreenDPI() {
        // Create a "1 inch" element to measure
        const el = document.createElement('div');
        el.style.width = '1in';

        // It has to be appended to measure it
        document.body.appendChild(el);

        // Get it's (DOM-relative) pixel width, multiplied by
        // the device pixel ratio
        const dpi = el.offsetWidth * devicePixelRatio;

        // remove the measurement element
        el.remove();
        console.log("dpi: " + dpi);
        return dpi;
    }


    onKeyClick(character) {
        this.value += character
        this.shadowRoot.querySelector('#inputValue').classList.add('highlight');
        const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
        sleep(500).then(() => {
            this.shadowRoot.querySelector('#inputValue').classList.remove('highlight');
        })
    }

    onErasureKeyClick() {
        this.value = this.value.slice(0, -1)
    }

    applyLabel(label) {
        this.$.checkbox.children['checkbox-text'].innerHTML = this.label
    }

    onDisabledChange(value) {
        if (value === false) {
            this.$.keyboard.removeAttribute('disabled')
        } else {
            this.$.keyboard.setAttribute('disabled', 'true')
        }
    }

    validate() {
        if (this.required === true &&
            this.value === '') {
            this.invalid = true
            return false
        } else {
            this.invalid = false
            return true
        }
    }

}

window.customElements.define(TangyAcuityChart.is, TangyAcuityChart)
