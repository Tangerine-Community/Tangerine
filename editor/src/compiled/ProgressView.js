var ProgressView, SortedCollection,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ProgressView = (function(superClass) {
  extend(ProgressView, superClass);

  function ProgressView() {
    this.updateFlot = bind(this.updateFlot, this);
    this.afterRender = bind(this.afterRender, this);
    return ProgressView.__super__.constructor.apply(this, arguments);
  }

  ProgressView.prototype.className = "ProgressView";

  ProgressView.prototype.INDIVIDUAL = 1;

  ProgressView.prototype.AGGREGATE = 2;

  ProgressView.prototype.events = {
    'click .back': 'goBack',
    'click .select_itemType': 'selectItemType',
    'click .xtick': 'selectAssessment'
  };

  ProgressView.prototype.selectAssessment = function(event) {
    this.selected.week = parseInt($(event.target).attr('data-index'));
    this.updateTable();
    return this.updateFlot();
  };

  ProgressView.prototype.selectItemType = function(event) {
    var $target;
    $target = $(event.target);
    this.selected.itemType = $target.attr('data-itemType');
    this.$el.find(".select_itemType").removeClass("selected");
    $target.addClass("selected");
    this.updateTable();
    return this.updateFlot();
  };

  ProgressView.prototype.goBack = function() {
    return history.go(-1);
  };

  ProgressView.prototype.initialize = function(options) {
    var data, dataForBenchmark, graphIndex, i, itemType, itemTypes, j, k, key, l, len, len1, len2, len3, len4, len5, len6, len7, m, n, name, o, p, part, partByIndex, parts, pointsByItemType, q, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, result, row, subtest, subtests, subtestsByPart;
    this.results = options.results;
    this.student = options.student;
    this.subtests = options.subtests;
    this.klass = options.klass;
    if (this.klass == null) {
      Utils.log(this, "No klass.");
    }
    if (this.subtests == null) {
      Utils.log(this, "No progress type subtests.");
    }
    if (this.results.length === 0) {
      this.renderReady = true;
      this.render();
      return;
    }
    this.mode = this.student != null ? this.INDIVIDUAL : this.AGGREGATE;
    this.subtestNames = {};
    this.benchmarkScore = {};
    this.rows = [];
    this.partCount = 0;
    this.flot = null;
    this.lastPart = Math.max.apply(this, _.compact(this.subtests.pluck("part")));
    this.resultsByPart = [];
    this.itemTypeList = {};
    this.selected = {
      "itemType": null,
      "week": 0
    };
    parts = [];
    ref = this.subtests.models;
    for (j = 0, len = ref.length; j < len; j++) {
      subtest = ref[j];
      if (!~parts.indexOf(subtest.get("part"))) {
        parts.push(subtest.get("part"));
      }
      i = parts.indexOf(subtest.get("part"));
      if (this.subtestNames[i] == null) {
        this.subtestNames[i] = {};
      }
      this.subtestNames[i][subtest.get("itemType")] = subtest.get("name");
    }
    this.partCount = parts.length;
    subtestsByPart = this.subtests.indexBy("part");
    partByIndex = _.keys(subtestsByPart);
    this.indexByPart = [];
    for (i = k = 0, len1 = partByIndex.length; k < len1; i = ++k) {
      part = partByIndex[i];
      this.indexByPart[part] = i;
    }
    this.resultsByPart = this.results.indexBy("part");
    ref1 = this.results.models;
    for (l = 0, len2 = ref1.length; l < len2; l++) {
      result = ref1[l];
      this.itemTypeList[result.get("itemType").toLowerCase()] = true;
    }
    this.itemTypeList = _.keys(this.itemTypeList);
    for (part = m = 1, ref2 = this.lastPart; 1 <= ref2 ? m <= ref2 : m >= ref2; part = 1 <= ref2 ? ++m : --m) {
      if (this.resultsByPart[part] === void 0) {
        continue;
      }
      itemTypes = {};
      ref3 = this.resultsByPart[part];
      for (i = n = 0, len3 = ref3.length; n < len3; i = ++n) {
        result = ref3[i];
        if (this.mode === this.INDIVIDUAL && result.get("studentId") !== this.student.id) {
          continue;
        }
        itemType = result.get("itemType");
        if (this.selected.itemType == null) {
          this.selected.itemType = itemType;
        }
        if (itemTypes[itemType] == null) {
          itemTypes[itemType] = [];
        }
        itemTypes[itemType].push({
          "name": itemType.titleize(),
          "key": itemType,
          "part": result.get("part"),
          "correct": result.get("correct"),
          "attempted": result.get("attempted"),
          "itemsPerMinute": result.getCorrectPerSeconds(60)
        });
        this.benchmarkScore[itemType] = this.subtests.get(result.get("subtestId")).getNumber("scoreTarget");
      }
      this.rows.push({
        "part": part,
        "itemTypes": _.values(itemTypes)
      });
    }
    this.rows = this.aggregate(this.rows);
    if (this.rows.length !== 0) {
      this.selected = {
        week: this.indexByPart[_.last(this.rows)['part']],
        itemType: _.last(this.rows)['itemTypes'][0].key
      };
    }
    pointsByItemType = {};
    ref4 = this.rows;
    for (i = o = 0, len4 = ref4.length; o < len4; i = ++o) {
      row = ref4[i];
      ref5 = row.itemTypes;
      for (p = 0, len5 = ref5.length; p < len5; p++) {
        itemType = ref5[p];
        graphIndex = this.indexByPart[row.part] + 1;
        if (pointsByItemType[itemType.key] == null) {
          pointsByItemType[itemType.key] = [];
        }
        pointsByItemType[itemType.key].push([graphIndex, itemType.itemsPerMinute]);
      }
    }
    this.flotData = [];
    this.benchmarkData = [];
    i = 0;
    for (name in pointsByItemType) {
      data = pointsByItemType[name];
      key = name.toLowerCase();
      this.flotData[key] = {
        "data": data,
        "label": name.titleize(),
        "key": key,
        "lines": {
          "show": true
        },
        "points": {
          "show": true
        }
      };
    }
    this.flotBenchmark = [];
    ref6 = this.subtests.indexBy("itemType");
    for (itemType in ref6) {
      subtests = ref6[itemType];
      dataForBenchmark = [];
      for (i = q = 0, len6 = subtests.length; q < len6; i = ++q) {
        subtest = subtests[i];
        graphIndex = this.indexByPart[subtest.get("part")] + 1;
        dataForBenchmark.push([graphIndex, subtest.getNumber("scoreTarget")]);
      }
      this.flotBenchmark[itemType.toLowerCase()] = {
        "label": "Progress benchmark",
        "data": dataForBenchmark,
        "color": "#aaa",
        "lines": {
          "show": true
        }
      };
    }
    this.warningThresholds = {};
    ref7 = this.subtests.indexBy("itemType");
    for (itemType in ref7) {
      subtests = ref7[itemType];
      this.warningThresholds[itemType] = [];
      for (i = r = 0, len7 = subtests.length; r < len7; i = ++r) {
        subtest = subtests[i];
        this.warningThresholds[itemType.toLowerCase()][this.indexByPart[subtest.get("part")]] = {
          target: subtest.getNumber("scoreTarget"),
          spread: subtest.getNumber("scoreSpread"),
          seconds: subtest.getNumber("timer")
        };
      }
    }
    this.renderReady = true;
    return this.render();
  };

  ProgressView.prototype.render = function() {
    var $window, html, htmlWarning, j, key, label, len, ref, selectedClass, studentName, win;
    if (!this.renderReady) {
      return;
    }
    $window = $(window);
    win = {
      h: $window.height(),
      w: $window.width()
    };
    if (this.mode === this.INDIVIDUAL) {
      studentName = "<h2>" + (this.student.get('name')) + "</h2>";
    }
    html = "<h1>Progress table</h1> " + (studentName || "");
    htmlWarning = "<p>No test data for this type of report. Return to the <a href='#class'>class menu</a> and click the <img src='images/icon_run.png'> icon to collect data.</p>";
    if (this.results.length === 0) {
      this.$el.html(html + " " + htmlWarning);
      this.trigger("rendered");
      return;
    }
    html += "<div id='flot-menu'>";
    ref = _.uniq(this.subtests.pluck("itemType"));
    for (j = 0, len = ref.length; j < len; j++) {
      key = ref[j];
      label = key.replace(/[_-]/g, " ").capitalize();
      selectedClass = key === this.selected.itemType ? "selected" : "";
      html += "<button class='command select_itemType " + selectedClass + "' data-itemType='" + key + "'>" + label + "</button>";
    }
    html += "</div> <div id='flot-container' style='width: " + (window.w * 0.8) + "px; height:300px;'></div>";
    html += "<div id='table_container'></div> <button class='navigation back'>" + (t('back')) + "</button>";
    this.$el.html(html);
    this.updateTable();
    return this.trigger("rendered");
  };

  ProgressView.prototype.afterRender = function() {
    return this.updateFlot();
  };

  ProgressView.prototype.updateTable = function() {
    var availableItemTypesThisWeek, data, datum, difference, high, html, i, itemType, j, k, l, len, len1, len2, low, ref, ref1, ref2, result, row, score, threshold, type, warnings, week;
    type = this.selected.itemType;
    week = this.selected.week;
    html = "<table class='tabular'>";
    ref = this.rows;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      row = ref[i];
      if (!~_.pluck(row.itemTypes, "key").indexOf(type)) {
        continue;
      }
      html += "<tr><th>" + this.subtestNames[i][type] + "</th></tr><tr>";
      ref1 = row.itemTypes;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        itemType = ref1[k];
        if (itemType.key !== type) {
          continue;
        }
        html += "<tr> <td>" + itemType.name + " correct</td><td>" + itemType.correct + "/" + itemType.attempted + "</td> </tr> <tr> <td>" + itemType.name + " correct per minute</td><td>" + itemType.itemsPerMinute + "</td> </tr>";
      }
    }
    html += "</table>";
    availableItemTypesThisWeek = _.pluck((ref2 = this.rows[week]) != null ? ref2.itemTypes : void 0, "key");
    if (week >= this.rows.length || !~availableItemTypesThisWeek.indexOf(type)) {
      html += "<section>No data for this assessment.</section>";
    } else if (this.mode === this.AGGREGATE) {
      score = 0;
      data = this.flotData[type] != null ? this.flotData[type].data : [];
      for (l = 0, len2 = data.length; l < len2; l++) {
        datum = data[l];
        if (datum[0] === week + 1) {
          score = datum[1];
        }
      }
      threshold = this.warningThresholds[type][week];
      high = threshold.target + threshold.spread;
      low = threshold.target - threshold.spread;
      difference = score - threshold.target;
      if (score > high) {
        result = "(" + score + "), " + difference + " correct items per minute above the benchmark";
        warnings = "Your class is doing well, " + result + ", continue with the reading program. Share your and your class’ great work with parents. Reward your class with some fun reading activities such as reading marathons or competitions. However, look at a student grouping report for this assessment and make sure that those children performing below average get extra attention and practice and don’t fall behind.";
      } else if (score < low) {
        result = "(" + score + "), " + (Math.abs(difference)) + " correct items per minute below the benchmark";
        warnings = "Your class is performing below the grade-level target, " + result + ". Plan for additional lesson time focusing on reading in consultation with your principal. Encourage parents to spend more time with reading materials at home – remind them that you are a team working together to help their children learning to read. Think about organizing other events and opportunities for practice, e.g., reading marathons or competitions to motivate students to read more.";
      } else {
        if (difference !== 0 && difference * -1 === Math.abs(difference)) {
          result = (score - threshold.target) + " correct items per minute above the bench mark";
        } else if (difference === 0) {
          result = score + " correct items per minute";
        } else {
          result = ("(" + score + "), ") + Math.abs(score - threshold.target) + " correct items per minute below the bench mark";
        }
        warnings = "Your class is in line with expectations, " + result + ". Continue with the reading program and keep up the good work! Look at a student grouping report for this assessment and make sure that those children performing below average get extra attention and practice and don’t fall behind.";
      }
      html += "<section> " + warnings + " </section>";
    }
    return this.$el.find("#table_container").html(html);
  };

  ProgressView.prototype.updateFlot = function() {
    var displayData, i;
    this.flotOptions = {
      "xaxis": {
        "min": 0.5,
        "max": this.partCount + 0.5,
        "ticks": (function() {
          var j, ref, results1;
          results1 = [];
          for (i = j = 1, ref = this.partCount; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
            results1.push(String(i));
          }
          return results1;
        }).call(this),
        "tickDecimals": 0,
        "tickFormatter": (function(_this) {
          return function(num) {
            if (_this.subtestNames[num - 1][_this.selected.itemType] != null) {
              return "<button class='xtick " + (num - 1 === _this.selected.week ? 'selected' : '') + "' data-index='" + (num - 1) + "'>" + _this.subtestNames[num - 1][_this.selected.itemType] + "</button>";
            } else {
              return "";
            }
          };
        })(this)
      },
      "grid": {
        "markings": {
          "color": "#ffc",
          "xaxis": {
            "to": this.selected.week + 0.5,
            "from": this.selected.week - 0.5
          }
        }
      }
    };
    displayData = [];
    if (this.flotData[this.selected.itemType]) {
      displayData.push(this.flotData[this.selected.itemType]);
    }
    if (this.flotBenchmark[this.selected.itemType]) {
      displayData.push(this.flotBenchmark[this.selected.itemType]);
    }
    return this.flot = $.plot(this.$el.find("#flot-container"), displayData, this.flotOptions);
  };

  ProgressView.prototype.aggregate = function(oldRows) {
    var i, j, k, l, len, len1, len2, mean, newRows, ref, result, results, row;
    newRows = [];
    for (i = j = 0, len = oldRows.length; j < len; i = ++j) {
      row = oldRows[i];
      newRows[i] = {
        "part": row.part,
        "itemTypes": []
      };
      ref = row.itemTypes;
      for (k = 0, len1 = ref.length; k < len1; k++) {
        results = ref[k];
        mean = {
          "name": "",
          "key": "",
          "correct": 0,
          "attempted": 0,
          "itemsPerMinute": 0
        };
        for (l = 0, len2 = results.length; l < len2; l++) {
          result = results[l];
          mean.name = result.name;
          mean.key = result.key;
          mean.correct += result.correct;
          mean.attempted += result.attempted;
          mean.itemsPerMinute += result.itemsPerMinute;
        }
        mean.correct /= results.length;
        mean.attempted /= results.length;
        mean.itemsPerMinute /= results.length;
        mean.correct = Math.round(mean.correct);
        mean.attempted = Math.round(mean.attempted);
        mean.itemsPerMinute = Math.round(mean.itemsPerMinute);
        newRows[i].itemTypes.push(mean);
      }
    }
    return newRows;
  };

  return ProgressView;

})(Backbone.View);

