/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagetextalternative/ui/textalternativeformview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import Template from '@ckeditor/ckeditor5-ui/src/template';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import LabeledInputView from '@ckeditor/ckeditor5-ui/src/labeledinput/labeledinputview';
import InputTextView from '@ckeditor/ckeditor5-ui/src/inputtext/inputtextview';

import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import BoxedEditorUIView from "@ckeditor/ckeditor5-ui/src/editorui/boxed/boxededitoruiview";
import TextareaView from "../../textareaview";

/**
 * The IntroSrcDialogFormView class.
 *
 * @extends module:ui/view~View
 */
export default class FormDialogFormView extends View {
  /**
   * @inheritDoc
   */
  constructor( locale ) {
    super( locale );

    const t = this.locale.t;

    /**
     * Tracks information about DOM focus in the form.
     *
     * @readonly
     * @member {module:utils/focustracker~FocusTracker}
     */
    this.focusTracker = new FocusTracker();

    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     *
     * @readonly
     * @member {module:utils/keystrokehandler~KeystrokeHandler}
     */
    this.keystrokes = new KeystrokeHandler();

    /**
     * A textarea with a label.
     *
     * @member {module:ui/labeledinput/labeledinputview~LabeledInputView} #labeledTextarea
     */
    this.formIdInput = this._createFormIdInputView();

    /**
     * A textarea with a label.
     *
     * @member {module:ui/labeledinput/labeledinputview~LabeledInputView} #labeledTextarea
     */
    this.onchangeInput = this._createOnchangeInputView();

    /**
     * A button used to submit the form.
     *
     * @member {module:ui/button/buttonview~ButtonView} #saveButtonView
     */
    this.saveButtonView = this._createButton( t( 'Save' ) );
    this.saveButtonView.type = 'submit';

    /**
     * A button used to cancel the form.
     *
     * @member {module:ui/button/buttonview~ButtonView} #cancelButtonView
     */
    this.cancelButtonView = this._createButton( t( 'Cancel' ), 'cancel' );

    /**
     * A collection of views which can be focused in the form.
     *
     * @readonly
     * @protected
     * @member {module:ui/viewcollection~ViewCollection}
     */
    this._focusables = new ViewCollection();

    /**
     * Helps cycling over {@link #_focusables} in the form.
     *
     * @readonly
     * @protected
     * @member {module:ui/focuscycler~FocusCycler}
     */
    this._focusCycler = new FocusCycler( {
      focusables: this._focusables,
      focusTracker: this.focusTracker,
      keystrokeHandler: this.keystrokes,
      actions: {
        // Navigate form fields backwards using the Shift + Tab keystroke.
        focusPrevious: 'shift + tab',

        // Navigate form fields forwards using the Tab key.
        focusNext: 'tab'
      }
    } );

    // Template.extend( this.saveButtonView.template, {
    this.saveButtonView.extendTemplate( {
      attributes: {
        class: [
          'ck-button-action'
        ]
      }
    } );

		this.setTemplate( {
			tag: 'form',

      attributes: {
        class: [
          'cke-formId-form',
        ],

        // https://github.com/ckeditor/ckeditor5-image/issues/40
        tabindex: '-1'
      },

      children: [
        this.formIdInput,
        {
          tag: 'div',

          attributes: {
            class: [
              'cke-formId-form__actions'
            ]
          }
          // ,
          // children: [
          //   this.saveButtonView,
          //   this.cancelButtonView
          // ]
        },
        this.onchangeInput,
        {
          tag: 'div',

          attributes: {
            class: [
              'cke-onchangeInput-form__actions'
            ]
          },

          children: [
            this.saveButtonView,
            this.cancelButtonView
          ]
        }
      ]
    } );
  }

  /**
   * @inheritDoc
   */
  render() {
    super.render();

    this.keystrokes.listenTo( this.element );

    submitHandler( { view: this } );

    [ this.formIdInput, this.onchangeInput, this.saveButtonView, this.cancelButtonView ]
      .forEach( v => {
        // Register the view as focusable.
        this._focusables.add( v );

        // Register the view in the focus tracker.
        this.focusTracker.add( v.element );
      } );
  }

  /**
   * Creates the button view.
   *
   * @private
   * @param {String} label The button label
   * @param {String} [eventName] The event name that the ButtonView#execute event will be delegated to.
   * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
   */
  _createButton( label, eventName ) {
    const button = new ButtonView( this.locale );

    button.label = label;
    button.withText = true;

    if ( eventName ) {
      button.delegate( 'execute' ).to( this, eventName );
    }

    return button;
  }

  /**
   * Creates an input with a label.
   *
   * @private
   * @return {module:ui/labeledinput/labeledinputview~LabeledInputView}
   */
  _createFormIdInputView() {
    const t = this.locale.t;
    const formIdInput = new LabeledInputView( this.locale, InputTextView );
    formIdInput.label = t( 'Form id' );

    return formIdInput;
  }

  /**
   * Creates an input with a label.
   *
   * @private
   * @return {module:ui/labeledinput/labeledinputview~LabeledInputView}
   */
  _createOnchangeInputView() {
    const t = this.locale.t;
    // const onchangeInput = new LabeledInputView( this.locale, InputTextView );
    const onchangeInput = new LabeledInputView( this.locale, TextareaView );
    onchangeInput.label = t( 'Onchange javascript' );

    return onchangeInput;
  }
}
