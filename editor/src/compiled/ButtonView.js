var ButtonView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ButtonView = (function(superClass) {
  extend(ButtonView, superClass);

  function ButtonView() {
    return ButtonView.__super__.constructor.apply(this, arguments);
  }

  ButtonView.prototype.className = "ButtonView";

  ButtonView.prototype.events = Modernizr.touch ? {
    "touchstart .button": "onClick"
  } : {
    "click .button": "onClick"
  };

  ButtonView.prototype.getValue = function() {
    return this.answer;
  };

  ButtonView.prototype.setValue = function(values) {
    var selector;
    if (values == null) {
      values = [];
    }
    if (!_(values).isArray()) {
      values = [values];
    }
    this.answer = _.union(values, this.options);
    selector = this.answer.map(function(value) {
      return "[data-value='" + value + "']";
    }).join(',');
    this.$el.find(".button").removeClass("selected");
    return this.$el.find(selector).addClass("selected");
  };

  ButtonView.prototype.onChange = function(event) {
    var value;
    value = _.map($(event.target).find("option:selected"), function(x) {
      return $(x).attr('data-answer');
    });
    return this.trigger("change", this.el);
  };

  ButtonView.prototype.hybridClick = function(opts) {
    this.$el.find(".button").removeClass("selected");
    if (!opts.checkedBefore) {
      opts.$target.addClass("selected");
      return this.answer = "";
    } else {
      return this.answer = opts.value;
    }
  };

  ButtonView.prototype.singleClick = function(opts) {
    this.$el.find(".button").removeClass("selected");
    opts.$target.addClass("selected");
    return this.answer = opts.value;
  };

  ButtonView.prototype.multipleClick = function(opts) {
    if (opts.checkedBefore) {
      opts.$target.removeClass("selected");
    } else {
      opts.$target.addClass("selected");
    }
    return this.answer[opts.value] = opts.checkedBefore ? "unchecked" : "checked";
  };

  ButtonView.prototype.onClick = function(event) {
    var options;
    options = {
      $target: $(event.target),
      value: $(event.target).attr('data-value'),
      checkedBefore: $(event.target).hasClass("selected")
    };
    this[this.mode + "Click"](options);
    return this.trigger("change", this.el);
  };

  ButtonView.prototype.initialize = function(options) {
    var answer;
    this.mode = options.mode;
    this.options = options.options;
    this.fontFamily = options.fontFamily;
    this.fontStyle = (this.fontFamily != null) && this.fontFamily !== "" ? "style=\"font-family: " + this.fontFamily + " !important;\"" : "";
    if (this.mode === "single" || this.mode === "open") {
      answer = "";
    } else if (this.mode === "multiple") {
      answer = {};
      this.options.forEach(function(option) {
        return answer[option.value] = "unchecked";
      });
    }
    return this.answer = answer;
  };

  ButtonView.prototype.render = function() {
    var htmlOptions;
    htmlOptions = "";
    this.options.forEach(function(option, i) {
      var label, selectedClass, styleClass, value;
      styleClass = i === 0 ? "left" : i === this.options.length - 1 ? "right" : "";
      value = option.value;
      label = option.label;
      selectedClass = this.mode === "multiple" && this.answer[value] === "checked" ? "selected" : this.mode === "single" && this.answer === value ? "selected" : "";
      return htmlOptions += "<div class='button " + styleClass + " " + selectedClass + "' data-value='" + value + "' " + this.fontStyle + ">" + label + "</div>";
    }, this);
    this.$el.html("" + htmlOptions).addClass(this.className);
    return this.trigger("rendered");
  };

  return ButtonView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1dHRvbi9CdXR0b25WaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFVBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7dUJBRUosU0FBQSxHQUFZOzt1QkFFWixNQUFBLEdBQ0ssU0FBUyxDQUFDLEtBQWIsR0FDRTtJQUFBLG9CQUFBLEVBQXVCLFNBQXZCO0dBREYsR0FHRTtJQUFBLGVBQUEsRUFBdUIsU0FBdkI7Ozt1QkFFSixRQUFBLEdBQVUsU0FBQTtXQUFHLElBQUMsQ0FBQTtFQUFKOzt1QkFFVixRQUFBLEdBQVUsU0FBQyxNQUFEO0FBRVIsUUFBQTs7TUFGUyxTQUFTOztJQUVsQixJQUFBLENBQXlCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBekI7TUFBQSxNQUFBLEdBQVMsQ0FBQyxNQUFELEVBQVQ7O0lBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxDQUFDLENBQUMsS0FBRixDQUFRLE1BQVIsRUFBZ0IsSUFBQyxDQUFBLE9BQWpCO0lBRVYsUUFBQSxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFhLFNBQUMsS0FBRDthQUFXLGVBQUEsR0FBZ0IsS0FBaEIsR0FBc0I7SUFBakMsQ0FBYixDQUFtRCxDQUFDLElBQXBELENBQXlELEdBQXpEO0lBRVgsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsU0FBVixDQUFvQixDQUFDLFdBQXJCLENBQWlDLFVBQWpDO1dBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsUUFBVixDQUFtQixDQUFDLFFBQXBCLENBQTZCLFVBQTdCO0VBVFE7O3VCQVlWLFFBQUEsR0FBVSxTQUFDLEtBQUQ7QUFFUixRQUFBO0lBQUEsS0FBQSxHQUFRLENBQUMsQ0FBQyxHQUFGLENBQU0sQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxJQUFoQixDQUFxQixpQkFBckIsQ0FBTixFQUErQyxTQUFDLENBQUQ7YUFBTyxDQUFBLENBQUUsQ0FB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Q0FBQSxLQUFLLENBQVIsR0FDRSxNQURGLEdBRVEsQ0FBQSxLQUFLLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxHQUFnQixDQUF4QixHQUNILE9BREcsR0FHSDtNQUVKLEtBQUEsR0FBUSxNQUFNLENBQUM7TUFDZixLQUFBLEdBQVEsTUFBTSxDQUFDO01BRWYsYUFBQSxHQUNLLElBQUMsQ0FBQSxJQUFELEtBQVMsVUFBVCxJQUF1QixJQUFDLENBQUEsTUFBTyxDQUFBLEtBQUEsQ0FBUixLQUFrQixTQUE1QyxHQUNFLFVBREYsR0FFUSxJQUFDLENBQUEsSUFBRCxLQUFTLFFBQVQsSUFBcUIsSUFBQyxDQUFBLE1BQUQsS0FBVyxLQUFuQyxHQUNILFVBREcsR0FHSDthQUVKLFdBQUEsSUFBZSxxQkFBQSxHQUFzQixVQUF0QixHQUFpQyxHQUFqQyxHQUFvQyxhQUFwQyxHQUFrRCxnQkFBbEQsR0FBa0UsS0FBbEUsR0FBd0UsSUFBeEUsR0FBNEUsSUFBQyxDQUFBLFNBQTdFLEdBQXVGLEdBQXZGLEdBQTBGLEtBQTFGLEdBQWdHO0lBckJoRyxDQUFqQixFQXNCRSxJQXRCRjtJQXdCQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxFQUFBLEdBQ04sV0FESixDQUVFLENBQUMsUUFGSCxDQUVZLElBQUMsQ0FBQSxTQUZiO1dBSUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBaENPOzs7O0dBdkZjLFFBQVEsQ0FBQyIsImZpbGUiOiJidXR0b24vQnV0dG9uVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEJ1dHRvblZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lIDogXCJCdXR0b25WaWV3XCJcblxuICBldmVudHMgOlxuICAgIGlmIE1vZGVybml6ci50b3VjaFxuICAgICAgXCJ0b3VjaHN0YXJ0IC5idXR0b25cIiA6IFwib25DbGlja1wiXG4gICAgZWxzZSBcbiAgICAgIFwiY2xpY2sgLmJ1dHRvblwiICAgICAgOiBcIm9uQ2xpY2tcIlxuXG4gIGdldFZhbHVlOiAtPiBAYW5zd2VyXG5cbiAgc2V0VmFsdWU6ICh2YWx1ZXMgPSBbXSkgLT5cblxuICAgIHZhbHVlcyA9IFt2YWx1ZXNdIHVubGVzcyBfKHZhbHVlcykuaXNBcnJheSgpXG5cbiAgICBAYW5zd2VyID0gXy51bmlvbih2YWx1ZXMsIEBvcHRpb25zKVxuXG4gICAgc2VsZWN0b3IgPSBAYW5zd2VyLm1hcCggKHZhbHVlKSAtPiBcIltkYXRhLXZhbHVlPScje3ZhbHVlfSddXCIgKS5qb2luKCcsJylcblxuICAgIEAkZWwuZmluZChcIi5idXR0b25cIikucmVtb3ZlQ2xhc3MgXCJzZWxlY3RlZFwiXG4gICAgQCRlbC5maW5kKHNlbGVjdG9yKS5hZGRDbGFzcyBcInNlbGVjdGVkXCJcblxuXG4gIG9uQ2hhbmdlOiAoZXZlbnQpIC0+XG5cbiAgICB2YWx1ZSA9IF8ubWFwKCQoZXZlbnQudGFyZ2V0KS5maW5kKFwib3B0aW9uOnNlbGVjdGVkXCIpLCAoeCkgLT4gJCh4KS5hdHRyKCdkYXRhLWFuc3dlcicpKVxuICAgIEB0cmlnZ2VyIFwiY2hhbmdlXCIsIEBlbFxuXG4gIGh5YnJpZENsaWNrOiAob3B0cykgLT4gXG4gICAgQCRlbC5maW5kKFwiLmJ1dHRvblwiKS5yZW1vdmVDbGFzcyBcInNlbGVjdGVkXCJcblxuICAgIGlmIG5vdCBvcHRzLmNoZWNrZWRCZWZvcmVcbiAgICAgIG9wdHMuJHRhcmdldC5hZGRDbGFzcyBcInNlbGVjdGVkXCJcbiAgICAgIEBhbnN3ZXIgPSBcIlwiXG4gICAgZWxzZVxuICAgICAgQGFuc3dlciA9IG9wdHMudmFsdWVcblxuICBzaW5nbGVDbGljazogKG9wdHMpIC0+XG4gICAgQCRlbC5maW5kKFwiLmJ1dHRvblwiKS5yZW1vdmVDbGFzcyBcInNlbGVjdGVkXCJcbiAgICBvcHRzLiR0YXJnZXQuYWRkQ2xhc3MgXCJzZWxlY3RlZFwiXG4gICAgQGFuc3dlciA9IG9wdHMudmFsdWVcblxuXG4gIG11bHRpcGxlQ2xpY2s6IChvcHRzKSAtPlxuXG4gICAgaWYgb3B0cy5jaGVja2VkQmVmb3JlXG4gICAgICBvcHRzLiR0YXJnZXQucmVtb3ZlQ2xhc3MgXCJzZWxlY3RlZFwiXG4gICAgZWxzZVxuICAgICAgb3B0cy4kdGFyZ2V0LmFkZENsYXNzIFwic2VsZWN0ZWRcIlxuXG4gICAgQGFuc3dlcltvcHRzLnZhbHVlXSA9XG4gICAgICBpZiBvcHRzLmNoZWNrZWRCZWZvcmVcbiAgICAgICAgXCJ1bmNoZWNrZWRcIlxuICAgICAgZWxzZVxuICAgICAgICBcImNoZWNrZWRcIlxuXG5cbiAgb25DbGljayA6IChldmVudCkgLT5cblxuICAgIG9wdGlvbnMgPVxuICAgICAgJHRhcmdldCAgICAgICA6ICQoZXZlbnQudGFyZ2V0KVxuICAgICAgdmFsdWUgICAgICAgICA6ICQoZXZlbnQudGFyZ2V0KS5hdHRyKCdkYXRhLXZhbHVlJylcbiAgICAgIGNoZWNrZWRCZWZvcmUgOiAkKGV2ZW50LnRhcmdldCkuaGFzQ2xhc3MoXCJzZWxlY3RlZFwiKVxuXG4gICAgQFtcIiN7QG1vZGV9Q2xpY2tcIl0ob3B0aW9ucylcbiAgICBAdHJpZ2dlciBcImNoYW5nZVwiLCBAZWxcblxuICBpbml0aWFsaXplIDogKCBvcHRpb25zICkgLT5cbiAgICBAbW9kZSAgICA9IG9wdGlvbnMubW9kZVxuICAgIEBvcHRpb25zID0gb3B0aW9ucy5vcHRpb25zXG5cbiAgICBAZm9udEZhbWlseSA9IG9wdGlvbnMuZm9udEZhbWlseVxuICAgIEBmb250U3R5bGUgPSBpZiBAZm9udEZhbWlseT8gYW5kIEBmb250RmFtaWx5ICE9IFwiXCJcbiAgICAgICAgXCJzdHlsZT1cXFwiZm9udC1mYW1pbHk6ICN7QGZvbnRGYW1pbHl9ICFpbXBvcnRhbnQ7XFxcIlwiXG4gICAgICBlbHNlXG4gICAgICAgIFwiXCJcbiAgICBcbiAgICBpZiBAbW9kZSA9PSBcInNpbmdsZVwiIG9yIEBtb2RlID09IFwib3BlblwiXG4gICAgICBhbnN3ZXIgPSBcIlwiXG4gICAgZWxzZSBpZiBAbW9kZSA9PSBcIm11bHRpcGxlXCJcbiAgICAgIGFuc3dlciA9IHt9XG4gICAgICBAb3B0aW9ucy5mb3JFYWNoIChvcHRpb24pIC0+XG4gICAgICAgIGFuc3dlcltvcHRpb24udmFsdWVdID0gXCJ1bmNoZWNrZWRcIlxuXG4gICAgQGFuc3dlciA9IGFuc3dlclxuXG4gIHJlbmRlciA6IC0+XG5cbiAgICBodG1sT3B0aW9ucyA9IFwiXCJcblxuICAgIEBvcHRpb25zLmZvckVhY2ggKG9wdGlvbiwgaSkgLT5cblxuICAgICAgc3R5bGVDbGFzcyA9XG4gICAgICAgIGlmIGkgPT0gMFxuICAgICAgICAgIFwibGVmdFwiXG4gICAgICAgIGVsc2UgaWYgaSA9PSBAb3B0aW9ucy5sZW5ndGgtMVxuICAgICAgICAgIFwicmlnaHRcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgXCJcIlxuXG4gICAgICB2YWx1ZSA9IG9wdGlvbi52YWx1ZVxuICAgICAgbGFiZWwgPSBvcHRpb24ubGFiZWxcblxuICAgICAgc2VsZWN0ZWRDbGFzcyA9XG4gICAgICAgIGlmIEBtb2RlID09IFwibXVsdGlwbGVcIiAmJiBAYW5zd2VyW3ZhbHVlXSA9PSBcImNoZWNrZWRcIlxuICAgICAgICAgIFwic2VsZWN0ZWRcIlxuICAgICAgICBlbHNlIGlmIEBtb2RlID09IFwic2luZ2xlXCIgJiYgQGFuc3dlciA9PSB2YWx1ZVxuICAgICAgICAgIFwic2VsZWN0ZWRcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgXCJcIlxuXG4gICAgICBodG1sT3B0aW9ucyArPSBcIjxkaXYgY2xhc3M9J2J1dHRvbiAje3N0eWxlQ2xhc3N9ICN7c2VsZWN0ZWRDbGFzc30nIGRhdGEtdmFsdWU9JyN7dmFsdWV9JyAje0Bmb250U3R5bGV9PiN7bGFiZWx9PC9kaXY+XCJcbiAgICAsIEBcblxuICAgIEAkZWwuaHRtbChcIlxuICAgICAgI3todG1sT3B0aW9uc31cbiAgICBcIikuYWRkQ2xhc3MoQGNsYXNzTmFtZSkgIyBXaHkgZG8gSSBoYXZlIHRvIGRvIHRoaXM/XG5cbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcbiJdfQ==
