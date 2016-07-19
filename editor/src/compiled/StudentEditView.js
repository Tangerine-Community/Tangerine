var StudentEditView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

StudentEditView = (function(superClass) {
  extend(StudentEditView, superClass);

  function StudentEditView() {
    return StudentEditView.__super__.constructor.apply(this, arguments);
  }

  StudentEditView.prototype.className = "StudentEditView";

  StudentEditView.prototype.events = {
    'click .done': 'done',
    'click .back': 'back'
  };

  StudentEditView.prototype.initialize = function(options) {
    this.student = options.student;
    return this.klasses = options.klasses;
  };

  StudentEditView.prototype.done = function() {
    var klassId;
    klassId = this.$el.find("#klass_select option:selected").attr("data-id");
    if (klassId === "null") {
      klassId = null;
    }
    this.student.set({
      name: this.$el.find("#name").val(),
      gender: this.$el.find("#gender").val(),
      age: this.$el.find("#age").val(),
      klassId: klassId
    });
    this.student.save();
    return this.back();
  };

  StudentEditView.prototype.back = function() {
    return window.history.back();
  };

  StudentEditView.prototype.render = function() {
    var age, gender, html, i, klass, klassId, len, name, ref;
    name = this.student.get("name") || "";
    gender = this.student.get("gender") || "";
    age = this.student.get("age") || "";
    klassId = this.student.get("klassId");
    html = "<h1>" + (t('edit student')) + "</h1> <button class='back navigation'>" + (t('back')) + "</button><br> <div class='info_box'> <div class='label_value'> <label for='name'>Full name</label> <input id='name' value='" + name + "'> </div> <div class='label_value'> <label for='gender'>" + (t('gender')) + "</label> <input id='gender' value='" + gender + "'> </div> <div class='label_value'> <label for='age'>" + (t('age')) + "</label> <input id='age' value='" + age + "'> </div> <div class='label_value'> <label for='klass_select'>" + (t('class')) + "</label><br> <select id='klass_select'>";
    html += "<option data-id='null' " + (klassId === null ? "selected='selected'" : void 0) + ">" + (t('none')) + "</option>";
    ref = this.klasses.models;
    for (i = 0, len = ref.length; i < len; i++) {
      klass = ref[i];
      html += "<option data-id='" + klass.id + "' " + (klass.id === klassId ? "selected='selected'" : void 0) + ">" + (klass.get('year')) + " - " + (klass.get('grade')) + " - " + (klass.get('stream')) + "</option>";
    }
    html += "</select> </div> <button class='done command'>" + (t('done')) + "</button> </div>";
    this.$el.html(html);
    return this.trigger("rendered");
  };

  return StudentEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0dWRlbnQvU3R1ZGVudEVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGVBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7NEJBRUosU0FBQSxHQUFXOzs0QkFFWCxNQUFBLEdBQ0U7SUFBQSxhQUFBLEVBQWdCLE1BQWhCO0lBQ0EsYUFBQSxFQUFnQixNQURoQjs7OzRCQUdGLFVBQUEsR0FBWSxTQUFFLE9BQUY7SUFDVixJQUFDLENBQUEsT0FBRCxHQUFXLE9BQU8sQ0FBQztXQUNuQixJQUFDLENBQUEsT0FBRCxHQUFXLE9BQU8sQ0FBQztFQUZUOzs0QkFJWixJQUFBLEdBQU0sU0FBQTtBQUNKLFFBQUE7SUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsK0JBQVYsQ0FBMEMsQ0FBQyxJQUEzQyxDQUFnRCxTQUFoRDtJQUNWLElBQWtCLE9BQUEsS0FBVyxNQUE3QjtNQUFBLE9BQUEsR0FBVSxLQUFWOztJQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUNFO01BQUEsSUFBQSxFQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBa0IsQ0FBQyxHQUFuQixDQUFBLENBQVY7TUFDQSxNQUFBLEVBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsU0FBVixDQUFvQixDQUFDLEdBQXJCLENBQUEsQ0FEVjtNQUVBLEdBQUEsRUFBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxNQUFWLENBQWlCLENBQUMsR0FBbEIsQ0FBQSxDQUZWO01BR0EsT0FBQSxFQUFVLE9BSFY7S0FERjtJQUtBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFBO1dBQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQTtFQVRJOzs0QkFXTixJQUFBLEdBQU0sU0FBQTtXQUNKLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBZixDQUFBO0VBREk7OzRCQUdOLE1BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQUFBLElBQUEsR0FBUyxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxNQUFiLENBQUEsSUFBMEI7SUFDbkMsTUFBQSxHQUFTLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLFFBQWIsQ0FBQSxJQUEwQjtJQUNuQyxHQUFBLEdBQVMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsS0FBYixDQUFBLElBQTBCO0lBRW5DLE9BQUEsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQsQ0FBYSxTQUFiO0lBQ1YsSUFBQSxHQUFPLE1BQUEsR0FDRixDQUFDLENBQUEsQ0FBRSxjQUFGLENBQUQsQ0FERSxHQUNpQix3Q0FEakIsR0FFMEIsQ0FBQyxDQUFBLENBQUUsTUFBRixDQUFELENBRjFCLEdBRXFDLDZIQUZyQyxHQU11QixJQU52QixHQU00QiwwREFONUIsR0FTa0IsQ0FBQyxDQUFBLENBQUUsUUFBRixDQUFELENBVGxCLEdBUytCLHFDQVQvQixHQVV5QixNQVZ6QixHQVVnQyx1REFWaEMsR0FhZSxDQUFDLENBQUEsQ0FBRSxLQUFGLENBQUQsQ0FiZixHQWF5QixrQ0FiekIsR0Fjc0IsR0FkdEIsR0FjMEIsZ0VBZDFCLEdBaUJ3QixDQUFDLENBQUEsQ0FBRSxPQUFGLENBQUQsQ0FqQnhCLEdBaUJvQztJQUUzQyxJQUFBLElBQVEseUJBQUEsR0FBeUIsQ0FBSSxPQUFBLEtBQVcsSUFBZCxHQUF3QixxQkFBeEIsR0FBQSxNQUFELENBQXpCLEdBQXdFLEdBQXhFLEdBQTBFLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBRCxDQUExRSxHQUFxRjtBQUM3RjtBQUFBLFNBQUEscUNBQUE7O01BQ0UsSUFBQSxJQUFRLG1CQUFBLEdBQW9CLEtBQUssQ0FBQyxFQUExQixHQUE2QixJQUE3QixHQUFnQyxDQUFJLEtBQUssQ0FBQyxFQUFOLEtBQVksT0FBZixHQUE0QixxQkFBNUIsR0FBQSxNQUFELENBQWhDLEdBQW1GLEdBQW5GLEdBQXFGLENBQUMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLENBQUQsQ0FBckYsR0FBdUcsS0FBdkcsR0FBMkcsQ0FBQyxLQUFLLENBQUMsR0FBTixDQUFVLE9BQVYsQ0FBRCxDQUEzRyxHQUE4SCxLQUE5SCxHQUFrSSxDQUFDLEtBQUssQ0FBQyxHQUFOLENBQVUsUUFBVixDQUFELENBQWxJLEdBQXNKO0FBRGhLO0lBR0EsSUFBQSxJQUFRLGdEQUFBLEdBR3dCLENBQUMsQ0FBQSxDQUFFLE1BQUYsQ0FBRCxDQUh4QixHQUdtQztJQUkzQyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxJQUFWO1dBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBckNNOzs7O0dBMUJvQixRQUFRLENBQUMiLCJmaWxlIjoic3R1ZGVudC9TdHVkZW50RWRpdFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdHVkZW50RWRpdFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIlN0dWRlbnRFZGl0Vmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAuZG9uZScgOiAnZG9uZSdcbiAgICAnY2xpY2sgLmJhY2snIDogJ2JhY2snXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cbiAgICBAc3R1ZGVudCA9IG9wdGlvbnMuc3R1ZGVudFxuICAgIEBrbGFzc2VzID0gb3B0aW9ucy5rbGFzc2VzXG5cbiAgZG9uZTogLT5cbiAgICBrbGFzc0lkID0gQCRlbC5maW5kKFwiI2tsYXNzX3NlbGVjdCBvcHRpb246c2VsZWN0ZWRcIikuYXR0cihcImRhdGEtaWRcIilcbiAgICBrbGFzc0lkID0gbnVsbCBpZiBrbGFzc0lkID09IFwibnVsbFwiXG4gICAgQHN0dWRlbnQuc2V0XG4gICAgICBuYW1lICAgIDogQCRlbC5maW5kKFwiI25hbWVcIikudmFsKClcbiAgICAgIGdlbmRlciAgOiBAJGVsLmZpbmQoXCIjZ2VuZGVyXCIpLnZhbCgpXG4gICAgICBhZ2UgICAgIDogQCRlbC5maW5kKFwiI2FnZVwiKS52YWwoKVxuICAgICAga2xhc3NJZCA6IGtsYXNzSWRcbiAgICBAc3R1ZGVudC5zYXZlKClcbiAgICBAYmFjaygpXG5cbiAgYmFjazogLT5cbiAgICB3aW5kb3cuaGlzdG9yeS5iYWNrKClcblxuICByZW5kZXI6IC0+XG4gICAgbmFtZSAgID0gQHN0dWRlbnQuZ2V0KFwibmFtZVwiKSAgIHx8IFwiXCJcbiAgICBnZW5kZXIgPSBAc3R1ZGVudC5nZXQoXCJnZW5kZXJcIikgfHwgXCJcIlxuICAgIGFnZSAgICA9IEBzdHVkZW50LmdldChcImFnZVwiKSAgICB8fCBcIlwiXG5cbiAgICBrbGFzc0lkID0gQHN0dWRlbnQuZ2V0KFwia2xhc3NJZFwiKVxuICAgIGh0bWwgPSBcIlxuICAgIDxoMT4je3QoJ2VkaXQgc3R1ZGVudCcpfTwvaDE+XG4gICAgPGJ1dHRvbiBjbGFzcz0nYmFjayBuYXZpZ2F0aW9uJz4je3QoJ2JhY2snKX08L2J1dHRvbj48YnI+XG4gICAgPGRpdiBjbGFzcz0naW5mb19ib3gnPlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSduYW1lJz5GdWxsIG5hbWU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J25hbWUnIHZhbHVlPScje25hbWV9Jz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdnZW5kZXInPiN7dCgnZ2VuZGVyJyl9PC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSdnZW5kZXInIHZhbHVlPScje2dlbmRlcn0nPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2FnZSc+I3t0KCdhZ2UnKX08L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J2FnZScgdmFsdWU9JyN7YWdlfSc+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0na2xhc3Nfc2VsZWN0Jz4je3QoJ2NsYXNzJyl9PC9sYWJlbD48YnI+XG4gICAgICAgIDxzZWxlY3QgaWQ9J2tsYXNzX3NlbGVjdCc+XCJcbiAgICBodG1sICs9IFwiPG9wdGlvbiBkYXRhLWlkPSdudWxsJyAje2lmIGtsYXNzSWQgPT0gbnVsbCB0aGVuIFwic2VsZWN0ZWQ9J3NlbGVjdGVkJ1wifT4je3QoJ25vbmUnKX08L29wdGlvbj5cIlxuICAgIGZvciBrbGFzcyBpbiBAa2xhc3Nlcy5tb2RlbHNcbiAgICAgIGh0bWwgKz0gXCI8b3B0aW9uIGRhdGEtaWQ9JyN7a2xhc3MuaWR9JyAje2lmIGtsYXNzLmlkID09IGtsYXNzSWQgdGhlbiBcInNlbGVjdGVkPSdzZWxlY3RlZCdcIn0+I3trbGFzcy5nZXQgJ3llYXInfSAtICN7a2xhc3MuZ2V0ICdncmFkZSd9IC0gI3trbGFzcy5nZXQgJ3N0cmVhbSd9PC9vcHRpb24+XCJcblxuICAgIGh0bWwgKz0gXCJcbiAgICAgICAgPC9zZWxlY3Q+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxidXR0b24gY2xhc3M9J2RvbmUgY29tbWFuZCc+I3t0KCdkb25lJyl9PC9idXR0b24+XG4gICAgPC9kaXY+XG4gICAgXCJcbiAgICBcbiAgICBAJGVsLmh0bWwgaHRtbFxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4iXX0=
