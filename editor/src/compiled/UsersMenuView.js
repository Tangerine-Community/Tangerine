var UsersMenuView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

UsersMenuView = (function(superClass) {
  extend(UsersMenuView, superClass);

  function UsersMenuView() {
    this.refreshUsers = bind(this.refreshUsers, this);
    return UsersMenuView.__super__.constructor.apply(this, arguments);
  }

  UsersMenuView.prototype.className = "UsersMenuView";

  UsersMenuView.prototype.events = {
    "click .admin": "selectAdmin",
    "click .reader": "selectReader",
    "click #add-admin": "addAdmin",
    "click #remove-admin": "removeAdmin",
    "click #add-member": "addMember",
    "click #remove-member": "removeMember"
  };

  UsersMenuView.prototype.selectAdmin = function(event) {
    return this.$el.find("#selected-admin").val($(event.target).attr("data-name"));
  };

  UsersMenuView.prototype.selectReader = function(event) {
    return this.$el.find("#selected-member").val($(event.target).attr("data-name"));
  };

  UsersMenuView.prototype.addAdmin = function() {
    var user;
    user = this.$el.find('#selected-admin').val();
    return Robbert.addAdmin(user, this.refreshUsers);
  };

  UsersMenuView.prototype.removeAdmin = function() {
    var user;
    user = this.$el.find('#selected-admin').val();
    return Robbert.removeAdmin(user, this.refreshUsers);
  };

  UsersMenuView.prototype.addMember = function() {
    var user;
    user = this.$el.find('#selected-member').val();
    return Robbert.addMember(user, this.refreshUsers);
  };

  UsersMenuView.prototype.removeMember = function() {
    var user;
    user = this.$el.find('#selected-member').val();
    return Robbert.removeMember(user, this.refreshUsers);
  };

  UsersMenuView.prototype.refreshUsers = function() {
    return Robbert.fetchUsers(Tangerine.settings.get('groupName'), (function(_this) {
      return function(users) {
        return _this.renderUsers(users);
      };
    })(this));
  };

  UsersMenuView.prototype.renderUsers = function(users) {
    var adminHtml, memberHtml;
    adminHtml = users.admin.map(function(admin) {
      return "<li data-name='" + (_.escape(admin)) + "' class='admin icon'>" + (_.escape(admin)) + "</li>";
    }).join('');
    if (users.member.length === 0) {
      memberHtml = "<span class='grey'>No members yet.</span>";
    } else {
      memberHtml = users.member.map(function(member) {
        return "<li data-name='" + (_.escape(member)) + "' class='member icon'>" + (_.escape(member)) + "</li>";
      }).join('');
    }
    return this.$el.find('#users-row').html("<td><ul id='admin-container' multiple='multiple' size='5'>" + adminHtml + "</ul></td> <td><ul id='member-container' multiple='multiple' size='5'>" + memberHtml + "</ul></td>");
  };

  UsersMenuView.prototype.render = function() {
    this.$el.html("<h1>Users</h1> <table> <tr> <th>Admins</th> <th>Members</th> </tr> <tr> <td> <input id='selected-admin'  value=''> <button id='add-admin' class='command'>+</button> <button id='remove-admin' class='command'>-</button> </td> <td> <input id='selected-member' value=''> <button id='add-member' class='command'>+</button> <button id='remove-member' class='command'>-</button> </td> </tr> <tr id='users-row'> </tr>");
    return this.refreshUsers();
  };

  return UsersMenuView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInVzZXIvVXNlcnNNZW51Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxhQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7MEJBRUosU0FBQSxHQUFXOzswQkFFWCxNQUFBLEdBQ0U7SUFBQSxjQUFBLEVBQWlCLGFBQWpCO0lBQ0EsZUFBQSxFQUFrQixjQURsQjtJQUVBLGtCQUFBLEVBQXlCLFVBRnpCO0lBR0EscUJBQUEsRUFBeUIsYUFIekI7SUFJQSxtQkFBQSxFQUF5QixXQUp6QjtJQUtBLHNCQUFBLEVBQXlCLGNBTHpCOzs7MEJBT0YsV0FBQSxHQUFhLFNBQUUsS0FBRjtXQUNYLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBQTRCLENBQUMsR0FBN0IsQ0FBaUMsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxJQUFoQixDQUFxQixXQUFyQixDQUFqQztFQURXOzswQkFHYixZQUFBLEdBQWMsU0FBRSxLQUFGO1dBQ1osSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsa0JBQVYsQ0FBNkIsQ0FBQyxHQUE5QixDQUFrQyxDQUFBLENBQUUsS0FBSyxDQUFDLE1BQVIsQ0FBZSxDQUFDLElBQWhCLENBQXFCLFdBQXJCLENBQWxDO0VBRFk7OzBCQUdkLFFBQUEsR0FBVSxTQUFBO0FBQ1IsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxpQkFBVixDQUE0QixDQUFDLEdBQTdCLENBQUE7V0FDUCxPQUFPLENBQUMsUUFBUixDQUFpQixJQUFqQixFQUF1QixJQUFDLENBQUEsWUFBeEI7RUFGUTs7MEJBSVYsV0FBQSxHQUFhLFNBQUE7QUFDWCxRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlCQUFWLENBQTRCLENBQUMsR0FBN0IsQ0FBQTtXQUNQLE9BQU8sQ0FBQyxXQUFSLENBQW9CLElBQXBCLEVBQTBCLElBQUMsQ0FBQSxZQUEzQjtFQUZXOzswQkFJYixTQUFBLEdBQVcsU0FBQTtBQUNULFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsa0JBQVYsQ0FBNkIsQ0FBQyxHQUE5QixDQUFBO1dBQ1AsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsSUFBbEIsRUFBd0IsSUFBQyxDQUFBLFlBQXpCO0VBRlM7OzBCQUlYLFlBQUEsR0FBYyxTQUFBO0FBQ1osUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxrQkFBVixDQUE2QixDQUFDLEdBQTlCLENBQUE7V0FDUCxPQUFPLENBQUMsWUFBUixDQUFxQixJQUFyQixFQUEyQixJQUFDLENBQUEsWUFBNUI7RUFGWTs7MEJBSWQsWUFBQSxHQUFjLFNBQUE7V0FDWixPQUFPLENBQUMsVUFBUixDQUFtQixTQUFTLENBQUMsUUFBUSxDQUFDLEdBQW5CLENBQXVCLFdBQXZCLENBQW5CLEVBQXdELENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxLQUFEO2VBQVcsS0FBQyxDQUFBLFdBQUQsQ0FBYSxLQUFiO01BQVg7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhEO0VBRFk7OzBCQUdkLFdBQUEsR0FBYSxTQUFDLEtBQUQ7QUFFWCxRQUFBO0lBQUEsU0FBQSxHQUFZLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBWixDQUFpQixTQUFDLEtBQUQ7YUFDM0IsaUJBQUEsR0FBaUIsQ0FBQyxDQUFDLENBQUMsTUFBRixDQUFTLEtBQVQsQ0FBRCxDQUFqQixHQUFrQyx1QkFBbEMsR0FBd0QsQ0FBQyxDQUFDLENBQUMsTUFBRixDQUFTLEtBQVQsQ0FBRCxDQUF4RCxHQUF5RTtJQUQ5QyxDQUFqQixDQUVYLENBQUMsSUFGVSxDQUVMLEVBRks7SUFHWixJQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBYixLQUF1QixDQUExQjtNQUNFLFVBQUEsR0FBYSw0Q0FEZjtLQUFBLE1BQUE7TUFHRSxVQUFBLEdBQWEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFiLENBQWtCLFNBQUMsTUFBRDtlQUM3QixpQkFBQSxHQUFpQixDQUFDLENBQUMsQ0FBQyxNQUFGLENBQVMsTUFBVCxDQUFELENBQWpCLEdBQW1DLHdCQUFuQyxHQUEwRCxDQUFDLENBQUMsQ0FBQyxNQUFGLENBQVMsTUFBVCxDQUFELENBQTFELEdBQTRFO01BRC9DLENBQWxCLENBRVosQ0FBQyxJQUZXLENBRU4sRUFGTSxFQUhmOztXQU9BLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFlBQVYsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2Qiw0REFBQSxHQUNpQyxTQURqQyxHQUMyQyx3RUFEM0MsR0FFa0MsVUFGbEMsR0FFNkMsWUFGMUU7RUFaVzs7MEJBaUJiLE1BQUEsR0FBUSxTQUFBO0lBRU4sSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsMlpBQVY7V0F1QkEsSUFBQyxDQUFBLFlBQUQsQ0FBQTtFQXpCTTs7OztHQXREa0IsUUFBUSxDQUFDIiwiZmlsZSI6InVzZXIvVXNlcnNNZW51Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFVzZXJzTWVudVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIlVzZXJzTWVudVZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICBcImNsaWNrIC5hZG1pblwiIDogXCJzZWxlY3RBZG1pblwiXG4gICAgXCJjbGljayAucmVhZGVyXCIgOiBcInNlbGVjdFJlYWRlclwiXG4gICAgXCJjbGljayAjYWRkLWFkbWluXCIgICAgIDogXCJhZGRBZG1pblwiXG4gICAgXCJjbGljayAjcmVtb3ZlLWFkbWluXCIgIDogXCJyZW1vdmVBZG1pblwiXG4gICAgXCJjbGljayAjYWRkLW1lbWJlclwiICAgIDogXCJhZGRNZW1iZXJcIlxuICAgIFwiY2xpY2sgI3JlbW92ZS1tZW1iZXJcIiA6IFwicmVtb3ZlTWVtYmVyXCJcblxuICBzZWxlY3RBZG1pbjogKCBldmVudCApIC0+XG4gICAgQCRlbC5maW5kKFwiI3NlbGVjdGVkLWFkbWluXCIpLnZhbCAkKGV2ZW50LnRhcmdldCkuYXR0cihcImRhdGEtbmFtZVwiKVxuXG4gIHNlbGVjdFJlYWRlcjogKCBldmVudCApIC0+XG4gICAgQCRlbC5maW5kKFwiI3NlbGVjdGVkLW1lbWJlclwiKS52YWwgJChldmVudC50YXJnZXQpLmF0dHIoXCJkYXRhLW5hbWVcIilcblxuICBhZGRBZG1pbjogLT5cbiAgICB1c2VyID0gQCRlbC5maW5kKCcjc2VsZWN0ZWQtYWRtaW4nKS52YWwoKVxuICAgIFJvYmJlcnQuYWRkQWRtaW4gdXNlciwgQHJlZnJlc2hVc2Vyc1xuXG4gIHJlbW92ZUFkbWluOiAtPlxuICAgIHVzZXIgPSBAJGVsLmZpbmQoJyNzZWxlY3RlZC1hZG1pbicpLnZhbCgpXG4gICAgUm9iYmVydC5yZW1vdmVBZG1pbiB1c2VyLCBAcmVmcmVzaFVzZXJzXG5cbiAgYWRkTWVtYmVyOiAtPlxuICAgIHVzZXIgPSBAJGVsLmZpbmQoJyNzZWxlY3RlZC1tZW1iZXInKS52YWwoKVxuICAgIFJvYmJlcnQuYWRkTWVtYmVyIHVzZXIsIEByZWZyZXNoVXNlcnNcblxuICByZW1vdmVNZW1iZXI6IC0+XG4gICAgdXNlciA9IEAkZWwuZmluZCgnI3NlbGVjdGVkLW1lbWJlcicpLnZhbCgpXG4gICAgUm9iYmVydC5yZW1vdmVNZW1iZXIgdXNlciwgQHJlZnJlc2hVc2Vyc1xuXG4gIHJlZnJlc2hVc2VyczogPT5cbiAgICBSb2JiZXJ0LmZldGNoVXNlcnMgVGFuZ2VyaW5lLnNldHRpbmdzLmdldCgnZ3JvdXBOYW1lJyksICh1c2VycykgPT4gQHJlbmRlclVzZXJzKHVzZXJzKVxuXG4gIHJlbmRlclVzZXJzOiAodXNlcnMpIC0+XG5cbiAgICBhZG1pbkh0bWwgPSB1c2Vycy5hZG1pbi5tYXAoIChhZG1pbikgLT5cbiAgICAgIFwiPGxpIGRhdGEtbmFtZT0nI3tfLmVzY2FwZShhZG1pbil9JyBjbGFzcz0nYWRtaW4gaWNvbic+I3tfLmVzY2FwZShhZG1pbil9PC9saT5cIlxuICAgICkuam9pbignJylcbiAgICBpZiB1c2Vycy5tZW1iZXIubGVuZ3RoID09IDBcbiAgICAgIG1lbWJlckh0bWwgPSBcIjxzcGFuIGNsYXNzPSdncmV5Jz5ObyBtZW1iZXJzIHlldC48L3NwYW4+XCJcbiAgICBlbHNlXG4gICAgICBtZW1iZXJIdG1sID0gdXNlcnMubWVtYmVyLm1hcCggKG1lbWJlcikgLT5cbiAgICAgICAgXCI8bGkgZGF0YS1uYW1lPScje18uZXNjYXBlKG1lbWJlcil9JyBjbGFzcz0nbWVtYmVyIGljb24nPiN7Xy5lc2NhcGUobWVtYmVyKX08L2xpPlwiXG4gICAgICApLmpvaW4oJycpXG5cbiAgICBAJGVsLmZpbmQoJyN1c2Vycy1yb3cnKS5odG1sIFwiXG4gICAgICA8dGQ+PHVsIGlkPSdhZG1pbi1jb250YWluZXInIG11bHRpcGxlPSdtdWx0aXBsZScgc2l6ZT0nNSc+I3thZG1pbkh0bWx9PC91bD48L3RkPlxuICAgICAgPHRkPjx1bCBpZD0nbWVtYmVyLWNvbnRhaW5lcicgbXVsdGlwbGU9J211bHRpcGxlJyBzaXplPSc1Jz4je21lbWJlckh0bWx9PC91bD48L3RkPlxuICAgIFwiXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgQCRlbC5odG1sIFwiXG4gICAgICA8aDE+VXNlcnM8L2gxPlxuICAgICAgPHRhYmxlPlxuICAgICAgPHRyPlxuICAgICAgICA8dGg+QWRtaW5zPC90aD5cbiAgICAgICAgPHRoPk1lbWJlcnM8L3RoPlxuICAgICAgPC90cj5cbiAgICAgIDx0cj5cbiAgICAgICAgPHRkPlxuICAgICAgICAgIDxpbnB1dCBpZD0nc2VsZWN0ZWQtYWRtaW4nICB2YWx1ZT0nJz5cbiAgICAgICAgICA8YnV0dG9uIGlkPSdhZGQtYWRtaW4nIGNsYXNzPSdjb21tYW5kJz4rPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBpZD0ncmVtb3ZlLWFkbWluJyBjbGFzcz0nY29tbWFuZCc+LTwvYnV0dG9uPlxuICAgICAgICA8L3RkPlxuICAgICAgICA8dGQ+XG4gICAgICAgICAgPGlucHV0IGlkPSdzZWxlY3RlZC1tZW1iZXInIHZhbHVlPScnPlxuICAgICAgICAgIDxidXR0b24gaWQ9J2FkZC1tZW1iZXInIGNsYXNzPSdjb21tYW5kJz4rPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiBpZD0ncmVtb3ZlLW1lbWJlcicgY2xhc3M9J2NvbW1hbmQnPi08L2J1dHRvbj5cbiAgICAgICAgPC90ZD5cbiAgICAgIDwvdHI+XG4gICAgICA8dHIgaWQ9J3VzZXJzLXJvdyc+XG4gICAgICA8L3RyPlxuICAgIFwiXG5cbiAgICBAcmVmcmVzaFVzZXJzKClcblxuIl19
