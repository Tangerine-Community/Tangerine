var CurriculaListView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CurriculaListView = (function(superClass) {
  extend(CurriculaListView, superClass);

  function CurriculaListView() {
    this.render = bind(this.render, this);
    return CurriculaListView.__super__.constructor.apply(this, arguments);
  }

  CurriculaListView.prototype.className = "CurriculaListView";

  CurriculaListView.prototype.tagName = "ul";

  CurriculaListView.prototype.initialize = function(options) {
    var base;
    this.views = [];
    this.curricula = options.curricula;
    return typeof (base = this.curricula).on === "function" ? base.on("all", this.render) : void 0;
  };

  CurriculaListView.prototype.render = function() {
    if (this.curricula.length === 0) {
      return;
    }
    this.$el.html("<h1>Curricula</h1>");
    this.closeViews;
    this.curricula.each((function(_this) {
      return function(curriculum) {
        var view;
        view = new CurriculumListElementView({
          "curriculum": curriculum
        });
        view.render();
        _this.$el.append(view.el);
        return _this.views.push(view);
      };
    })(this));
    return this.trigger("rendered");
  };

  CurriculaListView.prototype.onClose = function() {
    return this.closeViews();
  };

  CurriculaListView.prototype.closeViews = function() {
    var i, len, ref, results, view;
    ref = this.views;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      view = ref[i];
      results.push(typeof view.close === "function" ? view.close() : void 0);
    }
    return results;
  };

  return CurriculaListView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImN1cnJpY3VsdW0vQ3VycmljdWxhTGlzdFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsaUJBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs4QkFFSixTQUFBLEdBQVc7OzhCQUNYLE9BQUEsR0FBUzs7OEJBRVQsVUFBQSxHQUFZLFNBQUMsT0FBRDtBQUNWLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ1QsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUM7a0VBQ1gsQ0FBQyxHQUFJLE9BQU8sSUFBQyxDQUFBO0VBSGI7OzhCQU1aLE1BQUEsR0FBUSxTQUFBO0lBQ04sSUFBVSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsS0FBcUIsQ0FBL0I7QUFBQSxhQUFBOztJQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLG9CQUFWO0lBQ0EsSUFBQyxDQUFBO0lBQ0QsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxVQUFEO0FBQ2QsWUFBQTtRQUFBLElBQUEsR0FBVyxJQUFBLHlCQUFBLENBQ1Q7VUFBQSxZQUFBLEVBQWUsVUFBZjtTQURTO1FBRVgsSUFBSSxDQUFDLE1BQUwsQ0FBQTtRQUNBLEtBQUMsQ0FBQSxHQUFHLENBQUMsTUFBTCxDQUFZLElBQUksQ0FBQyxFQUFqQjtlQUNBLEtBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLElBQVo7TUFMYztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEI7V0FPQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFYTTs7OEJBYVIsT0FBQSxHQUFTLFNBQUE7V0FDUCxJQUFDLENBQUEsVUFBRCxDQUFBO0VBRE87OzhCQUdULFVBQUEsR0FBWSxTQUFBO0FBQ1YsUUFBQTtBQUFBO0FBQUE7U0FBQSxxQ0FBQTs7c0RBQ0UsSUFBSSxDQUFDO0FBRFA7O0VBRFU7Ozs7R0EzQmtCLFFBQVEsQ0FBQyIsImZpbGUiOiJjdXJyaWN1bHVtL0N1cnJpY3VsYUxpc3RWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQ3VycmljdWxhTGlzdFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIkN1cnJpY3VsYUxpc3RWaWV3XCJcbiAgdGFnTmFtZTogXCJ1bFwiXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQHZpZXdzID0gW11cbiAgICBAY3VycmljdWxhID0gb3B0aW9ucy5jdXJyaWN1bGFcbiAgICBAY3VycmljdWxhLm9uPyBcImFsbFwiLCBAcmVuZGVyXG5cblxuICByZW5kZXI6ID0+XG4gICAgcmV0dXJuIGlmIEBjdXJyaWN1bGEubGVuZ3RoID09IDAgXG4gICAgQCRlbC5odG1sIFwiPGgxPkN1cnJpY3VsYTwvaDE+XCJcbiAgICBAY2xvc2VWaWV3c1xuICAgIEBjdXJyaWN1bGEuZWFjaCAoY3VycmljdWx1bSkgPT5cbiAgICAgIHZpZXcgPSBuZXcgQ3VycmljdWx1bUxpc3RFbGVtZW50Vmlld1xuICAgICAgICBcImN1cnJpY3VsdW1cIiA6IGN1cnJpY3VsdW1cbiAgICAgIHZpZXcucmVuZGVyKClcbiAgICAgIEAkZWwuYXBwZW5kIHZpZXcuZWxcbiAgICAgIEB2aWV3cy5wdXNoIHZpZXdcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICBcbiAgb25DbG9zZTogLT5cbiAgICBAY2xvc2VWaWV3cygpXG4gIFxuICBjbG9zZVZpZXdzOiAtPlxuICAgIGZvciB2aWV3IGluIEB2aWV3c1xuICAgICAgdmlldy5jbG9zZT8oKVxuICAiXX0=
