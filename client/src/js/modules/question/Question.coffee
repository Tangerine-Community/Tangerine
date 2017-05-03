# @TODO I think this can be removed. url should stay
class Question extends Backbone.Model

  url: "question"

  config:
    types : [ "multiple", "single", "open" ]

  default:
    order  : 0
    prompt : "Is this an example question?"
    hint   : "[hint or answer]"

    # main question types
    type : "single"

    # question features
    otherWriteIn : false
    options      : [] # tricky bit, contains `label`,`value` property

    # outside requirements
    linkedGridScore : 0

    # Within subtest requirements
    skipLink        : null
    skipRequirement : null

  initialize: ( options )->

  layout: (obj) ->
    if obj?
      @set('layout', obj)
    else
      if @has('layout')
        return @get('layout')
      else
        return { rows : [] }


Object.defineProperty Question, 'AV_ALIGNMENT',
  value: [
    'left',
    'center',
    'right'
  ]

