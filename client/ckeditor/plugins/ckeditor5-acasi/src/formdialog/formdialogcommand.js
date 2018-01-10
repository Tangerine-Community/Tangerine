/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ckeditor5-acasi/formdialog/formdialogcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { isCustom } from '../utils';


/**
 * The form dialog command. It is used to change the `value` attribute on `<form>` elements.
 *
 * @extends module:core/command~Command
 */
export default class FormDialogCommand extends Command {
  /**
   * The command value: `false` if there is no `value` attribute, otherwise the value of the `value` attribute.
   *
   * @readonly
   * @observable
   * @member {String|Boolean} #value
   */

  /**
   * @inheritDoc
   */
  refresh() {
    const element = this.editor.document.selection.getSelectedElement();

    this.isEnabled = isCustom( 'form', element );

    if ( this.isEnabled && element.hasAttribute( 'id' ) ) {
      this.value = element.getAttribute( 'id' );
      this.value2 = element.getAttribute('onchange');
      console.log("getting value of form: " + this.value + " this.value2: " + this.value2)
    } else {
      this.value = false;
    }
  }

  /**
   * Executes the command.
   *
   * @fires execute
   * @param {Object} options
   * @param {String} options.newValue The new value of the `id` attribute to set.
   * @param {module:engine/model/batch~Batch} [options.batch] A batch to collect all the change steps. A new batch will be
   * created if this option is not set.
   */
  execute( options ) {
    const doc = this.editor.document;
    const element = doc.selection.getSelectedElement();

    doc.enqueueChanges( () => {
      const batch = options.batch || doc.batch();

      batch.setAttribute( element, 'id', options.newValue );
      batch.setAttribute( element, 'onchange', options.newValue2 );
    } );
  }
}
