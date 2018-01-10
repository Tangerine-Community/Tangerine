/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ckeditor5-acasi/imgsrcdialog/imgsrcdialogengine
 */

import IntroSrcDialogCommand from './introsrcdialogcommand';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The acasi intro src dialog engine plugin.
 * Registers the `introSrcDialog` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class IntroSrcDialogEngine extends Plugin {
  /**
   * @inheritDoc
   */
  init() {
    this.editor.commands.add( 'introSrcDialog', new IntroSrcDialogCommand( this.editor ) );
  }
}
