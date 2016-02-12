class TabletManagerView extends Backbone.View

  className : "KlassesView"

  initialize: ( options ) ->

    @ipBlock  = 32
    @totalIps = 64
    @tabletOffset = 0

    @callbacks = options.callbacks

    @docTypes = options.docTypes

    @text = 
      detectingTablets : "Please wait, detecting tablets."
      internalError : "Internal database error"

  sync: =>
    @pullDocs()

  pullDocs: =>
    if @tabletOffset == 0
      @tablets = # if you can think of a better idea I'd like to see it
        checked    : 0
        complete   : 0
        successful : 0
        okCount    : 0
        ips        : []
        result     : 0
      Utils.midAlert @text.detectingTablets

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
              timeout: 20000
            req.complete (xhr, error) =>
              @tablets.checked++
              if parseInt(xhr.status) == 200
                @tablets.okCount++
                @tablets.ips.push ip
              @updatePull()
      error: ->
        Utils.working false
        Utils.midAlert @text.internalError

  updatePull: =>
    # do not process unless we're done with checking this block
    return if @tablets.checked < @ipBlock + @tabletOffset

    # give the choice to keep looking if not all tablets found
    if @tabletOffset != @totalIps - @ipBlock #&& confirm("#{Math.max(@tablets.okCount-1, 0)} tablets found.\n\nContinue searching?")
      Utils.midAlert "Searching: #{Math.round(@tabletOffset / @totalIps * 100)}% complete."
      @tabletOffset += @ipBlock
      @pullDocs()
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

      unless confirm("#{@tablets.okCount} tablets found.\nStart data pull?")
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
            # if found self then remember self
            @selfSubnetIp = ip

          selfReq.complete (xhr, error) => do (xhr) =>
            return if parseInt(xhr.status) == 200
            # if not, then we found another tablet
            viewReq = $.ajax
              "url"         : Tangerine.settings.urlSubnet(ip) + "/_design/tangerine/_view/byCollection"
              "dataType"    : "jsonp"
              "contentType" : "application/json;charset=utf-8",
              "data"        : 
                include_docs : false
                keys : JSON.stringify(@docTypes)

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
      @callbacks.completePull?()

  pushDocs: =>
    if not _.isObject(@push)
      Utils.working true
      Tangerine.$db.view Tangerine.design_doc+"/byCollection", 
        keys : @docTypes
        success : (response) =>
          docIds = _.pluck(response.rows,"id")
        
          @push = 
            ips    : _.without(@tablets.ips, @selfSubnetIp)
            docIds : docIds
            current    : 0
            complete   : 0
            successful : 0

          @pushDocs()
    else

      if @push.complete == @push.ips.length
        Utils.working false
        Utils.sticky "<b>Sync complete</b><br>#{@push.successful} out of #{@push.complete} successful."
      else
        Utils.midAlert "Syncing: <br>#{@push.complete+1} out of #{@push.ips.length}."
        $.couch.replicate(
          Tangerine.settings.urlDB( "local" ),
          Tangerine.settings.urlSubnet( @push.ips[ @push.current ] ),
            success:      =>
              @push.complete++
              @push.successful++
              @pushDocs()
            error: (a, b) =>
              @push.complete++
              @pushDocs()
          ,
            doc_ids: @push.docIds
        )


