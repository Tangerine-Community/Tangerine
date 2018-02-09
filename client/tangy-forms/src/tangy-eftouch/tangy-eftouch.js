import {Element} from '../../node_modules/@polymer/polymer/polymer-element.js'
import '../tangy-form/tangy-common-styles.js'
/**
 * `tangy-eftouch`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class TangyEftouch extends Element {
  static get template() {
    return `
      <style include="tangy-common-styles"></style>
        <style>
            :host {
                display: block;
            }
        </style>
        <div>
            <p><b>Click a Picture</b></p>

            <slot></slot>
        </div>
`;
  }

  static get is() {
    return 'tangy-eftouch';
  }

  static get properties() {
    return {
      introSrc: {
        type: String,
        value: ''
      },
      transitionSrc: {
        type: String,
        value: 'forms/acasi/assets/sounds/swish.mp3'
      },
      isPlaying: {
        type: Boolean,
        observer: '_playing'
      },
      name: {
        type: String,
        value: 'Hootie'
      },
      _valid: {
        type: Boolean,
      }
    };
  }

  _playing(newValue, oldValue) {
    console.log("isPlaying changed to " + newValue);
  }

  validate() {
    return Tangy._valid
//          return true;
  }

  // Element class can define custom element reactions
  // @TODO: Duplicating ready?
  connectedCallback() {
    super.connectedCallback();
    if (typeof window.Tangy == 'undefined') {
      window.Tangy =  {}
    }
    Tangy._valid = false;
//          this.name = this.getAttribute("name")

    if (this.introSrc) {
      var isPlaying = Tangy.displaySound && Tangy.displaySound.currentTime > 0 && !Tangy.displaySound.paused && !Tangy.displaySound.ended
        && Tangy.displaySound.readyState > 2;
      if (!isPlaying) {
        Tangy.displaySound = new Audio(this.introSrc);
        Tangy.displaySound.play();
//              this.$['up-fab'].setAttribute('disabled', true)
//              this.$['down-fab'].setAttribute('disabled', true)

        var audioLoop = setInterval(checkAudio, 500);
        function checkAudio() {
          var isPlaying = Tangy.displaySound && Tangy.displaySound.currentTime > 0 && !Tangy.displaySound.paused && !Tangy.displaySound.ended
            && Tangy.displaySound.readyState > 2;
          Tangy._valid = false;
          console.log("isPlaying currentTime: " + Tangy.displaySound.currentTime + " _valid: " + Tangy._valid)
          if (!isPlaying) {
            Tangy._valid = true;
            console.log("isPlaying: " + isPlaying + " _valid: " + Tangy._valid)
            window.clearInterval(audioLoop)
          }
        }
      } else {
        console.log("isPlaying currentTime: " + Tangy.displaySound.currentTime)
        Tangy.isPlaying = true
      }

    }

    // todo: create_valid = false
    // todo: modify validate to return _valid
    // todo: do a setInterval , every second check isPlaying and update _valid.

  }

  ready() {
    super.ready();
  }
}

window.customElements.define(TangyEftouch.is, TangyEftouch);
