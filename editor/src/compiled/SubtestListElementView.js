var SubtestListElementView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SubtestListElementView = (function(superClass) {
  extend(SubtestListElementView, superClass);

  function SubtestListElementView() {
    this.populateAssessmentSelector = bind(this.populateAssessmentSelector, this);
    this.fetchAssessments = bind(this.fetchAssessments, this);
    return SubtestListElementView.__super__.constructor.apply(this, arguments);
  }

  SubtestListElementView.prototype.className = "subtest_element";

  SubtestListElementView.prototype.tagName = "li";

  SubtestListElementView.prototype.events = {
    'click .icon_edit': 'edit',
    "click .icon_delete": "toggleDeleteConfirm",
    "click .delete_cancel": "toggleDeleteConfirm",
    "click .delete_delete": "delete",
    "click .icon_copy": "openCopyMenu",
    "click .do_copy": "doCopy",
    "click .cancel_copy": "cancelCopy",
    "click .name": "toggleSelected"
  };

  SubtestListElementView.prototype.toggleSelected = function() {
    if (this.selected === true) {
      this.selected = false;
      return this.$el.removeClass("subtest-selected");
    } else {
      this.selected = true;
      return this.$el.addClass("subtest-selected");
    }
  };

  SubtestListElementView.prototype.toggleDeleteConfirm = function() {
    this.$el.find(".delete_confirm").fadeToggle(250);
    return false;
  };

  SubtestListElementView.prototype["delete"] = function() {
    this.trigger("subtest:delete", this.model);
    return false;
  };

  SubtestListElementView.prototype.edit = function() {
    return Tangerine.router.navigate("subtest/" + this.model.id, true);
  };

  SubtestListElementView.prototype.initialize = function(options) {
    this.model = options.subtest;
    this.group = options.group;
    return this.$el.attr("data-id", this.model.id);
  };

  SubtestListElementView.prototype.openCopyMenu = function() {
    this.$el.find(".copy_menu").removeClass("confirmation");
    this.$el.find(".copy_select").append("<option disabled='disabled' selected='selected'>Loading assessments...</option>");
    return this.fetchAssessments();
  };

  SubtestListElementView.prototype.fetchAssessments = function() {
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

  SubtestListElementView.prototype.populateAssessmentSelector = function() {
    var $select, assessment, i, len, optionList, ref;
    optionList = "";
    ref = this.groupAssessments.models;
    for (i = 0, len = ref.length; i < len; i++) {
      assessment = ref[i];
      optionList += "<option data-assessmentId='" + assessment.id + "'>" + (assessment.get("name")) + "</option>";
    }
    return $select = this.$el.find(".copy_select").html(optionList);
  };

  SubtestListElementView.prototype.doCopy = function(e) {
    this.trigger("subtest:copy", this.$el.find(".copy_select :selected").attr('data-assessmentId'), this.model.id);
    return this.$el.find(".copy_menu").addClass("confirmation");
  };

  SubtestListElementView.prototype.cancelCopy = function() {
    return this.$el.find(".copy_menu").addClass("confirmation");
  };

  SubtestListElementView.prototype.render = function() {
    var copyIcon, copyMenu, deleteConfirm, iconDelete, iconDrag, iconEdit, prototype, subtestName;
    subtestName = "<span class='name'>" + (this.model.get("name")) + "</span>";
    prototype = "<span class='small_grey'>" + (this.model.get("prototype")) + "</span>";
    iconDrag = "<img src='images/icon_drag.png' title='Drag to reorder' class='icon sortable_handle'>";
    iconEdit = "<img src='images/icon_edit.png' title='Edit' class='icon icon_edit'>";
    iconDelete = "<img src='images/icon_delete.png' title='Delete' class='icon icon_delete'>";
    copyIcon = "<img src='images/icon_copy_to.png' title='Copy to...' class='icon icon_copy'>";
    copyMenu = "<div class='confirmation copy_menu'><select class='copy_select'></select><br><button class='do_copy command'>Copy</button> <button class='cancel_copy command'>Cancel</button></div>";
    deleteConfirm = "<br><span class='delete_confirm'><div class='menu_box'>Confirm <button class='delete_delete command_red'>Delete</button> <button class='delete_cancel command'>Cancel</button></div></span>";
    this.$el.html("<table><tr> <td>" + iconDrag + "</td> <td> " + subtestName + " " + prototype + " " + iconEdit + " " + copyIcon + " " + iconDelete + " " + deleteConfirm + " " + copyMenu + " </td> </tr></table>");
    return this.trigger("rendered");
  };

  return SubtestListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvU3VidGVzdExpc3RFbGVtZW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxzQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7OzttQ0FFSixTQUFBLEdBQVk7O21DQUNaLE9BQUEsR0FBVTs7bUNBRVYsTUFBQSxHQUNFO0lBQUEsa0JBQUEsRUFBeUIsTUFBekI7SUFDQSxvQkFBQSxFQUF5QixxQkFEekI7SUFFQSxzQkFBQSxFQUF5QixxQkFGekI7SUFHQSxzQkFBQSxFQUF5QixRQUh6QjtJQUlBLGtCQUFBLEVBQXlCLGNBSnpCO0lBS0EsZ0JBQUEsRUFBeUIsUUFMekI7SUFNQSxvQkFBQSxFQUF5QixZQU56QjtJQVFBLGFBQUEsRUFBZ0IsZ0JBUmhCOzs7bUNBVUYsY0FBQSxHQUFnQixTQUFBO0lBQ2QsSUFBRyxJQUFDLENBQUEsUUFBRCxLQUFhLElBQWhCO01BQ0UsSUFBQyxDQUFBLFFBQUQsR0FBWTthQUNaLElBQUMsQ0FBQSxHQUFHLENBQUMsV0FBTCxDQUFpQixrQkFBakIsRUFGRjtLQUFBLE1BQUE7TUFJRSxJQUFDLENBQUEsUUFBRCxHQUFZO2FBQ1osSUFBQyxDQUFBLEdBQUcsQ0FBQyxRQUFMLENBQWMsa0JBQWQsRUFMRjs7RUFEYzs7bUNBUWhCLG1CQUFBLEdBQXFCLFNBQUE7SUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVixDQUE0QixDQUFDLFVBQTdCLENBQXdDLEdBQXhDO1dBQThDO0VBQWpEOzttQ0FFckIsU0FBQSxHQUFRLFNBQUE7SUFBRyxJQUFDLENBQUEsT0FBRCxDQUFTLGdCQUFULEVBQTJCLElBQUMsQ0FBQSxLQUE1QjtXQUFtQztFQUF0Qzs7bUNBRVIsSUFBQSxHQUFNLFNBQUE7V0FDSixTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFVBQUEsR0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQTVDLEVBQWtELElBQWxEO0VBREk7O21DQUdOLFVBQUEs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bWVudFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdWJ0ZXN0TGlzdEVsZW1lbnRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwic3VidGVzdF9lbGVtZW50XCJcbiAgdGFnTmFtZSA6IFwibGlcIlxuXG4gIGV2ZW50czogXG4gICAgJ2NsaWNrIC5pY29uX2VkaXQnICAgICA6ICdlZGl0J1xuICAgIFwiY2xpY2sgLmljb25fZGVsZXRlXCIgICA6IFwidG9nZ2xlRGVsZXRlQ29uZmlybVwiXG4gICAgXCJjbGljayAuZGVsZXRlX2NhbmNlbFwiIDogXCJ0b2dnbGVEZWxldGVDb25maXJtXCJcbiAgICBcImNsaWNrIC5kZWxldGVfZGVsZXRlXCIgOiBcImRlbGV0ZVwiXG4gICAgXCJjbGljayAuaWNvbl9jb3B5XCIgICAgIDogXCJvcGVuQ29weU1lbnVcIlxuICAgIFwiY2xpY2sgLmRvX2NvcHlcIiAgICAgICA6IFwiZG9Db3B5XCJcbiAgICBcImNsaWNrIC5jYW5jZWxfY29weVwiICAgOiBcImNhbmNlbENvcHlcIlxuXG4gICAgXCJjbGljayAubmFtZVwiIDogXCJ0b2dnbGVTZWxlY3RlZFwiXG5cbiAgdG9nZ2xlU2VsZWN0ZWQ6IC0+XG4gICAgaWYgQHNlbGVjdGVkID09IHRydWVcbiAgICAgIEBzZWxlY3RlZCA9IGZhbHNlXG4gICAgICBAJGVsLnJlbW92ZUNsYXNzIFwic3VidGVzdC1zZWxlY3RlZFwiXG4gICAgZWxzZVxuICAgICAgQHNlbGVjdGVkID0gdHJ1ZVxuICAgICAgQCRlbC5hZGRDbGFzcyBcInN1YnRlc3Qtc2VsZWN0ZWRcIlxuXG4gIHRvZ2dsZURlbGV0ZUNvbmZpcm06IC0+IEAkZWwuZmluZChcIi5kZWxldGVfY29uZmlybVwiKS5mYWRlVG9nZ2xlKDI1MCk7IGZhbHNlXG5cbiAgZGVsZXRlOiAtPiBAdHJpZ2dlciBcInN1YnRlc3Q6ZGVsZXRlXCIsIEBtb2RlbDsgZmFsc2VcblxuICBlZGl0OiAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJzdWJ0ZXN0LyN7QG1vZGVsLmlkfVwiLCB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQG1vZGVsID0gb3B0aW9ucy5zdWJ0ZXN0XG4gICAgQGdyb3VwID0gb3B0aW9ucy5ncm91cCAjIGZvciBjb3B5aW5nXG5cbiAgICAjIFRoaXMgaXMgZm9yICQuc29ydGFibGUuIERvbid0IHJlbW92ZS5cbiAgICBAJGVsLmF0dHIgXCJkYXRhLWlkXCIsIEBtb2RlbC5pZFxuXG4gIG9wZW5Db3B5TWVudTogLT5cbiAgICBAJGVsLmZpbmQoXCIuY29weV9tZW51XCIpLnJlbW92ZUNsYXNzKFwiY29uZmlybWF0aW9uXCIpXG4gICAgQCRlbC5maW5kKFwiLmNvcHlfc2VsZWN0XCIpLmFwcGVuZChcIjxvcHRpb24gZGlzYWJsZWQ9J2Rpc2FibGVkJyBzZWxlY3RlZD0nc2VsZWN0ZWQnPkxvYWRpbmcgYXNzZXNzbWVudHMuLi48L29wdGlvbj5cIilcbiAgICBAZmV0Y2hBc3Nlc3NtZW50cygpXG5cblxuICBmZXRjaEFzc2Vzc21lbnRzOiA9PlxuICAgIEBncm91cEFzc2Vzc21lbnRzID0gbmV3IEFzc2Vzc21lbnRzXG4gICAgQGdyb3VwQXNzZXNzbWVudHMuZmV0Y2hcbiAgICAgIGtleTogQGdyb3VwXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBAcG9wdWxhdGVBc3Nlc3NtZW50U2VsZWN0b3IoKVxuICBcbiAgcG9wdWxhdGVBc3Nlc3NtZW50U2VsZWN0b3I6ID0+XG4gICAgb3B0aW9uTGlzdCA9IFwiXCJcbiAgICBmb3IgYXNzZXNzbWVudCBpbiBAZ3JvdXBBc3Nlc3NtZW50cy5tb2RlbHNcbiAgICAgIG9wdGlvbkxpc3QgKz0gXCI8b3B0aW9uIGRhdGEtYXNzZXNzbWVudElkPScje2Fzc2Vzc21lbnQuaWR9Jz4je2Fzc2Vzc21lbnQuZ2V0KFwibmFtZVwiKX08L29wdGlvbj5cIlxuICAgICRzZWxlY3QgPSBAJGVsLmZpbmQoXCIuY29weV9zZWxlY3RcIikuaHRtbChvcHRpb25MaXN0KVxuICAgICAgXG4gIGRvQ29weTogKGUpIC0+XG4gICAgQHRyaWdnZXIgXCJzdWJ0ZXN0OmNvcHlcIiwgQCRlbC5maW5kKFwiLmNvcHlfc2VsZWN0IDpzZWxlY3RlZFwiKS5hdHRyKCdkYXRhLWFzc2Vzc21lbnRJZCcpLCBAbW9kZWwuaWRcbiAgICBAJGVsLmZpbmQoXCIuY29weV9tZW51XCIpLmFkZENsYXNzKFwiY29uZmlybWF0aW9uXCIpXG4gICAgXG4gIGNhbmNlbENvcHk6IC0+XG4gICAgQCRlbC5maW5kKFwiLmNvcHlfbWVudVwiKS5hZGRDbGFzcyhcImNvbmZpcm1hdGlvblwiKVxuXG4gIHJlbmRlcjogLT5cbiAgICBzdWJ0ZXN0TmFtZSAgID0gXCI8c3BhbiBjbGFzcz0nbmFtZSc+I3tAbW9kZWwuZ2V0KFwibmFtZVwiKX08L3NwYW4+XCJcbiAgICBwcm90b3R5cGUgICAgID0gXCI8c3BhbiBjbGFzcz0nc21hbGxfZ3JleSc+I3tAbW9kZWwuZ2V0KFwicHJvdG90eXBlXCIpfTwvc3Bhbj5cIlxuICAgIGljb25EcmFnICAgICAgPSBcIjxpbWcgc3JjPSdpbWFnZXMvaWNvbl9kcmFnLnBuZycgdGl0bGU9J0RyYWcgdG8gcmVvcmRlcicgY2xhc3M9J2ljb24gc29ydGFibGVfaGFuZGxlJz5cIlxuICAgIGljb25FZGl0ICAgICAgPSBcIjxpbWcgc3JjPSdpbWFnZXMvaWNvbl9lZGl0LnBuZycgdGl0bGU9J0VkaXQnIGNsYXNzPSdpY29uIGljb25fZWRpdCc+XCJcbiAgICBpY29uRGVsZXRlICAgID0gXCI8aW1nIHNyYz0naW1hZ2VzL2ljb25fZGVsZXRlLnBuZycgdGl0bGU9J0RlbGV0ZScgY2xhc3M9J2ljb24gaWNvbl9kZWxldGUnPlwiXG4gICAgY29weUljb24gICAgICA9IFwiPGltZyBzcmM9J2ltYWdlcy9pY29uX2NvcHlfdG8ucG5nJyB0aXRsZT0nQ29weSB0by4uLicgY2xhc3M9J2ljb24gaWNvbl9jb3B5Jz5cIlxuICAgIGNvcHlNZW51ICAgICAgPSBcIjxkaXYgY2xhc3M9J2NvbmZpcm1hdGlvbiBjb3B5X21lbnUnPjxzZWxlY3QgY2xhc3M9J2NvcHlfc2VsZWN0Jz48L3NlbGVjdD48YnI+PGJ1dHRvbiBjbGFzcz0nZG9fY29weSBjb21tYW5kJz5Db3B5PC9idXR0b24+IDxidXR0b24gY2xhc3M9J2NhbmNlbF9jb3B5IGNvbW1hbmQnPkNhbmNlbDwvYnV0dG9uPjwvZGl2PlwiXG4gICAgZGVsZXRlQ29uZmlybSA9IFwiPGJyPjxzcGFuIGNsYXNzPSdkZWxldGVfY29uZmlybSc+PGRpdiBjbGFzcz0nbWVudV9ib3gnPkNvbmZpcm0gPGJ1dHRvbiBjbGFzcz0nZGVsZXRlX2RlbGV0ZSBjb21tYW5kX3JlZCc+RGVsZXRlPC9idXR0b24+IDxidXR0b24gY2xhc3M9J2RlbGV0ZV9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+PC9kaXY+PC9zcGFuPlwiXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8dGFibGU+PHRyPlxuICAgICAgPHRkPiN7aWNvbkRyYWd9PC90ZD5cbiAgICAgIDx0ZD5cbiAgICAgICAgI3tzdWJ0ZXN0TmFtZX1cbiAgICAgICAgI3twcm90b3R5cGV9XG4gICAgICAgICN7aWNvbkVkaXR9XG4gICAgICAgICN7Y29weUljb259XG4gICAgICAgICN7aWNvbkRlbGV0ZX1cbiAgICAgICAgI3tkZWxldGVDb25maXJtfVxuICAgICAgICAje2NvcHlNZW51fVxuICAgICAgPC90ZD5cbiAgICAgIDwvdHI+PC90YWJsZT5cbiAgICBcIlxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4iXX0=
