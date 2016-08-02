var HtmlRunView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

HtmlRunView = (function(superClass) {
  extend(HtmlRunView, superClass);

  function HtmlRunView() {
    return HtmlRunView.__super__.constructor.apply(this, arguments);
  }

  HtmlRunView.prototype.className = "HtmlRunView";

  HtmlRunView.prototype.initialize = function(options) {
    this.model = options.model;
    this.parent = options.parent;
    return this.dataEntry = options.dataEntry;
  };

  HtmlRunView.prototype.render = function() {
    var answer, previous;
    this.$el.html("<div class='question'> " + (this.model.get('html')) + " </div>");
    if (!this.dataEntry) {
      previous = this.parent.parent.result.getByHash(this.model.get('hash'));
      if (previous) {
        answer = previous.consent;
      }
    }
    this.trigger("rendered");
    return this.trigger("ready");
  };

  HtmlRunView.prototype.getResult = function() {
    return {
      "consent": this.consentButton.answer
    };
  };

  return HtmlRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnQvdHlwZXMvSHRtbFJ1blZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsV0FBQTtFQUFBOzs7QUFBTTs7Ozs7Ozt3QkFFSixTQUFBLEdBQVk7O3dCQUtaLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFFVixJQUFDLENBQUEsS0FBRCxHQUFVLE9BQU8sQ0FBQztJQUNsQixJQUFDLENBQUEsTUFBRCxHQUFVLE9BQU8sQ0FBQztXQUNsQixJQUFDLENBQUEsU0FBRCxHQUFhLE9BQU8sQ0FBQztFQUpYOzt3QkFNWixNQUFBLEdBQVEsU0FBQTtBQUVOLFFBQUE7SUFBQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSx5QkFBQSxHQUVMLENBQUMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxDQUFELENBRkssR0FFZSxTQUZ6QjtJQU1BLElBQUEsQ0FBTyxJQUFDLENBQUEsU0FBUjtNQUVFLFFBQUEsR0FBVyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBdEIsQ0FBZ0MsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxDQUFoQztNQUNYLElBQTZCLFFBQTdCO1FBQUEsTUFBQSxHQUFTLFFBQVEsQ0FBQyxRQUFsQjtPQUhGOztJQWtCQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7V0FDQSxJQUFDLENBQUEsT0FBRCxDQUFTLE9BQVQ7RUEzQk07O3dCQXNDUixTQUFBLEdBQVcsU0FBQTtBQUNULFdBQU87TUFBQSxTQUFBLEVBQVksSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUEzQjs7RUFERTs7OztHQW5EYSxRQUFRLENBQUMiLCJmaWxlIjoiZWxlbWVudC90eXBlcy9IdG1sUnVuVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEh0bWxSdW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiSHRtbFJ1blZpZXdcIlxuXG5cblxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQG1vZGVsICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ID0gb3B0aW9ucy5wYXJlbnRcbiAgICBAZGF0YUVudHJ5ID0gb3B0aW9ucy5kYXRhRW50cnlcblxuICByZW5kZXI6IC0+XG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxkaXYgY2xhc3M9J3F1ZXN0aW9uJz5cbiAgICAgICAgI3tAbW9kZWwuZ2V0KCdodG1sJyl9XG4gICAgICA8L2Rpdj5cbiAgICBcIlxuXG4gICAgdW5sZXNzIEBkYXRhRW50cnlcblxuICAgICAgcHJldmlvdXMgPSBAcGFyZW50LnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcbiAgICAgIGFuc3dlciA9IHByZXZpb3VzLmNvbnNlbnQgaWYgcHJldmlvdXNcblxuIyAgICBAY29uc2VudEJ1dHRvbiA9IG5ldyBCdXR0b25WaWV3XG4jICAgICAgb3B0aW9ucyA6IFtcbiMgICAgICAgIHsgbGFiZWwgOiBAdGV4dC55ZXMsIHZhbHVlIDogXCJ5ZXNcIiB9XG4jICAgICAgICB7IGxhYmVsIDogQHRleHQubm8sICB2YWx1ZSA6IFwibm9cIiB9XG4jICAgICAgXVxuIyAgICAgIG1vZGUgICAgICA6IFwic2luZ2xlXCJcbiMgICAgICBkYXRhRW50cnkgOiBmYWxzZVxuIyAgICAgIGFuc3dlciAgICA6IGFuc3dlciBvciBcIlwiXG4jXG4jICAgIEBjb25zZW50QnV0dG9uLnNldEVsZW1lbnQgQCRlbC5maW5kKFwiLmNvbnNlbnQtYnV0dG9uXCIpXG4jICAgIEBjb25zZW50QnV0dG9uLm9uIFwiY2hhbmdlXCIsIEBvbkNvbnNlbnRDaGFuZ2VcbiMgICAgQGNvbnNlbnRCdXR0b24ucmVuZGVyKClcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuICBcbiMgIGlzVmFsaWQ6IC0+XG4jICAgIGlmIEBjb25maXJtZWROb25Db25zZW50IGlzIGZhbHNlXG4jICAgICAgaWYgQGNvbnNlbnRCdXR0b24uYW5zd2VyIGlzIFwieWVzXCJcbiMgICAgICAgIHRydWVcbiMgICAgICBlbHNlXG4jICAgICAgICBmYWxzZVxuIyAgICBlbHNlXG4jICAgICAgdHJ1ZVxuXG4gIGdldFJlc3VsdDogLT5cbiAgICByZXR1cm4gXCJjb25zZW50XCIgOiBAY29uc2VudEJ1dHRvbi5hbnN3ZXJcblxuIl19