SortedCollection = (function() {
  function SortedCollection(options) {
    this.sorted = [];
    this.models = options.models;
    this.attribute = options.attribute;
  }

  return SortedCollection;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcG9ydC9Qcm9ncmVzc1ZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsOEJBQUE7RUFBQTs7OztBQUFNOzs7Ozs7Ozs7eUJBRUosU0FBQSxHQUFZOzt5QkFFWixVQUFBLEdBQWE7O3lCQUNiLFNBQUEsR0FBYTs7eUJBRWIsTUFBQSxHQUNFO0lBQUEsYUFBQSxFQUEyQixRQUEzQjtJQUNBLHdCQUFBLEVBQTJCLGdCQUQzQjtJQUVBLGNBQUEsRUFBMkIsa0JBRjNCOzs7eUJBTUYsZ0JBQUEsR0FBa0IsU0FBQyxLQUFEO0lBQ2hCLElBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixHQUFpQixRQUFBLENBQVMsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxJQUFoQixDQUFxQixZQUFyQixDQUFUO0lBQ2pCLElBQUMsQ0FBQSxXQUFELENBQUE7V0FDQSxJQUFDLENBQUEsVUFBRCxDQUFBO0VBSGdCOzt5QkFLbEIsY0FBQSxHQUFnQixTQUFDLEtBQUQ7QUFDZCxRQUFBO0lBQUEsT0FBQSxHQUFVLENBQUEsQ0FBRSxLQUFLLENBQUMsTUFBUjtJQUNWLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixHQUFxQixPQUFPLENBQUMsSUFBUixDQUFhLGVBQWI7SUFDckIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsa0JBQVYsQ0FBNkIsQ0FBQyxXQUE5QixDQUEwQyxVQUExQztJQUNBLE9BQU8sQ0FBQyxRQUFSLENBQWlCLFVBQWpCO0lBQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxVQUFELENBQUE7RUFOYzs7eUJBUWhCLE1BQUEsR0FBUSxTQUFBO1dBQUcsT0FBTyxDQUFDLEVBQVIsQ0FBVyxDQUFDLENBQVo7RUFBSDs7eUJBRVIsVUFBQSxHQUFZLFNBQUMsT0FBRDtBQUtWLFFBQUE7SUFBQSxJQUFDLENBQUEsT0FBRCxHQUFnQixPQUFPLENBQUM7SUFDeEIsSUFBQyxDQUFBLE9BQUQsR0FB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c291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUHJvZ3Jlc3NWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiUHJvZ3Jlc3NWaWV3XCJcblxuICBJTkRJVklEVUFMIDogMVxuICBBR0dSRUdBVEUgIDogMlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmJhY2snICAgICAgICAgICAgOiAnZ29CYWNrJ1xuICAgICdjbGljayAuc2VsZWN0X2l0ZW1UeXBlJyA6ICdzZWxlY3RJdGVtVHlwZSdcbiAgICAnY2xpY2sgLnh0aWNrJyAgICAgICAgICAgOiAnc2VsZWN0QXNzZXNzbWVudCdcblxuICAjICEhISAtIHZhcmlhYmxlIG5hbWUgRlVCQVJcbiAgIyBhc3Nlc3NtZW50ID0gcGFydCA9IHdlZWtcbiAgc2VsZWN0QXNzZXNzbWVudDogKGV2ZW50KSAtPlxuICAgIEBzZWxlY3RlZC53ZWVrID0gcGFyc2VJbnQoJChldmVudC50YXJnZXQpLmF0dHIoJ2RhdGEtaW5kZXgnKSlcbiAgICBAdXBkYXRlVGFibGUoKVxuICAgIEB1cGRhdGVGbG90KClcblxuICBzZWxlY3RJdGVtVHlwZTogKGV2ZW50KSAtPlxuICAgICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldClcbiAgICBAc2VsZWN0ZWQuaXRlbVR5cGUgPSAkdGFyZ2V0LmF0dHIoJ2RhdGEtaXRlbVR5cGUnKVxuICAgIEAkZWwuZmluZChcIi5zZWxlY3RfaXRlbVR5cGVcIikucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKVxuICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKVxuICAgIEB1cGRhdGVUYWJsZSgpXG4gICAgQHVwZGF0ZUZsb3QoKVxuXG4gIGdvQmFjazogLT4gaGlzdG9yeS5nbyAtMVxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zKSAtPlxuXG4gICAgI1xuICAgICMgQXJndW1lbnRzIGFuZCBtZW1iZXIgdmFyc1xuICAgICNcbiAgICBAcmVzdWx0cyAgICAgID0gb3B0aW9ucy5yZXN1bHRzXG4gICAgQHN0dWRlbnQgICAgICA9IG9wdGlvbnMuc3R1ZGVudFxuICAgIEBzdWJ0ZXN0cyAgICAgPSBvcHRpb25zLnN1YnRlc3RzXG4gICAgQGtsYXNzICAgICAgICA9IG9wdGlvbnMua2xhc3NcblxuICAgICMgQ2F0Y2ggdGhpbmdzIHRoYXQgXCJsb29rXCIgXCJvZGRcIlxuICAgIGlmIG5vdCBAa2xhc3M/ICAgICAgICAgIHRoZW4gVXRpbHMubG9nIEAsIFwiTm8ga2xhc3MuXCJcbiAgICBpZiBub3QgQHN1YnRlc3RzPyAgICAgICB0aGVuIFV0aWxzLmxvZyBALCBcIk5vIHByb2dyZXNzIHR5cGUgc3VidGVzdHMuXCJcbiAgICBpZiBAcmVzdWx0cy5sZW5ndGggPT0gMFxuICAgICAgQHJlbmRlclJlYWR5ID0gdHJ1ZVxuICAgICAgQHJlbmRlcigpXG4gICAgICByZXR1cm5cblxuXG4gICAgQG1vZGUgPSBpZiBAc3R1ZGVudD8gdGhlbiBASU5ESVZJRFVBTCBlbHNlIEBBR0dSRUdBVEVcblxuICAgIEBzdWJ0ZXN0TmFtZXMgICA9IHt9XG4gICAgQGJlbmNobWFya1Njb3JlID0ge31cbiAgICBAcm93cyAgICAgICAgICAgPSBbXVxuICAgIEBwYXJ0Q291bnQgICAgICA9IDBcbiAgICBAZmxvdCAgICAgICAgICAgPSBudWxsICMgZm9yIGZsb3RcbiAgICBAbGFzdFBhcnQgICAgICAgPSBNYXRoLm1heC5hcHBseSBALCBfLmNvbXBhY3QoQHN1YnRlc3RzLnBsdWNrKFwicGFydFwiKSlcbiAgICBAcmVzdWx0c0J5UGFydCA9IFtdXG4gICAgQGl0ZW1UeXBlTGlzdCAgPSB7fVxuICAgIEBzZWxlY3RlZCA9XG4gICAgICBcIml0ZW1UeXBlXCIgOiBudWxsXG4gICAgICBcIndlZWtcIiAgICAgOiAwXG5cbiAgICAjXG4gICAgIyBGaW5kIG91dCBob3cgbWFueSBwYXJ0cyBiZWxvbmcgdG8gdGhlIHByb2dyZXNzIHJlcG9ydFxuICAgICMgTWFrZSBhIG5hbWVzIGJ5IHBlcnRpbmVudEluZGV4IGFuZCBpdGVtVHlwZVxuICAgICNcbiAgICBwYXJ0cyA9IFtdXG4gICAgZm9yIHN1YnRlc3QgaW4gQHN1YnRlc3RzLm1vZGVsc1xuICAgICAgcGFydHMucHVzaCBzdWJ0ZXN0LmdldChcInBhcnRcIikgaWYgIX5wYXJ0cy5pbmRleE9mKHN1YnRlc3QuZ2V0KFwicGFydFwiKSlcblxuICAgICAgIyBnZXQgbmFtZXNcbiAgICAgIGkgPSBwYXJ0cy5pbmRleE9mKHN1YnRlc3QuZ2V0KFwicGFydFwiKSlcbiAgICAgIEBzdWJ0ZXN0TmFtZXNbaV0gPSB7fSBpZiBub3QgQHN1YnRlc3ROYW1lc1tpXT9cbiAgICAgIEBzdWJ0ZXN0TmFtZXNbaV1bc3VidGVzdC5nZXQoXCJpdGVtVHlwZVwiKV0gPSBzdWJ0ZXN0LmdldChcIm5hbWVcIilcblxuICAgIEBwYXJ0Q291bnQgPSBwYXJ0cy5sZW5ndGhcblxuICAgICNcbiAgICAjIE1ha2UgYSBtYXAgaW4gY2FzZSB3ZSBuZWVkIGl0IG9mIHdoaWNoIHdlZWsgYmVsb25ncyB0byB3aGljaCBpbmRleFxuICAgICNcbiAgICBzdWJ0ZXN0c0J5UGFydCA9IEBzdWJ0ZXN0cy5pbmRleEJ5KFwicGFydFwiKVxuICAgIHBhcnRCeUluZGV4ID0gXy5rZXlzKHN1YnRlc3RzQnlQYXJ0KVxuICAgIEBpbmRleEJ5UGFydCA9IFtdXG4gICAgZm9yIHBhcnQsIGkgaW4gcGFydEJ5SW5kZXhcbiAgICAgIEBpbmRleEJ5UGFydFtwYXJ0XSA9IGlcblxuXG4gICAgI1xuICAgICMgbWFrZSB0aGUgcmVzdWx0c0J5UGFydCBhbmQgdGhlIGl0ZW1UeXBlTGlzdFxuICAgICNcbiAgICBAcmVzdWx0c0J5UGFydCA9IEByZXN1bHRzLmluZGV4QnkgXCJwYXJ0XCJcbiAgICBAaXRlbVR5cGVMaXN0W3Jlc3VsdC5nZXQoXCJpdGVtVHlwZVwiKS50b0xvd2VyQ2FzZSgpXSA9IHRydWUgZm9yIHJlc3VsdCBpbiBAcmVzdWx0cy5tb2RlbHNcbiAgICBAaXRlbVR5cGVMaXN0ID0gXy5rZXlzKEBpdGVtVHlwZUxpc3QpXG5cbiAgICAjXG4gICAgIyBDb21waWxlIGRhdGEgYW5kIHNhdmUgdG8gQHJvd3NcbiAgICAjIHRoaXMgaXMgZm9yIHRoZSB0YWJsZVxuICAgICNcblxuICAgICMgaXRlcmF0ZSB0aHJvdWdoIGFsbCB3ZWVrc1xuICAgIGZvciBwYXJ0IGluIFsxLi5AbGFzdFBhcnRdXG5cbiAgICAgIGlmIEByZXN1bHRzQnlQYXJ0W3BhcnRdID09IHVuZGVmaW5lZCB0aGVuIGNvbnRpbnVlICMgaWYgdGhlcmUncyBubyByZXN1bHRzIGZvciB0aGF0IHdlZWssIHNraXAgaXRcblxuICAgICAgIyBpdGVyYXRlIHRocm91Z2ggYWxsIGl0ZW1UeXBlcyBmb3IgdGhpcyB3ZWVrXG4gICAgICBpdGVtVHlwZXMgPSB7fVxuICAgICAgZm9yIHJlc3VsdCwgaSBpbiBAcmVzdWx0c0J5UGFydFtwYXJ0XVxuXG4gICAgICAgIGlmIEBtb2RlID09IEBJTkRJVklEVUFMICYmIHJlc3VsdC5nZXQoXCJzdHVkZW50SWRcIikgIT0gQHN0dWRlbnQuaWQgdGhlbiBjb250aW51ZVxuXG4gICAgICAgIGl0ZW1UeXBlID0gcmVzdWx0LmdldChcIml0ZW1UeXBlXCIpXG5cbiAgICAgICAgIyBzZWxlY3QgZmlyc3QgaXRlbVR5cGVcbiAgICAgICAgQHNlbGVjdGVkLml0ZW1UeXBlID0gaXRlbVR5cGUgaWYgbm90IEBzZWxlY3RlZC5pdGVtVHlwZT9cblxuICAgICAgICAjIHB1c2ggYW4gb2JqZWN0XG4gICAgICAgIGl0ZW1UeXBlc1tpdGVtVHlwZV0gPSBbXSBpZiBub3QgaXRlbVR5cGVzW2l0ZW1UeXBlXT9cbiAgICAgICAgaXRlbVR5cGVzW2l0ZW1UeXBlXS5wdXNoXG4gICAgICAgICAgXCJuYW1lXCIgICAgICAgICAgIDogaXRlbVR5cGUudGl0bGVpemUoKVxuICAgICAgICAgIFwia2V5XCIgICAgICAgICAgICA6IGl0ZW1UeXBlXG4gICAgICAgICAgXCJwYXJ0XCIgICAgICAgICAgIDogcmVzdWx0LmdldChcInBhcnRcIilcbiAgICAgICAgICBcImNvcnJlY3RcIiAgICAgICAgOiByZXN1bHQuZ2V0IFwiY29ycmVjdFwiXG4gICAgICAgICAgXCJhdHRlbXB0ZWRcIiAgICAgIDogcmVzdWx0LmdldCBcImF0dGVtcHRlZFwiXG4gICAgICAgICAgXCJpdGVtc1Blck1pbnV0ZVwiIDogcmVzdWx0LmdldENvcnJlY3RQZXJTZWNvbmRzKDYwKVxuXG4gICAgICAgIEBiZW5jaG1hcmtTY29yZVtpdGVtVHlwZV0gPSBAc3VidGVzdHMuZ2V0KHJlc3VsdC5nZXQoXCJzdWJ0ZXN0SWRcIikpLmdldE51bWJlcihcInNjb3JlVGFyZ2V0XCIpXG5cbiAgICAgICMgZWFjaCByb3cgaXMgb25lIHdlZWsvcGFydFxuICAgICAgQHJvd3MucHVzaFxuICAgICAgICBcInBhcnRcIiAgICAgIDogcGFydFxuICAgICAgICBcIml0ZW1UeXBlc1wiIDogKF8udmFsdWVzKGl0ZW1UeXBlcykpICMgb2JqZWN0IC0+IGFycmF5XG5cbiAgICAjXG4gICAgIyBBZ2dyZWdhdGUgbW9kZSBhdmVyYWdlcyBkYXRhIGFjcm9zcyBzdHVkZW50c1xuICAgICNcbiAgICBAcm93cyA9IEBhZ2dyZWdhdGUgQHJvd3NcblxuICAgICNcbiAgICAjIFNlbGVjdCB0aGUgbW9zdCByZWNlbnQgdGhpbmcgd2l0aCBkYXRhXG4gICAgI1xuXG4gICAgaWYgQHJvd3MubGVuZ3RoICE9IDBcbiAgICAgIEBzZWxlY3RlZCA9XG4gICAgICAgIHdlZWsgICAgIDogQGluZGV4QnlQYXJ0W18ubGFzdChAcm93cylbJ3BhcnQnXV1cbiAgICAgICAgaXRlbVR5cGUgOiBfLmxhc3QoQHJvd3MpWydpdGVtVHlwZXMnXVswXS5rZXlcblxuICAgICNcbiAgICAjIE1ha2UgZmxvdCBkYXRhXG4gICAgI1xuICAgIHBvaW50c0J5SXRlbVR5cGUgPSB7fVxuICAgIGZvciByb3csIGkgaW4gQHJvd3NcbiAgICAgIGZvciBpdGVtVHlwZSBpbiByb3cuaXRlbVR5cGVzXG4gICAgICAgIGdyYXBoSW5kZXggPSBAaW5kZXhCeVBhcnRbcm93LnBhcnRdICsgMVxuICAgICAgICBwb2ludHNCeUl0ZW1UeXBlW2l0ZW1UeXBlLmtleV0gPSBbXSBpZiBub3QgcG9pbnRzQnlJdGVtVHlwZVtpdGVtVHlwZS5rZXldPyBcbiAgICAgICAgcG9pbnRzQnlJdGVtVHlwZVtpdGVtVHlwZS5rZXldLnB1c2ggW2dyYXBoSW5kZXgsIGl0ZW1UeXBlLml0ZW1zUGVyTWludXRlXVxuICAgIEBmbG90RGF0YSAgICAgID0gW11cbiAgICBAYmVuY2htYXJrRGF0YSA9IFtdXG4gICAgaSA9IDBcblxuICAgIGZvciBuYW1lLCBkYXRhIG9mIHBvaW50c0J5SXRlbVR5cGVcbiAgICAgIGtleSA9IG5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgQGZsb3REYXRhW2tleV0gPSB7XG4gICAgICAgIFwiZGF0YVwiICA6IGRhdGFcbiAgICAgICAgXCJsYWJlbFwiIDogbmFtZS50aXRsZWl6ZSgpXG4gICAgICAgIFwia2V5XCIgICA6IGtleVxuICAgICAgICBcImxpbmVzXCIgOlxuICAgICAgICAgIFwic2hvd1wiIDogdHJ1ZVxuICAgICAgICBcInBvaW50c1wiIDpcbiAgICAgICAgICBcInNob3dcIiA6IHRydWVcbiAgICAgIH1cblxuXG4gICAgI1xuICAgICMgQ3JlYXRlIGJlbmNobWFyayBmbG90IGdyYXBoc1xuICAgICNcbiAgICBAZmxvdEJlbmNobWFyayA9IFtdXG4gICAgZm9yIGl0ZW1UeXBlLCBzdWJ0ZXN0cyBvZiBAc3VidGVzdHMuaW5kZXhCeShcIml0ZW1UeXBlXCIpXG4gICAgICBkYXRhRm9yQmVuY2htYXJrID0gW11cbiAgICAgIGZvciBzdWJ0ZXN0LCBpIGluIHN1YnRlc3RzXG4gICAgICAgIGdyYXBoSW5kZXggPSBAaW5kZXhCeVBhcnRbc3VidGVzdC5nZXQoXCJwYXJ0XCIpXSArIDFcbiAgICAgICAgZGF0YUZvckJlbmNobWFyay5wdXNoIFtncmFwaEluZGV4LCBzdWJ0ZXN0LmdldE51bWJlcihcInNjb3JlVGFyZ2V0XCIpXVxuXG4gICAgICBAZmxvdEJlbmNobWFya1tpdGVtVHlwZS50b0xvd2VyQ2FzZSgpXSA9IHtcbiAgICAgICAgXCJsYWJlbFwiIDogXCJQcm9ncmVzcyBiZW5jaG1hcmtcIlxuICAgICAgICBcImRhdGFcIiA6IGRhdGFGb3JCZW5jaG1hcmtcbiAgICAgICAgXCJjb2xvclwiIDogXCIjYWFhXCJcbiAgICAgICAgXCJsaW5lc1wiIDpcbiAgICAgICAgICBcInNob3dcIiAgOiB0cnVlXG4gICAgICB9XG5cbiAgICAjXG4gICAgIyBjcmVhdGUgd2FybmluZyB0aHJlc2hvbGRzXG4gICAgI1xuICAgIEB3YXJuaW5nVGhyZXNob2xkcyA9IHt9XG4gICAgZm9yIGl0ZW1UeXBlLCBzdWJ0ZXN0cyBvZiBAc3VidGVzdHMuaW5kZXhCeShcIml0ZW1UeXBlXCIpXG4gICAgICBAd2FybmluZ1RocmVzaG9sZHNbaXRlbVR5cGVdID0gW11cbiAgICAgIGZvciBzdWJ0ZXN0LCBpIGluIHN1YnRlc3RzXG4gICAgICAgIEB3YXJuaW5nVGhyZXNob2xkc1tpdGVtVHlwZS50b0xvd2VyQ2FzZSgpXVtAaW5kZXhCeVBhcnRbc3VidGVzdC5nZXQoXCJwYXJ0XCIpXV0gPVxuICAgICAgICAgIHRhcmdldDogc3VidGVzdC5nZXROdW1iZXIoXCJzY29yZVRhcmdldFwiKVxuICAgICAgICAgIHNwcmVhZDogc3VidGVzdC5nZXROdW1iZXIoXCJzY29yZVNwcmVhZFwiKVxuICAgICAgICAgIHNlY29uZHM6IHN1YnRlc3QuZ2V0TnVtYmVyKFwidGltZXJcIilcblxuXG4gICAgQHJlbmRlclJlYWR5ID0gdHJ1ZVxuICAgIEByZW5kZXIoKVxuXG4gIHJlbmRlcjogLT5cblxuICAgIHJldHVybiBpZiBub3QgQHJlbmRlclJlYWR5XG4gICAgJHdpbmRvdyA9ICQod2luZG93KVxuICAgIHdpbiA9IFxuICAgICAgaCA6ICR3aW5kb3cuaGVpZ2h0KClcbiAgICAgIHcgOiAkd2luZG93LndpZHRoKClcbiAgICBcbiAgICBzdHVkZW50TmFtZSA9IFwiXG4gICAgICA8aDI+I3tAc3R1ZGVudC5nZXQoJ25hbWUnKX08L2gyPlxuICAgIFwiIGlmIEBtb2RlID09IEBJTkRJVklEVUFMXG5cbiAgICBodG1sID0gXCJcbiAgICAgIDxoMT5Qcm9ncmVzcyB0YWJsZTwvaDE+XG4gICAgICAje3N0dWRlbnROYW1lIHx8IFwiXCJ9XG4gICAgXCJcblxuICAgICNcbiAgICAjIEVtcHR5IHdhcm5pbmdcbiAgICAjXG4gICAgaHRtbFdhcm5pbmcgPSBcIjxwPk5vIHRlc3QgZGF0YSBmb3IgdGhpcyB0eXBlIG9mIHJlcG9ydC4gUmV0dXJuIHRvIHRoZSA8YSBocmVmPScjY2xhc3MnPmNsYXNzIG1lbnU8L2E+IGFuZCBjbGljayB0aGUgPGltZyBzcmM9J2ltYWdlcy9pY29uX3J1bi5wbmcnPiBpY29uIHRvIGNvbGxlY3QgZGF0YS48L3A+XCJcblxuICAgIGlmIEByZXN1bHRzLmxlbmd0aCA9PSAwXG4gICAgICBAJGVsLmh0bWwgXCJcbiAgICAgICAgI3todG1sfVxuICAgICAgICAje2h0bWxXYXJuaW5nfVxuICAgICAgXCJcbiAgICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgICAgcmV0dXJuXG5cblxuICAgICNcbiAgICAjIEZsb3QgY29udGFpbmVyc1xuICAgICNcbiAgICBodG1sICs9IFwiXG4gICAgICA8ZGl2IGlkPSdmbG90LW1lbnUnPlxuICAgICAgXCJcblxuICAgIGZvciBrZXkgaW4gXy51bmlxKEBzdWJ0ZXN0cy5wbHVjayhcIml0ZW1UeXBlXCIpKVxuICAgICAgbGFiZWwgPSBrZXkucmVwbGFjZSgvW18tXS9nLCBcIiBcIikuY2FwaXRhbGl6ZSgpXG4gICAgICBzZWxlY3RlZENsYXNzID0gaWYga2V5ID09IEBzZWxlY3RlZC5pdGVtVHlwZSB0aGVuIFwic2VsZWN0ZWRcIiBlbHNlIFwiXCJcbiAgICAgIGh0bWwgKz0gXCI8YnV0dG9uIGNsYXNzPSdjb21tYW5kIHNlbGVjdF9pdGVtVHlwZSAje3NlbGVjdGVkQ2xhc3N9JyBkYXRhLWl0ZW1UeXBlPScje2tleX0nPiN7bGFiZWx9PC9idXR0b24+XCJcblxuICAgIGh0bWwgKz0gXCJcbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBpZD0nZmxvdC1jb250YWluZXInIHN0eWxlPSd3aWR0aDogI3t3aW5kb3cudyowLjh9cHg7IGhlaWdodDozMDBweDsnPjwvZGl2PlxuICAgIFwiXG5cbiAgICAjXG4gICAgIyBTZXQgdGhlIHRhYmxlXG4gICAgI1xuICAgIGh0bWwgKz0gXCJcbiAgICA8ZGl2IGlkPSd0YWJsZV9jb250YWluZXInPjwvZGl2PlxuICAgIDxidXR0b24gY2xhc3M9J25hdmlnYXRpb24gYmFjayc+I3t0KCdiYWNrJyl9PC9idXR0b24+XG4gICAgXCJcblxuICAgIEAkZWwuaHRtbCBodG1sXG4gICAgQHVwZGF0ZVRhYmxlKClcbiAgICBAdHJpZ2dlciBcInJlbmRlcmVkXCJcblxuICBhZnRlclJlbmRlcjogPT5cbiAgICBAdXBkYXRlRmxvdCgpXG5cbiAgdXBkYXRlVGFibGU6IC0+XG5cbiAgICB0eXBlID0gQHNlbGVjdGVkLml0ZW1UeXBlXG4gICAgd2VlayA9IEBzZWxlY3RlZC53ZWVrXG5cbiAgICBodG1sID0gXCI8dGFibGUgY2xhc3M9J3RhYnVsYXInPlwiXG4gICAgZm9yIHJvdywgaSBpbiBAcm93c1xuICAgICAgIyBza2lwIGlmIHNlbGVjdGVkIHJvdyBkb2Vzbid0IGhhdmUgYW55IG9mIHRoZSBzZWxlY3RlZCBpdGVtIHR5cGVcbiAgICAgIGNvbnRpbnVlIGlmICF+Xy5wbHVjayhyb3cuaXRlbVR5cGVzLCBcImtleVwiKS5pbmRleE9mKHR5cGUpXG4gICAgICBodG1sICs9IFwiPHRyPjx0aD4je0BzdWJ0ZXN0TmFtZXNbaV1bdHlwZV19PC90aD48L3RyPjx0cj5cIlxuICAgICAgZm9yIGl0ZW1UeXBlIGluIHJvdy5pdGVtVHlwZXNcbiAgICAgICAgaWYgaXRlbVR5cGUua2V5ICE9IHR5cGUgdGhlbiBjb250aW51ZVxuICAgICAgICBodG1sICs9IFwiXG4gICAgICAgICAgPHRyPlxuICAgICAgICAgICAgPHRkPiN7aXRlbVR5cGUubmFtZX0gY29ycmVjdDwvdGQ+PHRkPiN7aXRlbVR5cGUuY29ycmVjdH0vI3tpdGVtVHlwZS5hdHRlbXB0ZWR9PC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgIDx0ZD4je2l0ZW1UeXBlLm5hbWV9IGNvcnJlY3QgcGVyIG1pbnV0ZTwvdGQ+PHRkPiN7aXRlbVR5cGUuaXRlbXNQZXJNaW51dGV9PC90ZD5cbiAgICAgICAgICA8L3RyPlxuICAgICAgICAgXCJcbiAgICBodG1sICs9IFwiPC90YWJsZT5cIlxuXG4gICAgI1xuICAgICMgQWRkIHdhcm5pbmcgaWYgYWxsIHN0dWRlbnRzIG1vZGVcbiAgICAjXG5cbiAgICBhdmFpbGFibGVJdGVtVHlwZXNUaGlzV2VlayA9IF8ucGx1Y2soQHJvd3Nbd2Vla10/Lml0ZW1UeXBlcywgXCJrZXlcIilcblxuICAgIGlmIHdlZWsgPj0gQHJvd3MubGVuZ3RoIHx8ICF+YXZhaWxhYmxlSXRlbVR5cGVzVGhpc1dlZWsuaW5kZXhPZih0eXBlKVxuICAgICAgaHRtbCArPSBcIjxzZWN0aW9uPk5vIGRhdGEgZm9yIHRoaXMgYXNzZXNzbWVudC48L3NlY3Rpb24+XCJcbiAgICBlbHNlIGlmIEBtb2RlID09IEBBR0dSRUdBVEVcblxuICAgICAgc2NvcmUgPSAwXG5cbiAgICAgIGRhdGEgPSBpZiBAZmxvdERhdGFbdHlwZV0/XG4gICAgICAgIEBmbG90RGF0YVt0eXBlXS5kYXRhXG4gICAgICBlbHNlXG4gICAgICAgIFtdXG5cbiAgICAgIGZvciBkYXR1bSBpbiBkYXRhXG4gICAgICAgIGlmIGRhdHVtWzBdID09IHdlZWsrMVxuICAgICAgICAgIHNjb3JlID0gZGF0dW1bMV1cblxuICAgICAgdGhyZXNob2xkID0gQHdhcm5pbmdUaHJlc2hvbGRzW3R5cGVdW3dlZWtdXG5cbiAgICAgIGhpZ2ggPSB0aHJlc2hvbGQudGFyZ2V0ICsgdGhyZXNob2xkLnNwcmVhZFxuICAgICAgbG93ICA9IHRocmVzaG9sZC50YXJnZXQgLSB0aHJlc2hvbGQuc3ByZWFkXG4gICAgICBkaWZmZXJlbmNlID0gc2NvcmUgLSB0aHJlc2hvbGQudGFyZ2V0XG5cbiAgICAgIGlmIHNjb3JlID4gaGlnaFxuICAgICAgICByZXN1bHQgPSBcIigje3Njb3JlfSksICN7ZGlmZmVyZW5jZX0gY29ycmVjdCBpdGVtcyBwZXIgbWludXRlIGFib3ZlIHRoZSBiZW5jaG1hcmtcIlxuICAgICAgICB3YXJuaW5ncyA9IFwiWW91ciBjbGFzcyBpcyBkb2luZyB3ZWxsLCAje3Jlc3VsdH0sIGNvbnRpbnVlIHdpdGggdGhlIHJlYWRpbmcgcHJvZ3JhbS4gU2hhcmUgeW91ciBhbmQgeW91ciBjbGFzc+KAmSBncmVhdCB3b3JrIHdpdGggcGFyZW50cy4gUmV3YXJkIHlvdXIgY2xhc3Mgd2l0aCBzb21lIGZ1biByZWFkaW5nIGFjdGl2aXRpZXMgc3VjaCBhcyByZWFkaW5nIG1hcmF0aG9ucyBvciBjb21wZXRpdGlvbnMuIEhvd2V2ZXIsIGxvb2sgYXQgYSBzdHVkZW50IGdyb3VwaW5nIHJlcG9ydCBmb3IgdGhpcyBhc3Nlc3NtZW50IGFuZCBtYWtlIHN1cmUgdGhhdCB0aG9zZSBjaGlsZHJlbiBwZXJmb3JtaW5nIGJlbG93IGF2ZXJhZ2UgZ2V0IGV4dHJhIGF0dGVudGlvbiBhbmQgcHJhY3RpY2UgYW5kIGRvbuKAmXQgZmFsbCBiZWhpbmQuXCJcbiAgICAgIGVsc2UgaWYgc2NvcmUgPCBsb3dcbiAgICAgICAgcmVzdWx0ID0gXCIoI3tzY29yZX0pLCAje01hdGguYWJzKGRpZmZlcmVuY2UpfSBjb3JyZWN0IGl0ZW1zIHBlciBtaW51dGUgYmVsb3cgdGhlIGJlbmNobWFya1wiXG4gICAgICAgIHdhcm5pbmdzID0gXCJZb3VyIGNsYXNzIGlzIHBlcmZvcm1pbmcgYmVsb3cgdGhlIGdyYWRlLWxldmVsIHRhcmdldCwgI3tyZXN1bHR9LiBQbGFuIGZvciBhZGRpdGlvbmFsIGxlc3NvbiB0aW1lIGZvY3VzaW5nIG9uIHJlYWRpbmcgaW4gY29uc3VsdGF0aW9uIHdpdGggeW91ciBwcmluY2lwYWwuIEVuY291cmFnZSBwYXJlbnRzIHRvIHNwZW5kIG1vcmUgdGltZSB3aXRoIHJlYWRpbmcgbWF0ZXJpYWxzIGF0IGhvbWUg4oCTIHJlbWluZCB0aGVtIHRoYXQgeW91IGFyZSBhIHRlYW0gd29ya2luZyB0b2dldGhlciB0byBoZWxwIHRoZWlyIGNoaWxkcmVuIGxlYXJuaW5nIHRvIHJlYWQuIFRoaW5rIGFib3V0IG9yZ2FuaXppbmcgb3RoZXIgZXZlbnRzIGFuZCBvcHBvcnR1bml0aWVzIGZvciBwcmFjdGljZSwgZS5nLiwgcmVhZGluZyBtYXJhdGhvbnMgb3IgY29tcGV0aXRpb25zIHRvIG1vdGl2YXRlIHN0dWRlbnRzIHRvIHJlYWQgbW9yZS5cIlxuICAgICAgZWxzZVxuICAgICAgICBpZiBkaWZmZXJlbmNlICE9IDAgJiYgZGlmZmVyZW5jZSAqIC0xID09IE1hdGguYWJzKGRpZmZlcmVuY2UpXG4gICAgICAgICAgcmVzdWx0ID0gKHNjb3JlIC0gdGhyZXNob2xkLnRhcmdldCkgKyBcIiBjb3JyZWN0IGl0ZW1zIHBlciBtaW51dGUgYWJvdmUgdGhlIGJlbmNoIG1hcmtcIlxuICAgICAgICBlbHNlIGlmIGRpZmZlcmVuY2UgPT0gMFxuICAgICAgICAgIHJlc3VsdCA9IFwiI3tzY29yZX0gY29ycmVjdCBpdGVtcyBwZXIgbWludXRlXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlc3VsdCA9IFwiKCN7c2NvcmV9KSwgXCIgKyBNYXRoLmFicyhzY29yZSAtIHRocmVzaG9sZC50YXJnZXQpICsgXCIgY29ycmVjdCBpdGVtcyBwZXIgbWludXRlIGJlbG93IHRoZSBiZW5jaCBtYXJrXCJcbiAgICAgICAgXG4gICAgICAgICMgQFRPRE8gbWFrZSB0aGF0IFwibWludXRlXCIgdW5pdCBkeW5hbWljXG4gICAgICAgIHdhcm5pbmdzID0gXCJZb3VyIGNsYXNzIGlzIGluIGxpbmUgd2l0aCBleHBlY3RhdGlvbnMsICN7cmVzdWx0fS4gQ29udGludWUgd2l0aCB0aGUgcmVhZGluZyBwcm9ncmFtIGFuZCBrZWVwIHVwIHRoZSBnb29kIHdvcmshIExvb2sgYXQgYSBzdHVkZW50IGdyb3VwaW5nIHJlcG9ydCBmb3IgdGhpcyBhc3Nlc3NtZW50IGFuZCBtYWtlIHN1cmUgdGhhdCB0aG9zZSBjaGlsZHJlbiBwZXJmb3JtaW5nIGJlbG93IGF2ZXJhZ2UgZ2V0IGV4dHJhIGF0dGVudGlvbiBhbmQgcHJhY3RpY2UgYW5kIGRvbuKAmXQgZmFsbCBiZWhpbmQuXCJcblxuICAgICAgaHRtbCArPSBcIlxuICAgICAgICA8c2VjdGlvbj5cbiAgICAgICAgICAje3dhcm5pbmdzfVxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICBcIlxuXG4gICAgQCRlbC5maW5kKFwiI3RhYmxlX2NvbnRhaW5lclwiKS5odG1sIGh0bWxcblxuXG4gIHVwZGF0ZUZsb3Q6ID0+XG4gICAgI1xuICAgICMgRmxvdCBvcHRpb25zXG4gICAgI1xuXG4gICAgQGZsb3RPcHRpb25zID1cbiAgICAgIFwieGF4aXNcIiA6XG4gICAgICAgIFwibWluXCIgICAgICAgICAgIDogMC41XG4gICAgICAgIFwibWF4XCIgICAgICAgICAgIDogQHBhcnRDb3VudCArIDAuNVxuICAgICAgICBcInRpY2tzXCIgICAgICAgICA6ICggU3RyaW5nKCBpICkgZm9yIGkgaW4gWzEuLkBwYXJ0Q291bnRdIClcbiAgICAgICAgXCJ0aWNrRGVjaW1hbHNcIiAgOiAwXG4gICAgICAgIFwidGlja0Zvcm1hdHRlclwiIDogKCBudW0gKSA9PiBcbiAgICAgICAgICBpZiBAc3VidGVzdE5hbWVzW251bS0xXVtAc2VsZWN0ZWQuaXRlbVR5cGVdP1xuICAgICAgICAgICAgcmV0dXJuIFwiPGJ1dHRvbiBjbGFzcz0neHRpY2sgI3tpZiBudW0tMT09QHNlbGVjdGVkLndlZWsgdGhlbiAnc2VsZWN0ZWQnIGVsc2UgJyd9JyBkYXRhLWluZGV4PScje251bS0xfSc+I3tAc3VidGVzdE5hbWVzW251bS0xXVtAc2VsZWN0ZWQuaXRlbVR5cGVdfTwvYnV0dG9uPlwiXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgXCJcIlxuICAgICAgXCJncmlkXCIgOlxuICAgICAgICBcIm1hcmtpbmdzXCIgOlxuICAgICAgICAgIFwiY29sb3JcIiAgOiBcIiNmZmNcIlxuICAgICAgICAgIFwieGF4aXNcIiAgOiBcbiAgICAgICAgICAgIFwidG9cIiAgIDogQHNlbGVjdGVkLndlZWsgKyAwLjVcbiAgICAgICAgICAgIFwiZnJvbVwiIDogQHNlbGVjdGVkLndlZWsgLSAwLjVcblxuXG4gICAgZGlzcGxheURhdGEgPSBbXVxuICAgIGRpc3BsYXlEYXRhLnB1c2ggQGZsb3REYXRhW0BzZWxlY3RlZC5pdGVtVHlwZV0gICAgICBpZiBAZmxvdERhdGFbQHNlbGVjdGVkLml0ZW1UeXBlXVxuICAgIGRpc3BsYXlEYXRhLnB1c2ggQGZsb3RCZW5jaG1hcmtbQHNlbGVjdGVkLml0ZW1UeXBlXSBpZiBAZmxvdEJlbmNobWFya1tAc2VsZWN0ZWQuaXRlbVR5cGVdXG4gICAgXG4gICAgQGZsb3QgPSAkLnBsb3QgQCRlbC5maW5kKFwiI2Zsb3QtY29udGFpbmVyXCIpLCBkaXNwbGF5RGF0YSwgQGZsb3RPcHRpb25zXG5cbiAgIyBUYWtlcyB0aGUgcmVzdWx0cyBmb3IgZWFjaCBpdGVtVHlwZSBhbmQgcmVwbGFjZXMgdGhlbSB3aXRoIGFuIGF2ZXJhZ2VcbiAgYWdncmVnYXRlOiAob2xkUm93cykgLT5cblxuICAgIG5ld1Jvd3MgPSBbXVxuICAgIGZvciByb3csIGkgaW4gb2xkUm93c1xuICAgICAgbmV3Um93c1tpXSA9XG4gICAgICAgIFwicGFydFwiICAgICAgOiByb3cucGFydFxuICAgICAgICBcIml0ZW1UeXBlc1wiIDogW11cblxuICAgICAgZm9yIHJlc3VsdHMgaW4gcm93Lml0ZW1UeXBlc1xuXG4gICAgICAgICMgYmxhbmtcbiAgICAgICAgbWVhbiA9XG4gICAgICAgICAgXCJuYW1lXCIgICAgICAgICAgIDogXCJcIlxuICAgICAgICAgIFwia2V5XCIgICAgICAgICAgICA6IFwiXCJcbiAgICAgICAgICBcImNvcnJlY3RcIiAgICAgICAgOiAwXG4gICAgICAgICAgXCJhdHRlbXB0ZWRcIiAgICAgIDogMFxuICAgICAgICAgIFwiaXRlbXNQZXJNaW51dGVcIiA6IDBcblxuICAgICAgICAjIGFkZFxuICAgICAgICBmb3IgcmVzdWx0IGluIHJlc3VsdHNcbiAgICAgICAgICBtZWFuLm5hbWUgICAgICAgICAgID0gcmVzdWx0Lm5hbWVcbiAgICAgICAgICBtZWFuLmtleSAgICAgICAgICAgID0gcmVzdWx0LmtleVxuICAgICAgICAgIG1lYW4uY29ycmVjdCAgICAgICAgKz0gcmVzdWx0LmNvcnJlY3RcbiAgICAgICAgICBtZWFuLmF0dGVtcHRlZCAgICAgICs9IHJlc3VsdC5hdHRlbXB0ZWRcbiAgICAgICAgICBtZWFuLml0ZW1zUGVyTWludXRlICs9IHJlc3VsdC5pdGVtc1Blck1pbnV0ZVxuXG4gICAgICAgICMgZGl2aWRlXG4gICAgICAgIG1lYW4uY29ycmVjdCAgICAgICAgLz0gcmVzdWx0cy5sZW5ndGhcbiAgICAgICAgbWVhbi5hdHRlbXB0ZWQgICAgICAvPSByZXN1bHRzLmxlbmd0aFxuICAgICAgICBtZWFuLml0ZW1zUGVyTWludXRlIC89IHJlc3VsdHMubGVuZ3RoXG5cbiAgICAgICAgIyBSb3VuZFxuICAgICAgICBtZWFuLmNvcnJlY3QgPSBNYXRoLnJvdW5kKG1lYW4uY29ycmVjdClcbiAgICAgICAgbWVhbi5hdHRlbXB0ZWQgPSBNYXRoLnJvdW5kKG1lYW4uYXR0ZW1wdGVkKVxuICAgICAgICBtZWFuLml0ZW1zUGVyTWludXRlID0gTWF0aC5yb3VuZChtZWFuLml0ZW1zUGVyTWludXRlKVxuXG4gICAgICAgICMgcmVwbGFjZSB2YWx1ZXMgaW4gQHJvd3NcbiAgICAgICAgbmV3Um93c1tpXS5pdGVtVHlwZXMucHVzaCBtZWFuXG5cbiAgICByZXR1cm4gbmV3Um93c1xuXG5jbGFzcyBTb3J0ZWRDb2xsZWN0aW9uXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICBAc29ydGVkICAgID0gW11cbiAgICBAbW9kZWxzICAgID0gb3B0aW9ucy5tb2RlbHNcbiAgICBAYXR0cmlidXRlID0gb3B0aW9ucy5hdHRyaWJ1dGVcbiAgICAiXX0=
