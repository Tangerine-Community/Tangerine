var LessonPlanEditView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LessonPlanEditView = (function(superClass) {
  extend(LessonPlanEditView, superClass);

  function LessonPlanEditView() {
    return LessonPlanEditView.__super__.constructor.apply(this, arguments);
  }

  LessonPlanEditView.prototype.className = "LessonPlanEditView";

  LessonPlanEditView.prototype.initialize = function(options) {
    this.model = options.model;
    return this.parent = options.parent;
  };

  LessonPlanEditView.prototype.isValid = function() {
    return true;
  };

  LessonPlanEditView.prototype.save = function() {};

  LessonPlanEditView.prototype.render = function() {
    var day, grade, lesson_text, subject, title, week;
    title = this.model.getString("title");
    lesson_text = this.model.getString("lesson_text");
    subject = this.model.getString("subject");
    grade = this.model.getString("grade");
    week = this.model.getString("week");
    day = this.model.getString("day");
    return this.$el.html("<div class='label_value'> <label for='title'>LessonPlan Title</label> <input id='title' value='" + title + "'> </div> <div class='menu_box'> <div class='label_value'> <label for='lesson_text' title='Lesson Text. '>LessonPlan Text</label> <textarea id='lesson_text'>" + lesson_text + "</textarea> </div> </div> <div class='label_value'> <label for='subject'>LessonPlan subject</label><br> <div class='menu_box'> <select id='subject'> <option value=''>None</option> <option value='1'>Engish</option> <option value='2'>Kiswahili</option> </select> </div> </div> <div class='label_value'> <label for='grade'>LessonPlan Grade</label> <input id='grade' value='" + grade + "'> </div> <div class='label_value'> <label for='week'>LessonPlan Week</label> <input id='week' value='" + week + "'> </div> <div class='label_value'> <label for='day'>LessonPlan Day</label> <input id='day' value='" + day + "'> </div>");
  };

  return LessonPlanEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9MZXNzb25QbGFuRWRpdFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsa0JBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7K0JBRUosU0FBQSxHQUFXOzsrQkFFWCxVQUFBLEdBQVksU0FBRSxPQUFGO0lBQ1YsSUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUM7V0FDakIsSUFBQyxDQUFBLE1BQUQsR0FBVSxPQUFPLENBQUM7RUFGUjs7K0JBSVosT0FBQSxHQUFTLFNBQUE7V0FBRztFQUFIOzsrQkFFVCxJQUFBLEdBQU0sU0FBQSxHQUFBOzsrQkFDTixNQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7SUFBQSxLQUFBLEdBQVcsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQWlCLE9BQWpCO0lBQ1gsV0FBQSxHQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBaUIsYUFBakI7SUFDakIsT0FBQSxHQUFhLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFpQixTQUFqQjtJQUNiLEtBQUEsR0FBVyxJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBaUIsT0FBakI7SUFDWCxJQUFBLEdBQVUsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQWlCLE1BQWpCO0lBQ1YsR0FBQSxHQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFpQixLQUFqQjtXQUNULElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGlHQUFBLEdBR3VCLEtBSHZCLEdBRzZCLCtKQUg3QixHQVEyQixXQVIzQixHQVF1QyxvWEFSdkMsR0F1QmlCLEtBdkJqQixHQXVCdUIsd0dBdkJ2QixHQTJCZ0IsSUEzQmhCLEdBMkJxQixxR0EzQnJCLEdBK0JlLEdBL0JmLEdBK0JtQixXQS9CN0I7RUFQTTs7OztHQVh1QixRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9wcm90b3R5cGVzL0xlc3NvblBsYW5FZGl0Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIExlc3NvblBsYW5FZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiTGVzc29uUGxhbkVkaXRWaWV3XCJcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuICAgIEBtb2RlbCA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ID0gb3B0aW9ucy5wYXJlbnRcblxuICBpc1ZhbGlkOiAtPiB0cnVlXG5cbiAgc2F2ZTogLT4gIyBkbyBub3RoaW5nXG4gIHJlbmRlcjogLT5cbiAgICB0aXRsZSAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJ0aXRsZVwiKVxuICAgIGxlc3Nvbl90ZXh0ICAgID0gQG1vZGVsLmdldFN0cmluZyhcImxlc3Nvbl90ZXh0XCIpXG4gICAgc3ViamVjdCAgICA9IEBtb2RlbC5nZXRTdHJpbmcoXCJzdWJqZWN0XCIpXG4gICAgZ3JhZGUgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwiZ3JhZGVcIilcbiAgICB3ZWVrICAgID0gQG1vZGVsLmdldFN0cmluZyhcIndlZWtcIilcbiAgICBkYXkgICAgPSBAbW9kZWwuZ2V0U3RyaW5nKFwiZGF5XCIpXG4gICAgQCRlbC5odG1sIFwiXG4gICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgIDxsYWJlbCBmb3I9J3RpdGxlJz5MZXNzb25QbGFuIFRpdGxlPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgaWQ9J3RpdGxlJyB2YWx1ZT0nI3t0aXRsZX0nPlxuICAgICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgPGxhYmVsIGZvcj0nbGVzc29uX3RleHQnIHRpdGxlPSdMZXNzb24gVGV4dC4gJz5MZXNzb25QbGFuIFRleHQ8L2xhYmVsPlxuICAgICAgICAgICAgPHRleHRhcmVhIGlkPSdsZXNzb25fdGV4dCc+I3tsZXNzb25fdGV4dH08L3RleHRhcmVhPlxuICAgIDwvZGl2PlxuICAgICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICA8bGFiZWwgZm9yPSdzdWJqZWN0Jz5MZXNzb25QbGFuIHN1YmplY3Q8L2xhYmVsPjxicj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICAgICAgPHNlbGVjdCBpZD0nc3ViamVjdCc+XG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nJz5Ob25lPC9vcHRpb24+XG4gICAgPG9wdGlvbiB2YWx1ZT0nMSc+RW5naXNoPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nMic+S2lzd2FoaWxpPC9vcHRpb24+XG4gICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgIDxsYWJlbCBmb3I9J2dyYWRlJz5MZXNzb25QbGFuIEdyYWRlPC9sYWJlbD5cbiAgICA8aW5wdXQgaWQ9J2dyYWRlJyB2YWx1ZT0nI3tncmFkZX0nPlxuICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgPGxhYmVsIGZvcj0nd2Vlayc+TGVzc29uUGxhbiBXZWVrPC9sYWJlbD5cbiAgICA8aW5wdXQgaWQ9J3dlZWsnIHZhbHVlPScje3dlZWt9Jz5cbiAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgIDxsYWJlbCBmb3I9J2RheSc+TGVzc29uUGxhbiBEYXk8L2xhYmVsPlxuICAgIDxpbnB1dCBpZD0nZGF5JyB2YWx1ZT0nI3tkYXl9Jz5cbiAgICA8L2Rpdj5cbiAgICAgIFwiXG4iXX0=
