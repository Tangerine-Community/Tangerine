import { PolymerElement } from '@polymer/polymer/polymer-element.js';

export class TangyInputBase extends PolymerElement {

  connectedCallback() {
    super.connectedCallback()
    this._initialProps = super.getProps()
  }

  getModProps() {
    const initialProps = this._initialProps
    const currentProps = super.getProps()
    const modifiedProps = {}
    for (const key of Object.keys(currentProps)) {
      if (typeof currentProps[key] === 'object' || initialProps[key] !== currentProps[key]) {
        modifiedProps[key] = currentProps[key]
      }
    }
    return {
      name: this.getAttribute('name'),
      value: this.value,
      ...modifiedProps
    }
  }

}
