(function() {
  'use strict';
  var dbs, resources, tests;
  if (Mocha.process.browser) {
    dbs = 'testdb' + Math.random();
  } else {
    dbs = Mocha.process.env.TEST_DB;
  }
  Backbone.history.start();
  Tangerine.addRegions({
    siteNav: "#siteNav"
  });
  Tangerine.addRegions({
    mainRegion: "#content"
  });
  Tangerine.addRegions({
    dashboardRegion: "#dashboard"
  });
  Backbone.Model.prototype.idAttribute = '_id';
  resources = {
    "en-US": {
      translation: {
        Tangerine: {
          message: {
            save_error: "Save error",
            saved: "Saved"
          },
          navigation: {
            button: {
              back: "Back"
            }
          },
          actions: {
            button: {
              save: "Save"
            }
          }
        },
        TabletManagerView: {
          message: {
            found: "__count__ tablets found.",
            detecting: "Please wait, detecting tablets...",
            searching: "Searching. __percentage__% complete.",
            confirm_pull: "Confirm __found__ tablets found. Start data pull?",
            pull_status: "Pulling from __tabletCount__ tablets.",
            pull_complete: "Pull finished. <br>__successful__ out of __total__ successful.",
            syncing: "Syncing: <br>__done__ out of __total__.",
            successful_count: "__successful__ out of  __total__ succesful."
          },
          label: {
            sync_complete: "Sync Complete"
          }
        },
        ResultsView: {
          label: {
            save_options: "Save options",
            advanced: "Advanced",
            pagination: "__start__-__end__ of __total__",
            cloud: "Cloud",
            csv: "CSV",
            tablets: "Tablets",
            status: "Status",
            started: "Started",
            results: "Results",
            details: "Details",
            page: "Page",
            per_page: "per page"
          },
          button: {
            refresh: "Refresh",
            detect: "Detect options"
          }
        },
        ResultSumView: {
          button: {
            resume: "Resume"
          },
          message: {
            no_results: "No results yet!"
          }
        },
        SettingsView: {
          message: {
            warning: "Please be careful with the following settings."
          },
          help: {
            context: "Sets the general behavior and appearance of Tangerine. Do not change this setting.",
            language: "Contact a Tangerine admin for more information on what languages are currently available.",
            group_handle: "A human readable name. Only for display purposes. Any change here will not affect the address of the group or any internal functionality.",
            group_name: "The group connected to this instance of Tangerine, and any APKs made from this instance.",
            group_host: "The URL of the server.",
            upload_password: "The password for uploading to your group.",
            log_events: "app, ui, db, err"
          },
          label: {
            settings: "Settings",
            context: "Context",
            language: "Language",
            group_handle: "Group handle",
            group_name: "Group name",
            group_host: "Group host",
            upload_password: "Upload password",
            log_events: "Log events"
          }
        },
        ResultView: {
          label: {
            assessment_complete: "Assessment complete",
            comments: "Additional comments (optional)",
            subtests_completed: "Subtests completed"
          },
          message: {
            saved: "Result saved",
            not_saved: "Not saved yet"
          },
          button: {
            save: "Save result",
            another: "Perform another assessment"
          }
        },
        AssessmentMenuView: {
          button: {
            "new": "New",
            "import": "Import",
            apk: "APK",
            groups: "Groups",
            universal_upload: "Universal Upload",
            sync_tablets: "Sync tablets",
            results: "Results",
            save: "Save",
            cancel: "Cancel"
          },
          label: {
            assessment: "Assessment",
            assessments: "Assessments",
            curriculum: "Curriculum"
          }
        },
        GridRunView: {
          label: {
            input_mode: "Input Mode",
            was_autostopped: "Was autostopped",
            time_remaining: "Time remaining"
          },
          message: {
            touch_last_item: "Please touch last item read.",
            time_still_running: "Time still running.",
            subtest_not_complete: "Subtest not complete.",
            autostop: "Autostop activated. Discontinue test.",
            autostop_cancel: "Autostop removed. Continue.",
            last_item_confirm: 'Was the last item "__item__"?\nOk to confirm. Cancel to place bracket.'
          },
          button: {
            restart: "Restart",
            start: "Start",
            stop: "Stop",
            mark: "Mark",
            last_attempted: "Last attempted",
            item_at_seconds: "Item at __seconds__ seconds"
          }
        },
        SubtestRunView: {
          button: {
            help: "Help",
            skip: "Skip",
            next: "Next",
            back: "Back"
          }
        },
        DatetimeRunView: {
          label: {
            year: "Year",
            month: "Month",
            day: "Day",
            time: "Time"
          }
        },
        ConsentRunView: {
          label: {
            default_consent_prompt: "Does the child consent?",
            confirm_nonconsent: "Click to confirm consent not obtained."
          },
          button: {
            confirm: "Confirm",
            yes_continue: "Yes, continue",
            no_stop: "No, stop"
          },
          message: {
            confirm: "Please confirm.",
            select: "Please select one."
          }
        },
        IdRunView: {
          label: {
            identifier: "Random identifier"
          },
          button: {
            generate: "Generate"
          }
        },
        LocationRunView: {
          button: {
            clear: "Clear"
          },
          message: {
            must_be_filled: "__levelName__ must be filled.",
            please_select: "Please select a(n) __levelName__"
          }
        },
        SurveyRunView: {
          button: {
            next_question: "Next question",
            previous_question: "Previous question"
          },
          message: {
            please_answer: "Please answer this question.",
            not_enough: "Student did not read enough words to ask comprehension questions.",
            correct_errors: "Please correct the errors on this page."
          }
        },
        NavigationView: {
          label: {
            teacher: "Teacher",
            user: "User",
            enumerator: "Enumerator",
            student_id: "Student ID",
            version: "Version"
          },
          button: {
            logout: "Logout",
            account: "Account",
            settings: "Settings"
          },
          help: {
            logo: "Go to main screen.",
            account: "Go to account screen."
          },
          message: {
            incomplete_main_screen: "Assessment not finished. Continue to main screen?",
            incomplete_logout: "Assessment not finished. Continue to logout?",
            logout_confirm: "Are you sure you want to logout?"
          }
        },
        LoginView: {
          message: {
            error_password_incorrect: "Incorrect password.",
            error_password_empty: "Please enter a password.",
            error_name_empty: "Please enter a name.",
            error_name_taken: "Name already taken.",
            pass_mismatch: "Passwords do not match"
          },
          button: {
            sign_up: "Sign up",
            login: "Login",
            logout: "Logout"
          },
          label: {
            login: "Login",
            sign_up: "Sign up",
            teacher: "Teacher name",
            user: "User name",
            enumerator: "Enumerator name",
            password: "Password",
            password_confirm: "Confirm Password"
          }
        },
        QuestionsEditListElementView: {
          help: {
            copy_to: "Copy to",
            "delete": "Delete",
            edit: "Edit"
          },
          button: {
            "delete": "Delete",
            cancel: "Cancel"
          },
          label: {
            delete_confirm: "Delete?",
            loading: "Loading...",
            select: "Select a subtest"
          }
        },
        GpsRunView: {
          button: {
            clear: "Clear"
          },
          label: {
            good: "Good",
            ok: "Ok",
            poor: "Poor",
            meters: "meters",
            latitude: "Latitude",
            longitude: "Longitude",
            accuracy: "Accuracy",
            gps_status: "GPS Status",
            best_reading: "Best reading",
            current_reading: "Current reading"
          },
          message: {
            gps_ok: "GPS signal ok.",
            attempt: "Attempt #__count__",
            retrying: "Retrying...",
            searching: "Searching...",
            not_supported: "Your system does not support geolocations."
          }
        }
      }
    }
  };
  ({
    "fr": {
      translation: {
        Tangerine: {
          message: {
            save_error: "Save error",
            saved: "Saved"
          },
          navigation: {
            button: {
              back: "Back"
            }
          },
          actions: {
            button: {
              save: "Save"
            }
          }
        },
        TabletManagerView: {
          message: {
            found: "__count__ tablettes trouvées.",
            detecting: "Veuillez patienter, detection de tablettes en cours...",
            searching: "Cherchant: __percentage__% Complété",
            confirm_pull: "À confirmer / __found__ tablettes trouvées. Commencer tirage des données?",
            pull_status: "Tirant dès __tabletCount__ tablettes.",
            pull_complete: "Tirage complète. Réussite chez __successful__ parmi __total__.",
            syncing: "Synchronisant / __done__ parmi __total__.",
            successful_count: "Réussite chez __successful__ parmi __total__."
          },
          label: {
            sync_complete: "Synchronisation complète."
          }
        },
        ResultsView: {
          label: {
            save_options: "Modalités d’enregistrement disponibles",
            advanced: "Avancé",
            pagination: "Résultats __start__-__end__ de __total__",
            cloud: "Serveur",
            csv: "CSV",
            tablets: "Tablettes",
            status: "État actuel",
            started: "Démarrée",
            results: "Résultats",
            details: "Détails",
            page: "Page",
            per_page: "par page"
          },
          button: {
            refresh: "Actualiser",
            detect: "Identifier possibilités"
          }
        },
        ResultSumView: {
          button: {
            resume: "Reprendre"
          },
          message: {
            no_results: "Pas encore de résultats !"
          }
        },
        SettingsView: {
          message: {
            warning: "Please be careful with the following settings."
          },
          help: {
            context: "Sets the general behavior and appearance of Tangerine. Do not change this setting.",
            language: "Contact a Tangerine admin for more information on what languages are currently available.",
            group_handle: "A human readable name. Only for display purposes. Any change here will not affect the address of the group or any internal functionality.",
            group_name: "The group connected to this instance of Tangerine, and any APKs made from this instance.",
            group_host: "The URL of the server.",
            upload_password: "The password for uploading to your group.",
            log_events: "app, ui, db, err"
          },
          label: {
            settings: "Settings",
            context: "Context",
            language: "Language",
            group_handle: "Group handle",
            group_name: "Group name",
            group_host: "Group host",
            upload_password: "Upload password",
            log_events: "Log events"
          }
        },
        AssessmentMenuView: {
          button: {
            "new": "Nouvelle",
            "import": "Importer",
            apk: "APK",
            groups: "Groupes",
            universal_upload: "Envoi universel",
            sync_tablets: "Synchroniser tablettes",
            results: "Résultats",
            save: "Enregistrer",
            cancel: "Annuler"
          },
          label: {
            assessment: "Évaluation",
            assessments: "Évaluations",
            curriculum: "Programme"
          }
        },
        ResultView: {
          label: {
            assessment_complete: "Test complété",
            comments: "Commentaires à rajouter (facultatif)",
            subtests_completed: "Tâches complétées"
          },
          message: {
            saved: "Résultats Enregistrés",
            not_saved: " Pas encore enregistrés"
          },
          button: {
            save: "Enregistrer résultats",
            another: "Faire encore un test"
          }
        },
        GridRunView: {
          label: {
            input_mode: "Mode d'entrée",
            was_autostopped: "Arrêtée automatiquement",
            time_remaining: "Temps restant"
          },
          message: {
            touch_last_item: "Veuillez indiquer le dernier item tenté.",
            time_still_running: "Le compte à rebours continue.",
            subtest_not_complete: "Tâche incomplète.",
            autostop: "Auto-arrêt activé. Cessez la tâche.",
            autostop_cancel: "Auto-arrêt retiré. Continuez.",
            last_item_confirm: "Le dernier item était-il __item__?\n Confirmez avec Ok. Annulez pour mettre le crochet."
          },
          button: {
            restart: "Redémarrer",
            start: "Démarrer",
            stop: "Arrêter",
            mark: "Marquer",
            last_attempted: "Dernier item essayé",
            item_at_seconds: "Item à __seconds__ secondes"
          }
        },
        SubtestRunView: {
          button: {
            help: "Aide",
            skip: "Passer",
            next: "Prochaine",
            back: "Retour"
          }
        },
        DatetimeRunView: {
          label: {
            year: "Année",
            month: "Mois",
            day: "Jour",
            time: "Heure"
          }
        },
        ConsentRunView: {
          label: {
            default_consent_prompt: "Consentement obtenu?",
            confirm_nonconsent: "Cliquer pour confirmer que le consentement n’a pas été obtenu."
          },
          button: {
            confirm: "Confirmer",
            yes_continue: "Oui, continuer",
            no_stop: "Non, arrêter"
          },
          message: {
            confirm: "Veuillez confirmer.",
            select: "Veuillez en sélectionner une."
          }
        },
        IdRunView: {
          label: {
            identifier: "Identifiant aléatoire"
          },
          button: {
            generate: "Générer"
          }
        },
        LocationRunView: {
          button: {
            clear: "Vider"
          },
          message: {
            please_select: "Veuillez sélectionner un(e) __levelName__",
            must_be_filled: "__levelName__ doit être rempli."
          }
        },
        SurveyRunView: {
          button: {
            next_question: "Prochaine question",
            previous_question: "Question précédente"
          },
          message: {
            please_answer: "Veuillez répondre à cette question.",
            not_enough: "L'élève n'a pas lu suffisamment de mots pour lui poser des questions de compréhension.",
            correct_errors: "Veuillez corriger les erreurs sur la page."
          }
        },
        NavigationView: {
          label: {
            teacher: "Enseignant",
            user: "Utilisateur",
            enumerator: "Énumérateur",
            student_id: "Identifiant de l'élève",
            version: "Version"
          },
          button: {
            logout: "Fermeture",
            account: "Compte",
            settings: "Paramètres"
          },
          help: {
            logo: "Aller à l'écran principal.",
            account: "Aller à l'écran de comptes."
          },
          message: {
            incomplete_main_screen: "Test incomplet. Continuer à l'écran principal?",
            incomplete_logout: "Test incomplet. Continuer à l'écran de fermeture?",
            logout_confirm: "Vous êtes sûr de vouloir fermer la session?"
          }
        },
        LoginView: {
          message: {
            error_password_incorrect: "Mot de passe incorrect.",
            error_password_empty: "Veuillez fournir un mot de passe.",
            error_name_empty: "Veuillez fournir un nom.",
            error_name_taken: "Nom déjà pris.",
            pass_mismatch: "Les mots de passe ne correspondent pas."
          },
          button: {
            sign_up: "Abonnement",
            login: "Ouverture"
          },
          label: {
            login: "Ouverture",
            sign_up: "Abonnement",
            teacher: "Nom d'enseignant",
            user: "Nom d'utilisateur",
            enumerator: "Nom d'énumérateur",
            password: "Mot de passe",
            password_confirm: "Confirmez le mot de passe"
          }
        },
        QuestionsEditListElementView: {
          help: {
            copy_to: "Copier vers",
            "delete": "Éffacer",
            edit: "Modifier"
          },
          button: {
            "delete": "Éffacer",
            cancel: "Annuler"
          },
          label: {
            delete_confirm: "Éffacer?",
            loading: "Chargement en cours…",
            select: "Sélectionner une tâche"
          }
        },
        GpsRunView: {
          button: {
            clear: "Vider"
          },
          label: {
            good: "Bon",
            ok: "Okay",
            poor: "Mauvais",
            meters: "mètre",
            latitude: "Latitude",
            longitude: "Longitude",
            accuracy: "Exactitude",
            gps_status: "État GPS",
            best_reading: "Meilleure indication",
            current_reading: "Indication actuelle"
          },
          message: {
            gps_ok: "Signal GPS ok.",
            attempt: "Essai __count__",
            retrying: "Réessayant…",
            searching: "Cherchant…",
            not_supported: "Votre système n'est pas compatible avec la géolocalisation."
          }
        }
      }
    }
  });
  i18n.init({
    fallbackLng: "en-US",
    lng: Tangerine.settings.get("language"),
    resStore: resources
  }, function(err, t) {
    return window.t = t;
  });
  tests = function(dbName) {
    var async;
    async = function(functions, callback) {
      series(functions)(function() {
        var fn;
        callback = callback || function() {};
        if (!functions.length) {
          return callback();
        }
        fn = functions.shift();
        return fn.call(fn, function(err) {
          if (err) {
            callback(err);
            return;
          }
          return series(functions);
        });
      });
      return series(functions);
    };
    return describe('Tangerine Tests', function() {
      this.timeout(10000);
      dbs = [];
      before('Setup Tangerine and Pouch', function(done) {
        var pouchName;
        this.$container = $("#view-test-container");
        this.$fixture = $("<div>", {
          id: "fixture"
        });
        this.timeout(5000);
        pouchName = dbName;
        dbs = [dbName];
        Tangerine.db = new PouchDB(pouchName, {
          adapter: 'memory'
        }, function(err) {
          if (err) {
            console.log("Before: I got an error: " + err);
            return done(err);
          } else {
            return done();
          }
        });
        return Backbone.sync = BackbonePouch.sync({
          db: Tangerine.db,
          fetch: 'view',
          view: 'tangerine/byCollection',
          viewOptions: {
            include_docs: true
          }
        });
      });
      after('Teardown Pouch', function(done) {
        var pouchName, result;
        console.log("after");
        this.$container.empty();
        delete this.$fixture;
        this.timeout(15000);
        pouchName = dbName;
        dbs = [dbName];
        return result = Tangerine.db.destroy(function(er) {}).then(function(er) {
          return done();
        })["catch"](function(er) {
          console.log("After: Problem destroying db: " + er);
          return done(er);
        });
      });
      it('Populate pouch with Assessments', function(done) {
        var db;
        db = Tangerine.db;
        return db.get("initialized", function(error, doc) {
          return db.put({
            _id: "_design/tangerine",
            views: {
              byDKey: {
                map: (function(doc) {
                  var id;
                  if (doc.collection === "result") {
                    return;
                  }
                  if (doc.curriculumId) {
                    id = doc.curriculumId;
                    if (doc.collection === "klass") {
                      return;
                    }
                  } else {
                    id = doc.assessmentId;
                  }
                  return emit(id.substr(-5, 5), null);
                }).toString()
              },
              byCollection: {
                map: (function(doc) {
                  var result;
                  if (!doc.collection) {
                    return;
                  }
                  emit(doc.collection, null);
                  if (doc.collection === 'subtest') {
                    return emit("subtest-" + doc.assessmentId);
                  } else if (doc.collection === 'question') {
                    return emit("question-" + doc.subtestId);
                  } else if (doc.collection === 'result') {
                    result = {
                      _id: doc._id
                    };
                    doc.subtestData.forEach(function(subtest) {
                      if (subtest.prototype === "id") {
                        result.participantId = subtest.data.participant_id;
                      }
                      if (subtest.prototype === "complete") {
                        return result.endTime = subtest.data.end_time;
                      }
                    });
                    result.startTime = doc.start_time;
                    return emit("result-" + doc.assessmentId, result);
                  }
                }).toString()
              }
            }
          }).then(function() {
            return Utils.loadDevelopmentPacks(function(err) {
              if (err) {
                throw err;
              } else {
                return done();
              }
            });
          });
        });
      });
      it('Should return the expected assessment', function(done) {
        var assessment, id;
        id = "5edd67d0-9579-6c8d-5bb5-03a33b4556a6";
        assessment = new Assessment({
          "_id": id
        });
        return assessment.deepFetch({
          error: function(err) {
            console.log("Catch Error: " + JSON.stringify(err));
            return done(err);
          },
          success: function(record) {
            Tangerine.assessment = assessment;
            expect(assessment.get("name")).to.equal('01. LTTP2 2015 - Student');
            return done();
          }
        });
      });
      it('Should make the view', function(done) {
        var assessment, id;
        this.$fixture.empty().appendTo(this.$container);
        id = "5edd67d0-9579-6c8d-5bb5-03a33b4556a6";
        assessment = new Assessment({
          "_id": id
        });
        return assessment.deepFetch({
          error: function(err) {
            console.log("Catch Error: " + JSON.stringify(err));
            return done(err);
          },
          success: function(record) {
            var view, viewOptions;
            Tangerine.assessment = assessment;
            viewOptions = {
              model: assessment,
              el: this.$fixture
            };
            view = new AssessmentCompositeView(viewOptions);
            view.once("render", function() {
              return expect(view.$el.text()).to.contain("01. LTTP2 2015 - Student");
            });
            view.render();
            return done();
          }
        });
      });
      it('Should contain a test transition comment, help text, and dialog', function(done) {
        var assessment, id;
        this.$fixture.empty().appendTo(this.$container);
        id = "5a6de214-b578-07c2-9349-41804d85bf2b";
        assessment = new Assessment({
          "_id": id
        });
        return assessment.deepFetch({
          error: function(err) {
            console.log("Catch Error: " + JSON.stringify(err));
            return done(err);
          },
          success: function(record) {
            var view, viewOptions;
            Tangerine.assessment = assessment;
            viewOptions = {
              model: assessment,
              el: this.$fixture
            };
            view = new AssessmentCompositeView(viewOptions);
            view.once("render", function() {
              view.once("render", function() {
                var enumeratorHelp, studentDialog, subtestHelpButton;
                subtestHelpButton = (view.$el.find('button.subtest_help'))[0];
                $(subtestHelpButton).click();
                studentDialog = (view.$el.find('.student_dialog'))[0];
                enumeratorHelp = (view.$el.find('.enumerator_help'))[0];
                expect($(studentDialog).text()).to.contain("Here are some subtraction (take away) problems.");
                expect($(enumeratorHelp).text()).to.contain("Show the child the sheet in the student stimulus booklet as you read the instructions.");
                expect(view.$el.text()).to.contain("Test transition comment");
                return done();
              });
              return $((view.$el.find('.subtest-next'))[0]).click();
            });
            return view.render();
          }
        });
      });
      it('Should contain a test transition comment, the subtest should complete and then there should be another test transition comment', function(done) {
        var assessment, id;
        this.$fixture.empty().appendTo(this.$container);
        id = "11322a8a-0807-68b6-c469-37ecc571cbf0";
        assessment = new Assessment({
          "_id": id
        });
        return assessment.deepFetch({
          error: function(err) {
            console.log("Catch Error: " + JSON.stringify(err));
            return done(err);
          },
          success: function(record) {
            var view, viewOptions;
            Tangerine.assessment = assessment;
            viewOptions = {
              model: assessment,
              el: this.$fixture
            };
            view = new AssessmentCompositeView(viewOptions);
            view.once("render", function() {
              var grid, gridButton, startTimeButton;
              expect(view.$el.text()).to.contain("1. Test transition comment");
              view.once("render", function() {
                expect(view.$el.text()).to.contain("2. Test transition comment");
                return done();
              });
              startTimeButton = (view.$el.find('.start_time'))[0];
              $(startTimeButton).click();
              grid = (view.$el.find('button'))[0];
              gridButton = ($(grid).find('button'))[0];
              $(gridButton).click();
              return setTimeout(function() {
                var stopTimeButton, subTestNextButton;
                stopTimeButton = (view.$el.find('.stop_time'))[0];
                $(stopTimeButton).click();
                subTestNextButton = (view.$el.find('.subtest-next'))[0];
                return $(subTestNextButton).click();
              }, 1000);
            });
            return view.render();
          }
        });
      });
      it('Should default to one school if there is only one option', function(done) {
        var assessment, id;
        this.$fixture.empty().appendTo(this.$container);
        id = "5edd67d0-9579-6c8d-5bb5-03a33b4556a6";
        assessment = new Assessment({
          "_id": id
        });
        return assessment.deepFetch({
          error: function(err) {
            console.log("Catch Error: " + JSON.stringify(err));
            return done(err);
          },
          success: function(record) {
            var view, viewOptions;
            Tangerine.assessment = assessment;
            viewOptions = {
              model: assessment,
              el: this.$fixture
            };
            view = new AssessmentCompositeView(viewOptions);
            view.once("render", function() {
              var buttons;
              view.once("render", function() {
                var levelOne, levelTwo, levelZero;
                levelZero = view.$el.find('#level_0');
                $(levelZero[0]).val('Bong');
                $(levelZero[0]).trigger("change");
                levelOne = view.$el.find('#level_1');
                $(levelOne[0]).val('Zota');
                $(levelOne[0]).trigger("change");
                levelTwo = view.$el.find('#level_2');
                expect($(levelTwo[0][1]).val()).to.equal('Gorpu Dolo Boi Elem.& Jr. High');
                expect($(levelTwo[0][0]).context.disabled).to.equal(true);
                return done();
              });
              buttons = view.$el.find('.subtest-next');
              return $(buttons[0]).click();
            });
            return view.render();
          }
        });
      });
      it('Should resume assessment at the same place', function(done) {
        var assessment, id;
        this.timeout(10000);
        this.$fixture.empty().appendTo(this.$container);
        id = "5edd67d0-9579-6c8d-5bb5-03a33b4556a6";
        assessment = new Assessment({
          "_id": id
        });
        return assessment.deepFetch({
          error: function(err) {
            console.log("Catch Error: " + JSON.stringify(err));
            return done(err);
          },
          success: function(record) {
            var view, viewOptions;
            Tangerine.assessment = assessment;
            viewOptions = {
              model: assessment,
              el: this.$fixture
            };
            view = new AssessmentCompositeView(viewOptions);
            view.once("render", function() {
              var buttons;
              view.once("render", function() {
                var buttons, levelOne, levelTwo, levelZero;
                levelZero = view.$el.find('#level_0');
                $(levelZero[0]).val('Bong');
                $(levelZero[0]).trigger("change");
                levelOne = view.$el.find('#level_1');
                $(levelOne[0]).val('Zota');
                $(levelOne[0]).trigger("change");
                levelTwo = view.$el.find('#level_2');
                $(levelTwo[0]).val('Gorpu Dolo Boi Elem.& Jr. High');
                $(levelTwo[0]).trigger("change");
                view.once("render", function() {
                  var assessmentId, assessmentTwo, buttons, elHtml, resultId;
                  buttons = view.$el.find('.subtest-next');
                  $(buttons[0]).click();
                  resultId = view.result.id;
                  assessmentId = view.assessment.id;
                  elHtml = view.$el.html();
                  assessmentTwo = new Assessment({
                    "_id": assessmentId
                  });
                  return assessmentTwo.deepFetch({
                    success: function() {
                      var result;
                      result = new Result({
                        "_id": resultId
                      });
                      return result.fetch({
                        success: function() {
                          view = new AssessmentCompositeView({
                            assessment: assessmentTwo,
                            result: result
                          });
                          view.once("render", function() {
                            if (elHtml === view.$el.html()) {
                              return done();
                            } else {
                              throw "HTML of AssessmentCompositeView does not match up resume";
                            }
                          });
                          return view.render();
                        }
                      });
                    }
                  });
                });
                buttons = view.$el.find('.subtest-next');
                return $(buttons[0]).click();
              });
              buttons = view.$el.find('.subtest-next');
              return $(buttons[0]).click();
            });
            return view.render();
          }
        });
      });
      it('Should contain a next question button', function(done) {
        var assessment, id;
        this.$fixture.empty().appendTo(this.$container);
        id = "af072ff9-e325-c518-7ecd-c04f5ed4ec00";
        assessment = new Assessment({
          "_id": id
        });
        return assessment.deepFetch({
          error: function(err) {
            console.log("Catch Error: " + JSON.stringify(err));
            return done(err);
          },
          success: function(record) {
            var view, viewOptions;
            viewOptions = {
              assessment: assessment,
              el: this.$fixture
            };
            view = new AssessmentCompositeView(viewOptions);
            view.once("nextQuestionRendered", function() {
              expect(view.$el.html()).to.contain("Next question");
              return done();
            });
            return view.render();
          }
        });
      });
      return it('Should pass to the Kiswahili page and display only the first question (focusmode)', function(done) {
        var assessment, id;
        this.$fixture.empty().appendTo(this.$container);
        id = "122a745b-e619-d4c0-29cd-3e9e27645632";
        assessment = new Assessment({
          "_id": id
        });
        return assessment.deepFetch({
          error: function(err) {
            console.log("Catch Error: " + JSON.stringify(err));
            return done(err);
          },
          success: function(record) {
            var view, viewOptions;
            Tangerine.assessment = assessment;
            viewOptions = {
              model: assessment,
              el: this.$fixture
            };
            view = new AssessmentCompositeView(viewOptions);
            view.once("render", function() {
              var buttons;
              view.once("render:collection", function() {
                var buttons, levelOne, levelTwo, levelZero;
                levelZero = view.$el.find('#level_0');
                $(levelZero[0]).val('Arusha');
                $(levelZero[0]).trigger("change");
                levelOne = view.$el.find('#level_1');
                $(levelOne[0]).val('ARUSHA');
                $(levelOne[0]).trigger("change");
                levelTwo = view.$el.find('#level_2');
                $(levelTwo[0]).val('OLDONYOSAPUK PR. SCHOOL');
                $(levelTwo[0]).trigger("change");
                console.log("Test Should display the School Selection< page - view.$el.html(): " + view.$el.html());
                view.once("render:collection", function() {
                  var renderObservation;
                  renderObservation = function() {
                    var buttons, renderKiswahili;
                    console.log("Test Should pass to Ulichoona/ Classroom Observation page - view.$el.html(): " + view.$el.html());
                    expect(view.$el.html()).to.contain("Kiswahili");
                    renderKiswahili = function() {
                      var lessoncContentFirst, reading;
                      console.log("Test Should pass to Classroom Observation (Kiswahili) (2016) page - view.$el.html(): " + view.$el.html());
                      lessoncContentFirst = view.$el.find('#question-lesson_content_first');
                      if (typeof lessoncContentFirst !== 'undefined' && lessoncContentFirst !== null) {
                        if (typeof lessoncContentFirst.css('display') !== 'undefined' && lessoncContentFirst.css('display') !== null) {
                          expect(lessoncContentFirst.css('display')).to.eq('block');
                        }
                      }
                      reading = view.$el.find('#question-reading');
                      if (typeof reading !== 'undefined' && reading !== null) {
                        console.log("reading: " + reading);
                        if (typeof reading.css('display') !== 'undefined' && reading.css('display') !== null) {
                          expect(reading.css('display')).to.eq('none');
                        }
                      }
                      return done();
                    };
                    buttons = view.$el.find('.button.left');
                    $(buttons[0]).click();
                    buttons = view.$el.find('.subtest-next');
                    $(buttons[0]).click();
                    return setTimeout(renderKiswahili, 2000);
                  };
                  return setTimeout(renderObservation, 1000);
                });
                buttons = view.$el.find('.subtest-next');
                return $(buttons[0]).click();
              });
              buttons = view.$el.find('.subtest-next');
              return $(buttons[0]).click();
            });
            return view.render();
          }
        });
      });
    });
  };
  return dbs.split(',').forEach(function(db) {
    return tests(db);
  });
})();
