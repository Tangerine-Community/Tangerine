var ElementListElementView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ElementListElementView = (function(superClass) {
  extend(ElementListElementView, superClass);

  function ElementListElementView() {
    this.populateAssessmentSelector = bind(this.populateAssessmentSelector, this);
    this.fetchAssessments = bind(this.fetchAssessments, this);
    return ElementListElementView.__super__.constructor.apply(this, arguments);
  }

  ElementListElementView.prototype.className = "element_element";

  ElementListElementView.prototype.tagName = "li";

  ElementListElementView.prototype.events = {
    'click .icon_edit': 'edit',
    "click .icon_delete": "toggleDeleteConfirm",
    "click .delete_cancel": "toggleDeleteConfirm",
    "click .delete_delete": "delete",
    "click .icon_copy": "openCopyMenu",
    "click .do_copy": "doCopy",
    "click .cancel_copy": "cancelCopy",
    "click .name": "toggleSelected"
  };

  ElementListElementView.prototype.toggleSelected = function() {
    if (this.selected === true) {
      this.selected = false;
      return this.$el.removeClass("element-selected");
    } else {
      this.selected = true;
      return this.$el.addClass("element-selected");
    }
  };

  ElementListElementView.prototype.toggleDeleteConfirm = function() {
    this.$el.find(".delete_confirm").fadeToggle(250);
    return false;
  };

  ElementListElementView.prototype["delete"] = function() {
    this.trigger("element:delete", this.model);
    return false;
  };

  ElementListElementView.prototype.edit = function() {
    return Tangerine.router.navigate("element/" + this.model.id, true);
  };

  ElementListElementView.prototype.initialize = function(options) {
    this.model = options.element;
    this.group = options.group;
    return this.$el.attr("data-id", this.model.id);
  };

  ElementListElementView.prototype.openCopyMenu = function() {
    this.$el.find(".copy_menu").removeClass("confirmation");
    this.$el.find(".copy_select").append("<option disabled='disabled' selected='selected'>Loading assessments...</option>");
    return this.fetchAssessments();
  };

  ElementListElementView.prototype.fetchAssessments = function() {
    this.groupAssessments = new Assessments;
    return this.groupAssessments.fetch({
      key: this.group,
      success: (function(_this) {
        return function() {
          return _this.populateAssessmentSelector();
        };
      })(this)
    });
  };

  ElementListElementView.prototype.populateAssessmentSelector = function() {
    var $select, assessment, i, len, optionList, ref;
    optionList = "";
    ref = this.groupAssessments.models;
    for (i = 0, len = ref.length; i < len; i++) {
      assessment = ref[i];
      optionList += "<option data-assessmentId='" + assessment.id + "'>" + (assessment.get("name")) + "</option>";
    }
    return $select = this.$el.find(".copy_select").html(optionList);
  };

  ElementListElementView.prototype.doCopy = function(e) {
    this.trigger("element:copy", this.$el.find(".copy_select :selected").attr('data-assessmentId'), this.model.id);
    return this.$el.find(".copy_menu").addClass("confirmation");
  };

  ElementListElementView.prototype.cancelCopy = function() {
    return this.$el.find(".copy_menu").addClass("confirmation");
  };

  ElementListElementView.prototype.render = function() {
    var copyIcon, copyMenu, deleteConfirm, element, elementName, fileType, iconDelete, iconDrag, iconEdit;
    elementName = "<span class='name'>" + (this.model.get("name")) + "</span>";
    element = "<span class='small_grey'>" + (this.model.get("element")) + "</span>";
    fileType = "<span class='small_grey'>" + (this.model.get("fileType")) + "</span>";
    iconDrag = "<img src='images/icon_drag.png' title='Drag to reorder' class='icon sortable_handle'>";
    iconEdit = "<img src='images/icon_edit.png' title='Edit' class='icon icon_edit'>";
    iconDelete = "<img src='images/icon_delete.png' title='Delete' class='icon icon_delete'>";
    copyIcon = "<img src='images/icon_copy_to.png' title='Copy to...' class='icon icon_copy'>";
    copyMenu = "<div class='confirmation copy_menu'><select class='copy_select'></select><br><button class='do_copy command'>Copy</button> <button class='cancel_copy command'>Cancel</button></div>";
    deleteConfirm = "<br><span class='delete_confirm'><div class='menu_box'>Confirm <button class='delete_delete command_red'>Delete</button> <button class='delete_cancel command'>Cancel</button></div></span>";
    this.$el.html("<table><tr> <td>" + iconDrag + "</td> <td> " + elementName + " " + element + " " + fileType + " " + iconEdit + " " + copyIcon + " " + iconDelete + " " + deleteConfirm + " " + copyMenu + " </td> </tr></table>");
    return this.trigger("rendered");
  };

  return ElementListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnQvRWxlbWVudExpc3RFbGVtZW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxzQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7OzttQ0FFSixTQUFBLEdBQVk7O21DQUNaLE9BQUEsR0FBVTs7bUNBRVYsTUFBQSxHQUNFO0lBQUEsa0JBQUEsRUFBeUIsTUFBekI7SUFDQSxvQkFBQSxFQUF5QixxQkFEekI7SUFFQSxzQkFBQSxFQUF5QixxQkFGekI7SUFHQSxzQkFBQSxFQUF5QixRQUh6QjtJQUlBLGtCQUFBLEVBQXlCLGNBSnpCO0lBS0EsZ0JBQUEsRUFBeUIsUUFMekI7SUFNQSxvQkFBQSxFQUF5QixZQU56QjtJQVFBLGFBQUEsRUFBZ0IsZ0JBUmhCOzs7bUNBVUYsY0FBQSxHQUFnQixTQUFBO0lBQ2QsSUFBRyxJQUFDLENBQUEsUUFBRCxLQUFhLElBQWhCO01BQ0UsSUFBQyxDQUFBLFFBQUQsR0FBWTthQUNaLElBQUMsQ0FBQSxHQUFHLENBQUMsV0FBTCxDQUFpQixrQkFBakIsRUFGRjtLQUFBLE1BQUE7TUFJRSxJQUFDLENBQUEsUUFBRCxHQUFZO2FBQ1osSUFBQyxDQUFBLEdBQUcsQ0FBQyxRQUFMLENBQWMsa0JBQWQsRUFMRjs7RUFEYzs7bUNBUWhCLG1CQUFBLEdBQXFCLFNBQUE7SUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVixDQUE0QixDQUFDLFVBQTdCLENBQXdDLEdBQXhDO1dBQThDO0VBQWpEOzttQ0FFckIsU0FBQSxHQUFRLFNBQUE7SUFBRyxJQUFDLENBQUEsT0FBRCxDQUFTLGdCQUFULEVBQTJCLElBQUMsQ0FBQSxLQUE1QjtXQUFtQztFQUF0Qzs7bUNBRVIsSUFBQSxHQUFNLFNBQUE7V0FDSixTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFVBQUEsR0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQTVDLEVBQWtELElBQWxEO0VBREk7O21DQUdOLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFDVixJQUFDLENBQUEsS0FBRCxHQUFTLE9BQU8sQ0FBQztJQUNqQixJQUFDLENBQUEsS0FBRCxHQUFTLE9BQU8sQ0FBQztXQUdqQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBNUI7RUFMVTs7bUNBT1osWUFBQSxHQUFjLFNBQUE7SUFDWixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxZQUFWLENBQXVCLENBQUMsV0FBeEIsQ0FBb0MsY0FBcEM7SUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxjQUFWLENBQXlCLENBQUMsTUFBMUIsQ0FBaUMsaUZBQWpDO1dBQ0EsSUFBQyxDQUFBLGdCQUFELENBQUE7RUFIWTs7bUNBTWQsZ0JBQUEsR0FBa0IsU0FBQTtJQUNoQixJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBSTtXQUN4QixJQUFDLENBQUEsZ0JBQWdCLENBQUMsS0FBbEIsQ0FDRTtNQUFBLEdBQUEsRUFBSyxJQUFDLENBQUEsS0FBTjtNQUNBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ1AsS0FBQyxDQUFBLDBCQUFELENBQUE7UUFETztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEVDtLQURGO0VBRmdCOzttQ0FPbEIsMEJBQUEsR0FBNEIsU0FBQTtBQUMxQixRQUFBO0lBQUEsVUFBQSxHQUFhO0FBQ2I7QUFBQSxTQUFBLHFDQUFBOztNQUNFLFVBQUEsSUFBYyw2QkFBQSxHQUE4QixVQUFVLENBQUMsRUFBekMsR0FBNEMsSUFBNUMsR0FBK0MsQ0FBQyxVQUFVLENBQUMsR0FBWCxDQUFlLE1BQWYsQ0FBRCxDQUEvQyxHQUF1RTtBQUR2RjtXQUVBLE9BQUEsR0FBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxjQUFWLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsVUFBL0I7RUFKZ0I7O21DQU01QixNQUFBLEdBQVEsU0FBQyxDQUFEO0lBQ04sSUFBQyxDQUFBLE9BQUQsQ0FBUyxjQUFULEVBQXlCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHdCQUFWLENBQW1DLENBQUMsSUFBcEMsQ0FBeUMsbUJBQXpDLENBQXpCLEVBQXdGLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBL0Y7V0FDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxZQUFWLENBQXVCLENBQUMsUUFBeEIsQ0FBaUMsY0FBakM7RUFGTTs7bUNBSVIsVUFBQSxHQUFZLFNBQUE7V0FDVixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxZQUFWLENBQXVCLENBQUMsUUFBeEIsQ0FBaUMsY0FBakM7RUFEVTs7bUNBR1osTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsV0FBQSxHQUFnQixxQkFBQSxHQUFxQixDQUFDLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBRCxDQUFyQixHQUF5QztJQUN6RCxPQUFBLEdBQWMsMkJBQUEsR0FBMkIsQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxTQUFYLENBQUQsQ0FBM0IsR0FBa0Q7SUFDaEUsUUFBQSxHQUFlLDJCQUFBLEdBQTJCLENBQUMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsVUFBWCxDQUFELENBQTNCLEdBQW1EO0lBQ2xFLFFBQUEsR0FBZ0I7SUFDaEIsUUFBQSxHQUFnQjtJQUNoQixVQUFBLEdBQWdCO0lBQ2hCLFFBQUEsR0FBZ0I7SUFDaEIsUUFBQSxHQUFnQjtJQUNoQixhQUFBLEdBQWdCO0lBQ2hCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGtCQUFBLEdBRUYsUUFGRSxHQUVPLGFBRlAsR0FJSixXQUpJLEdBSVEsR0FKUixHQUtKLE9BTEksR0FLSSxHQUxKLEdBTUosUUFOSSxHQU1LLEdBTkwsR0FPSixRQVBJLEdBT0ssR0FQTCxHQVFKLFFBUkksR0FRSyxHQVJMLEdBU0osVUFUSSxHQVNPLEdBVFAsR0FVSixhQVZJLEdBVVUsR0FWVixHQVdKLFFBWEksR0FXSyxzQkFYZjtXQWdCQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUExQk07Ozs7R0FoRTJCLFFBQVEsQ0FBQyIsImZpbGUiOiJlbGVtZW50L0VsZW1lbnRMaXN0RWxlbWVudFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBFbGVtZW50TGlzdEVsZW1lbnRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiZWxlbWVudF9lbGVtZW50XCJcbiAgdGFnTmFtZSA6IFwibGlcIlxuXG4gIGV2ZW50czogXG4gICAgJ2NsaWNrIC5pY29uX2VkaXQnICAgICA6ICdlZGl0J1xuICAgIFwiY2xpY2sgLmljb25fZGVsZXRlXCIgICA6IFwidG9nZ2xlRGVsZXRlQ29uZmlybVwiXG4gICAgXCJjbGljayAuZGVsZXRlX2NhbmNlbFwiIDogXCJ0b2dnbGVEZWxldGVDb25maXJtXCJcbiAgICBcImNsaWNrIC5kZWxldGVfZGVsZXRlXCIgOiBcImRlbGV0ZVwiXG4gICAgXCJjbGljayAuaWNvbl9jb3B5XCIgICAgIDogXCJvcGVuQ29weU1lbnVcIlxuICAgIFwiY2xpY2sgLmRvX2NvcHlcIiAgICAgICA6IFwiZG9Db3B5XCJcbiAgICBcImNsaWNrIC5jYW5jZWxfY29weVwiICAgOiBcImNhbmNlbENvcHlcIlxuXG4gICAgXCJjbGljayAubmFtZVwiIDogXCJ0b2dnbGVTZWxlY3RlZFwiXG5cbiAgdG9nZ2xlU2VsZWN0ZWQ6IC0+XG4gICAgaWYgQHNlbGVjdGVkID09IHRydWVcbiAgICAgIEBzZWxlY3RlZCA9IGZhbHNlXG4gICAgICBAJGVsLnJlbW92ZUNsYXNzIFwiZWxlbWVudC1zZWxlY3RlZFwiXG4gICAgZWxzZVxuICAgICAgQHNlbGVjdGVkID0gdHJ1ZVxuICAgICAgQCRlbC5hZGRDbGFzcyBcImVsZW1lbnQtc2VsZWN0ZWRcIlxuXG4gIHRvZ2dsZURlbGV0ZUNvbmZpcm06IC0+IEAkZWwuZmluZChcIi5kZWxldGVfY29uZmlybVwiKS5mYWRlVG9nZ2xlKDI1MCk7IGZhbHNlXG5cbiAgZGVsZXRlOiAtPiBAdHJpZ2dlciBcImVsZW1lbnQ6ZGVsZXRlXCIsIEBtb2RlbDsgZmFsc2VcblxuICBlZGl0OiAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJlbGVtZW50LyN7QG1vZGVsLmlkfVwiLCB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQG1vZGVsID0gb3B0aW9ucy5lbGVtZW50XG4gICAgQGdyb3VwID0gb3B0aW9ucy5ncm91cCAjIGZvciBjb3B5aW5nXG5cbiAgICAjIFRoaXMgaXMgZm9yICQuc29ydGFibGUuIERvbid0IHJlbW92ZS5cbiAgICBAJGVsLmF0dHIgXCJkYXRhLWlkXCIsIEBtb2RlbC5pZFxuXG4gIG9wZW5Db3B5TWVudTogLT5cbiAgICBAJGVsLmZpbmQoXCIuY29weV9tZW51XCIpLnJlbW92ZUNsYXNzKFwiY29uZmlybWF0aW9uXCIpXG4gICAgQCRlbC5maW5kKFwiLmNvcHlfc2VsZWN0XCIpLmFwcGVuZChcIjxvcHRpb24gZGlzYWJsZWQ9J2Rpc2FibGVkJyBzZWxlY3RlZD0nc2VsZWN0ZWQnPkxvYWRpbmcgYXNzZXNzbWVudHMuLi48L29wdGlvbj5cIilcbiAgICBAZmV0Y2hBc3Nlc3NtZW50cygpXG5cblxuICBmZXRjaEFzc2Vzc21lbnRzOiA9PlxuICAgIEBncm91cEFzc2Vzc21lbnRzID0gbmV3IEFzc2Vzc21lbnRzXG4gICAgQGdyb3VwQXNzZXNzbWVudHMuZmV0Y2hcbiAgICAgIGtleTogQGdyb3VwXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBAcG9wdWxhdGVBc3Nlc3NtZW50U2VsZWN0b3IoKVxuICBcbiAgcG9wdWxhdGVBc3Nlc3NtZW50U2VsZWN0b3I6ID0+XG4gICAgb3B0aW9uTGlzdCA9IFwiXCJcbiAgICBmb3IgYXNzZXNzbWVudCBpbiBAZ3JvdXBBc3Nlc3NtZW50cy5tb2RlbHNcbiAgICAgIG9wdGlvbkxpc3QgKz0gXCI8b3B0aW9uIGRhdGEtYXNzZXNzbWVudElkPScje2Fzc2Vzc21lbnQuaWR9Jz4je2Fzc2Vzc21lbnQuZ2V0KFwibmFtZVwiKX08L29wdGlvbj5cIlxuICAgICRzZWxlY3QgPSBAJGVsLmZpbmQoXCIuY29weV9zZWxlY3RcIikuaHRtbChvcHRpb25MaXN0KVxuICAgICAgXG4gIGRvQ29weTogKGUpIC0+XG4gICAgQHRyaWdnZXIgXCJlbGVtZW50OmNvcHlcIiwgQCRlbC5maW5kKFwiLmNvcHlfc2VsZWN0IDpzZWxlY3RlZFwiKS5hdHRyKCdkYXRhLWFzc2Vzc21lbnRJZCcpLCBAbW9kZWwuaWRcbiAgICBAJGVsLmZpbmQoXCIuY29weV9tZW51XCIpLmFkZENsYXNzKFwiY29uZmlybWF0aW9uXCIpXG4gICAgXG4gIGNhbmNlbENvcHk6IC0+XG4gICAgQCRlbC5maW5kKFwiLmNvcHlfbWVudVwiKS5hZGRDbGFzcyhcImNvbmZpcm1hdGlvblwiKVxuXG4gIHJlbmRlcjogLT5cbiAgICBlbGVtZW50TmFtZSAgID0gXCI8c3BhbiBjbGFzcz0nbmFtZSc+I3tAbW9kZWwuZ2V0KFwibmFtZVwiKX08L3NwYW4+XCJcbiAgICBlbGVtZW50ICAgICA9IFwiPHNwYW4gY2xhc3M9J3NtYWxsX2dyZXknPiN7QG1vZGVsLmdldChcImVsZW1lbnRcIil9PC9zcGFuPlwiXG4gICAgZmlsZVR5cGUgICAgID0gXCI8c3BhbiBjbGFzcz0nc21hbGxfZ3JleSc+I3tAbW9kZWwuZ2V0KFwiZmlsZVR5cGVcIil9PC9zcGFuPlwiXG4gICAgaWNvbkRyYWcgICAgICA9IFwiPGltZyBzcmM9J2ltYWdlcy9pY29uX2RyYWcucG5nJyB0aXRsZT0nRHJhZyB0byByZW9yZGVyJyBjbGFzcz0naWNvbiBzb3J0YWJsZV9oYW5kbGUnPlwiXG4gICAgaWNvbkVkaXQgICAgICA9IFwiPGltZyBzcmM9J2ltYWdlcy9pY29uX2VkaXQucG5nJyB0aXRsZT0nRWRpdCcgY2xhc3M9J2ljb24gaWNvbl9lZGl0Jz5cIlxuICAgIGljb25EZWxldGUgICAgPSBcIjxpbWcgc3JjPSdpbWFnZXMvaWNvbl9kZWxldGUucG5nJyB0aXRsZT0nRGVsZXRlJyBjbGFzcz0naWNvbiBpY29uX2RlbGV0ZSc+XCJcbiAgICBjb3B5SWNvbiAgICAgID0gXCI8aW1nIHNyYz0naW1hZ2VzL2ljb25fY29weV90by5wbmcnIHRpdGxlPSdDb3B5IHRvLi4uJyBjbGFzcz0naWNvbiBpY29uX2NvcHknPlwiXG4gICAgY29weU1lbnUgICAgICA9IFwiPGRpdiBjbGFzcz0nY29uZmlybWF0aW9uIGNvcHlfbWVudSc+PHNlbGVjdCBjbGFzcz0nY29weV9zZWxlY3QnPjwvc2VsZWN0Pjxicj48YnV0dG9uIGNsYXNzPSdkb19jb3B5IGNvbW1hbmQnPkNvcHk8L2J1dHRvbj4gPGJ1dHRvbiBjbGFzcz0nY2FuY2VsX2NvcHkgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+PC9kaXY+XCJcbiAgICBkZWxldGVDb25maXJtID0gXCI8YnI+PHNwYW4gY2xhc3M9J2RlbGV0ZV9jb25maXJtJz48ZGl2IGNsYXNzPSdtZW51X2JveCc+Q29uZmlybSA8YnV0dG9uIGNsYXNzPSdkZWxldGVfZGVsZXRlIGNvbW1hbmRfcmVkJz5EZWxldGU8L2J1dHRvbj4gPGJ1dHRvbiBjbGFzcz0nZGVsZXRlX2NhbmNlbCBjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj48L2Rpdj48L3NwYW4+XCJcbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDx0YWJsZT48dHI+XG4gICAgICA8dGQ+I3tpY29uRHJhZ308L3RkPlxuICAgICAgPHRkPlxuICAgICAgICAje2VsZW1lbnROYW1lfVxuICAgICAgICAje2VsZW1lbnR9XG4gICAgICAgICN7ZmlsZVR5cGV9XG4gICAgICAgICN7aWNvbkVkaXR9XG4gICAgICAgICN7Y29weUljb259XG4gICAgICAgICN7aWNvbkRlbGV0ZX1cbiAgICAgICAgI3tkZWxldGVDb25maXJtfVxuICAgICAgICAje2NvcHlNZW51fVxuICAgICAgPC90ZD5cbiAgICAgIDwvdHI+PC90YWJsZT5cbiAgICBcIlxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4iXX0=
