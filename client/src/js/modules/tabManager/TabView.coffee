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
    @tabIndex = null

  tabClicked: (element) ->
    tabNumber = JSON.parse($(element.currentTarget).find('a')[0].getAttribute('data-tab-to-use'))
    @setTab(tabNumber)

  setTab: (tabNumber) ->
    # This hiding tabBody, replacing the contents of tabBody, then showing it.  
    tabBody = this.$el.find('.classHtml')[0]
    tab = @tabs[tabNumber]
    views = []
    # Initialize all the Views for the Tab.
    tab.views.forEach (view) ->
      prototypeView = new window[view.className]
      views.push(prototypeView)
    @tabIndex = tabNumber
    # A function that hides the old tab. 
    hideOldTab = (duration) ->
      $(tabBody).fadeOut(duration)
      # TODO: Destory the Views in the current Tab. 
    # A function that shows the new tab.
    showNewTab = (duration) ->
      # Render and append all the Views for the new tab.
      $(tabBody).html('')
      views.forEach (view) ->
        view.render()
        $(tabBody).append view.el
        $(tabBody).fadeIn(duration)
    # Animate it.
    hideOldTab(200)
    setTimeout(->
      showNewTab(300)
    , 300)

  
  render: =>

    @$el.html ''
     
    @tabTitles = ''
    i = 0
    for tab in @tabs
      @tabTitles += "<paper-tab link>
                    <a id='#{tab.views[0].className}' class='link' data-tab-to-use='#{i}' tabindex='-1'>#{tab.title}</a>
                  </paper-tab>"
      i++
 
    @$el.html "
    <style is='custom-style'>
      .AssessmentsView {
        background: white;
      }
      .TabView .classHtml {
        padding: 20px;
      }
      paper-tabs {
        background-color: #EEE;
        --paper-tabs-selection-bar-color: var(--paper-orange-600);
        border-bottom: 1px solid #CCC;
      }
      paper-toolbar {
        --paper-toolbar-background: var(--paper-red-900);
      }
      paper-tab[link] a {
        @apply(--layout-horizontal);
        @apply(--layout-center-center);
        color: var(--paper-orange-600);
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
