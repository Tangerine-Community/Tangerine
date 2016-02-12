# The config object should be used as a read only resource.
# Settings will store immutable values and read Config's data.
class Config extends Backbone.Model

  url : "config"

  save : null

  getDefault: ( key ) ->
    return @get("defaults")[key]