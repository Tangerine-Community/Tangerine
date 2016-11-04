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
    this.$assessmentWidget.attr('src', '/client/index.html#widget');
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndpZGdldC9XaWRnZXRSdW5WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxJQUFBLGFBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7MEJBRUosU0FBQSxHQUFZOzswQkFFWixVQUFBLEdBQVksU0FBQyxPQUFEO0lBQ1YsSUFBQyxDQUFBLElBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0VBRlA7OzBCQUlaLE1BQUEsR0FDRTtJQUFBLHNCQUFBLEVBQTRCLE1BQTVCOzs7MEJBRUYsSUFBQSxHQUFNLFNBQUE7V0FDSixJQUFDLENBQUEsSUFBRCxHQUNFO01BQUEsTUFBQSxFQUF1QixDQUFBLENBQUUsMkJBQUYsQ0FBdkI7TUFDQSxPQUFBLEVBQXdCLENBQUEsQ0FBRSw0QkFBRixDQUR4Qjs7RUFGRTs7MEJBS04sSUFBQSxHQUFNLFNBQUE7QUFDSixRQUFBO0lBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxpQkFBWjtJQUNBLFVBQUEsR0FBYSxDQUFBLENBQUUsMkJBQUYsQ0FBOEIsQ0FBQyxJQUEvQixDQUFBO0lBRWIsSUFBQyxDQUFBLEtBQUQsR0FBYSxJQUFBLE1BQUEsQ0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLFVBQVgsQ0FBUDtJQUNiLElBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUEsQ0FBSDtNQUNFLFNBQVMsQ0FBQyxRQUFWLEdBQXFCO2FBQ3JCLEtBQUssQ0FBQyxRQUFOLENBQWUsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFyQixFQUZGOztFQUxJOzswQkFTTixNQUFBLEdBQVEsU0FBQTtJQUNOLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7SUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxxRkFBQSxHQUM4QyxJQUFDLENBQUEsSUFBSSxDQUFDLElBRHBELEdBQ3lELDREQURuRTtJQUdBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixDQUFBLENBQUUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBRjtJQUNyQixJQUFDLENBQUEsaUJBQWlCLENBQUMsSUFBbkIsQ0FBd0IsS0FBeEIsRUFBK0IsMkJBQS9CO0lBQ0EsSUFBQyxDQUFBLGlCQUFpQixDQUFDLElBQW5CLENBQXdCLGlCQUF4QixFQUEyQyxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUMsQ0FBQSxLQUFoQixDQUEzQztJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixhQUF4QixFQUF1QyxJQUF2QztJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixPQUF4QixFQUFpQyxNQUFqQztJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixRQUF4QixFQUFrQyxHQUFsQztJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxJQUFuQixDQUF3QixJQUF4QixFQUE4QixlQUE5QjtJQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxFQUFuQixDQUFzQixvQkFBdEIsRUFBNEMsU0FBQyxLQUFEO01BQzFDLE9BQU8sQ0FBQyxHQUFSLENBQVksWUFBWjtNQUNBLENBQUEsQ0FBRSxnQkFBRixDQUFtQixDQUFDLElBQXBCLENBQUE7YUFDQSxDQUFBLENBQUUsMkJBQUYsQ0FBOEIsQ0FBQyxJQUEvQixDQUFvQyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQWIsQ0FBMEIsYUFBMUIsQ0FBcEM7SUFIMEMsQ0FBNUM7SUFLQSxJQUFDLENBQUEsaUJBQWlCLENBQUMsRUFBbkIsQ0FBc0IsdUJBQXRCLEVBQStDLFNBQUMsS0FBRDtNQUM3QyxPQUFPLENBQUMsR0FBUixDQUFZLGtCQUFaO2FBQ0EsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFsQixDQUFBO0lBRjZDLENBQS9DO0lBS0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsYUFBVixDQUF3QixDQUFDLE1BQXpCLENBQWdDLElBQUMsQ0FBQSxpQkFBakM7SUFDQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUF2Qk07Ozs7R0F6QmtCLFFBQVEsQ0FBQyIsImZpbGUiOiJ3aWRnZXQvV2lkZ2V0UnVuVmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMgV2lkZ2V0UnVuVmlldyB0YWtlcyBhIGxpc3Qgb2Ygc3VidGVzdHMgYW5kIHRoZSBhc3Nlc3NtZW50IGFzIHRoZSBtb2RlbCwgc3RyaW5naWZpZXMgaXQsIGFuZCByZW5kZXJzIHRoZSBUYW5nZXJpbmUgY2xpZW50IHdpZGdldC5cbiMgSXQgbGlzdGVucyBmb3IgYSByZXN1bHQ6c2F2ZWQ6d2lkZ2V0IGV2ZW50IGZyb20gdGhlIGNsaWVudCB3aWRnZXQsIHdoaWNoIGlzIGNyZWF0ZWQgYnkgdGhlIHdpZGdldFBsYXkgcm91dGUgaW4gd2lkZ2V0J3Mgcm91dGVyXG4jIGJ5IHRoZSByZXN1bHQ6c2F2ZWQgZXZlbnQgdGhyb3duIGJ5IEFzc2Vzc21lbnRDb21wb3NpdGVWaWV3IGZyb20gUmVzdWx0SXRlbVZpZXcuIEl0IGFsc28gbGlzdGVucyBmb3IgdGhlIHJlc3VsdDpzYXZlZDp3aWRnZXRcbiMgZXZlbnQgdG8gcmVmcmVzaCB0aGUgcGFnZSB3aGVuIHRoZSB1c2VyIGNob29zZXMgXCJQZXJmb3JtIGFub3RoZXIgYXNzZXNzbWVudFwiXG5jbGFzcyBXaWRnZXRSdW5WaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiV2lkZ2V0UnVuVmlld1wiXG5cbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQGkxOG4oKVxuICAgIEBtb2RlbCA9IG9wdGlvbnMubW9kZWxcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5zYXZlVG9Db3VjaERCJyAgICA6ICdzYXZlJ1xuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgXCJzYXZlXCIgICAgICAgICAgICAgICA6IHQoXCJXaWRnZXRSdW5WaWV3LmJ1dHRvbi5zYXZlXCIpXG4gICAgICBcInNhdmVkXCIgICAgICAgICAgICAgICA6IHQoXCJXaWRnZXRSdW5WaWV3LmJ1dHRvbi5zYXZlZFwiKVxuXG4gIHNhdmU6IC0+XG4gICAgY29uc29sZS5sb2coXCJzYXZlIHRvIENvdWNoZGJcIilcbiAgICBhc3Nlc3NtZW50ID0gJCgnLmFzc2Vzc21lbnQtd2lkZ2V0LXJlc3VsdCcpLmh0bWwoKVxuIyAgICByZXN1bHQgPSBKU09OLnBhcnNlIGFzc2Vzc21lbnRcbiAgICBAbW9kZWwgPSBuZXcgUmVzdWx0IEpTT04ucGFyc2UgYXNzZXNzbWVudFxuICAgIGlmIEBtb2RlbC5zYXZlKClcbiAgICAgIFRhbmdlcmluZS5hY3Rpdml0eSA9IFwiXCJcbiAgICAgIFV0aWxzLm1pZEFsZXJ0IEB0ZXh0LnNhdmVkXG5cbiAgcmVuZGVyOiAtPlxuICAgICQoJyNmb290ZXInKS5oaWRlKClcbiAgICBAJGVsLmh0bWwgXCI8ZGl2IGNsYXNzPSdhc3Nlc3NtZW50Jz48L2Rpdj5cbiAgICAgIDxwPjxidXR0b24gaWQ9J3NhdmVUb0NvdWNoREInIGNsYXNzPSdzYXZlVG9Db3VjaERCJz4je0B0ZXh0LnNhdmV9PC9idXR0b24+PC9wPlxuICAgICAgPGRpdiBjbGFzcz0nYXNzZXNzbWVudC13aWRnZXQtcmVzdWx0Jz48L2Rpdj5cIlxuICAgIEAkYXNzZXNzbWVudFdpZGdldCA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJykpXG4gICAgQCRhc3Nlc3NtZW50V2lkZ2V0LmF0dHIoJ3NyYycsICcvY2xpZW50L2luZGV4Lmh0bWwjd2lkZ2V0JylcbiAgICBAJGFzc2Vzc21lbnRXaWRnZXQuYXR0cignZGF0YS1hc3Nlc3NtZW50JywgSlNPTi5zdHJpbmdpZnkoQG1vZGVsKSlcbiAgICBAJGFzc2Vzc21lbnRXaWRnZXQuYXR0cignZGF0YS1yZXN1bHQnLCAne30nKVxuICAgIEAkYXNzZXNzbWVudFdpZGdldC5hdHRyKCd3aWR0aCcsICcxMDAlJylcbiAgICBAJGFzc2Vzc21lbnRXaWRnZXQuYXR0cignaGVpZ2h0JywgODAwKVxuICAgIEAkYXNzZXNzbWVudFdpZGdldC5hdHRyKCdpZCcsICdjbGllbnQtd2lkZ2V0JylcbiAgICBAJGFzc2Vzc21lbnRXaWRnZXQub24oJ3Jlc3VsdDpzYXZlOndpZGdldCcsIChldmVudCkgLT5cbiAgICAgIGNvbnNvbGUubG9nKFwiRmluYWwgc2F2ZVwiKVxuICAgICAgJCgnI3NhdmVUb0NvdWNoREInKS5zaG93KClcbiAgICAgICQoJy5hc3Nlc3NtZW50LXdpZGdldC1yZXN1bHQnKS5odG1sKGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcmVzdWx0JykpXG4gICAgKVxuICAgIEAkYXNzZXNzbWVudFdpZGdldC5vbigncmVzdWx0OmFub3RoZXI6d2lkZ2V0JywgKGV2ZW50KSAtPlxuICAgICAgY29uc29sZS5sb2coXCJHaXZlIG1lIGFub3RoZXIuXCIpXG4gICAgICBkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKVxuICAgIClcblxuICAgIEAkZWwuZmluZChcIi5hc3Nlc3NtZW50XCIpLmFwcGVuZChAJGFzc2Vzc21lbnRXaWRnZXQpXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgICByZXR1cm5cbiJdfQ==
