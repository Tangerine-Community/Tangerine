/* jshint esversion: 6 */

/*
 * CSS style module for all related MDC Select Style. 
 */

const $_documentStyleContainer = document.createElement('div');
$_documentStyleContainer.setAttribute('style', 'display: none;');

$_documentStyleContainer.innerHTML = `
  <dom-module id="mdc-select-style">
  <template>
  <style is="mdc-select-style">
      





/* materialize select styles */
  .mdc-select {
    font-family: Roboto, sans-serif;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    font-size: var(--tangy-select-container-font-size, 1rem);
    width: 100%;
    line-height: var(--tangy-select-container-line-height, 1.75rem);
    font-weight: 400;
    letter-spacing: 0.04em;
    text-decoration: inherit;
    text-transform: inherit;
    /* @alternate */
    color: rgba(0, 0, 0, 0.87);
    color: var(--mdc-theme-text-primary-on-light, rgba(0, 0, 0, 0.87));
    background-image: url(data:image/svg+xml,%3Csvg%20width%3D%2210px%22%20height%3D%225px%22%20viewBox%3D%227%2010%2010%205%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%20%20%20%20%3Cpolygon%20id%3D%22Shape%22%20stroke%3D%22none%22%20fill%3D%22%230%22%20fill-rule%3D%22evenodd%22%20opacity%3D%220.54%22%20points%3D%227%2010%2012%2015%2017%2010%22%3E%3C%2Fpolygon%3E%0A%3C%2Fsvg%3E);
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    position: relative;
    -webkit-box-align: center;
        -ms-flex-align: center;
            align-items: center;
    -webkit-box-pack: start;
        -ms-flex-pack: start;
            justify-content: flex-start;
    -webkit-box-sizing: border-box;
            box-sizing: border-box;
    height: var(--tangy-select-container-height, 56px);
    border: none;
    border-radius: 4px 4px 0 0;
    outline: none;
    background-repeat: no-repeat;
    background-position: right 10px center;
    cursor: pointer;
    overflow: visible; }
    [dir="rtl"] .mdc-select, .mdc-select[dir="rtl"] {
      background-position: left 10px center; }
    .mdc-select--theme-dark .mdc-select,
    .mdc-theme--dark .mdc-select {
      background-image: url(data:image/svg+xml,%3Csvg%20width%3D%2210px%22%20height%3D%225px%22%20viewBox%3D%227%2010%2010%205%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%20%20%20%20%3Cpolygon%20id%3D%22Shape%22%20stroke%3D%22none%22%20fill%3D%22%23fff%22%20fill-rule%3D%22evenodd%22%20opacity%3D%220.54%22%20points%3D%227%2010%2012%2015%2017%2010%22%3E%3C%2Fpolygon%3E%0A%3C%2Fsvg%3E);
      background-color: rgba(255, 255, 255, 0.1); }
    .mdc-select__menu {
      position: fixed;
      top: 0;
      left: 0;
      max-height: 100%;
      -webkit-transform-origin: center center;
              transform-origin: center center;
      z-index: 4; }
    .mdc-select__surface {
      font-family: Roboto, sans-serif;
      -moz-osx-font-smoothing: grayscale;
      -webkit-font-smoothing: antialiased;
      font-size: var(--tangy-select-font-size, 1rem);
      line-height: var(--tangy-select-line-height, 1.75rem);
      font-weight: 400;
      letter-spacing: 0.04em;
      text-decoration: inherit;
      text-transform: inherit;
      /* @alternate */
      color: var(--primary-text-color, rgba(0, 0, 0, 0.87));
      padding-left: var(--tangy-select-padding-left, 16px);
      padding-right: var(--tangy-select-padding-right, 26px);
      --mdc-ripple-fg-size: 0;
      --mdc-ripple-left: 0;
      --mdc-ripple-top: 0;
      --mdc-ripple-fg-scale: 1;
      --mdc-ripple-fg-translate-end: 0;
      --mdc-ripple-fg-translate-start: 0;
      -webkit-tap-highlight-color: transparent;
      will-change: transform, opacity;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      position: relative;
      -webkit-box-flex: 1;
          -ms-flex-positive: 1;
              flex-grow: 1;
      width: 100%;
      height: var(--tangy-select-height, 56px);
      border: none;
      border-radius: var(--tangy-select-border-radius, 4px 4px 0 0);
      outline: none;
      background-color: var(--tangy-select-background-color, rgba(0, 0, 0, 0.04));
      -webkit-appearance: none;
         -moz-appearance: none;
              appearance: none;
      overflow: hidden;}
      [dir="rtl"] .mdc-select .mdc-select__surface,
      .mdc-select[dir="rtl"] .mdc-select__surface {
        padding-left: 26px;
        padding-right: 16px; }
      .mdc-select__surface::before, .mdc-select__surface::after {
        position: absolute;
        border-radius: 50%;
        opacity: 0;
        pointer-events: none;
        content: ""; }
      .mdc-select__surface::before {
        -webkit-transition: opacity 15ms linear;
        transition: opacity 15ms linear; }
      .mdc-select__surface.mdc-ripple-upgraded::after {
        top: 0;
        left: 0;
        -webkit-transform: scale(0);
                transform: scale(0);
        -webkit-transform-origin: center center;
                transform-origin: center center; }
      .mdc-select__surface.mdc-ripple-upgraded--unbounded::after {
        top: var(--mdc-ripple-top, 0);
        left: var(--mdc-ripple-left, 0); }
      .mdc-select__surface.mdc-ripple-upgraded--foreground-activation::after {
        -webkit-animation: 225ms mdc-ripple-fg-radius-in forwards, 75ms mdc-ripple-fg-opacity-in forwards;
                animation: 225ms mdc-ripple-fg-radius-in forwards, 75ms mdc-ripple-fg-opacity-in forwards; }
      .mdc-select__surface.mdc-ripple-upgraded--foreground-deactivation::after {
        -webkit-animation: 150ms mdc-ripple-fg-opacity-out;
                animation: 150ms mdc-ripple-fg-opacity-out;
        -webkit-transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1));
                transform: translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1)); }
      .mdc-select__surface::before, .mdc-select__surface::after {
        top: calc(50% - 100%);
        left: calc(50% - 100%);
        width: 200%;
        height: 200%; }
      .mdc-select__surface.mdc-ripple-upgraded::before {
        top: calc(50% - 100%);
        left: calc(50% - 100%);
        width: 200%;
        height: 200%;
        -webkit-transform: scale(var(--mdc-ripple-fg-scale, 0));
                transform: scale(var(--mdc-ripple-fg-scale, 0)); }
      .mdc-select__surface.mdc-ripple-upgraded--unbounded::before {
        top: var(--mdc-ripple-top, calc(50% - 50%));
        left: var(--mdc-ripple-left, calc(50% - 50%));
        width: var(--mdc-ripple-fg-size, 100%);
        height: var(--mdc-ripple-fg-size, 100%);
        -webkit-transform: scale(var(--mdc-ripple-fg-scale, 0));
                transform: scale(var(--mdc-ripple-fg-scale, 0)); }
      .mdc-select__surface.mdc-ripple-upgraded::after {
        width: var(--mdc-ripple-fg-size, 100%);
        height: var(--mdc-ripple-fg-size, 100%); }
      .mdc-select__surface::before, .mdc-select__surface::after {
        background-color: black; }
      .mdc-select__surface:hover::before {
        opacity: 0.04; }
      .mdc-select__surface:not(.mdc-ripple-upgraded):focus::before, .mdc-select__surface.mdc-ripple-upgraded--background-focused::before {
        -webkit-transition-duration: 75ms;
                transition-duration: 75ms;
        opacity: 0.12; }
      .mdc-select__surface:not(.mdc-ripple-upgraded)::after {
        -webkit-transition: opacity 150ms linear;
        transition: opacity 150ms linear; }
      .mdc-select__surface:not(.mdc-ripple-upgraded):active::after {
        -webkit-transition-duration: 75ms;
                transition-duration: 75ms;
        opacity: 0.16; }
      .mdc-select__surface.mdc-ripple-upgraded {
        --mdc-ripple-fg-opacity: 0.16; }
      .mdc-select--theme-dark .mdc-select__surface::before, .mdc-select--theme-dark .mdc-select__surface::after,
      .mdc-theme--dark .mdc-select__surface::before,
      .mdc-theme--dark .mdc-select__surface::after {
        background-color: white; }
      .mdc-select--theme-dark .mdc-select__surface:hover::before,
      .mdc-theme--dark .mdc-select__surface:hover::before {
        opacity: 0.08; }
      .mdc-select--theme-dark .mdc-select__surface:not(.mdc-ripple-upgraded):focus::before, .mdc-select--theme-dark .mdc-select__surface.mdc-ripple-upgraded--background-focused::before,
      .mdc-theme--dark .mdc-select__surface:not(.mdc-ripple-upgraded):focus::before,
      .mdc-theme--dark .mdc-select__surface.mdc-ripple-upgraded--background-focused::before {
        -webkit-transition-duration: 75ms;
                transition-duration: 75ms;
        opacity: 0.24; }
      .mdc-select--theme-dark .mdc-select__surface:not(.mdc-ripple-upgraded)::after,
      .mdc-theme--dark .mdc-select__surface:not(.mdc-ripple-upgraded)::after {
        -webkit-transition: opacity 150ms linear;
        transition: opacity 150ms linear; }
      .mdc-select--theme-dark .mdc-select__surface:not(.mdc-ripple-upgraded):active::after,
      .mdc-theme--dark .mdc-select__surface:not(.mdc-ripple-upgraded):active::after {
        -webkit-transition-duration: 75ms;
                transition-duration: 75ms;
        opacity: 0.32; }
      .mdc-select--theme-dark .mdc-select__surface.mdc-ripple-upgraded,
      .mdc-theme--dark .mdc-select__surface.mdc-ripple-upgraded {
        --mdc-ripple-fg-opacity: 0.32; }
      .mdc-select__surface::-ms-expand {
        display: none; }
    .mdc-select__label {
      left: 16px;
      right: initial;
      position: absolute;
      bottom: 12px;
      -webkit-transform-origin: left top;
              transform-origin: left top;
      -webkit-transition: -webkit-transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
      transition: -webkit-transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
      transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
      transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1), -webkit-transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
      color: rgba(0, 0, 0, 0.6);
      pointer-events: none;
      will-change: transform; }
      [dir="rtl"] .mdc-select__label, .mdc-select__label[dir="rtl"] {
        left: initial;
        right: 16px; }
      .mdc-select--theme-dark .mdc-select__label,
      .mdc-theme--dark .mdc-select__label {
        /* @alternate */
        color: rgba(255, 255, 255, 0.7);
        color: var(--mdc-theme-text-secondary-on-dark, rgba(255, 255, 255, 0.7)); }
      [dir="rtl"] .mdc-select .mdc-select__label,
      .mdc-select[dir="rtl"] .mdc-select__label {
        -webkit-transform-origin: right top;
                transform-origin: right top; }
      .mdc-select__label--float-above {
        -webkit-transform: translateY(-40%) scale(0.75, 0.75);
                transform: translateY(-40%) scale(0.75, 0.75); }
    .mdc-select__selected-text {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-align: end;
          -ms-flex-align: end;
              align-items: flex-end;
      margin-bottom: 6px;
      -webkit-transition: opacity 125ms 0ms cubic-bezier(0.4, 0, 0.6, 1), -webkit-transform 125ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
      transition: opacity 125ms 0ms cubic-bezier(0.4, 0, 0.6, 1), -webkit-transform 125ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
      transition: opacity 125ms 0ms cubic-bezier(0.4, 0, 0.6, 1), transform 125ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
      transition: opacity 125ms 0ms cubic-bezier(0.4, 0, 0.6, 1), transform 125ms 0ms cubic-bezier(0.4, 0, 0.6, 1), -webkit-transform 125ms 0ms cubic-bezier(0.4, 0, 0.6, 1);
      white-space: nowrap;
      overflow: hidden; }
      .mdc-select--theme-dark .mdc-select__selected-text,
      .mdc-theme--dark .mdc-select__selected-text {
        /* @alternate */
        color: rgba(255, 255, 255, 0.7);
        color: var(--mdc-theme-text-secondary-on-dark, rgba(255, 255, 255, 0.7)); }
    .mdc-select__bottom-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      -webkit-transform: scaleY(1);
              transform: scaleY(1);
      -webkit-transform-origin: bottom;
              transform-origin: bottom;
      -webkit-transition: -webkit-transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
      transition: -webkit-transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
      transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
      transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1), -webkit-transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
      background-color: var(--primary-text-color, rgba(0, 0, 0, 0.5)); }
      .mdc-select__bottom-line::after {
        /* @alternate */
        background-color: var(--primary-color);
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 2px;
        -webkit-transform: scaleX(0);
                transform: scaleX(0);
        -webkit-transition: -webkit-transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
        transition: -webkit-transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
        transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
        transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1), -webkit-transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
        content: "";
        z-index: 2; }
    .mdc-select__bottom-line--active::after {
      -webkit-transform: scaleX(1);
              transform: scaleX(1);
      opacity: 1; }
    .mdc-select__surface:focus .mdc-select__bottom-line,
    .mdc-select__surface:focus ~ .mdc-select__bottom-line {
      /* @alternate */
      background-color: var(--primary-color);
      -webkit-transform: scaleY(2);
              transform: scaleY(2); }
      .mdc-select__surface:focus .mdc-select__bottom-line::after,
      .mdc-select__surface:focus ~ .mdc-select__bottom-line::after {
        opacity: 1; }
  .mdc-select--open .mdc-select__surface::before {
    opacity: 0.12; }
    .mdc-select--theme-dark .mdc-select--open .mdc-select__surface::before,
    .mdc-theme--dark .mdc-select--open .mdc-select__surface::before {
      opacity: 0.24; }
  .mdc-select--open .mdc-select__selected-text {
    -webkit-transform: translateY(8px);
            transform: translateY(8px);
    -webkit-transition: opacity 125ms 125ms cubic-bezier(0, 0, 0.2, 1), -webkit-transform 125ms 125ms cubic-bezier(0, 0, 0.2, 1);
    transition: opacity 125ms 125ms cubic-bezier(0, 0, 0.2, 1), -webkit-transform 125ms 125ms cubic-bezier(0, 0, 0.2, 1);
    transition: opacity 125ms 125ms cubic-bezier(0, 0, 0.2, 1), transform 125ms 125ms cubic-bezier(0, 0, 0.2, 1);
    transition: opacity 125ms 125ms cubic-bezier(0, 0, 0.2, 1), transform 125ms 125ms cubic-bezier(0, 0, 0.2, 1), -webkit-transform 125ms 125ms cubic-bezier(0, 0, 0.2, 1);
    opacity: 0; }
  .mdc-select--open .mdc-select__bottom-line {
    /* @alternate */
    background-color: var(--primary-color);
    -webkit-transform: scaleY(2);
            transform: scaleY(2); }
    .mdc-select--open .mdc-select__bottom-line::after {
      opacity: 1; }
  .mdc-select--disabled,
  .mdc-select[disabled] {
    /* @alternate */
    color: rgba(0, 0, 0, 0.38);
    color: var(--mdc-theme-text-disabled-on-light, rgba(0, 0, 0, 0.38));
    background-image: url(data:image/svg+xml,%3Csvg%20width%3D%2210px%22%20height%3D%225px%22%20viewBox%3D%227%2010%2010%205%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%20%20%20%20%3Cpolygon%20id%3D%22Shape%22%20stroke%3D%22none%22%20fill%3D%22%230%22%20fill-rule%3D%22evenodd%22%20opacity%3D%220.38%22%20points%3D%227%2010%2012%2015%2017%2010%22%3E%3C%2Fpolygon%3E%0A%3C%2Fsvg%3E);
    border-bottom-width: 1px;
    border-bottom-style: dotted;
    opacity: .38;
    cursor: default;
    pointer-events: none;
    -webkit-user-select: none;
       -moz-user-select: none;
        -ms-user-select: none;
            user-select: none; }
    .mdc-select--disabled .mdc-select__bottom-line,
    .mdc-select[disabled] .mdc-select__bottom-line {
      display: none; }
  .mdc-select--theme-dark.mdc-select--disabled,
  .mdc-theme--dark .mdc-select--disabled {
    /* @alternate */
    color: rgba(255, 255, 255, 0.5);
    color: var(--mdc-theme-text-disabled-on-dark, rgba(255, 255, 255, 0.5));
    background-image: url(data:image/svg+xml,%3Csvg%20width%3D%2210px%22%20height%3D%225px%22%20viewBox%3D%227%2010%2010%205%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%20%20%20%20%3Cpolygon%20id%3D%22Shape%22%20stroke%3D%22none%22%20fill%3D%22%23ffffff%22%20fill-rule%3D%22evenodd%22%20opacity%3D%220.38%22%20points%3D%227%2010%2012%2015%2017%2010%22%3E%3C%2Fpolygon%3E%0A%3C%2Fsvg%3E);
    border-bottom: 1px dotted rgba(255, 255, 255, 0.38); }
  .mdc-select--theme-dark.mdc-select[disabled],
  .mdc-theme--dark .mdc-select[disabled] {
    /* @alternate */
    color: rgba(255, 255, 255, 0.5);
    color: var(--mdc-theme-text-disabled-on-dark, rgba(255, 255, 255, 0.5));
    background-image: url(data:image/svg+xml,%3Csvg%20width%3D%2210px%22%20height%3D%225px%22%20viewBox%3D%227%2010%2010%205%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%0A%20%20%20%20%3Cpolygon%20id%3D%22Shape%22%20stroke%3D%22none%22%20fill%3D%22%23ffffff%22%20fill-rule%3D%22evenodd%22%20opacity%3D%220.38%22%20points%3D%227%2010%2012%2015%2017%2010%22%3E%3C%2Fpolygon%3E%0A%3C%2Fsvg%3E);
    border-bottom: 1px dotted rgba(255, 255, 255, 0.38); }
  .mdc-select__menu .mdc-list-item {
    font-family: Roboto, sans-serif;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    font-size: 1rem;
    line-height: 1.75rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    text-decoration: inherit;
    text-transform: inherit;
    /* @alternate */
    color: rgba(0, 0, 0, 0.54);
    color: var(--mdc-theme-text-secondary-on-light, rgba(0, 0, 0, 0.54)); }
    .mdc-select__menu .mdc-list-item[aria-selected="true"] {
      /* @alternate */
      color: rgba(0, 0, 0, 0.87);
      color: var(--mdc-theme-text-primary-on-light, rgba(0, 0, 0, 0.87)); }
    .mdc-select--theme-dark .mdc-select__menu .mdc-list-item,
    .mdc-theme--dark .mdc-select__menu .mdc-list-item {
      /* @alternate */
      color: rgba(255, 255, 255, 0.7);
      color: var(--mdc-theme-text-secondary-on-dark, rgba(255, 255, 255, 0.7)); }
      .mdc-select--theme-dark .mdc-select__menu .mdc-list-item[aria-selected="true"],
      .mdc-theme--dark .mdc-select__menu .mdc-list-item[aria-selected="true"] {
        /* @alternate */
        color: white;
        color: var(--mdc-theme-text-primary-on-dark, white); }
    .mdc-select__menu .mdc-list-item::before, .mdc-select__menu .mdc-list-item::after {
      top: calc(50% - 50%);
      left: calc(50% - 50%);
      width: 100%;
      height: 100%; }
    .mdc-select__menu .mdc-list-item.mdc-ripple-upgraded::before {
      top: calc(50% - 50%);
      left: calc(50% - 50%);
      width: 100%;
      height: 100%;
      -webkit-transform: scale(var(--mdc-ripple-fg-scale, 0));
              transform: scale(var(--mdc-ripple-fg-scale, 0)); }
    .mdc-select__menu .mdc-list-item.mdc-ripple-upgraded--unbounded::before {
      top: var(--mdc-ripple-top, calc(50% - 25%));
      left: var(--mdc-ripple-left, calc(50% - 25%));
      width: var(--mdc-ripple-fg-size, 50%);
      height: var(--mdc-ripple-fg-size, 50%);
      -webkit-transform: scale(var(--mdc-ripple-fg-scale, 0));
              transform: scale(var(--mdc-ripple-fg-scale, 0)); }
    .mdc-select__menu .mdc-list-item.mdc-ripple-upgraded::after {
      width: var(--mdc-ripple-fg-size, 50%);
      height: var(--mdc-ripple-fg-size, 50%); }
    .mdc-select__menu .mdc-list-item::before, .mdc-select__menu .mdc-list-item::after {
      border-radius: 0; }
  .mdc-select__menu .mdc-list-group,
  .mdc-select__menu .mdc-list-group > .mdc-list-item:first-child {
    margin-top: 12px; }
  .mdc-select__menu .mdc-list-group {
    /* @alternate */
    color: rgba(0, 0, 0, 0.38);
    color: var(--mdc-theme-text-hint-on-light, rgba(0, 0, 0, 0.38));
    font-weight: normal; }
    .mdc-select__menu .mdc-list-group .mdc-list-item {
      /* @alternate */
      color: rgba(0, 0, 0, 0.87);
      color: var(--mdc-theme-text-primary-on-light, rgba(0, 0, 0, 0.87)); }
  .mdc-select--theme-dark .mdc-select__menu .mdc-list-group,
  .mdc-theme--dark .mdc-select__menu .mdc-list-group {
    /* @alternate */
    color: rgba(255, 255, 255, 0.5);
    color: var(--mdc-theme-text-hint-on-dark, rgba(255, 255, 255, 0.5)); }
    .mdc-select--theme-dark .mdc-select__menu .mdc-list-group .mdc-list-item,
    .mdc-theme--dark .mdc-select__menu .mdc-list-group .mdc-list-item {
      /* @alternate */
      color: white;
      color: var(--mdc-theme-text-primary-on-dark, white); }
       .mdc-select option:checked, option:hover {
      color: #ffffff;
      background-color: var(--primary-color);
   }

    select option {
      text-transform: capitalize;
    }
  /* End of Materialize Select Styles */

  label:empty {
    margin: 0;
  }







  </style>
  </template>
  </dom-module>
`

document.head.appendChild($_documentStyleContainer);