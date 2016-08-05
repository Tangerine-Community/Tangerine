var MediaEditView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MediaEditView = (function(superClass) {
  extend(MediaEditView, superClass);

  function MediaEditView() {
    return MediaEditView.__super__.constructor.apply(this, arguments);
  }

  MediaEditView.prototype.className = "MediaEditView";

  MediaEditView.prototype.initialize = function(options) {
    this.model = options.model;
    return this.parent = options.parent;
  };

  MediaEditView.prototype.isValid = function() {
    return true;
  };

  MediaEditView.prototype.save = function() {
    return this.model.set({
      "media": this.$el.find("#media").val()
    });
  };

  MediaEditView.prototype.render = function() {
    var media;
    media = this.model.get("media") || "";
    return this.$el.html("<div class='label_value'> <label for='media'>Media</label> <textarea id='media'>" + media + "</textarea> </div>");
  };

  return MediaEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnQvdHlwZXMvTWVkaWFFZGl0Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxhQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzBCQUVKLFNBQUEsR0FBWTs7MEJBRVosVUFBQSxHQUFZLFNBQUUsT0FBRjtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO1dBQ2pCLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBTyxDQUFDO0VBRlI7OzBCQUlaLE9BQUEsR0FBUyxTQUFBO1dBQUc7RUFBSDs7MEJBRVQsSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FDRTtNQUFBLE9BQUEsRUFBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxRQUFWLENBQW1CLENBQUMsR0FBcEIsQ0FBQSxDQUFWO0tBREY7RUFESTs7MEJBSU4sTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE9BQVgsQ0FBQSxJQUF1QjtXQUMvQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxrRkFBQSxHQUdpQixLQUhqQixHQUd1QixvQkFIakM7RUFGTTs7OztHQWRrQixRQUFRLENBQUMiLCJmaWxlIjoiZWxlbWVudC90eXBlcy9NZWRpYUVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTWVkaWFFZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIk1lZGlhRWRpdFZpZXdcIlxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG4gICAgQG1vZGVsID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgPSBvcHRpb25zLnBhcmVudFxuXG4gIGlzVmFsaWQ6IC0+IHRydWVcblxuICBzYXZlOiAtPlxuICAgIEBtb2RlbC5zZXRcbiAgICAgIFwibWVkaWFcIiA6IEAkZWwuZmluZChcIiNtZWRpYVwiKS52YWwoKVxuXG4gIHJlbmRlcjogLT5cbiAgICBtZWRpYSA9IEBtb2RlbC5nZXQoXCJtZWRpYVwiKSB8fCBcIlwiXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J21lZGlhJz5NZWRpYTwvbGFiZWw+XG4gICAgICAgIDx0ZXh0YXJlYSBpZD0nbWVkaWEnPiN7bWVkaWF9PC90ZXh0YXJlYT5cbiAgICAgIDwvZGl2PlxuICAgIFwiXG4iXX0=
