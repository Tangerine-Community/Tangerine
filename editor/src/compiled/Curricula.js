var Curricula,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Curricula = (function(superClass) {
  extend(Curricula, superClass);

  function Curricula() {
    return Curricula.__super__.constructor.apply(this, arguments);
  }

  Curricula.prototype.url = "curriculum";

  Curricula.prototype.model = Curriculum;

  return Curricula;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImN1cnJpY3VsdW0vQ3VycmljdWxhLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFNBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7c0JBRUosR0FBQSxHQUFNOztzQkFDTixLQUFBLEdBQVE7Ozs7R0FIYyxRQUFRLENBQUMiLCJmaWxlIjoiY3VycmljdWx1bS9DdXJyaWN1bGEuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDdXJyaWN1bGEgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbiAgdXJsIDogXCJjdXJyaWN1bHVtXCJcbiAgbW9kZWwgOiBDdXJyaWN1bHVtXG4iXX0=
