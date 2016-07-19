var AssessmentPrintView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AssessmentPrintView = (function(superClass) {
  extend(AssessmentPrintView, superClass);

  function AssessmentPrintView() {
    this.afterRender = bind(this.afterRender, this);
    return AssessmentPrintView.__super__.constructor.apply(this, arguments);
  }

  AssessmentPrintView.prototype.className = "AssessmentPrintView";

  AssessmentPrintView.prototype.initialize = function(options) {
    this.abortAssessment = false;
    this.index = 0;
    this.model = options.model;
    this.format = options.format;
    Tangerine.activity = "assessment print";
    this.subtestViews = [];
    this.model.subtests.sort();
    return this.model.subtests.each((function(_this) {
      return function(subtest) {
        var subtestView;
        subtestView = new SubtestPrintView({
          model: subtest,
          parent: _this,
          format: _this.format
        });
        subtestView.on("rendered", function(view) {
          return view != null ? typeof view.afterRender === "function" ? view.afterRender() : void 0 : void 0;
        });
        return _this.subtestViews.push(subtestView);
      };
    })(this));
  };

  AssessmentPrintView.prototype.render = function() {
    if (this.model.subtests.length === 0) {
      this.$el.append("<h1>Oops...</h1><p>This assessment is blank. Perhaps you meant to add some subtests.</p>");
    } else {
      this.$el.addClass("format-" + this.format).append("<style> @page :right { @bottom-right-corner { content: counter(page) \" of \" counter(pages); }} table.print-metadata td{ border: solid black 1px; } table.print-content.question-attributes{ margin: 10px; } table.print-content.question-options{ margin-bottom: 5px; } table.print-content{ border: solid black 1px; } table.print-content td{ border: solid black 1px; } .AssessmentPrintView #prototype_wrapper .print-page.content { height: auto; } </style> <div class='print-page " + this.format + "'> <h2>" + (this.model.get("name").titleize()) + "</h2> <h3> " + (this.model.has("updated") ? "Last Updated: " + (moment(this.model.get("updated"))) : "") + " </h3> <table class='marking-table'> <tr> <td style='vertical-align:middle'>Enumerator Name</td><td class='marking-area'></td> </tr> </table> </div> <hr/>");
      _.each(this.subtestViews, (function(_this) {
        return function(subtestView) {
          subtestView.render();
          return _this.$el.append(subtestView.el);
        };
      })(this));
    }
    return this.trigger("rendered");
  };

  AssessmentPrintView.prototype.afterRender = function() {
    return _.delay(function() {
      $('#navigation').hide();
      return $('#footer').hide();
    }, 1000);
  };

  return AssessmentPrintView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2Vzc21lbnQvQXNzZXNzbWVudFByaW50Vmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxtQkFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7O2dDQUVKLFNBQUEsR0FBVzs7Z0NBRVgsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUNWLElBQUMsQ0FBQSxlQUFELEdBQW1CO0lBQ25CLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDVCxJQUFDLENBQUEsS0FBRCxHQUFTLE9BQU8sQ0FBQztJQUNqQixJQUFDLENBQUEsTUFBRCxHQUFVLE9BQU8sQ0FBQztJQUVsQixTQUFTLENBQUMsUUFBVixHQUFxQjtJQUNyQixJQUFDLENBQUEsWUFBRCxHQUFnQjtJQUNoQixJQUFDLENBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFoQixDQUFBO1dBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBaEIsQ0FBcUIsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFFLE9BQUY7QUFDbkIsWUFBQTtRQUFBLFdBQUEsR0FBa0IsSUFBQSxnQkFBQSxDQUNoQjtVQUFBLEtBQUEsRUFBUyxPQUFUO1VBQ0EsTUFBQSxFQUFTLEtBRFQ7VUFFQSxNQUFBLEVBQVMsS0FBQyxDQUFBLE1BRlY7U0FEZ0I7UUFJbEIsV0FBVyxDQUFDLEVBQVosQ0FBZSxVQUFmLEVBQTJCLFNBQUUsSUFBRjt5RUFDekIsSUFBSSxDQUFFO1FBRG1CLENBQTNCO2VBRUEsS0FBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQW1CLFdBQW5CO01BUG1CO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQjtFQVRVOztnQ0FrQlosTUFBQSxHQUFRLFNBQUE7SUFDTixJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQWhCLEtBQTBCLENBQTdCO01BQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksMEZBQVosRUFERjtLQUFBLE1BQUE7TUFHRSxJQUFDLENBQUEsR0FBRyxDQUFDLFFBQUwsQ0FBYyxTQUFBLEdBQVUsSUFBQyxDQUFBLE1BQXpCLENBQWtDLENBQUMsTUFBbkMsQ0FBMEMsNmRBQUEsR0F3QmYsSUFBQyxDQUFBLE1BeEJjLEdBd0JQLFNBeEJPLEdBeUJqQyxDQUFDLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLE1BQVgsQ0FBa0IsQ0FBQyxRQUFuQixDQUFBLENBQUQsQ0F6QmlDLEdBeUJGLGFBekJFLEdBMkJuQyxDQUNJLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFNBQVgsQ0FBSCxHQUNFLGdCQUFBLEdBQWdCLENBQUMsTUFBQSxDQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFNBQVgsQ0FBUCxDQUFELENBRGxCLEdBR0UsRUFKSCxDQTNCbUMsR0FnQ25DLDRKQWhDUDtNQTBDQSxDQUFDLENBQUMsSUFBRixDQUFPLElBQUMsQ0FBQSxZQUFSLEVBQXVCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxXQUFEO1VBRXJCLFdBQVcsQ0FBQyxNQUFaLENBQUE7aUJBQ0EsS0FBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksV0FBVyxDQUFDLEVBQXhCO1FBSHFCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2QixFQTdDRjs7V0FrREEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxVQUFUO0VBbkRNOztnQ0FxRFIsV0FBQSxHQUFhLFNBQUE7V0FDWCxDQUFDLENBQUMsS0FBRixDQUFRLFNBQUE7TUFDTixDQUFBLENBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQUE7YUFDQSxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsSUFBYixDQUFBO0lBRk0sQ0FBUixFQUdFLElBSEY7RUFEVzs7OztHQTNFbUIsUUFBUSxDQUFDIiwiZmlsZSI6ImFzc2Vzc21lbnQvQXNzZXNzbWVudFByaW50Vmlldy5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFzc2Vzc21lbnRQcmludFZpZXcgZXh0ZW5kcyBCYWNrYm9uZS5WaWV3XG5cbiAgY2xhc3NOYW1lOiBcIkFzc2Vzc21lbnRQcmludFZpZXdcIlxuICBcbiAgaW5pdGlhbGl6ZTogKG9wdGlvbnMpIC0+XG4gICAgQGFib3J0QXNzZXNzbWVudCA9IGZhbHNlXG4gICAgQGluZGV4ID0gMFxuICAgIEBtb2RlbCA9IG9wdGlvbnMubW9kZWxcbiAgICBAZm9ybWF0ID0gb3B0aW9ucy5mb3JtYXRcblxuICAgIFRhbmdlcmluZS5hY3Rpdml0eSA9IFwiYXNzZXNzbWVudCBwcmludFwiXG4gICAgQHN1YnRlc3RWaWV3cyA9IFtdXG4gICAgQG1vZGVsLnN1YnRlc3RzLnNvcnQoKVxuICAgIEBtb2RlbC5zdWJ0ZXN0cy5lYWNoICggc3VidGVzdCApID0+XG4gICAgICBzdWJ0ZXN0VmlldyA9IG5ldyBTdWJ0ZXN0UHJpbnRWaWV3XG4gICAgICAgIG1vZGVsICA6IHN1YnRlc3RcbiAgICAgICAgcGFyZW50IDogQFxuICAgICAgICBmb3JtYXQgOiBAZm9ybWF0XG4gICAgICBzdWJ0ZXN0Vmlldy5vbiBcInJlbmRlcmVkXCIsICggdmlldyApID0+XG4gICAgICAgIHZpZXc/LmFmdGVyUmVuZGVyPygpXG4gICAgICBAc3VidGVzdFZpZXdzLnB1c2ggc3VidGVzdFZpZXdcbiAgXG4gIHJlbmRlcjogLT5cbiAgICBpZiBAbW9kZWwuc3VidGVzdHMubGVuZ3RoID09IDBcbiAgICAgIEAkZWwuYXBwZW5kIFwiPGgxPk9vcHMuLi48L2gxPjxwPlRoaXMgYXNzZXNzbWVudCBpcyBibGFuay4gUGVyaGFwcyB5b3UgbWVhbnQgdG8gYWRkIHNvbWUgc3VidGVzdHMuPC9wPlwiXG4gICAgZWxzZVxuICAgICAgQCRlbC5hZGRDbGFzcyhcImZvcm1hdC0je0Bmb3JtYXR9XCIpLmFwcGVuZCBcIlxuICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgQHBhZ2UgOnJpZ2h0IHsgQGJvdHRvbS1yaWdodC1jb3JuZXIge1xuICAgICAgICAgICAgY29udGVudDogY291bnRlcihwYWdlKSBcXFwiIG9mIFxcXCIgY291bnRlcihwYWdlcyk7XG4gICAgICAgICAgfX1cbiAgICAgICAgICB0YWJsZS5wcmludC1tZXRhZGF0YSB0ZHtcbiAgICAgICAgICAgIGJvcmRlcjogc29saWQgYmxhY2sgMXB4O1xuICAgICAgICAgIH1cbiAgICAgICAgICB0YWJsZS5wcmludC1jb250ZW50LnF1ZXN0aW9uLWF0dHJpYnV0ZXN7XG4gICAgICAgICAgICBtYXJnaW46IDEwcHg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRhYmxlLnByaW50LWNvbnRlbnQucXVlc3Rpb24tb3B0aW9uc3tcbiAgICAgICAgICAgIG1hcmdpbi1ib3R0b206IDVweDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGFibGUucHJpbnQtY29udGVudHtcbiAgICAgICAgICAgIGJvcmRlcjogc29saWQgYmxhY2sgMXB4O1xuICAgICAgICAgIH1cbiAgICAgICAgICB0YWJsZS5wcmludC1jb250ZW50IHRke1xuICAgICAgICAgICAgYm9yZGVyOiBzb2xpZCBibGFjayAxcHg7XG4gICAgICAgICAgfVxuICAgICAgICAgIC5Bc3Nlc3NtZW50UHJpbnRWaWV3ICNwcm90b3R5cGVfd3JhcHBlciAucHJpbnQtcGFnZS5jb250ZW50IHtcbiAgICAgICAgICAgIGhlaWdodDogYXV0bztcbiAgICAgICAgICB9XG4gICAgICAgIDwvc3R5bGU+XG4gICAgICAgIDxkaXYgY2xhc3M9J3ByaW50LXBhZ2UgI3tAZm9ybWF0fSc+XG4gICAgICAgICAgPGgyPiN7QG1vZGVsLmdldChcIm5hbWVcIikudGl0bGVpemUoKX08L2gyPlxuICAgICAgICAgIDxoMz5cbiAgICAgICAgICAgICN7XG4gICAgICAgICAgICAgIGlmIEBtb2RlbC5oYXMgXCJ1cGRhdGVkXCJcbiAgICAgICAgICAgICAgICBcIkxhc3QgVXBkYXRlZDogI3ttb21lbnQoQG1vZGVsLmdldCBcInVwZGF0ZWRcIil9XCJcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIFwiXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA8L2gzPlxuICAgICAgICAgIDx0YWJsZSBjbGFzcz0nbWFya2luZy10YWJsZSc+XG4gICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgIDx0ZCBzdHlsZT0ndmVydGljYWwtYWxpZ246bWlkZGxlJz5FbnVtZXJhdG9yIE5hbWU8L3RkPjx0ZCBjbGFzcz0nbWFya2luZy1hcmVhJz48L3RkPlxuICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGhyLz5cbiAgICAgIFwiXG4gICAgICBfLmVhY2ggQHN1YnRlc3RWaWV3cyAsIChzdWJ0ZXN0VmlldykgPT5cblxuICAgICAgICBzdWJ0ZXN0Vmlldy5yZW5kZXIoKVxuICAgICAgICBAJGVsLmFwcGVuZCBzdWJ0ZXN0Vmlldy5lbFxuXG4gICAgQHRyaWdnZXIgXCJyZW5kZXJlZFwiXG5cbiAgYWZ0ZXJSZW5kZXI6ID0+XG4gICAgXy5kZWxheSAoKSAtPlxuICAgICAgJCgnI25hdmlnYXRpb24nKS5oaWRlKClcbiAgICAgICQoJyNmb290ZXInKS5oaWRlKClcbiAgICAgLDEwMDBcbiJdfQ==
