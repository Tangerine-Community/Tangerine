class PhrasesRunView extends Backbone.View

  className: "phrases_edit_view"

  initialize: (options) =>
    @phrases     = options.phrases
    @currentPhrase = null
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
    @phrases.on("add", (phrase) =>
      console.log("Phrase added")
#      @render()
      window.location.reload()
    )
    @phrases.on("change", (phrase) =>
      console.log("Phrase changed")
#      @render()
      window.location.reload()
    )

  events:
    "click .code": "edit"
  render: =>
    phrasesList = ""
    if @phrases?
      phrasesList += "<table>"
      phrasesList += "<tr><th>Code</th><th>Lang</th><th>Phrase</th></tr>"
      _.each @phrases.models, (phrase) ->
        phrasesList += "<tr><td class='code' id='#{phrase.get("_id")}'>#{phrase.get("code")}</td><td>#{phrase.get("language")}</td><td>#{phrase.get("phrase")}</td></tr>"
      phrasesList += "</table>"

    phrase = new Phrase()

    @$el.html "
        <h2>New Phrase</h2>
        <div id='phrase-form'></div>
        <h2>Phrases</h2>
        <p>To edit a phrase, click on the text in the 'Code' column. This will pre-fill the form.</p>
        #{phrasesList}

      "

    @trigger "rendered"

    @form = new Backbone.Form({
      model: phrase,
      submitButton:"Submit",
    }).render()
    $(@$el.find('#phrase-form')[0]).html(@form.el)
    $(this.$el.find('#phrase-form form')[0]).append('<button class="reset" type = "reset" id="reset">Reset</button>')
    $("form").bind  "reset", (e) =>
      console.log("reset")
      e.preventDefault()
      @form.setValue
        language:""
        code:""
        phrase:""

    @form.on 'submit', (event) =>
      console.log("submit now")
      event.preventDefault()
      @form.commit()
      console.log("phrase: " + JSON.stringify(@currentPhrase))
      if @currentPhrase != null
        @form.model.set("_id", @currentPhrase.get("_id"))
        @form.model.set("_rev", @currentPhrase.get("_rev"))
        console.log("@currentPhrase.model: " + JSON.stringify(@form.model))
      @form.model.on 'sync', =>
        alert 'Form saved'
        console.log("@form.model: " + JSON.stringify(@form.model))
        if @currentPhrase != null
          @phrases.add  @form.model, {merge: true}
        else
          @phrases.add  @form.model
        console.log("@phrases: " + JSON.stringify(@phrases))
        @currentPhrase = null
      @form.model.save()
    @form.on 'reset', (event) =>
      console.log("reset now")
      event.preventDefault()

  edit: (e) =>
    console.log("edit")
    id = e.currentTarget.id
    @currentPhrase = @phrases.findWhere("_id":id)
    console.log("phrase: " + JSON.stringify(@currentPhrase))
    @form.setValue
      language:@currentPhrase.get("language")
      code:@currentPhrase.get("code")
      phrase:@currentPhrase.get("phrase")



#  afterRender: =>
#    console.log("afterRender")
#    phrase = new Phrase()
#    @form = new Backbone.Form({
#      model: phrase
#    }).render()
#    $(@$el.find('#phrase-form')[0]).html(@form.el)

