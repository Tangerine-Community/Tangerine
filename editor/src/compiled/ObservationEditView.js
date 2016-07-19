var ObservationEditView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ObservationEditView = (function(superClass) {
  extend(ObservationEditView, superClass);

  function ObservationEditView() {
    return ObservationEditView.__super__.constructor.apply(this, arguments);
  }

  ObservationEditView.prototype.className = "ObservationEditView";

  ObservationEditView.prototype.initialize = function(options) {
    var surveyAttributes;
    this.model = options.model;
    surveyAttributes = $.extend(this.model.get('surveyAttributes'), {
      "_id": this.model.id,
      "assessmentId": this.model.get("assessmentId")
    });
    this.surveyModel = new Backbone.Model(surveyAttributes);
    return this.surveyView = new SurveyEditView({
      "model": this.surveyModel
    });
  };

  ObservationEditView.prototype.isValid = function() {
    return true;
  };

  ObservationEditView.prototype.save = function() {
    var errors, intervalLength, totalSeconds;
    errors = [];
    totalSeconds = parseInt(this.$el.find("#total_seconds").val());
    intervalLength = parseInt(this.$el.find("#interval_length").val());
    if (totalSeconds === 0) {
      errors.push("Total seconds needs to be non-zero value.");
    }
    if (intervalLength === 0) {
      errors.push("Interval length needs to be a non-zero value.");
    }
    if (errors.length !== 0) {
      alert("Warning\n\n" + (errors.join('\n')));
    }
    return this.model.set({
      totalSeconds: totalSeconds,
      intervalLength: intervalLength,
      surveyAttributes: this.surveyModel.attributes
    });
  };

  ObservationEditView.prototype.render = function() {
    var intervalLength, totalSeconds;
    totalSeconds = this.model.get("totalSeconds") || 0;
    intervalLength = this.model.get("intervalLength") || 0;
    this.$el.html("<div class='label_value'> <label for='total_seconds'>Total seconds</label> <input id='total_seconds' value='" + totalSeconds + "' type='number'><br> <label for='interval_length' title='In seconds'>Interval length</label> <input id='interval_length' value='" + intervalLength + "' type='number'> </div> <div id='survey_editor'></div>");
    this.surveyView.setElement(this.$el.find("#survey_editor"));
    this.surveyView.render();
    return this.$el.find("#grid_link").remove();
  };

  return ObservationEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9PYnNlcnZhdGlvbkVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxJQUFBLG1CQUFBO0VBQUE7OztBQUFNOzs7Ozs7O2dDQUVKLFNBQUEsR0FBVzs7Z0NBRVgsVUFBQSxHQUFZLFNBQUUsT0FBRjtBQUNWLFFBQUE7SUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLE9BQU8sQ0FBQztJQUNqQixnQkFBQSxHQUFtQixDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGtCQUFYLENBQVQsRUFBeUM7TUFBQyxLQUFBLEVBQU0sSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFkO01BQWlCLGNBQUEsRUFBZSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxjQUFYLENBQWhDO0tBQXpDO0lBQ25CLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsUUFBUSxDQUFDLEtBQVQsQ0FBZSxnQkFBZjtXQUNuQixJQUFDLENBQUEsVUFBRCxHQUFrQixJQUFBLGNBQUEsQ0FDaEI7TUFBQSxPQUFBLEVBQVUsSUFBQyxDQUFBLFdBQVg7S0FEZ0I7RUFKUjs7Z0NBT1osT0FBQSxHQUFTLFNBQUE7V0FBRztFQUFIOztnQ0FFVCxJQUFBLEdBQU0sU0FBQTtBQUVKLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFFVCxZQUFBLEdBQWlCLFFBQUEsQ0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxnQkFBVixDQUEyQixDQUFDLEdBQTVCLENBQUEsQ0FBVjtJQUNqQixjQUFBLEdBQWlCLFFBQUEsQ0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxrQkFBVixDQUE2QixDQUFDLEdBQTlCLENBQUEsQ0FBVjtJQUVqQixJQUFHLFlBQUEsS0FBZ0IsQ0FBbkI7TUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSwyQ0FBWixFQUExQjs7SUFDQSxJQUFHLGNBQUEsS0FBa0IsQ0FBckI7TUFBNEIsTUFBTSxDQUFDLElBQVAsQ0FBWSwrQ0FBWixFQUE1Qjs7SUFFQSxJQUFHLE1BQU0sQ0FBQyxNQUFQLEtBQWlCLENBQXBCO01BQTJCLEtBQUEsQ0FBTyxhQUFBLEdBQWEsQ0FBQyxNQUFNLENBQUMsSUFBUCxDQUFZLElBQVosQ0FBRCxDQUFwQixFQUEzQjs7V0FFQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FDRTtNQUFBLFlBQUEsRUFBbUIsWUFBbkI7TUFDQSxjQUFBLEVBQW1CLGNBRG5CO01BRUEsZ0JBQUEsRUFBbUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxVQUZoQztLQURGO0VBWkk7O2dDQWlCTixNQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7SUFBQSxZQUFBLEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGNBQVgsQ0FBQSxJQUFnQztJQUNqRCxjQUFBLEdBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGdCQUFYLENBQUEsSUFBZ0M7SUFFakQsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsOEdBQUEsR0FHNkIsWUFIN0IsR0FHMEMsa0lBSDFDLEdBTStCLGNBTi9CLEdBTThDLHdEQU54RDtJQVdBLElBQUMsQ0FBQSxVQUFVLENBQUMsVUFBWixDQUF1QixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxnQkFBVixDQUF2QjtJQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFBO1dBR0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsWUFBVixDQUF1QixDQUFDLE1BQXhCLENBQUE7RUFuQk07Ozs7R0E5QndCLFFBQVEsQ0FBQyIsImZpbGUiOiJzdWJ0ZXN0L3Byb3RvdHlwZXMvT2JzZXJ2YXRpb25FZGl0Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiMgVGhpcyBwcm90b3R5cGUgcnVucyBhIHN1cnZleSBhdCBzcGVjaWZpZWQgaW50ZXJ2YWxzLlxuY2xhc3MgT2JzZXJ2YXRpb25FZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiT2JzZXJ2YXRpb25FZGl0Vmlld1wiXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cbiAgICBAbW9kZWwgPSBvcHRpb25zLm1vZGVsXG4gICAgc3VydmV5QXR0cmlidXRlcyA9ICQuZXh0ZW5kKEBtb2RlbC5nZXQoJ3N1cnZleUF0dHJpYnV0ZXMnKSwge1wiX2lkXCI6QG1vZGVsLmlkLFwiYXNzZXNzbWVudElkXCI6QG1vZGVsLmdldChcImFzc2Vzc21lbnRJZFwiKX0pXG4gICAgQHN1cnZleU1vZGVsID0gbmV3IEJhY2tib25lLk1vZGVsKHN1cnZleUF0dHJpYnV0ZXMpXG4gICAgQHN1cnZleVZpZXcgPSBuZXcgU3VydmV5RWRpdFZpZXdcbiAgICAgIFwibW9kZWxcIiA6IEBzdXJ2ZXlNb2RlbFxuXG4gIGlzVmFsaWQ6IC0+IHRydWVcblxuICBzYXZlOiAtPlxuXG4gICAgZXJyb3JzID0gW11cblxuICAgIHRvdGFsU2Vjb25kcyAgID0gcGFyc2VJbnQoIEAkZWwuZmluZChcIiN0b3RhbF9zZWNvbmRzXCIpLnZhbCgpIClcbiAgICBpbnRlcnZhbExlbmd0aCA9IHBhcnNlSW50KCBAJGVsLmZpbmQoXCIjaW50ZXJ2YWxfbGVuZ3RoXCIpLnZhbCgpIClcblxuICAgIGlmIHRvdGFsU2Vjb25kcyA9PSAwIHRoZW4gZXJyb3JzLnB1c2ggXCJUb3RhbCBzZWNvbmRzIG5lZWRzIHRvIGJlIG5vbi16ZXJvIHZhbHVlLlwiXG4gICAgaWYgaW50ZXJ2YWxMZW5ndGggPT0gMCB0aGVuIGVycm9ycy5wdXNoIFwiSW50ZXJ2YWwgbGVuZ3RoIG5lZWRzIHRvIGJlIGEgbm9uLXplcm8gdmFsdWUuXCJcblxuICAgIGlmIGVycm9ycy5sZW5ndGggIT0gMCB0aGVuIGFsZXJ0IChcIldhcm5pbmdcXG5cXG4je2Vycm9ycy5qb2luKCdcXG4nKX1cIilcblxuICAgIEBtb2RlbC5zZXRcbiAgICAgIHRvdGFsU2Vjb25kcyAgICAgOiB0b3RhbFNlY29uZHNcbiAgICAgIGludGVydmFsTGVuZ3RoICAgOiBpbnRlcnZhbExlbmd0aFxuICAgICAgc3VydmV5QXR0cmlidXRlcyA6IEBzdXJ2ZXlNb2RlbC5hdHRyaWJ1dGVzXG5cbiAgcmVuZGVyOiAtPlxuICAgIHRvdGFsU2Vjb25kcyAgID0gQG1vZGVsLmdldChcInRvdGFsU2Vjb25kc1wiKSAgIHx8IDBcbiAgICBpbnRlcnZhbExlbmd0aCA9IEBtb2RlbC5nZXQoXCJpbnRlcnZhbExlbmd0aFwiKSB8fCAwXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0ndG90YWxfc2Vjb25kcyc+VG90YWwgc2Vjb25kczwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0ndG90YWxfc2Vjb25kcycgdmFsdWU9JyN7dG90YWxTZWNvbmRzfScgdHlwZT0nbnVtYmVyJz48YnI+XG5cbiAgICAgICAgPGxhYmVsIGZvcj0naW50ZXJ2YWxfbGVuZ3RoJyB0aXRsZT0nSW4gc2Vjb25kcyc+SW50ZXJ2YWwgbGVuZ3RoPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdpbnRlcnZhbF9sZW5ndGgnIHZhbHVlPScje2ludGVydmFsTGVuZ3RofScgdHlwZT0nbnVtYmVyJz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBpZD0nc3VydmV5X2VkaXRvcic+PC9kaXY+XG4gICAgXCJcblxuICAgIEBzdXJ2ZXlWaWV3LnNldEVsZW1lbnQoQCRlbC5maW5kKFwiI3N1cnZleV9lZGl0b3JcIikpXG4gICAgQHN1cnZleVZpZXcucmVuZGVyKClcblxuICAgICMgcmVtb3ZlIHRoZSBvcHRpb24gZm9yIHRoZSBncmlkIGxpbmtcbiAgICBAJGVsLmZpbmQoXCIjZ3JpZF9saW5rXCIpLnJlbW92ZSgpIl19
