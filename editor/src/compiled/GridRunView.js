var GridRunView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

GridRunView = (function(superClass) {
  extend(GridRunView, superClass);

  function GridRunView() {
    this.updateMode = bind(this.updateMode, this);
    this.updateCountdown = bind(this.updateCountdown, this);
    this.removeUndo = bind(this.removeUndo, this);
    this.lastHandler = bind(this.lastHandler, this);
    this.intermediateItemHandler = bind(this.intermediateItemHandler, this);
    this.markHandler = bind(this.markHandler, this);
    this.gridClick = bind(this.gridClick, this);
    return GridRunView.__super__.constructor.apply(this, arguments);
  }

  GridRunView.prototype.className = "grid_prototype";

  GridRunView.prototype.events = Modernizr.touch ? {
    'click .grid_element': 'gridClick',
    'click .end_of_grid_line': 'endOfGridLineClick',
    'click .start_time': 'startTimer',
    'click .stop_time': 'stopTimer',
    'click .restart': 'restartTimer'
  } : {
    'click .end_of_grid_line': 'endOfGridLineClick',
    'click .grid_element': 'gridClick',
    'click .start_time': 'startTimer',
    'click .stop_time': 'stopTimer',
    'click .restart': 'restartTimer'
  };

  GridRunView.prototype.restartTimer = function() {
    if (this.timeRunning) {
      this.stopTimer({
        simpleStop: true
      });
    }
    this.resetVariables();
    this.$el.find(".element_wrong").removeClass("element_wrong");
    return this.$el.find(".grid_element").removeClass("element_minute");
  };

  GridRunView.prototype.gridClick = function(event) {
    var base, name;
    event.preventDefault();
    return typeof (base = this.modeHandlers)[name = this.mode] === "function" ? base[name](event) : void 0;
  };

  GridRunView.prototype.markHandler = function(event) {
    var $target, correctionsDisabled, index, indexIsntBelowLastAttempted, lastAttemptedIsntZero, ref, ref1;
    $target = $(event.target);
    index = $target.attr('data-index');
    indexIsntBelowLastAttempted = parseInt(index) > parseInt(this.lastAttempted);
    lastAttemptedIsntZero = parseInt(this.lastAttempted) !== 0;
    correctionsDisabled = this.dataEntry === false && ((ref = this.parent) != null ? (ref1 = ref.parent) != null ? ref1.enableCorrections : void 0 : void 0) === false;
    if (correctionsDisabled && lastAttemptedIsntZero && indexIsntBelowLastAttempted) {
      return;
    }
    this.markElement(index);
    if (this.autostop !== 0) {
      return this.checkAutostop();
    }
  };

  GridRunView.prototype.intermediateItemHandler = function(event) {
    var $target, index;
    this.timeIntermediateCaptured = this.getTime() - this.startTime;
    $target = $(event.target);
    index = $target.attr('data-index');
    this.itemAtTime = index;
    this.$el.find(".grid_element").removeClass("element_minute");
    $target.addClass("element_minute");
    return this.updateMode("mark");
  };

  GridRunView.prototype.checkAutostop = function() {
    var autoCount, i, j, ref;
    if (this.timeRunning) {
      autoCount = 0;
      for (i = j = 0, ref = this.autostop - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        if (this.gridOutput[i] === "correct") {
          break;
        }
        autoCount++;
      }
      if (this.autostopped === false) {
        if (autoCount === this.autostop) {
          this.autostopTest();
        }
      }
      if (this.autostopped === true && autoCount < this.autostop && this.undoable === true) {
        return this.unAutostopTest();
      }
    }
  };

  GridRunView.prototype.markElement = function(index, value, mode) {
    var $target, correctionsDisabled, indexIsntBelowLastAttempted, lastAttemptedIsntZero, ref, ref1, ref2, ref3;
    if (value == null) {
      value = null;
    }
    correctionsDisabled = this.dataEntry === false && (((ref = this.parent) != null ? (ref1 = ref.parent) != null ? ref1.enableCorrections : void 0 : void 0) != null) && ((ref2 = this.parent) != null ? (ref3 = ref2.parent) != null ? ref3.enableCorrections : void 0 : void 0) === false;
    lastAttemptedIsntZero = parseInt(this.lastAttempted) !== 0;
    indexIsntBelowLastAttempted = parseInt(index) > parseInt(this.lastAttempted);
    if (correctionsDisabled && lastAttemptedIsntZero && indexIsntBelowLastAttempted) {
      return;
    }
    $target = this.$el.find(".grid_element[data-index=" + index + "]");
    if (mode !== 'populate') {
      this.markRecord.push(index);
    }
    if (!this.autostopped) {
      if (value === null) {
        this.gridOutput[index - 1] = this.gridOutput[index - 1] === "correct" ? "incorrect" : "correct";
        return $target.toggleClass("element_wrong");
      } else {
        this.gridOutput[index - 1] = value;
        if (value === "incorrect") {
          return $target.addClass("element_wrong");
        } else if (value === "correct") {
          return $target.removeClass("element_wrong");
        }
      }
    }
  };

  GridRunView.prototype.endOfGridLineClick = function(event) {
    var $target, i, index, j, k, ref, ref1, ref2, ref3;
    event.preventDefault();
    if (this.mode === "mark") {
      $target = $(event.target);
      if ($target.hasClass("element_wrong")) {
        $target.removeClass("element_wrong");
        index = $target.attr('data-index');
        for (i = j = ref = index, ref1 = index - (this.columns - 1); ref <= ref1 ? j <= ref1 : j >= ref1; i = ref <= ref1 ? ++j : --j) {
          this.markElement(i, "correct");
        }
      } else if (!$target.hasClass("element_wrong") && !this.autostopped) {
        $target.addClass("element_wrong");
        index = $target.attr('data-index');
        for (i = k = ref2 = index, ref3 = index - (this.columns - 1); ref2 <= ref3 ? k <= ref3 : k >= ref3; i = ref2 <= ref3 ? ++k : --k) {
          this.markElement(i, "incorrect");
        }
      }
      if (this.autostop !== 0) {
        return this.checkAutostop();
      }
    }
  };

  GridRunView.prototype.lastHandler = function(event, index) {
    var $target;
    if (index != null) {
      $target = this.$el.find(".grid_element[data-index=" + index + "]");
    } else {
      $target = $(event.target);
      index = $target.attr('data-index');
    }
    if (index - 1 >= this.gridOutput.lastIndexOf("incorrect")) {
      this.$el.find(".element_last").removeClass("element_last");
      $target.addClass("element_last");
      return this.lastAttempted = index;
    }
  };

  GridRunView.prototype.startTimer = function() {
    if (this.timerStopped === false && this.timeRunning === false) {
      this.interval = setInterval(this.updateCountdown, 1000);
      this.startTime = this.getTime();
      this.timeRunning = true;
      this.updateMode("mark");
      this.enableGrid();
      return this.updateCountdown();
    }
  };

  GridRunView.prototype.enableGrid = function() {
    return this.$el.find("table.disabled, div.disabled").removeClass("disabled");
  };

  GridRunView.prototype.stopTimer = function(event, message) {
    if (message == null) {
      message = false;
    }
    if (this.timeRunning !== true) {
      return;
    }
    if (event != null ? event.target : void 0) {
      this.lastHandler(null, this.items.length);
    }
    clearInterval(this.interval);
    this.stopTime = this.getTime();
    this.timeRunning = false;
    this.timerStopped = true;
    return this.updateCountdown();
  };

  GridRunView.prototype.autostopTest = function() {
    Utils.flash();
    clearInterval(this.interval);
    this.stopTime = this.getTime();
    this.autostopped = true;
    this.timerStopped = true;
    this.timeRunning = false;
    this.$el.find(".grid_element").slice(this.autostop - 1, this.autostop).addClass("element_last");
    this.lastAttempted = this.autostop;
    this.timeout = setTimeout(this.removeUndo, 3000);
    return Utils.topAlert(this.text.autostop);
  };

  GridRunView.prototype.removeUndo = function() {
    this.undoable = false;
    this.updateMode("disabled");
    return clearTimeout(this.timeout);
  };

  GridRunView.prototype.unAutostopTest = function() {
    this.interval = setInterval(this.updateCountdown, 1000);
    this.updateCountdown();
    this.autostopped = false;
    this.lastAttempted = 0;
    this.$el.find(".grid_element").slice(this.autostop - 1, this.autostop).removeClass("element_last");
    this.timeRunning = true;
    this.updateMode("mark");
    return Utils.topAlert(t("GridRunView.message.autostop_cancel"));
  };

  GridRunView.prototype.updateCountdown = function() {
    this.timeElapsed = Math.min(this.getTime() - this.startTime, this.timer);
    this.timeRemaining = this.timer - this.timeElapsed;
    this.$el.find(".timer").html(this.timeRemaining);
    if (this.timeRunning === true && this.captureLastAttempted && this.timeRemaining <= 0) {
      this.stopTimer({
        simpleStop: true
      });
      Utils.background("red");
      _.delay((function(_this) {
        return function() {
          alert(_this.text.touchLastItem);
          return Utils.background("");
        };
      })(this), 1e3);
      this.updateMode("last");
    }
    if (this.captureItemAtTime && !this.gotIntermediate && !this.minuteMessage && this.timeElapsed >= this.captureAfterSeconds) {
      Utils.flash("yellow");
      Utils.midAlert(t("please select the item the child is currently attempting"));
      this.minuteMessage = true;
      return this.updateMode("minuteItem");
    }
  };

  GridRunView.prototype.updateMode = function(mode) {
    if (mode == null) {
      mode = null;
    }
    if ((mode === null && this.timeElapsed === 0 && !this.dataEntry) || mode === "disabled") {
      return this.modeButton.setValue(null);
    } else if (mode != null) {
      this.mode = mode;
      return this.modeButton.setValue(this.mode);
    } else {
      return this.mode = this.modeButton.getValue();
    }
  };

  GridRunView.prototype.getTime = function() {
    return Math.round((new Date()).getTime() / 1000);
  };

  GridRunView.prototype.resetVariables = function() {
    var previous;
    this.timer = parseInt(this.model.get("timer")) || 0;
    this.untimed = this.timer === 0 || this.dataEntry;
    this.gotMinuteItem = false;
    this.minuteMessage = false;
    this.itemAtTime = null;
    this.timeIntermediateCaptured = null;
    this.markRecord = [];
    this.timerStopped = false;
    this.startTime = 0;
    this.stopTime = 0;
    this.timeElapsed = 0;
    this.timeRemaining = this.timer;
    this.lastAttempted = 0;
    this.interval = null;
    this.undoable = true;
    this.timeRunning = false;
    this.items = _.compact(this.model.get("items"));
    this.itemMap = [];
    this.mapItem = [];
    if (this.model.has("randomize") && this.model.get("randomize")) {
      this.itemMap = this.items.map(function(value, i) {
        return i;
      });
      this.items.forEach(function(item, i) {
        var temp, tempValue;
        temp = Math.floor(Math.random() * this.items.length);
        tempValue = this.itemMap[temp];
        this.itemMap[temp] = this.itemMap[i];
        return this.itemMap[i] = tempValue;
      }, this);
      this.itemMap.forEach(function(item, i) {
        return this.mapItem[this.itemMap[i]] = i;
      }, this);
    } else {
      this.items.forEach(function(item, i) {
        this.itemMap[i] = i;
        return this.mapItem[i] = i;
      }, this);
    }
    if (!this.captureLastAttempted && !this.captureItemAtTime) {
      this.mode = "mark";
    } else {
      this.mode = "disabled";
    }
    if (this.dataEntry) {
      this.mode = "mark";
    }
    this.gridOutput = this.items.map(function() {
      return 'correct';
    });
    this.columns = parseInt(this.model.get("columns")) || 3;
    this.autostop = this.untimed ? 0 : parseInt(this.model.get("autostop")) || 0;
    this.autostopped = false;
    this.$el.find(".grid_element").removeClass("element_wrong").removeClass("element_last").addClass("disabled");
    this.$el.find("table").addClass("disabled");
    this.$el.find(".timer").html(this.timer);
    if (!this.dataEntry) {
      if ((this.parent != null) && (this.parent.parent != null) && (this.parent.parent.result != null)) {
        previous = this.parent.parent.result.getByHash(this.model.get('hash'));
        if (previous) {
          this.captureLastAttempted = previous.capture_last_attempted;
          this.itemAtTime = previous.item_at_time;
          this.timeIntermediateCaptured = previous.time_intermediate_captured;
          this.captureItemAtTime = previous.capture_item_at_time;
          this.autostop = previous.auto_stop;
          this.lastAttempted = previous.attempted;
          this.timeRemaining = previous.time_remain;
          this.markRecord = previous.mark_record;
        }
      }
    }
    if (this.modeButton != null) {
      return this.updateMode(this.mode);
    }
  };

  GridRunView.prototype.i18n = function() {
    return this.text = {
      autostop: t("GridRunView.message.autostop"),
      touchLastItem: t("GridRunView.message.touch_last_item"),
      subtestNotComplete: t("GridRunView.message.subtest_not_complete"),
      inputMode: t("GridRunView.label.input_mode"),
      timeRemaining: t("GridRunView.label.time_remaining"),
      wasAutostopped: t("GridRunView.label.was_autostopped"),
      mark: t("GridRunView.button.mark"),
      start: t("GridRunView.button.start"),
      stop: t("GridRunView.button.stop"),
      restart: t("GridRunView.button.restart"),
      lastAttempted: t("GridRunView.button.last_attempted")
    };
  };

  GridRunView.prototype.initialize = function(options) {
    var fontSizeClass;
    this.i18n();
    if (this.model.get("fontFamily") !== "") {
      this.fontStyle = "style=\"font-family: " + (this.model.get('fontFamily')) + " !important;\"";
    }
    this.captureAfterSeconds = this.model.has("captureAfterSeconds") ? this.model.get("captureAfterSeconds") : 0;
    this.captureItemAtTime = this.model.has("captureItemAtTime") ? this.model.get("captureItemAtTime") : false;
    this.captureLastAttempted = this.model.has("captureLastAttempted") ? this.model.get("captureLastAttempted") : true;
    this.endOfLine = this.model.has("endOfLine") ? this.model.get("endOfLine") : true;
    this.layoutMode = this.model.has("layoutMode") ? this.model.get("layoutMode") : "fixed";
    this.fontSize = this.model.has("fontSize") ? this.model.get("fontSize") : "normal";
    if (this.fontSize === "small") {
      fontSizeClass = "font_size_small";
    } else {
      fontSizeClass = "";
    }
    this.rtl = this.model.getBoolean("rtl");
    if (this.rtl) {
      this.$el.addClass("rtl-grid");
    }
    this.totalTime = this.model.get("timer") || 0;
    this.modeHandlers = {
      "mark": this.markHandler,
      "last": this.lastHandler,
      "minuteItem": this.intermediateItemHandler,
      disabled: $.noop
    };
    this.dataEntry = options.dataEntry;
    this.model = options.model;
    this.parent = options.parent;
    this.resetVariables();
    this.gridElement = _.template("<td><button data-label='{{label}}' data-index='{{i}}' class='grid_element " + fontSizeClass + "' " + (this.fontStyle || "") + ">{{label}}</button></td>");
    this.variableGridElement = _.template("<button data-label='{{label}}' data-index='{{i}}' class='grid_element " + fontSizeClass + "' " + (this.fontStyle || "") + ">{{label}}</button>");
    if (this.layoutMode === "fixed") {
      return this.endOfGridLine = _.template("<td><button data-index='{{i}}' class='end_of_grid_line'>*</button></td>");
    } else {
      return this.endOfGridLine = _.template("");
    }
  };

  GridRunView.prototype.render = function() {
    var $target, buttonConfig, dataEntry, disabling, displayRtl, done, firstRow, gridHTML, html, i, item, j, k, l, len, len1, modeSelector, previous, ref, ref1, ref2, ref3, resetButton, startTimerHTML, stopTimerHTML;
    done = 0;
    startTimerHTML = "<div class='timer_wrapper'><button class='start_time time'>" + this.text.start + "</button><div class='timer'>" + this.timer + "</div></div>";
    if (!this.untimed) {
      disabling = "disabled";
    }
    if (this.rtl) {
      displayRtl = "rtl_mode";
    }
    html = !this.untimed ? startTimerHTML : "";
    gridHTML = "";
    if (this.layoutMode === "fixed") {
      gridHTML += "<table class='grid " + disabling + " " + (displayRtl || '') + "'>";
      firstRow = true;
      while (true) {
        if (done > this.items.length) {
          break;
        }
        gridHTML += "<tr>";
        for (i = j = 1, ref = this.columns; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
          if (done < this.items.length) {
            gridHTML += this.gridElement({
              label: _.escape(this.items[this.itemMap[done]]),
              i: done + 1
            });
          }
          done++;
        }
        if (firstRow) {
          if (done < (this.items.length + 1) && this.endOfLine) {
            gridHTML += "<td></td>";
          }
          firstRow = false;
        } else {
          if (done < (this.items.length + 1) && this.endOfLine) {
            gridHTML += this.endOfGridLine({
              i: done
            });
          }
        }
        gridHTML += "</tr>";
      }
      gridHTML += "</table>";
    } else {
      gridHTML += "<div class='grid " + disabling + " " + (displayRtl || '') + "'>";
      ref1 = this.items;
      for (i = k = 0, len = ref1.length; k < len; i = ++k) {
        item = ref1[i];
        gridHTML += this.variableGridElement({
          "label": _.escape(this.items[this.itemMap[i]]),
          "i": i + 1
        });
      }
      gridHTML += "</div>";
    }
    html += gridHTML;
    stopTimerHTML = "<div class='timer_wrapper'><button class='stop_time time'>" + this.text.stop + "</button><div class='timer'>" + this.timer + "</div></div>";
    resetButton = "<div> <button class='restart command'>" + this.text.restart + "</button> <br> </div>";
    modeSelector = "";
    if (this.captureLastAttempted || this.captureItemAtTime) {
      if ((ref2 = this.modeButton) != null) {
        ref2.close();
      }
      buttonConfig = {
        options: [],
        mode: "single"
      };
      buttonConfig.options.push({
        label: this.text.mark,
        value: "mark"
      });
      if (this.captureItemAtTime) {
        buttonConfig.options.push({
          label: t("item at __seconds__ seconds", {
            seconds: this.captureAfterSeconds
          }),
          value: "minuteItem"
        });
      }
      if (this.captureLastAttempted) {
        buttonConfig.options.push({
          label: this.text.lastAttempted,
          value: "last"
        });
      }
      this.modeButton = new ButtonView(buttonConfig);
      this.modeButton.on("change click", ((function(_this) {
        return function() {
          return _this.updateMode();
        };
      })(this)), this);
      modeSelector = "<div class='grid_mode_wrapper question clearfix'> <label>" + this.text.inputMode + "</label><br> <div class='mode-button'></div> </div>";
    }
    dataEntry = "<table class='class_table'> <tr> <td>" + this.text.wasAutostopped + "</td><td><input type='checkbox' class='data_autostopped'></td> </tr> <tr> <td>" + this.text.timeRemaining + "</td><td><input type='number' class='data_time_remain'></td> </tr> </table>";
    html += (!this.untimed ? stopTimerHTML : "") + " " + (!this.untimed ? resetButton : "") + " " + modeSelector + " " + ((this.dataEntry ? dataEntry : void 0) || '');
    this.$el.html(html);
    this.modeButton.setElement(this.$el.find(".mode-button"));
    this.modeButton.render();
    this.trigger("rendered");
    this.trigger("ready");
    if (!this.dataEntry) {
      if ((this.parent != null) && (this.parent.parent != null) && (this.parent.parent.result != null)) {
        previous = this.parent.parent.result.getByHash(this.model.get('hash'));
        if (previous) {
          this.markRecord = previous.mark_record;
          ref3 = this.markRecord;
          for (i = l = 0, len1 = ref3.length; l < len1; i = ++l) {
            item = ref3[i];
            this.markElement(item, null, 'populate');
          }
          this.itemAtTime = previous.item_at_time;
          $target = this.$el.find(".grid_element[data-index=" + this.itemAtTime + "]");
          $target.addClass("element_minute");
          this.lastAttempted = previous.attempted;
          $target = this.$el.find(".grid_element[data-index=" + this.lastAttempted + "]");
          return $target.addClass("element_last");
        }
      }
    }
  };

  GridRunView.prototype.isValid = function() {
    var item, ref;
    if (this.timeRunning) {
      this.stopTimer();
    }
    if (parseInt(this.lastAttempted) === this.items.length && this.timeRemaining === 0) {
      item = this.items[this.items.length - 1];
      if (confirm(t("GridRunView.message.last_item_confirm", {
        item: item
      }))) {
        this.updateMode;
        return true;
      } else {
        this.messages = ((ref = this.messages) != null ? ref.push : void 0) ? this.messages.concat([msg]) : [msg];
        this.updateMode("last");
        return false;
      }
    }
    if (this.captureLastAttempted && this.lastAttempted === 0) {
      return false;
    }
    if (this.timeRunning === true) {
      return false;
    }
    if (this.timer !== 0 && this.timeRemaining === this.timer) {
      return false;
    }
    return true;
  };

  GridRunView.prototype.showErrors = function() {
    var messages, noLastItem, timeStillRunning, timerHasntRun;
    messages = this.messages || [];
    this.messages = [];
    timerHasntRun = this.timer !== 0 && this.timeRemaining === this.timer;
    noLastItem = this.captureLastAttempted && this.lastAttempted === 0;
    timeStillRunning = this.timeRuning === true;
    if (timerHasntRun) {
      messages.push(this.text.subtestNotComplete);
    }
    if (noLastItem && !timerHasntRun) {
      messages.push(this.text.touchLastItem);
      this.updateMode("last");
    }
    if (timeStillRunning) {
      messages.push(this.text.timeStillRunning);
    }
    return Utils.midAlert(messages.join("<br>"), 3000);
  };

  GridRunView.prototype.getResult = function() {
    var autostopped, completeResults, i, item, itemResults, j, len, ref, result, timeRemaining;
    completeResults = [];
    itemResults = [];
    if (!this.captureLastAttempted) {
      this.lastAttempted = this.items.length;
    }
    ref = this.items;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      item = ref[i];
      if (this.mapItem[i] < this.lastAttempted) {
        itemResults[i] = {
          itemResult: this.gridOutput[this.mapItem[i]],
          itemLabel: item
        };
      } else {
        itemResults[i] = {
          itemResult: "missing",
          itemLabel: this.items[this.mapItem[i]]
        };
      }
    }
    if (!this.captureLastAttempted) {
      this.lastAttempted = false;
    }
    if (this.dataEntry) {
      autostopped = this.$el.find(".data_autostopped").is(":checked");
      timeRemaining = parseInt(this.$el.find(".data_time_remain").val());
    } else {
      autostopped = this.autostopped;
      timeRemaining = this.timeRemaining;
    }
    result = {
      "capture_last_attempted": this.captureLastAttempted,
      "item_at_time": this.itemAtTime,
      "time_intermediate_captured": this.timeIntermediateCaptured,
      "capture_item_at_time": this.captureItemAtTime,
      "auto_stop": autostopped,
      "attempted": this.lastAttempted,
      "items": itemResults,
      "time_remain": timeRemaining,
      "mark_record": this.markRecord,
      "variable_name": this.model.get("variableName")
    };
    return result;
  };

  GridRunView.prototype.getSkipped = function() {
    var i, item, itemResults, j, len, ref, result;
    itemResults = [];
    ref = this.items;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      item = ref[i];
      itemResults[i] = {
        itemResult: "skipped",
        itemLabel: item
      };
    }
    return result = {
      "capture_last_attempted": "skipped",
      "item_at_time": "skipped",
      "time_intermediate_captured": "skipped",
      "capture_item_at_time": "skipped",
      "auto_stop": "skipped",
      "attempted": "skipped",
      "items": itemResults,
      "time_remain": "skipped",
      "mark_record": "skipped",
      "variable_name": this.model.get("variableName")
    };
  };

  GridRunView.prototype.onClose = function() {
    return clearInterval(this.interval);
  };

  return GridRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9HcmlkUnVuVmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxXQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7Ozs7Ozs7d0JBRUosU0FBQSxHQUFXOzt3QkFFWCxNQUFBLEdBQVcsU0FBUyxDQUFDLEtBQWIsR0FBd0I7SUFDOUIscUJBQUEsRUFBNEIsV0FERTtJQUU5Qix5QkFBQSxFQUE0QixvQkFGRTtJQUc5QixtQkFBQSxFQUF1QixZQUhPO0lBSTlCLGtCQUFBLEVBQXVCLFdBSk87SUFLOUIsZ0JBQUEsRUFBdUIsY0FMTztHQUF4QixHQU1EO0lBQ0wseUJBQUEsRUFBNEIsb0JBRHZCO0lBRUwscUJBQUEsRUFBNEIsV0FGdkI7SUFHTCxtQkFBQSxFQUE0QixZQUh2QjtJQUlMLGtCQUFBLEVBQTRCLFdBSnZCO0lBS0wsZ0JBQUEsRUFBNEIsY0FMdkI7Ozt3QkFRUCxZQUFBLEdBQWMsU0FBQTtJQUNaLElBQStCLElBQUMsQ0FBQSxXQUFoQztNQUFBLElBQUMsQ0FBQSxTQUFELENBQVc7UUFBQSxVQUFBLEVBQVcsSUFBWDtPQUFYLEVBQUE7O0lBRUEsSUFBQyxDQUFBLGNBQUQsQ0FBQTtJQUVBLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdCQUFWLENBQTJCLENBQUMsV0FBNUIsQ0FBd0MsZUFBeEM7V0FDQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxlQUFWLENBQTBCLENBQUMsV0FBM0IsQ0FBdUMsZ0JBQXZDO0VBTlk7O3dCQVFkLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVCxRQUFBO0lBQUEsS0FBSyxDQUFDLGNBQU4sQ0FBQTsyRkFDc0I7RUFGYjs7d0JBSVgsV0FBQSxHQUFhLFNBQUMsS0FBRDtBQUNYLFFBQUE7SUFBQSxPQUFBLEdBQVUsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSO0lBQ1YsS0FBQSxHQUFRLE9BQU8sQ0FBQyxJQUFSLENBQWEsWUFBYjtJQUVSLDJC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LEdBQ0U7TUFBQSx3QkFBQSxFQUErQixTQUEvQjtNQUNBLGNBQUEsRUFBK0IsU0FEL0I7TUFFQSw0QkFBQSxFQUErQixTQUYvQjtNQUdBLHNCQUFBLEVBQStCLFNBSC9CO01BSUEsV0FBQSxFQUFrQixTQUpsQjtNQUtBLFdBQUEsRUFBa0IsU0FMbEI7TUFNQSxPQUFBLEVBQWtCLFdBTmxCO01BT0EsYUFBQSxFQUFrQixTQVBsQjtNQVFBLGFBQUEsRUFBa0IsU0FSbEI7TUFTQSxlQUFBLEVBQWtCLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGNBQVgsQ0FUbEI7O0VBVFE7O3dCQW9CWixPQUFBLEdBQVMsU0FBQTtXQUNQLGFBQUEsQ0FBYyxJQUFDLENBQUEsUUFBZjtFQURPOzs7O0dBbG1CZSxRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9wcm90b3R5cGVzL0dyaWRSdW5WaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgR3JpZFJ1blZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcImdyaWRfcHJvdG90eXBlXCJcblxuICBldmVudHM6IGlmIE1vZGVybml6ci50b3VjaCB0aGVuIHtcbiAgICAnY2xpY2sgLmdyaWRfZWxlbWVudCcgICAgIDogJ2dyaWRDbGljaycgI2NsaWNrXG4gICAgJ2NsaWNrIC5lbmRfb2ZfZ3JpZF9saW5lJyA6ICdlbmRPZkdyaWRMaW5lQ2xpY2snICNjbGlja1xuICAgICdjbGljayAuc3RhcnRfdGltZScgIDogJ3N0YXJ0VGltZXInXG4gICAgJ2NsaWNrIC5zdG9wX3RpbWUnICAgOiAnc3RvcFRpbWVyJ1xuICAgICdjbGljayAucmVzdGFydCcgICAgIDogJ3Jlc3RhcnRUaW1lcidcbiAgfSBlbHNlIHtcbiAgICAnY2xpY2sgLmVuZF9vZl9ncmlkX2xpbmUnIDogJ2VuZE9mR3JpZExpbmVDbGljaydcbiAgICAnY2xpY2sgLmdyaWRfZWxlbWVudCcgICAgIDogJ2dyaWRDbGljaydcbiAgICAnY2xpY2sgLnN0YXJ0X3RpbWUnICAgICAgIDogJ3N0YXJ0VGltZXInXG4gICAgJ2NsaWNrIC5zdG9wX3RpbWUnICAgICAgICA6ICdzdG9wVGltZXInXG4gICAgJ2NsaWNrIC5yZXN0YXJ0JyAgICAgICAgICA6ICdyZXN0YXJ0VGltZXInXG4gIH1cblxuICByZXN0YXJ0VGltZXI6IC0+XG4gICAgQHN0b3BUaW1lcihzaW1wbGVTdG9wOnRydWUpIGlmIEB0aW1lUnVubmluZ1xuXG4gICAgQHJlc2V0VmFyaWFibGVzKClcblxuICAgIEAkZWwuZmluZChcIi5lbGVtZW50X3dyb25nXCIpLnJlbW92ZUNsYXNzIFwiZWxlbWVudF93cm9uZ1wiXG4gICAgQCRlbC5maW5kKFwiLmdyaWRfZWxlbWVudFwiKS5yZW1vdmVDbGFzcyBcImVsZW1lbnRfbWludXRlXCJcblxuICBncmlkQ2xpY2s6IChldmVudCkgPT5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgQG1vZGVIYW5kbGVyc1tAbW9kZV0/KGV2ZW50KVxuXG4gIG1hcmtIYW5kbGVyOiAoZXZlbnQpID0+XG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIGluZGV4ID0gJHRhcmdldC5hdHRyKCdkYXRhLWluZGV4JylcblxuICAgIGluZGV4SXNudEJlbG93TGFzdEF0dGVtcHRlZCA9IHBhcnNlSW50KGluZGV4KSA+IHBhcnNlSW50KEBsYXN0QXR0ZW1wdGVkKVxuICAgIGxhc3RBdHRlbXB0ZWRJc250WmVybyAgICAgICA9IHBhcnNlSW50KEBsYXN0QXR0ZW1wdGVkKSAhPSAwXG4gICAgY29ycmVjdGlvbnNEaXNhYmxlZCAgICAgICAgID0gQGRhdGFFbnRyeSBpcyBmYWxzZSBhbmQgQHBhcmVudD8ucGFyZW50Py5lbmFibGVDb3JyZWN0aW9ucyBpcyBmYWxzZVxuXG4gICAgcmV0dXJuIGlmIGNvcnJlY3Rpb25zRGlzYWJsZWQgJiYgbGFzdEF0dGVtcHRlZElzbnRaZXJvICYmIGluZGV4SXNudEJlbG93TGFzdEF0dGVtcHRlZFxuXG4gICAgQG1hcmtFbGVtZW50KGluZGV4KVxuICAgIEBjaGVja0F1dG9zdG9wKCkgaWYgQGF1dG9zdG9wICE9IDBcblxuXG4gIGludGVybWVkaWF0ZUl0ZW1IYW5kbGVyOiAoZXZlbnQpID0+XG4gICAgQHRpbWVJbnRlcm1lZGlhdGVDYXB0dXJlZCA9IEBnZXRUaW1lKCkgLSBAc3RhcnRUaW1lXG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIGluZGV4ID0gJHRhcmdldC5hdHRyKCdkYXRhLWluZGV4JylcbiAgICBAaXRlbUF0VGltZSA9IGluZGV4XG4gICAgQCRlbC5maW5kKFwiLmdyaWRfZWxlbWVudFwiKS5yZW1vdmVDbGFzcyhcImVsZW1lbnRfbWludXRlXCIpXG4gICAgJHRhcmdldC5hZGRDbGFzcyBcImVsZW1lbnRfbWludXRlXCJcbiAgICBAdXBkYXRlTW9kZSBcIm1hcmtcIlxuXG5cbiAgY2hlY2tBdXRvc3RvcDogLT5cbiAgICBpZiBAdGltZVJ1bm5pbmdcbiAgICAgIGF1dG9Db3VudCA9IDBcbiAgICAgIGZvciBpIGluIFswLi5AYXV0b3N0b3AtMV1cbiAgICAgICAgaWYgQGdyaWRPdXRwdXRbaV0gPT0gXCJjb3JyZWN0XCIgdGhlbiBicmVha1xuICAgICAgICBhdXRvQ291bnQrK1xuICAgICAgaWYgQGF1dG9zdG9wcGVkID09IGZhbHNlXG4gICAgICAgIGlmIGF1dG9Db3VudCA9PSBAYXV0b3N0b3AgdGhlbiBAYXV0b3N0b3BUZXN0KClcbiAgICAgIGlmIEBhdXRvc3RvcHBlZCA9PSB0cnVlICYmIGF1dG9Db3VudCA8IEBhdXRvc3RvcCAmJiBAdW5kb2FibGUgPT0gdHJ1ZSB0aGVuIEB1bkF1dG9zdG9wVGVzdCgpXG5cbiAgICAgICAgIyBtb2RlIGlzIHVzZWQgZm9yIG9wZXJhdGlvbnMgbGlrZSBwcmUtcG9wdWxhdGluZyB0aGUgZ3JpZCB3aGVuIGRvaW5nIGNvcnJlY3Rpb25zLlxuICBtYXJrRWxlbWVudDogKGluZGV4LCB2YWx1ZSA9IG51bGwsIG1vZGUpIC0+XG4gICAgIyBpZiBsYXN0IGF0dGVtcHRlZCBoYXMgYmVlbiBzZXQsIGFuZCB0aGUgY2xpY2sgaXMgYWJvdmUgaXQsIHRoZW4gY2FuY2VsXG4gICAgXG4gICAgY29ycmVjdGlvbnNEaXNhYmxlZCAgICAgICAgID0gQGRhdGFFbnRyeSBpcyBmYWxzZSBhbmQgQHBhcmVudD8ucGFyZW50Py5lbmFibGVDb3JyZWN0aW9ucz8gYW5kIEBwYXJlbnQ/LnBhcmVudD8uZW5hYmxlQ29ycmVjdGlvbnMgaXMgZmFsc2VcbiAgICBsYXN0QXR0ZW1wdGVkSXNudFplcm8gICAgICAgPSBwYXJzZUludChAbGFzdEF0dGVtcHRlZCkgIT0gMFxuICAgIGluZGV4SXNudEJlbG93TGFzdEF0dGVtcHRlZCA9IHBhcnNlSW50KGluZGV4KSA+IHBhcnNlSW50KEBsYXN0QXR0ZW1wdGVkKVxuXG4gICAgcmV0dXJuIGlmIGNvcnJlY3Rpb25zRGlzYWJsZWQgYW5kIGxhc3RBdHRlbXB0ZWRJc250WmVybyBhbmQgaW5kZXhJc250QmVsb3dMYXN0QXR0ZW1wdGVkXG5cbiAgICAkdGFyZ2V0ID0gQCRlbC5maW5kKFwiLmdyaWRfZWxlbWVudFtkYXRhLWluZGV4PSN7aW5kZXh9XVwiKVxuICAgIGlmIG1vZGUgIT0gJ3BvcHVsYXRlJ1xuICAgICAgQG1hcmtSZWNvcmQucHVzaCBpbmRleFxuXG4gICAgaWYgbm90IEBhdXRvc3RvcHBlZFxuICAgICAgaWYgdmFsdWUgPT0gbnVsbCAjIG5vdCBzcGVjaWZ5aW5nIHRoZSB2YWx1ZSwganVzdCB0b2dnbGVcbiAgICAgICAgQGdyaWRPdXRwdXRbaW5kZXgtMV0gPSBpZiAoQGdyaWRPdXRwdXRbaW5kZXgtMV0gPT0gXCJjb3JyZWN0XCIpIHRoZW4gXCJpbmNvcnJlY3RcIiBlbHNlIFwiY29ycmVjdFwiXG4gICAgICAgICR0YXJnZXQudG9nZ2xlQ2xhc3MgXCJlbGVtZW50X3dyb25nXCJcbiAgICAgIGVsc2UgIyB2YWx1ZSBzcGVjaWZpZWRcbiAgICAgICAgQGdyaWRPdXRwdXRbaW5kZXgtMV0gPSB2YWx1ZVxuICAgICAgICBpZiB2YWx1ZSA9PSBcImluY29ycmVjdFwiXG4gICAgICAgICAgJHRhcmdldC5hZGRDbGFzcyBcImVsZW1lbnRfd3JvbmdcIlxuICAgICAgICBlbHNlIGlmIHZhbHVlID09IFwiY29ycmVjdFwiXG4gICAgICAgICAgJHRhcmdldC5yZW1vdmVDbGFzcyBcImVsZW1lbnRfd3JvbmdcIlxuXG4gIGVuZE9mR3JpZExpbmVDbGljazogKGV2ZW50KSAtPlxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBpZiBAbW9kZSA9PSBcIm1hcmtcIlxuICAgICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuXG4gICAgICAjIGlmIHdoYXQgd2UgY2xpY2tlZCBpcyBhbHJlYWR5IG1hcmtlZCB3cm9uZ1xuICAgICAgaWYgJHRhcmdldC5oYXNDbGFzcyhcImVsZW1lbnRfd3JvbmdcIilcbiAgICAgICAgIyBZRVMsIG1hcmsgaXQgcmlnaHRcbiAgICAgICAgJHRhcmdldC5yZW1vdmVDbGFzcyBcImVsZW1lbnRfd3JvbmdcIlxuICAgICAgICBpbmRleCA9ICR0YXJnZXQuYXR0cignZGF0YS1pbmRleCcpXG4gICAgICAgIGZvciBpIGluIFtpbmRleC4uKGluZGV4LShAY29sdW1ucy0xKSldXG4gICAgICAgICAgQG1hcmtFbGVtZW50IGksIFwiY29ycmVjdFwiXG4gICAgICBlbHNlIGlmICEkdGFyZ2V0Lmhhc0NsYXNzKFwiZWxlbWVudF93cm9uZ1wiKSAmJiAhQGF1dG9zdG9wcGVkXG4gICAgICAgICMgTk8sIG1hcmsgaXQgd3JvbmdcbiAgICAgICAgJHRhcmdldC5hZGRDbGFzcyBcImVsZW1lbnRfd3JvbmdcIlxuICAgICAgICBpbmRleCA9ICR0YXJnZXQuYXR0cignZGF0YS1pbmRleCcpXG4gICAgICAgIGZvciBpIGluIFtpbmRleC4uKGluZGV4LShAY29sdW1ucy0xKSldXG4gICAgICAgICAgQG1hcmtFbGVtZW50IGksIFwiaW5jb3JyZWN0XCJcblxuICAgICAgQGNoZWNrQXV0b3N0b3AoKSBpZiBAYXV0b3N0b3AgIT0gMFxuXG4gIGxhc3RIYW5kbGVyOiAoZXZlbnQsIGluZGV4KSA9PlxuICAgIGlmIGluZGV4P1xuICAgICAgJHRhcmdldCA9IEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRbZGF0YS1pbmRleD0je2luZGV4fV1cIilcbiAgICBlbHNlXG4gICAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpXG4gICAgICBpbmRleCAgID0gJHRhcmdldC5hdHRyKCdkYXRhLWluZGV4JylcblxuICAgIGlmIGluZGV4IC0gMSA+PSBAZ3JpZE91dHB1dC5sYXN0SW5kZXhPZihcImluY29ycmVjdFwiKVxuICAgICAgQCRlbC5maW5kKFwiLmVsZW1lbnRfbGFzdFwiKS5yZW1vdmVDbGFzcyBcImVsZW1lbnRfbGFzdFwiXG4gICAgICAkdGFyZ2V0LmFkZENsYXNzIFwiZWxlbWVudF9sYXN0XCJcbiAgICAgIEBsYXN0QXR0ZW1wdGVkID0gaW5kZXhcblxuICBzdGFydFRpbWVyOiAtPlxuICAgIGlmIEB0aW1lclN0b3BwZWQgPT0gZmFsc2UgJiYgQHRpbWVSdW5uaW5nID09IGZhbHNlXG4gICAgICBAaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCggQHVwZGF0ZUNvdW50ZG93biwgMTAwMCApICMgbWFnaWMgbnVtYmVyXG4gICAgICBAc3RhcnRUaW1lID0gQGdldFRpbWUoKVxuICAgICAgQHRpbWVSdW5uaW5nID0gdHJ1ZVxuICAgICAgQHVwZGF0ZU1vZGUgXCJtYXJrXCJcbiAgICAgIEBlbmFibGVHcmlkKClcbiAgICAgIEB1cGRhdGVDb3VudGRvd24oKVxuXG4gIGVuYWJsZUdyaWQ6IC0+XG4gICAgQCRlbC5maW5kKFwidGFibGUuZGlzYWJsZWQsIGRpdi5kaXNhYmxlZFwiKS5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpXG5cbiAgc3RvcFRpbWVyOiAoZXZlbnQsIG1lc3NhZ2UgPSBmYWxzZSkgLT5cblxuICAgIHJldHVybiBpZiBAdGltZVJ1bm5pbmcgIT0gdHJ1ZSAjIHN0b3Agb25seSBpZiBuZWVkZWRcblxuICAgIGlmIGV2ZW50Py50YXJnZXRcbiAgICAgIEBsYXN0SGFuZGxlcihudWxsLCBAaXRlbXMubGVuZ3RoKVxuXG4gICAgIyBkbyB0aGVzZSBhbHdheXNcbiAgICBjbGVhckludGVydmFsIEBpbnRlcnZhbFxuICAgIEBzdG9wVGltZSA9IEBnZXRUaW1lKClcbiAgICBAdGltZVJ1bm5pbmcgPSBmYWxzZVxuICAgIEB0aW1lclN0b3BwZWQgPSB0cnVlXG5cbiAgICBAdXBkYXRlQ291bnRkb3duKClcblxuICAgICMgZG8gdGhlc2UgaWYgaXQncyBub3QgYSBzaW1wbGUgc3RvcFxuICAgICNpZiBub3QgZXZlbnQ/LnNpbXBsZVN0b3BcbiAgICAgICNVdGlscy5mbGFzaCgpXG5cblxuICBhdXRvc3RvcFRlc3Q6IC0+XG4gICAgVXRpbHMuZmxhc2goKVxuICAgIGNsZWFySW50ZXJ2YWwgQGludGVydmFsXG4gICAgQHN0b3BUaW1lID0gQGdldFRpbWUoKVxuICAgIEBhdXRvc3RvcHBlZCA9IHRydWVcbiAgICBAdGltZXJTdG9wcGVkID0gdHJ1ZVxuICAgIEB0aW1lUnVubmluZyA9IGZhbHNlXG4gICAgQCRlbC5maW5kKFwiLmdyaWRfZWxlbWVudFwiKS5zbGljZShAYXV0b3N0b3AtMSxAYXV0b3N0b3ApLmFkZENsYXNzIFwiZWxlbWVudF9sYXN0XCIgI2pxdWVyeSBpcyB3ZWlyZCBzb21ldGltZXNcbiAgICBAbGFzdEF0dGVtcHRlZCA9IEBhdXRvc3RvcFxuICAgIEB0aW1lb3V0ID0gc2V0VGltZW91dChAcmVtb3ZlVW5kbywgMzAwMCkgIyBnaXZlIHRoZW0gMyBzZWNvbmRzIHRvIHVuZG8uIG1hZ2ljIG51bWJlclxuICAgIFV0aWxzLnRvcEFsZXJ0IEB0ZXh0LmF1dG9zdG9wXG5cbiAgcmVtb3ZlVW5kbzogPT5cbiAgICBAdW5kb2FibGUgPSBmYWxzZVxuICAgIEB1cGRhdGVNb2RlIFwiZGlzYWJsZWRcIlxuICAgIGNsZWFyVGltZW91dChAdGltZW91dClcblxuICB1bkF1dG9zdG9wVGVzdDogLT5cbiAgICBAaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChAdXBkYXRlQ291bnRkb3duLDEwMDAgKSAjIG1hZ2ljIG51bWJlclxuICAgIEB1cGRhdGVDb3VudGRvd24oKVxuICAgIEBhdXRvc3RvcHBlZCA9IGZhbHNlXG4gICAgQGxhc3RBdHRlbXB0ZWQgPSAwXG4gICAgQCRlbC5maW5kKFwiLmdyaWRfZWxlbWVudFwiKS5zbGljZShAYXV0b3N0b3AtMSxAYXV0b3N0b3ApLnJlbW92ZUNsYXNzIFwiZWxlbWVudF9sYXN0XCJcbiAgICBAdGltZVJ1bm5pbmcgPSB0cnVlXG4gICAgQHVwZGF0ZU1vZGUgXCJtYXJrXCJcbiAgICBVdGlscy50b3BBbGVydCB0KFwiR3JpZFJ1blZpZXcubWVzc2FnZS5hdXRvc3RvcF9jYW5jZWxcIilcblxuICB1cGRhdGVDb3VudGRvd246ID0+XG4gICAgIyBzb21ldGltZXMgdGhlIFwidGlja1wiIGRvZXNuJ3QgaGFwcGVuIHdpdGhpbiBhIHNlY29uZFxuICAgIEB0aW1lRWxhcHNlZCA9IE1hdGgubWluKEBnZXRUaW1lKCkgLSBAc3RhcnRUaW1lLCBAdGltZXIpXG5cbiAgICBAdGltZVJlbWFpbmluZyA9IEB0aW1lciAtIEB0aW1lRWxhcHNlZFxuXG4gICAgQCRlbC5maW5kKFwiLnRpbWVyXCIpLmh0bWwgQHRpbWVSZW1haW5pbmdcblxuICAgIGlmIEB0aW1lUnVubmluZyBpcyB0cnVlIGFuZCBAY2FwdHVyZUxhc3RBdHRlbXB0ZWQgYW5kIEB0aW1lUmVtYWluaW5nIDw9IDAgXG4gICAgICAgIEBzdG9wVGltZXIoc2ltcGxlU3RvcDp0cnVlKVxuICAgICAgICBVdGlscy5iYWNrZ3JvdW5kIFwicmVkXCJcbiAgICAgICAgXy5kZWxheShcbiAgICAgICAgICA9PlxuICAgICAgICAgICAgYWxlcnQgQHRleHQudG91Y2hMYXN0SXRlbVxuICAgICAgICAgICAgVXRpbHMuYmFja2dyb3VuZCBcIlwiXG4gICAgICAgICwgMWUzKSAjIG1hZ2ljIG51bWJlclxuXG4gICAgICAgIEB1cGRhdGVNb2RlIFwibGFzdFwiXG5cblxuICAgIGlmIEBjYXB0dXJlSXRlbUF0VGltZSAmJiAhQGdvdEludGVybWVkaWF0ZSAmJiAhQG1pbnV0ZU1lc3NhZ2UgJiYgQHRpbWVFbGFwc2VkID49IEBjYXB0dXJlQWZ0ZXJTZWNvbmRzXG4gICAgICBVdGlscy5mbGFzaCBcInllbGxvd1wiXG4gICAgICBVdGlscy5taWRBbGVydCB0KFwicGxlYXNlIHNlbGVjdCB0aGUgaXRlbSB0aGUgY2hpbGQgaXMgY3VycmVudGx5IGF0dGVtcHRpbmdcIilcbiAgICAgIEBtaW51dGVNZXNzYWdlID0gdHJ1ZVxuICAgICAgQHVwZGF0ZU1vZGUgXCJtaW51dGVJdGVtXCJcblxuXG4gIHVwZGF0ZU1vZGU6ICggbW9kZSA9IG51bGwgKSA9PlxuICAgICMgZG9udCcgY2hhbmdlIHRoZSBtb2RlIGlmIHRoZSB0aW1lIGhhcyBuZXZlciBiZWVuIHN0YXJ0ZWRcbiAgICBpZiAobW9kZT09bnVsbCAmJiBAdGltZUVsYXBzZWQgPT0gMCAmJiBub3QgQGRhdGFFbnRyeSkgfHwgbW9kZSA9PSBcImRpc2FibGVkXCJcbiAgICAgIEBtb2RlQnV0dG9uLnNldFZhbHVlIG51bGxcbiAgICBlbHNlIGlmIG1vZGU/ICMgbWFudWFsbHkgY2hhbmdlIHRoZSBtb2RlXG4gICAgICBAbW9kZSA9IG1vZGVcbiAgICAgIEBtb2RlQnV0dG9uLnNldFZhbHVlIEBtb2RlXG4gICAgZWxzZSAjIGhhbmRsZSBhIGNsaWNrIGV2ZW50XG4gICAgICBAbW9kZSA9IEBtb2RlQnV0dG9uLmdldFZhbHVlKClcblxuICBnZXRUaW1lOiAtPlxuICAgIE1hdGgucm91bmQoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAvIDEwMDApXG5cbiAgcmVzZXRWYXJpYWJsZXM6IC0+XG5cbiAgICBAdGltZXIgICAgPSBwYXJzZUludChAbW9kZWwuZ2V0KFwidGltZXJcIikpIHx8IDBcbiAgICBAdW50aW1lZCAgPSBAdGltZXIgPT0gMCB8fCBAZGF0YUVudHJ5ICMgRG8gbm90IHNob3cgdGhlIHRpbWVyIGlmIGl0J3MgZGlzYXNibGVkIG9yIGRhdGEgZW50cnkgbW9kZVxuXG4gICAgQGdvdE1pbnV0ZUl0ZW0gPSBmYWxzZVxuICAgIEBtaW51dGVNZXNzYWdlID0gZmFsc2VcbiAgICBAaXRlbUF0VGltZSA9IG51bGxcblxuICAgIEB0aW1lSW50ZXJtZWRpYXRlQ2FwdHVyZWQgPSBudWxsXG5cbiAgICBAbWFya1JlY29yZCA9IFtdXG5cbiAgICBAdGltZXJTdG9wcGVkID0gZmFsc2VcblxuICAgIEBzdGFydFRpbWUgPSAwXG4gICAgQHN0b3BUaW1lICA9IDBcbiAgICBAdGltZUVsYXBzZWQgPSAwXG4gICAgQHRpbWVSZW1haW5pbmcgPSBAdGltZXJcbiAgICBAbGFzdEF0dGVtcHRlZCA9IDBcblxuICAgIEBpbnRlcnZhbCA9IG51bGxcblxuICAgIEB1bmRvYWJsZSA9IHRydWVcblxuICAgIEB0aW1lUnVubmluZyA9IGZhbHNlXG5cblxuICAgIEBpdGVtcyAgICA9IF8uY29tcGFjdChAbW9kZWwuZ2V0KFwiaXRlbXNcIikpICMgbWlsZCBzYW5pdGl6YXRpb24sIGhhcHBlbnMgYXQgc2F2ZSB0b29cblxuICAgIEBpdGVtTWFwID0gW11cbiAgICBAbWFwSXRlbSA9IFtdXG5cbiAgICBpZiBAbW9kZWwuaGFzKFwicmFuZG9taXplXCIpICYmIEBtb2RlbC5nZXQoXCJyYW5kb21pemVcIilcbiAgICAgIEBpdGVtTWFwID0gQGl0ZW1zLm1hcCAodmFsdWUsIGkpIC0+IGlcblxuICAgICAgQGl0ZW1zLmZvckVhY2ggKGl0ZW0sIGkpIC0+XG4gICAgICAgIHRlbXAgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBAaXRlbXMubGVuZ3RoKVxuICAgICAgICB0ZW1wVmFsdWUgPSBAaXRlbU1hcFt0ZW1wXVxuICAgICAgICBAaXRlbU1hcFt0ZW1wXSA9IEBpdGVtTWFwW2ldXG4gICAgICAgIEBpdGVtTWFwW2ldID0gdGVtcFZhbHVlXG4gICAgICAsIEBcbiAgICAgIFxuICAgICAgQGl0ZW1NYXAuZm9yRWFjaCAoaXRlbSwgaSkgLT5cbiAgICAgICAgQG1hcEl0ZW1bQGl0ZW1NYXBbaV1dID0gaVxuICAgICAgLCBAXG4gICAgZWxzZVxuICAgICAgQGl0ZW1zLmZvckVhY2ggKGl0ZW0sIGkpIC0+IFxuICAgICAgICBAaXRlbU1hcFtpXSA9IGlcbiAgICAgICAgQG1hcEl0ZW1baV0gPSBpXG4gICAgICAsIEBcblxuICAgIGlmICFAY2FwdHVyZUxhc3RBdHRlbXB0ZWQgJiYgIUBjYXB0dXJlSXRlbUF0VGltZVxuICAgICAgQG1vZGUgPSBcIm1hcmtcIlxuICAgIGVsc2VcbiAgICAgIEBtb2RlID0gXCJkaXNhYmxlZFwiXG5cbiAgICBAbW9kZSA9IFwibWFya1wiIGlmIEBkYXRhRW50cnlcblxuICAgIEBncmlkT3V0cHV0ID0gQGl0ZW1zLm1hcCAtPiAnY29ycmVjdCdcblxuICAgIEBjb2x1bW5zICA9IHBhcnNlSW50KEBtb2RlbC5nZXQoXCJjb2x1bW5zXCIpKSB8fCAzXG5cbiAgICBAYXV0b3N0b3AgPSBpZiBAdW50aW1lZCB0aGVuIDAgZWxzZSAocGFyc2VJbnQoQG1vZGVsLmdldChcImF1dG9zdG9wXCIpKSB8fCAwKVxuICAgIEBhdXRvc3RvcHBlZCA9IGZhbHNlXG5cbiAgICBAJGVsLmZpbmQoXCIuZ3JpZF9lbGVtZW50XCIpLnJlbW92ZUNsYXNzKFwiZWxlbWVudF93cm9uZ1wiKS5yZW1vdmVDbGFzcyhcImVsZW1lbnRfbGFzdFwiKS5hZGRDbGFzcyhcImRpc2FibGVkXCIpXG4gICAgQCRlbC5maW5kKFwidGFibGVcIikuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKVxuXG4gICAgQCRlbC5maW5kKFwiLnRpbWVyXCIpLmh0bWwgQHRpbWVyXG5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuXG4gICAgICAjIGNsYXNzIGRvZXNuJ3QgaGF2ZSB0aGlzIGhlaXJhcmNoeVxuICAgICAgaWYgQHBhcmVudD8gYW5kIEBwYXJlbnQucGFyZW50PyBhbmQgQHBhcmVudC5wYXJlbnQucmVzdWx0P1xuXG4gICAgICAgIHByZXZpb3VzID0gQHBhcmVudC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG4gICAgICAgIGlmIHByZXZpb3VzXG5cbiAgICAgICAgICAjICAgICBpdGVtcyA9IGRhdGEuaXRlbXNcbiAgICAgICAgICBAY2FwdHVyZUxhc3RBdHRlbXB0ZWQgICAgID0gcHJldmlvdXMuY2FwdHVyZV9sYXN0X2F0dGVtcHRlZFxuICAgICAgICAgIEBpdGVtQXRUaW1lICAgICAgICAgICAgICAgPSBwcmV2aW91cy5pdGVtX2F0X3RpbWVcbiAgICAgICAgICBAdGltZUludGVybWVkaWF0ZUNhcHR1cmVkID0gcHJldmlvdXMudGltZV9pbnRlcm1lZGlhdGVfY2FwdHVyZWRcbiAgICAgICAgICBAY2FwdHVyZUl0ZW1BdFRpbWUgICAgICAgID0gcHJldmlvdXMuY2FwdHVyZV9pdGVtX2F0X3RpbWVcbiAgICAgICAgICBAYXV0b3N0b3AgICAgICAgICAgICAgICAgID0gcHJldmlvdXMuYXV0b19zdG9wXG4gICAgICAgICAgQGxhc3RBdHRlbXB0ZWQgICAgICAgICAgICA9IHByZXZpb3VzLmF0dGVtcHRlZFxuICAgICAgICAgIEB0aW1lUmVtYWluaW5nICAgICAgICAgICAgPSBwcmV2aW91cy50aW1lX3JlbWFpblxuICAgICAgICAgIEBtYXJrUmVjb3JkICAgICAgICAgICAgICAgPSBwcmV2aW91cy5tYXJrX3JlY29yZFxuXG4gICAgQHVwZGF0ZU1vZGUgQG1vZGUgaWYgQG1vZGVCdXR0b24/XG5cbiAgaTE4bjogLT5cblxuICAgIEB0ZXh0ID1cbiAgICAgIGF1dG9zdG9wICAgICAgICAgICA6IHQoXCJHcmlkUnVuVmlldy5tZXNzYWdlLmF1dG9zdG9wXCIpXG4gICAgICB0b3VjaExhc3RJdGVtICAgICAgOiB0KFwiR3JpZFJ1blZpZXcubWVzc2FnZS50b3VjaF9sYXN0X2l0ZW1cIilcbiAgICAgIHN1YnRlc3ROb3RDb21wbGV0ZSA6IHQoXCJHcmlkUnVuVmlldy5tZXNzYWdlLnN1YnRlc3Rfbm90X2NvbXBsZXRlXCIpXG5cbiAgICAgIGlucHV0TW9kZSAgICAgOiB0KFwiR3JpZFJ1blZpZXcubGFiZWwuaW5wdXRfbW9kZVwiKVxuICAgICAgdGltZVJlbWFpbmluZyAgOiB0KFwiR3JpZFJ1blZpZXcubGFiZWwudGltZV9yZW1haW5pbmdcIilcbiAgICAgIHdhc0F1dG9zdG9wcGVkIDogdChcIkdyaWRSdW5WaWV3LmxhYmVsLndhc19hdXRvc3RvcHBlZFwiKVxuXG4gICAgICBtYXJrICAgICAgICAgIDogdChcIkdyaWRSdW5WaWV3LmJ1dHRvbi5tYXJrXCIpXG4gICAgICBzdGFydCAgICAgICAgIDogdChcIkdyaWRSdW5WaWV3LmJ1dHRvbi5zdGFydFwiKVxuICAgICAgc3RvcCAgICAgICAgICA6IHQoXCJHcmlkUnVuVmlldy5idXR0b24uc3RvcFwiKVxuICAgICAgcmVzdGFydCAgICAgICA6IHQoXCJHcmlkUnVuVmlldy5idXR0b24ucmVzdGFydFwiKVxuICAgICAgbGFzdEF0dGVtcHRlZCA6IHQoXCJHcmlkUnVuVmlldy5idXR0b24ubGFzdF9hdHRlbXB0ZWRcIilcblxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgQGkxOG4oKVxuXG4gICAgQGZvbnRTdHlsZSA9IFwic3R5bGU9XFxcImZvbnQtZmFtaWx5OiAje0Btb2RlbC5nZXQoJ2ZvbnRGYW1pbHknKX0gIWltcG9ydGFudDtcXFwiXCIgaWYgQG1vZGVsLmdldChcImZvbnRGYW1pbHlcIikgIT0gXCJcIiBcblxuICAgIEBjYXB0dXJlQWZ0ZXJTZWNvbmRzICA9IGlmIEBtb2RlbC5oYXMoXCJjYXB0dXJlQWZ0ZXJTZWNvbmRzXCIpICB0aGVuIEBtb2RlbC5nZXQoXCJjYXB0dXJlQWZ0ZXJTZWNvbmRzXCIpICBlbHNlIDBcbiAgICBAY2FwdHVyZUl0ZW1BdFRpbWUgICAgPSBpZiBAbW9kZWwuaGFzKFwiY2FwdHVyZUl0ZW1BdFRpbWVcIikgICAgdGhlbiBAbW9kZWwuZ2V0KFwiY2FwdHVyZUl0ZW1BdFRpbWVcIikgICAgZWxzZSBmYWxzZVxuICAgIEBjYXB0dXJlTGFzdEF0dGVtcHRlZCA9IGlmIEBtb2RlbC5oYXMoXCJjYXB0dXJlTGFzdEF0dGVtcHRlZFwiKSB0aGVuIEBtb2RlbC5nZXQoXCJjYXB0dXJlTGFzdEF0dGVtcHRlZFwiKSBlbHNlIHRydWVcbiAgICBAZW5kT2ZMaW5lICAgICAgICAgICAgPSBpZiBAbW9kZWwuaGFzKFwiZW5kT2ZMaW5lXCIpICAgICAgICAgICAgdGhlbiBAbW9kZWwuZ2V0KFwiZW5kT2ZMaW5lXCIpICAgICAgICAgICAgZWxzZSB0cnVlXG5cbiAgICBAbGF5b3V0TW9kZSA9IGlmIEBtb2RlbC5oYXMoXCJsYXlvdXRNb2RlXCIpIHRoZW4gQG1vZGVsLmdldChcImxheW91dE1vZGVcIikgZWxzZSBcImZpeGVkXCJcbiAgICBAZm9udFNpemUgICA9IGlmIEBtb2RlbC5oYXMoXCJmb250U2l6ZVwiKSAgIHRoZW4gQG1vZGVsLmdldChcImZvbnRTaXplXCIpICAgZWxzZSBcIm5vcm1hbFwiXG5cbiAgICBpZiBAZm9udFNpemUgPT0gXCJzbWFsbFwiXG4gICAgICBmb250U2l6ZUNsYXNzID0gXCJmb250X3NpemVfc21hbGxcIlxuICAgIGVsc2VcbiAgICAgIGZvbnRTaXplQ2xhc3MgPSBcIlwiXG5cbiAgICBAcnRsID0gQG1vZGVsLmdldEJvb2xlYW4gXCJydGxcIlxuICAgIEAkZWwuYWRkQ2xhc3MgXCJydGwtZ3JpZFwiIGlmIEBydGwgXG5cbiAgICBAdG90YWxUaW1lID0gQG1vZGVsLmdldChcInRpbWVyXCIpIHx8IDBcblxuICAgIEBtb2RlSGFuZGxlcnMgPVxuICAgICAgXCJtYXJrXCIgICAgICAgOiBAbWFya0hhbmRsZXJcbiAgICAgIFwibGFzdFwiICAgICAgIDogQGxhc3RIYW5kbGVyXG4gICAgICBcIm1pbnV0ZUl0ZW1cIiA6IEBpbnRlcm1lZGlhdGVJdGVtSGFuZGxlclxuICAgICAgZGlzYWJsZWQgICAgIDogJC5ub29wXG5cbiAgICBAZGF0YUVudHJ5ID0gb3B0aW9ucy5kYXRhRW50cnlcblxuICAgIEBtb2RlbCAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCA9IG9wdGlvbnMucGFyZW50XG5cbiAgICBAcmVzZXRWYXJpYWJsZXMoKVxuXG4gICAgQGdyaWRFbGVtZW50ICAgICAgICAgPSBfLnRlbXBsYXRlIFwiPHRkPjxidXR0b24gZGF0YS1sYWJlbD0ne3tsYWJlbH19JyBkYXRhLWluZGV4PSd7e2l9fScgY2xhc3M9J2dyaWRfZWxlbWVudCAje2ZvbnRTaXplQ2xhc3N9JyAje0Bmb250U3R5bGUgfHwgXCJcIn0+e3tsYWJlbH19PC9idXR0b24+PC90ZD5cIlxuICAgIEB2YXJpYWJsZUdyaWRFbGVtZW50ID0gXy50ZW1wbGF0ZSBcIjxidXR0b24gZGF0YS1sYWJlbD0ne3tsYWJlbH19JyBkYXRhLWluZGV4PSd7e2l9fScgY2xhc3M9J2dyaWRfZWxlbWVudCAje2ZvbnRTaXplQ2xhc3N9JyAje0Bmb250U3R5bGUgfHwgXCJcIn0+e3tsYWJlbH19PC9idXR0b24+XCJcblxuICAgIGlmIEBsYXlvdXRNb2RlID09IFwiZml4ZWRcIlxuICAgICAgQGVuZE9mR3JpZExpbmUgPSBfLnRlbXBsYXRlIFwiPHRkPjxidXR0b24gZGF0YS1pbmRleD0ne3tpfX0nIGNsYXNzPSdlbmRfb2ZfZ3JpZF9saW5lJz4qPC9idXR0b24+PC90ZD5cIlxuICAgIGVsc2VcbiAgICAgIEBlbmRPZkdyaWRMaW5lID0gXy50ZW1wbGF0ZSBcIlwiXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgZG9uZSA9IDBcblxuICAgIHN0YXJ0VGltZXJIVE1MID0gXCI8ZGl2IGNsYXNzPSd0aW1lcl93cmFwcGVyJz48YnV0dG9uIGNsYXNzPSdzdGFydF90aW1lIHRpbWUnPiN7QHRleHQuc3RhcnR9PC9idXR0b24+PGRpdiBjbGFzcz0ndGltZXInPiN7QHRpbWVyfTwvZGl2PjwvZGl2PlwiXG5cbiAgICBkaXNhYmxpbmcgPSBcImRpc2FibGVkXCIgdW5sZXNzIEB1bnRpbWVkXG5cbiAgICBkaXNwbGF5UnRsID0gXCJydGxfbW9kZVwiIGlmIEBydGxcblxuICAgIGh0bWwgPSBpZiBub3QgQHVudGltZWQgdGhlbiBzdGFydFRpbWVySFRNTCBlbHNlIFwiXCJcblxuICAgIGdyaWRIVE1MID0gXCJcIlxuXG4gICAgaWYgQGxheW91dE1vZGUgPT0gXCJmaXhlZFwiXG4gICAgICBncmlkSFRNTCArPSBcIjx0YWJsZSBjbGFzcz0nZ3JpZCAje2Rpc2FibGluZ30gI3tkaXNwbGF5UnRsfHwnJ30nPlwiXG4gICAgICBmaXJzdFJvdyA9IHRydWVcbiAgICAgIGxvb3BcbiAgICAgICAgYnJlYWsgaWYgZG9uZSA+IEBpdGVtcy5sZW5ndGhcbiAgICAgICAgZ3JpZEhUTUwgKz0gXCI8dHI+XCJcbiAgICAgICAgZm9yIGkgaW4gWzEuLkBjb2x1bW5zXVxuICAgICAgICAgIGlmIGRvbmUgPCBAaXRlbXMubGVuZ3RoXG4gICAgICAgICAgICBncmlkSFRNTCArPSBAZ3JpZEVsZW1lbnQgeyBsYWJlbCA6IF8uZXNjYXBlKEBpdGVtc1tAaXRlbU1hcFtkb25lXV0pLCBpOiBkb25lKzEgfVxuICAgICAgICAgIGRvbmUrK1xuICAgICAgICAjIGRvbid0IHNob3cgdGhlIHNraXAgcm93IGJ1dHRvbiBmb3IgdGhlIGZpcnN0IHJvd1xuICAgICAgICBpZiBmaXJzdFJvd1xuICAgICAgICAgIGdyaWRIVE1MICs9IFwiPHRkPjwvdGQ+XCIgaWYgZG9uZSA8ICggQGl0ZW1zLmxlbmd0aCArIDEgKSAmJiBAZW5kT2ZMaW5lXG4gICAgICAgICAgZmlyc3RSb3cgPSBmYWxzZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgZ3JpZEhUTUwgKz0gQGVuZE9mR3JpZExpbmUoe2k6ZG9uZX0pIGlmIGRvbmUgPCAoIEBpdGVtcy5sZW5ndGggKyAxICkgJiYgQGVuZE9mTGluZVxuXG4gICAgICAgIGdyaWRIVE1MICs9IFwiPC90cj5cIlxuICAgICAgZ3JpZEhUTUwgKz0gXCI8L3RhYmxlPlwiXG4gICAgZWxzZVxuICAgICAgZ3JpZEhUTUwgKz0gXCI8ZGl2IGNsYXNzPSdncmlkICN7ZGlzYWJsaW5nfSAje2Rpc3BsYXlSdGx8fCcnfSc+XCJcbiAgICAgIGZvciBpdGVtLCBpIGluIEBpdGVtc1xuICAgICAgICBncmlkSFRNTCArPSBAdmFyaWFibGVHcmlkRWxlbWVudFxuICAgICAgICAgIFwibGFiZWxcIiA6IF8uZXNjYXBlKEBpdGVtc1tAaXRlbU1hcFtpXV0pXG4gICAgICAgICAgXCJpXCIgICAgIDogaSsxXG4gICAgICBncmlkSFRNTCArPSBcIjwvZGl2PlwiXG4gICAgaHRtbCArPSBncmlkSFRNTFxuICAgIHN0b3BUaW1lckhUTUwgPSBcIjxkaXYgY2xhc3M9J3RpbWVyX3dyYXBwZXInPjxidXR0b24gY2xhc3M9J3N0b3BfdGltZSB0aW1lJz4je0B0ZXh0LnN0b3B9PC9idXR0b24+PGRpdiBjbGFzcz0ndGltZXInPiN7QHRpbWVyfTwvZGl2PjwvZGl2PlwiXG5cbiAgICByZXNldEJ1dHRvbiA9IFwiXG4gICAgICA8ZGl2PlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdyZXN0YXJ0IGNvbW1hbmQnPiN7QHRleHQucmVzdGFydH08L2J1dHRvbj5cbiAgICAgICAgPGJyPlxuICAgICAgPC9kaXY+XG4gICAgXCJcblxuICAgICNcbiAgICAjIE1vZGUgc2VsZWN0b3JcbiAgICAjXG5cbiAgICBtb2RlU2VsZWN0b3IgPSBcIlwiXG4gICAgIyBpZiBhbnkgb3RoZXIgb3B0aW9uIGlzIGF2YWlhbGJlIG90aGVyIHRoYW4gbWFyaywgdGhlbiBzaG93IHRoZSBzZWxlY3RvclxuICAgIGlmIEBjYXB0dXJlTGFzdEF0dGVtcHRlZCB8fCBAY2FwdHVyZUl0ZW1BdFRpbWVcblxuICAgICAgQG1vZGVCdXR0b24/LmNsb3NlKClcblxuICAgICAgYnV0dG9uQ29uZmlnID1cbiAgICAgICAgb3B0aW9ucyA6IFtdXG4gICAgICAgIG1vZGUgICAgOiBcInNpbmdsZVwiXG5cbiAgICAgIGJ1dHRvbkNvbmZpZy5vcHRpb25zLnB1c2gge1xuICAgICAgICBsYWJlbCA6IEB0ZXh0Lm1hcmtcbiAgICAgICAgdmFsdWUgOiBcIm1hcmtcIlxuICAgICAgfVxuXG4gICAgICBidXR0b25Db25maWcub3B0aW9ucy5wdXNoIHtcbiAgICAgICAgbGFiZWwgOiB0KCBcIml0ZW0gYXQgX19zZWNvbmRzX18gc2Vjb25kc1wiLCBzZWNvbmRzIDogQGNhcHR1cmVBZnRlclNlY29uZHMgKVxuICAgICAgICB2YWx1ZSA6IFwibWludXRlSXRlbVwiXG4gICAgICB9IGlmIEBjYXB0dXJlSXRlbUF0VGltZVxuXG4gICAgICBidXR0b25Db25maWcub3B0aW9ucy5wdXNoIHtcbiAgICAgICAgbGFiZWwgOiBAdGV4dC5sYXN0QXR0ZW1wdGVkXG4gICAgICAgIHZhbHVlIDogXCJsYXN0XCJcbiAgICAgIH0gaWYgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkXG5cbiAgICAgIEBtb2RlQnV0dG9uID0gbmV3IEJ1dHRvblZpZXcgYnV0dG9uQ29uZmlnXG4gICAgICBAbW9kZUJ1dHRvbi5vbiBcImNoYW5nZSBjbGlja1wiLCAoPT4gQHVwZGF0ZU1vZGUoKSksIEBcbiAgICAgIG1vZGVTZWxlY3RvciA9IFwiXG4gICAgICAgIDxkaXYgY2xhc3M9J2dyaWRfbW9kZV93cmFwcGVyIHF1ZXN0aW9uIGNsZWFyZml4Jz5cbiAgICAgICAgICA8bGFiZWw+I3tAdGV4dC5pbnB1dE1vZGV9PC9sYWJlbD48YnI+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nbW9kZS1idXR0b24nPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIFwiXG5cbiAgICBkYXRhRW50cnkgPSBcIlxuICAgICAgPHRhYmxlIGNsYXNzPSdjbGFzc190YWJsZSc+XG5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZD4je0B0ZXh0Lndhc0F1dG9zdG9wcGVkfTwvdGQ+PHRkPjxpbnB1dCB0eXBlPSdjaGVja2JveCcgY2xhc3M9J2RhdGFfYXV0b3N0b3BwZWQnPjwvdGQ+XG4gICAgICAgIDwvdHI+XG5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0ZD4je0B0ZXh0LnRpbWVSZW1haW5pbmd9PC90ZD48dGQ+PGlucHV0IHR5cGU9J251bWJlcicgY2xhc3M9J2RhdGFfdGltZV9yZW1haW4nPjwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICA8L3RhYmxlPlxuICAgIFwiXG5cbiAgICBodG1sICs9IFwiXG4gICAgICAje2lmIG5vdCBAdW50aW1lZCB0aGVuIHN0b3BUaW1lckhUTUwgZWxzZSBcIlwifVxuICAgICAgI3tpZiBub3QgQHVudGltZWQgdGhlbiByZXNldEJ1dHRvbiBlbHNlIFwiXCJ9XG4gICAgICAje21vZGVTZWxlY3Rvcn1cbiAgICAgICN7KGRhdGFFbnRyeSBpZiBAZGF0YUVudHJ5KSB8fCAnJ31cbiAgICBcIlxuXG4gICAgQCRlbC5odG1sIGh0bWxcblxuICAgIEBtb2RlQnV0dG9uLnNldEVsZW1lbnQgQCRlbC5maW5kIFwiLm1vZGUtYnV0dG9uXCJcbiAgICBAbW9kZUJ1dHRvbi5yZW5kZXIoKVxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG4gICAgQHRyaWdnZXIgXCJyZWFkeVwiXG5cbiAgICB1bmxlc3MgQGRhdGFFbnRyeVxuICAgICAgXG4gICAgICAjIGNsYXNzIGRvZXNuJ3QgaGF2ZSB0aGlzIGhlaXJhcmNoeVxuICAgICAgaWYgQHBhcmVudD8gYW5kIEBwYXJlbnQucGFyZW50PyBhbmQgQHBhcmVudC5wYXJlbnQucmVzdWx0P1xuXG4gICAgICAgIHByZXZpb3VzID0gQHBhcmVudC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG4gICAgICAgIGlmIHByZXZpb3VzXG4gICAgICAgICAgQG1hcmtSZWNvcmQgPSBwcmV2aW91cy5tYXJrX3JlY29yZFxuXG4gICAgICAgICAgZm9yIGl0ZW0sIGkgaW4gQG1hcmtSZWNvcmRcbiAgICAgICAgICAgIEBtYXJrRWxlbWVudCBpdGVtLCBudWxsLCAncG9wdWxhdGUnXG5cbiAgICAgICAgICBAaXRlbUF0VGltZSA9IHByZXZpb3VzLml0ZW1fYXRfdGltZVxuICAgICAgICAgICR0YXJnZXQgPSBAJGVsLmZpbmQoXCIuZ3JpZF9lbGVtZW50W2RhdGEtaW5kZXg9I3tAaXRlbUF0VGltZX1dXCIpXG4gICAgICAgICAgJHRhcmdldC5hZGRDbGFzcyBcImVsZW1lbnRfbWludXRlXCJcblxuICAgICAgICAgIEBsYXN0QXR0ZW1wdGVkID0gcHJldmlvdXMuYXR0ZW1wdGVkXG4gICAgICAgICAgJHRhcmdldCA9IEAkZWwuZmluZChcIi5ncmlkX2VsZW1lbnRbZGF0YS1pbmRleD0je0BsYXN0QXR0ZW1wdGVkfV1cIilcbiAgICAgICAgICAkdGFyZ2V0LmFkZENsYXNzIFwiZWxlbWVudF9sYXN0XCJcblxuICBpc1ZhbGlkOiAtPlxuICAgICMgU3RvcCB0aW1lciBpZiBzdGlsbCBydW5uaW5nLiBJc3N1ZSAjMjQwXG4gICAgQHN0b3BUaW1lcigpIGlmIEB0aW1lUnVubmluZ1xuXG4gICAgaWYgcGFyc2VJbnQoQGxhc3RBdHRlbXB0ZWQpIGlzIEBpdGVtcy5sZW5ndGggYW5kIEB0aW1lUmVtYWluaW5nIGlzIDBcblxuICAgICAgaXRlbSA9IEBpdGVtc1tAaXRlbXMubGVuZ3RoLTFdXG4gICAgICBpZiBjb25maXJtKHQoXCJHcmlkUnVuVmlldy5tZXNzYWdlLmxhc3RfaXRlbV9jb25maXJtXCIsIGl0ZW06aXRlbSkpXG4gICAgICAgIEB1cGRhdGVNb2RlXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIEBtZXNzYWdlcyA9IGlmIEBtZXNzYWdlcz8ucHVzaCB0aGVuIEBtZXNzYWdlcy5jb25jYXQoW21zZ10pIGVsc2UgW21zZ11cbiAgICAgICAgQHVwZGF0ZU1vZGUgXCJsYXN0XCJcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICByZXR1cm4gZmFsc2UgaWYgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkICYmIEBsYXN0QXR0ZW1wdGVkID09IDBcbiAgICAjIG1pZ2h0IG5lZWQgdG8gbGV0IGl0IGtub3cgaWYgaXQncyB0aW1lZCBvciB1bnRpbWVkIHRvbyA6OnNocnVnOjpcbiAgICByZXR1cm4gZmFsc2UgaWYgQHRpbWVSdW5uaW5nID09IHRydWVcbiAgICByZXR1cm4gZmFsc2UgaWYgQHRpbWVyICE9IDAgJiYgQHRpbWVSZW1haW5pbmcgPT0gQHRpbWVyXG4gICAgdHJ1ZVxuXG4gIHNob3dFcnJvcnM6IC0+XG4gICAgbWVzc2FnZXMgPSBAbWVzc2FnZXMgfHwgW11cbiAgICBAbWVzc2FnZXMgPSBbXVxuXG4gICAgdGltZXJIYXNudFJ1biAgICA9IEB0aW1lciAhPSAwICYmIEB0aW1lUmVtYWluaW5nID09IEB0aW1lclxuICAgIG5vTGFzdEl0ZW0gICAgICAgPSBAY2FwdHVyZUxhc3RBdHRlbXB0ZWQgJiYgQGxhc3RBdHRlbXB0ZWQgPT0gMFxuICAgIHRpbWVTdGlsbFJ1bm5pbmcgPSBAdGltZVJ1bmluZyA9PSB0cnVlXG5cbiAgICBpZiB0aW1lckhhc250UnVuXG4gICAgICBtZXNzYWdlcy5wdXNoIEB0ZXh0LnN1YnRlc3ROb3RDb21wbGV0ZVxuXG4gICAgaWYgbm9MYXN0SXRlbSAmJiBub3QgdGltZXJIYXNudFJ1blxuICAgICAgbWVzc2FnZXMucHVzaCBAdGV4dC50b3VjaExhc3RJdGVtXG4gICAgICBAdXBkYXRlTW9kZSBcImxhc3RcIlxuXG4gICAgaWYgdGltZVN0aWxsUnVubmluZ1xuICAgICAgbWVzc2FnZXMucHVzaCBAdGV4dC50aW1lU3RpbGxSdW5uaW5nXG5cbiAgICBVdGlscy5taWRBbGVydCBtZXNzYWdlcy5qb2luKFwiPGJyPlwiKSwgMzAwMCAjIG1hZ2ljIG51bWJlclxuXG4gIGdldFJlc3VsdDogLT5cbiAgICBjb21wbGV0ZVJlc3VsdHMgPSBbXVxuICAgIGl0ZW1SZXN1bHRzID0gW11cbiAgICBAbGFzdEF0dGVtcHRlZCA9IEBpdGVtcy5sZW5ndGggaWYgbm90IEBjYXB0dXJlTGFzdEF0dGVtcHRlZFxuXG4gICAgZm9yIGl0ZW0sIGkgaW4gQGl0ZW1zXG5cbiAgICAgIGlmIEBtYXBJdGVtW2ldIDwgQGxhc3RBdHRlbXB0ZWRcbiAgICAgICAgaXRlbVJlc3VsdHNbaV0gPVxuICAgICAgICAgIGl0ZW1SZXN1bHQgOiBAZ3JpZE91dHB1dFtAbWFwSXRlbVtpXV1cbiAgICAgICAgICBpdGVtTGFiZWwgIDogaXRlbVxuICAgICAgZWxzZVxuICAgICAgICBpdGVtUmVzdWx0c1tpXSA9XG4gICAgICAgICAgaXRlbVJlc3VsdCA6IFwibWlzc2luZ1wiXG4gICAgICAgICAgaXRlbUxhYmVsIDogQGl0ZW1zW0BtYXBJdGVtW2ldXVxuXG4gICAgQGxhc3RBdHRlbXB0ZWQgPSBmYWxzZSBpZiBub3QgQGNhcHR1cmVMYXN0QXR0ZW1wdGVkXG5cbiAgICBpZiBAZGF0YUVudHJ5XG4gICAgICBhdXRvc3RvcHBlZCA9IEAkZWwuZmluZChcIi5kYXRhX2F1dG9zdG9wcGVkXCIpLmlzKFwiOmNoZWNrZWRcIilcbiAgICAgIHRpbWVSZW1haW5pbmcgPSBwYXJzZUludChAJGVsLmZpbmQoXCIuZGF0YV90aW1lX3JlbWFpblwiKS52YWwoKSlcbiAgICBlbHNlXG4gICAgICBhdXRvc3RvcHBlZCAgID0gQGF1dG9zdG9wcGVkXG4gICAgICB0aW1lUmVtYWluaW5nID0gQHRpbWVSZW1haW5pbmdcblxuICAgIHJlc3VsdCA9XG4gICAgICBcImNhcHR1cmVfbGFzdF9hdHRlbXB0ZWRcIiAgICAgOiBAY2FwdHVyZUxhc3RBdHRlbXB0ZWRcbiAgICAgIFwiaXRlbV9hdF90aW1lXCIgICAgICAgICAgICAgICA6IEBpdGVtQXRUaW1lXG4gICAgICBcInRpbWVfaW50ZXJtZWRpYXRlX2NhcHR1cmVkXCIgOiBAdGltZUludGVybWVkaWF0ZUNhcHR1cmVkXG4gICAgICBcImNhcHR1cmVfaXRlbV9hdF90aW1lXCIgICAgICAgOiBAY2FwdHVyZUl0ZW1BdFRpbWVcbiAgICAgIFwiYXV0b19zdG9wXCIgICAgIDogYXV0b3N0b3BwZWRcbiAgICAgIFwiYXR0ZW1wdGVkXCIgICAgIDogQGxhc3RBdHRlbXB0ZWRcbiAgICAgIFwiaXRlbXNcIiAgICAgICAgIDogaXRlbVJlc3VsdHNcbiAgICAgIFwidGltZV9yZW1haW5cIiAgIDogdGltZVJlbWFpbmluZ1xuICAgICAgXCJtYXJrX3JlY29yZFwiICAgOiBAbWFya1JlY29yZFxuICAgICAgXCJ2YXJpYWJsZV9uYW1lXCIgOiBAbW9kZWwuZ2V0KFwidmFyaWFibGVOYW1lXCIpXG4gICAgcmV0dXJuIHJlc3VsdFxuXG4gIGdldFNraXBwZWQ6IC0+XG4gICAgaXRlbVJlc3VsdHMgPSBbXVxuXG4gICAgZm9yIGl0ZW0sIGkgaW4gQGl0ZW1zXG4gICAgICBpdGVtUmVzdWx0c1tpXSA9XG4gICAgICAgIGl0ZW1SZXN1bHQgOiBcInNraXBwZWRcIlxuICAgICAgICBpdGVtTGFiZWwgIDogaXRlbVxuXG4gICAgcmVzdWx0ID1cbiAgICAgIFwiY2FwdHVyZV9sYXN0X2F0dGVtcHRlZFwiICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcIml0ZW1fYXRfdGltZVwiICAgICAgICAgICAgICAgOiBcInNraXBwZWRcIlxuICAgICAgXCJ0aW1lX2ludGVybWVkaWF0ZV9jYXB0dXJlZFwiIDogXCJza2lwcGVkXCJcbiAgICAgIFwiY2FwdHVyZV9pdGVtX2F0X3RpbWVcIiAgICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcImF1dG9fc3RvcFwiICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcImF0dGVtcHRlZFwiICAgICA6IFwic2tpcHBlZFwiXG4gICAgICBcIml0ZW1zXCIgICAgICAgICA6IGl0ZW1SZXN1bHRzXG4gICAgICBcInRpbWVfcmVtYWluXCIgICA6IFwic2tpcHBlZFwiXG4gICAgICBcIm1hcmtfcmVjb3JkXCIgICA6IFwic2tpcHBlZFwiXG4gICAgICBcInZhcmlhYmxlX25hbWVcIiA6IEBtb2RlbC5nZXQoXCJ2YXJpYWJsZU5hbWVcIilcblxuICBvbkNsb3NlOiAtPlxuICAgIGNsZWFySW50ZXJ2YWwoQGludGVydmFsKVxuXG4iXX0=
