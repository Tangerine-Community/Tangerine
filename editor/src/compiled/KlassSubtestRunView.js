var KlassSubtestRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassSubtestRunView = (function(superClass) {
  extend(KlassSubtestRunView, superClass);

  function KlassSubtestRunView() {
    this.onPrototypeRendered = bind(this.onPrototypeRendered, this);
    return KlassSubtestRunView.__super__.constructor.apply(this, arguments);
  }

  KlassSubtestRunView.prototype.className = "KlassSubtestRunView";

  KlassSubtestRunView.prototype.events = {
    'click .done': 'done',
    'click .cancel': 'cancel',
    'click .subtest_help': 'toggleHelp'
  };

  KlassSubtestRunView.prototype.toggleHelp = function() {
    return this.$el.find(".enumerator_help").fadeToggle(250);
  };

  KlassSubtestRunView.prototype.initialize = function(options) {
    this.linkedResult = options.linkedResult;
    this.student = options.student;
    this.subtest = options.subtest;
    this.questions = options.questions;
    this.prototype = this.subtest.get("prototype");
    this.protoViews = Tangerine.config.get("prototypeViews");
    this.prototypeRendered = false;
    if (this.prototype === "grid") {
      return this.result = new KlassResult({
        prototype: "grid",
        startTime: (new Date()).getTime(),
        itemType: this.subtest.get("itemType"),
        reportType: this.subtest.get("reportType"),
        studentId: this.student.id,
        subtestId: this.subtest.id,
        part: this.subtest.get("part"),
        klassId: this.student.get("klassId"),
        timeAllowed: this.subtest.get("timer")
      });
    } else if (this.prototype === "survey") {
      this.result = new KlassResult({
        prototype: "survey",
        startTime: (new Date()).getTime(),
        studentId: this.student.id,
        subtestId: this.subtest.id,
        part: this.subtest.get("part"),
        klassId: this.student.get("klassId"),
        itemType: this.subtest.get("itemType"),
        reportType: this.subtest.get("reportType")
      });
      this.questions.sort();
      return this.render();
    }
  };

  KlassSubtestRunView.prototype.render = function() {
    var enumeratorHelp, studentDialog;
    enumeratorHelp = (this.subtest.get("enumeratorHelp") || "") !== "" ? "<button class='subtest_help command'>help</button><div class='enumerator_help'>" + (this.subtest.get('enumeratorHelp')) + "</div>" : "";
    studentDialog = (this.subtest.get("studentDialog") || "") !== "" ? "<div class='student_dialog'>" + (this.subtest.get('studentDialog')) + "</div>" : "";
    this.$el.html("<h2>" + (this.subtest.get('name')) + "</h2> " + enumeratorHelp + " " + studentDialog);
    this.prototypeView = new window[this.protoViews[this.subtest.get('prototype')]['run']]({
      model: this.subtest,
      parent: this
    });
    this.prototypeView.on("rendered", this.onPrototypeRendered);
    this.prototypeView.render();
    this.$el.append(this.prototypeView.el);
    this.prototypeRendered = true;
    this.$el.append("<button class='done navigation'>Done</button> <button class='cancel navigation'>Cancel</button>");
    return this.trigger("rendered");
  };

  KlassSubtestRunView.prototype.onPrototypeRendered = function() {
    return this.trigger("rendered");
  };

  KlassSubtestRunView.prototype.getGridScore = function() {
    var result;
    if (this.linkedResult.get("subtestData") == null) {
      return false;
    }
    result = this.linkedResult.get("subtestData")['attempted'] || 0;
    return result;
  };

  KlassSubtestRunView.prototype.gridWasAutostopped = function() {
    var ref;
    return ((ref = this.linkedResult.get("subtestData")) != null ? ref['auto_stop'] : void 0) || 0;
  };

  KlassSubtestRunView.prototype.onClose = function() {
    var ref;
    return (ref = this.prototypeView) != null ? typeof ref.close === "function" ? ref.close() : void 0 : void 0;
  };

  KlassSubtestRunView.prototype.isValid = function() {
    if (!this.prototypeRendered) {
      return false;
    }
    if (this.prototypeView.isValid != null) {
      return this.prototypeView.isValid();
    } else {
      return false;
    }
    return true;
  };

  KlassSubtestRunView.prototype.getSkipped = function() {
    if (this.prototypeView.getSkipped != null) {
      return this.prototypeView.getSkipped();
    } else {
      throw "Prototype skipping not implemented";
    }
  };

  KlassSubtestRunView.prototype.cancel = function() {
    if (this.student.id === "test") {
      history.back();
      return;
    }
    return Tangerine.router.navigate("class/" + (this.student.get('klassId')) + "/" + (this.subtest.get('part')), true);
  };

  KlassSubtestRunView.prototype.done = function() {
    if (this.student.id === "test") {
      history.back();
      return;
    }
    if (this.isValid()) {
      return Tangerine.$db.view(Tangerine.design_doc + "/resultsByStudentSubtest", {
        key: [this.student.id, this.subtest.id],
        success: (function(_this) {
          return function(data) {
            var datum, i, len, rows;
            rows = data.rows;
            for (i = 0, len = rows.length; i < len; i++) {
              datum = rows[i];
              Tangerine.$db.saveDoc($.extend(datum.value, {
                "old": true
              }));
            }
            return _this.result.add(_this.prototypeView.getResult(), function() {
              return Tangerine.router.navigate("class/" + (_this.student.get('klassId')) + "/" + (_this.subtest.get('part')), true);
            });
          };
        })(this)
      });
    } else {
      return this.prototypeView.showErrors();
    }
  };

  return KlassSubtestRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtsYXNzL0tsYXNzU3VidGVzdFJ1blZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsbUJBQUE7RUFBQTs7OztBQUFNOzs7Ozs7OztnQ0FFSixTQUFBLEdBQVk7O2dDQUVaLE1BQUEsR0FDRTtJQUFBLGFBQUEsRUFBd0IsTUFBeEI7SUFDQSxlQUFBLEVBQXdCLFFBRHhCO0lBRUEscUJBQUEsRUFBd0IsWUFGeEI7OztnQ0FJRixVQUFBLEdBQVksU0FBQTtXQUFHLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGtCQUFWLENBQTZCLENBQUMsVUFBOUIsQ0FBeUMsR0FBekM7RUFBSDs7Z0NBRVosVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxZQUFELEdBQWdCLE9BQU8sQ0FBQztJQUN4QixJQUFDLENBQUEsT0FBRCxHQUFnQixPQUFPLENBQUM7SUFDeEIsSUFBQyxDQUFBLE9BQUQsR0FBZ0IsT0FBTyxDQUFDO0lBQ3hCLElBQUMsQ0FBQSxTQUFELEdBQWdCLE9BQU8sQ0FBQztJQUV4QixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLFdBQWI7SUFFYixJQUFDLENBQUEsVUFBRCxHQUFjLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBakIsQ0FBcUIsZ0JBQXJCO0lBRWQsSUFBQyxDQUFBLGlCQUFELEdBQXFCO0lBR3JCLElBQUcsSUFBQyxDQUFBLFNBQUQsS0FBYyxNQUFqQjthQUNFLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxXQUFBLENBQ1o7UUFBQSxTQUFBLEVBQWUsTUFBZjtRQUNBLFNBQUEsRUFBZSxDQUFLLElBQUEsSUFBQSxDQUFBLENBQUwsQ0FBWSxDQUFDLE9BQWIsQ0FBQSxDQURmO1FBRUEsUUFBQSxFQUFlLElBQUMsQ0FBQSxPQUFPLENBQUMsR0FBVCxDQUFhLFVBQWIsQ0FGZjtRQUdBLFVBQUEsRUFBZSxJQUFDLENBQUEsT0FBTyxDQUFDLEdBQVQs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MUcwQixRQUFRLENBQUMiLCJmaWxlIjoia2xhc3MvS2xhc3NTdWJ0ZXN0UnVuVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEtsYXNzU3VidGVzdFJ1blZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJLbGFzc1N1YnRlc3RSdW5WaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5kb25lJyAgICAgICAgIDogJ2RvbmUnXG4gICAgJ2NsaWNrIC5jYW5jZWwnICAgICAgIDogJ2NhbmNlbCdcbiAgICAnY2xpY2sgLnN1YnRlc3RfaGVscCcgOiAndG9nZ2xlSGVscCdcblxuICB0b2dnbGVIZWxwOiAtPiBAJGVsLmZpbmQoXCIuZW51bWVyYXRvcl9oZWxwXCIpLmZhZGVUb2dnbGUoMjUwKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBsaW5rZWRSZXN1bHQgPSBvcHRpb25zLmxpbmtlZFJlc3VsdFxuICAgIEBzdHVkZW50ICAgICAgPSBvcHRpb25zLnN0dWRlbnRcbiAgICBAc3VidGVzdCAgICAgID0gb3B0aW9ucy5zdWJ0ZXN0XG4gICAgQHF1ZXN0aW9ucyAgICA9IG9wdGlvbnMucXVlc3Rpb25zXG5cbiAgICBAcHJvdG90eXBlID0gQHN1YnRlc3QuZ2V0KFwicHJvdG90eXBlXCIpXG5cbiAgICBAcHJvdG9WaWV3cyA9IFRhbmdlcmluZS5jb25maWcuZ2V0KFwicHJvdG90eXBlVmlld3NcIilcblxuICAgIEBwcm90b3R5cGVSZW5kZXJlZCA9IGZhbHNlXG5cblxuICAgIGlmIEBwcm90b3R5cGUgPT0gXCJncmlkXCJcbiAgICAgIEByZXN1bHQgPSBuZXcgS2xhc3NSZXN1bHRcbiAgICAgICAgcHJvdG90eXBlICAgIDogXCJncmlkXCJcbiAgICAgICAgc3RhcnRUaW1lICAgIDogKG5ldyBEYXRlKCkpLmdldFRpbWUoKVxuICAgICAgICBpdGVtVHlwZSAgICAgOiBAc3VidGVzdC5nZXQoXCJpdGVtVHlwZVwiKVxuICAgICAgICByZXBvcnRUeXBlICAgOiBAc3VidGVzdC5nZXQoXCJyZXBvcnRUeXBlXCIpXG4gICAgICAgIHN0dWRlbnRJZCAgICA6IEBzdHVkZW50LmlkXG4gICAgICAgIHN1YnRlc3RJZCAgICA6IEBzdWJ0ZXN0LmlkXG4gICAgICAgIHBhcnQgICAgICAgICA6IEBzdWJ0ZXN0LmdldChcInBhcnRcIilcbiAgICAgICAga2xhc3NJZCAgICAgIDogQHN0dWRlbnQuZ2V0KFwia2xhc3NJZFwiKVxuICAgICAgICB0aW1lQWxsb3dlZCAgOiBAc3VidGVzdC5nZXQoXCJ0aW1lclwiKVxuICAgIGVsc2UgaWYgQHByb3RvdHlwZSA9PSBcInN1cnZleVwiXG4gICAgICBAcmVzdWx0ID0gbmV3IEtsYXNzUmVzdWx0XG4gICAgICAgIHByb3RvdHlwZSAgICA6IFwic3VydmV5XCJcbiAgICAgICAgc3RhcnRUaW1lICAgIDogKG5ldyBEYXRlKCkpLmdldFRpbWUoKVxuICAgICAgICBzdHVkZW50SWQgICAgOiBAc3R1ZGVudC5pZFxuICAgICAgICBzdWJ0ZXN0SWQgICAgOiBAc3VidGVzdC5pZFxuICAgICAgICBwYXJ0ICAgICAgICAgOiBAc3VidGVzdC5nZXQoXCJwYXJ0XCIpXG4gICAgICAgIGtsYXNzSWQgICAgICA6IEBzdHVkZW50LmdldChcImtsYXNzSWRcIilcbiAgICAgICAgaXRlbVR5cGUgICAgIDogQHN1YnRlc3QuZ2V0KFwiaXRlbVR5cGVcIilcbiAgICAgICAgcmVwb3J0VHlwZSAgIDogQHN1YnRlc3QuZ2V0KFwicmVwb3J0VHlwZVwiKVxuICAgICAgQHF1ZXN0aW9ucy5zb3J0KClcbiAgICAgIEByZW5kZXIoKVxuXG5cbiAgcmVuZGVyOiAtPlxuICAgIGVudW1lcmF0b3JIZWxwID0gaWYgKEBzdWJ0ZXN0LmdldChcImVudW1lcmF0b3JIZWxwXCIpIHx8IFwiXCIpICE9IFwiXCIgdGhlbiBcIjxidXR0b24gY2xhc3M9J3N1YnRlc3RfaGVscCBjb21tYW5kJz5oZWxwPC9idXR0b24+PGRpdiBjbGFzcz0nZW51bWVyYXRvcl9oZWxwJz4je0BzdWJ0ZXN0LmdldCAnZW51bWVyYXRvckhlbHAnfTwvZGl2PlwiIGVsc2UgXCJcIlxuICAgIHN0dWRlbnREaWFsb2cgID0gaWYgKEBzdWJ0ZXN0LmdldChcInN0dWRlbnREaWFsb2dcIikgIHx8IFwiXCIpICE9IFwiXCIgdGhlbiBcIjxkaXYgY2xhc3M9J3N0dWRlbnRfZGlhbG9nJz4je0BzdWJ0ZXN0LmdldCAnc3R1ZGVudERpYWxvZyd9PC9kaXY+XCIgZWxzZSBcIlwiXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxoMj4je0BzdWJ0ZXN0LmdldCAnbmFtZSd9PC9oMj5cbiAgICAgICN7ZW51bWVyYXRvckhlbHB9XG4gICAgICAje3N0dWRlbnREaWFsb2d9XG4gICAgXCJcblxuICAgICMgVXNlIHByb3RvdHlwZSBzcGVjaWZpYyB2aWV3cyBoZXJlXG4gICAgQHByb3RvdHlwZVZpZXcgPSBuZXcgd2luZG93W0Bwcm90b1ZpZXdzW0BzdWJ0ZXN0LmdldCAncHJvdG90eXBlJ11bJ3J1biddXVxuICAgICAgbW9kZWw6IEBzdWJ0ZXN0XG4gICAgICBwYXJlbnQ6IEBcbiAgICBAcHJvdG90eXBlVmlldy5vbiBcInJlbmRlcmVkXCIsIEBvblByb3RvdHlwZVJlbmRlcmVkXG4gICAgQHByb3RvdHlwZVZpZXcucmVuZGVyKClcbiAgICBAJGVsLmFwcGVuZCBAcHJvdG90eXBlVmlldy5lbFxuICAgIEBwcm90b3R5cGVSZW5kZXJlZCA9IHRydWVcblxuICAgIEAkZWwuYXBwZW5kIFwiPGJ1dHRvbiBjbGFzcz0nZG9uZSBuYXZpZ2F0aW9uJz5Eb25lPC9idXR0b24+IDxidXR0b24gY2xhc3M9J2NhbmNlbCBuYXZpZ2F0aW9uJz5DYW5jZWw8L2J1dHRvbj5cIlxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgb25Qcm90b3R5cGVSZW5kZXJlZDogPT5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICBnZXRHcmlkU2NvcmU6IC0+IFxuICAgIHJldHVybiBmYWxzZSBpZiBub3QgQGxpbmtlZFJlc3VsdC5nZXQoXCJzdWJ0ZXN0RGF0YVwiKT8gIyBubyByZXN1bHQgZm91bmRcbiAgICByZXN1bHQgPSBAbGlua2VkUmVzdWx0LmdldChcInN1YnRlc3REYXRhXCIpWydhdHRlbXB0ZWQnXSB8fCAwIFxuICAgIHJldHVybiByZXN1bHRcblxuICBncmlkV2FzQXV0b3N0b3BwZWQ6IC0+IEBsaW5rZWRSZXN1bHQuZ2V0KFwic3VidGVzdERhdGFcIik/WydhdXRvX3N0b3AnXSB8fCAwXG5cbiAgb25DbG9zZTogLT5cbiAgICBAcHJvdG90eXBlVmlldz8uY2xvc2U/KClcblxuICBpc1ZhbGlkOiAtPlxuICAgIGlmIG5vdCBAcHJvdG90eXBlUmVuZGVyZWQgdGhlbiByZXR1cm4gZmFsc2VcbiAgICBpZiBAcHJvdG90eXBlVmlldy5pc1ZhbGlkP1xuICAgICAgcmV0dXJuIEBwcm90b3R5cGVWaWV3LmlzVmFsaWQoKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHRydWVcblxuICBnZXRTa2lwcGVkOiAtPlxuICAgIGlmIEBwcm90b3R5cGVWaWV3LmdldFNraXBwZWQ/XG4gICAgICByZXR1cm4gQHByb3RvdHlwZVZpZXcuZ2V0U2tpcHBlZCgpXG4gICAgZWxzZVxuICAgICAgdGhyb3cgXCJQcm90b3R5cGUgc2tpcHBpbmcgbm90IGltcGxlbWVudGVkXCJcblxuICBjYW5jZWw6IC0+XG4gICAgaWYgQHN0dWRlbnQuaWQgPT0gXCJ0ZXN0XCJcbiAgICAgIGhpc3RvcnkuYmFjaygpXG4gICAgICByZXR1cm5cblxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJjbGFzcy8je0BzdHVkZW50LmdldCgna2xhc3NJZCcpfS8je0BzdWJ0ZXN0LmdldCgncGFydCcpfVwiLCB0cnVlXG5cbiAgZG9uZTogLT5cbiAgICBpZiBAc3R1ZGVudC5pZCA9PSBcInRlc3RcIlxuICAgICAgaGlzdG9yeS5iYWNrKClcbiAgICAgIHJldHVyblxuXG4gICAgaWYgQGlzVmFsaWQoKVxuICAgICAgIyBHYXVyYW50ZWUgc2luZ2xlIFwibmV3XCIgcmVzdWx0XG4gICAgICBUYW5nZXJpbmUuJGRiLnZpZXcgXCIje1RhbmdlcmluZS5kZXNpZ25fZG9jfS9yZXN1bHRzQnlTdHVkZW50U3VidGVzdFwiLFxuICAgICAgICBrZXkgOiBbQHN0dWRlbnQuaWQsQHN1YnRlc3QuaWRdXG4gICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgIHJvd3MgPSBkYXRhLnJvd3NcbiAgICAgICAgICBmb3IgZGF0dW0gaW4gcm93c1xuICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi5zYXZlRG9jICQuZXh0ZW5kKGRhdHVtLnZhbHVlLCBcIm9sZFwiOnRydWUpXG4gICAgICAgICAgIyBzYXZlIHRoaXMgcmVzdWx0XG4gICAgICAgICAgQHJlc3VsdC5hZGQgQHByb3RvdHlwZVZpZXcuZ2V0UmVzdWx0KCksID0+XG4gICAgICAgICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiY2xhc3MvI3tAc3R1ZGVudC5nZXQoJ2tsYXNzSWQnKX0vI3tAc3VidGVzdC5nZXQoJ3BhcnQnKX1cIiwgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIEBwcm90b3R5cGVWaWV3LnNob3dFcnJvcnMoKSJdfQ==
