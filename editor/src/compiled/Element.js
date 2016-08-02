var Element,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Element = (function(superClass) {
  extend(Element, superClass);

  function Element() {
    return Element.__super__.constructor.apply(this, arguments);
  }

  Element.prototype.url = "element";

  Element.prototype.initialize = function(options) {
    this.templates = Tangerine.templates.get("prototypeTemplates");
    if (this.has("surveyAttributes")) {
      if (this.get("assessmentId") !== this.get("surveyAttributes").assessmentId) {
        return this.save("surveyAttributes", {
          "_id": this.id,
          "assessmentId": this.get("assessmentId")
        });
      }
    }
  };

  Element.prototype.loadPrototypeTemplate = function(prototype) {
    var key, ref, value;
    ref = this.templates[prototype];
    for (key in ref) {
      value = ref[key];
      this.set(key, value);
    }
    return this.save();
  };

  Element.prototype.copyTo = function(options) {
    var assessmentId, callback, newElement, newId, order;
    assessmentId = options.assessmentId;
    callback = options.callback;
    order = options.order || 0;
    newElement = this.clone();
    newId = Utils.guid();
    if (newElement.has("surveyAttributes")) {
      newElement.set("surveyAttributes", {
        "_id": newId,
        "assessmentId": assessmentId
      });
    }
    return newElement.save({
      "_id": newId,
      "assessmentId": assessmentId,
      "order": order,
      "gridLinkId": ""
    }, {
      success: (function(_this) {
        return function() {
          return console.log("saved element");
        };
      })(this)
    });
  };

  return Element;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnQvRWxlbWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxPQUFBO0VBQUE7OztBQUFNOzs7Ozs7O29CQUVKLEdBQUEsR0FBSzs7b0JBRUwsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxTQUFELEdBQWEsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFwQixDQUF3QixvQkFBeEI7SUFHYixJQUFHLElBQUMsQ0FBQSxHQUFELENBQUssa0JBQUwsQ0FBSDtNQUNFLElBQUcsSUFBQyxDQUFBLEdBQUQsQ0FBSyxjQUFMLENBQUEsS0FBd0IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxrQkFBTCxDQUF3QixDQUFDLFlBQXBEO2VBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBTSxrQkFBTixFQUNFO1VBQUEsS0FBQSxFQUFRLElBQUMsQ0FBQSxFQUFUO1VBQ0EsY0FBQSxFQUFpQixJQUFDLENBQUEsR0FBRCxDQUFLLGNBQUwsQ0FEakI7U0FERixFQURGO09BREY7O0VBSlU7O29CQVVaLHFCQUFBLEdBQXVCLFNBQUMsU0FBRDtBQUNyQixRQUFBO0FBQUE7QUFBQSxTQUFBLFVBQUE7O01BQ0UsSUFBQyxDQUFBLEdBQUQsQ0FBSyxHQUFMLEVBQVUsS0FBVjtBQURGO1dBRUEsSUFBQyxDQUFBLElBQUQsQ0FBQTtFQUhxQjs7b0JBS3ZCLE1BQUEsR0FBUSxTQUFDLE9BQUQ7QUFFTixRQUFBO0lBQUEsWUFBQSxHQUFlLE9BQU8sQ0FBQztJQUN2QixRQUFBLEdBQWUsT0FBTyxDQUFDO0lBQ3ZCLEtBQUEsR0FBZSxPQUFPLENBQUMsS0FBUixJQUFpQjtJQUVoQyxVQUFBLEdBQWEsSUFBQyxDQUFBLEtBQUQsQ0FBQTtJQUNiLEtBQUEsR0FBUSxLQUFLLENBQUMsSUFBTixDQUFBO0lBR1IsSUFBRyxVQUFVLENBQUMsR0FBWCxDQUFlLGtCQUFmLENBQUg7TUFDRSxVQUFVLENBQUMsR0FBWCxDQUFlLGtCQUFmLEVBQ0U7UUFBQSxLQUFBLEVBQVEsS0FBUjtRQUNBLGNBQUEsRUFBaUIsWUFEakI7T0FERixFQURGOztXQUtBLFVBQVUsQ0FBQyxJQUFYLENBQ0U7TUFBQSxLQUFBLEVBQWlCLEtBQWpCO01BQ0EsY0FBQSxFQUFpQixZQURqQjtNQUVBLE9BQUEsRUFBaUIsS0FGakI7TUFHQSxZQUFBLEVBQWlCLEVBSGpCO0tBREYsRUFNRTtNQUFBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ1AsT0FBTyxDQUFDLEdBQVIsQ0FBWSxlQUFaO1FBRE87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7S0FORjtFQWZNOzs7O0dBbkJZLFFBQVEsQ0FBQyIsImZpbGUiOiJlbGVtZW50L0VsZW1lbnQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBFbGVtZW50IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuICB1cmw6IFwiZWxlbWVudFwiXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQHRlbXBsYXRlcyA9IFRhbmdlcmluZS50ZW1wbGF0ZXMuZ2V0KFwicHJvdG90eXBlVGVtcGxhdGVzXCIpXG5cbiAgICAjIGd1YXJlbnRlZSBzdXJ2ZXkgcHNldWRvIG1vZGVsIGZvciBvYnNlcnZhdGlvbnNcbiAgICBpZiBAaGFzKFwic3VydmV5QXR0cmlidXRlc1wiKVxuICAgICAgaWYgQGdldChcImFzc2Vzc21lbnRJZFwiKSAhPSBAZ2V0KFwic3VydmV5QXR0cmlidXRlc1wiKS5hc3Nlc3NtZW50SWRcbiAgICAgICAgQHNhdmUgXCJzdXJ2ZXlBdHRyaWJ1dGVzXCIsXG4gICAgICAgICAgXCJfaWRcIiA6IEBpZFxuICAgICAgICAgIFwiYXNzZXNzbWVudElkXCIgOiBAZ2V0KFwiYXNzZXNzbWVudElkXCIpXG5cbiAgbG9hZFByb3RvdHlwZVRlbXBsYXRlOiAocHJvdG90eXBlKSAtPlxuICAgIGZvciBrZXksIHZhbHVlIG9mIEB0ZW1wbGF0ZXNbcHJvdG90eXBlXVxuICAgICAgQHNldCBrZXksIHZhbHVlXG4gICAgQHNhdmUoKVxuXG4gIGNvcHlUbzogKG9wdGlvbnMpIC0+XG5cbiAgICBhc3Nlc3NtZW50SWQgPSBvcHRpb25zLmFzc2Vzc21lbnRJZFxuICAgIGNhbGxiYWNrICAgICA9IG9wdGlvbnMuY2FsbGJhY2tcbiAgICBvcmRlciAgICAgICAgPSBvcHRpb25zLm9yZGVyIHx8IDBcbiAgICBcbiAgICBuZXdFbGVtZW50ID0gQGNsb25lKClcbiAgICBuZXdJZCA9IFV0aWxzLmd1aWQoKVxuXG5cbiAgICBpZiBuZXdFbGVtZW50LmhhcyhcInN1cnZleUF0dHJpYnV0ZXNcIilcbiAgICAgIG5ld0VsZW1lbnQuc2V0IFwic3VydmV5QXR0cmlidXRlc1wiLFxuICAgICAgICBcIl9pZFwiIDogbmV3SWRcbiAgICAgICAgXCJhc3Nlc3NtZW50SWRcIiA6IGFzc2Vzc21lbnRJZFxuXG4gICAgbmV3RWxlbWVudC5zYXZlXG4gICAgICBcIl9pZFwiICAgICAgICAgIDogbmV3SWRcbiAgICAgIFwiYXNzZXNzbWVudElkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgIFwib3JkZXJcIiAgICAgICAgOiBvcmRlclxuICAgICAgXCJncmlkTGlua0lkXCIgICA6IFwiXCJcbiAgICAsXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBjb25zb2xlLmxvZyhcInNhdmVkIGVsZW1lbnRcIilcblxuXG4iXX0=
