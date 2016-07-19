var Klasses,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Klasses = (function(superClass) {
  extend(Klasses, superClass);

  function Klasses() {
    return Klasses.__super__.constructor.apply(this, arguments);
  }

  Klasses.prototype.model = Klass;

  Klasses.prototype.url = 'klass';

  return Klasses;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtsYXNzL0tsYXNzZXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsT0FBQTtFQUFBOzs7QUFBTTs7Ozs7OztvQkFDSixLQUFBLEdBQVE7O29CQUNSLEdBQUEsR0FBUTs7OztHQUZZLFFBQVEsQ0FBQyIsImZpbGUiOiJrbGFzcy9LbGFzc2VzLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgS2xhc3NlcyBleHRlbmRzIEJhY2tib25lLkNvbGxlY3Rpb25cbiAgbW9kZWwgOiBLbGFzc1xuICB1cmwgICA6ICdrbGFzcyciXX0=
