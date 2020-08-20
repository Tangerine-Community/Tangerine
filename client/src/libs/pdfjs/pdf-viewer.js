/**
`pdf-viewer`
a pdf viewer component

![](demo.gif)

@hero demo.gif
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js'

import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js'
import '@polymer/paper-spinner/paper-spinner.js'
import '@polymer/paper-toast/paper-toast.js'
import '@polymer/paper-button/paper-button.js'
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js'
import 'pdfjs-dist/build/pdf.min.js'
import { html } from '@polymer/polymer/lib/utils/html-tag.js'
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js'
/* global pdfjsLib */
/**
 * `pdf-viewer`
 *
 * The component wrap the [PDFJS](https://github.com/mozilla/pdf.js) library.
 *
 * @customElement
 * @polymer
 * @demo demo/mobile.html
 */
class PdfViewer extends mixinBehaviors([IronResizableBehavior, GestureEventListeners], PolymerElement) {
  static get template() {
    return html`
    <style>
      :host {
        position: relative;
        display: flex;
        background: var(--dark-theme-background-color, dimgray);
        flex-direction: column;
        overflow: hidden;
      }

      .container {
        flex: 1;
        overflow: hidden;
        position: relative;
      }

      canvas {
        display: block;
        margin: 0;
      }

      canvas:first-of-type {
        border-right: 1px solid lightgray;
      }

      paper-spinner {
        position: absolute;
        width: 100px;
        height: 100px;
        top: calc( 50% - 50px);
        left: calc( 50% - 50px);
      }

      .viewer {
        display: inline-flex;
        box-sizing: border-box;
      }

      [hidden] {
        display: none;
      }

      .yellow-btn {
        text-transform: none;
        color: #eeff41;
      }

    </style>
    <div class="container" id="container" on-track="_handleTrack">
      <div id="viewer" class="viewer">
        <canvas id="viewer1" width="0" height="0"></canvas>
        <canvas id="viewer2" width="0" height="0"></canvas>
      </div>
      <paper-spinner id="spinner"></paper-spinner>
    </div>
    <paper-toast id="errorDlg" duration="0" text="[[errorMessage]]">
      <paper-button on-tap="_closeDlg" class="yellow-btn">[[errorBtnLabel]]</paper-button>
    </paper-toast>
`
  }

  static get is() {
    return 'pdf-viewer'
  }

  static get properties() {
    return {
      /**
      * Path to the PDFJS worker script
      *
      * If for some reasons, pdfjs is installed in another folder than this package's,
      * be aware to update this attribute to the full path of the `pdf.worker.min.js` file.
      */
      workerSrc: {
        type: String,
        value: () => {
          return './libs/pdfjs/pdf.worker.min.js'
        },
      },

      /**
       * url of the pdf file to display
       * @type {String}
       */
      src: {
        type: String,
        value: '',
        observer: '_srcChanged',
      },

      /**
       * The page number to display
       *
       * The first page is 1
       * @type {Number}
       */
      page: {
        type: Number,
        reflectToAttribute: true,
        notify: true,
        observer: '_pageChanged',
      },

      /**
       * total number of pages in the document
       * @type {Number}
       */
      pages: {
        type: Number,
        readOnly: true,
        reflectToAttribute: true,
        notify: true,
      },

      /**
       * the initial zoom when opening a document and
       * when the mode change
       *
       * the available values are :
       *  - __fit__ : whole page,
       *  - __fit-width__ : full width
       *
       * @type {String}
       */
      initialZoom: {
        type: String,
        value: 'fit',
      },

      /**
       * The zoom ratio used
       * @type {Numder}
       */
      zoomRatio: {
        type: Number,
        value: 1.25,
      },

      /**
       * The view mode of the document
       *
       * the available values are :
       *  - __single__ : single page
       *  - __double__ : double page side by side
       *
       * @type {String}
       */
      mode: {
        type: String,
        value: 'single',
        observer: '_modeChanged',
      },

      /**
       * import error message for translation
       */
      errorMessage: {
        type: String,
        value: 'Error loading the pdf file',
      },

      errorBtnLabel: {
        type: String,
        value: 'Close',
      },

      _views: {
        type: Number,
        value: 1,
      },

      /**
       * Internal PDF object
       */
      _PDF: {
        type: Object,
        value: () => {
          return {}
        },
      },
      _pageRendering: {
        type: Boolean,
        value: false,
      },
      _pageNumPending: {
        type: Number,
        value: null,
      },

      /**
       * indicates if the first rending has been done
       */
      _firstRender: {
        type: Boolean,
        value: false,
      },

      _pos: {
        type: Object,
        value: () => ({ x: 0, y: 0 }),
      },

      _zoom: {
        type: Number,
        value: 1,
      },

      _loaded: {
        type: Boolean,
        value: false,
      },
    }
  }

