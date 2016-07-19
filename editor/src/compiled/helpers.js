var ResultOfGrid, ResultOfMultiple, ResultOfPrevious, ResultOfQuestion, Robbert, Tangerine, TangerineTree, Utils, i, km, sks,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

ResultOfQuestion = function(name) {
  var candidateView, index, k, len, ref, returnView;
  returnView = null;
  index = vm.currentView.orderMap[vm.currentView.index];
  ref = vm.currentView.subtestViews[index].prototypeView.questionViews;
  for (k = 0, len = ref.length; k < len; k++) {
    candidateView = ref[k];
    if (candidateView.model.get("name") === name) {
      returnView = candidateView;
    }
  }
  if (returnView === null) {
    throw new ReferenceError("ResultOfQuestion could not find variable " + name);
  }
  if (returnView.answer) {
    return returnView.answer;
  }
  return null;
};

ResultOfMultiple = function(name) {
  var candidateView, index, k, key, len, ref, ref1, result, returnView, value;
  returnView = null;
  index = vm.currentView.orderMap[vm.currentView.index];
  ref = vm.currentView.subtestViews[index].prototypeView.questionViews;
  for (k = 0, len = ref.length; k < len; k++) {
    candidateView = ref[k];
    if (candidateView.model.get("name") === name) {
      returnView = candidateView;
    }
  }
  if (returnView === null) {
    throw new ReferenceError("ResultOfQuestion could not find variable " + name);
  }
  result = [];
  ref1 = returnView.answer;
  for (key in ref1) {
    value = ref1[key];
    if (value === "checked") {
      result.push(key);
    }
  }
  return result;
};

ResultOfPrevious = function(name) {
  return vm.currentView.result.getVariable(name);
};

ResultOfGrid = function(name) {
  return vm.currentView.result.getItemResultCountByVariableName(name, "correct");
};

Tangerine = Tangerine != null ? Tangerine : {};

Tangerine.onBackButton = function(event) {
  if (Tangerine.activity === "assessment run") {
    if (confirm(t("NavigationView.message.incomplete_main_screen"))) {
      Tangerine.activity = "";
      return window.history.back();
    } else {
      return false;
    }
  } else {
    return window.history.back();
  }
};

Backbone.View.prototype.close = function() {
  this.remove();
  this.unbind();
  return typeof this.onClose === "function" ? this.onClose() : void 0;
};

Backbone.Collection.prototype.indexBy = function(attr) {
  var k, key, len, oneModel, ref, result;
  result = {};
  ref = this.models;
  for (k = 0, len = ref.length; k < len; k++) {
    oneModel = ref[k];
    if (oneModel.has(attr)) {
      key = oneModel.get(attr);
      if (result[key] == null) {
        result[key] = [];
      }
      result[key].push(oneModel);
    }
  }
  return result;
};

Backbone.Collection.prototype.indexArrayBy = function(attr) {
  var k, key, len, oneModel, ref, result;
  result = [];
  ref = this.models;
  for (k = 0, len = ref.length; k < len; k++) {
    oneModel = ref[k];
    if (oneModel.has(attr)) {
      key = oneModel.get(attr);
      if (result[key] == null) {
        result[key] = [];
      }
      result[key].push(oneModel);
    }
  }
  return result;
};

