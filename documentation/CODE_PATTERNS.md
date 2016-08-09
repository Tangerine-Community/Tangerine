# Code Patterns

## Views never reach out of their domain and modify the application, a seperation of concerns
This is a more general principle inspired by [Translate DOM activity in to semantic expressions of user intention](https://www.foraker.com/blog/backbone-js-organizational-patterns).

Bad:
```
class WorkflowMenuView extends Backbone.View

  events:
    "click .workflow-new"    : 'new'

  new: ->
    guid = Utils.guid()
    Tangerine.router.navigate "workflow/edit/#{guid}", false
    workflow = new Workflow "_id" : guid
    view = new WorkflowEditView workflow : workflow
    vm.show view
```
This bad example breaks a number of rules. A route is changed into something that should be handled by the Router, a new Model is created and then passed to another route when the Router should do this, and the application is completely hijacked by replacing the entire main region with a new View.

Good:
```
class WorkflowMenuView extends Backbone.View

  events:
    "click .workflow-new"    : 'new'

  new: ->
    this.trigger('workflow:new')
```
This good example bubbles up an event that the router can then decide what to do with. This makes the application flow much easier to follow as you can read the Router to understand flow and why certain things are on the screen at a given time in a different route.

## Get your truth out of the DOM 

A commonly quote from Jeremy Ashkenas, creator of Backbone.js, is "Get your truth out of the DOM". In other words, don't store state or data properties in the DOM, store them in your Views and Models.  

Bad:
```
Faucet = Backbone.View.extend

  checkInOnTheValve: ->
    valveState  = if @$el.hasClass("valve_open") then "open" else "closed" 
    ...
  
  render: ->
    @$el.addClass("valve_open")
    ...
```

Good:
```
Faucet = Backbone.View.extend

  initialize: ->
    @valve = "closed"
    @on 'valve:change', (state) -> @valve = state 

  checkInOnTheValve: ->
    valveState  = @valve 
    ...
  
  render: ->
    @trigger "valve:change", "open"
    ...
```
In the above example, the bad code stores the valve state in the DOM as classes on the View's element and the good example stores that state on a propery of the View. 

