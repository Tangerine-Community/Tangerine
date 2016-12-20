class Phrase extends Backbone.Model

#  initialize: ( options )->

  schema: {
    language:      { type: 'Select', options: { '':'Select One:',  'en': 'English', 'ur-PK': 'Urdi' } },
    code:       'Text',
    phrase:       'TextArea'
  }
