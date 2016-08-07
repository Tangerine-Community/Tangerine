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
    'editLP/:id': 'editLP',
    'results/:id': 'results',
    'import': 'import',
    'subtest/:id': 'editSubtest',
    'element/:id': 'editElement',
    'question/:id': 'editQuestion',
    'dashboard': 'dashboard',
    'dashboard/*options': 'dashboard',
    'admin': 'admin',
    'sync/:id': 'sync'
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
    if (~String(window.location.href).indexOf("app/tangerine")) {
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
        return Utils.loadCollections({
          collections: ["Klasses", "Teachers", "Curricula", "Assessments", "LessonPlans"],
          complete: function(options) {
            return vm.show(new AssessmentsMenuView(options));
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

  Router.prototype.editLP = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var lessonPlan;
        lessonPlan = new LessonPlan({
          "_id": id
        });
        return lessonPlan.fetch({
          success: function(model) {
            var view;
            view = new LessonPlanEditView({
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

  Router.prototype.run = function(id, klass) {
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
                  var docs, j, len1, ref1, row, view;
                  docs = [];
                  ref1 = response.rows;
                  for (j = 0, len1 = ref1.length; j < len1; j++) {
                    row = ref1[j];
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
                    var i, j, len, len1, ref, result, results, subtestCollection, subtestId, subtestIdList;
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
                    for (j = 0, len1 = subtestIdList.length; j < len1; j++) {
                      subtestId = subtestIdList[j];
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
                var view;
                view = new SubtestEditView({
                  model: model,
                  assessment: assessment
                });
                return vm.show(view);
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

  Router.prototype.editElement = function(id) {
    return Tangerine.user.verify({
      isAdmin: function() {
        var element;
        id = Utils.cleanURL(id);
        element = new Element({
          _id: id
        });
        return element.fetch({
          success: function(model, response) {
            var lessonPlan;
            lessonPlan = new LessonPlan({
              "_id": element.get("assessmentId")
            });
            return lessonPlan.fetch({
              success: function() {
                var view;
                view = new ElementEditView({
                  model: model,
                  assessment: lessonPlan,
                  lessonPlan: lessonPlan
                });
                return vm.show(view);
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

//# sourceMappingURL=data:application/json;base64,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QUFBLEVBQVUsSUFBVjtvQkFDQSxJQUFBLEVBQVUsaUJBQUEsR0FBa0IsSUFENUI7b0JBRUEsT0FBQSxFQUFVLEVBRlY7b0JBR0EsTUFBQSxFQUFVLElBSFY7bUJBREYsRUFNRTtvQkFBQSxJQUFBLEVBQU0sSUFBTjtvQkFDQSxPQUFBLEVBQVMsU0FBQTs2QkFDUCxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQVIsQ0FDRTt3QkFBQSxNQUFBLEVBQWEsSUFBYjt3QkFDQSxVQUFBLEVBQWEsSUFEYjt3QkFFQSxPQUFBLEVBQVUsU0FBQTswQkFDUixTQUFTLENBQUMsTUFBTSxDQUFDLE9BQWpCLENBQUE7aUNBQ0EsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixDQUFBO3dCQUZRLENBRlY7d0JBS0EsS0FBQSxFQUFPLFNBQUE7aUNBQ0wsS0FBSyxDQUFDLE1BQU4sQ0FBYSx5QkFBYjt3QkFESyxDQUxQO3VCQURGO29CQURPLENBRFQ7bUJBTkY7Z0JBRk8sQ0FBVDtlQUpBO1lBREssQ0FMUDtXQURGO1FBRk87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7S0FERjtFQUhROzs7O0dBbjBCUyxRQUFRLENBQUMiLCJmaWxlIjoiYXBwL3JvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFJvdXRlciBleHRlbmRzIEJhY2tib25lLlJvdXRlclxuIyAgYmVmb3JlOiAoKSAtPlxuIyAgICBjb25zb2xlLmxvZygnYmVmb3JlJylcbiMgICAgJCgnI2Zvb3RlcicpLnNob3coKVxuI1xuIyAgYWZ0ZXI6ICgpIC0+XG4jICAgIGNvbnNvbGUubG9nKCdhZnRlcicpO1xuICBleGVjdXRlOiAoY2FsbGJhY2ssIGFyZ3MsIG5hbWUpIC0+XG4gICAgJCgnI2Zvb3RlcicpLnNob3coKVxuICAgIGlmIChjYWxsYmFjaylcbiAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpXG5cbiAgcm91dGVzOlxuICAgICdsb2dpbicgICAgOiAnbG9naW4nXG4gICAgJ3JlZ2lzdGVyJyA6ICdyZWdpc3RlcidcbiAgICAnbG9nb3V0JyAgIDogJ2xvZ291dCdcbiAgICAnYWNjb3VudCcgIDogJ2FjY291bnQnXG5cbiAgICAndHJhbnNmZXInIDogJ3RyYW5zZmVyJ1xuXG4gICAgJ3NldHRpbmdzJyA6ICdzZXR0aW5ncydcbiAgICAndXBkYXRlJyA6ICd1cGRhdGUnXG5cbiAgICAnJyA6ICdsYW5kaW5nJ1xuXG4gICAgJ2xvZ3MnIDogJ2xvZ3MnXG5cbiAgICAjIENsYXNzXG4gICAgJ2NsYXNzJyAgICAgICAgICA6ICdrbGFzcydcbiAgICAnY2xhc3MvZWRpdC86aWQnIDogJ2tsYXNzRWRpdCdcbiAgICAnY2xhc3Mvc3R1ZGVudC86c3R1ZGVudElkJyAgICAgICAgOiAnc3R1ZGVudEVkaXQnXG4gICAgJ2NsYXNzL3N0dWRlbnQvcmVwb3J0LzpzdHVkZW50SWQnIDogJ3N0dWRlbnRSZXBvcnQnXG4gICAgJ2NsYXNzL3N1YnRlc3QvOmlkJyA6ICdlZGl0S2xhc3NTdWJ0ZXN0J1xuICAgICdjbGFzcy9xdWVzdGlvbi86aWQnIDogXCJlZGl0S2xhc3NRdWVzdGlvblwiXG5cbiAgICAnY2xhc3MvOmlkLzpwYXJ0JyA6ICdrbGFzc1BhcnRseSdcbiAgICAnY2xhc3MvOmlkJyAgICAgICA6ICdrbGFzc1BhcnRseSdcblxuICAgICdjbGFzcy9ydW4vOnN0dWRlbnRJZC86c3VidGVzdElkJyA6ICdydW5TdWJ0ZXN0J1xuXG4gICAgJ2NsYXNzL3Jlc3VsdC9zdHVkZW50L3N1YnRlc3QvOnN0dWRlbnRJZC86c3VidGVzdElkJyA6ICdzdHVkZW50U3VidGVzdCdcblxuICAgICdjdXJyaWN1bGEnICAgICAgICAgOiAnY3VycmljdWxhJ1xuICAgICdjdXJyaWN1bHVtLzppZCcgICAgOiAnY3VycmljdWx1bSdcbiAgICAnY3VycmljdWx1bUltcG9ydCcgIDogJ2N1cnJpY3VsdW1JbXBvcnQnXG5cbiAgICAncmVwb3J0L2tsYXNzR3JvdXBpbmcvOmtsYXNzSWQvOnBhcnQnIDogJ2tsYXNzR3JvdXBpbmcnXG4gICAgJ3JlcG9ydC9tYXN0ZXJ5Q2hlY2svOnN0dWRlbnRJZCcgICAgICA6ICdtYXN0ZXJ5Q2hlY2snXG4gICAgJ3JlcG9ydC9wcm9ncmVzcy86c3R1ZGVudElkLzprbGFzc0lkJyA6ICdwcm9ncmVzc1JlcG9ydCdcblxuXG4gICAgIyBzZXJ2ZXIgLyBtb2JpbGVcbiAgICAnZ3JvdXBzJyA6ICdncm91cHMnXG5cbiAgICAnYXNzZXNzbWVudHMnICAgICAgICA6ICdhc3Nlc3NtZW50cydcblxuICAgICdydW4vOmlkJyAgICAgICA6ICdydW4nXG4gICAgJ3ByaW50LzppZC86Zm9ybWF0JyAgICAgICA6ICdwcmludCdcbiAgICAnZGF0YUVudHJ5LzppZCcgOiAnZGF0YUVudHJ5J1xuXG4gICAgJ3Jlc3VtZS86YXNzZXNzbWVudElkLzpyZXN1bHRJZCcgICAgOiAncmVzdW1lJ1xuXG4gICAgJ3Jlc3RhcnQvOmlkJyAgIDogJ3Jlc3RhcnQnXG4gICAgJ2VkaXQvOmlkJyAgICAgIDogJ2VkaXQnXG4gICAgJ2VkaXRMUC86aWQnICAgICAgOiAnZWRpdExQJ1xuICAgICdyZXN1bHRzLzppZCcgICA6ICdyZXN1bHRzJ1xuICAgICdpbXBvcnQnICAgICAgICA6ICdpbXBvcnQnXG5cbiAgICAnc3VidGVzdC86aWQnICAgICAgIDogJ2VkaXRTdWJ0ZXN0J1xuICAgICdlbGVtZW50LzppZCcgICAgICAgOiAnZWRpdEVsZW1lbnQnXG5cbiAgICAncXVlc3Rpb24vOmlkJyA6ICdlZGl0UXVlc3Rpb24nXG4gICAgJ2Rhc2hib2FyZCcgOiAnZGFzaGJvYXJkJ1xuICAgICdkYXNoYm9hcmQvKm9wdGlvbnMnIDogJ2Rhc2hib2FyZCdcbiAgICAnYWRtaW4nIDogJ2FkbWluJ1xuXG4gICAgJ3N5bmMvOmlkJyAgICAgIDogJ3N5bmMnXG5cblxuICBhZG1pbjogKG9wdGlvbnMpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICAkLmNvdWNoLmFsbERic1xuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhYmFzZXMpID0+XG4gICAgICAgICAgICBncm91cHMgPSBkYXRhYmFzZXMuZmlsdGVyIChkYXRhYmFzZSkgLT4gZGF0YWJhc2UuaW5kZXhPZihcImdyb3VwLVwiKSA9PSAwXG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFkbWluVmlld1xuICAgICAgICAgICAgICBncm91cHMgOiBncm91cHNcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGRhc2hib2FyZDogKG9wdGlvbnMpIC0+XG4gICAgb3B0aW9ucyA9IG9wdGlvbnM/LnNwbGl0KC9cXC8vKVxuICAgIGNvbnNvbGUubG9nKFwib3B0aW9uczogXCIgKyBvcHRpb25zKVxuICAgICNkZWZhdWx0IHZpZXcgb3B0aW9uc1xuICAgIHJlcG9ydFZpZXdPcHRpb25zID1cbiAgICAgIGFzc2Vzc21lbnQ6IFwiQWxsXCJcbiAgICAgIGdyb3VwQnk6IFwiZW51bWVyYXRvclwiXG5cbiAgICAjIEFsbG93cyB1cyB0byBnZXQgbmFtZS92YWx1ZSBwYWlycyBmcm9tIFVSTFxuICAgIF8uZWFjaCBvcHRpb25zLCAob3B0aW9uLGluZGV4KSAtPlxuICAgICAgdW5sZXNzIGluZGV4ICUgMlxuICAgICAgICByZXBvcnRWaWV3T3B0aW9uc1tvcHRpb25dID0gb3B0aW9uc1tpbmRleCsxXVxuXG4gICAgdmlldyA9IG5ldyBEYXNoYm9hcmRWaWV3ICByZXBvcnRWaWV3T3B0aW9uc1xuXG4gICAgdm0uc2hvdyB2aWV3XG5cbiAgbGFuZGluZzogLT5cblxuICAgIGlmIH5TdHJpbmcod2luZG93LmxvY2F0aW9uLmhyZWYpLmluZGV4T2YoXCJhcHAvdGFuZ2VyaW5lXCIpICMgaW4gbWFpbiBncm91cD9cbiAgICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJncm91cHNcIiwgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJhc3Nlc3NtZW50c1wiLCB0cnVlXG5cblxuICBncm91cHM6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgR3JvdXBzVmlld1xuICAgICAgICB2bS5zaG93IHZpZXdcblxuICAjXG4gICMgQ2xhc3NcbiAgI1xuICBjdXJyaWN1bGE6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGN1cnJpY3VsYSA9IG5ldyBDdXJyaWN1bGFcbiAgICAgICAgY3VycmljdWxhLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IEN1cnJpY3VsYVZpZXdcbiAgICAgICAgICAgICAgXCJjdXJyaWN1bGFcIiA6IGNvbGxlY3Rpb25cbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGN1cnJpY3VsdW06IChjdXJyaWN1bHVtSWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bSBcIl9pZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHMgYWxsU3VidGVzdHMud2hlcmUgXCJjdXJyaWN1bHVtSWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICAgICAgICAgIGFsbFF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgICAgICBhbGxRdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IFtdXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RzLmVhY2ggKHN1YnRlc3QpIC0+IHF1ZXN0aW9ucyA9IHF1ZXN0aW9ucy5jb25jYXQoYWxsUXVlc3Rpb25zLndoZXJlIFwic3VidGVzdElkXCIgOiBzdWJ0ZXN0LmlkIClcbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBDdXJyaWN1bHVtVmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bVwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiAgIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICBcInF1ZXN0aW9uc1wiICA6IHF1ZXN0aW9uc1xuXG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgY3VycmljdWx1bUVkaXQ6IChjdXJyaWN1bHVtSWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bSBcIl9pZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdHMgPSBhbGxTdWJ0ZXN0cy53aGVyZSBcImN1cnJpY3VsdW1JZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgICAgICAgICAgYWxsUGFydHMgPSAoc3VidGVzdC5nZXQoXCJwYXJ0XCIpIGZvciBzdWJ0ZXN0IGluIHN1YnRlc3RzKVxuICAgICAgICAgICAgICAgIHBhcnRDb3VudCA9IE1hdGgubWF4LmFwcGx5IE1hdGgsIGFsbFBhcnRzXG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBDdXJyaWN1bHVtVmlld1xuICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtXCIgOiBjdXJyaWN1bHVtXG4gICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgXCJwYXJ0c1wiIDogcGFydENvdW50XG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICBjdXJyaWN1bHVtSW1wb3J0OiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRJbXBvcnRWaWV3XG4gICAgICAgICAgbm91biA6IFwiY3VycmljdWx1bVwiXG4gICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGtsYXNzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhbGxLbGFzc2VzID0gbmV3IEtsYXNzZXNcbiAgICAgICAgYWxsS2xhc3Nlcy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6ICgga2xhc3NDb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgIHRlYWNoZXJzID0gbmV3IFRlYWNoZXJzXG4gICAgICAgICAgICB0ZWFjaGVycy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGFsbEN1cnJpY3VsYSA9IG5ldyBDdXJyaWN1bGFcbiAgICAgICAgICAgICAgICBhbGxDdXJyaWN1bGEuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggY3VycmljdWxhQ29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcbiAgICAgICAgICAgICAgICAgICAgICBrbGFzc0NvbGxlY3Rpb24gPSBuZXcgS2xhc3NlcyBrbGFzc0NvbGxlY3Rpb24ud2hlcmUoXCJ0ZWFjaGVySWRcIiA6IFRhbmdlcmluZS51c2VyLmdldChcInRlYWNoZXJJZFwiKSlcbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc2VzVmlld1xuICAgICAgICAgICAgICAgICAgICAgIGtsYXNzZXMgICA6IGtsYXNzQ29sbGVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgIGN1cnJpY3VsYSA6IGN1cnJpY3VsYUNvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICB0ZWFjaGVycyAgOiB0ZWFjaGVyc1xuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBrbGFzc0VkaXQ6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAga2xhc3MgPSBuZXcgS2xhc3MgX2lkIDogaWRcbiAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAoIG1vZGVsICkgLT5cbiAgICAgICAgICAgIHRlYWNoZXJzID0gbmV3IFRlYWNoZXJzXG4gICAgICAgICAgICB0ZWFjaGVycy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChhbGxTdHVkZW50cykgLT5cbiAgICAgICAgICAgICAgICAgICAga2xhc3NTdHVkZW50cyA9IG5ldyBTdHVkZW50cyBhbGxTdHVkZW50cy53aGVyZSB7a2xhc3NJZCA6IGlkfVxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzRWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBrbGFzcyAgICAgICA6IG1vZGVsXG4gICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHMgICAgOiBrbGFzc1N0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMgOiBhbGxTdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgIHRlYWNoZXJzICAgIDogdGVhY2hlcnNcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAga2xhc3NQYXJ0bHk6IChrbGFzc0lkLCBwYXJ0PW51bGwpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIFwiX2lkXCIgOiBrbGFzc0lkXG4gICAgICAgIGtsYXNzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bSBcIl9pZFwiIDoga2xhc3MuZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICAgICAgICAgICAgICBhbGxTdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IFN0dWRlbnRzICggY29sbGVjdGlvbi53aGVyZSggXCJrbGFzc0lkXCIgOiBrbGFzc0lkICkgKVxuXG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzICggY29sbGVjdGlvbi53aGVyZSggXCJrbGFzc0lkXCIgOiBrbGFzc0lkICkgKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzICggY29sbGVjdGlvbi53aGVyZSggXCJjdXJyaWN1bHVtSWRcIiA6IGtsYXNzLmdldChcImN1cnJpY3VsdW1JZFwiKSApIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzUGFydGx5Vmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJ0XCIgICAgICAgOiBwYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgICA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudHNcIiAgIDogc3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bVwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc1wiICAgICAgOiBrbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgc3R1ZGVudFN1YnRlc3Q6IChzdHVkZW50SWQsIHN1YnRlc3RJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IFwiX2lkXCIgOiBzdHVkZW50SWRcbiAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3QgXCJfaWRcIiA6IHN1YnRlc3RJZFxuICAgICAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIFRhbmdlcmluZS4kZGIudmlldyBcIiN7VGFuZ2VyaW5lLmRlc2lnbl9kb2N9L3Jlc3VsdHNCeVN0dWRlbnRTdWJ0ZXN0XCIsXG4gICAgICAgICAgICAgICAgICBrZXkgOiBbc3R1ZGVudElkLHN1YnRlc3RJZF1cbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IGNvbGxlY3Rpb24ud2hlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0SWRcIiA6IHN1YnRlc3RJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRJZFwiIDogc3R1ZGVudElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NJZFwiICAgOiBzdHVkZW50LmdldChcImtsYXNzSWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NTdWJ0ZXN0UmVzdWx0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsbFJlc3VsdHNcIiA6IGFsbFJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RcIiAgOiBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudFwiICA6IHN0dWRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwcmV2aW91c1wiIDogcmVzcG9uc2Uucm93cy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHJ1blN1YnRlc3Q6IChzdHVkZW50SWQsIHN1YnRlc3RJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IFwiX2lkXCIgOiBzdWJ0ZXN0SWRcbiAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuXG4gICAgICAgICAgICAjIHRoaXMgZnVuY3Rpb24gZm9yIGxhdGVyLCByZWFsIGNvZGUgYmVsb3dcbiAgICAgICAgICAgIG9uU3R1ZGVudFJlYWR5ID0gKHN0dWRlbnQsIHN1YnRlc3QpIC0+XG4gICAgICAgICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuXG4gICAgICAgICAgICAgICAgICAjIHRoaXMgZnVuY3Rpb24gZm9yIGxhdGVyLCByZWFsIGNvZGUgYmVsb3dcbiAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyA9IChzdHVkZW50LCBzdWJ0ZXN0LCBxdWVzdGlvbj1udWxsLCBsaW5rZWRSZXN1bHQ9e30pIC0+XG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NTdWJ0ZXN0UnVuVmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudFwiICAgICAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0XCIgICAgICA6IHN1YnRlc3RcbiAgICAgICAgICAgICAgICAgICAgICBcInF1ZXN0aW9uc1wiICAgIDogcXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgXCJsaW5rZWRSZXN1bHRcIiA6IGxpbmtlZFJlc3VsdFxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbnVsbFxuICAgICAgICAgICAgICAgICAgaWYgc3VidGVzdC5nZXQoXCJwcm90b3R5cGVcIikgPT0gXCJzdXJ2ZXlcIlxuICAgICAgICAgICAgICAgICAgICBUYW5nZXJpbmUuJGRiLnZpZXcgXCIje1RhbmdlcmluZS5kZXNpZ25fZG9jfS9yZXN1bHRzQnlTdHVkZW50U3VidGVzdFwiLFxuICAgICAgICAgICAgICAgICAgICAgIGtleSA6IFtzdHVkZW50SWQsc3VidGVzdC5nZXQoXCJncmlkTGlua0lkXCIpXVxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJlc3BvbnNlLnJvd3MgIT0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rZWRSZXN1bHQgPSBuZXcgS2xhc3NSZXN1bHQgXy5sYXN0KHJlc3BvbnNlLnJvd3MpPy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogXCJxXCIgKyBzdWJ0ZXN0LmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMocXVlc3Rpb25zLndoZXJlIHtzdWJ0ZXN0SWQgOiBzdWJ0ZXN0SWQgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Moc3R1ZGVudCwgc3VidGVzdCwgcXVlc3Rpb25zLCBsaW5rZWRSZXN1bHQpXG4gICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyhzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgICAjIGVuZCBvZiBvblN0dWRlbnRSZWFkeVxuXG4gICAgICAgICAgICBpZiBzdHVkZW50SWQgPT0gXCJ0ZXN0XCJcbiAgICAgICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IG9uU3R1ZGVudFJlYWR5KCBzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgICAgICAgc3R1ZGVudC5zYXZlIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IG9uU3R1ZGVudFJlYWR5KCBzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgIG9uU3R1ZGVudFJlYWR5KHN0dWRlbnQsIHN1YnRlc3QpXG5cbiAgcmVnaXN0ZXI6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc1VucmVnaXN0ZXJlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBSZWdpc3RlclRlYWNoZXJWaWV3XG4gICAgICAgICAgdXNlciA6IG5ldyBVc2VyXG4gICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIHN0dWRlbnRFZGl0OiAoIHN0dWRlbnRJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBfaWQgOiBzdHVkZW50SWRcbiAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChtb2RlbCkgLT5cbiAgICAgICAgICAgIGFsbEtsYXNzZXMgPSBuZXcgS2xhc3Nlc1xuICAgICAgICAgICAgYWxsS2xhc3Nlcy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAoIGtsYXNzQ29sbGVjdGlvbiApLT5cbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFN0dWRlbnRFZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgc3R1ZGVudCA6IG1vZGVsXG4gICAgICAgICAgICAgICAgICBrbGFzc2VzIDoga2xhc3NDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICAjXG4gICMgQXNzZXNzbWVudFxuICAjXG5cblxuICBkYXRhRW50cnk6ICggYXNzZXNzbWVudElkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudCBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgcXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgIGtleTogXCJxXCIgKyBhc3Nlc3NtZW50SWRcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBxdWVzdGlvbnNCeVN1YnRlc3RJZCA9IHF1ZXN0aW9ucy5pbmRleEJ5KFwic3VidGVzdElkXCIpXG4gICAgICAgICAgICAgICAgZm9yIHN1YnRlc3RJZCwgcXVlc3Rpb25zIG9mIHF1ZXN0aW9uc0J5U3VidGVzdElkXG4gICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50LnN1YnRlc3RzLmdldChzdWJ0ZXN0SWQpLnF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMgcXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudERhdGFFbnRyeVZpZXcgYXNzZXNzbWVudDogYXNzZXNzbWVudFxuXG5cblxuICBzeW5jOiAoIGFzc2Vzc21lbnRJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnQgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHZtLnNob3cgbmV3IEFzc2Vzc21lbnRTeW5jVmlldyBcImFzc2Vzc21lbnRcIjogYXNzZXNzbWVudFxuXG4gIGltcG9ydDogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50SW1wb3J0Vmlld1xuICAgICAgICAgIG5vdW4gOlwiYXNzZXNzbWVudFwiXG4gICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGFzc2Vzc21lbnRzOiAtPlxuICAgICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgICBVdGlscy5sb2FkQ29sbGVjdGlvbnNcbiAgICAgICAgICAgIGNvbGxlY3Rpb25zOiBbXG4gICAgICAgICAgICAgIFwiS2xhc3Nlc1wiXG4gICAgICAgICAgICAgIFwiVGVhY2hlcnNcIlxuICAgICAgICAgICAgICBcIkN1cnJpY3VsYVwiXG4gICAgICAgICAgICAgIFwiQXNzZXNzbWVudHNcIlxuICAgICAgICAgICAgICBcIkxlc3NvblBsYW5zXCJcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIGNvbXBsZXRlOiAob3B0aW9ucykgLT5cbiAgICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudHNNZW51VmlldyBvcHRpb25zXG5cbiAgZWRpdElkOiAoaWQpIC0+XG4gICAgaWQgPSBVdGlscy5jbGVhblVSTCBpZFxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgX2lkOiBpZFxuICAgICAgICBhc3Nlc3NtZW50LnN1cGVyRmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogKCBtb2RlbCApIC0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRFZGl0VmlldyBtb2RlbDogbW9kZWxcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG5cbiAgZWRpdDogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGlkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogKCBtb2RlbCApIC0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRFZGl0VmlldyBtb2RlbDogbW9kZWxcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIGVkaXRMUDogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgbGVzc29uUGxhbiA9IG5ldyBMZXNzb25QbGFuXG4gICAgICAgICAgXCJfaWRcIiA6IGlkXG4gICAgICAgIGxlc3NvblBsYW4uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogKCBtb2RlbCApIC0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IExlc3NvblBsYW5FZGl0VmlldyBtb2RlbDogbW9kZWxcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIHJlc3RhcnQ6IChuYW1lKSAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJydW4vI3tuYW1lfVwiLCB0cnVlXG5cbiMgIFdpZGdldFJ1blZpZXcgdGFrZXMgYSBsaXN0IG9mIHN1YnRlc3RzIGFuZCB0aGUgYXNzZXNzbWVudC5cbiAgcnVuOiAoaWQsIGtsYXNzKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBkS2V5ID0gSlNPTi5zdHJpbmdpZnkoaWQuc3Vic3RyKC01LCA1KSlcbiAgICAgICAgdXJsID0gVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcoXCJncm91cFwiLCBcImJ5REtleVwiKVxuICAgICAgICAkLmFqYXhcbiAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICB0eXBlOiBcIkdFVFwiXG4gICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgZGF0YToga2V5OiBkS2V5XG4gICAgICAgICAgZXJyb3I6IChhLCBiKSA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgICAgICBkb2NMaXN0ID0gW11cbiAgICAgICAgICAgIGZvciBkYXR1bSBpbiBkYXRhLnJvd3NcbiAgICAgICAgICAgICAgZG9jTGlzdC5wdXNoIGRhdHVtLmlkXG4gICAgICAgICAgICAgIGtleUxpc3QgPSBfLnVuaXEoZG9jTGlzdClcbiAgICAgICAgICAgIFRhbmdlcmluZS4kZGIuYWxsRG9jc1xuICAgICAgICAgICAgICBrZXlzIDoga2V5TGlzdFxuICAgICAgICAgICAgICBpbmNsdWRlX2RvY3M6dHJ1ZVxuICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgZG9jcyA9IFtdXG4gICAgICAgICAgICAgICAgZm9yIHJvdyBpbiByZXNwb25zZS5yb3dzXG4gICAgICAgICAgICAgICAgICBkb2NzLnB1c2ggcm93LmRvY1xuIyAgICAgICAgICAgICAgICBib2R5ID1cbiMgICAgICAgICAgICAgICAgICBkb2NzOiBkb2NzXG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBXaWRnZXRSdW5WaWV3IG1vZGVsOiBkb2NzXG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgcHJpbnQ6ICggYXNzZXNzbWVudElkLCBmb3JtYXQgKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogKCBtb2RlbCApIC0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRQcmludFZpZXdcbiAgICAgICAgICAgICAgbW9kZWwgIDogbW9kZWxcbiAgICAgICAgICAgICAgZm9ybWF0IDogZm9ybWF0XG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICByZXN1bWU6IChhc3Nlc3NtZW50SWQsIHJlc3VsdElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogKCBhc3Nlc3NtZW50ICkgLT5cbiAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN1bHRcbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHJlc3VsdElkXG4gICAgICAgICAgICByZXN1bHQuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3VsdCkgLT5cbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRSdW5WaWV3XG4gICAgICAgICAgICAgICAgICBtb2RlbDogYXNzZXNzbWVudFxuXG4gICAgICAgICAgICAgICAgaWYgcmVzdWx0LmhhcyhcIm9yZGVyX21hcFwiKVxuICAgICAgICAgICAgICAgICAgIyBzYXZlIHRoZSBvcmRlciBtYXAgb2YgcHJldmlvdXMgcmFuZG9taXphdGlvblxuICAgICAgICAgICAgICAgICAgb3JkZXJNYXAgPSByZXN1bHQuZ2V0KFwib3JkZXJfbWFwXCIpLnNsaWNlKCkgIyBjbG9uZSBhcnJheVxuICAgICAgICAgICAgICAgICAgIyByZXN0b3JlIHRoZSBwcmV2aW91cyBvcmRlcm1hcFxuICAgICAgICAgICAgICAgICAgdmlldy5vcmRlck1hcCA9IG9yZGVyTWFwXG5cbiAgICAgICAgICAgICAgICBmb3Igc3VidGVzdCBpbiByZXN1bHQuZ2V0KFwic3VidGVzdERhdGFcIilcbiAgICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QuZGF0YT8gJiYgc3VidGVzdC5kYXRhLnBhcnRpY2lwYW50X2lkP1xuICAgICAgICAgICAgICAgICAgICBUYW5nZXJpbmUubmF2LnNldFN0dWRlbnQgc3VidGVzdC5kYXRhLnBhcnRpY2lwYW50X2lkXG5cbiAgICAgICAgICAgICAgICAjIHJlcGxhY2UgdGhlIHZpZXcncyByZXN1bHQgd2l0aCBvdXIgb2xkIG9uZVxuICAgICAgICAgICAgICAgIHZpZXcucmVzdWx0ID0gcmVzdWx0XG5cbiAgICAgICAgICAgICAgICAjIEhpamFjayB0aGUgbm9ybWFsIFJlc3VsdCBhbmQgUmVzdWx0VmlldywgdXNlIG9uZSBmcm9tIHRoZSBkYlxuICAgICAgICAgICAgICAgIHZpZXcuc3VidGVzdFZpZXdzLnBvcCgpXG4gICAgICAgICAgICAgICAgdmlldy5zdWJ0ZXN0Vmlld3MucHVzaCBuZXcgUmVzdWx0Vmlld1xuICAgICAgICAgICAgICAgICAgbW9kZWwgICAgICAgICAgOiByZXN1bHRcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnQgICAgIDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgICAgYXNzZXNzbWVudFZpZXcgOiB2aWV3XG4gICAgICAgICAgICAgICAgdmlldy5pbmRleCA9IHJlc3VsdC5nZXQoXCJzdWJ0ZXN0RGF0YVwiKS5sZW5ndGhcbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG5cbiAgcmVzdWx0czogKGFzc2Vzc21lbnRJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYWZ0ZXJGZXRjaCA9IChhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnQoXCJfaWRcIjphc3Nlc3NtZW50SWQpLCBhc3Nlc3NtZW50SWQpIC0+XG4gICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBSZXN1bHRzXG4gICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgaW5jbHVkZV9kb2NzOiBmYWxzZVxuICAgICAgICAgICAga2V5OiBcInJcIiArIGFzc2Vzc21lbnRJZFxuICAgICAgICAgICAgc3VjY2VzczogKHJlc3VsdHMpID0+XG4gICAgICAgICAgICAgIHZpZXcgPSBuZXcgUmVzdWx0c1ZpZXdcbiAgICAgICAgICAgICAgICBcImFzc2Vzc21lbnRcIiA6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgICA6IHJlc3VsdHMubW9kZWxzXG4gICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgIFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAgLT5cbiAgICAgICAgICAgIGFmdGVyRmV0Y2goYXNzZXNzbWVudCwgYXNzZXNzbWVudElkKVxuICAgICAgICAgIGVycm9yIDogIC0+XG4gICAgICAgICAgICBhZnRlckZldGNoKGFzc2Vzc21lbnQsIGFzc2Vzc21lbnRJZClcblxuXG4gICNcbiAgIyBSZXBvcnRzXG4gICNcbiAga2xhc3NHcm91cGluZzogKGtsYXNzSWQsIHBhcnQpIC0+XG4gICAgcGFydCA9IHBhcnNlSW50KHBhcnQpXG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogKCBjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHMgY29sbGVjdGlvbi53aGVyZSBcInBhcnRcIiA6IHBhcnRcbiAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggcmVzdWx0cyApIC0+XG4gICAgICAgICAgICAgICAgICByZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyByZXN1bHRzLndoZXJlIFwia2xhc3NJZFwiIDoga2xhc3NJZFxuICAgICAgICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgIHN0dWRlbnRzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG5cbiAgICAgICAgICAgICAgICAgICAgICAjIGZpbHRlciBgUmVzdWx0c2AgYnkgYEtsYXNzYCdzIGN1cnJlbnQgYFN0dWRlbnRzYFxuICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IFN0dWRlbnRzIHN0dWRlbnRzLndoZXJlIFwia2xhc3NJZFwiIDoga2xhc3NJZFxuICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRJZHMgPSBzdHVkZW50cy5wbHVjayhcIl9pZFwiKVxuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICBmb3IgcmVzdWx0IGluIHJlc3VsdHMubW9kZWxzXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50cy5wdXNoKHJlc3VsdCkgaWYgcmVzdWx0LmdldChcInN0dWRlbnRJZFwiKSBpbiBzdHVkZW50SWRzXG4gICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50c1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc0dyb3VwaW5nVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50c1wiIDogc3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgOiBmaWx0ZXJlZFJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBtYXN0ZXJ5Q2hlY2s6IChzdHVkZW50SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBcIl9pZFwiIDogc3R1ZGVudElkXG4gICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAoc3R1ZGVudCkgLT5cbiAgICAgICAgICAgIGtsYXNzSWQgPSBzdHVkZW50LmdldCBcImtsYXNzSWRcIlxuICAgICAgICAgICAga2xhc3MgPSBuZXcgS2xhc3MgXCJfaWRcIiA6IHN0dWRlbnQuZ2V0IFwia2xhc3NJZFwiXG4gICAgICAgICAgICBrbGFzcy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAoa2xhc3MpIC0+XG4gICAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyBjb2xsZWN0aW9uLndoZXJlIFwic3R1ZGVudElkXCIgOiBzdHVkZW50SWQsIFwicmVwb3J0VHlwZVwiIDogXCJtYXN0ZXJ5XCIsIFwia2xhc3NJZFwiIDoga2xhc3NJZFxuICAgICAgICAgICAgICAgICAgICAjIGdldCBhIGxpc3Qgb2Ygc3VidGVzdHMgaW52b2x2ZWRcbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdElkTGlzdCA9IHt9XG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RJZExpc3RbcmVzdWx0LmdldChcInN1YnRlc3RJZFwiKV0gPSB0cnVlIGZvciByZXN1bHQgaW4gcmVzdWx0cy5tb2RlbHNcbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdElkTGlzdCA9IF8ua2V5cyhzdWJ0ZXN0SWRMaXN0KVxuXG4gICAgICAgICAgICAgICAgICAgICMgbWFrZSBhIGNvbGxlY3Rpb24gYW5kIGZldGNoXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RDb2xsZWN0aW9uID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RDb2xsZWN0aW9uLmFkZCBuZXcgU3VidGVzdChcIl9pZFwiIDogc3VidGVzdElkKSBmb3Igc3VidGVzdElkIGluIHN1YnRlc3RJZExpc3RcbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBNYXN0ZXJ5Q2hlY2tWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudFwiICA6IHN0dWRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcImtsYXNzXCIgICAgOiBrbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0Q29sbGVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgcHJvZ3Jlc3NSZXBvcnQ6IChzdHVkZW50SWQsIGtsYXNzSWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgICMgc2F2ZSB0aGlzIGNyYXp5IGZ1bmN0aW9uIGZvciBsYXRlclxuICAgICAgICAjIHN0dWRlbnRJZCBjYW4gaGF2ZSB0aGUgdmFsdWUgXCJhbGxcIiwgaW4gd2hpY2ggY2FzZSBzdHVkZW50IHNob3VsZCA9PSBudWxsXG4gICAgICAgIGFmdGVyRmV0Y2ggPSAoIHN0dWRlbnQsIHN0dWRlbnRzICkgLT5cbiAgICAgICAgICBrbGFzcyA9IG5ldyBLbGFzcyBcIl9pZFwiIDoga2xhc3NJZFxuICAgICAgICAgIGtsYXNzLmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiAoa2xhc3MpIC0+XG4gICAgICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKCBhbGxTdWJ0ZXN0cyApIC0+XG4gICAgICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyBhbGxTdWJ0ZXN0cy53aGVyZVxuICAgICAgICAgICAgICAgICAgICBcImN1cnJpY3VsdW1JZFwiIDoga2xhc3MuZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICAgICAgICAgIFwicmVwb3J0VHlwZVwiICAgOiBcInByb2dyZXNzXCJcbiAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggY29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgY29sbGVjdGlvbi53aGVyZSBcImtsYXNzSWRcIiA6IGtsYXNzSWQsIFwicmVwb3J0VHlwZVwiIDogXCJwcm9ncmVzc1wiXG5cbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBzdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgIGlmIHN0dWRlbnRzP1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBmaWx0ZXIgYFJlc3VsdHNgIGJ5IGBLbGFzc2AncyBjdXJyZW50IGBTdHVkZW50c2BcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRJZHMgPSBzdHVkZW50cy5wbHVjayhcIl9pZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMgPSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzLm1vZGVsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50cy5wdXNoKHJlc3VsdCkgaWYgcmVzdWx0LmdldChcInN0dWRlbnRJZFwiKSBpbiBzdHVkZW50SWRzXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50c1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBQcm9ncmVzc1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgOiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICBcImtsYXNzXCIgICAgOiBrbGFzc1xuICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gICAgICAgIGlmIHN0dWRlbnRJZCAhPSBcImFsbFwiXG4gICAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IFwiX2lkXCIgOiBzdHVkZW50SWRcbiAgICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiAtPiBhZnRlckZldGNoIHN0dWRlbnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgc3R1ZGVudHMuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IGFmdGVyRmV0Y2ggbnVsbCwgc3R1ZGVudHNcblxuICAjXG4gICMgU3VidGVzdHNcbiAgI1xuICBlZGl0U3VidGVzdDogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgaWQgPSBVdGlscy5jbGVhblVSTCBpZFxuICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3QgX2lkIDogaWRcbiAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChtb2RlbCwgcmVzcG9uc2UpIC0+XG4gICAgICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHN1YnRlc3QuZ2V0KFwiYXNzZXNzbWVudElkXCIpXG4gICAgICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBTdWJ0ZXN0RWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgIG1vZGVsICAgICAgOiBtb2RlbFxuICAgICAgICAgICAgICAgICAgYXNzZXNzbWVudCA6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuICAjXG4gICMgRWxlbWVudHNcbiAgI1xuICBlZGl0RWxlbWVudDogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgaWQgPSBVdGlscy5jbGVhblVSTCBpZFxuICAgICAgICBlbGVtZW50ID0gbmV3IEVsZW1lbnQgX2lkIDogaWRcbiAgICAgICAgZWxlbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChtb2RlbCwgcmVzcG9uc2UpIC0+XG4gICAgICAgICAgICBsZXNzb25QbGFuID0gbmV3IExlc3NvblBsYW5cbiAgICAgICAgICAgICAgXCJfaWRcIiA6IGVsZW1lbnQuZ2V0KFwiYXNzZXNzbWVudElkXCIpXG4gICAgICAgICAgICBsZXNzb25QbGFuLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBFbGVtZW50RWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgIG1vZGVsICAgICAgOiBtb2RlbFxuICAgICAgICAgICAgICAgICAgYXNzZXNzbWVudCA6IGxlc3NvblBsYW5cbiAgICAgICAgICAgICAgICAgIGxlc3NvblBsYW4gOiBsZXNzb25QbGFuXG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cbiAgZWRpdEtsYXNzU3VidGVzdDogKGlkKSAtPlxuXG4gICAgb25TdWNjZXNzID0gKHN1YnRlc3QsIGN1cnJpY3VsdW0sIHF1ZXN0aW9ucz1udWxsKSAtPlxuICAgICAgdmlldyA9IG5ldyBLbGFzc1N1YnRlc3RFZGl0Vmlld1xuICAgICAgICBtb2RlbCAgICAgIDogc3VidGVzdFxuICAgICAgICBjdXJyaWN1bHVtIDogY3VycmljdWx1bVxuICAgICAgICBxdWVzdGlvbnMgIDogcXVlc3Rpb25zXG4gICAgICB2bS5zaG93IHZpZXdcblxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgaWQgPSBVdGlscy5jbGVhblVSTCBpZFxuICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3QgX2lkIDogaWRcbiAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHN1YnRlc3QuZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgaWYgc3VidGVzdC5nZXQoXCJwcm90b3R5cGVcIikgPT0gXCJzdXJ2ZXlcIlxuICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgICAgICAgIGtleSA6IGN1cnJpY3VsdW0uaWRcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zIHF1ZXN0aW9ucy53aGVyZShcInN1YnRlc3RJZFwiOnN1YnRlc3QuaWQpXG4gICAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzIHN1YnRlc3QsIGN1cnJpY3VsdW0sIHF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyBzdWJ0ZXN0LCBjdXJyaWN1bHVtXG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cblxuICAjXG4gICMgUXVlc3Rpb25cbiAgI1xuICBlZGl0UXVlc3Rpb246IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgcXVlc3Rpb24gPSBuZXcgUXVlc3Rpb24gX2lkIDogaWRcbiAgICAgICAgcXVlc3Rpb24uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAocXVlc3Rpb24sIHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBxdWVzdGlvbi5nZXQoXCJhc3Nlc3NtZW50SWRcIilcbiAgICAgICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3RcbiAgICAgICAgICAgICAgICAgIFwiX2lkXCIgOiBxdWVzdGlvbi5nZXQoXCJzdWJ0ZXN0SWRcIilcbiAgICAgICAgICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFF1ZXN0aW9uRWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBcInF1ZXN0aW9uXCIgICA6IHF1ZXN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0XCIgICAgOiBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgXCJhc3Nlc3NtZW50XCIgOiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG5cbiAgZWRpdEtsYXNzUXVlc3Rpb246IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgcXVlc3Rpb24gPSBuZXcgUXVlc3Rpb24gXCJfaWRcIiA6IGlkXG4gICAgICAgIHF1ZXN0aW9uLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKHF1ZXN0aW9uLCByZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bVxuICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwic3VidGVzdElkXCIpXG4gICAgICAgICAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBRdWVzdGlvbkVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvblwiICAgOiBxdWVzdGlvblxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICAgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgIFwiYXNzZXNzbWVudFwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gICNcbiAgIyBVc2VyXG4gICNcbiAgbG9naW46IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG4gICAgICBpc1VucmVnaXN0ZXJlZDogLT5cblxuICAgICAgICBzaG93VmlldyA9ICh1c2VycyA9IFtdKSAtPlxuICAgICAgICAgIHZpZXcgPSBuZXcgTG9naW5WaWV3XG4gICAgICAgICAgICB1c2VyczogdXNlcnNcbiAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICBzaG93VmlldygpXG5cbiAgbG9nb3V0OiAtPlxuICAgIFRhbmdlcmluZS51c2VyLmxvZ291dCgpXG5cbiAgYWNjb3VudDogLT5cbiAgICAjIGNoYW5nZSB0aGUgbG9jYXRpb24gdG8gdGhlIHRydW5rLCB1bmxlc3Mgd2UncmUgYWxyZWFkeSBpbiB0aGUgdHJ1bmtcbiAgICBpZiBUYW5nZXJpbmUuZGJfbmFtZSAhPSBcInRhbmdlcmluZVwiXG4gICAgICB3aW5kb3cubG9jYXRpb24gPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsSW5kZXgoXCJ0cnVua1wiLCBcImFjY291bnRcIilcbiAgICBlbHNlXG4gICAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICAgIHZpZXcgPSBuZXcgQWNjb3VudFZpZXdcbiAgICAgICAgICAgIHVzZXIgOiBUYW5nZXJpbmUudXNlclxuICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHNldHRpbmdzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IFNldHRpbmdzVmlld1xuICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIGxvZ3M6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGxvZ3MgPSBuZXcgTG9nc1xuICAgICAgICBsb2dzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgTG9nVmlld1xuICAgICAgICAgICAgICBsb2dzOiBsb2dzXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG5cblxuICAjIFRyYW5zZmVyIGEgbmV3IHVzZXIgZnJvbSB0YW5nZXJpbmUtY2VudHJhbCBpbnRvIHRhbmdlcmluZVxuICB0cmFuc2ZlcjogLT5cbiAgICBnZXRWYXJzID0gVXRpbHMuJF9HRVQoKVxuICAgIG5hbWUgPSBnZXRWYXJzLm5hbWVcbiAgICAkLmNvdWNoLmxvZ291dFxuICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgJC5jb29raWUgXCJBdXRoU2Vzc2lvblwiLCBudWxsXG4gICAgICAgICQuY291Y2gubG9naW5cbiAgICAgICAgICBcIm5hbWVcIiAgICAgOiBuYW1lXG4gICAgICAgICAgXCJwYXNzd29yZFwiIDogbmFtZVxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICAkLmNvdWNoLnNpZ251cFxuICAgICAgICAgICAgICBcIm5hbWVcIiA6ICBuYW1lXG4gICAgICAgICAgICAgIFwicm9sZXNcIiA6IFtcIl9hZG1pblwiXVxuICAgICAgICAgICAgLCBuYW1lLFxuICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgdXNlciA9IG5ldyBVc2VyXG4gICAgICAgICAgICAgIHVzZXIuc2F2ZVxuICAgICAgICAgICAgICAgIFwibmFtZVwiICA6IG5hbWVcbiAgICAgICAgICAgICAgICBcImlkXCIgICAgOiBcInRhbmdlcmluZS51c2VyOlwiK25hbWVcbiAgICAgICAgICAgICAgICBcInJvbGVzXCIgOiBbXVxuICAgICAgICAgICAgICAgIFwiZnJvbVwiICA6IFwidGNcIlxuICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgd2FpdDogdHJ1ZVxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAkLmNvdWNoLmxvZ2luXG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiICAgICA6IG5hbWVcbiAgICAgICAgICAgICAgICAgICAgXCJwYXNzd29yZFwiIDogbmFtZVxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzIDogLT5cbiAgICAgICAgICAgICAgICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICAgICAgICAgICAgICBVdGlscy5zdGlja3kgXCJFcnJvciB0cmFuc2ZlcmluZyB1c2VyLlwiXG4iXX0=
