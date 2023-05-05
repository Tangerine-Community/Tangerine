import {LitElement, html} from 'lit';
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
  }

  // validate() {
  //   return !!this.value
  // }

  render() {
    return html`
      <style include="tangy-common-styles"></style>
      <style include="tangy-element-styles"></style>

      <style>
        video {
          display:none
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
      </style>
      <div class="flex-container m-y-25">
        <div id="qnum-number"></div>
        <div id="qnum-content">
          <label id="label"></label>
          <div id="imageDisplay">
            <video width="640" height="480" autoplay id="video"></video>
<!--            <canvas id="canvas" style='display:none'></canvas>-->
            <canvas id="canvas" width="640" height="480"></canvas>
            <img src="${this.value}" style='display:none' id="photoCaptureImage"/>
            <div id="centeredText" class="centered">[[t.saving]]</div>
          </div
          <div id="buttons">
            <paper-button id="capture-button" on-click="capturePhoto"><iron-icon icon="camera-enhance"></iron-icon> [[t.capture]] </paper-button>
            <paper-button id="clear-button" on-click="clearPhoto" disabled><iron-icon icon="delete"></iron-icon> [[t.clear]] </paper-button>
          </div>
          <label class="hint-text"></label>
          <div id="error-text"></div>
          <div id="warn-text"></div>
          <div id="discrepancy-text"></div>
        </div>
      </div>
    `
  }

  firstUpdated() {
    if (this.front) {
      this.front = false
    } else {
      this.front = true
    }
    this.video = this.shadowRoot.querySelector('video');
    this.canvas = this.shadowRoot.querySelector('canvas');
    // const constraints = this.getConstraints()
    this.constraints = {video: { facingMode: { exact: "environment" } }}
    // Get access to the camera using getUserMedia()
    // navigator.mediaDevices.getUserMedia(this.constraints)
    //     .then(stream => {
    //       // let video = this.shadowRoot.querySelector('video');
    //       // Set the video element's source to the camera stream
    //       this.video.srcObject = stream;
    //       this.video.play();
    //       // setInterval(this.processVideo, 0);
    //       setInterval(() => {
    //         this.processVideo()
    //       // }, 1000 / 60); // Capture 60 frames per second
    //       }, 0); // Capture 60 frames per second
    //     })
    //     .catch(error => {
    //       console.error('Error accessing camera:', error);
    //     });
    const onSuccess = (imageData) => {
      const onSuccess = (recognizedText) => {
        //var element = document.getElementById('pp');
        //element.innerHTML=recognizedText.blocks.blocktext;
        //Use above two lines to show recognizedText in html
        console.log(recognizedText);
        // alert(recognizedText.blocks.blocktext);
        const lines = recognizedText.lines.linetext;
        // this.value = JSON.stringify(lines);
        this.dispatchEvent(new CustomEvent('TANGY_SCAN_IMAGE_VALUE', {bubbles: true, composed: true, detail: {value: lines}}));
      }
      const onFail = (message) => {
        alert('Failed because: ' + message);
      }
      mltext.getText(onSuccess, onFail,{imgType : 0, imgSrc : imageData});
      // for imgType Use 0,1,2,3 or 4

    }
    const onFail = (message) =>{
      alert('Failed because: ' + message);
    }
    navigator.camera.getPicture(onSuccess, onFail, { quality: 100, correctOrientation: true });



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
