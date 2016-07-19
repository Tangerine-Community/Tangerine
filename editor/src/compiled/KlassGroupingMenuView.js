var KlassGroupingMenuView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassGroupingMenuView = (function(superClass) {
  extend(KlassGroupingMenuView, superClass);

  function KlassGroupingMenuView() {
    return KlassGroupingMenuView.__super__.constructor.apply(this, arguments);
  }

  KlassGroupingMenuView.prototype.className = "KlassGroupingMenuView";

  KlassGroupingMenuView.prototype.events = {
    'change .part_selector': 'gotoKlassGroupingReport'
  };

  KlassGroupingMenuView.prototype.gotoKlassGroupingReport = function(event) {
    return Tangerine.router.navigate(("report/klassGrouping/" + this.klass.id + "/") + this.$el.find(event.target).find(":selected").attr("data-part"), true);
  };

  KlassGroupingMenuView.prototype.initialize = function(options) {
    this.parent = options.parent;
    this.klass = this.parent.options.klass;
    this.curricula = this.parent.options.curricula;
    this.currentPart = this.klass.calcCurrentPart();
    this.students = new Students;
    return this.students.fetch({
      klassId: this.klass.id,
      success: (function(_this) {
        return function() {
          var allSubtests;
          allSubtests = new Subtests;
          return allSubtests.fetch({
            success: function(collection) {
              var i, len, part, subtest, subtests;
              subtests = collection.where({
                curriculaId: _this.curricula.id
              });
              _this.parts = [];
              for (i = 0, len = subtests.length; i < len; i++) {
                subtest = subtests[i];
                part = subtest.get('part');
                if (_this.parts[part] == null) {
                  _this.parts[part] = {};
                }
                _this.parts[part]["id"] = subtest.id;
                if (_this.parts[part]["name"] != null) {
                  _this.parts[part]["name"] += " " + subtest.get("name");
                } else {
                  _this.parts[part]["name"] = subtest.get("name");
                }
                _this.parts[part]["reportType"] = subtest.get("reportType");
              }
              _this.ready = true;
              return _this.render();
            }
          });
        };
      })(this)
    });
  };

  KlassGroupingMenuView.prototype.render = function() {
    var flagForCurrent, html, i, len, part, ref, subtest;
    if (this.ready) {
      if ((this.students == null) || this.students.length === 0) {
        this.$el.html("Please add students to this class.");
        return;
      }
      html = "<select class='part_selector'> <option disabled='disabled' selected='selected'>Select an assessment</option>";
      ref = this.parts;
      for (part = i = 0, len = ref.length; i < len; part = ++i) {
        subtest = ref[part];
        if ((subtest != null ? subtest.id : void 0) != null) {
          flagForCurrent = this.currentPart === part ? "**" : '';
          html += "<option data-part='" + part + "' data-subtestId='" + subtest.id + "'>" + flagForCurrent + " " + part + " " + subtest.name + "</option>";
        }
      }
      html += "</select>";
      return this.$el.html(html);
    } else {
      return this.$el.html("<img src='images/loading.gif' class='loading'>");
    }
  };

  return KlassGroupingMenuView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcG9ydC9LbGFzc0dyb3VwaW5nTWVudVZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEscUJBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7a0NBRUosU0FBQSxHQUFXOztrQ0FFWCxNQUFBLEdBQ0U7SUFBQSx1QkFBQSxFQUEwQix5QkFBMUI7OztrQ0FFRix1QkFBQSxHQUF5QixTQUFDLEtBQUQ7V0FDdkIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFqQixDQUEwQixDQUFBLHVCQUFBLEdBQXdCLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBL0IsR0FBa0MsR0FBbEMsQ0FBQSxHQUF1QyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsTUFBaEIsQ0FBdUIsQ0FBQyxJQUF4QixDQUE2QixXQUE3QixDQUF5QyxDQUFDLElBQTFDLENBQStDLFdBQS9DLENBQWpFLEVBQThILElBQTlIO0VBRHVCOztrQ0FHekIsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxNQUFELEdBQWEsT0FBTyxDQUFDO0lBQ3JCLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDN0IsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUM3QixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUMsQ0FBQSxLQUFLLENBQUMsZUFBUCxDQUFBO0lBRWYsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJO1dBQ2hCLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUNFO01BQUEsT0FBQSxFQUFVLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBakI7TUFDQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ1AsY0FBQTtVQUFBLFdBQUEsR0FBYyxJQUFJO2lCQUNsQixXQUFXLENBQUMsS0FBWixDQUNFO1lBQUEsT0FBQSxFQUFTLFNBQUMsVUFBRDtBQUNQLGtCQUFBO2NBQUEsUUFBQSxHQUFXLFVBQVUsQ0FBQyxLQUFYLENBQ1Q7Z0JBQUEsV0FBQSxFQUFjLEtBQUMsQ0FBQSxTQUFTLENBQUMsRUFBekI7ZUFEUztjQUVYLEtBQUMsQ0FBQSxLQUFELEdBQVM7QUFDVCxtQkFBQSwwQ0FBQTs7Z0JBRUUsSUFBQSxHQUFPLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWjtnQkFFUCxJQUFpQyx5QkFBakM7a0JBQUEsS0FBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBLENBQVAsR0FBdUIsR0FBdkI7O2dCQUNBLEtBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxDQUFNLENBQUEsSUFBQSxDQUFiLEdBQXVCLE9BQU8sQ0FBQztnQkFFL0IsSUFBRyxpQ0FBSDtrQkFDRSxLQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBTSxDQUFBLE1BQUEsQ0FBYixJQUF3QixHQUFBLEdBQU0sT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLEVBRGhDO2lCQUFBLE1BQUE7a0JBR0UsS0FBQyxDQUFBLEtBQU0sQ0FBQSxJQUFBLENBQU0sQ0FBQSxNQUFBLENBQWIsR0FBdUIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLEVBSHpCOztnQkFJQSxLQUFDLENBQUEsS0FBTSxDQUFBLElBQUEsQ0FBTSxDQUFBLFlBQUEsQ0FBYixHQUE2QixPQUFPLENBQUMsR0FBUixDQUFZLFlBQVo7QUFYL0I7Y0FhQSxLQUFDLENBQUEsS0FBRCxHQUFTO3FCQUNULEtBQUMsQ0FBQSxNQUFELENBQUE7WUFsQk8sQ0FBVDtXQURGO1FBRk87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFQ7S0FERjtFQVBVOztrQ0FnQ1osTUFBQSxHQUFRLFNBQUE7QUFFTixRQUFBO0lBQUEsSUFBRyxJQUFDLENBQUEsS0FBSjtNQUdFLElBQU8sdUJBQUosSUFBa0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLEtBQW9CLENBQXpDO1FBQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsb0NBQVY7QUFDQSxlQUZGOztNQUlBLElBQUEsR0FBTztBQUlQO0FBQUEsV0FBQSxtREFBQTs7UUFDRSxJQUFHLCtDQUFIO1VBQ0UsY0FBQSxHQUFvQixJQUFDLENBQUEsV0FBRCxLQUFnQixJQUFuQixHQUE2QixJQUE3QixHQUF1QztVQUN4RCxJQUFBLElBQVEscUJBQUEsR0FBc0IsSUFBdEIsR0FBMkIsb0JBQTNCLEdBQStDLE9BQU8sQ0FBQyxFQUF2RCxHQUEwRCxJQUExRCxHQUE4RCxjQUE5RCxHQUE2RSxHQUE3RSxHQUFnRixJQUFoRixHQUFxRixHQUFyRixHQUF3RixPQUFPLENBQUMsSUFBaEcsR0FBcUcsWUFGL0c7O0FBREY7TUFJQSxJQUFBLElBQVE7YUFFUixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxJQUFWLEVBakJGO0tBQUEsTUFBQTthQW1CRSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxnREFBVixFQW5CRjs7RUFGTTs7OztHQTFDMEIsUUFBUSxDQUFDIiwiZmlsZSI6InJlcG9ydC9LbGFzc0dyb3VwaW5nTWVudVZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBLbGFzc0dyb3VwaW5nTWVudVZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIktsYXNzR3JvdXBpbmdNZW51Vmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjaGFuZ2UgLnBhcnRfc2VsZWN0b3InIDogJ2dvdG9LbGFzc0dyb3VwaW5nUmVwb3J0J1xuXG4gIGdvdG9LbGFzc0dyb3VwaW5nUmVwb3J0OiAoZXZlbnQpIC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcInJlcG9ydC9rbGFzc0dyb3VwaW5nLyN7QGtsYXNzLmlkfS9cIiArIEAkZWwuZmluZChldmVudC50YXJnZXQpLmZpbmQoXCI6c2VsZWN0ZWRcIikuYXR0cihcImRhdGEtcGFydFwiKSwgdHJ1ZVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBwYXJlbnQgICAgPSBvcHRpb25zLnBhcmVudFxuICAgIEBrbGFzcyAgICAgPSBAcGFyZW50Lm9wdGlvbnMua2xhc3NcbiAgICBAY3VycmljdWxhID0gQHBhcmVudC5vcHRpb25zLmN1cnJpY3VsYVxuICAgIEBjdXJyZW50UGFydCA9IEBrbGFzcy5jYWxjQ3VycmVudFBhcnQoKVxuXG4gICAgQHN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgQHN0dWRlbnRzLmZldGNoXG4gICAgICBrbGFzc0lkIDogQGtsYXNzLmlkXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuICAgICAgICAgICAgc3VidGVzdHMgPSBjb2xsZWN0aW9uLndoZXJlIFxuICAgICAgICAgICAgICBjdXJyaWN1bGFJZCA6IEBjdXJyaWN1bGEuaWRcbiAgICAgICAgICAgIEBwYXJ0cyA9IFtdXG4gICAgICAgICAgICBmb3Igc3VidGVzdCBpbiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgcGFydCA9IHN1YnRlc3QuZ2V0KCdwYXJ0JylcblxuICAgICAgICAgICAgICBAcGFydHNbcGFydF0gICAgICAgICA9IHt9IGlmIG5vdCBAcGFydHNbcGFydF0/XG4gICAgICAgICAgICAgIEBwYXJ0c1twYXJ0XVtcImlkXCJdICAgPSBzdWJ0ZXN0LmlkXG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBpZiBAcGFydHNbcGFydF1bXCJuYW1lXCJdPyBcbiAgICAgICAgICAgICAgICBAcGFydHNbcGFydF1bXCJuYW1lXCJdICs9IFwiIFwiICsgc3VidGVzdC5nZXQoXCJuYW1lXCIpXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAcGFydHNbcGFydF1bXCJuYW1lXCJdID0gc3VidGVzdC5nZXQoXCJuYW1lXCIpXG4gICAgICAgICAgICAgIEBwYXJ0c1twYXJ0XVtcInJlcG9ydFR5cGVcIl0gPSBzdWJ0ZXN0LmdldChcInJlcG9ydFR5cGVcIilcblxuICAgICAgICAgICAgQHJlYWR5ID0gdHJ1ZVxuICAgICAgICAgICAgQHJlbmRlcigpXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgaWYgQHJlYWR5XG5cbiAgICAgICMgcXVpY2sgZGF0YSBjaGVja1xuICAgICAgaWYgbm90IEBzdHVkZW50cz8gb3IgQHN0dWRlbnRzLmxlbmd0aCA9PSAwXG4gICAgICAgIEAkZWwuaHRtbCBcIlBsZWFzZSBhZGQgc3R1ZGVudHMgdG8gdGhpcyBjbGFzcy5cIlxuICAgICAgICByZXR1cm5cblxuICAgICAgaHRtbCA9IFwiXG4gICAgICAgIDxzZWxlY3QgY2xhc3M9J3BhcnRfc2VsZWN0b3InPlxuICAgICAgICAgIDxvcHRpb24gZGlzYWJsZWQ9J2Rpc2FibGVkJyBzZWxlY3RlZD0nc2VsZWN0ZWQnPlNlbGVjdCBhbiBhc3Nlc3NtZW50PC9vcHRpb24+XG4gICAgICAgICAgXCJcbiAgICAgIGZvciBzdWJ0ZXN0LCBwYXJ0IGluIEBwYXJ0c1xuICAgICAgICBpZiBzdWJ0ZXN0Py5pZD9cbiAgICAgICAgICBmbGFnRm9yQ3VycmVudCA9IGlmIEBjdXJyZW50UGFydCA9PSBwYXJ0IHRoZW4gXCIqKlwiIGVsc2UgJydcbiAgICAgICAgICBodG1sICs9IFwiPG9wdGlvbiBkYXRhLXBhcnQ9JyN7cGFydH0nIGRhdGEtc3VidGVzdElkPScje3N1YnRlc3QuaWR9Jz4je2ZsYWdGb3JDdXJyZW50fSAje3BhcnR9ICN7c3VidGVzdC5uYW1lfTwvb3B0aW9uPlwiXG4gICAgICBodG1sICs9IFwiPC9zZWxlY3Q+XCJcbiAgICAgICAgICBcbiAgICAgIEAkZWwuaHRtbCBodG1sXG4gICAgZWxzZVxuICAgICAgQCRlbC5odG1sIFwiPGltZyBzcmM9J2ltYWdlcy9sb2FkaW5nLmdpZicgY2xhc3M9J2xvYWRpbmcnPlwiIl19
