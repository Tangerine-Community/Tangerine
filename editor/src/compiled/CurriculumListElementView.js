var CurriculumListElementView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CurriculumListElementView = (function(superClass) {
  extend(CurriculumListElementView, superClass);

  function CurriculumListElementView() {
    this["delete"] = bind(this["delete"], this);
    return CurriculumListElementView.__super__.constructor.apply(this, arguments);
  }

  CurriculumListElementView.prototype.className = "CurriculumListElementView";

  CurriculumListElementView.prototype.tagName = "li";

  CurriculumListElementView.prototype.events = {
    'click .toggle_menu': 'toggleMenu',
    'click .duplicate': 'duplicate',
    'click .delete': 'deleteToggle',
    'click .delete_cancel': 'deleteToggle',
    'click .delete_confirm': 'delete'
  };

  CurriculumListElementView.prototype.initialize = function(options) {
    this.curriculum = options.curriculum;
    return this.subtests = options.subtests;
  };

  CurriculumListElementView.prototype.duplicate = function() {
    var newName;
    newName = "Copy of " + this.curriculum.get("name");
    return this.curriculum.duplicate({
      name: newName
    }, null, null, (function(_this) {
      return function(curriculum) {
        return _this.curriculum.trigger("new", curriculum);
      };
    })(this));
  };

  CurriculumListElementView.prototype.toggleMenu = function() {
    this.$el.find(".sp_down, .sp_right").toggleClass('sp_down').toggleClass('sp_right');
    return this.$el.find(".menu").fadeToggle(150);
  };

  CurriculumListElementView.prototype.deleteToggle = function() {
    this.$el.find(".delete_confirm").fadeToggle(250);
    return false;
  };

  CurriculumListElementView.prototype["delete"] = function() {
    return this.curriculum.destroy();
  };

  CurriculumListElementView.prototype.render = function() {
    var deleteButton, deleteConfirm, downloadKey, duplicateButton, editButton, menu, name, toggleButton;
    toggleButton = "<div class='toggle_menu sp_right'><div> </div></div>";
    editButton = "<a href='#curriculum/" + this.curriculum.id + "'><img class='link_icon edit' title='Edit' src='images/icon_edit.png'></a>";
    duplicateButton = "<img class='link_icon duplicate' title='Duplicate' src='images/icon_duplicate.png'>";
    deleteButton = "<img class='delete link_icon' title='Delete' src='images/icon_delete.png'>";
    deleteConfirm = "<span class='delete_confirm'><div class='menu_box'>Confirm <button class='delete_yes command_red'>Delete</button> <button class='delete_cancel command'>Cancel</button></div></span>";
    downloadKey = "<span class='download_key small_grey'>Download key <b>" + (this.curriculum.id.substr(-5, 5)) + "</b></span>";
    name = "<span class='toggle_menu'>" + (this.curriculum.escape('name')) + "</span>";
    if (Tangerine.user.isAdmin()) {
      menu = editButton + " " + duplicateButton + " " + deleteButton + " " + downloadKey + " " + deleteConfirm;
    }
    if (!Tangerine.user.isAdmin()) {
      menu = editButton + " " + downloadKey;
    }
    this.$el.html("<div> " + toggleButton + " " + name + " </div> <div> <div class='confirmation menu'> " + menu + " </div> </div>");
    return this.trigger("rendered");
  };

  return CurriculumListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImN1cnJpY3VsdW0vQ3VycmljdWx1bUxpc3RFbGVtZW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSx5QkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7O3NDQUVKLFNBQUEsR0FBWTs7c0NBQ1osT0FBQSxHQUFTOztzQ0FFVCxNQUFBLEdBQ0U7SUFBQSxvQkFBQSxFQUF1QixZQUF2QjtJQUNBLGtCQUFBLEVBQXVCLFdBRHZCO0lBRUEsZUFBQSxFQUEwQixjQUYxQjtJQUdBLHNCQUFBLEVBQTBCLGNBSDFCO0lBSUEsdUJBQUEsRUFBMEIsUUFKMUI7OztzQ0FTRixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLFVBQUQsR0FBYyxPQUFPLENBQUM7V0FDdEIsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFPLENBQUM7RUFGVjs7c0NBSVosU0FBQSxHQUFXLFNBQUE7QUFDVCxRQUFBO0lBQUEsT0FBQSxHQUFVLFVBQUEsR0FBYSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsTUFBaEI7V0FDdkIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLENBQXNCO01BQUUsSUFBQSxFQUFPLE9BQVQ7S0FBdEIsRUFBMEMsSUFBMUMsRUFBZ0QsSUFBaEQsRUFBc0QsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFDLFVBQUQ7ZUFDcEQsS0FBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQW9CLEtBQXBCLEVBQTJCLFVBQTNCO01BRG9EO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0RDtFQUZTOztzQ0FLWCxVQUFBLEdBQVksU0FBQTtJQUNWLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHFCQUFWLENBQWdDLENBQUMsV0FBakMsQ0FBNkMsU0FBN0MsQ0FBdUQsQ0FBQyxXQUF4RCxDQUFvRSxVQUFwRTtXQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBa0IsQ0FBQyxVQUFuQixDQUE4QixHQUE5QjtFQUZVOztzQ0FJWixZQUFBLEdBQWMsU0FBQTtJQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBQTRCLENBQUMsVUFBN0IsQ0FBd0MsR0FBeEM7V0FBOEM7RUFBakQ7O3NDQUdkLFNBQUEsR0FBUSxTQUFBO1dBRU4sSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUE7RUFGTTs7c0NBS1IsTUFBQSxHQUFRLFNBQUE7QUFDTixRQUFBO0lBQUEsWUFBQSxHQUFrQjtJQUNsQixVQUFBLEdBQWtCLHVCQUFBLEdBQXdCLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBcEMsR0FBdUM7SUFDekQsZUFBQSxHQUFrQjtJQUNsQixZQUFBLEdBQWtCO0lBQ2xCLGFBQUEsR0FBa0I7SUFDbEIsV0FBQSxHQUFrQix3REFBQSxHQUF3RCxDQUFDLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBRSxDQUFDLE1BQWYsQ0FBc0IsQ0FBQyxDQUF2QixFQUF5QixDQUF6QixDQUFELENBQXhELEdBQXFGO0lBRXZHLElBQUEsR0FBTyw0QkFBQSxHQUE0QixDQUFDLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixNQUFuQixDQUFELENBQTVCLEdBQXdEO0lBQy9ELElBTUssU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFmLENBQUEsQ0FOTDtNQUFBLElBQUEsR0FDSSxVQUFELEdBQVksR0FBWixHQUNDLGVBREQsR0FDaUIsR0FEakIsR0FFQyxZQUZELEdBRWMsR0FGZCxHQUdDLFdBSEQsR0FHYSxHQUhiLEdBSUMsY0FMSjs7SUFRQSxJQUdLLENBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFmLENBQUEsQ0FIVDtNQUFBLElBQUEsR0FDSSxVQUFELEdBQVksR0FBWixHQUNDLFlBRko7O0lBS0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsUUFBQSxHQUVKLFlBRkksR0FFUyxHQUZULEdBR0osSUFISSxHQUdDLGdEQUhELEdBT0YsSUFQRSxHQU9HLGdCQVBiO1dBWUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBbENNOzs7O0dBcEM4QixRQUFRLENBQUMiLCJmaWxlIjoiY3VycmljdWx1bS9DdXJyaWN1bHVtTGlzdEVsZW1lbnRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQ3VycmljdWx1bUxpc3RFbGVtZW50VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIkN1cnJpY3VsdW1MaXN0RWxlbWVudFZpZXdcIlxuICB0YWdOYW1lOiBcImxpXCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC50b2dnbGVfbWVudScgOiAndG9nZ2xlTWVudSdcbiAgICAnY2xpY2sgLmR1cGxpY2F0ZScgICA6ICdkdXBsaWNhdGUnXG4gICAgJ2NsaWNrIC5kZWxldGUnICAgICAgICAgOiAnZGVsZXRlVG9nZ2xlJ1xuICAgICdjbGljayAuZGVsZXRlX2NhbmNlbCcgIDogJ2RlbGV0ZVRvZ2dsZSdcbiAgICAnY2xpY2sgLmRlbGV0ZV9jb25maXJtJyA6ICdkZWxldGUnXG5cblxuXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQGN1cnJpY3VsdW0gPSBvcHRpb25zLmN1cnJpY3VsdW1cbiAgICBAc3VidGVzdHMgPSBvcHRpb25zLnN1YnRlc3RzXG5cbiAgZHVwbGljYXRlOiAtPlxuICAgIG5ld05hbWUgPSBcIkNvcHkgb2YgXCIgKyBAY3VycmljdWx1bS5nZXQoXCJuYW1lXCIpXG4gICAgQGN1cnJpY3VsdW0uZHVwbGljYXRlIHsgbmFtZSA6IG5ld05hbWUgfSwgbnVsbCwgbnVsbCwgKGN1cnJpY3VsdW0pID0+IFxuICAgICAgQGN1cnJpY3VsdW0udHJpZ2dlciBcIm5ld1wiLCBjdXJyaWN1bHVtXG5cbiAgdG9nZ2xlTWVudTogLT5cbiAgICBAJGVsLmZpbmQoXCIuc3BfZG93biwgLnNwX3JpZ2h0XCIpLnRvZ2dsZUNsYXNzKCdzcF9kb3duJykudG9nZ2xlQ2xhc3MoJ3NwX3JpZ2h0JylcbiAgICBAJGVsLmZpbmQoXCIubWVudVwiKS5mYWRlVG9nZ2xlKDE1MClcblxuICBkZWxldGVUb2dnbGU6IC0+IEAkZWwuZmluZChcIi5kZWxldGVfY29uZmlybVwiKS5mYWRlVG9nZ2xlKDI1MCk7IGZhbHNlXG5cbiAgIyBkZWVwIG5vbi1nZXJuZXJpYyBkZWxldGVcbiAgZGVsZXRlOiA9PlxuICAgICMgcmVtb3ZlIGZyb20gY29sbGVjdGlvblxuICAgIEBjdXJyaWN1bHVtLmRlc3Ryb3koKVxuXG5cbiAgcmVuZGVyOiAtPlxuICAgIHRvZ2dsZUJ1dHRvbiAgICA9IFwiPGRpdiBjbGFzcz0ndG9nZ2xlX21lbnUgc3BfcmlnaHQnPjxkaXY+IDwvZGl2PjwvZGl2PlwiXG4gICAgZWRpdEJ1dHRvbiAgICAgID0gXCI8YSBocmVmPScjY3VycmljdWx1bS8je0BjdXJyaWN1bHVtLmlkfSc+PGltZyBjbGFzcz0nbGlua19pY29uIGVkaXQnIHRpdGxlPSdFZGl0JyBzcmM9J2ltYWdlcy9pY29uX2VkaXQucG5nJz48L2E+XCJcbiAgICBkdXBsaWNhdGVCdXR0b24gPSBcIjxpbWcgY2xhc3M9J2xpbmtfaWNvbiBkdXBsaWNhdGUnIHRpdGxlPSdEdXBsaWNhdGUnIHNyYz0naW1hZ2VzL2ljb25fZHVwbGljYXRlLnBuZyc+XCJcbiAgICBkZWxldGVCdXR0b24gICAgPSBcIjxpbWcgY2xhc3M9J2RlbGV0ZSBsaW5rX2ljb24nIHRpdGxlPSdEZWxldGUnIHNyYz0naW1hZ2VzL2ljb25fZGVsZXRlLnBuZyc+XCJcbiAgICBkZWxldGVDb25maXJtICAgPSBcIjxzcGFuIGNsYXNzPSdkZWxldGVfY29uZmlybSc+PGRpdiBjbGFzcz0nbWVudV9ib3gnPkNvbmZpcm0gPGJ1dHRvbiBjbGFzcz0nZGVsZXRlX3llcyBjb21tYW5kX3JlZCc+RGVsZXRlPC9idXR0b24+IDxidXR0b24gY2xhc3M9J2RlbGV0ZV9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+PC9kaXY+PC9zcGFuPlwiXG4gICAgZG93bmxvYWRLZXkgICAgID0gXCI8c3BhbiBjbGFzcz0nZG93bmxvYWRfa2V5IHNtYWxsX2dyZXknPkRvd25sb2FkIGtleSA8Yj4je0BjdXJyaWN1bHVtLmlkLnN1YnN0cigtNSw1KX08L2I+PC9zcGFuPlwiXG5cbiAgICBuYW1lID0gXCI8c3BhbiBjbGFzcz0ndG9nZ2xlX21lbnUnPiN7QGN1cnJpY3VsdW0uZXNjYXBlKCduYW1lJyl9PC9zcGFuPlwiXG4gICAgbWVudSA9IFwiXG4gICAgICAje2VkaXRCdXR0b259XG4gICAgICAje2R1cGxpY2F0ZUJ1dHRvbn1cbiAgICAgICN7ZGVsZXRlQnV0dG9ufVxuICAgICAgI3tkb3dubG9hZEtleX1cbiAgICAgICN7ZGVsZXRlQ29uZmlybX1cbiAgICBcIiBpZiBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcblxuICAgIG1lbnUgPSBcIlxuICAgICAgI3tlZGl0QnV0dG9ufVxuICAgICAgI3tkb3dubG9hZEtleX1cbiAgICBcIiBpZiBub3QgVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxkaXY+XG4gICAgICAgICN7dG9nZ2xlQnV0dG9ufVxuICAgICAgICAje25hbWV9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2NvbmZpcm1hdGlvbiBtZW51Jz5cbiAgICAgICAgICAje21lbnV9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICBcIlxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIiJdfQ==
