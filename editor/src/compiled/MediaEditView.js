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
    var fileName, fileType, groupName, mediaString, typeArr, typeName;
    groupName = Tangerine.settings.get("groupName");
    fileName = this.model.get("fileName");
    fileType = this.model.get("fileType");
    typeArr = fileType.split("/");
    typeName = typeArr[0];
    mediaString = '';
    if (typeName === 'image') {
      mediaString = '<img id="media_' + fileName + '" style="max-width:99%;width:100%;height:auto;" src="/client/lesson_plan_media/' + groupName + '/' + fileName + '"/>';
    }
    if (typeName === 'audio' || typeName === 'video') {
      mediaString = '<' + typeName + ' controls style="max-width:99%;width:100%;height:auto;" id="media_' + typeName + '"><source src="/client/lesson_plan_media/' + groupName + '/' + fileName + '" type="' + fileType + '"/></' + typeName + '>';
    }
    return this.$el.html("<div class='label_value'> <label for='media'>Media</label> " + mediaString + " </div>");
  };

  return MediaEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnQvdHlwZXMvTWVkaWFFZGl0Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxhQUFBO0VBQUE7OztBQUFNOzs7Ozs7OzBCQUVKLFNBQUEsR0FBWTs7MEJBRVosVUFBQSxHQUFZLFNBQUUsT0FBRjtJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO1dBQ2pCLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBTyxDQUFDO0VBRlI7OzBCQUlaLE9BQUEsR0FBUyxTQUFBO1dBQUc7RUFBSDs7MEJBRVQsSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FDRTtNQUFBLE9BQUEsRUFBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxRQUFWLENBQW1CLENBQUMsR0FBcEIsQ0FBQSxDQUFWO0tBREY7RUFESTs7MEJBSU4sTUFBQSxHQUFRLFNBQUE7QUFFTixRQUFBO0lBQUEsU0FBQSxHQUFZLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBbkIsQ0FBdUIsV0FBdkI7SUFDWixRQUFBLEdBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsVUFBWDtJQUNYLFFBQUEsR0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxVQUFYO0lBQ1gsT0FBQSxHQUFVLFFBQVEsQ0FBQyxLQUFULENBQWUsR0FBZjtJQUNWLFFBQUEsR0FBVyxPQUFRLENBQUEsQ0FBQTtJQUNuQixXQUFBLEdBQWM7SUFDZCxJQUFHLFFBQUEsS0FBWSxPQUFmO01BQ0UsV0FBQSxHQUFjLGlCQUFBLEdBQW1CLFFBQW5CLEdBQTZCLGlGQUE3QixHQUFpSCxTQUFqSCxHQUE2SCxHQUE3SCxHQUFrSSxRQUFsSSxHQUE0SSxNQUQ1Sjs7SUFFQSxJQUFHLFFBQUEsS0FBWSxPQUFaLElBQXVCLFFBQUEsS0FBWSxPQUF0QztNQUNFLFdBQUEsR0FBYyxHQUFBLEdBQUssUUFBTCxHQUFlLG9FQUFmLEdBQXFGLFFBQXJGLEdBQStGLDJDQUEvRixHQUE2SSxTQUE3SSxHQUF5SixHQUF6SixHQUE4SixRQUE5SixHQUF3SyxVQUF4SyxHQUFvTCxRQUFwTCxHQUE4TCxPQUE5TCxHQUF1TSxRQUF2TSxHQUFpTixJQURqTzs7V0FHQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSw2REFBQSxHQUdKLFdBSEksR0FHUSxTQUhsQjtFQWJNOzs7O0dBZGtCLFFBQVEsQ0FBQyIsImZpbGUiOiJlbGVtZW50L3R5cGVzL01lZGlhRWRpdFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBNZWRpYUVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiTWVkaWFFZGl0Vmlld1wiXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cbiAgICBAbW9kZWwgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCA9IG9wdGlvbnMucGFyZW50XG5cbiAgaXNWYWxpZDogLT4gdHJ1ZVxuXG4gIHNhdmU6IC0+XG4gICAgQG1vZGVsLnNldFxuICAgICAgXCJtZWRpYVwiIDogQCRlbC5maW5kKFwiI21lZGlhXCIpLnZhbCgpXG5cbiAgcmVuZGVyOiAtPlxuICAgICNtZWRpYSA9IEBtb2RlbC5nZXQoXCJtZWRpYVwiKSB8fCBcIlwiXG4gICAgZ3JvdXBOYW1lID0gVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImdyb3VwTmFtZVwiKVxuICAgIGZpbGVOYW1lID0gQG1vZGVsLmdldChcImZpbGVOYW1lXCIpXG4gICAgZmlsZVR5cGUgPSBAbW9kZWwuZ2V0KFwiZmlsZVR5cGVcIilcbiAgICB0eXBlQXJyID0gZmlsZVR5cGUuc3BsaXQoXCIvXCIpXG4gICAgdHlwZU5hbWUgPSB0eXBlQXJyWzBdXG4gICAgbWVkaWFTdHJpbmcgPSAnJ1xuICAgIGlmIHR5cGVOYW1lID09ICdpbWFnZSdcbiAgICAgIG1lZGlhU3RyaW5nID0gJzxpbWcgaWQ9XCJtZWRpYV8nICtmaWxlTmFtZSsgJ1wiIHN0eWxlPVwibWF4LXdpZHRoOjk5JTt3aWR0aDoxMDAlO2hlaWdodDphdXRvO1wiIHNyYz1cIi9jbGllbnQvbGVzc29uX3BsYW5fbWVkaWEvJyArIGdyb3VwTmFtZSArICcvJyArZmlsZU5hbWUrICdcIi8+J1xuICAgIGlmIHR5cGVOYW1lID09ICdhdWRpbycgfHwgdHlwZU5hbWUgPT0gJ3ZpZGVvJ1xuICAgICAgbWVkaWFTdHJpbmcgPSAnPCcgK3R5cGVOYW1lKyAnIGNvbnRyb2xzIHN0eWxlPVwibWF4LXdpZHRoOjk5JTt3aWR0aDoxMDAlO2hlaWdodDphdXRvO1wiIGlkPVwibWVkaWFfJyArdHlwZU5hbWUrICdcIj48c291cmNlIHNyYz1cIi9jbGllbnQvbGVzc29uX3BsYW5fbWVkaWEvJyArIGdyb3VwTmFtZSArICcvJyArZmlsZU5hbWUrICdcIiB0eXBlPVwiJyArZmlsZVR5cGUrICdcIi8+PC8nICt0eXBlTmFtZSsgJz4nXG4gICAgXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J21lZGlhJz5NZWRpYTwvbGFiZWw+XG4gICAgICAgICN7bWVkaWFTdHJpbmd9XG4gICAgICA8L2Rpdj5cbiAgICBcIlxuIl19
