class Phrases extends Backbone.Collection

  url   : "phrase"
  model : Phrase
  pouch:
    viewOptions:
      key : 'phrase'

