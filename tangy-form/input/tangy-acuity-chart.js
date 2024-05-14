import {html, css} from 'lit';
import '../util/html-element-props.js'
import '../style/tangy-common-styles.js'
import '../style/tangy-element-styles.js'
import {TangyInputLitBase} from '../tangy-input-lit-base.js'
import {ConfigWolfChart} from '../util/acuity-config-wolf-chart.js';
import {ConfigBarSetting} from  '../util/acuity-config-bar-setting.js';
import '../util/jquery-3.7.1.min.js'

/**
 * `tangy-acuity-chart`
 *
 * Many thanks to the WolfChart project, from which most of this code was taken.
 * https://github.com/ballantynedewolf/WolfChart
 *
 * First time this is run in the browser, the configuration needs to be set.
 * Optotype: LandoltC
 * Notation: Feet
 * Distance: 3000
 * Length of line below*: 100
 * Sort: Largest to smallest
 * Mirrored / Direct: Mirrored
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
                width: 100%;
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
                justify-content: left;
                align-items: left;
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





              
              
              
              .old_ie  .setting-bar,
              .old_ie  .guide-section,
              .old_ie .setting-button {
                display: none;
              }
              .IENotice {
                display: none;
              }

              .old_ie .IENotice {
                display: block!important;
                width: 100%;
                height: 100%;
              }
              .old_ie .IENotice .modal{
                display: block!important;
                text-align: center;
                background: white;
                padding: 20px ;
                color: #000;
                margin: 10% auto 0;
                font-size: 20px;
              }

              * {
                margin: 0;
                box-sizing: border-box;
                padding: 0;
              }

              a {
                color: #337ab7;
                text-decoration: none;
              }

              a:active, a:hover {
                color: #337ab7;
                text-decoration: underline;
              }

              html {
                height: -webkit-fill-available;
              }
              //body {
              //  font-family: Helvetica, Arial, San serif;
              //  font-size: 16px;
              //  color: #666666;
              //  line-height: 1.2;
              //  overflow: hidden;
              //  /*mobile viewport fix*/
              //  min-height: -webkit-fill-available;
              //  min-height: 100vh;
              //
              //}

              .setting-bar {
                right: 0;
                width: 500px;
                -webkit-transition: all 0.3s linear;
                transition: all 0.3s linear;
                position: fixed;
                top: 0;
                border: 1px solid rgba(0,0,0,0.20);
                height: 100%;
                background: #F4F4F4;
                box-shadow: -2px 0 4px rgba(0,0,0,0.30);
                padding: 30px 20px;
                overflow-y: auto;
                -webkit-transform: translateX(560px);
                transform: translateX(560px);
                z-index: 19;
              }

              .mask {
                opacity: 0;
                visibility: hidden;
                position: fixed;
                width: 100%;
                height: 100%;
                z-index: 8;
                background: rgba(0,0,0,0.6);
                left: 0;
                top: 0;
                -webkit-transition: all 0.3s linear;
                transition: all 0.3s linear;
                pointer-events: none;
              }

              .active.mask {
                opacity: 1;
                visibility: visible;
              }

              .setting-bar.active {
                -webkit-transform: translateX(0);
                transform: translateX(0);
              }

              .guide-section {
                right: 0;
                -webkit-transition: all 0.3s linear;
                transition: all 0.3s linear;
                position: fixed;
                top: 0;
                height: 100%;
                z-index: 10;
                background: #fff;
                box-shadow: -2px 0 4px rgba(0,0,0,0.30);
                padding: 30px;
                overflow-y: auto;
                width: calc(100vw - 560px - 50px);
                -webkit-transform: translateX(100vw);
                transform: translateX(100vw);
              }

              .guide-section.active {
                -webkit-transform: translateX(-538px);
                transform: translateX(-538px);
              }

              .form-control {
                height: 38px;
                font-size: 16px;
                border-radius: 5px;
                border: 1px solid #DBDBDB;
                display: inline-block;
                vertical-align: middle;
                width: 100%;
                padding: 5px 10px;
                font-family: Helvetica, Arial, San serif;
                font-size: 16px;
                color: #666666;
                background: white;
              }

              .form-control:focus, .form-control:active {
                outline: none;
              }

              .form-group label {
                display: table-cell;
                padding-left: 20px;
              }

              .filter-hue {
                background: hsl(0,0%,85%);
                padding: 25px 0 10px 0;
                margin-bottom: 20px;
                border-radius: 10px;
              }
              .col-1 {
                display: table-cell;
                min-width: 343px;
              }
              .col-2 {
                display: table-cell;
                min-width: 190px;
              }
              .col-4 {
                display: table-cell;
                min-width: 120px;
              }
              .col-8 {
                display: table-cell;
                width: 308px;
              }
              .col-12 {
                display: table-cell;
                width: 103px;
              }

              .form-control + .unit {
                margin-left: 5px;
              }

              /* .red {
                  color: #D30000;
                  font-size: 12px;
              } */

              .form-group {
                display: table;
                margin: 0 0 20px 0;
              }

              .input-sm {
                width: 90px;
              }

              .input-med {
                width: 210px;
              }
              .fg-divider {
                margin:10px 5px 20px 5px;
              }
              .select-box {
                position: relative;
              }

              .keyboard {
                margin-right: 5px;
              }

              .select-box:after {
                content: "";
                border: 1px solid #666;
                border-top: none;
                border-right: none;
                display: block;
                height: 10px;
                position: absolute;
                right: 15px;
                top: 10px;
                -webkit-transform: rotate(-45deg);
                transform: rotate(-45deg);
                width: 10px;
                pointer-events: none;
              }

              legend, h2 {
                font-size: 32px;
                padding: 0 0 20px 0;
              }

              fieldset {
                border: none;
                border-top: 1px solid #979797;
                padding-top: 40px;
                position: relative;
              }

              fieldset .title {
                position: absolute;
                right: 0;
                color: white;
                text-transform: uppercase;
                top: 0;
                text-align: center;
              }

              fieldset .title span {
                background: #666;
                display: block;
                float: left;
                width: 134px;
                font-size: 13px;
                height: 22px;
                line-height: 24px;
              }

              fieldset .title a {
                background: #999999;
                height: 22px;
                margin-right: 2px;
                width: 22px;
                display: block;
                float: left;
                color: #fff;
                line-height: 24px;
                text-decoration: none;
              }

              select {
                -moz-appearance: none;
                -webkit-appearance: none;
                appearance: none;
              }

              fieldset.footer-fieldset {
                padding-top: 30px;
              }


              .close, .close-guide {
                position: absolute;
                right: 30px;
                top: 35px;
              }

              .btn {
                padding: 10px 12px;
                background: #F4F4F4;
                border-radius: 5px;
                border: 1px solid #979797;
                font-size: 15px;
                text-align: center;
                color: #666666;
                cursor: pointer;
                min-width: 150px;
              }

              .btn:hover {
                opacity: 0.8;
              }

              .btn + .btn {
                margin-left: 5px;
              }

              .action-button {
                text-align: left;
                margin-bottom: 30px;
              }

              .col-setting {
                position: relative;
              }

              .col-setting i {
                width: 30px;
                height: 30px;
                border-radius: 4px;
                border:solid 1px gray;
                position: absolute;
                top: 10%;
                left: 165px;
              }

              .slider {
                appearance: none;
                -webkit-appearance: none;
                position: absolute;
                left: 40%;
                width: 55%;
                height: 10px;
                border-radius: 5px;
                outline: none;
                opacity: 0.7;
                -webkit-transition: .2s;
                transition: opacity .2s;
              }

              .red-slide {
                background: hsl(0,80%,60%);
              }

              .green-slide {
                background: hsl(160,80%,60%);
              }

              .slider:hover {
                opacity: 1;
              }

              .slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 15px;
                height: 15px;
                border-radius: 50%;
                border: solid 2px rgba(50,50,50,1);
                background: rgba(100,100,100,0.5);
                cursor: pointer;
              }

              .slider::-moz-range-thumb {
                width: 15px;
                height: 15px;
                border-radius: 50%;
                border: solid 2px rgba(50,50,50,1);
                background: rgba(100,100,100,0.5);
                cursor: pointer;
              }

              @media screen and (-webkit-min-device-pixel-ratio:0) {
                .action-button {
                  margin: 0;
                }
              }

              .btn-primary {
                border-color: #2d689d;
              }

              .btn-tiny {
                padding: 6px 6px;
                border-radius: 4px;
                border: 1px solid #979797;
                font-size: 15px;
                color: #666666;
                cursor: pointer;
                min-width: 50px;
              }

              .btn[disabled] {
                cursor: not-allowed;
                opacity: 0.3;
              }


              /*accordion*/
              .panel-title a {
                display: block;
                padding: 10px;
                background: #666666;
                color: white;
                text-decoration: none;
                font-size: 16px;
                position: relative;
                font-weight: normal;
              }

              .panel-title a:after {
                width: 0;
                content: "";
                height: 0;
                border-style: solid;
                border-width: 9px 7px 0 7px;
                border-color: #ffffff transparent transparent transparent;
                position: absolute;
                display: block;
                right: 10px;
                top: 50%;
                -webkit-transform: translateY(-50%);
                transform: translateY(-50%);
              }

              .collapse {
                display: none;
              }

              .panel {
                margin-bottom: 2px;
              }

              .panel-heading.active .panel-title a:after {
                -webkit-transform: translateY(-50%) rotate(180deg);
                transform: translateY(-50%) rotate(180deg);
              }

              .panel-collapse {
                padding: 10px;
              }

              .scoreBox {
                font: bold 5.5mm helvetica,arial, sans-serif;
                position: absolute;
                width: 80px;
                top: 0%;
                transform: translateY(-50%);
                margin-top: 0 !important;
                background: #d8d8d8;
                border-radius: 5px;
                color: #000;
                padding: 3px 3px;
                transition: all 0.1s linear;
                border: 1px solid transparent;
                left: -15px;
                cursor: pointer;
                -webkit-touch-callout: none; /* iOS Safari */
                -webkit-user-select: none; /* Safari */
                -khtml-user-select: none; /* Konqueror HTML */
                -moz-user-select: none; /* Firefox */
                -ms-user-select: none; /* Internet Explorer/Edge */
                user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */

              }

              .scoreBox:hover {
                box-shadow: 0 0 3px rgba(0,0,0,0.3);
                border-color: red;
                z-index: 9;
              }
              .scoreBox.active {
                box-shadow: 0 0 3px rgba(0,0,0,0.3);
                background-color: red;
                color: rgba(0,0,0,1);
                z-index: 9;
              }

              .rule label {
                position: relative;
              }

              .rule label:before, .rule label:after {
                background: black none repeat scroll 0 0;
                content: "";
                display: block;
                height: 10px;
                left: 20px;
                position: absolute;
                top: 7px;
                width: 1px;
              }

              .rule label:after {
                left: auto;
                right: 0;
              }

                #letterChart {
                    margin: auto;
                    position: relative;
                    text-align: center;
                    margin: 0;
                    z-index: 0;
                }


              #letterChart .character-line {
                position: relative;
                line-height: 0;
                font-size: 0;
                width: 100%;
              }
              .guideline {
                position: absolute;
                width: 96%;
                height: 100%;
                margin: 0 2%;
                z-index: -2;
              }
              .redline {
                background: rgba(255,255,255,0);
                background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 45%, rgba(255,0,0,1) 45%, rgba(255,0,0,1) 55%, rgba(255,255,255,0) 55%, rgba(255,255,255,0) 100%);
              }

              .greenline {
                background: rgba(255,255,255,0);
                background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 45%, rgba(0,200,127,1) 45%, rgba(0,200,127,1) 55%, rgba(255,255,255,0) 55%, rgba(255,255,255,0) 100%);
              }

              .blueline {
                background: rgba(255,255,255,0);
                background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 45%, rgb(179, 18, 201) 45%, rgb(179, 18, 201) 55%, rgba(255,255,255,0) 55%, rgba(255,255,255,0) 100%);
              }

              .duo {
                background-size: 100%;
                background: linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,0,0,1) 50%, rgba(0,200,127,1) 50%, rgba(0,200,127,1) 100%);
              }

              #letterChart .char-line {
                display: inline-block;
                z-index: 1;
              }
              #otherChart {
                position: relative;
                text-align: center;
                margin: 0;
                z-index: 0;
              }
              .chart {
                height: 100%;
                width: 100%;
                display: none;
              }

              .clear-both {
                height: 0;
                clear: both;
              }

              .panel ul {
                margin-left: 15px;
              }

              .panel ul li {
                margin: 10px 0;
              }

              body {
                margin: 0 auto;
              }


              .char-line {
                margin-left: 0 !important;
                margin-right: 0 !important;
              }

              .char-line svg {
                margin-top: 0 !important;
                margin-bottom: 0 !important;
                float: left;
                cursor: pointer;
              }

              .char-line svg.disable {
                opacity: 0;
                visibility: hidden;
              }

              .char-line svg.active {
                opacity: 1;
                visibility: visible;
              }
              /*get dpi*/
              #dpi {
                height: 1in;
                left: -100%;
                position: absolute;
                top: -100%;
                width: 1in;
              }

              .disabled-btn {
                background: #ccc;
                border: #ccc;
                filter: opacity(0.3);
                pointer-events: none;
              }

              .disabled-fg {
                pointer-events: none;
                filter:opacity(.2);
              }

              .errorMsg {
                color: red;
                font-size: 12px;
                display: block;
                margin-top: 10px;
              }

              .character-invisible {
                visibility: hidden;
                opacity: 0;
              }

              .modal-setting {
                position: fixed;
                z-index: 9;
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
                background: rgba(0,0,0,0.3);
              }

              #side-bar {
                background: linear-gradient(0deg, rgba(138, 138, 138, 1) 0%, rgba(204, 204, 204, 1) 50%);
                box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.2), 0 0 3px 3px rgba(0, 0, 0, 0.19);
                position:absolute;
                width: 80px;
                right:0px;
                text-align: center;
                height:350px;
                z-index: 14;
              }
              #side-bar-bg {
                background: rgba(0,0,0,1);
                position:absolute;
                width: 80px;
                right:0px;
                height:350px;
                z-index: 14;
              }
              .setting-button a {
                display: block;
                position: relative;
                width: 42px;
                height: 42px;
                margin: 0 auto;
                z-index: 9;
              }
              .setting-button svg {
                position: relative;
                top: 20px;

              }
              #fs-div {
                display: block;
                position: relative;
                top: -24px;
                right: 80px;
              }
              #fs-div svg {
                position: relative;
                width: 42px
              }
              #clock-div {
                display: none;
                position: relative;
                top: 0px;
                width: 100%;
                color: rgb(255,255,255);
                font: 800 20px sans-serif;
              }
              #button-div {
                display: block;
                position: relative;
                top: 20px;
              }
              #arrow-button-div {
                display: block;
                position: relative;
                width:100%;
              }
              #arrow-button-div a {
                cursor: pointer;
                display:block;
                text-decoration: none;
                margin:0.5em 0;
              }
              .arrow-button {
                width:52px;
              }
              #pic-arrow-div {
                display: block;
                position: relative;
                margin: 0 auto;
                top: 20px;
              }
              #pic-arrow-div a {
                cursor: pointer;
                display:block;
                text-decoration: none;
                margin: 0.5em 0;
              }
              .pic-arrow {
                margin:-0.5em 0;
              }

              #function-button-div {
                display: block;
                position: relative;
                margin: 0 auto;
                top: 40px;
              }
              #function-button-div a {
                cursor: pointer;
                display:block;
                text-decoration: none;
                margin:0.5em 0;
              }
              #function-button-div svg {
                width: 52px;
              }

              #thisBadge {
                display: block;
                text-align: center;
                margin: 20px 0;
              }

              #nav-button-outer-div {
                display:block;
                position:fixed;
                overflow:hidden;
                right:0px;
                bottom:40px;
                background-color: transparent;
              }
              #nav-button-div {
                display: block;
                border-radius:31px 0 0 31px;
                background-color: rgb(204,204,204);
                position:relative;
                height:62px;
                transform:translate(80%,0);
                transition:0.2s ease-in-out;
              }
              #nav-button-div a{
                cursor: pointer;
                text-decoration: none;
                display:inline-block;
                height:100%;
                width:62px;
                padding:10px;
              }
              #nav-button-div.expanded {
                transform:translate(0,0);
              }
              /*    Animista slide animations   */
              .slide-out-top{-webkit-animation:slide-out-top .2s cubic-bezier(.215,.61,.355,1.000) both;animation:slide-out-top .2s cubic-bezier(.215,.61,.355,1.000) both}
              .slide-out-right{-webkit-animation:slide-out-right .2s cubic-bezier(.215,.61,.355,1.000) both;animation:slide-out-right .2s cubic-bezier(.215,.61,.355,1.000) both}
              .slide-out-bottom{-webkit-animation:slide-out-bottom .2s cubic-bezier(.215,.61,.355,1.000) both;animation:slide-out-bottom .2s cubic-bezier(.215,.61,.355,1.000) both}
              .slide-out-left{-webkit-animation:slide-out-left .2s cubic-bezier(.215,.61,.355,1.000) both;animation:slide-out-left .2s cubic-bezier(.215,.61,.355,1.000) both}
              .slide-in-top{-webkit-animation:slide-in-top .2s cubic-bezier(.25,.46,.45,.94) both;animation:slide-in-top .2s cubic-bezier(.25,.46,.45,.94) both}
              .slide-in-right{-webkit-animation:slide-in-right .2s cubic-bezier(.25,.46,.45,.94) both;animation:slide-in-right .2s cubic-bezier(.25,.46,.45,.94) both}
              .slide-in-bottom{-webkit-animation:slide-in-bottom .2s cubic-bezier(.25,.46,.45,.94) both;animation:slide-in-bottom .2s cubic-bezier(.25,.46,.45,.94) both}
              .slide-in-left {-webkit-animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;animation: slide-in-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;}
              @-webkit-keyframes slide-out-top{0%{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}100%{-webkit-transform:translateY(-1000px);transform:translateY(-1000px);opacity:0}}@keyframes slide-out-top{0%{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}100%{-webkit-transform:translateY(-1000px);transform:translateY(-1000px);opacity:0}}
              @-webkit-keyframes slide-out-right{0%{-webkit-transform:translateX(0);transform:translateX(0);opacity:1}100%{-webkit-transform:translateX(1000px);transform:translateX(1000px);opacity:0}}@keyframes slide-out-right{0%{-webkit-transform:translateX(0);transform:translateX(0);opacity:1}100%{-webkit-transform:translateX(1000px);transform:translateX(1000px);opacity:0}}
              @-webkit-keyframes slide-out-bottom{0%{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}100%{-webkit-transform:translateY(1000px);transform:translateY(1000px);opacity:0}}@keyframes slide-out-bottom{0%{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}100%{-webkit-transform:translateY(1000px);transform:translateY(1000px);opacity:0}}
              @-webkit-keyframes slide-out-left{0%{-webkit-transform:translateX(0);transform:translateX(0);opacity:1}100%{-webkit-transform:translateX(-1000px);transform:translateX(-1000px);opacity:0}}@keyframes slide-out-left{0%{-webkit-transform:translateX(0);transform:translateX(0);opacity:1}100%{-webkit-transform:translateX(-1000px);transform:translateX(-1000px);opacity:0}}
              @-webkit-keyframes slide-in-right{0%{-webkit-transform:translateX(1000px);transform:translateX(1000px);opacity:0}100%{-webkit-transform:translateX(0);transform:translateX(0);opacity:1}}@keyframes slide-in-right{0%{-webkit-transform:translateX(1000px);transform:translateX(1000px);opacity:0}100%{-webkit-transform:translateX(0);transform:translateX(0);opacity:1}}
              @-webkit-keyframes slide-in-left{0%{-webkit-transform:translateX(-1000px);transform:translateX(-1000px);opacity:0}100%{-webkit-transform:translateX(0);transform:translateX(0);opacity:1}}@keyframes slide-in-left{0%{-webkit-transform:translateX(-1000px);transform:translateX(-1000px);opacity:0}100%{-webkit-transform:translateX(0);transform:translateX(0);opacity:1}}
              @-webkit-keyframes slide-in-bottom{0%{-webkit-transform:translateY(1000px);transform:translateY(1000px);opacity:0}100%{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}}@keyframes slide-in-bottom{0%{-webkit-transform:translateY(1000px);transform:translateY(1000px);opacity:0}100%{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}}
              @-webkit-keyframes slide-in-top{0%{-webkit-transform:translateY(-1000px);transform:translateY(-1000px);opacity:0}100%{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}}@keyframes slide-in-top{0%{-webkit-transform:translateY(-1000px);transform:translateY(-1000px);opacity:0}100%{-webkit-transform:translateY(0);transform:translateY(0);opacity:1}}

              /* Bouncing Ball animations */
              .ball {
                -webkit-animation: bounce;
                animation: bounce;
                -webkit-animation-direction: alternate;
                animation-direction: alternate;
                -webkit-animation-timing-function: cubic-bezier(.5,0.05,1,.5);
                animation-timing-function: cubic-bezier(.5,0.05,1,.5);
                -webkit-animation-iteration-count: infinite;
                animation-iteration-count: infinite;
              }
              .purple-ball {
                -webkit-animation-duration: 1s;animation-duration: 1s;
              }
              .orange-ball {
                -webkit-animation-duration: 0.6s;animation-duration: 0.6s;
              }
              .green-ball {
                -webkit-animation-duration: 0.4s;animation-duration: 0.4s;
              }
              @-webkit-keyframes bounce {
                from { -webkit-transform: translate3d(0, -25%, 0); transform: translate3d(0, -25%, 0);}
                to   { -webkit-transform: translate3d(0, 25%, 0); transform: translate3d(0, 25%, 0);}
              }
              @keyframes bounce {
                from { -webkit-transform: translate3d(0, -25, 0); transform: translate3d(0, -25%, 0);}
                to   { -webkit-transform: translate3d(0, 25%, 0); transform: translate3d(0, 25%, 0);}
              }
              
              

              @media only screen and (max-width: 1024px) {
                /* For tablets */
                #side-bar, #side-bar-bg {
                  width: 50px;
                }

                #clock-div {
                  display: none;
                }

                #side-bar > a svg {
                  width: 28px;
                }

                #arrow-button-div {
                  top: 20px;
                }

                #arrow-button-div > a svg {
                  width: 28px;
                }

                #thisBadge > svg {
                  width: 40px;
                }

                #pic-arrow-div {
                  margin: 0 auto;
                  top: 40px;
                }

                #pic-arrow-div > a svg {
                  width: 28px;
                }

                #pic-arrow-div a {
                  margin: 0.5em 0;
                }

                .pic-arrow {
                  margin: -0.5em 0;
                }

                #function-button-div {
                  top: 60px;
                }

                #function-button-div svg {
                  width: 28px;
                }
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
            <div>
                ${this.questionNumber ? html`
                    <div id="qnum-number">
                        <label>${this.questionNumber}</label>
                    </div>
                ` : ''}
                <div id="qnum-content" class="flex-container">
                    <!-- <label>${this.label}</label> -->
