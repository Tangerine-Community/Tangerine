/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imgsrcdialog/imgsrcdialogcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { isAcasi } from '../utils';

/**
 * The intro src dialog command. It is used to change the `intro-src` attribute on `<acasi>` elements.
 *
 * @extends module:core/command~Command
 */
export default class IntroSrcDialogCommand extends Command {
  /**
   * The command value: `false` if there is no `intro-src` attribute, otherwise the value of the `intro-src` attribute.
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

    this.isEnabled = isAcasi( element );

    if ( isAcasi( element ) && element.hasAttribute( 'intro-src' ) ) {
      this.value = element.getAttribute( 'intro-src' );
      console.log("getting value of intro-src.")
    } else {
      this.value = false;
    }
  }

  /**
   * Executes the command.
   *
   * @fires execute
   * @param {Object} options
   * @param {String} options.newValue The new value of the `intro-src` attribute to set.
   * @param {module:engine/model/batch~Batch} [options.batch] A batch to collect all the change steps. A new batch will be
   * created if this option is not set.
   */
  execute( options ) {
    const doc = this.editor.document;
    const acasiElement = doc.selection.getSelectedElement();

    doc.enqueueChanges( () => {
      const batch = options.batch || doc.batch();

      batch.setAttribute( acasiElement, 'intro-src', options.newValue );
    } );
  }
}
