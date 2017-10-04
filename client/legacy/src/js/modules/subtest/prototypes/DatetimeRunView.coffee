class DatetimeRunView extends Backbone.View

  className: "datetime"

  i18n: ->

    @text =
      year : t("DatetimeRunView.label.year")
      month : t("DatetimeRunView.label.month")
      day : t("DatetimeRunView.label.day")
      time : t("DatetimeRunView.label.time")

  initialize: (options) ->

    @i18n()

    @model  = options.model
    @parent = options.parent
    @dataEntry = options.dataEntry

  render: ->
    dateTime = new Date()
    year     = dateTime.getFullYear()
    months   = [t("jan"),t("feb"),t("mar"),t("apr"),t("may"),t("jun"),t("jul"),t("aug"),t("sep"),t("oct"),t("nov"),t("dec")]
    month    = months[dateTime.getMonth()]
    day      = dateTime.getDate()
    minutes  = dateTime.getMinutes()
    minutes  = "0" + minutes if minutes < 10
    time     = dateTime.getHours() + ":" + minutes

    unless @dataEntry


      previous = @parent.parent.result.getByHash(@model.get('hash'))

      if previous
        year  = previous.year
        month = previous.month
        day   = previous.day
        time  = previous.time

    @$el.html "
      <div class='question'>
        <table>
          <tr>
            <td><label for='year'>#{@text.year}</label><input id='year' value='#{year}'></td>
            <td>
              <label for='month'>#{@text.month}</label><br>
              <select id='month' value='#{month}'>#{("<option value='#{m}' #{("selected='selected'" if m is month) || ''}>#{m.titleize()} </option>" for m in months).join('')}</select>
            </td>
            <td><label for='day'>#{@text.day}</label><input id='day' type='day' value='#{day}'></td>
          </tr>
          <tr>
            <td><label for='time'>#{@text.time}</label><br><input type='text' id='time' value='#{time}'></td>
          </tr>
        </table>
      </div>
      "
    @trigger "rendered"
    @trigger "ready"

  getResult: ->
    return {
      "year"  : @$el.find("#year").val()
      "month" : @$el.find("#month").val()
      "day"   : @$el.find("#day").val()
      "time"  : @$el.find("#time").val()
    }

  getSkipped: ->
    return {
      "year"  : "skipped"
      "month" : "skipped"
      "day"   : "skipped"
      "time"  : "skipped"
    }

  isValid: ->
    true

  showErrors: ->
    true

  next: ->
    console.log("next!!")
    @prototypeView.on "click .next",    =>
      console.log("clickme!")
      this.next()
    @parent.next()
  back: -> @parent.back()
