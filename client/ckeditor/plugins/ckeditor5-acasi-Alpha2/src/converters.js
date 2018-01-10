/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module form/form/converters
 */

import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import ModelDocumentFragment from '@ckeditor/ckeditor5-engine/src/model/documentfragment';
import modelWriter from '@ckeditor/ckeditor5-engine/src/model/writer';

/**
 * Returns a function that converts the form view representation:
 *
 *		<figure class="form"><form src="..." alt="..."></form></figure>
 *
 * to the model representation:
 *
 *		<form src="..." alt="..."></form>
 *
 * The entire content of the `<figure>` element except the first `<form>` is being converted as children
 * of the `<form>` model element.
 *
 * @returns {Function}
 */
export function viewFigureToModel() {
  return ( evt, data, consumable, conversionApi ) => {
    // Do not convert if this is not an "form figure".
    if ( !consumable.test( data.input, { name: true, class: 'form' } ) ) {
      return;
    }

    // Do not convert if form cannot be placed in model at this context.
    if ( !conversionApi.schema.check( { name: 'form', inside: data.context, attributes: 'id' } ) ) {
      return;
    }

    // Find an form element inside the figure element.
    const viewImage = Array.from( data.input.getChildren() ).find( viewChild => viewChild.is( 'form' ) );

    // Do not convert if form element is absent, is missing id attribute or was already converted.
    if ( !viewImage || !viewImage.hasAttribute( 'id' ) || !consumable.test( viewImage, { name: true } ) ) {
      return;
    }

    // Convert view form to model form.
    const modelImage = conversionApi.convertItem( viewImage, consumable, data );

    // Convert rest of figure element's children, but in the context of model form, because those converted
    // children will be added as model form children.
    data.context.push( modelImage );

    const modelChildren = conversionApi.convertChildren( data.input, consumable, data );

    data.context.pop();

    // Add converted children to model form.
    modelWriter.insert( ModelPosition.createAt( modelImage ), modelChildren );

    // Set model form as conversion result.
    data.output = modelImage;
  };
}

// Holds all forms that were converted for autohoisting.
const autohoistedForms = new WeakSet();

/**
 * A converter which converts `<form>` {@link module:engine/view/element~Element view elements} that can be hoisted.
 *
 * If an `<form>` view element has not been converted, this converter checks if that element could be converted in any
 * context "above". If it could, the converter converts the `<form>` element even though it is not allowed in the current
 * context and marks it to be autohoisted. Then {@link module:form/form/converters~hoistImageThroughElement another converter}
 * moves the converted element to the correct location.
 */
export function convertHoistableForm( evt, data, consumable, conversionApi ) {
  const form = data.input;

  // If the form has not been consumed (converted)...
  if ( !consumable.test( form, { name: true, attribute: [ 'id' ] } ) ) {
    return;
  }
  // At this point the form has not been converted because it was not allowed by schema. It might be in wrong
  // context or missing an attribute, but above we already checked whether the form has mandatory id attribute.

  // If the form would be allowed if it was in one of its ancestors...
  const allowedContext = _findAllowedContext( { name: 'form', attributes: [ 'id' ] }, data.context, conversionApi.schema );

  if ( !allowedContext ) {
    return;
  }

  // Convert it in that context...
  const newData = Object.assign( {}, data );
  newData.context = allowedContext;

  data.output = conversionApi.convertItem( form, consumable, newData );

  // And mark that form to be hoisted.
  autohoistedForms.add( data.output );
}

// Basing on passed `context`, searches for "closest" context in which model element represented by `modelData`
// would be allowed by `schema`.
//
// @private
// @param {Object} modelData Object describing model element to check. Has two properties: `name` with model element name
// and `attributes` with keys of attributes of that model element.
// @param {Array} context Context in which original conversion was supposed to take place.
// @param {module:engine/model/schema~Schema} schema Schema to check with.
// @returns {Array|null} Context in which described model element would be allowed by `schema` or `null` if such context
// could not been found.
function _findAllowedContext( modelData, context, schema ) {
  // Copy context array so we won't modify original array.
  context = context.slice();

  // Prepare schema query to check with schema.
  // Since `inside` property is passed as reference to `context` variable, we don't need to modify `schemaQuery`.
  const schemaQuery = {
    name: modelData.name,
    attributes: modelData.attributes,
    inside: context
  };

  // Try out all possible contexts.
  while ( context.length && !schema.check( schemaQuery ) ) {
    const parent = context.pop();
    const parentName = typeof parent === 'string' ? parent : parent.name;

    // Do not try to autohoist "above" limiting element.
    if ( schema.limits.has( parentName ) ) {
      return null;
    }
  }

  // If `context` has any items it means that form is allowed in that context. Return that context.
  // If `context` has no items it means that form was not allowed in any of possible contexts. Return `null`.
  return context.length ? context : null;
}

