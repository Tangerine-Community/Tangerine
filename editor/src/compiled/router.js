var Router,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Router = (function(superClass) {
  extend(Router, superClass);

  function Router() {
    return Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.execute = function(callback, args, name) {
    $('#footer').show();
    if (callback) {
      return callback.apply(this, args);
    }
  };

  Router.prototype.routes = {
    'workflow/edit/:workflowId': 'workflowEdit',
    'workflow/run/:workflowId': 'workflowRun',
    'workflow/resume/:workflowId/:tripId': 'workflowResume',
    'feedback/edit/:workflowId': 'feedbackEdit',
    'feedback/:workflowId': 'feedback',
    'login': 'login',
    'register': 'register',
    'logout': 'logout',
    'account': 'account',
    'transfer': 'transfer',
    'settings': 'settings',
    'update': 'update',
    '': 'landing',
    'logs': 'logs',
    'class': 'klass',
    'class/edit/:id': 'klassEdit',
    'class/student/:studentId': 'studentEdit',
    'class/student/report/:studentId': 'studentReport',
    'class/subtest/:id': 'editKlassSubtest',
    'class/question/:id': "editKlassQuestion",
    'class/:id/:part': 'klassPartly',
    'class/:id': 'klassPartly',
    'class/run/:studentId/:subtestId': 'runSubtest',
    'class/result/student/subtest/:studentId/:subtestId': 'studentSubtest',
    'curricula': 'curricula',
    'curriculum/:id': 'curriculum',
    'curriculumImport': 'curriculumImport',
    'report/klassGrouping/:klassId/:part': 'klassGrouping',
    'report/masteryCheck/:studentId': 'masteryCheck',
    'report/progress/:studentId/:klassId': 'progressReport',
    'groups': 'groups',
    'assessments': 'assessments',
    'run/:id': 'run',
    'print/:id/:format': 'print',
    'dataEntry/:id': 'dataEntry',
    'resume/:assessmentId/:resultId': 'resume',
    'restart/:id': 'restart',
    'edit/:id': 'edit',
    'results/:id': 'results',
    'import': 'import',
    'subtest/:id': 'editSubtest',
    'question/:id': 'editQuestion',
    'dashboard': 'dashboard',
    'dashboard/*options': 'dashboard',
    'admin': 'admin',
    'sync/:id': 'sync'
  };

  Router.prototype.feedbackEdit = function(workflowId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var showFeedbackEditor, workflow;
        showFeedbackEditor = function(feedback, workflow) {
          var view;
          feedback.updateCollection();
          view = new FeedbackEditView({
            feedback: feedback,
            workflow: workflow
          });
          return vm.show(view);
        };
        workflow = new Workflow({
          "_id": workflowId
        });
        return workflow.fetch({
          success: function() {
            var feedback, feedbackId;
            feedbackId = workflowId + "-feedback";
            feedback = new Feedback({
              "_id": feedbackId
            });
            return feedback.fetch({
              error: function() {
                return feedback.save(null, {
                  success: function() {
                    return showFeedbackEditor(feedback, workflow);
                  }
                });
              },
              success: function() {
                return showFeedbackEditor(feedback, workflow);
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.feedback = function(workflowId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var workflow;
        workflow = new Workflow({
          "_id": workflowId
        });
        return workflow.fetch({
          success: function() {
            var feedback, feedbackId;
            feedbackId = workflowId + "-feedback";
            feedback = new Feedback({
              "_id": feedbackId
            });
            return feedback.fetch({
              error: function() {
                return Utils.midAlert("No feedback defined");
              },
              success: function() {
                var view;
                feedback.updateCollection();
                view = new FeedbackTripsView({
                  feedback: feedback,
                  workflow: workflow
                });
                return vm.show(view);
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.workflowEdit = function(workflowId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var workflow;
        workflow = new Workflow({
          "_id": workflowId
        });
        return workflow.fetch({
          success: function() {
            var view;
            view = new WorkflowEditView({
              workflow: workflow
            });
            return vm.show(view);
          }
        });
      }
    });
  };

  Router.prototype.workflowRun = function(workflowId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var workflow;
        workflow = new Workflow({
          "_id": workflowId
        });
        return workflow.fetch({
          success: function() {
            var view;
            workflow.updateCollection();
            view = new WorkflowRunView({
              workflow: workflow
            });
            return vm.show(view);
          }
        });
      }
    });
  };

  Router.prototype.workflowResume = function(workflowId, tripId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var workflow;
        workflow = new Workflow({
          "_id": workflowId
        });
        return workflow.fetch({
          success: function() {
            return Tangerine.$db.view(Tangerine.design_doc + "/tripsAndUsers", {
              key: tripId,
              include_docs: true,
              success: function(data) {
                var assessmentResumeIndex, i, index, j, ref, ref1, ref2, ref3, steps;
                index = Math.max(data.rows.length - 1, 0);
                steps = [];
                for (j = i = 0, ref = index; 0 <= ref ? i <= ref : i >= ref; j = 0 <= ref ? ++i : --i) {
                  steps.push({
                    result: new Result(data.rows[j].doc)
                  });
                }
                assessmentResumeIndex = ((ref1 = data.rows[index]) != null ? (ref2 = ref1.doc) != null ? (ref3 = ref2.subtestData) != null ? ref3.length : void 0 : void 0 : void 0) || 0;

                /*
                  if data.rows[index]?.doc?.order_map?
                   * save the order map of previous randomization
                  orderMap = result.get("order_map").slice() # clone array
                   * restore the previous ordermap
                  view.orderMap = orderMap
                 */
                workflow = new Workflow({
                  "_id": workflowId
                });
                return workflow.fetch({
                  success: function() {
                    var incomplete, view;
                    incomplete = Tangerine.user.getPreferences("tutor-workflows", "incomplete");
                    incomplete[workflowId] = _(incomplete[workflowId]).without(tripId);
                    Tangerine.user.getPreferences("tutor-workflows", "incomplete", incomplete);
                    workflow.updateCollection();
                    view = new WorkflowRunView({
                      assessmentResumeIndex: assessmentResumeIndex,
                      workflow: workflow,
                      tripId: tripId,
                      index: index,
                      steps: steps
                    });
                    return vm.show(view);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.admin = function(options) {
    return Tangerine.user.verify({
      isAdmin: function() {
        return $.couch.allDbs({
          success: (function(_this) {
            return function(databases) {
              var groups, view;
              groups = databases.filter(function(database) {
                return database.indexOf("group-") === 0;
              });
              view = new AdminView({
                groups: groups
              });
              return vm.show(view);
            };
          })(this)
        });
      }
    });
  };

  Router.prototype.dashboard = function(options) {
    var reportViewOptions, view;
    options = options != null ? options.split(/\//) : void 0;
    console.log("options: " + options);
    reportViewOptions = {
      assessment: "All",
      groupBy: "enumerator"
    };
    _.each(options, function(option, index) {
      if (!(index % 2)) {
        return reportViewOptions[option] = options[index + 1];
      }
    });
    view = new DashboardView(reportViewOptions);
    return vm.show(view);
  };

  Router.prototype.landing = function() {
    if (~String(window.location.href).indexOf("app/tangerine/")) {
      return Tangerine.router.navigate("groups", true);
    } else {
      return Tangerine.router.navigate("assessments", true);
    }
  };

  Router.prototype.groups = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var view;
        view = new GroupsView;
        return vm.show(view);
      }
    });
  };

  Router.prototype.curricula = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var curricula;
        curricula = new Curricula;
        return curricula.fetch({
          success: function(collection) {
            var view;
            view = new CurriculaView({
              "curricula": collection
            });
            return vm.show(view);
          }
        });
      }
    });
  };

  Router.prototype.curriculum = function(curriculumId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var curriculum;
        curriculum = new Curriculum({
          "_id": curriculumId
        });
        return curriculum.fetch({
          success: function() {
            var allSubtests;
            allSubtests = new Subtests;
            return allSubtests.fetch({
              success: function() {
                var allQuestions, subtests;
                subtests = new Subtests(allSubtests.where({
                  "curriculumId": curriculumId
                }));
                allQuestions = new Questions;
                return allQuestions.fetch({
                  success: function() {
                    var questions, view;
                    questions = [];
                    subtests.each(function(subtest) {
                      return questions = questions.concat(allQuestions.where({
                        "subtestId": subtest.id
                      }));
                    });
                    questions = new Questions(questions);
                    view = new CurriculumView({
                      "curriculum": curriculum,
                      "subtests": subtests,
                      "questions": questions
                    });
                    return vm.show(view);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.curriculumEdit = function(curriculumId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var curriculum;
        curriculum = new Curriculum({
          "_id": curriculumId
        });
        return curriculum.fetch({
          success: function() {
            var allSubtests;
            allSubtests = new Subtests;
            return allSubtests.fetch({
              success: function() {
                var allParts, partCount, subtest, subtests, view;
                subtests = allSubtests.where({
                  "curriculumId": curriculumId
                });
                allParts = (function() {
                  var i, len, results1;
                  results1 = [];
                  for (i = 0, len = subtests.length; i < len; i++) {
                    subtest = subtests[i];
                    results1.push(subtest.get("part"));
                  }
                  return results1;
                })();
                partCount = Math.max.apply(Math, allParts);
                view = new CurriculumView({
                  "curriculum": curriculum,
                  "subtests": subtests,
                  "parts": partCount
                });
                return vm.show(view);
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.curriculumImport = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var view;
        view = new AssessmentImportView({
          noun: "curriculum"
        });
        return vm.show(view);
      }
    });
  };

  Router.prototype.klass = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var allKlasses;
        allKlasses = new Klasses;
        return allKlasses.fetch({
          success: function(klassCollection) {
            var teachers;
            teachers = new Teachers;
            return teachers.fetch({
              success: function() {
                var allCurricula;
                allCurricula = new Curricula;
                return allCurricula.fetch({
                  success: function(curriculaCollection) {
                    var view;
                    if (!Tangerine.user.isAdmin()) {
                      klassCollection = new Klasses(klassCollection.where({
                        "teacherId": Tangerine.user.get("teacherId")
                      }));
                    }
                    view = new KlassesView({
                      klasses: klassCollection,
                      curricula: curriculaCollection,
                      teachers: teachers
                    });
                    return vm.show(view);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.klassEdit = function(id) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var klass;
        klass = new Klass({
          _id: id
        });
        return klass.fetch({
          success: function(model) {
            var teachers;
            teachers = new Teachers;
            return teachers.fetch({
              success: function() {
                var allStudents;
                allStudents = new Students;
                return allStudents.fetch({
                  success: function(allStudents) {
                    var klassStudents, view;
                    klassStudents = new Students(allStudents.where({
                      klassId: id
                    }));
                    view = new KlassEditView({
                      klass: model,
                      students: klassStudents,
                      allStudents: allStudents,
                      teachers: teachers
                    });
                    return vm.show(view);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.klassPartly = function(klassId, part) {
    if (part == null) {
      part = null;
    }
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var klass;
        klass = new Klass({
          "_id": klassId
        });
        return klass.fetch({
          success: function() {
            var curriculum;
            curriculum = new Curriculum({
              "_id": klass.get("curriculumId")
            });
            return curriculum.fetch({
              success: function() {
                var allStudents;
                allStudents = new Students;
                return allStudents.fetch({
                  success: function(collection) {
                    var allResults, students;
                    students = new Students(collection.where({
                      "klassId": klassId
                    }));
                    allResults = new KlassResults;
                    return allResults.fetch({
                      success: function(collection) {
                        var allSubtests, results;
                        results = new KlassResults(collection.where({
                          "klassId": klassId
                        }));
                        allSubtests = new Subtests;
                        return allSubtests.fetch({
                          success: function(collection) {
                            var subtests, view;
                            subtests = new Subtests(collection.where({
                              "curriculumId": klass.get("curriculumId")
                            }));
                            view = new KlassPartlyView({
                              "part": part,
                              "subtests": subtests,
                              "results": results,
                              "students": students,
                              "curriculum": curriculum,
                              "klass": klass
                            });
                            return vm.show(view);
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.studentSubtest = function(studentId, subtestId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var student;
        student = new Student({
          "_id": studentId
        });
        return student.fetch({
          success: function() {
            var subtest;
            subtest = new Subtest({
              "_id": subtestId
            });
            return subtest.fetch({
              success: function() {
                return Tangerine.$db.view(Tangerine.design_doc + "/resultsByStudentSubtest", {
                  key: [studentId, subtestId],
                  success: (function(_this) {
                    return function(response) {
                      var allResults;
                      allResults = new KlassResults;
                      return allResults.fetch({
                        success: function(collection) {
                          var results, view;
                          results = collection.where({
                            "subtestId": subtestId,
                            "studentId": studentId,
                            "klassId": student.get("klassId")
                          });
                          view = new KlassSubtestResultView({
                            "allResults": allResults,
                            "results": results,
                            "subtest": subtest,
                            "student": student,
                            "previous": response.rows.length
                          });
                          return vm.show(view);
                        }
                      });
                    };
                  })(this)
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.runSubtest = function(studentId, subtestId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var subtest;
        subtest = new Subtest({
          "_id": subtestId
        });
        return subtest.fetch({
          success: function() {
            var onStudentReady, student;
            student = new Student({
              "_id": studentId
            });
            onStudentReady = function(student, subtest) {
              return student.fetch({
                success: function() {
                  var onSuccess, questions;
                  onSuccess = function(student, subtest, question, linkedResult) {
                    var view;
                    if (question == null) {
                      question = null;
                    }
                    if (linkedResult == null) {
                      linkedResult = {};
                    }
                    view = new KlassSubtestRunView({
                      "student": student,
                      "subtest": subtest,
                      "questions": questions,
                      "linkedResult": linkedResult
                    });
                    return vm.show(view);
                  };
                  questions = null;
                  if (subtest.get("prototype") === "survey") {
                    return Tangerine.$db.view(Tangerine.design_doc + "/resultsByStudentSubtest", {
                      key: [studentId, subtest.get("gridLinkId")],
                      success: (function(_this) {
                        return function(response) {
                          var linkedResult, ref;
                          if (response.rows !== 0) {
                            linkedResult = new KlassResult((ref = _.last(response.rows)) != null ? ref.value : void 0);
                          }
                          questions = new Questions;
                          return questions.fetch({
                            key: "q" + subtest.get("curriculumId"),
                            success: function() {
                              questions = new Questions(questions.where({
                                subtestId: subtestId
                              }));
                              return onSuccess(student, subtest, questions, linkedResult);
                            }
                          });
                        };
                      })(this)
                    });
                  } else {
                    return onSuccess(student, subtest);
                  }
                }
              });
            };
            if (studentId === "test") {
              return student.fetch({
                success: function() {
                  return onStudentReady(student, subtest);
                },
                error: function() {
                  return student.save(null, {
                    success: function() {
                      return onStudentReady(student, subtest);
                    }
                  });
                }
              });
            } else {
              return student.fetch({
                success: function() {
                  return onStudentReady(student, subtest);
                }
              });
            }
          }
        });
      }
    });
  };

  Router.prototype.register = function() {
    return Tangerine.user.verify({
      isUnregistered: function() {
        var view;
        view = new RegisterTeacherView({
          user: new User
        });
        return vm.show(view);
      },
      isAuthenticated: function() {
        return Tangerine.router.landing();
      }
    });
  };

  Router.prototype.studentEdit = function(studentId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var student;
        student = new Student({
          _id: studentId
        });
        return student.fetch({
          success: function(model) {
            var allKlasses;
            allKlasses = new Klasses;
            return allKlasses.fetch({
              success: function(klassCollection) {
                var view;
                view = new StudentEditView({
                  student: model,
                  klasses: klassCollection
                });
                return vm.show(view);
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.dataEntry = function(assessmentId) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var assessment;
        assessment = new Assessment({
          "_id": assessmentId
        });
        return assessment.fetch({
          success: function() {
            var questions;
            questions = new Questions;
            return questions.fetch({
              key: "q" + assessmentId,
              success: function() {
                var questionsBySubtestId, subtestId;
                questionsBySubtestId = questions.indexBy("subtestId");
                for (subtestId in questionsBySubtestId) {
                  questions = questionsBySubtestId[subtestId];
                  assessment.subtests.get(subtestId).questions = new Questions(questions);
                }
                return vm.show(new AssessmentDataEntryView({
                  assessment: assessment
                }));
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.sync = function(assessmentId) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var assessment;
        assessment = new Assessment({
          "_id": assessmentId
        });
        return assessment.fetch({
          success: function() {
            return vm.show(new AssessmentSyncView({
              "assessment": assessment
            }));
          }
        });
      }
    });
  };

  Router.prototype["import"] = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var view;
        view = new AssessmentImportView({
          noun: "assessment"
        });
        return vm.show(view);
      }
    });
  };

  Router.prototype.assessments = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var workflows;
        return (workflows = new Workflows).fetch({
          success: function() {
            var collections, feedbacks;
            if (workflows.length > 0 && Tangerine.settings.get("context") !== "server") {
              feedbacks = new Feedbacks(feedbacks);
              feedbacks.fetch({
                success: function() {
                  var view;
                  view = new WorkflowMenuView({
                    workflows: workflows,
                    feedbacks: feedbacks
                  });
                  return vm.show(view);
                }
              });
            }
            collections = ["Klasses", "Teachers", "Curricula", "Assessments", "Workflows"];
            collections.push("Users");
            return Utils.loadCollections({
              collections: collections,
              complete: function(options) {
                feedbacks = options.workflows.models.map(function(a) {
                  return new Feedback({
                    "_id": a.id + "-feedback"
                  });
                });
                feedbacks = new Feedbacks(feedbacks);
                return feedbacks.fetch({
                  success: function() {
                    options.feedbacks = feedbacks;
                    options.users = options.tabletUsers || options.users;
                    return vm.show(new AssessmentsMenuView(options));
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.editId = function(id) {
    id = Utils.cleanURL(id);
    return Tangerine.user.verify({
      isAdmin: function() {
        var assessment;
        assessment = new Assessment({
          _id: id
        });
        return assessment.superFetch({
          success: function(model) {
            var view;
            view = new AssessmentEditView({
              model: model
            });
            return vm.show(view);
          }
        });
      },
      isUser: function() {
        return Tangerine.router.landing();
      }
    });
  };

  Router.prototype.edit = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var assessment;
        assessment = new Assessment({
          "_id": id
        });
        return assessment.fetch({
          success: function(model) {
            var view;
            view = new AssessmentEditView({
              model: model
            });
            return vm.show(view);
          }
        });
      },
      isUser: function() {
        return Tangerine.router.landing();
      }
    });
  };

  Router.prototype.restart = function(name) {
    return Tangerine.router.navigate("run/" + name, true);
  };

  Router.prototype.run = function(id) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var dKey, url;
        dKey = JSON.stringify(id.substr(-5, 5));
        url = Tangerine.settings.urlView("group", "byDKey");
        return $.ajax({
          url: url,
          type: "GET",
          dataType: "json",
          data: {
            key: dKey
          },
          error: (function(_this) {
            return function(a, b) {
              return _this.trigger("status", "import error", a + " " + b);
            };
          })(this),
          success: (function(_this) {
            return function(data) {
              var datum, docList, i, keyList, len, ref;
              docList = [];
              ref = data.rows;
              for (i = 0, len = ref.length; i < len; i++) {
                datum = ref[i];
                docList.push(datum.id);
                keyList = _.uniq(docList);
              }
              return Tangerine.$db.allDocs({
                keys: keyList,
                include_docs: true,
                success: function(response) {
                  var docs, k, len1, ref1, row, view;
                  docs = [];
                  ref1 = response.rows;
                  for (k = 0, len1 = ref1.length; k < len1; k++) {
                    row = ref1[k];
                    docs.push(row.doc);
                  }
                  view = new WidgetRunView({
                    model: docs
                  });
                  return vm.show(view);
                }
              });
            };
          })(this)
        });
      }
    });
  };

  Router.prototype.print = function(assessmentId, format) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var assessment;
        assessment = new Assessment({
          "_id": assessmentId
        });
        return assessment.fetch({
          success: function(model) {
            var view;
            view = new AssessmentPrintView({
              model: model,
              format: format
            });
            return vm.show(view);
          }
        });
      }
    });
  };

  Router.prototype.resume = function(assessmentId, resultId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var assessment;
        assessment = new Assessment({
          "_id": assessmentId
        });
        return assessment.fetch({
          success: function(assessment) {
            var result;
            result = new Result({
              "_id": resultId
            });
            return result.fetch({
              success: function(result) {
                var i, len, orderMap, ref, subtest, view;
                view = new AssessmentRunView({
                  model: assessment
                });
                if (result.has("order_map")) {
                  orderMap = result.get("order_map").slice();
                  view.orderMap = orderMap;
                }
                ref = result.get("subtestData");
                for (i = 0, len = ref.length; i < len; i++) {
                  subtest = ref[i];
                  if ((subtest.data != null) && (subtest.data.participant_id != null)) {
                    Tangerine.nav.setStudent(subtest.data.participant_id);
                  }
                }
                view.result = result;
                view.subtestViews.pop();
                view.subtestViews.push(new ResultView({
                  model: result,
                  assessment: assessment,
                  assessmentView: view
                }));
                view.index = result.get("subtestData").length;
                return vm.show(view);
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.results = function(assessmentId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var afterFetch, assessment;
        afterFetch = function(assessment, assessmentId) {
          var allResults;
          if (assessment == null) {
            assessment = new Assessment({
              "_id": assessmentId
            });
          }
          allResults = new Results;
          return allResults.fetch({
            include_docs: false,
            key: "r" + assessmentId,
            success: (function(_this) {
              return function(results) {
                var view;
                view = new ResultsView({
                  "assessment": assessment,
                  "results": results.models
                });
                return vm.show(view);
              };
            })(this)
          });
        };
        assessment = new Assessment({
          "_id": assessmentId
        });
        return assessment.fetch({
          success: function() {
            return afterFetch(assessment, assessmentId);
          },
          error: function() {
            return afterFetch(assessment, assessmentId);
          }
        });
      }
    });
  };

  Router.prototype.klassGrouping = function(klassId, part) {
    part = parseInt(part);
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var allSubtests;
        allSubtests = new Subtests;
        return allSubtests.fetch({
          success: function(collection) {
            var allResults, subtests;
            subtests = new Subtests(collection.where({
              "part": part
            }));
            allResults = new KlassResults;
            return allResults.fetch({
              success: function(results) {
                var students;
                results = new KlassResults(results.where({
                  "klassId": klassId
                }));
                students = new Students;
                return students.fetch({
                  success: function() {
                    var filteredResults, i, len, ref, ref1, result, resultsFromCurrentStudents, studentIds, view;
                    students = new Students(students.where({
                      "klassId": klassId
                    }));
                    studentIds = students.pluck("_id");
                    resultsFromCurrentStudents = [];
                    ref = results.models;
                    for (i = 0, len = ref.length; i < len; i++) {
                      result = ref[i];
                      if (ref1 = result.get("studentId"), indexOf.call(studentIds, ref1) >= 0) {
                        resultsFromCurrentStudents.push(result);
                      }
                    }
                    filteredResults = new KlassResults(resultsFromCurrentStudents);
                    view = new KlassGroupingView({
                      "students": students,
                      "subtests": subtests,
                      "results": filteredResults
                    });
                    return vm.show(view);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.masteryCheck = function(studentId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var student;
        student = new Student({
          "_id": studentId
        });
        return student.fetch({
          success: function(student) {
            var klass, klassId;
            klassId = student.get("klassId");
            klass = new Klass({
              "_id": student.get("klassId")
            });
            return klass.fetch({
              success: function(klass) {
                var allResults;
                allResults = new KlassResults;
                return allResults.fetch({
                  success: function(collection) {
                    var i, k, len, len1, ref, result, results, subtestCollection, subtestId, subtestIdList;
                    results = new KlassResults(collection.where({
                      "studentId": studentId,
                      "reportType": "mastery",
                      "klassId": klassId
                    }));
                    subtestIdList = {};
                    ref = results.models;
                    for (i = 0, len = ref.length; i < len; i++) {
                      result = ref[i];
                      subtestIdList[result.get("subtestId")] = true;
                    }
                    subtestIdList = _.keys(subtestIdList);
                    subtestCollection = new Subtests;
                    for (k = 0, len1 = subtestIdList.length; k < len1; k++) {
                      subtestId = subtestIdList[k];
                      subtestCollection.add(new Subtest({
                        "_id": subtestId
                      }));
                    }
                    return subtestCollection.fetch({
                      success: function() {
                        var view;
                        view = new MasteryCheckView({
                          "student": student,
                          "results": results,
                          "klass": klass,
                          "subtests": subtestCollection
                        });
                        return vm.show(view);
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.progressReport = function(studentId, klassId) {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var afterFetch, student, students;
        afterFetch = function(student, students) {
          var klass;
          klass = new Klass({
            "_id": klassId
          });
          return klass.fetch({
            success: function(klass) {
              var allSubtests;
              allSubtests = new Subtests;
              return allSubtests.fetch({
                success: function(allSubtests) {
                  var allResults, subtests;
                  subtests = new Subtests(allSubtests.where({
                    "curriculumId": klass.get("curriculumId"),
                    "reportType": "progress"
                  }));
                  allResults = new KlassResults;
                  return allResults.fetch({
                    success: function(collection) {
                      var i, len, ref, ref1, result, results, resultsFromCurrentStudents, studentIds, view;
                      results = new KlassResults(collection.where({
                        "klassId": klassId,
                        "reportType": "progress"
                      }));
                      console.log(students);
                      if (students != null) {
                        studentIds = students.pluck("_id");
                        resultsFromCurrentStudents = [];
                        ref = results.models;
                        for (i = 0, len = ref.length; i < len; i++) {
                          result = ref[i];
                          if (ref1 = result.get("studentId"), indexOf.call(studentIds, ref1) >= 0) {
                            resultsFromCurrentStudents.push(result);
                          }
                        }
                        results = new KlassResults(resultsFromCurrentStudents);
                      }
                      view = new ProgressView({
                        "subtests": subtests,
                        "student": student,
                        "results": results,
                        "klass": klass
                      });
                      return vm.show(view);
                    }
                  });
                }
              });
            }
          });
        };
        if (studentId !== "all") {
          student = new Student({
            "_id": studentId
          });
          return student.fetch({
            success: function() {
              return afterFetch(student);
            }
          });
        } else {
          students = new Students;
          return students.fetch({
            success: function() {
              return afterFetch(null, students);
            }
          });
        }
      }
    });
  };

  Router.prototype.editSubtest = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var subtest;
        id = Utils.cleanURL(id);
        subtest = new Subtest({
          _id: id
        });
        return subtest.fetch({
          success: function(model, response) {
            var assessment;
            assessment = new Assessment({
              "_id": subtest.get("assessmentId")
            });
            return assessment.fetch({
              success: function() {
                var subtests, subtestsPrimeThePump;
                subtestsPrimeThePump = new Subtests;
                subtestsPrimeThePump.fetch({
                  key: "s" + assessment.id,
                  success: function() {
                    return console.log("SubtestsPrimeThePump success callback called");
                  },
                  error: function() {
                    return console.log("SubtestsPrimeThePump error callback called");
                  }
                });
                subtests = new Subtests;
                return subtests.fetch({
                  key: "s" + assessment.id,
                  success: (function(_this) {
                    return function(collection) {
                      var view;
                      view = new SubtestEditView({
                        model: model,
                        subtests: subtests,
                        assessment: assessment
                      });
                      return vm.show(view);
                    };
                  })(this)
                });
              }
            });
          }
        });
      },
      isUser: function() {
        return Tangerine.router.landing();
      }
    });
  };

  Router.prototype.editKlassSubtest = function(id) {
    var onSuccess;
    onSuccess = function(subtest, curriculum, questions) {
      var view;
      if (questions == null) {
        questions = null;
      }
      view = new KlassSubtestEditView({
        model: subtest,
        curriculum: curriculum,
        questions: questions
      });
      return vm.show(view);
    };
    return Tangerine.user.verify({
      isAdmin: function() {
        var subtest;
        id = Utils.cleanURL(id);
        subtest = new Subtest({
          _id: id
        });
        return subtest.fetch({
          success: function() {
            var curriculum;
            curriculum = new Curriculum({
              "_id": subtest.get("curriculumId")
            });
            return curriculum.fetch({
              success: function() {
                var questions;
                if (subtest.get("prototype") === "survey") {
                  questions = new Questions;
                  return questions.fetch({
                    key: curriculum.id,
                    success: function() {
                      questions = new Questions(questions.where({
                        "subtestId": subtest.id
                      }));
                      return onSuccess(subtest, curriculum, questions);
                    }
                  });
                } else {
                  return onSuccess(subtest, curriculum);
                }
              }
            });
          }
        });
      },
      isUser: function() {
        return Tangerine.router.landing();
      }
    });
  };

  Router.prototype.editQuestion = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var question;
        id = Utils.cleanURL(id);
        question = new Question({
          _id: id
        });
        return question.fetch({
          success: function(question, response) {
            var assessment;
            assessment = new Assessment({
              "_id": question.get("assessmentId")
            });
            return assessment.fetch({
              success: function() {
                var subtest;
                subtest = new Subtest({
                  "_id": question.get("subtestId")
                });
                return subtest.fetch({
                  success: function() {
                    var view;
                    view = new QuestionEditView({
                      "question": question,
                      "subtest": subtest,
                      "assessment": assessment
                    });
                    return vm.show(view);
                  }
                });
              }
            });
          }
        });
      },
      isUser: function() {
        return Tangerine.router.landing();
      }
    });
  };

  Router.prototype.editKlassQuestion = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var question;
        id = Utils.cleanURL(id);
        question = new Question({
          "_id": id
        });
        return question.fetch({
          success: function(question, response) {
            var curriculum;
            curriculum = new Curriculum({
              "_id": question.get("curriculumId")
            });
            return curriculum.fetch({
              success: function() {
                var subtest;
                subtest = new Subtest({
                  "_id": question.get("subtestId")
                });
                return subtest.fetch({
                  success: function() {
                    var view;
                    view = new QuestionEditView({
                      "question": question,
                      "subtest": subtest,
                      "assessment": curriculum
                    });
                    return vm.show(view);
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  Router.prototype.login = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        return Tangerine.router.landing();
      },
      isUnregistered: function() {
        var showView;
        showView = function(users) {
          var view;
          if (users == null) {
            users = [];
          }
          view = new LoginView({
            users: users
          });
          return vm.show(view);
        };
        return showView();
      }
    });
  };

  Router.prototype.logout = function() {
    return Tangerine.user.logout();
  };

  Router.prototype.account = function() {
    if (Tangerine.db_name !== "tangerine") {
      return window.location = Tangerine.settings.urlIndex("trunk", "account");
    } else {
      return Tangerine.user.verify({
        isAuthenticated: function() {
          var view;
          view = new AccountView({
            user: Tangerine.user
          });
          return vm.show(view);
        }
      });
    }
  };

  Router.prototype.settings = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var view;
        view = new SettingsView;
        return vm.show(view);
      }
    });
  };

  Router.prototype.logs = function() {
    return Tangerine.user.verify({
      isAuthenticated: function() {
        var logs;
        logs = new Logs;
        return logs.fetch({
          success: (function(_this) {
            return function() {
              var view;
              view = new LogView({
                logs: logs
              });
              return vm.show(view);
            };
          })(this)
        });
      }
    });
  };

  Router.prototype.transfer = function() {
    var getVars, name;
    getVars = Utils.$_GET();
    name = getVars.name;
    return $.couch.logout({
      success: (function(_this) {
        return function() {
          $.cookie("AuthSession", null);
          return $.couch.login({
            "name": name,
            "password": name,
            success: function() {
              Tangerine.router.landing();
              return window.location.reload();
            },
            error: function() {
              return $.couch.signup({
                "name": name,
                "roles": ["_admin"]
              }, name, {
                success: function() {
                  var user;
                  user = new User;
                  return user.save({
                    "name": name,
                    "id": "tangerine.user:" + name,
                    "roles": [],
                    "from": "tc"
                  }, {
                    wait: true,
                    success: function() {
                      return $.couch.login({
                        "name": name,
                        "password": name,
                        success: function() {
                          Tangerine.router.landing();
                          return window.location.reload();
                        },
                        error: function() {
                          return Utils.sticky("Error transfering user.");
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        };
      })(this)
    });
  };

  return Router;

})(Backbone.Router);

//# sourceMappingURL=data:application/json;base64,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a0IsSUFENUI7b0JBRUEsT0FBQSxFQUFVLEVBRlY7b0JBR0EsTUFBQSxFQUFVLElBSFY7bUJBREYsRUFNRTtvQkFBQSxJQUFBLEVBQU0sSUFBTjtvQkFDQSxPQUFBLEVBQVMsU0FBQTs2QkFDUCxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQVIsQ0FDRTt3QkFBQSxNQUFBLEVBQWEsSUFBYjt3QkFDQSxVQUFBLEVBQWEsSUFEYjt3QkFFQSxPQUFBLEVBQVUsU0FBQTswQkFDUixTQUFTLENBQUMsTUFBTSxDQUFDLE9BQWpCLENBQUE7aUNBQ0EsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixDQUFBO3dCQUZRLENBRlY7d0JBS0EsS0FBQSxFQUFPLFNBQUE7aUNBQ0wsS0FBSyxDQUFDLE1BQU4sQ0FBYSx5QkFBYjt3QkFESyxDQUxQO3VCQURGO29CQURPLENBRFQ7bUJBTkY7Z0JBRk8sQ0FBVDtlQUpBO1lBREssQ0FMUDtXQURGO1FBRk87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7S0FERjtFQUhROzs7O0dBcjhCUyxRQUFRLENBQUMiLCJmaWxlIjoiYXBwL3JvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFJvdXRlciBleHRlbmRzIEJhY2tib25lLlJvdXRlclxuIyAgYmVmb3JlOiAoKSAtPlxuIyAgICBjb25zb2xlLmxvZygnYmVmb3JlJylcbiMgICAgJCgnI2Zvb3RlcicpLnNob3coKVxuI1xuIyAgYWZ0ZXI6ICgpIC0+XG4jICAgIGNvbnNvbGUubG9nKCdhZnRlcicpO1xuICBleGVjdXRlOiAoY2FsbGJhY2ssIGFyZ3MsIG5hbWUpIC0+XG4gICAgJCgnI2Zvb3RlcicpLnNob3coKVxuICAgIGlmIChjYWxsYmFjaylcbiAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpXG5cbiAgcm91dGVzOlxuXG4gICAgJ3dvcmtmbG93L2VkaXQvOndvcmtmbG93SWQnIDogJ3dvcmtmbG93RWRpdCdcbiAgICAnd29ya2Zsb3cvcnVuLzp3b3JrZmxvd0lkJyAgOiAnd29ya2Zsb3dSdW4nXG4gICAgJ3dvcmtmbG93L3Jlc3VtZS86d29ya2Zsb3dJZC86dHJpcElkJyAgOiAnd29ya2Zsb3dSZXN1bWUnXG5cbiAgICAnZmVlZGJhY2svZWRpdC86d29ya2Zsb3dJZCcgOiAnZmVlZGJhY2tFZGl0J1xuICAgICdmZWVkYmFjay86d29ya2Zsb3dJZCcgICAgICA6ICdmZWVkYmFjaydcblxuICAgICdsb2dpbicgICAgOiAnbG9naW4nXG4gICAgJ3JlZ2lzdGVyJyA6ICdyZWdpc3RlcidcbiAgICAnbG9nb3V0JyAgIDogJ2xvZ291dCdcbiAgICAnYWNjb3VudCcgIDogJ2FjY291bnQnXG5cbiAgICAndHJhbnNmZXInIDogJ3RyYW5zZmVyJ1xuXG4gICAgJ3NldHRpbmdzJyA6ICdzZXR0aW5ncydcbiAgICAndXBkYXRlJyA6ICd1cGRhdGUnXG5cbiAgICAnJyA6ICdsYW5kaW5nJ1xuXG4gICAgJ2xvZ3MnIDogJ2xvZ3MnXG5cbiAgICAjIENsYXNzXG4gICAgJ2NsYXNzJyAgICAgICAgICA6ICdrbGFzcydcbiAgICAnY2xhc3MvZWRpdC86aWQnIDogJ2tsYXNzRWRpdCdcbiAgICAnY2xhc3Mvc3R1ZGVudC86c3R1ZGVudElkJyAgICAgICAgOiAnc3R1ZGVudEVkaXQnXG4gICAgJ2NsYXNzL3N0dWRlbnQvcmVwb3J0LzpzdHVkZW50SWQnIDogJ3N0dWRlbnRSZXBvcnQnXG4gICAgJ2NsYXNzL3N1YnRlc3QvOmlkJyA6ICdlZGl0S2xhc3NTdWJ0ZXN0J1xuICAgICdjbGFzcy9xdWVzdGlvbi86aWQnIDogXCJlZGl0S2xhc3NRdWVzdGlvblwiXG5cbiAgICAnY2xhc3MvOmlkLzpwYXJ0JyA6ICdrbGFzc1BhcnRseSdcbiAgICAnY2xhc3MvOmlkJyAgICAgICA6ICdrbGFzc1BhcnRseSdcblxuICAgICdjbGFzcy9ydW4vOnN0dWRlbnRJZC86c3VidGVzdElkJyA6ICdydW5TdWJ0ZXN0J1xuXG4gICAgJ2NsYXNzL3Jlc3VsdC9zdHVkZW50L3N1YnRlc3QvOnN0dWRlbnRJZC86c3VidGVzdElkJyA6ICdzdHVkZW50U3VidGVzdCdcblxuICAgICdjdXJyaWN1bGEnICAgICAgICAgOiAnY3VycmljdWxhJ1xuICAgICdjdXJyaWN1bHVtLzppZCcgICAgOiAnY3VycmljdWx1bSdcbiAgICAnY3VycmljdWx1bUltcG9ydCcgIDogJ2N1cnJpY3VsdW1JbXBvcnQnXG5cbiAgICAncmVwb3J0L2tsYXNzR3JvdXBpbmcvOmtsYXNzSWQvOnBhcnQnIDogJ2tsYXNzR3JvdXBpbmcnXG4gICAgJ3JlcG9ydC9tYXN0ZXJ5Q2hlY2svOnN0dWRlbnRJZCcgICAgICA6ICdtYXN0ZXJ5Q2hlY2snXG4gICAgJ3JlcG9ydC9wcm9ncmVzcy86c3R1ZGVudElkLzprbGFzc0lkJyA6ICdwcm9ncmVzc1JlcG9ydCdcblxuXG4gICAgIyBzZXJ2ZXIgLyBtb2JpbGVcbiAgICAnZ3JvdXBzJyA6ICdncm91cHMnXG5cbiAgICAnYXNzZXNzbWVudHMnICAgICAgICA6ICdhc3Nlc3NtZW50cydcblxuICAgICdydW4vOmlkJyAgICAgICA6ICdydW4nXG4gICAgJ3ByaW50LzppZC86Zm9ybWF0JyAgICAgICA6ICdwcmludCdcbiAgICAnZGF0YUVudHJ5LzppZCcgOiAnZGF0YUVudHJ5J1xuXG4gICAgJ3Jlc3VtZS86YXNzZXNzbWVudElkLzpyZXN1bHRJZCcgICAgOiAncmVzdW1lJ1xuXG4gICAgJ3Jlc3RhcnQvOmlkJyAgIDogJ3Jlc3RhcnQnXG4gICAgJ2VkaXQvOmlkJyAgICAgIDogJ2VkaXQnXG4gICAgJ3Jlc3VsdHMvOmlkJyAgIDogJ3Jlc3VsdHMnXG4gICAgJ2ltcG9ydCcgICAgICAgIDogJ2ltcG9ydCdcblxuICAgICdzdWJ0ZXN0LzppZCcgICAgICAgOiAnZWRpdFN1YnRlc3QnXG5cbiAgICAncXVlc3Rpb24vOmlkJyA6ICdlZGl0UXVlc3Rpb24nXG4gICAgJ2Rhc2hib2FyZCcgOiAnZGFzaGJvYXJkJ1xuICAgICdkYXNoYm9hcmQvKm9wdGlvbnMnIDogJ2Rhc2hib2FyZCdcbiAgICAnYWRtaW4nIDogJ2FkbWluJ1xuXG4gICAgJ3N5bmMvOmlkJyAgICAgIDogJ3N5bmMnXG5cbiAgZmVlZGJhY2tFZGl0OiAoIHdvcmtmbG93SWQgKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuXG4gICAgICAgIHNob3dGZWVkYmFja0VkaXRvciA9ICggZmVlZGJhY2ssIHdvcmtmbG93ICkgLT5cbiAgICAgICAgICBmZWVkYmFjay51cGRhdGVDb2xsZWN0aW9uKClcbiAgICAgICAgICB2aWV3ID0gbmV3IEZlZWRiYWNrRWRpdFZpZXdcbiAgICAgICAgICAgIGZlZWRiYWNrOiBmZWVkYmFja1xuICAgICAgICAgICAgd29ya2Zsb3c6IHdvcmtmbG93XG4gICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgd29ya2Zsb3cgPSBuZXcgV29ya2Zsb3cgXCJfaWRcIiA6IHdvcmtmbG93SWRcbiAgICAgICAgd29ya2Zsb3cuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgZmVlZGJhY2tJZCA9IFwiI3t3b3JrZmxvd0lkfS1mZWVkYmFja1wiXG4gICAgICAgICAgICBmZWVkYmFjayAgID0gbmV3IEZlZWRiYWNrIFwiX2lkXCIgOiBmZWVkYmFja0lkXG4gICAgICAgICAgICBmZWVkYmFjay5mZXRjaFxuICAgICAgICAgICAgICBlcnJvcjogICAtPiBmZWVkYmFjay5zYXZlIG51bGwsIHN1Y2Nlc3M6IC0+IHNob3dGZWVkYmFja0VkaXRvcihmZWVkYmFjaywgd29ya2Zsb3cpXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IHNob3dGZWVkYmFja0VkaXRvcihmZWVkYmFjaywgd29ya2Zsb3cpXG5cbiAgZmVlZGJhY2s6ICggd29ya2Zsb3dJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG5cbiAgICAgICAgd29ya2Zsb3cgPSBuZXcgV29ya2Zsb3cgXCJfaWRcIiA6IHdvcmtmbG93SWRcbiAgICAgICAgd29ya2Zsb3cuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgZmVlZGJhY2tJZCA9IFwiI3t3b3JrZmxvd0lkfS1mZWVkYmFja1wiXG4gICAgICAgICAgICBmZWVkYmFjayA9IG5ldyBGZWVkYmFjayBcIl9pZFwiIDogZmVlZGJhY2tJZFxuICAgICAgICAgICAgZmVlZGJhY2suZmV0Y2hcbiAgICAgICAgICAgICAgZXJyb3I6IC0+IFV0aWxzLm1pZEFsZXJ0IFwiTm8gZmVlZGJhY2sgZGVmaW5lZFwiXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgZmVlZGJhY2sudXBkYXRlQ29sbGVjdGlvbigpXG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBGZWVkYmFja1RyaXBzVmlld1xuICAgICAgICAgICAgICAgICAgZmVlZGJhY2sgOiBmZWVkYmFja1xuICAgICAgICAgICAgICAgICAgd29ya2Zsb3cgOiB3b3JrZmxvd1xuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cblxuXG5cbiAgd29ya2Zsb3dFZGl0OiAoIHdvcmtmbG93SWQgKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuXG4gICAgICAgIHdvcmtmbG93ID0gbmV3IFdvcmtmbG93IFwiX2lkXCIgOiB3b3JrZmxvd0lkXG4gICAgICAgIHdvcmtmbG93LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgV29ya2Zsb3dFZGl0VmlldyB3b3JrZmxvdyA6IHdvcmtmbG93XG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICB3b3JrZmxvd1J1bjogKCB3b3JrZmxvd0lkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cblxuICAgICAgICB3b3JrZmxvdyA9IG5ldyBXb3JrZmxvdyBcIl9pZFwiIDogd29ya2Zsb3dJZFxuICAgICAgICB3b3JrZmxvdy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICB3b3JrZmxvdy51cGRhdGVDb2xsZWN0aW9uKClcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgV29ya2Zsb3dSdW5WaWV3XG4gICAgICAgICAgICAgIHdvcmtmbG93OiB3b3JrZmxvd1xuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgd29ya2Zsb3dSZXN1bWU6ICggd29ya2Zsb3dJZCwgdHJpcElkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cblxuICAgICAgICB3b3JrZmxvdyA9IG5ldyBXb3JrZmxvdyBcIl9pZFwiIDogd29ya2Zsb3dJZFxuICAgICAgICB3b3JrZmxvdy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBUYW5nZXJpbmUuJGRiLnZpZXcgVGFuZ2VyaW5lLmRlc2lnbl9kb2MrXCIvdHJpcHNBbmRVc2Vyc1wiLFxuICAgICAgICAgICAgICBrZXk6IHRyaXBJZFxuICAgICAgICAgICAgICBpbmNsdWRlX2RvY3M6IHRydWVcbiAgICAgICAgICAgICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgaW5kZXggPSBNYXRoLm1heChkYXRhLnJvd3MubGVuZ3RoIC0gMSwgMClcblxuICAgICAgICAgICAgICAgICMgYWRkIG9sZCByZXN1bHRzXG4gICAgICAgICAgICAgICAgc3RlcHMgPSBbXVxuICAgICAgICAgICAgICAgIGZvciBqIGluIFswLi5pbmRleF1cbiAgICAgICAgICAgICAgICAgIHN0ZXBzLnB1c2gge3Jlc3VsdCA6IG5ldyBSZXN1bHQgZGF0YS5yb3dzW2pdLmRvY31cblxuICAgICAgICAgICAgICAgIGFzc2Vzc21lbnRSZXN1bWVJbmRleCA9IGRhdGEucm93c1tpbmRleF0/LmRvYz8uc3VidGVzdERhdGE/Lmxlbmd0aCB8fCAwXG5cbiAgICAgICAgICAgICAgICAjIyNcbiAgICAgICAgICAgICAgICAgIGlmIGRhdGEucm93c1tpbmRleF0/LmRvYz8ub3JkZXJfbWFwP1xuICAgICAgICAgICAgICAgICAgIyBzYXZlIHRoZSBvcmRlciBtYXAgb2YgcHJldmlvdXMgcmFuZG9taXphdGlvblxuICAgICAgICAgICAgICAgICAgb3JkZXJNYXAgPSByZXN1bHQuZ2V0KFwib3JkZXJfbWFwXCIpLnNsaWNlKCkgIyBjbG9uZSBhcnJheVxuICAgICAgICAgICAgICAgICAgIyByZXN0b3JlIHRoZSBwcmV2aW91cyBvcmRlcm1hcFxuICAgICAgICAgICAgICAgICAgdmlldy5vcmRlck1hcCA9IG9yZGVyTWFwXG5cbiAgICAgICAgICAgICAgICAjIyNcblxuICAgICAgICAgICAgICAgIHdvcmtmbG93ID0gbmV3IFdvcmtmbG93IFwiX2lkXCIgOiB3b3JrZmxvd0lkXG4gICAgICAgICAgICAgICAgd29ya2Zsb3cuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG5cbiAgICAgICAgICAgICAgICAgICAgaW5jb21wbGV0ZSA9IFRhbmdlcmluZS51c2VyLmdldFByZWZlcmVuY2VzKFwidHV0b3Itd29ya2Zsb3dzXCIsIFwiaW5jb21wbGV0ZVwiKVxuXG4gICAgICAgICAgICAgICAgICAgIGluY29tcGxldGVbd29ya2Zsb3dJZF0gPSBfKGluY29tcGxldGVbd29ya2Zsb3dJZF0pLndpdGhvdXQgdHJpcElkXG5cbiAgICAgICAgICAgICAgICAgICAgVGFuZ2VyaW5lLnVzZXIuZ2V0UHJlZmVyZW5jZXMoXCJ0dXRvci13b3JrZmxvd3NcIiwgXCJpbmNvbXBsZXRlXCIsIGluY29tcGxldGUpXG5cbiAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3cudXBkYXRlQ29sbGVjdGlvbigpXG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgV29ya2Zsb3dSdW5WaWV3XG4gICAgICAgICAgICAgICAgICAgICAgYXNzZXNzbWVudFJlc3VtZUluZGV4IDogYXNzZXNzbWVudFJlc3VtZUluZGV4XG4gICAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3c6IHdvcmtmbG93XG4gICAgICAgICAgICAgICAgICAgICAgdHJpcElkICA6IHRyaXBJZFxuICAgICAgICAgICAgICAgICAgICAgIGluZGV4ICAgOiBpbmRleFxuICAgICAgICAgICAgICAgICAgICAgIHN0ZXBzICAgOiBzdGVwc1xuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG5cblxuXG4gIGFkbWluOiAob3B0aW9ucykgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgICQuY291Y2guYWxsRGJzXG4gICAgICAgICAgc3VjY2VzczogKGRhdGFiYXNlcykgPT5cbiAgICAgICAgICAgIGdyb3VwcyA9IGRhdGFiYXNlcy5maWx0ZXIgKGRhdGFiYXNlKSAtPiBkYXRhYmFzZS5pbmRleE9mKFwiZ3JvdXAtXCIpID09IDBcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQWRtaW5WaWV3XG4gICAgICAgICAgICAgIGdyb3VwcyA6IGdyb3Vwc1xuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgZGFzaGJvYXJkOiAob3B0aW9ucykgLT5cbiAgICBvcHRpb25zID0gb3B0aW9ucz8uc3BsaXQoL1xcLy8pXG4gICAgY29uc29sZS5sb2coXCJvcHRpb25zOiBcIiArIG9wdGlvbnMpXG4gICAgI2RlZmF1bHQgdmlldyBvcHRpb25zXG4gICAgcmVwb3J0Vmlld09wdGlvbnMgPVxuICAgICAgYXNzZXNzbWVudDogXCJBbGxcIlxuICAgICAgZ3JvdXBCeTogXCJlbnVtZXJhdG9yXCJcblxuICAgICMgQWxsb3dzIHVzIHRvIGdldCBuYW1lL3ZhbHVlIHBhaXJzIGZyb20gVVJMXG4gICAgXy5lYWNoIG9wdGlvbnMsIChvcHRpb24saW5kZXgpIC0+XG4gICAgICB1bmxlc3MgaW5kZXggJSAyXG4gICAgICAgIHJlcG9ydFZpZXdPcHRpb25zW29wdGlvbl0gPSBvcHRpb25zW2luZGV4KzFdXG5cbiAgICB2aWV3ID0gbmV3IERhc2hib2FyZFZpZXcgIHJlcG9ydFZpZXdPcHRpb25zXG5cbiAgICB2bS5zaG93IHZpZXdcblxuICBsYW5kaW5nOiAtPlxuXG4gICAgaWYgflN0cmluZyh3aW5kb3cubG9jYXRpb24uaHJlZikuaW5kZXhPZihcImFwcC90YW5nZXJpbmUvXCIpICMgaW4gbWFpbiBncm91cD9cbiAgICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJncm91cHNcIiwgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJhc3Nlc3NtZW50c1wiLCB0cnVlXG5cblxuICBncm91cHM6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgR3JvdXBzVmlld1xuICAgICAgICB2bS5zaG93IHZpZXdcblxuICAjXG4gICMgQ2xhc3NcbiAgI1xuICBjdXJyaWN1bGE6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGN1cnJpY3VsYSA9IG5ldyBDdXJyaWN1bGFcbiAgICAgICAgY3VycmljdWxhLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IEN1cnJpY3VsYVZpZXdcbiAgICAgICAgICAgICAgXCJjdXJyaWN1bGFcIiA6IGNvbGxlY3Rpb25cbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGN1cnJpY3VsdW06IChjdXJyaWN1bHVtSWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bSBcIl9pZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHMgYWxsU3VidGVzdHMud2hlcmUgXCJjdXJyaWN1bHVtSWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICAgICAgICAgIGFsbFF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgICAgICBhbGxRdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IFtdXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RzLmVhY2ggKHN1YnRlc3QpIC0+IHF1ZXN0aW9ucyA9IHF1ZXN0aW9ucy5jb25jYXQoYWxsUXVlc3Rpb25zLndoZXJlIFwic3VidGVzdElkXCIgOiBzdWJ0ZXN0LmlkIClcbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBDdXJyaWN1bHVtVmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bVwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiAgIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICBcInF1ZXN0aW9uc1wiICA6IHF1ZXN0aW9uc1xuXG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgY3VycmljdWx1bUVkaXQ6IChjdXJyaWN1bHVtSWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bSBcIl9pZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdHMgPSBhbGxTdWJ0ZXN0cy53aGVyZSBcImN1cnJpY3VsdW1JZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgICAgICAgICAgYWxsUGFydHMgPSAoc3VidGVzdC5nZXQoXCJwYXJ0XCIpIGZvciBzdWJ0ZXN0IGluIHN1YnRlc3RzKVxuICAgICAgICAgICAgICAgIHBhcnRDb3VudCA9IE1hdGgubWF4LmFwcGx5IE1hdGgsIGFsbFBhcnRzXG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBDdXJyaWN1bHVtVmlld1xuICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtXCIgOiBjdXJyaWN1bHVtXG4gICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgXCJwYXJ0c1wiIDogcGFydENvdW50XG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICBjdXJyaWN1bHVtSW1wb3J0OiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRJbXBvcnRWaWV3XG4gICAgICAgICAgbm91biA6IFwiY3VycmljdWx1bVwiXG4gICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGtsYXNzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhbGxLbGFzc2VzID0gbmV3IEtsYXNzZXNcbiAgICAgICAgYWxsS2xhc3Nlcy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6ICgga2xhc3NDb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgIHRlYWNoZXJzID0gbmV3IFRlYWNoZXJzXG4gICAgICAgICAgICB0ZWFjaGVycy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGFsbEN1cnJpY3VsYSA9IG5ldyBDdXJyaWN1bGFcbiAgICAgICAgICAgICAgICBhbGxDdXJyaWN1bGEuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggY3VycmljdWxhQ29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcbiAgICAgICAgICAgICAgICAgICAgICBrbGFzc0NvbGxlY3Rpb24gPSBuZXcgS2xhc3NlcyBrbGFzc0NvbGxlY3Rpb24ud2hlcmUoXCJ0ZWFjaGVySWRcIiA6IFRhbmdlcmluZS51c2VyLmdldChcInRlYWNoZXJJZFwiKSlcbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc2VzVmlld1xuICAgICAgICAgICAgICAgICAgICAgIGtsYXNzZXMgICA6IGtsYXNzQ29sbGVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgIGN1cnJpY3VsYSA6IGN1cnJpY3VsYUNvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICB0ZWFjaGVycyAgOiB0ZWFjaGVyc1xuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBrbGFzc0VkaXQ6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAga2xhc3MgPSBuZXcgS2xhc3MgX2lkIDogaWRcbiAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAoIG1vZGVsICkgLT5cbiAgICAgICAgICAgIHRlYWNoZXJzID0gbmV3IFRlYWNoZXJzXG4gICAgICAgICAgICB0ZWFjaGVycy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChhbGxTdHVkZW50cykgLT5cbiAgICAgICAgICAgICAgICAgICAga2xhc3NTdHVkZW50cyA9IG5ldyBTdHVkZW50cyBhbGxTdHVkZW50cy53aGVyZSB7a2xhc3NJZCA6IGlkfVxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzRWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBrbGFzcyAgICAgICA6IG1vZGVsXG4gICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHMgICAgOiBrbGFzc1N0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMgOiBhbGxTdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgIHRlYWNoZXJzICAgIDogdGVhY2hlcnNcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAga2xhc3NQYXJ0bHk6IChrbGFzc0lkLCBwYXJ0PW51bGwpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIFwiX2lkXCIgOiBrbGFzc0lkXG4gICAgICAgIGtsYXNzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bSBcIl9pZFwiIDoga2xhc3MuZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICAgICAgICAgICAgICBhbGxTdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IFN0dWRlbnRzICggY29sbGVjdGlvbi53aGVyZSggXCJrbGFzc0lkXCIgOiBrbGFzc0lkICkgKVxuXG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzICggY29sbGVjdGlvbi53aGVyZSggXCJrbGFzc0lkXCIgOiBrbGFzc0lkICkgKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzICggY29sbGVjdGlvbi53aGVyZSggXCJjdXJyaWN1bHVtSWRcIiA6IGtsYXNzLmdldChcImN1cnJpY3VsdW1JZFwiKSApIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzUGFydGx5Vmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJ0XCIgICAgICAgOiBwYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgICA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudHNcIiAgIDogc3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bVwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc1wiICAgICAgOiBrbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgc3R1ZGVudFN1YnRlc3Q6IChzdHVkZW50SWQsIHN1YnRlc3RJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IFwiX2lkXCIgOiBzdHVkZW50SWRcbiAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3QgXCJfaWRcIiA6IHN1YnRlc3RJZFxuICAgICAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIFRhbmdlcmluZS4kZGIudmlldyBcIiN7VGFuZ2VyaW5lLmRlc2lnbl9kb2N9L3Jlc3VsdHNCeVN0dWRlbnRTdWJ0ZXN0XCIsXG4gICAgICAgICAgICAgICAgICBrZXkgOiBbc3R1ZGVudElkLHN1YnRlc3RJZF1cbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IGNvbGxlY3Rpb24ud2hlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0SWRcIiA6IHN1YnRlc3RJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRJZFwiIDogc3R1ZGVudElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NJZFwiICAgOiBzdHVkZW50LmdldChcImtsYXNzSWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NTdWJ0ZXN0UmVzdWx0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsbFJlc3VsdHNcIiA6IGFsbFJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RcIiAgOiBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudFwiICA6IHN0dWRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwcmV2aW91c1wiIDogcmVzcG9uc2Uucm93cy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHJ1blN1YnRlc3Q6IChzdHVkZW50SWQsIHN1YnRlc3RJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IFwiX2lkXCIgOiBzdWJ0ZXN0SWRcbiAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuXG4gICAgICAgICAgICAjIHRoaXMgZnVuY3Rpb24gZm9yIGxhdGVyLCByZWFsIGNvZGUgYmVsb3dcbiAgICAgICAgICAgIG9uU3R1ZGVudFJlYWR5ID0gKHN0dWRlbnQsIHN1YnRlc3QpIC0+XG4gICAgICAgICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuXG4gICAgICAgICAgICAgICAgICAjIHRoaXMgZnVuY3Rpb24gZm9yIGxhdGVyLCByZWFsIGNvZGUgYmVsb3dcbiAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyA9IChzdHVkZW50LCBzdWJ0ZXN0LCBxdWVzdGlvbj1udWxsLCBsaW5rZWRSZXN1bHQ9e30pIC0+XG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NTdWJ0ZXN0UnVuVmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudFwiICAgICAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0XCIgICAgICA6IHN1YnRlc3RcbiAgICAgICAgICAgICAgICAgICAgICBcInF1ZXN0aW9uc1wiICAgIDogcXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgXCJsaW5rZWRSZXN1bHRcIiA6IGxpbmtlZFJlc3VsdFxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbnVsbFxuICAgICAgICAgICAgICAgICAgaWYgc3VidGVzdC5nZXQoXCJwcm90b3R5cGVcIikgPT0gXCJzdXJ2ZXlcIlxuICAgICAgICAgICAgICAgICAgICBUYW5nZXJpbmUuJGRiLnZpZXcgXCIje1RhbmdlcmluZS5kZXNpZ25fZG9jfS9yZXN1bHRzQnlTdHVkZW50U3VidGVzdFwiLFxuICAgICAgICAgICAgICAgICAgICAgIGtleSA6IFtzdHVkZW50SWQsc3VidGVzdC5nZXQoXCJncmlkTGlua0lkXCIpXVxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJlc3BvbnNlLnJvd3MgIT0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rZWRSZXN1bHQgPSBuZXcgS2xhc3NSZXN1bHQgXy5sYXN0KHJlc3BvbnNlLnJvd3MpPy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogXCJxXCIgKyBzdWJ0ZXN0LmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMocXVlc3Rpb25zLndoZXJlIHtzdWJ0ZXN0SWQgOiBzdWJ0ZXN0SWQgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Moc3R1ZGVudCwgc3VidGVzdCwgcXVlc3Rpb25zLCBsaW5rZWRSZXN1bHQpXG4gICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyhzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgICAjIGVuZCBvZiBvblN0dWRlbnRSZWFkeVxuXG4gICAgICAgICAgICBpZiBzdHVkZW50SWQgPT0gXCJ0ZXN0XCJcbiAgICAgICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IG9uU3R1ZGVudFJlYWR5KCBzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgICAgICAgc3R1ZGVudC5zYXZlIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IG9uU3R1ZGVudFJlYWR5KCBzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgIG9uU3R1ZGVudFJlYWR5KHN0dWRlbnQsIHN1YnRlc3QpXG5cbiAgcmVnaXN0ZXI6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc1VucmVnaXN0ZXJlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBSZWdpc3RlclRlYWNoZXJWaWV3XG4gICAgICAgICAgdXNlciA6IG5ldyBVc2VyXG4gICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIHN0dWRlbnRFZGl0OiAoIHN0dWRlbnRJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBfaWQgOiBzdHVkZW50SWRcbiAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChtb2RlbCkgLT5cbiAgICAgICAgICAgIGFsbEtsYXNzZXMgPSBuZXcgS2xhc3Nlc1xuICAgICAgICAgICAgYWxsS2xhc3Nlcy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAoIGtsYXNzQ29sbGVjdGlvbiApLT5cbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFN0dWRlbnRFZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgc3R1ZGVudCA6IG1vZGVsXG4gICAgICAgICAgICAgICAgICBrbGFzc2VzIDoga2xhc3NDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICAjXG4gICMgQXNzZXNzbWVudFxuICAjXG5cblxuICBkYXRhRW50cnk6ICggYXNzZXNzbWVudElkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudCBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgcXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgIGtleTogXCJxXCIgKyBhc3Nlc3NtZW50SWRcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBxdWVzdGlvbnNCeVN1YnRlc3RJZCA9IHF1ZXN0aW9ucy5pbmRleEJ5KFwic3VidGVzdElkXCIpXG4gICAgICAgICAgICAgICAgZm9yIHN1YnRlc3RJZCwgcXVlc3Rpb25zIG9mIHF1ZXN0aW9uc0J5U3VidGVzdElkXG4gICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50LnN1YnRlc3RzLmdldChzdWJ0ZXN0SWQpLnF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMgcXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudERhdGFFbnRyeVZpZXcgYXNzZXNzbWVudDogYXNzZXNzbWVudFxuXG5cblxuICBzeW5jOiAoIGFzc2Vzc21lbnRJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnQgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHZtLnNob3cgbmV3IEFzc2Vzc21lbnRTeW5jVmlldyBcImFzc2Vzc21lbnRcIjogYXNzZXNzbWVudFxuXG4gIGltcG9ydDogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50SW1wb3J0Vmlld1xuICAgICAgICAgIG5vdW4gOlwiYXNzZXNzbWVudFwiXG4gICAgICAgIHZtLnNob3cgdmlld1xuXG4gIFxuICBhc3Nlc3NtZW50czogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgKHdvcmtmbG93cyA9IG5ldyBXb3JrZmxvd3MpLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cblxuICAgICAgICAgICAgaWYgd29ya2Zsb3dzLmxlbmd0aCA+IDAgJiYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldChcImNvbnRleHRcIikgaXNudCBcInNlcnZlclwiXG5cbiAgICAgICAgICAgICAgZmVlZGJhY2tzID0gbmV3IEZlZWRiYWNrcyBmZWVkYmFja3NcbiAgICAgICAgICAgICAgZmVlZGJhY2tzLmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgV29ya2Zsb3dNZW51Vmlld1xuICAgICAgICAgICAgICAgICAgICB3b3JrZmxvd3MgOiB3b3JrZmxvd3NcbiAgICAgICAgICAgICAgICAgICAgZmVlZGJhY2tzIDogZmVlZGJhY2tzXG4gICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICAgICAgY29sbGVjdGlvbnMgPSBbXG4gICAgICAgICAgICAgIFwiS2xhc3Nlc1wiXG4gICAgICAgICAgICAgIFwiVGVhY2hlcnNcIlxuICAgICAgICAgICAgICBcIkN1cnJpY3VsYVwiXG4gICAgICAgICAgICAgIFwiQXNzZXNzbWVudHNcIlxuICAgICAgICAgICAgICBcIldvcmtmbG93c1wiXG4gICAgICAgICAgICBdXG5cbiAgICAgICAgICAgICMgY29sbGVjdGlvbnMucHVzaCBpZiBcInNlcnZlclwiID09IFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpIHRoZW4gXCJVc2Vyc1wiIGVsc2UgXCJUYWJsZXRVc2Vyc1wiXG4gICAgICAgICAgICBjb2xsZWN0aW9ucy5wdXNoIFwiVXNlcnNcIlxuXG4gICAgICAgICAgICBVdGlscy5sb2FkQ29sbGVjdGlvbnNcbiAgICAgICAgICAgICAgY29sbGVjdGlvbnM6IGNvbGxlY3Rpb25zXG4gICAgICAgICAgICAgIGNvbXBsZXRlOiAob3B0aW9ucykgLT5cbiAgICAgICAgICAgICAgICAjIGxvYWQgZmVlZGJhY2sgbW9kZWxzIGFzc29jaWF0ZWQgd2l0aCB3b3JrZmxvd3NcbiAgICAgICAgICAgICAgICBmZWVkYmFja3MgPSBvcHRpb25zLndvcmtmbG93cy5tb2RlbHMubWFwIChhKSAtPiBuZXcgRmVlZGJhY2sgXCJfaWRcIiA6IFwiI3thLmlkfS1mZWVkYmFja1wiXG4gICAgICAgICAgICAgICAgZmVlZGJhY2tzID0gbmV3IEZlZWRiYWNrcyBmZWVkYmFja3NcbiAgICAgICAgICAgICAgICBmZWVkYmFja3MuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuZmVlZGJhY2tzID0gZmVlZGJhY2tzXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudXNlcnMgPSBvcHRpb25zLnRhYmxldFVzZXJzIHx8IG9wdGlvbnMudXNlcnNcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudHNNZW51VmlldyBvcHRpb25zXG5cbiAgZWRpdElkOiAoaWQpIC0+XG4gICAgaWQgPSBVdGlscy5jbGVhblVSTCBpZFxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgX2lkOiBpZFxuICAgICAgICBhc3Nlc3NtZW50LnN1cGVyRmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogKCBtb2RlbCApIC0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRFZGl0VmlldyBtb2RlbDogbW9kZWxcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG5cbiAgZWRpdDogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGlkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogKCBtb2RlbCApIC0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRFZGl0VmlldyBtb2RlbDogbW9kZWxcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIHJlc3RhcnQ6IChuYW1lKSAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJydW4vI3tuYW1lfVwiLCB0cnVlXG5cbiMgIFdpZGdldFJ1blZpZXcgdGFrZXMgYSBsaXN0IG9mIHN1YnRlc3RzIGFuZCB0aGUgYXNzZXNzbWVudC5cbiAgcnVuOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGRLZXkgPSBKU09OLnN0cmluZ2lmeShpZC5zdWJzdHIoLTUsIDUpKVxuICAgICAgICB1cmwgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgIHR5cGU6IFwiR0VUXCJcbiAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICBkYXRhOiBrZXk6IGRLZXlcbiAgICAgICAgICBlcnJvcjogKGEsIGIpID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgICAgIGRvY0xpc3QgPSBbXVxuICAgICAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuICAgICAgICAgICAgICBkb2NMaXN0LnB1c2ggZGF0dW0uaWRcbiAgICAgICAgICAgICAga2V5TGlzdCA9IF8udW5pcShkb2NMaXN0KVxuICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi5hbGxEb2NzXG4gICAgICAgICAgICAgIGtleXMgOiBrZXlMaXN0XG4gICAgICAgICAgICAgIGluY2x1ZGVfZG9jczp0cnVlXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICBkb2NzID0gW11cbiAgICAgICAgICAgICAgICBmb3Igcm93IGluIHJlc3BvbnNlLnJvd3NcbiAgICAgICAgICAgICAgICAgIGRvY3MucHVzaCByb3cuZG9jXG4jICAgICAgICAgICAgICAgIGJvZHkgPVxuIyAgICAgICAgICAgICAgICAgIGRvY3M6IGRvY3NcbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFdpZGdldFJ1blZpZXcgbW9kZWw6IGRvY3NcbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBwcmludDogKCBhc3Nlc3NtZW50SWQsIGZvcm1hdCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgIFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAoIG1vZGVsICkgLT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudFByaW50Vmlld1xuICAgICAgICAgICAgICBtb2RlbCAgOiBtb2RlbFxuICAgICAgICAgICAgICBmb3JtYXQgOiBmb3JtYXRcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHJlc3VtZTogKGFzc2Vzc21lbnRJZCwgcmVzdWx0SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgIFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAoIGFzc2Vzc21lbnQgKSAtPlxuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3VsdFxuICAgICAgICAgICAgICBcIl9pZFwiIDogcmVzdWx0SWRcbiAgICAgICAgICAgIHJlc3VsdC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzdWx0KSAtPlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudFJ1blZpZXdcbiAgICAgICAgICAgICAgICAgIG1vZGVsOiBhc3Nlc3NtZW50XG5cbiAgICAgICAgICAgICAgICBpZiByZXN1bHQuaGFzKFwib3JkZXJfbWFwXCIpXG4gICAgICAgICAgICAgICAgICAjIHNhdmUgdGhlIG9yZGVyIG1hcCBvZiBwcmV2aW91cyByYW5kb21pemF0aW9uXG4gICAgICAgICAgICAgICAgICBvcmRlck1hcCA9IHJlc3VsdC5nZXQoXCJvcmRlcl9tYXBcIikuc2xpY2UoKSAjIGNsb25lIGFycmF5XG4gICAgICAgICAgICAgICAgICAjIHJlc3RvcmUgdGhlIHByZXZpb3VzIG9yZGVybWFwXG4gICAgICAgICAgICAgICAgICB2aWV3Lm9yZGVyTWFwID0gb3JkZXJNYXBcblxuICAgICAgICAgICAgICAgIGZvciBzdWJ0ZXN0IGluIHJlc3VsdC5nZXQoXCJzdWJ0ZXN0RGF0YVwiKVxuICAgICAgICAgICAgICAgICAgaWYgc3VidGVzdC5kYXRhPyAmJiBzdWJ0ZXN0LmRhdGEucGFydGljaXBhbnRfaWQ/XG4gICAgICAgICAgICAgICAgICAgIFRhbmdlcmluZS5uYXYuc2V0U3R1ZGVudCBzdWJ0ZXN0LmRhdGEucGFydGljaXBhbnRfaWRcblxuICAgICAgICAgICAgICAgICMgcmVwbGFjZSB0aGUgdmlldydzIHJlc3VsdCB3aXRoIG91ciBvbGQgb25lXG4gICAgICAgICAgICAgICAgdmlldy5yZXN1bHQgPSByZXN1bHRcblxuICAgICAgICAgICAgICAgICMgSGlqYWNrIHRoZSBub3JtYWwgUmVzdWx0IGFuZCBSZXN1bHRWaWV3LCB1c2Ugb25lIGZyb20gdGhlIGRiXG4gICAgICAgICAgICAgICAgdmlldy5zdWJ0ZXN0Vmlld3MucG9wKClcbiAgICAgICAgICAgICAgICB2aWV3LnN1YnRlc3RWaWV3cy5wdXNoIG5ldyBSZXN1bHRWaWV3XG4gICAgICAgICAgICAgICAgICBtb2RlbCAgICAgICAgICA6IHJlc3VsdFxuICAgICAgICAgICAgICAgICAgYXNzZXNzbWVudCAgICAgOiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50VmlldyA6IHZpZXdcbiAgICAgICAgICAgICAgICB2aWV3LmluZGV4ID0gcmVzdWx0LmdldChcInN1YnRlc3REYXRhXCIpLmxlbmd0aFxuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cblxuICByZXN1bHRzOiAoYXNzZXNzbWVudElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhZnRlckZldGNoID0gKGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudChcIl9pZFwiOmFzc2Vzc21lbnRJZCksIGFzc2Vzc21lbnRJZCkgLT5cbiAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IFJlc3VsdHNcbiAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICBpbmNsdWRlX2RvY3M6IGZhbHNlXG4gICAgICAgICAgICBrZXk6IFwiclwiICsgYXNzZXNzbWVudElkXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzdWx0cykgPT5cbiAgICAgICAgICAgICAgdmlldyA9IG5ldyBSZXN1bHRzVmlld1xuICAgICAgICAgICAgICAgIFwiYXNzZXNzbWVudFwiIDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICAgIDogcmVzdWx0cy5tb2RlbHNcbiAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICAtPlxuICAgICAgICAgICAgYWZ0ZXJGZXRjaChhc3Nlc3NtZW50LCBhc3Nlc3NtZW50SWQpXG4gICAgICAgICAgZXJyb3IgOiAgLT5cbiAgICAgICAgICAgIGFmdGVyRmV0Y2goYXNzZXNzbWVudCwgYXNzZXNzbWVudElkKVxuXG5cbiAgI1xuICAjIFJlcG9ydHNcbiAgI1xuICBrbGFzc0dyb3VwaW5nOiAoa2xhc3NJZCwgcGFydCkgLT5cbiAgICBwYXJ0ID0gcGFyc2VJbnQocGFydClcbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiAoIGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyBjb2xsZWN0aW9uLndoZXJlIFwicGFydFwiIDogcGFydFxuICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKCByZXN1bHRzICkgLT5cbiAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIHJlc3VsdHMud2hlcmUgXCJrbGFzc0lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgICAgICAgICAgc3R1ZGVudHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cblxuICAgICAgICAgICAgICAgICAgICAgICMgZmlsdGVyIGBSZXN1bHRzYCBieSBgS2xhc3NgJ3MgY3VycmVudCBgU3R1ZGVudHNgXG4gICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgU3R1ZGVudHMgc3R1ZGVudHMud2hlcmUgXCJrbGFzc0lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudElkcyA9IHN0dWRlbnRzLnBsdWNrKFwiX2lkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMgPSBbXVxuICAgICAgICAgICAgICAgICAgICAgIGZvciByZXN1bHQgaW4gcmVzdWx0cy5tb2RlbHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzLnB1c2gocmVzdWx0KSBpZiByZXN1bHQuZ2V0KFwic3R1ZGVudElkXCIpIGluIHN0dWRlbnRJZHNcbiAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzXG5cbiAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzR3JvdXBpbmdWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRzXCIgOiBzdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IGZpbHRlcmVkUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIG1hc3RlcnlDaGVjazogKHN0dWRlbnRJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IFwiX2lkXCIgOiBzdHVkZW50SWRcbiAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChzdHVkZW50KSAtPlxuICAgICAgICAgICAga2xhc3NJZCA9IHN0dWRlbnQuZ2V0IFwia2xhc3NJZFwiXG4gICAgICAgICAgICBrbGFzcyA9IG5ldyBLbGFzcyBcIl9pZFwiIDogc3R1ZGVudC5nZXQgXCJrbGFzc0lkXCJcbiAgICAgICAgICAgIGtsYXNzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChrbGFzcykgLT5cbiAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggY29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIGNvbGxlY3Rpb24ud2hlcmUgXCJzdHVkZW50SWRcIiA6IHN0dWRlbnRJZCwgXCJyZXBvcnRUeXBlXCIgOiBcIm1hc3RlcnlcIiwgXCJrbGFzc0lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAgICAgICAgICAgICMgZ2V0IGEgbGlzdCBvZiBzdWJ0ZXN0cyBpbnZvbHZlZFxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0SWRMaXN0ID0ge31cbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdElkTGlzdFtyZXN1bHQuZ2V0KFwic3VidGVzdElkXCIpXSA9IHRydWUgZm9yIHJlc3VsdCBpbiByZXN1bHRzLm1vZGVsc1xuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0SWRMaXN0ID0gXy5rZXlzKHN1YnRlc3RJZExpc3QpXG5cbiAgICAgICAgICAgICAgICAgICAgIyBtYWtlIGEgY29sbGVjdGlvbiBhbmQgZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdENvbGxlY3Rpb24gPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdENvbGxlY3Rpb24uYWRkIG5ldyBTdWJ0ZXN0KFwiX2lkXCIgOiBzdWJ0ZXN0SWQpIGZvciBzdWJ0ZXN0SWQgaW4gc3VidGVzdElkTGlzdFxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IE1hc3RlcnlDaGVja1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgOiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NcIiAgICA6IGtsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiA6IHN1YnRlc3RDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBwcm9ncmVzc1JlcG9ydDogKHN0dWRlbnRJZCwga2xhc3NJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgIyBzYXZlIHRoaXMgY3JhenkgZnVuY3Rpb24gZm9yIGxhdGVyXG4gICAgICAgICMgc3R1ZGVudElkIGNhbiBoYXZlIHRoZSB2YWx1ZSBcImFsbFwiLCBpbiB3aGljaCBjYXNlIHN0dWRlbnQgc2hvdWxkID09IG51bGxcbiAgICAgICAgYWZ0ZXJGZXRjaCA9ICggc3R1ZGVudCwgc3R1ZGVudHMgKSAtPlxuICAgICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIFwiX2lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChrbGFzcykgLT5cbiAgICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGFsbFN1YnRlc3RzICkgLT5cbiAgICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzIGFsbFN1YnRlc3RzLndoZXJlXG4gICAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bUlkXCIgOiBrbGFzcy5nZXQoXCJjdXJyaWN1bHVtSWRcIilcbiAgICAgICAgICAgICAgICAgICAgXCJyZXBvcnRUeXBlXCIgICA6IFwicHJvZ3Jlc3NcIlxuICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCBjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyBjb2xsZWN0aW9uLndoZXJlIFwia2xhc3NJZFwiIDoga2xhc3NJZCwgXCJyZXBvcnRUeXBlXCIgOiBcInByb2dyZXNzXCJcblxuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIHN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgaWYgc3R1ZGVudHM/XG4gICAgICAgICAgICAgICAgICAgICAgICAjIGZpbHRlciBgUmVzdWx0c2AgYnkgYEtsYXNzYCdzIGN1cnJlbnQgYFN0dWRlbnRzYFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudElkcyA9IHN0dWRlbnRzLnBsdWNrKFwiX2lkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50cyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgcmVzdWx0IGluIHJlc3VsdHMubW9kZWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzLnB1c2gocmVzdWx0KSBpZiByZXN1bHQuZ2V0KFwic3R1ZGVudElkXCIpIGluIHN0dWRlbnRJZHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzXG5cbiAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFByb2dyZXNzVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudFwiICA6IHN0dWRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NcIiAgICA6IGtsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgaWYgc3R1ZGVudElkICE9IFwiYWxsXCJcbiAgICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IGFmdGVyRmV0Y2ggc3R1ZGVudFxuICAgICAgICBlbHNlXG4gICAgICAgICAgc3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICAgICAgICBzdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogLT4gYWZ0ZXJGZXRjaCBudWxsLCBzdHVkZW50c1xuXG4gICNcbiAgIyBTdWJ0ZXN0c1xuICAjXG4gIGVkaXRTdWJ0ZXN0OiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBfaWQgOiBpZFxuICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKG1vZGVsLCByZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgICAgICBcIl9pZFwiIDogc3VidGVzdC5nZXQoXCJhc3Nlc3NtZW50SWRcIilcbiAgICAgICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cblxuICAgICAgICAgICAgICAgICMgQHRvZG8gVGhlIGZpcnN0IGF0dGVtcHQgYXQgZmV0Y2hpbmcgc3VidGVzdHMgbmV2ZXIgaGl0cyBpdHMgc3VjY2VzcyBjYWxsYmFjay4gRGVidWdnaW5nIHRoaXMgaXQncyBub3QgY2xlYXIgd2h5IHRoaXMgaXMgdGhlIGNhc2UuIFxuICAgICAgICAgICAgICAgICMgVGhpcyBzZWNvbmQgdHJ5IGRvZXMgaG93ZXZlciB3b3JrLiBJZiB0aGUgZmlyc3Qgb25lIGRvZXMgc3RhcnQgd29ya2luZyBhZ2FpbiwgdGhpcyBzZWNvbmQgdHJ5IHNob3VsZCBub3QgYWZmZWN0IHRoZSBvdmVyYWxsIHN0YXRlXG4gICAgICAgICAgICAgICAgIyBvZiB0aGUgYXBwbGljYXRpb24uXG4gICAgICAgICAgICAgICAgc3VidGVzdHNQcmltZVRoZVB1bXAgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgICAgICBzdWJ0ZXN0c1ByaW1lVGhlUHVtcC5mZXRjaFxuICAgICAgICAgICAgICAgICAga2V5OiBcInNcIiArIGFzc2Vzc21lbnQuaWRcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiU3VidGVzdHNQcmltZVRoZVB1bXAgc3VjY2VzcyBjYWxsYmFjayBjYWxsZWRcIlxuICAgICAgICAgICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiU3VidGVzdHNQcmltZVRoZVB1bXAgZXJyb3IgY2FsbGJhY2sgY2FsbGVkXCJcbiAgICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyBcbiAgICAgICAgICAgICAgICBzdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAga2V5OiBcInNcIiArIGFzc2Vzc21lbnQuaWRcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSA9PlxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFN1YnRlc3RFZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgIG1vZGVsICAgICAgOiBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgIHN1YnRlc3RzICAgOiBzdWJ0ZXN0cyBcbiAgICAgICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50IDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIGVkaXRLbGFzc1N1YnRlc3Q6IChpZCkgLT5cblxuICAgIG9uU3VjY2VzcyA9IChzdWJ0ZXN0LCBjdXJyaWN1bHVtLCBxdWVzdGlvbnM9bnVsbCkgLT5cbiAgICAgIHZpZXcgPSBuZXcgS2xhc3NTdWJ0ZXN0RWRpdFZpZXdcbiAgICAgICAgbW9kZWwgICAgICA6IHN1YnRlc3RcbiAgICAgICAgY3VycmljdWx1bSA6IGN1cnJpY3VsdW1cbiAgICAgICAgcXVlc3Rpb25zICA6IHF1ZXN0aW9uc1xuICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IF9pZCA6IGlkXG4gICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtXG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBzdWJ0ZXN0LmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QuZ2V0KFwicHJvdG90eXBlXCIpID09IFwic3VydmV5XCJcbiAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICBrZXkgOiBjdXJyaWN1bHVtLmlkXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyBxdWVzdGlvbnMud2hlcmUoXCJzdWJ0ZXN0SWRcIjpzdWJ0ZXN0LmlkKVxuICAgICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyBzdWJ0ZXN0LCBjdXJyaWN1bHVtLCBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Mgc3VidGVzdCwgY3VycmljdWx1bVxuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG5cbiAgI1xuICAjIFF1ZXN0aW9uXG4gICNcbiAgZWRpdFF1ZXN0aW9uOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHF1ZXN0aW9uID0gbmV3IFF1ZXN0aW9uIF9pZCA6IGlkXG4gICAgICAgIHF1ZXN0aW9uLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKHF1ZXN0aW9uLCByZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwiYXNzZXNzbWVudElkXCIpXG4gICAgICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwic3VidGVzdElkXCIpXG4gICAgICAgICAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBRdWVzdGlvbkVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvblwiICAgOiBxdWVzdGlvblxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICAgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgIFwiYXNzZXNzbWVudFwiIDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuXG4gIGVkaXRLbGFzc1F1ZXN0aW9uOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHF1ZXN0aW9uID0gbmV3IFF1ZXN0aW9uIFwiX2lkXCIgOiBpZFxuICAgICAgICBxdWVzdGlvbi5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChxdWVzdGlvbiwgcmVzcG9uc2UpIC0+XG4gICAgICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHF1ZXN0aW9uLmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdFxuICAgICAgICAgICAgICAgICAgXCJfaWRcIiA6IHF1ZXN0aW9uLmdldChcInN1YnRlc3RJZFwiKVxuICAgICAgICAgICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgUXVlc3Rpb25FZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwicXVlc3Rpb25cIiAgIDogcXVlc3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RcIiAgICA6IHN1YnRlc3RcbiAgICAgICAgICAgICAgICAgICAgICBcImFzc2Vzc21lbnRcIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICAjXG4gICMgVXNlclxuICAjXG4gIGxvZ2luOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuICAgICAgaXNVbnJlZ2lzdGVyZWQ6IC0+XG5cbiAgICAgICAgc2hvd1ZpZXcgPSAodXNlcnMgPSBbXSkgLT5cbiAgICAgICAgICB2aWV3ID0gbmV3IExvZ2luVmlld1xuICAgICAgICAgICAgdXNlcnM6IHVzZXJzXG4gICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgc2hvd1ZpZXcoKVxuXG4gIGxvZ291dDogLT5cbiAgICBUYW5nZXJpbmUudXNlci5sb2dvdXQoKVxuXG4gIGFjY291bnQ6IC0+XG4gICAgIyBjaGFuZ2UgdGhlIGxvY2F0aW9uIHRvIHRoZSB0cnVuaywgdW5sZXNzIHdlJ3JlIGFscmVhZHkgaW4gdGhlIHRydW5rXG4gICAgaWYgVGFuZ2VyaW5lLmRiX25hbWUgIT0gXCJ0YW5nZXJpbmVcIlxuICAgICAgd2luZG93LmxvY2F0aW9uID0gVGFuZ2VyaW5lLnNldHRpbmdzLnVybEluZGV4KFwidHJ1bmtcIiwgXCJhY2NvdW50XCIpXG4gICAgZWxzZVxuICAgICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgICB2aWV3ID0gbmV3IEFjY291bnRWaWV3XG4gICAgICAgICAgICB1c2VyIDogVGFuZ2VyaW5lLnVzZXJcbiAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBzZXR0aW5nczogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBTZXR0aW5nc1ZpZXdcbiAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICBsb2dzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBsb2dzID0gbmV3IExvZ3NcbiAgICAgICAgbG9ncy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IExvZ1ZpZXdcbiAgICAgICAgICAgICAgbG9nczogbG9nc1xuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuXG5cbiAgIyBUcmFuc2ZlciBhIG5ldyB1c2VyIGZyb20gdGFuZ2VyaW5lLWNlbnRyYWwgaW50byB0YW5nZXJpbmVcbiAgdHJhbnNmZXI6IC0+XG4gICAgZ2V0VmFycyA9IFV0aWxzLiRfR0VUKClcbiAgICBuYW1lID0gZ2V0VmFycy5uYW1lXG4gICAgJC5jb3VjaC5sb2dvdXRcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICQuY29va2llIFwiQXV0aFNlc3Npb25cIiwgbnVsbFxuICAgICAgICAkLmNvdWNoLmxvZ2luXG4gICAgICAgICAgXCJuYW1lXCIgICAgIDogbmFtZVxuICAgICAgICAgIFwicGFzc3dvcmRcIiA6IG5hbWVcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgJC5jb3VjaC5zaWdudXBcbiAgICAgICAgICAgICAgXCJuYW1lXCIgOiAgbmFtZVxuICAgICAgICAgICAgICBcInJvbGVzXCIgOiBbXCJfYWRtaW5cIl1cbiAgICAgICAgICAgICwgbmFtZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgIHVzZXIgPSBuZXcgVXNlclxuICAgICAgICAgICAgICB1c2VyLnNhdmVcbiAgICAgICAgICAgICAgICBcIm5hbWVcIiAgOiBuYW1lXG4gICAgICAgICAgICAgICAgXCJpZFwiICAgIDogXCJ0YW5nZXJpbmUudXNlcjpcIituYW1lXG4gICAgICAgICAgICAgICAgXCJyb2xlc1wiIDogW11cbiAgICAgICAgICAgICAgICBcImZyb21cIiAgOiBcInRjXCJcbiAgICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIHdhaXQ6IHRydWVcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgJC5jb3VjaC5sb2dpblxuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIiAgICAgOiBuYW1lXG4gICAgICAgICAgICAgICAgICAgIFwicGFzc3dvcmRcIiA6IG5hbWVcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyA6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgVXRpbHMuc3RpY2t5IFwiRXJyb3IgdHJhbnNmZXJpbmcgdXNlci5cIlxuIl19
