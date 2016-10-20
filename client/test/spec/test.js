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
    return describe('Should get the assessment', function() {
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
      return it('QTI test: Should return the expected assessment as an ItemModel', function(done) {
        var assessment, id;
        id = "49ed849c-c123-6e9c-3f48-8197fe5960e9";
        assessment = new ItemModel({
          "_id": id
        });
        return assessment.fetch({
          error: function(err) {
            console.log("Catch Error: " + JSON.stringify(err));
            return done(err);
          },
          success: function(record) {
            console.log("assessment: " + JSON.stringify(assessment));
            Tangerine.assessment = assessment;
            expect(assessment.get("name")).to.equal('Test 1');
            return done();
          }
        });
      });
    });
  };
  return dbs.split(',').forEach(function(db) {
    return tests(db);
  });
})();
