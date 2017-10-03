
class WorkflowEditView extends Backbone.EditView
  
  className: "WorkflowEditView"

  events : $.extend
    'click  .add'           : "stepAdd"
    'change .type-selector' : 'onTypeSelectorChange'
    'change .types-id'      : 'onTypesIdChange'
    'change .user-type'     : 'onUserTypeChange'

    'click .open-selector'  : 'openSelector'

    'click .remove-step'    : 'removeStep'

  , Backbone.EditView.prototype.events


  removeStep: (event) ->
    $target = $(event.target)
    modelId = $target.attr('data-model-id')
    @workflow.collection.remove(modelId)
    @workflow.save null,
      success: ->
        Utils.topAlert("Step removed")

  openSelector: ( event ) ->
    $target = $(event.target)
    modelId = $target.attr('data-model-id')
    stepType = $target.attr('data-step-type')
    @updateSelector(modelId, stepType)

  onTypesIdChange: (event) ->
    $target = $(event.target)
    typeId = $target.val()
    stepId = $target.attr('data-step-id')
    @models.get(stepId).save "typesId" : typeId,
      success: ->
        Utils.topAlert "Saved"

  onUserTypeChange: (event) ->
    $target = $(event.target)
    userType = $target.val()
    stepId = $target.attr('data-step-id')
    @models.get(stepId).save "userType" : userType,
      success: ->
        Utils.topAlert "Saved"

  initialize: (options) ->
    @[key] = value for key, value of options
    @updateEditInPlaceModels()
    @workflow.collection.on "change add remove", =>
      @workflow.collection.sort()
      @updateEditInPlaceModels()
      @render()

  updateEditInPlaceModels: =>
    @models = new Backbone.Collection [@workflow].concat(@workflow.collection.models)

  render: =>

    stepList      = ""
    @needNames    = []
    @needSelector = []

    @workflow.collection.each (stepModel) =>

      stepType = stepModel.getType()

      selectedAssessment = "selected='selected'" if stepType is "assessment"
      selectedCurriculum = "selected='selected'" if stepType is "curriculum"
      selectedNewObject  = "selected='selected'" if stepType is "new"
      selectedMessage    = "selected='selected'" if stepType is "message"
      selectedLogin      = "selected='selected'" if stepType is "login"
      selectedNoType     = "selected='selected'" if stepType is ""

      displayAssessment = "display:none;" if stepType is "" or stepType isnt "assessment"
      displayCurriculum = "display:none;" if stepType is "" or stepType isnt "curriculum"
      displayNew        = "display:none;" if stepType is "" or stepType isnt "new"
      displayMessage    = "display:none;" if stepType is "" or stepType isnt "message"
      displayLogin      = "display:none;" if stepType is "" or stepType isnt "login"

      typeSelector = "
        <select class='type-selector' data-id='#{stepModel.id}'>
          <option disabled='disabled' #{selectedNoType || ''} >Select type</option>
          <option #{selectedAssessment || ''} value='assessment'>Assessment</option>
          <option #{selectedCurriculum || ''} value='curriculum'>Curriculum</option>
          <option #{selectedMessage    || ''} value='message'>Message</option>
          <option #{selectedNewObject  || ''} value='new'>New Object</option>
          <option #{selectedLogin      || ''} value='login'>Login</option>
        </select>"

      stepList += "
        <li>
          <table>

            <tr>
              <th>Name</th>
              <td>#{@getEditable
                  model: stepModel
                  attribute: 
                    key : 'name'
                    escape : true
                  name: 'Step name'
                  placeholder: 'untitled step'
                }
              </td>
            </tr>

            <tr>
              <th>Order</th>
              <td>#{@getEditable
                  model: stepModel
                  attribute: 
                    key : 'order'
                    isNumber : true
                  name: 'Order'
                  placeholder: 'Order'
                }
              </td>
            </tr>

            <tr>
              <th>Resumable</th>
              <td>#{@getEditable
                  model: stepModel
                  attribute:
                    key : 'resumable'
                    escape: true
                  name: 'Resumable'
                  placeholder: 'true or false'
                  prepare: (value)->CoffeeScript.compile "return #{value}"
                }
              </td>
            </tr>


            <tr>
              <th>Skip logic</th>
              <td>#{@getEditable
                  model: stepModel
                  attribute:
                    key : 'skipLogic'
                    escape: true
                  name: 'Skip logic'
                  placeholder: 'Skip logic'
                  prepare: (value) -> CoffeeScript.compile "return #{value}"
                }
              </td>
            </tr>

            <tr>
              <th>Type</th>
              <td>
                #{typeSelector}<br>
                <div id='typeSelectorContainer-#{stepModel.id}'></div>
              </td>
            </tr>

            <tr class='message-only not-new not-login not-assessment not-curriculum' style='#{displayMessage||''}'>
              <th>Message</th>
              <td>#{@getEditable
                  model: stepModel
                  attribute:
                    key : 'message'
                    escape: true
                  name: 'Message'
                  placeholder: 'Message'
                }
              </td>
            </tr>

            <tr class='new-only not-login not-assessment not-new not-curriculum' style='#{displayNew||''}'>
              <th>Object Type</th>
              <td>#{@getEditable
                  model: stepModel
                  attribute: 
                    key : 'className'
                  name: 'Class name'
                  placeholder: 'Class name'
                }
              </td>
            </tr>
            <tr class='new-only not-login not-assessment not-new not-curriculum' style='#{displayNew||''}'>
              <th>Object options</th>
              <td>#{@getEditable
                  model: stepModel
                  attribute: 
                    key : 'classOptions'
                  name: 'Class Options'
                  placeholder: 'Class options'
                  prepare: ( prop ) -> CoffeeScript.compile "return #{prop}"
                }
              </td>
            </tr>

            <tr class='login-only not-assessment not-new not-curriculum' style='#{displayLogin||''}'>
              <th>Login type</th>
              <td id='user-type-selector-container-#{stepModel.id}'>
                #{stepModel.getUserType()}
                <span class='link open-selector' data-model-id='#{stepModel.id}' data-step-type='login'>Change</span>
              </td>
            </tr>

            <tr class='curriculum-only not-assessment not-new not-login' style='#{displayCurriculum||''}'>
              <th>Item type variable</th>
              <td>#{@getEditable
                  model: stepModel
                  attribute: 
                    key : 'curriculumItemType'
                  name: 'Item type variable'
                  placeholder: 'Item type'
                }
              </td>
            </tr>
            <tr class='curriculum-only not-assessment not-new not-login' style='#{displayCurriculum||''}'>
              <th>Week variable</th>
              <td>#{@getEditable
                  model: stepModel
                  attribute: 
                    key : 'curriculumWeek'
                  name: 'Week variable'
                  placeholder: 'Week variable'
                }
              </td>
            </tr>
            <tr class='curriculum-only not-assessment not-new not-login' style='#{displayCurriculum||''}'>
              <th>Grade variable</th>
              <td>#{@getEditable
                  model: stepModel
                  attribute:
                    key : 'curriculumGrade'
                  name: 'Grade variable'
                  placeholder: 'Grade variable'
                }
              </td>
            </tr>


            <tr>
              <td><button class='command remove-step' data-model-id='#{stepModel.id}'>Remove</button></td>
            </tr>
          </table>
        </li>
      "

      @needNames.push stepModel    if stepType is "assessment" or stepType is "curriculum"

      @needSelector.push stepModel if stepType is "assessment" and stepModel.getTypesId() is ""
      @needSelector.push stepModel if stepType is "curriculum" and stepModel.getTypesId() is ""
      @needSelector.push stepModel if stepType is "login" and stepModel.getUserType() is ""


    html = "
      <h1>#{@getEditable
        model: @workflow
        attribute : 
          key : 'name'
          escape : true
        name : "Workflow name"
        placeholder: "Untitled workflow"
        }
      </h1>
      <div class='menubox'>
        <h2>Steps</h2>
        <ul id='step-list'>#{stepList}</ul>
      </div>
      <div id='controls'>
        <button class='add command'>Add step</button>
      </div>

      <section>
        <h2>Feedback</h2>

        <table>
          <tr>
            <th>Enabled</th>
            <td>#{@getEditable
                model: @workflow
                attribute:
                  key : 'enableFeedback'
                  escape: true
                name: 'Enable feedback'
                placeholder: 'true or false'
                prepare: (value) -> value.toLowerCase() is "true"
              }
            </td>
          </tr>
        </table>


        <div id='feedback'>
          <button class='feedback nav-button'><a href='#feedback/edit/#{@workflow.id}'>Edit</a></button>
        </div>

      </section>

    "

    @$el.html html

    for model in @needNames
      if model.getTypesId()
        do (model) =>
          typeModel = new Backbone.Model "_id" : model.getTypesId()
          typeModel.fetch
            error: => @$el.find("#typeSelectorContainer-#{model.id}").html "Not found <span class='link open-selector' data-model-id='#{model.id}' data-step-type='#{model.getType()}'>Change</span>"
            success: =>
              @$el.find("#typeSelectorContainer-#{model.id}").html typeModel.get("name") + " <span class='link open-selector' data-model-id='#{model.id}' data-step-type='#{model.getType()}'>Change</span>"

    for model in @needSelector
      @updateSelector(model.id, model.getType())

    @trigger "rendered"

  onTypeSelectorChange: (event) =>

    $target = $(event.target)

    model   = @models.get($target.attr('data-id'))
    value   = $target.val()

    model.save "type":value,
      error: => 
        Utils.midAlert "Could not save. Please try again."
        @render()
      success: =>
        Utils.topAlert "Type saved"
        $parent = $target.parent("li")
        $parent.find(".#{value}-only").show()
        $parent.find(".not-#{value}").hide()
        @updateSelector(model.id, value)

  updateSelector: (modelId, type) =>
    if type is "assessment"
      @$el.find("#typeSelectorContainer-#{modelId}").html("<img src='images/loading.gif' class='loading'>")
      
      @assessments = new Assessments unless @assessments?
      @assessments.fetch
        success: =>
          oneSelected = false

          htmlOptions = ""
          for assessment in @assessments.models
            if assessment.id is @workflow.collection.get(modelId).getTypesId()
              selected    = "selected='selected'" 
              oneSelected = true
            else
              selected = ''
            htmlOptions += "<option value='#{assessment.id}' #{selected || ''}>#{assessment.get('name')}</option>" 

          promptSelection = "<option selected='selected' disabled='disabled'>Please select an assessment</option>" unless oneSelected

          @$el.find("#typeSelectorContainer-#{modelId}").html "
            <select class='types-id' data-step-id='#{modelId}'>
              #{promptSelection||''}
              #{htmlOptions}
            </select>
          "

    else if type is "curriculum"

      @$el.find("#typeSelectorContainer-#{modelId}").html("<img src='images/loading.gif' class='loading'>")
      
      curricula = new Curricula
      curricula.fetch
        success: =>

          oneSelected = false

          htmlOptions = ''
          for model in curricula.models
            if model.id is @workflow.collection.get(modelId).getTypesId()
              oneSelected = true
              selected = "selected='selected'"
            else
              selected = ''
            htmlOptions += "<option value='#{model.id}' #{selected}>#{model.get('name')}</option>"

          promptSelection = "<option selected='selected' disabled='disabled'>Please select an assessment</option>" unless oneSelected
  
          @$el.find("#typeSelectorContainer-#{modelId}").html "
            <select class='types-id' data-step-id='#{modelId}'>
              #{promptSelection||''}
              #{htmlOptions}
            </select><br>
          "

    else if type is "login"


      possibleTypes = ['tac', 'teacher']

      oneSelected = false
      htmlOptions = ''

      stepModel = @workflow.collection.get(modelId)

      for userType in possibleTypes
        if stepModel.getUserType() is userType
          oneSelected = true
          selected = "selected='selected'"
        else
          selected = ''
        htmlOptions += "<option value='#{userType}' #{selected}>#{userType}</option>"

      promptSelection = "<option selected='selected' disabled='disabled'>Please select a user type</option>" unless oneSelected

      @$el.find("#user-type-selector-container-#{modelId}").html "
        <select class='user-type' data-step-id='#{modelId}'>
          #{promptSelection||''}
          #{htmlOptions}
        </select>
      "


  stepAdd: -> @workflow.newChild()


