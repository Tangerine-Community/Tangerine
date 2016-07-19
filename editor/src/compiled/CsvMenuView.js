var CsvMenuView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CsvMenuView = (function(superClass) {
  extend(CsvMenuView, superClass);

  function CsvMenuView() {
    return CsvMenuView.__super__.constructor.apply(this, arguments);
  }

  CsvMenuView.prototype.className = "CsvMenuView";

  CsvMenuView.prototype.initialize = function(options) {
    var groupName, klassId;
    klassId = options.parent.options.klass.id;
    groupName = Tangerine.settings.get("groupName");
    return document.location = "http://databases.tangerinecentral.org/_csv/class/" + groupName + "/" + klassId;
  };

  return CsvMenuView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcG9ydC9Dc3ZNZW51Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxXQUFBO0VBQUE7OztBQUFNOzs7Ozs7O3dCQUVKLFNBQUEsR0FBWTs7d0JBRVosVUFBQSxHQUFZLFNBQUMsT0FBRDtBQUNWLFFBQUE7SUFBQSxPQUFBLEdBQVksT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ3pDLFNBQUEsR0FBWSxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQW5CLENBQXVCLFdBQXZCO1dBQ1osUUFBUSxDQUFDLFFBQVQsR0FBb0IsbURBQUEsR0FBb0QsU0FBcEQsR0FBOEQsR0FBOUQsR0FBaUU7RUFIM0U7Ozs7R0FKWSxRQUFRLENBQUMiLCJmaWxlIjoicmVwb3J0L0Nzdk1lbnVWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQ3N2TWVudVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJDc3ZNZW51Vmlld1wiXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAga2xhc3NJZCAgID0gb3B0aW9ucy5wYXJlbnQub3B0aW9ucy5rbGFzcy5pZFxuICAgIGdyb3VwTmFtZSA9IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJncm91cE5hbWVcIilcbiAgICBkb2N1bWVudC5sb2NhdGlvbiA9IFwiaHR0cDovL2RhdGFiYXNlcy50YW5nZXJpbmVjZW50cmFsLm9yZy9fY3N2L2NsYXNzLyN7Z3JvdXBOYW1lfS8je2tsYXNzSWR9XCJcbiJdfQ==
