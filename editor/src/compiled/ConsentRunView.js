var ConsentRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ConsentRunView = (function(superClass) {
  extend(ConsentRunView, superClass);

  function ConsentRunView() {
    this.onConsentChange = bind(this.onConsentChange, this);
    return ConsentRunView.__super__.constructor.apply(this, arguments);
  }

  ConsentRunView.prototype.className = "ConsentRunView";

  ConsentRunView.prototype.events = {
    'click #non_consent_confirm': 'noConsent'
  };

  ConsentRunView.prototype.onConsentChange = function() {
    if (this.consentButton.answer === "yes") {
      return this.clearMessages();
    } else {
      return this.showNonConsent();
    }
  };

  ConsentRunView.prototype.i18n = function() {
    return this.text = {
      defaultConsent: t("ConsentRunView.label.default_consent_prompt"),
      confirmNonconsent: t("ConsentRunView.label.confirm_nonconsent"),
      confirm: t("ConsentRunView.button.confirm"),
      yes: t("ConsentRunView.button.yes_continue"),
      no: t("ConsentRunView.button.no_stop"),
      select: t("ConsentRunView.message.select")
    };
  };

  ConsentRunView.prototype.initialize = function(options) {
    this.i18n();
    this.confirmedNonConsent = false;
    this.model = options.model;
    this.parent = options.parent;
    return this.dataEntry = options.dataEntry;
  };

  ConsentRunView.prototype.render = function() {
    var answer, previous;
    this.$el.html("<div class='question'> <label>" + (this.model.get('prompt') || this.text.defaultConsent) + "</label> <div class='messages'></div> <div class='non_consent_form confirmation'> <div>" + this.text.confirmNonconsent + "</div> <button id='non_consent_confirm' class='command'>" + this.text.confirm + "</button> </div> <div class='consent-button'></div> </div>");
    if (!this.dataEntry) {
      previous = this.parent.parent.result.getByHash(this.model.get('hash'));
      if (previous) {
        answer = previous.consent;
      }
    }
    this.consentButton = new ButtonView({
      options: [
        {
          label: this.text.yes,
          value: "yes"
        }, {
          label: this.text.no,
          value: "no"
        }
      ],
      mode: "single",
      dataEntry: false,
      answer: answer || ""
    });
    this.consentButton.setElement(this.$el.find(".consent-button"));
    this.consentButton.on("change", this.onConsentChange);
    this.consentButton.render();
    this.trigger("rendered");
    return this.trigger("ready");
  };

  ConsentRunView.prototype.isValid = function() {
    if (this.confirmedNonConsent === false) {
      if (this.consentButton.answer === "yes") {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  ConsentRunView.prototype.showNonConsent = function() {
    return this.$el.find(".non_consent_form").show(250);
  };

  ConsentRunView.prototype.clearMessages = function() {
    this.$el.find(".non_consent_form").hide(250);
    return this.$el.find(".messages").html("");
  };

  ConsentRunView.prototype.noConsent = function() {
    this.confirmedNonConsent = true;
    this.parent.abort();
    return false;
  };

  ConsentRunView.prototype.getSkipped = function() {
    return {
      "consent": "skipped"
    };
  };

  ConsentRunView.prototype.showErrors = function() {
    var answer;
    answer = this.consentButton.answer;
    if (answer === "no") {
      Utils.midAlert(this.text.confirm);
      return this.showNonConsent();
    } else if (answer === void 0) {
      return $(".messages").html(this.text.select);
    }
  };

  ConsentRunView.prototype.getResult = function() {
    return {
      "consent": this.consentButton.answer
    };
  };

  ConsentRunView.prototype.onClose = function() {
    var ref;
    return (ref = this.consentButton) != null ? typeof ref.close === "function" ? ref.close() : void 0 : void 0;
  };

  return ConsentRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9Db25zZW50UnVuVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxjQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7MkJBRUosU0FBQSxHQUFZOzsyQkFFWixNQUFBLEdBQ0U7SUFBQSw0QkFBQSxFQUErQixXQUEvQjs7OzJCQUVGLGVBQUEsR0FBaUIsU0FBQTtJQUNmLElBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLEtBQXlCLEtBQTVCO2FBQ0UsSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQURGO0tBQUEsTUFBQTthQUdFLElBQUMsQ0FBQSxjQUFELENBQUEsRUFIRjs7RUFEZTs7MkJBTWpCLElBQUEsR0FBTSxTQUFBO1dBQ0osSUFBQyxDQUFBLElBQUQsR0FDRTtNQUFBLGNBQUEsRUFBb0IsQ0FBQSxDQUFFLDZDQUFGLENBQXBCO01BQ0EsaUJBQUEsRUFBb0IsQ0FBQSxDQUFFLHlDQUFGLENBRHBCO01BRUEsT0FBQSxFQUFvQixDQUFBLENBQUUsK0JBQUYsQ0FGcEI7TUFHQSxHQUFBLEVBQW9CLENBQUEsQ0FBRSxvQ0FBRixDQUhwQjtNQUlBLEVBQUEsRUFBb0IsQ0FBQSxDQUFFLCtCQUFGLENBSnBCO01BS0EsTUFBQSxFQUFvQixDQUFBLENBQUUsK0JBQUYsQ0FMcEI7O0VBRkU7OzJCQVNOLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFFVixJQUFDLENBQUEsSUFBRCxDQUFBO0lBRUEsSUFBQyxDQUFBLG1CQUFELEdBQXVCO0lBQ3ZCLElBQUMsQ0FBQSxLQUFELEdBQVUsT0FBTyxDQUFDO0lBQ2xCLElBQUMsQ0FBQSxNQUFELEdBQVUsT0FBTyxDQUFDO1dBQ2xCLElBQUMsQ0FBQSxTQUFELEdBQWEsT0FBTyxDQUFDO0VBUFg7OzJCQVVaLE1BQUEsR0FBUSxTQUFBO0FBRU4sUUFBQTtJQUFBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdDQUFBLEdBRUUsQ0FBQyxJQUFDLENBQUEsS0FB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QUEsRUFBWSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQTNCOztFQURFOzsyQkFHWCxPQUFBLEdBQVMsU0FBQTtBQUNQLFFBQUE7cUZBQWMsQ0FBRTtFQURUOzs7O0dBdEdrQixRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9wcm90b3R5cGVzL0NvbnNlbnRSdW5WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQ29uc2VudFJ1blZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJDb25zZW50UnVuVmlld1wiXG5cbiAgZXZlbnRzOlxuICAgICdjbGljayAjbm9uX2NvbnNlbnRfY29uZmlybScgOiAnbm9Db25zZW50J1xuXG4gIG9uQ29uc2VudENoYW5nZTogPT5cbiAgICBpZiBAY29uc2VudEJ1dHRvbi5hbnN3ZXIgaXMgXCJ5ZXNcIlxuICAgICAgQGNsZWFyTWVzc2FnZXMoKVxuICAgIGVsc2VcbiAgICAgIEBzaG93Tm9uQ29uc2VudCgpXG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9XG4gICAgICBkZWZhdWx0Q29uc2VudCAgICA6IHQoXCJDb25zZW50UnVuVmlldy5sYWJlbC5kZWZhdWx0X2NvbnNlbnRfcHJvbXB0XCIpXG4gICAgICBjb25maXJtTm9uY29uc2VudCA6IHQoXCJDb25zZW50UnVuVmlldy5sYWJlbC5jb25maXJtX25vbmNvbnNlbnRcIilcbiAgICAgIGNvbmZpcm0gICAgICAgICAgIDogdChcIkNvbnNlbnRSdW5WaWV3LmJ1dHRvbi5jb25maXJtXCIpXG4gICAgICB5ZXMgICAgICAgICAgICAgICA6IHQoXCJDb25zZW50UnVuVmlldy5idXR0b24ueWVzX2NvbnRpbnVlXCIpXG4gICAgICBubyAgICAgICAgICAgICAgICA6IHQoXCJDb25zZW50UnVuVmlldy5idXR0b24ubm9fc3RvcFwiKVxuICAgICAgc2VsZWN0ICAgICAgICAgICAgOiB0KFwiQ29uc2VudFJ1blZpZXcubWVzc2FnZS5zZWxlY3RcIilcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBpMThuKClcblxuICAgIEBjb25maXJtZWROb25Db25zZW50ID0gZmFsc2VcbiAgICBAbW9kZWwgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBwYXJlbnQgPSBvcHRpb25zLnBhcmVudFxuICAgIEBkYXRhRW50cnkgPSBvcHRpb25zLmRhdGFFbnRyeVxuXG4gIFxuICByZW5kZXI6IC0+XG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxkaXYgY2xhc3M9J3F1ZXN0aW9uJz5cbiAgICAgICAgPGxhYmVsPiN7QG1vZGVsLmdldCgncHJvbXB0JykgfHwgQHRleHQuZGVmYXVsdENvbnNlbnR9PC9sYWJlbD5cbiAgICAgICAgPGRpdiBjbGFzcz0nbWVzc2FnZXMnPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdub25fY29uc2VudF9mb3JtIGNvbmZpcm1hdGlvbic+XG4gICAgICAgICAgPGRpdj4je0B0ZXh0LmNvbmZpcm1Ob25jb25zZW50fTwvZGl2PlxuICAgICAgICAgIDxidXR0b24gaWQ9J25vbl9jb25zZW50X2NvbmZpcm0nIGNsYXNzPSdjb21tYW5kJz4je0B0ZXh0LmNvbmZpcm19PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdjb25zZW50LWJ1dHRvbic+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICBcIlxuXG4gICAgdW5sZXNzIEBkYXRhRW50cnlcblxuICAgICAgcHJldmlvdXMgPSBAcGFyZW50LnBhcmVudC5yZXN1bHQuZ2V0QnlIYXNoKEBtb2RlbC5nZXQoJ2hhc2gnKSlcbiAgICAgIGFuc3dlciA9IHByZXZpb3VzLmNvbnNlbnQgaWYgcHJldmlvdXNcblxuICAgIEBjb25zZW50QnV0dG9uID0gbmV3IEJ1dHRvblZpZXdcbiAgICAgIG9wdGlvbnMgOiBbXG4gICAgICAgIHsgbGFiZWwgOiBAdGV4dC55ZXMsIHZhbHVlIDogXCJ5ZXNcIiB9XG4gICAgICAgIHsgbGFiZWwgOiBAdGV4dC5ubywgIHZhbHVlIDogXCJub1wiIH1cbiAgICAgIF1cbiAgICAgIG1vZGUgICAgICA6IFwic2luZ2xlXCJcbiAgICAgIGRhdGFFbnRyeSA6IGZhbHNlXG4gICAgICBhbnN3ZXIgICAgOiBhbnN3ZXIgb3IgXCJcIlxuICAgIFxuICAgIEBjb25zZW50QnV0dG9uLnNldEVsZW1lbnQgQCRlbC5maW5kKFwiLmNvbnNlbnQtYnV0dG9uXCIpXG4gICAgQGNvbnNlbnRCdXR0b24ub24gXCJjaGFuZ2VcIiwgQG9uQ29uc2VudENoYW5nZVxuICAgIEBjb25zZW50QnV0dG9uLnJlbmRlcigpXG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiAgICBAdHJpZ2dlciBcInJlYWR5XCJcbiAgXG4gIGlzVmFsaWQ6IC0+XG4gICAgaWYgQGNvbmZpcm1lZE5vbkNvbnNlbnQgaXMgZmFsc2VcbiAgICAgIGlmIEBjb25zZW50QnV0dG9uLmFuc3dlciBpcyBcInllc1wiXG4gICAgICAgIHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgZmFsc2VcbiAgICBlbHNlXG4gICAgICB0cnVlXG5cbiAgc2hvd05vbkNvbnNlbnQ6IC0+XG4gICAgQCRlbC5maW5kKFwiLm5vbl9jb25zZW50X2Zvcm1cIikuc2hvdygyNTApXG5cbiAgY2xlYXJNZXNzYWdlczogLT5cbiAgICBAJGVsLmZpbmQoXCIubm9uX2NvbnNlbnRfZm9ybVwiKS5oaWRlKDI1MClcbiAgICBAJGVsLmZpbmQoXCIubWVzc2FnZXNcIikuaHRtbCBcIlwiXG5cbiAgbm9Db25zZW50OiAtPlxuICAgIEBjb25maXJtZWROb25Db25zZW50ID0gdHJ1ZVxuICAgIEBwYXJlbnQuYWJvcnQoKVxuICAgIHJldHVybiBmYWxzZVxuICBcbiAgZ2V0U2tpcHBlZDogLT5cbiAgICByZXR1cm4gXCJjb25zZW50XCIgOiBcInNraXBwZWRcIlxuICBcbiAgc2hvd0Vycm9yczogLT5cbiAgICBhbnN3ZXIgPSBAY29uc2VudEJ1dHRvbi5hbnN3ZXIgXG4gICAgaWYgYW5zd2VyID09IFwibm9cIlxuICAgICAgVXRpbHMubWlkQWxlcnQgQHRleHQuY29uZmlybVxuICAgICAgQHNob3dOb25Db25zZW50KClcbiAgICBlbHNlIGlmIGFuc3dlciA9PSB1bmRlZmluZWRcbiAgICAgICQoXCIubWVzc2FnZXNcIikuaHRtbCBAdGV4dC5zZWxlY3RcblxuICBnZXRSZXN1bHQ6IC0+XG4gICAgcmV0dXJuIFwiY29uc2VudFwiIDogQGNvbnNlbnRCdXR0b24uYW5zd2VyXG5cbiAgb25DbG9zZTogLT5cbiAgICBAY29uc2VudEJ1dHRvbj8uY2xvc2U/KClcbiJdfQ==
