# displays heirarchical dropdowns based on geography from Loc
class LocView extends Backbone.View

  events :
    "change select" : "onChange"

  onChange: (event) ->
    # clear subsequent select boxes
    $(event.target).closest("div").nextAll().remove()

    index = parseInt($(event.target).attr('data-index'))
    @renderOne( index + 1 ) unless index + 1 is @levels.length
    @trigger "change"

  initialize: (options={}) ->
    @showTitles = if options.showTitles? then options.showTitles else true
    @levels = options.levels || ["county", "zone", "school"]
    @addedOptions = if options.addedOptions? then options.addedOptions else false
    @selected = options.selected || []

  isComplete: ->
    value = @value()
    for level in @levels
      return false unless value[level]
    return true


  value: ->
    result = {}
    for level, i in @levels
      if @$el.find("[data-index='#{i}']").length isnt 0
        result[level] = @$el.find("[data-index='#{i}']").val()
    return result

  renderOne: (index) ->
    if index is 0
      criteria = {}
    else
      criteria = @value()

    Loc.query @levels, criteria, (res) ->

      if @addedOptions
        res = @addedOptions[index].concat res
      res = res.sort (a,b) ->
        if a.label.toLowerCase() < b.label.toLowerCase()
          return -1
        else if a.label.toLowerCase() > b.label.toLowerCase()
          return 1
        else
          return 0

      htmlOptions = res.map (el) ->
        if @selected[@levels[index]]? and el.id is @selected[@levels[index]]
          selected = "selected='selected'"
        "<option value='#{el.id}' #{selected||''}>#{el.label}</option>"
      , @
      # TODO: There is an off by one error here that when I try to fix it causes a huge number of fields to manifest. Needs work.
      title = @levels[index].titleize() if @showTitles

      noPreSelection = not @selected[index]?
      if noPreSelection
        selected = "selected='selected'"

      @$el.append "
        <div>
          <label>#{title || ''}
            <select data-index='#{index}'>
              <option #{selected||''} disabled='disabled'>Select...</option>
              #{htmlOptions}
            </select>
          </label>
          <br>
        </div>
      "
      if @selected.length isnt 0
        if index + 1 is @selected.length
          @selected = []
        else
          @renderOne(index+1)
    , @



  render: ->
    @renderOne(0)