<!--                    <div id="configuration">-->
<!--                        <div>-->
<!--                            <label>Pixels per Inch:</label>-->
<!--                            <input id="inputPixelsPerInch" type="number"></input>-->
<!--                        </div>-->


<!--                        &lt;!&ndash;                        <div>&ndash;&gt;-->
<!--                        &lt;!&ndash;                            <label>Chart Size in Inches:</label>&ndash;&gt;-->
<!--                        <input type="hidden" id="inputChartSizeInInchesX" type="number" value="5"></input>-->
<!--                        &lt;!&ndash;                            <label>x</label>&ndash;&gt;-->
<!--                        <input type="hidden" id="inputChartSizeInInchesY" type="number" value="2"></input>-->
<!--                        &lt;!&ndash;                        </div>&ndash;&gt;-->

<!--                        &lt;!&ndash;                        <div>&ndash;&gt;-->
<!--                        &lt;!&ndash;                            <label>Size of Top Line in Inches:</label>&ndash;&gt;-->
<!--                        &lt;!&ndash;                            <input id="inputTopLineSizeInInches" type="number" value="1"></input>&ndash;&gt;-->
<!--                        <input type="hidden" id="inputTopLineSizeInInches" type="number" value="1"></input>-->
<!--                        &lt;!&ndash;                        </div>&ndash;&gt;-->

<!--                        &lt;!&ndash;                        <div>&ndash;&gt;-->
<!--                        &lt;!&ndash;                            <label>Number of Lines:</label>&ndash;&gt;-->
<!--                        &lt;!&ndash;                            <input id="inputNumberOfLines" type="number" value="8"></input>&ndash;&gt;-->
<!--                        &lt;!&ndash;                        </div>&ndash;&gt;-->

<!--                        &lt;!&ndash;                        <div>&ndash;&gt;-->
<!--                        &lt;!&ndash;                            <label>sequenceNumber:</label>&ndash;&gt;-->
<!--                        &lt;!&ndash;                            <input id="sequenceNumber" type="number" value="1"></input>&ndash;&gt;-->
<!--                        &lt;!&ndash;                        </div>&ndash;&gt;-->
<!--                    </div>-->

                    <!--                    <div id="divOutput"></div>-->
                        <!--                    <button class="btn" @click="${() => this.generateDiagram()}
                        ">Next</button>-->

                    <!--dpi-->
<!--                    <div id="dpi"></div>-->
                    <!--setting bar-->
<!--                    <div id="side-bar-bg"></div> -->
                    <div id="letterChart" style="height:100%;">
                    </div>
                    <div id="button-bar">
                        <a class="setting-button" href="#setting-bar">
                            <svg id="bHamburger" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 14 12" width="42px">
                                <defs></defs>
                                <rect x="1" y="1" width="12" height="10" rx="1" fill="none" stroke-width="0.75"
                                      stroke="rgb(102,102,102)"></rect>
                                <rect x="2.5" y="3" width="9" height="1" rx="0.5" fill="rgb(102,102,102)"
                                      stroke-width="0"></rect>
                                <rect x="2.5" y="5.5" width="9" height="1" rx="0.5" fill="rgb(102,102,102)"
                                      stroke-width="0"></rect>
                                <rect x="2.5" y="8" width="9" height="1" rx="0.5" fill="rgb(102,102,102)"
                                      stroke-width="0"></rect>
                            </svg>
                        </a>
