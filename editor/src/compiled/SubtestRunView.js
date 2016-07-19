var SubtestRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

SubtestRunView = (function(superClass) {
  extend(SubtestRunView, superClass);

  function SubtestRunView() {
    this.hideNext = bind(this.hideNext, this);
    this.showNext = bind(this.showNext, this);
    this.afterRender = bind(this.afterRender, this);
    this.flagRender = bind(this.flagRender, this);
    return SubtestRunView.__super__.constructor.apply(this, arguments);
  }

  SubtestRunView.prototype.className = "SubtestRunView";

  SubtestRunView.prototype.events = {
    'click .subtest-next': 'next',
    'click .subtest-back': 'back',
    'click .subtest_help': 'toggleHelp',
    'click .skip': 'skip'
  };

  SubtestRunView.prototype.toggleHelp = function() {
    return this.$el.find(".enumerator_help").fadeToggle(250);
  };

  SubtestRunView.prototype.i18n = function() {
    return this.text = {
      "next": t("SubtestRunView.button.next"),
      "back": t("SubtestRunView.button.back"),
      "skip": t("SubtestRunView.button.skip"),
      "help": t("SubtestRunView.button.help")
    };
  };

  SubtestRunView.prototype.initialize = function(options) {
    this.i18n();
    this.protoViews = Tangerine.config.get("prototypeViews");
    this.model = options.model;
    this.parent = options.parent;
    if (this.model.get("fontFamily") !== "") {
      this.fontStyle = "style=\"font-family: " + (this.model.get('fontFamily')) + " !important;\"";
    }
    return this.prototypeRendered = false;
  };

  SubtestRunView.prototype.render = function() {
    var _render, code;
    _render = (function(_this) {
      return function() {
        var backButton, backable, enumeratorHelp, skipButton, skippable, studentDialog, transitionComment;
        _this.delegateEvents();
        enumeratorHelp = (_this.model.get("enumeratorHelp") || "") !== "" ? "<button class='subtest_help command'>" + _this.text.help + "</button><div class='enumerator_help' " + (_this.fontStyle || "") + ">" + (_this.model.get('enumeratorHelp')) + "</div>" : "";
        studentDialog = (_this.model.get("studentDialog") || "") !== "" ? "<div class='student_dialog' " + (_this.fontStyle || "") + ">" + (_this.model.get('studentDialog')) + "</div>" : "";
        transitionComment = (_this.model.get("transitionComment") || "") !== "" ? "<div class='student_dialog' " + (_this.fontStyle || "") + ">" + (_this.model.get('transitionComment')) + "</div> <br>" : "";
        skippable = _this.model.get("skippable") === true || _this.model.get("skippable") === "true";
        backable = (_this.model.get("backButton") === true || _this.model.get("backButton") === "true") && _this.parent.index !== 0;
        if (skippable) {
          skipButton = "<button class='skip navigation'>" + _this.text.skip + "</button>";
        }
        if (backable) {
          backButton = "<button class='subtest-back navigation'>" + _this.text.back + "</button>";
        }
        _this.$el.html("<h2>" + (_this.model.get('name')) + "</h2> " + enumeratorHelp + " " + studentDialog + " <div id='prototype_wrapper'></div> <div class='controlls clearfix'> " + transitionComment + " " + (backButton || '') + " <button class='subtest-next navigation'>" + _this.text.next + "</button> " + (skipButton || '') + " </div>");
        _this.prototypeView = new window[_this.protoViews[_this.model.get('prototype')]['run']]({
          model: _this.model,
          parent: _this
        });
        _this.prototypeView.on("rendered", function() {
          return _this.flagRender("prototype");
        });
        _this.prototypeView.on("subRendered", function() {
          return _this.trigger("subRendered");
        });
        _this.prototypeView.on("showNext", function() {
          return _this.showNext();
        });
        _this.prototypeView.on("hideNext", function() {
          return _this.hideNext();
        });
        _this.prototypeView.on("ready", function() {
          return _this.prototypeRendered = true;
        });
        _this.prototypeView.setElement(_this.$el.find('#prototype_wrapper'));
        _this.prototypeView.render();
        return _this.flagRender("subtest");
      };
    })(this);
    code = this.model.has("language") && this.model.get("language") !== "" ? this.model.get("language") : Tangerine.settings.get("language");
    if (typeof Tangerine.locales[code] === "undefined") {
      code = Tangerine.settings.get("language");
    }
    return Utils.changeLanguage(code, function(err, t) {
      window.t = t;
      return _render();
    });
  };

  SubtestRunView.prototype.flagRender = function(flag) {
    if (!this.renderFlags) {
      this.renderFlags = {};
    }
    this.renderFlags[flag] = true;
    if (this.renderFlags['subtest'] && this.renderFlags['prototype']) {
      return this.trigger("rendered");
    }
  };

  SubtestRunView.prototype.afterRender = function() {
    var ref;
    if ((ref = this.prototypeView) != null) {
      if (typeof ref.afterRender === "function") {
        ref.afterRender();
      }
    }
    return this.onShow();
  };

  SubtestRunView.prototype.showNext = function() {
    return this.$el.find(".controlls").show();
  };

  SubtestRunView.prototype.hideNext = function() {
    return this.$el.find(".controlls").hide();
  };

  SubtestRunView.prototype.onShow = function() {
    var base, displayCode, error, error1, message, name;
    displayCode = this.model.getString("displayCode");
    if (!_.isEmptyString(displayCode)) {
      try {
        CoffeeScript["eval"].apply(this, [displayCode]);
      } catch (error1) {
        error = error1;
        name = (/function (.{1,})\(/.exec(error.constructor.toString())[1]);
        message = error.message;
        alert(name + "\n\n" + message);
        console.log("displayCode Error: " + JSON.stringify(error));
      }
    }
    return typeof (base = this.prototypeView).updateExecuteReady === "function" ? base.updateExecuteReady(true) : void 0;
  };

  SubtestRunView.prototype.getGridScore = function() {
    var grid, gridScore, link;
    link = this.model.get("gridLinkId") || "";
    if (link === "") {
      return;
    }
    grid = this.parent.model.subtests.get(this.model.get("gridLinkId"));
    gridScore = this.parent.result.getGridScore(grid.id);
    return gridScore;
  };

  SubtestRunView.prototype.gridWasAutostopped = function() {
    var grid, gridWasAutostopped, link;
    link = this.model.get("gridLinkId") || "";
    if (link === "") {
      return;
    }
    grid = this.parent.model.subtests.get(this.model.get("gridLinkId"));
    return gridWasAutostopped = this.parent.result.gridWasAutostopped(grid.id);
  };

  SubtestRunView.prototype.onClose = function() {
    var ref;
    return (ref = this.prototypeView) != null ? typeof ref.close === "function" ? ref.close() : void 0 : void 0;
  };

  SubtestRunView.prototype.isValid = function() {
    if (!this.prototypeRendered) {
      return false;
    }
    if (this.prototypeView.isValid != null) {
      return this.prototypeView.isValid();
    } else {
      return false;
    }
    return true;
  };

  SubtestRunView.prototype.showErrors = function() {
    return this.prototypeView.showErrors();
  };

  SubtestRunView.prototype.getSum = function() {
    if (this.prototypeView.getSum != null) {
      return this.prototypeView.getSum();
    } else {
      return {
        correct: 0,
        incorrect: 0,
        missing: 0,
        total: 0
      };
    }
  };

  SubtestRunView.prototype.abort = function() {
    return this.parent.abort();
  };

  SubtestRunView.prototype.getResult = function() {
    var hash, result;
    result = this.prototypeView.getResult();
    if (this.model.has("hash")) {
      hash = this.model.get("hash");
    }
    return {
      'body': result,
      'meta': {
        'hash': hash
      }
    };
  };

  SubtestRunView.prototype.getSkipped = function() {
    if (this.prototypeView.getSkipped != null) {
      return this.prototypeView.getSkipped();
    } else {
      throw "Prototype skipping not implemented";
    }
  };

  SubtestRunView.prototype.next = function() {
    return this.trigger("next");
  };

  SubtestRunView.prototype.back = function() {
    return this.trigger("back");
  };

  SubtestRunView.prototype.skip = function() {
    return this.parent.skip();
  };

  return SubtestRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvU3VidGVzdFJ1blZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsY0FBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7OzJCQUVKLFNBQUEsR0FBWTs7MkJBRVosTUFBQSxHQUNFO0lBQUEscUJBQUEsRUFBd0IsTUFBeEI7SUFDQSxxQkFBQSxFQUF3QixNQUR4QjtJQUVBLHFCQUFBLEVBQXdCLFlBRnhCO0lBR0EsYUFBQSxFQUF3QixNQUh4Qjs7OzJCQUtGLFVBQUEsR0FBWSxTQUFBO1dBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsa0JBQVYsQ0FBNkIsQ0FBQyxVQUE5QixDQUF5QyxHQUF6QztFQUFIOzsyQkFFWixJQUFBLEdBQU0sU0FBQTtXQUNKLElBQUMsQ0FBQSxJQUFELEdBQ0U7TUFBQSxNQUFBLEVBQVMsQ0FBQSxDQUFFLDRCQUFGLENBQVQ7TUFDQSxNQUFBLEVBQVMsQ0FBQSxDQUFFLDRCQUFGLENBRFQ7TUFFQSxNQUFBLEVBQVMsQ0FBQSxDQUFFLDRCQUFGLENBRlQ7TUFHQSxNQUFBLEVBQVMsQ0FBQSxDQUFFLDRCQUFGLENBSFQ7O0VBRkU7OzJCQVFOLFVBQUEsR0FBWSxTQUFDLE9BQUQ7SUFFVixJQUFDLENBQUEsSUFBRCxDQUFBO0lBRUEsSUFBQyxDQUFBLFVBQUQsR0FBZSxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQWpCLENBQXFCLGdCQUFyQjtJQUNmLElBQUMsQ0FBQSxLQUFELEdBQWUsT0FBTyxDQUFDO0lBQ3ZCLElBQUMsQ0FBQSxNQUFELEdBQWUsT0FBTyxDQUFDO0lBQ3ZCLElBQWlGLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFlBQVgsQ0FBQSxLQUE0QixFQUE3RztNQUFBLElBQUMsQ0FBQSxTQUFELEdBQWEsdUJBQUEsR0FBdUIsQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxZQUFYLENBQUQsQ0FBdkIsR0FBaUQsaUJBQTlEOztXQUVBLElBQUMs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QUEsYUFBYSxDQUFDLFVBQWYsQ0FBQSxFQURUO0tBQUEsTUFBQTtBQUdFLFlBQU0scUNBSFI7O0VBRFU7OzJCQU1aLElBQUEsR0FBTSxTQUFBO1dBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBUyxNQUFUO0VBQUg7OzJCQUNOLElBQUEsR0FBTSxTQUFBO1dBQUcsSUFBQyxDQUFBLE9BQUQsQ0FBUyxNQUFUO0VBQUg7OzJCQUNOLElBQUEsR0FBTSxTQUFBO1dBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQUE7RUFBSDs7OztHQTNLcUIsUUFBUSxDQUFDIiwiZmlsZSI6InN1YnRlc3QvU3VidGVzdFJ1blZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTdWJ0ZXN0UnVuVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWUgOiBcIlN1YnRlc3RSdW5WaWV3XCJcblxuICBldmVudHM6XG4gICAgJ2NsaWNrIC5zdWJ0ZXN0LW5leHQnIDogJ25leHQnXG4gICAgJ2NsaWNrIC5zdWJ0ZXN0LWJhY2snIDogJ2JhY2snXG4gICAgJ2NsaWNrIC5zdWJ0ZXN0X2hlbHAnIDogJ3RvZ2dsZUhlbHAnXG4gICAgJ2NsaWNrIC5za2lwJyAgICAgICAgIDogJ3NraXAnXG5cbiAgdG9nZ2xlSGVscDogLT4gQCRlbC5maW5kKFwiLmVudW1lcmF0b3JfaGVscFwiKS5mYWRlVG9nZ2xlKDI1MClcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIFwibmV4dFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5uZXh0XCIpXG4gICAgICBcImJhY2tcIiA6IHQoXCJTdWJ0ZXN0UnVuVmlldy5idXR0b24uYmFja1wiKVxuICAgICAgXCJza2lwXCIgOiB0KFwiU3VidGVzdFJ1blZpZXcuYnV0dG9uLnNraXBcIilcbiAgICAgIFwiaGVscFwiIDogdChcIlN1YnRlc3RSdW5WaWV3LmJ1dHRvbi5oZWxwXCIpXG5cblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBpMThuKClcblxuICAgIEBwcm90b1ZpZXdzICA9IFRhbmdlcmluZS5jb25maWcuZ2V0IFwicHJvdG90eXBlVmlld3NcIlxuICAgIEBtb2RlbCAgICAgICA9IG9wdGlvbnMubW9kZWxcbiAgICBAcGFyZW50ICAgICAgPSBvcHRpb25zLnBhcmVudFxuICAgIEBmb250U3R5bGUgPSBcInN0eWxlPVxcXCJmb250LWZhbWlseTogI3tAbW9kZWwuZ2V0KCdmb250RmFtaWx5Jyl9ICFpbXBvcnRhbnQ7XFxcIlwiIGlmIEBtb2RlbC5nZXQoXCJmb250RmFtaWx5XCIpICE9IFwiXCJcblxuICAgIEBwcm90b3R5cGVSZW5kZXJlZCA9IGZhbHNlXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgX3JlbmRlciA9ID0+XG5cbiAgICAgIEBkZWxlZ2F0ZUV2ZW50cygpXG5cbiAgICAgIGVudW1lcmF0b3JIZWxwID0gaWYgKEBtb2RlbC5nZXQoXCJlbnVtZXJhdG9ySGVscFwiKSB8fCBcIlwiKSAhPSBcIlwiIHRoZW4gXCI8YnV0dG9uIGNsYXNzPSdzdWJ0ZXN0X2hlbHAgY29tbWFuZCc+I3tAdGV4dC5oZWxwfTwvYnV0dG9uPjxkaXYgY2xhc3M9J2VudW1lcmF0b3JfaGVscCcgI3tAZm9udFN0eWxlIHx8IFwiXCJ9PiN7QG1vZGVsLmdldCAnZW51bWVyYXRvckhlbHAnfTwvZGl2PlwiIGVsc2UgXCJcIlxuICAgICAgc3R1ZGVudERpYWxvZyAgPSBpZiAoQG1vZGVsLmdldChcInN0dWRlbnREaWFsb2dcIikgIHx8IFwiXCIpICE9IFwiXCIgdGhlbiBcIjxkaXYgY2xhc3M9J3N0dWRlbnRfZGlhbG9nJyAje0Bmb250U3R5bGUgfHwgXCJcIn0+I3tAbW9kZWwuZ2V0ICdzdHVkZW50RGlhbG9nJ308L2Rpdj5cIiBlbHNlIFwiXCJcbiAgICAgIHRyYW5zaXRpb25Db21tZW50ICA9IGlmIChAbW9kZWwuZ2V0KFwidHJhbnNpdGlvbkNvbW1lbnRcIikgIHx8IFwiXCIpICE9IFwiXCIgdGhlbiBcIjxkaXYgY2xhc3M9J3N0dWRlbnRfZGlhbG9nJyAje0Bmb250U3R5bGUgfHwgXCJcIn0+I3tAbW9kZWwuZ2V0ICd0cmFuc2l0aW9uQ29tbWVudCd9PC9kaXY+IDxicj5cIiBlbHNlIFwiXCJcblxuICAgICAgc2tpcHBhYmxlID0gQG1vZGVsLmdldChcInNraXBwYWJsZVwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJza2lwcGFibGVcIikgPT0gXCJ0cnVlXCJcbiAgICAgIGJhY2thYmxlID0gKCBAbW9kZWwuZ2V0KFwiYmFja0J1dHRvblwiKSA9PSB0cnVlIHx8IEBtb2RlbC5nZXQoXCJiYWNrQnV0dG9uXCIpID09IFwidHJ1ZVwiICkgYW5kIEBwYXJlbnQuaW5kZXggaXNudCAwXG5cbiAgICAgIHNraXBCdXR0b24gPSBcIjxidXR0b24gY2xhc3M9J3NraXAgbmF2aWdhdGlvbic+I3tAdGV4dC5za2lwfTwvYnV0dG9uPlwiIGlmIHNraXBwYWJsZVxuICAgICAgYmFja0J1dHRvbiA9IFwiPGJ1dHRvbiBjbGFzcz0nc3VidGVzdC1iYWNrIG5hdmlnYXRpb24nPiN7QHRleHQuYmFja308L2J1dHRvbj5cIiBpZiBiYWNrYWJsZVxuXG5cbiAgICAgIEAkZWwuaHRtbCBcIlxuICAgICAgICA8aDI+I3tAbW9kZWwuZ2V0ICduYW1lJ308L2gyPlxuICAgICAgICAje2VudW1lcmF0b3JIZWxwfVxuICAgICAgICAje3N0dWRlbnREaWFsb2d9XG4gICAgICAgIDxkaXYgaWQ9J3Byb3RvdHlwZV93cmFwcGVyJz48L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzPSdjb250cm9sbHMgY2xlYXJmaXgnPlxuICAgICAgICAgICN7dHJhbnNpdGlvbkNvbW1lbnR9XG4gICAgICAgICAgI3tiYWNrQnV0dG9uIG9yICcnfVxuICAgICAgICAgIDxidXR0b24gY2xhc3M9J3N1YnRlc3QtbmV4dCBuYXZpZ2F0aW9uJz4je0B0ZXh0Lm5leHR9PC9idXR0b24+XG4gICAgICAgICAgI3tza2lwQnV0dG9uIG9yICcnfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIFwiXG5cbiAgICAgICMgVXNlIHByb3RvdHlwZSBzcGVjaWZpYyB2aWV3cyBoZXJlXG4gICAgICBAcHJvdG90eXBlVmlldyA9IG5ldyB3aW5kb3dbQHByb3RvVmlld3NbQG1vZGVsLmdldCAncHJvdG90eXBlJ11bJ3J1biddXVxuICAgICAgICBtb2RlbCAgOiBAbW9kZWxcbiAgICAgICAgcGFyZW50IDogQFxuICAgICAgQHByb3RvdHlwZVZpZXcub24gXCJyZW5kZXJlZFwiLCAgICA9PiBAZmxhZ1JlbmRlcihcInByb3RvdHlwZVwiKVxuICAgICAgQHByb3RvdHlwZVZpZXcub24gXCJzdWJSZW5kZXJlZFwiLCA9PiBAdHJpZ2dlciBcInN1YlJlbmRlcmVkXCJcbiAgICAgIEBwcm90b3R5cGVWaWV3Lm9uIFwic2hvd05leHRcIiwgICAgPT4gQHNob3dOZXh0KClcbiAgICAgIEBwcm90b3R5cGVWaWV3Lm9uIFwiaGlkZU5leHRcIiwgICAgPT4gQGhpZGVOZXh0KClcbiAgICAgIEBwcm90b3R5cGVWaWV3Lm9uIFwicmVhZHlcIiwgICAgICAgPT4gQHByb3RvdHlwZVJlbmRlcmVkID0gdHJ1ZTtcbiAgICAgIEBwcm90b3R5cGVWaWV3LnNldEVsZW1lbnQoQCRlbC5maW5kKCcjcHJvdG90eXBlX3dyYXBwZXInKSlcbiAgICAgIEBwcm90b3R5cGVWaWV3LnJlbmRlcigpXG5cbiAgICAgIEBmbGFnUmVuZGVyIFwic3VidGVzdFwiXG5cbiAgICBjb2RlID0gaWYgQG1vZGVsLmhhcyhcImxhbmd1YWdlXCIpIGFuZCBAbW9kZWwuZ2V0KFwibGFuZ3VhZ2VcIikgIT0gXCJcIlxuICAgICAgICBAbW9kZWwuZ2V0KFwibGFuZ3VhZ2VcIilcbiAgICAgIGVsc2VcbiAgICAgICAgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImxhbmd1YWdlXCIpXG5cbiAgICBjb2RlID0gVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImxhbmd1YWdlXCIpIGlmIHR5cGVvZiBUYW5nZXJpbmUubG9jYWxlc1tjb2RlXSA9PSBcInVuZGVmaW5lZFwiXG5cbiAgICBVdGlscy5jaGFuZ2VMYW5ndWFnZSBjb2RlLCAoZXJyLCB0KSAtPlxuICAgICAgd2luZG93LnQgPSB0XG4gICAgICBfcmVuZGVyKClcblxuXG4gIGZsYWdSZW5kZXI6ICggZmxhZyApID0+XG4gICAgQHJlbmRlckZsYWdzID0ge30gaWYgbm90IEByZW5kZXJGbGFnc1xuICAgIEByZW5kZXJGbGFnc1tmbGFnXSA9IHRydWVcblxuICAgIGlmIEByZW5kZXJGbGFnc1snc3VidGVzdCddICYmIEByZW5kZXJGbGFnc1sncHJvdG90eXBlJ11cbiAgICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4gIGFmdGVyUmVuZGVyOiA9PlxuICAgIEBwcm90b3R5cGVWaWV3Py5hZnRlclJlbmRlcj8oKVxuICAgIEBvblNob3coKVxuXG4gIHNob3dOZXh0OiA9PiBAJGVsLmZpbmQoXCIuY29udHJvbGxzXCIpLnNob3coKVxuICBoaWRlTmV4dDogPT4gQCRlbC5maW5kKFwiLmNvbnRyb2xsc1wiKS5oaWRlKClcblxuICBvblNob3c6IC0+XG4gICAgZGlzcGxheUNvZGUgPSBAbW9kZWwuZ2V0U3RyaW5nKFwiZGlzcGxheUNvZGVcIilcblxuICAgIGlmIG5vdCBfLmlzRW1wdHlTdHJpbmcoZGlzcGxheUNvZGUpXG5cbiAgICAgIHRyeVxuICAgICAgICBDb2ZmZWVTY3JpcHQuZXZhbC5hcHBseShALCBbZGlzcGxheUNvZGVdKVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgbmFtZSA9ICgoL2Z1bmN0aW9uICguezEsfSlcXCgvKS5leGVjKGVycm9yLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkpWzFdKVxuICAgICAgICBtZXNzYWdlID0gZXJyb3IubWVzc2FnZVxuICAgICAgICBhbGVydCBcIiN7bmFtZX1cXG5cXG4je21lc3NhZ2V9XCJcbiAgICAgICAgY29uc29sZS5sb2cgXCJkaXNwbGF5Q29kZSBFcnJvcjogXCIgKyBKU09OLnN0cmluZ2lmeShlcnJvcilcblxuICAgIEBwcm90b3R5cGVWaWV3LnVwZGF0ZUV4ZWN1dGVSZWFkeT8odHJ1ZSlcblxuICBnZXRHcmlkU2NvcmU6IC0+XG4gICAgbGluayA9IEBtb2RlbC5nZXQoXCJncmlkTGlua0lkXCIpIHx8IFwiXCJcbiAgICBpZiBsaW5rID09IFwiXCIgdGhlbiByZXR1cm5cbiAgICBncmlkID0gQHBhcmVudC5tb2RlbC5zdWJ0ZXN0cy5nZXQgQG1vZGVsLmdldChcImdyaWRMaW5rSWRcIilcbiAgICBncmlkU2NvcmUgPSBAcGFyZW50LnJlc3VsdC5nZXRHcmlkU2NvcmUgZ3JpZC5pZFxuICAgIGdyaWRTY29yZVxuXG4gIGdyaWRXYXNBdXRvc3RvcHBlZDogLT5cbiAgICBsaW5rID0gQG1vZGVsLmdldChcImdyaWRMaW5rSWRcIikgfHwgXCJcIlxuICAgIGlmIGxpbmsgPT0gXCJcIiB0aGVuIHJldHVyblxuICAgIGdyaWQgPSBAcGFyZW50Lm1vZGVsLnN1YnRlc3RzLmdldCBAbW9kZWwuZ2V0KFwiZ3JpZExpbmtJZFwiKVxuICAgIGdyaWRXYXNBdXRvc3RvcHBlZCA9IEBwYXJlbnQucmVzdWx0LmdyaWRXYXNBdXRvc3RvcHBlZCBncmlkLmlkXG5cbiAgb25DbG9zZTogLT5cbiAgICBAcHJvdG90eXBlVmlldz8uY2xvc2U/KClcblxuICBpc1ZhbGlkOiAtPlxuICAgIGlmIG5vdCBAcHJvdG90eXBlUmVuZGVyZWQgdGhlbiByZXR1cm4gZmFsc2VcbiAgICBpZiBAcHJvdG90eXBlVmlldy5pc1ZhbGlkP1xuICAgICAgcmV0dXJuIEBwcm90b3R5cGVWaWV3LmlzVmFsaWQoKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIHRydWVcblxuICBzaG93RXJyb3JzOiAtPlxuICAgIEBwcm90b3R5cGVWaWV3LnNob3dFcnJvcnMoKVxuXG4gIGdldFN1bTogLT5cbiAgICBpZiBAcHJvdG90eXBlVmlldy5nZXRTdW0/XG4gICAgICByZXR1cm4gQHByb3RvdHlwZVZpZXcuZ2V0U3VtKClcbiAgICBlbHNlXG4gICAgICAjIG1heWJlIGEgYmV0dGVyIGZhbGxiYWNrXG4gICAgICByZXR1cm4ge2NvcnJlY3Q6MCxpbmNvcnJlY3Q6MCxtaXNzaW5nOjAsdG90YWw6MH1cblxuICBhYm9ydDogLT5cbiAgICBAcGFyZW50LmFib3J0KClcblxuICBnZXRSZXN1bHQ6IC0+XG4gICAgcmVzdWx0ID0gQHByb3RvdHlwZVZpZXcuZ2V0UmVzdWx0KClcbiAgICBoYXNoID0gQG1vZGVsLmdldChcImhhc2hcIikgaWYgQG1vZGVsLmhhcyhcImhhc2hcIilcbiAgICByZXR1cm4ge1xuICAgICAgJ2JvZHknIDogcmVzdWx0XG4gICAgICAnbWV0YScgOlxuICAgICAgICAnaGFzaCcgOiBoYXNoXG4gICAgfVxuXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgaWYgQHByb3RvdHlwZVZpZXcuZ2V0U2tpcHBlZD9cbiAgICAgIHJldHVybiBAcHJvdG90eXBlVmlldy5nZXRTa2lwcGVkKClcbiAgICBlbHNlXG4gICAgICB0aHJvdyBcIlByb3RvdHlwZSBza2lwcGluZyBub3QgaW1wbGVtZW50ZWRcIlxuXG4gIG5leHQ6IC0+IEB0cmlnZ2VyIFwibmV4dFwiXG4gIGJhY2s6IC0+IEB0cmlnZ2VyIFwiYmFja1wiXG4gIHNraXA6IC0+IEBwYXJlbnQuc2tpcCgpXG4iXX0=
