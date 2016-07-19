var SettingsView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SettingsView = (function(superClass) {
  extend(SettingsView, superClass);

  function SettingsView() {
    return SettingsView.__super__.constructor.apply(this, arguments);
  }

  SettingsView.prototype.className = "SettingsView";

  SettingsView.prototype.events = {
    'click .save': 'save',
    'click .back': 'goBack'
  };

  SettingsView.prototype.goBack = function() {
    return window.history.back();
  };

  SettingsView.prototype.i18n = function() {
    return this.text = {
      save: t("Tangerine.actions.button.save"),
      back: t("Tangerine.navigation.button.back"),
      saved: t("Tangerine.message.saved"),
      saveError: t("Tangerine.message.save_error"),
      settings: t("SettingsView.label.settings"),
      warning: t("SettingsView.message.warning"),
      contextHelp: t("SettingsView.help.context"),
      languageHelp: t("SettingsView.help.language"),
      groupHandleHelp: t("SettingsView.help.group_handle"),
      groupNameHelp: t("SettingsView.help.group_name"),
      groupHostHelp: t("SettingsView.help.group_host"),
      uploadPasswordHelp: t("SettingsView.help.upload_password"),
      logEventsHelp: t("SettingsView.help.log_events"),
      context: t("SettingsView.label.context"),
      language: t("SettingsView.label.language"),
      groupHandle: t("SettingsView.label.group_handle"),
      groupName: t("SettingsView.label.group_name"),
      groupHost: t("SettingsView.label.group_host"),
      uploadPassword: t("SettingsView.label.upload_password"),
      logEvents: t("SettingsView.label.log_events")
    };
  };

  SettingsView.prototype.initialize = function(options) {
    this.i18n();
    return this.settings = Tangerine.settings;
  };

  SettingsView.prototype.save = function() {
    return this.settings.save({
      groupHandle: this.$el.find('#group_handle').val(),
      context: this.$el.find('#context').val(),
      language: this.$el.find('#language').val(),
      groupName: this.$el.find("#group_name").val(),
      groupHost: this.$el.find("#group_host").val(),
      upPass: this.$el.find("#up_pass").val(),
      log: this.$el.find("#log").val().split(/[\s,]+/)
    }, {
      success: (function(_this) {
        return function() {
          return Utils.midAlert(_this.text.saved);
        };
      })(this),
      error: function() {
        return Utils.midAlert(this.text.saveError);
      }
    });
  };

  SettingsView.prototype.render = function() {
    var context, groupHandle, groupHost, groupName, language, log, upPass;
    context = this.settings.getEscapedString("context");
    language = this.settings.getEscapedString("language");
    groupName = this.settings.getEscapedString("groupName");
    groupHandle = this.settings.getEscapedString("groupHandle");
    groupHost = this.settings.getEscapedString("groupHost");
    upPass = this.settings.getEscapedString("upPass");
    log = _.escape(this.settings.getArray("log").join(", "));
    this.$el.html("<button class='back navigation'>" + this.text.back + "</button> <h1>" + this.text.settings + "</h1> <p><img src='images/icon_warn.png' title='Warning'>" + this.text.warning + "</p> <div class='menu_box'> <div class='label_value'> <label for='context' title='" + this.text.contextHelp + "'>" + this.text.context + "</label><br> <input id='context' type='text' value='" + context + "'> </div> <div class='label_value'> <label for='language' title='" + this.text.languageHelp + "'>" + this.text.language + "</label><br> <input id='language' type='text' value='" + language + "'> </div> <div class='label_value'> <label for='group_handle' title='" + this.text.groupHandleHelp + "'>" + this.text.groupHandle + "</label><br> <input id='group_handle' type='text' value='" + groupHandle + "'> </div> <div class='label_value'> <label for='group_name' title='" + this.text.groupNameHelp + "'>" + this.text.groupName + "</label><br> <input id='group_name' type='text' value='" + groupName + "'> </div> <div class='label_value'> <label for='group_host' title='" + this.text.groupHostHelp + "'>" + this.text.groupHost + "</label><br> <input id='group_host' type='text' value='" + groupHost + "'> </div> <div class='label_value'> <label for='up_pass' title='" + this.text.uploadPasswordHelp + "'>" + this.text.uploadPassword + "</label><br> <input id='up_pass' type='text' value='" + upPass + "'> </div> <div class='label_value'> <label for='log' title='" + this.text.logEventsHelp + "'>" + this.text.logEvents + "</label><br> <input id='log' value='" + log + "'> </div> </div><br> <button class='command save'>" + this.text.save + "</button>");
    return this.trigger("rendered");
  };

  return SettingsView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNldHRpbmdzL1NldHRpbmdzVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxZQUFBO0VBQUE7OztBQUFNOzs7Ozs7O3lCQUVKLFNBQUEsR0FBWTs7eUJBRVosTUFBQSxHQUNFO0lBQUEsYUFBQSxFQUFnQixNQUFoQjtJQUNBLGFBQUEsRUFBZ0IsUUFEaEI7Ozt5QkFHRixNQUFBLEdBQVEsU0FBQTtXQUNOLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBZixDQUFBO0VBRE07O3lCQUdSLElBQUEsR0FBTSxTQUFBO1dBQ0osSUFBQyxDQUFBLElBQUQsR0FFRTtNQUFBLElBQUEsRUFBTyxDQUFBLENBQUUsK0JBQUYsQ0FBUDtNQUVBLElBQUEsRUFBTyxDQUFBLENBQUUsa0NBQUYsQ0FGUDtNQUlBLEtBQUEsRUFBUSxDQUFBLENBQUUseUJBQUYsQ0FKUjtNQUtBLFNBQUEsRUFBWSxDQUFBLENBQUUsOEJBQUYsQ0FMWjtNQU9BLFFBQUEsRUFBVSxDQUFBLENBQUUsNkJBQUYsQ0FQVjtNQVNBLE9BQUEsRUFBUyxDQUFBLENBQUUsOEJBQUYsQ0FUVDtNQVdBLFdBQUEsRUFBYSxDQUFBLENBQUUsMkJBQUYsQ0FYYjtNQVlBLFlBQUEsRUFBZSxDQUFBLENBQUUsNEJBQUYsQ0FaZjtNQWFBLGVBQUEsRUFBa0IsQ0FBQSxDQUFFLGdDQUFGLENBYmxCO01BY0EsYUFBQSxFQUFnQixDQUFBLENBQUUsOEJBQUYsQ0FkaEI7TUFlQSxhQUFBLEVBQWdCLENBQUEsQ0FBRSw4QkFBRixDQWZoQjtNQWdCQSxrQkFBQSxFQUFxQixDQUFBLENBQUUsbUNBQUYsQ0FoQnJCO01BaUJBLGFBQUEsRUFBZ0IsQ0FBQSxDQUFFLDhCQUFGLENBakJoQjtNQW1CQSxPQUFBLEVBQVMsQ0FBQSxDQUFFLDRCQUFGLENBbkJUO01Bb0JBLFFBQUEsRUFBVSxDQUFBLENBQUUsNkJBQUYsQ0FwQlY7TUFxQkEsV0FBQSxFQUFhLENBQUEsQ0FBRSxpQ0FBRixDQXJCYjtNQXNC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U2V0dGluZ3NWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU2V0dGluZ3NWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiU2V0dGluZ3NWaWV3XCJcblxuICBldmVudHM6IFxuICAgICdjbGljayAuc2F2ZScgOiAnc2F2ZSdcbiAgICAnY2xpY2sgLmJhY2snIDogJ2dvQmFjaydcblxuICBnb0JhY2s6IC0+XG4gICAgd2luZG93Lmhpc3RvcnkuYmFjaygpXG5cbiAgaTE4bjogLT5cbiAgICBAdGV4dCA9IFxuXG4gICAgICBzYXZlIDogdChcIlRhbmdlcmluZS5hY3Rpb25zLmJ1dHRvbi5zYXZlXCIpXG4gICAgICAgIFxuICAgICAgYmFjayA6IHQoXCJUYW5nZXJpbmUubmF2aWdhdGlvbi5idXR0b24uYmFja1wiKVxuXG4gICAgICBzYXZlZCA6IHQoXCJUYW5nZXJpbmUubWVzc2FnZS5zYXZlZFwiKVxuICAgICAgc2F2ZUVycm9yIDogdChcIlRhbmdlcmluZS5tZXNzYWdlLnNhdmVfZXJyb3JcIilcblxuICAgICAgc2V0dGluZ3M6IHQoXCJTZXR0aW5nc1ZpZXcubGFiZWwuc2V0dGluZ3NcIilcblxuICAgICAgd2FybmluZzogdChcIlNldHRpbmdzVmlldy5tZXNzYWdlLndhcm5pbmdcIilcblxuICAgICAgY29udGV4dEhlbHA6IHQoXCJTZXR0aW5nc1ZpZXcuaGVscC5jb250ZXh0XCIpXG4gICAgICBsYW5ndWFnZUhlbHAgOiB0KFwiU2V0dGluZ3NWaWV3LmhlbHAubGFuZ3VhZ2VcIilcbiAgICAgIGdyb3VwSGFuZGxlSGVscCA6IHQoXCJTZXR0aW5nc1ZpZXcuaGVscC5ncm91cF9oYW5kbGVcIilcbiAgICAgIGdyb3VwTmFtZUhlbHAgOiB0KFwiU2V0dGluZ3NWaWV3LmhlbHAuZ3JvdXBfbmFtZVwiKVxuICAgICAgZ3JvdXBIb3N0SGVscCA6IHQoXCJTZXR0aW5nc1ZpZXcuaGVscC5ncm91cF9ob3N0XCIpXG4gICAgICB1cGxvYWRQYXNzd29yZEhlbHAgOiB0KFwiU2V0dGluZ3NWaWV3LmhlbHAudXBsb2FkX3Bhc3N3b3JkXCIpXG4gICAgICBsb2dFdmVudHNIZWxwIDogdChcIlNldHRpbmdzVmlldy5oZWxwLmxvZ19ldmVudHNcIilcblxuICAgICAgY29udGV4dDogdChcIlNldHRpbmdzVmlldy5sYWJlbC5jb250ZXh0XCIpXG4gICAgICBsYW5ndWFnZTogdChcIlNldHRpbmdzVmlldy5sYWJlbC5sYW5ndWFnZVwiKVxuICAgICAgZ3JvdXBIYW5kbGU6IHQoXCJTZXR0aW5nc1ZpZXcubGFiZWwuZ3JvdXBfaGFuZGxlXCIpXG4gICAgICBncm91cE5hbWU6IHQoXCJTZXR0aW5nc1ZpZXcubGFiZWwuZ3JvdXBfbmFtZVwiKVxuICAgICAgZ3JvdXBIb3N0OiB0KFwiU2V0dGluZ3NWaWV3LmxhYmVsLmdyb3VwX2hvc3RcIilcbiAgICAgIHVwbG9hZFBhc3N3b3JkOiB0KFwiU2V0dGluZ3NWaWV3LmxhYmVsLnVwbG9hZF9wYXNzd29yZFwiKVxuICAgICAgbG9nRXZlbnRzIDogdChcIlNldHRpbmdzVmlldy5sYWJlbC5sb2dfZXZlbnRzXCIpXG4gICAgICBcbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG5cbiAgICBAaTE4bigpXG5cbiAgICBAc2V0dGluZ3MgPSBUYW5nZXJpbmUuc2V0dGluZ3NcblxuICBzYXZlOiAtPlxuICAgIEBzZXR0aW5ncy5zYXZlXG4gICAgICBncm91cEhhbmRsZSA6IEAkZWwuZmluZCgnI2dyb3VwX2hhbmRsZScpLnZhbCgpXG4gICAgICBjb250ZXh0ICAgICA6IEAkZWwuZmluZCgnI2NvbnRleHQnKS52YWwoKVxuICAgICAgbGFuZ3VhZ2UgICAgOiBAJGVsLmZpbmQoJyNsYW5ndWFnZScpLnZhbCgpXG4gICAgICBncm91cE5hbWUgICA6IEAkZWwuZmluZChcIiNncm91cF9uYW1lXCIpLnZhbCgpXG4gICAgICBncm91cEhvc3QgICA6IEAkZWwuZmluZChcIiNncm91cF9ob3N0XCIpLnZhbCgpXG4gICAgICB1cFBhc3MgICAgICA6IEAkZWwuZmluZChcIiN1cF9wYXNzXCIpLnZhbCgpXG4gICAgICBsb2cgICAgICAgICA6IEAkZWwuZmluZChcIiNsb2dcIikudmFsKCkuc3BsaXQoL1tcXHMsXSsvKVxuICAgICxcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IEB0ZXh0LnNhdmVkXG4gICAgICBlcnJvcjogLT5cbiAgICAgICAgVXRpbHMubWlkQWxlcnQgQHRleHQuc2F2ZUVycm9yXG5cbiAgcmVuZGVyOiAtPlxuICAgIGNvbnRleHQgICAgID0gQHNldHRpbmdzLmdldEVzY2FwZWRTdHJpbmcgXCJjb250ZXh0XCJcbiAgICBsYW5ndWFnZSAgICA9IEBzZXR0aW5ncy5nZXRFc2NhcGVkU3RyaW5nIFwibGFuZ3VhZ2VcIlxuICAgIGdyb3VwTmFtZSAgID0gQHNldHRpbmdzLmdldEVzY2FwZWRTdHJpbmcgXCJncm91cE5hbWVcIlxuICAgIGdyb3VwSGFuZGxlID0gQHNldHRpbmdzLmdldEVzY2FwZWRTdHJpbmcgXCJncm91cEhhbmRsZVwiXG4gICAgZ3JvdXBIb3N0ICAgPSBAc2V0dGluZ3MuZ2V0RXNjYXBlZFN0cmluZyBcImdyb3VwSG9zdFwiXG4gICAgdXBQYXNzICAgICAgPSBAc2V0dGluZ3MuZ2V0RXNjYXBlZFN0cmluZyBcInVwUGFzc1wiXG4gICAgbG9nICAgICAgICAgPSBfLmVzY2FwZSggQHNldHRpbmdzLmdldEFycmF5KFwibG9nXCIpLmpvaW4oXCIsIFwiKSApXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxidXR0b24gY2xhc3M9J2JhY2sgbmF2aWdhdGlvbic+I3tAdGV4dC5iYWNrfTwvYnV0dG9uPlxuICAgICAgPGgxPiN7QHRleHQuc2V0dGluZ3N9PC9oMT5cbiAgICAgIDxwPjxpbWcgc3JjPSdpbWFnZXMvaWNvbl93YXJuLnBuZycgdGl0bGU9J1dhcm5pbmcnPiN7QHRleHQud2FybmluZ308L3A+XG4gICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdjb250ZXh0JyB0aXRsZT0nI3tAdGV4dC5jb250ZXh0SGVscH0nPiN7QHRleHQuY29udGV4dH08L2xhYmVsPjxicj5cbiAgICAgICAgICA8aW5wdXQgaWQ9J2NvbnRleHQnIHR5cGU9J3RleHQnIHZhbHVlPScje2NvbnRleHR9Jz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdsYW5ndWFnZScgdGl0bGU9JyN7QHRleHQubGFuZ3VhZ2VIZWxwfSc+I3tAdGV4dC5sYW5ndWFnZX08L2xhYmVsPjxicj5cbiAgICAgICAgICA8aW5wdXQgaWQ9J2xhbmd1YWdlJyB0eXBlPSd0ZXh0JyB2YWx1ZT0nI3tsYW5ndWFnZX0nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J2dyb3VwX2hhbmRsZScgdGl0bGU9JyN7QHRleHQuZ3JvdXBIYW5kbGVIZWxwfSc+I3tAdGV4dC5ncm91cEhhbmRsZX08L2xhYmVsPjxicj5cbiAgICAgICAgICA8aW5wdXQgaWQ9J2dyb3VwX2hhbmRsZScgdHlwZT0ndGV4dCcgdmFsdWU9JyN7Z3JvdXBIYW5kbGV9Jz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdncm91cF9uYW1lJyB0aXRsZT0nI3tAdGV4dC5ncm91cE5hbWVIZWxwfSc+I3tAdGV4dC5ncm91cE5hbWV9PC9sYWJlbD48YnI+XG4gICAgICAgICAgPGlucHV0IGlkPSdncm91cF9uYW1lJyB0eXBlPSd0ZXh0JyB2YWx1ZT0nI3tncm91cE5hbWV9Jz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdncm91cF9ob3N0JyB0aXRsZT0nI3tAdGV4dC5ncm91cEhvc3RIZWxwfSc+I3tAdGV4dC5ncm91cEhvc3R9PC9sYWJlbD48YnI+XG4gICAgICAgICAgPGlucHV0IGlkPSdncm91cF9ob3N0JyB0eXBlPSd0ZXh0JyB2YWx1ZT0nI3tncm91cEhvc3R9Jz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSd1cF9wYXNzJyB0aXRsZT0nI3tAdGV4dC51cGxvYWRQYXNzd29yZEhlbHB9Jz4je0B0ZXh0LnVwbG9hZFBhc3N3b3JkfTwvbGFiZWw+PGJyPlxuICAgICAgICAgIDxpbnB1dCBpZD0ndXBfcGFzcycgdHlwZT0ndGV4dCcgdmFsdWU9JyN7dXBQYXNzfSc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nbG9nJyB0aXRsZT0nI3tAdGV4dC5sb2dFdmVudHNIZWxwfSc+I3tAdGV4dC5sb2dFdmVudHN9PC9sYWJlbD48YnI+XG4gICAgICAgICAgPGlucHV0IGlkPSdsb2cnIHZhbHVlPScje2xvZ30nPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2Pjxicj5cblxuICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBzYXZlJz4je0B0ZXh0LnNhdmV9PC9idXR0b24+XG4gICAgXCJcbiAgICBcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCIiXX0=
