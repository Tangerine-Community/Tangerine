var GroupsView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

GroupsView = (function(superClass) {
  extend(GroupsView, superClass);

  function GroupsView() {
    return GroupsView.__super__.constructor.apply(this, arguments);
  }

  GroupsView.prototype.className = "GroupsView";

  GroupsView.prototype.events = {
    'click .account': 'gotoAccount',
    'click .goto': 'gotoGroup'
  };

  GroupsView.prototype.initialize = function() {
    return Robbert.fetchUsers;
  };

  GroupsView.prototype.gotoAccount = function() {
    return Tangerine.router.navigate("account", true);
  };

  GroupsView.prototype.gotoGroup = function(event) {
    var group;
    group = $(event.target).attr("data-group");
    return window.location = Tangerine.settings.urlIndex(group, "assessments");
  };

  GroupsView.prototype.renderGroups = function() {
    return this.$el.find('#group-list-container').html("<h2>Admin</h2> " + (Tangerine.user.groups().admin.map(function(group) {
      return "<button class='command goto' data-group='" + (_.escape(group)) + "'>" + group + "</button>";
    }).join('')) + " <h2>Member</h2> " + (Tangerine.user.groups().member.map(function(group) {
      return "<button class='command goto' data-group='" + (_.escape(group)) + "'>" + group + "</button>";
    }).join('')));
  };

  GroupsView.prototype.render = function() {
    this.$el.html("<button class='account navigation'>Account</button> <h1>Groups</h1> <div id='group-adder'></div> <div id='group-list-container'><img src='images/loading.gif' class='loading'></div>");
    this.renderGroups();
    return this.trigger("rendered");
  };

  return GroupsView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVzZXIvR3JvdXBzVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxVQUFBO0VBQUE7OztBQUFNOzs7Ozs7O3VCQUVKLFNBQUEsR0FBVzs7dUJBRVgsTUFBQSxHQUNFO0lBQUEsZ0JBQUEsRUFBbUIsYUFBbkI7SUFDQSxhQUFBLEVBQW1CLFdBRG5COzs7dUJBR0YsVUFBQSxHQUFZLFNBQUE7V0FDVixPQUFPLENBQUM7RUFERTs7dUJBR1osV0FBQSxHQUFhLFNBQUE7V0FDWCxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFNBQTFCLEVBQXFDLElBQXJDO0VBRFc7O3VCQUdiLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVCxRQUFBO0lBQUEsS0FBQSxHQUFRLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUixDQUFlLENBQUMsSUFBaEIsQ0FBcUIsWUFBckI7V0FDUixNQUFNLENBQUMsUUFBUCxHQUFrQixTQUFTLENBQUMsUUFBUSxDQUFDLFFBQW5CLENBQTRCLEtBQTVCLEVBQW1DLGFBQW5DO0VBRlQ7O3VCQUlYLFlBQUEsR0FBYyxTQUFBO1dBQ1osSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsdUJBQVYsQ0FBa0MsQ0FBQyxJQUFuQyxDQUF3QyxpQkFBQSxHQUVuQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUFBLENBQXVCLENBQUMsS0FBSyxDQUFDLEdBQTlCLENBQW1DLFNBQUMsS0FBRDthQUFXLDJDQUFBLEdBQTJDLENBQUMsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxLQUFULENBQUQsQ0FBM0MsR0FBNEQsSUFBNUQsR0FBZ0UsS0FBaEUsR0FBc0U7SUFBakYsQ0FBbkMsQ0FBK0gsQ0FBQyxJQUFoSSxDQUFxSSxFQUFySSxDQUFELENBRm1DLEdBRXVHLG1CQUZ2RyxHQUluQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUFBLENBQXVCLENBQUMsTUFBTSxDQUFDLEdBQS9CLENBQW9DLFNBQUMsS0FBRDthQUFXLDJDQUFBLEdBQTJDLENBQUMsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxLQUFULENBQUQsQ0FBM0MsR0FBNEQsSUFBNUQsR0FBZ0UsS0FBaEUsR0FBc0U7SUFBakYsQ0FBcEMsQ0FBZ0ksQ0FBQyxJQUFqSSxDQUFzSSxFQUF0SSxDQUFELENBSkw7RUFEWTs7dUJBUWQsTUFBQSxHQUFRLFNBQUE7SUFDTixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxzTEFBVjtJQU9BLElBQUMsQ0FBQSxZQUFELENBQUE7V0FDQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFUTTs7OztHQTFCZSxRQUFRLENBQUMiLCJmaWxlIjoidXNlci9Hcm91cHNWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgR3JvdXBzVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiR3JvdXBzVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAuYWNjb3VudCcgOiAnZ290b0FjY291bnQnXG4gICAgJ2NsaWNrIC5nb3RvJyAgICA6ICdnb3RvR3JvdXAnXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBSb2JiZXJ0LmZldGNoVXNlcnNcblxuICBnb3RvQWNjb3VudDogLT5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiYWNjb3VudFwiLCB0cnVlXG5cbiAgZ290b0dyb3VwOiAoZXZlbnQpIC0+XG4gICAgZ3JvdXAgPSAkKGV2ZW50LnRhcmdldCkuYXR0cihcImRhdGEtZ3JvdXBcIilcbiAgICB3aW5kb3cubG9jYXRpb24gPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsSW5kZXgoZ3JvdXAsIFwiYXNzZXNzbWVudHNcIilcblxuICByZW5kZXJHcm91cHM6IC0+XG4gICAgQCRlbC5maW5kKCcjZ3JvdXAtbGlzdC1jb250YWluZXInKS5odG1sIFwiXG4gICAgICA8aDI+QWRtaW48L2gyPlxuICAgICAgICAje1RhbmdlcmluZS51c2VyLmdyb3VwcygpLmFkbWluLm1hcCggKGdyb3VwKSAtPiBcIjxidXR0b24gY2xhc3M9J2NvbW1hbmQgZ290bycgZGF0YS1ncm91cD0nI3tfLmVzY2FwZShncm91cCl9Jz4je2dyb3VwfTwvYnV0dG9uPlwiKS5qb2luKCcnKX1cbiAgICAgIDxoMj5NZW1iZXI8L2gyPlxuICAgICAgICAje1RhbmdlcmluZS51c2VyLmdyb3VwcygpLm1lbWJlci5tYXAoIChncm91cCkgLT4gXCI8YnV0dG9uIGNsYXNzPSdjb21tYW5kIGdvdG8nIGRhdGEtZ3JvdXA9JyN7Xy5lc2NhcGUoZ3JvdXApfSc+I3tncm91cH08L2J1dHRvbj5cIikuam9pbignJyl9XG4gICAgXCJcblxuICByZW5kZXI6IC0+XG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8YnV0dG9uIGNsYXNzPSdhY2NvdW50IG5hdmlnYXRpb24nPkFjY291bnQ8L2J1dHRvbj5cbiAgICAgIDxoMT5Hcm91cHM8L2gxPlxuICAgICAgPGRpdiBpZD0nZ3JvdXAtYWRkZXInPjwvZGl2PlxuICAgICAgPGRpdiBpZD0nZ3JvdXAtbGlzdC1jb250YWluZXInPjxpbWcgc3JjPSdpbWFnZXMvbG9hZGluZy5naWYnIGNsYXNzPSdsb2FkaW5nJz48L2Rpdj5cbiAgICBcIlxuXG4gICAgQHJlbmRlckdyb3VwcygpXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4iXX0=
