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
    var fileName, fileType, mediaString, typeArr, typeName;
    fileName = this.model.get("fileName");
    fileType = this.model.get("fileType");
    typeArr = fileType.split("/");
    typeName = typeArr[0];
    mediaString = '';
    if (typeName === 'image') {
      mediaString = '<img id="media_' + fileName + '" style="max-width:99%;width:100%;height:auto;" src="/client/lesson_plan_media/' + fileName + '"/>';
    }
    if (typeName === 'audio' || typeName === 'video') {
      mediaString = '<' + typeName + ' controls style="max-width:99%;width:100%;height:auto;" id="media_' + typeName + '"><source src="/client/lesson_plan_media/' + fileName + '" type="' + fileType + '"/></' + typeName + '>';
    }
    return this.$el.html("<div class='label_value'> <label for='media'>Media</label> " + mediaString + " </div>");
  };

  return MediaEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnQvdHlwZXMvTWVkaWFFZGl0Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxhQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzBCQUVKLFNBQUEsR0FBWTs7MEJBRVosVUFBQSxHQUFZLFNBQUUsT0FBRjtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO1dBQ2pCLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBTyxDQUFDO0VBRlI7OzBCQUlaLE9BQUEsR0FBUyxTQUFBO1dBQUc7RUFBSDs7MEJBRVQsSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FDRTtNQUFBLE9BQUEsRUFBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxRQUFWLENBQW1CLENBQUMsR0FBcEIsQ0FBQSxDQUFWO0tBREY7RUFESTs7MEJBSU4sTUFBQSxHQUFRLFNBQUE7QUFFTixRQUFBO0lBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFVBQVg7SUFDWCxRQUFBLEdBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsVUFBWDtJQUNYLE9BQUEsR0FBVSxRQUFRLENBQUMsS0FBVCxDQUFlLEdBQWY7SUFDVixRQUFBLEdBQVcsT0FBUSxDQUFBLENBQUE7SUFDbkIsV0FBQSxHQUFjO0lBQ2QsSUFBRyxRQUFBLEtBQVksT0FBZjtNQUNFLFdBQUEsR0FBYyxpQkFBQSxHQUFtQixRQUFuQixHQUE2QixpRkFBN0IsR0FBZ0gsUUFBaEgsR0FBMEgsTUFEMUk7O0lBRUEsSUFBRyxRQUFBLEtBQVksT0FBWixJQUF1QixRQUFBLEtBQVksT0FBdEM7TUFDRSxXQUFBLEdBQWMsR0FBQSxHQUFLLFFBQUwsR0FBZSxvRUFBZixHQUFxRixRQUFyRixHQUErRiwyQ0FBL0YsR0FBNEksUUFBNUksR0FBc0osVUFBdEosR0FBa0ssUUFBbEssR0FBNEssT0FBNUssR0FBcUwsUUFBckwsR0FBK0wsSUFEL007O1dBR0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsNkRBQUEsR0FHSixXQUhJLEdBR1EsU0FIbEI7RUFaTTs7OztHQWRrQixRQUFRLENBQUMiLCJmaWxlIjoiZWxlbWVudC90eXBlcy9NZWRpYUVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTWVkaWFFZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIk1lZGlhRWRpdFZpZXdcIlxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG4gICAgQG1vZGVsID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgPSBvcHRpb25zLnBhcmVudFxuXG4gIGlzVmFsaWQ6IC0+IHRydWVcblxuICBzYXZlOiAtPlxuICAgIEBtb2RlbC5zZXRcbiAgICAgIFwibWVkaWFcIiA6IEAkZWwuZmluZChcIiNtZWRpYVwiKS52YWwoKVxuXG4gIHJlbmRlcjogLT5cbiAgICAjbWVkaWEgPSBAbW9kZWwuZ2V0KFwibWVkaWFcIikgfHwgXCJcIlxuICAgIGZpbGVOYW1lID0gQG1vZGVsLmdldChcImZpbGVOYW1lXCIpXG4gICAgZmlsZVR5cGUgPSBAbW9kZWwuZ2V0KFwiZmlsZVR5cGVcIilcbiAgICB0eXBlQXJyID0gZmlsZVR5cGUuc3BsaXQoXCIvXCIpXG4gICAgdHlwZU5hbWUgPSB0eXBlQXJyWzBdXG4gICAgbWVkaWFTdHJpbmcgPSAnJ1xuICAgIGlmIHR5cGVOYW1lID09ICdpbWFnZSdcbiAgICAgIG1lZGlhU3RyaW5nID0gJzxpbWcgaWQ9XCJtZWRpYV8nICtmaWxlTmFtZSsgJ1wiIHN0eWxlPVwibWF4LXdpZHRoOjk5JTt3aWR0aDoxMDAlO2hlaWdodDphdXRvO1wiIHNyYz1cIi9jbGllbnQvbGVzc29uX3BsYW5fbWVkaWEvJyArZmlsZU5hbWUrICdcIi8+J1xuICAgIGlmIHR5cGVOYW1lID09ICdhdWRpbycgfHwgdHlwZU5hbWUgPT0gJ3ZpZGVvJ1xuICAgICAgbWVkaWFTdHJpbmcgPSAnPCcgK3R5cGVOYW1lKyAnIGNvbnRyb2xzIHN0eWxlPVwibWF4LXdpZHRoOjk5JTt3aWR0aDoxMDAlO2hlaWdodDphdXRvO1wiIGlkPVwibWVkaWFfJyArdHlwZU5hbWUrICdcIj48c291cmNlIHNyYz1cIi9jbGllbnQvbGVzc29uX3BsYW5fbWVkaWEvJyArZmlsZU5hbWUrICdcIiB0eXBlPVwiJyArZmlsZVR5cGUrICdcIi8+PC8nICt0eXBlTmFtZSsgJz4nXG4gICAgXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J21lZGlhJz5NZWRpYTwvbGFiZWw+XG4gICAgICAgICN7bWVkaWFTdHJpbmd9XG4gICAgICA8L2Rpdj5cbiAgICBcIlxuIl19