<!--                        <div id="fs-div">-->
<!--                            <a id="btFullscreenFunc"></a>-->
<!--                        </div>-->
<!--                        <div id="clock-div"></div>-->
<!--                        <div id="button-div">-->
<!--                            <div id="arrow-button-div">-->
<!--                                <a id="btRight"></a>-->
<!--                                <a id="btLeft"></a>-->
<!--                                <a id="thisBadge"></a>-->
<!--                            </div>-->
<!--                            <div id="pic-arrow-div">-->
<!--                                <a id="btUp"></a>-->
<!--                                <a id="btDn"></a>-->
<!--                            </div>-->
<!--                            <div id="function-button-div">-->
<!--                                <a id="btSpacebarFunc"></a>-->
<!--&lt;!&ndash;                                <a id="btShuffleFunc"></a>&ndash;&gt;-->
<!--                                <a id="btBgFunc"></a>-->
<!--                            </div>-->
<!--                        </div>-->
<!--                        <div id="nav-button-outer-div">-->
<!--                            <div id="nav-button-div">-->
<!--                                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0,0,4,4"-->
<!--                                     style="height:62px;margin-right:-5px;">-->
<!--                                    <path d="M4 0V4H2A2 2 0 0 1 2 0z" fill="rgb(114,114,114)" stroke-width="0"/>-->
<!--                                    <circle cx="1.5" cy="2" r="0.25" fill="rgb(255,255,255)"/>-->
<!--                                    <circle cx="2.3" cy="2" r="0.25" fill="rgb(255,255,255)"/>-->
<!--                                    <circle cx="3.1" cy="2" r="0.25" fill="rgb(255,255,255)"/>-->
<!--                                </svg>-->
<!--                            </div>-->
<!--                        </div>-->
                    </div>
                    <div class="setting-bar" id="setting-bar">
                        <a class="close" href="#">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                                 viewBox="1 1 16 16" enable-background="new 1 1 16 16" xml:space="preserve"
                                 style="width:24px;height:24px">
                                <g id="close-Layer_7" display="none">
                                    <rect x="1" y="1" display="inline" width="16" height="16"/>
                                </g>
                                <g id="close-Layer_31">
                            <path fill="#68707D" d="M12.1,11.6c0.1,0.1,0.1,0.3,0,0.5c-0.1,0.1-0.2,0.1-0.2,0.1c-0.1,0-0.2,0-0.2-0.1L9,9.5l-2.6,2.6
                                    c-0.1,0.1-0.2,0.1-0.2,0.1c-0.1,0-0.2,0-0.2-0.1c-0.1-0.1-0.1-0.3,0-0.5L8.5,9L5.9,6.4C5.8,6.2,5.8,6,5.9,5.9
                                    c0.1-0.1,0.3-0.1,0.5,0L9,8.5l2.6-2.6c0.1-0.1,0.3-0.1,0.5,0c0.1,0.1,0.1,0.3,0,0.5L9.5,9L12.1,11.6z M9,16.5L9,16.5L9,16.5z
                                     M9,1.2C4.7,1.2,1.2,4.7,1.2,9c0,2.1,0.8,4,2.3,5.5C4.9,16,6.9,16.8,9,16.8h0c4.3,0,7.8-3.5,7.8-7.8C16.8,4.7,13.3,1.2,9,1.2L9,1.2
                                    z"/>
                            </g>
                        </svg>
                        </a>
                        <form id="form-setting">
                            <h2>Settings</h2>
                            <fieldset>
                                <div class="title">
                                    <a class="questions-btn" href="#character-set">?</a> <span>OPTOTYPES</span>
                                </div>
                                <div class="form-group" id="fgOptotype">
                                    <label class="col-2" for="sOptotype">Optotype</label>
                                    <div class="col-8 select-box">
                                        <select class="form-control" id="sOptotype">
                                            <option value="1">Snellen</option>
                                            <option value="2">Sloan</option>
                                            <option value="3">LandoltC</option>
                                            <option value="4">TumblingE</option>
                                            <option value="5">Vanishing Sloan</option>
                                            <option value="6">Shapes</option>
                                            <option value="7">Chinese (beta)</option>
                                            <option value="8">Arabic (beta)</option>
                                            <option value="9">Hebrew</option>
                                            <option value="10">Crowded HOTV</option>
                                            <option value="11">Auckland</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group" id="fgAlphabet">
                                    <label class="col-2" for="sAlphabet">Alphabet</label>
                                    <div class="col-8 select-box">
                                        <select class="form-control" id="sAlphabet">
                                            <option value="2">BS4274.3</option>
                                            <option value="1">SnellenU</option>
                                        </select>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset>
                                <div class="title">
                                    <a class="questions-btn" href="#distance">?</a> <span>RECORDING</span>
                                </div>
                                <div class="form-group" id="fgNotation">
                                    <label class="col-2" for="sNotation">Notation</label>
                                    <div class="col-8 select-box">
                                        <select class="form-control" id="sNotation">
                                            <option value="1">Metres</option>
                                            <option value="2">Feet</option>
                                            <option value="3">logMAR</option>
                                            <option value="4">DecimalV</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group" id="fgNumerator">
                                    <label class="col-2" for="sNumerator">Numerator</label>
                                    <div class="col-8 select-box">
                                        <select class="form-control" id="sNumerator">
                                            <option value="2">Standard</option>
                                            <option value="1">Actual</option>
                                        </select>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset>
                                <div class="title">
                                    <a class="questions-btn" href="#calibration">?</a> <span>CALIBRATION</span>
                                </div>
                                <div class="form-group" id="fgDistance">
                                    <label class="col-2" for="iDistance">Distance <span
                                            style="color:red">*</span></label>
                                    <div class="col-8 ">
                                        <input type="number" class="form-control input-sm" id="iDistance"
                                               title="Chart Distance" min="3000"> <span class="unit">mm</span>
                                    </div>
                                </div>
                                <div class="form-group" id="fgLengthOfLine">
                                    <label class="col-2" for="iLengOfLine">Length of line below<span
                                            style="color:red">*</span></label>
                                    <div class="col-8 ">
                                        <input type="number" class="form-control input-sm" id="iLengOfLine"
                                               title="Length of Calibration Line" min="25" max="250"> <span
                                            class="unit">mm</span> <span class="red">(be precise)</span>
                                    </div>
                                </div>
                                <div class="rule form-group">
                                    <label>
                                        <svg width="120mm" viewBox="0 0 120 1" xmlns="http://www.w3.org/2000/svg">
                                            <rect fill="rgba(20,220,30,1)" stroke="none" x="0" y="0" width="120"
                                                  height="1" id="calib_line"/>
                                        </svg>
                                    </label>
                                </div>
                            </fieldset>
                            <fieldset>
                                <div class="title">
                                    <a class="questions-btn" href="#options">?</a> <span>options</span>
                                </div>
                                <div class="form-group" id="fgSort">
                                    <label class="col-2" for="display">Sort</label>
                                    <div class="col-8 select-box">
                                        <select class="form-control" id="display">
                                            <option value="1" selected>Smallest to Largest</option>
                                            <option value="2">Largest to Smallest</option>
                                            <option value="3">Monoyer</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group" id="fgMirrored">
                                    <label class="col-2" for="sMirrored">Mirrored / Direct</label>
                                    <div class="col-8 select-box">
                                        <select class="form-control" id="sMirrored">
                                            <option value="2" selected="selected">Mirrored</option>
                                            <option value="1">Direct</option>
                                        </select>
                                    </div>
                                </div>
                                <hr class="fg-divider">
                                <div class="form-group" id="fgOptoColour">
                                    <label class="col-2" for="tOptoColour">Optotype colour</label>
                                    <div class="col-setting">
                                        <input type="text" id="tOptoColour" class="form-control input"
                                               value="rgba(0,0,0,1)"><i> </i>
                                    </div>
                                </div>
                                <div class="form-group" id="fgPresetsOpto">
                                    <label class="col-2" for="bt100Blk">Presets:
                                        <button class="btn btn-tiny col-preset-opto" id="bt100Blk" type="button"
                                                value="rgba(0,0,0,1)">100% Black
                                        </button>
                                    </label>
                                    <div class="">
                                        <button class="btn btn-tiny col-preset-opto" id="bt10Blk" type="button"
                                                value="rgba(0,0,0,0.1)">10% Black
                                        </button>
                                        <button class="btn btn-tiny col-preset-opto" id="bt100Red" type="button"
                                                value="rgba(255,0,0,1)">100% Red
                                        </button>
                                        <button class="btn btn-tiny col-preset-opto" id="bt100Blue" type="button"
                                                value="rgba(0,0,255,1)">100% Blue
                                        </button>
                                    </div>
                                </div>
                                <hr class="fg-divider">
                                <div class="form-group" id="fgBgColour">
                                    <label class="col-2" for="tBgColour">Background colour</label>
                                    <div class="col-setting">
                                        <input type="text" id="tBgColour" class="form-control input"
                                               value="rgb(255,255,255)"><i></i>
                                    </div>
                                </div>
                                <div class="form-group" id="fgPresetsBg">
                                    <label class="col-2" for="bt100Wh">Presets:
                                        <button class="btn btn-tiny col-preset-bg" id="bt100Wh" type="button"
                                                value="rgb(255,255,255)">100% White
                                        </button>
                                    </label>
                                    <div class="">
                                        <button class="btn btn-tiny col-preset-bg" id="bt90Blk" type="button"
                                                value="rgb(25,25,25)">90% Black
                                        </button>
                                        <button class="btn btn-tiny col-preset-bg" id="bt50Blk" type="button"
                                                value="rgb(127,127,127)">50% Black (mid-grey)
                                        </button>

                                    </div>
                                </div>

                            </fieldset>
                            <fieldset>
                                <div class="title">
                                    <a class="questions-btn" href="#filters">?</a> <span>r/l filters</span>
                                </div>
                                <div class="filter-hue">
                                    <div class="form-group" id="fgFilterRed">
                                        <label class="col-2" for="sliderRed">Filter Red Hue</label>
                                        <div class="">
                                            <input type="range" min="340" max="380" value="360" class="slider red-slide"
                                                   id="sliderRed">
                                        </div>
                                    </div>
                                    <div class="form-group" id="fgFilterGreen">
                                        <label class="col-2" for="sliderGreen">Filter Green/Blue Hue</label>
                                        <div class="">
                                            <input type="range" min="110" max="200" value="160"
                                                   class="slider green-slide" id="sliderGreen">
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset>
                                <div class="title">
                                    <a class="questions-btn" href="#shortcuts">?</a> <span>shortcuts</span>
                                </div>
                                <div class="form-group" id="fgPageUL">
                                    <label class="col-4" for="pageUp">Page Up</label>
                                    <div class="col-12">
                                        <input type="text" class="form-control input-sm js-shortkey" id="pageUp"
                                               maxlength="1" value="u">
                                    </div>
                                    <label class="col-4" for="pageLeft">Page Left</label>
                                    <div class="col-12">
                                        <input type="text" class="form-control input-sm js-shortkey" id="pageLeft"
                                               maxlength="1" value="g">
                                    </div>
                                </div>
                                <div class="form-group" id="fgPageDR">
                                    <label class="col-4" for="pageDown">Page Down</label>
                                    <div class="col-12">
                                        <input type="text" class="form-control input-sm js-shortkey" id="pageDown"
                                               maxlength="1" value="n">
                                    </div>
                                    <label class="col-4" for="pageRight">Page Right</label>
                                    <div class="col-12">
                                        <input type="text" class="form-control input-sm js-shortkey" id="pageRight"
                                               maxlength="1" value="k">
                                    </div>
                                </div>
                                <div class="form-group" id="fgShuffle">
                                    <label class="col-1" for="shuffle">Toggle Shuffle</label>
                                    <div class="col-12">
                                        <input type="text" class="form-control input-sm js-shortkey" id="shuffle"
                                               maxlength="1" value="q">
                                    </div>
                                </div>
                                <div class="form-group" id="fgDuochrome">
                                    <label class="col-1" for="duoBG">Toggle Duochrome</label>
                                    <div class="col-12">
                                        <input type="text" class="form-control input-sm js-shortkey" id="duoBG"
                                               maxlength="1" value="z">
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset class="footer-fieldset">
                                <div class="action-button">
                                    <button class="btn btn-default" id="reset" type="button">Reset to defaults</button>
                                    <button class="btn btn-default btn-primary disabled-btn" id="updateSetting"
                                            type="button">Apply
                                    </button>
                                </div>
                            </fieldset>
                        </form>
                    </div>
                    <!--end setting bar-->
                    <!-- guide section-->
                    <div id="guide-section" class="guide-section">
                        <h2>Help</h2>
                        <a class="close-guide" href="#">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                                 viewBox="1 1 16 16" enable-background="new 1 1 16 16" xml:space="preserve"
                                 style="width:24px;height:24px">
            <g id="close-guide-Layer_7" display="none">
            <rect x="1" y="1" display="inline" width="16" height="16"/>
            </g>
                                <g id="close-guide-Layer_31">
            <path fill="#68707D" d="M12.1,11.6c0.1,0.1,0.1,0.3,0,0.5c-0.1,0.1-0.2,0.1-0.2,0.1c-0.1,0-0.2,0-0.2-0.1L9,9.5l-2.6,2.6
                    c-0.1,0.1-0.2,0.1-0.2,0.1c-0.1,0-0.2,0-0.2-0.1c-0.1-0.1-0.1-0.3,0-0.5L8.5,9L5.9,6.4C5.8,6.2,5.8,6,5.9,5.9
                    c0.1-0.1,0.3-0.1,0.5,0L9,8.5l2.6-2.6c0.1-0.1,0.3-0.1,0.5,0c0.1,0.1,0.1,0.3,0,0.5L9.5,9L12.1,11.6z M9,16.5L9,16.5L9,16.5z
                     M9,1.2C4.7,1.2,1.2,4.7,1.2,9c0,2.1,0.8,4,2.3,5.5C4.9,16,6.9,16.8,9,16.8h0c4.3,0,7.8-3.5,7.8-7.8C16.8,4.7,13.3,1.2,9,1.2L9,1.2
                    z"/>
                </g>
            </svg>
                        </a>
                        <div class="panel-body">
                            <strong>Very quick guide: </strong>Calibrate and configure your chart using the Settings
                            form and consult this help guide if you get stuck. You will need a measuring tape to measure
                            viewing distance and a ruler to measure the calibration line.<br>Charts are in 4 categories;
                            V for VA, R for Refraction, B for Binocular and M for Miscellaneous. Use the onscreen arrows
                            or arrows on your keyboard to navigate horizontally between categories and vertically within
                            categories. Alternatively, the category buttons in the flyout at bottom right give you
                            one-click access to your most-used chart in that category. These category links are also
                            mapped to the corresponding letters on your keyboard.<br>Click or tap on any line label to
                            mask that line. Click or tap again to unmask. <br>Click or tap on any letter to mask it.
                            Click or tap on it again to mask a column of letters. Click or tap on any letter in the
                            column to show all again. <br>If there is a round button in the sidebar below the navigation
                            arrows, the chart has a function mapped to the spacebar, such as zoom or rotate. You can
                            also activate the function by clicking on or tapping the chart itself or the
                            button.<br><strong>Why is one of the charts just black?</strong><br>So you can darken your
                            room with one click.<br><br>
                        </div>
                        <div class="accordion">
                            <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
                                <div class="panel panel-default">
                                    <div class="panel-heading" role="tab" id="character-set">
                                        <h4 class="panel-title">
                                            <a href="#">
                                                Optotypes
                                            </a>
                                        </h4>
                                    </div>
                                    <div id="collapseOne" class="panel-collapse collapse">
                                        <div class="panel-body">
                                            The optotypes fields allow you to select the symbols to be displayed. You
                                            cannot change the array nor order of the lines displayed here.
                                            <ul>
                                                <li>
                                                    <strong>Optotype</strong>: Select from a range of standard
                                                    optotypes.
                                                </li>
                                                <li>
                                                    <strong>Alphabet</strong>: The available options are dependent on
                                                    the OPTOTYPE selected above. SnellenU and SloanU use a wider
                                                    selection of letters, but letters may not be of equal readability.
                                                    BS4724.3 and ETDRS are standard alphabets using fewer letters, but
                                                    with more equal readability. Letters can be shuffled to prevent
                                                    learning and increase repeatability - see below
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="panel panel-default">
                                    <div class="panel-heading" role="tab" id="distance">
                                        <h4 class="panel-title">
                                            <a href="#">
                                                Recording
                                            </a>
                                        </h4>
                                    </div>
                                    <div id="collapseTwo" class="panel-collapse collapse">
                                        <div class="panel-body">
                                            <ul>
                                                <li>
                                                    <strong>Notation</strong>: Sets the notation type on the VA label on
                                                    each chart line. Regardless of notation or optotype, WolfChart uses
                                                    the standard logMAR array of subtenses (0.501", 0.631", 0.794", 1",
                                                    1.259", 1.585", 2", 2.512", 3.162", 3.981", 5.012", 6.31", 7.943",
                                                    10") with each 3 lines doubling the subtense. Notation and Numerator
                                                    express these subtenses as your preferred VA value. "Metres" is
                                                    standard Snellen notation eg. 6/6; "Feet" is the imperialist
                                                    equivalent eg. 20/20; DecimalV is a the European standard (EN ISO
                                                    8596) eg. 6/60 = 0.1, 6/12 = 0.5; logMAR is explained here <a
                                                        href="https://en.wikipedia.org/wiki/LogMAR_chart"
                                                        target="_blank">https://en.wikipedia.org/wiki/LogMAR_chart.</a>
                                                </li>
                                                <li>
                                                    <strong>Numerator</strong>: Sets the numerator of the fraction
                                                    notation types only; if Notation is set to logMar or DecimalV, this
                                                    setting makes no difference.<br>"Standard" is either 6 or 20
                                                    depending whether Notation is set to Metres or Feet above. VA labels
                                                    will display as either 6/ or 20/ regardless of the value in
                                                    Distance.<br>"Actual" is the value entered in Distance (see below)
                                                    rounded to the nearest 0.1m or 0.5ft, and VA labels will show this
                                                    rounded numerator, with a ! instead of a /, and a proportionally
                                                    adjusted denominator. Please note that it is not advisable to use
                                                    Standard if the Distance varies a large amount from 6000mm, say
                                                    outside 5500-6500mm. The numerator should be the tested distance or
                                                    near to it.

                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="panel panel-default">
                                    <div class="panel-heading" role="tab" id="calibration">
                                        <h4 class="panel-title">
                                            <a href="#">
                                                Calibration
                                            </a>
                                        </h4>
                                    </div>
                                    <div id="collapseThree" class="panel-collapse collapse">
                                        <div class="panel-body">
                                            <p> The two CALIBRATION values are the <strong>only</strong> values that
                                                influence the size of the letters. The RECORDING values above only
                                                change the VA labels on the letter chart lines, and have no bearing on
                                                the letters themselves.</p>
                                            <ul>
                                                <li><strong>Distance</strong>: Enter the distance from the patient's eye
                                                    to the letter chart in mm. Eg 6m is 6000mm. Even if you work in feet
                                                    (see Notation above), you <strong>must</strong> enter the Distance
                                                    in mm. If using a mirror to double the test distance, measure BOTH
                                                    from the patient's eye to the mirror AND from the mirror to the
                                                    display and ADD the two distances (and don't forget to check the
                                                    Mirrored/Direct setting - see below). If you are using Notation
                                                    value of "Feet", Numerator will be converted to the nearest foot, or
                                                    to 20 depending on the value in Numerator.
                                                </li>
                                                <li>
                                                    <strong>Length of the line below</strong>: Calibrates the chart.
                                                    WolfChart does not need to know anything about the screen you are
                                                    using; it just needs the length of this green line as it is
                                                    displayed. Measure the length of the green line as accurately as
                                                    possible. On a touch screen this is tricky, but you'll work it out.
                                                    You will need to re-check this value if you change display hardware,
                                                    graphics adapter settings, or if you turn your display from
                                                    landscape to portrait or vice versa. Take particular care here if
                                                    you are using extended display from a computer as pixel density may
                                                    be different between the computer screen and the external display.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="panel panel-default">
                                    <div class="panel-heading" role="tab" id="options">
                                        <h4 class="panel-title">
                                            <a href="#">
                                                Options
                                            </a>
                                        </h4>
                                    </div>
                                    <div id="collapseFour" class="panel-collapse collapse">
                                        <div class="panel-body">
                                            <ul>
                                                <li><strong>Sort</strong>: Unless the display is very large (about 1m
                                                    wide by about 1.5m tall viewed at 6m), the letter chart will display
                                                    in pages - see SHORTCUTS below. Here you can select whether to
                                                    display the page of the smallest or largest lines first. If French,
                                                    you have a Monoyer option.
                                                </li>
                                                <li><strong>Mirrored/Direct</strong>: Select "Direct" if WolfChart is to
                                                    be viewed directly, otherwise select "Mirrored" and the letters and
                                                    lines will be reversed, but the labels not. If changing this
                                                    setting, don't forget to set the Distance (see above) accordingly.
                                                </li>
                                                <li><strong>Optotype colour</strong>: Defaults to solid black. Enter any
                                                    valid rgba string or use the preset buttons for common values.
                                                </li>
                                                <li><strong>Background colour</strong>: Defaults to solid white. Enter
                                                    any valid rgba string or use the preset button/s. If a Vanishing
                                                    optotype is selected, this field is disabled.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="panel panel-default">
                                    <div class="panel-heading" role="tab" id="filters">
                                        <h4 class="panel-title">
                                            <a href="#">
                                                R/L Filter Hues
                                            </a>
                                        </h4>
                                    </div>
                                    <div id="collapseFive" class="panel-collapse collapse">
                                        <div class="panel-body">
                                            WolfChart uses red and green targets for binocular dissociation tests. The
                                            default hues may work fine for your filters, but if not, you can set the
                                            hues using the sliders. The objective is for each slider to be only visible
                                            from one eye using red/green or red/blue goggles or trial set filters.
                                            Sometimes you can't get total invisibility, or there are two invisible
                                            settings. In either case the tests will work if you can make the two hues as
                                            different as possible when viewed through each coloured filter.
                                        </div>
                                    </div>
                                </div>
                                <div class="panel panel-default">
                                    <div class="panel-heading" role="tab" id="shortcuts">
                                        <h4 class="panel-title">
                                            <a href="#">
                                                Shortcuts
                                            </a>
                                        </h4>
                                    </div>
                                    <div id="collapseSix" class="panel-collapse collapse">
                                        <div class="panel-body">
                                            <p> Use these fields to specify keyboard shortcuts for operating WolfChart.
                                                Certain keys eg. v, r, b and m are reserved and you will be alerted not
                                                to use them if you try.</p>
                                            <ul>
                                                <li>
                                                    <strong>Page Up/Dn/Left/Right</strong>: Page Up, Down, Left and
                                                    Right are already mapped to the arrows on your keyboard, and the
                                                    arrow buttons on screen. If your controller doesn't have arrow keys,
                                                    add custom shortcuts here, eg u,n,g and k respectively<br>
                                                </li>
                                                <li>
                                                    <strong>Shuffle:</strong>: Toggles shuffle of the letters. Each
                                                    shuffle is random, but each unshuffle returns the alphabet to it's
                                                    original order.
                                                </li>
                                                <li>
                                                    <strong>Duochrome:</strong>: Toggles a red/green background on V
                                                    charts.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--end guide-section-->
                    
                    <div id="otherChart">
                        <!--these hidden divs below represent a chart each, using class for categorising. 
        They are hidden in the head style.
        Letter charts (class='chart V') are created dynamically in PageLetterChart() -->
                        <div class="chart R" id="R0" style="background-color: rgba(255,255,255,1);">
                            <svg id="rJCCDots" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 20 20"
                                 width="200px">
                                <defs></defs>
                                <g id="rJCCDots-layer0" style="display:none;">
                                    <circle cx="2" cy="10" r="2" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="6" cy="4" r="2" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="6" cy="16" r="2" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="10" cy="10" r="2" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="14" cy="4" r="2" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="14" cy="16" r="2" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="18" cy="10" r="2" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                </g>
                                <g id="rJCCDots-layer1">
                                    <circle cx="2" cy="6" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="2" cy="10" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="2" cy="14" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="6" cy="4" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="6" cy="8" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="6" cy="12" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="6" cy="16" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="10" cy="2" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="10" cy="6" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="10" cy="10" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="10" cy="14" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="10" cy="18" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="14" cy="4" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="14" cy="8" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="14" cy="12" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="14" cy="16" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="18" cy="6" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="18" cy="10" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>
                                    <circle cx="18" cy="14" r="1" fill="rgba(0,0,0,1)" stroke="none"></circle>

                                </g>
                            </svg>
                        </div>
                        <div class="chart R" id="R1" style="background-color: rgba(255,255,255,1);">
                            <svg id="rBullseye" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 14 14" width="200px">
                                <defs></defs>
                                <g id="rBullseye-layer0" style="display:none;">
                                    <path
                                            d="M 7 0 A 7 7 0 1 1 6.999 0z M 7 2 A 5 5 0 1 1 6.999 2z M 7 4 A 3 3 0 1 1 6.999 4z M 7 6 A 1 1 0 1 1 6.999 6z"
                                            fill="#000000" stroke="none" fill-rule="evenodd"></path>
                                </g>
                                <g id="rBullseye-layer1">
                                    <path
                                            d="M 7 3.5 A 3.5 3.5 0 1 1 6.999 3.5z M 7 4.5 A 2.5 2.5 0 1 1 6.999 4.5z M 7 5.5 A 1.5 1.5 0 1 1 6.999 5.5z M 7 6.5 A 0.5 0.5 0 1 1 6.999 6.5z"
                                            fill="#000000" stroke="none" fill-rule="evenodd"></path>
                                </g>
                            </svg>
                        </div>
                        <div class="chart R" id="R2" style="background-color:rgba(255,255,255,1);">
                            <svg id="rMegaBullseye" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg"
                                 version="1.1" viewBox="0,0,40,40">
                                <g id="rMegaBullseye-layer0" style="display:none;">
                                    <path d="M 20 0 A 20 20 0 1 1 19.999 0z M 20 2 A 18 18 0 1 1 19.999 2z"
                                          fill="#000000" stroke="none" fill-rule="evenodd"></path>
                                    <path d="M 20 4 A 16 16 0 1 1 19.999 4z M 20 6 A 14 14 0 1 1 19.999 6z"
                                          fill="#000000" stroke="none" fill-rule="evenodd"></path>
                                    <path d="M 20 8 A 12 12 0 1 1 19.999 8z M 20 10 A 10 10 0 1 1 19.999 10z"
                                          fill="#000000" stroke="none" fill-rule="evenodd"></path>
                                    <path d="M 20 12 A 8 8 0 1 1 19.999 12z M 20 14 A 6 6 0 1 1 19.999 14z"
                                          fill="#000000" stroke="none" fill-rule="evenodd"></path>
                                    <path d="M 20 16 A 4 4 0 1 1 19.999 16z M 20 18 A 2 2 0 1 1 19.999 18z"
                                          fill="#000000" stroke="none" fill-rule="evenodd"></path>
                                </g>
                                <g id="rMegaBullseye-layer1">
                                    <path d="M 20 10 A 10 10 0 1 1 19.999 10z M 20 11 A 9 9 0 1 1 19.999 11z"
                                          fill="#000000" stroke="none" fill-rule="evenodd"></path>
                                    <path d="M 20 12 A 8 8 0 1 1 19.999 12z M 20 13 A 7 7 0 1 1 19.999 13z"
                                          fill="#000000" stroke="none" fill-rule="evenodd">
                                    </path>
                                    <path d="M 20 14 A 6 6 0 1 1 19.999 14z M 20 15 A 5 5 0 1 1 19.999 15z"
                                          fill="#000000" stroke="none" fill-rule="evenodd">
                                    </path>
                                    <path d="M 20 16 A 4 4 0 1 1 19.999 16z M 20 17 A 3 3 0 1 1 19.999 17z"
                                          fill="#000000" stroke="none" fill-rule="evenodd">
                                    </path>
                                    <path d="M 20 18 A 2 2 0 1 1 19.999 18z M 20 19 A 1 1 0 1 1 19.999 19z"
                                          fill="#000000" stroke="none" fill-rule="evenodd">
                                    </path>
                                </g>
                            </svg>
                        </div>
                        <div class="chart R" id="R3" style="background-color: rgba(255,255,255,1);">
                            <svg id="rFusedXCyl" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 29 29">
                                <defs>
                                    <rect id="rFusedXCyl_e0" x="0" y="0" width="1" height="29" fill="rgba(0,0,0,1)"
                                          stroke="none"/>
                                    <rect id="rFusedXCyl_e1" x="0" y="0" width="0.5" height="14.5" fill="rgba(0,0,0,1)"
                                          stroke="none"/>
                                </defs>
                                <g id="rFusedXCyl-layer0" style="display:none;">
                                    <g id="rFusedXCylVGroup" transform="translate(8,0)">
                                        <use xlink:href="#rFusedXCyl_e0"/>
                                        <use xlink:href="#rFusedXCyl_e0" transform="translate(3,0)"/>
                                        <use xlink:href="#rFusedXCyl_e0" transform="translate(6,0)"/>
                                        <use xlink:href="#rFusedXCyl_e0" transform="translate(9,0)"/>
                                        <use xlink:href="#rFusedXCyl_e0" transform="translate(12,0)"/>
                                    </g>
                                    <g id="rFusedXCylHGroup" transform="translate(0,9)">
                                        <use xlink:href="#rFusedXCyl_e0" transform="rotate(-90,0,0)"/>
                                        <use xlink:href="#rFusedXCyl_e0" transform="translate(0,3)  rotate(-90,0,0)"/>
                                        <use xlink:href="#rFusedXCyl_e0" transform="translate(0,6)  rotate(-90,0,0)"/>
                                        <use xlink:href="#rFusedXCyl_e0" transform="translate(0,9)  rotate(-90,0,0)"/>
                                        <use xlink:href="#rFusedXCyl_e0" transform="translate(0,12)  rotate(-90,0,0)"/>
                                    </g>

                                </g>
                                <g id="rFusedXCyl-layer1">
                                    <g id="rFusedXCylVGroup" transform="translate(11.25,7.25)">
                                        <use xlink:href="#rFusedXCyl_e1"/>
                                        <use xlink:href="#rFusedXCyl_e1" transform="translate(1.5,0)"/>
                                        <use xlink:href="#rFusedXCyl_e1" transform="translate(3,0)"/>
                                        <use xlink:href="#rFusedXCyl_e1" transform="translate(4.5,0)"/>
                                        <use xlink:href="#rFusedXCyl_e1" transform="translate(6,0)"/>
                                    </g>
                                    <g id="rFusedXCylHGroup" transform="translate(7.25,11.75)">
                                        <use xlink:href="#rFusedXCyl_e1" transform="rotate(-90,0,0)"/>
                                        <use xlink:href="#rFusedXCyl_e1" transform="translate(0,1.5)  rotate(-90,0,0)"/>
                                        <use xlink:href="#rFusedXCyl_e1" transform="translate(0,3)  rotate(-90,0,0)"/>
                                        <use xlink:href="#rFusedXCyl_e1" transform="translate(0,4.5)  rotate(-90,0,0)"/>
                                        <use xlink:href="#rFusedXCyl_e1" transform="translate(0,6)  rotate(-90,0,0)"/>
                                    </g>

                                </g>
                            </svg>
                        </div>
                        <div class="chart R" id="R4" style="background-color: rgba(255,255,255,1);">
                            <svg id="rDuoSeptumChart" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 50 28">
                                <defs>
                                    <path id="path-bg" d="M0 2A2 2 0 0 1 2 0H25.2V14H0z" stroke="none"></path>
                                    <path id="path-ring"
                                          d="M 3.5 0 A 3.5 3.5 0 1 1 3.499 0z M 3.5 1 A 2.5 2.5 0 1 1 3.499 1z M 3.5 2 A 1.5 1.5 0 1 1 3.499 2z M 3.5 3 A 0.5 0.5 0 1 1 3.499 3z"
                                          fill="#000000" stroke="none" fill-rule="evenodd"></path>
                                    <path id="path-box"
                                          d="M0 0H7V7H0zM1 1H6V6H1zM2 2H5V5H2zM3 3H4V4H3z"
                                          fill="#000000" stroke="none" fill-rule="evenodd"></path>
                                </defs>
                                <g id="dscChart" transform="translate(5,0)">
                                    <g class="LGroup" transform="translate(0,0)">
                                        <use xlink:href="#path-bg" fill="#d42c2c"/>
                                        <use xlink:href="#path-bg" fill="#2cd72c"
                                             transform="scale(1,-1) translate(0,-28)"/>
                                        <use xlink:href="#path-ring" transform="translate(7.5 17.5)"/>
                                        <use xlink:href="#path-ring" transform="translate(7.5 3.5)"/>
                                    </g>
                                    <g class="RGroup" transform="translate(0,0)">
                                        <use xlink:href="#path-bg" fill="#d42c2c"
                                             transform="scale(-1,1) translate(-40,0)"/>
                                        <use xlink:href="#path-bg" fill="#2cd72c" transform="rotate(180,20,14)"/>
                                        <use xlink:href="#path-box" transform="translate(25.5 3.5)"/>
                                        <use xlink:href="#path-box" transform="translate(25.5 17.5)"/>
                                    </g>
                                </g>
                            </svg>
                        </div>
                        <div class="chart R" id="R5" style="background-color: rgba(255,255,255,1);">
                            <svg id="rSeptumChart" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 40 28" width="200px">
                                <defs></defs>
                                <g id="rSeptumChart-layer0">
                                </g>
                                <g id="rSeptumChart-layer1" transform="">
                                    <g id="scChart" transform="translate (10,1.5)">
                                        <g class="RGroup" transform="translate (15,0)">
                                            <g id="scTURN" transform="translate(2,0)">
                                                <path d="M0 0H4V1H2.5V5H1.5V1H0z" fill="#000000"
                                                      transform="translate(0,2)" stroke-width="0">
                                                </path>
                                                <path d="M0 0V3A2 2 0 0 0 4 3V0H3V3A1 1 0 1 1 1 3 V0z" fill="#000000"
                                                      transform="translate(0.79,10) scale(0.63)"
                                                      stroke-width="0"></path>
                                                <path
                                                        d="M 0 0 H 2.5 A 1.5 1.5 0 0 1 2.5 3 L 4 5 H 2.8 L 1.3 3 H 1 V 5 H 0 V 1 H 1 V 2 H 2.5 A 0.5 0.5 0 0 0 2.5 1 H 0 V 0"
                                                        fill="#000000" transform="translate(1.1,16) scale (0.47)"
                                                        stroke-width="0"></path>
                                                <path d="M0 0H1L3 3.1V0H4V5H3L1 1.9V5H0z" fill="#000000"
                                                      transform="translate(1.33,21) scale(0.33)"
                                                      stroke-width="0"></path>
                                            </g>
                                            <path d="M8 0 H0V0.5H7.5V24.5H0V25H8z" fill="#000000" transform=""
                                                  stroke-width="0"></path>
                                        </g>
                                        <g class="LGroup" transform="translate (-3,0)">
                                            <g id="scHELP" transform="translate(2,0)">
                                                <path d="M0 0H1V2H3V0H4V5H3V3H1V5H0z" fill="#000000"
                                                      transform="translate(0,2)" stroke-width="0">
                                                </path>
                                                <path d="M0 0H4V1H1V2H3V3H1V4H4V5H0z" fill="#000000"
                                                      transform="translate(0.63,10) scale(0.67)"
                                                      stroke-width="0"></path>
                                                <path d="M 0 0H1V4H4V5H0z" fill="#000000"
                                                      transform="translate(1,16) scale (0.47)" stroke-width="0">
                                                </path>
                                                <path d="M 0 0H2.5A 1.5 1.5 0 0 1 2.5 3H1V5H0V1H1V2H2.5A 0.5 0.5 0 0 0 2.5 1H0z"
                                                      fill="#000000"
                                                      transform="translate(1.33,21) scale(0.33)"
                                                      stroke-width="0"></path>
                                            </g>
                                            <path d="M0 0H8V0.5H0.5V24.5H8V25H0z" fill="#000000" transform=""
                                                  stroke-width="0"></path>

                                        </g>
                                    </g>
                                </g>
                            </svg>
                        </div>
                        <div class="chart B" id="B0" style="background-color:hsl(0,0%,90%);">
                            <svg id="bFixDisp" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 28 26" width="200px" style="border: 1px black;">
                                <defs></defs>
                                <g>
                                    <rect x="1" y="10.5" width="26" height="5" stroke-width="0.1" fill="#ffffff"
                                          stroke="#000000"></rect>
                                    <circle cx="9" cy="13" r="1.5" fill="none" stroke="#000000"
                                            stroke-width="1"></circle>
                                    <path d="M13.5 11H14.5V12.5H16V13.5H14.5V15H13.5V13.5H12V12.5H13.5V11"
                                          fill="#000000" stroke-width="0">
                                    </path>
                                    <circle cx="19" cy="13" r="1.5" fill="none" stroke="#000000"
                                            stroke-width="1"></circle>
                                    <path class="filterGreen" d="M13 16H15V25H13V15" fill="#2cd72c"
                                          stroke-width="0"></path>
                                    <path class="filterRed" d="M13 1H15V10H13V1" fill="#d42c2c" stroke-width="0"></path>
                                </g>
                            </svg>
                        </div>
                        <div class="chart B" id="B1" style="background-color:hsl(0,0%,90%);">
                            <svg id="bWorth4Dot" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 35 35" width="200px">
                                <defs></defs>
                                <g id="bWorth4Dot-layer0" style="display:none">
                                    <circle class="filterGreen" cx="17.5" cy="15" r="1" fill="#2cd72c"
                                            stroke-width="0"></circle>
                                    <circle class="filterRed" cx="15" cy="17.5" r="1" fill="#d42c2c"
                                            stroke-width="0"></circle>
                                    <circle class="filterRed" cx="20" cy="17.5" r="1" fill="#d42c2c"
                                            stroke-width="0"></circle>
                                    <circle cx="17.5" cy="20" r="1" fill="rgba(0,0,0,1)" stroke-width="0"></circle>
                                </g>
                                <g id="bWorth4Dot-layer1">
                                    <circle class="filterGreen" cx="17.5" cy="10" r="2.5" fill="#2cd72c"
                                            stroke-width="0"></circle>
                                    <circle class="filterRed" cx="10" cy="17.5" r="2.5" fill="#d42c2c"
                                            stroke-width="0"></circle>
                                    <circle class="filterRed" cx="25" cy="17.5" r="2.5" fill="#d42c2c"
                                            stroke-width="0"></circle>
                                    <circle cx="17.5" cy="25" r="2.5" fill="rgba(0,0,0,1)" stroke-width="0"></circle>
                                </g>
                            </svg>
                        </div>
                        <div class="chart B" id="B2" style="background-color:hsl(0,0%,90%)">
                            <svg id="bDPhoriaH" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 2 40">
                                <defs></defs>
                                <g id="bDPhoriaH-layer0">
                                    <path class="filterRed" d="M0 0H2V19L1 20L0 19z" fill="#d42c2c"
                                          stroke-width="0"></path>
                                    <path class="filterGreen" d="M0 21L1 20L2 21V40H0z" fill="#2cd72c"
                                          stroke-width="0"></path>
                                </g>
                            </svg>
                        </div>
                        <div class="chart B" id="B3" style="background-color:hsl(0,0%,90%);">
                            <svg id="bDPhoriaV" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 60 2">
                                <defs></defs>
                                <g id="bDPhoriaV-layer0">
                                    <path class="filterRed" d="M0 0H29L30 1L29 2H0z" fill="#d42c2c"
                                          stroke-width="0"></path>
                                    <path class="filterGreen" d="M31 0H60V2H31L30 1z" fill="#2cd72c"
                                          stroke-width="0"></path>
                                </g>
                            </svg>
                        </div>
                        <div class="chart B" id="B4" style="background-color:hsl(0,0%,90%);">
                            <svg id="bDPhoriaBoxes" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 20 20" width="200px">
                                <defs></defs>
                                <g id="bDPhoriaBoxes-layer0" style="display:none">

                                </g>
                                <g id="bDPhoriaBoxes-layer1">
                                    <rect class="filterRed" x="0" y="0" width="9" height="9" fill="#d42c2c"
                                          stroke-width="0"></rect>
                                    <rect class="filterRed" x="11" y="11" width="9" height="9" fill="#d42c2c"
                                          stroke-width="0"></rect>
                                    <rect class="filterGreen" x="11" y="0" width="9" height="9" fill="#d42c2c"
                                          stroke-width="0"></rect>
                                    <rect class="filterGreen" x="0" y="11" width="9" height="9" fill="#d42c2c"
                                          stroke-width="0"></rect>
                                </g>
                            </svg>
                        </div>
                        <div class="chart B" id="B5" style="background-color:hsl(0,0%,90%);">
                            <svg id="bDPhoriaArrows" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 60 40" width="200px">
                                <defs></defs>
                                <g id="bDPhoriaArrows-layer0">
                                    <path class="filterRed" d="M29 0H31V18L30 19L29 18z" fill="#d42c2c"
                                          stroke-width="0"></path>
                                    <path class="filterGreen" d="M0 19H28L29 20L28 21H0z" fill="#2cd72c"
                                          stroke-width="0"></path>
                                    <path class="filterRed" d="M29 0H31V18L30 19L29 18z" fill="#d42c2c" stroke-width="0"
                                          transform="rotate(180,30,20)"></path>
                                    <path class="filterGreen" d="M0 19H28L29 20L28 21H0z" fill="#2cd72c"
                                          stroke-width="0" transform="rotate(180,30,20)"></path>
                                </g>
                                <g id="bDPhoriaArrows-layer1" style="display:none;">
                                    <path class="filterGreen" d="M29 0H31V18L30 19L29 18z" fill="#d42c2c"
                                          stroke-width="0"></path>
                                    <path class="filterRed" d="M0 19H28L29 20L28 21H0z" fill="#2cd72c"
                                          stroke-width="0"></path>
                                    <path class="filterGreen" d="M29 0H31V18L30 19L29 18z" fill="#d42c2c"
                                          stroke-width="0" transform="rotate(180,30,20)"></path>
                                    <path class="filterRed" d="M0 19H28L29 20L28 21H0z" fill="#2cd72c" stroke-width="0"
                                          transform="rotate(180,30,20)"></path>
                                </g>
                            </svg>
                        </div>

                        <div class="chart M" id="M0" style="background-color: rgba(0,0,0,1);">

                        </div>
                        <div class="chart M" id="M1" style="background-color: rgba(0,0,0,1);">
                            <svg id="mWhiteDot" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 10 10" width="200px" style="background-color: rgba(0,0,0,1);">
                                <defs></defs>
                                <g id="mWhiteDot-layer0" style="display:none;">
                                    <circle cx="5" cy="5" r="5" fill="rgba(255,255,255,1)" stroke="none"></circle>
                                </g>
                                <g id="mWhiteDot-layer1">
                                    <circle cx="5" cy="5" r="2.5" fill="rgba(255,255,255,1)" stroke="none"></circle>
                                </g>
                            </svg>
                        </div>

                        <div class="chart M animated" id="M2" style="background-color: rgba(0,0,0,1);">
                            <svg id="mBouncingBall" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink"
                                 viewBox="0 0 10 10" width="200px" style="background-color: rgba(0,0,0,1);">
                                <circle class="ball purple-ball" cx="2" cy="5" r="1" fill="rgb(174,39,96)"
                                        stroke="none"></circle>
                                <circle class="ball orange-ball" cx="5" cy="5" r="1" fill="rgb(214,116,10)"
                                        stroke="none"></circle>
                                <circle class="ball green-ball" cx="8" cy="5" r="1" fill="rgb(8,190,144)"
                                        stroke="none"></circle>
                            </svg>
                        </div>

                        <div class="chart M animated" id="M3" style="background-color: rgba(0,0,0,1);">
                            <svg id="mMilesElam" version="1.1" width="200px" viewBox="0 0 320 320" fill="none"
                                 stroke="#fff"
                                 stroke-linecap="round" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink">
                                <defs>
                                    <path id="r1" d="">
                                        <animate id="p1" attributeName="d"
                                                 values="m160,20l0,0 0,0;m130,60l30,-17 30,17;m130,110l30,-17 30,17;m160,160l0,0 0,0"
                                                 dur="11s"
                                                 repeatCount="indefinite"/>
                                        <animate attributeName="stroke-width" values="0;2;3;2;0" dur="7s"
                                                 repeatCount="indefinite"
                                                 begin="p1.begin"/>
                                    </path>
                                    <path id="r2" d="">
                                        <animate attributeName="d"
                                                 values="m160,160l0,0 0,0;m130,110l30,-17 30,17;m130,60l30,-17 30,17;m160,20l0,0 0,0"
                                                 dur="7s"
                                                 repeatCount="indefinite" begin="p1.begin+1s"/>
                                        <animate attributeName="stroke-width" values="0;2;3;2;0" dur="3s"
                                                 repeatCount="indefinite"
                                                 begin="p1.begin+1s"/>
                                    </path>
                                    <path id="r3" d="">
                                        <animate attributeName="d"
                                                 values="m160,20l0,0 0,0;m130,60l30,-17 30,17;m130,110l30,-17 30,17;m160,160l0,0 0,0;"
                                                 dur="15s"
                                                 repeatCount="indefinite" begin="p1.begin+2s"/>
                                        <animate attributeName="stroke-width" values="0;2;3;2;0" dur="9s"
                                                 repeatCount="indefinite"
                                                 begin="p1.begin+2s"/>
                                    </path>
                                    <path id="r4" d="">
                                        <animate id="p1" attributeName="d"
                                                 values="m160,20l0,0 0,0;m130,60l30,-17 30,17;m130,110l30,-17 30,17;m160,160l0,0 0,0"
                                                 dur="5s"
                                                 repeatCount="indefinite" begin="p1.begin+3s"/>
                                        <animate attributeName="stroke-width" values="0;2;3;2;0" dur="5s"
                                                 repeatCount="indefinite"
                                                 begin="p1.begin+3s"/>
                                    </path>
                                    <path id="r5" d="">
                                        <animate attributeName="d"
                                                 values="m160,160l0,0 0,0;m130,110l30,-17 30,17;m130,60l30,-17 30,17;m160,20l0,0 0,0"
                                                 dur="4s"
                                                 repeatCount="indefinite" begin="p1.begin+4s"/>
                                        <animate attributeName="stroke-width" values="0;2;3;2;0" dur="5s"
                                                 repeatCount="indefinite"
                                                 begin="p1.begin+4s"/>
                                    </path>
                                    <path id="r6" d="">
                                        <animate attributeName="d"
                                                 values="m160,160l0,0 0,0;m130,110l30,-17 30,17;m130,60l30,-17 30,17;m160,20l0,0 0,0"
                                                 dur="2s"
                                                 repeatCount="indefinite" begin="p1.begin+5s"/>
                                        <animate attributeName="stroke-width" values="0;2;3;2;0" dur="3s"
                                                 repeatCount="indefinite"
                                                 begin="p1.begin+5s"/>
                                    </path>
                                </defs>
                                <g id="g0" transform="rotate(350)">
                                    <use xlink:href="#r1"/>
                                    <use xlink:href="#r1" transform="rotate(60 160 160)"/>
                                    <use xlink:href="#r1" transform="rotate(120 160 160)"/>
                                    <use xlink:href="#r1" transform="rotate(180 160 160)"/>
                                    <use xlink:href="#r1" transform="rotate(240 160 160)"/>
                                    <use xlink:href="#r1" transform="rotate(300 160 160)"/>
                                    <use xlink:href="#r2" transform="rotate(30 160 160)"/>
                                    <use xlink:href="#r2" transform="rotate(90 160 160)"/>
                                    <use xlink:href="#r2" transform="rotate(150 160 160)"/>
                                    <use xlink:href="#r2" transform="rotate(210 160 160)"/>
                                    <use xlink:href="#r2" transform="rotate(270 160 160)"/>
                                    <use xlink:href="#r2" transform="rotate(330 160 160)"/>
                                    <use xlink:href="#r3"/>
                                    <use xlink:href="#r3" transform="rotate(60 160 160)"/>
                                    <use xlink:href="#r3" transform="rotate(120 160 160)"/>
                                    <use xlink:href="#r3" transform="rotate(180 160 160)"/>
                                    <use xlink:href="#r3" transform="rotate(240 160 160)"/>
                                    <use xlink:href="#r3" transform="rotate(300 160 160)"/>
                                    <use xlink:href="#r4" transform="rotate(30 160 160)"/>
                                    <use xlink:href="#r4" transform="rotate(90 160 160)"/>
                                    <use xlink:href="#r4" transform="rotate(150 160 160)"/>
                                    <use xlink:href="#r4" transform="rotate(210 160 160)"/>
                                    <use xlink:href="#r4" transform="rotate(270 160 160)"/>
                                    <use xlink:href="#r4" transform="rotate(330 160 160)"/>
                                    <use xlink:href="#r5"/>
                                    <use xlink:href="#r5" transform="rotate(60 160 160)"/>
                                    <use xlink:href="#r5" transform="rotate(120 160 160)"/>
                                    <use xlink:href="#r5" transform="rotate(180 160 160)"/>
                                    <use xlink:href="#r5" transform="rotate(240 160 160)"/>
                                    <use xlink:href="#r5" transform="rotate(300 160 160)"/>
                                    <use xlink:href="#r6" transform="rotate(30 160 160)"/>
                                    <use xlink:href="#r6" transform="rotate(90 160 160)"/>
                                    <use xlink:href="#r6" transform="rotate(150 160 160)"/>
                                    <use xlink:href="#r6" transform="rotate(210 160 160)"/>
                                    <use xlink:href="#r6" transform="rotate(270 160 160)"/>
                                    <use xlink:href="#r6" transform="rotate(330 160 160)"/>
                                    <animateTransform
                                            attributeName="transform"
                                            attributeType="XML"
                                            type="rotate"
                                            values="0 160 160;30,160,160;0 160 160"
                                            dur="50s"
                                            repeatCount="indefinite"/>
                                </g>
                            </svg>
                        </div>

                    </div><!-- end of #otherChart     -->
                    <!--The hidden div below contains all the svg for the letters. The elements are only allowed to be paths or polygons, with no strokes used. Changing optotype colour in the config settings will only change the fill of elements which are not classed "white" below. This protects the white filled elements of vanishing optotypes-->
                    <div style="display:none;" id="list-character">
                        <!--new Snellen-->
                        <svg id="Snellen_A" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 5 L 1.45 0 H 2.55 L 4 5 H 2.95 L 2.65 4 H 1.3 L 1.6 3 H 2.375 L 2 1.65 L 1.05 5 H 0"
                                  fill="black"></path>
                        </svg>
                        <svg id="Snellen_D" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 0 H 1.5 A 2 2 0 0 1 1.5 5 H 0 V 1 H 1 V 4 H 1.5 A 1 1 0 0 0 1.5 1 H 0 V 0"
                                  fill="black"></path>
                        </svg>
                        <svg id="Snellen_E" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 4,0 4,1 1,1 1,2 3,2 3,3 1,3 1,4 4,4 4,5 0,5" fill="black"/>
                        </svg>
                        <svg id="Snellen_F" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 4,0 4,1 1,1 1,2 3,2 3,3 1,3 1,5 0,5" fill="black"/>
                        </svg>
                        <svg id="Snellen_H" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 1,0 1,2 3,2 3,0 4,0 4,5 3,5 3,3 1,3 1,5 0,5" fill="black"/>
                        </svg>
                        <svg id="Snellen_L" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 1,0 1,4 4,4 4,5 0,5" fill="black"/>
                        </svg>
                        <svg id="Snellen_N" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 1,0 3,3.1 3,0 4,0 4,5 3,5 1,1.9 1,5 0,5" fill="black"/>
                        </svg>
                        <svg id="Snellen_P" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 0 H 2.5 A 1.5 1.5 0 0 1 2.5 3 H 1 V 5 H 0 V 1 H 1 V 2 H 2.5 A 0.5 0.5 0 0 0 2.5 1 H 0 V 0"
                                  fill="black"></path>
                        </svg>
                        <svg id="Snellen_R" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 0 H 2.5 A 1.5 1.5 0 0 1 2.5 3 L 2.9 2.8 L 4 5 H 2.8 L 1.8 3 H 1 V 5 H 0 V 1 H 1 V 2 H 2.5 A 0.5 0.5 0 0 0 2.5 1 H 0 V 0"
                                  fill="black">
                            </path>
                        </svg>
                        <svg id="Snellen_T" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 4,0 4,1 2.5,1 2.5,5 1.5,5 1.5,1 0,1" fill="black"/>
                        </svg>
                        <svg id="Snellen_U" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 0 V 3 A 1.5 1.5 0 1 0 4 3 V 0 H 3 V 3 A 1 1 0 0 1 1 3 V 0 H 0"
                                  fill="black"></path>
                        </svg>
                        <svg id="Snellen_V" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 1.1,0 2,3.5 2.9,0 4,0 2.6,5 1.4,5" fill="black"/>
                        </svg>
                        <svg id="Snellen_X" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 1.2,0 2,1.5 2.8,0 4,0 2.6,2.5 4,5 2.8,5 2,3.5 1.2,5 0,5 1.4,2.5"
                                     fill="black"/>
                        </svg>
                        <svg id="Snellen_Y" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 1.1,0 2,1.5 2.9,0 4,0 2.5,2.5 2.5,5 1.5,5 1.5,2.5" fill="black"/>
                        </svg>
                        <svg id="Snellen_Z" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 4,0 4,1 1.4,4 4,4 4,5 0,5 0,4 2.6,1 0,1" fill="black"/>
                        </svg>
                        <!--new Sloan-->
                        <svg id="Sloan_C" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 5 2 H 4 A 1.5 1.5 0 1 0 4 3 H 5 A 2.5 2.5 0 1 1 5 2" fill="black"></path>
                        </svg>
                        <svg id="Sloan_D" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 0 H 3.5 A 1.5 1.5 0 0 1 5 1.5 V 3.5 A 1.5 1.5 0 0 1 3.5 5 H 0 V 1 H 1 V 4 H 3.5 A 0.5 0.5 0 0 0 4 3.5 V 1.5 A 0.5 0.5 0 0 0 3.5 1 H 0 V 0"
                                  fill="black"></path>
                        </svg>
                        <svg id="Sloan_E" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 5,0 5,1 1,1 1,2 5,2 5,3 1,3 1,4 5,4 5,5 0,5" fill="black"/>
                        </svg>
                        <svg id="Sloan_H" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 1,0 1,2 4,2 4,0 5,0 5,5 4,5 4,3 1,3 1,5 0,5" fill="black"/>
                        </svg>
                        <svg id="Sloan_K" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 1,0 1,1.9 3.4,0 5,0 2.7,1.8 5,5 3.7,5 1.9,2.5 1,3.2 1,5 0,5"
                                     fill="black"/>
                        </svg>
                        <svg id="Sloan_L" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 1,0 1,4 5,4 5,5 0,5" fill="black"/>
                        </svg>
                        <svg id="Sloan_N" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,5 0,0 1,0 4,3.5 4,0 5,0 5,5 4,5 1,1.6 1,5" fill="black"/>
                        </svg>
                        <svg id="Sloan_O" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 2.5 0 A 2.5 2.5 0 1 1 2.499 0z M 2.5 1 A 1.5 1.5 0 1 1 2.499 1z"
                                  fill="#000000" stroke="none" fill-rule="evenodd"></path>
                        </svg>
                        <svg id="Sloan_P" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 0 H 3.5 A 1.5 1.5 0 0 1 3.5 3 H 1 V 5 H 0 V 1 H 1 V 2 H 3.5 A 0.5 0.5 0 1 0 3.5 1 H 0 V 0"
                                  fill="black"></path>
                        </svg>
                        <svg id="Sloan_R" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 0 H 3.5 A 1.5 1.5 0 0 1 3.5 3 L 5 5 H 3.8 L 2.3 3 H 1 V 5 H 0 V 1 H 1 V 2 H 3.5 A 0.5 0.5 0 1 0 3.5 1 H 0 V 0"
                                  fill="black"></path>
                        </svg>
                        <svg id="Sloan_S" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 5 1.5 A 1.5 1.5 0 0 0 3.5 0 H 1.5 A 1.5 1.5 0 0 0 1.5 3 H 3.5 A 0.5 0.5 0 0 1 3.5 4 H 1.5 A 0.5 0.5 0 0 1 1 3.5 H 0 A 1.5 1.5 0 0 0 1.5 5 H 3.5 A 1.5 1.5 0 1 0 3.5 2 H 1.5 A 0.5 0.5 0 1 1 1.5 1 H 3.5 A 0.5 0.5 0 0 1 4 1.5 H 5"
                                  fill="black"></path>
                        </svg>
                        <svg id="Sloan_T" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 5,0 5,1 3,1 3,5 2,5 2,1 0,1" fill="black"/>
                        </svg>
                        <svg id="Sloan_V" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 1.1,0 2.5,3.5 3.9,0 5,0 3,5 2,5" fill="black"/>
                        </svg>
                        <svg id="Sloan_X" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 3.7,5 5,5 1.3,0" fill="black"/>
                            <polygon points="0,5 3.7,0 5,0 1.3,5" fill="black"/>
                        </svg>
                        <svg id="Sloan_Z" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 5,0 5,1 1.6,4 5,4 5,5 0,5 0,4 3.4,1 0,1" fill="black"/>
                        </svg>
                        <!--LandoltC-->
                        <svg id="LandoltC_N" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 5 2 H 4 A 1.5 1.5 0 1 0 4 3 H 5 A 2.5 2.5 0 1 1 5 2" fill="black"
                                  transform="rotate (270 2.5 2.5)"></path>
                        </svg>
                        <svg id="LandoltC_E" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 5 2 H 4 A 1.5 1.5 0 1 0 4 3 H 5 A 2.5 2.5 0 1 1 5 2" fill="black"></path>
                        </svg>

                        <svg id="LandoltC_S" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 5 2 H 4 A 1.5 1.5 0 1 0 4 3 H 5 A 2.5 2.5 0 1 1 5 2" fill="black"
                                  transform="rotate (90 2.5 2.5)"></path>
                        </svg>

                        <svg id="LandoltC_W" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 5 2 H 4 A 1.5 1.5 0 1 0 4 3 H 5 A 2.5 2.5 0 1 1 5 2" fill="black"
                                  transform="rotate (180 2.5 2.5)"></path>
                        </svg>
                        <!--TumblingE-->
                        <svg id="TumblingE_N" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 1,0 1,4 2,4 2,0 3,0 3,4 4,4 4,0 5,0 5,5 0,5" fill="black"/>
                        </svg>
                        <svg id="TumblingE_E" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 5,0 5,1 1,1 1,2 5,2 5,3 1,3 1,4 5,4 5,5 0,5" fill="black"/>
                        </svg>
                        <svg id="TumblingE_S" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 5,0 5,5 4,5 4,1 3,1 3,5 2,5 2,1 1,1 1,5 0,5" fill="black"/>
                        </svg>
                        <svg id="TumblingE_W" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <polygon points="0,0 5,0 5,5 0,5 0,4 4,4 4,3 0,3 0,2 4,2 4,1 0,1" fill="black"/>
                        </svg>
                        <!--Vanishing Sloan-->
                        <svg id="VanSloan_C" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path class="white"
                                  d="M 5 2 H 4 A 1.52 1.5 0 1 0 4 3 H 4.5 V 3.25 H 4.18 A 1.78 1.75 0 1 1 4.18 1.75 H 4.69 A 2.29 2.27 0 1 0 4.69 3.25 H 4.5 V 3 H 5 A 2.52 2.5 0 1 1 5 2"
                                  fill="white" stroke="none"></path>
                            <path d="M 4.7 1.75 A 2.29 2.27 0 1 0 4.7 3.25 H 4.18 A 1.78 1.75 0 1 1 4.18 1.75 H 4.69"
                                  fill="black" stroke="none"></path>
                        </svg>
                        <svg id="VanSloan_D" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path class="white"
                                  d="M 0 0 H 3.5 A 1.5 1.5 0 0 1 5 1.5 V 3.5 A 1.5 1.5 0 0 1 3.5 5 H 0 V 0.25 H 0.25 V 4.75 H 3.5 A 1.25 1.25 0 0 0 4.75 3.5 V 1.5 A 1.25 1.25 0 0 0 3.5 0.25 H 0 V 0"
                                  stroke="none" fill="white"></path>
                            <path class="white"
                                  d="M 0.75 0.75 H 3.5 A 0.75 0.75 0 0 1 4.25 1.5 V 3.5 A 0.75 0.75 0 0 1 3.5 4.25 H 0.75 V 1 H 1 V 4 H 3.5 A 0.5 0.5 0 0 0 4 3.5 V 1.5 A 0.5 0.5 0 0 0 3.5 1 H 0.75 V 0.75"
                                  stroke="none" fill="white"></path>
                            <path d="M 0.25 0.25 H 3.5 A 1.25 1.25 0 0 1 4.75 1.5 V 3.5 A 1.25 1.25 0 0 1 3.5 4.75 H 0.25 V 0.75 H 0.75 V 4.25 H 3.5 A 0.75 0.75 0 0 0 4.25 3.5 V 1.5 A 0.75 0.75 0 0 0 3.5 0.75 H 0.25 V 0.25"
                                  stroke="none" fill="black"></path>
                        </svg>
                        <svg id="VanSloan_E" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path class="white"
                                  d="M 0 0 H 5 V 1 H 1 V 2 H 5 V 3 H 1 V 4 H 5 V 5 H 0 V 0.25 H 0.25 V 4.75 H 4.75 V 4.25 H 0.75 V 2.75 H 4.75 V 2.25 H 0.75 V 0.75 H 4.75 V 0.25 H 0 V 0"
                                  fill="white" stroke="none"></path>
                            <path d="M 0.25 0.25 H 4.75 V 0.75 H 0.75 V 2.25 H 4.75 V 2.75 H 0.75 V 4.25 H 4.75 V 4.75 H 0.25 V 0.25"
                                  fill="black" stroke="none"></path>
                        </svg>
                        <svg id="VanSloan_H" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0.24 0.24 H 0.76 V 2.24 H 4.24 V 0.24 H 4.76 V 4.76 H 4.24 V 2.76 H 0.76 V 4.76 H 0.24 V 0.24"
                                  fill="black" stroke="none"></path>
                            <path class="white"
                                  d="M 0 0 H 1 V 2 H 4 V 0 H 5 V 5 H 4 V 3 H 1 V 5 H 0 V 0.24 H 0.24 V 4.76 H 0.76 V 2.76 H 4.24 V 4.76 H 4.76 V 0.24 H 4.24 V 2.24 H 0.76 V 0.24 H 0 V 0"
                                  fill="white" stroke="none"></path>
                        </svg>
                        <svg id="VanSloan_K" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path class="white"
                                  d="M 0 0 H 1 V 1.9 L 3.4 0 H 5 L 2.7 1.8 L 5 5 H 3.7 L 1.9 2.5 L 1 3.2 V 5 H 0 V 0.25 H 0.25 V 4.75 H 0.75 V 3.1 L 1.92 2.18 L 3.8 4.78 H 4.6 L 2.42 1.77 L 4.4 0.22 H 3.5 L 1 2.2 H 0.75 V 0.25 H 0"
                                  fill="white" stroke="none"></path>
                            <path d="M 0.25 0.25 V 4.75 H 0.75 V 3.1 L 1.92 2.18 L 3.8 4.78 H 4.6 L 2.42 1.77 L 4.4 0.22 H 3.5 L 1 2.2 H 0.75 V 0.25 H 0.25"
                                  fill="black" stroke="none"></path>
                        </svg>
                        <svg id="VanSloan_L" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0.25 0.25 H 0.75 V 4.25 H 4.75 V 4.75 H 0.25 V 0.25" stroke="none"
                                  fill="black"></path>
                            <path class="white"
                                  d="M 0 0 H 1 V 4 H 5 V 5 H 0 V 0.23 H 0.23 V 4.77 H 4.77 V 4.23 H 0.77 V 0.23 H 0 V 0"
                                  stroke="none" fill="white"></path>
                        </svg>
                        <svg id="VanSloan_N" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path class="white"
                                  d="M 0 0 H 1.3 L 4 3.7 V 0 H 5 V 5 H 3.7 L 1 1.3 V 5 H 0 V 0.25 H 0.25 V 4.75 H 0.75 V 0.75 H 0.92 L 3.83 4.75 H 4.75 V 0.25 H 4.25 V 4.25 H 4.07 L 1.17 0.25 H 0 V 0"
                                  stroke="none" fill="white"></path>
                            <path d="M 0.25 0.25 V 4.75 H 0.75 V 0.75 H 0.92 L 3.83 4.75 H 4.75 V 0.25 H 4.25 V 4.25 H 4.07 L 1.17 0.25 H 0.25"
                                  fill="black" stroke="none"></path>
                        </svg>
                        <svg id="VanSloan_O" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path class="white" d="M 2.5 0 A 2.5 2.5 0 1 1 2.5 5 V 4 A 1.5 1.5 0 1 0 2.5 1 V 0"
                                  fill="white" stroke="none"></path>
                            <path d="M 2.5 0.25 C 5.55 0.35 5.55 4.65 2.5 4.75 V 4.25 C 4.8 4.15 4.8 0.85 2.5 0.75 V 0.25"
                                  fill="black" stroke="none"></path>
                            <path class="white" d="M 2.5 0 A 2.5 2.5 0 1 0 2.5 5 V 4 A 1.5 1.5 0 1 1 2.5 1 V 0"
                                  fill="white" stroke="none"></path>
                            <path d="M 2.5 0.25 C -0.55 0.35 -0.55 4.65 2.5 4.75 V 4.25 C 0.2 4.15 0.2 0.85 2.5 0.75 V 0.25"
                                  fill="black" stroke="none"></path>

                        </svg>
                        <svg id="VanSloan_P" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path class="white"
                                  d="M 0 0 H 3.5 A 1.5 1.5 0 0 1 3.5 3 H 1 V 5 H 0 V 0.25 H 0.25 V 4.75 H 0.75 V 2.75 H 3.5 A 1.25 1.25 0 0 0 3.5 0.25 H 0 V 0"
                                  fill="white" stroke="none"></path>
                            <path d="M 0.25 0.25 H 3.5 A 1.25 1.25 0 0 1 3.5 2.75 H 0.75 V 4.74 H 0.25 V 0.75 H 0.75 V 2.25 H 3.5 A 0.75 0.75 0 0 0 3.5 0.75 H 0.25 V 0.25"
                                  fill="black" stroke="none"></path>
                            <path class="white"
                                  d="M 0.75 0.75 H 3.5 A 0.75 0.75 0 0 1 3.5 2.25 H 0.75 V 1 H 1 V 2 H 3.5 A 0.5 0.5 0 0 0 3.5 1 H 0.75 V 0.75"
                                  fill="white" stroke="none"></path>
                        </svg>
                        <svg id="VanSloan_R" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path class="white"
                                  d="M 0 0 H 3.5 A 1.5 1.5 0 0 1 3.5 3 L 5 5 H 3.7 L 2.2 3 H 1 V 5 H 0 V 0.25 H 0.25 V 4.75 H 0.75 V 2.75 H 2.35 L 3.85 4.75 H 4.5 L 3 2.75 H 3.5 A 1.25 1.25 0 0 0 3.5 0.25 H 0 V 0"
                                  fill="white" stroke="none"></path>
                            <path d="M 0.25 0.25 H 3.5 A 1.25 1.25 0 0 1 3.5 2.75 H 3 L 4.5 4.75 H 3.85 L 2.35 2.75 H 0.75 V 4.74 H 0.25 V 0.75 H 0.75 V 2.25 H 3.5 A 0.75 0.75 0 0 0 3.5 0.75 H 0.25 V 0.25"
                                  fill="black" stroke="none"></path>
                            <path class="white"
                                  d="M 0.75 0.75 H 3.5 A 0.75 0.75 0 0 1 3.5 2.25 H 0.75 V 1 H 1 V 2 H 3.5 A 0.5 0.5 0 0 0 3.5 1 H 0.75 V 0.75"
                                  fill="white" stroke="none"></path>
                        </svg>
                        <svg id="VanSloan_S" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path class="white"
                                  d="M 5 1.5 A 1.5 1.5 0 0 0 3.5 0 H 1.5 A 1.5 1.5 0 0 0 1.5 3 H 3.5 A 0.5 0.5 0 0 1 3.5 4 H 1.5 A 0.5 0.5 0 0 1 1 3.5 H 0 A 1.5 1.5 0 0 0 1.5 5 H 3.5 A 1.5 1.5 0 1 0 3.5 2 H 1.5 A 0.5 0.5 0 1 1 1.5 1 H 3.5 A 0.5 0.5 0 0 1 4 1.5 H 4.25 V 1.25 A 0.75 0.75 0 0 0 3.5 0.75 H 1.5 A 0.75 0.75 0 0 0 1.5 2.25 H 3.5 A 1.25 1.25 0 0 1 3.5 4.75 H 1.5 A 1.25 1.25 0 0 1 0.25 3.75 H 0.75 A 0.75 0.75 0 0 0 1.5 4.25 H 3.5 A 0.75 0.75 0 0 0 3.5 2.75 H 1.5 A 1.25 1.25 0 0 1 1.5 0.25 H 3.5 A 1.25 1.25 0 0 1 4.75 1.25 H 4.25 V 1.5 H 5"
                                  fill="white" stroke="none"></path>
                            <path d="M4.75 1.25 A 1.25 1.25 0 0 0 3.5 0.25 H 1.5 A 1.25 1.25 0 0 0 1.5 2.75 H 3.5 A 0.75 0.75 0 0 1 3.5 4.25 H 1.5 A 0.75 0.75 0 0 1 0.75 3.75 H 0.25 A 1.25 1.25 0 0 0 1.5 4.75 H 3.5 A 1.25 1.25 0 1 0 3.5 2.25 H 1.5 A 0.75 0.75 0 1 1 1.5 0.75 H 3.5 A 0.75 0.75 0 0 1 4.25 1.25 H 4.75"
                                  fill="black" stroke="none"></path>
                        </svg>
                        <svg id="VanSloan_T" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0.25 0.25 H 4.75 V 0.75 H 2.75 V 4.75 H 2.25 V 0.75 H 0.25 V 0.25" fill="black"
                                  stroke="none"></path>
                            <path class="white"
                                  d="M 0 0 H 5 V 1 H 3 V 5 H 2 V 1 H 0 V 0.24 H 0.24 V 0.76 H 2.24 V 4.76 H 2.76 V 0.76 H 4.76 V 0.24 H 0 V 0"
                                  fill="white" stroke="none"></path>
                        </svg>
                        <svg id="VanSloan_V" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path class="white"
                                  d="M 0 0 H 1.1 L 2.5 3.5 L 3.9 0 H 5 L 3 5 H 2 L 0.1 0.25 H 0.35 L 2.15 4.75 H 2.85 L 4.65 0.25 H 4.05 L 2.5 4.1 L 0.95 0.25 H 0.1 L 0 0"
                                  fill="white" stroke="none"></path>
                            <path d="M 0.35 0.25 H 0.95 L 2.5 4.1 L 4.05 0.25 H 4.65 L 2.85 4.75 H 2.15 L 0.35 0.25"
                                  fill="black" stroke="none"></path>
                        </svg>
                        <svg id="VanSloan_X" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path class="white"
                                  d="M 0 0 H 1.3 L 2.5 1.62 L 3.7 0 H 5 L 3.15 2.5 L 5 5 H 3.7 L 2.5 3.38 L 1.3 5 H 0 L 1.85 2.5 L 0 0"
                                  fill="white" stroke="none"></path>
                            <path d="M 0.43 0.22 H 1.18 L 2.5 1.97 L 3.82 0.22 H 4.57 L 2.87 2.5 L 4.57 4.78 H 3.82 L 2.5 3.03 L 1.18 4.78 H 0.43 L 2.13 2.5 L 0.43 0.22"
                                  fill="black" stroke="none"></path>
                        </svg>
                        <svg id="VanSloan_Z" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path class="white"
                                  d="M 0 0 H 5 V 1 L 1.7 4 H 5 V 5 H 0 V 4 L 3.4 1 H 0 V 0.23 H 0.23 V 0.77 H 4 L 0.23 4.1 V 4.77 H 4.77 V 4.23 H 1.05 L 4.77 0.9 V 0.23 H 0 V 0"
                                  fill="white" stroke="none"></path>
                            <path d="M 0.23 0.23 H 4.77 V 0.9 L 1.05 4.23 H 4.77 V 4.77 H 0.23 V 4.1 L 4 0.77 H 0.23 V 0.23"
                                  fill="black" stroke="none"></path>
                        </svg>
                        <!--new Shapes 5x5-->
                        <svg id="Shape5_0" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M2 0H3V2H5V3H3V5H2V3H0V2H2z" fill="black" stroke="none"></path>
                        </svg>
                        <svg id="Shape5_M" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M0 2H5V3H3.2L4.5 5H3.3L2.5 3.8L1.7 5H0.5L1.8 3H0z" fill="black"></path>
                            <circle cx="2.5" cy="1" r="1" fill="black" stroke="none"></circle>
                        </svg>
                        <svg id="Shape5_1" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M0 0H5V5H0V1H1V4H4V1H0z" fill="black" stroke="none"></path>
                        </svg>
                        <svg id="Shape5_2" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M0 5L2.5 0L5 5H3.7L2.5 2.5L1.3 5z" fill="black" stroke="none"></path>
                        </svg>
                        <svg id="Shape5_3" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M2.5 0 A 2.5 2.5 0 0 1 2.5 5 V 4 A 1.5 1.5 0 0 0 2.5 1 A 1.5 1.5 0 0 0 2.5 4 V 5 A 2.5 2.5 0 0 1 2.5 0"
                                  fill="black" stroke="none"></path>
                        </svg>
                        <svg id="Shape5_4" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M2 0H3V2L2.5 2.5L2 2zz" fill="black" stroke="none"></path>
                            <path d="M2 0H3V2L2.5 2.5L2 2zz" fill="black" stroke="none"
                                  transform="rotate(72,2.5,2.5)"></path>
                            <path d="M2 0H3V2L2.5 2.5L2 2zz" fill="black" stroke="none"
                                  transform="rotate(144,2.5,2.5)"></path>
                            <path d="M2 0H3V2L2.5 2.5L2 2zz" fill="black" stroke="none"
                                  transform="rotate(216,2.5,2.5)"></path>
                            <path d="M2 0H3V2L2.5 2.5L2 2zz" fill="black" stroke="none"
                                  transform="rotate(288,2.5,2.5)"></path>
                        </svg>
                        <!-- Chinese01 - experimental -->
                        <svg id="Chinese01_0" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M0 0H5V1H2.25L2.1 2H4.5V4H5V5H3.5V3H1.9L1.5 4H3.5V5H0V4H0.5L0.9 3H0.5V2H1.1L1.25 1H0V0z"
                                  fill="black"></path>
                        </svg>
                        <svg id="Chinese01_1" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M2 0H3V1H5V4H3V3H4V2H3V5H2V4H0V1H2V2H1V3H2V0z" fill="black"></path>
                        </svg>
                        <svg id="Chinese01_2" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M1 0H2V1H5V2H2V4H4V3H5V5H1V2H0V1H1V0z" fill="black"></path>
                        </svg>
                        <svg id="Chinese01_3" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M0 0H5V2H4V1H1V2H5V5H0V3H1V4H4V3H0V0z" fill="black"></path>
                        </svg>
                        <svg id="Chinese01_4" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M0 1H1.9L2 0H3L3.1 1H5V2H3.4C3.8 3 4.2 4 5 5H3.8C3.2 4 2.8 3.3 2.5 2.3C2.2 3.3 1.8 4 1.2 5H0C0.8 4 1.2 3 1.6 2H0V1z"
                                  fill="black"></path>
                        </svg>
                        <svg id="Chinese01_5" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M0.5 0H4.5V1H0.5V0zM0.5 2H4.5V3H0.5V2zM0 4H5V5H0V4z" fill="black"></path>
                        </svg>
                        <svg id="Chinese01_6" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M2 0H3V1H5V2H3V4H5V5H0V4H2V0z" fill="black"></path>
                        </svg>
                        <svg id="Chinese01_7" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,6,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M1 0H2V5H0V4H1V0zM3 0H4V4H3V0zM5 0H6V5H5V0z" fill="black"></path>
                        </svg>
                        <svg id="Chinese01_8" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M0.5 0H4.5V1H3V4H5V5H0V4H2V1H0.5V0z" fill="black"></path>
                        </svg>
                        <svg id="Chinese01_9" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M0 1H2.1L2.2 0H3.2L3.1 1H4A1 1 0 0 1 5 2V4A1 1 0 0 1 4 5H3V4H3.75A0.25 0.25 0 0 0 4 3.75V2.25A0.25 0.25 0 0 0 3.75 2H2.9C2.55 3 1.9 4 1.2 5H0C0.8 4 1.4 3 1.9 2H0V1z"
                                  fill="black"></path>
                        </svg>
                        <!-- Arabic - experimental - thanks to Alice Kswani -->
                        <svg id="Arabic01_0" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm"
                             style="margin: 3.49mm;">
                            <path d="M1 0H3V1H2V2H3V3H0V2H1V0zM4 0H5V5H0V4H4V0z" fill="black"></path>
                        </svg>
                        <svg id="Arabic01_1" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm"
                             style="margin: 3.49mm;">
                            <path d="M0 1H1V4H4V3H2V0H5V1H3V2H5V5H0V1z" fill="black"></path>
                        </svg>
                        <svg id="Arabic01_2" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm"
                             style="margin: 3.49mm;">
                            <path d="M0 2H1V4H4V2H5V5H0V2zM1 0H2V1H1V0M3 0H4V1H3V0z" fill="black"></path>
                        </svg>
                        <svg id="Arabic01_3" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm"
                             style="margin: 3.49mm;">
                            <path d="M2 0H5V5H0V4H4V3H2V1H3V2H4V1H2V0z" fill="black"></path>
                        </svg>
                        <svg id="Arabic01_4" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm"
                             style="margin: 3.49mm;">
                            <path d="M0 2H1V4H4V0H5V5H0V2z" fill="black"></path>
                        </svg>
                        <svg id="Arabic01_5" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm"
                             style="margin: 3.49mm;">
                            <path d="M0 0H1V2H4V0H5V3H0V0zM2 4H3V5H2V4z" fill="black"></path>
                        </svg>
                        <svg id="Arabic01_6" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm"
                             style="margin: 3.49mm;">
                            <path d="M0 0H5V1H2.5C1 3 1 4 2 4H5V5H1.5C-0.25 5 -0.25 3 1.25 1H0V0z" fill="black"></path>
                        </svg>
                        <svg id="Arabic01_7" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm"
                             style="margin: 3.49mm;">
                            <path d="M1 0H2A3 3 0 0 1 5 3V5H0V4H4V3.5A2.5 2.5 0 0 0 1.5 1H1V0z" fill="black"></path>
                        </svg>
                        <svg id="Arabic01_8" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm"
                             style="margin: 3.49mm;">
                            <path d="M1 0H2V2H5V5H2V4H4V3H2V5H0V4H1V0z" fill="black"></path>
                        </svg>
                        <svg id="Arabic01_9" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm"
                             style="margin: 3.49mm;">
                            <path d="M2 0H5V1H3V2H4V3H1V4H5V5H0V2H2V0z" fill="black"></path>
                        </svg>
                        <!-- Hebrew01 -->
                        <svg id="Hebrew01_0" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M0 0 V2 C 0 5.8 4.6 5.78 4.8 3 L5 0 H 4 L3.8 3 C 3.55 4.5 1.4 4.1 1.2 3 Q 2.8 3 2.9 2 L 3 0 H 2 L 1.9 1.5 Q 1.8 2.1 1 2 V 0 H 0"
                                  fill="black"></path>
                        </svg>
                        <svg id="Hebrew01_1" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M0 0H 1.1 L2.15 2.55C2.6 2 2.8 1.5 2.95 0L4 0.2C3.8 2.5 3 4 0.2 5L0 3.95C0.5 3.7 0.7 3.7 1.3 3.3L0 0z"
                                  fill="black"></path>
                        </svg>
                        <svg id="Hebrew01_2" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 0 H 3 Q 4.9 0 5 2.5 V 5 5 H 4 V 3.5 Q 4.15 0.9 2.5 1 H 2 V 4 Q 2 4.9 1 5 H 0 V 4 Q 1.05 4.1 1 3.5 V 1 H 0 V 0"
                                  fill="black"></path>
                        </svg>
                        <svg id="Hebrew01_3" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 0.25 C 5.3 -1.4 5.3 6.4 0 4.75 V 3.75 C 4 5.4 3.7 0 0.9 0.9 V 1.5 Q 0.9 2.4 1.5 2.2 V 3.1 Q 0.1 3.3 0 1.5 V 0.25"
                                  fill="black"></path>
                        </svg>
                        <svg id="Hebrew01_4" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 0 H 1.1 L 2.3 2.1 Q 3.1 1.8 3 0 H 4 Q 4.1 2.2 2.8 3 L 4 5 H 2.9 L 1.35 2.3 Q 1.1 2.4 1.1 3 L 1 5 H 0 Q 0 1.8 0.8 1.4 L 0 0"
                                  fill="black"></path>
                        </svg>
                        <svg id="Hebrew01_5" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,3.5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0.5 0 H 1.5 Q 2.9 0.2 3 1.5 V 3.5 L 3.5 5 H 2.5 L 2.1 3.8 Q 1 3.7 1 5 H 0 Q 0 3 2 2.85 V 2 Q 2 1 1 1 H 0.5 V 0"
                                  fill="black"></path>
                        </svg>
                        <svg id="Hebrew01_6" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 0.25 C 5.3 -1.4 5.3 6.4 0 4.75 V 3.75 C 4 5.4 4 -0.4 0 1.25 V 0.25"
                                  fill="black"></path>
                        </svg>
                        <svg id="Hebrew01_7" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 0 L 2.8 4 H 0 V 5 H 4 V 3.9 L 2.9 2.4 Q 4 2 4 1 V 0 H 3 V 0.5 Q 3 1.4 2.4 1.7 L 1.2 0 H 0"
                                  fill="black"></path>
                        </svg>
                        <svg id="Hebrew01_8" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,4,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 0 H 4 V 1 H 3 V 5 H 2 V 1 H 0 V 0" fill="black"></path>
                        </svg>
                        <svg id="Hebrew01_9" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg" version="1.1"
                             viewBox="0,0,5,5" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M 0 0 H 2 Q 4 0 4 2 V 4 H 5 V 5 H 0 V 4 H 3 V 2.5 Q 3 1.1 2 1 H 0 V 0"
                                  fill="black"></path>
                        </svg>
                        <!-- Crowded HOTV -->
                        <svg id="CrowdedHOTV01_0" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg"
                             version="1.1" viewBox="0,0,8,9" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M2 0H6V1H2V0zM7 2H8V7H7V2zM2 8H6V9H2V8zM0 2H1V7H0V2z" fill="black"></path>
                            <path d="M2 2H3V4H5V2H6V7H5V5H3V7H2V2z" fill="black"></path>
                        </svg>
                        <svg id="CrowdedHOTV01_1" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg"
                             version="1.1" viewBox="0,0,9,9" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M2 0H7V1H2V0zM8 2H9V7H8V2zM2 8H7V9H2V8zM0 2H1V7H0V2z" fill="black"></path>
                            <path d="M 4.5 2 A 2.5 2.5 0 1 1 4.499 2z M4.5 3A 1.5 1.5 0 1 1 4.499 3z"
                                  fill="#000000" stroke="none" fill-rule="evenodd"></path>
                        </svg>
                        <svg id="CrowdedHOTV01_2" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg"
                             version="1.1" viewBox="0,0,8,9" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M2 0H6V1H2V0zM7 2H8V7H7V2zM2 8H6V9H2V8zM0 2H1V7H0V2z" fill="black"></path>
                            <path d="M2 2H6V3H4.5V7H3.5V3H2V2z" fill="black"></path>
                        </svg>
                        <svg id="CrowdedHOTV01_3" class="optotype-symbol" xmlns="http://www.w3.org/2000/svg"
                             version="1.1" viewBox="0,0,8,9" height="8.73mm" style="margin: 3.49mm;">
                            <path d="M2 0H6V1H2V0zM7 2H8V7H7V2zM2 8H6V9H2V8zM0 2H1V7H0V2z" fill="black"></path>
                            <path d="M2 2H3.1L4 5.2L4.9 2H6L4.5 7H3.5L2 2z" fill="black"></path>
                        </svg>
                        <svg id="Auckland_A" xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 41.15 41.14" class="optotype-symbol"  version="1.1" >
                          <defs><style>.a{fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:5px;}
                          </style></defs>
                          <title>butterfly</title>
                          <path class="a" d="M35.67,19.72a22.05,22.05,0,0,0,3-11.26c-.19-2.92-1.79-6-5.13-6-3.7,0-7.09,3.3-8.48,6.26-1.17,2.5-.41,6.67-4.46,6.8-4-.13-3.29-4.3-4.46-6.8-1.38-3-4.77-6.21-8.47-6.26-3.35,0-4.95,3-5.13,6a22.05,22.05,0,0,0,3,11.26c2.38,4-1.87,6.79-1.06,10.85.6,3,3.47,7.74,6.87,8.05s4.85-6.63,6.17-8.87a3.91,3.91,0,0,1,6.24,0C25,32,26.32,39,29.86,38.63s6.27-5.07,6.87-8.05C37.54,26.51,33.29,23.76,35.67,19.72Z"/></svg>
                          
                          

                          <svg id="Auckland_B" xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 41.14 41.14"  class="optotype-symbol"  version="1.1" >
                          <defs><style>.a{fill:none;stroke:#000;stroke-linejoin:round;stroke-width:5px;fill-rule:evenodd;}</style></defs><title>car</title><path class="a" d="M26.11,2.52A16.7,16.7,0,0,1,33.9,4.86a2.44,2.44,0,0,1,1,1.9c.18,1.94.49,3.86.76,5.79.3,2.1.65,4.2,1,6.29.45,2.72.93,5.44,1.39,8.16.26,1.51.26,3,.56,4.55.06.29-.07.41-.35.41-.5,0-1,0-1.5,0s-.5.15-.52.53a7.34,7.34,0,0,1-1.43,4.16,4.55,4.55,0,0,1-7.57,0,7.39,7.39,0,0,1-1.43-4.16c0-.39-.15-.52-.54-.52-3,0-6,0-8.95,0-.59,0-.58.42-.6.76a7.14,7.14,0,0,1-1.55,4.12,4.49,4.49,0,0,1-6.31.9,6.46,6.46,0,0,1-2.47-4.9c-.07-.81-.09-.87-.92-.87-.48,0-1,0-1.44,0s-.53-.18-.54-.57a13.6,13.6,0,0,1,.31-2.54q.5-3.33,1-6.65c.2-1.31.39-2.63.63-3.94.17-.92.65-1.22,2-1.3,2-.13,4-.23,6-.38.56,0,1.11-.12,1.67-.11.38,0,.56-.17.63-.56a56.73,56.73,0,0,0,.74-7.23,7.49,7.49,0,0,1,.65-3.42,3.3,3.3,0,0,1,2.5-1.74c1.7-.29,3.4-.59,5.12-.81A10.56,10.56,0,0,1,26.11,2.52Z"/></svg>

                          <svg id="Auckland_C" xmlns="http://www.w3.org/2000/svg" 
                          class="optotype-symbol"  version="1.1"  
                          viewBox="0 0 41.14 41.14">
                          <defs><style>.a{fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:5px;fill-rule:evenodd;}</style></defs><title>duck</title><path class="a" d="M22,38.63A23.17,23.17,0,0,1,10.39,36a14.45,14.45,0,0,1-7.29-9.09,16.68,16.68,0,0,1-.57-5.38A9.78,9.78,0,0,1,3.42,18,12.68,12.68,0,0,1,5,15.07a3.85,3.85,0,0,1,.58-.61,1,1,0,0,1,1.58.1c.68.7,1.32,1.44,2,2.13a6.85,6.85,0,0,0,4.83,2,15.26,15.26,0,0,0,4.9-.6c.46-.14.55-.35.41-.78A7.13,7.13,0,0,0,18,15.21a6.62,6.62,0,0,1-1.46-4.32,7.78,7.78,0,0,1,1.51-4.39A9.22,9.22,0,0,1,23.55,2.7a7.18,7.18,0,0,1,6.36,1.55,15.13,15.13,0,0,1,3,3.25A2.9,2.9,0,0,0,35.1,8.72c.71.08,1.43.1,2.14.13,1.16,0,1.64.72,1.29,1.85a6.81,6.81,0,0,1-2.66,3.57c-1,.72-2.09,1.31-3.13,2-.34.21-.45.33-.15.71,1.16,1.44,2.36,2.84,3.38,4.39a10.12,10.12,0,0,1,1.82,6.84,9.68,9.68,0,0,1-2.44,5.53c-2.49,2.76-5.75,4-9.29,4.57A21,21,0,0,1,22,38.63Z"/></svg>
                          

                          <svg id="Auckland_D" xmlns="http://www.w3.org/2000/svg" 
                          class="optotype-symbol"  version="1.1"  
                          viewBox="0 0 41.98 40.5"><defs><style>.a{fill:none;stroke:#000;stroke-linejoin:round;stroke-width:5px;fill-rule:evenodd;}</style></defs><title>flower</title><path class="a" d="M13.95,29a17.48,17.48,0,0,1-2.2,1.14,6.86,6.86,0,0,1-4.84.08,7.21,7.21,0,0,1-4.07-8.88,5.85,5.85,0,0,1,3.69-4c1-.35,2-.66,3.1-.94A18.58,18.58,0,0,1,7.5,14.12,6.22,6.22,0,0,1,6.18,9.6a7.08,7.08,0,0,1,3.09-5,7.17,7.17,0,0,1,6.15-1.29A7.61,7.61,0,0,1,20.09,7.1L20.6,8c.42-.78.77-1.5,1.2-2.18A7,7,0,0,1,30,2.91a7.43,7.43,0,0,1,4.57,4.4,5.79,5.79,0,0,1-.86,5.75c-.55.76-1.21,1.42-1.84,2.23.52.07,1,.11,1.47.19a7.91,7.91,0,0,1,4,1.81,6.06,6.06,0,0,1,2,5.63,7.53,7.53,0,0,1-3.08,5.38,7.18,7.18,0,0,1-6.39.89,11.59,11.59,0,0,1-2.14-.79,14.16,14.16,0,0,1,.24,3,6.66,6.66,0,0,1-4.25,6,8.54,8.54,0,0,1-5.38.31,6.09,6.09,0,0,1-4-3.25,7.4,7.4,0,0,1-.61-3.7C13.87,30.18,13.91,29.61,13.95,29Z"/></svg>
                       

                          <svg id="Auckland_E" xmlns="http://www.w3.org/2000/svg" 
                          class="optotype-symbol"  version="1.1"  
                          viewBox="0 0 41.14 41.14"><defs><style>.a{fill:none;stroke:#000;stroke-linejoin:round;stroke-width:5px;}</style></defs><title>heart</title><path class="a" d="M38.59,12.48c-.86-11.42-12.46-13.38-18-4.1C15-.91,3.42,1.06,2.55,12.48,1.84,21.87,8.14,29.3,14.77,34.79a33.74,33.74,0,0,0,5.8,3.85,33.52,33.52,0,0,0,5.81-3.85C33,29.3,39.3,21.87,38.59,12.48Z"/></svg>
                          

                          <svg id="Auckland_F" xmlns="http://www.w3.org/2000/svg" 
                          class="optotype-symbol"  version="1.1"  
                          viewBox="0 0 41.14 41.14"><defs><style>.a{fill:none;stroke:#000;stroke-linejoin:round;stroke-width:5px;}</style></defs><title>house</title><path class="a" d="M38.64,16.55a.83.83,0,0,0-.4-.85,9.06,9.06,0,0,1-.89-.7L28.81,8.55l-7.91-6a1,1,0,0,0-.66,0l-7.91,6L3.79,15a9,9,0,0,1-.89.7.83.83,0,0,0-.4.85q0,4.67,0,9.35c0,4,0,8,0,11.93,0,.65.16.81.83.8,3.53,0,7,0,10.56,0,.62,0,.78-.18.77-.78,0-2.92,0-8,0-11,0-.53.19-.7.74-.68l5.14,0h.09l5.14,0c.55,0,.74.15.74.68,0,2.92,0,8,0,11,0,.6.15.79.77.78,3.53,0,7,0,10.56,0,.67,0,.83-.15.83-.8,0-4,0-8,0-11.93Q38.64,21.23,38.64,16.55Z"/></svg>
                          

                          <svg id="Auckland_G" xmlns="http://www.w3.org/2000/svg" 
                          class="optotype-symbol"  version="1.1"  
                          viewBox="0 0 41.14 41"><defs><style>.a{fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:5px;}</style></defs><title>moon</title><path class="a" d="M27.81,25.33A6.72,6.72,0,0,1,25,22.1a5.21,5.21,0,0,1,0-3.2,6.72,6.72,0,0,1,2.79-3.23c1.83-1.33,9.31-4.86,10.43-6.09.52-.57.56-.95,0-1.42-.24-.21-.85-.83-1.1-1A22.63,22.63,0,0,0,23.41,2.5,21.1,21.1,0,0,0,18.76,3,20.78,20.78,0,0,0,5.9,10.7a16.15,16.15,0,0,0-3.37,8.93c0,.27,0,.79,0,.79h0s0,0,0,.07,0,0,0,.07h0s0,.53,0,.79A16.15,16.15,0,0,0,5.9,30.3,20.78,20.78,0,0,0,18.76,38a21.06,21.06,0,0,0,4.65.45,22.64,22.64,0,0,0,13.71-4.63c.25-.19.86-.81,1.1-1,.58-.48.54-.85,0-1.42C37.13,30.19,29.65,26.66,27.81,25.33Z"/></svg>


                          <svg id="Auckland_H" xmlns="http://www.w3.org/2000/svg" 
                          class="optotype-symbol"  version="1.1"  
                          viewBox="0 0 41.14 41.14"><defs><style>.a{fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:5px;}</style></defs><title>rabbit</title><path class="a" d="M36,23c-1.59-1.56-4.59-1.86-3.46-4.61a31.35,31.35,0,0,0,2.21-9.21A7.22,7.22,0,0,0,33,3.76c-1.13-1-1.62-1.59-3.3-1.05-3.33,1.05-4.27,3.57-4.87,6.42-.36,1.7-.42,4.33-1.24,5.57a3.92,3.92,0,0,1-3,1.78,3.92,3.92,0,0,1-3-1.78c-.82-1.25-.88-3.87-1.24-5.57-.6-2.85-1.54-5.37-4.87-6.42-1.68-.53-2.17,0-3.3,1.05A7.22,7.22,0,0,0,6.42,9.21a31.38,31.38,0,0,0,2.21,9.21C9.76,21.17,6.75,21.47,5.17,23c-6.53,6.41.22,12.24,6.46,14.13a45.41,45.41,0,0,0,8.94,1.49,45,45,0,0,0,8.95-1.49C35.76,35.27,42.51,29.44,36,23Z"/></svg>


                          <svg id="Auckland_I" xmlns="http://www.w3.org/2000/svg" 
                          class="optotype-symbol"  version="1.1"  
                          viewBox="0 0 41.14 41.14"><defs><style>.a{fill:none;stroke:#231f20;stroke-miterlimit:10;stroke-width:5px;}</style></defs><title>rocket</title><path class="a" d="M37,28.37c-.77-.6-1.86-1.43-2.9-2.08-1.21-.89-.75-2-.63-3.21.28-2.17.28-1.81.46-3.52.35-3.32-1.31-7.2-3.66-9.89A38,38,0,0,0,24.9,4.84C23,3.35,21.78,2.57,20.61,2.5h-.07c-1.17.07-2.4.84-4.29,2.34a38,38,0,0,0-5.36,4.82c-2.35,2.69-4,6.58-3.66,9.89.18,1.71.18,1.36.46,3.52.12,1.21.58,2.32-.63,3.21-1,.65-2.13,1.49-2.9,2.08C2.59,29.43,2,30.26,3,31.92a28.46,28.46,0,0,0,4.34,5.74c1.32,1.19,2,1.5,3.95-.22,1-.9,1.65-1.64,3.06-3,2.41-2.34,2.95-2.28,4-2.34h4.48c1,.06,1.56,0,4,2.34,1.41,1.37,2,2.1,3.06,3,2,1.72,2.63,1.42,3.95.22a28.45,28.45,0,0,0,4.34-5.74C39.16,30.26,38.55,29.43,37,28.37Z"/></svg>
                          

                          <svg id="Auckland_G" xmlns="http://www.w3.org/2000/svg" 
                          class="optotype-symbol"  version="1.1"  
                          viewBox="0 0 41.14 41.14"><defs><style>.a{fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:5px;fill-rule:evenodd;}</style></defs><title>tree</title><path class="a" d="M22.86,38.64c-2-.05.33,0,0,0a26.84,26.84,0,0,1-6-.8c-.64-.16-.79-.48-.61-1.08a10.63,10.63,0,0,0,.43-3.35A41.79,41.79,0,0,0,16.63,29c-.92-5-3.71-2.65-5.9-1.7-4,1.74-5.82.15-7-2-1.1-2-1.87-3.86-.33-6.66a8.53,8.53,0,0,1,3-3.08C6.7,15.15,4.59,14,6,10.2c.8-2.11,1.88-3,4.37-3.75.64-.19,2.11-.32,2.78-.44a4.84,4.84,0,0,0,2.69-2.08C18.62.47,25.6,4,27.35,6.75A3.34,3.34,0,0,0,31.17,8.2a4.24,4.24,0,0,1,2.75.64,4.8,4.8,0,0,1,1.67,1.27A5,5,0,0,1,37.2,13.4a4.45,4.45,0,0,1-.38,2.93c-.11.26-.61.92-.49,1.22s.87.66,1.15.92c2.81,2.65,0,9.1-3.45,9.1-2.67,0-9.75-5.77-8.32.85.46,2.14,1.77,4.95,2.42,7.18C28.85,38,24.11,38.64,22.86,38.64Z"/></svg>
                          

                          
                          
                        
                        
                        <!-- arrows and buttons for navigation -->
                        <div id="buttons">
                            <svg class="arrow-button-prototype" xmlns="http://www.w3.org/2000/svg" version="1.1"
                                 viewBox="0,0,4,4" overflow="visible">
                                <circle class='arrow-active' cx='2' cy='2' r='2.4' fill="transparent" stroke-width="0.3"
                                        stroke="rgb(102,102,102)"/>
                                <circle class="arrow-dot" cx="2" cy="2" r="2" fill="rgb(102,102,102)" stroke-width="0.1"
                                        stroke="rgb(152,152,152)"/>
                                <path class="arrow" d="M1.5 0.5L3.5 2L1.5 3.5L1.1 3.3L2.3 2L1.1 0.7z"
                                      fill="rgb(255,255,255)" stroke-width="0"/>
                            </svg>
                            <svg class="up-arrow-prototype" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 5 7"
                                 width="200px">
                                <defs>
                                    <mask id="up-arrow-mask0">
                                        <path d="M2.5 0.2H4.6A0.2 0.2 0 0 1 4.8 0.4V3.65A0.4 0.4 0 0 1 4.6 4L2.5 5L0.4 4A0.4 0.4 0 0 1 0.2 3.65V0.4A0.2 0.2 0 0 1 0.4 0.2H2.5z"
                                              transform="translate(0.125,0.125) scale(0.95,0.95)"
                                              fill="rgb(255,255,255)" stroke="none"></path>
                                    </mask>
                                </defs>
                                <g class="up-arrow-g0">
                                    <path d="M2.5 0.2H4.6A0.2 0.2 0 0 1 4.8 0.4V3.65A0.4 0.4 0 0 1 4.6 4L2.5 5L0.4 4A0.4 0.4 0 0 1 0.2 3.65V0.4A0.2 0.2 0 0 1 0.4 0.2H2.5z"
                                          fill="rgb(255,255,255)" stroke-width="0.16" stroke="rgb(128,128,128)"></path>
                                </g>
                                <g class="up-arrow-g1" mask="url(#up-arrow-mask0)"></g>
                                <g class="up-arrow-g2" transform="scale(1.25,1.25) translate(-0.5,-0.5)">
                                    <circle class='arrow-active' cx='2.5' cy='4.2' r='1.5' fill="transparent"
                                            stroke-width="0.2" stroke="rgb(102,102,102)"/>
                                    <circle class="arrow-dot" cx="2.5" cy="4.2" r="1.2" fill="rgb(102,102,102)"
                                            stroke-width="0.067" stroke="rgb(152,152,152)"/>
                                    <path class="arrow" d="M2.5 3.25L3.45 4.5L3.3 4.75L2.5 4L1.7 4.75L1.55 4.5z"
                                          fill="rgb(255,255,255)" stroke-width="0"/>

                                </g>
                            </svg>
                            <svg class="dn-arrow-prototype" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                 xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 5 7"
                                 width="200px">
                                <defs>
                                    <mask id="dn-arrow-mask0">
                                        <path d="M2.5 6.8H0.4A0.2 0.2 0 0 1 0.2 6.6V3.35A0.4 0.4 0 0 1 0.4 3L2.5 2L4.6 3A0.4 0.4 0 0 1 4.8 3.35V6.6A0.2 0.2 0 0 1 4.6 6.8H2.5z"
                                              transform="translate(0.125,0.25) scale(0.95,0.95)" fill="rgb(255,255,255)"
                                              stroke="none"></path>
                                    </mask>
                                </defs>
                                <g class="dn-arrow-g0">
                                    <path d="M2.5 6.8H0.4A0.2 0.2 0 0 1 0.2 6.6V3.35A0.4 0.4 0 0 1 0.4 3L2.5 2L4.6 3A0.4 0.4 0 0 1 4.8 3.35V6.6A0.2 0.2 0 0 1 4.6 6.8H2.5z"
                                          fill="rgb(255,255,255)" stroke-width="0.16" stroke="rgb(128,128,128)"></path>
                                </g>
                                <g class="dn-arrow-g1" mask="url(#dn-arrow-mask0)"></g>
                                <g class="dn-arrow-g2"
                                   transform="scale(1.25,1.25) translate(-0.5,-2.5) rotate(180,2.5,4.2)">
                                    <circle class='arrow-active' cx='2.5' cy='4.2' r='1.5' fill="transparent"
                                            stroke-width="0.2" stroke="rgb(102,102,102)"/>
                                    <circle class="arrow-dot" cx="2.5" cy="4.2" r="1.2" fill="rgb(102,102,102)"
                                            stroke-width="0.067" stroke="rgb(152,152,152)"/>
                                    <path class="arrow" d="M2.5 3.25L3.45 4.5L3.3 4.75L2.5 4L1.7 4.75L1.55 4.5z"
                                          fill="rgb(255,255,255)" stroke-width="0"/>

                                </g>
                            </svg>
                            <svg class="bg-button-prototype" xmlns="http://www.w3.org/2000/svg" version="1.1"
                                 viewBox="0,0,4,4" overflow="visible" width="200px">
                                <defs>
                                    <linearGradient id="bg-grad0" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="50%" style="stop-color:rgb(0,200,127);stop-opacity:1"/>
                                        <stop offset="50%" style="stop-color:rgb(225,0,0);stop-opacity:1"/>
                                    </linearGradient>

                                </defs>
                                <circle class='arrow-active' cx='2' cy='2' r='2.4' fill="transparent" stroke-width="0.3"
                                        stroke="rgb(102,102,102)"/>
                                <g id="bg-button-duo">
                                    <circle class="arrow-dot" cx="2" cy="2" r="2" fill="url(#bg-grad0)"
                                            stroke-width="0.1" stroke="rgb(152,152,152)"/>
                                    <path d="M0 0H4V1H1V2H4V3H1V4H4V5H0z" transform="translate(1,0.75) scale(0.5,0.5)"
                                          fill="rgb(0,0,0)"></path>
                                </g>
                                <g id="bg-button-white" display="none">
                                    <circle class="arrow-dot" cx="2" cy="2" r="2" fill="rgb(255,255,255)"
                                            stroke-width="0.1" stroke="rgb(152,152,152)"/>
                                    <path d="M0 0H4V1H1V2H4V3H1V4H4V5H0z" transform="translate(1,0.75) scale(0.5,0.5)"
                                          fill="rgb(0,0,0)"></path>
                                </g>
                            </svg>
                            <svg class="shuffle-button-prototype" xmlns="http://www.w3.org/2000/svg" version="1.1"
                                 viewBox="0,0,4,4" overflow="visible" width="200px">
                                <defs>
                                    <path id="path-shuffle-arrow"
                                          d="M0.5 1.2L1.1 0.7L1.2 0.8L1.1 1A1.4 1.4 0 0 1 2.2 1.9L2.1 2.1L1.8 2.1A1.1 1.1 0 0 0 1.1 1.4L1.2 1.6L1.1 1.7z"></path>
                                </defs>
                                <circle class='arrow-active' cx='2' cy='2' r='2.4' fill="transparent" stroke-width="0.3"
                                        stroke="rgb(102,102,102)"/>
                                <circle class="arrow-dot" cx="2" cy="2" r="2" fill="rgb(102,102,102)" stroke-width="0.1"
                                        stroke="rgb(152,152,152)"/>
                                <g id="shuffle-button-shuffle">
                                    <use xlink:href="#path-shuffle-arrow" fill="rgb(152,152,152)" stroke="none"/>
                                    <use xlink:href="#path-shuffle-arrow" transform="rotate(180,2,2)"
                                         fill="rgb(152,152,152)" stroke="none"/>
                                    <rect x="1.5" y="1.6" width="1" height="0.8" transform="rotate(-60,2,2)"
                                          fill="rgb(102,102,102)" stroke="none"></rect>
                                    <use xlink:href="#path-shuffle-arrow"
                                         transform="scale(-1,1) translate(-4,0) rotate(180,2,2)"
                                         fill="rgb(152,152,152)"/>
                                    <use xlink:href="#path-shuffle-arrow" transform="scale(-1,1) translate(-4,0)"
                                         fill="rgb(152,152,152)"/>
                                </g>
                                <g id="shuffle-button-unshuffle" display="none">
                                    <use xlink:href="#path-shuffle-arrow" fill="rgb(0,200,127)" stroke="none"/>
                                    <use xlink:href="#path-shuffle-arrow" transform="rotate(180,2,2)"
                                         fill="rgb(0,200,127)" stroke="none"/>
                                    <rect x="1.5" y="1.6" width="1" height="0.8" transform="rotate(-60,2,2)"
                                          fill="rgb(102,102,102)" stroke="none"></rect>
                                    <use xlink:href="#path-shuffle-arrow"
                                         transform="scale(-1,1) translate(-4,0) rotate(180,2,2)" fill="rgb(0,200,127)"/>
                                    <use xlink:href="#path-shuffle-arrow" transform="scale(-1,1) translate(-4,0)"
                                         fill="rgb(0,200,127)"/>
                                </g>
                            </svg>
                            <svg class="zoom-button-prototype" xmlns="http://www.w3.org/2000/svg" version="1.1"
                                 viewBox="0,0,4,4" overflow="visible" width="200px">
                                <circle class='arrow-active' cx='2' cy='2' r='2.4' fill="transparent" stroke-width="0.3"
                                        stroke="rgb(102,102,102)"/>
                                <circle class="arrow-dot" cx="2" cy="2" r="2" fill="rgb(102,102,102)" stroke-width="0.1"
                                        stroke="rgb(152,152,152)"/>
                                <circle cx="1.6" cy="1.6" r="0.9" fill="none" stroke-width="0.2"
                                        stroke="rgb(255,255,255)"></circle>
                                <path d="M2 0L2.2 0.2V1.2H1.8V0.2L2 0z" fill="rgb(255,255,255)" stroke="none"
                                      transform="translate(0.75,2.05) rotate(-45,2,0.7)"></path>
                                <g id="zoom-button-plus">
                                    <path d="M1 1.6H2.2M1.6 1V2.2" fill="none" stroke-width="0.3"
                                          stroke="rgb(255,255,255)"></path>
                                </g>
                                <g id="zoom-button-minus" display="none">
                                    <path d="M1 1.6H2.2" fill="none" stroke-width="0.3"
                                          stroke="rgb(255,255,255)"></path>
                                </g>
                            </svg>
                            <svg class="rotate-button-prototype" xmlns="http://www.w3.org/2000/svg" version="1.1"
                                 viewBox="0,0,4,4" overflow="visible" width="200px">
                                <circle class='arrow-active' cx='2' cy='2' r='2.4' fill="transparent" stroke-width="0.3"
                                        stroke="rgb(102,102,102)"/>
                                <circle class="arrow-dot" cx="2" cy="2" r="2" fill="rgb(102,102,102)" stroke-width="0.1"
                                        stroke="rgb(152,152,152)"/>
                                <g id="rotate-button-cw">
                                    <path d="M2 0.5A1.5 1.5 0 0 1 3.5 2L3.7 1.9L3.8 2L3.25 2.6L2.7 2L2.8 1.9L3 2A1 1 0 0 0 2 1V1z"
                                          transform="rotate(-22,2,2)" fill="rgb(255,255,255)"></path>
                                    <path d="M2 0.5A1.5 1.5 0 0 1 3.5 2L3.7 1.9L3.8 2L3.25 2.6L2.7 2L2.8 1.9L3 2A1 1 0 0 0 2 1V1z"
                                          transform="rotate(158,2,2)" fill="rgb(255,255,255)"></path>
                                </g>
                                <g id="rotate-button-ccw" transform="scale(-1,1) translate(-4,0)" display="none">
                                    <path d="M2 0.5A1.5 1.5 0 0 1 3.5 2L3.7 1.9L3.8 2L3.25 2.6L2.7 2L2.8 1.9L3 2A1 1 0 0 0 2 1V1z"
                                          transform="rotate(-22,2,2)" fill="rgb(255,255,255)"></path>
                                    <path d="M2 0.5A1.5 1.5 0 0 1 3.5 2L3.7 1.9L3.8 2L3.25 2.6L2.7 2L2.8 1.9L3 2A1 1 0 0 0 2 1V1z"
                                          transform="rotate(158,2,2)" fill="rgb(255,255,255)"></path>
                                </g>
                            </svg>
                            <svg class="interspace-button-prototype" xmlns="http://www.w3.org/2000/svg" version="1.1"
                                 viewBox="0,0,4,4" overflow="visible" width="200px">
                                <defs>
                                    <path id="path-interspace-arrow"
                                          d="M0.4 2L1 1.5L1.1 1.6L1 1.8H2.1V2.2H1L1.1 2.4L1 2.5z"></path>
                                </defs>
                                <circle class='arrow-active' cx='2' cy='2' r='2.4' fill="transparent" stroke-width="0.3"
                                        stroke="rgb(102,102,102)"/>
                                <circle class="arrow-dot" cx="2" cy="2" r="2" fill="rgb(102,102,102)" stroke-width="0.1"
                                        stroke="rgb(152,152,152)"/>
                                <g id="interspace-button-off">
                                    <use xlink:href="#path-interspace-arrow" fill="rgb(152,152,152)" stroke="none"/>
                                    <use xlink:href="#path-interspace-arrow" transform="rotate(180,2,2)"
                                         fill="rgb(152,152,152)" stroke="none"/>
                                </g>
                                <g id="interspace-button-on" display="none">
                                    <use xlink:href="#path-interspace-arrow" fill="rgb(0,200,127)" stroke="none"/>
                                    <use xlink:href="#path-interspace-arrow" transform="rotate(180,2,2)"
                                         fill="rgb(0,200,127)" stroke="none"/>
                                </g>
                            </svg>
                            <svg class="fullscreen-button-prototype" xmlns="http://www.w3.org/2000/svg" version="1.1"
                                 viewBox="0,0,4,4" overflow="visible" width="200px">
                                <defs>
                                    <path id="path-fullscreen-corner"
                                          d="M0.7 1.2V0.75A0.05 0.05 0 0 1 0.75 0.7H1.2M0.8 0.8L1.2 1.2" fill="none"
                                          stroke="rgba(0,0,0,0.1)" stroke-width="0.2" stroke-linecap="round"></path>
                                </defs>
                                <rect class='arrow-active' x='0' y='0' width='4' height='4' rx='0.4' fill="transparent"
                                      stroke-width="0.3" stroke="rgba(0,0,0,0.3)"/>
                                <rect class="arrow-dot" x="0.3" y="0.3" width="3.4" height="3.4" rx="0.2" fill="none"
                                      stroke-width="0.1" stroke="rgba(0,0,0,0.1)"/>
                                <g id="fullscreen-button-fullscreen">
                                    <use xlink:href="#path-fullscreen-corner"/>
                                    <use xlink:href="#path-fullscreen-corner" transform="rotate(90,2,2)"/>
                                    <use xlink:href="#path-fullscreen-corner" transform="rotate(180,2,2)"/>
                                    <use xlink:href="#path-fullscreen-corner" transform="rotate(-90,2,2)"/>

                                </g>
                                <g id="fullscreen-button-unfullscreen" display="none">
                                    <use xlink:href="#path-fullscreen-corner" transform="rotate(180,1.2,1.2)"/>
                                    <use xlink:href="#path-fullscreen-corner"
                                         transform="rotate(180,2.8,1.2) rotate(90,2,2)"/>
                                    <use xlink:href="#path-fullscreen-corner" transform="translate(1.6,1.6)"/>
                                    <use xlink:href="#path-fullscreen-corner"
                                         transform="rotate(180,1.2,2.8) rotate(-90,2,2)"/>

                                </g>
                            </svg>
                            <svg class="nav-button-prototype" xmlns="http://www.w3.org/2000/svg" version="1.1"
                                 viewBox="0,0,4,4" overflow="visible">
                                <circle class='dot-active' cx='2' cy='2' r='2.4' fill='transparent' stroke-width='0.3'
                                        stroke='rgb(102,102,102)'/>
                                <circle class="dot" cx="2" cy="2" r="2" fill="rgb(174,39,96)" stroke-width="0.1"
                                        stroke="rgb(152,152,152)"/>
                                <text class="dot-text" x="50%" y="50%" font-size="3" font-weight="bold"
                                      text-anchor="middle" dy="0.35em" fill="rgb(255,255,255)">?
                                </text>
                            </svg>
                        </div>

                    </div>
                    <!--   end of hidden div of svg elements-->
                    <div class="mask"></div>
                    <div class="IENotice">
                        <div class="modal">Your browser is not supported. You can download the latest version <a
                                href="https://www.microsoft.com/en-us/download/internet-explorer.aspx">here </a></div>
                    </div>
                    <div class="scoreBoxSummary"></div>


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
        this.configBar = new ConfigBarSetting({self: this});
        this.configBar.self = this;
        this.configWolf = new ConfigWolfChart({self: this});
        this.configWolf.self = this;
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
            characterName: {
                type: String,
                value: '',
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
        // this.calcPpi = this.calcScreenDPI()
        // this.configBarSetting();
        // this.ConfigWolfChart();


        // this.configBarSetting().init();
        // this.ConfigWolfChart.Init();
    }

    firstUpdated(changedProperties) {

        // const calcPpiElement =
        //     this.shadowRoot.getElementById("inputPixelsPerInch");
        // calcPpiElement.value = this.calcPpi;
        // this.generateDiagram()

        this.configBar.init();
        this.configWolf.Init();
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
