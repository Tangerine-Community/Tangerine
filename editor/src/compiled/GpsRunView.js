var GpsRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

GpsRunView = (function(superClass) {
  extend(GpsRunView, superClass);

  function GpsRunView() {
    this.poll = bind(this.poll, this);
    return GpsRunView.__super__.constructor.apply(this, arguments);
  }

  GpsRunView.prototype.className = "GpsRunView";

  GpsRunView.prototype.events = {
    'click .clear': 'clear'
  };

  GpsRunView.prototype.clear = function() {
    this.position = null;
    return this.updateDisplay();
  };

  GpsRunView.prototype.initialize = function(options) {
    this.i18n();
    this.model = options.model;
    this.parent = options.parent;
    this.dataEntry = options.dataEntry;
    this.position = null;
    return this.retryCount = 0;
  };

  GpsRunView.prototype.i18n = function() {
    return this.text = {
      "clear": t('GpsRunView.button.clear'),
      "good": t('GpsRunView.label.good'),
      "ok": t('GpsRunView.label.ok'),
      "poor": t('GpsRunView.label.poor'),
      "latitude": t('GpsRunView.label.latitude'),
      "longitude": t('GpsRunView.label.longitude'),
      "accuracy": t('GpsRunView.label.accuracy'),
      "meters": t('GpsRunView.label.meters'),
      "savedReading": t('GpsRunView.label.saved_reading'),
      "currentReading": t('GpsRunView.label.current_reading'),
      "bestReading": t('GpsRunView.label.best_reading'),
      "gpsStatus": t('GpsRunView.label.gps_status'),
      "gpsOk": t('GpsRunView.message.gps_ok'),
      "retrying": t('GpsRunView.message.retrying'),
      "searching": t('GpsRunView.message.searching'),
      "notSupported": _(t('GpsRunView.message.not_supported')).escape()
    };
  };

  GpsRunView.prototype.poll = function() {
    return navigator.geolocation.getCurrentPosition((function(_this) {
      return function(position) {
        _this.updateDisplay(position);
        _this.updatePosition(position);
        _this.updateStatus(_this.text.gpsOk);
        _this.retryCount = 0;
        if (!_this.stopPolling) {
          return setTimeout(_this.poll(), 5 * 1000);
        }
      };
    })(this), (function(_this) {
      return function(positionError) {
        _this.updateStatus(positionError.message);
        if (!_this.stopPolling) {
          setTimeout(_this.poll(), 5 * 1000);
        }
        return _this.retryCount++;
      };
    })(this), {
      maximumAge: 10 * 1000,
      timeout: 30 * 1000,
      enableHighAccuracy: true
    });
  };

  GpsRunView.prototype.easify = function(position) {
    var ref, ref1, ref2, ref3, ref4, ref5, ref6;
    return {
      lat: (position != null ? (ref = position.coords) != null ? ref.latitude : void 0 : void 0) != null ? position.coords.latitude : "...",
      long: (position != null ? (ref1 = position.coords) != null ? ref1.longitude : void 0 : void 0) != null ? position.coords.longitude : "...",
      alt: (position != null ? (ref2 = position.coords) != null ? ref2.altitude : void 0 : void 0) != null ? position.coords.altitude : "...",
      acc: (position != null ? (ref3 = position.coords) != null ? ref3.accuracy : void 0 : void 0) != null ? position.coords.accuracy : "...",
      altAcc: (position != null ? (ref4 = position.coords) != null ? ref4.altitudeAccuracy : void 0 : void 0) != null ? position.coords.altitudeAccuracy : "...",
      heading: (position != null ? (ref5 = position.coords) != null ? ref5.heading : void 0 : void 0) != null ? position.coords.heading : "...",
      speed: (position != null ? (ref6 = position.coords) != null ? ref6.speed : void 0 : void 0) != null ? position.coords.speed : "...",
      timestamp: (position != null ? position.timestamp : void 0) != null ? position.timestamp : "..."
    };
  };

  GpsRunView.prototype.updatePosition = function(newPosition) {
    var ref;
    newPosition = this.easify(newPosition);
    if (this.position == null) {
      this.position = newPosition;
    }
    if ((((newPosition != null ? newPosition.acc : void 0) != null) && (((ref = this.position) != null ? ref.acc : void 0) != null)) && newPosition.acc <= this.position.acc) {
      return this.position = newPosition;
    }
  };

  GpsRunView.prototype.updateDisplay = function(position) {
    var acc, data, el, html, i, j, lat, len, long, pos, positions, results;
    position = this.easify(position);
    positions = [
      {
        el: this.$el.find(".gps_current"),
        data: position
      }, {
        el: this.$el.find(".gps_best"),
        data: this.position
      }
    ];
    results = [];
    for (i = j = 0, len = positions.length; j < len; i = ++j) {
      pos = positions[i];
      data = pos.data;
      el = pos.el;
      lat = (data != null ? data.lat : void 0) ? parseFloat(data.lat).toFixed(4) : "...";
      long = (data != null ? data.long : void 0) ? parseFloat(data.long).toFixed(4) : "...";
      acc = (data != null ? data.acc : void 0) ? parseInt(data.acc) + (" " + this.text.meters) : "...";
      acc = acc + (parseInt(data != null ? data.acc : void 0) < 50 ? "(" + this.text.good + ")" : parseInt(data != null ? data.acc : void 0) > 100 ? "(" + this.text.poor + ")" : "(" + this.text.ok + ")");
      html = "<table> <tr><td>" + this.text.latitude + "</td> <td>" + lat + "</td></tr> <tr><td>" + this.text.longitude + "</td><td>" + long + "</td></tr> <tr><td>" + this.text.accuracy + "</td> <td>" + acc + "</td></tr> </table>";
      results.push(el.html(html));
    }
    return results;
  };

  GpsRunView.prototype.updateStatus = function(message) {
    var polling, retries;
    if (message == null) {
      message = '';
    }
    retries = this.retryCount > 0 ? t('GpsRunView.message.attempt', {
      count: this.retryCount + 1
    }) : "";
    polling = !this.stopPolling ? "<br>" + this.text.retrying + " " + retries : "";
    return this.$el.find(".status").html(message + polling);
  };

  GpsRunView.prototype.render = function() {
    var acc, lat, long, previous;
    if (!Modernizr.geolocation) {
      this.$el.html(this.text.notSupported);
      this.position = this.easify(null);
      this.trigger("rendered");
      return this.trigger("ready");
    } else {
      if (!this.dataEntry) {
        previous = this.parent.parent.result.getByHash(this.model.get('hash'));
      }
      if (previous) {
        lat = previous.lat;
        long = previous.long;
        acc = previous.acc;
        this.$el.html("<section> <h3>" + this.text.savedReading + "</h3> <div class='gps_saved'> <table> <tr><td>" + this.text.latitude + "</td> <td>" + lat + "</td></tr> <tr><td>" + this.text.longitude + "</td><td>" + long + "</td></tr> <tr><td>" + this.text.accuracy + "</td> <td>" + acc + "</td></tr> </table> </div>");
      } else {
        this.$el.html("<section> <h3>" + this.text.bestReading + "</h3> <div class='gps_best'></div><button class='clear command'>" + this.text.clear + "</button> <h3>" + this.text.currentReading + "</h3> <div class='gps_current'></div> </section> <section> <h2>" + this.text.gpsStatus + "</h2> <div class='status'>" + this.text.searching + "</div> </section>");
      }
      this.trigger("rendered");
      this.trigger("ready");
      return this.poll();
    }
  };

  GpsRunView.prototype.getResult = function() {
    var previous;
    previous = this.parent.parent.result.getByHash(this.model.get('hash'));
    if (previous) {
      return previous;
    }
    return this.position || {};
  };

  GpsRunView.prototype.getSkipped = function() {
    return this.position || {};
  };

  GpsRunView.prototype.onClose = function() {
    return this.stopPolling = true;
  };

  GpsRunView.prototype.isValid = function() {
    return true;
  };

  GpsRunView.prototype.showErrors = function() {
    return true;
  };

  return GpsRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9HcHNSdW5WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFVBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozt1QkFFSixTQUFBLEdBQVc7O3VCQUVYLE1BQUEsR0FBUTtJQUFBLGNBQUEsRUFBaUIsT0FBakI7Ozt1QkFFUixLQUFBLEdBQU8sU0FBQTtJQUNMLElBQUMsQ0FBQSxRQUFELEdBQVk7V0FDWixJQUFDLENBQUEsYUFBRCxDQUFBO0VBRks7O3VCQUlQLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFDVixJQUFDLENBQUEsSUFBRCxDQUFBO0lBQ0EsSUFBQyxDQUFBLEtBQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLE1BQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUM7SUFHckIsSUFBQyxDQUFBLFFBQUQsR0FBWTtXQUNaLElBQUMsQ0FBQSxVQUFELEdBQWM7RUFSSjs7dUJBVVosSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsSUFBRCxHQUNFO01BQUEsT0FBQSxFQUFVLENBQUEsQ0FBRSx5QkFBRixDQUFWO01BRUEsTUFBQSxFQUFtQixDQUFBLENBQUUsdUJBQUYsQ0FGbkI7TUFHQSxJQUFBLEVBQW1CLENBQUEsQ0FBRSxxQkFBRixDQUhuQjtNQUlBLE1BQUEsRUFBbUIsQ0FBQSxDQUFFLHVCQUFGLENBSm5CO01BS0EsVUFBQSxFQUFtQixDQUFBLENBQUUsMkJBQUYsQ0FMbkI7TUFNQSxXQUFBLEVBQW1CLENBQUEsQ0FBRSw0QkFBRixDQU5uQjtNQU9BLFVBQUEsRUFBbUIsQ0FBQSxDQUFFLDJCQUFGLENBUG5CO01BUUEsUUFBQSxFQUFtQixDQUFBLENBQUUseUJBQUYsQ0FSbkI7TUFVQSxjQUFBLEVBQW1CLENBQUEsQ0FBRSxnQ0FBRixDQVZuQjtNQVdBLGdCQUFBLEVBQW1CLENBQUEsQ0FBRSxrQ0FBRixDQVhuQjtNQVlB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RCxDQUFBLEVBM0NGOztFQUZNOzt1QkErQ1IsU0FBQSxHQUFXLFNBQUE7QUFDVCxRQUFBO0lBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUF0QixDQUFnQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxNQUFYLENBQWhDO0lBQ1gsSUFBbUIsUUFBbkI7QUFBQSxhQUFPLFNBQVA7O0FBQ0EsV0FBTyxJQUFDLENBQUEsUUFBRCxJQUFhO0VBSFg7O3VCQUtYLFVBQUEsR0FBWSxTQUFBO0FBQ1YsV0FBTyxJQUFDLENBQUEsUUFBRCxJQUFhO0VBRFY7O3VCQUdaLE9BQUEsR0FBUyxTQUFBO1dBQ1AsSUFBQyxDQUFBLFdBQUQsR0FBZTtFQURSOzt1QkFHVCxPQUFBLEdBQVMsU0FBQTtXQUNQO0VBRE87O3VCQUdULFVBQUEsR0FBWSxTQUFBO1dBQ1Y7RUFEVTs7OztHQXpMVyxRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9wcm90b3R5cGVzL0dwc1J1blZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBHcHNSdW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJHcHNSdW5WaWV3XCJcblxuICBldmVudHM6ICdjbGljayAuY2xlYXInIDogJ2NsZWFyJ1xuXG4gIGNsZWFyOiAtPlxuICAgIEBwb3NpdGlvbiA9IG51bGxcbiAgICBAdXBkYXRlRGlzcGxheSgpXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQGkxOG4oKVxuICAgIEBtb2RlbCAgICAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCAgICA9IG9wdGlvbnMucGFyZW50XG4gICAgQGRhdGFFbnRyeSA9IG9wdGlvbnMuZGF0YUVudHJ5XG5cblxuICAgIEBwb3NpdGlvbiA9IG51bGxcbiAgICBAcmV0cnlDb3VudCA9IDBcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIFwiY2xlYXJcIiA6IHQoJ0dwc1J1blZpZXcuYnV0dG9uLmNsZWFyJylcblxuICAgICAgXCJnb29kXCIgICAgICAgICAgIDogdCgnR3BzUnVuVmlldy5sYWJlbC5nb29kJylcbiAgICAgIFwib2tcIiAgICAgICAgICAgICA6IHQoJ0dwc1J1blZpZXcubGFiZWwub2snKVxuICAgICAgXCJwb29yXCIgICAgICAgICAgIDogdCgnR3BzUnVuVmlldy5sYWJlbC5wb29yJylcbiAgICAgIFwibGF0aXR1ZGVcIiAgICAgICA6IHQoJ0dwc1J1blZpZXcubGFiZWwubGF0aXR1ZGUnKVxuICAgICAgXCJsb25naXR1ZGVcIiAgICAgIDogdCgnR3BzUnVuVmlldy5sYWJlbC5sb25naXR1ZGUnKVxuICAgICAgXCJhY2N1cmFjeVwiICAgICAgIDogdCgnR3BzUnVuVmlldy5sYWJlbC5hY2N1cmFjeScpXG4gICAgICBcIm1ldGVyc1wiICAgICAgICAgOiB0KCdHcHNSdW5WaWV3LmxhYmVsLm1ldGVycycpXG5cbiAgICAgIFwic2F2ZWRSZWFkaW5nXCIgICA6IHQoJ0dwc1J1blZpZXcubGFiZWwuc2F2ZWRfcmVhZGluZycpXG4gICAgICBcImN1cnJlbnRSZWFkaW5nXCIgOiB0KCdHcHNSdW5WaWV3LmxhYmVsLmN1cnJlbnRfcmVhZGluZycpXG4gICAgICBcImJlc3RSZWFkaW5nXCIgICAgOiB0KCdHcHNSdW5WaWV3LmxhYmVsLmJlc3RfcmVhZGluZycpXG4gICAgICBcImdwc1N0YXR1c1wiICAgICAgOiB0KCdHcHNSdW5WaWV3LmxhYmVsLmdwc19zdGF0dXMnKVxuXG4gICAgICBcImdwc09rXCIgICAgICAgIDogdCgnR3BzUnVuVmlldy5tZXNzYWdlLmdwc19vaycpXG4gICAgICBcInJldHJ5aW5nXCIgICAgIDogdCgnR3BzUnVuVmlldy5tZXNzYWdlLnJldHJ5aW5nJylcbiAgICAgIFwic2VhcmNoaW5nXCIgICAgOiB0KCdHcHNSdW5WaWV3Lm1lc3NhZ2Uuc2VhcmNoaW5nJylcbiAgICAgIFwibm90U3VwcG9ydGVkXCIgOiBfKHQoJ0dwc1J1blZpZXcubWVzc2FnZS5ub3Rfc3VwcG9ydGVkJykpLmVzY2FwZSgpXG5cbiAgcG9sbDogPT4gIyBmdWxsIG9mIG1hZ2ljIG51bWJlcnNcblxuICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oXG4gICAgICAgIChwb3NpdGlvbikgPT5cbiAgICAgICAgICBAdXBkYXRlRGlzcGxheSBwb3NpdGlvblxuICAgICAgICAgIEB1cGRhdGVQb3NpdGlvbiBwb3NpdGlvblxuICAgICAgICAgIEB1cGRhdGVTdGF0dXMgQHRleHQuZ3BzT2tcbiAgICAgICAgICBAcmV0cnlDb3VudCA9IDBcbiAgICAgICAgICBzZXRUaW1lb3V0KEBwb2xsKCksIDUgKiAxMDAwKSB1bmxlc3MgQHN0b3BQb2xsaW5nICMgbm90IHJlY3Vyc2lvbiwgbm8gc3RhY2tvdmVyZmxvd1xuICAgICAgLFxuICAgICAgICAocG9zaXRpb25FcnJvcikgPT5cbiAgICAgICAgICBAdXBkYXRlU3RhdHVzIHBvc2l0aW9uRXJyb3IubWVzc2FnZVxuICAgICAgICAgIHNldFRpbWVvdXQoQHBvbGwoKSwgNSAqIDEwMDApICB1bmxlc3MgQHN0b3BQb2xsaW5nICAjIG5vdCByZWN1cnNpb24sIG5vIHN0YWNrb3ZlcmZsb3dcbiAgICAgICAgICBAcmV0cnlDb3VudCsrXG4gICAgICAsIFxuICAgICAgICBtYXhpbXVtQWdlICAgICAgICAgOiAxMCAqIDEwMDBcbiAgICAgICAgdGltZW91dCAgICAgICAgICAgIDogMzAgKiAxMDAwXG4gICAgICAgIGVuYWJsZUhpZ2hBY2N1cmFjeSA6IHRydWVcbiAgICApXG5cbiAgZWFzaWZ5OiAoIHBvc2l0aW9uICkgLT5cbiAgICByZXR1cm4ge1xuICAgICAgbGF0ICAgICAgIDogaWYgcG9zaXRpb24/LmNvb3Jkcz8ubGF0aXR1ZGU/IHRoZW4gcG9zaXRpb24uY29vcmRzLmxhdGl0dWRlIGVsc2UgXCIuLi5cIlxuICAgICAgbG9uZyAgICAgIDogaWYgcG9zaXRpb24/LmNvb3Jkcz8ubG9uZ2l0dWRlPyB0aGVuIHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGUgZWxzZSBcIi4uLlwiXG4gICAgICBhbHQgICAgICAgOiBpZiBwb3NpdGlvbj8uY29vcmRzPy5hbHRpdHVkZT8gdGhlbiBwb3NpdGlvbi5jb29yZHMuYWx0aXR1ZGUgZWxzZSBcIi4uLlwiXG4gICAgICBhY2MgICAgICAgOiBpZiBwb3NpdGlvbj8uY29vcmRzPy5hY2N1cmFjeT8gdGhlbiBwb3NpdGlvbi5jb29yZHMuYWNjdXJhY3kgZWxzZSBcIi4uLlwiXG4gICAgICBhbHRBY2MgICAgOiBpZiBwb3NpdGlvbj8uY29vcmRzPy5hbHRpdHVkZUFjY3VyYWN5PyB0aGVuIHBvc2l0aW9uLmNvb3Jkcy5hbHRpdHVkZUFjY3VyYWN5IGVsc2UgXCIuLi5cIlxuICAgICAgaGVhZGluZyAgIDogaWYgcG9zaXRpb24/LmNvb3Jkcz8uaGVhZGluZz8gdGhlbiBwb3NpdGlvbi5jb29yZHMuaGVhZGluZyBlbHNlIFwiLi4uXCJcbiAgICAgIHNwZWVkICAgICA6IGlmIHBvc2l0aW9uPy5jb29yZHM/LnNwZWVkPyB0aGVuIHBvc2l0aW9uLmNvb3Jkcy5zcGVlZCBlbHNlIFwiLi4uXCJcbiAgICAgIHRpbWVzdGFtcCA6IGlmIHBvc2l0aW9uPy50aW1lc3RhbXA/IHRoZW4gcG9zaXRpb24udGltZXN0YW1wIGVsc2UgXCIuLi5cIlxuICAgIH1cblxuICB1cGRhdGVQb3NpdGlvbjogKCBuZXdQb3NpdGlvbiApIC0+XG4gICAgbmV3UG9zaXRpb24gPSBAZWFzaWZ5KG5ld1Bvc2l0aW9uKVxuICAgIEBwb3NpdGlvbiA9IG5ld1Bvc2l0aW9uIHVubGVzcyBAcG9zaXRpb24/XG4gICAgIyBwcmVmZXIgbW9zdCBhY2N1cmF0ZSByZXN1bHRcbiAgICBpZiAobmV3UG9zaXRpb24/LmFjYz8gJiYgQHBvc2l0aW9uPy5hY2M/KSAmJiBuZXdQb3NpdGlvbi5hY2MgPD0gQHBvc2l0aW9uLmFjY1xuICAgICAgQHBvc2l0aW9uID0gbmV3UG9zaXRpb25cblxuICB1cGRhdGVEaXNwbGF5OiAocG9zaXRpb24pIC0+XG4gICAgcG9zaXRpb24gPSBAZWFzaWZ5IHBvc2l0aW9uXG4gICAgcG9zaXRpb25zID0gW1xuICAgICAgZWwgICA6IEAkZWwuZmluZChcIi5ncHNfY3VycmVudFwiKVxuICAgICAgZGF0YSA6IHBvc2l0aW9uXG4gICAgLFxuICAgICAgZWwgICA6IEAkZWwuZmluZChcIi5ncHNfYmVzdFwiKVxuICAgICAgZGF0YSA6IEBwb3NpdGlvblxuICAgIF1cblxuICAgIGZvciBwb3MsIGkgaW4gcG9zaXRpb25zXG5cbiAgICAgIGRhdGEgPSBwb3MuZGF0YVxuICAgICAgZWwgICA9IHBvcy5lbFxuXG4gICAgICBsYXQgID0gaWYgZGF0YT8ubGF0ICB0aGVuIHBhcnNlRmxvYXQoZGF0YS5sYXQpLnRvRml4ZWQoNCkgICBlbHNlIFwiLi4uXCJcbiAgICAgIGxvbmcgPSBpZiBkYXRhPy5sb25nIHRoZW4gcGFyc2VGbG9hdChkYXRhLmxvbmcpLnRvRml4ZWQoNCkgZWxzZSBcIi4uLlwiXG4gICAgICBhY2MgID0gaWYgZGF0YT8uYWNjICB0aGVuIHBhcnNlSW50KGRhdGEuYWNjKSArIFwiICN7QHRleHQubWV0ZXJzfVwiIFxuICAgICAgZWxzZSBcIi4uLlwiXG5cbiAgICAgIGFjYyA9IGFjYyArXG4gICAgICAgIGlmIHBhcnNlSW50KGRhdGE/LmFjYykgPCA1MCAjIG1hZ2ljIG51bWJlclxuICAgICAgICAgIFwiKCN7QHRleHQuZ29vZH0pXCJcbiAgICAgICAgZWxzZSBpZiBwYXJzZUludChkYXRhPy5hY2MpID4gMTAwICMgbWFnaWMgbnVtYmVyXG4gICAgICAgICAgXCIoI3tAdGV4dC5wb29yfSlcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgXCIoI3tAdGV4dC5va30pXCJcblxuICAgICAgaHRtbCA9IFwiXG4gICAgICAgIDx0YWJsZT5cbiAgICAgICAgICA8dHI+PHRkPiN7QHRleHQubGF0aXR1ZGV9PC90ZD4gPHRkPiN7bGF0fTwvdGQ+PC90cj5cbiAgICAgICAgICA8dHI+PHRkPiN7QHRleHQubG9uZ2l0dWRlfTwvdGQ+PHRkPiN7bG9uZ308L3RkPjwvdHI+XG4gICAgICAgICAgPHRyPjx0ZD4je0B0ZXh0LmFjY3VyYWN5fTwvdGQ+IDx0ZD4je2FjY308L3RkPjwvdHI+XG4gICAgICAgIDwvdGFibGU+XG4gICAgICBcIlxuXG4gICAgICBlbC5odG1sIGh0bWxcblxuICB1cGRhdGVTdGF0dXM6IChtZXNzYWdlID0gJycpIC0+XG4gICAgcmV0cmllcyA9IGlmIEByZXRyeUNvdW50ID4gMCB0aGVuIHQoJ0dwc1J1blZpZXcubWVzc2FnZS5hdHRlbXB0JywgY291bnQ6IEByZXRyeUNvdW50KzEpIGVsc2UgXCJcIlxuICAgIHBvbGxpbmcgPSBpZiBub3QgQHN0b3BQb2xsaW5nIHRoZW4gXCI8YnI+I3tAdGV4dC5yZXRyeWluZ30gI3tyZXRyaWVzfVwiIGVsc2UgXCJcIlxuICAgIEAkZWwuZmluZChcIi5zdGF0dXNcIikuaHRtbCBtZXNzYWdlICsgcG9sbGluZ1xuXG4gIHJlbmRlcjogLT5cblxuICAgIGlmIG5vdCBNb2Rlcm5penIuZ2VvbG9jYXRpb25cbiAgICAgIFxuICAgICAgQCRlbC5odG1sIEB0ZXh0Lm5vdFN1cHBvcnRlZFxuXG4gICAgICBAcG9zaXRpb24gPSBAZWFzaWZ5KG51bGwpXG5cbiAgICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgICAgQHRyaWdnZXIgXCJyZWFkeVwiXG5cbiAgICBlbHNlXG4gICAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgICBwcmV2aW91cyA9IEBwYXJlbnQucGFyZW50LnJlc3VsdC5nZXRCeUhhc2goQG1vZGVsLmdldCgnaGFzaCcpKVxuXG4gICAgICBpZiBwcmV2aW91c1xuICAgICAgICBsYXQgID0gcHJldmlvdXMubGF0XG4gICAgICAgIGxvbmcgPSBwcmV2aW91cy5sb25nXG4gICAgICAgIGFjYyAgPSBwcmV2aW91cy5hY2NcbiAgICAgICAgQCRlbC5odG1sIFwiXG4gICAgICAgICAgPHNlY3Rpb24+XG4gICAgICAgICAgICA8aDM+I3tAdGV4dC5zYXZlZFJlYWRpbmd9PC9oMz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9J2dwc19zYXZlZCc+XG4gICAgICAgICAgICAgIDx0YWJsZT5cbiAgICAgICAgICAgICAgICA8dHI+PHRkPiN7QHRleHQubGF0aXR1ZGV9PC90ZD4gPHRkPiN7bGF0fTwvdGQ+PC90cj5cbiAgICAgICAgICAgICAgICA8dHI+PHRkPiN7QHRleHQubG9uZ2l0dWRlfTwvdGQ+PHRkPiN7bG9uZ308L3RkPjwvdHI+XG4gICAgICAgICAgICAgICAgPHRyPjx0ZD4je0B0ZXh0LmFjY3VyYWN5fTwvdGQ+IDx0ZD4je2FjY308L3RkPjwvdHI+XG4gICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgXCJcbiAgICAgIGVsc2VcbiAgICAgICAgQCRlbC5odG1sIFwiXG4gICAgICAgICAgPHNlY3Rpb24+XG4gICAgICAgICAgICA8aDM+I3tAdGV4dC5iZXN0UmVhZGluZ308L2gzPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz0nZ3BzX2Jlc3QnPjwvZGl2PjxidXR0b24gY2xhc3M9J2NsZWFyIGNvbW1hbmQnPiN7QHRleHQuY2xlYXJ9PC9idXR0b24+XG4gICAgICAgICAgICA8aDM+I3tAdGV4dC5jdXJyZW50UmVhZGluZ308L2gzPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz0nZ3BzX2N1cnJlbnQnPjwvZGl2PlxuICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgICA8c2VjdGlvbj5cbiAgICAgICAgICAgIDxoMj4je0B0ZXh0Lmdwc1N0YXR1c308L2gyPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz0nc3RhdHVzJz4je0B0ZXh0LnNlYXJjaGluZ308L2Rpdj5cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICAgXCJcbiAgICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgICAgQHRyaWdnZXIgXCJyZWFkeVwiXG4gICAgICBAcG9sbCgpXG4gIFxuICBnZXRSZXN1bHQ6IC0+XG4gICAgcHJldmlvdXMgPSBAcGFyZW50LnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcbiAgICByZXR1cm4gcHJldmlvdXMgaWYgcHJldmlvdXNcbiAgICByZXR1cm4gQHBvc2l0aW9uIHx8IHt9XG5cbiAgZ2V0U2tpcHBlZDogLT5cbiAgICByZXR1cm4gQHBvc2l0aW9uIHx8IHt9XG5cbiAgb25DbG9zZTogLT5cbiAgICBAc3RvcFBvbGxpbmcgPSB0cnVlXG5cbiAgaXNWYWxpZDogLT5cbiAgICB0cnVlXG5cbiAgc2hvd0Vycm9yczogLT5cbiAgICB0cnVlXG4iXX0=
