class TabView extends Backbone.View

  className : "TabView"
  

  events:
    "click paper-tab"	: 'tabClicked'

  tabs:  [
        {"title": "Assessments", "weight": 1, "url":"#assessments", "views": [{className: "AssessmentsViewController"} ] },
        { "title": "Sync", "weight": 2, "url":"#bandwidth", "views": [{className: "BandwidthCheckView"}, {className: "UniversalUploadView"}, {className: "ResultsSaveAsFileView"}] },
      ]

  config: =>
                  
  # Allow for overridden configs
  initialize: (config={}) =>
    _.extend(@config(), config)

  myFunction: ()->
    console.log "do some work here JW"

  tabClicked: (element) ->
    tabNumber = JSON.parse($(element.currentTarget).find('a')[0].getAttribute('data-tab-to-use'))
    @setTab(tabNumber)

  setTab: (tabNumber) ->
    tab = @tabs[tabNumber]
    views = []
    tab.views.forEach (view) ->
      prototypeView = new window[view.className]
      views.push(prototypeView)
    
    tabBody = this.$el.find('.classHtml')[0]
    $(tabBody).html('')
    views.forEach (view) ->
      view.render()
      $(tabBody).append view.el
  
  render: =>
    
    @tabTitles = ''
    i = 0
    for tab in @tabs
      @tabTitles += "<paper-tab link>
                    <a id='#{tab.views[0].className}' class='link' data-tab-to-use='#{i}' tabindex='-1'>#{tab.title}</a>
                  </paper-tab>"
      i++
 
    @$el.html "
    <link rel='import' href='js/lib/bower_components/paper-tabs/paper-tab.html'>
    <link rel='import' href='js/lib/bower_components/paper-tabs/paper-tabs.html'>
    <style is='custom-style'>
      paper-tabs, paper-toolbar {
            background-color: #F6C637; 
            color: #fff;
      }
      paper-tab[link] a {
        @apply(--layout-horizontal);
        @apply(--layout-center-center);
        color: #fff;
        text-decoration: none;
      }
    </style>
    <div>
      <paper-tabs selected='0'>
        #{@tabTitles}
      </paper-tabs>     
    </div>
    <div class='classHtml'></div>
    "

    @setTab(0)