  constructor() {
    super()
    this.PDFJS = pdfjsLib
    this.PDFJS.GlobalWorkerOptions.workerSrc = this.getAttribute('worker-src')
  }

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('iron-resize', this._recenter)
  }

  /**
   * @event pdf-viewer-error Fired when the download of the pdf failed.
   * @param {string} src the source string of the pdf.
   */
  _showError(src) {
    this.$.errorDlg.fitInto = this.$.container
    this.$.errorDlg.open()
    this.$.spinner.active = false
    this.dispatchEvent(new CustomEvent('pdf-viewer-error', { detail: { src: src } }))
  }

  _clearView(view) {
    const context = view.getContext('2d')
    context.clearRect(0, 0, view.width, view.height)
  }

  /**
   * @event pdf-viewer-loaded Fired when the download of the pdf succeed.
   * @param {string} src the source string of the pdf.
   */
  _srcChanged(newValue, oldValue) {
    if (this.$.errorDlg.opened) {
      this.$.errorDlg.close()
    }
    if (!newValue || newValue === oldValue) return
    this._loaded = false
    this._setPages(null)

    this.$.viewer2.hidden = true
    this.$.viewer1.hidden = true
    this._clearView(this.$.viewer1)
    this._clearView(this.$.viewer2)
    this.$.spinner.active = true
    this.firstRender = false
    let src = newValue

    if (!navigator.onLine) {
      this._showError(src)
      return
    }

    this.PDFJS.getDocument(src)
      .then(pdf => {
        if (src !== this.src) {
          // fake cancel
          return
        }
        this._loaded = true
        this._setPages(pdf.numPages)
        if (this.page > pdf.numPages) this.page = pdf.numPages
        if (this.page < 0) this.page = 1
        if (!this.page) this.page = 1
        this.dispatchEvent(new CustomEvent('pdf-viewer-loaded', {
          detail: { src: src },
        }))
        this._PDF = pdf
        switch (this.initialZoom) {
          case 'fit-width':
            this.fitWidth()
            break
          default:
            this.fit()
        }
      })
      .catch(e => {
        this._showError(src)
      })
  }

  _closeDlg() {
    this.$.errorDlg.close()
  }

  _pageChanged(newValue, oldValue) {
    if (!newValue && newValue !== 0) return
    if (!this._loaded) return
    if (newValue > this.pages) this.page = this.pages
    if (newValue < 1) this.page = 1
    if (this._PDF.pdfInfo) this._drawPage()
  }

  _modeChanged(newValue, oldValue) {
    switch (this.mode) {
      case 'double':
        this._views = 2
        this.$.viewer2.hidden = false
        break
      default:
        this._views = 1
        this.$.viewer2.hidden = true
    }
    if (this._firstRender) {
      this._recenter()
      switch (this.initialZoom) {
        case 'fit-width':
          this.fitWidth()
          break
        default:
          this.fit()
      }
    }
  }

  /**
   * @event pdf-viewer-outrange Fired when trying to render a non existing page.
   */

  /**
   * move to the next page
   */
  next() {
    if (this.page < this.pages) {
      this.page += this._views
      if (this.page > this.pages) this.page = this.pages
    } else {
      const event = new CustomEvent('pdf-viewer-outrange')
      this.dispatchEvent(event)
    }
  }

  /**
   * move to the previous page
   */
  previous() {
    if (this.page > 1) {
      this.page -= this._views
      if (this.page === 0) this.page = 1
    } else {
      const event = new CustomEvent('pdf-viewer-outrange')
      this.dispatchEvent(event)
    }
  }

  /**
   * display the document full width
   */
  fitWidth() {
    this._PDF.getPage(this.page)
      .then(page => {
        let viewport = page.getViewport(1)
        let rect = this.$.container.getBoundingClientRect()
        const zoom = (rect.width - 20) / (this._views * viewport.width)
        if (zoom === this._zoom) { return Promise.resolve() }
        this._zoom = zoom
        this._drawPage()
      })
  }

  /**
   * display the whole page
   */
  fit() {
    const pageNum = this.page || 1
    this._PDF.getPage(pageNum)
      .then(page => {
        let viewport = page.getViewport(1)
        let rect = this.$.container.getBoundingClientRect()
        const zoom = Math.min((rect.width - 20) / (this._views * viewport.width), (rect.height - 20) / viewport.height)
        if (zoom === this._zoom) { return Promise.resolve() }
        this._zoom = zoom
        this.page = pageNum
        this._drawPage()
      })
  }

  /**
   * zoom in
   */
  zoomin() {
    this._zoom = this._zoom * this.zoomRatio
    this._drawPage()
  }

  /**
   * zoom out
   */
  zoomout() {
    this._zoom = this._zoom / this.zoomRatio
    this._drawPage()
  }

  _renderView(view, pg) {
    if (!this._loaded) return

    return new Promise((resolve, reject) => {
      this._PDF.getPage(pg)
        .then(page => {
          const viewport = page.getViewport(this._zoom)
          view.width = viewport.width
          view.height = viewport.height
          const context = view.getContext('2d')
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          }
          resolve(page.render(renderContext))
        })
        .catch((e) => {
          const context = view.getContext('2d')
          context.clearRect(0, 0, view.width, view.height)
          resolve()
        })
    })
  }

  /**
   * @event pdf-viewer-render Fired when a page have been rendered.
   * @param {string} page the endered page number.
   */
  _drawPage(pg) {
    if (!this._loaded) return
    if (!pg || isNaN(pg)) pg = this.page
    if (this._pageRendering) {
      this._pageNumPending = pg
      return
    }
    this._pageRendering = true
    this.$.spinner.active = true
    const promises = []
    if (this.mode === 'single') {
      this.$.viewer1.hidden = false
      promises.push(this._renderView(this.$.viewer1, pg))
    } else {
      this.$.viewer2.hidden = false
      this.$.viewer1.hidden = false
      promises.push(this._renderView(this.$.viewer1, pg - pg % 2))
      promises.push(this._renderView(this.$.viewer2, pg - pg % 2 + 1))
    }
    Promise.all(promises)
      .then(() => {
        this._firstRender = true
        this._pageRendering = false
        this.$.spinner.active = false
        this._recenter()
        if (this._pageNumPending !== null) {
          // New page rendering is pending
          this._drawPage(this._pageNumPending)
          this._pageNumPending = null
        }
      })
      .then(() => {
        const event = new CustomEvent('pdf-viewer-render', { detail: { page: this.page } })
        this.dispatchEvent(event)
      })
  }

  _handleTrack(evt) {
    let tmp
    let getDiff = (evt) => {
      return {
        x: this._trackPos.x - evt.detail.x,
        y: this._trackPos.y - evt.detail.y,
      }
    }
    switch (evt.detail.state) {
      case 'start':
        this._trackPos = {
          x: evt.detail.x,
          y: evt.detail.y,
        }
        break
      case 'track':
        tmp = getDiff(evt)
        this.$.viewer.style.transform = `translateX(${this._pos.x - tmp.x}px) translateY(${this._pos.y - tmp.y}px)`
        break
      case 'end':
        tmp = getDiff(evt)
        this._pos.x = this._pos.x - tmp.x
        this._pos.y = this._pos.y - tmp.y
        this._recenter()
        break
    }
  }

  _recenter() {
    const rect = this.$.container.getBoundingClientRect()
    const viewerRect = this.$.viewer.getBoundingClientRect()
    if (rect.width > viewerRect.width) {
      this._pos.x = (rect.width - viewerRect.width) / 2
    }
    if (rect.height > viewerRect.height) {
      this._pos.y = (rect.height - viewerRect.height) / 2
    }
    if (rect.width < viewerRect.width && rect.width > viewerRect.width + this._pos.x + 50) {
      this._pos.x = rect.width - 50 - viewerRect.width
    }
    if (rect.width < viewerRect.width && this._pos.x > 50) {
      this._pos.x = 50
    }
    if (rect.height < viewerRect.height && rect.height > viewerRect.height + this._pos.y + 50) {
      this._pos.y = rect.height - 50 - viewerRect.height
    }
    if (rect.height < viewerRect.height && this._pos.y > 50) {
      this._pos.y = 50
    }
    this.$.viewer.style.transform = `translateX(${this._pos.x}px) translateY(${this._pos.y}px)`
  }
}

window.customElements.define(PdfViewer.is, PdfViewer)
