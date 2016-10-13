class TabView extends Backbone.View

  className : "TabView"
  

  events:
    "click paper-tab"	: 'displayViewHtml'



  config: => 
    
    @tabsHtml = ''
    @tabsToUse =  [
          {"title": "Login", "weight": 1, "url":"#login", "views": [{className: "LoginView"} ] },
          { "title": "Bandwidth", "weight": 2, "url":"#bandwidth", "views": [{className: "BandwidthCheckView"}] },
          { "title": "Tab Test", "weight": 3, "url":"#testurl", "views": [{className: "Testclass"}] }
        ]
    for tab in @tabsToUse
      #console.log tab.title    
      @tabsHtml += "<paper-tab link>
                    <a id='#{tab.views[0].className}' class='link' data-tab-to-use='#{JSON.stringify(tab)}' tabindex='-1'>#{tab.title}</a>
                  </paper-tab>" 
    #console.log tabsHtml
    #href='#{tab.url}'
    #onclick= '#{@displayViewHtml}'
                
  # Allow for overridden configs
  initialize: (config={}) =>
    _.extend(@config(), config)

  myFunction: ()->
    console.log "do some work here JW"

  displayViewHtml: (element) ->  
    tab = JSON.parse($(element.currentTarget).find('a')[0].getAttribute('data-tab-to-use'))
    views = []
    tab.views.forEach (view) -> 
      prototypeView = new window[view.className]
      views.push(prototypeView)
    console.log views
    
    element = this.$el.find('.classHtml')[0]
    $(element).html('')
    views.forEach (view) -> 
      view.render()
      view.el
      $(element).append view.el
  
  #alert('#{tab.views[0].className}')
  
  render: =>
    
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
      <h2>Tab Test2</h2>
      <paper-tabs selected='0'>
        #{@tabsHtml}
      </paper-tabs>     
    </div>
    <div class='classHtml'>Hello there</div>
    "

    @trigger "rendered"