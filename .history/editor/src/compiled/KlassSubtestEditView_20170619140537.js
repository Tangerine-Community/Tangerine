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
            key: _this.curriculum.id,
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VidGVzdC9LbGFzc1N1YnRlc3RFZGl0Vmlldy5qcyIsInNvdXJjZXMiOlsic3VidGVzdC9LbGFzc1N1YnRlc3RFZGl0Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxvQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7Ozs7aUNBRUosU0FBQSxHQUFXOztpQ0FFWCxNQUFBLEdBQ0U7SUFBQSxvQkFBQSxFQUF3QixRQUF4QjtJQUNBLHFCQUFBLEVBQXdCLE1BRHhCO0lBRUEscUJBQUEsRUFBd0IsaUJBRnhCO0lBR0EscUJBQUEsRUFBK0IsbUJBSC9CO0lBSUEsNEJBQUEsRUFBK0IsbUJBSi9CO0lBS0EseUJBQUEsRUFBK0IsYUFML0I7SUFNQSx5QkFBQSxFQUErQixhQU4vQjs7O2lDQVNGLGVBQUEsR0FBaUIsU0FBQTtXQUNmLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLGdCQUFWLENBQTJCLENBQUMsR0FBNUIsQ0FBaUMsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsZ0JBQVYsQ0FBMkIsQ0FBQyxHQUE1QixDQUFBLENBQWlDLENBQUMsT0FBbEMsQ0FBMEMsTUFBMUMsRUFBa0QsR0FBbEQsQ0FBakM7RUFEZTs7aUNBR2pCLFVBQUEsR0FBWSxTQUFFLE9BQUY7SUFDVixJQUFDLENBQUEsS0FBRCxHQUFjLE9BQU8sQ0FBQztJQUN0QixJQUFDLENBQUEsVUFBRCxHQUFjLE9BQU8sQ0FBQztJQUN0QixJQUFDLENBQUEsU0FBRCxHQUFjLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVg7SUFFZCxJQUFDLENBQUEsY0FBRCxHQUFtQixTQUFTLENBQUMsTUFBTSxDQUFDLEdBQWpCLENBQXFCLGdCQUFyQjtJQUVuQixJQUFHLElBQUMsQ0FBQSxTQUFELEtBQWMsUUFBakI7TUFDRSxJQUFDLENBQUEsU0FBRCxHQUFhLE9BQU8sQ0FBQztNQUVyQixJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFJLE1BQU8sQ0FBQSxJ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QUFoQjtNQXdCQSxnQkFBQSxHQUFtQixxUUFBQSxHQUdtQyxhQUhuQyxHQUdpRCx1ckJBakNqRTs7SUF1REwsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsMklBQUEsR0FNRSxjQU5GLEdBTWlCLDJKQU5qQixHQWNvQixJQWRwQixHQWN5QixrSEFkekIsR0FtQjJCLFVBbkIzQixHQW1Cc0MsK1FBbkJ0QyxHQXdCeUIsUUF4QnpCLEdBd0JrQyw0SEF4QmxDLEdBNkJrQyxJQTdCbEMsR0E2QnVDLHVJQTdCdkMsR0FrQzBDLFdBbEMxQyxHQWtDc0QsdUlBbEN0RCxHQXVDMEMsV0F2QzFDLEdBdUNzRCxrSEF2Q3RELEdBNENtQyxLQTVDbkMsR0E0Q3lDLFlBNUN6QyxHQStDTixnQkEvQ00sR0ErQ1cscURBL0NyQjtXQW9EQSxJQUFDLENBQUEsT0FBRCxDQUFTLFVBQVQ7RUFoTE07Ozs7R0EzS3lCLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEtsYXNzU3VidGVzdEVkaXRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZTogXCJzdWJ0ZXN0X2VkaXRcIlxuXG4gIGV2ZW50cyA6XG4gICAgJ2NsaWNrIC5iYWNrX2J1dHRvbicgIDogJ2dvQmFjaydcbiAgICAnY2xpY2sgLnNhdmVfc3VidGVzdCcgOiAnc2F2ZSdcbiAgICAnYmx1ciAjc3VidGVzdF9pdGVtcycgOiAnY2xlYW5XaGl0ZXNwYWNlJ1xuICAgICdjbGljayAuYWRkX3F1ZXN0aW9uJyAgICAgICAgOiAndG9nZ2xlQWRkUXVlc3Rpb24nXG4gICAgJ2NsaWNrIC5hZGRfcXVlc3Rpb25fY2FuY2VsJyA6ICd0b2dnbGVBZGRRdWVzdGlvbidcbiAgICAnY2xpY2sgLmFkZF9xdWVzdGlvbl9hZGQnICAgIDogJ2FkZFF1ZXN0aW9uJ1xuICAgICdrZXlwcmVzcyAjcXVlc3Rpb25fbmFtZScgICAgOiAnYWRkUXVlc3Rpb24nXG5cblxuICBjbGVhbldoaXRlc3BhY2U6IC0+XG4gICAgQCRlbC5maW5kKFwiI3N1YnRlc3RfaXRlbXNcIikudmFsKCBAJGVsLmZpbmQoXCIjc3VidGVzdF9pdGVtc1wiKS52YWwoKS5yZXBsYWNlKC9cXHMrL2csICcgJykgKVxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG4gICAgQG1vZGVsICAgICAgPSBvcHRpb25zLm1vZGVsXG4gICAgQGN1cnJpY3VsdW0gPSBvcHRpb25zLmN1cnJpY3VsdW1cbiAgICBAcHJvdG90eXBlICA9IEBtb2RlbC5nZXQoXCJwcm90b3R5cGVcIilcblxuICAgIEBwcm90b3R5cGVWaWV3cyAgPSBUYW5nZXJpbmUuY29uZmlnLmdldCBcInByb3RvdHlwZVZpZXdzXCJcblxuICAgIGlmIEBwcm90b3R5cGUgPT0gXCJzdXJ2ZXlcIlxuICAgICAgQHF1ZXN0aW9ucyA9IG9wdGlvbnMucXVlc3Rpb25zXG5cbiAgICAgIEBzdXJ2ZXlFZGl0b3IgPSBuZXcgd2luZG93W0Bwcm90b3R5cGVWaWV3c1tAcHJvdG90eXBlXVsnZWRpdCddXVxuICAgICAgICBtb2RlbCAgOiBAbW9kZWxcbiAgICAgICAgcGFyZW50IDogQFxuXG4gICAgICBAcXVlc3Rpb25zLmVuc3VyZU9yZGVyKClcblxuICAgICAgQHF1ZXN0aW9uc0VkaXRWaWV3ID0gbmV3IFF1ZXN0aW9uc0VkaXRWaWV3XG4gICAgICAgIHF1ZXN0aW9ucyA6IEBxdWVzdGlvbnNcbiAgICAgIFxuICAgICAgQHF1ZXN0aW9uc0VkaXRWaWV3Lm9uIFwicXVlc3Rpb24tZWRpdFwiLCAocXVlc3Rpb25JZCkgPT5cbiAgICAgICAgQHNhdmUgbnVsbCxcbiAgICAgICAgICBxdWVzdGlvblNhdmUgIDogZmFsc2VcbiAgICAgICAgICBzdWNjZXNzICAgICAgIDogLT4gXG4gICAgICAgICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiY2xhc3MvcXVlc3Rpb24vI3txdWVzdGlvbklkfVwiLCB0cnVlXG5cbiAgICAgIEBxdWVzdGlvbnMub24gXCJjaGFuZ2VcIiwgPT4gQHJlbmRlclF1ZXN0aW9ucygpXG4gICAgICBAcmVuZGVyUXVlc3Rpb25zKClcblxuICBnb0JhY2s6ID0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImN1cnJpY3VsdW0vI3tAbW9kZWwuZ2V0KCdjdXJyaWN1bHVtSWQnKX1cIiwgdHJ1ZVxuXG4gIHNhdmU6IChldmVudCwgb3B0aW9ucz17fSkgLT5cblxuXG4gICAgI1xuICAgICMgR3JpZHNcbiAgICAjXG4gICAgaWYgQHByb3RvdHlwZSA9PSBcImdyaWRcIlxuICAgICAgQG1vZGVsLnNhdmVcbiAgICAgICAgbmFtZSAgICAgICAgICAgOiBAJGVsLmZpbmQoXCIjbmFtZVwiKS52YWwoKVxuICAgICAgICBwYXJ0ICAgICAgICAgICA6IE1hdGgubWF4KHBhcnNlSW50KCBAJGVsLmZpbmQoXCIjcGFydFwiKS52YWwoKSApLCAxKVxuICAgICAgICByZXBvcnRUeXBlICAgICA6IEAkZWwuZmluZChcIiNyZXBvcnRfdHlwZVwiKS52YWwoKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGl0ZW1UeXBlICAgICAgIDogQCRlbC5maW5kKFwiI2l0ZW1fdHlwZVwiKS52YWwoKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIHNjb3JlVGFyZ2V0ICAgIDogcGFyc2VJbnQoQCRlbC5maW5kKFwiI3Njb3JlX3RhcmdldFwiKS52YWwoKSlcbiAgICAgICAgc2NvcmVTcHJlYWQgICAgOiBwYXJzZUludChAJGVsLmZpbmQoXCIjc2NvcmVfc3ByZWFkXCIpLnZhbCgpKVxuICAgICAgICBvcmRlciAgICAgICAgICA6IHBhcnNlSW50KEAkZWwuZmluZChcIiNvcmRlclwiKS52YWwoKSlcblxuICAgICAgICBjYXB0dXJlTGFzdEF0dGVtcHRlZDogQCRlbC5maW5kKFwiI2NhcHR1cmVfbGFzdF9hdHRlbXB0ZWQgaW5wdXQ6Y2hlY2tlZFwiKS52YWwoKSA9PSBcInRydWVcIlxuICAgICAgICBlbmRPZkxpbmUgOiBAJGVsLmZpbmQoXCIjZW5kX29mX2xpbmUgaW5wdXQ6Y2hlY2tlZFwiKS52YWwoKSA9PSBcInRydWVcIlxuICAgICAgICByYW5kb21pemUgOiBAJGVsLmZpbmQoXCIjcmFuZG9taXplIGlucHV0OmNoZWNrZWRcIikudmFsKCkgPT0gXCJ0cnVlXCJcbiAgICAgICAgdGltZXIgICAgIDogTWF0aC5tYXgocGFyc2VJbnQoIEAkZWwuZmluZChcIiNzdWJ0ZXN0X3RpbWVyXCIpLnZhbCgpICksIDApXG4gICAgICAgIGl0ZW1zICAgICA6IF8uY29tcGFjdCggQCRlbC5maW5kKFwiI3N1YnRlc3RfaXRlbXNcIikudmFsKCkuc3BsaXQoXCIgXCIpICkgIyBtaWxkIHNhbml0aXphdGlvbiwgaGFwcGVucyBhdCByZWFkIHRvb1xuICAgICAgICBjb2x1bW5zICAgOiBNYXRoLm1heChwYXJzZUludCggQCRlbC5maW5kKFwiI3N1YnRlc3RfY29sdW1uc1wiKS52YWwoKSApLCAwKVxuICAgICAgLFxuICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU3VidGVzdCBTYXZlZFwiXG4gICAgICAgIGVycm9yOiA9PlxuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU2F2ZSBlcnJvclwiXG5cblxuICAgICNcbiAgICAjIFN1cnZleXNcbiAgICAjXG5cbiAgICBlbHNlIGlmIEBwcm90b3R5cGUgPT0gXCJzdXJ2ZXlcIlxuXG4gICAgICBvcHRpb25zLnF1ZXN0aW9uU2F2ZSA9IGlmIG9wdGlvbnMucXVlc3Rpb25TYXZlIHRoZW4gb3B0aW9ucy5xdWVzdGlvblNhdmUgZWxzZSB0cnVlXG5cbiAgICAgICMgYmxhbmsgb3V0IG91ciBlcnJvciBxdWV1ZXNcbiAgICAgIG5vdFNhdmVkID0gW11cbiAgICAgIGVtcHR5T3B0aW9ucyA9IFtdXG4gICAgICByZXF1aXJlc0dyaWQgPSBbXVxuXG4gICAgICAjIGNoZWNrIGZvciBcImVycm9yc1wiXG4gICAgICBmb3IgcXVlc3Rpb24sIGkgaW4gQHF1ZXN0aW9ucy5tb2RlbHNcbiAgICAgICAgaWYgcXVlc3Rpb24uZ2V0KFwidHlwZVwiKSAhPSBcIm9wZW5cIiAmJiBxdWVzdGlvbi5nZXQoXCJvcHRpb25zXCIpPy5sZW5ndGggPT0gMFxuICAgICAgICAgIGVtcHR5T3B0aW9ucy5wdXNoIGkgKyAxXG4gICAgICAgIFxuICAgICAgICAgIGlmIG9wdGlvbnMucXVlc3Rpb25TYXZlXG4gICAgICAgICAgICBpZiBub3QgcXVlc3Rpb24uc2F2ZSgpXG4gICAgICAgICAgICAgIG5vdFNhdmVkLnB1c2ggaVxuICAgICAgICAgICAgaWYgcXVlc3Rpb24uaGFzKFwibGlua2VkR3JpZFNjb3JlXCIpICYmIHF1ZXN0aW9uLmdldChcImxpbmtlZEdyaWRTY29yZVwiKSAhPSBcIlwiICYmIHF1ZXN0aW9uLmdldChcImxpbmtlZEdyaWRTY29yZVwiKSAhPSAwICYmIEBtb2RlbC5oYXMoXCJncmlkTGlua0lkXCIpID09IFwiXCIgJiYgQG1vZGVsLmdldChcImdyaWRMaW5rSWRcIikgPT0gXCJcIlxuICAgICAgICAgICAgICByZXF1aXJlc0dyaWQucHVzaCBpXG4gICAgICAgICAgXG4gICAgICAjIGRpc3BsYXkgZXJyb3JzXG4gICAgICBpZiBub3RTYXZlZC5sZW5ndGggIT0gMFxuICAgICAgICBVdGlscy5taWRBbGVydCBcIkVycm9yPGJyPjxicj5RdWVzdGlvbnM6IDxicj4je25vdFNhdmVkLmpvaW4oJywgJyl9PGJyPm5vdCBzYXZlZFwiXG4gICAgICBpZiBlbXB0eU9wdGlvbnMubGVuZ3RoICE9IDBcbiAgICAgICAgcGx1cmFsID0gZW1wdHlPcHRpb25zLmxlbmd0aCA+IDFcbiAgICAgICAgX3F1ZXN0aW9uID0gaWYgcGx1cmFsIHRoZW4gXCJRdWVzdGlvbnNcIiBlbHNlIFwiUXVlc3Rpb25cIlxuICAgICAgICBfaGFzICAgICAgPSBpZiBwbHVyYWwgdGhlbiBcImhhdmVcIiBlbHNlIFwiaGFzXCJcbiAgICAgICAgYWxlcnQgXCJXYXJuaW5nXFxuXFxuI3tfcXVlc3Rpb259ICN7ZW1wdHlPcHRpb25zLmpvaW4oJyAsJyl9ICN7IF9oYXMgfSBubyBvcHRpb25zLlwiXG4gICAgICBpZiByZXF1aXJlc0dyaWQubGVuZ3RoICE9IDBcbiAgICAgICAgcGx1cmFsID0gZW1wdHlPcHRpb25zLmxlbmd0aCA+IDFcbiAgICAgICAgX3F1ZXN0aW9uID0gaWYgcGx1cmFsIHRoZW4gXCJRdWVzdGlvbnNcIiBlbHNlIFwiUXVlc3Rpb25cIlxuICAgICAgICBfcmVxdWlyZSAgPSBpZiBwbHVyYWwgdGhlbiBcInJlcXVpcmVcIiBlbHNlIFwicmVxdWlyZXNcIlxuICAgICAgICBhbGVydCBcIldhcm5pbmdcXG5cXG4jeyBfcXVlc3Rpb24gfSAje3JlcXVpcmVzR3JpZC5qb2luKCcgLCcpfSAjeyBfcmVxdWlyZSB9IGEgZ3JpZCB0byBiZSBsaW5rZWQgdG8gdGhpcyB0ZXN0LlwiXG5cblxuXG4gICAgICBAbW9kZWwuc2F2ZVxuICAgICAgICBuYW1lICAgICAgICAgICA6IEAkZWwuZmluZChcIiNuYW1lXCIpLnZhbCgpXG4gICAgICAgIHBhcnQgICAgICAgICAgIDogTWF0aC5tYXgocGFyc2VJbnQoIEAkZWwuZmluZChcIiNwYXJ0XCIpLnZhbCgpICksIDEpXG4gICAgICAgIHJlcG9ydFR5cGUgICAgIDogQCRlbC5maW5kKFwiI3JlcG9ydF90eXBlXCIpLnZhbCgpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgaXRlbVR5cGUgICAgICAgOiBAJGVsLmZpbmQoXCIjaXRlbV90eXBlXCIpLnZhbCgpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgc2NvcmVUYXJnZXQgICAgOiBwYXJzZUludChAJGVsLmZpbmQoXCIjc2NvcmVfdGFyZ2V0XCIpLnZhbCgpKVxuICAgICAgICBzY29yZVNwcmVhZCAgICA6IHBhcnNlSW50KEAkZWwuZmluZChcIiNzY29yZV9zcHJlYWRcIikudmFsKCkpXG4gICAgICAgIG9yZGVyICAgICAgICAgIDogTWF0aC5tYXgocGFyc2VJbnQoQCRlbC5maW5kKFwiI29yZGVyXCIpLnZhbCgpKSwgMClcblxuICAgICAgICBncmlkTGlua0lkICAgICA6IEAkZWwuZmluZChcIiNsaW5rX3NlbGVjdCBvcHRpb246c2VsZWN0ZWRcIikudmFsKClcbiAgICAgICAgYXV0b3N0b3BMaW1pdCAgOiBwYXJzZUludChAJGVsLmZpbmQoXCIjYXV0b3N0b3BfbGltaXRcIikudmFsKCkpIHx8IDBcblxuICAgICAgLFxuICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICMgcHJlZmVyIHRoZSBzdWNjZXNzIGNhbGxiYWNrXG4gICAgICAgICAgcmV0dXJuIG9wdGlvbnMuc3VjY2VzcygpIGlmIG9wdGlvbnMuc3VjY2Vzc1xuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU3VidGVzdCBTYXZlZFwiXG4gICAgICAgICAgc2V0VGltZW91dCBAZ29CYWNrLCAxMDAwXG5cbiAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZXJyb3IoKSBpZiBvcHRpb25zLmVycm9yP1xuICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiU2F2ZSBlcnJvclwiXG5cbiAgcmVuZGVyUXVlc3Rpb25zOiA9PlxuICAgIEAkZWwuZmluZChcIiNxdWVzdGlvbl9saXN0X3dyYXBwZXJcIikuZW1wdHkoKVxuICAgIEBxdWVzdGlvbnNFZGl0Vmlldz8ucmVuZGVyKClcbiAgICBAJGVsLmZpbmQoXCIjcXVlc3Rpb25fbGlzdF93cmFwcGVyXCIpLmFwcGVuZCBAcXVlc3Rpb25zRWRpdFZpZXc/LmVsXG5cbiAgdG9nZ2xlQWRkUXVlc3Rpb246ID0+XG4gICAgQCRlbC5maW5kKFwiI2FkZF9xdWVzdGlvbl9mb3JtLCAuYWRkX3F1ZXN0aW9uXCIpLmZhZGVUb2dnbGUgMjUwLCA9PlxuICAgICAgaWYgQCRlbC5maW5kKFwiI2FkZF9xdWVzdGlvbl9mb3JtXCIpLmlzKFwiOnZpc2libGVcIilcbiAgICAgICAgQCRlbC5maW5kKFwiI3F1ZXN0aW9uX3Byb21wdFwiKS5mb2N1cygpXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgYWRkUXVlc3Rpb246IChldmVudCkgLT5cbiAgICBcbiAgICBpZiBldmVudC50eXBlICE9IFwiY2xpY2tcIiAmJiBldmVudC53aGljaCAhPSAxM1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgIG5ld0F0dHJpYnV0ZXMgPSAkLmV4dGVuZCBUYW5nZXJpbmUudGVtcGxhdGVzLmdldChcInF1ZXN0aW9uVGVtcGxhdGVcIiksXG4gICAgICBzdWJ0ZXN0SWQgICAgOiBAbW9kZWwuaWRcbiAgICAgIGN1cnJpY3VsdW1JZCA6IEBjdXJyaWN1bHVtLmlkXG4gICAgICBpZCAgICAgICAgICAgOiBVdGlscy5ndWlkKClcbiAgICAgIG9yZGVyICAgICAgICA6IEBxdWVzdGlvbnMubGVuZ3RoXG4gICAgICBwcm9tcHQgICAgICAgOiBAJGVsLmZpbmQoJyNxdWVzdGlvbl9wcm9tcHQnKS52YWwoKVxuICAgICAgbmFtZSAgICAgICAgIDogQCRlbC5maW5kKCcjcXVlc3Rpb25fbmFtZScpLnZhbCgpLnNhZmV0eURhbmNlKClcblxuICAgIG5xID0gQHF1ZXN0aW9ucy5jcmVhdGUgbmV3QXR0cmlidXRlc1xuICAgIEAkZWwuZmluZChcIiNhZGRfcXVlc3Rpb25fZm9ybSBpbnB1dFwiKS52YWwgJydcbiAgICBAJGVsLmZpbmQoXCIjcXVlc3Rpb25fcHJvbXB0XCIpLmZvY3VzKClcblxuICAgIHJldHVybiBmYWxzZVxuXG5cbiAgcmVuZGVyOiAtPlxuXG4gICAgY3VycmljdWx1bU5hbWUgPSBAY3VycmljdWx1bS5lc2NhcGUgXCJuYW1lXCJcbiAgICBuYW1lICAgICAgICAgICA9IEBtb2RlbC5lc2NhcGUgXCJuYW1lXCJcbiAgICBwYXJ0ICAgICAgICAgICA9IEBtb2RlbC5nZXROdW1iZXIgXCJwYXJ0XCJcbiAgICByZXBvcnRUeXBlICAgICA9IEBtb2RlbC5lc2NhcGUgXCJyZXBvcnRUeXBlXCJcbiAgICBpdGVtVHlwZSAgICAgICA9IEBtb2RlbC5lc2NhcGUgXCJpdGVtVHlwZVwiXG5cbiAgICBzY29yZVRhcmdldCAgICA9IEBtb2RlbC5nZXROdW1iZXIgXCJzY29yZVRhcmdldFwiXG4gICAgc2NvcmVTcHJlYWQgICAgPSBAbW9kZWwuZ2V0TnVtYmVyIFwic2NvcmVTcHJlYWRcIlxuICAgIG9yZGVyICAgICAgICAgID0gQG1vZGVsLmdldE51bWJlciBcIm9yZGVyXCJcblxuICAgICNcbiAgICAjIEdyaWRzXG4gICAgI1xuICAgIGlmIEBwcm90b3R5cGUgPT0gXCJncmlkXCJcbiAgICAgIGVuZE9mTGluZSAgICA9IGlmIEBtb2RlbC5oYXMoXCJlbmRPZkxpbmVcIikgdGhlbiBAbW9kZWwuZ2V0KFwiZW5kT2ZMaW5lXCIpIGVsc2UgdHJ1ZVxuICAgICAgcmFuZG9taXplICAgID0gaWYgQG1vZGVsLmhhcyhcInJhbmRvbWl6ZVwiKSB0aGVuIEBtb2RlbC5nZXQoXCJyYW5kb21pemVcIikgZWxzZSBmYWxzZVxuICAgICAgY2FwdHVyZUxhc3RBdHRlbXB0ZWQgPSBpZiBAbW9kZWwuaGFzKFwiY2FwdHVyZUxhc3RBdHRlbXB0ZWRcIikgdGhlbiBAbW9kZWwuZ2V0KFwiY2FwdHVyZUxhc3RBdHRlbXB0ZWRcIikgZWxzZSB0cnVlXG5cbiAgICAgIGl0ZW1zICAgICAgICA9IEBtb2RlbC5nZXQoXCJpdGVtc1wiKS5qb2luIFwiIFwiXG4gICAgICB0aW1lciAgICAgICAgPSBAbW9kZWwuZ2V0KFwidGltZXJcIikgICAgICAgIHx8IDBcbiAgICAgIGNvbHVtbnMgICAgICA9IEBtb2RlbC5nZXQoXCJjb2x1bW5zXCIpICAgICAgfHwgMFxuXG4gICAgICBwcm90b3R5cGVPcHRpb25zID0gXCJcbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J3N1YnRlc3RfaXRlbXMnIHRpdGxlPSdUaGVzZSBpdGVtcyBhcmUgc3BhY2UgZGVsaW1pdGVkLiBQYXN0aW5nIHRleHQgZnJvbSBvdGhlciBhcHBsaWNhdGlvbnMgbWF5IGluc2VydCB0YWJzIGFuZCBuZXcgbGluZXMuIFdoaXRlc3BhY2Ugd2lsbCBiZSBhdXRvbWF0aWNhbGx5IGNvcnJlY3RlZC4nPkdyaWQgSXRlbXM8L2xhYmVsPlxuICAgICAgICAgIDx0ZXh0YXJlYSBpZD0nc3VidGVzdF9pdGVtcyc+I3tpdGVtc308L3RleHRhcmVhPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8bGFiZWw+UmFuZG9taXplIGl0ZW1zPC9sYWJlbD48YnI+XG4gICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICA8ZGl2IGlkPSdyYW5kb21pemUnIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0ncmFuZG9taXplX3RydWUnPlllczwvbGFiZWw+PGlucHV0IG5hbWU9J3JhbmRvbWl6ZScgdHlwZT0ncmFkaW8nIHZhbHVlPSd0cnVlJyBpZD0ncmFuZG9taXplX3RydWUnICN7J2NoZWNrZWQnIGlmIHJhbmRvbWl6ZX0+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdyYW5kb21pemVfZmFsc2UnPk5vPC9sYWJlbD48aW5wdXQgbmFtZT0ncmFuZG9taXplJyB0eXBlPSdyYWRpbycgdmFsdWU9J2ZhbHNlJyBpZD0ncmFuZG9taXplX2ZhbHNlJyAjeydjaGVja2VkJyBpZiBub3QgcmFuZG9taXplfT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+PGJyPlxuXG4gICAgICAgIDxsYWJlbD5NYXJrIGVudGlyZSBsaW5lIGJ1dHRvbjwvbGFiZWw+PGJyPlxuICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgPGRpdiBpZD0nZW5kX29mX2xpbmUnIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nZW5kX29mX2xpbmVfdHJ1ZSc+WWVzPC9sYWJlbD48aW5wdXQgbmFtZT0nZW5kX29mX2xpbmUnIHR5cGU9J3JhZGlvJyB2YWx1ZT0ndHJ1ZScgaWQ9J2VuZF9vZl9saW5lX3RydWUnICN7J2NoZWNrZWQnIGlmIGVuZE9mTGluZX0+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdlbmRfb2ZfbGluZV9mYWxzZSc+Tm88L2xhYmVsPjxpbnB1dCBuYW1lPSdlbmRfb2ZfbGluZScgdHlwZT0ncmFkaW8nIHZhbHVlPSdmYWxzZScgaWQ9J2VuZF9vZl9saW5lX2ZhbHNlJyAjeydjaGVja2VkJyBpZiBub3QgZW5kT2ZMaW5lfT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+PGJyPlxuXG4gICAgICAgIDxsYWJlbD5DYXB0dXJlIGxhc3QgaXRlbSBhdHRlbXB0ZWQ8L2xhYmVsPjxicj5cbiAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgIDxkaXYgaWQ9J2NhcHR1cmVfbGFzdF9hdHRlbXB0ZWQnIGNsYXNzPSdidXR0b25zZXQnPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nY2FwdHVyZV9sYXN0X2F0dGVtcHRlZF90cnVlJz5ZZXM8L2xhYmVsPjxpbnB1dCBuYW1lPSdjYXB0dXJlX2xhc3RfYXR0ZW1wdGVkJyB0eXBlPSdyYWRpbycgdmFsdWU9J3RydWUnIGlkPSdjYXB0dXJlX2xhc3RfYXR0ZW1wdGVkX3RydWUnICN7J2NoZWNrZWQnIGlmIGNhcHR1cmVMYXN0QXR0ZW1wdGVkfT5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2NhcHR1cmVfbGFzdF9hdHRlbXB0ZWRfZmFsc2UnPk5vPC9sYWJlbD48aW5wdXQgbmFtZT0nY2FwdHVyZV9sYXN0X2F0dGVtcHRlZCcgdHlwZT0ncmFkaW8nIHZhbHVlPSdmYWxzZScgaWQ9J2NhcHR1cmVfbGFzdF9hdHRlbXB0ZWRfZmFsc2UnICN7J2NoZWNrZWQnIGlmIG5vdCBjYXB0dXJlTGFzdEF0dGVtcHRlZH0+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2Pjxicj5cblxuICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgPGxhYmVsIGZvcj0nc3VidGVzdF9jb2x1bW5zJyB0aXRsZT0nTnVtYmVyIG9mIGNvbHVtbnMgaW4gd2hpY2ggdG8gZGlzcGxheSB0aGUgZ3JpZCBpdGVtcy4nPkNvbHVtbnM8L2xhYmVsPjxicj5cbiAgICAgICAgICA8aW5wdXQgaWQ9J3N1YnRlc3RfY29sdW1ucycgdmFsdWU9JyN7Y29sdW1uc30nIHR5cGU9J251bWJlcic+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdzdWJ0ZXN0X3RpbWVyJyB0aXRsZT0nU2Vjb25kcyB0byBnaXZlIHRoZSBjaGlsZCB0byBjb21wbGV0ZSB0aGUgdGVzdC4gU2V0dGluZyB0aGlzIHZhbHVlIHRvIDAgd2lsbCBtYWtlIHRoZSB0ZXN0IHVudGltZWQuJz5UaW1lcjwvbGFiZWw+PGJyPlxuICAgICAgICAgIDxpbnB1dCBpZD0nc3VidGVzdF90aW1lcicgdmFsdWU9JyN7dGltZXJ9JyB0eXBlPSdudW1iZXInPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIFwiXG5cbiAgICAjXG4gICAgIyBTdXJ2ZXlcbiAgICAjXG5cbiAgICBlbHNlIGlmIEBwcm90b3R5cGUgPT0gXCJzdXJ2ZXlcIlxuXG5cbiAgICAgIGdyaWRMaW5rSWQgPSBAbW9kZWwuZ2V0KFwiZ3JpZExpbmtJZFwiKSB8fCBcIlwiXG4gICAgICBhdXRvc3RvcExpbWl0ID0gcGFyc2VJbnQoQG1vZGVsLmdldChcImF1dG9zdG9wTGltaXRcIikpIHx8IDBcblxuICAgICAgQG9uIFwicmVuZGVyZWRcIiwgPT5cbiAgICAgICAgQHJlbmRlclF1ZXN0aW9ucygpXG5cbiAgICAgICAgIyBnZXQgbGlua2VkIGdyaWQgb3B0aW9uc1xuICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICBzdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgIGtleTogXCJzXCIgKyBAY3VycmljdWx1bS5pZFxuICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuICAgICAgICAgICAgY29sbGVjdGlvbiA9IG5ldyBTdWJ0ZXN0cyBjb2xsZWN0aW9uLndoZXJlXG4gICAgICAgICAgICAgIHByb3RvdHlwZSA6ICdncmlkJyAjIG9ubHkgZ3JpZHMgY2FuIHByb3ZpZGUgc2NvcmVzXG4gICAgICAgICAgICBjb2xsZWN0aW9uLnNvcnQoKVxuICAgICAgICAgICAgbGlua1NlbGVjdCA9IFwiXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPSdsaW5rX3NlbGVjdCc+TGlua2VkIHRvIGdyaWQ8L2xhYmVsPjxicj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPSdtZW51X2JveCc+XG4gICAgICAgICAgICAgICAgICA8c2VsZWN0IGlkPSdsaW5rX3NlbGVjdCc+XG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPScnPk5vbmU8L29wdGlvbj5cIlxuICAgICAgICAgICAgZm9yIHN1YnRlc3QgaW4gY29sbGVjdGlvbi5tb2RlbHNcbiAgICAgICAgICAgICAgbGlua1NlbGVjdCArPSBcIjxvcHRpb24gdmFsdWU9JyN7c3VidGVzdC5pZH0nICN7aWYgKGdyaWRMaW5rSWQgPT0gc3VidGVzdC5pZCkgdGhlbiAnc2VsZWN0ZWQnIGVsc2UgJyd9PiN7c3VidGVzdC5nZXQoJ3BhcnQnKX0gI3tzdWJ0ZXN0LmdldCAnbmFtZSd9PC9vcHRpb24+XCJcbiAgICAgICAgICAgIGxpbmtTZWxlY3QgKz0gXCI8L3NlbGVjdD48L2Rpdj48L2Rpdj5cIlxuICAgICAgICAgICAgQCRlbC5maW5kKCcjZ3JpZF9saW5rJykuaHRtbCBsaW5rU2VsZWN0XG5cblxuXG4gICAgICBwcm90b3R5cGVPcHRpb25zID0gXCJcbiAgICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J2F1dG9zdG9wX2xpbWl0JyB0aXRsZT0nVGhlIHN1cnZleSB3aWxsIGRpc2NvbnRpbnVlIGFmdGVyIHRoZSBmaXJzdCBOIHF1ZXN0aW9ucyBoYXZlIGJlZW4gYW5zd2VyZWQgd2l0aCBhICZxdW90OzAmcXVvdDsgdmFsdWUgb3B0aW9uLic+QXV0b3N0b3AgYWZ0ZXIgTiBpbmNvcnJlY3Q8L2xhYmVsPjxicj5cbiAgICAgICAgICA8aW5wdXQgaWQ9J2F1dG9zdG9wX2xpbWl0JyB0eXBlPSdudW1iZXInIHZhbHVlPScje2F1dG9zdG9wTGltaXR9Jz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgaWQ9J2dyaWRfbGluayc+PC9kaXY+XG4gICAgICAgIDxkaXYgaWQ9J3F1ZXN0aW9ucyc+XG4gICAgICAgICAgPGgyPlF1ZXN0aW9uczwvaDI+XG4gICAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgICAgPGRpdiBpZD0ncXVlc3Rpb25fbGlzdF93cmFwcGVyJz48aW1nIGNsYXNzPSdsb2FkaW5nJyBzcmM9J2ltYWdlcy9sb2FkaW5nLmdpZic+PC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdhZGRfcXVlc3Rpb24gY29tbWFuZCc+QWRkIFF1ZXN0aW9uPC9idXR0b24+XG4gICAgICAgICAgICA8ZGl2IGlkPSdhZGRfcXVlc3Rpb25fZm9ybScgY2xhc3M9J2NvbmZpcm1hdGlvbic+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICAgICAgICA8aDI+TmV3IFF1ZXN0aW9uPC9oMj5cbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPSdxdWVzdGlvbl9wcm9tcHQnPlByb21wdDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPGlucHV0IGlkPSdxdWVzdGlvbl9wcm9tcHQnPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9J3F1ZXN0aW9uX25hbWUnPlZhcmlhYmxlIG5hbWU8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBpZD0ncXVlc3Rpb25fbmFtZScgdGl0bGU9J0FsbG93ZWQgY2hhcmFjdGVyczogQS1aLCBhLXosIDAtOSwgYW5kIHVuZGVyc2NvcmVzLic+PGJyPlxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9J2FkZF9xdWVzdGlvbl9hZGQgY29tbWFuZCc+QWRkPC9idXR0b24+PGJ1dHRvbiBjbGFzcz0nYWRkX3F1ZXN0aW9uX2NhbmNlbCBjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj4gXG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgXCJcblxuICAgIEAkZWwuaHRtbCBcIlxuICAgICAgPGJ1dHRvbiBjbGFzcz0nYmFja19idXR0b24gbmF2aWdhdGlvbic+QmFjazwvYnV0dG9uPjxicj5cbiAgICAgIDxoMT5TdWJ0ZXN0IEVkaXRvcjwvaDE+XG4gICAgICA8dGFibGUgY2xhc3M9J2Jhc2ljX2luZm8nPlxuICAgICAgICA8dHI+XG4gICAgICAgICAgPHRoPkN1cnJpY3VsdW08L3RoPlxuICAgICAgICAgIDx0ZD4je2N1cnJpY3VsdW1OYW1lfTwvdGQ+XG4gICAgICAgIDwvdHI+XG4gICAgICA8L3RhYmxlPlxuXG4gICAgICA8YnV0dG9uIGNsYXNzPSdzYXZlX3N1YnRlc3QgY29tbWFuZCc+RG9uZTwvYnV0dG9uPlxuXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J25hbWUnPk5hbWU8L2xhYmVsPlxuICAgICAgICA8aW5wdXQgaWQ9J25hbWUnIHZhbHVlPScje25hbWV9Jz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J3JlcG9ydF90eXBlJz5SZXBvcnQgVHlwZTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0ncmVwb3J0X3R5cGUnIHZhbHVlPScje3JlcG9ydFR5cGV9Jz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J2l0ZW1fdHlwZScgdGl0bGU9J1RoaXMgdmFyaWFibGUgaXMgdXNlZCBmb3IgcmVwb3J0cy4gQWxsIHJlc3VsdHMgZnJvbSBzdWJ0ZXN0cyB3aXRoIHRoZSBzYW1lIEl0ZW0gVHlwZSB3aWxsIHNob3cgdXAgdG9nZXRoZXIuIEluY29uc2lzdGVudCBuYW1pbmcgd2lsbCBpbnZhbGlkYXRlIHJlc3VsdHMuICAnPkl0ZW0gVHlwZTwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0naXRlbV90eXBlJyB2YWx1ZT0nI3tpdGVtVHlwZX0nPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0ncGFydCc+QXNzZXNzbWVudCBOdW1iZXI8L2xhYmVsPjxicj5cbiAgICAgICAgPGlucHV0IHR5cGU9J251bWJlcicgaWQ9J3BhcnQnIHZhbHVlPScje3BhcnR9Jz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxsYWJlbCBmb3I9J3Njb3JlX3RhcmdldCc+VGFyZ2V0IHNjb3JlPC9sYWJlbD48YnI+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdudW1iZXInIGlkPSdzY29yZV90YXJnZXQnIHZhbHVlPScje3Njb3JlVGFyZ2V0fSc+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzcz0nbGFiZWxfdmFsdWUnPlxuICAgICAgICA8bGFiZWwgZm9yPSdzY29yZV9zcHJlYWQnPlNjb3JlIHNwcmVhZDwvbGFiZWw+PGJyPlxuICAgICAgICA8aW5wdXQgdHlwZT0nbnVtYmVyJyBpZD0nc2NvcmVfc3ByZWFkJyB2YWx1ZT0nI3tzY29yZVNwcmVhZH0nPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGxhYmVsIGZvcj0nb3JkZXInPk9yZGVyPC9sYWJlbD48YnI+XG4gICAgICAgIDxpbnB1dCB0eXBlPSdudW1iZXInIGlkPSdvcmRlcicgdmFsdWU9JyN7b3JkZXJ9Jz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICAje3Byb3RvdHlwZU9wdGlvbnN9XG5cbiAgICAgIDxidXR0b24gY2xhc3M9J3NhdmVfc3VidGVzdCBjb21tYW5kJz5Eb25lPC9idXR0b24+XG4gICAgICBcIlxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiJdfQ==
