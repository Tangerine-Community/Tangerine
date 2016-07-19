var IdRunView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

IdRunView = (function(superClass) {
  extend(IdRunView, superClass);

  function IdRunView() {
    return IdRunView.__super__.constructor.apply(this, arguments);
  }

  IdRunView.prototype.className = "id";

  IdRunView.prototype.events = {
    'click #generate': 'generate',
    'change #participant_id': 'setValidator'
  };

  IdRunView.prototype.i18n = function() {
    return this.text = {
      identifier: t("IdRunView.label.identifier"),
      generate: t("IdRunView.button.generate")
    };
  };

  IdRunView.prototype.initialize = function(options) {
    this.i18n();
    this.model = options.model;
    this.parent = options.parent;
    this.dataEntry = options.dataEntry;
    return this.validator = new CheckDigit;
  };

  IdRunView.prototype.render = function() {
    var participantId, previous;
    if (!this.dataEntry) {
      previous = this.parent.parent.result.getByHash(this.model.get('hash'));
      if (previous) {
        participantId = previous.participant_id;
      }
    }
    this.$el.html("<form> <label for='participant_id'>" + this.text.identifier + "</label> <input id='participant_id' name='participant_id' value='" + (participantId || '') + "'> <button id='generate' class='command'>" + this.text.generate + "</button> <div class='messages'></div> </form>");
    this.trigger("rendered");
    return this.trigger("ready");
  };

  IdRunView.prototype.getResult = function() {
    return {
      'participant_id': this.$el.find("#participant_id").val()
    };
  };

  IdRunView.prototype.getSkipped = function() {
    return {
      'participant_id': "skipped"
    };
  };

  IdRunView.prototype.setValidator = function() {
    return this.validator.set(this.getResult()['participant_id']);
  };

  IdRunView.prototype.isValid = function() {
    this.setValidator();
    if (!this.validator.isValid()) {
      return false;
    }
    return this.updateNavigation();
  };

  IdRunView.prototype.showErrors = function() {
    return this.$el.find(".messages").html(this.validator.getErrors().join(", "));
  };

  IdRunView.prototype.generate = function() {
    this.$el.find(".messages").empty();
    this.$el.find('#participant_id').val(this.validator.generate());
    return false;
  };

  IdRunView.prototype.updateNavigation = function() {
    return Tangerine.nav.setStudent(this.getResult()['participant_id']);
  };

  return IdRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9JZFJ1blZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsU0FBQTtFQUFBOzs7QUFBTTs7Ozs7OztzQkFFSixTQUFBLEdBQVc7O3NCQUVYLE1BQUEsR0FDRTtJQUFBLGlCQUFBLEVBQTJCLFVBQTNCO0lBQ0Esd0JBQUEsRUFBMkIsY0FEM0I7OztzQkFHRixJQUFBLEdBQU0sU0FBQTtXQUNKLElBQUMsQ0FBQSxJQUFELEdBQ0U7TUFBQSxVQUFBLEVBQWEsQ0FBQSxDQUFFLDRCQUFGLENBQWI7TUFDQSxRQUFBLEVBQWEsQ0FBQSxDQUFFLDJCQUFGLENBRGI7O0VBRkU7O3NCQUtOLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFFVixJQUFDLENBQUEsSUFBRCxDQUFBO0lBRUEsSUFBQyxDQUFBLEtBQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLE1BQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUM7V0FFckIsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFJO0VBUlA7O3NCQVVaLE1BQUEsR0FBUSxTQUFBO0FBRU4sUUFBQTtJQUFBLElBQUEsQ0FBTyxJQUFDLENBQUEsU0FBUjtNQUNFLFFBQUEsR0FBVyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBdEIsQ0FBZ0MsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxDQUFoQztNQUNYLElBQUcsUUFBSDtRQUNFLGFBQUEsR0FBZ0IsUUFBUSxDQUFDLGVBRDNCO09BRkY7O0lBS0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUscUNBQUEsR0FFc0IsSUFBQyxDQUFBLElBQUksQ0FBQyxVQUY1QixHQUV1QyxtRUFGdkMsR0FHaUQsQ0FBQyxhQUFBLElBQWUsRUFBaEIsQ0FIakQsR0FHb0UsMkNBSHBFLEdBSWdDLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFKdEMsR0FJK0MsZ0RBSnpEO0lBT0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO1dBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxPQUFUO0VBZk07O3NCQWlCUixTQUFBLEdBQVcsU0FBQTtBQUNULFdBQU87TUFBRSxnQkFBQSxFQUFtQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVixDQUE0QixDQUFDLEdBQTdCLENBQUEsQ0FBckI7O0VBREU7O3NCQUdYLFVBQUEsR0FBWSxTQUFBO0FBQ1YsV0FBTztNQUFFLGdCQUFBLEVBQW1CLFNBQXJCOztFQURHOztzQkFHWixZQUFBLEdBQWMsU0FBQTtXQUNaLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFlLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBYSxDQUFBLGdCQUFBLENBQTVCO0VBRFk7O3NCQUdkLE9BQUEsR0FBUyxTQUFBO0lBQ1AsSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQUNBLElBQWdCLENBQUksSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQUEsQ0FBcEI7QUFBQSxhQUFPLE1BQVA7O1dBQ0EsSUFBQyxDQUFBLGdCQUFELENBQUE7RUFITzs7c0JBS1QsVUFBQSxHQUFZLFNBQUE7V0FDVixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxXQUFWLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxTQUFYLENBQUEsQ0FBc0IsQ0FBQyxJQUF2QixDQUE0QixJQUE1QixDQUE1QjtFQURVOztzQkFHWixRQUFBLEdBQVUsU0FBQTtJQUNSLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFdBQVYsQ0FBc0IsQ0FBQyxLQUF2QixDQUFBO0lBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsaUJBQVYsQ0FBNEIsQ0FBQyxHQUE3QixDQUFpQyxJQUFDLENBQUEsU0FBUyxDQUFDLFFBQVgsQ0FBQSxDQUFqQztXQUNBO0VBSFE7O3NCQUtWLGdCQUFBLEdBQWtCLFNBQUE7V0FDaEIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFkLENBQXlCLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBYSxDQUFBLGdCQUFBLENBQXRDO0VBRGdCOzs7O0dBOURJLFFBQVEsQ0FBQyIsImZpbGUiOiJzdWJ0ZXN0L3Byb3RvdHlwZXMvSWRSdW5WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgSWRSdW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJpZFwiXG4gIFxuICBldmVudHM6XG4gICAgJ2NsaWNrICNnZW5lcmF0ZScgICAgICAgIDogJ2dlbmVyYXRlJ1xuICAgICdjaGFuZ2UgI3BhcnRpY2lwYW50X2lkJyA6ICdzZXRWYWxpZGF0b3InXG4gIFxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID0gXG4gICAgICBpZGVudGlmaWVyIDogdChcIklkUnVuVmlldy5sYWJlbC5pZGVudGlmaWVyXCIpXG4gICAgICBnZW5lcmF0ZSAgIDogdChcIklkUnVuVmlldy5idXR0b24uZ2VuZXJhdGVcIilcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBpMThuKClcblxuICAgIEBtb2RlbCAgICAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCAgICA9IG9wdGlvbnMucGFyZW50XG4gICAgQGRhdGFFbnRyeSA9IG9wdGlvbnMuZGF0YUVudHJ5XG5cbiAgICBAdmFsaWRhdG9yID0gbmV3IENoZWNrRGlnaXRcblxuICByZW5kZXI6IC0+XG5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgcHJldmlvdXMgPSBAcGFyZW50LnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcbiAgICAgIGlmIHByZXZpb3VzXG4gICAgICAgIHBhcnRpY2lwYW50SWQgPSBwcmV2aW91cy5wYXJ0aWNpcGFudF9pZFxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgPGZvcm0+XG4gICAgICA8bGFiZWwgZm9yPSdwYXJ0aWNpcGFudF9pZCc+I3tAdGV4dC5pZGVudGlmaWVyfTwvbGFiZWw+XG4gICAgICA8aW5wdXQgaWQ9J3BhcnRpY2lwYW50X2lkJyBuYW1lPSdwYXJ0aWNpcGFudF9pZCcgdmFsdWU9JyN7cGFydGljaXBhbnRJZHx8Jyd9Jz5cbiAgICAgIDxidXR0b24gaWQ9J2dlbmVyYXRlJyBjbGFzcz0nY29tbWFuZCc+I3tAdGV4dC5nZW5lcmF0ZX08L2J1dHRvbj5cbiAgICAgIDxkaXYgY2xhc3M9J21lc3NhZ2VzJz48L2Rpdj5cbiAgICA8L2Zvcm0+XCJcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgICBAdHJpZ2dlciBcInJlYWR5XCJcblxuICBnZXRSZXN1bHQ6IC0+XG4gICAgcmV0dXJuIHsgJ3BhcnRpY2lwYW50X2lkJyA6IEAkZWwuZmluZChcIiNwYXJ0aWNpcGFudF9pZFwiKS52YWwoKSB9XG5cbiAgZ2V0U2tpcHBlZDogLT5cbiAgICByZXR1cm4geyAncGFydGljaXBhbnRfaWQnIDogXCJza2lwcGVkXCIgfVxuXG4gIHNldFZhbGlkYXRvcjogLT5cbiAgICBAdmFsaWRhdG9yLnNldCBAZ2V0UmVzdWx0KClbJ3BhcnRpY2lwYW50X2lkJ11cblxuICBpc1ZhbGlkOiAtPlxuICAgIEBzZXRWYWxpZGF0b3IoKVxuICAgIHJldHVybiBmYWxzZSBpZiBub3QgQHZhbGlkYXRvci5pc1ZhbGlkKClcbiAgICBAdXBkYXRlTmF2aWdhdGlvbigpXG4gICAgXG4gIHNob3dFcnJvcnM6IC0+XG4gICAgQCRlbC5maW5kKFwiLm1lc3NhZ2VzXCIpLmh0bWwgQHZhbGlkYXRvci5nZXRFcnJvcnMoKS5qb2luKFwiLCBcIilcblxuICBnZW5lcmF0ZTogLT5cbiAgICBAJGVsLmZpbmQoXCIubWVzc2FnZXNcIikuZW1wdHkoKVxuICAgIEAkZWwuZmluZCgnI3BhcnRpY2lwYW50X2lkJykudmFsIEB2YWxpZGF0b3IuZ2VuZXJhdGUoKVxuICAgIGZhbHNlXG5cbiAgdXBkYXRlTmF2aWdhdGlvbjogLT5cbiAgICBUYW5nZXJpbmUubmF2LnNldFN0dWRlbnQgQGdldFJlc3VsdCgpWydwYXJ0aWNpcGFudF9pZCddXG4iXX0=
