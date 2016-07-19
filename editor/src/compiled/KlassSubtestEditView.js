var KlassSubtestEditView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassSubtestEditView = (function(superClass) {
  extend(KlassSubtestEditView, superClass);

  function KlassSubtestEditView() {
    this.toggleAddQuestion = bind(this.toggleAddQuestion, this);
    this.renderQuestions = bind(this.renderQuestions, this);
    this.goBack = bind(this.goBack, this);
    return KlassSubtestEditView.__super__.constructor.apply(this, arguments);
  }

  KlassSubtestEditView.prototype.className = "subtest_edit";

  KlassSubtestEditView.prototype.events = {
    'click .back_button': 'goBack',
    'click .save_subtest': 'save',
    'blur #subtest_items': 'cleanWhitespace',
    'click .add_question': 'toggleAddQuestion',
    'click .add_question_cancel': 'toggleAddQuestion',
    'click .add_question_add': 'addQuestion',
    'keypress #question_name': 'addQuestion'
  };

  KlassSubtestEditView.prototype.cleanWhitespace = function() {
    return this.$el.find("#subtest_items").val(this.$el.find("#subtest_items").val().replace(/\s+/g, ' '));
  };

  KlassSubtestEditView.prototype.initialize = function(options) {
    this.model = options.model;
    this.curriculum = options.curriculum;
    this.prototype = this.model.get("prototype");
    this.prototypeViews = Tangerine.config.get("prototypeViews");
    if (this.prototype === "survey") {
      this.questions = options.questions;
      this.surveyEditor = new window[this.prototypeViews[this.prototype]['edit']]({
        model: this.model,
        parent: this
      });
      this.questions.ensureOrder();
      this.questionsEditView = new QuestionsEditView({
        questions: this.questions
      });
      this.questionsEditView.on("question-edit", (function(_this) {
        return function(questionId) {
          return _this.save(null, {
            questionSave: false,
            success: function() {
              return Tangerine.router.navigate("class/question/" + questionId, true);
            }
          });
        };
      })(this));
      this.questions.on("change", (function(_this) {
        return function() {
          return _this.renderQuestions();
        };
      })(this));
      return this.renderQuestions();
    }
  };

  KlassSubtestEditView.prototype.goBack = function() {
    return Tangerine.router.navigate("curriculum/" + (this.model.get('curriculumId')), true);
  };

  KlassSubtestEditView.prototype.save = function(event, options) {
    var _has, _question, _require, emptyOptions, i, j, len, notSaved, plural, question, ref, ref1, requiresGrid;
    if (options == null) {
      options = {};
    }
    if (this.prototype === "grid") {
      return this.model.save({
        name: this.$el.find("#name").val(),
        part: Math.max(parseInt(this.$el.find("#part").val()), 1),
        reportType: this.$el.find("#report_type").val().toLowerCase(),
        itemType: this.$el.find("#item_type").val().toLowerCase(),
        scoreTarget: parseInt(this.$el.find("#score_target").val()),
        scoreSpread: parseInt(this.$el.find("#score_spread").val()),
        order: parseInt(this.$el.find("#order").val()),
        captureLastAttempted: this.$el.find("#capture_last_attempted input:checked").val() === "true",
        endOfLine: this.$el.find("#end_of_line input:checked").val() === "true",
        randomize: this.$el.find("#randomize input:checked").val() === "true",
        timer: Math.max(parseInt(this.$el.find("#subtest_timer").val()), 0),
        items: _.compact(this.$el.find("#subtest_items").val().split(" ")),
        columns: Math.max(parseInt(this.$el.find("#subtest_columns").val()), 0)
      }, {
        success: (function(_this) {
          return function() {
            return Utils.midAlert("Subtest Saved");
          };
        })(this),
        error: (function(_this) {
          return function() {
            return Utils.midAlert("Save error");
          };
        })(this)
      });
    } else if (this.prototype === "survey") {
      options.questionSave = options.questionSave ? options.questionSave : true;
      notSaved = [];
      emptyOptions = [];
      requiresGrid = [];
      ref = this.questions.models;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        question = ref[i];
        if (question.get("type") !== "open" && ((ref1 = question.get("options")) != null ? ref1.length : void 0) === 0) {
          emptyOptions.push(i + 1);
          if (options.questionSave) {
            if (!question.save()) {
              notSaved.push(i);
            }
            if (question.has("linkedGridScore") && question.get("linkedGridScore") !== "" && question.get("linkedGridScore") !== 0 && this.model.has("gridLinkId") === "" && this.model.get("gridLinkId") === "") {
              requiresGrid.push(i);
            }
          }
        }
      }
      if (notSaved.length !== 0) {
        Utils.midAlert("Error<br><br>Questions: <br>" + (notSaved.join(', ')) + "<br>not saved");
      }
      if (emptyOptions.length !== 0) {
        plural = emptyOptions.length > 1;
        _question = plural ? "Questions" : "Question";
        _has = plural ? "have" : "has";
        alert("Warning\n\n" + _question + " " + (emptyOptions.join(' ,')) + " " + _has + " no options.");
      }
      if (requiresGrid.length !== 0) {
        plural = emptyOptions.length > 1;
        _question = plural ? "Questions" : "Question";
        _require = plural ? "require" : "requires";
        alert("Warning\n\n" + _question + " " + (requiresGrid.join(' ,')) + " " + _require + " a grid to be linked to this test.");
      }
      return this.model.save({
        name: this.$el.find("#name").val(),
        part: Math.max(parseInt(this.$el.find("#part").val()), 1),
        reportType: this.$el.find("#report_type").val().toLowerCase(),
        itemType: this.$el.find("#item_type").val().toLowerCase(),
        scoreTarget: parseInt(this.$el.find("#score_target").val()),
        scoreSpread: parseInt(this.$el.find("#score_spread").val()),
        order: Math.max(parseInt(this.$el.find("#order").val()), 0),
        gridLinkId: this.$el.find("#link_select option:selected").val(),
        autostopLimit: parseInt(this.$el.find("#autostop_limit").val()) || 0
      }, {
        success: (function(_this) {
          return function() {
            if (options.success) {
              return options.success();
            }
            Utils.midAlert("Subtest Saved");
            return setTimeout(_this.goBack, 1000);
          };
        })(this),
        error: function() {
          if (options.error != null) {
            return options.error();
          }
          return Utils.midAlert("Save error");
        }
      });
    }
  };

  KlassSubtestEditView.prototype.renderQuestions = function() {
    var ref, ref1;
    this.$el.find("#question_list_wrapper").empty();
    if ((ref = this.questionsEditView) != null) {
      ref.render();
    }
    return this.$el.find("#question_list_wrapper").append((ref1 = this.questionsEditView) != null ? ref1.el : void 0);
  };

  KlassSubtestEditView.prototype.toggleAddQuestion = function() {
    this.$el.find("#add_question_form, .add_question").fadeToggle(250, (function(_this) {
      return function() {
        if (_this.$el.find("#add_question_form").is(":visible")) {
          return _this.$el.find("#question_prompt").focus();
        }
      };
    })(this));
    return false;
  };

  KlassSubtestEditView.prototype.addQuestion = function(event) {
    var newAttributes, nq;
    if (event.type !== "click" && event.which !== 13) {
      return true;
    }
    newAttributes = $.extend(Tangerine.templates.get("questionTemplate"), {
      subtestId: this.model.id,
      curriculumId: this.curriculum.id,
      id: Utils.guid(),
      order: this.questions.length,
      prompt: this.$el.find('#question_prompt').val(),
      name: this.$el.find('#question_name').val().safetyDance()
    });
    nq = this.questions.create(newAttributes);
    this.$el.find("#add_question_form input").val('');
    this.$el.find("#question_prompt").focus();
    return false;
  };

  KlassSubtestEditView.prototype.render = function() {
    var autostopLimit, captureLastAttempted, columns, curriculumName, endOfLine, gridLinkId, itemType, items, name, order, part, prototypeOptions, randomize, reportType, scoreSpread, scoreTarget, timer;
    curriculumName = this.curriculum.escape("name");
    name = this.model.escape("name");
    part = this.model.getNumber("part");
    reportType = this.model.escape("reportType");
    itemType = this.model.escape("itemType");
    scoreTarget = this.model.getNumber("scoreTarget");
    scoreSpread = this.model.getNumber("scoreSpread");
    order = this.model.getNumber("order");
    if (this.prototype === "grid") {
      endOfLine = this.model.has("endOfLine") ? this.model.get("endOfLine") : true;
      randomize = this.model.has("randomize") ? this.model.get("randomize") : false;
      captureLastAttempted = this.model.has("captureLastAttempted") ? this.model.get("captureLastAttempted") : true;
      items = this.model.get("items").join(" ");
      timer = this.model.get("timer") || 0;
      columns = this.model.get("columns") || 0;
      prototypeOptions = "<div class='label_value'> <label for='subtest_items' title='These items are space delimited. Pasting text from other applications may insert tabs and new lines. Whitespace will be automatically corrected.'>Grid Items</label> <textarea id='subtest_items'>" + items + "</textarea> </div> <label>Randomize items</label><br> <div class='menu_box'> <div id='randomize' class='buttonset'> <label for='randomize_true'>Yes</label><input name='randomize' type='radio' value='true' id='randomize_true' " + (randomize ? 'checked' : void 0) + "> <label for='randomize_false'>No</label><input name='randomize' type='radio' value='false' id='randomize_false' " + (!randomize ? 'checked' : void 0) + "> </div> </div><br> <label>Mark entire line button</label><br> <div class='menu_box'> <div id='end_of_line' class='buttonset'> <label for='end_of_line_true'>Yes</label><input name='end_of_line' type='radio' value='true' id='end_of_line_true' " + (endOfLine ? 'checked' : void 0) + "> <label for='end_of_line_false'>No</label><input name='end_of_line' type='radio' value='false' id='end_of_line_false' " + (!endOfLine ? 'checked' : void 0) + "> </div> </div><br> <label>Capture last item attempted</label><br> <div class='menu_box'> <div id='capture_last_attempted' class='buttonset'> <label for='capture_last_attempted_true'>Yes</label><input name='capture_last_attempted' type='radio' value='true' id='capture_last_attempted_true' " + (captureLastAttempted ? 'checked' : void 0) + "> <label for='capture_last_attempted_false'>No</label><input name='capture_last_attempted' type='radio' value='false' id='capture_last_attempted_false' " + (!captureLastAttempted ? 'checked' : void 0) + "> </div> </div><br> <div class='label_value'> <label for='subtest_columns' title='Number of columns in which to display the grid items.'>Columns</label><br> <input id='subtest_columns' value='" + columns + "' type='number'> </div> <div class='label_value'> <label for='subtest_timer' title='Seconds to give the child to complete the test. Setting this value to 0 will make the test untimed.'>Timer</label><br> <input id='subtest_timer' value='" + timer + "' type='number'> </div>";
    } else if (this.prototype === "survey") {
      gridLinkId = this.model.get("gridLinkId") || "";
      autostopLimit = parseInt(this.model.get("autostopLimit")) || 0;
      this.on("rendered", (function(_this) {
        return function() {
          var subtests;
          _this.renderQuestions();
          subtests = new Subtests;
          return subtests.fetch({
            key: "s" + _this.curriculum.id,
            success: function(collection) {
              var j, len, linkSelect, ref, subtest;
              collection = new Subtests(collection.where({
                prototype: 'grid'
              }));
              collection.sort();
              linkSelect = "<div class='label_value'> <label for='link_select'>Linked to grid</label><br> <div class='menu_box'> <select id='link_select'> <option value=''>None</option>";
              ref = collection.models;
              for (j = 0, len = ref.length; j < len; j++) {
                subtest = ref[j];
                linkSelect += "<option value='" + subtest.id + "' " + (gridLinkId === subtest.id ? 'selected' : '') + ">" + (subtest.get('part')) + " " + (subtest.get('name')) + "</option>";
              }
              linkSelect += "</select></div></div>";
              return _this.$el.find('#grid_link').html(linkSelect);
            }
          });
        };
      })(this));
      prototypeOptions = "<div class='label_value'> <label for='autostop_limit' title='The survey will discontinue after the first N questions have been answered with a &quot;0&quot; value option.'>Autostop after N incorrect</label><br> <input id='autostop_limit' type='number' value='" + autostopLimit + "'> </div> <div id='grid_link'></div> <div id='questions'> <h2>Questions</h2> <div class='menu_box'> <div id='question_list_wrapper'><img class='loading' src='images/loading.gif'></div> <button class='add_question command'>Add Question</button> <div id='add_question_form' class='confirmation'> <div class='menu_box'> <h2>New Question</h2> <label for='question_prompt'>Prompt</label> <input id='question_prompt'> <label for='question_name'>Variable name</label> <input id='question_name' title='Allowed characters: A-Z, a-z, 0-9, and underscores.'><br> <button class='add_question_add command'>Add</button><button class='add_question_cancel command'>Cancel</button> </div> </div> </div> </div>";
    }
    this.$el.html("<button class='back_button navigation'>Back</button><br> <h1>Subtest Editor</h1> <table class='basic_info'> <tr> <th>Curriculum</th> <td>" + curriculumName + "</td> </tr> </table> <button class='save_subtest command'>Done</button> <div class='label_value'> <label for='name'>Name</label> <input id='name' value='" + name + "'> </div> <div class='label_value'> <label for='report_type'>Report Type</label> <input id='report_type' value='" + reportType + "'> </div> <div class='label_value'> <label for='item_type' title='This variable is used for reports. All results from subtests with the same Item Type will show up together. Inconsistent naming will invalidate results.  '>Item Type</label> <input id='item_type' value='" + itemType + "'> </div> <div class='label_value'> <label for='part'>Assessment Number</label><br> <input type='number' id='part' value='" + part + "'> </div> <div class='label_value'> <label for='score_target'>Target score</label><br> <input type='number' id='score_target' value='" + scoreTarget + "'> </div> <div class='label_value'> <label for='score_spread'>Score spread</label><br> <input type='number' id='score_spread' value='" + scoreSpread + "'> </div> <div class='label_value'> <label for='order'>Order</label><br> <input type='number' id='order' value='" + order + "'> </div> " + prototypeOptions + " <button class='save_subtest command'>Done</button>");
    return this.trigger("rendered");
  };

  return KlassSubtestEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvS2xhc3NTdWJ0ZXN0RWRpdFZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsb0JBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7O2lDQUVKLFNBQUEsR0FBVzs7aUNBRVgsTUFBQSxHQUNFO0lBQUEsb0JBQUEsRUFBd0IsUUFBeEI7SUFDQSxxQkFBQSxFQUF3QixNQUR4QjtJQUVBLHFCQUFBLEVBQXdCLGlCQUZ4QjtJQUdBLHFCQUFBLEVBQStCLG1CQUgvQjtJQUlBLDRCQUFBLEVBQStCLG1CQUovQjtJQUtBLHlCQUFBLEVBQStCLGFBTC9CO0lBTUEseUJBQUEsRUFBK0IsYUFOL0I7OztpQ0FTRixlQUFBLEdBQWlCLFNBQUE7V0FDZixJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxnQkFBVixDQUEyQixDQUFDLEdBQTVCLENBQWlDLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdCQUFWLENBQTJCLENBQUMsR0FBNUIsQ0FBQSxDQUFpQyxDQUFDLE9BQWxDLENBQTBDLE1BQTFDLEVBQWtELEdBQWxELENBQWpDO0VBRGU7O2lDQUdqQixVQUFBLEdBQVksU0FBRSxPQUFGO0lBQ1YsSUFBQyxDQUFBLEtBQUQsR0FBYyxPQUFPLENBQUM7SUFDdEIsSUFBQyxDQUFBLFVBQUQsR0FBYyxPQUFPLENBQUM7SUFDdEIsSUFBQyxDQUFBLFNBQUQsR0FBYyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxXQUFYO0lBRWQsSUFBQyxDQUFBLGNBQUQsR0FBbUIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFqQixDQUFxQixnQkFBckI7SUFFbkIsSUFBRyxJQUFDLENBQUEsU0FBRCxLQUFjLFFBQWpCO01BQ0UsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUM7TUFFckIsSUFBQyxDQUFBLFlBQUQsR0FBb0IsSUFBQSxNQUFPLENBQUEsSUFBQyxDQUFBLGNBQWUsQ0FBQSxJQUFDLENBQUEsU0FBRCxDQUFZLENB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SG5DLEdBR2lELHVyQkFqQ2pFOztJQXVETCxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSwySUFBQSxHQU1FLGNBTkYsR0FNaUIsMkpBTmpCLEdBY29CLElBZHBCLEdBY3lCLGtIQWR6QixHQW1CMkIsVUFuQjNCLEdBbUJzQywrUUFuQnRDLEdBd0J5QixRQXhCekIsR0F3QmtDLDRIQXhCbEMsR0E2QmtDLElBN0JsQyxHQTZCdUMsdUlBN0J2QyxHQWtDMEMsV0FsQzFDLEdBa0NzRCx1SUFsQ3RELEdBdUMwQyxXQXZDMUMsR0F1Q3NELGtIQXZDdEQsR0E0Q21DLEtBNUNuQyxHQTRDeUMsWUE1Q3pDLEdBK0NOLGdCQS9DTSxHQStDVyxxREEvQ3JCO1dBb0RBLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVDtFQWhMTTs7OztHQTNLeUIsUUFBUSxDQUFDIiwiZmlsZSI6InN1YnRlc3QvS2xhc3NTdWJ0ZXN0RWRpdFZpZXcuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBLbGFzc1N1YnRlc3RFZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwic3VidGVzdF9lZGl0XCJcblxuICBldmVudHMgOlxuICAgICdjbGljayAuYmFja19idXR0b24nICA6ICdnb0JhY2snXG4gICAgJ2NsaWNrIC5zYXZlX3N1YnRlc3QnIDogJ3NhdmUnXG4gICAgJ2JsdXIgI3N1YnRlc3RfaXRlbXMnIDogJ2NsZWFuV2hpdGVzcGFjZSdcbiAgICAnY2xpY2sgLmFkZF9xdWVzdGlvbicgICAgICAgIDogJ3RvZ2dsZUFkZFF1ZXN0aW9uJ1xuICAgICdjbGljayAuYWRkX3F1ZXN0aW9uX2NhbmNlbCcgOiAndG9nZ2xlQWRkUXVlc3Rpb24nXG4gICAgJ2NsaWNrIC5hZGRfcXVlc3Rpb25fYWRkJyAgICA6ICdhZGRRdWVzdGlvbidcbiAgICAna2V5cHJlc3MgI3F1ZXN0aW9uX25hbWUnICAgIDogJ2FkZFF1ZXN0aW9uJ1xuXG5cbiAgY2xlYW5XaGl0ZXNwYWNlOiAtPlxuICAgIEAkZWwuZmluZChcIiNzdWJ0ZXN0X2l0ZW1zXCIpLnZhbCggQCRlbC5maW5kKFwiI3N1YnRlc3RfaXRlbXNcIikudmFsKCkucmVwbGFjZSgvXFxzKy9nLCAnICcpIClcblxuICBpbml0aWFsaXplOiAoIG9wdGlvbnMgKSAtPlxuICAgIEBtb2RlbCAgICAgID0gb3B0aW9ucy5tb2RlbFxuICAgIEBjdXJyaWN1bHVtID0gb3B0aW9ucy5jdXJyaWN1bHVtXG4gICAgQHByb3RvdHlwZSAgPSBAbW9kZWwuZ2V0KFwicHJvdG90eXBlXCIpXG5cbiAgICBAcHJvdG90eXBlVmlld3MgID0gVGFuZ2VyaW5lLmNvbmZpZy5nZXQgXCJwcm90b3R5cGVWaWV3c1wiXG5cbiAgICBpZiBAcHJvdG90eXBlID09IFwic3VydmV5XCJcbiAgICAgIEBxdWVzdGlvbnMgPSBvcHRpb25zLnF1ZXN0aW9uc1xuXG4gICAgICBAc3VydmV5RWRpdG9yID0gbmV3IHdpbmRvd1tAcHJvdG90eXBlVmlld3NbQHByb3RvdHlwZV1bJ2VkaXQnXV1cbiAgICAgICAgbW9kZWwgIDogQG1vZGVsXG4gICAgICAgIHBhcmVudCA6IEBcblxuICAgICAgQHF1ZXN0aW9ucy5lbnN1cmVPcmRlcigpXG5cbiAgICAgIEBxdWVzdGlvbnNFZGl0VmlldyA9IG5ldyBRdWVzdGlvbnNFZGl0Vmlld1xuICAgICAgICBxdWVzdGlvbnMgOiBAcXVlc3Rpb25zXG4gICAgICBcbiAgICAgIEBxdWVzdGlvbnNFZGl0Vmlldy5vbiBcInF1ZXN0aW9uLWVkaXRcIiwgKHF1ZXN0aW9uSWQpID0+XG4gICAgICAgIEBzYXZlIG51bGwsXG4gICAgICAgICAgcXVlc3Rpb25TYXZlICA6IGZhbHNlXG4gICAgICAgICAgc3VjY2VzcyAgICAgICA6IC0+IFxuICAgICAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImNsYXNzL3F1ZXN0aW9uLyN7cXVlc3Rpb25JZH1cIiwgdHJ1ZVxuXG4gICAgICBAcXVlc3Rpb25zLm9uIFwiY2hhbmdlXCIsID0+IEByZW5kZXJRdWVzdGlvbnMoKVxuICAgICAgQHJlbmRlclF1ZXN0aW9ucygpXG5cbiAgZ29CYWNrOiA9PlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJjdXJyaWN1bHVtLyN7QG1vZGVsLmdldCgnY3VycmljdWx1bUlkJyl9XCIsIHRydWVcblxuICBzYXZlOiAoZXZlbnQsIG9wdGlvbnM9e30pIC0+XG5cblxuICAgICNcbiAgICAjIEdyaWRzXG4gICAgI1xuICAgIGlmIEBwcm90b3R5cGUgPT0gXCJncmlkXCJcbiAgICAgIEBtb2RlbC5zYXZlXG4gICAgICAgIG5hbWUgICAgICAgICAgIDogQCRlbC5maW5kKFwiI25hbWVcIikudmFsKClcbiAgICAgICAgcGFydCAgICAgICAgICAgOiBNYXRoLm1heChwYXJzZUludCggQCRlbC5maW5kKFwiI3BhcnRcIikudmFsKCkgKSwgMSlcbiAgICAgICAgcmVwb3J0VHlwZSAgICAgOiBAJGVsLmZpbmQoXCIjcmVwb3J0X3R5cGVcIikudmFsKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICBpdGVtVHlwZSAgICAgICA6IEAkZWwuZmluZChcIiNpdGVtX3R5cGVcIikudmFsKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICBzY29yZVRhcmdldCAgICA6IHBhcnNlSW50KEAkZWwuZmluZChcIiNzY29yZV90YXJnZXRcIikudmFsKCkpXG4gICAgICAgIHNjb3JlU3ByZWFkICAgIDogcGFyc2VJbnQoQCRlbC5maW5kKFwiI3Njb3JlX3NwcmVhZFwiKS52YWwoKSlcbiAgICAgICAgb3JkZXIgICAgICAgICAgOiBwYXJzZUludChAJGVsLmZpbmQoXCIjb3JkZXJcIikudmFsKCkpXG5cbiAgICAgICAgY2FwdHVyZUxhc3RBdHRlbXB0ZWQ6IEAkZWwuZmluZChcIiNjYXB0dXJlX2xhc3RfYXR0ZW1wdGVkIGlucHV0OmNoZWNrZWRcIikudmFsKCkgPT0gXCJ0cnVlXCJcbiAgICAgICAgZW5kT2ZMaW5lIDogQCRlbC5maW5kKFwiI2VuZF9vZl9saW5lIGlucHV0OmNoZWNrZWRcIikudmFsKCkgPT0gXCJ0cnVlXCJcbiAgICAgICAgcmFuZG9taXplIDogQCRlbC5maW5kKFwiI3JhbmRvbWl6ZSBpbnB1dDpjaGVja2VkXCIpLnZhbCgpID09IFwidHJ1ZVwiXG4gICAgICAgIHRpbWVyICAgICA6IE1hdGgubWF4KHBhcnNlSW50KCBAJGVsLmZpbmQoXCIjc3VidGVzdF90aW1lclwiKS52YWwoKSApLCAwKVxuICAgICAgICBpdGVtcyAgICAgOiBfLmNvbXBhY3QoIEAkZWwuZmluZChcIiNzdWJ0ZXN0X2l0ZW1zXCIpLnZhbCgpLnNwbGl0KFwiIFwiKSApICMgbWlsZCBzYW5pdGl6YXRpb24sIGhhcHBlbnMgYXQgcmVhZCB0b29cbiAgICAgICAgY29sdW1ucyAgIDogTWF0aC5tYXgocGFyc2VJbnQoIEAkZWwuZmluZChcIiNzdWJ0ZXN0X2NvbHVtbnNcIikudmFsKCkgKSwgMClcbiAgICAgICxcbiAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlN1YnRlc3QgU2F2ZWRcIlxuICAgICAgICBlcnJvcjogPT5cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlNhdmUgZXJyb3JcIlxuXG5cbiAgICAjXG4gICAgIyBTdXJ2ZXlzXG4gICAgI1xuXG4gICAgZWxzZSBpZiBAcHJvdG90eXBlID09IFwic3VydmV5XCJcblxuICAgICAgb3B0aW9ucy5xdWVzdGlvblNhdmUgPSBpZiBvcHRpb25zLnF1ZXN0aW9uU2F2ZSB0aGVuIG9wdGlvbnMucXVlc3Rpb25TYXZlIGVsc2UgdHJ1ZVxuXG4gICAgICAjIGJsYW5rIG91dCBvdXIgZXJyb3IgcXVldWVzXG4gICAgICBub3RTYXZlZCA9IFtdXG4gICAgICBlbXB0eU9wdGlvbnMgPSBbXVxuICAgICAgcmVxdWlyZXNHcmlkID0gW11cblxuICAgICAgIyBjaGVjayBmb3IgXCJlcnJvcnNcIlxuICAgICAgZm9yIHF1ZXN0aW9uLCBpIGluIEBxdWVzdGlvbnMubW9kZWxzXG4gICAgICAgIGlmIHF1ZXN0aW9uLmdldChcInR5cGVcIikgIT0gXCJvcGVuXCIgJiYgcXVlc3Rpb24uZ2V0KFwib3B0aW9uc1wiKT8ubGVuZ3RoID09IDBcbiAgICAgICAgICBlbXB0eU9wdGlvbnMucHVzaCBpICsgMVxuICAgICAgICBcbiAgICAgICAgICBpZiBvcHRpb25zLnF1ZXN0aW9uU2F2ZVxuICAgICAgICAgICAgaWYgbm90IHF1ZXN0aW9uLnNhdmUoKVxuICAgICAgICAgICAgICBub3RTYXZlZC5wdXNoIGlcbiAgICAgICAgICAgIGlmIHF1ZXN0aW9uLmhhcyhcImxpbmtlZEdyaWRTY29yZVwiKSAmJiBxdWVzdGlvbi5nZXQoXCJsaW5rZWRHcmlkU2NvcmVcIikgIT0gXCJcIiAmJiBxdWVzdGlvbi5nZXQoXCJsaW5rZWRHcmlkU2NvcmVcIikgIT0gMCAmJiBAbW9kZWwuaGFzKFwiZ3JpZExpbmtJZFwiKSA9PSBcIlwiICYmIEBtb2RlbC5nZXQoXCJncmlkTGlua0lkXCIpID09IFwiXCJcbiAgICAgICAgICAgICAgcmVxdWlyZXNHcmlkLnB1c2ggaVxuICAgICAgICAgIFxuICAgICAgIyBkaXNwbGF5IGVycm9yc1xuICAgICAgaWYgbm90U2F2ZWQubGVuZ3RoICE9IDBcbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJFcnJvcjxicj48YnI+UXVlc3Rpb25zOiA8YnI+I3tub3RTYXZlZC5qb2luKCcsICcpfTxicj5ub3Qgc2F2ZWRcIlxuICAgICAgaWYgZW1wdHlPcHRpb25zLmxlbmd0aCAhPSAwXG4gICAgICAgIHBsdXJhbCA9IGVtcHR5T3B0aW9ucy5sZW5ndGggPiAxXG4gICAgICAgIF9xdWVzdGlvbiA9IGlmIHBsdXJhbCB0aGVuIFwiUXVlc3Rpb25zXCIgZWxzZSBcIlF1ZXN0aW9uXCJcbiAgICAgICAgX2hhcyAgICAgID0gaWYgcGx1cmFsIHRoZW4gXCJoYXZlXCIgZWxzZSBcImhhc1wiXG4gICAgICAgIGFsZXJ0IFwiV2FybmluZ1xcblxcbiN7X3F1ZXN0aW9ufSAje2VtcHR5T3B0aW9ucy5qb2luKCcgLCcpfSAjeyBfaGFzIH0gbm8gb3B0aW9ucy5cIlxuICAgICAgaWYgcmVxdWlyZXNHcmlkLmxlbmd0aCAhPSAwXG4gICAgICAgIHBsdXJhbCA9IGVtcHR5T3B0aW9ucy5sZW5ndGggPiAxXG4gICAgICAgIF9xdWVzdGlvbiA9IGlmIHBsdXJhbCB0aGVuIFwiUXVlc3Rpb25zXCIgZWxzZSBcIlF1ZXN0aW9uXCJcbiAgICAgICAgX3JlcXVpcmUgID0gaWYgcGx1cmFsIHRoZW4gXCJyZXF1aXJlXCIgZWxzZSBcInJlcXVpcmVzXCJcbiAgICAgICAgYWxlcnQgXCJXYXJuaW5nXFxuXFxuI3sgX3F1ZXN0aW9uIH0gI3tyZXF1aXJlc0dyaWQuam9pbignICwnKX0gI3sgX3JlcXVpcmUgfSBhIGdyaWQgdG8gYmUgbGlua2VkIHRvIHRoaXMgdGVzdC5cIlxuXG5cblxuICAgICAgQG1vZGVsLnNhdmVcbiAgICAgICAgbmFtZSAgICAgICAgICAgOiBAJGVsLmZpbmQoXCIjbmFtZVwiKS52YWwoKVxuICAgICAgICBwYXJ0ICAgICAgICAgICA6IE1hdGgubWF4KHBhcnNlSW50KCBAJGVsLmZpbmQoXCIjcGFydFwiKS52YWwoKSApLCAxKVxuICAgICAgICByZXBvcnRUeXBlICAgICA6IEAkZWwuZmluZChcIiNyZXBvcnRfdHlwZVwiKS52YWwoKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGl0ZW1UeXBlICAgICAgIDogQCRlbC5maW5kKFwiI2l0ZW1fdHlwZVwiKS52YWwoKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHNjb3JlVGFyZ2V0ICAgIDogcGFyc2VJbnQoQCRlbC5maW5kKFwiI3Njb3JlX3RhcmdldFwiKS52YWwoKSlcbiAgICAgICAgc2NvcmVTcHJlYWQgICAgOiBwYXJzZUludChAJGVsLmZpbmQoXCIjc2NvcmVfc3ByZWFkXCIpLnZhbCgpKVxuICAgICAgICBvcmRlciAgICAgICAgICA6IE1hdGgubWF4KHBhcnNlSW50KEAkZWwuZmluZChcIiNvcmRlclwiKS52YWwoKSksIDApXG5cbiAgICAgICAgZ3JpZExpbmtJZCAgICAgOiBAJGVsLmZpbmQoXCIjbGlua19zZWxlY3Qgb3B0aW9uOnNlbGVjdGVkXCIpLnZhbCgpXG4gICAgICAgIGF1dG9zdG9wTGltaXQgIDogcGFyc2VJbnQoQCRlbC5maW5kKFwiI2F1dG9zdG9wX2xpbWl0XCIpLnZhbCgpKSB8fCAwXG5cbiAgICAgICxcbiAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAjIHByZWZlciB0aGUgc3VjY2VzcyBjYWxsYmFja1xuICAgICAgICAgIHJldHVybiBvcHRpb25zLnN1Y2Nlc3MoKSBpZiBvcHRpb25zLnN1Y2Nlc3NcbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlN1YnRlc3QgU2F2ZWRcIlxuICAgICAgICAgIHNldFRpbWVvdXQgQGdvQmFjaywgMTAwMFxuXG4gICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgIHJldHVybiBvcHRpb25zLmVycm9yKCkgaWYgb3B0aW9ucy5lcnJvcj9cbiAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlNhdmUgZXJyb3JcIlxuXG4gIHJlbmRlclF1ZXN0aW9uczogPT5cbiAgICBAJGVsLmZpbmQoXCIjcXVlc3Rpb25fbGlzdF93cmFwcGVyXCIpLmVtcHR5KClcbiAgICBAcXVlc3Rpb25zRWRpdFZpZXc/LnJlbmRlcigpXG4gICAgQCRlbC5maW5kKFwiI3F1ZXN0aW9uX2xpc3Rfd3JhcHBlclwiKS5hcHBlbmQgQHF1ZXN0aW9uc0VkaXRWaWV3Py5lbFxuXG4gIHRvZ2dsZUFkZFF1ZXN0aW9uOiA9PlxuICAgIEAkZWwuZmluZChcIiNhZGRfcXVlc3Rpb25fZm9ybSwgLmFkZF9xdWVzdGlvblwiKS5mYWRlVG9nZ2xlIDI1MCwgPT5cbiAgICAgIGlmIEAkZWwuZmluZChcIiNhZGRfcXVlc3Rpb25fZm9ybVwiKS5pcyhcIjp2aXNpYmxlXCIpXG4gICAgICAgIEAkZWwuZmluZChcIiNxdWVzdGlvbl9wcm9tcHRcIikuZm9jdXMoKVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGFkZFF1ZXN0aW9uOiAoZXZlbnQpIC0+XG4gICAgXG4gICAgaWYgZXZlbnQudHlwZSAhPSBcImNsaWNrXCIgJiYgZXZlbnQud2hpY2ggIT0gMTNcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBuZXdBdHRyaWJ1dGVzID0gJC5leHRlbmQgVGFuZ2VyaW5lLnRlbXBsYXRlcy5nZXQoXCJxdWVzdGlvblRlbXBsYXRlXCIpLFxuICAgICAgc3VidGVzdElkICAgIDogQG1vZGVsLmlkXG4gICAgICBjdXJyaWN1bHVtSWQgOiBAY3VycmljdWx1bS5pZFxuICAgICAgaWQgICAgICAgICAgIDogVXRpbHMuZ3VpZCgpXG4gICAgICBvcmRlciAgICAgICAgOiBAcXVlc3Rpb25zLmxlbmd0aFxuICAgICAgcHJvbXB0ICAgICAgIDogQCRlbC5maW5kKCcjcXVlc3Rpb25fcHJvbXB0JykudmFsKClcbiAgICAgIG5hbWUgICAgICAgICA6IEAkZWwuZmluZCgnI3F1ZXN0aW9uX25hbWUnKS52YWwoKS5zYWZldHlEYW5jZSgpXG5cbiAgICBucSA9IEBxdWVzdGlvbnMuY3JlYXRlIG5ld0F0dHJpYnV0ZXNcbiAgICBAJGVsLmZpbmQoXCIjYWRkX3F1ZXN0aW9uX2Zvcm0gaW5wdXRcIikudmFsICcnXG4gICAgQCRlbC5maW5kKFwiI3F1ZXN0aW9uX3Byb21wdFwiKS5mb2N1cygpXG5cbiAgICByZXR1cm4gZmFsc2VcblxuXG4gIHJlbmRlcjogLT5cblxuICAgIGN1cnJpY3VsdW1OYW1lID0gQGN1cnJpY3VsdW0uZXNjYXBlIFwibmFtZVwiXG4gICAgbmFtZSAgICAgICAgICAgPSBAbW9kZWwuZXNjYXBlIFwibmFtZVwiXG4gICAgcGFydCAgICAgICAgICAgPSBAbW9kZWwuZ2V0TnVtYmVyIFwicGFydFwiXG4gICAgcmVwb3J0VHlwZSAgICAgPSBAbW9kZWwuZXNjYXBlIFwicmVwb3J0VHlwZVwiXG4gICAgaXRlbVR5cGUgICAgICAgPSBAbW9kZWwuZXNjYXBlIFwiaXRlbVR5cGVcIlxuXG4gICAgc2NvcmVUYXJnZXQgICAgPSBAbW9kZWwuZ2V0TnVtYmVyIFwic2NvcmVUYXJnZXRcIlxuICAgIHNjb3JlU3ByZWFkICAgID0gQG1vZGVsLmdldE51bWJlciBcInNjb3JlU3ByZWFkXCJcbiAgICBvcmRlciAgICAgICAgICA9IEBtb2RlbC5nZXROdW1iZXIgXCJvcmRlclwiXG5cbiAgICAjXG4gICAgIyBHcmlkc1xuICAgICNcbiAgICBpZiBAcHJvdG90eXBlID09IFwiZ3JpZFwiXG4gICAgICBlbmRPZkxpbmUgICAgPSBpZiBAbW9kZWwuaGFzKFwiZW5kT2ZMaW5lXCIpIHRoZW4gQG1vZGVsLmdldChcImVuZE9mTGluZVwiKSBlbHNlIHRydWVcbiAgICAgIHJhbmRvbWl6ZSAgICA9IGlmIEBtb2RlbC5oYXMoXCJyYW5kb21pemVcIikgdGhlbiBAbW9kZWwuZ2V0KFwicmFuZG9taXplXCIpIGVsc2UgZmFsc2VcbiAgICAgIGNhcHR1cmVMYXN0QXR0ZW1wdGVkID0gaWYgQG1vZGVsLmhhcyhcImNhcHR1cmVMYXN0QXR0ZW1wdGVkXCIpIHRoZW4gQG1vZGVsLmdldChcImNhcHR1cmVMYXN0QXR0ZW1wdGVkXCIpIGVsc2UgdHJ1ZVxuXG4gICAgICBpdGVtcyAgICAgICAgPSBAbW9kZWwuZ2V0KFwiaXRlbXNcIikuam9pbiBcIiBcIlxuICAgICAgdGltZXIgICAgICAgID0gQG1vZGVsLmdldChcInRpbWVyXCIpICAgICAgICB8fCAwXG4gICAgICBjb2x1bW5zICAgICAgPSBAbW9kZWwuZ2V0KFwiY29sdW1uc1wiKSAgICAgIHx8IDBcblxuICAgICAgcHJvdG90eXBlT3B0aW9ucyA9IFwiXG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdzdWJ0ZXN0X2l0ZW1zJyB0aXRsZT0nVGhlc2UgaXRlbXMgYXJlIHNwYWNlIGRlbGltaXRlZC4gUGFzdGluZyB0ZXh0IGZyb20gb3RoZXIgYXBwbGljYXRpb25zIG1heSBpbnNlcnQgdGFicyBhbmQgbmV3IGxpbmVzLiBXaGl0ZXNwYWNlIHdpbGwgYmUgYXV0b21hdGljYWxseSBjb3JyZWN0ZWQuJz5HcmlkIEl0ZW1zPC9sYWJlbD5cbiAgICAgICAgICA8dGV4dGFyZWEgaWQ9J3N1YnRlc3RfaXRlbXMnPiN7aXRlbXN9PC90ZXh0YXJlYT5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGxhYmVsPlJhbmRvbWl6ZSBpdGVtczwvbGFiZWw+PGJyPlxuICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgPGRpdiBpZD0ncmFuZG9taXplJyBjbGFzcz0nYnV0dG9uc2V0Jz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J3JhbmRvbWl6ZV90cnVlJz5ZZXM8L2xhYmVsPjxpbnB1dCBuYW1lPSdyYW5kb21pemUnIHR5cGU9J3JhZGlvJyB2YWx1ZT0ndHJ1ZScgaWQ9J3JhbmRvbWl6ZV90cnVlJyAjeydjaGVja2VkJyBpZiByYW5kb21pemV9PlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0ncmFuZG9taXplX2ZhbHNlJz5ObzwvbGFiZWw+PGlucHV0IG5hbWU9J3JhbmRvbWl6ZScgdHlwZT0ncmFkaW8nIHZhbHVlPSdmYWxzZScgaWQ9J3JhbmRvbWl6ZV9mYWxzZScgI3snY2hlY2tlZCcgaWYgbm90IHJhbmRvbWl6ZX0+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2Pjxicj5cblxuICAgICAgICA8bGFiZWw+TWFyayBlbnRpcmUgbGluZSBidXR0b248L2xhYmVsPjxicj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgIDxkaXYgaWQ9J2VuZF9vZl9saW5lJyBjbGFzcz0nYnV0dG9uc2V0Jz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2VuZF9vZl9saW5lX3RydWUnPlllczwvbGFiZWw+PGlucHV0IG5hbWU9J2VuZF9vZl9saW5lJyB0eXBlPSdyYWRpbycgdmFsdWU9J3RydWUnIGlkPSdlbmRfb2ZfbGluZV90cnVlJyAjeydjaGVja2VkJyBpZiBlbmRPZkxpbmV9PlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nZW5kX29mX2xpbmVfZmFsc2UnPk5vPC9sYWJlbD48aW5wdXQgbmFtZT0nZW5kX29mX2xpbmUnIHR5cGU9J3JhZGlvJyB2YWx1ZT0nZmFsc2UnIGlkPSdlbmRfb2ZfbGluZV9mYWxzZScgI3snY2hlY2tlZCcgaWYgbm90IGVuZE9mTGluZX0+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2Pjxicj5cblxuICAgICAgICA8bGFiZWw+Q2FwdHVyZSBsYXN0IGl0ZW0gYXR0ZW1wdGVkPC9sYWJlbD48YnI+XG4gICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICA8ZGl2IGlkPSdjYXB0dXJlX2xhc3RfYXR0ZW1wdGVkJyBjbGFzcz0nYnV0dG9uc2V0Jz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2NhcHR1cmVfbGFzdF9hdHRlbXB0ZWRfdHJ1ZSc+WWVzPC9sYWJlbD48aW5wdXQgbmFtZT0nY2FwdHVyZV9sYXN0X2F0dGVtcHRlZCcgdHlwZT0ncmFkaW8nIHZhbHVlPSd0cnVlJyBpZD0nY2FwdHVyZV9sYXN0X2F0dGVtcHRlZF90cnVlJyAjeydjaGVja2VkJyBpZiBjYXB0dXJlTGFzdEF0dGVtcHRlZH0+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdjYXB0dXJlX2xhc3RfYXR0ZW1wdGVkX2ZhbHNlJz5ObzwvbGFiZWw+PGlucHV0IG5hbWU9J2NhcHR1cmVfbGFzdF9hdHRlbXB0ZWQnIHR5cGU9J3JhZGlvJyB2YWx1ZT0nZmFsc2UnIGlkPSdjYXB0dXJlX2xhc3RfYXR0ZW1wdGVkX2ZhbHNlJyAjeydjaGVja2VkJyBpZiBub3QgY2FwdHVyZUxhc3RBdHRlbXB0ZWR9PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj48YnI+XG5cbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J3N1YnRlc3RfY29sdW1ucycgdGl0bGU9J051bWJlciBvZiBjb2x1bW5zIGluIHdoaWNoIHRvIGRpc3BsYXkgdGhlIGdyaWQgaXRlbXMuJz5Db2x1bW5zPC9sYWJlbD48YnI+XG4gICAgICAgICAgPGlucHV0IGlkPSdzdWJ0ZXN0X2NvbHVtbnMnIHZhbHVlPScje2NvbHVtbnN9JyB0eXBlPSdudW1iZXInPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nc3VidGVzdF90aW1lcicgdGl0bGU9J1NlY29uZHMgdG8gZ2l2ZSB0aGUgY2hpbGQgdG8gY29tcGxldGUgdGhlIHRlc3QuIFNldHRpbmcgdGhpcyB2YWx1ZSB0byAwIHdpbGwgbWFrZSB0aGUgdGVzdCB1bnRpbWVkLic+VGltZXI8L2xhYmVsPjxicj5cbiAgICAgICAgICA8aW5wdXQgaWQ9J3N1YnRlc3RfdGltZXInIHZhbHVlPScje3RpbWVyfScgdHlwZT0nbnVtYmVyJz5cbiAgICAgICAgPC9kaXY+XG4gICAgICBcIlxuXG4gICAgI1xuICAgICMgU3VydmV5XG4gICAgI1xuXG4gICAgZWxzZSBpZiBAcHJvdG90eXBlID09IFwic3VydmV5XCJcblxuXG4gICAgICBncmlkTGlua0lkID0gQG1vZGVsLmdldChcImdyaWRMaW5rSWRcIikgfHwgXCJcIlxuICAgICAgYXV0b3N0b3BMaW1pdCA9IHBhcnNlSW50KEBtb2RlbC5nZXQoXCJhdXRvc3RvcExpbWl0XCIpKSB8fCAwXG5cbiAgICAgIEBvbiBcInJlbmRlcmVkXCIsID0+XG4gICAgICAgIEByZW5kZXJRdWVzdGlvbnMoKVxuXG4gICAgICAgICMgZ2V0IGxpbmtlZCBncmlkIG9wdGlvbnNcbiAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgc3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICBrZXk6IFwic1wiICsgQGN1cnJpY3VsdW0uaWRcbiAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgPT5cbiAgICAgICAgICAgIGNvbGxlY3Rpb24gPSBuZXcgU3VidGVzdHMgY29sbGVjdGlvbi53aGVyZVxuICAgICAgICAgICAgICBwcm90b3R5cGUgOiAnZ3JpZCcgIyBvbmx5IGdyaWRzIGNhbiBwcm92aWRlIHNjb3Jlc1xuICAgICAgICAgICAgY29sbGVjdGlvbi5zb3J0KClcbiAgICAgICAgICAgIGxpbmtTZWxlY3QgPSBcIlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj0nbGlua19zZWxlY3QnPkxpbmtlZCB0byBncmlkPC9sYWJlbD48YnI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgICAgICAgPHNlbGVjdCBpZD0nbGlua19zZWxlY3QnPlxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nJz5Ob25lPC9vcHRpb24+XCJcbiAgICAgICAgICAgIGZvciBzdWJ0ZXN0IGluIGNvbGxlY3Rpb24ubW9kZWxzXG4gICAgICAgICAgICAgIGxpbmtTZWxlY3QgKz0gXCI8b3B0aW9uIHZhbHVlPScje3N1YnRlc3QuaWR9JyAje2lmIChncmlkTGlua0lkID09IHN1YnRlc3QuaWQpIHRoZW4gJ3NlbGVjdGVkJyBlbHNlICcnfT4je3N1YnRlc3QuZ2V0KCdwYXJ0Jyl9ICN7c3VidGVzdC5nZXQgJ25hbWUnfTwvb3B0aW9uPlwiXG4gICAgICAgICAgICBsaW5rU2VsZWN0ICs9IFwiPC9zZWxlY3Q+PC9kaXY+PC9kaXY+XCJcbiAgICAgICAgICAgIEAkZWwuZmluZCgnI2dyaWRfbGluaycpLmh0bWwgbGlua1NlbGVjdFxuXG5cblxuICAgICAgcHJvdG90eXBlT3B0aW9ucyA9IFwiXG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdhdXRvc3RvcF9saW1pdCcgdGl0bGU9J1RoZSBzdXJ2ZXkgd2lsbCBkaXNjb250aW51ZSBhZnRlciB0aGUgZmlyc3QgTiBxdWVzdGlvbnMgaGF2ZSBiZWVuIGFuc3dlcmVkIHdpdGggYSAmcXVvdDswJnF1b3Q7IHZhbHVlIG9wdGlvbi4nPkF1dG9zdG9wIGFmdGVyIE4gaW5jb3JyZWN0PC9sYWJlbD48YnI+XG4gICAgICAgICAgPGlucHV0IGlkPSdhdXRvc3RvcF9saW1pdCcgdHlwZT0nbnVtYmVyJyB2YWx1ZT0nI3thdXRvc3RvcExpbWl0fSc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGlkPSdncmlkX2xpbmsnPjwvZGl2PlxuICAgICAgICA8ZGl2IGlkPSdxdWVzdGlvbnMnPlxuICAgICAgICAgIDxoMj5RdWVzdGlvbnM8L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICAgIDxkaXYgaWQ9J3F1ZXN0aW9uX2xpc3Rfd3JhcHBlcic+PGltZyBjbGFzcz0nbG9hZGluZycgc3JjPSdpbWFnZXMvbG9hZGluZy5naWYnPjwvZGl2PlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0nYWRkX3F1ZXN0aW9uIGNvbW1hbmQnPkFkZCBRdWVzdGlvbjwvYnV0dG9uPlxuICAgICAgICAgICAgPGRpdiBpZD0nYWRkX3F1ZXN0aW9uX2Zvcm0nIGNsYXNzPSdjb25maXJtYXRpb24nPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgICAgICAgPGgyPk5ldyBRdWVzdGlvbjwvaDI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGZvcj0ncXVlc3Rpb25fcHJvbXB0Jz5Qcm9tcHQ8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBpZD0ncXVlc3Rpb25fcHJvbXB0Jz5cbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPSdxdWVzdGlvbl9uYW1lJz5WYXJpYWJsZSBuYW1lPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9J3F1ZXN0aW9uX25hbWUnIHRpdGxlPSdBbGxvd2VkIGNoYXJhY3RlcnM6IEEtWiwgYS16LCAwLTksIGFuZCB1bmRlcnNjb3Jlcy4nPjxicj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdhZGRfcXVlc3Rpb25fYWRkIGNvbW1hbmQnPkFkZDwvYnV0dG9uPjxidXR0b24gY2xhc3M9J2FkZF9xdWVzdGlvbl9jYW5jZWwgY29tbWFuZCc+Q2FuY2VsPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+IFxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIFwiXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDxidXR0b24gY2xhc3M9J2JhY2tfYnV0dG9uIG5hdmlnYXRpb24nPkJhY2s8L2J1dHRvbj48YnI+XG4gICAgICA8aDE+U3VidGVzdCBFZGl0b3I8L2gxPlxuICAgICAgPHRhYmxlIGNsYXNzPSdiYXNpY19pbmZvJz5cbiAgICAgICAgPHRyPlxuICAgICAgICAgIDx0aD5DdXJyaWN1bHVtPC90aD5cbiAgICAgICAgICA8dGQ+I3tjdXJyaWN1bHVtTmFtZX08L3RkPlxuICAgICAgICA8L3RyPlxuICAgICAgPC90YWJsZT5cblxuICAgICAgPGJ1dHRvbiBjbGFzcz0nc2F2ZV9zdWJ0ZXN0IGNvbW1hbmQnPkRvbmU8L2J1dHRvbj5cblxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSduYW1lJz5OYW1lPC9sYWJlbD5cbiAgICAgICAgPGlucHV0IGlkPSduYW1lJyB2YWx1ZT0nI3tuYW1lfSc+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdyZXBvcnRfdHlwZSc+UmVwb3J0IFR5cGU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J3JlcG9ydF90eXBlJyB2YWx1ZT0nI3tyZXBvcnRUeXBlfSc+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdpdGVtX3R5cGUnIHRpdGxlPSdUaGlzIHZhcmlhYmxlIGlzIHVzZWQgZm9yIHJlcG9ydHMuIEFsbCByZXN1bHRzIGZyb20gc3VidGVzdHMgd2l0aCB0aGUgc2FtZSBJdGVtIFR5cGUgd2lsbCBzaG93IHVwIHRvZ2V0aGVyLiBJbmNvbnNpc3RlbnQgbmFtaW5nIHdpbGwgaW52YWxpZGF0ZSByZXN1bHRzLiAgJz5JdGVtIFR5cGU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J2l0ZW1fdHlwZScgdmFsdWU9JyN7aXRlbVR5cGV9Jz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J3BhcnQnPkFzc2Vzc21lbnQgTnVtYmVyPC9sYWJlbD48YnI+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdudW1iZXInIGlkPSdwYXJ0JyB2YWx1ZT0nI3twYXJ0fSc+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdzY29yZV90YXJnZXQnPlRhcmdldCBzY29yZTwvbGFiZWw+PGJyPlxuICAgICAgICA8aW5wdXQgdHlwZT0nbnVtYmVyJyBpZD0nc2NvcmVfdGFyZ2V0JyB2YWx1ZT0nI3tzY29yZVRhcmdldH0nPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nc2NvcmVfc3ByZWFkJz5TY29yZSBzcHJlYWQ8L2xhYmVsPjxicj5cbiAgICAgICAgPGlucHV0IHR5cGU9J251bWJlcicgaWQ9J3Njb3JlX3NwcmVhZCcgdmFsdWU9JyN7c2NvcmVTcHJlYWR9Jz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J29yZGVyJz5PcmRlcjwvbGFiZWw+PGJyPlxuICAgICAgICA8aW5wdXQgdHlwZT0nbnVtYmVyJyBpZD0nb3JkZXInIHZhbHVlPScje29yZGVyfSc+XG4gICAgICA8L2Rpdj5cblxuICAgICAgI3twcm90b3R5cGVPcHRpb25zfVxuXG4gICAgICA8YnV0dG9uIGNsYXNzPSdzYXZlX3N1YnRlc3QgY29tbWFuZCc+RG9uZTwvYnV0dG9uPlxuICAgICAgXCJcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG4iXX0=
