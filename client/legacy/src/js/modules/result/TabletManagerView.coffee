class TabletManagerView extends Backbone.View

  className : "KlassesView"

  i18n: ->
    @text =
      detectingTablets : t("TabletManagerView.message.detecting")
      syncComplete     : t("TabletManagerView.label.sync_complete")

  initialize: ( options ) ->

    @i18n()

    @ipBlock  = 32
    @totalIps = 256
    @tabletOffset = 0

    @callbacks = options.callbacks

    @docTypes = options.docTypes

  sync: =>
    return unless @tabletOffset is 0
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
      percentage = Math.round(@tabletOffset / @totalIps * 100)
      Utils.midAlert t("TabletManagerView.message.searching", percentage: percentage)
      @tabletOffset += @ipBlock
      @pullDocs()
    else

      # -1 because one of them will be this computer
      @tablets.okCount = Math.max(@tablets.okCount-1, 0)

      if @tablets.okCount == 0
        @tabletOffset = 0
        Utils.working false
        Utils.midAlert t("TabletManagerView.message.found", count : @tablets.okCount)
        Tangerine.$db.removeDoc
          "_id"  : @randomDoc.id
          "_rev" : @randomDoc.rev
        return

      unless confirm(t("TabletManagerView.message.confirm_pull", __found__ : @tablets.okCount))
        @tabletOffset = 0
        Utils.working false
        Tangerine.$db.removeDoc
          "_id"  : @randomDoc.id
          "_rev" : @randomDoc.rev
        return


      Utils.midAlert t("TabletManagerView.message.pull_status", tabletCount : @tablets.okCount)
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
      Utils.midAlert t("TabletManagerView.message.pull_complete", { successful: @tablets.successful, total : @tablets.okCount})
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
        Utils.sticky "<b>#{@text.syncComplete}</b><br>#{t("TabletManagerView.message.successful_count", {successful : @push.successful, total : @push.complete } ) }"
      else
        Utils.midAlert t("TabletManagerView.message.syncing",{ done: @push.complete+1, total : @push.ips.length})
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


