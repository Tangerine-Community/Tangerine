var WidgetRunView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

WidgetRunView = (function(superClass) {
  extend(WidgetRunView, superClass);

  function WidgetRunView() {
    return WidgetRunView.__super__.constructor.apply(this, arguments);
  }

  WidgetRunView.prototype.className = "WidgetRunView";

  WidgetRunView.prototype.initialize = function(options) {
    this.i18n();
    return this.model = options.model;
  };

  WidgetRunView.prototype.events = {
    'click .saveToCouchDB': 'save'
  };

  WidgetRunView.prototype.i18n = function() {
    return this.text = {
      "save": t("WidgetRunView.button.save"),
      "saved": t("WidgetRunView.button.saved")
    };
  };

  WidgetRunView.prototype.save = function() {
    var assessment;
    console.log("save to Couchdb");
    assessment = $('.assessment-widget-result').html();
    this.model = new Result(JSON.parse(assessment));
    if (this.model.save()) {
      Tangerine.activity = "";
      return Utils.midAlert(this.text.saved);
    }
  };

  WidgetRunView.prototype.render = function() {
    $('#footer').hide();
    this.$el.html("<div class='assessment'></div> <p><button id='saveToCouchDB' class='saveToCouchDB'>" + this.text.save + "</button></p> <div class='assessment-widget-result'></div>");
    this.$assessmentWidget = $(document.createElement('iframe'));
    this.$assessmentWidget.attr('src', '/client/index-dev.html#widget');
    this.$assessmentWidget.attr('data-assessment', JSON.stringify(this.model));
    this.$assessmentWidget.attr('data-result', '{}');
    this.$assessmentWidget.attr('width', '100%');
    this.$assessmentWidget.attr('height', 800);
    this.$assessmentWidget.attr('id', 'client-widget');
    this.$assessmentWidget.on('result:save:widget', function(event) {
      console.log("Final save");
      $('#saveToCouchDB').show();
      return $('.assessment-widget-result').html(event.target.getAttribute('data-result'));
    });
    this.$assessmentWidget.on('result:another:widget', function(event) {
      console.log("Give me another.");
      return document.location.reload();
    });
    this.$el.find(".assessment").append(this.$assessmentWidget);
    this.trigger("rendered");
  };

  return WidgetRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0L1dpZGdldFJ1blZpZXcuanMiLCJzb3VyY2VzIjpbIndpZGdldC9XaWRnZXRSdW5WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxJQUFBLGFBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7MEJBRUosU0FBQSxHQUFZOzswQkFFWixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLElBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0VBRlA7OzBCQUlaLE1BQUEsR0FDRTtJQUFBLHNCQUFBLEVBQTRCLE1BQTVCOzs7MEJBRUYsSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsSUFBRCxHQUNFO01BQUEsTUFBQSxFQUF1QixDQUFBLENBQUUsMkJBQUYsQ0FBdkI7TUFDQSxPQUFBLEVBQXdCLENBQUEsQ0FBRSw0QkFBRixDQUR4Qjs7RUFGRTs7MEJBS04sSUFBQSxHQUFNLFNBQUE7QUFDSixRQUFBO0lBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxpQkFBWjtJQUNBLFVBQUEsR0FBYSxDQUFBLENBQUUsMkJBQUYsQ0FBOEIsQ0FBQyxJQUEvQixDQUFBO0lBRWIsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLE1BQUosQ0FBVyxJQUFJLENBQUMsS0FBTCxDQUFXLFVBQVgsQ0FBWDtJQUNULElBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsQ0FBSDtNQUNFLFNBQVMsQ0FBQyxRQUFWLEdBQXFCO2FBQ3JCLEtBQUssQ0FBQyxRQUFOLENBQWUsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFyQixFQUZGOztFQUxJOzswQkFTTixNQUFBLEdBQVEsU0FBQTtJQUNOLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7SUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxxRkFBQSxHQUM4QyxJQUFDLENBQUEsSUFBSSxDQUFDLElBRHBELEdBQ3lELDREQURuRTtJQUdBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixDQUFBLENBQUUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBRjtJQUNyQixJQUFDLENBQUEsaUJBQWlCLENBQUMsSUFBbkIsQ0FBd0IsS0FBeEIsRUFBK0IsK0JBQS9CO0lBQ0EsSUFBQyxDQUFBLGlCQUFpQixDQUFDLElBQW5CLENBQXdCLGlCQUF4QixFQUEyQyxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUMsQ0FBQSxLQUFoQixDQUEzQztJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixhQUF4QixFQUF1QyxJQUF2QztJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixPQUF4QixFQUFpQyxNQUFqQztJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixRQUF4QixFQUFrQyxHQUFsQztJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixJQUF4QixFQUE4QixlQUE5QjtJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxFQUFuQixDQUFzQixvQkFBdEIsRUFBNEMsU0FBQyxLQUFEO01BQzFDLE9BQU8sQ0FBQyxHQUFSLENBQVksWUFBWjtNQUNBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQUE7YUFDQSxDQUFBLENBQUUsMkJBQUYsQ0FBOEIsQ0FBQyxJQUEvQixDQUFvQyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQWIsQ0FBMEIsYUFBMUIsQ0FBcEM7SUFIMEMsQ0FBNUM7SUFLQSxJQUFDLENBQUEsaUJBQWlCLENBQUMsRUFBbkIsQ0FBc0IsdUJBQXRCLEVBQStDLFNBQUMsS0FBRDtNQUM3QyxPQUFPLENBQUMsR0FBUixDQUFZLGtCQUFaO2FBQ0EsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFsQixDQUFBO0lBRjZDLENBQS9DO0lBS0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsYUFBVixDQUF3QixDQUFDLE1BQXpCLENBQWdDLElBQUMsQ0FBQSxpQkFBakM7SUFDQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUF2Qk07Ozs7R0F6QmtCLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4jIFdpZGdldFJ1blZpZXcgdGFrZXMgYSBsaXN0IG9mIHN1YnRlc3RzIGFuZCB0aGUgYXNzZXNzbWVudCBhcyB0aGUgbW9kZWwsIHN0cmluZ2lmaWVzIGl0LCBhbmQgcmVuZGVycyB0aGUgVGFuZ2VyaW5lIGNsaWVudCB3aWRnZXQuXG4jIEl0IGxpc3RlbnMgZm9yIGEgcmVzdWx0OnNhdmVkOndpZGdldCBldmVudCBmcm9tIHRoZSBjbGllbnQgd2lkZ2V0LCB3aGljaCBpcyBjcmVhdGVkIGJ5IHRoZSB3aWRnZXRQbGF5IHJvdXRlIGluIHdpZGdldCdzIHJvdXRlclxuIyBieSB0aGUgcmVzdWx0OnNhdmVkIGV2ZW50IHRocm93biBieSBBc3Nlc3NtZW50Q29tcG9zaXRlVmlldyBmcm9tIFJlc3VsdEl0ZW1WaWV3LiBJdCBhbHNvIGxpc3RlbnMgZm9yIHRoZSByZXN1bHQ6c2F2ZWQ6d2lkZ2V0XG4jIGV2ZW50IHRvIHJlZnJlc2ggdGhlIHBhZ2Ugd2hlbiB0aGUgdXNlciBjaG9vc2VzIFwiUGVyZm9ybSBhbm90aGVyIGFzc2Vzc21lbnRcIlxuY2xhc3MgV2lkZ2V0UnVuVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIldpZGdldFJ1blZpZXdcIlxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuICAgIEBpMThuKClcbiAgICBAbW9kZWwgPSBvcHRpb25zLm1vZGVsXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAuc2F2ZVRvQ291Y2hEQicgICAgOiAnc2F2ZSdcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIFwic2F2ZVwiICAgICAgICAgICAgICAgOiB0KFwiV2lkZ2V0UnVuVmlldy5idXR0b24uc2F2ZVwiKVxuICAgICAgXCJzYXZlZFwiICAgICAgICAgICAgICAgOiB0KFwiV2lkZ2V0UnVuVmlldy5idXR0b24uc2F2ZWRcIilcblxuICBzYXZlOiAtPlxuICAgIGNvbnNvbGUubG9nKFwic2F2ZSB0byBDb3VjaGRiXCIpXG4gICAgYXNzZXNzbWVudCA9ICQoJy5hc3Nlc3NtZW50LXdpZGdldC1yZXN1bHQnKS5odG1sKClcbiMgICAgcmVzdWx0ID0gSlNPTi5wYXJzZSBhc3Nlc3NtZW50XG4gICAgQG1vZGVsID0gbmV3IFJlc3VsdCBKU09OLnBhcnNlIGFzc2Vzc21lbnRcbiAgICBpZiBAbW9kZWwuc2F2ZSgpXG4gICAgICBUYW5nZXJpbmUuYWN0aXZpdHkgPSBcIlwiXG4gICAgICBVdGlscy5taWRBbGVydCBAdGV4dC5zYXZlZFxuXG4gIHJlbmRlcjogLT5cbiAgICAkKCcjZm9vdGVyJykuaGlkZSgpXG4gICAgQCRlbC5odG1sIFwiPGRpdiBjbGFzcz0nYXNzZXNzbWVudCc+PC9kaXY+XG4gICAgICA8cD48YnV0dG9uIGlkPSdzYXZlVG9Db3VjaERCJyBjbGFzcz0nc2F2ZVRvQ291Y2hEQic+I3tAdGV4dC5zYXZlfTwvYnV0dG9uPjwvcD5cbiAgICAgIDxkaXYgY2xhc3M9J2Fzc2Vzc21lbnQtd2lkZ2V0LXJlc3VsdCc+PC9kaXY+XCJcbiAgICBAJGFzc2Vzc21lbnRXaWRnZXQgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpKVxuICAgIEAkYXNzZXNzbWVudFdpZGdldC5hdHRyKCdzcmMnLCAnL2NsaWVudC9pbmRleC1kZXYuaHRtbCN3aWRnZXQnKVxuICAgIEAkYXNzZXNzbWVudFdpZGdldC5hdHRyKCdkYXRhLWFzc2Vzc21lbnQnLCBKU09OLnN0cmluZ2lmeShAbW9kZWwpKVxuICAgIEAkYXNzZXNzbWVudFdpZGdldC5hdHRyKCdkYXRhLXJlc3VsdCcsICd7fScpXG4gICAgQCRhc3Nlc3NtZW50V2lkZ2V0LmF0dHIoJ3dpZHRoJywgJzEwMCUnKVxuICAgIEAkYXNzZXNzbWVudFdpZGdldC5hdHRyKCdoZWlnaHQnLCA4MDApXG4gICAgQCRhc3Nlc3NtZW50V2lkZ2V0LmF0dHIoJ2lkJywgJ2NsaWVudC13aWRnZXQnKVxuICAgIEAkYXNzZXNzbWVudFdpZGdldC5vbigncmVzdWx0OnNhdmU6d2lkZ2V0JywgKGV2ZW50KSAtPlxuICAgICAgY29uc29sZS5sb2coXCJGaW5hbCBzYXZlXCIpXG4gICAgICAkKCcjc2F2ZVRvQ291Y2hEQicpLnNob3coKVxuICAgICAgJCgnLmFzc2Vzc21lbnQtd2lkZ2V0LXJlc3VsdCcpLmh0bWwoZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1yZXN1bHQnKSlcbiAgICApXG4gICAgQCRhc3Nlc3NtZW50V2lkZ2V0Lm9uKCdyZXN1bHQ6YW5vdGhlcjp3aWRnZXQnLCAoZXZlbnQpIC0+XG4gICAgICBjb25zb2xlLmxvZyhcIkdpdmUgbWUgYW5vdGhlci5cIilcbiAgICAgIGRvY3VtZW50LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgKVxuXG4gICAgQCRlbC5maW5kKFwiLmFzc2Vzc21lbnRcIikuYXBwZW5kKEAkYXNzZXNzbWVudFdpZGdldClcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICAgIHJldHVyblxuIl19
