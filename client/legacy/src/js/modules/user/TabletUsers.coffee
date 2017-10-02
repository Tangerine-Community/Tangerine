class TabletUsers extends Backbone.Collection
  model: TabletUser
  url : 'user'
  pouch:
    viewOptions:
      key : 'user'
