var DatetimeRunView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DatetimeRunView = (function(superClass) {
  extend(DatetimeRunView, superClass);

  function DatetimeRunView() {
    return DatetimeRunView.__super__.constructor.apply(this, arguments);
  }

  DatetimeRunView.prototype.className = "datetime";

  DatetimeRunView.prototype.i18n = function() {
    return this.text = {
      year: t("DatetimeRunView.label.year"),
      month: t("DatetimeRunView.label.month"),
      day: t("DatetimeRunView.label.day"),
      time: t("DatetimeRunView.label.time")
    };
  };

  DatetimeRunView.prototype.initialize = function(options) {
    this.i18n();
    this.model = options.model;
    this.parent = options.parent;
    return this.dataEntry = options.dataEntry;
  };

  DatetimeRunView.prototype.render = function() {
    var dateTime, day, m, minutes, month, months, previous, time, year;
    dateTime = new Date();
    year = dateTime.getFullYear();
    months = [t("jan"), t("feb"), t("mar"), t("apr"), t("may"), t("jun"), t("jul"), t("aug"), t("sep"), t("oct"), t("nov"), t("dec")];
    month = months[dateTime.getMonth()];
    day = dateTime.getDate();
    minutes = dateTime.getMinutes();
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    time = dateTime.getHours() + ":" + minutes;
    if (!this.dataEntry) {
      previous = this.parent.parent.result.getByHash(this.model.get('hash'));
      if (previous) {
        year = previous.year;
        month = previous.month;
        day = previous.day;
        time = previous.time;
      }
    }
    this.$el.html("<div class='question'> <table> <tr> <td><label for='year'>" + this.text.year + "</label><input id='year' value='" + year + "'></td> <td> <label for='month'>" + this.text.month + "</label><br> <select id='month' value='" + month + "'>" + (((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = months.length; i < len; i++) {
        m = months[i];
        results.push("<option value='" + m + "' " + ((m === month ? "selected='selected'" : void 0) || '') + ">" + (m.titleize()) + " </option>");
      }
      return results;
    })()).join('')) + "</select> </td> <td><label for='day'>" + this.text.day + "</label><input id='day' type='day' value='" + day + "'></td> </tr> <tr> <td><label for='time'>" + this.text.time + "</label><br><input type='text' id='time' value='" + time + "'></td> </tr> </table> </div>");
    this.trigger("rendered");
    return this.trigger("ready");
  };

  DatetimeRunView.prototype.getResult = function() {
    return {
      "year": this.$el.find("#year").val(),
      "month": this.$el.find("#month").val(),
      "day": this.$el.find("#day").val(),
      "time": this.$el.find("#time").val()
    };
  };

  DatetimeRunView.prototype.getSkipped = function() {
    return {
      "year": "skipped",
      "month": "skipped",
      "day": "skipped",
      "time": "skipped"
    };
  };

  DatetimeRunView.prototype.isValid = function() {
    return true;
  };

  DatetimeRunView.prototype.showErrors = function() {
    return true;
  };

  DatetimeRunView.prototype.next = function() {
    console.log("next!!");
    this.prototypeView.on("click .next", (function(_this) {
      return function() {
        console.log("clickme!");
        return _this.next();
      };
    })(this));
    return this.parent.next();
  };

  DatetimeRunView.prototype.back = function() {
    return this.parent.back();
  };

  return DatetimeRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9EYXRldGltZVJ1blZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsZUFBQTtFQUFBOzs7QUFBTTs7Ozs7Ozs0QkFFSixTQUFBLEdBQVc7OzRCQUVYLElBQUEsR0FBTSxTQUFBO1dBRUosSUFBQyxDQUFBLElBQUQsR0FDRTtNQUFBLElBQUEsRUFBTyxDQUFBLENBQUUsNEJBQUYsQ0FBUDtNQUNBLEtBQUEsRUFBUSxDQUFBLENBQUUsNkJBQUYsQ0FEUjtNQUVBLEdBQUEsRUFBTSxDQUFBLENBQUUsMkJBQUYsQ0FGTjtNQUdBLElBQUEsRUFBTyxDQUFBLENBQUUsNEJBQUYsQ0FIUDs7RUFIRTs7NEJBUU4sVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUVWLElBQUMsQ0FBQSxJQUFELENBQUE7SUFFQSxJQUFDLENBQUEsS0FBRCxHQUFVLE9BQU8sQ0FBQztJQUNsQixJQUFDLENBQUEsTUFBRCxHQUFVLE9BQU8sQ0FBQztXQUNsQixJQUFDLENBQUEsU0FBRCxHQUFhLE9BQU8sQ0FBQztFQU5YOzs0QkFRWixNQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7SUFBQSxRQUFBLEdBQWUsSUFBQSxJQUFBLENBQUE7SUFDZixJQUFBLEdBQVcsUUFBUSxDQUFDLFdBQVQsQ0FBQTtJQUNYLE1BQUEsR0FBVyxDQUFDLENBQUEsQ0FBRSxLQUFGLENBQUQsRUFBVSxDQUFBLENBQUUsS0FBRixDQUFWLEVBQW1CLENBQUEsQ0FBRSxLQUFGLENBQW5CLEVBQTRCLENBQUEsQ0FBRSxLQUFGLENBQTVCLEVBQXFDLENBQUEsQ0FBRSxLQUFGLENBQXJDLEVBQThDLENBQUEsQ0FBRSxLQUFGLENBQTlDLEVBQXVELENBQUEsQ0FBRSxLQUFGLENBQXZELEVBQWdFLENBQUEsQ0FBRSxLQUFGLENBQWhFLEVBQXlFLENBQUEsQ0FBRSxLQUFGLENBQXpFLEVBQWtGLENBQUEsQ0FBRSxLQUFGLENBQWxGLEVBQTJGLENBQUEsQ0FBRSxLQUFGLENBQTNGLEVBQW9HLENBQUEsQ0FBRSxLQUFGLENBQXBHO0lBQ1gsS0FBQSxHQUFXLE1BQU8sQ0FBQSxRQUFRLENBQUMsUUFBVCxDQUFBLENBQUE7SUFDbEIsR0FBQSxHQUFXLFFBQVEsQ0FBQyxPQUFULENBQUE7SUFDWCxPQUFBLEdBQVcsUUFBUSxDQUFDLFVBQVQsQ0FBQTtJQUNYLElBQTRCLE9BQUEsR0FBVSxFQUF0QztNQUFBLE9BQUEsR0FBVyxHQUFBLEdBQU0sUUFBakI7O0lBQ0EsSUFBQSxHQUFXLFFBQVEsQ0FBQyxRQUFULENBQUEsQ0FBQSxHQUFzQixHQUF0QixHQUE0QjtJQUV2QyxJQUFBLENBQU8sSUFBQyxDQUFBLFNBQVI7TUFHRSxRQUFBLEdBQVcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQXRCLENBQWdDLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBaEM7TUFFWCxJQUFHLFFBQUg7UUFDRSxJQUFBLEdBQVEsUUFBUSxDQUFDO1FBQ2pCLEtBQUEsR0FBUSxRQUFRLENBQUM7UUFDakIsR0FBQSxHQUFRLFFBQVEsQ0FBQztRQUNqQixJQUFBLEdBQVEsUUFBUSxDQUFDLEtBSm5CO09BTEY7O0lBV0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsNERBQUEsR0FJc0IsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUo1QixHQUlpQyxrQ0FKakMsR0FJbUUsSUFKbkUsR0FJd0Usa0NBSnhFLEdBTXFCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FOM0IsR0FNaUMseUNBTmpDLEdBTzRCLEtBUDVCLEdBT2tDLElBUGxDLEdBT3FDLENBQUM7O0FBQUM7V0FBQSx3Q0FBQTs7cUJBQUEsaUJBQUEsR0FBa0IsQ0FBbEIsR0FBb0IsSUFBcEIsR0FBdUIsQ0FBQyxDQUEwQixDQUFBLEtBQUssS0FBOUIsR0FBQSxxQkFBQSxHQUFBLE1BQUQsQ0FBQSxJQUF5QyxFQUExQyxDQUF2QixHQUFvRSxHQUFwRSxHQUFzRSxDQUFDLENBQUMsQ0FBQyxRQUFGLENBQUEsQ0FBRCxDQUF0RSxHQUFvRjtBQUFwRjs7UUFBRCxDQUFpSCxDQUFDLElBQWxILENBQXVILEVBQXZILENBQUQsQ0FQckMsR0FPaUssdUNBUGpLLEdBU3FCLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FUM0IsR0FTK0IsNENBVC9CLEdBUzJFLEdBVDNFLEdBUytFLDJDQVQvRSxHQVlzQixJQUFDLENBQUEsSUFBSSxDQUFDLElBWjVCLEdBWWlDLGtEQVpqQyxHQVltRixJQVpuRixHQVl3RiwrQkFabEc7SUFpQkEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO1dBQ0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxPQUFUO0VBdkNNOzs0QkF5Q1IsU0FBQSxHQUFXLFNBQUE7QUFDVCxXQUFPO01BQ0wsTUFBQSxFQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBa0IsQ0FBQyxHQUFuQixDQUFBLENBREw7TUFFTCxPQUFBLEVBQVUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsUUFBVixDQUFtQixDQUFDLEdBQXBCLENBQUEsQ0FGTDtNQUdMLEtBQUEsRUFBVSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxNQUFWLENBQWlCLENBQUMsR0FBbEIsQ0FBQSxDQUhMO01BSUwsTUFBQSxFQUFVLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBa0IsQ0FBQyxHQUFuQixDQUFBLENBSkw7O0VBREU7OzRCQVFYLFVBQUEsR0FBWSxTQUFBO0FBQ1YsV0FBTztNQUNMLE1BQUEsRUFBVSxTQURMO01BRUwsT0FBQSxFQUFVLFNBRkw7TUFHTCxLQUFBLEVBQVUsU0FITDtNQUlMLE1BQUEsRUFBVSxTQUpMOztFQURHOzs0QkFRWixPQUFBLEdBQVMsU0FBQTtXQUNQO0VBRE87OzRCQUdULFVBQUEsR0FBWSxTQUFBO1dBQ1Y7RUFEVTs7NEJBR1osSUFBQSxHQUFNLFNBQUE7SUFDSixPQUFPLENBQUMsR0FBUixDQUFZLFFBQVo7SUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsYUFBbEIsRUFBb0MsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO1FBQ2xDLE9BQU8sQ0FBQyxHQUFSLENBQVksVUFBWjtlQUNBLEtBQUksQ0FBQyxJQUFMLENBQUE7TUFGa0M7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBDO1dBR0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQUE7RUFMSTs7NEJBTU4sSUFBQSxHQUFNLFNBQUE7V0FBRyxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBQTtFQUFIOzs7O0dBekZzQixRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9wcm90b3R5cGVzL0RhdGV0aW1lUnVuVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIERhdGV0aW1lUnVuVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiZGF0ZXRpbWVcIlxuXG4gIGkxOG46IC0+XG5cbiAgICBAdGV4dCA9IFxuICAgICAgeWVhciA6IHQoXCJEYXRldGltZVJ1blZpZXcubGFiZWwueWVhclwiKVxuICAgICAgbW9udGggOiB0KFwiRGF0ZXRpbWVSdW5WaWV3LmxhYmVsLm1vbnRoXCIpXG4gICAgICBkYXkgOiB0KFwiRGF0ZXRpbWVSdW5WaWV3LmxhYmVsLmRheVwiKVxuICAgICAgdGltZSA6IHQoXCJEYXRldGltZVJ1blZpZXcubGFiZWwudGltZVwiKVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQGkxOG4oKVxuXG4gICAgQG1vZGVsICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ID0gb3B0aW9ucy5wYXJlbnRcbiAgICBAZGF0YUVudHJ5ID0gb3B0aW9ucy5kYXRhRW50cnlcbiAgXG4gIHJlbmRlcjogLT5cbiAgICBkYXRlVGltZSA9IG5ldyBEYXRlKClcbiAgICB5ZWFyICAgICA9IGRhdGVUaW1lLmdldEZ1bGxZZWFyKClcbiAgICBtb250aHMgICA9IFt0KFwiamFuXCIpLHQoXCJmZWJcIiksdChcIm1hclwiKSx0KFwiYXByXCIpLHQoXCJtYXlcIiksdChcImp1blwiKSx0KFwianVsXCIpLHQoXCJhdWdcIiksdChcInNlcFwiKSx0KFwib2N0XCIpLHQoXCJub3ZcIiksdChcImRlY1wiKV1cbiAgICBtb250aCAgICA9IG1vbnRoc1tkYXRlVGltZS5nZXRNb250aCgpXVxuICAgIGRheSAgICAgID0gZGF0ZVRpbWUuZ2V0RGF0ZSgpXG4gICAgbWludXRlcyAgPSBkYXRlVGltZS5nZXRNaW51dGVzKClcbiAgICBtaW51dGVzICA9IFwiMFwiICsgbWludXRlcyBpZiBtaW51dGVzIDwgMTBcbiAgICB0aW1lICAgICA9IGRhdGVUaW1lLmdldEhvdXJzKCkgKyBcIjpcIiArIG1pbnV0ZXNcblxuICAgIHVubGVzcyBAZGF0YUVudHJ5XG5cblxuICAgICAgcHJldmlvdXMgPSBAcGFyZW50LnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcblxuICAgICAgaWYgcHJldmlvdXNcbiAgICAgICAgeWVhciAgPSBwcmV2aW91cy55ZWFyXG4gICAgICAgIG1vbnRoID0gcHJldmlvdXMubW9udGhcbiAgICAgICAgZGF5ICAgPSBwcmV2aW91cy5kYXlcbiAgICAgICAgdGltZSAgPSBwcmV2aW91cy50aW1lXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxkaXYgY2xhc3M9J3F1ZXN0aW9uJz5cbiAgICAgICAgPHRhYmxlPlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0ZD48bGFiZWwgZm9yPSd5ZWFyJz4je0B0ZXh0LnllYXJ9PC9sYWJlbD48aW5wdXQgaWQ9J3llYXInIHZhbHVlPScje3llYXJ9Jz48L3RkPlxuICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICA8bGFiZWwgZm9yPSdtb250aCc+I3tAdGV4dC5tb250aH08L2xhYmVsPjxicj5cbiAgICAgICAgICAgICAgPHNlbGVjdCBpZD0nbW9udGgnIHZhbHVlPScje21vbnRofSc+I3soXCI8b3B0aW9uIHZhbHVlPScje219JyAjeyhcInNlbGVjdGVkPSdzZWxlY3RlZCdcIiBpZiBtIGlzIG1vbnRoKSB8fCAnJ30+I3ttLnRpdGxlaXplKCl9IDwvb3B0aW9uPlwiIGZvciBtIGluIG1vbnRocykuam9pbignJyl9PC9zZWxlY3Q+XG4gICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgPHRkPjxsYWJlbCBmb3I9J2RheSc+I3tAdGV4dC5kYXl9PC9sYWJlbD48aW5wdXQgaWQ9J2RheScgdHlwZT0nZGF5JyB2YWx1ZT0nI3tkYXl9Jz48L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRkPjxsYWJlbCBmb3I9J3RpbWUnPiN7QHRleHQudGltZX08L2xhYmVsPjxicj48aW5wdXQgdHlwZT0ndGV4dCcgaWQ9J3RpbWUnIHZhbHVlPScje3RpbWV9Jz48L3RkPlxuICAgICAgICAgIDwvdHI+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICA8L2Rpdj5cbiAgICAgIFwiXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4gIFxuICBnZXRSZXN1bHQ6IC0+XG4gICAgcmV0dXJuIHtcbiAgICAgIFwieWVhclwiICA6IEAkZWwuZmluZChcIiN5ZWFyXCIpLnZhbCgpXG4gICAgICBcIm1vbnRoXCIgOiBAJGVsLmZpbmQoXCIjbW9udGhcIikudmFsKClcbiAgICAgIFwiZGF5XCIgICA6IEAkZWwuZmluZChcIiNkYXlcIikudmFsKClcbiAgICAgIFwidGltZVwiICA6IEAkZWwuZmluZChcIiN0aW1lXCIpLnZhbCgpXG4gICAgfVxuXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgcmV0dXJuIHtcbiAgICAgIFwieWVhclwiICA6IFwic2tpcHBlZFwiXG4gICAgICBcIm1vbnRoXCIgOiBcInNraXBwZWRcIlxuICAgICAgXCJkYXlcIiAgIDogXCJza2lwcGVkXCJcbiAgICAgIFwidGltZVwiICA6IFwic2tpcHBlZFwiXG4gICAgfVxuXG4gIGlzVmFsaWQ6IC0+XG4gICAgdHJ1ZVxuXG4gIHNob3dFcnJvcnM6IC0+XG4gICAgdHJ1ZVxuXG4gIG5leHQ6IC0+XG4gICAgY29uc29sZS5sb2coXCJuZXh0ISFcIilcbiAgICBAcHJvdG90eXBlVmlldy5vbiBcImNsaWNrIC5uZXh0XCIsICAgID0+XG4gICAgICBjb25zb2xlLmxvZyhcImNsaWNrbWUhXCIpXG4gICAgICB0aGlzLm5leHQoKVxuICAgIEBwYXJlbnQubmV4dCgpXG4gIGJhY2s6IC0+IEBwYXJlbnQuYmFjaygpXG4iXX0=
