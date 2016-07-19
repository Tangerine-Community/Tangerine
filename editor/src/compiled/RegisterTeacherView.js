var RegisterTeacherView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

RegisterTeacherView = (function(superClass) {
  extend(RegisterTeacherView, superClass);

  function RegisterTeacherView() {
    return RegisterTeacherView.__super__.constructor.apply(this, arguments);
  }

  RegisterTeacherView.prototype.className = "RegisterTeacherView";

  RegisterTeacherView.prototype.events = {
    'click .register': 'register',
    'click .cancel': 'cancel'
  };

  RegisterTeacherView.prototype.initialize = function(options) {
    this.name = options.name;
    this.pass = options.pass;
    return this.fields = ["first", "last", "gender", "school", "contact"];
  };

  RegisterTeacherView.prototype.cancel = function() {
    return Tangerine.router.login();
  };

  RegisterTeacherView.prototype.register = function() {
    return this.validate((function(_this) {
      return function() {
        return _this.saveUser();
      };
    })(this));
  };

  RegisterTeacherView.prototype.validate = function(callback) {
    var element, errors, i, len, ref;
    errors = false;
    ref = this.fields;
    for (i = 0, len = ref.length; i < len; i++) {
      element = ref[i];
      if (_.isEmpty(this[element].val())) {
        this.$el.find("#" + element + "_message").html("Please fill out this field.");
        errors = true;
      } else {
        this.$el.find("#" + element + "_message").html("");
      }
    }
    if (errors) {
      return Utils.midAlert("Please correct the errors on this page.");
    } else {
      return callback();
    }
  };

  RegisterTeacherView.prototype.saveUser = function() {
    var couchUserDoc, element, i, len, ref, teacher, teacherDoc;
    teacherDoc = {
      "name": this.name
    };
    ref = this.fields;
    for (i = 0, len = ref.length; i < len; i++) {
      element = ref[i];
      teacherDoc[element] = this[element].val();
    }
    couchUserDoc = {
      "name": this.name
    };
    teacher = new Teacher(teacherDoc);
    return teacher.save({
      "_id": Utils.humanGUID()
    }, {
      success: (function(_this) {
        return function() {
          return Tangerine.user.save({
            "teacherId": teacher.id
          }, {
            success: function() {
              Utils.midAlert("New teacher registered");
              return Tangerine.user.login(_this.name, _this.pass, {
                success: function() {
                  return Tangerine.router.landing();
                }
              });
            },
            error: function(error) {
              return Utils.midAlert("Registration error<br>" + error, 5000);
            }
          });
        };
      })(this)
    });
  };

  RegisterTeacherView.prototype.render = function() {
    var element, i, len, ref, x;
    this.$el.html("<h1>Register new teacher</h1> <table> <tr> <td class='small_grey'><b>Username</b></td> <td class='small_grey'>" + this.name + "</td> <td class='small_grey'><b>Password</b></td> <td class='small_grey'>" + (((function() {
      var i, len, ref, results;
      ref = this.pass;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        x = ref[i];
        results.push("*");
      }
      return results;
    }).call(this)).join('')) + "</td> </tr> </table> <div class='label_value'> <label for='first'>First name</label> <div id='first_message' class='messages'></div> <input id='first'> </div> <div class='label_value'> <label for='last'>Last Name</label> <div id='last_message' class='messages'></div> <input id='last'> </div> <div class='label_value'> <label for='gender'>Gender</label> <div id='gender_message' class='messages'></div> <input id='gender'> </div> <div class='label_value'> <label for='school'>School name</label> <div id='school_message' class='messages'></div> <input id='school'> </div> <div class='label_value'> <label for='contact'>Email address or mobile phone number</label> <div type='email' id='contact_message' class='messages'></div> <input id='contact'> </div> <button class='register command'>Register</button> <button class='cancel command'>Cancel</button>");
    ref = this.fields;
    for (i = 0, len = ref.length; i < len; i++) {
      element = ref[i];
      this[element] = this.$el.find("#" + element);
    }
    return this.trigger("rendered");
  };

  return RegisterTeacherView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlYWNoZXIvUmVnaXN0ZXJUZWFjaGVyVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxtQkFBQTtFQUFBOzs7QUFBTTs7Ozs7OztnQ0FFSixTQUFBLEdBQVk7O2dDQUVaLE1BQUEsR0FDRTtJQUFBLGlCQUFBLEVBQW9CLFVBQXBCO0lBQ0EsZUFBQSxFQUFrQixRQURsQjs7O2dDQUdGLFVBQUEsR0FBWSxTQUFFLE9BQUY7SUFDVixJQUFDLENBQUEsSUFBRCxHQUFRLE9BQU8sQ0FBQztJQUNoQixJQUFDLENBQUEsSUFBRCxHQUFRLE9BQU8sQ0FBQztXQUNoQixJQUFDLENBQUEsTUFBRCxHQUFVLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsUUFBbEIsRUFBNEIsUUFBNUIsRUFBc0MsU0FBdEM7RUFIQTs7Z0NBS1osTUFBQSxHQUFRLFNBQUE7V0FDTixTQUFTLENBQUMsTUFBTSxDQUFDLEtBQWpCLENBQUE7RUFETTs7Z0NBR1IsUUFBQSxHQUFVLFNBQUE7V0FDUixJQUFDLENBQUEsUUFBRCxDQUFVLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtlQUFHLEtBQUMsQ0FBQSxRQUFELENBQUE7TUFBSDtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVjtFQURROztnQ0FHVixRQUFBLEdBQVUsU0FBQyxRQUFEO0FBRVIsUUFBQTtJQUFBLE1BQUEsR0FBUztBQUNUO0FBQUEsU0FBQSxxQ0FBQTs7TUFDRSxJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsSUFBRSxDQUFBLE9BQUEsQ0FBUSxDQUFDLEdBQVgsQ0FBQSxDQUFWLENBQUg7UUFDRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxHQUFBLEdBQUksT0FBSixHQUFZLFVBQXRCLENBQWdDLENBQUMsSUFBakMsQ0FBc0MsNkJBQXRDO1FBQ0EsTUFBQSxHQUFTLEtBRlg7T0FBQSxNQUFBO1FBSUUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsR0FBQSxHQUFJLE9BQUosR0FBWSxVQUF0QixDQUFnQyxDQUFDLElBQWpDLENBQXNDLEVBQXRDLEVBSkY7O0FBREY7SUFNQSxJQUFHLE1BQUg7YUFDRSxLQUFLLENBQUMsUUFBTixDQUFlLHlDQUFmLEVBREY7S0FBQSxNQUFBO2FBR0UsUUFBQSxDQUFBLEVBSEY7O0VBVFE7O2dDQWNWLFFBQUEsR0FBVSxTQUFBO0FBRVIsUUFBQTtJQUFBLFVBQUEsR0FDRTtNQUFBLE1BQUEsRUFBUyxJQUFDLENBQUEsSUFBVjs7QUFFRjtBQUFBLFNBQUEscUNBQUE7O01BQUMsVUFBVyxDQUFBLE9BQUEsQ0FBWCxHQUFzQixJQUFFLENBQUEsT0FBQSxDQUFRLENBQUMsR0FBWCxDQUFBO0FBQXZCO0lBRUEsWUFBQSxHQUNFO01BQUEsTUFBQSxFQUFTLElBQUMsQ0FBQSxJQUFWOztJQUVGLE9BQUEsR0FBYyxJQUFBLE9BQUEsQ0FBUSxVQUFSO1dBQ2QsT0FBTyxDQUFDLElBQVIsQ0FDRTtNQUFBLEtBQUEsRUFBUSxLQUFLLENBQUMsU0FBTixDQUFBLENBQVI7S0FERixFQUdFO01BQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDUCxTQUFTLENBQUMsSUFBSSxDQUFDLElBQWYsQ0FDRTtZQUFBLFdBQUEsRUFBYyxPQUFPLENBQUMsRUFBdEI7V0FERixFQUdFO1lBQUEsT0FBQSxFQUFTLFNBQUE7Y0FDUCxLQUFLLENBQUMsUUFBTixDQUFlLHdCQUFmO3FCQUNBLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBZixDQUFxQixLQUFDLENBQUEsSUFBdEIsRUFBNEIsS0FBQyxDQUFBLElBQTdCLEVBQW1DO2dCQUFBLE9BQUEsRUFBUyxTQUFBO3lCQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBakIsQ0FBQTtnQkFBSCxDQUFUO2VBQW5DO1lBRk8sQ0FBVDtZQUdBLEtBQUEsRUFBTyxTQUFDLEtBQUQ7cUJBQ0wsS0FBSyxDQUFDLFFBQU4sQ0FBZSx3QkFBQSxHQUF5QixLQUF4QyxFQUFpRCxJQUFqRDtZQURLLENBSFA7V0FIRjtRQURPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO0tBSEY7RUFYUTs7Z0NBeUJWLE1BQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQUFBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdIQUFBLEdBS3FCLElBQUMsQ0FBQSxJQUx0QixHQUsyQiwyRUFMM0IsR0FPb0IsQ0FBQzs7QUFBQztBQUFBO1dBQUEscUNBQUE7O3FCQUFBO0FBQUE7O2lCQUFELENBQW9CLENBQUMsSUFBckIsQ0FBMEIsRUFBMUIsQ0FBRCxDQVBwQixHQU9tRCxzMUJBUDdEO0FBcUNBO0FBQUEsU0FBQSxxQ0FBQTs7TUFDRSxJQUFFLENBQUEsT0FBQSxDQUFGLEdBQWEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsR0FBQSxHQUFJLE9BQWQ7QUFEZjtXQUVBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQXhDTTs7OztHQTFEd0IsUUFBUSxDQUFDIiwiZmlsZSI6InRlYWNoZXIvUmVnaXN0ZXJUZWFjaGVyVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFJlZ2lzdGVyVGVhY2hlclZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJSZWdpc3RlclRlYWNoZXJWaWV3XCJcblxuICBldmVudHMgOlxuICAgICdjbGljayAucmVnaXN0ZXInIDogJ3JlZ2lzdGVyJ1xuICAgICdjbGljayAuY2FuY2VsJyA6ICdjYW5jZWwnXG5cbiAgaW5pdGlhbGl6ZTogKCBvcHRpb25zICkgLT5cbiAgICBAbmFtZSA9IG9wdGlvbnMubmFtZVxuICAgIEBwYXNzID0gb3B0aW9ucy5wYXNzXG4gICAgQGZpZWxkcyA9IFtcImZpcnN0XCIsIFwibGFzdFwiLCBcImdlbmRlclwiLCBcInNjaG9vbFwiLCBcImNvbnRhY3RcIl1cblxuICBjYW5jZWw6IC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5sb2dpbigpXG5cbiAgcmVnaXN0ZXI6IC0+XG4gICAgQHZhbGlkYXRlID0+IEBzYXZlVXNlcigpXG5cbiAgdmFsaWRhdGU6IChjYWxsYmFjaykgLT5cblxuICAgIGVycm9ycyA9IGZhbHNlXG4gICAgZm9yIGVsZW1lbnQgaW4gQGZpZWxkc1xuICAgICAgaWYgXy5pc0VtcHR5KEBbZWxlbWVudF0udmFsKCkpXG4gICAgICAgIEAkZWwuZmluZChcIiMje2VsZW1lbnR9X21lc3NhZ2VcIikuaHRtbCBcIlBsZWFzZSBmaWxsIG91dCB0aGlzIGZpZWxkLlwiXG4gICAgICAgIGVycm9ycyA9IHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgQCRlbC5maW5kKFwiIyN7ZWxlbWVudH1fbWVzc2FnZVwiKS5odG1sIFwiXCJcbiAgICBpZiBlcnJvcnMgXG4gICAgICBVdGlscy5taWRBbGVydCBcIlBsZWFzZSBjb3JyZWN0IHRoZSBlcnJvcnMgb24gdGhpcyBwYWdlLlwiXG4gICAgZWxzZVxuICAgICAgY2FsbGJhY2soKVxuXG4gIHNhdmVVc2VyOiAtPlxuXG4gICAgdGVhY2hlckRvYyA9IFxuICAgICAgXCJuYW1lXCIgOiBAbmFtZVxuXG4gICAgKHRlYWNoZXJEb2NbZWxlbWVudF0gPSBAW2VsZW1lbnRdLnZhbCgpKSBmb3IgZWxlbWVudCBpbiBAZmllbGRzXG5cbiAgICBjb3VjaFVzZXJEb2MgPSBcbiAgICAgIFwibmFtZVwiIDogQG5hbWVcblxuICAgIHRlYWNoZXIgPSBuZXcgVGVhY2hlciB0ZWFjaGVyRG9jXG4gICAgdGVhY2hlci5zYXZlIFxuICAgICAgXCJfaWRcIiA6IFV0aWxzLmh1bWFuR1VJRCgpXG4gICAgLFxuICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgVGFuZ2VyaW5lLnVzZXIuc2F2ZVxuICAgICAgICAgIFwidGVhY2hlcklkXCIgOiB0ZWFjaGVyLmlkXG4gICAgICAgICxcbiAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJOZXcgdGVhY2hlciByZWdpc3RlcmVkXCJcbiAgICAgICAgICAgIFRhbmdlcmluZS51c2VyLmxvZ2luIEBuYW1lLCBAcGFzcywgc3VjY2VzczogLT4gVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcbiAgICAgICAgICBlcnJvcjogKGVycm9yKSAtPlxuICAgICAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJSZWdpc3RyYXRpb24gZXJyb3I8YnI+I3tlcnJvcn1cIiwgNTAwMFxuXG5cbiAgcmVuZGVyOiAtPlxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGgxPlJlZ2lzdGVyIG5ldyB0ZWFjaGVyPC9oMT5cbiAgICAgIDx0YWJsZT5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZCBjbGFzcz0nc21hbGxfZ3JleSc+PGI+VXNlcm5hbWU8L2I+PC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3M9J3NtYWxsX2dyZXknPiN7QG5hbWV9PC90ZD5cbiAgICAgICAgICA8dGQgY2xhc3M9J3NtYWxsX2dyZXknPjxiPlBhc3N3b3JkPC9iPjwvdGQ+XG4gICAgICAgICAgPHRkIGNsYXNzPSdzbWFsbF9ncmV5Jz4jeyhcIipcIiBmb3IgeCBpbiBAcGFzcykuam9pbignJyl9PC90ZD5cbiAgICAgICAgPC90cj5cbiAgICAgIDwvdGFibGU+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2ZpcnN0Jz5GaXJzdCBuYW1lPC9sYWJlbD5cbiAgICAgICAgPGRpdiBpZD0nZmlyc3RfbWVzc2FnZScgY2xhc3M9J21lc3NhZ2VzJz48L2Rpdj5cbiAgICAgICAgPGlucHV0IGlkPSdmaXJzdCc+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nbGFzdCc+TGFzdCBOYW1lPC9sYWJlbD5cbiAgICAgICAgPGRpdiBpZD0nbGFzdF9tZXNzYWdlJyBjbGFzcz0nbWVzc2FnZXMnPjwvZGl2PlxuICAgICAgICA8aW5wdXQgaWQ9J2xhc3QnPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2dlbmRlcic+R2VuZGVyPC9sYWJlbD5cbiAgICAgICAgPGRpdiBpZD0nZ2VuZGVyX21lc3NhZ2UnIGNsYXNzPSdtZXNzYWdlcyc+PC9kaXY+XG4gICAgICAgIDxpbnB1dCBpZD0nZ2VuZGVyJz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdzY2hvb2wnPlNjaG9vbCBuYW1lPC9sYWJlbD5cbiAgICAgICAgPGRpdiBpZD0nc2Nob29sX21lc3NhZ2UnIGNsYXNzPSdtZXNzYWdlcyc+PC9kaXY+XG4gICAgICAgIDxpbnB1dCBpZD0nc2Nob29sJz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdjb250YWN0Jz5FbWFpbCBhZGRyZXNzIG9yIG1vYmlsZSBwaG9uZSBudW1iZXI8L2xhYmVsPlxuICAgICAgICA8ZGl2IHR5cGU9J2VtYWlsJyBpZD0nY29udGFjdF9tZXNzYWdlJyBjbGFzcz0nbWVzc2FnZXMnPjwvZGl2PlxuICAgICAgICA8aW5wdXQgaWQ9J2NvbnRhY3QnPlxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uIGNsYXNzPSdyZWdpc3RlciBjb21tYW5kJz5SZWdpc3RlcjwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPSdjYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+XG4gICAgXCJcbiAgICBmb3IgZWxlbWVudCBpbiBAZmllbGRzXG4gICAgICBAW2VsZW1lbnRdID0gQCRlbC5maW5kKFwiI1wiK2VsZW1lbnQpXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiJdfQ==
