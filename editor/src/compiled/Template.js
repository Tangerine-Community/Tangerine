var Template,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Template = (function(superClass) {
  extend(Template, superClass);

  function Template() {
    return Template.__super__.constructor.apply(this, arguments);
  }

  Template.prototype.url = "template";

  return Template;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlbXBsYXRlL1RlbXBsYXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFFBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7cUJBQ0wsR0FBQSxHQUFNOzs7O0dBRGdCLFFBQVEsQ0FBQyIsImZpbGUiOiJ0ZW1wbGF0ZS9UZW1wbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFRlbXBsYXRlIGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblx0dXJsIDogXCJ0ZW1wbGF0ZVwiIl19
