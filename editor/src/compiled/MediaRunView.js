var MediaRunView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MediaRunView = (function(superClass) {
  extend(MediaRunView, superClass);

  function MediaRunView() {
    return MediaRunView.__super__.constructor.apply(this, arguments);
  }

  MediaRunView.prototype.className = "MediaRunView";

  MediaRunView.prototype.initialize = function(options) {
    this.model = options.model;
    this.parent = options.parent;
    return this.dataEntry = options.dataEntry;
  };

  MediaRunView.prototype.render = function() {
    var answer, previous;
    this.$el.html("<div class='question'> " + (this.model.get('media')) + " </div>");
    if (!this.dataEntry) {
      previous = this.parent.parent.result.getByHash(this.model.get('hash'));
      if (previous) {
        answer = previous.consent;
      }
    }
    this.trigger("rendered");
    return this.trigger("ready");
  };

  MediaRunView.prototype.getResult = function() {
    return {
      "consent": this.consentButton.answer
    };
  };

  return MediaRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnQvdHlwZXMvTWVkaWFSdW5WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFlBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7eUJBRUosU0FBQSxHQUFZOzt5QkFLWixVQUFBLEdBQVksU0FBQyxPQUFEO0lBRVYsSUFBQyxDQUFBLEtBQUQsR0FBVSxPQUFPLENBQUM7SUFDbEIsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFPLENBQUM7V0FDbEIsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUM7RUFKWDs7eUJBTVosTUFBQSxHQUFRLFNBQUE7QUFFTixRQUFBO0lBQUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUseUJBQUEsR0FFTCxDQUFDLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE9BQVgsQ0FBRCxDQUZLLEdBRWdCLFNBRjFCO0lBTUEsSUFBQSxDQUFPLElBQUMsQ0FBQSxTQUFSO01BRUUsUUFBQSxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUF0QixDQUFnQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQWhDO01BQ1gsSUFBNkIsUUFBN0I7UUFBQSxNQUFBLEdBQVMsUUFBUSxDQUFDLFFBQWxCO09BSEY7O0lBa0JBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtXQUNBLElBQUMsQ0FBQSxPQUFELENBQVMsT0FBVDtFQTNCTTs7eUJBc0NSLFNBQUEsR0FBVyxTQUFBO0FBQ1QsV0FBTztNQUFBLFNBQUEsRUFBWSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQTNCOztFQURFOzs7O0dBbkRjLFFBQVEsQ0FBQyIsImZpbGUiOiJlbGVtZW50L3R5cGVzL01lZGlhUnVuVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIE1lZGlhUnVuVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIk1lZGlhUnVuVmlld1wiXG5cblxuXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAbW9kZWwgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgPSBvcHRpb25zLnBhcmVudFxuICAgIEBkYXRhRW50cnkgPSBvcHRpb25zLmRhdGFFbnRyeVxuXG4gIHJlbmRlcjogLT5cblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGRpdiBjbGFzcz0ncXVlc3Rpb24nPlxuICAgICAgICAje0Btb2RlbC5nZXQoJ21lZGlhJyl9XG4gICAgICA8L2Rpdj5cbiAgICBcIlxuXG4gICAgdW5sZXNzIEBkYXRhRW50cnlcblxuICAgICAgcHJldmlvdXMgPSBAcGFyZW50LnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcbiAgICAgIGFuc3dlciA9IHByZXZpb3VzLmNvbnNlbnQgaWYgcHJldmlvdXNcblxuIyAgICBAY29uc2VudEJ1dHRvbiA9IG5ldyBCdXR0b25WaWV3XG4jICAgICAgb3B0aW9ucyA6IFtcbiMgICAgICAgIHsgbGFiZWwgOiBAdGV4dC55ZXMsIHZhbHVlIDogXCJ5ZXNcIiB9XG4jICAgICAgICB7IGxhYmVsIDogQHRleHQubm8sICB2YWx1ZSA6IFwibm9cIiB9XG4jICAgICAgXVxuIyAgICAgIG1vZGUgICAgICA6IFwic2luZ2xlXCJcbiMgICAgICBkYXRhRW50cnkgOiBmYWxzZVxuIyAgICAgIGFuc3dlciAgICA6IGFuc3dlciBvciBcIlwiXG4jXG4jICAgIEBjb25zZW50QnV0dG9uLnNldEVsZW1lbnQgQCRlbC5maW5kKFwiLmNvbnNlbnQtYnV0dG9uXCIpXG4jICAgIEBjb25zZW50QnV0dG9uLm9uIFwiY2hhbmdlXCIsIEBvbkNvbnNlbnRDaGFuZ2VcbiMgICAgQGNvbnNlbnRCdXR0b24ucmVuZGVyKClcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuICBcbiMgIGlzVmFsaWQ6IC0+XG4jICAgIGlmIEBjb25maXJtZWROb25Db25zZW50IGlzIGZhbHNlXG4jICAgICAgaWYgQGNvbnNlbnRCdXR0b24uYW5zd2VyIGlzIFwieWVzXCJcbiMgICAgICAgIHRydWVcbiMgICAgICBlbHNlXG4jICAgICAgICBmYWxzZVxuIyAgICBlbHNlXG4jICAgICAgdHJ1ZVxuXG4gIGdldFJlc3VsdDogLT5cbiAgICByZXR1cm4gXCJjb25zZW50XCIgOiBAY29uc2VudEJ1dHRvbi5hbnN3ZXJcblxuIl19
