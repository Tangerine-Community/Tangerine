

/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ckeditor5-acasi/utils
 */

import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import { toWidget, isWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';


/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */


const formSymbol = Symbol( 'isForm' );
const acasiSymbol = Symbol( 'isAcasi' );
const symbols = {};

/**
 * Converts a given {@link module:engine/view/element~Element} to an acasi widget:
 * * adds a {@link module:engine/view/element~Element#setCustomProperty custom property} allowing to recognize the acasi widget element,
 * * calls the {@link module:widget/utils~toWidget toWidget} function with the proper element's label creator.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {String} label Element's label. It will be concatenated with the acasi `alt` attribute if one is present.
 * @returns {module:engine/view/element~Element}
 */
export function toFormWidget( widget, viewElement ) {

  // const symbol = Symbol(widget);
  // symbols[widget] = symbol
  viewElement.setCustomProperty( formSymbol, true );
  const label = 'form'
  // return toWidget( viewElement, { label: labelCreator } );
  return toWidget( viewElement, { label: label } );

  // function labelCreator() {
  //   const imgElement = viewElement.getChild( 0 );
  //   const imgSrc = imgElement.getAttribute( 'img-src' );
  //
  //   return imgSrc ? `${ imgSrc } ${ label }` : label;
  // }
}

/**
 * Checks if a given model element name is the same as the Custom Property.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isCustom( widget, modelElement ) {
  return modelElement instanceof ModelElement && modelElement.name == widget;
}

/**
 * Checks if a given view element is a custom widget by checking if it has its Symbol as a Custom Property.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isCustomWidget( widget, viewElement ) {
  // const symbol = symbols[widget]
  if (typeof viewElement !== 'undefined' && viewElement !== null) {
     // return !!viewElement.getCustomProperty( symbol ) && isWidget( viewElement );
     return !!viewElement.getCustomProperty( formSymbol ) && isWidget( viewElement );
  } else {
    return false
  }
}

/**
 * Checks if a widget is the only selected element.
 *
 * @param {module:engine/view/selection~Selection} viewSelection
 * @returns {Boolean}
 */
export function isCustomWidgetSelected( widget, viewSelection ) {
  const viewElement = viewSelection.getSelectedElement();

  return !!( viewElement && isCustomWidget( widget, viewElement ) );
}

/**
 * A helper utility which positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon} instance
 * with respect to the custom widget in the editor content, if one is selected.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export function repositionCustomWidgetContextualBalloon( widget, editor ) {
  const balloon = editor.plugins.get( 'ContextualBalloon' );

  if ( isCustomWidgetSelected( widget, editor.editing.view.selection ) ) {
    const position = getBalloonPositionData( editor );

    balloon.updatePosition( position );
  }
}

/**
 * Converts a given {@link module:engine/view/element~Element} to an acasi widget:
 * * adds a {@link module:engine/view/element~Element#setCustomProperty custom property} allowing to recognize the acasi widget element,
 * * calls the {@link module:widget/utils~toWidget toWidget} function with the proper element's label creator.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {String} label Element's label. It will be concatenated with the acasi `alt` attribute if one is present.
 * @returns {module:engine/view/element~Element}
 */
export function toAcasiWidget( viewElement, label ) {
  viewElement.setCustomProperty( acasiSymbol, true );
  label = 'acasi'
  return toWidget( viewElement, { label: labelCreator } );

  function labelCreator() {
    const imgElement = viewElement.getChild( 0 );
    const imgSrc = imgElement.getAttribute( 'img-src' );

    return imgSrc ? `${ imgSrc } ${ label }` : label;
  }
}

/**
 * Checks if a given view element is an acasi widget.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isAcasiWidget( viewElement ) {
  return !!viewElement.getCustomProperty( acasiSymbol ) && isWidget( viewElement );
}

/**
 * Checks if an acasi widget is the only selected element.
 *
 * @param {module:engine/view/selection~Selection} viewSelection
 * @returns {Boolean}
 */
export function isAcasiWidgetSelected( viewSelection ) {
  const viewElement = viewSelection.getSelectedElement();

  return !!( viewElement && isAcasiWidget( viewElement ) );
}

/**
 * Checks if the provided model element is an instance of {@link module:engine/model/element~Element Element} and its name
 * is `acasi`.
 *
 * @param {module:engine/model/element~Element} modelElement
 * @returns {Boolean}
 */
export function isAcasi( modelElement ) {
  return modelElement instanceof ModelElement && modelElement.name == 'tangy-acasi';
}


/**
 * A helper utility which positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon} instance
 * with respect to the acasi in the editor content, if one is selected.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export function repositionCustomContextualBalloon( widget, editor ) {
  const balloon = editor.plugins.get( 'ContextualBalloon' );

  if ( isCustomWidgetSelected( widget, editor.editing.view.selection ) ) {
    const position = getBalloonPositionData( editor );

    balloon.updatePosition( position );
  }
}

/**
 * A helper utility which positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon} instance
 * with respect to the acasi in the editor content, if one is selected.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export function repositionContextualBalloon( editor ) {
  const balloon = editor.plugins.get( 'ContextualBalloon' );

  if ( isAcasiWidgetSelected( editor.editing.view.selection ) ) {
    const position = getBalloonPositionData( editor );

    balloon.updatePosition( position );
  }
}

/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}, with respect
 * to the selected element in the editor content.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @returns {module:utils/dom/position~Options}
 */
export function getBalloonPositionData( editor ) {
  const editingView = editor.editing.view;
  const defaultPositions = BalloonPanelView.defaultPositions;

  return {
    target: editingView.domConverter.viewToDom( editingView.selection.getSelectedElement() ),
    positions: [
      defaultPositions.northArrowSouth,
      defaultPositions.southArrowNorth
    ]
  };
}
