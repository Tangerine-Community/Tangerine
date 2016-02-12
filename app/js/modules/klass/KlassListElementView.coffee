class klassCSVMenuView extends Backbone.View
  
  className : "klassCSVMenuView"
  
  initialize: (options) ->
    klassId = options.parent.options.klass.id
    filename = moment().format("YYYY-MMM-DD HH:mm")
    document.location = "/" + Tangerine.db_name + "/_design/" + Tangerine.design_doc + "/_list/csv/csvRowByResult?key=\"#{klassId}\"&filename=#{filename}"


class KlassListElementView extends Backbone.View

  className : "KlassListElementView"

  tagName: "li"

  events:
    'click .run'           : 'run'
    'click .results'       : 'showReportSelect'
    'change #report'       : 'getReportMenu'
    'click .cancel_report' : 'cancelReport'
    'click .edit'          : 'edit'
    'click .delete'        : 'toggleDelete'
    'click .delete_cancel' : 'toggleDelete'
    'click .delete_delete' : 'delete'

  initialize: (options) ->
    @availableReports = Tangerine.config.get("reports")
    if options.klass.has "curriculumId"
      @curriculum = new Curriculum 
        "_id" : options.klass.get "curriculumId" || ""
      @curriculum.fetch
        success : @render
    else
      @curriculum = new Curriculum 

  edit: ->
    Tangerine.router.navigate "class/edit/" + @options.klass.id, true

  getReportMenu: (event) ->
    @subMenuView?.close()
    @subMenuView = new window[$(event.target).find(":selected").attr("data-menu_view")]
      parent : @
    @$el.find("#report_menu_container").append("<div class='report_menu'></div>")
    @subMenuView.setElement @$el.find("#report_menu_container .report_menu")
    @subMenuView.render()

  showReportSelect: -> @$el.find(".report_select_container").removeClass "confirmation"

  cancelReport: ->
    @$el.find('div#report_menu').empty()
    @$el.find('#report :nth-child(1)').attr('selected', 'selected')
    @$el.find(".report_select_container").addClass "confirmation"
    @subMenuView?.close()

  onClose: ->
    @subMenuView?.close()

  run: ->
    Tangerine.router.navigate "class/" + @options.klass.id, true

  toggleDelete: -> @$el.find(".delete_confirm").toggle()

  delete: ->
    @options.klass.collection.get(@options.klass).destroy()

  render: =>
    klass = @options.klass

    if klass.get("teacherId") == "admin"
      teacherName = "admin"
    else
      teacher = vm.currentView.teachers.get(klass.get("teacherId"))
      teacherName = teacher?.getEscapedString('name') || ""

    htmlTeacher = "
      <tr><td><small>Teacher</small></td><td>#{teacherName}</td></tr>
    " if Tangerine.user.isAdmin() 

    @$el.html "
      <table>
        #{htmlTeacher || ""}
        <tr><td><small>School name</small></td><td>#{klass.getEscapedString('schoolName')}</td></tr>
        <tr><td><small>School year</small></td><td>#{klass.getString('year')}</td></tr>
        <tr><td><small>#{t('grade')}</small></td><td>#{klass.getString('grade')}</td></tr>
        <tr><td><small>#{t('stream')}</small></td><td>#{klass.getString('stream')}</td></tr>
        <tr><td><small>#{t('curriculum')}</small></td><td>#{@curriculum.getEscapedString('name')}</td></tr>
      </table>
      <img src='images/icon_run.png'     class='icon run'> 
      <img src='images/icon_results.png' class='icon results'> 
      <img src='images/icon_edit.png'    class='icon edit'> 
      <img src='images/icon_delete.png'  class='icon delete'> 
      <div class='report_select_container confirmation'>
        <div class='menu_box'>
          <select id='report'>
            <option selected='selected' disabled='disabled'>#{t('select report type')}</option>
            #{("<option data-menu_view='#{report.menuView}'>#{t(report.name)}</option>" for report in @availableReports).join("")}
          </select>
        </div>
        <div id='report_menu_container'></div>
        <button class='command cancel_report'>#{t('cancel')}</button>
      </div>
      <div class='delete_confirm confirmation'>
        <div class='menu_box'>
          #{t('confirm')}<br>
          <button class='delete_delete command_red'>#{t('delete')}</button>
          <button class='delete_cancel command'>#{t('cancel')}</button>
        </div>
      </div>
    "

    @trigger "rendered"


