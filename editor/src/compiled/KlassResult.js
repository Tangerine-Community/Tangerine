var KlassResult,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassResult = (function(superClass) {
  extend(KlassResult, superClass);

  function KlassResult() {
    return KlassResult.__super__.constructor.apply(this, arguments);
  }

  KlassResult.prototype.url = "result";

  KlassResult.prototype.add = function(subtestDataElement, callback) {
    return this.save({
      'subtestData': subtestDataElement
    }, {
      success: (function(_this) {
        return function() {
          return callback();
        };
      })(this)
    });
  };

  KlassResult.prototype.getItemized = function(options) {
    var itemized, key, ref, value;
    if (this.attributes.prototype === "grid") {
      itemized = this.attributes.subtestData.items;
    } else if (this.attributes.prototype === "survey") {
      itemized = [];
      ref = this.attributes.subtestData;
      for (key in ref) {
        value = ref[key];
        itemized.push({
          itemLabel: key,
          itemResult: value
        });
      }
    }
    return itemized;
  };

  KlassResult.prototype.get = function(options) {
    if (options === "correct") {
      return this.gridCount(["correct", 1]);
    }
    if (options === "incorrect") {
      return this.gridCount(["incorrect", 0]);
    }
    if (options === "missing") {
      return this.gridCount(["missing", 9]);
    }
    if (options === "total") {
      if (this.attributes.prototype === "grid") {
        return this.attributes.subtestData.items.length;
      } else if (this.attributes.prototype === "survey") {
        return _.keys(this.attributes.subtestData).length;
      }
    }
    if (options === "attempted") {
      return this.getAttempted();
    }
    if (options === "time_remain") {
      return this.getTimeRemain();
    }
    return KlassResult.__super__.get.call(this, options);
  };

  KlassResult.prototype.gridCount = function(value) {
    var count, i, item, j, k, len, len1, ref, ref1, ref2, ref3, v;
    count = 0;
    if (this.attributes.prototype === "grid") {
      if (_.isArray(value)) {
        ref = this.get("subtestData").items;
        for (i = 0, len = ref.length; i < len; i++) {
          item = ref[i];
          if (~value.indexOf(item.itemResult)) {
            count++;
          }
        }
      } else {
        ref1 = this.get("subtestData").items;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          item = ref1[j];
          if (item.itemResult === value) {
            count++;
          }
        }
      }
    } else if (this.attributes.prototype === "survey") {
      if (_.isArray(value)) {
        ref2 = this.attributes.subtestData;
        for (k in ref2) {
          v = ref2[k];
          if (~value.indexOf(v) || ~value.indexOf(parseInt(v))) {
            count++;
          }
        }
      } else {
        ref3 = this.attributes.subtestData;
        for (k in ref3) {
          v = ref3[k];
          if (value === v || value === parseInt(v)) {
            count++;
          }
        }
      }
    }
    return count;
  };

  KlassResult.prototype.getAttempted = function() {
    return parseInt(this.get("subtestData").attempted);
  };

  KlassResult.prototype.getTimeRemain = function() {
    return parseInt(this.get("subtestData").time_remain);
  };

  KlassResult.prototype.getCorrectPerSeconds = function(secondsAllowed) {
    return Math.round((this.get("correct") / (secondsAllowed - this.getTimeRemain())) * secondsAllowed);
  };

  return KlassResult;

})(Backbone.Model);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtsYXNzL0tsYXNzUmVzdWx0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLFdBQUE7RUFBQTs7O0FBQU07Ozs7Ozs7d0JBRUosR0FBQSxHQUFNOzt3QkFFTixHQUFBLEdBQUssU0FBRSxrQkFBRixFQUFzQixRQUF0QjtXQUNILElBQUMsQ0FBQSxJQUFELENBQ0U7TUFBQSxhQUFBLEVBQWdCLGtCQUFoQjtLQURGLEVBR0U7TUFBQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLFFBQUEsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO0tBSEY7RUFERzs7d0JBTUwsV0FBQSxHQUFhLFNBQUMsT0FBRDtBQUVYLFFBQUE7SUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBWixLQUF5QixNQUE1QjtNQUNFLFFBQUEsR0FBVyxJQUFDLENBQUEsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQURyQztLQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsVUFBVSxDQUFDLFNBQVosS0FBeUIsUUFBNUI7TUFDSCxRQUFBLEdBQVc7QUFDWDtBQUFBLFdBQUEsVUFBQTs7UUFDRSxRQUFRLENBQUMsSUFBVCxDQUNFO1VBQUEsU0FBQSxFQUFXLEdBQVg7VUFDQSxVQUFBLEVBQVksS0FEWjtTQURGO0FBREYsT0FGRzs7QUFPTCxXQUFPO0VBWEk7O3dCQWFiLEdBQUEsR0FBSyxTQUFDLE9BQUQ7SUFDSCxJQUFHLE9BQUEsS0FBVyxTQUFkO0FBQWlDLGFBQU8sSUFBQyxDQUFBLFNBQUQsQ0FBVyxDQUFDLFNBQUQsRUFBWSxDQUFaLENBQVgsRUFBeEM7O0lBQ0EsSUFBRyxPQUFBLEtBQVcsV0FBZDtBQUFpQyxhQUFPLElBQUMsQ0FBQSxTQUFELENBQVcsQ0FBQyxXQUFELEVBQWMsQ0FBZCxDQUFYLEVBQXhDOztJQUNBLElBQUcsT0FBQSxLQUFXLFNBQWQ7QUFBaUMsYUFBTyxJQUFDLENBQUEsU0FBRCxDQUFXLENBQUMsU0FBRCxFQUFZLENBQVosQ0FBWCxFQUF4Qzs7SUFFQSxJQUFHLE9BQUEsS0FBVyxPQUFkO01BQ0UsSUFBRyxJQUFDLENBQUEsVUFBVSxDQUFDLFNBQVosS0FBeUIsTUFBNUI7QUFDRSxlQUFPLElBQUMsQ0FBQSxVQUFVLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxPQUR2QztPQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsVUFBVSxDQUFDLFNBQVosS0FBeUIsUUFBNUI7QUFDSCxlQUFPLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLFVBQVUsQ0FBQyxXQUFuQixDQUErQixDQUFDLE9BRHBDO09BSFA7O0lBTUEsSUFBRyxPQUFBLEtBQVcsV0FBZDtBQUFpQyxhQUFPLElBQUMsQ0FBQSxZQUFELENBQUEsRUFBeEM7O0lBQ0EsSUFBRyxPQUFBLEtBQVcsYUFBZDtBQUFpQyxhQUFPLElBQUMsQ0FBQSxhQUFELENBQUEsRUFBeEM7O1dBS0EscUNBQU0sT0FBTjtFQWpCRzs7d0JBbUJMLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVCxRQUFBO0lBQUEsS0FBQSxHQUFRO0lBQ1IsSUFBRyxJQUFDLENBQUEsVUFBVSxDQUFDLFNBQVosS0FBeUIsTUFBNUI7TUFDRSxJQUFHLENBQUMsQ0FBQyxPQUFGLENBQVUsS0FBVixDQUFIO0FBQ0U7QUFBQSxhQUFBLHFDQUFBOztVQUFDLElBQVcsQ0FBQyxLQUFLLENBQUMsT0FBTixDQUFjLElBQUksQ0FBQyxVQUFuQixDQUFaO1lBQUEsS0FBQSxHQUFBOztBQUFELFNBREY7T0FBQSxNQUFBO0FBR0U7QUFBQSxhQUFBLHdDQUFBOztVQUFDLElBQVcsSUFBSSxDQUFDLFVBQUwsS0FBbUIsS0FBOUI7WUFBQSxLQUFBLEdBQUE7O0FBQUQsU0FIRjtPQURGO0tBQUEsTUFLSyxJQUFHLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBWixLQUF5QixRQUE1QjtNQUNILElBQUcsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFWLENBQUg7QUFDRTtBQUFBLGFBQUEsU0FBQTs7VUFDRSxJQUFZLENBQUMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLENBQUQsSUFBcUIsQ0FBQyxLQUFLLENBQUMsT0FBTixDQUFjLFFBQUEsQ0FBUyxDQUFULENBQWQsQ0FBbEM7WUFBQSxLQUFBLEdBQUE7O0FBREYsU0FERjtPQUFBLE1BQUE7QUFJRTtBQUFBLGFBQUEsU0FBQTs7VUFDRSxJQUFZLEtBQUEsS0FBUyxDQUFULElBQWMsS0FBQSxLQUFTLFFBQUEsQ0FBUyxDQUFULENBQW5DO1lBQUEsS0FBQSxHQUFBOztBQURGLFNBSkY7T0FERzs7QUFRTCxXQUFPO0VBZkU7O3dCQWlCWCxZQUFBLEdBQWMsU0FBQTtBQUNaLFdBQU8sUUFBQSxDQUFVLElBQUMsQ0FBQSxHQUFELENBQUssYUFBTCxDQUFtQixDQUFDLFNBQTlCO0VBREs7O3dCQUdkLGFBQUEsR0FBZSxTQUFBO0FBQ2IsV0FBTyxRQUFBLENBQVUsSUFBQyxDQUFBLEdBQUQsQ0FBSyxhQUFMLENBQW1CLENBQUMsV0FBOUI7RUFETTs7d0JBR2Ysb0JBQUEsR0FBc0IsU0FBRSxjQUFGO1dBQ3BCLElBQUksQ0FBQyxLQUFMLENBQVksQ0FBRSxJQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsQ0FBQSxHQUFrQixDQUFFLGNBQUEsR0FBaUIsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFuQixDQUFwQixDQUFBLEdBQThELGNBQTFFO0VBRG9COzs7O0dBakVFLFFBQVEsQ0FBQyIsImZpbGUiOiJrbGFzcy9LbGFzc1Jlc3VsdC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEtsYXNzUmVzdWx0IGV4dGVuZHMgQmFja2JvbmUuTW9kZWxcblxuICB1cmwgOiBcInJlc3VsdFwiXG5cbiAgYWRkOiAoIHN1YnRlc3REYXRhRWxlbWVudCwgY2FsbGJhY2sgKSAtPlxuICAgIEBzYXZlXG4gICAgICAnc3VidGVzdERhdGEnIDogc3VidGVzdERhdGFFbGVtZW50XG4gICAgLFxuICAgICAgc3VjY2VzczogPT4gY2FsbGJhY2soKVxuXG4gIGdldEl0ZW1pemVkOiAob3B0aW9ucykgLT5cbiAgXG4gICAgaWYgQGF0dHJpYnV0ZXMucHJvdG90eXBlID09IFwiZ3JpZFwiXG4gICAgICBpdGVtaXplZCA9IEBhdHRyaWJ1dGVzLnN1YnRlc3REYXRhLml0ZW1zXG4gICAgZWxzZSBpZiBAYXR0cmlidXRlcy5wcm90b3R5cGUgPT0gXCJzdXJ2ZXlcIlxuICAgICAgaXRlbWl6ZWQgPSBbXVxuICAgICAgZm9yIGtleSwgdmFsdWUgb2YgQGF0dHJpYnV0ZXMuc3VidGVzdERhdGFcbiAgICAgICAgaXRlbWl6ZWQucHVzaFxuICAgICAgICAgIGl0ZW1MYWJlbDoga2V5XG4gICAgICAgICAgaXRlbVJlc3VsdDogdmFsdWVcblxuICAgIHJldHVybiBpdGVtaXplZFxuXG4gIGdldDogKG9wdGlvbnMpIC0+XG4gICAgaWYgb3B0aW9ucyA9PSBcImNvcnJlY3RcIiAgICAgdGhlbiByZXR1cm4gQGdyaWRDb3VudCBbXCJjb3JyZWN0XCIsIDFdXG4gICAgaWYgb3B0aW9ucyA9PSBcImluY29ycmVjdFwiICAgdGhlbiByZXR1cm4gQGdyaWRDb3VudCBbXCJpbmNvcnJlY3RcIiwgMF1cbiAgICBpZiBvcHRpb25zID09IFwibWlzc2luZ1wiICAgICB0aGVuIHJldHVybiBAZ3JpZENvdW50IFtcIm1pc3NpbmdcIiwgOV1cblxuICAgIGlmIG9wdGlvbnMgPT0gXCJ0b3RhbFwiXG4gICAgICBpZiBAYXR0cmlidXRlcy5wcm90b3R5cGUgPT0gXCJncmlkXCJcbiAgICAgICAgcmV0dXJuIEBhdHRyaWJ1dGVzLnN1YnRlc3REYXRhLml0ZW1zLmxlbmd0aFxuICAgICAgZWxzZSBpZiBAYXR0cmlidXRlcy5wcm90b3R5cGUgPT0gXCJzdXJ2ZXlcIlxuICAgICAgICByZXR1cm4gXy5rZXlzKEBhdHRyaWJ1dGVzLnN1YnRlc3REYXRhKS5sZW5ndGhcbiAgICBcbiAgICBpZiBvcHRpb25zID09IFwiYXR0ZW1wdGVkXCIgICB0aGVuIHJldHVybiBAZ2V0QXR0ZW1wdGVkKClcbiAgICBpZiBvcHRpb25zID09IFwidGltZV9yZW1haW5cIiB0aGVuIHJldHVybiBAZ2V0VGltZVJlbWFpbigpXG5cbiAgICAjIGlmIG5vIHNwZWNpYWwgcHJvcGVydGllcyBkZXRlY3RlZCBsZXQncyBnbyB3aXRoIHN1cGVyXG4gICAgIyByZXN1bHQgPSBLbGFzc1Jlc3VsdC5fX3N1cGVyX18uZ2V0LmFwcGx5IEAsIGFyZ3VtZW50c1xuXG4gICAgc3VwZXIob3B0aW9ucylcblxuICBncmlkQ291bnQ6ICh2YWx1ZSkgLT5cbiAgICBjb3VudCA9IDBcbiAgICBpZiBAYXR0cmlidXRlcy5wcm90b3R5cGUgPT0gXCJncmlkXCJcbiAgICAgIGlmIF8uaXNBcnJheSh2YWx1ZSlcbiAgICAgICAgKGNvdW50KysgaWYgfnZhbHVlLmluZGV4T2YoaXRlbS5pdGVtUmVzdWx0KSkgZm9yIGl0ZW0gaW4gQGdldChcInN1YnRlc3REYXRhXCIpLml0ZW1zICAgXG4gICAgICBlbHNlXG4gICAgICAgIChjb3VudCsrIGlmIGl0ZW0uaXRlbVJlc3VsdCA9PSB2YWx1ZSkgZm9yIGl0ZW0gaW4gQGdldChcInN1YnRlc3REYXRhXCIpLml0ZW1zIFxuICAgIGVsc2UgaWYgQGF0dHJpYnV0ZXMucHJvdG90eXBlID09IFwic3VydmV5XCJcbiAgICAgIGlmIF8uaXNBcnJheSh2YWx1ZSlcbiAgICAgICAgZm9yIGssIHYgb2YgQGF0dHJpYnV0ZXMuc3VidGVzdERhdGFcbiAgICAgICAgICBjb3VudCsrIGlmICh+dmFsdWUuaW5kZXhPZih2KSB8fCB+dmFsdWUuaW5kZXhPZihwYXJzZUludCh2KSkpXG4gICAgICBlbHNlXG4gICAgICAgIGZvciBrLCB2IG9mIEBhdHRyaWJ1dGVzLnN1YnRlc3REYXRhXG4gICAgICAgICAgY291bnQrKyBpZiAodmFsdWUgPT0gdiB8fCB2YWx1ZSA9PSBwYXJzZUludCh2KSlcbiAgICAgICAgICAgIFxuICAgIHJldHVybiBjb3VudFxuXG4gIGdldEF0dGVtcHRlZDogLT5cbiAgICByZXR1cm4gcGFyc2VJbnQoIEBnZXQoXCJzdWJ0ZXN0RGF0YVwiKS5hdHRlbXB0ZWQgKVxuXG4gIGdldFRpbWVSZW1haW46IC0+XG4gICAgcmV0dXJuIHBhcnNlSW50KCBAZ2V0KFwic3VidGVzdERhdGFcIikudGltZV9yZW1haW4gKVxuXG4gIGdldENvcnJlY3RQZXJTZWNvbmRzOiAoIHNlY29uZHNBbGxvd2VkICkgLT5cbiAgICBNYXRoLnJvdW5kKCAoIEBnZXQoXCJjb3JyZWN0XCIpIC8gKCBzZWNvbmRzQWxsb3dlZCAtIEBnZXRUaW1lUmVtYWluKCkgKSApICogc2Vjb25kc0FsbG93ZWQgKVxuIl19
