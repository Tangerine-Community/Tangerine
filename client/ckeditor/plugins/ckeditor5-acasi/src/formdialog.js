/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ckeditor5-acasi/imgsrcdialog
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import FormDialogEngine from './formdialog/formdialogengine';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import FormDialogFormView from './formdialog/ui/formdialogformview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import icon from '@ckeditor/ckeditor5-core/theme/icons/source.svg';
import { repositionCustomContextualBalloon, getBalloonPositionData } from './utils';
import { isCustomWidgetSelected } from './utils';

import '../theme/imgsrcdialog/theme.scss';

/**
 * The intro src dialog plugin.
 *
 * The plugin uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FormDialog extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [ FormDialogEngine, ContextualBalloon ];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'FormDialog';
  }

  /**
   * @inheritDoc
   */
  init() {
    this._createButton();
    this._createForm();
  }

  /**
   * Creates a button showing the balloon panel for changing the image text alternative and
   * registers it in the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
   *
   * @private
   */
  _createButton() {
    const editor = this.editor;
    const command = editor.commands.get( 'formDialog' );
    const t = editor.t;

    editor.ui.componentFactory.add( 'formDialog', locale => {
      const view = new ButtonView( locale );

      view.set( {
        label: t( 'Change form settings' ),
        icon: icon,
        tooltip: true
      } );

      view.bind( 'isEnabled' ).to( command, 'isEnabled' );

      this.listenTo( view, 'execute', () => this._showForm() );

      return view;
    } );
  }

  /**
   * Creates the {@link module:image/imagetextalternative/ui/textalternativeformview~FormDialogFormView}
   * form.
   *
   * @private
   */
  _createForm() {
    const editor = this.editor;
    const editingView = editor.editing.view;

    /**
     * The contextual balloon plugin instance.
     *
     * @private
     * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
     */
    this._balloon = this.editor.plugins.get( 'ContextualBalloon' );

    /**
     * A form containing a textarea and buttons, used to change the form values.
     *
     * @member {module:image/imagetextalternative/ui/textalternativeformview~FormDialogFormView} #form
     */
    this._form = new FormDialogFormView( editor.locale );

    this.listenTo( this._form, 'submit', () => {
      editor.execute( 'formDialog', {
        newValue: this._form.formIdInput.inputView.element.value,
        newValue2: this._form.onchangeInput.inputView.element.value,
      } );

      this._hideForm( true );
    } );

    this.listenTo( this._form, 'cancel', () => {
      this._hideForm( true );
    } );

    // Close the form on Esc key press.
    this._form.keystrokes.set( 'Esc', ( data, cancel ) => {
      this._hideForm( true );
      cancel();
    } );

    // Reposition the balloon or hide the form if an intro src widget is no longer selected.
    this.listenTo( editingView, 'render', () => {
      if ( !isCustomWidgetSelected( 'form', editingView.selection ) ) {
        this._hideForm( true );
      } else if ( this._isVisible ) {
        repositionCustomContextualBalloon( 'form', editor );
      }
    }, { priority: 'low' } );

    // Close on click outside of balloon panel element.
    clickOutsideHandler( {
      emitter: this._form,
      activator: () => this._isVisible,
      contextElements: [ this._form.element ],
      callback: () => this._hideForm()
    } );
  }

  /**
   * Shows the {@link #_form} in the {@link #_balloon}.
   *
   * @private
   */
  _showForm() {
    console.log("showing formity form form")
    if ( this._isVisible ) {
      return;
    }

    const editor = this.editor;
    const command = editor.commands.get( 'formDialog' );
    const formIdInput = this._form.formIdInput;
    const onchangeInput = this._form.onchangeInput;

    if ( !this._balloon.hasView( this._form ) ) {
      this._balloon.add( {
        view: this._form,
        position: getBalloonPositionData( editor )
      } );
    }

    // Make sure that each time the panel shows up, the field remains in sync with the value of
    // the command. If the user typed in the input, then canceled the balloon (`formIdInput#value`
    // stays unaltered) and re-opened it without changing the value of the command, they would see the
    // old value instead of the actual value of the command.
    // https://github.com/ckeditor/ckeditor5-image/issues/114
    formIdInput.value = formIdInput.inputView.element.value = command.value || '';
    onchangeInput.value = onchangeInput.inputView.element.value = command.value2 || '';

    this._form.formIdInput.select();
  }

  /**
   * Removes the {@link #_form} from the {@link #_balloon}.
   *
   * @param {Boolean} [focusEditable=false] Controls whether the editing view is focused afterwards.
   * @private
   */
  _hideForm( focusEditable ) {
    if ( !this._isVisible ) {
      return;
    }

    this._balloon.remove( this._form );

    if ( focusEditable ) {
      this.editor.editing.view.focus();
    }
  }

  /**
   * Returns `true` when the {@link #_form} is the visible view
   * in the {@link #_balloon}.
   *
   * @private
   * @type {Boolean}
   */
  get _isVisible() {
    return this._balloon.visibleView == this._form;
  }
}
