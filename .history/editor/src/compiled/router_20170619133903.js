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
                            key: subtest.get("curriculumId"),
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
              key: assessmentId,
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
                    var view;
                    options.feedbacks = feedbacks;
                    options.users = options.tabletUsers || options.users;
                    if (!Tangerine.user.isAdmin() && Tangerine.settings.get('showWorkflows') === true) {
                      view = new WorkflowMenuMemberView(options);
                      vm.show(view);
                      return $('#content').html(view.el);
                    } else {
                      return vm.show(new AssessmentsMenuView(options));
                    }
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
              docList = ["location-list"];
              ref = data.rows;
              for (i = 0, len = ref.length; i < len; i++) {
                datum = ref[i];
                docList.push(datum.id);
              }
              keyList = _.uniq(docList);
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
                  key: assessment.id,
                  success: function() {
                    return console.log("SubtestsPrimeThePump success callback called");
                  },
                  error: function() {
                    return console.log("SubtestsPrimeThePump error callback called");
                  }
                });
                subtests = new Subtests;
                return subtests.fetch({
                  key: assessment.id,
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwL3JvdXRlci5qcyIsInNvdXJjZXMiOlsiYXBwL3JvdXRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBQSxNQUFBO0VBQUE7Ozs7QUFBTTs7Ozs7OzttQkFPSixPQUFBLEdBQVMsU0FBQyxRQUFELEVBQVcsSUFBWCxFQUFpQixJQUFqQjtJQUNQLENBQUEsQ0FBRSxTQUFGLENBQVksQ0FBQyxJQUFiLENBQUE7SUFDQSxJQUFJLFFBQUo7YUFDRSxRQUFRLENBQUMsS0FBVCxDQUFlLElBQWYsRUFBcUIsSUFBckIsRUFERjs7RUFGTzs7bUJBS1QsTUFBQSxHQUVFO0lBQUEsMkJBQUEsRUFBOEIsY0FBOUI7SUFDQSwwQkFBQSxFQUE4QixhQUQ5QjtJQUVBLHFDQUFBLEVBQXlDLGdCQUZ6QztJQUlBLDJCQUFBLEVBQThCLGNBSjlCO0lBS0Esc0JBQUEsRUFBOEIsVUFMOUI7SUFPQSxPQUFBLEVBQWEsT0FQYjtJQVFBLFVBQUEsRUFBYSxVQVJiO0lBU0EsUUFBQSxFQUFhLFFBVGI7SUFVQSxTQUFBLEVBQWEsU0FWYjtJQVlBLFVBQUEsRUFBYSxVQVpiO0lBY0EsVUFBQSxFQUFhLFVBZGI7SUFlQSxRQUFBLEVBQVcsUUFmWDtJQWlCQSxFQUFBLEVBQUssU0FqQkw7SUFtQkEsTUFBQSxFQUFTLE1BbkJUO0lBc0JBLE9BQUEsRUFBbUIsT0F0Qm5CO0lBdUJBLGdCQUFBLEVBQW1CLFdBdkJuQjtJQXdCQSwwQkFBQSxFQUFvQyxhQXhCcEM7SUF5QkEsaUNBQUEsRUFBb0MsZUF6QnBDO0lBMEJBLG1CQUFBLEVBQXNCLGtCQTFCdEI7SUEyQkEsb0JBQUEsRUFBdUIsbUJBM0J2QjtJQTZCQSxpQkFBQSxFQUFvQixhQTdCcEI7SUE4QkEsV0FBQSxFQUFvQixhQTlCcEI7SUFnQ0EsaUNBQUEsRUFBb0MsWUFoQ3BDO0lBa0NBLG9EQUFBLEVBQXVELGdCQWxDdkQ7SUFvQ0EsV0FBQSxFQUFzQixXQXBDdEI7SUFxQ0EsZ0JBQUEsRUFBc0IsWUFyQ3RCO0lB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Q0FGVDtZQUtBLEtBQUEsRUFBTyxTQUFBO3FCQUNMLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBUixDQUNFO2dCQUFBLE1BQUEsRUFBVSxJQUFWO2dCQUNBLE9BQUEsRUFBVSxDQUFDLFFBQUQsQ0FEVjtlQURGLEVBR0UsSUFIRixFQUlBO2dCQUFBLE9BQUEsRUFBUyxTQUFBO0FBQ1Asc0JBQUE7a0JBQUEsSUFBQSxHQUFPLElBQUk7eUJBQ1gsSUFBSSxDQUFDLElBQUwsQ0FDRTtvQkFBQSxNQUFBLEVBQVUsSUFBVjtvQkFDQSxJQUFBLEVBQVUsaUJBQUEsR0FBa0IsSUFENUI7b0JBRUEsT0FBQSxFQUFVLEVBRlY7b0JBR0EsTUFBQSxFQUFVLElBSFY7bUJBREYsRUFNRTtvQkFBQSxJQUFBLEVBQU0sSUFBTjtvQkFDQSxPQUFBLEVBQVMsU0FBQTs2QkFDUCxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQVIsQ0FDRTt3QkFBQSxNQUFBLEVBQWEsSUFBYjt3QkFDQSxVQUFBLEVBQWEsSUFEYjt3QkFFQSxPQUFBLEVBQVUsU0FBQTswQkFDUixTQUFTLENBQUMsTUFBTSxDQUFDLE9BQWpCLENBQUE7aUNBQ0EsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixDQUFBO3dCQUZRLENBRlY7d0JBS0EsS0FBQSxFQUFPLFNBQUE7aUNBQ0wsS0FBSyxDQUFDLE1BQU4sQ0FBYSx5QkFBYjt3QkFESyxDQUxQO3VCQURGO29CQURPLENBRFQ7bUJBTkY7Z0JBRk8sQ0FBVDtlQUpBO1lBREssQ0FMUDtXQURGO1FBRk87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7S0FERjtFQUhROzs7O0dBNThCUyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSb3V0ZXIgZXh0ZW5kcyBCYWNrYm9uZS5Sb3V0ZXJcbiMgIGJlZm9yZTogKCkgLT5cbiMgICAgY29uc29sZS5sb2coJ2JlZm9yZScpXG4jICAgICQoJyNmb290ZXInKS5zaG93KClcbiNcbiMgIGFmdGVyOiAoKSAtPlxuIyAgICBjb25zb2xlLmxvZygnYWZ0ZXInKTtcbiAgZXhlY3V0ZTogKGNhbGxiYWNrLCBhcmdzLCBuYW1lKSAtPlxuICAgICQoJyNmb290ZXInKS5zaG93KClcbiAgICBpZiAoY2FsbGJhY2spXG4gICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmdzKVxuXG4gIHJvdXRlczpcblxuICAgICd3b3JrZmxvdy9lZGl0Lzp3b3JrZmxvd0lkJyA6ICd3b3JrZmxvd0VkaXQnXG4gICAgJ3dvcmtmbG93L3J1bi86d29ya2Zsb3dJZCcgIDogJ3dvcmtmbG93UnVuJ1xuICAgICd3b3JrZmxvdy9yZXN1bWUvOndvcmtmbG93SWQvOnRyaXBJZCcgIDogJ3dvcmtmbG93UmVzdW1lJ1xuXG4gICAgJ2ZlZWRiYWNrL2VkaXQvOndvcmtmbG93SWQnIDogJ2ZlZWRiYWNrRWRpdCdcbiAgICAnZmVlZGJhY2svOndvcmtmbG93SWQnICAgICAgOiAnZmVlZGJhY2snXG5cbiAgICAnbG9naW4nICAgIDogJ2xvZ2luJ1xuICAgICdyZWdpc3RlcicgOiAncmVnaXN0ZXInXG4gICAgJ2xvZ291dCcgICA6ICdsb2dvdXQnXG4gICAgJ2FjY291bnQnICA6ICdhY2NvdW50J1xuXG4gICAgJ3RyYW5zZmVyJyA6ICd0cmFuc2ZlcidcblxuICAgICdzZXR0aW5ncycgOiAnc2V0dGluZ3MnXG4gICAgJ3VwZGF0ZScgOiAndXBkYXRlJ1xuXG4gICAgJycgOiAnbGFuZGluZydcblxuICAgICdsb2dzJyA6ICdsb2dzJ1xuXG4gICAgIyBDbGFzc1xuICAgICdjbGFzcycgICAgICAgICAgOiAna2xhc3MnXG4gICAgJ2NsYXNzL2VkaXQvOmlkJyA6ICdrbGFzc0VkaXQnXG4gICAgJ2NsYXNzL3N0dWRlbnQvOnN0dWRlbnRJZCcgICAgICAgIDogJ3N0dWRlbnRFZGl0J1xuICAgICdjbGFzcy9zdHVkZW50L3JlcG9ydC86c3R1ZGVudElkJyA6ICdzdHVkZW50UmVwb3J0J1xuICAgICdjbGFzcy9zdWJ0ZXN0LzppZCcgOiAnZWRpdEtsYXNzU3VidGVzdCdcbiAgICAnY2xhc3MvcXVlc3Rpb24vOmlkJyA6IFwiZWRpdEtsYXNzUXVlc3Rpb25cIlxuXG4gICAgJ2NsYXNzLzppZC86cGFydCcgOiAna2xhc3NQYXJ0bHknXG4gICAgJ2NsYXNzLzppZCcgICAgICAgOiAna2xhc3NQYXJ0bHknXG5cbiAgICAnY2xhc3MvcnVuLzpzdHVkZW50SWQvOnN1YnRlc3RJZCcgOiAncnVuU3VidGVzdCdcblxuICAgICdjbGFzcy9yZXN1bHQvc3R1ZGVudC9zdWJ0ZXN0LzpzdHVkZW50SWQvOnN1YnRlc3RJZCcgOiAnc3R1ZGVudFN1YnRlc3QnXG5cbiAgICAnY3VycmljdWxhJyAgICAgICAgIDogJ2N1cnJpY3VsYSdcbiAgICAnY3VycmljdWx1bS86aWQnICAgIDogJ2N1cnJpY3VsdW0nXG4gICAgJ2N1cnJpY3VsdW1JbXBvcnQnICA6ICdjdXJyaWN1bHVtSW1wb3J0J1xuXG4gICAgJ3JlcG9ydC9rbGFzc0dyb3VwaW5nLzprbGFzc0lkLzpwYXJ0JyA6ICdrbGFzc0dyb3VwaW5nJ1xuICAgICdyZXBvcnQvbWFzdGVyeUNoZWNrLzpzdHVkZW50SWQnICAgICAgOiAnbWFzdGVyeUNoZWNrJ1xuICAgICdyZXBvcnQvcHJvZ3Jlc3MvOnN0dWRlbnRJZC86a2xhc3NJZCcgOiAncHJvZ3Jlc3NSZXBvcnQnXG5cblxuICAgICMgc2VydmVyIC8gbW9iaWxlXG4gICAgJ2dyb3VwcycgOiAnZ3JvdXBzJ1xuXG4gICAgJ2Fzc2Vzc21lbnRzJyAgICAgICAgOiAnYXNzZXNzbWVudHMnXG5cbiAgICAncnVuLzppZCcgICAgICAgOiAncnVuJ1xuICAgICdwcmludC86aWQvOmZvcm1hdCcgICAgICAgOiAncHJpbnQnXG4gICAgJ2RhdGFFbnRyeS86aWQnIDogJ2RhdGFFbnRyeSdcblxuICAgICdyZXN1bWUvOmFzc2Vzc21lbnRJZC86cmVzdWx0SWQnICAgIDogJ3Jlc3VtZSdcblxuICAgICdyZXN0YXJ0LzppZCcgICA6ICdyZXN0YXJ0J1xuICAgICdlZGl0LzppZCcgICAgICA6ICdlZGl0J1xuICAgICdyZXN1bHRzLzppZCcgICA6ICdyZXN1bHRzJ1xuICAgICdpbXBvcnQnICAgICAgICA6ICdpbXBvcnQnXG5cbiAgICAnc3VidGVzdC86aWQnICAgICAgIDogJ2VkaXRTdWJ0ZXN0J1xuXG4gICAgJ3F1ZXN0aW9uLzppZCcgOiAnZWRpdFF1ZXN0aW9uJ1xuICAgICdkYXNoYm9hcmQnIDogJ2Rhc2hib2FyZCdcbiAgICAnZGFzaGJvYXJkLypvcHRpb25zJyA6ICdkYXNoYm9hcmQnXG4gICAgJ2FkbWluJyA6ICdhZG1pbidcblxuICAgICdzeW5jLzppZCcgICAgICA6ICdzeW5jJ1xuXG4gIGZlZWRiYWNrRWRpdDogKCB3b3JrZmxvd0lkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cblxuICAgICAgICBzaG93RmVlZGJhY2tFZGl0b3IgPSAoIGZlZWRiYWNrLCB3b3JrZmxvdyApIC0+XG4gICAgICAgICAgZmVlZGJhY2sudXBkYXRlQ29sbGVjdGlvbigpXG4gICAgICAgICAgdmlldyA9IG5ldyBGZWVkYmFja0VkaXRWaWV3XG4gICAgICAgICAgICBmZWVkYmFjazogZmVlZGJhY2tcbiAgICAgICAgICAgIHdvcmtmbG93OiB3b3JrZmxvd1xuICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gICAgICAgIHdvcmtmbG93ID0gbmV3IFdvcmtmbG93IFwiX2lkXCIgOiB3b3JrZmxvd0lkXG4gICAgICAgIHdvcmtmbG93LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGZlZWRiYWNrSWQgPSBcIiN7d29ya2Zsb3dJZH0tZmVlZGJhY2tcIlxuICAgICAgICAgICAgZmVlZGJhY2sgICA9IG5ldyBGZWVkYmFjayBcIl9pZFwiIDogZmVlZGJhY2tJZFxuICAgICAgICAgICAgZmVlZGJhY2suZmV0Y2hcbiAgICAgICAgICAgICAgZXJyb3I6ICAgLT4gZmVlZGJhY2suc2F2ZSBudWxsLCBzdWNjZXNzOiAtPiBzaG93RmVlZGJhY2tFZGl0b3IoZmVlZGJhY2ssIHdvcmtmbG93KVxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPiBzaG93RmVlZGJhY2tFZGl0b3IoZmVlZGJhY2ssIHdvcmtmbG93KVxuXG4gIGZlZWRiYWNrOiAoIHdvcmtmbG93SWQgKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuXG4gICAgICAgIHdvcmtmbG93ID0gbmV3IFdvcmtmbG93IFwiX2lkXCIgOiB3b3JrZmxvd0lkXG4gICAgICAgIHdvcmtmbG93LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGZlZWRiYWNrSWQgPSBcIiN7d29ya2Zsb3dJZH0tZmVlZGJhY2tcIlxuICAgICAgICAgICAgZmVlZGJhY2sgPSBuZXcgRmVlZGJhY2sgXCJfaWRcIiA6IGZlZWRiYWNrSWRcbiAgICAgICAgICAgIGZlZWRiYWNrLmZldGNoXG4gICAgICAgICAgICAgIGVycm9yOiAtPiBVdGlscy5taWRBbGVydCBcIk5vIGZlZWRiYWNrIGRlZmluZWRcIlxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGZlZWRiYWNrLnVwZGF0ZUNvbGxlY3Rpb24oKVxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgRmVlZGJhY2tUcmlwc1ZpZXdcbiAgICAgICAgICAgICAgICAgIGZlZWRiYWNrIDogZmVlZGJhY2tcbiAgICAgICAgICAgICAgICAgIHdvcmtmbG93IDogd29ya2Zsb3dcbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG5cblxuXG4gIHdvcmtmbG93RWRpdDogKCB3b3JrZmxvd0lkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cblxuICAgICAgICB3b3JrZmxvdyA9IG5ldyBXb3JrZmxvdyBcIl9pZFwiIDogd29ya2Zsb3dJZFxuICAgICAgICB3b3JrZmxvdy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IFdvcmtmbG93RWRpdFZpZXcgd29ya2Zsb3cgOiB3b3JrZmxvd1xuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgd29ya2Zsb3dSdW46ICggd29ya2Zsb3dJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG5cbiAgICAgICAgd29ya2Zsb3cgPSBuZXcgV29ya2Zsb3cgXCJfaWRcIiA6IHdvcmtmbG93SWRcbiAgICAgICAgd29ya2Zsb3cuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgd29ya2Zsb3cudXBkYXRlQ29sbGVjdGlvbigpXG4gICAgICAgICAgICB2aWV3ID0gbmV3IFdvcmtmbG93UnVuVmlld1xuICAgICAgICAgICAgICB3b3JrZmxvdzogd29ya2Zsb3dcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHdvcmtmbG93UmVzdW1lOiAoIHdvcmtmbG93SWQsIHRyaXBJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG5cbiAgICAgICAgd29ya2Zsb3cgPSBuZXcgV29ya2Zsb3cgXCJfaWRcIiA6IHdvcmtmbG93SWRcbiAgICAgICAgd29ya2Zsb3cuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi52aWV3IFRhbmdlcmluZS5kZXNpZ25fZG9jK1wiL3RyaXBzQW5kVXNlcnNcIixcbiAgICAgICAgICAgICAga2V5OiB0cmlwSWRcbiAgICAgICAgICAgICAgaW5jbHVkZV9kb2NzOiB0cnVlXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgICAgIGluZGV4ID0gTWF0aC5tYXgoZGF0YS5yb3dzLmxlbmd0aCAtIDEsIDApXG5cbiAgICAgICAgICAgICAgICAjIGFkZCBvbGQgcmVzdWx0c1xuICAgICAgICAgICAgICAgIHN0ZXBzID0gW11cbiAgICAgICAgICAgICAgICBmb3IgaiBpbiBbMC4uaW5kZXhdXG4gICAgICAgICAgICAgICAgICBzdGVwcy5wdXNoIHtyZXN1bHQgOiBuZXcgUmVzdWx0IGRhdGEucm93c1tqXS5kb2N9XG5cbiAgICAgICAgICAgICAgICBhc3Nlc3NtZW50UmVzdW1lSW5kZXggPSBkYXRhLnJvd3NbaW5kZXhdPy5kb2M/LnN1YnRlc3REYXRhPy5sZW5ndGggfHwgMFxuXG4gICAgICAgICAgICAgICAgIyMjXG4gICAgICAgICAgICAgICAgICBpZiBkYXRhLnJvd3NbaW5kZXhdPy5kb2M/Lm9yZGVyX21hcD9cbiAgICAgICAgICAgICAgICAgICMgc2F2ZSB0aGUgb3JkZXIgbWFwIG9mIHByZXZpb3VzIHJhbmRvbWl6YXRpb25cbiAgICAgICAgICAgICAgICAgIG9yZGVyTWFwID0gcmVzdWx0LmdldChcIm9yZGVyX21hcFwiKS5zbGljZSgpICMgY2xvbmUgYXJyYXlcbiAgICAgICAgICAgICAgICAgICMgcmVzdG9yZSB0aGUgcHJldmlvdXMgb3JkZXJtYXBcbiAgICAgICAgICAgICAgICAgIHZpZXcub3JkZXJNYXAgPSBvcmRlck1hcFxuXG4gICAgICAgICAgICAgICAgIyMjXG5cbiAgICAgICAgICAgICAgICB3b3JrZmxvdyA9IG5ldyBXb3JrZmxvdyBcIl9pZFwiIDogd29ya2Zsb3dJZFxuICAgICAgICAgICAgICAgIHdvcmtmbG93LmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuXG4gICAgICAgICAgICAgICAgICAgIGluY29tcGxldGUgPSBUYW5nZXJpbmUudXNlci5nZXRQcmVmZXJlbmNlcyhcInR1dG9yLXdvcmtmbG93c1wiLCBcImluY29tcGxldGVcIilcblxuICAgICAgICAgICAgICAgICAgICBpbmNvbXBsZXRlW3dvcmtmbG93SWRdID0gXyhpbmNvbXBsZXRlW3dvcmtmbG93SWRdKS53aXRob3V0IHRyaXBJZFxuXG4gICAgICAgICAgICAgICAgICAgIFRhbmdlcmluZS51c2VyLmdldFByZWZlcmVuY2VzKFwidHV0b3Itd29ya2Zsb3dzXCIsIFwiaW5jb21wbGV0ZVwiLCBpbmNvbXBsZXRlKVxuXG4gICAgICAgICAgICAgICAgICAgIHdvcmtmbG93LnVwZGF0ZUNvbGxlY3Rpb24oKVxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFdvcmtmbG93UnVuVmlld1xuICAgICAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnRSZXN1bWVJbmRleCA6IGFzc2Vzc21lbnRSZXN1bWVJbmRleFxuICAgICAgICAgICAgICAgICAgICAgIHdvcmtmbG93OiB3b3JrZmxvd1xuICAgICAgICAgICAgICAgICAgICAgIHRyaXBJZCAgOiB0cmlwSWRcbiAgICAgICAgICAgICAgICAgICAgICBpbmRleCAgIDogaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgICBzdGVwcyAgIDogc3RlcHNcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuXG5cblxuICBhZG1pbjogKG9wdGlvbnMpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICAkLmNvdWNoLmFsbERic1xuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhYmFzZXMpID0+XG4gICAgICAgICAgICBncm91cHMgPSBkYXRhYmFzZXMuZmlsdGVyIChkYXRhYmFzZSkgLT4gZGF0YWJhc2UuaW5kZXhPZihcImdyb3VwLVwiKSA9PSAwXG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFkbWluVmlld1xuICAgICAgICAgICAgICBncm91cHMgOiBncm91cHNcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGRhc2hib2FyZDogKG9wdGlvbnMpIC0+XG4gICAgb3B0aW9ucyA9IG9wdGlvbnM/LnNwbGl0KC9cXC8vKVxuICAgIGNvbnNvbGUubG9nKFwib3B0aW9uczogXCIgKyBvcHRpb25zKVxuICAgICNkZWZhdWx0IHZpZXcgb3B0aW9uc1xuICAgIHJlcG9ydFZpZXdPcHRpb25zID1cbiAgICAgIGFzc2Vzc21lbnQ6IFwiQWxsXCJcbiAgICAgIGdyb3VwQnk6IFwiZW51bWVyYXRvclwiXG5cbiAgICAjIEFsbG93cyB1cyB0byBnZXQgbmFtZS92YWx1ZSBwYWlycyBmcm9tIFVSTFxuICAgIF8uZWFjaCBvcHRpb25zLCAob3B0aW9uLGluZGV4KSAtPlxuICAgICAgdW5sZXNzIGluZGV4ICUgMlxuICAgICAgICByZXBvcnRWaWV3T3B0aW9uc1tvcHRpb25dID0gb3B0aW9uc1tpbmRleCsxXVxuXG4gICAgdmlldyA9IG5ldyBEYXNoYm9hcmRWaWV3ICByZXBvcnRWaWV3T3B0aW9uc1xuXG4gICAgdm0uc2hvdyB2aWV3XG5cbiAgbGFuZGluZzogLT5cblxuICAgIGlmIH5TdHJpbmcod2luZG93LmxvY2F0aW9uLmhyZWYpLmluZGV4T2YoXCJhcHAvdGFuZ2VyaW5lL1wiKSAjIGluIG1haW4gZ3JvdXA/XG4gICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiZ3JvdXBzXCIsIHRydWVcbiAgICBlbHNlXG4gICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiYXNzZXNzbWVudHNcIiwgdHJ1ZVxuXG5cbiAgZ3JvdXBzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IEdyb3Vwc1ZpZXdcbiAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgI1xuICAjIENsYXNzXG4gICNcbiAgY3VycmljdWxhOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBjdXJyaWN1bGEgPSBuZXcgQ3VycmljdWxhXG4gICAgICAgIGN1cnJpY3VsYS5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgdmlldyA9IG5ldyBDdXJyaWN1bGFWaWV3XG4gICAgICAgICAgICAgIFwiY3VycmljdWxhXCIgOiBjb2xsZWN0aW9uXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBjdXJyaWN1bHVtOiAoY3VycmljdWx1bUlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW0gXCJfaWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzIGFsbFN1YnRlc3RzLndoZXJlIFwiY3VycmljdWx1bUlkXCIgOiBjdXJyaWN1bHVtSWRcbiAgICAgICAgICAgICAgICBhbGxRdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgYWxsUXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBbXVxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0cy5lYWNoIChzdWJ0ZXN0KSAtPiBxdWVzdGlvbnMgPSBxdWVzdGlvbnMuY29uY2F0KGFsbFF1ZXN0aW9ucy53aGVyZSBcInN1YnRlc3RJZFwiIDogc3VidGVzdC5pZCApXG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMgcXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgQ3VycmljdWx1bVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBcImN1cnJpY3VsdW1cIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgICA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvbnNcIiAgOiBxdWVzdGlvbnNcblxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIGN1cnJpY3VsdW1FZGl0OiAoY3VycmljdWx1bUlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW0gXCJfaWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gYWxsU3VidGVzdHMud2hlcmUgXCJjdXJyaWN1bHVtSWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICAgICAgICAgIGFsbFBhcnRzID0gKHN1YnRlc3QuZ2V0KFwicGFydFwiKSBmb3Igc3VidGVzdCBpbiBzdWJ0ZXN0cylcbiAgICAgICAgICAgICAgICBwYXJ0Q291bnQgPSBNYXRoLm1heC5hcHBseSBNYXRoLCBhbGxQYXJ0c1xuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgQ3VycmljdWx1bVZpZXdcbiAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bVwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgIFwicGFydHNcIiA6IHBhcnRDb3VudFxuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgY3VycmljdWx1bUltcG9ydDogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50SW1wb3J0Vmlld1xuICAgICAgICAgIG5vdW4gOiBcImN1cnJpY3VsdW1cIlxuICAgICAgICB2bS5zaG93IHZpZXdcblxuICBrbGFzczogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYWxsS2xhc3NlcyA9IG5ldyBLbGFzc2VzXG4gICAgICAgIGFsbEtsYXNzZXMuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAoIGtsYXNzQ29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBUZWFjaGVyc1xuICAgICAgICAgICAgdGVhY2hlcnMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBhbGxDdXJyaWN1bGEgPSBuZXcgQ3VycmljdWxhXG4gICAgICAgICAgICAgICAgYWxsQ3VycmljdWxhLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGN1cnJpY3VsYUNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG4gICAgICAgICAgICAgICAgICAgICAga2xhc3NDb2xsZWN0aW9uID0gbmV3IEtsYXNzZXMga2xhc3NDb2xsZWN0aW9uLndoZXJlKFwidGVhY2hlcklkXCIgOiBUYW5nZXJpbmUudXNlci5nZXQoXCJ0ZWFjaGVySWRcIikpXG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3Nlc1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBrbGFzc2VzICAgOiBrbGFzc0NvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICBjdXJyaWN1bGEgOiBjdXJyaWN1bGFDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgdGVhY2hlcnMgIDogdGVhY2hlcnNcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAga2xhc3NFZGl0OiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIF9pZCA6IGlkXG4gICAgICAgIGtsYXNzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKCBtb2RlbCApIC0+XG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBUZWFjaGVyc1xuICAgICAgICAgICAgdGVhY2hlcnMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBhbGxTdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoYWxsU3R1ZGVudHMpIC0+XG4gICAgICAgICAgICAgICAgICAgIGtsYXNzU3R1ZGVudHMgPSBuZXcgU3R1ZGVudHMgYWxsU3R1ZGVudHMud2hlcmUge2tsYXNzSWQgOiBpZH1cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc0VkaXRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAga2xhc3MgICAgICAgOiBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzICAgIDoga2xhc3NTdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzIDogYWxsU3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICB0ZWFjaGVycyAgICA6IHRlYWNoZXJzXG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGtsYXNzUGFydGx5OiAoa2xhc3NJZCwgcGFydD1udWxsKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBrbGFzcyA9IG5ldyBLbGFzcyBcIl9pZFwiIDoga2xhc3NJZFxuICAgICAgICBrbGFzcy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW0gXCJfaWRcIiA6IGtsYXNzLmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50cyAoIGNvbGxlY3Rpb24ud2hlcmUoIFwia2xhc3NJZFwiIDoga2xhc3NJZCApIClcblxuICAgICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyAoIGNvbGxlY3Rpb24ud2hlcmUoIFwia2xhc3NJZFwiIDoga2xhc3NJZCApIClcblxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyAoIGNvbGxlY3Rpb24ud2hlcmUoIFwiY3VycmljdWx1bUlkXCIgOiBrbGFzcy5nZXQoXCJjdXJyaWN1bHVtSWRcIikgKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc1BhcnRseVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFydFwiICAgICAgIDogcGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiICAgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgICAgOiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRzXCIgICA6IHN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImN1cnJpY3VsdW1cIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NcIiAgICAgIDoga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIHN0dWRlbnRTdWJ0ZXN0OiAoc3R1ZGVudElkLCBzdWJ0ZXN0SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBcIl9pZFwiIDogc3R1ZGVudElkXG4gICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IFwiX2lkXCIgOiBzdWJ0ZXN0SWRcbiAgICAgICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBUYW5nZXJpbmUuJGRiLnZpZXcgXCIje1RhbmdlcmluZS5kZXNpZ25fZG9jfS9yZXN1bHRzQnlTdHVkZW50U3VidGVzdFwiLFxuICAgICAgICAgICAgICAgICAga2V5IDogW3N0dWRlbnRJZCxzdWJ0ZXN0SWRdXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+XG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBjb2xsZWN0aW9uLndoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdElkXCIgOiBzdWJ0ZXN0SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50SWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcImtsYXNzSWRcIiAgIDogc3R1ZGVudC5nZXQoXCJrbGFzc0lkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzU3VidGVzdFJlc3VsdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGxSZXN1bHRzXCIgOiBhbGxSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0XCIgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwicHJldmlvdXNcIiA6IHJlc3BvbnNlLnJvd3MubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBydW5TdWJ0ZXN0OiAoc3R1ZGVudElkLCBzdWJ0ZXN0SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBcIl9pZFwiIDogc3VidGVzdElkXG4gICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IFwiX2lkXCIgOiBzdHVkZW50SWRcblxuICAgICAgICAgICAgIyB0aGlzIGZ1bmN0aW9uIGZvciBsYXRlciwgcmVhbCBjb2RlIGJlbG93XG4gICAgICAgICAgICBvblN0dWRlbnRSZWFkeSA9IChzdHVkZW50LCBzdWJ0ZXN0KSAtPlxuICAgICAgICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cblxuICAgICAgICAgICAgICAgICAgIyB0aGlzIGZ1bmN0aW9uIGZvciBsYXRlciwgcmVhbCBjb2RlIGJlbG93XG4gICAgICAgICAgICAgICAgICBvblN1Y2Nlc3MgPSAoc3R1ZGVudCwgc3VidGVzdCwgcXVlc3Rpb249bnVsbCwgbGlua2VkUmVzdWx0PXt9KSAtPlxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzU3VidGVzdFJ1blZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgICAgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICAgICAgOiBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvbnNcIiAgICA6IHF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgIFwibGlua2VkUmVzdWx0XCIgOiBsaW5rZWRSZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG51bGxcbiAgICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QuZ2V0KFwicHJvdG90eXBlXCIpID09IFwic3VydmV5XCJcbiAgICAgICAgICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi52aWV3IFwiI3tUYW5nZXJpbmUuZGVzaWduX2RvY30vcmVzdWx0c0J5U3R1ZGVudFN1YnRlc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICBrZXkgOiBbc3R1ZGVudElkLHN1YnRlc3QuZ2V0KFwiZ3JpZExpbmtJZFwiKV1cbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiByZXNwb25zZS5yb3dzICE9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua2VkUmVzdWx0ID0gbmV3IEtsYXNzUmVzdWx0IF8ubGFzdChyZXNwb25zZS5yb3dzKT8udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IFwicVwiICsgc3VidGVzdC5nZXQoXCJjdXJyaWN1bHVtSWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zKHF1ZXN0aW9ucy53aGVyZSB7c3VidGVzdElkIDogc3VidGVzdElkIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzKHN0dWRlbnQsIHN1YnRlc3QsIHF1ZXN0aW9ucywgbGlua2VkUmVzdWx0KVxuICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Moc3R1ZGVudCwgc3VidGVzdClcbiAgICAgICAgICAgICAgIyBlbmQgb2Ygb25TdHVkZW50UmVhZHlcblxuICAgICAgICAgICAgaWYgc3R1ZGVudElkID09IFwidGVzdFwiXG4gICAgICAgICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPiBvblN0dWRlbnRSZWFkeSggc3R1ZGVudCwgc3VidGVzdClcbiAgICAgICAgICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICAgICAgICAgIHN0dWRlbnQuc2F2ZSBudWxsLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPiBvblN0dWRlbnRSZWFkeSggc3R1ZGVudCwgc3VidGVzdClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICBvblN0dWRlbnRSZWFkeShzdHVkZW50LCBzdWJ0ZXN0KVxuXG4gIHJlZ2lzdGVyOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNVbnJlZ2lzdGVyZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgUmVnaXN0ZXJUZWFjaGVyVmlld1xuICAgICAgICAgIHVzZXIgOiBuZXcgVXNlclxuICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuICBzdHVkZW50RWRpdDogKCBzdHVkZW50SWQgKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgX2lkIDogc3R1ZGVudElkXG4gICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAobW9kZWwpIC0+XG4gICAgICAgICAgICBhbGxLbGFzc2VzID0gbmV3IEtsYXNzZXNcbiAgICAgICAgICAgIGFsbEtsYXNzZXMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogKCBrbGFzc0NvbGxlY3Rpb24gKS0+XG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBTdHVkZW50RWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgIHN0dWRlbnQgOiBtb2RlbFxuICAgICAgICAgICAgICAgICAga2xhc3NlcyA6IGtsYXNzQ29sbGVjdGlvblxuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgI1xuICAjIEFzc2Vzc21lbnRcbiAgI1xuXG5cbiAgZGF0YUVudHJ5OiAoIGFzc2Vzc21lbnRJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnQgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICBrZXk6IFwicVwiICsgYXNzZXNzbWVudElkXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgcXVlc3Rpb25zQnlTdWJ0ZXN0SWQgPSBxdWVzdGlvbnMuaW5kZXhCeShcInN1YnRlc3RJZFwiKVxuICAgICAgICAgICAgICAgIGZvciBzdWJ0ZXN0SWQsIHF1ZXN0aW9ucyBvZiBxdWVzdGlvbnNCeVN1YnRlc3RJZFxuICAgICAgICAgICAgICAgICAgYXNzZXNzbWVudC5zdWJ0ZXN0cy5nZXQoc3VidGVzdElkKS5xdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zIHF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgIHZtLnNob3cgbmV3IEFzc2Vzc21lbnREYXRhRW50cnlWaWV3IGFzc2Vzc21lbnQ6IGFzc2Vzc21lbnRcblxuXG5cbiAgc3luYzogKCBhc3Nlc3NtZW50SWQgKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50IFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICB2bS5zaG93IG5ldyBBc3Nlc3NtZW50U3luY1ZpZXcgXCJhc3Nlc3NtZW50XCI6IGFzc2Vzc21lbnRcblxuICBpbXBvcnQ6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudEltcG9ydFZpZXdcbiAgICAgICAgICBub3VuIDpcImFzc2Vzc21lbnRcIlxuICAgICAgICB2bS5zaG93IHZpZXdcblxuICBcbiAgYXNzZXNzbWVudHM6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgICh3b3JrZmxvd3MgPSBuZXcgV29ya2Zsb3dzKS5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG5cbiAgICAgICAgICAgIGlmIHdvcmtmbG93cy5sZW5ndGggPiAwICYmIFRhbmdlcmluZS5zZXR0aW5ncy5nZXQoXCJjb250ZXh0XCIpIGlzbnQgXCJzZXJ2ZXJcIlxuXG4gICAgICAgICAgICAgIGZlZWRiYWNrcyA9IG5ldyBGZWVkYmFja3MgZmVlZGJhY2tzXG4gICAgICAgICAgICAgIGZlZWRiYWNrcy5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFdvcmtmbG93TWVudVZpZXdcbiAgICAgICAgICAgICAgICAgICAgd29ya2Zsb3dzIDogd29ya2Zsb3dzXG4gICAgICAgICAgICAgICAgICAgIGZlZWRiYWNrcyA6IGZlZWRiYWNrc1xuICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgICAgIGNvbGxlY3Rpb25zID0gW1xuICAgICAgICAgICAgICBcIktsYXNzZXNcIlxuICAgICAgICAgICAgICBcIlRlYWNoZXJzXCJcbiAgICAgICAgICAgICAgXCJDdXJyaWN1bGFcIlxuICAgICAgICAgICAgICBcIkFzc2Vzc21lbnRzXCJcbiAgICAgICAgICAgICAgXCJXb3JrZmxvd3NcIlxuICAgICAgICAgICAgXVxuXG4gICAgICAgICAgICAjIGNvbGxlY3Rpb25zLnB1c2ggaWYgXCJzZXJ2ZXJcIiA9PSBUYW5nZXJpbmUuc2V0dGluZ3MuZ2V0KFwiY29udGV4dFwiKSB0aGVuIFwiVXNlcnNcIiBlbHNlIFwiVGFibGV0VXNlcnNcIlxuICAgICAgICAgICAgY29sbGVjdGlvbnMucHVzaCBcIlVzZXJzXCJcblxuICAgICAgICAgICAgVXRpbHMubG9hZENvbGxlY3Rpb25zXG4gICAgICAgICAgICAgIGNvbGxlY3Rpb25zOiBjb2xsZWN0aW9uc1xuICAgICAgICAgICAgICBjb21wbGV0ZTogKG9wdGlvbnMpIC0+XG4gICAgICAgICAgICAgICAgIyBsb2FkIGZlZWRiYWNrIG1vZGVscyBhc3NvY2lhdGVkIHdpdGggd29ya2Zsb3dzXG4gICAgICAgICAgICAgICAgZmVlZGJhY2tzID0gb3B0aW9ucy53b3JrZmxvd3MubW9kZWxzLm1hcCAoYSkgLT4gbmV3IEZlZWRiYWNrIFwiX2lkXCIgOiBcIiN7YS5pZH0tZmVlZGJhY2tcIlxuICAgICAgICAgICAgICAgIGZlZWRiYWNrcyA9IG5ldyBGZWVkYmFja3MgZmVlZGJhY2tzXG4gICAgICAgICAgICAgICAgZmVlZGJhY2tzLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmZlZWRiYWNrcyA9IGZlZWRiYWNrc1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnVzZXJzID0gb3B0aW9ucy50YWJsZXRVc2VycyB8fCBvcHRpb25zLnVzZXJzXG4gICAgICAgICAgICAgICAgICAgIGlmICFUYW5nZXJpbmUudXNlci5pc0FkbWluKCkgJiYgVGFuZ2VyaW5lLnNldHRpbmdzLmdldCgnc2hvd1dvcmtmbG93cycpID09IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFdvcmtmbG93TWVudU1lbWJlclZpZXcgb3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgICAgICAgICAgICAgICAgICMgXiB2bS5zaG93IG5vdCB3b3JraW5nIGZvciBzb21lIHJlYXNvbiBzbyBsZXRzIGF0dGFjaCB0aGUgVmlldyB0byB0aGUgRE9NIG1hbnVhbGx5LlxuICAgICAgICAgICAgICAgICAgICAgICQoJyNjb250ZW50JykuaHRtbCh2aWV3LmVsKVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudHNNZW51VmlldyBvcHRpb25zXG5cblxuICBlZGl0SWQ6IChpZCkgLT5cbiAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICBfaWQ6IGlkXG4gICAgICAgIGFzc2Vzc21lbnQuc3VwZXJGZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAoIG1vZGVsICkgLT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudEVkaXRWaWV3IG1vZGVsOiBtb2RlbFxuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cblxuICBlZGl0OiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICBcIl9pZFwiIDogaWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAoIG1vZGVsICkgLT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudEVkaXRWaWV3IG1vZGVsOiBtb2RlbFxuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cbiAgcmVzdGFydDogKG5hbWUpIC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcInJ1bi8je25hbWV9XCIsIHRydWVcblxuIyAgV2lkZ2V0UnVuVmlldyB0YWtlcyBhIGxpc3Qgb2Ygc3VidGVzdHMgYW5kIHRoZSBhc3Nlc3NtZW50LlxuICBydW46IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgZEtleSA9IEpTT04uc3RyaW5naWZ5KGlkLnN1YnN0cigtNSwgNSkpXG4gICAgICAgIHVybCA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwiZ3JvdXBcIiwgXCJieURLZXlcIilcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgdHlwZTogXCJHRVRcIlxuICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgIGRhdGE6IGtleTogZEtleVxuICAgICAgICAgIGVycm9yOiAoYSwgYikgPT4gQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgZXJyb3JcIiwgXCIje2F9ICN7Yn1cIlxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgZG9jTGlzdCA9IFtcImxvY2F0aW9uLWxpc3RcIl1cbiAgICAgICAgICAgIGZvciBkYXR1bSBpbiBkYXRhLnJvd3NcbiAgICAgICAgICAgICAgZG9jTGlzdC5wdXNoIGRhdHVtLmlkXG4gICAgICAgICAgICBrZXlMaXN0ID0gXy51bmlxKGRvY0xpc3QpXG4gICAgICAgICAgICBUYW5nZXJpbmUuJGRiLmFsbERvY3NcbiAgICAgICAgICAgICAga2V5cyA6IGtleUxpc3RcbiAgICAgICAgICAgICAgaW5jbHVkZV9kb2NzOnRydWVcbiAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgIGRvY3MgPSBbXVxuICAgICAgICAgICAgICAgIGZvciByb3cgaW4gcmVzcG9uc2Uucm93c1xuICAgICAgICAgICAgICAgICAgZG9jcy5wdXNoIHJvdy5kb2NcbiMgICAgICAgICAgICAgICAgYm9keSA9XG4jICAgICAgICAgICAgICAgICAgZG9jczogZG9jc1xuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgV2lkZ2V0UnVuVmlldyBtb2RlbDogZG9jc1xuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHByaW50OiAoIGFzc2Vzc21lbnRJZCwgZm9ybWF0ICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICggbW9kZWwgKSAtPlxuICAgICAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50UHJpbnRWaWV3XG4gICAgICAgICAgICAgIG1vZGVsICA6IG1vZGVsXG4gICAgICAgICAgICAgIGZvcm1hdCA6IGZvcm1hdFxuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgcmVzdW1lOiAoYXNzZXNzbWVudElkLCByZXN1bHRJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICggYXNzZXNzbWVudCApIC0+XG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgUmVzdWx0XG4gICAgICAgICAgICAgIFwiX2lkXCIgOiByZXN1bHRJZFxuICAgICAgICAgICAgcmVzdWx0LmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXN1bHQpIC0+XG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50UnVuVmlld1xuICAgICAgICAgICAgICAgICAgbW9kZWw6IGFzc2Vzc21lbnRcblxuICAgICAgICAgICAgICAgIGlmIHJlc3VsdC5oYXMoXCJvcmRlcl9tYXBcIilcbiAgICAgICAgICAgICAgICAgICMgc2F2ZSB0aGUgb3JkZXIgbWFwIG9mIHByZXZpb3VzIHJhbmRvbWl6YXRpb25cbiAgICAgICAgICAgICAgICAgIG9yZGVyTWFwID0gcmVzdWx0LmdldChcIm9yZGVyX21hcFwiKS5zbGljZSgpICMgY2xvbmUgYXJyYXlcbiAgICAgICAgICAgICAgICAgICMgcmVzdG9yZSB0aGUgcHJldmlvdXMgb3JkZXJtYXBcbiAgICAgICAgICAgICAgICAgIHZpZXcub3JkZXJNYXAgPSBvcmRlck1hcFxuXG4gICAgICAgICAgICAgICAgZm9yIHN1YnRlc3QgaW4gcmVzdWx0LmdldChcInN1YnRlc3REYXRhXCIpXG4gICAgICAgICAgICAgICAgICBpZiBzdWJ0ZXN0LmRhdGE/ICYmIHN1YnRlc3QuZGF0YS5wYXJ0aWNpcGFudF9pZD9cbiAgICAgICAgICAgICAgICAgICAgVGFuZ2VyaW5lLm5hdi5zZXRTdHVkZW50IHN1YnRlc3QuZGF0YS5wYXJ0aWNpcGFudF9pZFxuXG4gICAgICAgICAgICAgICAgIyByZXBsYWNlIHRoZSB2aWV3J3MgcmVzdWx0IHdpdGggb3VyIG9sZCBvbmVcbiAgICAgICAgICAgICAgICB2aWV3LnJlc3VsdCA9IHJlc3VsdFxuXG4gICAgICAgICAgICAgICAgIyBIaWphY2sgdGhlIG5vcm1hbCBSZXN1bHQgYW5kIFJlc3VsdFZpZXcsIHVzZSBvbmUgZnJvbSB0aGUgZGJcbiAgICAgICAgICAgICAgICB2aWV3LnN1YnRlc3RWaWV3cy5wb3AoKVxuICAgICAgICAgICAgICAgIHZpZXcuc3VidGVzdFZpZXdzLnB1c2ggbmV3IFJlc3VsdFZpZXdcbiAgICAgICAgICAgICAgICAgIG1vZGVsICAgICAgICAgIDogcmVzdWx0XG4gICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50ICAgICA6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnRWaWV3IDogdmlld1xuICAgICAgICAgICAgICAgIHZpZXcuaW5kZXggPSByZXN1bHQuZ2V0KFwic3VidGVzdERhdGFcIikubGVuZ3RoXG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuXG4gIHJlc3VsdHM6IChhc3Nlc3NtZW50SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFmdGVyRmV0Y2ggPSAoYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50KFwiX2lkXCI6YXNzZXNzbWVudElkKSwgYXNzZXNzbWVudElkKSAtPlxuICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgUmVzdWx0c1xuICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgIGluY2x1ZGVfZG9jczogZmFsc2VcbiAgICAgICAgICAgIGtleTogXCJyXCIgKyBhc3Nlc3NtZW50SWRcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXN1bHRzKSA9PlxuICAgICAgICAgICAgICB2aWV3ID0gbmV3IFJlc3VsdHNWaWV3XG4gICAgICAgICAgICAgICAgXCJhc3Nlc3NtZW50XCIgOiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgICAgOiByZXN1bHRzLm1vZGVsc1xuICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogIC0+XG4gICAgICAgICAgICBhZnRlckZldGNoKGFzc2Vzc21lbnQsIGFzc2Vzc21lbnRJZClcbiAgICAgICAgICBlcnJvciA6ICAtPlxuICAgICAgICAgICAgYWZ0ZXJGZXRjaChhc3Nlc3NtZW50LCBhc3Nlc3NtZW50SWQpXG5cblxuICAjXG4gICMgUmVwb3J0c1xuICAjXG4gIGtsYXNzR3JvdXBpbmc6IChrbGFzc0lkLCBwYXJ0KSAtPlxuICAgIHBhcnQgPSBwYXJzZUludChwYXJ0KVxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6ICggY29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzIGNvbGxlY3Rpb24ud2hlcmUgXCJwYXJ0XCIgOiBwYXJ0XG4gICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIHJlc3VsdHMgKSAtPlxuICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0cy53aGVyZSBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICBzdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuXG4gICAgICAgICAgICAgICAgICAgICAgIyBmaWx0ZXIgYFJlc3VsdHNgIGJ5IGBLbGFzc2AncyBjdXJyZW50IGBTdHVkZW50c2BcbiAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50cyBzdHVkZW50cy53aGVyZSBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50SWRzID0gc3R1ZGVudHMucGx1Y2soXCJfaWRcIilcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50cyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzLm1vZGVsc1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMucHVzaChyZXN1bHQpIGlmIHJlc3VsdC5nZXQoXCJzdHVkZW50SWRcIikgaW4gc3R1ZGVudElkc1xuICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHNcblxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NHcm91cGluZ1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudHNcIiA6IHN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogZmlsdGVyZWRSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgbWFzdGVyeUNoZWNrOiAoc3R1ZGVudElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKHN0dWRlbnQpIC0+XG4gICAgICAgICAgICBrbGFzc0lkID0gc3R1ZGVudC5nZXQgXCJrbGFzc0lkXCJcbiAgICAgICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIFwiX2lkXCIgOiBzdHVkZW50LmdldCBcImtsYXNzSWRcIlxuICAgICAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogKGtsYXNzKSAtPlxuICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCBjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgY29sbGVjdGlvbi53aGVyZSBcInN0dWRlbnRJZFwiIDogc3R1ZGVudElkLCBcInJlcG9ydFR5cGVcIiA6IFwibWFzdGVyeVwiLCBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgICAgIyBnZXQgYSBsaXN0IG9mIHN1YnRlc3RzIGludm9sdmVkXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RJZExpc3QgPSB7fVxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0SWRMaXN0W3Jlc3VsdC5nZXQoXCJzdWJ0ZXN0SWRcIildID0gdHJ1ZSBmb3IgcmVzdWx0IGluIHJlc3VsdHMubW9kZWxzXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RJZExpc3QgPSBfLmtleXMoc3VidGVzdElkTGlzdClcblxuICAgICAgICAgICAgICAgICAgICAjIG1ha2UgYSBjb2xsZWN0aW9uIGFuZCBmZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0Q29sbGVjdGlvbiA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0Q29sbGVjdGlvbi5hZGQgbmV3IFN1YnRlc3QoXCJfaWRcIiA6IHN1YnRlc3RJZCkgZm9yIHN1YnRlc3RJZCBpbiBzdWJ0ZXN0SWRMaXN0XG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgTWFzdGVyeUNoZWNrVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc1wiICAgIDoga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdENvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHByb2dyZXNzUmVwb3J0OiAoc3R1ZGVudElkLCBrbGFzc0lkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICAjIHNhdmUgdGhpcyBjcmF6eSBmdW5jdGlvbiBmb3IgbGF0ZXJcbiAgICAgICAgIyBzdHVkZW50SWQgY2FuIGhhdmUgdGhlIHZhbHVlIFwiYWxsXCIsIGluIHdoaWNoIGNhc2Ugc3R1ZGVudCBzaG91bGQgPT0gbnVsbFxuICAgICAgICBhZnRlckZldGNoID0gKCBzdHVkZW50LCBzdHVkZW50cyApIC0+XG4gICAgICAgICAga2xhc3MgPSBuZXcgS2xhc3MgXCJfaWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICBrbGFzcy5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogKGtsYXNzKSAtPlxuICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggYWxsU3VidGVzdHMgKSAtPlxuICAgICAgICAgICAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHMgYWxsU3VidGVzdHMud2hlcmVcbiAgICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtSWRcIiA6IGtsYXNzLmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgICAgICAgICBcInJlcG9ydFR5cGVcIiAgIDogXCJwcm9ncmVzc1wiXG4gICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIGNvbGxlY3Rpb24ud2hlcmUgXCJrbGFzc0lkXCIgOiBrbGFzc0lkLCBcInJlcG9ydFR5cGVcIiA6IFwicHJvZ3Jlc3NcIlxuXG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgc3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICBpZiBzdHVkZW50cz9cbiAgICAgICAgICAgICAgICAgICAgICAgICMgZmlsdGVyIGBSZXN1bHRzYCBieSBgS2xhc3NgJ3MgY3VycmVudCBgU3R1ZGVudHNgXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50SWRzID0gc3R1ZGVudHMucGx1Y2soXCJfaWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciByZXN1bHQgaW4gcmVzdWx0cy5tb2RlbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMucHVzaChyZXN1bHQpIGlmIHJlc3VsdC5nZXQoXCJzdHVkZW50SWRcIikgaW4gc3R1ZGVudElkc1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHNcblxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgUHJvZ3Jlc3NWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc1wiICAgIDoga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICBpZiBzdHVkZW50SWQgIT0gXCJhbGxcIlxuICAgICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBcIl9pZFwiIDogc3R1ZGVudElkXG4gICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogLT4gYWZ0ZXJGZXRjaCBzdHVkZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgIHN0dWRlbnRzLmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiAtPiBhZnRlckZldGNoIG51bGwsIHN0dWRlbnRzXG5cbiAgI1xuICAjIFN1YnRlc3RzXG4gICNcbiAgZWRpdFN1YnRlc3Q6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IF9pZCA6IGlkXG4gICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAobW9kZWwsIHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBzdWJ0ZXN0LmdldChcImFzc2Vzc21lbnRJZFwiKVxuICAgICAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuXG4gICAgICAgICAgICAgICAgIyBAdG9kbyBUaGUgZmlyc3QgYXR0ZW1wdCBhdCBmZXRjaGluZyBzdWJ0ZXN0cyBuZXZlciBoaXRzIGl0cyBzdWNjZXNzIGNhbGxiYWNrLiBEZWJ1Z2dpbmcgdGhpcyBpdCdzIG5vdCBjbGVhciB3aHkgdGhpcyBpcyB0aGUgY2FzZS4gXG4gICAgICAgICAgICAgICAgIyBUaGlzIHNlY29uZCB0cnkgZG9lcyBob3dldmVyIHdvcmsuIElmIHRoZSBmaXJzdCBvbmUgZG9lcyBzdGFydCB3b3JraW5nIGFnYWluLCB0aGlzIHNlY29uZCB0cnkgc2hvdWxkIG5vdCBhZmZlY3QgdGhlIG92ZXJhbGwgc3RhdGVcbiAgICAgICAgICAgICAgICAjIG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAgICAgICAgICAgICAgICBzdWJ0ZXN0c1ByaW1lVGhlUHVtcCA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICAgIHN1YnRlc3RzUHJpbWVUaGVQdW1wLmZldGNoXG4gICAgICAgICAgICAgICAgICBrZXk6IGFzc2Vzc21lbnQuaWRcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiU3VidGVzdHNQcmltZVRoZVB1bXAgc3VjY2VzcyBjYWxsYmFjayBjYWxsZWRcIlxuICAgICAgICAgICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIFwiU3VidGVzdHNQcmltZVRoZVB1bXAgZXJyb3IgY2FsbGJhY2sgY2FsbGVkXCJcbiAgICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyBcbiAgICAgICAgICAgICAgICBzdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAga2V5OiBhc3Nlc3NtZW50LmlkXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgPT5cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBTdWJ0ZXN0RWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBtb2RlbCAgICAgIDogbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0cyAgIDogc3VidGVzdHMgXG4gICAgICAgICAgICAgICAgICAgICAgYXNzZXNzbWVudCA6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuICBlZGl0S2xhc3NTdWJ0ZXN0OiAoaWQpIC0+XG5cbiAgICBvblN1Y2Nlc3MgPSAoc3VidGVzdCwgY3VycmljdWx1bSwgcXVlc3Rpb25zPW51bGwpIC0+XG4gICAgICB2aWV3ID0gbmV3IEtsYXNzU3VidGVzdEVkaXRWaWV3XG4gICAgICAgIG1vZGVsICAgICAgOiBzdWJ0ZXN0XG4gICAgICAgIGN1cnJpY3VsdW0gOiBjdXJyaWN1bHVtXG4gICAgICAgIHF1ZXN0aW9ucyAgOiBxdWVzdGlvbnNcbiAgICAgIHZtLnNob3cgdmlld1xuXG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBfaWQgOiBpZFxuICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bVxuICAgICAgICAgICAgICBcIl9pZFwiIDogc3VidGVzdC5nZXQoXCJjdXJyaWN1bHVtSWRcIilcbiAgICAgICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBpZiBzdWJ0ZXN0LmdldChcInByb3RvdHlwZVwiKSA9PSBcInN1cnZleVwiXG4gICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgICBxdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAga2V5IDogY3VycmljdWx1bS5pZFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMgcXVlc3Rpb25zLndoZXJlKFwic3VidGVzdElkXCI6c3VidGVzdC5pZClcbiAgICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Mgc3VidGVzdCwgY3VycmljdWx1bSwgcXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgb25TdWNjZXNzIHN1YnRlc3QsIGN1cnJpY3VsdW1cbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuXG4gICNcbiAgIyBRdWVzdGlvblxuICAjXG4gIGVkaXRRdWVzdGlvbjogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgaWQgPSBVdGlscy5jbGVhblVSTCBpZFxuICAgICAgICBxdWVzdGlvbiA9IG5ldyBRdWVzdGlvbiBfaWQgOiBpZFxuICAgICAgICBxdWVzdGlvbi5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChxdWVzdGlvbiwgcmVzcG9uc2UpIC0+XG4gICAgICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHF1ZXN0aW9uLmdldChcImFzc2Vzc21lbnRJZFwiKVxuICAgICAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdFxuICAgICAgICAgICAgICAgICAgXCJfaWRcIiA6IHF1ZXN0aW9uLmdldChcInN1YnRlc3RJZFwiKVxuICAgICAgICAgICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgUXVlc3Rpb25FZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwicXVlc3Rpb25cIiAgIDogcXVlc3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RcIiAgICA6IHN1YnRlc3RcbiAgICAgICAgICAgICAgICAgICAgICBcImFzc2Vzc21lbnRcIiA6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cblxuICBlZGl0S2xhc3NRdWVzdGlvbjogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgaWQgPSBVdGlscy5jbGVhblVSTCBpZFxuICAgICAgICBxdWVzdGlvbiA9IG5ldyBRdWVzdGlvbiBcIl9pZFwiIDogaWRcbiAgICAgICAgcXVlc3Rpb24uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAocXVlc3Rpb24sIHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtXG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBxdWVzdGlvbi5nZXQoXCJjdXJyaWN1bHVtSWRcIilcbiAgICAgICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3RcbiAgICAgICAgICAgICAgICAgIFwiX2lkXCIgOiBxdWVzdGlvbi5nZXQoXCJzdWJ0ZXN0SWRcIilcbiAgICAgICAgICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFF1ZXN0aW9uRWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBcInF1ZXN0aW9uXCIgICA6IHF1ZXN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0XCIgICAgOiBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgXCJhc3Nlc3NtZW50XCIgOiBjdXJyaWN1bHVtXG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgI1xuICAjIFVzZXJcbiAgI1xuICBsb2dpbjogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcbiAgICAgIGlzVW5yZWdpc3RlcmVkOiAtPlxuXG4gICAgICAgIHNob3dWaWV3ID0gKHVzZXJzID0gW10pIC0+XG4gICAgICAgICAgdmlldyA9IG5ldyBMb2dpblZpZXdcbiAgICAgICAgICAgIHVzZXJzOiB1c2Vyc1xuICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gICAgICAgIHNob3dWaWV3KClcblxuICBsb2dvdXQ6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIubG9nb3V0KClcblxuICBhY2NvdW50OiAtPlxuICAgICMgY2hhbmdlIHRoZSBsb2NhdGlvbiB0byB0aGUgdHJ1bmssIHVubGVzcyB3ZSdyZSBhbHJlYWR5IGluIHRoZSB0cnVua1xuICAgIGlmIFRhbmdlcmluZS5kYl9uYW1lICE9IFwidGFuZ2VyaW5lXCJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxJbmRleChcInRydW5rXCIsIFwiYWNjb3VudFwiKVxuICAgIGVsc2VcbiAgICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgICAgdmlldyA9IG5ldyBBY2NvdW50Vmlld1xuICAgICAgICAgICAgdXNlciA6IFRhbmdlcmluZS51c2VyXG4gICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgc2V0dGluZ3M6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgU2V0dGluZ3NWaWV3XG4gICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgbG9nczogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgbG9ncyA9IG5ldyBMb2dzXG4gICAgICAgIGxvZ3MuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgdmlldyA9IG5ldyBMb2dWaWV3XG4gICAgICAgICAgICAgIGxvZ3M6IGxvZ3NcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cblxuXG4gICMgVHJhbnNmZXIgYSBuZXcgdXNlciBmcm9tIHRhbmdlcmluZS1jZW50cmFsIGludG8gdGFuZ2VyaW5lXG4gIHRyYW5zZmVyOiAtPlxuICAgIGdldFZhcnMgPSBVdGlscy4kX0dFVCgpXG4gICAgbmFtZSA9IGdldFZhcnMubmFtZVxuICAgICQuY291Y2gubG9nb3V0XG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAkLmNvb2tpZSBcIkF1dGhTZXNzaW9uXCIsIG51bGxcbiAgICAgICAgJC5jb3VjaC5sb2dpblxuICAgICAgICAgIFwibmFtZVwiICAgICA6IG5hbWVcbiAgICAgICAgICBcInBhc3N3b3JkXCIgOiBuYW1lXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICAgICQuY291Y2guc2lnbnVwXG4gICAgICAgICAgICAgIFwibmFtZVwiIDogIG5hbWVcbiAgICAgICAgICAgICAgXCJyb2xlc1wiIDogW1wiX2FkbWluXCJdXG4gICAgICAgICAgICAsIG5hbWUsXG4gICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICB1c2VyID0gbmV3IFVzZXJcbiAgICAgICAgICAgICAgdXNlci5zYXZlXG4gICAgICAgICAgICAgICAgXCJuYW1lXCIgIDogbmFtZVxuICAgICAgICAgICAgICAgIFwiaWRcIiAgICA6IFwidGFuZ2VyaW5lLnVzZXI6XCIrbmFtZVxuICAgICAgICAgICAgICAgIFwicm9sZXNcIiA6IFtdXG4gICAgICAgICAgICAgICAgXCJmcm9tXCIgIDogXCJ0Y1wiXG4gICAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICB3YWl0OiB0cnVlXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICQuY291Y2gubG9naW5cbiAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCIgICAgIDogbmFtZVxuICAgICAgICAgICAgICAgICAgICBcInBhc3N3b3JkXCIgOiBuYW1lXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgOiAtPlxuICAgICAgICAgICAgICAgICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLnN0aWNreSBcIkVycm9yIHRyYW5zZmVyaW5nIHVzZXIuXCJcbiJdfQ==
