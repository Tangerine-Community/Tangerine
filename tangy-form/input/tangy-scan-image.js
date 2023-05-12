import {LitElement, html} from 'lit';
import {t} from "../util/t.js";
// import {cv} from "@techstark/opencv-js";
// import * as cv from "@techstark/opencv-js"

class TangyScanImage extends LitElement {

  static get properties() {
    return { 
      name: { type: String },
      value: { type: String },
      inProgress: { type: String },
      success: { type: String },
      invisible: { type: Boolean },
      canvas: { type: Object },
      context: { type: Object },
      inputs: { type: Object },
    }
  }

  constructor() {
    super()
    this.invisible = false
  }

  async connectedCallback() {
    super.connectedCallback()
    console.log("connected...")
    this.video = null;
    this.canvas = null;
    this.context = null;
    this.t = {
      capture: t('capture'),
      retake: t('retake'),
      accept: t('accept'),
      clear: t('clear'),
      saving: t('Saving...')
    }
  }

  // validate() {
  //   return !!this.value
  // }

  render() {
    return html`
      <style include="tangy-common-styles"></style>
      <style include="tangy-element-styles"></style>

      <style>

        paper-button {
          background-color: var(--accent-color, #CCC);
        }

      </style>
      <paper-button id="retake-button" @click="${this.scanImage}"><iron-icon icon="camera-enhance"></iron-icon> ${this.t.retake} </paper-button>
    `
  }

  firstUpdated() {
    if (this.front) {
      this.front = false
    } else {
      this.front = true
    }
    this.scanImage();
  }

  scanImage() {
    const onSuccess = (imageData) => {
      const onSuccess = (recognizedText) => {
        //var element = document.getElementById('pp');
        //element.innerHTML=recognizedText.blocks.blocktext;
        //Use above two lines to show recognizedText in html
        console.log(recognizedText);
        // alert(recognizedText.blocks.blocktext);
        const lines = recognizedText.lines.linetext;
        // this.value = JSON.stringify(lines);
        this.dispatchEvent(new CustomEvent('TANGY_SCAN_IMAGE_VALUE', {
          bubbles: true,
          composed: true,
          detail: {value: lines}
        }));
      }
      const onFail = (message) => {
        alert('Failed because: ' + message);
      }
      mltext.getText(onSuccess, onFail, {imgType: 0, imgSrc: imageData});
      // for imgType Use 0,1,2,3 or 4
    }
    const onFail = (message) => {
      alert('Failed because: ' + message);
    }
    navigator.camera.getPicture(onSuccess, onFail, {quality: 100, correctOrientation: true});
  }


  processVideo() {
    // const video = this.shadowRoot.querySelector('video');
    let src = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC4);
    let gray = new cv.Mat();
    let circles = new cv.Mat();


    let cap = new cv.VideoCapture(this.video);
    // cap.open(0);
    setInterval(() => {
      cap.read(src);
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.medianBlur(gray, gray, 5);
      // Imgproc.HoughCircles(input, circles, Imgproc.CV_HOUGH_GRADIENT, 2, 100, 100, 90, 0, 1000);
      // const minDist = gray.rows/16
      const minDist = 10
      // cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT, 1,
      //     minDist,  // change this value to detect circles with different distances to each other
      //     100, 90, 1, 30 // change the last two parameters
      //     // (min_radius & max_radius) to detect larger circles
      // );
      cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT, 1,
          gray.rows/16,  // change this value to detect circles with different distances to each other
          100, 30, 1, 30 // change the last two parameters
          // (min_radius & max_radius) to detect larger circles
      );
      // console.log("circles.cols: " + circles.cols + " circles.rows: " + circles.rows)
      for( let i = 0; i < circles.cols; i++ )
      {
        let c = circles.data32F;
        let x = c[i*3];
        let y = c[i*3+1];
        let radius = c[i*3+2];
        let center = new cv.Point(x, y);
        // circle center
        cv.circle( src, center, 1, [0,100,100,255], 3, cv.LINE_AA);
        // circle outline
        cv.circle( src, center, radius, [255,0,255,255], 3, cv.LINE_AA);
        // console.log("BOOOP circles.cols: " + circles.cols + " circles.rows: " + circles.rows)
        // console.log("radius: " + radius + " center: " + JSON.stringify(center))
      }
      cv.imshow(this.canvas, src);
    }, 1000/30);
  }

  getConstraints() {
    if (this.front) {
      return {video: { facingMode: { exact: "user" } }}
    } else {
      return {video: { facingMode: { exact: "environment" } }}
    }
  }
}

// Register your element to custom elements registry, pass it a tag name and your class definition
// The element name must always contain at least one dash
customElements.define('tangy-scan-image', TangyScanImage);
