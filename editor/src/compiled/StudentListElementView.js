var StudentListElementView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

StudentListElementView = (function(superClass) {
  extend(StudentListElementView, superClass);

  function StudentListElementView() {
    return StudentListElementView.__super__.constructor.apply(this, arguments);
  }

  StudentListElementView.prototype.className = "student_list_element";

  StudentListElementView.prototype.tagName = "li";

  StudentListElementView.prototype.events = {
    'click .edit': 'edit',
    'click .remove': 'toggleRemove',
    'click .remove_cancel': 'toggleRemove',
    'click .remove_delete': 'removeStudent'
  };

  StudentListElementView.prototype.initialize = function(options) {
    this.student = options.student;
    return this.students = options.students;
  };

  StudentListElementView.prototype.edit = function() {
    return Tangerine.router.navigate("class/student/" + this.student.id, true);
  };

  StudentListElementView.prototype.toggleRemove = function() {
    return this.$el.find(".remove_confirm, .remove").toggle();
  };

  StudentListElementView.prototype.removeStudent = function() {
    this.student.set({
      klassId: null
    }).save();
    return this.students.remove(this.student);
  };

  StudentListElementView.prototype.render = function() {
    this.$el.html((this.student.get('name')) + " " + (this.student.get('gender')) + " " + (this.student.get('age')) + " <img src='images/icon_edit.png' class='edit' title='Edit'> <img src='images/icon_delete.png' class='remove' title='Remove'> <div class='remove_confirm confirmation'> <div class='menu_box'> " + (t('remove student')) + "<br> <button class='remove_delete command_red'>" + (t('remove')) + "</button> <button class='remove_cancel command'>" + (t('cancel')) + "</button> </div> </div>");
    return this.trigger("rendered");
  };

  return StudentListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0dWRlbnQvU3R1ZGVudExpc3RFbGVtZW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxzQkFBQTtFQUFBOzs7QUFBTTs7Ozs7OzttQ0FFSixTQUFBLEdBQVc7O21DQUNYLE9BQUEsR0FBVTs7bUNBRVYsTUFBQSxHQUNFO0lBQUEsYUFBQSxFQUF5QixNQUF6QjtJQUNBLGVBQUEsRUFBeUIsY0FEekI7SUFFQSxzQkFBQSxFQUF5QixjQUZ6QjtJQUdBLHNCQUFBLEVBQXlCLGVBSHpCOzs7bUNBS0YsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FBTyxDQUFDO1dBQ25CLElBQUMsQ0FBQSxRQUFELEdBQVksT0FBTyxDQUFDO0VBRlY7O21DQUlaLElBQUEsR0FBUyxTQUFBO1dBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFqQixDQUEwQixnQkFBQSxHQUFpQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQXBELEVBQTBELElBQTFEO0VBQUg7O21DQUNULFlBQUEsR0FBYyxTQUFBO1dBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsMEJBQVYsQ0FBcUMsQ0FBQyxNQUF0QyxDQUFBO0VBQUg7O21DQUNkLGFBQUEsR0FBZSxTQUFBO0lBQ2IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWE7TUFBQSxPQUFBLEVBQVUsSUFBVjtLQUFiLENBQTRCLENBQUMsSUFBN0IsQ0FBQTtXQUNBLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixJQUFDLENBQUEsT0FBbEI7RUFGYTs7bUNBSWYsTUFBQSxHQUFRLFNBQUE7SUFDTixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FDRyxDQUFDLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLE1BQWIsQ0FBRCxDQUFBLEdBQXFCLEdBQXJCLEdBQ0EsQ0FBQyxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxRQUFiLENBQUQsQ0FEQSxHQUN1QixHQUR2QixHQUVBLENBQUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsS0FBYixDQUFELENBRkEsR0FFb0IsZ01BRnBCLEdBT0ksQ0FBQyxDQUFBLENBQUUsZ0JBQUYsQ0FBRCxDQVBKLEdBT3lCLGlEQVB6QixHQVE4QyxDQUFDLENBQUEsQ0FBRSxRQUFGLENBQUQsQ0FSOUMsR0FRMkQsa0RBUjNELEdBUzBDLENBQUMsQ0FBQSxDQUFFLFFBQUYsQ0FBRCxDQVQxQyxHQVN1RCx5QkFWMUQ7V0FlQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFoQk07Ozs7R0FyQjJCLFFBQVEsQ0FBQyIsImZpbGUiOiJzdHVkZW50L1N0dWRlbnRMaXN0RWxlbWVudFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdHVkZW50TGlzdEVsZW1lbnRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJzdHVkZW50X2xpc3RfZWxlbWVudFwiXG4gIHRhZ05hbWUgOiBcImxpXCJcblxuICBldmVudHMgOlxuICAgICdjbGljayAuZWRpdCcgICAgICAgICAgOiAnZWRpdCdcbiAgICAnY2xpY2sgLnJlbW92ZScgICAgICAgIDogJ3RvZ2dsZVJlbW92ZSdcbiAgICAnY2xpY2sgLnJlbW92ZV9jYW5jZWwnIDogJ3RvZ2dsZVJlbW92ZSdcbiAgICAnY2xpY2sgLnJlbW92ZV9kZWxldGUnIDogJ3JlbW92ZVN0dWRlbnQnXG4gIFxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAc3R1ZGVudCA9IG9wdGlvbnMuc3R1ZGVudFxuICAgIEBzdHVkZW50cyA9IG9wdGlvbnMuc3R1ZGVudHNcbiAgXG4gIGVkaXQ6ICAgIC0+IFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJjbGFzcy9zdHVkZW50LyN7QHN0dWRlbnQuaWR9XCIsIHRydWVcbiAgdG9nZ2xlUmVtb3ZlOiAtPiBAJGVsLmZpbmQoXCIucmVtb3ZlX2NvbmZpcm0sIC5yZW1vdmVcIikudG9nZ2xlKClcbiAgcmVtb3ZlU3R1ZGVudDogLT4gXG4gICAgQHN0dWRlbnQuc2V0KGtsYXNzSWQgOiBudWxsKS5zYXZlKClcbiAgICBAc3R1ZGVudHMucmVtb3ZlKEBzdHVkZW50KVxuXG4gIHJlbmRlcjogLT5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgICN7QHN0dWRlbnQuZ2V0ICduYW1lJ31cbiAgICAgICN7QHN0dWRlbnQuZ2V0ICdnZW5kZXInfVxuICAgICAgI3tAc3R1ZGVudC5nZXQgJ2FnZSd9XG4gICAgICA8aW1nIHNyYz0naW1hZ2VzL2ljb25fZWRpdC5wbmcnIGNsYXNzPSdlZGl0JyB0aXRsZT0nRWRpdCc+XG4gICAgICA8aW1nIHNyYz0naW1hZ2VzL2ljb25fZGVsZXRlLnBuZycgY2xhc3M9J3JlbW92ZScgdGl0bGU9J1JlbW92ZSc+XG4gICAgICA8ZGl2IGNsYXNzPSdyZW1vdmVfY29uZmlybSBjb25maXJtYXRpb24nPlxuICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgI3t0KCdyZW1vdmUgc3R1ZGVudCcpfTxicj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdyZW1vdmVfZGVsZXRlIGNvbW1hbmRfcmVkJz4je3QoJ3JlbW92ZScpfTwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9J3JlbW92ZV9jYW5jZWwgY29tbWFuZCc+I3t0KCdjYW5jZWwnKX08L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBcIlxuICAgIFxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuIl19
