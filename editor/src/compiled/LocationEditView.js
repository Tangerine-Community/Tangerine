var LocationEditView,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

LocationEditView = (function(superClass) {
  extend(LocationEditView, superClass);

  function LocationEditView() {
    return LocationEditView.__super__.constructor.apply(this, arguments);
  }

  LocationEditView.prototype.className = "LocationEditView";

  LocationEditView.prototype.events = {
    'keyup #data': 'updateData',
    'keyup #levels': 'updateLevels',
    'click #data_format input': 'updateData',
    'click #levels_format input': 'updateLevels'
  };

  LocationEditView.prototype.updateData = function(event) {
    var data, hasCommas, hasTabs;
    if ((event != null ? event.type : void 0) === "click") {
      if ($(event.target).val() === "Tabs") {
        this.dataCommaToTab();
        hasTabs = true;
        hasCommas = false;
      } else {
        this.dataTabToComma();
        hasTabs = false;
        hasCommas = true;
      }
    } else {
      data = this.$el.find("#data").val();
      hasTabs = data.match(/\t/g) != null;
      hasCommas = data.match(/,/g) != null;
    }
    if (hasTabs) {
      return this.$el.find("#data_format :radio[value='Tabs']").attr("checked", "checked").button("refresh");
    } else {
      return this.$el.find("#data_format :radio[value='Commas']").attr("checked", "checked").button("refresh");
    }
  };

  LocationEditView.prototype.updateLevels = function(event) {
    var hasCommas, hasTabs, levels;
    if ((event != null ? event.type : void 0) === "click") {
      if ($(event.target).val() === "Tabs") {
        this.levelsCommaToTab();
        hasTabs = true;
        hasCommas = false;
      } else {
        this.levelsTabToComma();
        hasTabs = false;
        hasCommas = true;
      }
    } else {
      levels = this.$el.find("#levels").val();
      hasTabs = levels.match(/\t/g) != null;
      hasCommas = levels.match(/,/g) != null;
    }
    levels = this.$el.find("#levels").val();
    hasTabs = levels.match(/\t/g) != null;
    hasCommas = levels.match(/,/g) != null;
    if (hasTabs) {
      return this.$el.find("#levels_format :radio[value='Tabs']").attr("checked", "checked").button("refresh");
    } else {
      return this.$el.find("#levels_format :radio[value='Commas']").attr("checked", "checked").button("refresh");
    }
  };

  LocationEditView.prototype.dataTabToComma = function() {
    return this.$el.find("#data").val(String(this.$el.find("#data").val()).replace(/\t/g, ", "));
  };

  LocationEditView.prototype.dataCommaToTab = function() {
    return this.$el.find("#data").val(this.$el.find("#data").val().replace(/, */g, "\t"));
  };

  LocationEditView.prototype.levelsTabToComma = function() {
    return this.$el.find("#levels").val(String(this.$el.find("#levels").val()).replace(/\t/g, ", "));
  };

  LocationEditView.prototype.levelsCommaToTab = function() {
    return this.$el.find("#levels").val(this.$el.find("#levels").val().replace(/, */g, "\t"));
  };

  LocationEditView.prototype.save = function() {
    var i, j, k, len, len1, level, levels, location, locations, locationsValue;
    if (this.$el.find("#data").val().match(/\t/g) != null) {
      this.$el.find("#data_format :radio[value='Tabs']").attr("checked", "checked").button("refresh");
      this.dataTabToComma();
    }
    if (this.$el.find("#levels").val().match(/\t/g) != null) {
      this.levelsTabToComma();
      this.$el.find("#levels_format :radio[value='Tabs']").attr("checked", "checked").button("refresh");
    }
    levels = this.$el.find("#levels").val().split(/, */g);
    for (i = j = 0, len = levels.length; j < len; i = ++j) {
      level = levels[i];
      levels[i] = $.trim(level).replace(/[^a-zA-Z0-9']/g, "");
    }
    locationsValue = $.trim(this.$el.find("#data").val());
    locations = locationsValue.split("\n");
    for (i = k = 0, len1 = locations.length; k < len1; i = ++k) {
      location = locations[i];
      locations[i] = location.split(/, */g);
    }
    return this.model.set({
      "levels": levels,
      "locations": locations
    });
  };

  LocationEditView.prototype.isValid = function() {
    var j, len, levels, location, ref;
    levels = this.model.get("levels");
    ref = this.model.get("locations");
    for (j = 0, len = ref.length; j < len; j++) {
      location = ref[j];
      if (location.length !== levels.length) {
        if (indexOf.call(this.errors, "column_match") < 0) {
          this.errors.push("column_match");
        }
      }
    }
    return this.errors.length === 0;
  };

  LocationEditView.prototype.showErrors = function() {
    var alertText, error, j, len, ref;
    alertText = "Please correct the following errors:\n\n";
    ref = this.errors;
    for (j = 0, len = ref.length; j < len; j++) {
      error = ref[j];
      alertText += this.errorMessages[error];
    }
    alert(alertText);
    return this.errors = [];
  };

  LocationEditView.prototype.initialize = function(options) {
    this.errors = [];
    this.model = options.model;
    return this.errorMessages = {
      "column_match": "Some columns in the location data do not match the number of columns in the geographic levels."
    };
  };

  LocationEditView.prototype.render = function() {
    var i, j, len, levels, location, locations;
    levels = this.model.get("levels") || [];
    locations = this.model.get("locations") || [];
    levels = _.escape(levels.join(", "));
    locations = locations.join("\n");
    if (_.isArray(locations)) {
      for (i = j = 0, len = locations.length; j < len; i = ++j) {
        location = locations[i];
        locations[i] = _.escape(location.join(", "));
      }
    }
    return this.$el.html("<div class='label_value'> <div class='menu_box'> <label for='levels' title='This is a comma separated list of geographic levels. (E.g. Country, Province, District, School Id) These are the levels that you would consider individual fields on the location form.'>Geographic Levels</label> <input id='levels' value='" + levels + "'> <label title='Tangerine uses comma separated values. If you copy and paste from another program like Excel, the values will be tab separated. These buttons allow you to switch back and forth, however, Tangerine will always save the comma version.'>Format</label><br> <div id='levels_format' class='buttonset'> <label for='levels_tabs'>Tabs</label> <input id='levels_tabs' name='levels_format' type='radio' value='Tabs'> <label for='levels_commas'>Commas</label> <input id='levels_commas' name='levels_format' type='radio' value='Commas'> </div> </div> </div> <div class='label_value'> <div class='menu_box'> <label for='data' title='Comma sperated values, with multiple rows separated by line. This information will be used to autofill the location data.'>Location data</label> <textarea id='data'>" + locations + "</textarea><br> <label title='Tangerine uses comma separated values. If you copy and paste from another program like Excel, the values will be tab separated. These buttons allow you to switch back and forth, however, Tangerine will always save the comma version.'>Format</label><br>        <div id='data_format' class='buttonset'> <label for='data_tabs'>Tabs</label> <input id='data_tabs' name='data_format' type='radio' value='Tabs'> <label for='data_commas'>Commas</label> <input id='data_commas' name='data_format' type='radio' value='Commas'> </div> </div>");
  };

  LocationEditView.prototype.afterRender = function() {
    this.updateLevels();
    return this.updateData();
  };

  return LocationEditView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN1YnRlc3QvcHJvdG90eXBlcy9Mb2NhdGlvbkVkaXRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLGdCQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs2QkFFSixTQUFBLEdBQVc7OzZCQUVYLE1BQUEsR0FDRTtJQUFBLGFBQUEsRUFBOEIsWUFBOUI7SUFDQSxlQUFBLEVBQThCLGNBRDlCO0lBRUEsMEJBQUEsRUFBK0IsWUFGL0I7SUFHQSw0QkFBQSxFQUErQixjQUgvQjs7OzZCQU1GLFVBQUEsR0FBWSxTQUFDLEtBQUQ7QUFDVixRQUFBO0lBQUEscUJBQUcsS0FBSyxDQUFFLGNBQVAsS0FBZSxPQUFsQjtNQUNFLElBQUcsQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxHQUFoQixDQUFBLENBQUEsS0FBeUIsTUFBNUI7UUFDRSxJQUFDLENBQUEsY0FBRCxDQUFBO1FBQ0EsT0FBQSxHQUFZO1FBQ1osU0FBQSxHQUFZLE1BSGQ7T0FBQSxNQUFBO1FBS0UsSUFBQyxDQUFBLGNBQUQsQ0FBQTtRQUNBLE9BQUEsR0FBWTtRQUNaLFNBQUEsR0FBWSxLQVBkO09BREY7S0FBQSxNQUFBO01BV0UsSUFBQSxHQUFPLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLE9BQVYsQ0FBa0IsQ0FBQyxHQUFuQixDQUFBO01BQ1AsT0FBQSxHQUFVO01BQ1YsU0FBQSxHQUFZLHlCQWJkOztJQWVBLElBQUcsT0FBSDthQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLG1DQUFWLENBQThDLENBQUMsSUFBL0MsQ0FBb0QsU0FBcEQsRUFBK0QsU0FBL0QsQ0FBeUUsQ0FBQyxNQUExRSxDQUFpRixTQUFqRixFQURGO0tBQUEsTUFBQTthQUdFLElBQUMsQ0FBQSxHQUFHLENBQUMsSUFBTCxDQUFVLHFDQUFWLENBQWdELENBQUMsSUFBakQsQ0FBc0QsU0FBdEQsRUFBaUUsU0FBakUsQ0FBMkUsQ0FBQyxNQUE1RSxDQUFtRixT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NkJBd0NSLFdBQUEsR0FBYSxTQUFBO0lBQ1gsSUFBQyxDQUFBLFlBQUQsQ0FBQTtXQUNBLElBQUMsQ0FBQSxVQUFELENBQUE7RUFGVzs7OztHQWxKZ0IsUUFBUSxDQUFDIiwiZmlsZSI6InN1YnRlc3QvcHJvdG90eXBlcy9Mb2NhdGlvbkVkaXRWaWV3LmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTG9jYXRpb25FZGl0VmlldyBleHRlbmRzIEJhY2tib25lLlZpZXdcblxuICBjbGFzc05hbWU6IFwiTG9jYXRpb25FZGl0Vmlld1wiXG5cbiAgZXZlbnRzOiBcbiAgICAna2V5dXAgI2RhdGEnICAgICAgICAgICAgICAgOiAndXBkYXRlRGF0YSdcbiAgICAna2V5dXAgI2xldmVscycgICAgICAgICAgICAgOiAndXBkYXRlTGV2ZWxzJ1xuICAgICdjbGljayAjZGF0YV9mb3JtYXQgaW5wdXQnICAgOiAndXBkYXRlRGF0YSdcbiAgICAnY2xpY2sgI2xldmVsc19mb3JtYXQgaW5wdXQnIDogJ3VwZGF0ZUxldmVscydcblxuXG4gIHVwZGF0ZURhdGE6IChldmVudCkgLT5cbiAgICBpZiBldmVudD8udHlwZSA9PSBcImNsaWNrXCJcbiAgICAgIGlmICQoZXZlbnQudGFyZ2V0KS52YWwoKSA9PSBcIlRhYnNcIiBcbiAgICAgICAgQGRhdGFDb21tYVRvVGFiKClcbiAgICAgICAgaGFzVGFicyAgID0gdHJ1ZVxuICAgICAgICBoYXNDb21tYXMgPSBmYWxzZVxuICAgICAgZWxzZVxuICAgICAgICBAZGF0YVRhYlRvQ29tbWEoKVxuICAgICAgICBoYXNUYWJzICAgPSBmYWxzZVxuICAgICAgICBoYXNDb21tYXMgPSB0cnVlXG4gICAgICBcbiAgICBlbHNlXG4gICAgICBkYXRhID0gQCRlbC5maW5kKFwiI2RhdGFcIikudmFsKClcbiAgICAgIGhhc1RhYnMgPSBkYXRhLm1hdGNoKC9cXHQvZyk/XG4gICAgICBoYXNDb21tYXMgPSBkYXRhLm1hdGNoKC8sL2cpP1xuXG4gICAgaWYgaGFzVGFic1xuICAgICAgQCRlbC5maW5kKFwiI2RhdGFfZm9ybWF0IDpyYWRpb1t2YWx1ZT0nVGFicyddXCIpLmF0dHIoXCJjaGVja2VkXCIsIFwiY2hlY2tlZFwiKS5idXR0b24oXCJyZWZyZXNoXCIpXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI2RhdGFfZm9ybWF0IDpyYWRpb1t2YWx1ZT0nQ29tbWFzJ11cIikuYXR0cihcImNoZWNrZWRcIiwgXCJjaGVja2VkXCIpLmJ1dHRvbihcInJlZnJlc2hcIilcblxuICB1cGRhdGVMZXZlbHM6IChldmVudCkgLT5cbiAgICBpZiBldmVudD8udHlwZSA9PSBcImNsaWNrXCJcbiAgICAgIGlmICQoZXZlbnQudGFyZ2V0KS52YWwoKSA9PSBcIlRhYnNcIiBcbiAgICAgICAgQGxldmVsc0NvbW1hVG9UYWIoKVxuICAgICAgICBoYXNUYWJzICAgPSB0cnVlXG4gICAgICAgIGhhc0NvbW1hcyA9IGZhbHNlXG4gICAgICBlbHNlXG4gICAgICAgIEBsZXZlbHNUYWJUb0NvbW1hKClcbiAgICAgICAgaGFzVGFicyAgID0gZmFsc2VcbiAgICAgICAgaGFzQ29tbWFzID0gdHJ1ZVxuICAgICAgXG4gICAgZWxzZVxuICAgICAgbGV2ZWxzICAgID0gQCRlbC5maW5kKFwiI2xldmVsc1wiKS52YWwoKVxuICAgICAgaGFzVGFicyAgID0gbGV2ZWxzLm1hdGNoKC9cXHQvZyk/XG4gICAgICBoYXNDb21tYXMgPSBsZXZlbHMubWF0Y2goLywvZyk/XG5cbiAgICBsZXZlbHMgPSBAJGVsLmZpbmQoXCIjbGV2ZWxzXCIpLnZhbCgpXG4gICAgaGFzVGFicyAgID0gbGV2ZWxzLm1hdGNoKC9cXHQvZyk/XG4gICAgaGFzQ29tbWFzID0gbGV2ZWxzLm1hdGNoKC8sL2cpP1xuICAgIGlmIGhhc1RhYnNcbiAgICAgIEAkZWwuZmluZChcIiNsZXZlbHNfZm9ybWF0IDpyYWRpb1t2YWx1ZT0nVGFicyddXCIpLmF0dHIoXCJjaGVja2VkXCIsIFwiY2hlY2tlZFwiKS5idXR0b24oXCJyZWZyZXNoXCIpXG4gICAgZWxzZVxuICAgICAgQCRlbC5maW5kKFwiI2xldmVsc19mb3JtYXQgOnJhZGlvW3ZhbHVlPSdDb21tYXMnXVwiKS5hdHRyKFwiY2hlY2tlZFwiLCBcImNoZWNrZWRcIikuYnV0dG9uKFwicmVmcmVzaFwiKVxuXG5cbiAgZGF0YVRhYlRvQ29tbWE6IC0+IEAkZWwuZmluZChcIiNkYXRhXCIpLnZhbChTdHJpbmcoQCRlbC5maW5kKFwiI2RhdGFcIikudmFsKCkpLnJlcGxhY2UoL1xcdC9nLFwiLCBcIikpXG4gIGRhdGFDb21tYVRvVGFiOiAtPiBAJGVsLmZpbmQoXCIjZGF0YVwiKS52YWwoQCRlbC5maW5kKFwiI2RhdGFcIikudmFsKCkucmVwbGFjZSgvLCAqL2csIFwiXFx0XCIpKVxuICBsZXZlbHNUYWJUb0NvbW1hOiAtPiBAJGVsLmZpbmQoXCIjbGV2ZWxzXCIpLnZhbChTdHJpbmcoQCRlbC5maW5kKFwiI2xldmVsc1wiKS52YWwoKSkucmVwbGFjZSgvXFx0L2csXCIsIFwiKSlcbiAgbGV2ZWxzQ29tbWFUb1RhYjogLT4gQCRlbC5maW5kKFwiI2xldmVsc1wiKS52YWwoQCRlbC5maW5kKFwiI2xldmVsc1wiKS52YWwoKS5yZXBsYWNlKC8sICovZywgXCJcXHRcIikpXG5cbiAgc2F2ZTogLT5cbiAgICBpZiBAJGVsLmZpbmQoXCIjZGF0YVwiKS52YWwoKS5tYXRjaCgvXFx0L2cpP1xuICAgICAgQCRlbC5maW5kKFwiI2RhdGFfZm9ybWF0IDpyYWRpb1t2YWx1ZT0nVGFicyddXCIpLmF0dHIoXCJjaGVja2VkXCIsIFwiY2hlY2tlZFwiKS5idXR0b24oXCJyZWZyZXNoXCIpXG4gICAgICBAZGF0YVRhYlRvQ29tbWEoKVxuICAgIGlmIEAkZWwuZmluZChcIiNsZXZlbHNcIikudmFsKCkubWF0Y2goL1xcdC9nKT9cbiAgICAgIEBsZXZlbHNUYWJUb0NvbW1hKClcbiAgICAgIEAkZWwuZmluZChcIiNsZXZlbHNfZm9ybWF0IDpyYWRpb1t2YWx1ZT0nVGFicyddXCIpLmF0dHIoXCJjaGVja2VkXCIsIFwiY2hlY2tlZFwiKS5idXR0b24oXCJyZWZyZXNoXCIpXG4gICAgICBcbiAgICBsZXZlbHMgPSBAJGVsLmZpbmQoXCIjbGV2ZWxzXCIpLnZhbCgpLnNwbGl0KC8sICovZylcbiAgICBmb3IgbGV2ZWwsIGkgaW4gbGV2ZWxzXG4gICAgICBsZXZlbHNbaV0gPSAkLnRyaW0obGV2ZWwpLnJlcGxhY2UoL1teYS16QS1aMC05J10vZyxcIlwiKVxuXG4gICAgIyByZW1vdmVzIC9cXHMvXG4gICAgbG9jYXRpb25zVmFsdWUgPSAkLnRyaW0oQCRlbC5maW5kKFwiI2RhdGFcIikudmFsKCkpXG5cbiAgICBsb2NhdGlvbnMgPSBsb2NhdGlvbnNWYWx1ZS5zcGxpdChcIlxcblwiKVxuXG4gICAgZm9yIGxvY2F0aW9uLCBpIGluIGxvY2F0aW9uc1xuICAgICAgbG9jYXRpb25zW2ldID0gbG9jYXRpb24uc3BsaXQoLywgKi9nKVxuXG4gICAgQG1vZGVsLnNldFxuICAgICAgXCJsZXZlbHNcIiAgICA6IGxldmVsc1xuICAgICAgXCJsb2NhdGlvbnNcIiA6IGxvY2F0aW9uc1xuXG4gIGlzVmFsaWQ6IC0+XG4gICAgbGV2ZWxzID0gQG1vZGVsLmdldChcImxldmVsc1wiKVxuICAgIGZvciBsb2NhdGlvbiBpbiBAbW9kZWwuZ2V0KFwibG9jYXRpb25zXCIpXG4gICAgICBpZiBsb2NhdGlvbi5sZW5ndGggIT0gbGV2ZWxzLmxlbmd0aFxuICAgICAgICBAZXJyb3JzLnB1c2ggXCJjb2x1bW5fbWF0Y2hcIiB1bmxlc3MgXCJjb2x1bW5fbWF0Y2hcIiBpbiBAZXJyb3JzXG4gICAgcmV0dXJuIEBlcnJvcnMubGVuZ3RoID09IDBcblxuICBzaG93RXJyb3JzOiAtPlxuICAgIGFsZXJ0VGV4dCA9IFwiUGxlYXNlIGNvcnJlY3QgdGhlIGZvbGxvd2luZyBlcnJvcnM6XFxuXFxuXCJcbiAgICBmb3IgZXJyb3IgaW4gQGVycm9yc1xuICAgICAgYWxlcnRUZXh0ICs9IEBlcnJvck1lc3NhZ2VzW2Vycm9yXVxuICAgIGFsZXJ0IGFsZXJ0VGV4dFxuICAgIEBlcnJvcnMgPSBbXVxuXG4gIGluaXRpYWxpemU6ICggb3B0aW9ucyApIC0+XG4gICAgQGVycm9ycyA9IFtdXG4gICAgQG1vZGVsID0gb3B0aW9ucy5tb2RlbFxuICAgIEBlcnJvck1lc3NhZ2VzID0gXG4gICAgICBcImNvbHVtbl9tYXRjaFwiIDogXCJTb21lIGNvbHVtbnMgaW4gdGhlIGxvY2F0aW9uIGRhdGEgZG8gbm90IG1hdGNoIHRoZSBudW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgZ2VvZ3JhcGhpYyBsZXZlbHMuXCJcblxuICByZW5kZXI6IC0+XG4gICAgbGV2ZWxzICAgID0gQG1vZGVsLmdldChcImxldmVsc1wiKSAgICB8fCBbXVxuICAgIGxvY2F0aW9ucyA9IEBtb2RlbC5nZXQoXCJsb2NhdGlvbnNcIikgfHwgW11cblxuICAgIGxldmVscyA9IF8uZXNjYXBlKGxldmVscy5qb2luKFwiLCBcIikpXG5cbiAgICBsb2NhdGlvbnMgPSBsb2NhdGlvbnMuam9pbihcIlxcblwiKVxuICAgIGlmIF8uaXNBcnJheShsb2NhdGlvbnMpXG4gICAgICBmb3IgbG9jYXRpb24sIGkgaW4gbG9jYXRpb25zIFxuICAgICAgICBsb2NhdGlvbnNbaV0gPSBfLmVzY2FwZShsb2NhdGlvbi5qb2luKFwiLCBcIikpXG5cbiAgICBAJGVsLmh0bWwgIFwiXG4gICAgICA8ZGl2IGNsYXNzPSdsYWJlbF92YWx1ZSc+XG4gICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICA8bGFiZWwgZm9yPSdsZXZlbHMnIHRpdGxlPSdUaGlzIGlzIGEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgZ2VvZ3JhcGhpYyBsZXZlbHMuIChFLmcuIENvdW50cnksIFByb3ZpbmNlLCBEaXN0cmljdCwgU2Nob29sIElkKSBUaGVzZSBhcmUgdGhlIGxldmVscyB0aGF0IHlvdSB3b3VsZCBjb25zaWRlciBpbmRpdmlkdWFsIGZpZWxkcyBvbiB0aGUgbG9jYXRpb24gZm9ybS4nPkdlb2dyYXBoaWMgTGV2ZWxzPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgaWQ9J2xldmVscycgdmFsdWU9JyN7bGV2ZWxzfSc+XG4gICAgICAgICAgPGxhYmVsIHRpdGxlPSdUYW5nZXJpbmUgdXNlcyBjb21tYSBzZXBhcmF0ZWQgdmFsdWVzLiBJZiB5b3UgY29weSBhbmQgcGFzdGUgZnJvbSBhbm90aGVyIHByb2dyYW0gbGlrZSBFeGNlbCwgdGhlIHZhbHVlcyB3aWxsIGJlIHRhYiBzZXBhcmF0ZWQuIFRoZXNlIGJ1dHRvbnMgYWxsb3cgeW91IHRvIHN3aXRjaCBiYWNrIGFuZCBmb3J0aCwgaG93ZXZlciwgVGFuZ2VyaW5lIHdpbGwgYWx3YXlzIHNhdmUgdGhlIGNvbW1hIHZlcnNpb24uJz5Gb3JtYXQ8L2xhYmVsPjxicj5cbiAgICAgICAgICA8ZGl2IGlkPSdsZXZlbHNfZm9ybWF0JyBjbGFzcz0nYnV0dG9uc2V0Jz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9J2xldmVsc190YWJzJz5UYWJzPC9sYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dCBpZD0nbGV2ZWxzX3RhYnMnIG5hbWU9J2xldmVsc19mb3JtYXQnIHR5cGU9J3JhZGlvJyB2YWx1ZT0nVGFicyc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdsZXZlbHNfY29tbWFzJz5Db21tYXM8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGlkPSdsZXZlbHNfY29tbWFzJyBuYW1lPSdsZXZlbHNfZm9ybWF0JyB0eXBlPSdyYWRpbycgdmFsdWU9J0NvbW1hcyc+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2xhYmVsX3ZhbHVlJz5cbiAgICAgICAgPGRpdiBjbGFzcz0nbWVudV9ib3gnPlxuICAgICAgICAgIDxsYWJlbCBmb3I9J2RhdGEnIHRpdGxlPSdDb21tYSBzcGVyYXRlZCB2YWx1ZXMsIHdpdGggbXVsdGlwbGUgcm93cyBzZXBhcmF0ZWQgYnkgbGluZS4gVGhpcyBpbmZvcm1hdGlvbiB3aWxsIGJlIHVzZWQgdG8gYXV0b2ZpbGwgdGhlIGxvY2F0aW9uIGRhdGEuJz5Mb2NhdGlvbiBkYXRhPC9sYWJlbD5cbiAgICAgICAgICA8dGV4dGFyZWEgaWQ9J2RhdGEnPiN7bG9jYXRpb25zfTwvdGV4dGFyZWE+PGJyPlxuICAgICAgICAgIDxsYWJlbCB0aXRsZT0nVGFuZ2VyaW5lIHVzZXMgY29tbWEgc2VwYXJhdGVkIHZhbHVlcy4gSWYgeW91IGNvcHkgYW5kIHBhc3RlIGZyb20gYW5vdGhlciBwcm9ncmFtIGxpa2UgRXhjZWwsIHRoZSB2YWx1ZXMgd2lsbCBiZSB0YWIgc2VwYXJhdGVkLiBUaGVzZSBidXR0b25zIGFsbG93IHlvdSB0byBzd2l0Y2ggYmFjayBhbmQgZm9ydGgsIGhvd2V2ZXIsIFRhbmdlcmluZSB3aWxsIGFsd2F5cyBzYXZlIHRoZSBjb21tYSB2ZXJzaW9uLic+Rm9ybWF0PC9sYWJlbD48YnI+ICAgICAgICA8ZGl2IGlkPSdkYXRhX2Zvcm1hdCcgY2xhc3M9J2J1dHRvbnNldCc+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPSdkYXRhX3RhYnMnPlRhYnM8L2xhYmVsPlxuICAgICAgICAgICAgPGlucHV0IGlkPSdkYXRhX3RhYnMnIG5hbWU9J2RhdGFfZm9ybWF0JyB0eXBlPSdyYWRpbycgdmFsdWU9J1RhYnMnPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj0nZGF0YV9jb21tYXMnPkNvbW1hczwvbGFiZWw+XG4gICAgICAgICAgICA8aW5wdXQgaWQ9J2RhdGFfY29tbWFzJyBuYW1lPSdkYXRhX2Zvcm1hdCcgdHlwZT0ncmFkaW8nIHZhbHVlPSdDb21tYXMnPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgXG4gICAgICA8L2Rpdj5cbiAgICBcIlxuXG4gIGFmdGVyUmVuZGVyOiAtPlxuICAgIEB1cGRhdGVMZXZlbHMoKVxuICAgIEB1cGRhdGVEYXRhKClcblxuIl19
