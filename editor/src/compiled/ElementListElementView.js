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
    var copyIcon, copyMenu, deleteConfirm, element, elementName, iconDelete, iconDrag, iconEdit;
    elementName = "<span class='name'>" + (this.model.get("name")) + "</span>";
    element = "<span class='small_grey'>" + (this.model.get("element")) + "</span>";
    iconDrag = "<img src='images/icon_drag.png' title='Drag to reorder' class='icon sortable_handle'>";
    iconEdit = "<img src='images/icon_edit.png' title='Edit' class='icon icon_edit'>";
    iconDelete = "<img src='images/icon_delete.png' title='Delete' class='icon icon_delete'>";
    copyIcon = "<img src='images/icon_copy_to.png' title='Copy to...' class='icon icon_copy'>";
    copyMenu = "<div class='confirmation copy_menu'><select class='copy_select'></select><br><button class='do_copy command'>Copy</button> <button class='cancel_copy command'>Cancel</button></div>";
    deleteConfirm = "<br><span class='delete_confirm'><div class='menu_box'>Confirm <button class='delete_delete command_red'>Delete</button> <button class='delete_cancel command'>Cancel</button></div></span>";
    this.$el.html("<table><tr> <td>" + iconDrag + "</td> <td> " + elementName + " " + element + " " + iconEdit + " " + copyIcon + " " + iconDelete + " " + deleteConfirm + " " + copyMenu + " </td> </tr></table>");
    return this.trigger("rendered");
  };

  return ElementListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVsZW1lbnQvRWxlbWVudExpc3RFbGVtZW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxzQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7OzttQ0FFSixTQUFBLEdBQVk7O21DQUNaLE9BQUEsR0FBVTs7bUNBRVYsTUFBQSxHQUNFO0lBQUEsa0JBQUEsRUFBeUIsTUFBekI7SUFDQSxvQkFBQSxFQUF5QixxQkFEekI7SUFFQSxzQkFBQSxFQUF5QixxQkFGekI7SUFHQSxzQkFBQSxFQUF5QixRQUh6QjtJQUlBLGtCQUFBLEVBQXlCLGNBSnpCO0lBS0EsZ0JBQUEsRUFBeUIsUUFMekI7SUFNQSxvQkFBQSxFQUF5QixZQU56QjtJQVFBLGFBQUEsRUFBZ0IsZ0JBUmhCOzs7bUNBVUYsY0FBQSxHQUFnQixTQUFBO0lBQ2QsSUFBRyxJQUFDLENBQUEsUUFBRCxLQUFhLElBQWhCO01BQ0UsSUFBQyxDQUFBLFFBQUQsR0FBWTthQUNaLElBQUMsQ0FBQSxHQUFHLENBQUMsV0FBTCxDQUFpQixrQkFBakIsRUFGRjtLQUFBLE1BQUE7TUFJRSxJQUFDLENBQUEsUUFBRCxHQUFZO2FBQ1osSUFBQyxDQUFBLEdBQUcsQ0FBQyxRQUFMLENBQWMsa0JBQWQsRUFMRjs7RUFEYzs7bUNBUWhCLG1CQUFBLEdBQXFCLFNBQUE7SUFBRyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVixDQUE0QixDQUFDLFVBQTdCLENBQXdDLEdBQXhDO1dBQThDO0VBQWpEOzttQ0FFckIsU0FBQSxHQUFRLFNBQUE7SUFBRyxJQUFDLENBQUEsT0FBRCxDQUFTLGdCQUFULEVBQTJCLElBQUMsQ0FBQSxLQUE1QjtXQUFtQztFQUF0Qzs7bUNBRVIsSUFBQSxHQUFNLFNBQUE7V0FDSixTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFVBQUEsR0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLEVBQTVDLEVBQWtELElBQWxEO0VBREk7O21DQUdOLFVBQUEs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ZW50Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEVsZW1lbnRMaXN0RWxlbWVudFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJlbGVtZW50X2VsZW1lbnRcIlxuICB0YWdOYW1lIDogXCJsaVwiXG5cbiAgZXZlbnRzOiBcbiAgICAnY2xpY2sgLmljb25fZWRpdCcgICAgIDogJ2VkaXQnXG4gICAgXCJjbGljayAuaWNvbl9kZWxldGVcIiAgIDogXCJ0b2dnbGVEZWxldGVDb25maXJtXCJcbiAgICBcImNsaWNrIC5kZWxldGVfY2FuY2VsXCIgOiBcInRvZ2dsZURlbGV0ZUNvbmZpcm1cIlxuICAgIFwiY2xpY2sgLmRlbGV0ZV9kZWxldGVcIiA6IFwiZGVsZXRlXCJcbiAgICBcImNsaWNrIC5pY29uX2NvcHlcIiAgICAgOiBcIm9wZW5Db3B5TWVudVwiXG4gICAgXCJjbGljayAuZG9fY29weVwiICAgICAgIDogXCJkb0NvcHlcIlxuICAgIFwiY2xpY2sgLmNhbmNlbF9jb3B5XCIgICA6IFwiY2FuY2VsQ29weVwiXG5cbiAgICBcImNsaWNrIC5uYW1lXCIgOiBcInRvZ2dsZVNlbGVjdGVkXCJcblxuICB0b2dnbGVTZWxlY3RlZDogLT5cbiAgICBpZiBAc2VsZWN0ZWQgPT0gdHJ1ZVxuICAgICAgQHNlbGVjdGVkID0gZmFsc2VcbiAgICAgIEAkZWwucmVtb3ZlQ2xhc3MgXCJlbGVtZW50LXNlbGVjdGVkXCJcbiAgICBlbHNlXG4gICAgICBAc2VsZWN0ZWQgPSB0cnVlXG4gICAgICBAJGVsLmFkZENsYXNzIFwiZWxlbWVudC1zZWxlY3RlZFwiXG5cbiAgdG9nZ2xlRGVsZXRlQ29uZmlybTogLT4gQCRlbC5maW5kKFwiLmRlbGV0ZV9jb25maXJtXCIpLmZhZGVUb2dnbGUoMjUwKTsgZmFsc2VcblxuICBkZWxldGU6IC0+IEB0cmlnZ2VyIFwiZWxlbWVudDpkZWxldGVcIiwgQG1vZGVsOyBmYWxzZVxuXG4gIGVkaXQ6IC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImVsZW1lbnQvI3tAbW9kZWwuaWR9XCIsIHRydWVcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAbW9kZWwgPSBvcHRpb25zLmVsZW1lbnRcbiAgICBAZ3JvdXAgPSBvcHRpb25zLmdyb3VwICMgZm9yIGNvcHlpbmdcblxuICAgICMgVGhpcyBpcyBmb3IgJC5zb3J0YWJsZS4gRG9uJ3QgcmVtb3ZlLlxuICAgIEAkZWwuYXR0ciBcImRhdGEtaWRcIiwgQG1vZGVsLmlkXG5cbiAgb3BlbkNvcHlNZW51OiAtPlxuICAgIEAkZWwuZmluZChcIi5jb3B5X21lbnVcIikucmVtb3ZlQ2xhc3MoXCJjb25maXJtYXRpb25cIilcbiAgICBAJGVsLmZpbmQoXCIuY29weV9zZWxlY3RcIikuYXBwZW5kKFwiPG9wdGlvbiBkaXNhYmxlZD0nZGlzYWJsZWQnIHNlbGVjdGVkPSdzZWxlY3RlZCc+TG9hZGluZyBhc3Nlc3NtZW50cy4uLjwvb3B0aW9uPlwiKVxuICAgIEBmZXRjaEFzc2Vzc21lbnRzKClcblxuXG4gIGZldGNoQXNzZXNzbWVudHM6ID0+XG4gICAgQGdyb3VwQXNzZXNzbWVudHMgPSBuZXcgQXNzZXNzbWVudHNcbiAgICBAZ3JvdXBBc3Nlc3NtZW50cy5mZXRjaFxuICAgICAga2V5OiBAZ3JvdXBcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIEBwb3B1bGF0ZUFzc2Vzc21lbnRTZWxlY3RvcigpXG4gIFxuICBwb3B1bGF0ZUFzc2Vzc21lbnRTZWxlY3RvcjogPT5cbiAgICBvcHRpb25MaXN0ID0gXCJcIlxuICAgIGZvciBhc3Nlc3NtZW50IGluIEBncm91cEFzc2Vzc21lbnRzLm1vZGVsc1xuICAgICAgb3B0aW9uTGlzdCArPSBcIjxvcHRpb24gZGF0YS1hc3Nlc3NtZW50SWQ9JyN7YXNzZXNzbWVudC5pZH0nPiN7YXNzZXNzbWVudC5nZXQoXCJuYW1lXCIpfTwvb3B0aW9uPlwiXG4gICAgJHNlbGVjdCA9IEAkZWwuZmluZChcIi5jb3B5X3NlbGVjdFwiKS5odG1sKG9wdGlvbkxpc3QpXG4gICAgICBcbiAgZG9Db3B5OiAoZSkgLT5cbiAgICBAdHJpZ2dlciBcImVsZW1lbnQ6Y29weVwiLCBAJGVsLmZpbmQoXCIuY29weV9zZWxlY3QgOnNlbGVjdGVkXCIpLmF0dHIoJ2RhdGEtYXNzZXNzbWVudElkJyksIEBtb2RlbC5pZFxuICAgIEAkZWwuZmluZChcIi5jb3B5X21lbnVcIikuYWRkQ2xhc3MoXCJjb25maXJtYXRpb25cIilcbiAgICBcbiAgY2FuY2VsQ29weTogLT5cbiAgICBAJGVsLmZpbmQoXCIuY29weV9tZW51XCIpLmFkZENsYXNzKFwiY29uZmlybWF0aW9uXCIpXG5cbiAgcmVuZGVyOiAtPlxuICAgIGVsZW1lbnROYW1lICAgPSBcIjxzcGFuIGNsYXNzPSduYW1lJz4je0Btb2RlbC5nZXQoXCJuYW1lXCIpfTwvc3Bhbj5cIlxuICAgIGVsZW1lbnQgICAgID0gXCI8c3BhbiBjbGFzcz0nc21hbGxfZ3JleSc+I3tAbW9kZWwuZ2V0KFwiZWxlbWVudFwiKX08L3NwYW4+XCJcbiAgICBpY29uRHJhZyAgICAgID0gXCI8aW1nIHNyYz0naW1hZ2VzL2ljb25fZHJhZy5wbmcnIHRpdGxlPSdEcmFnIHRvIHJlb3JkZXInIGNsYXNzPSdpY29uIHNvcnRhYmxlX2hhbmRsZSc+XCJcbiAgICBpY29uRWRpdCAgICAgID0gXCI8aW1nIHNyYz0naW1hZ2VzL2ljb25fZWRpdC5wbmcnIHRpdGxlPSdFZGl0JyBjbGFzcz0naWNvbiBpY29uX2VkaXQnPlwiXG4gICAgaWNvbkRlbGV0ZSAgICA9IFwiPGltZyBzcmM9J2ltYWdlcy9pY29uX2RlbGV0ZS5wbmcnIHRpdGxlPSdEZWxldGUnIGNsYXNzPSdpY29uIGljb25fZGVsZXRlJz5cIlxuICAgIGNvcHlJY29uICAgICAgPSBcIjxpbWcgc3JjPSdpbWFnZXMvaWNvbl9jb3B5X3RvLnBuZycgdGl0bGU9J0NvcHkgdG8uLi4nIGNsYXNzPSdpY29uIGljb25fY29weSc+XCJcbiAgICBjb3B5TWVudSAgICAgID0gXCI8ZGl2IGNsYXNzPSdjb25maXJtYXRpb24gY29weV9tZW51Jz48c2VsZWN0IGNsYXNzPSdjb3B5X3NlbGVjdCc+PC9zZWxlY3Q+PGJyPjxidXR0b24gY2xhc3M9J2RvX2NvcHkgY29tbWFuZCc+Q29weTwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSdjYW5jZWxfY29weSBjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj48L2Rpdj5cIlxuICAgIGRlbGV0ZUNvbmZpcm0gPSBcIjxicj48c3BhbiBjbGFzcz0nZGVsZXRlX2NvbmZpcm0nPjxkaXYgY2xhc3M9J21lbnVfYm94Jz5Db25maXJtIDxidXR0b24gY2xhc3M9J2RlbGV0ZV9kZWxldGUgY29tbWFuZF9yZWQnPkRlbGV0ZTwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSdkZWxldGVfY2FuY2VsIGNvbW1hbmQnPkNhbmNlbDwvYnV0dG9uPjwvZGl2Pjwvc3Bhbj5cIlxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPHRhYmxlPjx0cj5cbiAgICAgIDx0ZD4je2ljb25EcmFnfTwvdGQ+XG4gICAgICA8dGQ+XG4gICAgICAgICN7ZWxlbWVudE5hbWV9XG4gICAgICAgICN7ZWxlbWVudH1cbiAgICAgICAgI3tpY29uRWRpdH1cbiAgICAgICAgI3tjb3B5SWNvbn1cbiAgICAgICAgI3tpY29uRGVsZXRlfVxuICAgICAgICAje2RlbGV0ZUNvbmZpcm19XG4gICAgICAgICN7Y29weU1lbnV9XG4gICAgICA8L3RkPlxuICAgICAgPC90cj48L3RhYmxlPlxuICAgIFwiXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiJdfQ==
