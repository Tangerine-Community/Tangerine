var KlassMenuView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassMenuView = (function(superClass) {
  extend(KlassMenuView, superClass);

  function KlassMenuView() {
    return KlassMenuView.__super__.constructor.apply(this, arguments);
  }

  KlassMenuView.prototype.className = "KlassMenuView";

  KlassMenuView.prototype.events = {
    'click .registration': 'gotoKlasses'
  };

  KlassMenuView.prototype.gotoKlasses = function() {
    return Tangerine.router.navigate("class", true);
  };

  KlassMenuView.prototype.initialize = function(options) {};

  KlassMenuView.prototype.render = function() {
    this.$el.html("<h1>Tangerine Class</h1> <button class='collect command'>Collect</button> <button class='manage command'>Manage</button> <button class='reports command'>Reports</button> <button class='advice command'>Advice</button> <button class='registration command'>Class Registration</button>");
    return this.trigger("rendered");
  };

  return KlassMenuView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtsYXNzL0tsYXNzTWVudVZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsYUFBQTtFQUFBOzs7QUFBTTs7Ozs7OzswQkFFSixTQUFBLEdBQVk7OzBCQUVaLE1BQUEsR0FDRTtJQUFBLHFCQUFBLEVBQXdCLGFBQXhCOzs7MEJBRUYsV0FBQSxHQUFhLFNBQUE7V0FDWCxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLE9BQTFCLEVBQW1DLElBQW5DO0VBRFc7OzBCQUdiLFVBQUEsR0FBWSxTQUFFLE9BQUYsR0FBQTs7MEJBRVosTUFBQSxHQUFRLFNBQUE7SUFDTixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSwyUkFBVjtXQVNBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQVZNOzs7O0dBWmtCLFFBQVEsQ0FBQyIsImZpbGUiOiJrbGFzcy9LbGFzc01lbnVWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgS2xhc3NNZW51VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIktsYXNzTWVudVZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLnJlZ2lzdHJhdGlvbicgOiAnZ290b0tsYXNzZXMnXG5cbiAgZ290b0tsYXNzZXM6IC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImNsYXNzXCIsIHRydWVcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuXG4gIHJlbmRlcjogLT5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICA8aDE+VGFuZ2VyaW5lIENsYXNzPC9oMT5cbiAgICA8YnV0dG9uIGNsYXNzPSdjb2xsZWN0IGNvbW1hbmQnPkNvbGxlY3Q8L2J1dHRvbj5cbiAgICA8YnV0dG9uIGNsYXNzPSdtYW5hZ2UgY29tbWFuZCc+TWFuYWdlPC9idXR0b24+XG4gICAgPGJ1dHRvbiBjbGFzcz0ncmVwb3J0cyBjb21tYW5kJz5SZXBvcnRzPC9idXR0b24+XG4gICAgPGJ1dHRvbiBjbGFzcz0nYWR2aWNlIGNvbW1hbmQnPkFkdmljZTwvYnV0dG9uPlxuICAgIDxidXR0b24gY2xhc3M9J3JlZ2lzdHJhdGlvbiBjb21tYW5kJz5DbGFzcyBSZWdpc3RyYXRpb248L2J1dHRvbj5cbiAgICBcbiAgICBcIlxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuIl19
