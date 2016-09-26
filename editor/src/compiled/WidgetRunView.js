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
    this.$assessmentWidget.attr('height', '100%');
    this.$assessmentWidget.attr('id', 'client-widget');
    this.$assessmentWidget.attr('groupName', Tangerine.settings.get("groupName"));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndpZGdldC9XaWRnZXRSdW5WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxJQUFBLGFBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7MEJBRUosU0FBQSxHQUFZOzswQkFFWixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLElBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0VBRlA7OzBCQUlaLE1BQUEsR0FDRTtJQUFBLHNCQUFBLEVBQTRCLE1BQTVCOzs7MEJBRUYsSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsSUFBRCxHQUNFO01BQUEsTUFBQSxFQUF1QixDQUFBLENBQUUsMkJBQUYsQ0FBdkI7TUFDQSxPQUFBLEVBQXdCLENBQUEsQ0FBRSw0QkFBRixDQUR4Qjs7RUFGRTs7MEJBS04sSUFBQSxHQUFNLFNBQUE7QUFDSixRQUFBO0lBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxpQkFBWjtJQUNBLFVBQUEsR0FBYSxDQUFBLENBQUUsMkJBQUYsQ0FBOEIsQ0FBQyxJQUEvQixDQUFBO0lBRWIsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLE1BQUEsQ0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLFVBQVgsQ0FBUDtJQUNiLElBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsQ0FBSDtNQUNFLFNBQVMsQ0FBQyxRQUFWLEdBQXFCO2FBQ3JCLEtBQUssQ0FBQyxRQUFOLENBQWUsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFyQixFQUZGOztFQUxJOzswQkFTTixNQUFBLEdBQVEsU0FBQTtJQUNOLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7SUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxxRkFBQSxHQUM4QyxJQUFDLENBQUEsSUFBSSxDQUFDLElBRHBELEdBQ3lELDREQURuRTtJQUdBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixDQUFBLENBQUUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBRjtJQUNyQixJQUFDLENBQUEsaUJBQWlCLENBQUMsSUFBbkIsQ0FBd0IsS0FBeEIsRUFBK0IsK0JBQS9CO0lBQ0EsSUFBQyxDQUFBLGlCQUFpQixDQUFDLElBQW5CLENBQXdCLGlCQUF4QixFQUEyQyxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUMsQ0FBQSxLQUFoQixDQUEzQztJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixhQUF4QixFQUF1QyxJQUF2QztJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixPQUF4QixFQUFpQyxNQUFqQztJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixRQUF4QixFQUFrQyxNQUFsQztJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixJQUF4QixFQUE4QixlQUE5QjtJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixXQUF4QixFQUFxQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQW5CLENBQXVCLFdBQXZCLENBQXJDO0lBQ0EsSUFBQyxDQUFBLGlCQUFpQixDQUFDLEVBQW5CLENBQXNCLG9CQUF0QixFQUE0QyxTQUFDLEtBQUQ7TUFDMUMsT0FBTyxDQUFDLEdBQVIsQ0FBWSxZQUFaO01BQ0EsQ0FBQSxDQUFFLGdCQUFGLENBQW1CLENBQUMsSUFBcEIsQ0FBQTthQUNBLENBQUEsQ0FBRSwyQkFBRixDQUE4QixDQUFDLElBQS9CLENBQW9DLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBYixDQUEwQixhQUExQixDQUFwQztJQUgwQyxDQUE1QztJQUtBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxFQUFuQixDQUFzQix1QkFBdEIsRUFBK0MsU0FBQyxLQUFEO01BQzdDLE9BQU8sQ0FBQyxHQUFSLENBQVksa0JBQVo7YUFDQSxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQWxCLENBQUE7SUFGNkMsQ0FBL0M7SUFLQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxhQUFWLENBQXdCLENBQUMsTUFBekIsQ0FBZ0MsSUFBQyxDQUFBLGlCQUFqQztJQUNBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQXhCTTs7OztHQXpCa0IsUUFBUSxDQUFDIiwiZmlsZSI6IndpZGdldC9XaWRnZXRSdW5WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyBXaWRnZXRSdW5WaWV3IHRha2VzIGEgbGlzdCBvZiBzdWJ0ZXN0cyBhbmQgdGhlIGFzc2Vzc21lbnQgYXMgdGhlIG1vZGVsLCBzdHJpbmdpZmllcyBpdCwgYW5kIHJlbmRlcnMgdGhlIFRhbmdlcmluZSBjbGllbnQgd2lkZ2V0LlxuIyBJdCBsaXN0ZW5zIGZvciBhIHJlc3VsdDpzYXZlZDp3aWRnZXQgZXZlbnQgZnJvbSB0aGUgY2xpZW50IHdpZGdldCwgd2hpY2ggaXMgY3JlYXRlZCBieSB0aGUgd2lkZ2V0UGxheSByb3V0ZSBpbiB3aWRnZXQncyByb3V0ZXJcbiMgYnkgdGhlIHJlc3VsdDpzYXZlZCBldmVudCB0aHJvd24gYnkgQXNzZXNzbWVudENvbXBvc2l0ZVZpZXcgZnJvbSBSZXN1bHRJdGVtVmlldy4gSXQgYWxzbyBsaXN0ZW5zIGZvciB0aGUgcmVzdWx0OnNhdmVkOndpZGdldFxuIyBldmVudCB0byByZWZyZXNoIHRoZSBwYWdlIHdoZW4gdGhlIHVzZXIgY2hvb3NlcyBcIlBlcmZvcm0gYW5vdGhlciBhc3Nlc3NtZW50XCJcbmNsYXNzIFdpZGdldFJ1blZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJXaWRnZXRSdW5WaWV3XCJcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cbiAgICBAaTE4bigpXG4gICAgQG1vZGVsID0gb3B0aW9ucy5tb2RlbFxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLnNhdmVUb0NvdWNoREInICAgIDogJ3NhdmUnXG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICBcInNhdmVcIiAgICAgICAgICAgICAgIDogdChcIldpZGdldFJ1blZpZXcuYnV0dG9uLnNhdmVcIilcbiAgICAgIFwic2F2ZWRcIiAgICAgICAgICAgICAgIDogdChcIldpZGdldFJ1blZpZXcuYnV0dG9uLnNhdmVkXCIpXG5cbiAgc2F2ZTogLT5cbiAgICBjb25zb2xlLmxvZyhcInNhdmUgdG8gQ291Y2hkYlwiKVxuICAgIGFzc2Vzc21lbnQgPSAkKCcuYXNzZXNzbWVudC13aWRnZXQtcmVzdWx0JykuaHRtbCgpXG4jICAgIHJlc3VsdCA9IEpTT04ucGFyc2UgYXNzZXNzbWVudFxuICAgIEBtb2RlbCA9IG5ldyBSZXN1bHQgSlNPTi5wYXJzZSBhc3Nlc3NtZW50XG4gICAgaWYgQG1vZGVsLnNhdmUoKVxuICAgICAgVGFuZ2VyaW5lLmFjdGl2aXR5ID0gXCJcIlxuICAgICAgVXRpbHMubWlkQWxlcnQgQHRleHQuc2F2ZWRcblxuICByZW5kZXI6IC0+XG4gICAgJCgnI2Zvb3RlcicpLmhpZGUoKVxuICAgIEAkZWwuaHRtbCBcIjxkaXYgY2xhc3M9J2Fzc2Vzc21lbnQnPjwvZGl2PlxuICAgICAgPHA+PGJ1dHRvbiBpZD0nc2F2ZVRvQ291Y2hEQicgY2xhc3M9J3NhdmVUb0NvdWNoREInPiN7QHRleHQuc2F2ZX08L2J1dHRvbj48L3A+XG4gICAgICA8ZGl2IGNsYXNzPSdhc3Nlc3NtZW50LXdpZGdldC1yZXN1bHQnPjwvZGl2PlwiXG4gICAgQCRhc3Nlc3NtZW50V2lkZ2V0ID0gJChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKSlcbiAgICBAJGFzc2Vzc21lbnRXaWRnZXQuYXR0cignc3JjJywgJy9jbGllbnQvaW5kZXgtZGV2Lmh0bWwjd2lkZ2V0JylcbiAgICBAJGFzc2Vzc21lbnRXaWRnZXQuYXR0cignZGF0YS1hc3Nlc3NtZW50JywgSlNPTi5zdHJpbmdpZnkoQG1vZGVsKSlcbiAgICBAJGFzc2Vzc21lbnRXaWRnZXQuYXR0cignZGF0YS1yZXN1bHQnLCAne30nKVxuICAgIEAkYXNzZXNzbWVudFdpZGdldC5hdHRyKCd3aWR0aCcsICcxMDAlJylcbiAgICBAJGFzc2Vzc21lbnRXaWRnZXQuYXR0cignaGVpZ2h0JywgJzEwMCUnKVxuICAgIEAkYXNzZXNzbWVudFdpZGdldC5hdHRyKCdpZCcsICdjbGllbnQtd2lkZ2V0JylcbiAgICBAJGFzc2Vzc21lbnRXaWRnZXQuYXR0cignZ3JvdXBOYW1lJywgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImdyb3VwTmFtZVwiKSlcbiAgICBAJGFzc2Vzc21lbnRXaWRnZXQub24oJ3Jlc3VsdDpzYXZlOndpZGdldCcsIChldmVudCkgLT5cbiAgICAgIGNvbnNvbGUubG9nKFwiRmluYWwgc2F2ZVwiKVxuICAgICAgJCgnI3NhdmVUb0NvdWNoREInKS5zaG93KClcbiAgICAgICQoJy5hc3Nlc3NtZW50LXdpZGdldC1yZXN1bHQnKS5odG1sKGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcmVzdWx0JykpXG4gICAgKVxuICAgIEAkYXNzZXNzbWVudFdpZGdldC5vbigncmVzdWx0OmFub3RoZXI6d2lkZ2V0JywgKGV2ZW50KSAtPlxuICAgICAgY29uc29sZS5sb2coXCJHaXZlIG1lIGFub3RoZXIuXCIpXG4gICAgICBkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKVxuICAgIClcblxuICAgIEAkZWwuZmluZChcIi5hc3Nlc3NtZW50XCIpLmFwcGVuZChAJGFzc2Vzc21lbnRXaWRnZXQpXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgICByZXR1cm5cbiJdfQ==
