var LocationRunView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LocationRunView = (function(superClass) {
  extend(LocationRunView, superClass);

  function LocationRunView() {
    return LocationRunView.__super__.constructor.apply(this, arguments);
  }

  LocationRunView.prototype.className = "LocationRunView";

  LocationRunView.prototype.events = {
    "click .school_list li": "autofill",
    "keyup input": "showOptions",
    "click .clear": "clearInputs",
    "change select": "onSelectChange"
  };

  LocationRunView.prototype.i18n = function() {
    return this.text = {
      clear: t("LocationRunView.button.clear")
    };
  };

  LocationRunView.prototype.initialize = function(options) {
    var i, k, l, len, len1, len2, level, location, locationData, m, ref, ref1, template;
    this.i18n();
    this.model = options.model;
    this.parent = options.parent;
    this.dataEntry = options.dataEntry;
    this.levels = this.model.get("levels") || [];
    this.locations = this.model.get("locations") || [];
    if (this.levels.length === 1 && this.levels[0] === "") {
      this.levels = [];
    }
    if (this.locations.length === 1 && this.locations[0] === "") {
      this.locations = [];
    }
    this.haystack = [];
    ref = this.locations;
    for (i = k = 0, len = ref.length; k < len; i = ++k) {
      location = ref[i];
      this.haystack[i] = [];
      for (l = 0, len1 = location.length; l < len1; l++) {
        locationData = location[l];
        this.haystack[i].push(locationData.toLowerCase());
      }
    }
    template = "<li data-index='{{i}}'>";
    ref1 = this.levels;
    for (i = m = 0, len2 = ref1.length; m < len2; i = ++m) {
      level = ref1[i];
      template += "{{level_" + i + "}}";
      if (i !== this.levels.length - 1) {
        template += " - ";
      }
    }
    template += "</li>";
    return this.li = _.template(template);
  };

  LocationRunView.prototype.clearInputs = function() {
    this.$el.empty();
    return this.render();
  };

  LocationRunView.prototype.autofill = function(event) {
    var i, index, k, len, level, location, ref, results1;
    this.$el.find(".autofill").fadeOut(250);
    index = $(event.target).attr("data-index");
    location = this.locations[index];
    ref = this.levels;
    results1 = [];
    for (i = k = 0, len = ref.length; k < len; i = ++k) {
      level = ref[i];
      results1.push(this.$el.find("#level_" + i).val(location[i]));
    }
    return results1;
  };

  LocationRunView.prototype.showOptions = function(event) {
    var atLeastOne, fieldIndex, html, i, isThere, j, k, l, len, len1, len2, len3, m, n, needle, o, otherField, ref, ref1, ref2, result, results, stack;
    needle = $(event.target).val().toLowerCase();
    fieldIndex = parseInt($(event.target).attr('data-level'));
    for (otherField = k = 0, ref = this.haystack.length; 0 <= ref ? k <= ref : k >= ref; otherField = 0 <= ref ? ++k : --k) {
      this.$el.find("#autofill_" + otherField).hide();
    }
    atLeastOne = false;
    results = [];
    ref1 = this.haystack;
    for (i = l = 0, len = ref1.length; l < len; i = ++l) {
      stack = ref1[i];
      isThere = ~this.haystack[i][fieldIndex].indexOf(needle);
      if (isThere) {
        results.push(i);
      }
      if (isThere) {
        atLeastOne = true;
      }
    }
    ref2 = this.haystack;
    for (i = m = 0, len1 = ref2.length; m < len1; i = ++m) {
      stack = ref2[i];
      for (j = n = 0, len2 = stack.length; n < len2; j = ++n) {
        otherField = stack[j];
        if (j === fieldIndex) {
          continue;
        }
        isThere = ~this.haystack[i][j].indexOf(needle);
        if (isThere && !~results.indexOf(i)) {
          results.push(i);
        }
        if (isThere) {
          atLeastOne = true;
        }
      }
    }
    if (atLeastOne) {
      html = "";
      for (o = 0, len3 = results.length; o < len3; o++) {
        result = results[o];
        html += this.getLocationLi(result);
      }
      this.$el.find("#autofill_" + fieldIndex).fadeIn(250);
      return this.$el.find("#school_list_" + fieldIndex).html(html);
    } else {
      return this.$el.find("#autofill_" + fieldIndex).fadeOut(250);
    }
  };

  LocationRunView.prototype.getLocationLi = function(i) {
    var j, k, len, location, ref, templateInfo;
    templateInfo = {
      "i": i
    };
    ref = this.locations[i];
    for (j = k = 0, len = ref.length; k < len; j = ++k) {
      location = ref[j];
      templateInfo["level_" + j] = location;
    }
    return this.li(templateInfo);
  };

  LocationRunView.prototype.render = function() {
    var html, i, isDisabled, k, l, len, len1, level, levelOptions, previous, previousLevel, ref, ref1, schoolListElements;
    schoolListElements = "";
    html = "<button class='clear command'>" + this.text.clear + "</button>";
    if (!this.dataEntry) {
      previous = this.parent.parent.result.getByHash(this.model.get('hash'));
    }
    if (this.typed) {
      ref = this.levels;
      for (i = k = 0, len = ref.length; k < len; i = ++k) {
        level = ref[i];
        previousLevel = '';
        if (previous) {
          previousLevel = previous.location[i];
        }
        html += "<div class='label_value'> <label for='level_" + i + "'>" + level + "</label><br> <input data-level='" + i + "' id='level_" + i + "' value='" + (previousLevel || '') + "'> </div> <div id='autofill_" + i + "' class='autofill' style='display:none'> <h2>" + (t('select one from autofill list')) + "</h2> <ul class='school_list' id='school_list_" + i + "'> </ul> </div>";
      }
    } else {
      ref1 = this.levels;
      for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
        level = ref1[i];
        previousLevel = '';
        if (previous) {
          previousLevel = previous.location[i];
        }
        levelOptions = this.getOptions(i, previousLevel);
        isDisabled = (i !== 0 && !previousLevel) && "disabled='disabled'";
        html += "<div class='label_value'> <label for='level_" + i + "'>" + level + "</label><br> <select id='level_" + i + "' data-level='" + i + "' " + (isDisabled || '') + "> " + levelOptions + " </select> </div>";
      }
    }
    this.$el.html(html);
    this.trigger("rendered");
    return this.trigger("ready");
  };

  LocationRunView.prototype.onSelectChange = function(event) {
    var $html, $target, levelChanged, newValue, nextLevel, options;
    $target = $(event.target);
    levelChanged = parseInt($target.attr("data-level"));
    newValue = $target.val();
    nextLevel = levelChanged + 1;
    if (levelChanged !== this.levels.length) {
      this.$el.find("#level_" + nextLevel).removeAttr("disabled");
      $html = this.$el.find("#level_" + nextLevel).html(this.getOptions(nextLevel));
      if ((options = $html.find("option")).length === 1) {
        return options.parent("select").trigger("change");
      }
    }
  };

  LocationRunView.prototype.getOptions = function(index, previousLevel) {
    var doneOptions, i, isNotChild, isValidChild, k, l, len, levelOptions, location, locationName, m, parentValues, previousFlag, promptOption, ref, ref1, ref2, selectPrompt, selected;
    doneOptions = [];
    levelOptions = '';
    previousFlag = false;
    parentValues = [];
    for (i = k = 0, ref = index; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
      if (i === index) {
        break;
      }
      parentValues.push(this.$el.find("#level_" + i).val());
    }
    ref1 = this.locations;
    for (i = l = 0, len = ref1.length; l < len; i = ++l) {
      location = ref1[i];
      if (!~doneOptions.indexOf(location[index])) {
        isNotChild = index === 0;
        isValidChild = true;
        for (i = m = 0, ref2 = Math.max(index - 1, 0); 0 <= ref2 ? m <= ref2 : m >= ref2; i = 0 <= ref2 ? ++m : --m) {
          if (parentValues[i] !== location[i] && !previousLevel) {
            isValidChild = false;
            break;
          }
        }
        if (isNotChild || isValidChild) {
          doneOptions.push(location[index]);
          locationName = _(location[index]).escape();
          if (location[index] === previousLevel) {
            selected = "selected='selected'";
            previousFlag = true;
          } else {
            selected = '';
          }
          levelOptions += "<option value='" + locationName + "' " + (selected || '') + ">" + locationName + "</option>";
        }
      }
    }
    if (!previousFlag) {
      selectPrompt = "selected='selected'";
    }
    promptOption = "<option " + (selectPrompt || '') + " disabled='disabled'>Please select a " + this.levels[index] + "</option>";
    if (doneOptions.length === 1) {
      return levelOptions;
    } else {
      return promptOption + " " + levelOptions;
    }
  };

  LocationRunView.prototype.getResult = function() {
    var i, level;
    return {
      "labels": (function() {
        var k, len, ref, results1;
        ref = this.levels;
        results1 = [];
        for (k = 0, len = ref.length; k < len; k++) {
          level = ref[k];
          results1.push(level.replace(/[\s-]/g, "_"));
        }
        return results1;
      }).call(this),
      "location": (function() {
        var k, len, ref, results1;
        ref = this.levels;
        results1 = [];
        for (i = k = 0, len = ref.length; k < len; i = ++k) {
          level = ref[i];
          results1.push($.trim(this.$el.find("#level_" + i).val()));
        }
        return results1;
      }).call(this)
    };
  };

  LocationRunView.prototype.getSkipped = function() {
    var i, level;
    return {
      "labels": (function() {
        var k, len, ref, results1;
        ref = this.levels;
        results1 = [];
        for (k = 0, len = ref.length; k < len; k++) {
          level = ref[k];
          results1.push(level.replace(/[\s-]/g, "_"));
        }
        return results1;
      }).call(this),
      "location": (function() {
        var k, len, ref, results1;
        ref = this.levels;
        results1 = [];
        for (i = k = 0, len = ref.length; k < len; i = ++k) {
          level = ref[i];
          results1.push("skipped");
        }
        return results1;
      }).call(this)
    };
  };

  LocationRunView.prototype.isValid = function() {
    var elements, i, input, inputs, k, len, selects;
    this.$el.find(".message").remove();
    inputs = this.$el.find("input");
    selects = this.$el.find("select");
    elements = selects.length > 0 ? selects : inputs;
    for (i = k = 0, len = elements.length; k < len; i = ++k) {
      input = elements[i];
      if (!$(input).val()) {
        return false;
      }
    }
    return true;
  };

  LocationRunView.prototype.showErrors = function() {
    var elements, input, inputs, k, len, levelName, results1, selects;
    inputs = this.$el.find("input");
    selects = this.$el.find("select");
    elements = selects.length > 0 ? selects : inputs;
    results1 = [];
    for (k = 0, len = elements.length; k < len; k++) {
      input = elements[k];
      if (!$(input).val()) {
        levelName = $('label[for=' + $(input).attr('id') + ']').text();
        results1.push($(input).after(" <span class='message'>" + (t("LocationRunView.message.must_be_filled", {
          levelName: levelName
        })) + "</span>"));
      } else {
        results1.push(void 0);
      }
    }
    return results1;
  };

  return LocationRunView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9Mb2NhdGlvblJ1blZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsZUFBQTtFQUFBOzs7QUFBTTs7Ozs7Ozs0QkFFSixTQUFBLEdBQVc7OzRCQUVYLE1BQUEsR0FDRTtJQUFBLHVCQUFBLEVBQTBCLFVBQTFCO0lBQ0EsYUFBQSxFQUFpQixhQURqQjtJQUVBLGNBQUEsRUFBaUIsYUFGakI7SUFHQSxlQUFBLEVBQWtCLGdCQUhsQjs7OzRCQUtGLElBQUEsR0FBTSxTQUFBO1dBQ0osSUFBQyxDQUFBLElBQUQsR0FDRTtNQUFBLEtBQUEsRUFBUSxDQUFBLENBQUUsOEJBQUYsQ0FBUjs7RUFGRTs7NEJBSU4sVUFBQSxHQUFZLFNBQUMsT0FBRDtBQUVWLFFBQUE7SUFBQSxJQUFDLENBQUEsSUFBRCxDQUFBO0lBRUEsSUFBQyxDQUFBLEtBQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLE1BQUQsR0FBYSxPQUFPLENBQUM7SUFDckIsSUFBQyxDQUFBLFNBQUQsR0FBYSxPQUFPLENBQUM7SUFHckIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxRQUFYLENBQUEsSUFBOEI7SUFDeEMsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxXQUFYLENBQUEsSUFBMkI7SUFFeEMsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsS0FBa0IsQ0FBbEIsSUFBd0IsSUFBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBLENBQVIsS0FBYyxFQUF6QztNQUNFLElBQUMsQ0FBQSxNQUFELEdBQVUsR0FEWjs7SUFFQSxJQUFHLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxLQUFxQixDQUFyQixJQUEyQixJQUFDLENBQUEsU0FBVSxDQUFBLENBQUEsQ0FBWCxLQUFpQixFQUEvQztNQUNFLElBQUMsQ0FBQSxTQUFELEdBQWEsR0FE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Q0FBUSxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQWIsR0FBaUMsR0FBbkMsQ0FBdUMsQ0FBQyxJQUF4QyxDQUFBO3NCQUNaLENBQUEsQ0FBRSxLQUFGLENBQVEsQ0FBQyxLQUFULENBQWUseUJBQUEsR0FBeUIsQ0FBQyxDQUFBLENBQUUsd0NBQUYsRUFBNEM7VUFBQSxTQUFBLEVBQVksU0FBWjtTQUE1QyxDQUFELENBQXpCLEdBQTZGLFNBQTVHLEdBRkY7T0FBQSxNQUFBOzhCQUFBOztBQURGOztFQUpVOzs7O0dBdE9nQixRQUFRLENBQUMiLCJmaWxlIjoic3VidGVzdC9wcm90b3R5cGVzL0xvY2F0aW9uUnVuVmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIExvY2F0aW9uUnVuVmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiTG9jYXRpb25SdW5WaWV3XCJcblxuICBldmVudHM6XG4gICAgXCJjbGljayAuc2Nob29sX2xpc3QgbGlcIiA6IFwiYXV0b2ZpbGxcIlxuICAgIFwia2V5dXAgaW5wdXRcIiAgOiBcInNob3dPcHRpb25zXCJcbiAgICBcImNsaWNrIC5jbGVhclwiIDogXCJjbGVhcklucHV0c1wiXG4gICAgXCJjaGFuZ2Ugc2VsZWN0XCIgOiBcIm9uU2VsZWN0Q2hhbmdlXCJcblxuICBpMThuOiAtPlxuICAgIEB0ZXh0ID1cbiAgICAgIGNsZWFyIDogdChcIkxvY2F0aW9uUnVuVmlldy5idXR0b24uY2xlYXJcIilcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBpMThuKClcblxuICAgIEBtb2RlbCAgICAgPSBvcHRpb25zLm1vZGVsXG4gICAgQHBhcmVudCAgICA9IG9wdGlvbnMucGFyZW50XG4gICAgQGRhdGFFbnRyeSA9IG9wdGlvbnMuZGF0YUVudHJ5XG5cblxuICAgIEBsZXZlbHMgPSBAbW9kZWwuZ2V0KFwibGV2ZWxzXCIpICAgICAgIHx8IFtdXG4gICAgQGxvY2F0aW9ucyA9IEBtb2RlbC5nZXQoXCJsb2NhdGlvbnNcIikgfHwgW11cblxuICAgIGlmIEBsZXZlbHMubGVuZ3RoIGlzIDEgYW5kIEBsZXZlbHNbMF0gaXMgXCJcIlxuICAgICAgQGxldmVscyA9IFtdXG4gICAgaWYgQGxvY2F0aW9ucy5sZW5ndGggaXMgMSBhbmQgQGxvY2F0aW9uc1swXSBpcyBcIlwiXG4gICAgICBAbG9jYXRpb25zID0gW11cblxuICAgIEBoYXlzdGFjayA9IFtdXG5cbiAgICBmb3IgbG9jYXRpb24sIGkgaW4gQGxvY2F0aW9uc1xuICAgICAgQGhheXN0YWNrW2ldID0gW11cbiAgICAgIGZvciBsb2NhdGlvbkRhdGEgaW4gbG9jYXRpb25cbiAgICAgICAgQGhheXN0YWNrW2ldLnB1c2ggbG9jYXRpb25EYXRhLnRvTG93ZXJDYXNlKClcblxuICAgIHRlbXBsYXRlID0gXCI8bGkgZGF0YS1pbmRleD0ne3tpfX0nPlwiXG4gICAgZm9yIGxldmVsLCBpIGluIEBsZXZlbHNcbiAgICAgIHRlbXBsYXRlICs9IFwie3tsZXZlbF8je2l9fX1cIlxuICAgICAgdGVtcGxhdGUgKz0gXCIgLSBcIiB1bmxlc3MgaSBpcyBAbGV2ZWxzLmxlbmd0aC0xXG4gICAgdGVtcGxhdGUgKz0gXCI8L2xpPlwiXG5cbiAgICBAbGkgPSBfLnRlbXBsYXRlKHRlbXBsYXRlKVxuXG4gIGNsZWFySW5wdXRzOiAtPlxuICAgIEAkZWwuZW1wdHkoKVxuICAgIEByZW5kZXIoKVxuXG4gIGF1dG9maWxsOiAoZXZlbnQpIC0+XG4gICAgQCRlbC5maW5kKFwiLmF1dG9maWxsXCIpLmZhZGVPdXQoMjUwKVxuICAgIGluZGV4ID0gJChldmVudC50YXJnZXQpLmF0dHIoXCJkYXRhLWluZGV4XCIpXG4gICAgbG9jYXRpb24gPSBAbG9jYXRpb25zW2luZGV4XVxuICAgIGZvciBsZXZlbCwgaSBpbiBAbGV2ZWxzXG4gICAgICBAJGVsLmZpbmQoXCIjbGV2ZWxfI3tpfVwiKS52YWwobG9jYXRpb25baV0pXG5cblxuICBzaG93T3B0aW9uczogKGV2ZW50KSAtPlxuICAgIG5lZWRsZSA9ICQoZXZlbnQudGFyZ2V0KS52YWwoKS50b0xvd2VyQ2FzZSgpXG4gICAgZmllbGRJbmRleCA9IHBhcnNlSW50KCQoZXZlbnQudGFyZ2V0KS5hdHRyKCdkYXRhLWxldmVsJykpXG4gICAgIyBoaWRlIGlmIG90aGVycyBhcmUgc2hvd2luZ1xuICAgIGZvciBvdGhlckZpZWxkIGluIFswLi5AaGF5c3RhY2subGVuZ3RoXVxuICAgICAgQCRlbC5maW5kKFwiI2F1dG9maWxsXyN7b3RoZXJGaWVsZH1cIikuaGlkZSgpXG5cbiAgICBhdExlYXN0T25lID0gZmFsc2VcbiAgICByZXN1bHRzID0gW11cbiAgICBmb3Igc3RhY2ssIGkgaW4gQGhheXN0YWNrXG4gICAgICBpc1RoZXJlID0gfkBoYXlzdGFja1tpXVtmaWVsZEluZGV4XS5pbmRleE9mKG5lZWRsZSlcbiAgICAgIHJlc3VsdHMucHVzaCBpIGlmIGlzVGhlcmVcbiAgICAgIGF0TGVhc3RPbmUgPSB0cnVlIGlmIGlzVGhlcmVcblxuICAgIGZvciBzdGFjaywgaSBpbiBAaGF5c3RhY2tcbiAgICAgIGZvciBvdGhlckZpZWxkLCBqIGluIHN0YWNrXG4gICAgICAgIGlmIGogaXMgZmllbGRJbmRleFxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGlzVGhlcmUgPSB+QGhheXN0YWNrW2ldW2pdLmluZGV4T2YobmVlZGxlKVxuICAgICAgICByZXN1bHRzLnB1c2ggaSBpZiBpc1RoZXJlIGFuZCAhfnJlc3VsdHMuaW5kZXhPZihpKVxuICAgICAgICBhdExlYXN0T25lID0gdHJ1ZSBpZiBpc1RoZXJlXG5cbiAgICBpZiBhdExlYXN0T25lXG4gICAgICBodG1sID0gXCJcIlxuICAgICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzXG4gICAgICAgIGh0bWwgKz0gQGdldExvY2F0aW9uTGkgcmVzdWx0XG4gICAgICBAJGVsLmZpbmQoXCIjYXV0b2ZpbGxfI3tmaWVsZEluZGV4fVwiKS5mYWRlSW4oMjUwKVxuICAgICAgQCRlbC5maW5kKFwiI3NjaG9vbF9saXN0XyN7ZmllbGRJbmRleH1cIikuaHRtbCBodG1sXG5cbiAgICBlbHNlXG4gICAgICBAJGVsLmZpbmQoXCIjYXV0b2ZpbGxfI3tmaWVsZEluZGV4fVwiKS5mYWRlT3V0KDI1MClcblxuICBnZXRMb2NhdGlvbkxpOiAoaSkgLT5cbiAgICB0ZW1wbGF0ZUluZm8gPSBcImlcIiA6IGlcbiAgICBmb3IgbG9jYXRpb24sIGogaW4gQGxvY2F0aW9uc1tpXVxuICAgICAgdGVtcGxhdGVJbmZvW1wibGV2ZWxfXCIgKyBqXSA9IGxvY2F0aW9uXG4gICAgcmV0dXJuIEBsaSB0ZW1wbGF0ZUluZm9cblxuICByZW5kZXI6IC0+XG4gICAgc2Nob29sTGlzdEVsZW1lbnRzID0gXCJcIlxuXG4gICAgaHRtbCA9IFwiPGJ1dHRvbiBjbGFzcz0nY2xlYXIgY29tbWFuZCc+I3tAdGV4dC5jbGVhcn08L2J1dHRvbj5cIlxuXG4gICAgdW5sZXNzIEBkYXRhRW50cnlcbiAgICAgIHByZXZpb3VzID0gQHBhcmVudC5wYXJlbnQucmVzdWx0LmdldEJ5SGFzaChAbW9kZWwuZ2V0KCdoYXNoJykpXG5cbiAgICBpZiBAdHlwZWRcblxuICAgICAgZm9yIGxldmVsLCBpIGluIEBsZXZlbHNcbiAgICAgICAgcHJldmlvdXNMZXZlbCA9ICcnXG4gICAgICAgIGlmIHByZXZpb3VzXG4gICAgICAgICAgcHJldmlvdXNMZXZlbCA9IHByZXZpb3VzLmxvY2F0aW9uW2ldXG4gICAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdsZXZlbF8je2l9Jz4je2xldmVsfTwvbGFiZWw+PGJyPlxuICAgICAgICAgICAgPGlucHV0IGRhdGEtbGV2ZWw9JyN7aX0nIGlkPSdsZXZlbF8je2l9JyB2YWx1ZT0nI3twcmV2aW91c0xldmVsfHwnJ30nPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgaWQ9J2F1dG9maWxsXyN7aX0nIGNsYXNzPSdhdXRvZmlsbCcgc3R5bGU9J2Rpc3BsYXk6bm9uZSc+XG4gICAgICAgICAgICA8aDI+I3t0KCdzZWxlY3Qgb25lIGZyb20gYXV0b2ZpbGwgbGlzdCcpfTwvaDI+XG4gICAgICAgICAgICA8dWwgY2xhc3M9J3NjaG9vbF9saXN0JyBpZD0nc2Nob29sX2xpc3RfI3tpfSc+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICBcIlxuXG4gICAgZWxzZVxuXG4gICAgICBmb3IgbGV2ZWwsIGkgaW4gQGxldmVsc1xuXG4gICAgICAgIHByZXZpb3VzTGV2ZWwgPSAnJ1xuICAgICAgICBpZiBwcmV2aW91c1xuICAgICAgICAgIHByZXZpb3VzTGV2ZWwgPSBwcmV2aW91cy5sb2NhdGlvbltpXVxuICAgICAgICBcbiAgICAgICAgbGV2ZWxPcHRpb25zID0gQGdldE9wdGlvbnMoaSwgcHJldmlvdXNMZXZlbClcblxuICAgICAgICBpc0Rpc2FibGVkID0gKGkgaXNudCAwIGFuZCBub3QgcHJldmlvdXNMZXZlbCkgYW5kIFwiZGlzYWJsZWQ9J2Rpc2FibGVkJ1wiIFxuXG4gICAgICAgIGh0bWwgKz0gXCJcbiAgICAgICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdsZXZlbF8je2l9Jz4je2xldmVsfTwvbGFiZWw+PGJyPlxuICAgICAgICAgICAgPHNlbGVjdCBpZD0nbGV2ZWxfI3tpfScgZGF0YS1sZXZlbD0nI3tpfScgI3tpc0Rpc2FibGVkfHwnJ30+XG4gICAgICAgICAgICAgICN7bGV2ZWxPcHRpb25zfVxuICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIFwiXG4gICAgQCRlbC5odG1sIGh0bWxcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuICAgIEB0cmlnZ2VyIFwicmVhZHlcIlxuXG4gIG9uU2VsZWN0Q2hhbmdlOiAoZXZlbnQpIC0+XG4gICAgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KVxuICAgIGxldmVsQ2hhbmdlZCA9IHBhcnNlSW50KCR0YXJnZXQuYXR0cihcImRhdGEtbGV2ZWxcIikpXG4gICAgbmV3VmFsdWUgPSAkdGFyZ2V0LnZhbCgpXG4gICAgbmV4dExldmVsID0gbGV2ZWxDaGFuZ2VkICsgMVxuICAgIGlmIGxldmVsQ2hhbmdlZCBpc250IEBsZXZlbHMubGVuZ3RoXG4gICAgICBAJGVsLmZpbmQoXCIjbGV2ZWxfI3tuZXh0TGV2ZWx9XCIpLnJlbW92ZUF0dHIoXCJkaXNhYmxlZFwiKVxuICAgICAgJGh0bWwgPSBAJGVsLmZpbmQoXCIjbGV2ZWxfI3tuZXh0TGV2ZWx9XCIpLmh0bWwgQGdldE9wdGlvbnMobmV4dExldmVsKVxuICAgICAgaWYgKG9wdGlvbnMgPSAkaHRtbC5maW5kKFwib3B0aW9uXCIpKS5sZW5ndGggaXMgMVxuICAgICAgICBvcHRpb25zLnBhcmVudChcInNlbGVjdFwiKS50cmlnZ2VyIFwiY2hhbmdlXCJcblxuICBnZXRPcHRpb25zOiAoIGluZGV4LCBwcmV2aW91c0xldmVsICkgLT5cblxuICAgIGRvbmVPcHRpb25zID0gW11cbiAgICBsZXZlbE9wdGlvbnMgPSAnJ1xuXG4gICAgcHJldmlvdXNGbGFnID0gZmFsc2VcblxuICAgIHBhcmVudFZhbHVlcyA9IFtdXG4gICAgZm9yIGkgaW4gWzAuLmluZGV4XVxuICAgICAgYnJlYWsgaWYgaSBpcyBpbmRleFxuICAgICAgcGFyZW50VmFsdWVzLnB1c2ggQCRlbC5maW5kKFwiI2xldmVsXyN7aX1cIikudmFsKClcblxuICAgIGZvciBsb2NhdGlvbiwgaSBpbiBAbG9jYXRpb25zXG5cbiAgICAgIHVubGVzcyB+ZG9uZU9wdGlvbnMuaW5kZXhPZiBsb2NhdGlvbltpbmRleF1cblxuICAgICAgICBpc05vdENoaWxkID0gaW5kZXggaXMgMFxuICAgICAgICBpc1ZhbGlkQ2hpbGQgPSB0cnVlXG4gICAgICAgIGZvciBpIGluIFswLi5NYXRoLm1heChpbmRleC0xLDApXVxuXG4gICAgICAgICAgaWYgcGFyZW50VmFsdWVzW2ldIGlzbnQgbG9jYXRpb25baV0gYW5kIG5vdCBwcmV2aW91c0xldmVsXG4gICAgICAgICAgICBpc1ZhbGlkQ2hpbGQgPSBmYWxzZVxuICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICBpZiBpc05vdENoaWxkIG9yIGlzVmFsaWRDaGlsZFxuXG4gICAgICAgICAgZG9uZU9wdGlvbnMucHVzaCBsb2NhdGlvbltpbmRleF1cblxuICAgICAgICAgIGxvY2F0aW9uTmFtZSA9IF8obG9jYXRpb25baW5kZXhdKS5lc2NhcGUoKVxuICAgICAgICAgIFxuICAgICAgICAgIGlmIGxvY2F0aW9uW2luZGV4XSBpcyBwcmV2aW91c0xldmVsXG4gICAgICAgICAgICBzZWxlY3RlZCA9IFwic2VsZWN0ZWQ9J3NlbGVjdGVkJ1wiXG4gICAgICAgICAgICBwcmV2aW91c0ZsYWcgPSB0cnVlXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgc2VsZWN0ZWQgPSAnJ1xuICAgICAgICAgIGxldmVsT3B0aW9ucyArPSBcIlxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT0nI3tsb2NhdGlvbk5hbWV9JyAje3NlbGVjdGVkIG9yICcnfT4je2xvY2F0aW9uTmFtZX08L29wdGlvbj5cbiAgICAgICAgICBcIlxuXG4gICAgc2VsZWN0UHJvbXB0ID0gXCJzZWxlY3RlZD0nc2VsZWN0ZWQnXCIgdW5sZXNzIHByZXZpb3VzRmxhZ1xuXG4gICAgcHJvbXB0T3B0aW9uICA9IFwiPG9wdGlvbiAje3NlbGVjdFByb21wdCBvciAnJ30gZGlzYWJsZWQ9J2Rpc2FibGVkJz5QbGVhc2Ugc2VsZWN0IGEgI3tAbGV2ZWxzW2luZGV4XX08L29wdGlvbj5cIlxuXG4gICAgaWYgZG9uZU9wdGlvbnMubGVuZ3RoIGlzIDFcbiAgICAgIHJldHVybiBsZXZlbE9wdGlvbnNcbiAgICBlbHNlXG4gICAgICByZXR1cm4gXCJcbiAgICAgICAgI3twcm9tcHRPcHRpb259XG4gICAgICAgICN7bGV2ZWxPcHRpb25zfVxuICAgICAgXCJcblxuICBnZXRSZXN1bHQ6IC0+XG4gICAgcmV0dXJuIHtcbiAgICAgIFwibGFiZWxzXCIgICA6IChsZXZlbC5yZXBsYWNlKC9bXFxzLV0vZyxcIl9cIikgZm9yIGxldmVsIGluIEBsZXZlbHMpXG4gICAgICBcImxvY2F0aW9uXCIgOiAoJC50cmltKEAkZWwuZmluZChcIiNsZXZlbF8je2l9XCIpLnZhbCgpKSBmb3IgbGV2ZWwsIGkgaW4gQGxldmVscylcbiAgICB9XG5cbiAgZ2V0U2tpcHBlZDogLT5cbiAgICByZXR1cm4ge1xuICAgICAgXCJsYWJlbHNcIiAgIDogKGxldmVsLnJlcGxhY2UoL1tcXHMtXS9nLFwiX1wiKSBmb3IgbGV2ZWwgaW4gQGxldmVscylcbiAgICAgIFwibG9jYXRpb25cIiA6IChcInNraXBwZWRcIiBmb3IgbGV2ZWwsIGkgaW4gQGxldmVscylcbiAgICB9XG5cbiAgaXNWYWxpZDogLT5cbiAgICBAJGVsLmZpbmQoXCIubWVzc2FnZVwiKS5yZW1vdmUoKVxuICAgIGlucHV0cyA9IEAkZWwuZmluZChcImlucHV0XCIpXG4gICAgc2VsZWN0cyA9IEAkZWwuZmluZChcInNlbGVjdFwiKVxuICAgIGVsZW1lbnRzID0gaWYgc2VsZWN0cy5sZW5ndGggPiAwIHRoZW4gc2VsZWN0cyBlbHNlIGlucHV0c1xuICAgIGZvciBpbnB1dCwgaSBpbiBlbGVtZW50c1xuICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyAkKGlucHV0KS52YWwoKVxuICAgIHRydWVcblxuICBzaG93RXJyb3JzOiAtPlxuICAgIGlucHV0cyA9IEAkZWwuZmluZChcImlucHV0XCIpXG4gICAgc2VsZWN0cyA9IEAkZWwuZmluZChcInNlbGVjdFwiKVxuICAgIGVsZW1lbnRzID0gaWYgc2VsZWN0cy5sZW5ndGggPiAwIHRoZW4gc2VsZWN0cyBlbHNlIGlucHV0c1xuICAgIGZvciBpbnB1dCBpbiBlbGVtZW50c1xuICAgICAgdW5sZXNzICQoaW5wdXQpLnZhbCgpXG4gICAgICAgIGxldmVsTmFtZSA9ICQoJ2xhYmVsW2Zvcj0nKyQoaW5wdXQpLmF0dHIoJ2lkJykrJ10nKS50ZXh0KClcbiAgICAgICAgJChpbnB1dCkuYWZ0ZXIgXCIgPHNwYW4gY2xhc3M9J21lc3NhZ2UnPiN7dChcIkxvY2F0aW9uUnVuVmlldy5tZXNzYWdlLm11c3RfYmVfZmlsbGVkXCIsIGxldmVsTmFtZSA6IGxldmVsTmFtZSl9PC9zcGFuPlwiXG4iXX0=
