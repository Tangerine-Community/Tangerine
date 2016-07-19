var ResultView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ResultView = (function(superClass) {
  extend(ResultView, superClass);

  function ResultView() {
    return ResultView.__super__.constructor.apply(this, arguments);
  }

  ResultView.prototype.className = "result_view";

  ResultView.prototype.events = {
    'click .save': 'save',
    'click .another': 'another'
  };

  ResultView.prototype.another = function() {
    return window.location.reload();
  };

  ResultView.prototype.save = function() {
    return this.model.add({
      name: "Assessment complete",
      prototype: "complete",
      data: {
        "comment": this.$el.find('#additional-comments').val() || "",
        "end_time": (new Date()).getTime()
      },
      subtestId: "result"
    }, {
      success: (function(_this) {
        return function() {
          var $button;
          Tangerine.activity = "";
          Utils.midAlert(_this.text.saved);
          _this.$el.find('.save_status').html(_this.text.saved);
          _this.$el.find('.save_status').removeClass('not_saved');
          _this.$el.find('.question').fadeOut(250);
          $button = _this.$el.find("button.save");
          return $button.removeClass('save').addClass('another').html(_this.text.another);
        };
      })(this),
      error: (function(_this) {
        return function() {
          Utils.midAlert("Save error");
          return _this.$el.find('.save_status').html("Results may not have saved");
        };
      })(this)
    });
  };

  ResultView.prototype.i18n = function() {
    return this.text = {
      "assessmentComplete": t("ResultView.label.assessment_complete"),
      "comments": t("ResultView.label.comments"),
      "subtestsCompleted": t("ResultView.label.subtests_completed"),
      "save": t("ResultView.button.save"),
      "another": t("ResultView.button.another"),
      "saved": t("ResultView.message.saved"),
      "notSaved": t("ResultView.message.not_saved")
    };
  };

  ResultView.prototype.initialize = function(options) {
    this.i18n();
    this.model = options.model;
    this.assessment = options.assessment;
    this.saved = false;
    return this.resultSumView = new ResultSumView({
      model: this.model,
      finishCheck: false
    });
  };

  ResultView.prototype.render = function() {
    this.$el.html("<h2>" + this.text.assessmentComplete + "</h2> <button class='save command'>" + this.text.save + "</button> <div class='info_box save_status not_saved'>" + this.text.notSaved + "</div> <br> <div class='question'> <label class='prompt' for='additional-comments'>" + this.text.comments + "</label> <textarea id='additional-comments' class='full_width'></textarea> </div> <div class='label_value'> <h2>" + this.text.subtestsCompleted + "</h2> <div id='result_sum' class='info_box'></div> </div>");
    this.resultSumView.setElement(this.$el.find("#result_sum"));
    this.resultSumView.render();
    return this.trigger("rendered");
  };

  ResultView.prototype.onClose = function() {
    return this.resultSumView.close();
  };

  return ResultView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3VsdC9SZXN1bHRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFVBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7dUJBRUosU0FBQSxHQUFXOzt1QkFFWCxNQUFBLEdBQ0U7SUFBQSxhQUFBLEVBQW1CLE1BQW5CO0lBQ0EsZ0JBQUEsRUFBbUIsU0FEbkI7Ozt1QkFHRixPQUFBLEdBQVMsU0FBQTtXQUNQLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBaEIsQ0FBQTtFQURPOzt1QkFJVCxJQUFBLEdBQU0sU0FBQTtXQUNKLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUNFO01BQUEsSUFBQSxFQUFPLHFCQUFQO01BQ0EsU0FBQSxFQUFXLFVBRFg7TUFFQSxJQUFBLEVBQ0U7UUFBQSxTQUFBLEVBQVksSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsc0JBQVYsQ0FBaUMsQ0FBQyxHQUFsQyxDQUFBLENBQUEsSUFBMkMsRUFBdkQ7UUFDQSxVQUFBLEVBQWEsQ0FBSyxJQUFBLElBQUEsQ0FBQSxDQUFMLENBQVksQ0FBQyxPQUFiLENBQUEsQ0FEYjtPQUhGO01BS0EsU0FBQSxFQUFZLFFBTFo7S0FERixFQVFFO01BQUEsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNQLGNBQUE7VUFBQSxTQUFTLENBQUMsUUFBVixHQUFxQjtVQUNyQixLQUFLLENBQUMsUUFBTixDQUFlLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FBckI7VUFDQSxLQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxjQUFWLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsS0FBQyxDQUFBLElBQUksQ0FBQyxLQUFyQztVQUNBLEtBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGNBQVYsQ0FBeUIsQ0FBQyxXQUExQixDQUFzQyxXQUF0QztVQUNBLEtBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLFdBQVYsQ0FBc0IsQ0FBQyxPQUF2QixDQUErQixHQUEvQjtVQUVBLE9BQUEsR0FBVSxLQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxhQUFWO2lCQUVWLE9BQU8sQ0FBQyxXQUFSLENBQW9CLE1BQXBCLENBQTJCLENBQUMsUUFBNUIsQ0FBcUMsU0FBckMsQ0FBK0MsQ0FBQyxJQUFoRCxDQUFxRCxLQUFDLENBQUEsSUFBSSxDQUFDLE9BQTNEO1FBVE87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7TUFVQSxLQUFBLEVBQU8sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ0wsS0FBSyxDQUFDLFFBQU4sQ0FBZSxZQUFmO2lCQUNBLEtBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGNBQVYsQ0FBeUIsQ0FBQyxJQUExQixDQUErQiw0QkFBL0I7UUFGSztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FWUDtLQVJGO0VBREk7O3VCQXdCTixJQUFBLEdBQU0sU0FBQTtXQUNKLElBQUMsQ0FBQSxJQUFELEdBQ0U7TUFBQSxvQkFBQSxFQUF1QixDQUFBLENBQUUsc0NBQUYsQ0FBdkI7TUFDQSxVQUFBLEVBQXVCLENBQUEsQ0FBRSwyQkFBRixDQUR2QjtNQUVBLG1CQUFBLEVBQXVCLENBQUEsQ0FBRSxxQ0FBRixDQUZ2QjtNQUlBLE1BQUEsRUFBdUIsQ0FBQSxDQUFFLHdCQUFGLENBSnZCO01BS0EsU0FBQSxFQUF1QixDQUFBLENBQUUsMkJBQUYsQ0FMdkI7TUFPQSxPQUFBLEVBQXVCLENBQUEsQ0FBRSwwQkFBRixDQVB2QjtNQVFBLFVBQUEsRUFBdUIsQ0FBQSxDQUFFLDhCQUFGLENBUnZCOztFQUZFOzt1QkFhTixVQUFBLEdBQVksU0FBRSxPQUFGO0lBRVYsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUVBLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBQ2pCLElBQUMsQ0FBQSxVQUFELEdBQWMsT0FBTyxDQUFDO0lBQ3RCLElBQUMsQ0FBQSxLQUFELEdBQVM7V0FDVCxJQUFDLENBQUEsYUFBRCxHQUFxQixJQUFBLGFBQUEsQ0FDbkI7TUFBQSxLQUFBLEVBQWMsSUFBQyxDQUFBLEtBQWY7TUFDQSxXQUFBLEVBQWMsS0FEZDtLQURtQjtFQVBYOzt1QkFXWixNQUFBLEdBQVEsU0FBQTtJQUNOLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE1BQUEsR0FDRixJQUFDLENBQUEsSUFBSSxDQUFDLGtCQURKLEdBQ3VCLHFDQUR2QixHQUd1QixJQUFDLENBQUEsSUFBSSxDQUFDLElBSDdCLEdBR2tDLHdEQUhsQyxHQUlzQyxJQUFDLENBQUEsSUFBSSxDQUFDLFFBSjVDLEdBSXFELHFGQUpyRCxHQVE0QyxJQUFDLENBQUEsSUFBSSxDQUFDLFFBUmxELEdBUTJELGtIQVIzRCxHQWFBLElBQUMsQ0FBQSxJQUFJLENBQUMsaUJBYk4sR0Fhd0IsMkRBYmxDO0lBa0JBLElBQUMsQ0FBQSxhQUFhLENBQUMsVUFBZixDQUEwQixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxhQUFWLENBQTFCO0lBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQUE7V0FFQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUF0Qk07O3VCQXdCUixPQUFBLEdBQVMsU0FBQTtXQUNQLElBQUMsQ0FBQSxhQUFhLENBQUMsS0FBZixDQUFBO0VBRE87Ozs7R0FwRmMsUUFBUSxDQUFDIiwiZmlsZSI6InJlc3VsdC9SZXN1bHRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUmVzdWx0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwicmVzdWx0X3ZpZXdcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLnNhdmUnICAgIDogJ3NhdmUnXG4gICAgJ2NsaWNrIC5hbm90aGVyJyA6ICdhbm90aGVyJ1xuXG4gIGFub3RoZXI6IC0+XG4gICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgI1RhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJyZXN0YXJ0LyN7QGFzc2Vzc21lbnQuaWR9XCIsIHRydWVcblxuICBzYXZlOiAtPlxuICAgIEBtb2RlbC5hZGRcbiAgICAgIG5hbWUgOiBcIkFzc2Vzc21lbnQgY29tcGxldGVcIlxuICAgICAgcHJvdG90eXBlOiBcImNvbXBsZXRlXCJcbiAgICAgIGRhdGEgOlxuICAgICAgICBcImNvbW1lbnRcIiA6IEAkZWwuZmluZCgnI2FkZGl0aW9uYWwtY29tbWVudHMnKS52YWwoKSB8fCBcIlwiXG4gICAgICAgIFwiZW5kX3RpbWVcIiA6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgIHN1YnRlc3RJZCA6IFwicmVzdWx0XCJcbiAgICAsXG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICBUYW5nZXJpbmUuYWN0aXZpdHkgPSBcIlwiXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IEB0ZXh0LnNhdmVkXG4gICAgICAgIEAkZWwuZmluZCgnLnNhdmVfc3RhdHVzJykuaHRtbCBAdGV4dC5zYXZlZFxuICAgICAgICBAJGVsLmZpbmQoJy5zYXZlX3N0YXR1cycpLnJlbW92ZUNsYXNzKCdub3Rfc2F2ZWQnKVxuICAgICAgICBAJGVsLmZpbmQoJy5xdWVzdGlvbicpLmZhZGVPdXQoMjUwKVxuXG4gICAgICAgICRidXR0b24gPSBAJGVsLmZpbmQoXCJidXR0b24uc2F2ZVwiKVxuXG4gICAgICAgICRidXR0b24ucmVtb3ZlQ2xhc3MoJ3NhdmUnKS5hZGRDbGFzcygnYW5vdGhlcicpLmh0bWwgQHRleHQuYW5vdGhlclxuICAgICAgZXJyb3I6ID0+XG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU2F2ZSBlcnJvclwiXG4gICAgICAgIEAkZWwuZmluZCgnLnNhdmVfc3RhdHVzJykuaHRtbCBcIlJlc3VsdHMgbWF5IG5vdCBoYXZlIHNhdmVkXCJcblxuXG4gIGkxOG46IC0+XG4gICAgQHRleHQgPVxuICAgICAgXCJhc3Nlc3NtZW50Q29tcGxldGVcIiA6IHQoXCJSZXN1bHRWaWV3LmxhYmVsLmFzc2Vzc21lbnRfY29tcGxldGVcIilcbiAgICAgIFwiY29tbWVudHNcIiAgICAgICAgICAgOiB0KFwiUmVzdWx0Vmlldy5sYWJlbC5jb21tZW50c1wiKVxuICAgICAgXCJzdWJ0ZXN0c0NvbXBsZXRlZFwiICA6IHQoXCJSZXN1bHRWaWV3LmxhYmVsLnN1YnRlc3RzX2NvbXBsZXRlZFwiKVxuXG4gICAgICBcInNhdmVcIiAgICAgICAgICAgICAgIDogdChcIlJlc3VsdFZpZXcuYnV0dG9uLnNhdmVcIilcbiAgICAgIFwiYW5vdGhlclwiICAgICAgICAgICAgOiB0KFwiUmVzdWx0Vmlldy5idXR0b24uYW5vdGhlclwiKVxuXG4gICAgICBcInNhdmVkXCIgICAgICAgICAgICAgIDogdChcIlJlc3VsdFZpZXcubWVzc2FnZS5zYXZlZFwiKVxuICAgICAgXCJub3RTYXZlZFwiICAgICAgICAgICA6IHQoXCJSZXN1bHRWaWV3Lm1lc3NhZ2Uubm90X3NhdmVkXCIpXG5cblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuXG4gICAgQGkxOG4oKVxuXG4gICAgQG1vZGVsID0gb3B0aW9ucy5tb2RlbFxuICAgIEBhc3Nlc3NtZW50ID0gb3B0aW9ucy5hc3Nlc3NtZW50XG4gICAgQHNhdmVkID0gZmFsc2VcbiAgICBAcmVzdWx0U3VtVmlldyA9IG5ldyBSZXN1bHRTdW1WaWV3XG4gICAgICBtb2RlbCAgICAgICA6IEBtb2RlbFxuICAgICAgZmluaXNoQ2hlY2sgOiBmYWxzZVxuXG4gIHJlbmRlcjogLT5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxoMj4je0B0ZXh0LmFzc2Vzc21lbnRDb21wbGV0ZX08L2gyPlxuXG4gICAgICA8YnV0dG9uIGNsYXNzPSdzYXZlIGNvbW1hbmQnPiN7QHRleHQuc2F2ZX08L2J1dHRvbj5cbiAgICAgIDxkaXYgY2xhc3M9J2luZm9fYm94IHNhdmVfc3RhdHVzIG5vdF9zYXZlZCc+I3tAdGV4dC5ub3RTYXZlZH08L2Rpdj5cbiAgICAgIDxicj5cblxuICAgICAgPGRpdiBjbGFzcz0ncXVlc3Rpb24nPlxuICAgICAgICA8bGFiZWwgY2xhc3M9J3Byb21wdCcgZm9yPSdhZGRpdGlvbmFsLWNvbW1lbnRzJz4je0B0ZXh0LmNvbW1lbnRzfTwvbGFiZWw+XG4gICAgICAgIDx0ZXh0YXJlYSBpZD0nYWRkaXRpb25hbC1jb21tZW50cycgY2xhc3M9J2Z1bGxfd2lkdGgnPjwvdGV4dGFyZWE+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8aDI+I3tAdGV4dC5zdWJ0ZXN0c0NvbXBsZXRlZH08L2gyPlxuICAgICAgICA8ZGl2IGlkPSdyZXN1bHRfc3VtJyBjbGFzcz0naW5mb19ib3gnPjwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgXCJcblxuICAgIEByZXN1bHRTdW1WaWV3LnNldEVsZW1lbnQoQCRlbC5maW5kKFwiI3Jlc3VsdF9zdW1cIikpXG4gICAgQHJlc3VsdFN1bVZpZXcucmVuZGVyKClcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gIG9uQ2xvc2U6IC0+XG4gICAgQHJlc3VsdFN1bVZpZXcuY2xvc2UoKVxuIl19
