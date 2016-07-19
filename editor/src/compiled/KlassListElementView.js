var KlassListElementView,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KlassListElementView = (function(superClass) {
  extend(KlassListElementView, superClass);

  function KlassListElementView() {
    this.render = bind(this.render, this);
    return KlassListElementView.__super__.constructor.apply(this, arguments);
  }

  KlassListElementView.prototype.className = "KlassListElementView";

  KlassListElementView.prototype.tagName = "li";

  KlassListElementView.prototype.events = {
    'click .klass_run': 'run',
    'click .klass_results': 'showReportSelect',
    'change #report': 'getReportMenu',
    'click .cancel_report': 'cancelReport',
    'click .klass_edit': 'edit',
    'click .klass_delete': 'toggleDelete',
    'click .klass_delete_cancel': 'toggleDelete',
    'click .klass_delete_delete': 'delete'
  };

  KlassListElementView.prototype.initialize = function(options) {
    this.klass = options.klass;
    this.availableReports = Tangerine.config.get("reports");
    if (options.klass.has("curriculumId")) {
      this.curriculum = new Curriculum({
        "_id": options.klass.get("curriculumId" || "")
      });
      return this.curriculum.fetch({
        success: this.render
      });
    } else {
      return this.curriculum = new Curriculum;
    }
  };

  KlassListElementView.prototype.edit = function() {
    return Tangerine.router.navigate("class/edit/" + this.klass.id, true);
  };

  KlassListElementView.prototype.getReportMenu = function(event) {
    var ref;
    if ((ref = this.subMenuView) != null) {
      ref.close();
    }
    this.subMenuView = new window[$(event.target).find(":selected").attr("data-menu_view")]({
      parent: this
    });
    this.$el.find("#report_menu_container").append("<div class='report_menu'></div>");
    this.subMenuView.setElement(this.$el.find("#report_menu_container .report_menu"));
    return this.subMenuView.render();
  };

  KlassListElementView.prototype.showReportSelect = function() {
    return this.$el.find(".report_select_container").removeClass("confirmation");
  };

  KlassListElementView.prototype.cancelReport = function() {
    var ref;
    this.$el.find('div#report_menu').empty();
    this.$el.find('#report :nth-child(1)').attr('selected', 'selected');
    this.$el.find(".report_select_container").addClass("confirmation");
    return (ref = this.subMenuView) != null ? ref.close() : void 0;
  };

  KlassListElementView.prototype.onClose = function() {
    var ref;
    return (ref = this.subMenuView) != null ? ref.close() : void 0;
  };

  KlassListElementView.prototype.run = function() {
    return Tangerine.router.navigate("class/" + this.klass.id, true);
  };

  KlassListElementView.prototype.toggleDelete = function() {
    return this.$el.find(".klass_delete_confirm").toggle();
  };

  KlassListElementView.prototype["delete"] = function() {
    return this.klass.collection.get(this.klass).destroy();
  };

  KlassListElementView.prototype.render = function() {
    var htmlTeacher, i, len, menuOptions, ref, report, teacher, teacherName;
    if (klass.get("teacherId") === "admin") {
      teacherName = "admin";
    } else {
      teacher = vm.currentView.teachers.get(klass.get("teacherId"));
      teacherName = (teacher != null ? teacher.getEscapedString('name') : void 0) || "";
    }
    if (Tangerine.user.isAdmin()) {
      htmlTeacher = "<tr><th>Teacher</th><td>" + teacherName + "</td></tr>";
    }
    menuOptions = "";
    ref = this.availableReports;
    for (i = 0, len = ref.length; i < len; i++) {
      report = ref[i];
      if ((report.context == null) || report.context === 'server') {
        menuOptions += "<option data-menu_view='" + report.menuView + "'>" + (t(report.name)) + "</option>";
      }
    }
    this.$el.html("<table> " + (htmlTeacher || "") + " <tr><th>School name</th><td>" + (this.klass.getEscapedString('schoolName')) + "</td></tr> <tr><th>School year</th><td>" + (this.klass.getString('year')) + "</td></tr> <tr><th>" + (t('grade')) + "</th><td>" + (this.klass.getString('grade')) + "</td></tr> <tr><th>" + (t('stream')) + "</th><td>" + (this.klass.getString('stream')) + "</td></tr> <tr><th>" + (t('curriculum')) + "</th><td>" + (this.curriculum.getEscapedString('name')) + "</td></tr> </table> <img src='images/icon_run.png'     class='icon klass_run'> <img src='images/icon_results.png' class='icon klass_results'> <img src='images/icon_edit.png'    class='icon klass_edit'> <img src='images/icon_delete.png'  class='icon klass_delete'> <div class='report_select_container confirmation'> <div class='menu_box'> <select id='report'> <option selected='selected' disabled='disabled'>" + (t('select report type')) + "</option> " + menuOptions + " </select> </div> <div id='report_menu_container'></div> <button class='command cancel_report'>" + (t('cancel')) + "</button> </div> <div class='klass_delete_confirm confirmation'> <div class='menu_box'> " + (t('confirm')) + "<br> <button class='klass_delete_delete command_red'>" + (t('delete')) + "</button> <button class='klass_delete_cancel command'>" + (t('cancel')) + "</button> </div> </div>");
    return this.trigger("rendered");
  };

  return KlassListElementView;

})(Backbone.View);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtsYXNzL0tsYXNzTGlzdEVsZW1lbnRWaWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFBLG9CQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7Ozs7aUNBRUosU0FBQSxHQUFZOztpQ0FFWixPQUFBLEdBQVM7O2lDQUVULE1BQUEsR0FDRTtJQUFBLGtCQUFBLEVBQStCLEtBQS9CO0lBQ0Esc0JBQUEsRUFBK0Isa0JBRC9CO0lBRUEsZ0JBQUEsRUFBeUIsZUFGekI7SUFHQSxzQkFBQSxFQUF5QixjQUh6QjtJQUlBLG1CQUFBLEVBQStCLE1BSi9CO0lBS0EscUJBQUEsRUFBK0IsY0FML0I7SUFNQSw0QkFBQSxFQUErQixjQU4vQjtJQU9BLDRCQUFBLEVBQStCLFFBUC9COzs7aUNBU0YsVUFBQSxHQUFZLFNBQUMsT0FBRDtJQUVWLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDO0lBRWpCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixTQUFTLENBQUMsTUFBTSxDQUFDLEdBQWpCLENBQXFCLFNBQXJCO0lBQ3BCLElBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFkLENBQWtCLGNBQWxCLENBQUg7TUFDRSxJQUFDLENBQUEsVUFBRCxHQUFrQixJQUFBLFVBQUEsQ0FDaEI7UUFBQSxLQUFBLEVBQVEsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFkLENBQWtCLGNBQUEsSUFBa0IsRUFBcEMsQ0FBUjtPQURnQjthQUVsQixJQUFDLENBQUEsVUFBVSxDQUFDLEtBQVosQ0FDRTtRQUFBLE9BQUEsRUFBVSxJQUFDLENBQUEsTUFBWDtPQURGLEVBSEY7S0FBQSxNQUFBO2FBTUUsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFJLFdBTnBCOztFQUxVOztpQ0FhWixJQUFBLEdBQU0sU0FBQTtXQUNKLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBakIsQ0FBMEIsYUFBQSxHQUFnQixJQUFDLENBQUEsS0FBSyxDQUFDLEVBQWpELEVBQXFELElBQXJEO0VBREk7O2lDQUdO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c291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEtsYXNzTGlzdEVsZW1lbnRWaWV3IGV4dGVuZHMgQmFja2JvbmUuVmlld1xuXG4gIGNsYXNzTmFtZSA6IFwiS2xhc3NMaXN0RWxlbWVudFZpZXdcIlxuXG4gIHRhZ05hbWU6IFwibGlcIlxuXG4gIGV2ZW50czpcbiAgICAnY2xpY2sgLmtsYXNzX3J1bicgICAgICAgICAgIDogJ3J1bidcbiAgICAnY2xpY2sgLmtsYXNzX3Jlc3VsdHMnICAgICAgIDogJ3Nob3dSZXBvcnRTZWxlY3QnXG4gICAgJ2NoYW5nZSAjcmVwb3J0JyAgICAgICA6ICdnZXRSZXBvcnRNZW51J1xuICAgICdjbGljayAuY2FuY2VsX3JlcG9ydCcgOiAnY2FuY2VsUmVwb3J0J1xuICAgICdjbGljayAua2xhc3NfZWRpdCcgICAgICAgICAgOiAnZWRpdCdcbiAgICAnY2xpY2sgLmtsYXNzX2RlbGV0ZScgICAgICAgIDogJ3RvZ2dsZURlbGV0ZSdcbiAgICAnY2xpY2sgLmtsYXNzX2RlbGV0ZV9jYW5jZWwnIDogJ3RvZ2dsZURlbGV0ZSdcbiAgICAnY2xpY2sgLmtsYXNzX2RlbGV0ZV9kZWxldGUnIDogJ2RlbGV0ZSdcblxuICBpbml0aWFsaXplOiAob3B0aW9ucykgLT5cblxuICAgIEBrbGFzcyA9IG9wdGlvbnMua2xhc3NcblxuICAgIEBhdmFpbGFibGVSZXBvcnRzID0gVGFuZ2VyaW5lLmNvbmZpZy5nZXQoXCJyZXBvcnRzXCIpXG4gICAgaWYgb3B0aW9ucy5rbGFzcy5oYXMgXCJjdXJyaWN1bHVtSWRcIlxuICAgICAgQGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bVxuICAgICAgICBcIl9pZFwiIDogb3B0aW9ucy5rbGFzcy5nZXQgXCJjdXJyaWN1bHVtSWRcIiB8fCBcIlwiXG4gICAgICBAY3VycmljdWx1bS5mZXRjaFxuICAgICAgICBzdWNjZXNzIDogQHJlbmRlclxuICAgIGVsc2VcbiAgICAgIEBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW1cblxuICBlZGl0OiAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJjbGFzcy9lZGl0L1wiICsgQGtsYXNzLmlkLCB0cnVlXG5cbiAgZ2V0UmVwb3J0TWVudTogKGV2ZW50KSAtPlxuICAgIEBzdWJNZW51Vmlldz8uY2xvc2UoKVxuICAgIEBzdWJNZW51VmlldyA9IG5ldyB3aW5kb3dbJChldmVudC50YXJnZXQpLmZpbmQoXCI6c2VsZWN0ZWRcIikuYXR0cihcImRhdGEtbWVudV92aWV3XCIpXVxuICAgICAgcGFyZW50IDogQFxuICAgIEAkZWwuZmluZChcIiNyZXBvcnRfbWVudV9jb250YWluZXJcIikuYXBwZW5kKFwiPGRpdiBjbGFzcz0ncmVwb3J0X21lbnUnPjwvZGl2PlwiKVxuICAgIEBzdWJNZW51Vmlldy5zZXRFbGVtZW50IEAkZWwuZmluZChcIiNyZXBvcnRfbWVudV9jb250YWluZXIgLnJlcG9ydF9tZW51XCIpXG4gICAgQHN1Yk1lbnVWaWV3LnJlbmRlcigpXG5cbiAgc2hvd1JlcG9ydFNlbGVjdDogLT4gQCRlbC5maW5kKFwiLnJlcG9ydF9zZWxlY3RfY29udGFpbmVyXCIpLnJlbW92ZUNsYXNzIFwiY29uZmlybWF0aW9uXCJcblxuICBjYW5jZWxSZXBvcnQ6IC0+XG4gICAgQCRlbC5maW5kKCdkaXYjcmVwb3J0X21lbnUnKS5lbXB0eSgpXG4gICAgQCRlbC5maW5kKCcjcmVwb3J0IDpudGgtY2hpbGQoMSknKS5hdHRyKCdzZWxlY3RlZCcsICdzZWxlY3RlZCcpXG4gICAgQCRlbC5maW5kKFwiLnJlcG9ydF9zZWxlY3RfY29udGFpbmVyXCIpLmFkZENsYXNzIFwiY29uZmlybWF0aW9uXCJcbiAgICBAc3ViTWVudVZpZXc/LmNsb3NlKClcblxuICBvbkNsb3NlOiAtPlxuICAgIEBzdWJNZW51Vmlldz8uY2xvc2UoKVxuXG4gIHJ1bjogLT5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiY2xhc3MvXCIgKyBAa2xhc3MuaWQsIHRydWVcblxuICB0b2dnbGVEZWxldGU6IC0+IEAkZWwuZmluZChcIi5rbGFzc19kZWxldGVfY29uZmlybVwiKS50b2dnbGUoKVxuXG4gIGRlbGV0ZTogLT5cbiAgICBAa2xhc3MuY29sbGVjdGlvbi5nZXQoQGtsYXNzKS5kZXN0cm95KClcblxuICByZW5kZXI6ID0+XG5cbiAgICBpZiBrbGFzcy5nZXQoXCJ0ZWFjaGVySWRcIikgPT0gXCJhZG1pblwiXG4gICAgICB0ZWFjaGVyTmFtZSA9IFwiYWRtaW5cIlxuICAgIGVsc2VcbiAgICAgIHRlYWNoZXIgPSB2bS5jdXJyZW50Vmlldy50ZWFjaGVycy5nZXQoa2xhc3MuZ2V0KFwidGVhY2hlcklkXCIpKVxuICAgICAgdGVhY2hlck5hbWUgPSB0ZWFjaGVyPy5nZXRFc2NhcGVkU3RyaW5nKCduYW1lJykgfHwgXCJcIlxuXG4gICAgaHRtbFRlYWNoZXIgPSBcIlxuICAgICAgPHRyPjx0aD5UZWFjaGVyPC90aD48dGQ+I3t0ZWFjaGVyTmFtZX08L3RkPjwvdHI+XG4gICAgXCIgaWYgVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG5cbiAgICBtZW51T3B0aW9ucyA9IFwiXCJcbiAgICBmb3IgcmVwb3J0IGluIEBhdmFpbGFibGVSZXBvcnRzXG4gICAgICBpZiBub3QgcmVwb3J0LmNvbnRleHQ/IG9yIHJlcG9ydC5jb250ZXh0IGlzICdzZXJ2ZXInXG4gICAgICAgIG1lbnVPcHRpb25zICs9IFwiPG9wdGlvbiBkYXRhLW1lbnVfdmlldz0nI3tyZXBvcnQubWVudVZpZXd9Jz4je3QocmVwb3J0Lm5hbWUpfTwvb3B0aW9uPlwiXG5cbiAgICBAJGVsLmh0bWwgXCJcbiAgICAgIDx0YWJsZT5cbiAgICAgICAgI3todG1sVGVhY2hlciB8fCBcIlwifVxuICAgICAgICA8dHI+PHRoPlNjaG9vbCBuYW1lPC90aD48dGQ+I3tAa2xhc3MuZ2V0RXNjYXBlZFN0cmluZygnc2Nob29sTmFtZScpfTwvdGQ+PC90cj5cbiAgICAgICAgPHRyPjx0aD5TY2hvb2wgeWVhcjwvdGg+PHRkPiN7QGtsYXNzLmdldFN0cmluZygneWVhcicpfTwvdGQ+PC90cj5cbiAgICAgICAgPHRyPjx0aD4je3QoJ2dyYWRlJyl9PC90aD48dGQ+I3tAa2xhc3MuZ2V0U3RyaW5nKCdncmFkZScpfTwvdGQ+PC90cj5cbiAgICAgICAgPHRyPjx0aD4je3QoJ3N0cmVhbScpfTwvdGg+PHRkPiN7QGtsYXNzLmdldFN0cmluZygnc3RyZWFtJyl9PC90ZD48L3RyPlxuICAgICAgICA8dHI+PHRoPiN7dCgnY3VycmljdWx1bScpfTwvdGg+PHRkPiN7QGN1cnJpY3VsdW0uZ2V0RXNjYXBlZFN0cmluZygnbmFtZScpfTwvdGQ+PC90cj5cbiAgICAgIDwvdGFibGU+XG4gICAgICA8aW1nIHNyYz0naW1hZ2VzL2ljb25fcnVuLnBuZycgICAgIGNsYXNzPSdpY29uIGtsYXNzX3J1bic+XG4gICAgICA8aW1nIHNyYz0naW1hZ2VzL2ljb25fcmVzdWx0cy5wbmcnIGNsYXNzPSdpY29uIGtsYXNzX3Jlc3VsdHMnPlxuICAgICAgPGltZyBzcmM9J2ltYWdlcy9pY29uX2VkaXQucG5nJyAgICBjbGFzcz0naWNvbiBrbGFzc19lZGl0Jz5cbiAgICAgIDxpbWcgc3JjPSdpbWFnZXMvaWNvbl9kZWxldGUucG5nJyAgY2xhc3M9J2ljb24ga2xhc3NfZGVsZXRlJz5cbiAgICAgIDxkaXYgY2xhc3M9J3JlcG9ydF9zZWxlY3RfY29udGFpbmVyIGNvbmZpcm1hdGlvbic+XG4gICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICA8c2VsZWN0IGlkPSdyZXBvcnQnPlxuICAgICAgICAgICAgPG9wdGlvbiBzZWxlY3RlZD0nc2VsZWN0ZWQnIGRpc2FibGVkPSdkaXNhYmxlZCc+I3t0KCdzZWxlY3QgcmVwb3J0IHR5cGUnKX08L29wdGlvbj5cbiAgICAgICAgICAgICN7bWVudU9wdGlvbnN9XG4gICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGlkPSdyZXBvcnRfbWVudV9jb250YWluZXInPjwvZGl2PlxuICAgICAgICA8YnV0dG9uIGNsYXNzPSdjb21tYW5kIGNhbmNlbF9yZXBvcnQnPiN7dCgnY2FuY2VsJyl9PC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9J2tsYXNzX2RlbGV0ZV9jb25maXJtIGNvbmZpcm1hdGlvbic+XG4gICAgICAgIDxkaXYgY2xhc3M9J21lbnVfYm94Jz5cbiAgICAgICAgICAje3QoJ2NvbmZpcm0nKX08YnI+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz0na2xhc3NfZGVsZXRlX2RlbGV0ZSBjb21tYW5kX3JlZCc+I3t0KCdkZWxldGUnKX08L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSdrbGFzc19kZWxldGVfY2FuY2VsIGNvbW1hbmQnPiN7dCgnY2FuY2VsJyl9PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgXCJcblxuICAgIEB0cmlnZ2VyIFwicmVuZGVyZWRcIlxuXG5cbiJdfQ==
