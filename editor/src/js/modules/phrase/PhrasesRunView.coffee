class PhrasesRunView extends Backbone.View

  className: "phrases_edit_view"

  initialize: (options) =>
    @phrases     = options.phrases
    if @phrases.length == 0
      @phrases = new Phrases
      phrase = new Phrase
        language: "en"
        code: "progress1"
        phrase: "Your class is doing well, \#{result}, continue with the reading program. Share your and your class’ great work with parents.
          Reward your class with some fun reading activities such as reading marathons or competitions. However, look at a
          student grouping report for this assessment and make sure that those children performing below average get extra
          attention and practice and don’t fall behind."
      @phrases.push(phrase)
#    @el =

  render: =>
    phrasesList = ""
    if @phrases?
      phrasesList += "<table>"
      phrasesList += "<tr><th>Lang</th><th>Code</th><th>Phrase</th></tr>"
      _.each @phrases.models, (phrase) ->
        phrasesList += "<tr></tr><td>#{phrase.get("language")}</td><td>#{phrase.get("code")}</td><td>#{phrase.get("phrase")}</td><tr>"
      phrasesList += "</table>"

    phrase = new Phrase()
#    form = new Backbone.Form({
#      model: phrase
#    }).render();


    @$el.html "
        <h2>New Phrase</h2>
        <div id='phrase-form'></div>
        <h2>Phrases</h2>
        #{phrasesList}

      "

    @trigger "rendered"

    @phrasesForm = new Backbone.Form({
      model: phrase
    }).render()
    $(@$el.find('#phrase-form')[0]).html(@phrasesForm.el)

#  afterRender: =>
#    console.log("afterRender")
#    phrase = new Phrase()
#    @phrasesForm = new Backbone.Form({
#      model: phrase
#    }).render()
#    $(@$el.find('#phrase-form')[0]).html(@phrasesForm.el)
