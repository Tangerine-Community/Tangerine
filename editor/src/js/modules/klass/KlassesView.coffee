class KlassesView extends Backbone.View

  className : "KlassesView"

  events :
    'click .klass_add'         : 'toggleAddForm'
    'click .klass_cancel'      : 'toggleAddForm'
    'click .klass_save'        : 'saveNewKlass'
    'click .klass_curricula'   : 'gotoCurricula'
    'click .goto_class'        : 'gotoKlass'
    'click .pull_data'   : 'pullData'
    'click .verify'      : 'ghostLogin'
    'click .upload_data' : 'uploadData'

  initialize: ( options ) ->
    @ipBlock  = 32
    @totalIps = 256
    @tabletOffset = 0

    @views = []
    @klasses   = options.klasses
    @curricula = options.curricula
    @teachers  = options.teachers

    @klasses.on "add remove change", @render

    if Tangerine.user.isAdmin()
      # timeout for the verification attempt
      @timer = setTimeout =>
        @updateUploader(false)
      , 20 * 1000

      # try to verify the connection to the server
      verReq = $.ajax
        url: Tangerine.settings.urlView("group", "byDKey")
        dataType: "jsonp"
        data: keys: ["testtest"]
        timeout: 5000
        success: =>
          clearTimeout @timer
          @updateUploader true

  ghostLogin: ->
    Tangerine.user.ghostLogin Tangerine.settings.upUser, Tangerine.settings.upPass

  uploadData: ->
    $.ajax
      "url"         : "/" + Tangerine.db_name + "/_design/tangerine/_view/byCollection?include_docs=false"
      "type"        : "POST"
      "dataType"    : "json"
      "contentType" : "application/json;charset=utf-8",
      "data"        : JSON.stringify(
          include_docs: false
          keys : ['result', 'klass', 'student', 'teacher', 'logs', 'user']
        )
      "success" : (data) =>
        docList = _.pluck(data.rows,"id")
        $.couch.replicate(
          Tangerine.settings.urlDB("local"),
          Tangerine.settings.urlDB("group"),
            success:      =>
              Utils.midAlert "Sync successful"
            error: (a, b) =>
              Utils.midAlert "Sync error<br>#{a} #{b}"
          ,
            doc_ids: docList
        )


  updateUploader: (status) =>
    html =
      if status == true
        "<button class='upload_data command'>Upload</button>"
      else if status == false
        "<div class='menu_box'><small>No connection</small><br><button class='command verify'>Verify connection</button></div>"
      else
        "<button class='command' disabled='disabled'>Verifying connection...</button>"

    @$el.find(".uploader").html html


  pullData: ->
    if @tabletOffset == 0
      @tablets = # if you can think of a better idea I'd like to see it
        checked    : 0
        complete   : 0
        successful : 0
        okCount    : 0
        ips        : []
        result     : 0
      Utils.midAlert "Please wait, detecting tablets."

    Utils.working true
    @randomIdDoc = hex_sha1(""+Math.random())
    Tangerine.$db.saveDoc
      "_id" : @randomIdDoc
    ,
      success: (doc) =>
        @randomDoc = doc
        for local in [@tabletOffset..(@ipBlock-1)+@tabletOffset]
          do (local) =>
            ip = Tangerine.settings.subnetIP(local)
            req = $.ajax
              url: Tangerine.settings.urlSubnet(ip)
              dataType: "jsonp"
              contentType: "application/json;charset=utf-8",
              timeout: 10000
            req.complete (xhr, error) =>
              @tablets.checked++
              if parseInt(xhr.status) == 200
                @tablets.okCount++
                @tablets.ips.push ip
              @updatePull()
      error: ->
        Utils.working false
        Utils.midAlert "Internal database error"

  updatePull: =>
    # do not process unless we're done with checking this block
    return if @tablets.checked < @ipBlock + @tabletOffset

    # give the choice to keep looking if not all tablets found
    if @tabletOffset != @totalIps - @ipBlock #&& confirm("#{Math.max(@tablets.okCount-1, 0)} tablets found.\n\nContinue searching?")
      @tabletOffset += @ipBlock
      @pullData()
    else

      # -1 because one of them will be this computer
      @tablets.okCount = Math.max(@tablets.okCount-1, 0)

      if @tablets.okCount == 0
        @tabletOffset = 0
        Utils.working false
        Utils.midAlert "#{@tablets.okCount} tablets found."
        Tangerine.$db.removeDoc
          "_id"  : @randomDoc.id
          "_rev" : @randomDoc.rev
        return

      unless confirm("#{@tablets.okCount} tablets found.\n\nStart data pull?")
        @tabletOffset = 0
        Utils.working false
        Tangerine.$db.removeDoc
          "_id"  : @randomDoc.id
          "_rev" : @randomDoc.rev
        return


      Utils.midAlert "Pulling from #{@tablets.okCount} tablets."
      for ip in @tablets.ips

        do (ip) =>
          # see if our random document is on the server we just found
          selfReq = $.ajax
            "url"         : Tangerine.settings.urlSubnet(ip) + "/" + @randomIdDoc
            "dataType"    : "jsonp"
            "timeout"     : 10000
            "contentType" : "application/json;charset=utf-8"

          selfReq.success (data, xhr, error) =>
            # if found self then do nothing

          selfReq.complete (xhr, error) => do (xhr) =>
            return if parseInt(xhr.status) == 200
            # if not, then we found another tablet
            viewReq = $.ajax
              "url"         : Tangerine.settings.urlSubnet(ip) + "/_design/tangerine/_view/byCollection"
              "dataType"    : "jsonp"
              "contentType" : "application/json;charset=utf-8",
              "data"        :
                include_docs : false
                keys : JSON.stringify(['result', 'klass', 'student','curriculum', 'teacher', 'logs'])

            viewReq.success (data) =>
              docList = (datum.id for datum in data.rows)
              $.couch.replicate(
                Tangerine.settings.urlSubnet(ip),
                Tangerine.settings.urlDB("local"),
                  success:      =>
                    @tablets.complete++
                    @tablets.successful++
                    @updatePullResult()
                  error: (a, b) =>
                    @tablets.complete++
                    @updatePullResult()
                ,
                  doc_ids: docList
              )

  updatePullResult: =>
    if @tablets.complete == @tablets.okCount
      Utils.working false
      Utils.midAlert "Pull finished.<br>#{@tablets.successful} out of #{@tablets.okCount} successful.", 5000
      Tangerine.$db.removeDoc
        "_id"  : @randomDoc.id
        "_rev" : @randomDoc.rev
      @klasses.fetch success: => @renderKlasses()

  gotoCurricula: ->
    Tangerine.router.navigate "curricula", true

  saveNewKlass: ->

    schoolName = $.trim(@$el.find("#school_name").val())
    year       = $.trim(@$el.find("#year").val())
    grade      = $.trim(@$el.find("#grade").val())
    stream     = $.trim(@$el.find("#stream").val())
    curriculum = @$el.find("#curriculum option:selected").attr("data-id")

    errors = []
    errors.push " - No school name."         if schoolName == ""
    errors.push " - No year."                if year       == ""
    errors.push " - No grade."               if grade      == ""
    errors.push " - No stream."              if stream     == ""
    errors.push " - No curriculum selected." if curriculum == "_none"

    for klass in @klasses.models
      if klass.get("year")   == year &&
         klass.get("grade")  == grade &&
         klass.get("stream") == stream
        errors.push " - Duplicate year, grade, stream."

    if errors.length == 0
      teacherId = if Tangerine.user.has("teacherId")
        Tangerine.user.get("teacherId")
      else
        "admin"
      klass = new Klass
      klass.save
        teacherId    : teacherId
        schoolName   : schoolName
        year         : year
        grade        : grade
        stream       : stream
        curriculumId : @$el.find("#curriculum option:selected").attr("data-id")
        startDate    : (new Date()).getTime()
      ,
        success: =>
          @klasses.add klass
    else
      alert ("Please correct the following errors:\n\n#{errors.join('\n')}")

  gotoKlass: (event) ->
    Tangerine.router.navigate "class/edit/"+$(event.target).attr("data-id")

  toggleAddForm: ->
    @$el.find("#add_form, .add").toggle()
    if not Tangerine.user.isAdmin()
      schoolName = @teachers.get(Tangerine.user.get("teacherId")).get("school")
      @$el.find("#school_name").val(schoolName)
      @$el.find("#year").focus()
    else
      @$el.find("#school_name").focus()
    if @$el.find("#add_form").is(":visible") then @$el.find("#add_form").scrollTo()

  renderKlasses: ->
    @closeViews()

    $ul = $("<ul>").addClass("klass_list")
    for klass in @klasses.models
      view = new KlassListElementView
        klass      : klass
        curricula  : @curricula
      view.on "rendered", @onSubviewRendered
      view.render()
      @views.push view
      $ul.append view.el
    @$el.find("#klass_list_wrapper").empty()
    @$el.find("#klass_list_wrapper").append $ul

  onSubviewRendered: =>
    @trigger "subRendered"

  render: =>

    curriculaOptionList = "<option data-id='_none' disabled='disabled' selected='selected'>#{t('select a curriculum')}</option>"
    for curricula in @curricula.models
      curriculaOptionList += "<option data-id='#{curricula.id}'>#{curricula.get 'name'}</option>"

    @$el.html "
      <h1>#{t('classes')}</h1>
      <div id='klass_list_wrapper'></div>

      <button class='klass_add command'>#{t('add')}</button>
      <div id='add_form' class='confirmation'>
        <div class='menu_box'>
          <div class='label_value'>
            <label for='school_name'>School name</label>
            <input id='school_name'>
          </div>
          <div class='label_value'>
            <label for='year'>School year</label>
            <input id='year'>
          </div>
          <div class='label_value'>
            <label for='grade'>#{t('grade')}</label>
            <input id='grade'>
          </div>
          <div class='label_value'>
            <label for='stream'>#{t('stream')}</label>
            <input id='stream'>
          </div>
          <div class='label_value'>
            <label for='curriculum'>#{t('curriculum')}</label><br>
            <select id='curriculum'>#{curriculaOptionList}</select>
          </div>
          <button class='command klass_save'>#{t('save')}</button><button class='command klass_cancel'>#{t('cancel')}</button>
        </div>
      </div>
    "

    @updateUploader() if Tangerine.user.isAdmin()

    @renderKlasses()

    @trigger "rendered"

  closeViews: ->
    for view in @views?
      view.close()
    @views = []

  onClose: ->
    @closeViews()