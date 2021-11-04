import { css } from 'lit-element'

export const sharedStyles = css`

* {
	box-sizing: border-box;
}

.container {
	padding: 0px 15px;
}

/* Items are prefixed with lk- to scope these styles */
.lk-html {
	font-size: 14px;
}

.lk-body {
	font-weight: 400;
	font-size: 1rem;
	font-family: "Open Sans", Helvetica, Arial, sans-serif;
	line-height: 1.6;
	color: #212121;
}

.lk-header {
	padding: 15px;
	width: 100%;
	background-color: #212a3f;
	display: flex;
	justify-content: space-around;
	align-items: center;
	color: #fff;
}

.lk-h1 {
	font-size: 1.4rem;
	margin: 1rem;
}
.lk-h1 span {
	font-size: 1rem;
	color: rgba(33,33,33,0.7);
}

.lk-instructions {
	margin: 1rem;
}

.lk-btn {
	box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
	background-color: #3c5b8d;
	color: rgba(255,255,255,.87);
	cursor: pointer;
	white-space: nowrap;
	outline: rgba(0,0,0,.870588) none 0;
	border: none;
	padding: 8px 30px;
	text-transform: uppercase;
	transition: box-shadow .2s cubic-bezier(.4,0,1,1),background-color .2s cubic-bezier(.4,0,.2,1),color .2s cubic-bezier(.4,0,.2,1);
	text-decoration: none;
	display: inline-block;
	text-align: center;
	vertical-align: middle;
	line-height: 1.5;
}
.lk-btn-sm {
	padding: 5px 20px 5px;
}

.lk-btn-container {
	margin: 0 1rem 2rem;
	text-align: right;
}

.lk-card {
	box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
	background-color: #fff;
	border: 0;
	margin: 0 1rem 2rem;
	display: flex;
	position: relative;
	flex-direction: column;
	word-wrap: break-word;
	background-clip: border-box;
}

.lk-input {
	line-height: 1.42857;
	font-size: 1.1rem;
	padding: 0 4px;
	height: 38px;
	display: block;
	width: 100%;
}


/**
 * Breadcrumb things
 */
#lk-breadcrumbs {
	background-color: #546e7a;
	color: #cfd8dc;
	position: relative;
}
#lk-breadcrumbs ul {
	padding: 0 1rem;
	margin: 0;
	list-style: none;
}
#lk-breadcrumbs li {
	display: inline-block;
	line-height: 2.6rem;
}
#lk-breadcrumbs li + li:before {
	font: normal normal normal 24px/1 "Material Design Icons";
	display: inline-block;
	font-size: inherit;
	line-height: inherit;
	content: "";
}

#lk-breadcrumbs mwc-icon {
	vertical-align: bottom;
	position: relative;
	bottom: 10px;
}

#lk-breadcrumbs a {
	color: rgba(255,255,255,0.8);
}
#lk-breadcrumbs a:hover {
	color: #fff;
	text-decoration: none;
}

/**
 * Task list things
 */
.lk-task-list {
	display: flex;
	flex-direction: column;
	padding-left: 0;
	margin: 0;
}
.lk-task-list > li {
	position: relative;
	background-color: #fff;
	color: #424242;
	padding: 15px;
	margin: 0;
	transition: all ease .3s;
	border-bottom: solid 1px #eee;
	display: flex;
	align-items: center;
	cursor: pointer;
}
.lk-drop-container paper-button {
	padding-bottom: 10px;
}
.lk-task-list > li:first-child {
	border-top: 1px solid #eee;
}
.lk-task-list > li.lk-complete {
	background-color: #e0e0e0;
	color: rgba(66,66,66,0.5);
	cursor: default;
}
.lk-task-list > li mwc-icon {
	margin-right: 1rem;
	font-size: 1.4rem;
}
.lk-task-list > li:not(.lk-complete) mwc-icon {
	color: #ff8f00;
}

.lk-task-list > li > .lk-drop-container,
.lk-task-list > li > .lk-btn {
	margin-left: auto;
}
.lk-task-list > li > .lk-left {
	margin: 0;
}
.lk-task-list > li > .lk-btn + .lk-btn {
	margin-left: 5px;
}

.lk-task-list > li.lk-indent {
	padding-left: 45px;
}

.lk-caps {
	text-transform: uppercase;
}

.lk-status {
	margin-left: 15px;
	color: rgba(33,33,33,0.7)
}

/**
 * Dropdown things
 */
.lk-drop-container {
}
.lk-drop-container mwc-icon.icon {
	color: #FFF !important;
	margin: 0px;
	position: relative;
	top: 5px;
}

.lk-drop-list {
	display: none;
	position: absolute;
	top: 30px;
	right: 0;
	min-width: 150px;
	z-index: 1;
	margin: 0;
	padding: 0;
	border: 0;
	box-shadow: 0 2px 5px 0 rgba(0,0,0,.26);
	list-style: none;
	background-color: #fff;	
}
.lk-drop-list > li {
	padding: .5rem 2rem;
	line-height: 2rem;
	display: block;
	color: #212529;
	text-decoration: none;
}
.lk-drop-list > li:hover {
	background-color: #f5f5f5;
	color: #3c5b8d;
}
.lk-drop-list > li.lk-divider {
	border-bottom: 1px solid #eee;
}
.lk-show {
	display: block;
}

/**
 * Modal things
 */
#lk-modal {
	display: none;
	position: fixed;
	z-index: 2;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0,0,0,0.4);
}
.lk-modal-content {
	margin: 15% auto;
	width: auto;
	max-width: 300px;
	min-height: 200px;
	background-color: #fff;
	border: 1px solid rgba(0,0,0,.2);
	outline: 0;
	padding: 0 2.4rem;
}
.lk-modal-content > div:first-child {
	text-align: right;
	color: #616161;
	padding: 2.4rem 0 1rem;
}
.lk-modal-content > div:first-child mwc-icon {
	cursor: pointer;
}
.lk-modal-content > div:last-child {
	padding: 1rem 0  2.4rem;
	text-align: right;
}
.lk-modal-content label {
	display: block;
	margin-bottom: 1rem;
}
#lk-modal .died, #lk-modal .moved {
	display: none;
}
.jsondiffpatch-delta {
  font-family: 'Bitstream Vera Sans Mono', 'DejaVu Sans Mono', Monaco, Courier, monospace;
  font-size: 12px;
  margin: 0;
  padding: 0 0 0 12px;
  display: inline-block;
}
.jsondiffpatch-delta pre {
  font-family: 'Bitstream Vera Sans Mono', 'DejaVu Sans Mono', Monaco, Courier, monospace;
  font-size: 12px;
  margin: 0;
  padding: 0;
  display: inline-block;
}
ul.jsondiffpatch-delta {
  list-style-type: none;
  padding: 0 0 0 20px;
  margin: 0;
}
.jsondiffpatch-delta ul {
  list-style-type: none;
  padding: 0 0 0 20px;
  margin: 0;
}
.jsondiffpatch-added .jsondiffpatch-property-name,
.jsondiffpatch-added .jsondiffpatch-value pre,
.jsondiffpatch-modified .jsondiffpatch-right-value pre,
.jsondiffpatch-textdiff-added {
  background: #bbffbb;
}
.jsondiffpatch-deleted .jsondiffpatch-property-name,
.jsondiffpatch-deleted pre,
.jsondiffpatch-modified .jsondiffpatch-left-value pre,
.jsondiffpatch-textdiff-deleted {
  background: #ffbbbb;
  text-decoration: line-through;
}
.jsondiffpatch-unchanged,
.jsondiffpatch-movedestination {
  color: gray;
}
.jsondiffpatch-unchanged,
.jsondiffpatch-movedestination > .jsondiffpatch-value {
  transition: all 0.5s;
  -webkit-transition: all 0.5s;
  overflow-y: hidden;
}
.jsondiffpatch-unchanged-showing .jsondiffpatch-unchanged,
.jsondiffpatch-unchanged-showing .jsondiffpatch-movedestination > .jsondiffpatch-value {
  max-height: 100px;
}
.jsondiffpatch-unchanged-hidden .jsondiffpatch-unchanged,
.jsondiffpatch-unchanged-hidden .jsondiffpatch-movedestination > .jsondiffpatch-value {
  max-height: 0;
}
.jsondiffpatch-unchanged-hiding .jsondiffpatch-movedestination > .jsondiffpatch-value,
.jsondiffpatch-unchanged-hidden .jsondiffpatch-movedestination > .jsondiffpatch-value {
  display: block;
}
.jsondiffpatch-unchanged-visible .jsondiffpatch-unchanged,
.jsondiffpatch-unchanged-visible .jsondiffpatch-movedestination > .jsondiffpatch-value {
  max-height: 100px;
}
.jsondiffpatch-unchanged-hiding .jsondiffpatch-unchanged,
.jsondiffpatch-unchanged-hiding .jsondiffpatch-movedestination > .jsondiffpatch-value {
  max-height: 0;
}
.jsondiffpatch-unchanged-showing .jsondiffpatch-arrow,
.jsondiffpatch-unchanged-hiding .jsondiffpatch-arrow {
  display: none;
}
.jsondiffpatch-value {
  display: inline-block;
}
.jsondiffpatch-property-name {
  display: inline-block;
  padding-right: 5px;
  vertical-align: top;
}
.jsondiffpatch-property-name:after {
  content: ': ';
}
.jsondiffpatch-child-node-type-array > .jsondiffpatch-property-name:after {
  content: ': [';
}
.jsondiffpatch-child-node-type-array:after {
  content: '],';
}
div.jsondiffpatch-child-node-type-array:before {
  content: '[';
}
div.jsondiffpatch-child-node-type-array:after {
  content: ']';
}
.jsondiffpatch-child-node-type-object > .jsondiffpatch-property-name:after {
  content: ': {';
}
.jsondiffpatch-child-node-type-object:after {
  content: '},';
}
div.jsondiffpatch-child-node-type-object:before {
  content: '{';
}
div.jsondiffpatch-child-node-type-object:after {
  content: '}';
}
.jsondiffpatch-value pre:after {
  content: ',';
}
li:last-child > .jsondiffpatch-value pre:after,
.jsondiffpatch-modified > .jsondiffpatch-left-value pre:after {
  content: '';
}
.jsondiffpatch-modified .jsondiffpatch-value {
  display: inline-block;
}
.jsondiffpatch-modified .jsondiffpatch-right-value {
  margin-left: 5px;
}
.jsondiffpatch-moved .jsondiffpatch-value {
  display: none;
}
.jsondiffpatch-moved .jsondiffpatch-moved-destination {
  display: inline-block;
  background: #ffffbb;
  color: #888;
}
.jsondiffpatch-moved .jsondiffpatch-moved-destination:before {
  content: ' => ';
}
ul.jsondiffpatch-textdiff {
  padding: 0;
}
.jsondiffpatch-textdiff-location {
  color: #bbb;
  display: inline-block;
  min-width: 60px;
}
.jsondiffpatch-textdiff-line {
  display: inline-block;
}
.jsondiffpatch-textdiff-line-number:after {
  content: ',';
}
.jsondiffpatch-error {
  background: red;
  color: white;
  font-weight: bold;
}


`
