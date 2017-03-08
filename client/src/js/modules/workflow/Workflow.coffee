class Workflow extends Backbone.ParentModel

  url : "workflow"

  defaults: {
		"retrictToRole": [],
		"reporting": {
			"preProcess": false,
			"reportClass": "",
			"targetRoles": []
		},
		"authenticityParameters": {
		"enabled": false,
		"constraints": {}
		}
  },

  Child           : WorkflowStep
  ChildCollection : WorkflowSteps

  initialize: ( options ) ->

  getLength: -> @collection.length || @attributes.children.length

  stepModelByIndex: ( index ) -> 
    return @collection.models[index] || null

  validate: ( attr, options ) ->

    return

    return "Please supply children" unless attr.children?
    for child in attr.children

      if child.type is "login"
        return "Please specify `userType`" unless child.userType?

      else if child.type is "new"
        return "Please specify `viewClass`"     unless child.viewClass?
        return "`viewClass` must be a known function" unless child.viewClass?

