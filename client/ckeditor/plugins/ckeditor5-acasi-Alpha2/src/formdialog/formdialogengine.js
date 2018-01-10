/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ckeditor5-acasi/imgsrcdialog/imgsrcdialogengine
 */

import FormDialogCommand from './formdialogcommand';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The form dialog engine plugin.
 * Registers the `formDialog` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FormDialogEngine extends Plugin {
  /**
   * @inheritDoc
   */
  init() {
    this.editor.commands.add( 'formDialog', new FormDialogCommand( this.editor ) );
  }
}
