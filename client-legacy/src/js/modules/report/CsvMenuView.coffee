class CsvMenuView extends Backbone.View

  className : "CsvMenuView"

  initialize: (options) ->
    klassId   = options.parent.options.klass.id
    groupName = Tangerine.settings.get("groupName")
    document.location = "http://databases.tangerinecentral.org/_csv/class/#{groupName}/#{klassId}"
