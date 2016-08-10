(() ->
  'use strict'

  if Mocha.process.browser
    dbs = 'testdb' + Math.random()
  else
    dbs = Mocha.process.env.TEST_DB

  Backbone.history.start()
  Tangerine.addRegions siteNav: "#siteNav"
  Tangerine.addRegions mainRegion: "#content"
  Tangerine.addRegions dashboardRegion: "#dashboard"

  Backbone.Model.prototype.idAttribute = '_id'

  #  $.i18n.init
  #    fallbackLng : false
  #    lng         : Tangerine.settings.get "language"
  #    resStore    : Tangerine.locales,
  #  ,
  #    (err, t) ->
  #      window.t = t

  resources =
    "en-US": {translation:{Tangerine:{message:{save_error:"Save error",saved:"Saved"},navigation:{button:{back:"Back"}},actions:{button:{save:"Save"}}},TabletManagerView:{message:{found:"__count__ tablets found.",detecting:"Please wait, detecting tablets...",searching:"Searching. __percentage__% complete.",confirm_pull:"Confirm __found__ tablets found. Start data pull?",pull_status:"Pulling from __tabletCount__ tablets.",pull_complete:"Pull finished. <br>__successful__ out of __total__ successful.",syncing:"Syncing: <br>__done__ out of __total__.",successful_count:"__successful__ out of  __total__ succesful."},label:{sync_complete:"Sync Complete"}},ResultsView:{label:{save_options:"Save options",advanced:"Advanced",pagination:"__start__-__end__ of __total__",cloud:"Cloud",csv:"CSV",tablets:"Tablets",status:"Status",started:"Started",results:"Results",details:"Details",page:"Page",per_page:"per page"},button:{refresh:"Refresh",detect:"Detect options"}},ResultSumView:{button:{resume:"Resume"},message:{no_results:"No results yet!"}},SettingsView:{message:{warning:"Please be careful with the following settings."},help:{context:"Sets the general behavior and appearance of Tangerine. Do not change this setting.",language:"Contact a Tangerine admin for more information on what languages are currently available.",group_handle:"A human readable name. Only for display purposes. Any change here will not affect the address of the group or any internal functionality.",group_name:"The group connected to this instance of Tangerine, and any APKs made from this instance.",group_host:"The URL of the server.",upload_password:"The password for uploading to your group.",log_events:"app, ui, db, err"},label:{settings:"Settings",context:"Context",language:"Language",group_handle:"Group handle",group_name:"Group name",group_host:"Group host",upload_password:"Upload password",log_events:"Log events"}},ResultView:{label:{assessment_complete:"Assessment complete",comments:"Additional comments (optional)",subtests_completed:"Subtests completed"},message:{saved:"Result saved",not_saved:"Not saved yet"},button:{save:"Save result",another:"Perform another assessment"}},AssessmentMenuView:{button:{"new":"New","import":"Import",apk:"APK",groups:"Groups",universal_upload:"Universal Upload",sync_tablets:"Sync tablets",results:"Results",save:"Save",cancel:"Cancel"},label:{assessment:"Assessment",assessments:"Assessments",curriculum:"Curriculum"}},GridRunView:{label:{input_mode:"Input Mode",was_autostopped:"Was autostopped",time_remaining:"Time remaining"},message:{touch_last_item:"Please touch last item read.",time_still_running:"Time still running.",subtest_not_complete:"Subtest not complete.",autostop:"Autostop activated. Discontinue test.",autostop_cancel:"Autostop removed. Continue.",last_item_confirm:'Was the last item "__item__"?\nOk to confirm. Cancel to place bracket.'},button:{restart:"Restart",start:"Start",stop:"Stop",mark:"Mark",last_attempted:"Last attempted",item_at_seconds:"Item at __seconds__ seconds"}},SubtestRunView:{button:{help:"Help",skip:"Skip",next:"Next",back:"Back"}},DatetimeRunView:{label:{year:"Year",month:"Month",day:"Day",time:"Time"}},ConsentRunView:{label:{default_consent_prompt:"Does the child consent?",confirm_nonconsent:"Click to confirm consent not obtained."},button:{confirm:"Confirm",yes_continue:"Yes, continue",no_stop:"No, stop"},message:{confirm:"Please confirm.",select:"Please select one."}},IdRunView:{label:{identifier:"Random identifier"},button:{generate:"Generate"}},LocationRunView:{button:{clear:"Clear"},message:{must_be_filled:"__levelName__ must be filled.",please_select:"Please select a(n) __levelName__"}},SurveyRunView:{button:{next_question:"Next question",previous_question:"Previous question"},message:{please_answer:"Please answer this question.",not_enough:"Student did not read enough words to ask comprehension questions.",correct_errors:"Please correct the errors on this page."}},NavigationView:{label:{teacher:"Teacher",user:"User",enumerator:"Enumerator",student_id:"Student ID",version:"Version"},button:{logout:"Logout",account:"Account",settings:"Settings"},help:{logo:"Go to main screen.",account:"Go to account screen."},message:{incomplete_main_screen:"Assessment not finished. Continue to main screen?",incomplete_logout:"Assessment not finished. Continue to logout?",logout_confirm:"Are you sure you want to logout?"}},LoginView:{message:{error_password_incorrect:"Incorrect password.",error_password_empty:"Please enter a password.",error_name_empty:"Please enter a name.",error_name_taken:"Name already taken.",pass_mismatch:"Passwords do not match"},button:{sign_up:"Sign up",login:"Login",logout:"Logout"},label:{login:"Login",sign_up:"Sign up",teacher:"Teacher name",user:"User name",enumerator:"Enumerator name",password:"Password",password_confirm:"Confirm Password"}},QuestionsEditListElementView:{help:{copy_to:"Copy to","delete":"Delete",edit:"Edit"},button:{"delete":"Delete",cancel:"Cancel"},label:{delete_confirm:"Delete?",loading:"Loading...",select:"Select a subtest"}},GpsRunView:{button:{clear:"Clear"},label:{good:"Good",ok:"Ok",poor:"Poor",meters:"meters",latitude:"Latitude",longitude:"Longitude",accuracy:"Accuracy",gps_status:"GPS Status",best_reading:"Best reading",current_reading:"Current reading"},message:{gps_ok:"GPS signal ok.",attempt:"Attempt #__count__",retrying:"Retrying...",searching:"Searching...",not_supported:"Your system does not support geolocations."}}}};
  "fr":{translation:{Tangerine:{message:{save_error:"Save error",saved:"Saved"},navigation:{button:{back:"Back"}},actions:{button:{save:"Save"}}},TabletManagerView:{message:{found:"__count__ tablettes trouvées.",detecting:"Veuillez patienter, detection de tablettes en cours...",searching:"Cherchant: __percentage__% Complété",confirm_pull:"À confirmer / __found__ tablettes trouvées. Commencer tirage des données?",pull_status:"Tirant dès __tabletCount__ tablettes.",pull_complete:"Tirage complète. Réussite chez __successful__ parmi __total__.",syncing:"Synchronisant / __done__ parmi __total__.",successful_count:"Réussite chez __successful__ parmi __total__."},label:{sync_complete:"Synchronisation complète."}},ResultsView:{label:{save_options:"Modalités d’enregistrement disponibles",advanced:"Avancé",pagination:"Résultats __start__-__end__ de __total__",cloud:"Serveur",csv:"CSV",tablets:"Tablettes",status:"État actuel",started:"Démarrée",results:"Résultats",details:"Détails",page:"Page",per_page:"par page"},button:{refresh:"Actualiser",detect:"Identifier possibilités"}},ResultSumView:{button:{resume:"Reprendre"},message:{no_results:"Pas encore de résultats !"}},SettingsView:{message:{warning:"Please be careful with the following settings."},help:{context:"Sets the general behavior and appearance of Tangerine. Do not change this setting.",language:"Contact a Tangerine admin for more information on what languages are currently available.",group_handle:"A human readable name. Only for display purposes. Any change here will not affect the address of the group or any internal functionality.",group_name:"The group connected to this instance of Tangerine, and any APKs made from this instance.",group_host:"The URL of the server.",upload_password:"The password for uploading to your group.",log_events:"app, ui, db, err"},label:{settings:"Settings",context:"Context",language:"Language",group_handle:"Group handle",group_name:"Group name",group_host:"Group host",upload_password:"Upload password",log_events:"Log events"}},AssessmentMenuView:{button:{"new":"Nouvelle","import":"Importer",apk:"APK",groups:"Groupes",universal_upload:"Envoi universel",sync_tablets:"Synchroniser tablettes",results:"Résultats",save:"Enregistrer",cancel:"Annuler"},label:{assessment:"Évaluation",assessments:"Évaluations",curriculum:"Programme"}},ResultView:{label:{assessment_complete:"Test complété",comments:"Commentaires à rajouter (facultatif)",subtests_completed:"Tâches complétées"},message:{saved:"Résultats Enregistrés",not_saved:" Pas encore enregistrés"},button:{save:"Enregistrer résultats",another:"Faire encore un test"}},GridRunView:{label:{input_mode:"Mode d'entrée",was_autostopped:"Arrêtée automatiquement",time_remaining:"Temps restant"},message:{touch_last_item:"Veuillez indiquer le dernier item tenté.",time_still_running:"Le compte à rebours continue.",subtest_not_complete:"Tâche incomplète.",autostop:"Auto-arrêt activé. Cessez la tâche.",autostop_cancel:"Auto-arrêt retiré. Continuez.",last_item_confirm:"Le dernier item était-il __item__?\n Confirmez avec Ok. Annulez pour mettre le crochet."},button:{restart:"Redémarrer",start:"Démarrer",stop:"Arrêter",mark:"Marquer",last_attempted:"Dernier item essayé",item_at_seconds:"Item à __seconds__ secondes"}},SubtestRunView:{button:{help:"Aide",skip:"Passer",next:"Prochaine",back:"Retour"}},DatetimeRunView:{label:{year:"Année",month:"Mois",day:"Jour",time:"Heure"}},ConsentRunView:{label:{default_consent_prompt:"Consentement obtenu?",confirm_nonconsent:"Cliquer pour confirmer que le consentement n’a pas été obtenu."},button:{confirm:"Confirmer",yes_continue:"Oui, continuer",no_stop:"Non, arrêter"},message:{confirm:"Veuillez confirmer.",select:"Veuillez en sélectionner une."}},IdRunView:{label:{identifier:"Identifiant aléatoire"},button:{generate:"Générer"}},LocationRunView:{button:{clear:"Vider"},message:{please_select:"Veuillez sélectionner un(e) __levelName__",must_be_filled:"__levelName__ doit être rempli."}},SurveyRunView:{button:{next_question:"Prochaine question",previous_question:"Question précédente"},message:{please_answer:"Veuillez répondre à cette question.",not_enough:"L'élève n'a pas lu suffisamment de mots pour lui poser des questions de compréhension.",correct_errors:"Veuillez corriger les erreurs sur la page."}},NavigationView:{label:{teacher:"Enseignant",user:"Utilisateur",enumerator:"Énumérateur",student_id:"Identifiant de l'élève",version:"Version"},button:{logout:"Fermeture",account:"Compte",settings:"Paramètres"},help:{logo:"Aller à l'écran principal.",account:"Aller à l'écran de comptes."},message:{incomplete_main_screen:"Test incomplet. Continuer à l'écran principal?",incomplete_logout:"Test incomplet. Continuer à l'écran de fermeture?",logout_confirm:"Vous êtes sûr de vouloir fermer la session?"}},LoginView:{message:{error_password_incorrect:"Mot de passe incorrect.",error_password_empty:"Veuillez fournir un mot de passe.",error_name_empty:"Veuillez fournir un nom.",error_name_taken:"Nom déjà pris.",pass_mismatch:"Les mots de passe ne correspondent pas."},button:{sign_up:"Abonnement",login:"Ouverture"},label:{login:"Ouverture",sign_up:"Abonnement",teacher:"Nom d'enseignant",user:"Nom d'utilisateur",enumerator:"Nom d'énumérateur",password:"Mot de passe",password_confirm:"Confirmez le mot de passe"}},QuestionsEditListElementView:{help:{copy_to:"Copier vers","delete":"Éffacer",edit:"Modifier"},button:{"delete":"Éffacer",cancel:"Annuler"},label:{delete_confirm:"Éffacer?",loading:"Chargement en cours…",select:"Sélectionner une tâche"}},GpsRunView:{button:{clear:"Vider"},label:{good:"Bon",ok:"Okay",poor:"Mauvais",meters:"mètre",latitude:"Latitude",longitude:"Longitude",accuracy:"Exactitude",gps_status:"État GPS",best_reading:"Meilleure indication",current_reading:"Indication actuelle"},message:{gps_ok:"Signal GPS ok.",attempt:"Essai __count__",retrying:"Réessayant…",searching:"Cherchant…",not_supported:"Votre système n'est pas compatible avec la géolocalisation."}}}};

  i18n.init
    fallbackLng : "en-US"
    lng         : Tangerine.settings.get("language")
    resStore    : resources
  , (err, t) ->
    window.t = t

  tests = (dbName)->
    #    // async method takes an array of s of signature:
    #    // `function (cb) {}`
    #    // each function is called and `callback` is called when all
    #    // functions are done.
    #    // each function calls `cb` to signal completion
    #    // cb is called with error as the first arguments (if any)
    #    // Once all functions are completed (or upon err)
    #    // callback is called `callback(err)`
    async = (functions, callback) ->
      series(functions) ->
        callback = callback || () ->
        if !functions.length
          return callback()

        fn = functions.shift();
        fn.call(fn, (err)->
          if err
            callback(err)
            return
          series(functions)
        )
      series(functions)

    describe 'Should get the assessment', ()->
      this.timeout(10000);

      dbs = [];

      before( 'Setup Tangerine and Pouch',(done) ->
        this.$container = $("#view-test-container");
        this.$fixture = $("<div>", { id: "fixture" });
        this.timeout(5000);

        pouchName = dbName;
        dbs = [dbName];
        #    // create db
        Tangerine.db = new PouchDB(pouchName, {adapter: 'memory'}, (err) ->
          #          console.log("Before: Created Pouch: " + pouchName)
          if (err)
            console.log("Before: I got an error: " + err)
            return done(err)
          else
            return done()
        )
        Backbone.sync = BackbonePouch.sync
          db: Tangerine.db
          fetch: 'view'
          view: 'tangerine/byCollection'
          viewOptions:
            include_docs : true
      )

      after('Teardown Pouch', (done) ->
        console.log("after")
        this.$container.empty();
        delete this.$fixture;

        this.timeout(15000);
        pouchName = dbName;
        dbs = [dbName];

        result = Tangerine.db.destroy((er) ->
          ).then( (er) ->
            #            console.log("After: Destroyed db: " + JSON.stringify(result) + " er: " + JSON.stringify er)
            done()
          ).catch( (er) ->
            console.log("After: Problem destroying db: " + er)
            done(er)
          )
      )

      it('Populate pouch with Assessments', (done)->

        db = Tangerine.db
        db.get "initialized", (error, doc) ->

          #          return done() unless error

# Save views
          db.put(
            _id: "_design/tangerine"
            views:
              ##
              #        Used for replication.
              #        Will give one key for all documents associated with an assessment or curriculum.
              ##
              byDKey:
                map: ((doc) ->
                  return if doc.collection is "result"

                  if doc.curriculumId
                    id = doc.curriculumId
                    # Do not replicate klasses
                    return if doc.collection is "klass"
                  else
                    id = doc.assessmentId

                  emit id.substr(-5,5), null
                ).toString()

              byCollection:
                map : ( (doc) ->

                  return unless doc.collection

                  emit doc.collection, null

                  # Belongs to relationship
                  if doc.collection is 'subtest'
                    emit "subtest-#{doc.assessmentId}"

                  # Belongs to relationship
                  else if doc.collection is 'question'
                    emit "question-#{doc.subtestId}"

                  else if doc.collection is 'result'
                    result = _id : doc._id
                    doc.subtestData.forEach (subtest) ->
                      if subtest.prototype is "id" then result.participantId = subtest.data.participant_id
                      if subtest.prototype is "complete" then result.endTime = subtest.data.end_time
                    result.startTime = doc.start_time
                    emit "result-#{doc.assessmentId}", result

                ).toString()
          ).then ->

            Utils.loadDevelopmentPacks( (err) ->
              if (err)
                throw err
              else
                done()
            )

      )

      it('Should return the expected assessment', (done)->
        id = "5edd67d0-9579-6c8d-5bb5-03a33b4556a6"
        assessment = new Assessment "_id" : id
        assessment.deepFetch({
          error:(err) ->
            console.log "Catch Error: " + JSON.stringify err
            done(err)
          success: (record) ->
          #            console.log("assessment: " + JSON.stringify assessment)
            Tangerine.assessment = assessment
            expect(assessment.get("name")).to.equal('01. LTTP2 2015 - Student');
            done()
        })
        #        }).then( (assessment) ->
        #          Tangerine.assessment = assessment
        #          expect(assessment.name).to.equal('01. LTTP2 2015 - Student');
        #          done()
        #        ).catch( (err) ->
        #          console.log "Catch Error: " + JSON.stringify err
        #          done(err)
        #        )
      )

      it('Should make the view', (done)->
        this.$fixture.empty().appendTo(this.$container);
        id = "5edd67d0-9579-6c8d-5bb5-03a33b4556a6"
        assessment = new Assessment "_id" : id
        assessment.deepFetch({
          error: (err)->
            console.log "Catch Error: " + JSON.stringify err
            done(err)
          success: (record) ->
            #            console.log "assessment subtests: " + JSON.stringify(assessment.subtests)
            #            expect(assessment.get("name")).to.equal('01. LTTP2 2015 - Student');
            Tangerine.assessment = assessment
            #            console.log("assessment: " + JSON.stringify assessment.doc)
            viewOptions =
              model: assessment
              el: this.$fixture
            view = new AssessmentCompositeView viewOptions
            #            serializedData = view.serializeData();
            #            console.log("serializedData:" + JSON.stringify(serializedData))
            view.once("render", () ->
              #              console.log("view.$el.text():" + view.$el.text())
              expect(view.$el.text()).to.contain("01. LTTP2 2015 - Student");
            )
            view.render();
            done()
        })
      )

      it('Should contain a test transition comment, help text, and dialog', (done)->
        this.$fixture.empty().appendTo(this.$container);
        id = "5a6de214-b578-07c2-9349-41804d85bf2b"
        assessment = new Assessment "_id" : id
        assessment.deepFetch({
          error: (err)->
            console.log "Catch Error: " + JSON.stringify err
            done(err)
          success: (record) ->
            Tangerine.assessment = assessment
            viewOptions =
              model: assessment
              el: this.$fixture
            view = new AssessmentCompositeView viewOptions
            view.once("render", () ->
              view.once("render", () ->
                subtestHelpButton = (view.$el.find('button.subtest_help'))[0]
                $(subtestHelpButton).click()
                studentDialog = (view.$el.find('.student_dialog'))[0]
                enumeratorHelp = (view.$el.find('.enumerator_help'))[0]
                expect($(studentDialog).text()).to.contain("Here are some subtraction (take away) problems.")
                expect($(enumeratorHelp).text()).to.contain("Show the child the sheet in the student stimulus booklet as you read the instructions.")
                expect(view.$el.text()).to.contain("Test transition comment");
                done()
              )
              $((view.$el.find('.subtest-next'))[0]).click()
            )
            view.render();
        })
      )
      it('Should contain a test transition comment, the subtest should complete and then there should be another test transition comment', (done)->
        this.$fixture.empty().appendTo(this.$container);
        id = "11322a8a-0807-68b6-c469-37ecc571cbf0"
        assessment = new Assessment "_id" : id
        assessment.deepFetch({
          error: (err)->
            console.log "Catch Error: " + JSON.stringify err
            done(err)
          success: (record) ->
            Tangerine.assessment = assessment
            viewOptions =
              model: assessment
              el: this.$fixture
            view = new AssessmentCompositeView viewOptions
            view.once("render", () ->
              expect(view.$el.text()).to.contain("1. Test transition comment");
              view.once("render", () ->
                expect(view.$el.text()).to.contain("2. Test transition comment");
                done()
              )
              # Click through to the next subtest that we will actually test.
              startTimeButton = (view.$el.find('.start_time'))[0]
              $(startTimeButton).click()
              grid = (view.$el.find('button'))[0]
              gridButton = ($(grid).find('button'))[0]
              $(gridButton).click()
              setTimeout(() ->
                stopTimeButton = (view.$el.find('.stop_time'))[0]
                $(stopTimeButton).click()
                subTestNextButton = (view.$el.find('.subtest-next'))[0]
                $(subTestNextButton).click()
              , 1000)
# @todo Not nice ^ that we have to wait in our test. I think there is
# something in the code that does not allow start and stop in the
# same second.
            )
            view.render();
        })
      )

      it('Should hide questions that qualify to be not_asked according to Question.attribute.linkedGridScore', (done)->
        this.$fixture.empty().appendTo(this.$container);
        id = "3db976ef-6ca0-252d-e055-14a6d2555f84"
        assessment = new Assessment "_id" : id
        assessment.deepFetch({
          error: (err)->
            console.log "Catch Error: " + JSON.stringify err
            done(err)
          success: (record) ->
            Tangerine.assessment = assessment
            viewOptions =
              model: assessment
              el: this.$fixture
            view = new AssessmentCompositeView viewOptions
            view.once("render", () ->
              # Click through to the next subtest that we will actually test.
              startTimeButton = (view.$el.find('.start_time'))[0]
              $(startTimeButton).click()
              # grid = (view.$el.find('button'))[0]
              # gridButton = ($(grid).find('button'))[0]
              # $(gridButton).click()

              setTimeout(() ->
                # Stop the assessment.
                stopTimeButton = (view.$el.find('.stop_time'))[0]
                $(stopTimeButton).click()
                # Engage "Last attempted" selection mode.
                lastAttemptedButton = (view.$el.find( "div.button:contains('Last attempted')" ))[0]
                $(lastAttemptedButton).click()
                if (!$(lastAttemptedButton).hasClass('selected'))
                  # @todo This always happens in this test when it shouldn't.
                  console.log(lastAttemptedButton.outerHTML)
                # Click the "last attempted item"
                lastItem = view.$el.find('button[data-index="9"]')
                $(lastItem).click()
                if (!$(lastItem).hasClass('element_last'))
                  # @todo This also always happens when it shouldn't.
                  console.log($(lastItem).html())
                # Click through to the next subtest
                subTestNextButton = (view.$el.find('.subtest-next'))[0]
                $(subTestNextButton).click()
                # @todo Now check the next subtest, the second and third question should be hidden and then we should be able to click next without an error.
              , 1000)
            )
            view.render();
        })
      )

      it('Should default to one school if there is only one option', (done)->
        this.$fixture.empty().appendTo(this.$container);
        id = "5edd67d0-9579-6c8d-5bb5-03a33b4556a6"
        assessment = new Assessment "_id" : id
        assessment.deepFetch({
          error: (err)->
            console.log "Catch Error: " + JSON.stringify err
            done(err)
          success: (record) ->
            Tangerine.assessment = assessment
            viewOptions =
              model: assessment
              el: this.$fixture
            view = new AssessmentCompositeView viewOptions
            view.once("render", () ->
# This test will continue on the next render of a subtest.
              view.once("render", () ->
# Change level Zero.
                levelZero = view.$el.find('#level_0')
                $(levelZero[0]).val('Bong')
                $(levelZero[0]).trigger "change"
                # Change level One.
                levelOne = view.$el.find('#level_1')
                $(levelOne[0]).val('Zota')
                $(levelOne[0]).trigger "change"
                # Test level Two.
                levelTwo = view.$el.find('#level_2')
                expect($(levelTwo[0]).val()).to.equal('Gorpu Dolo Boi Elem.& Jr. High')
                done()
              )
              # Click through to the next subtest that we will actually test.
              buttons = view.$el.find('.subtest-next')
              $(buttons[0]).click()
            )
            view.render();
        })
      )


      it('Should resume assessment at the same place', (done)->
        this.timeout(30000)
        this.$fixture.empty().appendTo(this.$container);
        id = "5edd67d0-9579-6c8d-5bb5-03a33b4556a6"
        assessment = new Assessment "_id" : id
        assessment.deepFetch({
          error: (err)->
            console.log "Catch Error: " + JSON.stringify err
            done(err)
          success: (record) ->
            Tangerine.assessment = assessment
            viewOptions =
              model: assessment
              el: this.$fixture
            view = new AssessmentCompositeView viewOptions
            view.once("render", () ->
# This test will continue on the next render of a subtest.
              view.once("render", () ->
# Change level Zero.
                levelZero = view.$el.find('#level_0')
                $(levelZero[0]).val('Bong')
                $(levelZero[0]).trigger "change"
                # Change level One.
                levelOne = view.$el.find('#level_1')
                $(levelOne[0]).val('Zota')
                $(levelOne[0]).trigger "change"
                # Test level Two.
                levelTwo = view.$el.find('#level_2')
                expect($(levelTwo[0]).val()).to.equal('Gorpu Dolo Boi Elem.& Jr. High')
                view.once("render", ->
                  buttons = view.$el.find('.subtest-next')
                  $(buttons[0]).click()
                  resultId = view.result.id
                  assessmentId = view.assessment.id
                  elHtml = view.$el.html()
                  assessmentTwo = new Assessment "_id" : assessmentId
                  assessmentTwo.deepFetch({
                    success : ->
                      result = new Result "_id" : resultId
                      result.fetch
                        success: ->
                          view = new AssessmentCompositeView
                            assessment: assessmentTwo
                            result: result
                          view.once("render", () ->
                            if (elHtml == view.$el.html())
                              done()
                            else
                              throw "HTML of AssessmentCompositeView does not match up resume"
                          )
                          view.render()
                  })
                )
                buttons = view.$el.find('.subtest-next')
                $(buttons[0]).click()
              )
              buttons = view.$el.find('.subtest-next')
              $(buttons[0]).click()
            )
            view.render();
        })
      )

      it('Should contain a next question button', (done)->
#        this.timeout(200000);
        this.$fixture.empty().appendTo(this.$container);
        id = "af072ff9-e325-c518-7ecd-c04f5ed4ec00"
        assessment = new Assessment "_id" : id
        assessment.deepFetch({
          error: (err)->
            console.log "Catch Error: " + JSON.stringify err
            done(err)
          success: (record) ->
            viewOptions =
              assessment: assessment
              el: this.$fixture
            view = new AssessmentCompositeView viewOptions
            view.once("nextQuestionRendered", () ->
#            view.once("render:collection", () ->
#              console.log("view.$el.html(): " + view.$el.html())
              expect(view.$el.html()).to.contain("Next question");
              done()
            )
            view.render();
        })
      )


      it('Should pass to the Kiswahili page and display only the first question (focusmode)', (done)->
#        this.timeout(15000);
        this.$fixture.empty().appendTo(this.$container);
        id = "122a745b-e619-d4c0-29cd-3e9e27645632"
        assessment = new Assessment "_id" : id
        assessment.deepFetch({
          error: (err)->
            console.log "Catch Error: " + JSON.stringify err
            done(err)
          success: (record) ->
            Tangerine.assessment = assessment
            viewOptions =
              model: assessment
              el: this.$fixture
            view = new AssessmentCompositeView viewOptions
            view.once("render:collection", () ->
#            view.once("render:collection", () ->
#            view.once("dom:refresh", () ->
# This test will continue on the next render of a subtest.
#              view.once("render", () ->
              view.once("render:collection", () ->
# Change level Zero.
                levelZero = view.$el.find('#level_0')
                $(levelZero[0]).val('Arusha')
                $(levelZero[0]).trigger "change"
                # Change level One.
                levelOne = view.$el.find('#level_1')
                $(levelOne[0]).val('ARUSHA')
                $(levelOne[0]).trigger "change"
                # Test level Two.
                levelTwo = view.$el.find('#level_2')
                #                expect($(levelTwo[0]).val()).to.equal('Gorpu Dolo Boi Elem.& Jr. High')
                $(levelTwo[0]).val('OLDONYOSAPUK PR. SCHOOL')
                $(levelTwo[0]).trigger "change"
                #                done()
                #                console.log("view.$el.html(): " + view.$el.html())
                console.log("Test Should display the School Selection< page - view.$el.html(): " + view.$el.html())
                view.once("render:collection", () ->
#                  console.log("Test display the Ulichoona/ Classroom Observation page - view.$el.html(): " + view.$el.html())
#                  buttons = view.$el.find('.subtest-next')
#                  $(buttons[0]).click()
#                  expect(view.$el.html()).to.contain("When you are ready to begin observing, press 'Kiswahili' below.");
                  renderObservation = ->
                    console.log("Test Should pass to Ulichoona/ Classroom Observation page - view.$el.html(): " + view.$el.html())
                    expect(view.$el.html()).to.contain("Kiswahili");
                    renderKiswahili = ->
                      console.log("Test Should pass to Classroom Observation (Kiswahili) (2016) page - view.$el.html(): " + view.$el.html())
#                      expect(view.$el.html()).to.contain("Kiswahili");
#                      expect(view.$el.find('#question-lesson_content_first').css('display')).to.eq('block');
                      lessoncContentFirst = view.$el.find('#question-lesson_content_first')
                      if typeof lessoncContentFirst != 'undefined' && lessoncContentFirst != null
                        if typeof lessoncContentFirst.css('display') != 'undefined' && lessoncContentFirst.css('display') != null
                          expect(lessoncContentFirst.css('display')).to.eq('block');
                      reading = view.$el.find('#question-reading')
                      if typeof reading != 'undefined' && reading != null
                        console.log("reading: " + reading)
                        if typeof reading.css('display') != 'undefined' && reading.css('display') != null
                          expect(reading.css('display')).to.eq('none');
                      done()
                    buttons = view.$el.find('.button.left')
                    $(buttons[0]).click()
                    buttons = view.$el.find('.subtest-next')
                    $(buttons[0]).click()
                    setTimeout(renderKiswahili, 2000)
                  setTimeout(renderObservation, 1000)
                )
                buttons = view.$el.find('.subtest-next')
                $(buttons[0]).click()
              )
              # Click through to the next subtest that we will actually test.
              buttons = view.$el.find('.subtest-next')
              $(buttons[0]).click()
            )
            view.render();
        })
      )


#      it('Should skip to Subtask 3', (done)->
#        this.timeout(30000)
#        this.$fixture.empty().appendTo(this.$container);
#        id = "1dbda94c-b80d-d1ce-ea37-6ca20854d8c9"
#        assessment = new Assessment "_id" : id
#        assessment.deepFetch({
#          error: (err)->
#            console.log "Catch Error: " + JSON.stringify err
#            done(err)
#          success: (record) ->
#            Tangerine.assessment = assessment
#            viewOptions =
#              model: assessment
#              el: this.$fixture
#            view = new AssessmentCompositeView viewOptions
#            view.once("render", () ->
## This test will continue on the next render of a subtest.
#              view.once("render", () ->
## Change level Zero.
#                levelZero = view.$el.find('#level_0')
##                $(levelZero[0]).val('Bong')
##                expect($(levelTwo[0]).val()).to.equal('Gorpu Dolo Boi Elem.& Jr. High')
#                view.once("render", ->
##                  buttons = view.$el.find('.subtest-next')
##                  $(buttons[0]).click()
##                  resultId = view.result.id
##                  assessmentId = view.assessment.id
##                  elHtml = view.$el.html()
##                  assessmentTwo = new Assessment "_id" : assessmentId
##                  assessmentTwo.deepFetch({
##                    success : ->
##                      result = new Result "_id" : resultId
##                      result.fetch
##                        success: ->
##                          view = new AssessmentCompositeView
##                            assessment: assessmentTwo
##                            result: result
##                          view.once("render", () ->
##                            if (elHtml == view.$el.html())
#                              done()
##                            else
##                              throw "HTML of AssessmentCompositeView does not match up resume"
##                          )
##                          view.render()
##                  })
#                )
#                buttons = view.$el.find('.subtest-next')
#                $(buttons[0]).click()
#              )
#              buttons = view.$el.find('.subtest-next')
#              $(buttons[0]).click()
#            )
#            view.render();
#        })
#      )


#      it('Should download the assessment config', (done)->
#        this.$fixture.empty().appendTo(this.$container);
#        T_ADMIN="username"
#        T_PASS="password"
#        group = "sweet_tree"
#        success = () ->
#          console.log("It's all good")
#          done()
#        error = (message) ->
#          console.log("Error: " + message)
#        assessments = Utils.getAssessments(T_ADMIN, T_PASS, group, success, error)
#      )

  dbs.split(',').forEach((db) ->
    # dbType = /^http/.test(db) ? 'http' : 'local'
    tests db
  )

)()

