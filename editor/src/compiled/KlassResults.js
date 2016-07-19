var KlassResults,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassResults = (function(superClass) {
  extend(KlassResults, superClass);

  function KlassResults() {
    return KlassResults.__super__.constructor.apply(this, arguments);
  }

  KlassResults.prototype.url = "result";

  KlassResults.prototype.model = KlassResult;

  KlassResults.prototype.initialize = function(options) {
    if (options == null) {
      options = {};
    }
    if (!((options.showOld != null) && options.showOld === true)) {
      return this.on("all", (function(_this) {
        return function(event) {
          var i, j, len, len1, ref, result, resultId, results, toRemove;
          toRemove = [];
          ref = _this.models;
          for (i = 0, len = ref.length; i < len; i++) {
            result = ref[i];
            if (result.has("old")) {
              toRemove.push(result.id);
            }
          }
          results = [];
          for (j = 0, len1 = toRemove.length; j < len1; j++) {
            resultId = toRemove[j];
            results.push(_this.remove(resultId, {
              silent: true
            }));
          }
          return results;
        };
      })(this));
    }
  };

  return KlassResults;

})(Backbone.Collection);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtsYXNzL0tsYXNzUmVzdWx0cy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxZQUFBO0VBQUE7OztBQUFNOzs7Ozs7O3lCQUVKLEdBQUEsR0FBSzs7eUJBQ0wsS0FBQSxHQUFPOzt5QkFFUCxVQUFBLEdBQVksU0FBQyxPQUFEOztNQUFDLFVBQVU7O0lBQ3JCLElBQUEsQ0FBQSxDQUFPLHlCQUFBLElBQW9CLE9BQU8sQ0FBQyxPQUFSLEtBQW1CLElBQTlDLENBQUE7YUFDRSxJQUFDLENBQUEsRUFBRCxDQUFJLEtBQUosRUFBVyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUNULGNBQUE7VUFBQSxRQUFBLEdBQVc7QUFDWDtBQUFBLGVBQUEscUNBQUE7O1lBQ0UsSUFBMkIsTUFBTSxDQUFDLEdBQVAsQ0FBVyxLQUFYLENBQTNCO2NBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxNQUFNLENBQUMsRUFBckIsRUFBQTs7QUFERjtBQUVBO2VBQUEsNENBQUE7O3lCQUNFLEtBQUMsQ0FBQSxNQUFELENBQVEsUUFBUixFQUFrQjtjQUFBLE1BQUEsRUFBUSxJQUFSO2FBQWxCO0FBREY7O1FBSlM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsRUFERjs7RUFEVTs7OztHQUxhLFFBQVEsQ0FBQyIsImZpbGUiOiJrbGFzcy9LbGFzc1Jlc3VsdHMuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBLbGFzc1Jlc3VsdHMgZXh0ZW5kcyBCYWNrYm9uZS5Db2xsZWN0aW9uXG5cbiAgdXJsOiBcInJlc3VsdFwiXG4gIG1vZGVsOiBLbGFzc1Jlc3VsdFxuXG4gIGluaXRpYWxpemU6IChvcHRpb25zID0ge30pIC0+XG4gICAgdW5sZXNzIG9wdGlvbnMuc2hvd09sZD8gJiYgb3B0aW9ucy5zaG93T2xkID09IHRydWVcbiAgICAgIEBvbiBcImFsbFwiLCAoZXZlbnQpID0+XG4gICAgICAgIHRvUmVtb3ZlID0gW11cbiAgICAgICAgZm9yIHJlc3VsdCBpbiBAbW9kZWxzXG4gICAgICAgICAgdG9SZW1vdmUucHVzaCByZXN1bHQuaWQgaWYgcmVzdWx0LmhhcyhcIm9sZFwiKVxuICAgICAgICBmb3IgcmVzdWx0SWQgaW4gdG9SZW1vdmVcbiAgICAgICAgICBAcmVtb3ZlKHJlc3VsdElkLCBzaWxlbnQ6IHRydWUpIFxuIl19
