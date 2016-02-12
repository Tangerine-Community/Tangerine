class DatetimeRunView extends Backbone.View

  className: "datetime"

  initialize: (options) ->
    @model  = @options.model
    @parent = @options.parent
  
  render: ->
    dateTime = new Date()
    year     = dateTime.getFullYear()
    month    = [t("jan"),t("feb"),t("mar"),t("apr"),t("may"),t("jun"),t("jul"),t("aug"),t("sep"),t("oct"),t("nov"),t("dec")][dateTime.getMonth()]
    day      = dateTime.getDate()
    minutes  = dateTime.getMinutes()
    minutes  = "0" + minutes if minutes < 10
    time     = dateTime.getHours() + ":" + minutes

    @$el.html "
      <div class='question'>
        <table>
          <tr>
            <td><label for='year'>#{t('year')}</label><input id='year' name='year' value='#{year}'></td>
            <td><label for='month'>#{t('month')}</label><input id='month' type='month' name='month' value='#{month}'></td>
            <td><label for='day'>#{t('day')}</label><input id='day' type='day' name='day' value='#{day}'></td>
          </tr>
          <tr>
            <td><label for='time'>#{t('time')}</label><br><input type='text' id='time' name='time' value='#{time}'></td>
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

  
  getSum: ->
    return {
      correct: 1
      incorrect: 0
      missing: 0
      total: 1
    }

  isValid: ->
    true

  showErrors: ->
    true