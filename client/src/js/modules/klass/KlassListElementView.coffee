class KlassListElementView extends Backbone.Marionette.ItemView

  className : "KlassListElementView"

  tagName: "li"

  events:
    'click .klass_run'           : 'run'
    'click .klass_results'       : 'showReportSelect'
    'change #report'       : 'getReportMenu'
    'click .cancel_report' : 'cancelReport'
    'click .klass_edit'          : 'edit'
    'click .klass_delete'        : 'toggleDelete'
    'click .klass_delete_cancel' : 'toggleDelete'
    'click .klass_delete_delete' : 'delete'

  initialize: (options) ->

    @klass = options.klass

    @availableReports = Tangerine.config.get("reports")
    if options.klass.has "curriculumId"
      @curriculum = new Curriculum 
        "_id" : options.klass.get "curriculumId" || ""
      @curriculum.fetch
        success : @render
    else
      @curriculum = new Curriculum 

  edit: ->
    console.log("KlassListElementView edit")
    Tangerine.router.navigate "class/edit/" + @klass.id, true

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
    Tangerine.router.navigate "class/" + @klass.id, true

  toggleDelete: -> @$el.find(".klass_delete_confirm").toggle()

  delete: ->
    @klass.collection.get(@klass).destroy()

  render: =>
    klass = @klass

    if klass.get("teacherId") == "admin"
      teacherName = "admin"
    else
#      teacher = vm.currentView.teachers.get(klass.get("teacherId"))
#      teacher = Tangerine.app.rm.get('mainRegion').currentView.teachers.get(klass.get("teacherId"))
      if Tangerine.currentView.teachers?
        teacher = Tangerine.currentView.teachers?.get(klass.get("teacherId"))
      teacherName = teacher?.getEscapedString('name') || ""

    htmlTeacher = "
      <tr><th>Teacher</th><td>#{teacherName}</td></tr>
    " if Tangerine.user.isAdmin() 

    menuOptions = ""
    for report in @availableReports
      if not report.context? or report.context is Tangerine.settings.get('context')
        menuOptions += "<option data-menu_view='#{report.menuView}'>#{t(report.name)}</option>" 

    @$el.html "
      <table>
        #{htmlTeacher || ""}
        <tr><th>School name</th><td>#{klass.getEscapedString('schoolName')}</td></tr>
        <tr><th>School year</th><td>#{klass.getString('year')}</td></tr>
        <tr><th>#{t('grade')}</th><td>#{klass.getString('grade')}</td></tr>
        <tr><th>#{t('stream')}</th><td>#{klass.getString('stream')}</td></tr>
        <tr><th>#{t('curriculum')}</th><td>#{@curriculum.getEscapedString('name')}</td></tr>
      </table>
      <img src='images/icon_run.png'     class='icon klass_run'> 
      <img src='images/icon_results.png' class='icon klass_results'> 
      <img src='images/icon_edit.png'    class='icon klass_edit'> 
      <img src='images/icon_delete.png'  class='icon klass_delete'> 
      <div class='report_select_container confirmation'>
        <div class='menu_box'>
          <select id='report'>
            <option selected='selected' disabled='disabled'>#{t('select report type')}</option>
            #{menuOptions}
          </select>
        </div>
        <div id='report_menu_container'></div>
        <button class='command cancel_report'>#{t('cancel')}</button>
      </div>
      <div class='klass_delete_confirm confirmation'>
        <div class='menu_box'>
          #{t('confirm')}<br>
          <button class='klass_delete_delete command_red'>#{t('delete')}</button>
          <button class='klass_delete_cancel command'>#{t('cancel')}</button>
        </div>
      </div>
    "

    @trigger "rendered"

  onRender:->
    console.log("onRender")