Backbone.Model.prototype.conform = function(standard) {
  var key, results, value;
  if (standard == null) {
    standard = {};
  }
  if (_.isEmpty(standard)) {
    throw "Cannot conform to empty standard. Use @clear() instead.";
  }
  results = [];
  for (key in standard) {
    value = standard[key];
    if (this.has(key) || this.get(key) === "") {
      results.push(this.set(key, value()));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

Backbone.Model.prototype.prune = function(shape) {
  var key, ref, results, value;
  if (shape == null) {
    shape = {};
  }
  if (_.isEmpty(standard)) {
    throw "Cannot conform to empty standard. Use @clear() instead.";
  }
  ref = this.attributes;
  results = [];
  for (key in ref) {
    value = ref[key];
    if (indexOf.call(standard, key) < 0) {
      results.push(this.unset(key));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

Backbone.Model.prototype.toHash = function() {
  var key, ref, significantAttributes, value;
  significantAttributes = {};
  ref = this.attributes;
  for (key in ref) {
    value = ref[key];
    if (!~['_rev', '_id', 'hash', 'updated', 'editedBy'].indexOf(key)) {
      significantAttributes[key] = value;
    }
  }
  return b64_sha1(JSON.stringify(significantAttributes));
};

Backbone.Model.prototype._beforeSave = function() {
  if (typeof this.beforeSave === "function") {
    this.beforeSave();
  }
  return this.stamp();
};

Backbone.Model.prototype.stamp = function() {
  var ref;
  return this.set({
    "editedBy": (Tangerine != null ? (ref = Tangerine.user) != null ? ref.name() : void 0 : void 0) || "unknown",
    "updated": (new Date()).toString(),
    "hash": this.toHash(),
    "fromInstanceId": Tangerine.settings.getString("instanceId")
  });
};

Backbone.Model.prototype.getNumber = function(key) {
  if (this.has(key)) {
    return parseInt(this.get(key));
  } else {
    return 0;
  }
};

Backbone.Model.prototype.getArray = function(key) {
  if (this.has(key)) {
    return this.get(key);
  } else {
    return [];
  }
};

Backbone.Model.prototype.getString = function(key) {
  if (this.has(key)) {
    return this.get(key);
  } else {
    return "";
  }
};

Backbone.Model.prototype.getEscapedString = function(key) {
  if (this.has(key)) {
    return this.escape(key);
  } else {
    return "";
  }
};

Backbone.Model.prototype.getBoolean = function(key) {
  if (this.has(key)) {
    return this.get(key) === true || this.get(key) === 'true';
  }
};

(function($) {
  $.fn.scrollTo = function(speed, callback) {
    var e, error1;
    if (speed == null) {
      speed = 250;
    }
    try {
      $('html, body').animate({
        scrollTop: $(this).offset().top + 'px'
      }, speed, null, callback);
    } catch (error1) {
      e = error1;
      console.log("error", e);
      console.log("Scroll error with 'this'", this);
    }
    return this;
  };
  $.fn.topCenter = function() {
    this.css("position", "absolute");
    this.css("top", $(window).scrollTop() + "px");
    return this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
  };
  $.fn.middleCenter = function() {
    this.css("position", "absolute");
    this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
    return this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
  };
  $.fn.widthPercentage = function() {
    return Math.round(100 * this.outerWidth() / this.offsetParent().width()) + '%';
  };
  $.fn.heightPercentage = function() {
    return Math.round(100 * this.outerHeight() / this.offsetParent().height()) + '%';
  };
  return $.fn.getStyleObject = function() {
    var camel, camelize, dom, k, l, len, len1, prop, returns, style, val;
    dom = this.get(0);
    returns = {};
    if (window.getComputedStyle) {
      camelize = function(a, b) {
        return b.toUpperCase();
      };
      style = window.getComputedStyle(dom, null);
      for (k = 0, len = style.length; k < len; k++) {
        prop = style[k];
        camel = prop.replace(/\-([a-z])/g, camelize);
        val = style.getPropertyValue(prop);
        returns[camel] = val;
      }
      return returns;
    }
    if (dom.currentStyle) {
      style = dom.currentStyle;
      for (l = 0, len1 = style.length; l < len1; l++) {
        prop = style[l];
        returns[prop] = style[prop];
      }
      return returns;
    }
    return this.css();
  };
})(jQuery);

$.ajaxSetup({
  statusCode: {
    404: function(xhr, status, message) {
      var code, seeUnauthorized, statusText;
      code = xhr.status;
      statusText = xhr.statusText;
      seeUnauthorized = ~xhr.responseText.indexOf("unauthorized");
      if (seeUnauthorized) {
        Utils.midAlert("Session closed<br>Please log in and try again.");
        return Tangerine.user.logout();
      }
    }
  }
});

km = {
  "0": 48,
  "1": 49,
  "2": 50,
  "3": 51,
  "4": 52,
  "5": 53,
  "6": 54,
  "7": 55,
  "8": 56,
  "9": 57,
  "a": 65,
  "b": 66,
  "c": 67,
  "d": 68,
  "e": 69,
  "f": 70,
  "g": 71,
  "h": 72,
  "i": 73,
  "j": 74,
  "k": 75,
  "l": 76,
  "m": 77,
  "n": 78,
  "o": 79,
  "p": 80,
  "q": 81,
  "r": 82,
  "s": 83,
  "t": 84,
  "u": 85,
  "v": 86,
  "w": 87,
  "x": 88,
  "y": 89,
  "z": 90
};

sks = [
  {
    q: (function() {
      var k, results;
      results = [];
      for (i = k = 0; k <= 9; i = ++k) {
        results.push(km["2001update"[i]]);
      }
      return results;
    })(),
    i: 0,
    c: function() {
      return Utils.updateTangerine(function() {
        return Utils.midAlert("Updated, please refresh.");
      });
    }
  }
];

$(document).keydown(function(e) {
  var j, k, len, results, sk;
  results = [];
  for (j = k = 0, len = sks.length; k < len; j = ++k) {
    sk = sks[j];
    results.push(e.keyCode === sks[j].q[sks[j].i++] ? sks[j].i === sks[j].q.length ? sks[j]['c']() : void 0 : sks[j].i = 0);
  }
  return results;
});

String.prototype.safetyDance = function() {
  return this.replace(/\s/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
};

String.prototype.databaseSafetyDance = function() {
  return this.replace(/\s/g, "_").toLowerCase().replace(/[^a-z0-9_-]/g, "");
};

String.prototype.count = function(substring) {
  var ref;
  return ((ref = this.match(new RegExp(substring, "g"))) != null ? ref.length : void 0) || 0;
};

Math.ave = function() {
  var k, len, result, x;
  result = 0;
  for (k = 0, len = arguments.length; k < len; k++) {
    x = arguments[k];
    result += x;
  }
  result /= arguments.length;
  return result;
};

Math.isInt = function() {
  return typeof n === 'number' && parseFloat(n) === parseInt(n, 10) && !isNaN(n);
};

Math.decimals = function(num, decimals) {
  var m;
  m = Math.pow(10, decimals);
  num *= m;
  num = num + num<0?-0.5:+0.5 >> 0;
  return num /= m;
};

Math.commas = function(num) {
  return parseInt(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

Math.limit = function(min, num, max) {
  return Math.max(min, Math.min(num, max));
};

_.isEmptyString = function(aString) {
  if (aString === null || aString === void 0) {
    return true;
  }
  if (!(_.isString(aString) || _.isNumber(aString))) {
    return false;
  }
  if (_.isNumber(aString)) {
    aString = String(aString);
  }
  if (aString.replace(/\s*/, '') === '') {
    return true;
  }
  return false;
};

_.indexBy = function(propertyName, objectArray) {
  var k, key, len, oneObject, result;
  result = {};
  for (k = 0, len = objectArray.length; k < len; k++) {
    oneObject = objectArray[k];
    if (oneObject[propertyName] != null) {
      key = oneObject[propertyName];
      if (result[key] == null) {
        result[key] = [];
      }
      result[key].push(oneObject);
    }
  }
  return result;
};

Utils = (function() {
  function Utils() {}

  Utils.changeLanguage = function(code, callback) {
    return i18n.setLng(code, callback);
  };

  Utils.resave = function() {
    var updateCollections, updateModels;
    updateModels = function(models, callback) {
      if (models.length === 0) {
        return callback();
      }
      return models.pop().save(null, {
        success: function(model) {
          console.log(model.url);
          return updateModels(models, callback);
        }
      });
    };
    updateCollections = function(collections, callback) {
      var collection;
      if (collections.length === 0) {
        return callback();
      }
      collection = new (collections.pop());
      return collection.fetch({
        success: function() {
          return updateModels(collection, function() {
            return updateCollections(collections, callback);
          });
        }
      });
    };
    return updateCollections([Assessments, Subtests, Questions], function() {
      return console.log("All done");
    });
  };

  Utils.execute = function(functions) {
    var step;
    step = function() {
      var nextFunction;
      nextFunction = functions.shift();
      return typeof nextFunction === "function" ? nextFunction(step) : void 0;
    };
    return step();
  };

  Utils.loadCollections = function(loadOptions) {
    var getNext, toLoad;
    if (loadOptions.complete == null) {
      throw "You're gonna want a callback in there, buddy.";
    }
    toLoad = loadOptions.collections || [];
    getNext = function(options) {
      var current, memberName;
      if (current = toLoad.pop()) {
        memberName = current.underscore().camelize(true);
        console.log("memberName: " + memberName + " current: " + current);
        options[memberName] = new window[current];
        return options[memberName].fetch({
          success: function() {
            return getNext(options);
          }
        });
      } else {
        return loadOptions.complete(options);
      }
    };
    return getNext({});
  };

  Utils.universalUpload = function() {
    return $.ajax({
      url: Tangerine.settings.urlView("local", "byCollection"),
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify({
        keys: ["result"]
      }),
      success: function(data) {
        var docList;
        docList = _.pluck(data.rows, "id");
        return $.couch.replicate(Tangerine.settings.urlDB("local"), Tangerine.settings.urlDB("group"), {
          success: (function(_this) {
            return function() {
              return Utils.sticky("Results synced to cloud successfully.");
            };
          })(this),
          error: (function(_this) {
            return function(code, message) {
              return Utils.sticky("Upload error<br>" + code + " " + message);
            };
          })(this)
        }, {
          doc_ids: docList
        });
      }
    });
  };

  Utils.restartTangerine = function(message, callback) {
    Utils.midAlert("" + (message || 'Restarting Tangerine'));
    return _.delay(function() {
      document.location.reload();
      return typeof callback === "function" ? callback() : void 0;
    }, 2000);
  };

  Utils.onUpdateSuccess = function(totalDocs) {
    Utils.documentCounter++;
    if (Utils.documentCounter === totalDocs) {
      Utils.restartTangerine("Update successful", function() {
        return Tangerine.router.navigate("", false);
      });
      return Utils.documentCounter = null;
    }
  };

  Utils.updateTangerine = function(doResolve, options) {
    var dDoc, docIds, targetDB;
    if (doResolve == null) {
      doResolve = true;
    }
    if (options == null) {
      options = {};
    }
    if (!Tangerine.user.isAdmin()) {
      return;
    }
    Utils.documentCounter = 0;
    dDoc = "ojai";
    targetDB = options.targetDB || Tangerine.db_name;
    docIds = options.docIds || ["_design/" + dDoc, "configuration"];
    Utils.midAlert("Updating...");
    Utils.working(true);
    return Tangerine.$db.allDocs({
      keys: docIds,
      success: function(response) {
        var k, len, oldDocs, ref, row;
        oldDocs = [];
        ref = response.rows;
        for (k = 0, len = ref.length; k < len; k++) {
          row = ref[k];
          oldDocs.push({
            "_id": row.id,
            "_rev": row.value.rev
          });
        }
        return $.couch.replicate(Tangerine.settings.urlDB("update"), targetDB, {
          error: function(error) {
            Utils.working(false);
            Utils.midAlert("Update failed replicating<br>" + error);
            return Utils.documentCounter = null;
          },
          success: function() {
            var docId, l, len1, oldDoc, results, totalDocs;
            if (!doResolve) {
              Utils.onUpdateSuccess(1);
              return;
            }
            totalDocs = docIds.length;
            results = [];
            for (i = l = 0, len1 = docIds.length; l < len1; i = ++l) {
              docId = docIds[i];
              oldDoc = oldDocs[i];
              results.push((function(docId, oldDoc, totalDocs) {
                return Tangerine.$db.openDoc(docId, {
                  conflicts: true,
                  success: function(data) {
                    if (data._conflicts != null) {
                      return Tangerine.$db.removeDoc(oldDoc, {
                        success: function() {
                          Utils.working(false);
                          return Utils.onUpdateSuccess(totalDocs);
                        },
                        error: function(error) {
                          Utils.documentCounter = null;
                          Utils.working(false);
                          return Utils.midAlert("Update failed resolving conflict<br>" + error);
                        }
                      });
                    } else {
                      return Utils.onUpdateSuccess(totalDocs);
                    }
                  }
                });
              })(docId, oldDoc, totalDocs));
            }
            return results;
          }
        }, {
          doc_ids: docIds
        });
      }
    });
  };

  Utils.log = function(self, error) {
    var className;
    className = self.constructor.toString().match(/function\s*(\w+)/)[1];
    return console.log(className + ": " + error);
  };

  Utils.data = function() {
    var arg, args, key, value;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (args.length === 1) {
      arg = args[0];
      if (_.isString(arg)) {
        return Tangerine.tempData[arg];
      } else if (_.isObject(arg)) {
        return Tangerine.tempData = $.extend(Tangerine.tempData, arg);
      } else if (arg === null) {
        return Tangerine.tempData = {};
      }
    } else if (args.length === 2) {
      key = args[0];
      value = args[1];
      Tangerine.tempData[key] = value;
      return Tangerine.tempData;
    } else if (args.length === 0) {
      return Tangerine.tempData;
    }
  };

  Utils.working = function(isWorking) {
    if (isWorking) {
      if (Tangerine.loadingTimer == null) {
        return Tangerine.loadingTimer = setTimeout(Utils.showLoadingIndicator, 3000);
      }
    } else {
      if (Tangerine.loadingTimer != null) {
        clearTimeout(Tangerine.loadingTimer);
        Tangerine.loadingTimer = null;
      }
      return $(".loading_bar").remove();
    }
  };

  Utils.showLoadingIndicator = function() {
    return $("<div class='loading_bar'><img class='loading' src='images/loading.gif'></div>").appendTo("body").middleCenter();
  };

  Utils.confirm = function(message, options) {
    var ref;
    if (((ref = navigator.notification) != null ? ref.confirm : void 0) != null) {
      navigator.notification.confirm(message, function(input) {
        if (input === 1) {
          return options.callback(true);
        } else if (input === 2) {
          return options.callback(false);
        } else {
          return options.callback(input);
        }
      }, options.title, options.action + ",Cancel");
    } else {
      if (window.confirm(message)) {
        options.callback(true);
        return true;
      } else {
        options.callback(false);
        return false;
      }
    }
    return 0;
  };

  Utils.getValues = function(selector) {
    var values;
    values = {};
    $(selector).find("input[type=text], input[type=password], textarea").each(function(index, element) {
      return values[element.id] = element.value;
    });
    return values;
  };

  Utils.cleanURL = function(url) {
    if ((typeof url.indexOf === "function" ? url.indexOf("%") : void 0) !== -1) {
      return url = decodeURIComponent(url);
    } else {
      return url;
    }
  };

  Utils.topAlert = function(alertText, delay) {
    if (delay == null) {
      delay = 2000;
    }
    return Utils.alert("top", alertText, delay);
  };

  Utils.midAlert = function(alertText, delay) {
    if (delay == null) {
      delay = 2000;
    }
    return Utils.alert("middle", alertText, delay);
  };

  Utils.alert = function(where, alertText, delay) {
    var $alert, aligner, selector;
    if (delay == null) {
      delay = 2000;
    }
    switch (where) {
      case "top":
        selector = ".top_alert";
        aligner = function($el) {
          return $el.topCenter();
        };
        break;
      case "middle":
        selector = ".mid_alert";
        aligner = function($el) {
          return $el.middleCenter();
        };
    }
    if (Utils[where + "AlertTimer"] != null) {
      clearTimeout(Utils[where + "AlertTimer"]);
      $alert = $(selector);
      $alert.html($alert.html() + "<br>" + alertText);
    } else {
      $alert = $("<div class='" + (selector.substring(1)) + " disposable_alert'>" + alertText + "</div>").appendTo("#content");
    }
    aligner($alert);
    return (function($alert, selector, delay) {
      var computedDelay;
      computedDelay = (("" + $alert.html()).match(/<br>/g) || []).length * 1500;
      return Utils[where + "AlertTimer"] = setTimeout(function() {
        Utils[where + "AlertTimer"] = null;
        return $alert.fadeOut(250, function() {
          return $(this).remove();
        });
      }, Math.max(computedDelay, delay));
    })($alert, selector, delay);
  };

  Utils.sticky = function(html, buttonText, callback, position) {
    var div;
    if (buttonText == null) {
      buttonText = "Close";
    }
    if (position == null) {
      position = "middle";
    }
    div = $("<div class='sticky_alert'>" + html + "<br><button class='command parent_remove'>" + buttonText + "</button></div>").appendTo("#content");
    if (position === "middle") {
      div.middleCenter();
    } else if (position === "top") {
      div.topCenter();
    }
    return div.on("keyup", function(event) {
      if (event.which === 27) {
        return $(this).remove();
      }
    }).find("button").click(callback);
  };

  Utils.topSticky = function(html, buttonText, callback) {
    if (buttonText == null) {
      buttonText = "Close";
    }
    return Utils.sticky(html, buttonText, callback, "top");
  };

  Utils.modal = function(html) {
    if (html === false) {
      $("#modal_back, #modal").remove();
      return;
    }
    $("body").prepend("<div id='modal_back'></div>");
    return $("<div id='modal'>" + html + "</div>").appendTo("#content").middleCenter().on("keyup", function(event) {
      if (event.which === 27) {
        return $("#modal_back, #modal").remove();
      }
    });
  };

  Utils.passwordPrompt = function(callback) {
    var $button, $pass, html;
    html = "<div id='pass_form' title='User verification'> <label for='password'>Please re-enter your password</label> <input id='pass_val' type='password' name='password' id='password' value=''> <button class='command' data-verify='true'>Verify</button> <button class='command'>Cancel</button> </div>";
    Utils.modal(html);
    $pass = $("#pass_val");
    $button = $("#pass_form button");
    $pass.on("keyup", function(event) {
      if (event.which !== 13) {
        return true;
      }
      $button.off("click");
      $pass.off("change");
      callback($pass.val());
      return Utils.modal(false);
    });
    return $button.on("click", function(event) {
      $button.off("click");
      $pass.off("change");
      if ($(event.target).attr("data-verify") === "true") {
        callback($pass.val());
      }
      return Utils.modal(false);
    });
  };

  Utils.guid = function() {
    return this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4();
  };

  Utils.S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  Utils.humanGUID = function() {
    return this.randomLetters(4) + "-" + this.randomLetters(4) + "-" + this.randomLetters(4);
  };

  Utils.safeLetters = "abcdefghijlmnopqrstuvwxyz".split("");

  Utils.randomLetters = function(length) {
    var result;
    result = "";
    while (length--) {
      result += Utils.safeLetters[Math.floor(Math.random() * Utils.safeLetters.length)];
    }
    return result;
  };

  Utils.flash = function(color, shouldTurnItOn) {
    if (color == null) {
      color = "red";
    }
    if (shouldTurnItOn == null) {
      shouldTurnItOn = null;
    }
    if (shouldTurnItOn == null) {
      Utils.background(color);
      return setTimeout(function() {
        return Utils.background("");
      }, 1000);
    }
  };

  Utils.background = function(color) {
    if (color != null) {
      return $("#content_wrapper").css({
        "backgroundColor": color
      });
    } else {
      return $("#content_wrapper").css("backgroundColor");
    }
  };

  Utils.$_GET = function(q, s) {
    var parts, vars;
    vars = {};
    parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
      value = ~value.indexOf("#") ? value.split("#")[0] : value;
      return vars[key] = value.split("#")[0];
    });
    return vars;
  };

  Utils.resizeScrollPane = function() {
    return $(".scroll_pane").height($(window).height() - ($("#navigation").height() + $("#footer").height() + 100));
  };

  Utils.askToLogout = function() {
    if (confirm("Would you like to logout now?")) {
      return Tangerine.user.logout();
    }
  };

  Utils.oldConsoleLog = null;

  Utils.enableConsoleLog = function() {
    if (typeof oldConsoleLog === "undefined" || oldConsoleLog === null) {
      return;
    }
    return window.console.log = oldConsoleLog;
  };

  Utils.disableConsoleLog = function() {
    var oldConsoleLog;
    oldConsoleLog = console.log;
    return window.console.log = $.noop;
  };

  Utils.oldConsoleAssert = null;

  Utils.enableConsoleAssert = function() {
    if (typeof oldConsoleAssert === "undefined" || oldConsoleAssert === null) {
      return;
    }
    return window.console.assert = oldConsoleAssert;
  };

  Utils.disableConsoleAssert = function() {
    var oldConsoleAssert;
    oldConsoleAssert = console.assert;
    return window.console.assert = $.noop;
  };

  return Utils;

})();

Robbert = (function() {
  function Robbert() {}

  Robbert.fetchUsers = function(group, callback) {
    return Robbert.req({
      type: 'GET',
      url: "/group/" + group,
      success: callback,
      error: callback
    });
  };

  Robbert.req = function(options) {
    options.url = Tangerine.config.get("robbert") + options.url;
    options.contentType = 'application/json';
    options.accept = 'application/json';
    options.dataType = 'json';
    options.data = JSON.stringify(options.data);
    console.log(options);
    return $.ajax(options);
  };

  Robbert.fetchUser = function(options) {
    return Robbert.req({
      type: 'GET',
      url: "/user/" + Tangerine.user.get("name"),
      success: (function(_this) {
        return function(data) {
          return typeof options.success === "function" ? options.success(data) : void 0;
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return typeof options.error === "function" ? options.error(data) : void 0;
        };
      })(this)
    });
  };

  Robbert.newGroup = function(options) {
    return Robbert.req({
      type: 'PUT',
      url: '/group',
      data: {
        name: options.name
      },
      success: (function(_this) {
        return function(data) {
          return typeof options.success === "function" ? options.success(data) : void 0;
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return typeof options.error === "function" ? options.error(data) : void 0;
        };
      })(this)
    });
  };

  Robbert.leaveGroup = function(options) {
    return Robbert.req({
      type: 'DELETE',
      url: "/group/" + options.group + "/" + options.user,
      success: (function(_this) {
        return function(data) {
          return typeof options.success === "function" ? options.success(data) : void 0;
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return typeof options.error === "function" ? options.error(data) : void 0;
        };
      })(this)
    });
  };

  Robbert.signup = function(options) {
    return Robbert.req({
      type: 'PUT',
      url: '/user',
      data: {
        name: options.name,
        pass: options.pass
      },
      success: (function(_this) {
        return function(data) {
          return typeof options.success === "function" ? options.success(data) : void 0;
        };
      })(this),
      error: (function(_this) {
        return function(data) {
          return typeof options.error === "function" ? options.error(data) : void 0;
        };
      })(this)
    });
  };

  Robbert.rolePost = function(url, user, callback) {
    var options;
    options = {
      type: 'POST',
      url: ("/group/" + (Tangerine.settings.get("groupName"))) + url,
      data: {
        user: user
      },
      success: callback,
      error: callback,
      complete: function(res) {
        return Utils.midAlert(res.responseJSON.message);
      }
    };
    return Robbert.req(options);
  };

  Robbert.addAdmin = function(user, callback) {
    return Robbert.rolePost("/add-admin", user, callback);
  };

  Robbert.addMember = function(user, callback) {
    return Robbert.rolePost("/add-member", user, callback);
  };

  Robbert.removeAdmin = function(user, callback) {
    return Robbert.rolePost("/remove-admin", user, callback);
  };

  Robbert.removeMember = function(user, callback) {
    return Robbert.rolePost("/remove-member", user, callback);
  };

  return Robbert;

})();

TangerineTree = (function() {
  function TangerineTree() {}

  TangerineTree.generateJsonAndMAke = function() {
    var url;
    url = Tangerine.settings.urlView("group", "assessmentsNotArchived");
    console.log("url: " + url);
    return $.ajax({
      url: Tangerine.settings.urlView("group", "assessmentsNotArchived"),
      dataType: "json",
      success: (function(_this) {
        return function(data) {
          var dKeyQuery, dKeys;
          console.log("data: " + JSON.stringify(data));
          dKeys = data.rows.map(function(row) {
            return row.id.substr(-5);
          });
          dKeyQuery = {
            keys: dKeys
          };
          console.log("dKeyQuery:" + JSON.stringify(dKeyQuery));
          url = Tangerine.settings.urlView("group", "byDKey");
          console.log("url: " + url);
          return $.ajax({
            url: Tangerine.settings.urlView("group", "byDKey"),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(dKeyQuery),
            success: function(data) {
              var keyList;
              console.log("data: " + JSON.stringify(data));
              keyList = [];
              keyList = data.rows.map(function(row) {
                return row.id;
              });
              keyList = _.uniq(keyList);
              keyList.push("settings");
              console.log("keyList: " + JSON.stringify(keyList));
              return Tangerine.$db.allDocs({
                keys: keyList,
                success: function(response) {
                  var body, docs, k, len, ref, row;
                  docs = [];
                  ref = response.rows;
                  for (k = 0, len = ref.length; k < len; k++) {
                    row = ref[k];
                    docs.push(row.doc);
                  }
                  body = {
                    docs: docs
                  };
                  return body;
                }
              });
            }
          });
        };
      })(this),
      error: function(a, b) {
        console.log("a: " + a);
        return Utils.midAlert("Import error");
      }
    });
  };

  TangerineTree.make = function(options) {
    var url;
    Utils.working(true);
    url = Tangerine.settings.urlView("group", "assessmentsNotArchived");
    return $.ajax({
      url: Tangerine.settings.urlView("group", "assessmentsNotArchived"),
      dataType: "json",
      success: (function(_this) {
        return function(data) {
          var dKeyQuery, dKeys;
          dKeys = data.rows.map(function(row) {
            return row.id.substr(-5);
          });
          dKeyQuery = {
            keys: dKeys
          };
          url = Tangerine.settings.urlView("group", "byDKey");
          return $.ajax({
            url: Tangerine.settings.urlView("group", "byDKey"),
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(dKeyQuery),
            success: function(data) {
              var keyList;
              keyList = [];
              keyList = data.rows.map(function(row) {
                return row.id;
              });
              keyList = _.uniq(keyList);
              keyList.push("settings");
              return Tangerine.$db.allDocs({
                keys: keyList,
                include_docs: true,
                success: function(response) {
                  var body, docs, error, k, len, payload, ref, row, success;
                  docs = [];
                  ref = response.rows;
                  for (k = 0, len = ref.length; k < len; k++) {
                    row = ref[k];
                    docs.push(row.doc);
                  }
                  body = {
                    docs: docs
                  };
                  success = options.success;
                  error = options.error;
                  payload = JSON.stringify(body);
                  delete options.success;
                  delete options.error;
                  return $.ajax({
                    type: 'POST',
                    crossDomain: true,
                    url: (Tangerine.config.get('tree')) + "/group-" + (Tangerine.settings.get('groupName')) + "/" + (Tangerine.settings.get('hostname')),
                    dataType: 'json',
                    contentType: "application/json",
                    data: payload,
                    success: (function(_this) {
                      return function(data) {
                        return success(data);
                      };
                    })(this),
                    error: (function(_this) {
                      return function(data) {
                        return error(data, JSON.parse(data.responseText));
                      };
                    })(this),
                    complete: function() {
                      return Utils.working(false);
                    }
                  });
                }
              });
            }
          });
        };
      })(this),
      error: function(a, b) {
        console.log("a: " + a);
        return Utils.midAlert("Import error");
      }
    });
  };

  return TangerineTree;

})();

$(function() {
  $("#content").on("click", ".clear_message", null, function(a) {
    return $(a.target).parent().fadeOut(250, function() {
      return $(this).empty().show();
    });
  });
  $("#content").on("click", ".parent_remove", null, function(a) {
    return $(a.target).parent().fadeOut(250, function() {
      return $(this).remove();
    });
  });
  $("#content").on("click", ".alert_button", function() {
    var alert_text;
    alert_text = $(this).attr("data-alert") ? $(this).attr("data-alert") : $(this).val();
    return Utils.disposableAlert(alert_text);
  });
  return $("#content").on("click", ".disposable_alert", function() {
    return $(this).stop().fadeOut(100, function() {
      return $(this).remove();
    });
  });
});

//# sourceMappingURL=data:application/json;base64,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QUE7SUFBSCxDQUFsQztFQUFQLENBQWxEO0VBR0EsQ0FBQSxDQUFFLFVBQUYsQ0FBYSxDQUFDLEVBQWQsQ0FBaUIsT0FBakIsRUFBeUIsZUFBekIsRUFBMEMsU0FBQTtBQUN4QyxRQUFBO0lBQUEsVUFBQSxHQUFnQixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsSUFBUixDQUFhLFlBQWIsQ0FBSCxHQUFtQyxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsSUFBUixDQUFhLFlBQWIsQ0FBbkMsR0FBbUUsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLEdBQVIsQ0FBQTtXQUNoRixLQUFLLENBQUMsZUFBTixDQUFzQixVQUF0QjtFQUZ3QyxDQUExQztTQUdBLENBQUEsQ0FBRSxVQUFGLENBQWEsQ0FBQyxFQUFkLENBQWlCLE9BQWpCLEVBQTBCLG1CQUExQixFQUErQyxTQUFBO1dBQzdDLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxJQUFSLENBQUEsQ0FBYyxDQUFDLE9BQWYsQ0FBdUIsR0FBdkIsRUFBNEIsU0FBQTthQUMxQixDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsTUFBUixDQUFBO0lBRDBCLENBQTVCO0VBRDZDLENBQS9DO0FBWEEsQ0FBRiIsImZpbGUiOiJhcHAvaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIiNcbiMgU2tpcCBsb2dpY1xuI1xuXG4jIHRoZXNlIGNvdWxkIGVhc2lseSBiZSByZWZhY3RvcmVkIGludG8gb25lLlxuXG5SZXN1bHRPZlF1ZXN0aW9uID0gKG5hbWUpIC0+XG4gIHJldHVyblZpZXcgPSBudWxsXG4gIGluZGV4ID0gdm0uY3VycmVudFZpZXcub3JkZXJNYXBbdm0uY3VycmVudFZpZXcuaW5kZXhdXG5cbiAgZm9yIGNhbmRpZGF0ZVZpZXcgaW4gdm0uY3VycmVudFZpZXcuc3VidGVzdFZpZXdzW2luZGV4XS5wcm90b3R5cGVWaWV3LnF1ZXN0aW9uVmlld3NcbiAgICBpZiBjYW5kaWRhdGVWaWV3Lm1vZGVsLmdldChcIm5hbWVcIikgPT0gbmFtZVxuICAgICAgcmV0dXJuVmlldyA9IGNhbmRpZGF0ZVZpZXdcbiAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiUmVzdWx0T2ZRdWVzdGlvbiBjb3VsZCBub3QgZmluZCB2YXJpYWJsZSAje25hbWV9XCIpIGlmIHJldHVyblZpZXcgPT0gbnVsbFxuICByZXR1cm4gcmV0dXJuVmlldy5hbnN3ZXIgaWYgcmV0dXJuVmlldy5hbnN3ZXJcbiAgcmV0dXJuIG51bGxcblxuUmVzdWx0T2ZNdWx0aXBsZSA9IChuYW1lKSAtPlxuICByZXR1cm5WaWV3ID0gbnVsbFxuICBpbmRleCA9IHZtLmN1cnJlbnRWaWV3Lm9yZGVyTWFwW3ZtLmN1cnJlbnRWaWV3LmluZGV4XVxuXG4gIGZvciBjYW5kaWRhdGVWaWV3IGluIHZtLmN1cnJlbnRWaWV3LnN1YnRlc3RWaWV3c1tpbmRleF0ucHJvdG90eXBlVmlldy5xdWVzdGlvblZpZXdzXG4gICAgaWYgY2FuZGlkYXRlVmlldy5tb2RlbC5nZXQoXCJuYW1lXCIpID09IG5hbWVcbiAgICAgIHJldHVyblZpZXcgPSBjYW5kaWRhdGVWaWV3XG4gIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIlJlc3VsdE9mUXVlc3Rpb24gY291bGQgbm90IGZpbmQgdmFyaWFibGUgI3tuYW1lfVwiKSBpZiByZXR1cm5WaWV3ID09IG51bGxcblxuICByZXN1bHQgPSBbXVxuICBmb3Iga2V5LCB2YWx1ZSBvZiByZXR1cm5WaWV3LmFuc3dlclxuICAgIHJlc3VsdC5wdXNoIGtleSBpZiB2YWx1ZSA9PSBcImNoZWNrZWRcIlxuICByZXR1cm4gcmVzdWx0XG5cblJlc3VsdE9mUHJldmlvdXMgPSAobmFtZSkgLT5cbiAgcmV0dXJuIHZtLmN1cnJlbnRWaWV3LnJlc3VsdC5nZXRWYXJpYWJsZShuYW1lKVxuXG5SZXN1bHRPZkdyaWQgPSAobmFtZSkgLT5cbiAgcmV0dXJuIHZtLmN1cnJlbnRWaWV3LnJlc3VsdC5nZXRJdGVtUmVzdWx0Q291bnRCeVZhcmlhYmxlTmFtZShuYW1lLCBcImNvcnJlY3RcIilcblxuXG4jXG4jIFRhbmdlcmluZSBiYWNrYnV0dG9uIGhhbmRsZXJcbiNcblRhbmdlcmluZSA9IGlmIFRhbmdlcmluZT8gdGhlbiBUYW5nZXJpbmUgZWxzZSB7fVxuVGFuZ2VyaW5lLm9uQmFja0J1dHRvbiA9IChldmVudCkgLT5cbiAgaWYgVGFuZ2VyaW5lLmFjdGl2aXR5ID09IFwiYXNzZXNzbWVudCBydW5cIlxuICAgIGlmIGNvbmZpcm0gdChcIk5hdmlnYXRpb25WaWV3Lm1lc3NhZ2UuaW5jb21wbGV0ZV9tYWluX3NjcmVlblwiKVxuICAgICAgVGFuZ2VyaW5lLmFjdGl2aXR5ID0gXCJcIlxuICAgICAgd2luZG93Lmhpc3RvcnkuYmFjaygpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlXG4gIGVsc2VcbiAgICB3aW5kb3cuaGlzdG9yeS5iYWNrKClcblxuXG5cbiMgRXh0ZW5kIGV2ZXJ5IHZpZXcgd2l0aCBhIGNsb3NlIG1ldGhvZCwgdXNlZCBieSBWaWV3TWFuYWdlclxuQmFja2JvbmUuVmlldy5wcm90b3R5cGUuY2xvc2UgPSAtPlxuICBAcmVtb3ZlKClcbiAgQHVuYmluZCgpXG4gIEBvbkNsb3NlPygpXG5cblxuIyBSZXR1cm5zIGFuIG9iamVjdCBoYXNoZWQgYnkgYSBnaXZlbiBhdHRyaWJ1dGUuXG5CYWNrYm9uZS5Db2xsZWN0aW9uLnByb3RvdHlwZS5pbmRleEJ5ID0gKCBhdHRyICkgLT5cbiAgcmVzdWx0ID0ge31cbiAgZm9yIG9uZU1vZGVsIGluIEBtb2RlbHNcbiAgICBpZiBvbmVNb2RlbC5oYXMoYXR0cilcbiAgICAgIGtleSA9IG9uZU1vZGVsLmdldChhdHRyKVxuICAgICAgcmVzdWx0W2tleV0gPSBbXSBpZiBub3QgcmVzdWx0W2tleV0/XG4gICAgICByZXN1bHRba2V5XS5wdXNoKG9uZU1vZGVsKVxuICByZXR1cm4gcmVzdWx0XG5cbiMgUmV0dXJucyBhbiBvYmplY3QgaGFzaGVkIGJ5IGEgZ2l2ZW4gYXR0cmlidXRlLlxuQmFja2JvbmUuQ29sbGVjdGlvbi5wcm90b3R5cGUuaW5kZXhBcnJheUJ5ID0gKCBhdHRyICkgLT5cbiAgcmVzdWx0ID0gW11cbiAgZm9yIG9uZU1vZGVsIGluIEBtb2RlbHNcbiAgICBpZiBvbmVNb2RlbC5oYXMoYXR0cilcbiAgICAgIGtleSA9IG9uZU1vZGVsLmdldChhdHRyKVxuICAgICAgcmVzdWx0W2tleV0gPSBbXSBpZiBub3QgcmVzdWx0W2tleV0/XG4gICAgICByZXN1bHRba2V5XS5wdXNoKG9uZU1vZGVsKVxuICByZXR1cm4gcmVzdWx0XG5cbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5jb25mb3JtID0gKCBzdGFuZGFyZCA9IHt9ICkgLT5cbiAgdGhyb3cgXCJDYW5ub3QgY29uZm9ybSB0byBlbXB0eSBzdGFuZGFyZC4gVXNlIEBjbGVhcigpIGluc3RlYWQuXCIgaWYgXy5pc0VtcHR5KHN0YW5kYXJkKVxuICBmb3Iga2V5LCB2YWx1ZSBvZiBzdGFuZGFyZFxuICAgIEBzZXQoa2V5LCB2YWx1ZSgpKSBpZiBAaGFzKGtleSkgb3IgQGdldChrZXkpIGlzIFwiXCJcblxuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLnBydW5lID0gKCBzaGFwZSA9IHt9ICkgLT5cbiAgdGhyb3cgXCJDYW5ub3QgY29uZm9ybSB0byBlbXB0eSBzdGFuZGFyZC4gVXNlIEBjbGVhcigpIGluc3RlYWQuXCIgaWYgXy5pc0VtcHR5KHN0YW5kYXJkKVxuICBmb3Iga2V5LCB2YWx1ZSBvZiBAYXR0cmlidXRlc1xuICAgIEB1bnNldChrZXkpIHVubGVzcyBrZXkgaW4gc3RhbmRhcmRcblxuIyBoYXNoIHRoZSBhdHRyaWJ1dGVzIG9mIGEgbW9kZWxcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS50b0hhc2ggPSAtPlxuICBzaWduaWZpY2FudEF0dHJpYnV0ZXMgPSB7fVxuICBmb3Iga2V5LCB2YWx1ZSBvZiBAYXR0cmlidXRlc1xuICAgIHNpZ25pZmljYW50QXR0cmlidXRlc1trZXldID0gdmFsdWUgaWYgIX5bJ19yZXYnLCAnX2lkJywnaGFzaCcsJ3VwZGF0ZWQnLCdlZGl0ZWRCeSddLmluZGV4T2Yoa2V5KVxuICByZXR1cm4gYjY0X3NoYTEoSlNPTi5zdHJpbmdpZnkoc2lnbmlmaWNhbnRBdHRyaWJ1dGVzKSlcblxuIyBieSBkZWZhdWx0IGFsbCBtb2RlbHMgd2lsbCBzYXZlIGEgdGltZXN0YW1wIGFuZCBoYXNoIG9mIHNpZ25pZmljYW50IGF0dHJpYnV0ZXNcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5fYmVmb3JlU2F2ZSA9IC0+XG4gIEBiZWZvcmVTYXZlPygpXG4gIEBzdGFtcCgpXG5cbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5zdGFtcCA9IC0+XG4gIEBzZXRcbiAgICBcImVkaXRlZEJ5XCIgOiBUYW5nZXJpbmU/LnVzZXI/Lm5hbWUoKSB8fCBcInVua25vd25cIlxuICAgIFwidXBkYXRlZFwiIDogKG5ldyBEYXRlKCkpLnRvU3RyaW5nKClcbiAgICBcImhhc2hcIiA6IEB0b0hhc2goKVxuICAgIFwiZnJvbUluc3RhbmNlSWRcIiA6IFRhbmdlcmluZS5zZXR0aW5ncy5nZXRTdHJpbmcoXCJpbnN0YW5jZUlkXCIpXG5cblxuI1xuIyBUaGlzIHNlcmllcyBvZiBmdW5jdGlvbnMgcmV0dXJucyBwcm9wZXJ0aWVzIHdpdGggZGVmYXVsdCB2YWx1ZXMgaWYgbm8gcHJvcGVydHkgaXMgZm91bmRcbiMgQGdvdGNoYSBiZSBtaW5kZnVsIG9mIHRoZSBkZWZhdWx0IFwiYmxhbmtcIiB2YWx1ZXMgc2V0IGhlcmVcbiNcbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5nZXROdW1iZXIgPSAgICAgICAgKGtleSkgLT4gcmV0dXJuIGlmIEBoYXMoa2V5KSB0aGVuIHBhcnNlSW50KEBnZXQoa2V5KSkgZWxzZSAwXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZ2V0QXJyYXkgPSAgICAgICAgIChrZXkpIC0+IHJldHVybiBpZiBAaGFzKGtleSkgdGhlbiBAZ2V0KGtleSkgICAgICAgICAgIGVsc2UgW11cbkJhY2tib25lLk1vZGVsLnByb3RvdHlwZS5nZXRTdHJpbmcgPSAgICAgICAgKGtleSkgLT4gcmV0dXJuIGlmIEBoYXMoa2V5KSB0aGVuIEBnZXQoa2V5KSAgICAgICAgICAgZWxzZSBcIlwiXG5CYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuZ2V0RXNjYXBlZFN0cmluZyA9IChrZXkpIC0+IHJldHVybiBpZiBAaGFzKGtleSkgdGhlbiBAZXNjYXBlKGtleSkgICAgICAgIGVsc2UgXCJcIlxuQmFja2JvbmUuTW9kZWwucHJvdG90eXBlLmdldEJvb2xlYW4gPSAgICAgICAoa2V5KSAtPiByZXR1cm4gaWYgQGhhcyhrZXkpIHRoZW4gKEBnZXQoa2V5KSA9PSB0cnVlIG9yIEBnZXQoa2V5KSA9PSAndHJ1ZScpXG5cblxuI1xuIyBoYW5keSBqcXVlcnkgZnVuY3Rpb25zXG4jXG4oICgkKSAtPlxuXG4gICQuZm4uc2Nyb2xsVG8gPSAoc3BlZWQgPSAyNTAsIGNhbGxiYWNrKSAtPlxuICAgIHRyeVxuICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUge1xuICAgICAgICBzY3JvbGxUb3A6ICQoQCkub2Zmc2V0KCkudG9wICsgJ3B4J1xuICAgICAgICB9LCBzcGVlZCwgbnVsbCwgY2FsbGJhY2tcbiAgICBjYXRjaCBlXG4gICAgICBjb25zb2xlLmxvZyBcImVycm9yXCIsIGVcbiAgICAgIGNvbnNvbGUubG9nIFwiU2Nyb2xsIGVycm9yIHdpdGggJ3RoaXMnXCIsIEBcblxuICAgIHJldHVybiBAXG5cbiAgIyBwbGFjZSBzb21ldGhpbmcgdG9wIGFuZCBjZW50ZXJcbiAgJC5mbi50b3BDZW50ZXIgPSAtPlxuICAgIEBjc3MgXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCJcbiAgICBAY3NzIFwidG9wXCIsICQod2luZG93KS5zY3JvbGxUb3AoKSArIFwicHhcIlxuICAgIEBjc3MgXCJsZWZ0XCIsICgoJCh3aW5kb3cpLndpZHRoKCkgLSBAb3V0ZXJXaWR0aCgpKSAvIDIpICsgJCh3aW5kb3cpLnNjcm9sbExlZnQoKSArIFwicHhcIlxuXG4gICMgcGxhY2Ugc29tZXRoaW5nIG1pZGRsZSBjZW50ZXJcbiAgJC5mbi5taWRkbGVDZW50ZXIgPSAtPlxuICAgIEBjc3MgXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCJcbiAgICBAY3NzIFwidG9wXCIsICgoJCh3aW5kb3cpLmhlaWdodCgpIC0gdGhpcy5vdXRlckhlaWdodCgpKSAvIDIpICsgJCh3aW5kb3cpLnNjcm9sbFRvcCgpICsgXCJweFwiXG4gICAgQGNzcyBcImxlZnRcIiwgKCgkKHdpbmRvdykud2lkdGgoKSAtIHRoaXMub3V0ZXJXaWR0aCgpKSAvIDIpICsgJCh3aW5kb3cpLnNjcm9sbExlZnQoKSArIFwicHhcIlxuXG4gICQuZm4ud2lkdGhQZXJjZW50YWdlID0gLT5cbiAgICByZXR1cm4gTWF0aC5yb3VuZCgxMDAgKiBAb3V0ZXJXaWR0aCgpIC8gQG9mZnNldFBhcmVudCgpLndpZHRoKCkpICsgJyUnXG5cbiAgJC5mbi5oZWlnaHRQZXJjZW50YWdlID0gLT5cbiAgICByZXR1cm4gTWF0aC5yb3VuZCgxMDAgKiBAb3V0ZXJIZWlnaHQoKSAvIEBvZmZzZXRQYXJlbnQoKS5oZWlnaHQoKSkgKyAnJSdcblxuXG4gICQuZm4uZ2V0U3R5bGVPYmplY3QgPSAtPlxuXG4gICAgICBkb20gPSB0aGlzLmdldCgwKVxuXG4gICAgICByZXR1cm5zID0ge31cblxuICAgICAgaWYgd2luZG93LmdldENvbXB1dGVkU3R5bGVcblxuICAgICAgICAgIGNhbWVsaXplID0gKGEsIGIpIC0+IGIudG9VcHBlckNhc2UoKVxuXG4gICAgICAgICAgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSBkb20sIG51bGxcblxuICAgICAgICAgIGZvciBwcm9wIGluIHN0eWxlXG4gICAgICAgICAgICAgIGNhbWVsID0gcHJvcC5yZXBsYWNlIC9cXC0oW2Etel0pL2csIGNhbWVsaXplXG4gICAgICAgICAgICAgIHZhbCA9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUgcHJvcFxuICAgICAgICAgICAgICByZXR1cm5zW2NhbWVsXSA9IHZhbFxuXG4gICAgICAgICAgcmV0dXJuIHJldHVybnNcblxuICAgICAgaWYgZG9tLmN1cnJlbnRTdHlsZVxuXG4gICAgICAgICAgc3R5bGUgPSBkb20uY3VycmVudFN0eWxlXG5cbiAgICAgICAgICBmb3IgcHJvcCBpbiBzdHlsZVxuXG4gICAgICAgICAgICAgIHJldHVybnNbcHJvcF0gPSBzdHlsZVtwcm9wXVxuXG4gICAgICAgICAgcmV0dXJuIHJldHVybnNcblxuICAgICAgcmV0dXJuIHRoaXMuY3NzKClcblxuXG5cbikoalF1ZXJ5KVxuXG4jXG4jIENvdWNoREIgZXJyb3IgaGFuZGxpbmdcbiNcbiQuYWpheFNldHVwXG4gIHN0YXR1c0NvZGU6XG4gICAgNDA0OiAoeGhyLCBzdGF0dXMsIG1lc3NhZ2UpIC0+XG4gICAgICBjb2RlID0geGhyLnN0YXR1c1xuICAgICAgc3RhdHVzVGV4dCA9IHhoci5zdGF0dXNUZXh0XG4gICAgICBzZWVVbmF1dGhvcml6ZWQgPSB+eGhyLnJlc3BvbnNlVGV4dC5pbmRleE9mKFwidW5hdXRob3JpemVkXCIpXG4gICAgICBpZiBzZWVVbmF1dGhvcml6ZWRcbiAgICAgICAgVXRpbHMubWlkQWxlcnQgXCJTZXNzaW9uIGNsb3NlZDxicj5QbGVhc2UgbG9nIGluIGFuZCB0cnkgYWdhaW4uXCJcbiAgICAgICAgVGFuZ2VyaW5lLnVzZXIubG9nb3V0KClcblxuXG4jIGRlYnVnIGNvZGVzXG5rbSA9IHtcIjBcIjo0OCxcIjFcIjo0OSxcIjJcIjo1MCxcIjNcIjo1MSxcIjRcIjo1MixcIjVcIjo1MyxcIjZcIjo1NCxcIjdcIjo1NSxcIjhcIjo1NixcIjlcIjo1NyxcImFcIjo2NSxcImJcIjo2NixcImNcIjo2NyxcImRcIjo2OCxcImVcIjo2OSxcImZcIjo3MCxcImdcIjo3MSxcImhcIjo3MixcImlcIjo3MyxcImpcIjo3NCxcImtcIjo3NSxcImxcIjo3NixcIm1cIjo3NyxcIm5cIjo3OCxcIm9cIjo3OSxcInBcIjo4MCxcInFcIjo4MSxcInJcIjo4MixcInNcIjo4MyxcInRcIjo4NCxcInVcIjo4NSxcInZcIjo4NixcIndcIjo4NyxcInhcIjo4OCxcInlcIjo4OSxcInpcIjo5MH1cbnNrcyA9IFsgeyBxIDogKGttW1wiMjAwMXVwZGF0ZVwiW2ldXSBmb3IgaSBpbiBbMC4uOV0pLCBpIDogMCwgYyA6IC0+IFV0aWxzLnVwZGF0ZVRhbmdlcmluZSggLT4gVXRpbHMubWlkQWxlcnQoXCJVcGRhdGVkLCBwbGVhc2UgcmVmcmVzaC5cIikgKSB9IF1cbiQoZG9jdW1lbnQpLmtleWRvd24gKGUpIC0+ICggaWYgZS5rZXlDb2RlID09IHNrc1tqXS5xW3Nrc1tqXS5pKytdIHRoZW4gc2tzW2pdWydjJ10oKSBpZiBza3Nbal0uaSA9PSBza3Nbal0ucS5sZW5ndGggZWxzZSBza3Nbal0uaSA9IDAgKSBmb3Igc2ssIGogaW4gc2tzXG5cblxuU3RyaW5nLnByb3RvdHlwZS5zYWZldHlEYW5jZSA9IC0+IHRoaXMucmVwbGFjZSgvXFxzL2csIFwiX1wiKS5yZXBsYWNlKC9bXmEtekEtWjAtOV9dL2csXCJcIilcblN0cmluZy5wcm90b3R5cGUuZGF0YWJhc2VTYWZldHlEYW5jZSA9IC0+IHRoaXMucmVwbGFjZSgvXFxzL2csIFwiX1wiKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teYS16MC05Xy1dL2csXCJcIilcblN0cmluZy5wcm90b3R5cGUuY291bnQgPSAoc3Vic3RyaW5nKSAtPiB0aGlzLm1hdGNoKG5ldyBSZWdFeHAgc3Vic3RyaW5nLCBcImdcIik/Lmxlbmd0aCB8fCAwXG5cblxuXG5NYXRoLmF2ZSA9IC0+XG4gIHJlc3VsdCA9IDBcbiAgcmVzdWx0ICs9IHggZm9yIHggaW4gYXJndW1lbnRzXG4gIHJlc3VsdCAvPSBhcmd1bWVudHMubGVuZ3RoXG4gIHJldHVybiByZXN1bHRcblxuTWF0aC5pc0ludCAgICA9IC0+IHJldHVybiB0eXBlb2YgbiA9PSAnbnVtYmVyJyAmJiBwYXJzZUZsb2F0KG4pID09IHBhcnNlSW50KG4sIDEwKSAmJiAhaXNOYU4obilcbk1hdGguZGVjaW1hbHMgPSAobnVtLCBkZWNpbWFscykgLT4gbSA9IE1hdGgucG93KCAxMCwgZGVjaW1hbHMgKTsgbnVtICo9IG07IG51bSA9ICBudW0rKGBudW08MD8tMC41OiswLjVgKT4+MDsgbnVtIC89IG1cbk1hdGguY29tbWFzICAgPSAobnVtKSAtPiBwYXJzZUludChudW0pLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxCKD89KFxcZHszfSkrKD8hXFxkKSkvZywgXCIsXCIpXG5NYXRoLmxpbWl0ICAgID0gKG1pbiwgbnVtLCBtYXgpIC0+IE1hdGgubWF4KG1pbiwgTWF0aC5taW4obnVtLCBtYXgpKVxuXG4jIG1ldGhvZCBuYW1lIHNsaWdodGx5IG1pc2xlYWRpbmdcbiMgcmV0dXJucyB0cnVlIGZvciBmYWxzeSB2YWx1ZXNcbiMgICBudWxsLCB1bmRlZmluZWQsIGFuZCAnXFxzKidcbiMgb3RoZXIgZmFsc2UgdmFsdWVzIGxpa2VcbiMgICBmYWxzZSwgMFxuIyByZXR1cm4gZmFsc2Vcbl8uaXNFbXB0eVN0cmluZyA9ICggYVN0cmluZyApIC0+XG4gIHJldHVybiB0cnVlIGlmIGFTdHJpbmcgaXMgbnVsbCBvciBhU3RyaW5nIGlzIHVuZGVmaW5lZFxuICByZXR1cm4gZmFsc2UgdW5sZXNzIF8uaXNTdHJpbmcoYVN0cmluZykgb3IgXy5pc051bWJlcihhU3RyaW5nKVxuICBhU3RyaW5nID0gU3RyaW5nKGFTdHJpbmcpIGlmIF8uaXNOdW1iZXIoYVN0cmluZylcbiAgcmV0dXJuIHRydWUgaWYgYVN0cmluZy5yZXBsYWNlKC9cXHMqLywgJycpID09ICcnXG4gIHJldHVybiBmYWxzZVxuXG5fLmluZGV4QnkgPSAoIHByb3BlcnR5TmFtZSwgb2JqZWN0QXJyYXkgKSAtPlxuICByZXN1bHQgPSB7fVxuICBmb3Igb25lT2JqZWN0IGluIG9iamVjdEFycmF5XG4gICAgaWYgb25lT2JqZWN0W3Byb3BlcnR5TmFtZV0/XG4gICAgICBrZXkgPSBvbmVPYmplY3RbcHJvcGVydHlOYW1lXVxuICAgICAgcmVzdWx0W2tleV0gPSBbXSBpZiBub3QgcmVzdWx0W2tleV0/XG4gICAgICByZXN1bHRba2V5XS5wdXNoKG9uZU9iamVjdClcbiAgcmV0dXJuIHJlc3VsdFxuXG5cbmNsYXNzIFV0aWxzXG5cblxuICBAY2hhbmdlTGFuZ3VhZ2UgOiAoY29kZSwgY2FsbGJhY2spIC0+XG4gICAgaTE4bi5zZXRMbmcgY29kZSwgY2FsbGJhY2tcblxuICBAcmVzYXZlOiAoKSAtPlxuICAgIHVwZGF0ZU1vZGVscyA9IChtb2RlbHMsIGNhbGxiYWNrKSAtPlxuICAgICAgaWYgbW9kZWxzLmxlbmd0aCBpcyAwXG4gICAgICAgIHJldHVybiBjYWxsYmFjaygpXG4gICAgICBtb2RlbHMucG9wKCkuc2F2ZSBudWxsLFxuICAgICAgICBzdWNjZXNzOiAobW9kZWwpIC0+XG4gICAgICAgICAgY29uc29sZS5sb2cgbW9kZWwudXJsXG4gICAgICAgICAgdXBkYXRlTW9kZWxzKG1vZGVscywgY2FsbGJhY2spXG5cblxuICAgIHVwZGF0ZUNvbGxlY3Rpb25zID0gKGNvbGxlY3Rpb25zLCBjYWxsYmFjaykgLT5cbiAgICAgIGlmIGNvbGxlY3Rpb25zLmxlbmd0aCBpcyAwXG4gICAgICAgIHJldHVybiBjYWxsYmFjaygpXG5cbiAgICAgIGNvbGxlY3Rpb24gPSBuZXcgKGNvbGxlY3Rpb25zLnBvcCgpKVxuICAgICAgY29sbGVjdGlvbi5mZXRjaFxuICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgIHVwZGF0ZU1vZGVscyBjb2xsZWN0aW9uLCAtPlxuICAgICAgICAgICAgdXBkYXRlQ29sbGVjdGlvbnMoIGNvbGxlY3Rpb25zLCBjYWxsYmFjayApXG5cbiAgICB1cGRhdGVDb2xsZWN0aW9ucyBbIEFzc2Vzc21lbnRzLCBTdWJ0ZXN0cywgUXVlc3Rpb25zIF0sIC0+XG4gICAgICBjb25zb2xlLmxvZyBcIkFsbCBkb25lXCJcblxuXG5cbiAgQGV4ZWN1dGU6ICggZnVuY3Rpb25zICkgLT5cblxuICAgIHN0ZXAgPSAtPlxuICAgICAgbmV4dEZ1bmN0aW9uID0gZnVuY3Rpb25zLnNoaWZ0KClcbiAgICAgIG5leHRGdW5jdGlvbj8oc3RlcClcbiAgICBzdGVwKClcblxuICBAbG9hZENvbGxlY3Rpb25zIDogKCBsb2FkT3B0aW9ucyApIC0+XG5cbiAgICB0aHJvdyBcIllvdSdyZSBnb25uYSB3YW50IGEgY2FsbGJhY2sgaW4gdGhlcmUsIGJ1ZGR5LlwiIHVubGVzcyBsb2FkT3B0aW9ucy5jb21wbGV0ZT9cblxuICAgIHRvTG9hZCA9IGxvYWRPcHRpb25zLmNvbGxlY3Rpb25zIHx8IFtdXG5cbiAgICBnZXROZXh0ID0gKG9wdGlvbnMpIC0+XG4gICAgICBpZiBjdXJyZW50ID0gdG9Mb2FkLnBvcCgpXG4gICAgICAgIG1lbWJlck5hbWUgPSBjdXJyZW50LnVuZGVyc2NvcmUoKS5jYW1lbGl6ZSh0cnVlKVxuICAgICAgICBjb25zb2xlLmxvZyhcIm1lbWJlck5hbWU6IFwiICsgbWVtYmVyTmFtZSArIFwiIGN1cnJlbnQ6IFwiICsgY3VycmVudClcbiAgICAgICAgb3B0aW9uc1ttZW1iZXJOYW1lXSA9IG5ldyB3aW5kb3dbY3VycmVudF1cbiAgICAgICAgb3B0aW9uc1ttZW1iZXJOYW1lXS5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBnZXROZXh0IG9wdGlvbnNcbiAgICAgIGVsc2VcbiAgICAgICAgbG9hZE9wdGlvbnMuY29tcGxldGUgb3B0aW9uc1xuXG4gICAgZ2V0TmV4dCB7fVxuXG4gIEB1bml2ZXJzYWxVcGxvYWQ6IC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwibG9jYWxcIiwgXCJieUNvbGxlY3Rpb25cIilcbiAgICAgIHR5cGU6IFwiUE9TVFwiXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIGtleXMgOiBbXCJyZXN1bHRcIl1cbiAgICAgIClcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICBkb2NMaXN0ID0gXy5wbHVjayhkYXRhLnJvd3MsXCJpZFwiKVxuXG4gICAgICAgICQuY291Y2gucmVwbGljYXRlKFxuICAgICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImxvY2FsXCIpLFxuICAgICAgICAgIFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcImdyb3VwXCIpLFxuICAgICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgICAgVXRpbHMuc3RpY2t5IFwiUmVzdWx0cyBzeW5jZWQgdG8gY2xvdWQgc3VjY2Vzc2Z1bGx5LlwiXG4gICAgICAgICAgICBlcnJvcjogKGNvZGUsIG1lc3NhZ2UpID0+XG4gICAgICAgICAgICAgIFV0aWxzLnN0aWNreSBcIlVwbG9hZCBlcnJvcjxicj4je2NvZGV9ICN7bWVzc2FnZX1cIlxuICAgICAgICAgICxcbiAgICAgICAgICAgIGRvY19pZHM6IGRvY0xpc3RcbiAgICAgICAgKVxuXG4gIEByZXN0YXJ0VGFuZ2VyaW5lOiAobWVzc2FnZSwgY2FsbGJhY2spIC0+XG4gICAgVXRpbHMubWlkQWxlcnQgXCIje21lc3NhZ2UgfHwgJ1Jlc3RhcnRpbmcgVGFuZ2VyaW5lJ31cIlxuICAgIF8uZGVsYXkoIC0+XG4gICAgICBkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgY2FsbGJhY2s/KClcbiAgICAsIDIwMDAgKVxuXG4gIEBvblVwZGF0ZVN1Y2Nlc3M6ICh0b3RhbERvY3MpIC0+XG4gICAgVXRpbHMuZG9jdW1lbnRDb3VudGVyKytcbiAgICBpZiBVdGlscy5kb2N1bWVudENvdW50ZXIgPT0gdG90YWxEb2NzXG4gICAgICBVdGlscy5yZXN0YXJ0VGFuZ2VyaW5lIFwiVXBkYXRlIHN1Y2Nlc3NmdWxcIiwgLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcIlwiLCBmYWxzZVxuICAgICAgVXRpbHMuZG9jdW1lbnRDb3VudGVyID0gbnVsbFxuXG5cbiAgQHVwZGF0ZVRhbmdlcmluZTogKGRvUmVzb2x2ZSA9IHRydWUsIG9wdGlvbnMgPSB7fSkgLT5cblxuICAgIHJldHVybiB1bmxlc3MgVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG5cbiAgICBVdGlscy5kb2N1bWVudENvdW50ZXIgPSAwXG5cbiAgICBkRG9jID0gXCJvamFpXCJcbiAgICB0YXJnZXREQiA9IG9wdGlvbnMudGFyZ2V0REIgfHwgVGFuZ2VyaW5lLmRiX25hbWVcbiAgICBkb2NJZHMgPSBvcHRpb25zLmRvY0lkcyB8fCBbXCJfZGVzaWduLyN7ZERvY31cIiwgXCJjb25maWd1cmF0aW9uXCJdXG5cblxuICAgIFV0aWxzLm1pZEFsZXJ0IFwiVXBkYXRpbmcuLi5cIlxuICAgIFV0aWxzLndvcmtpbmcgdHJ1ZVxuICAgICMgc2F2ZSBvbGQgcmV2IGZvciBsYXRlclxuICAgIFRhbmdlcmluZS4kZGIuYWxsRG9jc1xuICAgICAga2V5cyA6IGRvY0lkc1xuICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICBvbGREb2NzID0gW11cbiAgICAgICAgZm9yIHJvdyBpbiByZXNwb25zZS5yb3dzXG4gICAgICAgICAgb2xkRG9jcy5wdXNoIHtcbiAgICAgICAgICAgIFwiX2lkXCIgIDogcm93LmlkXG4gICAgICAgICAgICBcIl9yZXZcIiA6IHJvdy52YWx1ZS5yZXZcbiAgICAgICAgICB9XG4gICAgICAgICMgcmVwbGljYXRlIGZyb20gdXBkYXRlIGRhdGFiYXNlXG4gICAgICAgICQuY291Y2gucmVwbGljYXRlIFRhbmdlcmluZS5zZXR0aW5ncy51cmxEQihcInVwZGF0ZVwiKSwgdGFyZ2V0REIsXG4gICAgICAgICAgZXJyb3I6IChlcnJvcikgLT5cbiAgICAgICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiVXBkYXRlIGZhaWxlZCByZXBsaWNhdGluZzxicj4je2Vycm9yfVwiXG4gICAgICAgICAgICBVdGlscy5kb2N1bWVudENvdW50ZXIgPSBudWxsXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHVubGVzcyBkb1Jlc29sdmVcbiAgICAgICAgICAgICAgVXRpbHMub25VcGRhdGVTdWNjZXNzKDEpXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgdG90YWxEb2NzID0gZG9jSWRzLmxlbmd0aFxuICAgICAgICAgICAgZm9yIGRvY0lkLCBpIGluIGRvY0lkc1xuICAgICAgICAgICAgICBvbGREb2MgPSBvbGREb2NzW2ldXG4gICAgICAgICAgICAgIGRvIChkb2NJZCwgb2xkRG9jLCB0b3RhbERvY3MpIC0+XG4gICAgICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi5vcGVuRG9jIGRvY0lkLFxuICAgICAgICAgICAgICAgICAgY29uZmxpY3RzOiB0cnVlXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgZGF0YS5fY29uZmxpY3RzP1xuICAgICAgICAgICAgICAgICAgICAgIFRhbmdlcmluZS4kZGIucmVtb3ZlRG9jIG9sZERvYyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLndvcmtpbmcgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbHMub25VcGRhdGVTdWNjZXNzKHRvdGFsRG9jcylcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLmRvY3VtZW50Q291bnRlciA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgVXRpbHMud29ya2luZyBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICBVdGlscy5taWRBbGVydCBcIlVwZGF0ZSBmYWlsZWQgcmVzb2x2aW5nIGNvbmZsaWN0PGJyPiN7ZXJyb3J9XCJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLm9uVXBkYXRlU3VjY2Vzcyh0b3RhbERvY3MpXG4gICAgICAgICwgZG9jX2lkcyA6IGRvY0lkc1xuXG4gIEBsb2c6IChzZWxmLCBlcnJvcikgLT5cbiAgICBjbGFzc05hbWUgPSBzZWxmLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL2Z1bmN0aW9uXFxzKihcXHcrKS8pWzFdXG4gICAgY29uc29sZS5sb2cgXCIje2NsYXNzTmFtZX06ICN7ZXJyb3J9XCJcblxuICAjIGlmIGFyZ3MgaXMgb25lIG9iamVjdCBzYXZlIGl0IHRvIHRlbXBvcmFyeSBoYXNoXG4gICMgaWYgdHdvIHN0cmluZ3MsIHNhdmUga2V5IHZhbHVlIHBhaXJcbiAgIyBpZiBvbmUgc3RyaW5nLCB1c2UgYXMga2V5LCByZXR1cm4gdmFsdWVcbiAgQGRhdGE6IChhcmdzLi4uKSAtPlxuICAgIGlmIGFyZ3MubGVuZ3RoID09IDFcbiAgICAgIGFyZyA9IGFyZ3NbMF1cbiAgICAgIGlmIF8uaXNTdHJpbmcoYXJnKVxuICAgICAgICByZXR1cm4gVGFuZ2VyaW5lLnRlbXBEYXRhW2FyZ11cbiAgICAgIGVsc2UgaWYgXy5pc09iamVjdChhcmcpXG4gICAgICAgIFRhbmdlcmluZS50ZW1wRGF0YSA9ICQuZXh0ZW5kKFRhbmdlcmluZS50ZW1wRGF0YSwgYXJnKVxuICAgICAgZWxzZSBpZiBhcmcgPT0gbnVsbFxuICAgICAgICBUYW5nZXJpbmUudGVtcERhdGEgPSB7fVxuICAgIGVsc2UgaWYgYXJncy5sZW5ndGggPT0gMlxuICAgICAga2V5ID0gYXJnc1swXVxuICAgICAgdmFsdWUgPSBhcmdzWzFdXG4gICAgICBUYW5nZXJpbmUudGVtcERhdGFba2V5XSA9IHZhbHVlXG4gICAgICByZXR1cm4gVGFuZ2VyaW5lLnRlbXBEYXRhXG4gICAgZWxzZSBpZiBhcmdzLmxlbmd0aCA9PSAwXG4gICAgICByZXR1cm4gVGFuZ2VyaW5lLnRlbXBEYXRhXG5cblxuICBAd29ya2luZzogKGlzV29ya2luZykgLT5cbiAgICBpZiBpc1dvcmtpbmdcbiAgICAgIGlmIG5vdCBUYW5nZXJpbmUubG9hZGluZ1RpbWVyP1xuICAgICAgICBUYW5nZXJpbmUubG9hZGluZ1RpbWVyID0gc2V0VGltZW91dChVdGlscy5zaG93TG9hZGluZ0luZGljYXRvciwgMzAwMClcbiAgICBlbHNlXG4gICAgICBpZiBUYW5nZXJpbmUubG9hZGluZ1RpbWVyP1xuICAgICAgICBjbGVhclRpbWVvdXQgVGFuZ2VyaW5lLmxvYWRpbmdUaW1lclxuICAgICAgICBUYW5nZXJpbmUubG9hZGluZ1RpbWVyID0gbnVsbFxuXG4gICAgICAkKFwiLmxvYWRpbmdfYmFyXCIpLnJlbW92ZSgpXG5cbiAgQHNob3dMb2FkaW5nSW5kaWNhdG9yOiAtPlxuICAgICQoXCI8ZGl2IGNsYXNzPSdsb2FkaW5nX2Jhcic+PGltZyBjbGFzcz0nbG9hZGluZycgc3JjPSdpbWFnZXMvbG9hZGluZy5naWYnPjwvZGl2PlwiKS5hcHBlbmRUbyhcImJvZHlcIikubWlkZGxlQ2VudGVyKClcblxuICAjIGFza3MgZm9yIGNvbmZpcm1hdGlvbiBpbiB0aGUgYnJvd3NlciwgYW5kIHVzZXMgcGhvbmVnYXAgZm9yIGNvb2wgY29uZmlybWF0aW9uXG4gIEBjb25maXJtOiAobWVzc2FnZSwgb3B0aW9ucykgLT5cbiAgICBpZiBuYXZpZ2F0b3Iubm90aWZpY2F0aW9uPy5jb25maXJtP1xuICAgICAgbmF2aWdhdG9yLm5vdGlmaWNhdGlvbi5jb25maXJtIG1lc3NhZ2UsXG4gICAgICAgIChpbnB1dCkgLT5cbiAgICAgICAgICBpZiBpbnB1dCA9PSAxXG4gICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrIHRydWVcbiAgICAgICAgICBlbHNlIGlmIGlucHV0ID09IDJcbiAgICAgICAgICAgIG9wdGlvbnMuY2FsbGJhY2sgZmFsc2VcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrIGlucHV0XG4gICAgICAsIG9wdGlvbnMudGl0bGUsIG9wdGlvbnMuYWN0aW9uK1wiLENhbmNlbFwiXG4gICAgZWxzZVxuICAgICAgaWYgd2luZG93LmNvbmZpcm0gbWVzc2FnZVxuICAgICAgICBvcHRpb25zLmNhbGxiYWNrIHRydWVcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIGVsc2VcbiAgICAgICAgb3B0aW9ucy5jYWxsYmFjayBmYWxzZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gMFxuXG4gICMgdGhpcyBmdW5jdGlvbiBpcyBhIGxvdCBsaWtlIGpRdWVyeS5zZXJpYWxpemVBcnJheSwgZXhjZXB0IHRoYXQgaXQgcmV0dXJucyB1c2VmdWwgb3V0cHV0XG4gICMgd29ya3Mgb24gdGV4dGFyZWFzLCBpbnB1dCB0eXBlIHRleHQgYW5kIHBhc3N3b3JkXG4gIEBnZXRWYWx1ZXM6ICggc2VsZWN0b3IgKSAtPlxuICAgIHZhbHVlcyA9IHt9XG4gICAgJChzZWxlY3RvcikuZmluZChcImlucHV0W3R5cGU9dGV4dF0sIGlucHV0W3R5cGU9cGFzc3dvcmRdLCB0ZXh0YXJlYVwiKS5lYWNoICggaW5kZXgsIGVsZW1lbnQgKSAtPlxuICAgICAgdmFsdWVzW2VsZW1lbnQuaWRdID0gZWxlbWVudC52YWx1ZVxuICAgIHJldHVybiB2YWx1ZXNcblxuICAjIGNvbnZlcnRzIHVybCBlc2NhcGVkIGNoYXJhY3RlcnNcbiAgQGNsZWFuVVJMOiAodXJsKSAtPlxuICAgIGlmIHVybC5pbmRleE9mPyhcIiVcIikgIT0gLTFcbiAgICAgIHVybCA9IGRlY29kZVVSSUNvbXBvbmVudCB1cmxcbiAgICBlbHNlXG4gICAgICB1cmxcblxuICAjIERpc3Bvc2FibGUgYWxlcnRzXG4gIEB0b3BBbGVydDogKGFsZXJ0VGV4dCwgZGVsYXkgPSAyMDAwKSAtPlxuICAgIFV0aWxzLmFsZXJ0IFwidG9wXCIsIGFsZXJ0VGV4dCwgZGVsYXlcblxuICBAbWlkQWxlcnQ6IChhbGVydFRleHQsIGRlbGF5PTIwMDApIC0+XG4gICAgVXRpbHMuYWxlcnQgXCJtaWRkbGVcIiwgYWxlcnRUZXh0LCBkZWxheVxuXG4gIEBhbGVydDogKCB3aGVyZSwgYWxlcnRUZXh0LCBkZWxheSA9IDIwMDAgKSAtPlxuXG4gICAgc3dpdGNoIHdoZXJlXG4gICAgICB3aGVuIFwidG9wXCJcbiAgICAgICAgc2VsZWN0b3IgPSBcIi50b3BfYWxlcnRcIlxuICAgICAgICBhbGlnbmVyID0gKCAkZWwgKSAtPiByZXR1cm4gJGVsLnRvcENlbnRlcigpXG4gICAgICB3aGVuIFwibWlkZGxlXCJcbiAgICAgICAgc2VsZWN0b3IgPSBcIi5taWRfYWxlcnRcIlxuICAgICAgICBhbGlnbmVyID0gKCAkZWwgKSAtPiByZXR1cm4gJGVsLm1pZGRsZUNlbnRlcigpXG5cblxuICAgIGlmIFV0aWxzW1wiI3t3aGVyZX1BbGVydFRpbWVyXCJdP1xuICAgICAgY2xlYXJUaW1lb3V0IFV0aWxzW1wiI3t3aGVyZX1BbGVydFRpbWVyXCJdXG4gICAgICAkYWxlcnQgPSAkKHNlbGVjdG9yKVxuICAgICAgJGFsZXJ0Lmh0bWwoICRhbGVydC5odG1sKCkgKyBcIjxicj5cIiArIGFsZXJ0VGV4dCApXG4gICAgZWxzZVxuICAgICAgJGFsZXJ0ID0gJChcIjxkaXYgY2xhc3M9JyN7c2VsZWN0b3Iuc3Vic3RyaW5nKDEpfSBkaXNwb3NhYmxlX2FsZXJ0Jz4je2FsZXJ0VGV4dH08L2Rpdj5cIikuYXBwZW5kVG8oXCIjY29udGVudFwiKVxuXG4gICAgYWxpZ25lcigkYWxlcnQpXG5cbiAgICBkbyAoJGFsZXJ0LCBzZWxlY3RvciwgZGVsYXkpIC0+XG4gICAgICBjb21wdXRlZERlbGF5ID0gKChcIlwiKyRhbGVydC5odG1sKCkpLm1hdGNoKC88YnI+L2cpfHxbXSkubGVuZ3RoICogMTUwMFxuICAgICAgVXRpbHNbXCIje3doZXJlfUFsZXJ0VGltZXJcIl0gPSBzZXRUaW1lb3V0IC0+XG4gICAgICAgICAgVXRpbHNbXCIje3doZXJlfUFsZXJ0VGltZXJcIl0gPSBudWxsXG4gICAgICAgICAgJGFsZXJ0LmZhZGVPdXQoMjUwLCAtPiAkKHRoaXMpLnJlbW92ZSgpIClcbiAgICAgICwgTWF0aC5tYXgoY29tcHV0ZWREZWxheSwgZGVsYXkpXG5cblxuXG4gIEBzdGlja3k6IChodG1sLCBidXR0b25UZXh0ID0gXCJDbG9zZVwiLCBjYWxsYmFjaywgcG9zaXRpb24gPSBcIm1pZGRsZVwiKSAtPlxuICAgIGRpdiA9ICQoXCI8ZGl2IGNsYXNzPSdzdGlja3lfYWxlcnQnPiN7aHRtbH08YnI+PGJ1dHRvbiBjbGFzcz0nY29tbWFuZCBwYXJlbnRfcmVtb3ZlJz4je2J1dHRvblRleHR9PC9idXR0b24+PC9kaXY+XCIpLmFwcGVuZFRvKFwiI2NvbnRlbnRcIilcbiAgICBpZiBwb3NpdGlvbiA9PSBcIm1pZGRsZVwiXG4gICAgICBkaXYubWlkZGxlQ2VudGVyKClcbiAgICBlbHNlIGlmIHBvc2l0aW9uID09IFwidG9wXCJcbiAgICAgIGRpdi50b3BDZW50ZXIoKVxuICAgIGRpdi5vbihcImtleXVwXCIsIChldmVudCkgLT4gaWYgZXZlbnQud2hpY2ggPT0gMjcgdGhlbiAkKHRoaXMpLnJlbW92ZSgpKS5maW5kKFwiYnV0dG9uXCIpLmNsaWNrIGNhbGxiYWNrXG5cbiAgQHRvcFN0aWNreTogKGh0bWwsIGJ1dHRvblRleHQgPSBcIkNsb3NlXCIsIGNhbGxiYWNrKSAtPlxuICAgIFV0aWxzLnN0aWNreShodG1sLCBidXR0b25UZXh0LCBjYWxsYmFjaywgXCJ0b3BcIilcblxuXG5cbiAgQG1vZGFsOiAoaHRtbCkgLT5cbiAgICBpZiBodG1sID09IGZhbHNlXG4gICAgICAkKFwiI21vZGFsX2JhY2ssICNtb2RhbFwiKS5yZW1vdmUoKVxuICAgICAgcmV0dXJuXG5cbiAgICAkKFwiYm9keVwiKS5wcmVwZW5kKFwiPGRpdiBpZD0nbW9kYWxfYmFjayc+PC9kaXY+XCIpXG4gICAgJChcIjxkaXYgaWQ9J21vZGFsJz4je2h0bWx9PC9kaXY+XCIpLmFwcGVuZFRvKFwiI2NvbnRlbnRcIikubWlkZGxlQ2VudGVyKCkub24oXCJrZXl1cFwiLCAoZXZlbnQpIC0+IGlmIGV2ZW50LndoaWNoID09IDI3IHRoZW4gJChcIiNtb2RhbF9iYWNrLCAjbW9kYWxcIikucmVtb3ZlKCkpXG5cbiAgQHBhc3N3b3JkUHJvbXB0OiAoY2FsbGJhY2spIC0+XG4gICAgaHRtbCA9IFwiXG4gICAgICA8ZGl2IGlkPSdwYXNzX2Zvcm0nIHRpdGxlPSdVc2VyIHZlcmlmaWNhdGlvbic+XG4gICAgICAgIDxsYWJlbCBmb3I9J3Bhc3N3b3JkJz5QbGVhc2UgcmUtZW50ZXIgeW91ciBwYXNzd29yZDwvbGFiZWw+XG4gICAgICAgIDxpbnB1dCBpZD0ncGFzc192YWwnIHR5cGU9J3Bhc3N3b3JkJyBuYW1lPSdwYXNzd29yZCcgaWQ9J3Bhc3N3b3JkJyB2YWx1ZT0nJz5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz0nY29tbWFuZCcgZGF0YS12ZXJpZnk9J3RydWUnPlZlcmlmeTwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kJz5DYW5jZWw8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIFwiXG5cbiAgICBVdGlscy5tb2RhbCBodG1sXG5cbiAgICAkcGFzcyA9ICQoXCIjcGFzc192YWxcIilcbiAgICAkYnV0dG9uID0gJChcIiNwYXNzX2Zvcm0gYnV0dG9uXCIpXG5cbiAgICAkcGFzcy5vbiBcImtleXVwXCIsIChldmVudCkgLT5cbiAgICAgIHJldHVybiB0cnVlIHVubGVzcyBldmVudC53aGljaCA9PSAxM1xuICAgICAgJGJ1dHRvbi5vZmYgXCJjbGlja1wiXG4gICAgICAkcGFzcy5vZmYgXCJjaGFuZ2VcIlxuXG4gICAgICBjYWxsYmFjayAkcGFzcy52YWwoKVxuICAgICAgVXRpbHMubW9kYWwgZmFsc2VcblxuICAgICRidXR0b24ub24gXCJjbGlja1wiLCAoZXZlbnQpIC0+XG4gICAgICAkYnV0dG9uLm9mZiBcImNsaWNrXCJcbiAgICAgICRwYXNzLm9mZiBcImNoYW5nZVwiXG5cbiAgICAgIGNhbGxiYWNrICRwYXNzLnZhbCgpIGlmICQoZXZlbnQudGFyZ2V0KS5hdHRyKFwiZGF0YS12ZXJpZnlcIikgPT0gXCJ0cnVlXCJcblxuICAgICAgVXRpbHMubW9kYWwgZmFsc2VcblxuXG5cbiAgIyByZXR1cm5zIGEgR1VJRFxuICBAZ3VpZDogLT5cbiAgIHJldHVybiBAUzQoKStAUzQoKStcIi1cIitAUzQoKStcIi1cIitAUzQoKStcIi1cIitAUzQoKStcIi1cIitAUzQoKStAUzQoKStAUzQoKVxuICBAUzQ6IC0+XG4gICByZXR1cm4gKCAoICggMSArIE1hdGgucmFuZG9tKCkgKSAqIDB4MTAwMDAgKSB8IDAgKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpXG5cbiAgQGh1bWFuR1VJRDogLT4gcmV0dXJuIEByYW5kb21MZXR0ZXJzKDQpK1wiLVwiK0ByYW5kb21MZXR0ZXJzKDQpK1wiLVwiK0ByYW5kb21MZXR0ZXJzKDQpXG4gIEBzYWZlTGV0dGVycyA9IFwiYWJjZGVmZ2hpamxtbm9wcXJzdHV2d3h5elwiLnNwbGl0KFwiXCIpXG4gIEByYW5kb21MZXR0ZXJzOiAobGVuZ3RoKSAtPlxuICAgIHJlc3VsdCA9IFwiXCJcbiAgICB3aGlsZSBsZW5ndGgtLVxuICAgICAgcmVzdWx0ICs9IFV0aWxzLnNhZmVMZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSpVdGlscy5zYWZlTGV0dGVycy5sZW5ndGgpXVxuICAgIHJldHVybiByZXN1bHRcblxuICAjIHR1cm5zIHRoZSBib2R5IGJhY2tncm91bmQgYSBjb2xvciBhbmQgdGhlbiByZXR1cm5zIHRvIHdoaXRlXG4gIEBmbGFzaDogKGNvbG9yPVwicmVkXCIsIHNob3VsZFR1cm5JdE9uID0gbnVsbCkgLT5cblxuICAgIGlmIG5vdCBzaG91bGRUdXJuSXRPbj9cbiAgICAgIFV0aWxzLmJhY2tncm91bmQgY29sb3JcbiAgICAgIHNldFRpbWVvdXQgLT5cbiAgICAgICAgVXRpbHMuYmFja2dyb3VuZCBcIlwiXG4gICAgICAsIDEwMDBcblxuICBAYmFja2dyb3VuZDogKGNvbG9yKSAtPlxuICAgIGlmIGNvbG9yP1xuICAgICAgJChcIiNjb250ZW50X3dyYXBwZXJcIikuY3NzIFwiYmFja2dyb3VuZENvbG9yXCIgOiBjb2xvclxuICAgIGVsc2VcbiAgICAgICQoXCIjY29udGVudF93cmFwcGVyXCIpLmNzcyBcImJhY2tncm91bmRDb2xvclwiXG5cbiAgIyBSZXRyaWV2ZXMgR0VUIHZhcmlhYmxlc1xuICAjIGh0dHA6Ly9lam9obi5vcmcvYmxvZy9zZWFyY2gtYW5kLWRvbnQtcmVwbGFjZS9cbiAgQCRfR0VUOiAocSwgcykgLT5cbiAgICB2YXJzID0ge31cbiAgICBwYXJ0cyA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnJlcGxhY2UoL1s/Jl0rKFtePSZdKyk9KFteJl0qKS9naSwgKG0sa2V5LHZhbHVlKSAtPlxuICAgICAgICB2YWx1ZSA9IGlmIH52YWx1ZS5pbmRleE9mKFwiI1wiKSB0aGVuIHZhbHVlLnNwbGl0KFwiI1wiKVswXSBlbHNlIHZhbHVlXG4gICAgICAgIHZhcnNba2V5XSA9IHZhbHVlLnNwbGl0KFwiI1wiKVswXTtcbiAgICApXG4gICAgdmFyc1xuXG5cbiAgIyBub3QgY3VycmVudGx5IGltcGxlbWVudGVkIGJ1dCB3b3JraW5nXG4gIEByZXNpemVTY3JvbGxQYW5lOiAtPlxuICAgICQoXCIuc2Nyb2xsX3BhbmVcIikuaGVpZ2h0KCAkKHdpbmRvdykuaGVpZ2h0KCkgLSAoICQoXCIjbmF2aWdhdGlvblwiKS5oZWlnaHQoKSArICQoXCIjZm9vdGVyXCIpLmhlaWdodCgpICsgMTAwKSApXG5cbiAgIyBhc2tzIHVzZXIgaWYgdGhleSB3YW50IHRvIGxvZ291dFxuICBAYXNrVG9Mb2dvdXQ6IC0+IFRhbmdlcmluZS51c2VyLmxvZ291dCgpIGlmIGNvbmZpcm0oXCJXb3VsZCB5b3UgbGlrZSB0byBsb2dvdXQgbm93P1wiKVxuXG4gIEBvbGRDb25zb2xlTG9nID0gbnVsbFxuICBAZW5hYmxlQ29uc29sZUxvZzogLT4gcmV0dXJuIHVubGVzcyBvbGRDb25zb2xlTG9nPyA7IHdpbmRvdy5jb25zb2xlLmxvZyA9IG9sZENvbnNvbGVMb2dcbiAgQGRpc2FibGVDb25zb2xlTG9nOiAtPiBvbGRDb25zb2xlTG9nID0gY29uc29sZS5sb2cgOyB3aW5kb3cuY29uc29sZS5sb2cgPSAkLm5vb3BcblxuICBAb2xkQ29uc29sZUFzc2VydCA9IG51bGxcbiAgQGVuYWJsZUNvbnNvbGVBc3NlcnQ6IC0+IHJldHVybiB1bmxlc3Mgb2xkQ29uc29sZUFzc2VydD8gICAgOyB3aW5kb3cuY29uc29sZS5hc3NlcnQgPSBvbGRDb25zb2xlQXNzZXJ0XG4gIEBkaXNhYmxlQ29uc29sZUFzc2VydDogLT4gb2xkQ29uc29sZUFzc2VydCA9IGNvbnNvbGUuYXNzZXJ0IDsgd2luZG93LmNvbnNvbGUuYXNzZXJ0ID0gJC5ub29wXG5cbiMgUm9iYmVydCBpbnRlcmZhY2VcbmNsYXNzIFJvYmJlcnRcblxuXG4gIEBmZXRjaFVzZXJzOiAoZ3JvdXAsIGNhbGxiYWNrKSAtPlxuICAgIHJldHVybiBSb2JiZXJ0LnJlcVxuICAgICAgdHlwZTogJ0dFVCdcbiAgICAgIHVybDogXCIvZ3JvdXAvI3tncm91cH1cIlxuICAgICAgc3VjY2VzcyA6IGNhbGxiYWNrXG4gICAgICBlcnJvciA6IGNhbGxiYWNrXG5cbiAgQHJlcTogKG9wdGlvbnMpIC0+XG4gICAgb3B0aW9ucy51cmwgPSBUYW5nZXJpbmUuY29uZmlnLmdldChcInJvYmJlcnRcIikgKyBvcHRpb25zLnVybFxuICAgIG9wdGlvbnMuY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbidcbiAgICBvcHRpb25zLmFjY2VwdCA9ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgIG9wdGlvbnMuZGF0YVR5cGUgPSAnanNvbidcbiAgICBvcHRpb25zLmRhdGEgPSBKU09OLnN0cmluZ2lmeShvcHRpb25zLmRhdGEpXG4gICAgY29uc29sZS5sb2cob3B0aW9ucylcbiAgICByZXR1cm4gJC5hamF4KG9wdGlvbnMpXG5cbiAgQGZldGNoVXNlcjogKG9wdGlvbnMpIC0+XG4gICAgUm9iYmVydC5yZXFcbiAgICAgIHR5cGUgOiAnR0VUJ1xuICAgICAgdXJsICA6ICBcIi91c2VyL1wiICsgVGFuZ2VyaW5lLnVzZXIuZ2V0KFwibmFtZVwiKVxuICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5zdWNjZXNzPyBkYXRhXG4gICAgICBlcnJvcjogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5lcnJvcj8gZGF0YVxuXG4gIEBuZXdHcm91cDogKG9wdGlvbnMpIC0+XG4gICAgUm9iYmVydC5yZXFcbiAgICAgIHR5cGUgOiAnUFVUJ1xuICAgICAgdXJsICA6ICcvZ3JvdXAnXG4gICAgICBkYXRhIDpcbiAgICAgICAgbmFtZSA6IG9wdGlvbnMubmFtZVxuICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5zdWNjZXNzPyBkYXRhXG4gICAgICBlcnJvcjogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5lcnJvcj8gZGF0YVxuXG4gIEBsZWF2ZUdyb3VwOiAob3B0aW9ucykgLT5cbiAgICBSb2JiZXJ0LnJlcVxuICAgICAgdHlwZSA6ICdERUxFVEUnXG4gICAgICB1cmwgIDogXCIvZ3JvdXAvI3tvcHRpb25zLmdyb3VwfS8je29wdGlvbnMudXNlcn1cIlxuICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5zdWNjZXNzPyBkYXRhXG4gICAgICBlcnJvcjogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5lcnJvcj8gZGF0YVxuXG4gIEBzaWdudXA6IChvcHRpb25zKSAtPlxuICAgIHJldHVybiBSb2JiZXJ0LnJlcVxuICAgICAgdHlwZSA6ICdQVVQnXG4gICAgICB1cmwgIDogJy91c2VyJ1xuICAgICAgZGF0YSA6XG4gICAgICAgIG5hbWUgOiBvcHRpb25zLm5hbWVcbiAgICAgICAgcGFzcyA6IG9wdGlvbnMucGFzc1xuICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5zdWNjZXNzPyBkYXRhXG4gICAgICBlcnJvcjogKCBkYXRhICkgPT5cbiAgICAgICAgb3B0aW9ucy5lcnJvcj8gZGF0YVxuXG4gIEByb2xlUG9zdDogKHVybCwgdXNlciwgY2FsbGJhY2spIC0+XG4gICAgb3B0aW9ucyA9XG4gICAgICB0eXBlIDogJ1BPU1QnXG4gICAgICB1cmwgOiBcIi9ncm91cC8je1RhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJncm91cE5hbWVcIil9XCIgKyB1cmxcbiAgICAgIGRhdGEgOlxuICAgICAgICB1c2VyIDogdXNlclxuICAgICAgc3VjY2VzcyA6IGNhbGxiYWNrXG4gICAgICBlcnJvciA6IGNhbGxiYWNrXG4gICAgICBjb21wbGV0ZSA6IChyZXMpIC0+XG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IHJlcy5yZXNwb25zZUpTT04ubWVzc2FnZVxuXG4gICAgcmV0dXJuIFJvYmJlcnQucmVxIG9wdGlvbnNcblxuICBAYWRkQWRtaW46ICh1c2VyLCBjYWxsYmFjaykgLT4gICAgIFJvYmJlcnQucm9sZVBvc3QgXCIvYWRkLWFkbWluXCIsIHVzZXIsIGNhbGxiYWNrXG4gIEBhZGRNZW1iZXI6ICh1c2VyLCBjYWxsYmFjaykgLT4gICAgUm9iYmVydC5yb2xlUG9zdCBcIi9hZGQtbWVtYmVyXCIsIHVzZXIsIGNhbGxiYWNrXG4gIEByZW1vdmVBZG1pbjogKHVzZXIsIGNhbGxiYWNrKSAtPiAgUm9iYmVydC5yb2xlUG9zdCBcIi9yZW1vdmUtYWRtaW5cIiwgdXNlciwgY2FsbGJhY2tcbiAgQHJlbW92ZU1lbWJlcjogKHVzZXIsIGNhbGxiYWNrKSAtPiBSb2JiZXJ0LnJvbGVQb3N0IFwiL3JlbW92ZS1tZW1iZXJcIiwgdXNlciwgY2FsbGJhY2tcblxuXG4jIFRyZWUgaW50ZXJmYWNlXG5jbGFzcyBUYW5nZXJpbmVUcmVlXG4gIFxuICBAZ2VuZXJhdGVKc29uQW5kTUFrZTogLT5cblxuICAgIHVybCA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3IFwiZ3JvdXBcIiwgXCJhc3Nlc3NtZW50c05vdEFyY2hpdmVkXCJcbiAgICBjb25zb2xlLmxvZyhcInVybDogXCIgKyB1cmwpXG5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcgXCJncm91cFwiLCBcImFzc2Vzc21lbnRzTm90QXJjaGl2ZWRcIlxuICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgY29uc29sZS5sb2coXCJkYXRhOiBcIiArIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuIyAgICAgICAgZEtleXMgPSBfLmNvbXBhY3QoZG9jLmlkLnN1YnN0cigtNSwgNSkgZm9yIGRvYyBpbiBkYXRhLnJvd3MpLmNvbmNhdChrZXlMaXN0KS5qb2luKFwiIFwiKVxuICAgICAgICBkS2V5cyA9IGRhdGEucm93cy5tYXAoKHJvdykgPT4gcm93LmlkLnN1YnN0cigtNSkpXG4gICAgICAgIGRLZXlRdWVyeSA9XG4gICAgICAgICAga2V5czogZEtleXNcbiAgICAgICAgY29uc29sZS5sb2coXCJkS2V5UXVlcnk6XCIgKyBKU09OLnN0cmluZ2lmeShkS2V5UXVlcnkpKVxuICAgICAgICB1cmwgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpXG4gICAgICAgIGNvbnNvbGUubG9nKFwidXJsOiBcIiArIHVybClcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpLFxuICAgICAgICAgIHR5cGU6IFwiUE9TVFwiXG4gICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoZEtleVF1ZXJ5KVxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkYXRhOiBcIiArIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgICAgICAgICAga2V5TGlzdCA9IFtdXG4jICAgICAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuIyAgICAgICAgICAgICAga2V5TGlzdC5wdXNoIGRhdHVtLmtleVxuICAgICAgICAgICAga2V5TGlzdCA9IGRhdGEucm93cy5tYXAoKHJvdykgPT4gcm93LmlkKTtcbiAgICAgICAgICAgIGtleUxpc3QgPSBfLnVuaXEoa2V5TGlzdClcbiAgICAgICAgICAgIGtleUxpc3QucHVzaChcInNldHRpbmdzXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJrZXlMaXN0OiBcIiArIEpTT04uc3RyaW5naWZ5KGtleUxpc3QpKTtcbiMgICAgICAgICAgICBrZXlMaXN0UXVlcnkgPSB7XG4jICAgICAgICAgICAgICBrZXlzOiBrZXlMaXN0LFxuIyAgICAgICAgICAgICAgaW5jbHVkZV9kb2NzOnRydWVcbiMgICAgICAgICAgICB9XG4gICAgICAgICAgICBUYW5nZXJpbmUuJGRiLmFsbERvY3NcbiAgICAgICAgICAgICAga2V5cyA6IGtleUxpc3RcbiAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAjICAgICAgICAgICAgICBsZXQgZG9jcyA9IHJlc3BvbnNlLmJvZHkucm93cy5tYXAoIChyb3cpID0+IHJvdy5kb2MgKTtcbiAgICAgICAgICAgICAgICBkb2NzID0gW11cbiAgICAgICAgICAgICAgICBmb3Igcm93IGluIHJlc3BvbnNlLnJvd3NcbiAgICAgICAgICAgICAgICAgIGRvY3MucHVzaCByb3cuZG9jXG4gICAgICAgICAgICAgICAgYm9keSA9XG4gICAgICAgICAgICAgICAgICBkb2NzOiBkb2NzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJvZHlcbiAgICAgIGVycm9yOiAoYSwgYikgLT5cbiAgICAgICAgY29uc29sZS5sb2coXCJhOiBcIiArIGEpXG4gICAgICAgIFV0aWxzLm1pZEFsZXJ0IFwiSW1wb3J0IGVycm9yXCJcblxuICBAbWFrZTogKG9wdGlvbnMpIC0+XG5cbiAgICBVdGlscy53b3JraW5nIHRydWVcbiAgICB1cmwgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyBcImdyb3VwXCIsIFwiYXNzZXNzbWVudHNOb3RBcmNoaXZlZFwiXG4jICAgIGNvbnNvbGUubG9nKFwidXJsOiBcIiArIHVybClcblxuICAgICQuYWpheFxuICAgICAgdXJsOiBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyBcImdyb3VwXCIsIFwiYXNzZXNzbWVudHNOb3RBcmNoaXZlZFwiXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuIyAgICAgICAgY29uc29sZS5sb2coXCJkYXRhOiBcIiArIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICAgICAgICAjICAgICAgICBkS2V5cyA9IF8uY29tcGFjdChkb2MuaWQuc3Vic3RyKC01LCA1KSBmb3IgZG9jIGluIGRhdGEucm93cykuY29uY2F0KGtleUxpc3QpLmpvaW4oXCIgXCIpXG4gICAgICAgIGRLZXlzID0gZGF0YS5yb3dzLm1hcCgocm93KSA9PiByb3cuaWQuc3Vic3RyKC01KSlcbiAgICAgICAgZEtleVF1ZXJ5ID1cbiAgICAgICAgICBrZXlzOiBkS2V5c1xuIyAgICAgICAgY29uc29sZS5sb2coXCJkS2V5UXVlcnk6XCIgKyBKU09OLnN0cmluZ2lmeShkS2V5UXVlcnkpKVxuICAgICAgICB1cmwgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpXG4jICAgICAgICBjb25zb2xlLmxvZyhcInVybDogXCIgKyB1cmwpXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHVybDogVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcoXCJncm91cFwiLCBcImJ5REtleVwiKSxcbiAgICAgICAgICB0eXBlOiBcIlBPU1RcIlxuICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIlxuICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGRLZXlRdWVyeSlcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiMgICAgICAgICAgICBjb25zb2xlLmxvZyhcImRhdGE6IFwiICsgSlNPTi5zdHJpbmdpZnkoZGF0YSkpXG4gICAgICAgICAgICBrZXlMaXN0ID0gW11cbiAgICAgICAgICAgICMgICAgICAgICAgICBmb3IgZGF0dW0gaW4gZGF0YS5yb3dzXG4gICAgICAgICAgICAjICAgICAgICAgICAgICBrZXlMaXN0LnB1c2ggZGF0dW0ua2V5XG4gICAgICAgICAgICBrZXlMaXN0ID0gZGF0YS5yb3dzLm1hcCgocm93KSA9PiByb3cuaWQpO1xuICAgICAgICAgICAga2V5TGlzdCA9IF8udW5pcShrZXlMaXN0KVxuICAgICAgICAgICAga2V5TGlzdC5wdXNoKFwic2V0dGluZ3NcIik7XG4jICAgICAgICAgICAgY29uc29sZS5sb2coXCJrZXlMaXN0OiBcIiArIEpTT04uc3RyaW5naWZ5KGtleUxpc3QpKTtcbiAgICAgICAgICAgICMgICAgICAgICAgICBrZXlMaXN0UXVlcnkgPSB7XG4gICAgICAgICAgICAjICAgICAgICAgICAgICBrZXlzOiBrZXlMaXN0LFxuICAgICAgICAgICAgIyAgICAgICAgICAgICAgaW5jbHVkZV9kb2NzOnRydWVcbiAgICAgICAgICAgICMgICAgICAgICAgICB9XG4gICAgICAgICAgICBUYW5nZXJpbmUuJGRiLmFsbERvY3NcbiAgICAgICAgICAgICAga2V5cyA6IGtleUxpc3RcbiAgICAgICAgICAgICAgaW5jbHVkZV9kb2NzOnRydWVcbiAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuIyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlc3BvbnNlOiBcIiArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSlcbiMgICAgICAgICAgICAgIGxldCBkb2NzID0gcmVzcG9uc2UuYm9keS5yb3dzLm1hcCggKHJvdykgPT4gcm93LmRvYyApO1xuICAgICAgICAgICAgICAgIGRvY3MgPSBbXVxuICAgICAgICAgICAgICAgIGZvciByb3cgaW4gcmVzcG9uc2Uucm93c1xuICAgICAgICAgICAgICAgICAgZG9jcy5wdXNoIHJvdy5kb2NcbiAgICAgICAgICAgICAgICBib2R5ID1cbiAgICAgICAgICAgICAgICAgIGRvY3M6IGRvY3NcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzXG4gICAgICAgICAgICAgICAgZXJyb3IgICA9IG9wdGlvbnMuZXJyb3JcblxuICAgICAgICAgICAgICAgIHBheWxvYWQgPSBKU09OLnN0cmluZ2lmeShib2R5KVxuIyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInBheWxvYWQ6XCIgKyBKU09OLnN0cmluZ2lmeShib2R5KSlcblxuICAgICAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLnN1Y2Nlc3NcbiAgICAgICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5lcnJvclxuXG4gICAgICAgICAgICAgICAgJC5hamF4XG4gICAgICAgICAgICAgICAgICB0eXBlICAgICA6ICdQT1NUJ1xuICAgICAgICAgICAgICAgICAgY3Jvc3NEb21haW4gOiB0cnVlXG4gICAgICAgICAgICAgICAgICB1cmwgICAgICA6IFwiI3tUYW5nZXJpbmUuY29uZmlnLmdldCgndHJlZScpfS9ncm91cC0je1RhbmdlcmluZS5zZXR0aW5ncy5nZXQoJ2dyb3VwTmFtZScpfS8je1RhbmdlcmluZS5zZXR0aW5ncy5nZXQoJ2hvc3RuYW1lJyl9XCJcbiAgICAgICAgICAgICAgICAgIGRhdGFUeXBlIDogJ2pzb24nXG4gICAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCJcbiAgICAgICAgICAgICAgICAgIGRhdGEgICAgIDogcGF5bG9hZFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCBkYXRhICkgPT5cbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyBkYXRhXG4gICAgICAgICAgICAgICAgICBlcnJvcjogKCBkYXRhICkgPT5cbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgZGF0YSwgSlNPTi5wYXJzZShkYXRhLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiAtPlxuICAgICAgICAgICAgICAgICAgICBVdGlscy53b3JraW5nIGZhbHNlXG4gICAgICBlcnJvcjogKGEsIGIpIC0+XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYTogXCIgKyBhKVxuICAgICAgICBVdGlscy5taWRBbGVydCBcIkltcG9ydCBlcnJvclwiXG5cblxuIyNVSSBoZWxwZXJzXG4kIC0+XG4gICMgIyMjLmNsZWFyX21lc3NhZ2VcbiAgIyBUaGlzIGxpdHRsZSBndXkgd2lsbCBmYWRlIG91dCBhbmQgY2xlYXIgaGltIGFuZCBoaXMgcGFyZW50cy4gV3JhcCBoaW0gd2lzZWx5LlxuICAjIGA8c3Bhbj4gbXkgbWVzc2FnZSA8YnV0dG9uIGNsYXNzPVwiY2xlYXJfbWVzc2FnZVwiPlg8L2J1dHRvbj5gXG4gICQoXCIjY29udGVudFwiKS5vbihcImNsaWNrXCIsIFwiLmNsZWFyX21lc3NhZ2VcIiwgIG51bGwsIChhKSAtPiAkKGEudGFyZ2V0KS5wYXJlbnQoKS5mYWRlT3V0KDI1MCwgLT4gJCh0aGlzKS5lbXB0eSgpLnNob3coKSApIClcbiAgJChcIiNjb250ZW50XCIpLm9uKFwiY2xpY2tcIiwgXCIucGFyZW50X3JlbW92ZVwiLCBudWxsLCAoYSkgLT4gJChhLnRhcmdldCkucGFyZW50KCkuZmFkZU91dCgyNTAsIC0+ICQodGhpcykucmVtb3ZlKCkgKSApXG5cbiAgIyBkaXNwb3NhYmxlIGFsZXJ0cyA9IGEgbm9uLWZhbmN5IGJveFxuICAkKFwiI2NvbnRlbnRcIikub24gXCJjbGlja1wiLFwiLmFsZXJ0X2J1dHRvblwiLCAtPlxuICAgIGFsZXJ0X3RleHQgPSBpZiAkKHRoaXMpLmF0dHIoXCJkYXRhLWFsZXJ0XCIpIHRoZW4gJCh0aGlzKS5hdHRyKFwiZGF0YS1hbGVydFwiKSBlbHNlICQodGhpcykudmFsKClcbiAgICBVdGlscy5kaXNwb3NhYmxlQWxlcnQgYWxlcnRfdGV4dFxuICAkKFwiI2NvbnRlbnRcIikub24gXCJjbGlja1wiLCBcIi5kaXNwb3NhYmxlX2FsZXJ0XCIsIC0+XG4gICAgJCh0aGlzKS5zdG9wKCkuZmFkZU91dCAxMDAsIC0+XG4gICAgICAkKHRoaXMpLnJlbW92ZSgpXG5cbiAgIyAkKHdpbmRvdykucmVzaXplIFV0aWxzLnJlc2l6ZVNjcm9sbFBhbmVcbiAgIyBVdGlscy5yZXNpemVTY3JvbGxQYW5lKClcbiJdfQ==
