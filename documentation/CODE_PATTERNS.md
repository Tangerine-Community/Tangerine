# Code Patterns

## Views never reach out of their domain and modify the application
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

