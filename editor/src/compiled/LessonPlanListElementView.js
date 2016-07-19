var LessonPlanListElementView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LessonPlanListElementView = (function(superClass) {
  extend(LessonPlanListElementView, superClass);

  function LessonPlanListElementView() {
    this["delete"] = bind(this["delete"], this);
    return LessonPlanListElementView.__super__.constructor.apply(this, arguments);
  }

  LessonPlanListElementView.prototype.className = "LessonPlanListElementView";

  LessonPlanListElementView.prototype.tagName = "li";

  LessonPlanListElementView.prototype.events = {
    'click .toggle_menu': 'toggleMenu',
    'click .duplicate': 'duplicate',
    'click .delete': 'deleteToggle',
    'click .delete_cancel': 'deleteToggle',
    'click .delete_confirm': 'delete'
  };

  LessonPlanListElementView.prototype.initialize = function(options) {
    this.lessonPlan = options.lessonPlan;
    return this.subtests = options.subtests;
  };

  LessonPlanListElementView.prototype.duplicate = function() {
    var newName;
    newName = "Copy of " + this.lessonPlan.get("name");
    return this.lessonPlan.duplicate({
      name: newName
    }, null, null, (function(_this) {
      return function(lessonPlan) {
        return _this.lessonPlan.trigger("new", lessonPlan);
      };
    })(this));
  };

  LessonPlanListElementView.prototype.toggleMenu = function() {
    this.$el.find(".sp_down, .sp_right").toggleClass('sp_down').toggleClass('sp_right');
    return this.$el.find(".menu").fadeToggle(150);
  };

  LessonPlanListElementView.prototype.deleteToggle = function() {
    this.$el.find(".delete_confirm").fadeToggle(250);
    return false;
  };

  LessonPlanListElementView.prototype["delete"] = function() {
    return this.lessonPlan.destroy();
  };

  LessonPlanListElementView.prototype.render = function() {
    var deleteButton, deleteConfirm, downloadKey, duplicateButton, editButton, menu, name, toggleButton;
    toggleButton = "<div class='toggle_menu sp_right'><div> </div></div>";
    editButton = "<a href='#lessonPlan/" + this.lessonPlan.id + "'><img class='link_icon edit' title='Edit' src='images/icon_edit.png'></a>";
    duplicateButton = "<img class='link_icon duplicate' title='Duplicate' src='images/icon_duplicate.png'>";
    deleteButton = "<img class='delete link_icon' title='Delete' src='images/icon_delete.png'>";
    deleteConfirm = "<span class='delete_confirm'><div class='menu_box'>Confirm <button class='delete_yes command_red'>Delete</button> <button class='delete_cancel command'>Cancel</button></div></span>";
    downloadKey = "<span class='download_key small_grey'>Download key <b>" + (this.lessonPlan.id.substr(-5, 5)) + "</b></span>";
    name = "<span class='toggle_menu'>" + (this.lessonPlan.escape('name')) + "</span>";
    if (Tangerine.user.isAdmin()) {
      menu = editButton + " " + duplicateButton + " " + deleteButton + " " + downloadKey + " " + deleteConfirm;
    }
    if (!Tangerine.user.isAdmin()) {
      menu = editButton + " " + downloadKey;
    }
    this.$el.html("<div> " + toggleButton + " " + name + " </div> <div> <div class='confirmation menu'> " + menu + " </div> </div>");
    return this.trigger("rendered");
  };

  return LessonPlanListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxlc3NvblBsYW4vTGVzc29uUGxhbkxpc3RFbGVtZW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSx5QkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7O3NDQUVKLFNBQUEsR0FBWTs7c0NBQ1osT0FBQSxHQUFTOztzQ0FFVCxNQUFBLEdBQ0U7SUFBQSxvQkFBQSxFQUF1QixZQUF2QjtJQUNBLGtCQUFBLEVBQXVCLFdBRHZCO0lBRUEsZUFBQSxFQUEwQixjQUYxQjtJQUdBLHNCQUFBLEVBQTBCLGNBSDFCO0lBSUEsdUJBQUEsRUFBMEIsUUFKMUI7OztzQ0FTRixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLFVBQUQsR0FBYyxPQUFPLENBQUM7V0FDdEIsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFPLENBQUM7RUFGVjs7c0NBSVosU0FBQSxHQUFXLFNBQUE7QUFDVCxRQUFBO0lBQUEsT0FBQSxHQUFVLFVBQUEsR0FBYSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsTUFBaEI7V0FDdkIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLENBQXNCO01BQUUsSUFBQSxFQUFPLE9BQVQ7S0FBdEIsRUFBMEMsSUFBMUMsRUFBZ0QsSUFBaEQsRUFBc0QsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLFVBQUQ7ZUFDcEQsS0FBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQW9CLEtBQXBCLEVBQTJCLFVBQTNCO01BRG9EO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0RDtFQUZTOztzQ0FLWCxVQUFBLEdBQVksU0FBQTtJQUNWLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHFCQUFWLENBQWdDLENBQUMsV0FBakMsQ0FBNkMsU0FBN0MsQ0FBdUQsQ0FBQyxXQUF4RCxDQUFvRSxVQUFwRTtXQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBa0IsQ0FBQyxVQUFuQixDQUE4QixHQUE5QjtFQUZVOztzQ0FJWixZQUFBLEdBQWMsU0FBQTtJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBQTRCLENBQUMsVUFBN0IsQ0FBd0MsR0FBeEM7V0FBOEM7RUFBakQ7O3NDQUdkLFNBQUEsR0FBUSxTQUFBO1dBRU4sSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUE7RUFGTTs7c0NBS1IsTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsWUFBQSxHQUFrQjtJQUNsQixVQUFBLEdBQWtCLHVCQUFBLEdBQXdCLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBcEMsR0FBdUM7SUFDekQsZUFBQSxHQUFrQjtJQUNsQixZQUFBLEdBQWtCO0lBQ2xCLGFBQUEsR0FBa0I7SUFDbEIsV0FBQSxHQUFrQix3REFBQSxHQUF3RCxDQUFDLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBRSxDQUFDLE1BQWYsQ0FBc0IsQ0FBQyxDQUF2QixFQUF5QixDQUF6QixDQUFELENBQXhELEdBQXFGO0lBRXZHLElBQUEsR0FBTyw0QkFBQSxHQUE0QixDQUFDLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixNQUFuQixDQUFELENBQTVCLEdBQXdEO0lBQy9ELElBTUssU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFmLENBQUEsQ0FOTDtNQUFBLElBQUEsR0FDSSxVQUFELEdBQVksR0FBWixHQUNDLGVBREQsR0FDaUIsR0FEakIsR0FFQyxZQUZELEdBRWMsR0FGZCxHQUdDLFdBSEQsR0FHYSxHQUhiLEdBSUMsY0FMSjs7SUFRQSxJQUdLLENBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFmLENBQUEsQ0FIVDtNQUFBLElBQUEsR0FDSSxVQUFELEdBQVksR0FBWixHQUNDLFlBRko7O0lBS0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsUUFBQSxHQUVKLFlBRkksR0FFUyxHQUZULEdBR0osSUFISSxHQUdDLGdEQUhELEdBT0YsSUFQRSxHQU9HLGdCQVBiO1dBWUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBbENNOzs7O0dBcEM4QixRQUFRLENBQUMiLCJmaWxlIjoibGVzc29uUGxhbi9MZXNzb25QbGFuTGlzdEVsZW1lbnRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTGVzc29uUGxhbkxpc3RFbGVtZW50VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIkxlc3NvblBsYW5MaXN0RWxlbWVudFZpZXdcIlxuICB0YWdOYW1lOiBcImxpXCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC50b2dnbGVfbWVudScgOiAndG9nZ2xlTWVudSdcbiAgICAnY2xpY2sgLmR1cGxpY2F0ZScgICA6ICdkdXBsaWNhdGUnXG4gICAgJ2NsaWNrIC5kZWxldGUnICAgICAgICAgOiAnZGVsZXRlVG9nZ2xlJ1xuICAgICdjbGljayAuZGVsZXRlX2NhbmNlbCcgIDogJ2RlbGV0ZVRvZ2dsZSdcbiAgICAnY2xpY2sgLmRlbGV0ZV9jb25maXJtJyA6ICdkZWxldGUnXG5cblxuXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQGxlc3NvblBsYW4gPSBvcHRpb25zLmxlc3NvblBsYW5cbiAgICBAc3VidGVzdHMgPSBvcHRpb25zLnN1YnRlc3RzXG5cbiAgZHVwbGljYXRlOiAtPlxuICAgIG5ld05hbWUgPSBcIkNvcHkgb2YgXCIgKyBAbGVzc29uUGxhbi5nZXQoXCJuYW1lXCIpXG4gICAgQGxlc3NvblBsYW4uZHVwbGljYXRlIHsgbmFtZSA6IG5ld05hbWUgfSwgbnVsbCwgbnVsbCwgKGxlc3NvblBsYW4pID0+XG4gICAgICBAbGVzc29uUGxhbi50cmlnZ2VyIFwibmV3XCIsIGxlc3NvblBsYW5cblxuICB0b2dnbGVNZW51OiAtPlxuICAgIEAkZWwuZmluZChcIi5zcF9kb3duLCAuc3BfcmlnaHRcIikudG9nZ2xlQ2xhc3MoJ3NwX2Rvd24nKS50b2dnbGVDbGFzcygnc3BfcmlnaHQnKVxuICAgIEAkZWwuZmluZChcIi5tZW51XCIpLmZhZGVUb2dnbGUoMTUwKVxuXG4gIGRlbGV0ZVRvZ2dsZTogLT4gQCRlbC5maW5kKFwiLmRlbGV0ZV9jb25maXJtXCIpLmZhZGVUb2dnbGUoMjUwKTsgZmFsc2VcblxuICAjIGRlZXAgbm9uLWdlcm5lcmljIGRlbGV0ZVxuICBkZWxldGU6ID0+XG4gICAgIyByZW1vdmUgZnJvbSBjb2xsZWN0aW9uXG4gICAgQGxlc3NvblBsYW4uZGVzdHJveSgpXG5cblxuICByZW5kZXI6IC0+XG4gICAgdG9nZ2xlQnV0dG9uICAgID0gXCI8ZGl2IGNsYXNzPSd0b2dnbGVfbWVudSBzcF9yaWdodCc+PGRpdj4gPC9kaXY+PC9kaXY+XCJcbiAgICBlZGl0QnV0dG9uICAgICAgPSBcIjxhIGhyZWY9JyNsZXNzb25QbGFuLyN7QGxlc3NvblBsYW4uaWR9Jz48aW1nIGNsYXNzPSdsaW5rX2ljb24gZWRpdCcgdGl0bGU9J0VkaXQnIHNyYz0naW1hZ2VzL2ljb25fZWRpdC5wbmcnPjwvYT5cIlxuICAgIGR1cGxpY2F0ZUJ1dHRvbiA9IFwiPGltZyBjbGFzcz0nbGlua19pY29uIGR1cGxpY2F0ZScgdGl0bGU9J0R1cGxpY2F0ZScgc3JjPSdpbWFnZXMvaWNvbl9kdXBsaWNhdGUucG5nJz5cIlxuICAgIGRlbGV0ZUJ1dHRvbiAgICA9IFwiPGltZyBjbGFzcz0nZGVsZXRlIGxpbmtfaWNvbicgdGl0bGU9J0RlbGV0ZScgc3JjPSdpbWFnZXMvaWNvbl9kZWxldGUucG5nJz5cIlxuICAgIGRlbGV0ZUNvbmZpcm0gICA9IFwiPHNwYW4gY2xhc3M9J2RlbGV0ZV9jb25maXJtJz48ZGl2IGNsYXNzPSdtZW51X2JveCc+Q29uZmlybSA8YnV0dG9uIGNsYXNzPSdkZWxldGVfeWVzIGNvbW1hbmRfcmVkJz5EZWxldGU8L2J1dHRvbj4gPGJ1dHRvbiBjbGFzcz0nZGVsZXRlX2NhbmNlbCBjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj48L2Rpdj48L3NwYW4+XCJcbiAgICBkb3dubG9hZEtleSAgICAgPSBcIjxzcGFuIGNsYXNzPSdkb3dubG9hZF9rZXkgc21hbGxfZ3JleSc+RG93bmxvYWQga2V5IDxiPiN7QGxlc3NvblBsYW4uaWQuc3Vic3RyKC01LDUpfTwvYj48L3NwYW4+XCJcblxuICAgIG5hbWUgPSBcIjxzcGFuIGNsYXNzPSd0b2dnbGVfbWVudSc+I3tAbGVzc29uUGxhbi5lc2NhcGUoJ25hbWUnKX08L3NwYW4+XCJcbiAgICBtZW51ID0gXCJcbiAgICAgICN7ZWRpdEJ1dHRvbn1cbiAgICAgICN7ZHVwbGljYXRlQnV0dG9ufVxuICAgICAgI3tkZWxldGVCdXR0b259XG4gICAgICAje2Rvd25sb2FkS2V5fVxuICAgICAgI3tkZWxldGVDb25maXJtfVxuICAgIFwiIGlmIFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuXG4gICAgbWVudSA9IFwiXG4gICAgICAje2VkaXRCdXR0b259XG4gICAgICAje2Rvd25sb2FkS2V5fVxuICAgIFwiIGlmIG5vdCBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGRpdj5cbiAgICAgICAgI3t0b2dnbGVCdXR0b259XG4gICAgICAgICN7bmFtZX1cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nY29uZmlybWF0aW9uIG1lbnUnPlxuICAgICAgICAgICN7bWVudX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgIFwiXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiIl19