/**
 * A converter which hoists `<form>` {@link module:engine/model/element~Element model elements} to allowed context.
 *
 * It looks through all children of the converted {@link module:engine/view/element~Element view element} if it
 * was converted to a model element. It breaks the model element if an `<form>` to-be-hoisted is found.
 *
 *		<div><paragraph>x<form id="sayItLoud"></form>x</paragraph></div> ->
 *		<div><paragraph>x</paragraph></div><form id="sayItLoud"></form><div><paragraph>x</paragraph></div>
 *
 * This works deeply, as shown in the example. This converter added for the `<paragraph>` element will break the `<paragraph>`
 *  element and pass the {@link module:engine/model/documentfragment~DocumentFragment document fragment} in `data.output`.
 *  Then, the `<div>` will be handled by this converter and will be once again broken to hoist the `<form>` up to the root.
 *
 * **Note:** This converter should be executed only after the view element has already been converted, which means that
 * `data.output` for that view element should be already generated when this converter is fired.
 */
export function hoistFormThroughElement( evt, data ) {
  // If this element has been properly converted...
  if ( !data.output ) {
    return;
  }

  // And it is an element...
  // (If it is document fragment autohoisting does not have to break anything anyway.)
  // (And if it is text there are no children here.)
  if ( !data.output.is( 'element' ) ) {
    return;
  }

  // This will hold newly generated output. At the beginning it is only the original element.
  const newOutput = [];

  // Check if any of its children is to be hoisted...
  // Start from the last child - it is easier to break that way.
  for ( let i = data.output.childCount - 1; i >= 0; i-- ) {
    const child = data.output.getChild( i );

    if ( autohoistedForms.has( child ) ) {
      // Break autohoisted element's parent:
      // <parent>{ left-children... }<authoistedElement />{ right-children... }</parent>   --->
      // <parent>{ left-children... }</parent><autohoistedElement /><parent>{ right-children... }</parent>
      //
      // or
      //
      // <parent>{ left-children... }<autohoistedElement /></parent> --->
      // <parent>{ left-children... }</parent><autohoistedElement />
      //
      // or
      //
      // <parent><autohoistedElement />{ right-children... }</parent> --->
      // <autohoistedElement /><parent>{ right-children... }</parent>
      //
      // or
      //
      // <parent><autohoistedElement /></parent> ---> <autohoistedElement />

      // Check how many right-children there are.
      const rightChildrenCount = data.output.childCount - i - 1;
      let rightParent = null;

      // If there are any right-children, clone the prent element and insert those children there.
      if ( rightChildrenCount > 0 ) {
        rightParent = data.output.clone( false );
        rightParent.appendChildren( data.output.removeChildren( i + 1, rightChildrenCount ) );
      }

      // Remove the autohoisted element from its parent.
      child.remove();

      // Break "leading" `data.output` in `newOutput` into one or more pieces:
      // Remove "leading" `data.output` (note that `data.output` is always first item in `newOutput`).
      newOutput.shift();

      // Add the newly created parent of the right-children at the beginning.
      if ( rightParent ) {
        newOutput.unshift( rightParent );
      }

      // Add autohoisted element at the beginning.
      newOutput.unshift( child );

      // Add `data.output` at the beginning, if there is anything left in it.
      if ( data.output.childCount > 0 ) {
        newOutput.unshift( data.output );
      }
    }
  }

  // If the output has changed pass it further.
  if ( newOutput.length ) {
    data.output = new ModelDocumentFragment( newOutput );
  }
}