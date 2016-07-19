var Result,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Result = (function(superClass) {
  extend(Result, superClass);

  function Result() {
    return Result.__super__.constructor.apply(this, arguments);
  }

  Result.prototype.url = "result";

  Result.prototype.initialize = function(options) {
    if (options.blank === true) {
      this.set({
        'subtestData': [],
        'startTime': (new Date()).getTime(),
        'enumerator': Tangerine.user.name(),
        'tangerineVersion': Tangerine.version,
        'device': navigator.userAgent,
        'instanceId': Tangerine.settings.getString('instanceId')
      });
      return this.unset("blank");
    }
  };

  Result.prototype.add = function(subtestDataElement, callbacks) {
    if (callbacks == null) {
      callbacks = {};
    }
    this.setSubtestData(subtestDataElement, callbacks);
    return this.save(null, {
      success: callbacks.success || $.noop,
      error: callbacks.error || $.noop
    });
  };

  Result.prototype.insert = function(newElement) {
    var i, j, len, newSubtestData, oldElement, oldSubtestData;
    oldSubtestData = this.get("subtestData");
    newSubtestData = oldSubtestData;
    for (i = j = 0, len = oldSubtestData.length; j < len; i = ++j) {
      oldElement = oldSubtestData[i];
      if (oldElement.subtestId === newElement.subtestId) {
        newSubtestData[i] = newElement;
        break;
      }
    }
    return this.set("subtestData", newSubtestData);
  };

  Result.prototype.setSubtestData = function(subtestDataElement, subtestId) {
    var subtestData;
    subtestDataElement['timestamp'] = (new Date()).getTime();
    subtestData = this.get('subtestData');
    subtestData.push(subtestDataElement);
    return this.set('subtestData', subtestData);
  };

  Result.prototype.getVariable = function(key) {
    var data, i, j, k, label, len, len1, name, ref, ref1, state, subtest, value, variable;
    ref = this.get("subtestData");
    for (j = 0, len = ref.length; j < len; j++) {
      subtest = ref[j];
      data = subtest.data;
      if (data.labels != null) {
        ref1 = data.labels;
        for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
          label = ref1[i];
          if (label === key) {
            return data.location[i];
          }
        }
      } else {
        for (variable in data) {
          value = data[variable];
          if (variable === key) {
            if (_.isObject(value)) {
              return _.compact((function() {
                var results;
                results = [];
                for (name in value) {
                  state = value[name];
                  results.push(state === "checked" ? name : void 0);
                }
                return results;
              })());
            } else {
              return value;
            }
          }
        }
      }
    }
    return null;
  };

  Result.prototype.getByHash = function(hash) {
    var j, len, ref, subtest;
    if (hash) {
      ref = this.get("subtestData");
      for (j = 0, len = ref.length; j < len; j++) {
        subtest = ref[j];
        if (hash === subtest.subtestHash) {
          return subtest.data;
        }
      }
    }
    return null;
  };

  Result.prototype.getGridScore = function(id) {
    var datum, j, len, ref;
    ref = this.get('subtestData');
    for (j = 0, len = ref.length; j < len; j++) {
      datum = ref[j];
      if (datum.subtestId === id) {
        return parseInt(datum.data.attempted);
      }
    }
  };

  Result.prototype.getItemResultCountByVariableName = function(name, result) {
    var count, datum, found, item, items, j, k, len, len1, ref;
    found = false;
    count = 0;
    ref = this.get('subtestData');
    for (j = 0, len = ref.length; j < len; j++) {
      datum = ref[j];
      if ((datum.data != null) && (datum.data.variable_name != null) && datum.data.variable_name === name) {
        found = true;
        items = datum.data.items;
        for (k = 0, len1 = items.length; k < len1; k++) {
          item = items[k];
          if (item.itemResult === result) {
            count++;
          }
        }
      }
    }
    if (!found) {
      throw new Error("Variable name \"" + name + "\" not found");
    }
    return count;
  };

  Result.prototype.gridWasAutostopped = function(id) {
    var datum, j, len, ref;
    ref = this.get('subtestData');
    for (j = 0, len = ref.length; j < len; j++) {
      datum = ref[j];
      if (datum.subtestId === id) {
        return datum.data.auto_stop;
      }
    }
  };

  return Result;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3VsdC9SZXN1bHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTtFQUFBOzs7QUFBTTs7Ozs7OzttQkFFSixHQUFBLEdBQUs7O21CQUVMLFVBQUEsR0FBWSxTQUFFLE9BQUY7SUFHVixJQUFHLE9BQU8sQ0FBQyxLQUFSLEtBQWlCLElBQXBCO01BRUUsSUFBQyxDQUFBLEdBQUQsQ0FDRTtRQUFBLGFBQUEsRUFBcUIsRUFBckI7UUFDQSxXQUFBLEVBQXFCLENBQUssSUFBQSxJQUFBLENBQUEsQ0FBTCxDQUFZLENBQUMsT0FBYixDQUFBLENBRHJCO1FBRUEsWUFBQSxFQUFxQixTQUFTLENBQUMsSUFBSSxDQUFDLElBQWYsQ0FBQSxDQUZyQjtRQUdBLGtCQUFBLEVBQXFCLFNBQVMsQ0FBQyxPQUgvQjtRQUlBLFFBQUEsRUFBcUIsU0FBUyxDQUFDLFNBSi9CO1FBS0EsWUFBQSxFQUFxQixTQUFTLENBQUMsUUFBUSxDQUFDLFNBQW5CLENBQTZCLFlBQTdCLENBTHJCO09BREY7YUFRQSxJQUFDLENBQUEsS0FBRCxDQUFPLE9BQVAsRUFWRjs7RUFIVTs7bUJBZVosR0FBQSxHQUFLLFNBQUUsa0JBQUYsRUFBc0IsU0FBdEI7O01BQXNCLFlBQVk7O0lBQ3JDLElBQUMsQ0FBQSxjQUFELENBQWdCLGtCQUFoQixFQUFvQyxTQUFwQztXQUNBLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTixFQUNFO01BQUEsT0FBQSxFQUFTLFNBQVMsQ0FBQyxPQUFWLElBQXFCLENBQUMsQ0FBQyxJQUFoQztNQUNBLEtBQUEsRUFBUyxTQUFTLENBQUMsS0FBVixJQUFxQixDQUFDLENBQUMsSUFEaEM7S0FERjtFQUZHOzttQkFNTCxNQUFBLEdBQVEsU0FBQyxVQUFEO0FBQ04sUUFBQTtJQUFBLGNBQUEsR0FBaUIsSUFBQyxDQUFBLEdBQUQsQ0FBSyxhQUFMO0lBQ2pCLGNBQUEsR0FBaUI7QUFDakIsU0FBQSx3REFBQTs7TUFDRSxJQUFHLFVBQVUsQ0FBQyxTQUFYLEtBQXdCLFVBQVUsQ0FBQyxTQUF0QztRQUNFLGNBQWUsQ0FBQSxDQUFBLENBQWYsR0FBb0I7QUFDcEIsY0FGRjs7QUFERjtXQUtBLElBQUMsQ0FBQSxHQUFELENBQUssYUFBTCxFQUFvQixjQUFwQjtFQVJNOzttQkFXUixjQUFBLEdBQWdCLFNBQUMsa0JBQUQsRUFBcUIsU0FBckI7QUFDZCxRQUFBO0lBQUEsa0JBQW1CLENBQUEsV0FBQSxDQUFuQixHQUFrQyxDQUFLLElBQUEsSUFBQSxDQUFBLENBQUwsQ0FBWSxDQUFDLE9BQWIsQ0FBQTtJQUNsQyxXQUFBLEdBQWMsSUFBQyxDQUFBLEdBQUQsQ0FBSyxhQUFMO0lBQ2QsV0FBVyxDQUFDLElBQVosQ0FBaUIsa0JBQWpCO1dBQ0EsSUFBQyxDQUFBLEdBQUQsQ0FBSyxhQUFMLEVBQW9CLFdBQXBCO0VBSmM7O21CQU1oQixXQUFBLEdBQWEsU0FBRSxHQUFGO0FBQ1gsUUFBQTtBQUFBO0FBQUEsU0FBQSxxQ0FBQTs7TUFDRSxJQUFBLEdBQU8sT0FBTyxDQUFDO01BQ2YsSUFBRyxtQkFBSDtBQUNFO0FBQUEsYUFBQSxnREFBQTs7VUFDRSxJQUEyQixLQUFBLEtBQVMsR0FBcEM7QUFBQSxtQkFBTyxJQUFJLENBQUMsUUFBUyxDQUFBLENBQUEsRUFBckI7O0FBREYsU0FERjtPQUFBLE1BQUE7QUFJRSxhQUFBLGdCQUFBOztVQUNFLElBQUcsUUFBQSxLQUFZLEdBQWY7WUFDRSxJQUFHLENBQUMsQ0FBQyxRQUFGLENBQVcsS0FBWCxDQUFIO0FBQ0UscUJBQU8sQ0FBQyxDQUFDLE9BQUY7O0FBQVc7cUJBQUEsYUFBQTs7K0JBQVMsS0FBQSxLQUFTLFNBQWpCLEdBQUEsSUFBQSxHQUFBO0FBQUQ7O2tCQUFYLEVBRFQ7YUFBQSxNQUFBO0FBR0UscUJBQU8sTUFIVDthQURGOztBQURGLFNBSkY7O0FBRkY7QUFZQSxXQUFPO0VBYkk7O21CQWViLFNBQUEsR0FBVyxTQUFFLElBQUY7QUFDVCxRQUFBO0lBQUEsSUFBRyxJQUFIO0FBQ0U7QUFBQSxXQUFBLHFDQUFBOztRQUNFLElBQUcsSUFBQSxLQUFRLE9BQU8sQ0FBQyxXQUFuQjtBQUNFLGlCQUFPLE9BQU8sQ0FBQyxLQURqQjs7QUFERixPQURGOztBQUlBLFdBQU87RUFMRTs7bUJBT1gsWUFBQSxHQUFjLFNBQUMsRUFBRDtBQUNaLFFBQUE7QUFBQTtBQUFBLFNBQUEscUNBQUE7O01BQ0UsSUFBeUMsS0FBSyxDQUFDLFNBQU4sS0FBbUIsRUFBNUQ7QUFBQSxlQUFPLFFBQUEsQ0FBUyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQXBCLEVBQVA7O0FBREY7RUFEWTs7bUJBSWQsZ0NBQUEsR0FBa0MsU0FBQyxJQUFELEVBQU8sTUFBUDtBQUNoQyxRQUFBO0lBQUEsS0FBQSxHQUFRO0lBQ1IsS0FBQSxHQUFRO0FBQ1I7QUFBQSxTQUFBLHFDQUFBOztNQUNFLElBQUcsb0JBQUEsSUFBZ0Isa0NBQWhCLElBQThDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBWCxLQUE0QixJQUE3RTtRQUNFLEtBQUEsR0FBUTtRQUNSLEtBQUEsR0FBUSxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ25CLGFBQUEseUNBQUE7O1VBQ0UsSUFBVyxJQUFJLENBQUMsVUFBTCxLQUFtQixNQUE5QjtZQUFBLEtBQUEsR0FBQTs7QUFERixTQUhGOztBQURGO0lBTUEsSUFBMEQsQ0FBSSxLQUE5RDtBQUFBLFlBQVUsSUFBQSxLQUFBLENBQU0sa0JBQUEsR0FBbUIsSUFBbkIsR0FBd0IsY0FBOUIsRUFBVjs7QUFDQSxXQUFPO0VBVnlCOzttQkFZbEMsa0JBQUEsR0FBb0IsU0FBQyxFQUFEO0FBQ2xCLFFBQUE7QUFBQTtBQUFBLFNBQUEscUNBQUE7O01BQ0UsSUFBK0IsS0FBSyxDQUFDLFNBQU4sS0FBbUIsRUFBbEQ7QUFBQSxlQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBbEI7O0FBREY7RUFEa0I7Ozs7R0FoRkQsUUFBUSxDQUFDIiwiZmlsZSI6InJlc3VsdC9SZXN1bHQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSZXN1bHQgZXh0ZW5kcyBCYWNrYm9uZS5Nb2RlbFxuXG4gIHVybDogXCJyZXN1bHRcIlxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG5cbiAgICAjIGNvdWxkIHVzZSBkZWZhdWx0cyBidXQgaXQgbWVzc2VzIHRoaW5ncyB1cFxuICAgIGlmIG9wdGlvbnMuYmxhbmsgPT0gdHJ1ZVxuXG4gICAgICBAc2V0XG4gICAgICAgICdzdWJ0ZXN0RGF0YScgICAgICA6IFtdXG4gICAgICAgICdzdGFydFRpbWUnICAgICAgICA6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICAgICAgJ2VudW1lcmF0b3InICAgICAgIDogVGFuZ2VyaW5lLnVzZXIubmFtZSgpXG4gICAgICAgICd0YW5nZXJpbmVWZXJzaW9uJyA6IFRhbmdlcmluZS52ZXJzaW9uXG4gICAgICAgICdkZXZpY2UnICAgICAgICAgICA6IG5hdmlnYXRvci51c2VyQWdlbnRcbiAgICAgICAgJ2luc3RhbmNlSWQnICAgICAgIDogVGFuZ2VyaW5lLnNldHRpbmdzLmdldFN0cmluZyAnaW5zdGFuY2VJZCdcblxuICAgICAgQHVuc2V0IFwiYmxhbmtcIiAjIG9wdGlvbnMgYXV0b21hdGljYWxseSBnZXQgYWRkZWQgdG8gdGhlIG1vZGVsLiBMYW1lLlxuXG4gIGFkZDogKCBzdWJ0ZXN0RGF0YUVsZW1lbnQsIGNhbGxiYWNrcyA9IHt9KSAtPlxuICAgIEBzZXRTdWJ0ZXN0RGF0YSBzdWJ0ZXN0RGF0YUVsZW1lbnQsIGNhbGxiYWNrc1xuICAgIEBzYXZlIG51bGwsXG4gICAgICBzdWNjZXNzOiBjYWxsYmFja3Muc3VjY2VzcyB8fCAkLm5vb3BcbiAgICAgIGVycm9yOiAgIGNhbGxiYWNrcy5lcnJvciAgIHx8ICQubm9vcFxuXG4gIGluc2VydDogKG5ld0VsZW1lbnQpIC0+XG4gICAgb2xkU3VidGVzdERhdGEgPSBAZ2V0KFwic3VidGVzdERhdGFcIilcbiAgICBuZXdTdWJ0ZXN0RGF0YSA9IG9sZFN1YnRlc3REYXRhXG4gICAgZm9yIG9sZEVsZW1lbnQsIGkgaW4gb2xkU3VidGVzdERhdGFcbiAgICAgIGlmIG9sZEVsZW1lbnQuc3VidGVzdElkIGlzIG5ld0VsZW1lbnQuc3VidGVzdElkXG4gICAgICAgIG5ld1N1YnRlc3REYXRhW2ldID0gbmV3RWxlbWVudFxuICAgICAgICBicmVha1xuXG4gICAgQHNldCBcInN1YnRlc3REYXRhXCIsIG5ld1N1YnRlc3REYXRhXG5cblxuICBzZXRTdWJ0ZXN0RGF0YTogKHN1YnRlc3REYXRhRWxlbWVudCwgc3VidGVzdElkKSAtPlxuICAgIHN1YnRlc3REYXRhRWxlbWVudFsndGltZXN0YW1wJ10gPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpXG4gICAgc3VidGVzdERhdGEgPSBAZ2V0ICdzdWJ0ZXN0RGF0YSdcbiAgICBzdWJ0ZXN0RGF0YS5wdXNoIHN1YnRlc3REYXRhRWxlbWVudFxuICAgIEBzZXQgJ3N1YnRlc3REYXRhJywgc3VidGVzdERhdGFcblxuICBnZXRWYXJpYWJsZTogKCBrZXkgKSAtPlxuICAgIGZvciBzdWJ0ZXN0IGluIEBnZXQoXCJzdWJ0ZXN0RGF0YVwiKVxuICAgICAgZGF0YSA9IHN1YnRlc3QuZGF0YVxuICAgICAgaWYgZGF0YS5sYWJlbHM/XG4gICAgICAgIGZvciBsYWJlbCwgaSBpbiBkYXRhLmxhYmVsc1xuICAgICAgICAgIHJldHVybiBkYXRhLmxvY2F0aW9uW2ldIGlmIGxhYmVsIGlzIGtleVxuICAgICAgZWxzZVxuICAgICAgICBmb3IgdmFyaWFibGUsIHZhbHVlIG9mIGRhdGFcbiAgICAgICAgICBpZiB2YXJpYWJsZSA9PSBrZXlcbiAgICAgICAgICAgIGlmIF8uaXNPYmplY3QodmFsdWUpXG4gICAgICAgICAgICAgIHJldHVybiBfLmNvbXBhY3QoKChuYW1lIGlmIHN0YXRlID09IFwiY2hlY2tlZFwiKSBmb3IgbmFtZSwgc3RhdGUgb2YgdmFsdWUpKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICByZXR1cm4gbnVsbFxuXG4gIGdldEJ5SGFzaDogKCBoYXNoICkgLT5cbiAgICBpZiBoYXNoXG4gICAgICBmb3Igc3VidGVzdCBpbiBAZ2V0KFwic3VidGVzdERhdGFcIilcbiAgICAgICAgaWYgaGFzaCBpcyBzdWJ0ZXN0LnN1YnRlc3RIYXNoXG4gICAgICAgICAgcmV0dXJuIHN1YnRlc3QuZGF0YVxuICAgIHJldHVybiBudWxsXG5cbiAgZ2V0R3JpZFNjb3JlOiAoaWQpIC0+XG4gICAgZm9yIGRhdHVtIGluIEBnZXQgJ3N1YnRlc3REYXRhJ1xuICAgICAgcmV0dXJuIHBhcnNlSW50KGRhdHVtLmRhdGEuYXR0ZW1wdGVkKSBpZiBkYXR1bS5zdWJ0ZXN0SWQgPT0gaWRcblxuICBnZXRJdGVtUmVzdWx0Q291bnRCeVZhcmlhYmxlTmFtZTogKG5hbWUsIHJlc3VsdCkgLT5cbiAgICBmb3VuZCA9IGZhbHNlXG4gICAgY291bnQgPSAwXG4gICAgZm9yIGRhdHVtIGluIEBnZXQgJ3N1YnRlc3REYXRhJ1xuICAgICAgaWYgZGF0dW0uZGF0YT8gYW5kIGRhdHVtLmRhdGEudmFyaWFibGVfbmFtZT8gYW5kIGRhdHVtLmRhdGEudmFyaWFibGVfbmFtZSA9PSBuYW1lXG4gICAgICAgIGZvdW5kID0gdHJ1ZVxuICAgICAgICBpdGVtcyA9IGRhdHVtLmRhdGEuaXRlbXNcbiAgICAgICAgZm9yIGl0ZW0gaW4gaXRlbXNcbiAgICAgICAgICBjb3VudCsrIGlmIGl0ZW0uaXRlbVJlc3VsdCA9PSByZXN1bHRcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJWYXJpYWJsZSBuYW1lIFxcXCIje25hbWV9XFxcIiBub3QgZm91bmRcIikgaWYgbm90IGZvdW5kXG4gICAgcmV0dXJuIGNvdW50XG5cbiAgZ3JpZFdhc0F1dG9zdG9wcGVkOiAoaWQpIC0+XG4gICAgZm9yIGRhdHVtIGluIEBnZXQgJ3N1YnRlc3REYXRhJ1xuICAgICAgcmV0dXJuIGRhdHVtLmRhdGEuYXV0b19zdG9wIGlmIGRhdHVtLnN1YnRlc3RJZCA9PSBpZFxuIl19
