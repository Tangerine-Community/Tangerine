var ConsentEditView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ConsentEditView = (function(superClass) {
  extend(ConsentEditView, superClass);

  function ConsentEditView() {
    return ConsentEditView.__super__.constructor.apply(this, arguments);
  }

  ConsentEditView.prototype.className = "ConsentEditView";

  ConsentEditView.prototype.initialize = function(options) {
    this.model = options.model;
    return this.parent = options.parent;
  };

  ConsentEditView.prototype.isValid = function() {
    return true;
  };

  ConsentEditView.prototype.save = function() {
    return this.model.set({
      "prompt": this.$el.find("#consent_prompt").val()
    });
  };

  ConsentEditView.prototype.render = function() {
    var prompt;
    prompt = this.model.get("prompt") || "";
    return this.$el.html("<div class='label_value'> <label for='consent_prompt'>Consent prompt</label> <input id='consent_prompt' value='" + prompt + "'> </div>");
  };

  return ConsentEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9Db25zZW50RWRpdFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsZUFBQTtFQUFBOzs7QUFBTTs7Ozs7Ozs0QkFFSixTQUFBLEdBQVk7OzRCQUVaLFVBQUEsR0FBWSxTQUFFLE9BQUY7SUFDVixJQUFDLENBQUEsS0FBRCxHQUFTLE9BQU8sQ0FBQztXQUNqQixJQUFDLENBQUEsTUFBRCxHQUFVLE9BQU8sQ0FBQztFQUZSOzs0QkFJWixPQUFBLEdBQVMsU0FBQTtXQUFHO0VBQUg7OzRCQUVULElBQUEsR0FBTSxTQUFBO1dBQ0osSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQ0U7TUFBQSxRQUFBLEVBQVcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsaUJBQVYsQ0FBNEIsQ0FBQyxHQUE3QixDQUFBLENBQVg7S0FERjtFQURJOzs0QkFJTixNQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7SUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsUUFBWCxDQUFBLElBQXdCO1dBQ2pDLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlIQUFBLEdBRzhCLE1BSDlCLEdBR3FDLFdBSC9DO0VBRk07Ozs7R0Fkb0IsUUFBUSxDQUFDIiwiZmlsZSI6InN1YnRlc3QvcHJvdG90eXBlcy9Db25zZW50RWRpdFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDb25zZW50RWRpdFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJDb25zZW50RWRpdFZpZXdcIlxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG4gICAgQG1vZGVsID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgPSBvcHRpb25zLnBhcmVudFxuXG4gIGlzVmFsaWQ6IC0+IHRydWVcblxuICBzYXZlOiAtPlxuICAgIEBtb2RlbC5zZXRcbiAgICAgIFwicHJvbXB0XCIgOiBAJGVsLmZpbmQoXCIjY29uc2VudF9wcm9tcHRcIikudmFsKClcblxuICByZW5kZXI6IC0+XG4gICAgcHJvbXB0ID0gQG1vZGVsLmdldChcInByb21wdFwiKSB8fCBcIlwiXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2NvbnNlbnRfcHJvbXB0Jz5Db25zZW50IHByb21wdDwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0nY29uc2VudF9wcm9tcHQnIHZhbHVlPScje3Byb21wdH0nPlxuICAgICAgPC9kaXY+XG4gICAgXCJcbiJdfQ==
