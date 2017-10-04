class Config extends Backbone.Model

  url : "config"

  save : null

  getDefault: (key) ->
    @get("defaults")[key]

