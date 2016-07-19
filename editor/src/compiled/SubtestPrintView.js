var SubtestPrintView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SubtestPrintView = (function(superClass) {
  extend(SubtestPrintView, superClass);

  function SubtestPrintView() {
    return SubtestPrintView.__super__.constructor.apply(this, arguments);
  }

  SubtestPrintView.prototype.className = "SubtestPrintView";

  SubtestPrintView.prototype.initialize = function(options) {
    this.protoViews = Tangerine.config.prototypeViews;
    this.model = options.model;
    this.parent = options.parent;
    this.format = options.format;
    return this.prototypeRendered = false;
  };

  SubtestPrintView.prototype.render = function() {
    var displayCode, enumeratorHelp, skipButton, skippable, studentDialog;
    enumeratorHelp = (this.model.get("enumeratorHelp") || "") !== "" ? "<div class='enumerator_help_print'>" + (this.model.get('enumeratorHelp')) + "</div>" : "";
    studentDialog = (this.model.get("studentDialog") || "") !== "" ? "<div class='student_dialog_print'>" + (this.model.get('studentDialog')) + "</div>" : "";
    skipButton = "<button class='skip navigation'>Skip</button>";
    skippable = this.model.getBoolean("skippable");
    if (this.format === "content") {
      this.$el.html("<h2>" + (this.model.get('name')) + "</h2> " + (displayCode = this.model.get('displayCode'), (displayCode != null) && displayCode !== "" ? "Subtest Action on Display:<pre style='font-size:80%'>" + displayCode + "</pre>" : "") + " Enumerator Help:<br/> " + enumeratorHelp + " Student Dialog:<br/> " + studentDialog + " <div class='format-" + this.format + "' id='prototype_wrapper'></div> <hr/>");
    } else if (this.format === "backup") {
      this.$el.html("<div class='subtest-title'>" + (this.model.get("name")) + "</div> <div class='student-dialog'>" + studentDialog + "</div> <div class='format-" + this.format + "' id='prototype_wrapper'></div> <hr/>");
    } else {
      this.$el.append("<div class='format-" + this.format + "' id='prototype_wrapper'></div>");
    }
    console.log(this.model.get('prototype').humanize() + 'PrintView');
    this.prototypeView = new window[this.model.get('prototype').humanize() + 'PrintView']({
      model: this.model,
      parent: this
    });
    this.prototypeView.on("rendered", (function(_this) {
      return function() {
        return _this.trigger("rendered");
      };
    })(this));
    this.prototypeView.on("subRendered", (function(_this) {
      return function() {
        return _this.trigger("subRendered");
      };
    })(this));
    this.prototypeView.setElement(this.$el.find('#prototype_wrapper'));
    this.prototypeView.format = this.format;
    this.prototypeView.render();
    this.prototypeRendered = true;
    return this.trigger("rendered");
  };

  return SubtestPrintView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvU3VidGVzdFByaW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxnQkFBQTtFQUFBOzs7QUFBTTs7Ozs7Ozs2QkFFSixTQUFBLEdBQVk7OzZCQUVaLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFDVixJQUFDLENBQUEsVUFBRCxHQUFlLFNBQVMsQ0FBQyxNQUFNLENBQUM7SUFDaEMsSUFBQyxDQUFBLEtBQUQsR0FBZSxPQUFPLENBQUM7SUFDdkIsSUFBQyxDQUFBLE1BQUQsR0FBZSxPQUFPLENBQUM7SUFDdkIsSUFBQyxDQUFBLE1BQUQsR0FBZSxPQUFPLENBQUM7V0FFdkIsSUFBQyxDQUFBLGlCQUFELEdBQXFCO0VBTlg7OzZCQVFaLE1BQUEsR0FBUSxTQUFBO0FBRU4sUUFBQTtJQUFBLGNBQUEsR0FBb0IsQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxnQkFBWCxDQUFBLElBQWdDLEVBQWpDLENBQUEsS0FBd0MsRUFBM0MsR0FBbUQscUNBQUEsR0FBcUMsQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxnQkFBWCxDQUFELENBQXJDLEdBQWtFLFFBQXJILEdBQWtJO0lBQ25KLGFBQUEsR0FBb0IsQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxlQUFYLENBQUEsSUFBZ0MsRUFBakMsQ0FBQSxLQUF3QyxFQUEzQyxHQUFtRCxvQ0FBQSxHQUFvQyxDQUFDLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGVBQVgsQ0FBRCxDQUFwQyxHQUFnRSxRQUFuSCxHQUFnSTtJQUNqSixVQUFBLEdBQWE7SUFDYixTQUFBLEdBQVksSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFQLENBQWtCLFdBQWxCO0lBRVosSUFBRyxJQUFDLENBQUEsTUFBRCxLQUFXLFNBQWQ7TUFFRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxNQUFBLEdBQ0gsQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQUQsQ0FERyxHQUNnQixRQURoQixHQUVQLENBQ0MsV0FBQSxHQUFjLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGFBQVgsQ0FBZCxFQUNHLHFCQUFBLElBQWlCLFdBQUEsS0FBaUIsRUFBckMsR0FDRSx1REFBQSxHQUF3RCxXQUF4RCxHQUFvRSxRQUR0RSxHQUdFLEVBTEgsQ0FGTyxHQVFQLHlCQVJPLEdBVU4sY0FWTSxHQVVTLHdCQVZULEdBWU4sYUFaTSxHQVlRLHNCQVpSLEdBYWEsSUFBQyxDQUFBLE1BYmQsR0FhcUIsdUNBYi9CLEVBRkY7S0FBQSxNQW1CSyxJQUFHLElBQUMsQ0FBQSxNQUFELEtBQVcsUUFBZDtNQUNILElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLDZCQUFBLEdBQ29CLENBQUMsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsTUFBWCxDQUFELENBRHBCLEdBQ3VDLHFDQUR2QyxHQUVzQixhQUZ0QixHQUVvQyw0QkFGcEMsR0FHYSxJQUFDLENBQUEsTUFIZCxHQUdxQix1Q0FIL0IsRUFERztLQUFBLE1BQUE7TUFTSCxJQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBWSxxQkFBQSxHQUNXLElBQUMsQ0FBQSxNQURaLEdBQ21CLGlDQUQvQixFQVRHOztJQWNMLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsV0FBWCxDQUF1QixDQUFDLFFBQXhCLENBQUEsQ0FBQSxHQUFxQyxXQUFqRDtJQUVBLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsTUFBTyxDQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBdUIsQ0FBQyxRQUF4QixDQUFBLENBQUEsR0FBcUMsV0FBckMsQ0FBUCxDQUNuQjtNQUFBLEtBQUEsRUFBTyxJQUFDLENBQUEsS0FBUjtNQUNBLE1BQUEsRUFBUSxJQURSO0tBRG1CO0lBR3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsRUFBZixDQUFrQixVQUFsQixFQUFpQyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUE7ZUFBRyxLQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7TUFBSDtJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakM7SUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsYUFBbEIsRUFBaUMsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO2VBQUcsS0FBQyxDQUFBLE9BQUQsQ0FBUyxhQUFUO01BQUg7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpDO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxVQUFmLENBQTBCLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLG9CQUFWLENBQTFCO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEdBQXdCLElBQUMsQ0FBQTtJQUN6QixJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBQTtJQUNBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtXQUVyQixJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFwRE07Ozs7R0FacUIsUUFBUSxDQUFDIiwiZmlsZSI6InN1YnRlc3QvU3VidGVzdFByaW50Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFN1YnRlc3RQcmludFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJTdWJ0ZXN0UHJpbnRWaWV3XCJcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAcHJvdG9WaWV3cyAgPSBUYW5nZXJpbmUuY29uZmlnLnByb3RvdHlwZVZpZXdzXG4gICAgQG1vZGVsICAgICAgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgICAgICA9IG9wdGlvbnMucGFyZW50XG4gICAgQGZvcm1hdCAgICAgID0gb3B0aW9ucy5mb3JtYXRcblxuICAgIEBwcm90b3R5cGVSZW5kZXJlZCA9IGZhbHNlXG5cbiAgcmVuZGVyOiAtPlxuICAgICAgXG4gICAgZW51bWVyYXRvckhlbHAgPSBpZiAoQG1vZGVsLmdldChcImVudW1lcmF0b3JIZWxwXCIpIHx8IFwiXCIpICE9IFwiXCIgdGhlbiBcIjxkaXYgY2xhc3M9J2VudW1lcmF0b3JfaGVscF9wcmludCc+I3tAbW9kZWwuZ2V0ICdlbnVtZXJhdG9ySGVscCd9PC9kaXY+XCIgZWxzZSBcIlwiXG4gICAgc3R1ZGVudERpYWxvZyAgPSBpZiAoQG1vZGVsLmdldChcInN0dWRlbnREaWFsb2dcIikgIHx8IFwiXCIpICE9IFwiXCIgdGhlbiBcIjxkaXYgY2xhc3M9J3N0dWRlbnRfZGlhbG9nX3ByaW50Jz4je0Btb2RlbC5nZXQgJ3N0dWRlbnREaWFsb2cnfTwvZGl2PlwiIGVsc2UgXCJcIlxuICAgIHNraXBCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J3NraXAgbmF2aWdhdGlvbic+U2tpcDwvYnV0dG9uPlwiXG4gICAgc2tpcHBhYmxlID0gQG1vZGVsLmdldEJvb2xlYW4oXCJza2lwcGFibGVcIilcblxuICAgIGlmIEBmb3JtYXQgaXMgXCJjb250ZW50XCJcblxuICAgICAgQCRlbC5odG1sIFwiXG4gICAgICAgIDxoMj4je0Btb2RlbC5nZXQgJ25hbWUnfTwvaDI+XG4gICAgICAgICN7XG4gICAgICAgICAgZGlzcGxheUNvZGUgPSBAbW9kZWwuZ2V0ICdkaXNwbGF5Q29kZSdcbiAgICAgICAgICBpZiBkaXNwbGF5Q29kZT8gYW5kIGRpc3BsYXlDb2RlIGlzbnQgXCJcIlxuICAgICAgICAgICAgXCJTdWJ0ZXN0IEFjdGlvbiBvbiBEaXNwbGF5OjxwcmUgc3R5bGU9J2ZvbnQtc2l6ZTo4MCUnPiN7ZGlzcGxheUNvZGV9PC9wcmU+XCJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBcIlwiXG4gICAgICAgIH1cbiAgICAgICAgRW51bWVyYXRvciBIZWxwOjxici8+XG4gICAgICAgICN7ZW51bWVyYXRvckhlbHB9XG4gICAgICAgIFN0dWRlbnQgRGlhbG9nOjxici8+XG4gICAgICAgICN7c3R1ZGVudERpYWxvZ31cbiAgICAgICAgPGRpdiBjbGFzcz0nZm9ybWF0LSN7QGZvcm1hdH0nIGlkPSdwcm90b3R5cGVfd3JhcHBlcic+PC9kaXY+XG4gICAgICAgIDxoci8+XG4gICAgICBcIlxuXG4gICAgZWxzZSBpZiBAZm9ybWF0IGlzIFwiYmFja3VwXCJcbiAgICAgIEAkZWwuaHRtbCBcIlxuICAgICAgICA8ZGl2IGNsYXNzPSdzdWJ0ZXN0LXRpdGxlJz4je0Btb2RlbC5nZXQgXCJuYW1lXCJ9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J3N0dWRlbnQtZGlhbG9nJz4je3N0dWRlbnREaWFsb2d9PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2Zvcm1hdC0je0Bmb3JtYXR9JyBpZD0ncHJvdG90eXBlX3dyYXBwZXInPjwvZGl2PlxuICAgICAgICA8aHIvPlxuICAgICAgXCJcblxuICAgIGVsc2VcbiAgICAgIEAkZWwuYXBwZW5kIFwiXG4gICAgICAgIDxkaXYgY2xhc3M9J2Zvcm1hdC0je0Bmb3JtYXR9JyBpZD0ncHJvdG90eXBlX3dyYXBwZXInPjwvZGl2PlxuICAgICAgXCJcbiAgXG4gICAgIyBVc2UgcHJvdG90eXBlIHNwZWNpZmljIHZpZXdzIGhlcmVcbiAgICBjb25zb2xlLmxvZyBAbW9kZWwuZ2V0KCdwcm90b3R5cGUnKS5odW1hbml6ZSgpICsgJ1ByaW50VmlldydcblxuICAgIEBwcm90b3R5cGVWaWV3ID0gbmV3IHdpbmRvd1tAbW9kZWwuZ2V0KCdwcm90b3R5cGUnKS5odW1hbml6ZSgpICsgJ1ByaW50VmlldyddXG4gICAgICBtb2RlbDogQG1vZGVsXG4gICAgICBwYXJlbnQ6IEBcbiAgICBAcHJvdG90eXBlVmlldy5vbiBcInJlbmRlcmVkXCIsICAgID0+IEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgIEBwcm90b3R5cGVWaWV3Lm9uIFwic3ViUmVuZGVyZWRcIiwgPT4gQHRyaWdnZXIgXCJzdWJSZW5kZXJlZFwiXG4gICAgQHByb3RvdHlwZVZpZXcuc2V0RWxlbWVudChAJGVsLmZpbmQoJyNwcm90b3R5cGVfd3JhcHBlcicpKVxuICAgIEBwcm90b3R5cGVWaWV3LmZvcm1hdCA9IEBmb3JtYXRcbiAgICBAcHJvdG90eXBlVmlldy5yZW5kZXIoKVxuICAgIEBwcm90b3R5cGVSZW5kZXJlZCA9IHRydWVcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuIl19
