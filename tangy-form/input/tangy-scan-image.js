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
    this.scannedImage = null;
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
      <div id="imageDisplay">
<!--        <video width="640" height="480" autoplay id="video"></video>-->
        <!--            <canvas id="canvas" style='display:none'></canvas>-->
<!--        <canvas id="canvas" width="640" height="480"></canvas>-->
        <canvas id="canvas"></canvas>
        <!-- <img src="${this.value}" style='display:none' id="photoCaptureImage"/> -->
        <img src="${this.value}" id="scannedImage" />
<!--        <div id="centeredText" class="centered">[[t.saving]]</div>-->
      </div>
      <paper-button id="retake-button" @click="${this.scanImage}"><iron-icon icon="camera-enhance"></iron-icon> ${this.t.retake} </paper-button>
    `
  }

  firstUpdated() {
    if (this.front) {
      this.front = false
    } else {
      this.front = true
    }
    // this.video = this.shadowRoot.querySelector('video');
    this.scannedImage = this.shadowRoot.querySelector('#scannedImage');
    this.canvas = this.shadowRoot.querySelector('canvas');
    this.scanImage();
  }

  scanImage() {
    const onSuccess = (imageData) => {
      const onSuccess = async (recognizedText) => {
        const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
        //var element = document.getElementById('pp');
        //element.innerHTML=recognizedText.blocks.blocktext;
        //Use above two lines to show recognizedText in html
        console.log(recognizedText);
        // alert(recognizedText.blocks.blocktext);
        const linesObject = recognizedText.lines;
        // const baseImage = new Image()
        // baseImage.src = imageData
        // // baseImage.onload = () => sendCanvas(canvas, baseImage);
        // await baseImage.decode();
        // this.canvas.width = baseImage.width;
        // this.canvas.height = baseImage.height;
        const scanResult = {
          linesObject: linesObject,
          imageData:imageData
        }

        // let ctx = this.canvas.getContext('2d');
        // ctx.drawImage(baseImage, 0, 0, baseImage.width, baseImage.height);

        // this.scannedImage.src = imageData;
        // const image = cv.imread(baseImage); // Load the image using OpenCV
        // console.log('image width: ' + image.cols + '\n' +
        //     'image height: ' + image.rows + '\n' +
        //     'image size: ' + image.size().width + '*' + image.size().height + '\n' +
        //     'image depth: ' + image.depth() + '\n' +
        //     'image channels ' + image.channels() + '\n' +
        //     'image type: ' + image.type() + '\n');
        // const cvImageWidth = image.size().width
        // const cvImageHeight = image.size().height
        // // const blockframe = recognizedText.blocks.blockframe
        // const itemframe = recognizedText.lines.lineframe
        // for (let i = 0; i < itemframe.length; i++) {
        //   const item = itemframe[i]
        //   // const [x, y, width, height] = [xCoordinate, yCoordinate, boundingBoxWidth, boundingBoxHeight]; // Extract the coordinates
        //   let [x, y, width, height] = [item.x, item.y, item.width, item.height]; // Extract the coordinates
        //   if (height > image.height) {
        //     console.error("height > image.height: " + height)
        //     height = image.height
        //   }
        //   if (width > image.width) {
        //     console.error("width > image.width: " + width)
        //     width = image.width
        //   }
        //   const X1 = (x / baseImage.width) * cvImageWidth
        //   const Y1 = (y / baseImage.height) * cvImageHeight
        //   const X2 = (width / baseImage.width) * cvImageWidth
        //   const Y2 = (height / baseImage.height) * cvImageHeight
        //   let itemNumber = i+1
        //   console.log("Item: " + itemNumber + " Creating Rect using dimensions: x:" + x + " y: " + y  + " width: " + width + " height: " + height)
        //   // Extract the region of interest from the image
        //   const rect = new cv.Rect(x, y, width, height)
        //   try {
        //     const roi = image.roi(rect);
        //     // Convert the OpenCV image to grayscale for processing
        //     const gray = new cv.Mat();
        //     cv.cvtColor(roi, gray, cv.COLOR_BGR2GRAY);
        //     // Perform image processing and circle detection with OpenCV
        //     const circles = new cv.Mat();
        //     // cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT, 1, 20, 50, 30, 0, 0);
        //     cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT, 1,
        //         gray.rows/16,  // change this value to detect circles with different distances to each other
        //         100, 30, 1, 30 // change the last two parameters
        //         // (min_radius & max_radius) to detect larger circles
        //     );
        //     // cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT, 1, 35, 70, 20, 0, 0);
        //     // Analyze the circle detection results
        //     const hasFilledCircle = circles.size() > 0;
        //
        //     cv.imshow(this.canvas, roi);
        //     await sleep(1000)
        //     // Clean up resources
        //     // roi.delete();
        //     // gray.delete();
        //     // circles.delete();
        //     // Use the 'hasFilledCircle' variable as needed for further processing or display
        //     console.log(hasFilledCircle);
        //   } catch (e) {
        //     console.log("error: " + e)
        //   }
        // }
        this.dispatchEvent(new CustomEvent('TANGY_SCAN_IMAGE_VALUE', {
          bubbles: true,
          composed: true,
          detail: {value: scanResult}
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
    // navigator.camera.getPicture(onSuccess, onFail, {quality: 100, correctOrientation: true});
    navigator.camera.getPicture(onSuccess, onFail, {quality: 100});
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
      // cv.imshow(this.canvas, src);
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
