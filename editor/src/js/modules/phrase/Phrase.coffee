class Phrase extends Backbone.Model

#  initialize: ( options )->

  url:"phrase"

  schema: {
    language:      { type: 'Select', options: { '':'Select One:',  'en': 'English', 'ur-PK': 'Urdi' } },
    code:       'Text',
    phrase:       'TextArea'
  }
