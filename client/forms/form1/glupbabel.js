System.register(['../../node_modules/@polymer/polymer/polymer-element.js'], function (_export, _context) {
  "use strict";

  var PolymerElement;
  return {
    setters: [function (_node_modulesPolymerPolymerPolymerElementJs) {
      PolymerElement = _node_modulesPolymerPolymerPolymerElementJs.Element;
    }],
    execute: function () {
      // import '../../node_modules/@polymer/paper-input/paper-input.js'

      /**
       * `tangy-foo`
       *
       *
       * @customElement
       * @polymer
       * @demo demo/index.html
       */
      class TangyFoo extends PolymerElement {
        static get template() {
          return `<slot></slot>`;
        }
        static get is() {
          return 'tangy-foo';
        }

        ready() {
          console.log("foo!");
          this.innerHTML = "<tangy-input></tangy-input>";
        }
      } /* jshint esversion: 6 */

      _export('TangyFoo', TangyFoo);

      window.customElements.define(TangyFoo.is, TangyFoo);
    }
  };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHA6Ly8xMjcuMC4wLjE6ODA4MC90YW5neS1mb3Jtcy1idWlsZC9zcmMvdGFuZ3ktZm9vL3Rhbmd5LWZvby5qcyJdLCJuYW1lcyI6WyJQb2x5bWVyRWxlbWVudCIsIkVsZW1lbnQiLCJUYW5neUZvbyIsInRlbXBsYXRlIiwiaXMiLCJyZWFkeSIsImNvbnNvbGUiLCJsb2ciLCJpbm5lckhUTUwiLCJ3aW5kb3ciLCJjdXN0b21FbGVtZW50cyIsImRlZmluZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRW9CQSxvQiwrQ0FBWEMsTzs7O0FBQ1Q7O0FBRUE7Ozs7Ozs7O0FBUU8sWUFBTUMsUUFBTixTQUF1QkYsY0FBdkIsQ0FBc0M7QUFDM0MsbUJBQVdHLFFBQVgsR0FBc0I7QUFDcEIsaUJBQVEsZUFBUjtBQUNEO0FBQ0QsbUJBQVdDLEVBQVgsR0FBZ0I7QUFDZCxpQkFBTyxXQUFQO0FBQ0Q7O0FBRURDLGdCQUFRO0FBQ05DLGtCQUFRQyxHQUFSLENBQVksTUFBWjtBQUNBLGVBQUtDLFNBQUwsR0FBaUIsNkJBQWpCO0FBQ0Q7QUFYMEMsTyxDQWI3Qzs7OztBQTJCQUMsYUFBT0MsY0FBUCxDQUFzQkMsTUFBdEIsQ0FBNkJULFNBQVNFLEVBQXRDLEVBQTBDRixRQUExQyIsImZpbGUiOiJ0YW5neS1mb28uanMhdHJhbnNwaWxlZCIsInNvdXJjZXNDb250ZW50IjpbIi8qIGpzaGludCBlc3ZlcnNpb246IDYgKi9cblxuaW1wb3J0IHsgRWxlbWVudCBhcyBQb2x5bWVyRWxlbWVudCB9IGZyb20gJy4uLy4uL25vZGVfbW9kdWxlcy9AcG9seW1lci9wb2x5bWVyL3BvbHltZXItZWxlbWVudC5qcyc7XG4vLyBpbXBvcnQgJy4uLy4uL25vZGVfbW9kdWxlcy9AcG9seW1lci9wYXBlci1pbnB1dC9wYXBlci1pbnB1dC5qcydcblxuLyoqXG4gKiBgdGFuZ3ktZm9vYFxuICpcbiAqXG4gKiBAY3VzdG9tRWxlbWVudFxuICogQHBvbHltZXJcbiAqIEBkZW1vIGRlbW8vaW5kZXguaHRtbFxuICovXG5leHBvcnQgY2xhc3MgVGFuZ3lGb28gZXh0ZW5kcyBQb2x5bWVyRWxlbWVudCB7XG4gIHN0YXRpYyBnZXQgdGVtcGxhdGUoKSB7XG4gICAgcmV0dXJuIGA8c2xvdD48L3Nsb3Q+YDtcbiAgfVxuICBzdGF0aWMgZ2V0IGlzKCkge1xuICAgIHJldHVybiAndGFuZ3ktZm9vJztcbiAgfVxuXG4gIHJlYWR5KCkge1xuICAgIGNvbnNvbGUubG9nKFwiZm9vIVwiKTtcbiAgICB0aGlzLmlubmVySFRNTCA9IFwiPHRhbmd5LWlucHV0PjwvdGFuZ3ktaW5wdXQ+XCI7XG4gIH1cbn1cblxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZShUYW5neUZvby5pcywgVGFuZ3lGb28pOyJdfQ==