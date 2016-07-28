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
    if (~String(window.location.href).indexOf("tangerine/_design")) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9yb3V0ZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTtFQUFBOzs7O0FBQU07Ozs7Ozs7bUJBT0osT0FBQSxHQUFTLFNBQUMsUUFBRCxFQUFXLElBQVgsRUFBaUIsSUFBakI7SUFDUCxDQUFBLENBQUUsU0FBRixDQUFZLENBQUMsSUFBYixDQUFBO0lBQ0EsSUFBSSxRQUFKO2FBQ0UsUUFBUSxDQUFDLEtBQVQsQ0FBZSxJQUFmLEVBQXFCLElBQXJCLEVBREY7O0VBRk87O21CQUtULE1BQUEsR0FDRTtJQUFBLE9BQUEsRUFBYSxPQUFiO0lBQ0EsVUFBQSxFQUFhLFVBRGI7SUFFQSxRQUFBLEVBQWEsUUFGYjtJQUdBLFNBQUEsRUFBYSxTQUhiO0lBS0EsVUFBQSxFQUFhLFVBTGI7SUFPQSxVQUFBLEVBQWEsVUFQYjtJQVFBLFFBQUEsRUFBVyxRQVJYO0lBVUEsRUFBQSxFQUFLLFNBVkw7SUFZQSxNQUFBLEVBQVMsTUFaVDtJQWVBLE9BQUEsRUFBbUIsT0FmbkI7SUFnQkEsZ0JBQUEsRUFBbUIsV0FoQm5CO0lBaUJBLDBCQUFBLEVBQW9DLGFBakJwQztJQWtCQSxpQ0FBQSxFQUFvQyxlQWxCcEM7SUFtQkEsbUJBQUEsRUFBc0Isa0JBbkJ0QjtJQW9CQSxvQkFBQSxFQUF1QixtQkFwQnZCO0lBc0JBLGlCQUFBLEVBQW9CLGFBdEJwQjtJQXVCQSxXQUFBLEVBQW9CLGFBdkJwQjtJQXlCQSxpQ0FBQSxFQUFvQyxZQXpCcEM7SUEyQkEsb0RBQUEsRUFBdUQsZ0JBM0J2RDtJQTZCQSxXQUFBLEVBQXNCLFdBN0J0QjtJQThCQSxnQkFBQSxFQUFzQixZQTlCdEI7SUErQkEsa0JBQUEsRUFBc0Isa0JBL0J0QjtJQWlDQSxxQ0FBQSxFQUF3QyxlQWpDeEM7SUFrQ0EsZ0NBQUEsRUFBd0MsY0FsQ3hDO0lBbUNBLHFDQUFBLEVBQXdDLGdCQW5DeEM7SUF1Q0EsUUFBQSxFQUFXLFFBdkNYO0lBeUNBLGFBQUEsRUFBdUIsYUF6Q3ZCO0lBMkNBLFNBQUEsRUFBa0IsS0EzQ2xCO0lBNENBLG1CQUFBLEVBQTRCLE9BNUM1QjtJQTZDQSxlQUFBLEVBQWtCLFdBN0NsQjtJQStDQSxnQ0FBQSxFQUFzQyxRQS9DdEM7SUFpREEsYUFBQSxFQUFrQixTQWpEbEI7SUFrREEsVUFBQSxFQUFrQixNQWxEbEI7SUFtREEsWUFBQSxFQUFvQixRQW5EcEI7SUFvREEsYUFBQSxFQUFrQixTQXBEbEI7SUFxREEsUUFBQSxFQUFrQixRQXJEbEI7SUF1REEsYUFBQSxFQUFzQixhQXZEdEI7SUF5REEsY0FBQSxFQUFpQixjQXpEakI7SUEwREEsV0FBQSxFQUFjLFdBMURkO0lBMkRBLG9CQUFBLEVBQXVCLFdBM0R2QjtJQTREQSxPQUFBLEVBQVUsT0E1RFY7SUE4REEsVUFBQSxFQUFrQixNQTlEbEI7OzttQkFpRUYsS0FBQSxHQUFPLFNBQUMsT0FBRDtXQUNMLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUNFO01BQUEsT0FBQSxFQUFTLFNBQUE7ZUFDUCxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQVIsQ0FDRTtVQUFBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLFNBQUQ7QUFDUCxrQkFBQTtjQUFBLE1BQUEsR0FBUyxTQUFTLENBQUMsTUFBVixDQUFpQixTQUFDLFFBQUQ7dUJBQWMsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsUUFBakIsQ0FBQSxLQUE4QjtjQUE1QyxDQUFqQjtjQUNULElBQUEsR0FBVyxJQUFBLFNBQUEsQ0FDVDtnQkFBQSxNQUFBLEVBQVMsTUFBVDtlQURTO3FCQUVYLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUjtZQUpPO1VBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO1NBREY7TUFETyxDQUFUO0tBREY7RUFESzs7bUJBVVAsU0FBQSxHQUFXLFNBQUMsT0FBRDtBQUNULFFBQUE7SUFBQSxPQUFBLHFCQUFVLE9BQU8sQ0FBRSxLQUFULENBQWUsSUFBZjtJQUNWLE9BQU8sQ0FBQyxHQUFSLENBQVksV0FBQSxHQUFjLE9BQTFCO0lBRUEsaUJBQUEsR0FDRTtNQUFBLFVBQUEsRUFBWSxLQUFaO01BQ0EsT0FBQSxFQUFTLFlBRFQ7O0lBSUYsQ0FBQyxDQUFDLElBQUYsQ0FBTyxPQUFQLEVBQWdCLFNBQUMsTUFBRCxFQUFRLEtBQVI7TUFDZCxJQUFBLENBQUEsQ0FBTyxLQUFBLEdBQVEsQ0FBZixDQUFBO2VBQ0UsaUJBQWtCLENBQUEsTUFBQSxDQUFsQixHQUE0QixPQUFRLENBQUEsS0FBQSxHQUFNLENBQU4sRUFEdEM7O0lBRGMsQ0FBaEI7SUFJQSxJQUFBLEdBQVcsSUFBQSxhQUFBLENBQWUsaUJBQWY7V0FFWCxFQUFFLENBQUMsSUFBSCxDQUFRLElBQVI7RUFmUzs7bUJBaUJYLE9BQUEsR0FBUyxTQUFBO0lBRVAsSUFBRyxDQUFDLE1BQUEsQ0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQXZCLENBQTRCLENBQUMsT0FBN0IsQ0FBcUMsbUJBQXJDLENBQUo7YUFDRSxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLFFBQTFCLEVBQW9DLElBQXBDLEVBREY7S0FBQSxNQUFBO2FBR0UsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFqQixDQUEwQixhQUExQixFQUF5QyxJQUF6QyxFQUhGOztFQUZPOzttQkFRVCxNQUFBLEdBQVEsU0FBQTtXQUNOLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUNFO01BQUEsZUFBQSxFQUFpQixTQUFBO0FBQ2YsWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFJO2VBQ1gsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSO01BRmUsQ0FBakI7S0FERjtFQURNOzttQkFTUixTQUFBLEdBQVcsU0FBQTtXQUNULFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUNFO01BQUEsZUFBQSxFQUFpQixTQUFBO0FBQ2YsWUFBQTtRQUFBLFNBQUEsR0FBWSxJQUFJO2VBQ2hCLFNBQVMsQ0FBQyxLQUFWLENBQ0U7VUFBQSxPQUFBLEVBQVMsU0FBQyxVQUFEO0FBQ1AsZ0JBQUE7WUFBQSxJQUFBLEdBQVcsSUFBQSxhQUFBLENBQ1Q7Y0FBQSxXQUFBLEVBQWMsVUFBZDthQURTO21CQUVYLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUjtVQUhPLENBQVQ7U0FERjtNQUZlLENBQWpCO0tBREY7RUFEUzs7bUJBVVgsVUFBQSxHQUFZLFNBQUMsWUFBRDtXQUNWLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUNFO01BQUEsZUFBQSxFQUFpQixTQUFBO0FBQ2YsWUFBQTtRQUFBLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQVc7VUFBQSxLQUFBLEVBQVEsWUFBUjtTQUFYO2VBQ2pCLFVBQVUsQ0FBQyxLQUFYLENBQ0U7VUFBQSxPQUFBLEVBQVMsU0FBQTtBQUNQLGdCQUFBO1lBQUEsV0FBQSxHQUFjLElBQUk7bUJBQ2xCLFdBQVcsQ0FBQyxLQUFaLENBQ0U7Y0FBQSxPQUFBLEVBQVMsU0FBQTtBQUNQLG9CQUFBO2dCQUFBLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBUyxXQUFXLENBQUMsS0FBWixDQUFrQjtrQkFBQSxjQUFBLEVBQWlCLFlBQWpCO2lCQUFsQixDQUFUO2dCQUNmLFlBQUEsR0FBZSxJQUFJO3VCQUNuQixZQUFZLENBQUMsS0FBYixDQUNFO2tCQUFBLE9BQUEsRUFBUyxTQUFBO0FBQ1Asd0JBQUE7b0JBQUEsU0FBQSxHQUFZO29CQUNaLFFBQVEsQ0FBQyxJQUFULENBQWMsU0FBQyxPQUFEOzZCQUFhLFNBQUEsR0FBWSxTQUFTLENBQUMsTUFBVixDQUFpQixZQUFZLENBQUMsS0FBYixDQUFtQjt3QkFBQSxXQUFBLEVBQWMsT0FBTyxDQUFDLEVBQXRCO3VCQUFuQixDQUFqQjtvQkFBekIsQ0FBZDtvQkFDQSxTQUFBLEdBQWdCLElBQUEsU0FBQSxDQUFVLFNBQVY7b0JBQ2hCLElBQUEsR0FBVyxJQUFBLGNBQUEsQ0FDVDtzQkFBQSxZQUFBLEVBQWUsVUFBZjtzQkFDQSxVQUFBLEVBQWUsUUFEZjtzQkFFQSxXQUFBLEVBQWUsU0FGZjtxQkFEUzsyQkFLWCxFQUFFLENBQUMsSUFBSCxDQUFRLElBQVI7a0JBVE8sQ0FBVDtpQkFERjtjQUhPLENBQVQ7YUFERjtVQUZPLENBQVQ7U0FERjtNQUZlLENBQWpCO0tBREY7RUFEVTs7bUJBd0JaLGNBQUEsR0FBZ0IsU0FBQyxZQUFEO1dBQ2QsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFmLENBQ0U7TUFBQSxlQUFBLEVBQWlCLFNBQUE7QUFDZixZQUFBO1FBQUEsVUFBQSxHQUFpQixJQUFBLFVBQUEsQ0FBVztVQUFBLEtBQUEsRUFBUSxZQUFSO1NBQVg7ZUFDakIsVUFBVSxDQUFDLEtBQVgsQ0FDRTtVQUFBLE9BQUEsRUFBUyxTQUFBO0FBQ1AsZ0JBQUE7WUFBQSxXQUFBLEdBQWMsSUFBSTttQkFDbEIsV0FBVyxDQUFDLEtBQVosQ0FDRTtjQUFBLE9BQUEsRUFBUyxTQUFBO0FBQ1Asb0JBQUE7Z0JBQUEsUUFBQSxHQUFXLFdBQVcsQ0FBQyxLQUFaLENBQWtCO2tCQUFBLGNBQUEsRUFBaUIsWUFBakI7aUJBQWxCO2dCQUNYLFFBQUE7O0FBQVk7dUJBQUEsMENBQUE7O2tDQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBWjtBQUFBOzs7Z0JBQ1osU0FBQSxHQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBVCxDQUFlLElBQWYsRUFBcUIsUUFBckI7Z0JBQ1osSUFBQSxHQUFXLElBQUEsY0FBQSxDQUNUO2tCQUFBLFlBQUEsRUFBZSxVQUFmO2tCQUNBLFVBQUEsRUFBYSxRQURiO2tCQUVBLE9BQUEsRUFBVSxTQUZWO2lCQURTO3VCQUlYLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUjtjQVJPLENBQVQ7YUFERjtVQUZPLENBQVQ7U0FERjtNQUZlLENBQWpCO0tBREY7RUFEYzs7bUJBbUJoQixnQkFBQSxHQUFrQixTQUFBO1dBQ2hCLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUNFO01BQUEsZUFBQSxFQUFpQixTQUFBO0FBQ2YsWUFBQTtRQUFBLElBQUEsR0FBVyxJQUFBLG9CQUFBLENBQ1Q7VUFBQSxJQUFBLEVBQU8sWUFBUDtTQURTO2VBRVgsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSO01BSGUsQ0FBakI7S0FERjtFQURnQjs7bUJBT2xCLEtBQUEsR0FBTyxTQUFBO1dBQ0wsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFmLENBQ0U7TUFBQSxlQUFBLEVBQWlCLFNBQUE7QUFDZixZQUFBO1FBQUEsVUFBQSxHQUFhLElBQUk7ZUFDakIsVUFBVSxDQUFDLEtBQVgsQ0FDRTtVQUFBLE9BQUEsRUFBUyxTQUFFLGVBQUY7QUFDUCxnQkFBQTtZQUFBLFFBQUEsR0FBVyxJQUFJO21CQUNmLFFBQVEsQ0FBQyxLQUFULENBQ0U7Y0FBQSxPQUFBLEVBQVMsU0FBQTtBQUNQLG9CQUFBO2dCQUFBLFlBQUEsR0FBZSxJQUFJO3VCQUNuQixZQUFZLENBQUMsS0FBYixDQUNFO2tCQUFBLE9BQUEsRUFBUyxTQUFFLG1CQUFGO0FBQ1Asd0JBQUE7b0JBQUEsSUFBRyxDQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBZixDQUFBLENBQVA7c0JBQ0UsZUFBQSxHQUFzQixJQUFBLE9BQUEsQ0FBUSxlQUFlLENBQUMsS0FBaEIsQ0FBc0I7d0JBQUEsV0FBQSxFQUFjLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBZixDQUFtQixXQUFuQixDQUFkO3VCQUF0QixDQUFSLEVBRHhCOztvQkFFQSxJQUFBLEdBQVcsSUFBQSxXQUFBLENBQ1Q7c0JBQUEsT0FBQSxFQUFZLGVBQVo7c0JBQ0EsU0FBQSxFQUFZLG1CQURaO3NCQUVBLFFBQUEsRUFBWSxRQUZaO3FCQURTOzJCQUlYLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUjtrQkFQTyxDQUFUO2lCQURGO2NBRk8sQ0FBVDthQURGO1VBRk8sQ0FBVDtTQURGO01BRmUsQ0FBakI7S0FERjtFQURLOzttQkFvQlAsU0FBQSxHQUFXLFNBQUMsRUFBRDtXQUNULFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUNFO01BQUEsZUFBQSxFQUFpQixTQUFBO0FBQ2YsWUFBQTtRQUFBLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTTtVQUFBLEdBQUEsRUFBTSxFQUFOO1NBQU47ZUFDWixLQUFLLENBQUMsS0FBTixDQUNFO1VBQUEsT0FBQSxFQUFTLFNBQUUsS0FBRjtBQUNQLGdCQUFBO1lBQUEsUUFBQSxHQUFXLElBQUk7bUJBQ2YsUUFBUSxDQUFDLEtBQVQsQ0FDRTtjQUFBLE9BQUEsRUFBUyxTQUFBO0FBQ1Asb0JBQUE7Z0JBQUEsV0FBQSxHQUFjLElBQUk7dUJBQ2xCLFdBQVcsQ0FBQyxLQUFaLENBQ0U7a0JBQUEsT0FBQSxFQUFTLFNBQUMsV0FBRDtBQUNQLHdCQUFBO29CQUFBLGFBQUEsR0FBb0IsSUFBQSxRQUFBLENBQVMsV0FBVyxDQUFDLEtBQVosQ0FBa0I7c0JBQUMsT0FBQSxFQUFVLEVBQVg7cUJBQWxCLENBQVQ7b0JBQ3BCLElBQUEsR0FBVyxJQUFBLGFBQUEsQ0FDVDtzQkFBQSxLQUFBLEVBQWMsS0FBZDtzQkFDQSxRQUFBLEVBQWMsYUFEZDtzQkFFQSxXQUFBLEVBQWMsV0FGZDtzQkFHQSxRQUFBLEVBQWMsUUFIZDtxQkFEUzsyQkFLWCxFQUFFLENBQUMsSUFBSCxDQUFRLElBQVI7a0JBUE8sQ0FBVDtpQkFERjtjQUZPLENBQVQ7YUFERjtVQUZPLENBQVQ7U0FERjtNQUZlLENBQWpCO0tBREY7RUFEUzs7bUJBb0JYLFdBQUEsR0FBYSxTQUFDLE9BQUQsRUFBVSxJQUFWOztNQUFVLE9BQUs7O1dBQzFCLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUNFO01BQUEsZUFBQSxFQUFpQixTQUFBO0FBQ2YsWUFBQTtRQUFBLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTTtVQUFBLEtBQUEsRUFBUSxPQUFSO1NBQU47ZUFDWixLQUFLLENBQUMsS0FBTixDQUNFO1VBQUEsT0FBQSxFQUFTLFNBQUE7QUFDUCxnQkFBQTtZQUFBLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQVc7Y0FBQSxLQUFBLEVBQVEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxjQUFWLENBQVI7YUFBWDttQkFDakIsVUFBVSxDQUFDLEtBQVgsQ0FDRTtjQUFBLE9BQUEsRUFBUyxTQUFBO0FBQ1Asb0JBQUE7Z0JBQUEsV0FBQSxHQUFjLElBQUk7dUJBQ2xCLFdBQVcsQ0FBQyxLQUFaLENBQ0U7a0JBQUEsT0FBQSxFQUFTLFNBQUMsVUFBRDtBQUNQLHdCQUFBO29CQUFBLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBVyxVQUFVLENBQUMsS0FBWCxDQUFrQjtzQkFBQSxTQUFBLEVBQVksT0FBWjtxQkFBbEIsQ0FBWDtvQkFFZixVQUFBLEdBQWEsSUFBSTsyQkFDakIsVUFBVSxDQUFDLEtBQVgsQ0FDRTtzQkFBQSxPQUFBLEVBQVMsU0FBQyxVQUFEO0FBQ1AsNEJBQUE7d0JBQUEsT0FBQSxHQUFjLElBQUEsWUFBQSxDQUFlLFVBQVUsQ0FBQyxLQUFYLENBQWtCOzBCQUFBLFNBQUEsRUFBWSxPQUFaO3lCQUFsQixDQUFmO3dCQUVkLFdBQUEsR0FBYyxJQUFJOytCQUNsQixXQUFXLENBQUMsS0FBWixDQUNFOzBCQUFBLE9BQUEsRUFBUyxTQUFDLFVBQUQ7QUFDUCxnQ0FBQTs0QkFBQSxRQUFBLEdBQWUsSUFBQSxRQUFBLENBQVcsVUFBVSxDQUFDLEtBQVgsQ0FBa0I7OEJBQUEsY0FBQSxFQUFpQixLQUFLLENBQUMsR0FBTixDQUFVLGNBQVYsQ0FBakI7NkJBQWxCLENBQVg7NEJBQ2YsSUFBQSxHQUFXLElBQUEsZUFBQSxDQUNUOzhCQUFBLE1BQUEsRUFBZSxJQUFmOzhCQUNBLFVBQUEsRUFBZSxRQURmOzhCQUVBLFNBQUEsRUFBZSxPQUZmOzhCQUdBLFVBQUEsRUFBZSxRQUhmOzhCQUlBLFlBQUEsRUFBZSxVQUpmOzhCQUtBLE9BQUEsRUFBZSxLQUxmOzZCQURTO21DQU9YLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUjswQkFUTyxDQUFUO3lCQURGO3NCQUpPLENBQVQ7cUJBREY7a0JBSk8sQ0FBVDtpQkFERjtjQUZPLENBQVQ7YUFERjtVQUZPLENBQVQ7U0FERjtNQUZlLENBQWpCO0tBREY7RUFEVzs7bUJBaUNiLGNBQUEsR0FBZ0IsU0FBQyxTQUFELEVBQVksU0FBWjtXQUNkLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUNFO01BQUEsZUFBQSxFQUFpQixTQUFBO0FBQ2YsWUFBQTtRQUFBLE9BQUEsR0FBYyxJQUFBLE9BQUEsQ0FBUTtVQUFBLEtBQUEsRUFBUSxTQUFSO1NBQVI7ZUFDZCxPQUFPLENBQUMsS0FBUixDQUNFO1VBQUEsT0FBQSxFQUFTLFNBQUE7QUFDUCxnQkFBQTtZQUFBLE9BQUEsR0FBYyxJQUFBLE9BQUEsQ0FBUTtjQUFBLEtBQUEsRUFBUSxTQUFSO2FBQVI7bUJBQ2QsT0FBTyxDQUFDLEtBQVIsQ0FDRTtjQUFBLE9BQUEsRUFBUyxTQUFBO3VCQUNQLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBZCxDQUFzQixTQUFTLENBQUMsVUFBWCxHQUFzQiwwQkFBM0MsRUFDRTtrQkFBQSxHQUFBLEVBQU0sQ0FBQyxTQUFELEVBQVcsU0FBWCxDQUFOO2tCQUNBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFDLFFBQUQ7QUFDUCwwQkFBQTtzQkFBQSxVQUFBLEdBQWEsSUFBSTs2QkFDakIsVUFBVSxDQUFDLEtBQVgsQ0FDRTt3QkFBQSxPQUFBLEVBQVMsU0FBQyxVQUFEO0FBQ1AsOEJBQUE7MEJBQUEsT0FBQSxHQUFVLFVBQVUsQ0FBQyxLQUFYLENBQ1I7NEJBQUEsV0FBQSxFQUFjLFNBQWQ7NEJBQ0EsV0FBQSxFQUFjLFNBRGQ7NEJBRUEsU0FBQSxFQUFjLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBWixDQUZkOzJCQURROzBCQUlWLElBQUEsR0FBVyxJQUFBLHNCQUFBLENBQ1Q7NEJBQUEsWUFBQSxFQUFlLFVBQWY7NEJBQ0EsU0FBQSxFQUFhLE9BRGI7NEJBRUEsU0FBQSxFQUFhLE9BRmI7NEJBR0EsU0FBQSxFQUFhLE9BSGI7NEJBSUEsVUFBQSxFQUFhLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFKM0I7MkJBRFM7aUNBTVgsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSO3dCQVhPLENBQVQ7dUJBREY7b0JBRk87a0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURUO2lCQURGO2NBRE8sQ0FBVDthQURGO1VBRk8sQ0FBVDtTQURGO01BRmUsQ0FBakI7S0FERjtFQURjOzttQkEyQmhCLFVBQUEsR0FBWSxTQUFDLFNBQUQsRUFBWSxTQUFaO1dBQ1YsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFmLENBQ0U7TUFBQSxlQUFBLEVBQWlCLFNBQUE7QUFDZixZQUFBO1FBQUEsT0FBQSxHQUFjLElBQUEsT0FBQSxDQUFRO1VBQUEsS0FBQSxFQUFRLFNBQVI7U0FBUjtlQUNkLE9BQU8sQ0FBQyxLQUFSLENBQ0U7VUFBQSxPQUFBLEVBQVMsU0FBQTtBQUNQLGdCQUFBO1lBQUEsT0FBQSxHQUFjLElBQUEsT0FBQSxDQUFRO2NBQUEsS0FBQSxFQUFRLFNBQVI7YUFBUjtZQUdkLGNBQUEsR0FBaUIsU0FBQyxPQUFELEVBQVUsT0FBVjtxQkFDZixPQUFPLENBQUMsS0FBUixDQUNFO2dCQUFBLE9BQUEsRUFBUyxTQUFBO0FBR1Asc0JBQUE7a0JBQUEsU0FBQSxHQUFZLFNBQUMsT0FBRCxFQUFVLE9BQVYsRUFBbUIsUUFBbkIsRUFBa0MsWUFBbEM7QUFDVix3QkFBQTs7c0JBRDZCLFdBQVM7OztzQkFBTSxlQUFhOztvQkFDekQsSUFBQSxHQUFXLElBQUEsbUJBQUEsQ0FDVDtzQkFBQSxTQUFBLEVBQWlCLE9BQWpCO3NCQUNBLFNBQUEsRUFBaUIsT0FEakI7c0JBRUEsV0FBQSxFQUFpQixTQUZqQjtzQkFHQSxjQUFBLEVBQWlCLFlBSGpCO3FCQURTOzJCQUtYLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUjtrQkFOVTtrQkFRWixTQUFBLEdBQVk7a0JBQ1osSUFBRyxPQUFPLENBQUMsR0FBUixDQUFZLFdBQVosQ0FBQSxLQUE0QixRQUEvQjsyQkFDRSxTQUFTLENBQUMsR0FBRyxDQUFDLElBQWQsQ0FBc0IsU0FBUyxDQUFDLFVBQVgsR0FBc0IsMEJBQTNDLEVBQ0U7c0JBQUEsR0FBQSxFQUFNLENBQUMsU0FBRCxFQUFXLE9BQU8sQ0FBQyxHQUFSLENBQVksWUFBWixDQUFYLENBQU47c0JBQ0EsT0FBQSxFQUFTLENBQUEsU0FBQSxLQUFBOytCQUFBLFNBQUMsUUFBRDtBQUNQLDhCQUFBOzBCQUFBLElBQUcsUUFBUSxDQUFDLElBQVQsS0FBaUIsQ0FBcEI7NEJBQ0UsWUFBQSxHQUFtQixJQUFBLFdBQUEsNENBQWlDLENBQUUsY0FBbkMsRUFEckI7OzBCQUVBLFNBQUEsR0FBWSxJQUFJO2lDQUNoQixTQUFTLENBQUMsS0FBVixDQUNFOzRCQUFBLEdBQUEsRUFBSyxHQUFBLEdBQU0sT0FBTyxDQUFDLEdBQVIsQ0FBWSxjQUFaLENBQVg7NEJBQ0EsT0FBQSxFQUFTLFNBQUE7OEJBQ1AsU0FBQSxHQUFnQixJQUFBLFNBQUEsQ0FBVSxTQUFTLENBQUMsS0FBVixDQUFnQjtnQ0FBQyxTQUFBLEVBQVksU0FBYjsrQkFBaEIsQ0FBVjtxQ0FDaEIsU0FBQSxDQUFVLE9BQVYsRUFBbUIsT0FBbkIsRUFBNEIsU0FBNUIsRUFBdUMsWUFBdkM7NEJBRk8sQ0FEVDsyQkFERjt3QkFKTztzQkFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFQ7cUJBREYsRUFERjttQkFBQSxNQUFBOzJCQWFFLFNBQUEsQ0FBVSxPQUFWLEVBQW1CLE9BQW5CLEVBYkY7O2dCQVpPLENBQVQ7ZUFERjtZQURlO1lBOEJqQixJQUFHLFNBQUEsS0FBYSxNQUFoQjtxQkFDRSxPQUFPLENBQUMsS0FBUixDQUNFO2dCQUFBLE9BQUEsRUFBUyxTQUFBO3lCQUFHLGNBQUEsQ0FBZ0IsT0FBaEIsRUFBeUIsT0FBekI7Z0JBQUgsQ0FBVDtnQkFDQSxLQUFBLEVBQU8sU0FBQTt5QkFDTCxPQUFPLENBQUMsSUFBUixDQUFhLElBQWIsRUFDRTtvQkFBQSxPQUFBLEVBQVMsU0FBQTs2QkFBRyxjQUFBLENBQWdCLE9BQWhCLEVBQXlCLE9BQXpCO29CQUFILENBQVQ7bUJBREY7Z0JBREssQ0FEUDtlQURGLEVBREY7YUFBQSxNQUFBO3FCQU9FLE9BQU8sQ0FBQyxLQUFSLENBQ0U7Z0JBQUEsT0FBQSxFQUFTLFNBQUE7eUJBQ1AsY0FBQSxDQUFlLE9BQWYsRUFBd0IsT0FBeEI7Z0JBRE8sQ0FBVDtlQURGLEVBUEY7O1VBbENPLENBQVQ7U0FERjtNQUZlLENBQWpCO0tBREY7RUFEVTs7bUJBa0RaLFFBQUEsR0FBVSxTQUFBO1dBQ1IsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFmLENBQ0U7TUFBQSxjQUFBLEVBQWdCLFNBQUE7QUFDZCxZQUFBO1FBQUEsSUFBQSxHQUFXLElBQUEsbUJBQUEsQ0FDVDtVQUFBLElBQUEsRUFBTyxJQUFJLElBQVg7U0FEUztlQUVYLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUjtNQUhjLENBQWhCO01BSUEsZUFBQSxFQUFpQixTQUFBO2VBQ2YsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFqQixDQUFBO01BRGUsQ0FKakI7S0FERjtFQURROzttQkFTVixXQUFBLEdBQWEsU0FBRSxTQUFGO1dBQ1gsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFmLENBQ0U7TUFBQSxlQUFBLEVBQWlCLFNBQUE7QUFDZixZQUFBO1FBQUEsT0FBQSxHQUFjLElBQUEsT0FBQSxDQUFRO1VBQUEsR0FBQSxFQUFNLFNBQU47U0FBUjtlQUNkLE9BQU8sQ0FBQyxLQUFSLENBQ0U7VUFBQSxPQUFBLEVBQVMsU0FBQyxLQUFEO0FBQ1AsZ0JBQUE7WUFBQSxVQUFBLEdBQWEsSUFBSTttQkFDakIsVUFBVSxDQUFDLEtBQVgsQ0FDRTtjQUFBLE9BQUEsRUFBUyxTQUFFLGVBQUY7QUFDUCxvQkFBQTtnQkFBQSxJQUFBLEdBQVcsSUFBQSxlQUFBLENBQ1Q7a0JBQUEsT0FBQSxFQUFVLEtBQVY7a0JBQ0EsT0FBQSxFQUFVLGVBRFY7aUJBRFM7dUJBR1gsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSO2NBSk8sQ0FBVDthQURGO1VBRk8sQ0FBVDtTQURGO01BRmUsQ0FBakI7S0FERjtFQURXOzttQkFvQmIsU0FBQSxHQUFXLFNBQUUsWUFBRjtXQUNULFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUNFO01BQUEsT0FBQSxFQUFTLFNBQUE7QUFDUCxZQUFBO1FBQUEsVUFBQSxHQUFpQixJQUFBLFVBQUEsQ0FBVztVQUFBLEtBQUEsRUFBUSxZQUFSO1NBQVg7ZUFDakIsVUFBVSxDQUFDLEtBQVgsQ0FDRTtVQUFBLE9BQUEsRUFBUyxTQUFBO0FBQ1AsZ0JBQUE7WUFBQSxTQUFBLEdBQVksSUFBSTttQkFDaEIsU0FBUyxDQUFDLEtBQVYsQ0FDRTtjQUFBLEdBQUEsRUFBSyxHQUFBLEdBQU0sWUFBWDtjQUNBLE9BQUEsRUFBUyxTQUFBO0FBQ1Asb0JBQUE7Z0JBQUEsb0JBQUEsR0FBdUIsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsV0FBbEI7QUFDdkIscUJBQUEsaUNBQUE7O2tCQUNFLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBcEIsQ0FBd0IsU0FBeEIsQ0FBa0MsQ0FBQyxTQUFuQyxHQUFtRCxJQUFBLFNBQUEsQ0FBVSxTQUFWO0FBRHJEO3VCQUVBLEVBQUUsQ0FBQyxJQUFILENBQVksSUFBQSx1QkFBQSxDQUF3QjtrQkFBQSxVQUFBLEVBQVksVUFBWjtpQkFBeEIsQ0FBWjtjQUpPLENBRFQ7YUFERjtVQUZPLENBQVQ7U0FERjtNQUZPLENBQVQ7S0FERjtFQURTOzttQkFpQlgsSUFBQSxHQUFNLFNBQUUsWUFBRjtXQUNKLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUNFO01BQUEsT0FBQSxFQUFTLFNBQUE7QUFDUCxZQUFBO1FBQUEsVUFBQSxHQUFpQixJQUFBLFVBQUEsQ0FBVztVQUFBLEtBQUEsRUFBUSxZQUFSO1NBQVg7ZUFDakIsVUFBVSxDQUFDLEtBQVgsQ0FDRTtVQUFBLE9BQUEsRUFBUyxTQUFBO21CQUNQLEVBQUUsQ0FBQyxJQUFILENBQVksSUFBQSxrQkFBQSxDQUFtQjtjQUFBLFlBQUEsRUFBYyxVQUFkO2FBQW5CLENBQVo7VUFETyxDQUFUO1NBREY7TUFGTyxDQUFUO0tBREY7RUFESTs7bUJBUU4sU0FBQSxHQUFRLFNBQUE7V0FDTixTQUFTLENBQUMsSUFBSSxDQUFDLE1BQWYsQ0FDRTtNQUFBLGVBQUEsRUFBaUIsU0FBQTtBQUNmLFlBQUE7UUFBQSxJQUFBLEdBQVcsSUFBQSxvQkFBQSxDQUNUO1VBQUEsSUFBQSxFQUFNLFlBQU47U0FEUztlQUVYLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUjtNQUhlLENBQWpCO0tBREY7RUFETTs7bUJBT1IsV0FBQSxHQUFhLFNBQUE7V0FDVCxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQWYsQ0FDRTtNQUFBLGVBQUEsRUFBaUIsU0FBQTtlQUNmLEtBQUssQ0FBQyxlQUFOLENBQ0U7VUFBQSxXQUFBLEVBQWEsQ0FDWCxTQURXLEVBRVgsVUFGVyxFQUdYLFdBSFcsRUFJWCxhQUpXLEVBS1gsYUFMVyxDQUFiO1VBT0EsUUFBQSxFQUFVLFNBQUMsT0FBRDttQkFDUixFQUFFLENBQUMsSUFBSCxDQUFZLElBQUEsbUJBQUEsQ0FBb0IsT0FBcEIsQ0FBWjtVQURRLENBUFY7U0FERjtNQURlLENBQWpCO0tBREY7RUFEUzs7bUJBY2IsTUFBQSxHQUFRLFNBQUMsRUFBRDtJQUNOLEVBQUEsR0FBSyxLQUFLLENBQUMsUUFBTixDQUFlLEVBQWY7V0FDTCxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQWYsQ0FDRTtNQUFBLE9BQUEsRUFBUyxTQUFBO0FBQ1AsWUFBQTtRQUFBLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQ2Y7VUFBQSxHQUFBLEVBQUssRUFBTDtTQURlO2VBRWpCLFVBQVUsQ0FBQyxVQUFYLENBQ0U7VUFBQSxPQUFBLEVBQVUsU0FBRSxLQUFGO0FBQ1IsZ0JBQUE7WUFBQSxJQUFBLEdBQVcsSUFBQSxrQkFBQSxDQUFtQjtjQUFBLEtBQUEsRUFBTyxLQUFQO2FBQW5CO21CQUNYLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUjtVQUZRLENBQVY7U0FERjtNQUhPLENBQVQ7TUFPQSxNQUFBLEVBQVEsU0FBQTtlQUNOLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBakIsQ0FBQTtNQURNLENBUFI7S0FERjtFQUZNOzttQkFjUixJQUFBLEdBQU0sU0FBQyxFQUFEO1dBQ0osU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFmLENBQ0U7TUFBQSxPQUFBLEVBQVMsU0FBQTtBQUNQLFlBQUE7UUFBQSxVQUFBLEdBQWlCLElBQUEsVUFBQSxDQUNmO1VBQUEsS0FBQSxFQUFRLEVBQVI7U0FEZTtlQUVqQixVQUFVLENBQUMsS0FBWCxDQUNFO1VBQUEsT0FBQSxFQUFVLFNBQUUsS0FBRjtBQUNSLGdCQUFBO1lBQUEsSUFBQSxHQUFXLElBQUEsa0JBQUEsQ0FBbUI7Y0FBQSxLQUFBLEVBQU8sS0FBUDthQUFuQjttQkFDWCxFQUFFLENBQUMsSUFBSCxDQUFRLElBQVI7VUFGUSxDQUFWO1NBREY7TUFITyxDQUFUO01BT0EsTUFBQSxFQUFRLFNBQUE7ZUFDTixTQUFTLENBQUMsTUFBTSxDQUFDLE9BQWpCLENBQUE7TUFETSxDQVBSO0tBREY7RUFESTs7bUJBWU4sTUFBQSxHQUFRLFNBQUMsRUFBRDtXQUNOLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUNFO01BQUEsT0FBQSxFQUFTLFNBQUE7QUFDUCxZQUFBO1FBQUEsVUFBQSxHQUFpQixJQUFBLFVBQUEsQ0FDZjtVQUFBLEtBQUEsRUFBUSxFQUFSO1NBRGU7ZUFFakIsVUFBVSxDQUFDLEtBQVgsQ0FDRTtVQUFBLE9BQUEsRUFBVSxTQUFFLEtBQUY7QUFDUixnQkFBQTtZQUFBLElBQUEsR0FBVyxJQUFBLGtCQUFBLENBQW1CO2NBQUEsS0FBQSxFQUFPLEtBQVA7YUFBbkI7bUJBQ1gsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSO1VBRlEsQ0FBVjtTQURGO01BSE8sQ0FBVDtNQU9BLE1BQUEsRUFBUSxTQUFBO2VBQ04sU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFqQixDQUFBO01BRE0sQ0FQUjtLQURGO0VBRE07O21CQVlSLE9BQUEsR0FBUyxTQUFDLElBQUQ7V0FDUCxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQTBCLE1BQUEsR0FBTyxJQUFqQyxFQUF5QyxJQUF6QztFQURPOzttQkFJVCxHQUFBLEdBQUssU0FBQyxFQUFEO1dBQ0gsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFmLENBQ0U7TUFBQSxlQUFBLEVBQWlCLFNBQUE7QUFDZixZQUFBO1FBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxTQUFMLENBQWUsRUFBRSxDQUFDLE1BQUgsQ0FBVSxDQUFDLENBQVgsRUFBYyxDQUFkLENBQWY7UUFDUCxHQUFBLEdBQU0sU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFuQixDQUEyQixPQUEzQixFQUFvQyxRQUFwQztlQUNOLENBQUMsQ0FBQyxJQUFGLENBQ0U7VUFBQSxHQUFBLEVBQUssR0FBTDtVQUNBLElBQUEsRUFBTSxLQUROO1VBRUEsUUFBQSxFQUFVLE1BRlY7VUFHQSxJQUFBLEVBQU07WUFBQSxHQUFBLEVBQUssSUFBTDtXQUhOO1VBSUEsS0FBQSxFQUFPLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRCxFQUFJLENBQUo7cUJBQVUsS0FBQyxDQUFBLE9BQUQsQ0FBUyxRQUFULEVBQW1CLGNBQW5CLEVBQXNDLENBQUQsR0FBRyxHQUFILEdBQU0sQ0FBM0M7WUFBVjtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKUDtVQUtBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLElBQUQ7QUFDUCxrQkFBQTtjQUFBLE9BQUEsR0FBVTtBQUNWO0FBQUEsbUJBQUEscUNBQUE7O2dCQUNFLE9BQU8sQ0FBQyxJQUFSLENBQWEsS0FBSyxDQUFDLEVBQW5CO2dCQUNBLE9BQUEsR0FBVSxDQUFDLENBQUMsSUFBRixDQUFPLE9BQVA7QUFGWjtxQkFHQSxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQWQsQ0FDRTtnQkFBQSxJQUFBLEVBQU8sT0FBUDtnQkFDQSxZQUFBLEVBQWEsSUFEYjtnQkFFQSxPQUFBLEVBQVMsU0FBQyxRQUFEO0FBQ1Asc0JBQUE7a0JBQUEsSUFBQSxHQUFPO0FBQ1A7QUFBQSx1QkFBQSx3Q0FBQTs7b0JBQ0UsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFHLENBQUMsR0FBZDtBQURGO2tCQUlBLElBQUEsR0FBVyxJQUFBLGFBQUEsQ0FBYztvQkFBQSxLQUFBLEVBQU8sSUFBUDttQkFBZDt5QkFDWCxFQUFFLENBQUMsSUFBSCxDQUFRLElBQVI7Z0JBUE8sQ0FGVDtlQURGO1lBTE87VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTFQ7U0FERjtNQUhlLENBQWpCO0tBREY7RUFERzs7bUJBNEJMLEtBQUEsR0FBTyxTQUFFLFlBQUYsRUFBZ0IsTUFBaEI7V0FDTCxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQWYsQ0FDRTtNQUFBLGVBQUEsRUFBaUIsU0FBQTtBQUNmLFlBQUE7UUFBQSxVQUFBLEdBQWlCLElBQUEsVUFBQSxDQUNmO1VBQUEsS0FBQSxFQUFRLFlBQVI7U0FEZTtlQUVqQixVQUFVLENBQUMsS0FBWCxDQUNFO1VBQUEsT0FBQSxFQUFVLFNBQUUsS0FBRjtBQUNSLGdCQUFBO1lBQUEsSUFBQSxHQUFXLElBQUEsbUJBQUEsQ0FDVDtjQUFBLEtBQUEsRUFBUyxLQUFUO2NBQ0EsTUFBQSxFQUFTLE1BRFQ7YUFEUzttQkFHWCxFQUFFLENBQUMsSUFBSCxDQUFRLElBQVI7VUFKUSxDQUFWO1NBREY7TUFIZSxDQUFqQjtLQURGO0VBREs7O21CQVlQLE1BQUEsR0FBUSxTQUFDLFlBQUQsRUFBZSxRQUFmO1dBQ04sU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFmLENBQ0U7TUFBQSxlQUFBLEVBQWlCLFNBQUE7QUFDZixZQUFBO1FBQUEsVUFBQSxHQUFpQixJQUFBLFVBQUEsQ0FDZjtVQUFBLEtBQUEsRUFBUSxZQUFSO1NBRGU7ZUFFakIsVUFBVSxDQUFDLEtBQVgsQ0FDRTtVQUFBLE9BQUEsRUFBVSxTQUFFLFVBQUY7QUFDUixnQkFBQTtZQUFBLE1BQUEsR0FBYSxJQUFBLE1BQUEsQ0FDWDtjQUFBLEtBQUEsRUFBUSxRQUFSO2FBRFc7bUJBRWIsTUFBTSxDQUFDLEtBQVAsQ0FDRTtjQUFBLE9BQUEsRUFBUyxTQUFDLE1BQUQ7QUFDUCxvQkFBQTtnQkFBQSxJQUFBLEdBQVcsSUFBQSxpQkFBQSxDQUNUO2tCQUFBLEtBQUEsRUFBTyxVQUFQO2lCQURTO2dCQUdYLElBQUcsTUFBTSxDQUFDLEdBQVAsQ0FBVyxXQUFYLENBQUg7a0JBRUUsUUFBQSxHQUFXLE1BQU0sQ0FBQyxHQUFQLENBQVcsV0FBWCxDQUF1QixDQUFDLEtBQXhCLENBQUE7a0JBRVgsSUFBSSxDQUFDLFFBQUwsR0FBZ0IsU0FKbEI7O0FBTUE7QUFBQSxxQkFBQSxxQ0FBQTs7a0JBQ0UsSUFBRyxzQkFBQSxJQUFpQixxQ0FBcEI7b0JBQ0UsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFkLENBQXlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBdEMsRUFERjs7QUFERjtnQkFLQSxJQUFJLENBQUMsTUFBTCxHQUFjO2dCQUdkLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBbEIsQ0FBQTtnQkFDQSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQWxCLENBQTJCLElBQUEsVUFBQSxDQUN6QjtrQkFBQSxLQUFBLEVBQWlCLE1BQWpCO2tCQUNBLFVBQUEsRUFBaUIsVUFEakI7a0JBRUEsY0FBQSxFQUFpQixJQUZqQjtpQkFEeUIsQ0FBM0I7Z0JBSUEsSUFBSSxDQUFDLEtBQUwsR0FBYSxNQUFNLENBQUMsR0FBUCxDQUFXLGFBQVgsQ0FBeUIsQ0FBQzt1QkFDdkMsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSO2NBeEJPLENBQVQ7YUFERjtVQUhRLENBQVY7U0FERjtNQUhlLENBQWpCO0tBREY7RUFETTs7bUJBc0NSLE9BQUEsR0FBUyxTQUFDLFlBQUQ7V0FDUCxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQWYsQ0FDRTtNQUFBLGVBQUEsRUFBaUIsU0FBQTtBQUNmLFlBQUE7UUFBQSxVQUFBLEdBQWEsU0FBQyxVQUFELEVBQWtELFlBQWxEO0FBQ1gsY0FBQTs7WUFEWSxhQUFpQixJQUFBLFVBQUEsQ0FBVztjQUFBLEtBQUEsRUFBTSxZQUFOO2FBQVg7O1VBQzdCLFVBQUEsR0FBYSxJQUFJO2lCQUNqQixVQUFVLENBQUMsS0FBWCxDQUNFO1lBQUEsWUFBQSxFQUFjLEtBQWQ7WUFDQSxHQUFBLEVBQUssR0FBQSxHQUFNLFlBRFg7WUFFQSxPQUFBLEVBQVMsQ0FBQSxTQUFBLEtBQUE7cUJBQUEsU0FBQyxPQUFEO0FBQ1Asb0JBQUE7Z0JBQUEsSUFBQSxHQUFXLElBQUEsV0FBQSxDQUNUO2tCQUFBLFlBQUEsRUFBZSxVQUFmO2tCQUNBLFNBQUEsRUFBZSxPQUFPLENBQUMsTUFEdkI7aUJBRFM7dUJBR1gsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSO2NBSk87WUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRlQ7V0FERjtRQUZXO1FBV2IsVUFBQSxHQUFpQixJQUFBLFVBQUEsQ0FDZjtVQUFBLEtBQUEsRUFBUSxZQUFSO1NBRGU7ZUFFakIsVUFBVSxDQUFDLEtBQVgsQ0FDRTtVQUFBLE9BQUEsRUFBVyxTQUFBO21CQUNULFVBQUEsQ0FBVyxVQUFYLEVBQXVCLFlBQXZCO1VBRFMsQ0FBWDtVQUVBLEtBQUEsRUFBUyxTQUFBO21CQUNQLFVBQUEsQ0FBVyxVQUFYLEVBQXVCLFlBQXZCO1VBRE8sQ0FGVDtTQURGO01BZGUsQ0FBakI7S0FERjtFQURPOzttQkEwQlQsYUFBQSxHQUFlLFNBQUMsT0FBRCxFQUFVLElBQVY7SUFDYixJQUFBLEdBQU8sUUFBQSxDQUFTLElBQVQ7V0FDUCxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQWYsQ0FDRTtNQUFBLGVBQUEsRUFBaUIsU0FBQTtBQUNiLFlBQUE7UUFBQSxXQUFBLEdBQWMsSUFBSTtlQUNsQixXQUFXLENBQUMsS0FBWixDQUNFO1VBQUEsT0FBQSxFQUFTLFNBQUUsVUFBRjtBQUNQLGdCQUFBO1lBQUEsUUFBQSxHQUFlLElBQUEsUUFBQSxDQUFTLFVBQVUsQ0FBQyxLQUFYLENBQWlCO2NBQUEsTUFBQSxFQUFTLElBQVQ7YUFBakIsQ0FBVDtZQUNmLFVBQUEsR0FBYSxJQUFJO21CQUNqQixVQUFVLENBQUMsS0FBWCxDQUNFO2NBQUEsT0FBQSxFQUFTLFNBQUUsT0FBRjtBQUNQLG9CQUFBO2dCQUFBLE9BQUEsR0FBYyxJQUFBLFlBQUEsQ0FBYSxPQUFPLENBQUMsS0FBUixDQUFjO2tCQUFBLFNBQUEsRUFBWSxPQUFaO2lCQUFkLENBQWI7Z0JBQ2QsUUFBQSxHQUFXLElBQUk7dUJBQ2YsUUFBUSxDQUFDLEtBQVQsQ0FDRTtrQkFBQSxPQUFBLEVBQVMsU0FBQTtBQUdQLHdCQUFBO29CQUFBLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBUyxRQUFRLENBQUMsS0FBVCxDQUFlO3NCQUFBLFNBQUEsRUFBWSxPQUFaO3FCQUFmLENBQVQ7b0JBQ2YsVUFBQSxHQUFhLFFBQVEsQ0FBQyxLQUFULENBQWUsS0FBZjtvQkFDYiwwQkFBQSxHQUE2QjtBQUM3QjtBQUFBLHlCQUFBLHFDQUFBOztzQkFDRSxXQUEyQyxNQUFNLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBQSxFQUFBLGFBQTJCLFVBQTNCLEVBQUEsSUFBQSxNQUEzQzt3QkFBQSwwQkFBMEIsQ0FBQyxJQUEzQixDQUFnQyxNQUFoQyxFQUFBOztBQURGO29CQUVBLGVBQUEsR0FBc0IsSUFBQSxZQUFBLENBQWEsMEJBQWI7b0JBRXRCLElBQUEsR0FBVyxJQUFBLGlCQUFBLENBQ1Q7c0JBQUEsVUFBQSxFQUFhLFFBQWI7c0JBQ0EsVUFBQSxFQUFhLFFBRGI7c0JBRUEsU0FBQSxFQUFhLGVBRmI7cUJBRFM7MkJBSVgsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSO2tCQWRPLENBQVQ7aUJBREY7Y0FITyxDQUFUO2FBREY7VUFITyxDQUFUO1NBREY7TUFGYSxDQUFqQjtLQURGO0VBRmE7O21CQThCZixZQUFBLEdBQWMsU0FBQyxTQUFEO1dBQ1osU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFmLENBQ0U7TUFBQSxlQUFBLEVBQWlCLFNBQUE7QUFDZixZQUFBO1FBQUEsT0FBQSxHQUFjLElBQUEsT0FBQSxDQUFRO1VBQUEsS0FBQSxFQUFRLFNBQVI7U0FBUjtlQUNkLE9BQU8sQ0FBQyxLQUFSLENBQ0U7VUFBQSxPQUFBLEVBQVMsU0FBQyxPQUFEO0FBQ1AsZ0JBQUE7WUFBQSxPQUFBLEdBQVUsT0FBTyxDQUFDLEdBQVIsQ0FBWSxTQUFaO1lBQ1YsS0FBQSxHQUFZLElBQUEsS0FBQSxDQUFNO2NBQUEsS0FBQSxFQUFRLE9BQU8sQ0FBQyxHQUFSLENBQVksU0FBWixDQUFSO2FBQU47bUJBQ1osS0FBSyxDQUFDLEtBQU4sQ0FDRTtjQUFBLE9BQUEsRUFBUyxTQUFDLEtBQUQ7QUFDUCxvQkFBQTtnQkFBQSxVQUFBLEdBQWEsSUFBSTt1QkFDakIsVUFBVSxDQUFDLEtBQVgsQ0FDRTtrQkFBQSxPQUFBLEVBQVMsU0FBRSxVQUFGO0FBQ1Asd0JBQUE7b0JBQUEsT0FBQSxHQUFjLElBQUEsWUFBQSxDQUFhLFVBQVUsQ0FBQyxLQUFYLENBQWlCO3NCQUFBLFdBQUEsRUFBYyxTQUFkO3NCQUF5QixZQUFBLEVBQWUsU0FBeEM7c0JBQW1ELFNBQUEsRUFBWSxPQUEvRDtxQkFBakIsQ0FBYjtvQkFFZCxhQUFBLEdBQWdCO0FBQ2hCO0FBQUEseUJBQUEscUNBQUE7O3NCQUFBLGFBQWMsQ0FBQSxNQUFNLENBQUMsR0FBUCxDQUFXLFdBQVgsQ0FBQSxDQUFkLEdBQXlDO0FBQXpDO29CQUNBLGFBQUEsR0FBZ0IsQ0FBQyxDQUFDLElBQUYsQ0FBTyxhQUFQO29CQUdoQixpQkFBQSxHQUFvQixJQUFJO0FBQ3hCLHlCQUFBLGlEQUFBOztzQkFBQSxpQkFBaUIsQ0FBQyxHQUFsQixDQUEwQixJQUFBLE9BQUEsQ0FBUTt3QkFBQSxLQUFBLEVBQVEsU0FBUjt1QkFBUixDQUExQjtBQUFBOzJCQUNBLGlCQUFpQixDQUFDLEtBQWxCLENBQ0U7c0JBQUEsT0FBQSxFQUFTLFNBQUE7QUFDUCw0QkFBQTt3QkFBQSxJQUFBLEdBQVcsSUFBQSxnQkFBQSxDQUNUOzBCQUFBLFNBQUEsRUFBYSxPQUFiOzBCQUNBLFNBQUEsRUFBYSxPQURiOzBCQUVBLE9BQUEsRUFBYSxLQUZiOzBCQUdBLFVBQUEsRUFBYSxpQkFIYjt5QkFEUzsrQkFLWCxFQUFFLENBQUMsSUFBSCxDQUFRLElBQVI7c0JBTk8sQ0FBVDtxQkFERjtrQkFWTyxDQUFUO2lCQURGO2NBRk8sQ0FBVDthQURGO1VBSE8sQ0FBVDtTQURGO01BRmUsQ0FBakI7S0FERjtFQURZOzttQkErQmQsY0FBQSxHQUFnQixTQUFDLFNBQUQsRUFBWSxPQUFaO1dBQ2QsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFmLENBQ0U7TUFBQSxlQUFBLEVBQWlCLFNBQUE7QUFHZixZQUFBO1FBQUEsVUFBQSxHQUFhLFNBQUUsT0FBRixFQUFXLFFBQVg7QUFDWCxjQUFBO1VBQUEsS0FBQSxHQUFZLElBQUEsS0FBQSxDQUFNO1lBQUEsS0FBQSxFQUFRLE9BQVI7V0FBTjtpQkFDWixLQUFLLENBQUMsS0FBTixDQUNFO1lBQUEsT0FBQSxFQUFTLFNBQUMsS0FBRDtBQUNQLGtCQUFBO2NBQUEsV0FBQSxHQUFjLElBQUk7cUJBQ2xCLFdBQVcsQ0FBQyxLQUFaLENBQ0U7Z0JBQUEsT0FBQSxFQUFTLFNBQUUsV0FBRjtBQUNQLHNCQUFBO2tCQUFBLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBUyxXQUFXLENBQUMsS0FBWixDQUN0QjtvQkFBQSxjQUFBLEVBQWlCLEtBQUssQ0FBQyxHQUFOLENBQVUsY0FBVixDQUFqQjtvQkFDQSxZQUFBLEVBQWlCLFVBRGpCO21CQURzQixDQUFUO2tCQUdmLFVBQUEsR0FBYSxJQUFJO3lCQUNqQixVQUFVLENBQUMsS0FBWCxDQUNFO29CQUFBLE9BQUEsRUFBUyxTQUFFLFVBQUY7QUFDUCwwQkFBQTtzQkFBQSxPQUFBLEdBQWMsSUFBQSxZQUFBLENBQWEsVUFBVSxDQUFDLEtBQVgsQ0FBaUI7d0JBQUEsU0FBQSxFQUFZLE9BQVo7d0JBQXFCLFlBQUEsRUFBZSxVQUFwQzt1QkFBakIsQ0FBYjtzQkFFZCxPQUFPLENBQUMsR0FBUixDQUFZLFFBQVo7c0JBQ0EsSUFBRyxnQkFBSDt3QkFFRSxVQUFBLEdBQWEsUUFBUSxDQUFDLEtBQVQsQ0FBZSxLQUFmO3dCQUNiLDBCQUFBLEdBQTZCO0FBQzdCO0FBQUEsNkJBQUEscUNBQUE7OzBCQUNFLFdBQTJDLE1BQU0sQ0FBQyxHQUFQLENBQVcsV0FBWCxDQUFBLEVBQUEsYUFBMkIsVUFBM0IsRUFBQSxJQUFBLE1BQTNDOzRCQUFBLDBCQUEwQixDQUFDLElBQTNCLENBQWdDLE1BQWhDLEVBQUE7O0FBREY7d0JBRUEsT0FBQSxHQUFjLElBQUEsWUFBQSxDQUFhLDBCQUFiLEVBTmhCOztzQkFRQSxJQUFBLEdBQVcsSUFBQSxZQUFBLENBQ1Q7d0JBQUEsVUFBQSxFQUFhLFFBQWI7d0JBQ0EsU0FBQSxFQUFhLE9BRGI7d0JBRUEsU0FBQSxFQUFhLE9BRmI7d0JBR0EsT0FBQSxFQUFhLEtBSGI7dUJBRFM7NkJBS1gsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSO29CQWpCTyxDQUFUO21CQURGO2dCQUxPLENBQVQ7ZUFERjtZQUZPLENBQVQ7V0FERjtRQUZXO1FBK0JiLElBQUcsU0FBQSxLQUFhLEtBQWhCO1VBQ0UsT0FBQSxHQUFjLElBQUEsT0FBQSxDQUFRO1lBQUEsS0FBQSxFQUFRLFNBQVI7V0FBUjtpQkFDZCxPQUFPLENBQUMsS0FBUixDQUNFO1lBQUEsT0FBQSxFQUFTLFNBQUE7cUJBQUcsVUFBQSxDQUFXLE9BQVg7WUFBSCxDQUFUO1dBREYsRUFGRjtTQUFBLE1BQUE7VUFLRSxRQUFBLEdBQVcsSUFBSTtpQkFDZixRQUFRLENBQUMsS0FBVCxDQUNFO1lBQUEsT0FBQSxFQUFTLFNBQUE7cUJBQUcsVUFBQSxDQUFXLElBQVgsRUFBaUIsUUFBakI7WUFBSCxDQUFUO1dBREYsRUFORjs7TUFsQ2UsQ0FBakI7S0FERjtFQURjOzttQkFnRGhCLFdBQUEsR0FBYSxTQUFDLEVBQUQ7V0FDWCxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQWYsQ0FDRTtNQUFBLE9BQUEsRUFBUyxTQUFBO0FBQ1AsWUFBQTtRQUFBLEVBQUEsR0FBSyxLQUFLLENBQUMsUUFBTixDQUFlLEVBQWY7UUFDTCxPQUFBLEdBQWMsSUFBQSxPQUFBLENBQVE7VUFBQSxHQUFBLEVBQU0sRUFBTjtTQUFSO2VBQ2QsT0FBTyxDQUFDLEtBQVIsQ0FDRTtVQUFBLE9BQUEsRUFBUyxTQUFDLEtBQUQsRUFBUSxRQUFSO0FBQ1AsZ0JBQUE7WUFBQSxVQUFBLEdBQWlCLElBQUEsVUFBQSxDQUNmO2NBQUEsS0FBQSxFQUFRLE9BQU8sQ0FBQyxHQUFSLENBQVksY0FBWixDQUFSO2FBRGU7bUJBRWpCLFVBQVUsQ0FBQyxLQUFYLENBQ0U7Y0FBQSxPQUFBLEVBQVMsU0FBQTtBQUNQLG9CQUFBO2dCQUFBLElBQUEsR0FBVyxJQUFBLGVBQUEsQ0FDVDtrQkFBQSxLQUFBLEVBQWEsS0FBYjtrQkFDQSxVQUFBLEVBQWEsVUFEYjtpQkFEUzt1QkFHWCxFQUFFLENBQUMsSUFBSCxDQUFRLElBQVI7Y0FKTyxDQUFUO2FBREY7VUFITyxDQUFUO1NBREY7TUFITyxDQUFUO01BYUEsTUFBQSxFQUFRLFNBQUE7ZUFDTixTQUFTLENBQUMsTUFBTSxDQUFDLE9BQWpCLENBQUE7TUFETSxDQWJSO0tBREY7RUFEVzs7bUJBa0JiLGdCQUFBLEdBQWtCLFNBQUMsRUFBRDtBQUVoQixRQUFBO0lBQUEsU0FBQSxHQUFZLFNBQUMsT0FBRCxFQUFVLFVBQVYsRUFBc0IsU0FBdEI7QUFDVixVQUFBOztRQURnQyxZQUFVOztNQUMxQyxJQUFBLEdBQVcsSUFBQSxvQkFBQSxDQUNUO1FBQUEsS0FBQSxFQUFhLE9BQWI7UUFDQSxVQUFBLEVBQWEsVUFEYjtRQUVBLFNBQUEsRUFBYSxTQUZiO09BRFM7YUFJWCxFQUFFLENBQUMsSUFBSCxDQUFRLElBQVI7SUFMVTtXQU9aLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUNFO01BQUEsT0FBQSxFQUFTLFNBQUE7QUFDUCxZQUFBO1FBQUEsRUFBQSxHQUFLLEtBQUssQ0FBQyxRQUFOLENBQWUsRUFBZjtRQUNMLE9BQUEsR0FBYyxJQUFBLE9BQUEsQ0FBUTtVQUFBLEdBQUEsRUFBTSxFQUFOO1NBQVI7ZUFDZCxPQUFPLENBQUMsS0FBUixDQUNFO1VBQUEsT0FBQSxFQUFTLFNBQUE7QUFDUCxnQkFBQTtZQUFBLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQ2Y7Y0FBQSxLQUFBLEVBQVEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxjQUFaLENBQVI7YUFEZTttQkFFakIsVUFBVSxDQUFDLEtBQVgsQ0FDRTtjQUFBLE9BQUEsRUFBUyxTQUFBO0FBQ1Asb0JBQUE7Z0JBQUEsSUFBRyxPQUFPLENBQUMsR0FBUixDQUFZLFdBQVosQ0FBQSxLQUE0QixRQUEvQjtrQkFDRSxTQUFBLEdBQVksSUFBSTt5QkFDaEIsU0FBUyxDQUFDLEtBQVYsQ0FDRTtvQkFBQSxHQUFBLEVBQU0sVUFBVSxDQUFDLEVBQWpCO29CQUNBLE9BQUEsRUFBUyxTQUFBO3NCQUNQLFNBQUEsR0FBZ0IsSUFBQSxTQUFBLENBQVUsU0FBUyxDQUFDLEtBQVYsQ0FBZ0I7d0JBQUEsV0FBQSxFQUFZLE9BQU8sQ0FBQyxFQUFwQjt1QkFBaEIsQ0FBVjs2QkFDaEIsU0FBQSxDQUFVLE9BQVYsRUFBbUIsVUFBbkIsRUFBK0IsU0FBL0I7b0JBRk8sQ0FEVDttQkFERixFQUZGO2lCQUFBLE1BQUE7eUJBUUUsU0FBQSxDQUFVLE9BQVYsRUFBbUIsVUFBbkIsRUFSRjs7Y0FETyxDQUFUO2FBREY7VUFITyxDQUFUO1NBREY7TUFITyxDQUFUO01Ba0JBLE1BQUEsRUFBUSxTQUFBO2VBQ04sU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFqQixDQUFBO01BRE0sQ0FsQlI7S0FERjtFQVRnQjs7bUJBbUNsQixZQUFBLEdBQWMsU0FBQyxFQUFEO1dBQ1osU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFmLENBQ0U7TUFBQSxPQUFBLEVBQVMsU0FBQTtBQUNQLFlBQUE7UUFBQSxFQUFBLEdBQUssS0FBSyxDQUFDLFFBQU4sQ0FBZSxFQUFmO1FBQ0wsUUFBQSxHQUFlLElBQUEsUUFBQSxDQUFTO1VBQUEsR0FBQSxFQUFNLEVBQU47U0FBVDtlQUNmLFFBQVEsQ0FBQyxLQUFULENBQ0U7VUFBQSxPQUFBLEVBQVMsU0FBQyxRQUFELEVBQVcsUUFBWDtBQUNQLGdCQUFBO1lBQUEsVUFBQSxHQUFpQixJQUFBLFVBQUEsQ0FDZjtjQUFBLEtBQUEsRUFBUSxRQUFRLENBQUMsR0FBVCxDQUFhLGNBQWIsQ0FBUjthQURlO21CQUVqQixVQUFVLENBQUMsS0FBWCxDQUNFO2NBQUEsT0FBQSxFQUFTLFNBQUE7QUFDUCxvQkFBQTtnQkFBQSxPQUFBLEdBQWMsSUFBQSxPQUFBLENBQ1o7a0JBQUEsS0FBQSxFQUFRLFFBQVEsQ0FBQyxHQUFULENBQWEsV0FBYixDQUFSO2lCQURZO3VCQUVkLE9BQU8sQ0FBQyxLQUFSLENBQ0U7a0JBQUEsT0FBQSxFQUFTLFNBQUE7QUFDUCx3QkFBQTtvQkFBQSxJQUFBLEdBQVcsSUFBQSxnQkFBQSxDQUNUO3NCQUFBLFVBQUEsRUFBZSxRQUFmO3NCQUNBLFNBQUEsRUFBZSxPQURmO3NCQUVBLFlBQUEsRUFBZSxVQUZmO3FCQURTOzJCQUlYLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUjtrQkFMTyxDQUFUO2lCQURGO2NBSE8sQ0FBVDthQURGO1VBSE8sQ0FBVDtTQURGO01BSE8sQ0FBVDtNQWtCQSxNQUFBLEVBQVEsU0FBQTtlQUNOLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBakIsQ0FBQTtNQURNLENBbEJSO0tBREY7RUFEWTs7bUJBd0JkLGlCQUFBLEdBQW1CLFNBQUMsRUFBRDtXQUNqQixTQUFTLENBQUMsSUFBSSxDQUFDLE1BQWYsQ0FDRTtNQUFBLE9BQUEsRUFBUyxTQUFBO0FBQ1AsWUFBQTtRQUFBLEVBQUEsR0FBSyxLQUFLLENBQUMsUUFBTixDQUFlLEVBQWY7UUFDTCxRQUFBLEdBQWUsSUFBQSxRQUFBLENBQVM7VUFBQSxLQUFBLEVBQVEsRUFBUjtTQUFUO2VBQ2YsUUFBUSxDQUFDLEtBQVQsQ0FDRTtVQUFBLE9BQUEsRUFBUyxTQUFDLFFBQUQsRUFBVyxRQUFYO0FBQ1AsZ0JBQUE7WUFBQSxVQUFBLEdBQWlCLElBQUEsVUFBQSxDQUNmO2NBQUEsS0FBQSxFQUFRLFFBQVEsQ0FBQyxHQUFULENBQWEsY0FBYixDQUFSO2FBRGU7bUJBRWpCLFVBQVUsQ0FBQyxLQUFYLENBQ0U7Y0FBQSxPQUFBLEVBQVMsU0FBQTtBQUNQLG9CQUFBO2dCQUFBLE9BQUEsR0FBYyxJQUFBLE9BQUEsQ0FDWjtrQkFBQSxLQUFBLEVBQVEsUUFBUSxDQUFDLEdBQVQsQ0FBYSxXQUFiLENBQVI7aUJBRFk7dUJBRWQsT0FBTyxDQUFDLEtBQVIsQ0FDRTtrQkFBQSxPQUFBLEVBQVMsU0FBQTtBQUNQLHdCQUFBO29CQUFBLElBQUEsR0FBVyxJQUFBLGdCQUFBLENBQ1Q7c0JBQUEsVUFBQSxFQUFlLFFBQWY7c0JBQ0EsU0FBQSxFQUFlLE9BRGY7c0JBRUEsWUFBQSxFQUFlLFVBRmY7cUJBRFM7MkJBSVgsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSO2tCQUxPLENBQVQ7aUJBREY7Y0FITyxDQUFUO2FBREY7VUFITyxDQUFUO1NBREY7TUFITyxDQUFUO0tBREY7RUFEaUI7O21CQXlCbkIsS0FBQSxHQUFPLFNBQUE7V0FDTCxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQWYsQ0FDRTtNQUFBLGVBQUEsRUFBaUIsU0FBQTtlQUNmLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBakIsQ0FBQTtNQURlLENBQWpCO01BRUEsY0FBQSxFQUFnQixTQUFBO0FBRWQsWUFBQTtRQUFBLFFBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVCxjQUFBOztZQURVLFFBQVE7O1VBQ2xCLElBQUEsR0FBVyxJQUFBLFNBQUEsQ0FDVDtZQUFBLEtBQUEsRUFBTyxLQUFQO1dBRFM7aUJBRVgsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSO1FBSFM7ZUFLWCxRQUFBLENBQUE7TUFQYyxDQUZoQjtLQURGO0VBREs7O21CQWFQLE1BQUEsR0FBUSxTQUFBO1dBQ04sU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFmLENBQUE7RUFETTs7bUJBR1IsT0FBQSxHQUFTLFNBQUE7SUFFUCxJQUFHLFNBQVMsQ0FBQyxPQUFWLEtBQXFCLFdBQXhCO2FBQ0UsTUFBTSxDQUFDLFFBQVAsR0FBa0IsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFuQixDQUE0QixPQUE1QixFQUFxQyxTQUFyQyxFQURwQjtLQUFBLE1BQUE7YUFHRSxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQWYsQ0FDRTtRQUFBLGVBQUEsRUFBaUIsU0FBQTtBQUNmLGNBQUE7VUFBQSxJQUFBLEdBQVcsSUFBQSxXQUFBLENBQ1Q7WUFBQSxJQUFBLEVBQU8sU0FBUyxDQUFDLElBQWpCO1dBRFM7aUJBRVgsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSO1FBSGUsQ0FBakI7T0FERixFQUhGOztFQUZPOzttQkFXVCxRQUFBLEdBQVUsU0FBQTtXQUNSLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUNFO01BQUEsZUFBQSxFQUFpQixTQUFBO0FBQ2YsWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFJO2VBQ1gsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSO01BRmUsQ0FBakI7S0FERjtFQURROzttQkFPVixJQUFBLEdBQU0sU0FBQTtXQUNKLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBZixDQUNFO01BQUEsZUFBQSxFQUFpQixTQUFBO0FBQ2YsWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFJO2VBQ1gsSUFBSSxDQUFDLEtBQUwsQ0FDRTtVQUFBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFBO0FBQ1Asa0JBQUE7Y0FBQSxJQUFBLEdBQVcsSUFBQSxPQUFBLENBQ1Q7Z0JBQUEsSUFBQSxFQUFNLElBQU47ZUFEUztxQkFFWCxFQUFFLENBQUMsSUFBSCxDQUFRLElBQVI7WUFITztVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtTQURGO01BRmUsQ0FBakI7S0FERjtFQURJOzttQkFjTixRQUFBLEdBQVUsU0FBQTtBQUNSLFFBQUE7SUFBQSxPQUFBLEdBQVUsS0FBSyxDQUFDLEtBQU4sQ0FBQTtJQUNWLElBQUEsR0FBTyxPQUFPLENBQUM7V0FDZixDQUFDLENBQUMsS0FBSyxDQUFDLE1BQVIsQ0FDRTtNQUFBLE9BQUEsRUFBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDUCxDQUFDLENBQUMsTUFBRixDQUFTLGFBQVQsRUFBd0IsSUFBeEI7aUJBQ0EsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFSLENBQ0U7WUFBQSxNQUFBLEVBQWEsSUFBYjtZQUNBLFVBQUEsRUFBYSxJQURiO1lBRUEsT0FBQSxFQUFTLFNBQUE7Y0FDUCxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQWpCLENBQUE7cUJBQ0EsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixDQUFBO1lBRk8sQ0FGVDtZQUtBLEtBQUEsRUFBTyxTQUFBO3FCQUNMLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBUixDQUNFO2dCQUFBLE1BQUEsRUFBVSxJQUFWO2dCQUNBLE9BQUEsRUFBVSxDQUFDLFFBQUQsQ0FEVjtlQURGLEVBR0UsSUFIRixFQUlBO2dCQUFBLE9BQUEsRUFBUyxTQUFBO0FBQ1Asc0JBQUE7a0JBQUEsSUFBQSxHQUFPLElBQUk7eUJBQ1gsSUFBSSxDQUFDLElBQUwsQ0FDRTtvQkFBQSxNQUFBLEVBQVUsSUFBVjtvQkFDQSxJQUFBLEVBQVUsaUJBQUEsR0FBa0IsSUFENUI7b0JBRUEsT0FBQSxFQUFVLEVBRlY7b0JBR0EsTUFBQSxFQUFVLElBSFY7bUJBREYsRUFNRTtvQkFBQSxJQUFBLEVBQU0sSUFBTjtvQkFDQSxPQUFBLEVBQVMsU0FBQTs2QkFDUCxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQVIsQ0FDRTt3QkFBQSxNQUFBLEVBQWEsSUFBYjt3QkFDQSxVQUFBLEVBQWEsSUFEYjt3QkFFQSxPQUFBLEVBQVUsU0FBQTswQkFDUixTQUFTLENBQUMsTUFBTSxDQUFDLE9BQWpCLENBQUE7aUNBQ0EsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFoQixDQUFBO3dCQUZRLENBRlY7d0JBS0EsS0FBQSxFQUFPLFNBQUE7aUNBQ0wsS0FBSyxDQUFDLE1BQU4sQ0FBYSx5QkFBYjt3QkFESyxDQUxQO3VCQURGO29CQURPLENBRFQ7bUJBTkY7Z0JBRk8sQ0FBVDtlQUpBO1lBREssQ0FMUDtXQURGO1FBRk87TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7S0FERjtFQUhROzs7O0dBNXlCUyxRQUFRLENBQUMiLCJmaWxlIjoiYXBwL3JvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFJvdXRlciBleHRlbmRzIEJhY2tib25lLlJvdXRlclxuIyAgYmVmb3JlOiAoKSAtPlxuIyAgICBjb25zb2xlLmxvZygnYmVmb3JlJylcbiMgICAgJCgnI2Zvb3RlcicpLnNob3coKVxuI1xuIyAgYWZ0ZXI6ICgpIC0+XG4jICAgIGNvbnNvbGUubG9nKCdhZnRlcicpO1xuICBleGVjdXRlOiAoY2FsbGJhY2ssIGFyZ3MsIG5hbWUpIC0+XG4gICAgJCgnI2Zvb3RlcicpLnNob3coKVxuICAgIGlmIChjYWxsYmFjaylcbiAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpXG5cbiAgcm91dGVzOlxuICAgICdsb2dpbicgICAgOiAnbG9naW4nXG4gICAgJ3JlZ2lzdGVyJyA6ICdyZWdpc3RlcidcbiAgICAnbG9nb3V0JyAgIDogJ2xvZ291dCdcbiAgICAnYWNjb3VudCcgIDogJ2FjY291bnQnXG5cbiAgICAndHJhbnNmZXInIDogJ3RyYW5zZmVyJ1xuXG4gICAgJ3NldHRpbmdzJyA6ICdzZXR0aW5ncydcbiAgICAndXBkYXRlJyA6ICd1cGRhdGUnXG5cbiAgICAnJyA6ICdsYW5kaW5nJ1xuXG4gICAgJ2xvZ3MnIDogJ2xvZ3MnXG5cbiAgICAjIENsYXNzXG4gICAgJ2NsYXNzJyAgICAgICAgICA6ICdrbGFzcydcbiAgICAnY2xhc3MvZWRpdC86aWQnIDogJ2tsYXNzRWRpdCdcbiAgICAnY2xhc3Mvc3R1ZGVudC86c3R1ZGVudElkJyAgICAgICAgOiAnc3R1ZGVudEVkaXQnXG4gICAgJ2NsYXNzL3N0dWRlbnQvcmVwb3J0LzpzdHVkZW50SWQnIDogJ3N0dWRlbnRSZXBvcnQnXG4gICAgJ2NsYXNzL3N1YnRlc3QvOmlkJyA6ICdlZGl0S2xhc3NTdWJ0ZXN0J1xuICAgICdjbGFzcy9xdWVzdGlvbi86aWQnIDogXCJlZGl0S2xhc3NRdWVzdGlvblwiXG5cbiAgICAnY2xhc3MvOmlkLzpwYXJ0JyA6ICdrbGFzc1BhcnRseSdcbiAgICAnY2xhc3MvOmlkJyAgICAgICA6ICdrbGFzc1BhcnRseSdcblxuICAgICdjbGFzcy9ydW4vOnN0dWRlbnRJZC86c3VidGVzdElkJyA6ICdydW5TdWJ0ZXN0J1xuXG4gICAgJ2NsYXNzL3Jlc3VsdC9zdHVkZW50L3N1YnRlc3QvOnN0dWRlbnRJZC86c3VidGVzdElkJyA6ICdzdHVkZW50U3VidGVzdCdcblxuICAgICdjdXJyaWN1bGEnICAgICAgICAgOiAnY3VycmljdWxhJ1xuICAgICdjdXJyaWN1bHVtLzppZCcgICAgOiAnY3VycmljdWx1bSdcbiAgICAnY3VycmljdWx1bUltcG9ydCcgIDogJ2N1cnJpY3VsdW1JbXBvcnQnXG5cbiAgICAncmVwb3J0L2tsYXNzR3JvdXBpbmcvOmtsYXNzSWQvOnBhcnQnIDogJ2tsYXNzR3JvdXBpbmcnXG4gICAgJ3JlcG9ydC9tYXN0ZXJ5Q2hlY2svOnN0dWRlbnRJZCcgICAgICA6ICdtYXN0ZXJ5Q2hlY2snXG4gICAgJ3JlcG9ydC9wcm9ncmVzcy86c3R1ZGVudElkLzprbGFzc0lkJyA6ICdwcm9ncmVzc1JlcG9ydCdcblxuXG4gICAgIyBzZXJ2ZXIgLyBtb2JpbGVcbiAgICAnZ3JvdXBzJyA6ICdncm91cHMnXG5cbiAgICAnYXNzZXNzbWVudHMnICAgICAgICA6ICdhc3Nlc3NtZW50cydcblxuICAgICdydW4vOmlkJyAgICAgICA6ICdydW4nXG4gICAgJ3ByaW50LzppZC86Zm9ybWF0JyAgICAgICA6ICdwcmludCdcbiAgICAnZGF0YUVudHJ5LzppZCcgOiAnZGF0YUVudHJ5J1xuXG4gICAgJ3Jlc3VtZS86YXNzZXNzbWVudElkLzpyZXN1bHRJZCcgICAgOiAncmVzdW1lJ1xuXG4gICAgJ3Jlc3RhcnQvOmlkJyAgIDogJ3Jlc3RhcnQnXG4gICAgJ2VkaXQvOmlkJyAgICAgIDogJ2VkaXQnXG4gICAgJ2VkaXRMUC86aWQnICAgICAgOiAnZWRpdExQJ1xuICAgICdyZXN1bHRzLzppZCcgICA6ICdyZXN1bHRzJ1xuICAgICdpbXBvcnQnICAgICAgICA6ICdpbXBvcnQnXG5cbiAgICAnc3VidGVzdC86aWQnICAgICAgIDogJ2VkaXRTdWJ0ZXN0J1xuXG4gICAgJ3F1ZXN0aW9uLzppZCcgOiAnZWRpdFF1ZXN0aW9uJ1xuICAgICdkYXNoYm9hcmQnIDogJ2Rhc2hib2FyZCdcbiAgICAnZGFzaGJvYXJkLypvcHRpb25zJyA6ICdkYXNoYm9hcmQnXG4gICAgJ2FkbWluJyA6ICdhZG1pbidcblxuICAgICdzeW5jLzppZCcgICAgICA6ICdzeW5jJ1xuXG5cbiAgYWRtaW46IChvcHRpb25zKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgJC5jb3VjaC5hbGxEYnNcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YWJhc2VzKSA9PlxuICAgICAgICAgICAgZ3JvdXBzID0gZGF0YWJhc2VzLmZpbHRlciAoZGF0YWJhc2UpIC0+IGRhdGFiYXNlLmluZGV4T2YoXCJncm91cC1cIikgPT0gMFxuICAgICAgICAgICAgdmlldyA9IG5ldyBBZG1pblZpZXdcbiAgICAgICAgICAgICAgZ3JvdXBzIDogZ3JvdXBzXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBkYXNoYm9hcmQ6IChvcHRpb25zKSAtPlxuICAgIG9wdGlvbnMgPSBvcHRpb25zPy5zcGxpdCgvXFwvLylcbiAgICBjb25zb2xlLmxvZyhcIm9wdGlvbnM6IFwiICsgb3B0aW9ucylcbiAgICAjZGVmYXVsdCB2aWV3IG9wdGlvbnNcbiAgICByZXBvcnRWaWV3T3B0aW9ucyA9XG4gICAgICBhc3Nlc3NtZW50OiBcIkFsbFwiXG4gICAgICBncm91cEJ5OiBcImVudW1lcmF0b3JcIlxuXG4gICAgIyBBbGxvd3MgdXMgdG8gZ2V0IG5hbWUvdmFsdWUgcGFpcnMgZnJvbSBVUkxcbiAgICBfLmVhY2ggb3B0aW9ucywgKG9wdGlvbixpbmRleCkgLT5cbiAgICAgIHVubGVzcyBpbmRleCAlIDJcbiAgICAgICAgcmVwb3J0Vmlld09wdGlvbnNbb3B0aW9uXSA9IG9wdGlvbnNbaW5kZXgrMV1cblxuICAgIHZpZXcgPSBuZXcgRGFzaGJvYXJkVmlldyAgcmVwb3J0Vmlld09wdGlvbnNcblxuICAgIHZtLnNob3cgdmlld1xuXG4gIGxhbmRpbmc6IC0+XG5cbiAgICBpZiB+U3RyaW5nKHdpbmRvdy5sb2NhdGlvbi5ocmVmKS5pbmRleE9mKFwidGFuZ2VyaW5lL19kZXNpZ25cIikgIyBpbiBtYWluIGdyb3VwP1xuICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImdyb3Vwc1wiLCB0cnVlXG4gICAgZWxzZVxuICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImFzc2Vzc21lbnRzXCIsIHRydWVcblxuXG4gIGdyb3VwczogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBHcm91cHNWaWV3XG4gICAgICAgIHZtLnNob3cgdmlld1xuXG4gICNcbiAgIyBDbGFzc1xuICAjXG4gIGN1cnJpY3VsYTogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgY3VycmljdWxhID0gbmV3IEN1cnJpY3VsYVxuICAgICAgICBjdXJyaWN1bGEuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQ3VycmljdWxhVmlld1xuICAgICAgICAgICAgICBcImN1cnJpY3VsYVwiIDogY29sbGVjdGlvblxuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgY3VycmljdWx1bTogKGN1cnJpY3VsdW1JZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtIFwiX2lkXCIgOiBjdXJyaWN1bHVtSWRcbiAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyBhbGxTdWJ0ZXN0cy53aGVyZSBcImN1cnJpY3VsdW1JZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgICAgICAgICAgYWxsUXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgIGFsbFF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gW11cbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdHMuZWFjaCAoc3VidGVzdCkgLT4gcXVlc3Rpb25zID0gcXVlc3Rpb25zLmNvbmNhdChhbGxRdWVzdGlvbnMud2hlcmUgXCJzdWJ0ZXN0SWRcIiA6IHN1YnRlc3QuaWQgKVxuICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zIHF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEN1cnJpY3VsdW1WaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtXCIgOiBjdXJyaWN1bHVtXG4gICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiICAgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgIFwicXVlc3Rpb25zXCIgIDogcXVlc3Rpb25zXG5cbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICBjdXJyaWN1bHVtRWRpdDogKGN1cnJpY3VsdW1JZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtIFwiX2lkXCIgOiBjdXJyaWN1bHVtSWRcbiAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IGFsbFN1YnRlc3RzLndoZXJlIFwiY3VycmljdWx1bUlkXCIgOiBjdXJyaWN1bHVtSWRcbiAgICAgICAgICAgICAgICBhbGxQYXJ0cyA9IChzdWJ0ZXN0LmdldChcInBhcnRcIikgZm9yIHN1YnRlc3QgaW4gc3VidGVzdHMpXG4gICAgICAgICAgICAgICAgcGFydENvdW50ID0gTWF0aC5tYXguYXBwbHkgTWF0aCwgYWxsUGFydHNcbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEN1cnJpY3VsdW1WaWV3XG4gICAgICAgICAgICAgICAgICBcImN1cnJpY3VsdW1cIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICBcInBhcnRzXCIgOiBwYXJ0Q291bnRcbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIGN1cnJpY3VsdW1JbXBvcnQ6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudEltcG9ydFZpZXdcbiAgICAgICAgICBub3VuIDogXCJjdXJyaWN1bHVtXCJcbiAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAga2xhc3M6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFsbEtsYXNzZXMgPSBuZXcgS2xhc3Nlc1xuICAgICAgICBhbGxLbGFzc2VzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKCBrbGFzc0NvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgdGVhY2hlcnMgPSBuZXcgVGVhY2hlcnNcbiAgICAgICAgICAgIHRlYWNoZXJzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgYWxsQ3VycmljdWxhID0gbmV3IEN1cnJpY3VsYVxuICAgICAgICAgICAgICAgIGFsbEN1cnJpY3VsYS5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCBjdXJyaWN1bGFDb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuICAgICAgICAgICAgICAgICAgICAgIGtsYXNzQ29sbGVjdGlvbiA9IG5ldyBLbGFzc2VzIGtsYXNzQ29sbGVjdGlvbi53aGVyZShcInRlYWNoZXJJZFwiIDogVGFuZ2VyaW5lLnVzZXIuZ2V0KFwidGVhY2hlcklkXCIpKVxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzZXNWaWV3XG4gICAgICAgICAgICAgICAgICAgICAga2xhc3NlcyAgIDoga2xhc3NDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgY3VycmljdWxhIDogY3VycmljdWxhQ29sbGVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgIHRlYWNoZXJzICA6IHRlYWNoZXJzXG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGtsYXNzRWRpdDogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBrbGFzcyA9IG5ldyBLbGFzcyBfaWQgOiBpZFxuICAgICAgICBrbGFzcy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6ICggbW9kZWwgKSAtPlxuICAgICAgICAgICAgdGVhY2hlcnMgPSBuZXcgVGVhY2hlcnNcbiAgICAgICAgICAgIHRlYWNoZXJzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICAgICAgICAgICAgICBhbGxTdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGFsbFN0dWRlbnRzKSAtPlxuICAgICAgICAgICAgICAgICAgICBrbGFzc1N0dWRlbnRzID0gbmV3IFN0dWRlbnRzIGFsbFN0dWRlbnRzLndoZXJlIHtrbGFzc0lkIDogaWR9XG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NFZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgIGtsYXNzICAgICAgIDogbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50cyAgICA6IGtsYXNzU3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICBhbGxTdHVkZW50cyA6IGFsbFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgdGVhY2hlcnMgICAgOiB0ZWFjaGVyc1xuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBrbGFzc1BhcnRseTogKGtsYXNzSWQsIHBhcnQ9bnVsbCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAga2xhc3MgPSBuZXcgS2xhc3MgXCJfaWRcIiA6IGtsYXNzSWRcbiAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtIFwiX2lkXCIgOiBrbGFzcy5nZXQoXCJjdXJyaWN1bHVtSWRcIilcbiAgICAgICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBhbGxTdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgU3R1ZGVudHMgKCBjb2xsZWN0aW9uLndoZXJlKCBcImtsYXNzSWRcIiA6IGtsYXNzSWQgKSApXG5cbiAgICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgKCBjb2xsZWN0aW9uLndoZXJlKCBcImtsYXNzSWRcIiA6IGtsYXNzSWQgKSApXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHMgKCBjb2xsZWN0aW9uLndoZXJlKCBcImN1cnJpY3VsdW1JZFwiIDoga2xhc3MuZ2V0KFwiY3VycmljdWx1bUlkXCIpICkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NQYXJ0bHlWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcnRcIiAgICAgICA6IHBhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiAgIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICAgIDogcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50c1wiICAgOiBzdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtXCIgOiBjdXJyaWN1bHVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtsYXNzXCIgICAgICA6IGtsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICBzdHVkZW50U3VidGVzdDogKHN0dWRlbnRJZCwgc3VidGVzdElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBcIl9pZFwiIDogc3VidGVzdElkXG4gICAgICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi52aWV3IFwiI3tUYW5nZXJpbmUuZGVzaWduX2RvY30vcmVzdWx0c0J5U3R1ZGVudFN1YnRlc3RcIixcbiAgICAgICAgICAgICAgICAgIGtleSA6IFtzdHVkZW50SWQsc3VidGVzdElkXVxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PlxuICAgICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gY29sbGVjdGlvbi53aGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RJZFwiIDogc3VidGVzdElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudElkXCIgOiBzdHVkZW50SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc0lkXCIgICA6IHN0dWRlbnQuZ2V0KFwia2xhc3NJZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc1N1YnRlc3RSZXN1bHRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxsUmVzdWx0c1wiIDogYWxsUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgOiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICA6IHN1YnRlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInByZXZpb3VzXCIgOiByZXNwb25zZS5yb3dzLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgcnVuU3VidGVzdDogKHN0dWRlbnRJZCwgc3VidGVzdElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3QgXCJfaWRcIiA6IHN1YnRlc3RJZFxuICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBcIl9pZFwiIDogc3R1ZGVudElkXG5cbiAgICAgICAgICAgICMgdGhpcyBmdW5jdGlvbiBmb3IgbGF0ZXIsIHJlYWwgY29kZSBiZWxvd1xuICAgICAgICAgICAgb25TdHVkZW50UmVhZHkgPSAoc3R1ZGVudCwgc3VidGVzdCkgLT5cbiAgICAgICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG5cbiAgICAgICAgICAgICAgICAgICMgdGhpcyBmdW5jdGlvbiBmb3IgbGF0ZXIsIHJlYWwgY29kZSBiZWxvd1xuICAgICAgICAgICAgICAgICAgb25TdWNjZXNzID0gKHN0dWRlbnQsIHN1YnRlc3QsIHF1ZXN0aW9uPW51bGwsIGxpbmtlZFJlc3VsdD17fSkgLT5cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc1N1YnRlc3RSdW5WaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgICAgICA6IHN0dWRlbnRcbiAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RcIiAgICAgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgIFwicXVlc3Rpb25zXCIgICAgOiBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICBcImxpbmtlZFJlc3VsdFwiIDogbGlua2VkUmVzdWx0XG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBudWxsXG4gICAgICAgICAgICAgICAgICBpZiBzdWJ0ZXN0LmdldChcInByb3RvdHlwZVwiKSA9PSBcInN1cnZleVwiXG4gICAgICAgICAgICAgICAgICAgIFRhbmdlcmluZS4kZGIudmlldyBcIiN7VGFuZ2VyaW5lLmRlc2lnbl9kb2N9L3Jlc3VsdHNCeVN0dWRlbnRTdWJ0ZXN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAga2V5IDogW3N0dWRlbnRJZCxzdWJ0ZXN0LmdldChcImdyaWRMaW5rSWRcIildXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgcmVzcG9uc2Uucm93cyAhPSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtlZFJlc3VsdCA9IG5ldyBLbGFzc1Jlc3VsdCBfLmxhc3QocmVzcG9uc2Uucm93cyk/LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBcInFcIiArIHN1YnRlc3QuZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyhxdWVzdGlvbnMud2hlcmUge3N1YnRlc3RJZCA6IHN1YnRlc3RJZCB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyhzdHVkZW50LCBzdWJ0ZXN0LCBxdWVzdGlvbnMsIGxpbmtlZFJlc3VsdClcbiAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzKHN0dWRlbnQsIHN1YnRlc3QpXG4gICAgICAgICAgICAgICMgZW5kIG9mIG9uU3R1ZGVudFJlYWR5XG5cbiAgICAgICAgICAgIGlmIHN0dWRlbnRJZCA9PSBcInRlc3RcIlxuICAgICAgICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT4gb25TdHVkZW50UmVhZHkoIHN0dWRlbnQsIHN1YnRlc3QpXG4gICAgICAgICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICAgICAgICBzdHVkZW50LnNhdmUgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT4gb25TdHVkZW50UmVhZHkoIHN0dWRlbnQsIHN1YnRlc3QpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgb25TdHVkZW50UmVhZHkoc3R1ZGVudCwgc3VidGVzdClcblxuICByZWdpc3RlcjogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzVW5yZWdpc3RlcmVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IFJlZ2lzdGVyVGVhY2hlclZpZXdcbiAgICAgICAgICB1c2VyIDogbmV3IFVzZXJcbiAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cbiAgc3R1ZGVudEVkaXQ6ICggc3R1ZGVudElkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IF9pZCA6IHN0dWRlbnRJZFxuICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKG1vZGVsKSAtPlxuICAgICAgICAgICAgYWxsS2xhc3NlcyA9IG5ldyBLbGFzc2VzXG4gICAgICAgICAgICBhbGxLbGFzc2VzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6ICgga2xhc3NDb2xsZWN0aW9uICktPlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgU3R1ZGVudEVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICBzdHVkZW50IDogbW9kZWxcbiAgICAgICAgICAgICAgICAgIGtsYXNzZXMgOiBrbGFzc0NvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gICNcbiAgIyBBc3Nlc3NtZW50XG4gICNcblxuXG4gIGRhdGFFbnRyeTogKCBhc3Nlc3NtZW50SWQgKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50IFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgICAgICAgICBxdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAgICAgICAga2V5OiBcInFcIiArIGFzc2Vzc21lbnRJZFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uc0J5U3VidGVzdElkID0gcXVlc3Rpb25zLmluZGV4QnkoXCJzdWJ0ZXN0SWRcIilcbiAgICAgICAgICAgICAgICBmb3Igc3VidGVzdElkLCBxdWVzdGlvbnMgb2YgcXVlc3Rpb25zQnlTdWJ0ZXN0SWRcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnQuc3VidGVzdHMuZ2V0KHN1YnRlc3RJZCkucXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICB2bS5zaG93IG5ldyBBc3Nlc3NtZW50RGF0YUVudHJ5VmlldyBhc3Nlc3NtZW50OiBhc3Nlc3NtZW50XG5cblxuXG4gIHN5bmM6ICggYXNzZXNzbWVudElkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudCBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudFN5bmNWaWV3IFwiYXNzZXNzbWVudFwiOiBhc3Nlc3NtZW50XG5cbiAgaW1wb3J0OiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRJbXBvcnRWaWV3XG4gICAgICAgICAgbm91biA6XCJhc3Nlc3NtZW50XCJcbiAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgYXNzZXNzbWVudHM6IC0+XG4gICAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICAgIFV0aWxzLmxvYWRDb2xsZWN0aW9uc1xuICAgICAgICAgICAgY29sbGVjdGlvbnM6IFtcbiAgICAgICAgICAgICAgXCJLbGFzc2VzXCJcbiAgICAgICAgICAgICAgXCJUZWFjaGVyc1wiXG4gICAgICAgICAgICAgIFwiQ3VycmljdWxhXCJcbiAgICAgICAgICAgICAgXCJBc3Nlc3NtZW50c1wiXG4gICAgICAgICAgICAgIFwiTGVzc29uUGxhbnNcIlxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgY29tcGxldGU6IChvcHRpb25zKSAtPlxuICAgICAgICAgICAgICB2bS5zaG93IG5ldyBBc3Nlc3NtZW50c01lbnVWaWV3IG9wdGlvbnNcblxuICBlZGl0SWQ6IChpZCkgLT5cbiAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICBfaWQ6IGlkXG4gICAgICAgIGFzc2Vzc21lbnQuc3VwZXJGZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAoIG1vZGVsICkgLT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudEVkaXRWaWV3IG1vZGVsOiBtb2RlbFxuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cblxuICBlZGl0OiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICBcIl9pZFwiIDogaWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAoIG1vZGVsICkgLT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudEVkaXRWaWV3IG1vZGVsOiBtb2RlbFxuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cbiAgZWRpdExQOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBsZXNzb25QbGFuID0gbmV3IExlc3NvblBsYW5cbiAgICAgICAgICBcIl9pZFwiIDogaWRcbiAgICAgICAgbGVzc29uUGxhbi5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAoIG1vZGVsICkgLT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgTGVzc29uUGxhbkVkaXRWaWV3IG1vZGVsOiBtb2RlbFxuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cbiAgcmVzdGFydDogKG5hbWUpIC0+XG4gICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcInJ1bi8je25hbWV9XCIsIHRydWVcblxuIyAgV2lkZ2V0UnVuVmlldyB0YWtlcyBhIGxpc3Qgb2Ygc3VidGVzdHMgYW5kIHRoZSBhc3Nlc3NtZW50LlxuICBydW46IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgZEtleSA9IEpTT04uc3RyaW5naWZ5KGlkLnN1YnN0cigtNSwgNSkpXG4gICAgICAgIHVybCA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwiZ3JvdXBcIiwgXCJieURLZXlcIilcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgdHlwZTogXCJHRVRcIlxuICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgIGRhdGE6IGtleTogZEtleVxuICAgICAgICAgIGVycm9yOiAoYSwgYikgPT4gQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgZXJyb3JcIiwgXCIje2F9ICN7Yn1cIlxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgZG9jTGlzdCA9IFtdXG4gICAgICAgICAgICBmb3IgZGF0dW0gaW4gZGF0YS5yb3dzXG4gICAgICAgICAgICAgIGRvY0xpc3QucHVzaCBkYXR1bS5pZFxuICAgICAgICAgICAgICBrZXlMaXN0ID0gXy51bmlxKGRvY0xpc3QpXG4gICAgICAgICAgICBUYW5nZXJpbmUuJGRiLmFsbERvY3NcbiAgICAgICAgICAgICAga2V5cyA6IGtleUxpc3RcbiAgICAgICAgICAgICAgaW5jbHVkZV9kb2NzOnRydWVcbiAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgIGRvY3MgPSBbXVxuICAgICAgICAgICAgICAgIGZvciByb3cgaW4gcmVzcG9uc2Uucm93c1xuICAgICAgICAgICAgICAgICAgZG9jcy5wdXNoIHJvdy5kb2NcbiMgICAgICAgICAgICAgICAgYm9keSA9XG4jICAgICAgICAgICAgICAgICAgZG9jczogZG9jc1xuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgV2lkZ2V0UnVuVmlldyBtb2RlbDogZG9jc1xuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHByaW50OiAoIGFzc2Vzc21lbnRJZCwgZm9ybWF0ICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICggbW9kZWwgKSAtPlxuICAgICAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50UHJpbnRWaWV3XG4gICAgICAgICAgICAgIG1vZGVsICA6IG1vZGVsXG4gICAgICAgICAgICAgIGZvcm1hdCA6IGZvcm1hdFxuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgcmVzdW1lOiAoYXNzZXNzbWVudElkLCByZXN1bHRJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICggYXNzZXNzbWVudCApIC0+XG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgUmVzdWx0XG4gICAgICAgICAgICAgIFwiX2lkXCIgOiByZXN1bHRJZFxuICAgICAgICAgICAgcmVzdWx0LmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXN1bHQpIC0+XG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50UnVuVmlld1xuICAgICAgICAgICAgICAgICAgbW9kZWw6IGFzc2Vzc21lbnRcblxuICAgICAgICAgICAgICAgIGlmIHJlc3VsdC5oYXMoXCJvcmRlcl9tYXBcIilcbiAgICAgICAgICAgICAgICAgICMgc2F2ZSB0aGUgb3JkZXIgbWFwIG9mIHByZXZpb3VzIHJhbmRvbWl6YXRpb25cbiAgICAgICAgICAgICAgICAgIG9yZGVyTWFwID0gcmVzdWx0LmdldChcIm9yZGVyX21hcFwiKS5zbGljZSgpICMgY2xvbmUgYXJyYXlcbiAgICAgICAgICAgICAgICAgICMgcmVzdG9yZSB0aGUgcHJldmlvdXMgb3JkZXJtYXBcbiAgICAgICAgICAgICAgICAgIHZpZXcub3JkZXJNYXAgPSBvcmRlck1hcFxuXG4gICAgICAgICAgICAgICAgZm9yIHN1YnRlc3QgaW4gcmVzdWx0LmdldChcInN1YnRlc3REYXRhXCIpXG4gICAgICAgICAgICAgICAgICBpZiBzdWJ0ZXN0LmRhdGE/ICYmIHN1YnRlc3QuZGF0YS5wYXJ0aWNpcGFudF9pZD9cbiAgICAgICAgICAgICAgICAgICAgVGFuZ2VyaW5lLm5hdi5zZXRTdHVkZW50IHN1YnRlc3QuZGF0YS5wYXJ0aWNpcGFudF9pZFxuXG4gICAgICAgICAgICAgICAgIyByZXBsYWNlIHRoZSB2aWV3J3MgcmVzdWx0IHdpdGggb3VyIG9sZCBvbmVcbiAgICAgICAgICAgICAgICB2aWV3LnJlc3VsdCA9IHJlc3VsdFxuXG4gICAgICAgICAgICAgICAgIyBIaWphY2sgdGhlIG5vcm1hbCBSZXN1bHQgYW5kIFJlc3VsdFZpZXcsIHVzZSBvbmUgZnJvbSB0aGUgZGJcbiAgICAgICAgICAgICAgICB2aWV3LnN1YnRlc3RWaWV3cy5wb3AoKVxuICAgICAgICAgICAgICAgIHZpZXcuc3VidGVzdFZpZXdzLnB1c2ggbmV3IFJlc3VsdFZpZXdcbiAgICAgICAgICAgICAgICAgIG1vZGVsICAgICAgICAgIDogcmVzdWx0XG4gICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50ICAgICA6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnRWaWV3IDogdmlld1xuICAgICAgICAgICAgICAgIHZpZXcuaW5kZXggPSByZXN1bHQuZ2V0KFwic3VidGVzdERhdGFcIikubGVuZ3RoXG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuXG4gIHJlc3VsdHM6IChhc3Nlc3NtZW50SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFmdGVyRmV0Y2ggPSAoYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50KFwiX2lkXCI6YXNzZXNzbWVudElkKSwgYXNzZXNzbWVudElkKSAtPlxuICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgUmVzdWx0c1xuICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgIGluY2x1ZGVfZG9jczogZmFsc2VcbiAgICAgICAgICAgIGtleTogXCJyXCIgKyBhc3Nlc3NtZW50SWRcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXN1bHRzKSA9PlxuICAgICAgICAgICAgICB2aWV3ID0gbmV3IFJlc3VsdHNWaWV3XG4gICAgICAgICAgICAgICAgXCJhc3Nlc3NtZW50XCIgOiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgICAgOiByZXN1bHRzLm1vZGVsc1xuICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogIC0+XG4gICAgICAgICAgICBhZnRlckZldGNoKGFzc2Vzc21lbnQsIGFzc2Vzc21lbnRJZClcbiAgICAgICAgICBlcnJvciA6ICAtPlxuICAgICAgICAgICAgYWZ0ZXJGZXRjaChhc3Nlc3NtZW50LCBhc3Nlc3NtZW50SWQpXG5cblxuICAjXG4gICMgUmVwb3J0c1xuICAjXG4gIGtsYXNzR3JvdXBpbmc6IChrbGFzc0lkLCBwYXJ0KSAtPlxuICAgIHBhcnQgPSBwYXJzZUludChwYXJ0KVxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6ICggY29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzIGNvbGxlY3Rpb24ud2hlcmUgXCJwYXJ0XCIgOiBwYXJ0XG4gICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIHJlc3VsdHMgKSAtPlxuICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0cy53aGVyZSBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICBzdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuXG4gICAgICAgICAgICAgICAgICAgICAgIyBmaWx0ZXIgYFJlc3VsdHNgIGJ5IGBLbGFzc2AncyBjdXJyZW50IGBTdHVkZW50c2BcbiAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50cyBzdHVkZW50cy53aGVyZSBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50SWRzID0gc3R1ZGVudHMucGx1Y2soXCJfaWRcIilcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50cyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzLm1vZGVsc1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMucHVzaChyZXN1bHQpIGlmIHJlc3VsdC5nZXQoXCJzdHVkZW50SWRcIikgaW4gc3R1ZGVudElkc1xuICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHNcblxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NHcm91cGluZ1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudHNcIiA6IHN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogZmlsdGVyZWRSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgbWFzdGVyeUNoZWNrOiAoc3R1ZGVudElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKHN0dWRlbnQpIC0+XG4gICAgICAgICAgICBrbGFzc0lkID0gc3R1ZGVudC5nZXQgXCJrbGFzc0lkXCJcbiAgICAgICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIFwiX2lkXCIgOiBzdHVkZW50LmdldCBcImtsYXNzSWRcIlxuICAgICAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogKGtsYXNzKSAtPlxuICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCBjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgY29sbGVjdGlvbi53aGVyZSBcInN0dWRlbnRJZFwiIDogc3R1ZGVudElkLCBcInJlcG9ydFR5cGVcIiA6IFwibWFzdGVyeVwiLCBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgICAgIyBnZXQgYSBsaXN0IG9mIHN1YnRlc3RzIGludm9sdmVkXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RJZExpc3QgPSB7fVxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0SWRMaXN0W3Jlc3VsdC5nZXQoXCJzdWJ0ZXN0SWRcIildID0gdHJ1ZSBmb3IgcmVzdWx0IGluIHJlc3VsdHMubW9kZWxzXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RJZExpc3QgPSBfLmtleXMoc3VidGVzdElkTGlzdClcblxuICAgICAgICAgICAgICAgICAgICAjIG1ha2UgYSBjb2xsZWN0aW9uIGFuZCBmZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0Q29sbGVjdGlvbiA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0Q29sbGVjdGlvbi5hZGQgbmV3IFN1YnRlc3QoXCJfaWRcIiA6IHN1YnRlc3RJZCkgZm9yIHN1YnRlc3RJZCBpbiBzdWJ0ZXN0SWRMaXN0XG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgTWFzdGVyeUNoZWNrVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc1wiICAgIDoga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdENvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHByb2dyZXNzUmVwb3J0OiAoc3R1ZGVudElkLCBrbGFzc0lkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICAjIHNhdmUgdGhpcyBjcmF6eSBmdW5jdGlvbiBmb3IgbGF0ZXJcbiAgICAgICAgIyBzdHVkZW50SWQgY2FuIGhhdmUgdGhlIHZhbHVlIFwiYWxsXCIsIGluIHdoaWNoIGNhc2Ugc3R1ZGVudCBzaG91bGQgPT0gbnVsbFxuICAgICAgICBhZnRlckZldGNoID0gKCBzdHVkZW50LCBzdHVkZW50cyApIC0+XG4gICAgICAgICAga2xhc3MgPSBuZXcgS2xhc3MgXCJfaWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICBrbGFzcy5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogKGtsYXNzKSAtPlxuICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggYWxsU3VidGVzdHMgKSAtPlxuICAgICAgICAgICAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHMgYWxsU3VidGVzdHMud2hlcmVcbiAgICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtSWRcIiA6IGtsYXNzLmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgICAgICAgICBcInJlcG9ydFR5cGVcIiAgIDogXCJwcm9ncmVzc1wiXG4gICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIGNvbGxlY3Rpb24ud2hlcmUgXCJrbGFzc0lkXCIgOiBrbGFzc0lkLCBcInJlcG9ydFR5cGVcIiA6IFwicHJvZ3Jlc3NcIlxuXG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgc3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICBpZiBzdHVkZW50cz9cbiAgICAgICAgICAgICAgICAgICAgICAgICMgZmlsdGVyIGBSZXN1bHRzYCBieSBgS2xhc3NgJ3MgY3VycmVudCBgU3R1ZGVudHNgXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50SWRzID0gc3R1ZGVudHMucGx1Y2soXCJfaWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciByZXN1bHQgaW4gcmVzdWx0cy5tb2RlbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMucHVzaChyZXN1bHQpIGlmIHJlc3VsdC5nZXQoXCJzdHVkZW50SWRcIikgaW4gc3R1ZGVudElkc1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHNcblxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgUHJvZ3Jlc3NWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc1wiICAgIDoga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICBpZiBzdHVkZW50SWQgIT0gXCJhbGxcIlxuICAgICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBcIl9pZFwiIDogc3R1ZGVudElkXG4gICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogLT4gYWZ0ZXJGZXRjaCBzdHVkZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgIHN0dWRlbnRzLmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiAtPiBhZnRlckZldGNoIG51bGwsIHN0dWRlbnRzXG5cbiAgI1xuICAjIFN1YnRlc3RzXG4gICNcbiAgZWRpdFN1YnRlc3Q6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IF9pZCA6IGlkXG4gICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAobW9kZWwsIHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBzdWJ0ZXN0LmdldChcImFzc2Vzc21lbnRJZFwiKVxuICAgICAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgU3VidGVzdEVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICBtb2RlbCAgICAgIDogbW9kZWxcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnQgOiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cbiAgZWRpdEtsYXNzU3VidGVzdDogKGlkKSAtPlxuXG4gICAgb25TdWNjZXNzID0gKHN1YnRlc3QsIGN1cnJpY3VsdW0sIHF1ZXN0aW9ucz1udWxsKSAtPlxuICAgICAgdmlldyA9IG5ldyBLbGFzc1N1YnRlc3RFZGl0Vmlld1xuICAgICAgICBtb2RlbCAgICAgIDogc3VidGVzdFxuICAgICAgICBjdXJyaWN1bHVtIDogY3VycmljdWx1bVxuICAgICAgICBxdWVzdGlvbnMgIDogcXVlc3Rpb25zXG4gICAgICB2bS5zaG93IHZpZXdcblxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgaWQgPSBVdGlscy5jbGVhblVSTCBpZFxuICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3QgX2lkIDogaWRcbiAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHN1YnRlc3QuZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgaWYgc3VidGVzdC5nZXQoXCJwcm90b3R5cGVcIikgPT0gXCJzdXJ2ZXlcIlxuICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgICAgICAgIGtleSA6IGN1cnJpY3VsdW0uaWRcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zIHF1ZXN0aW9ucy53aGVyZShcInN1YnRlc3RJZFwiOnN1YnRlc3QuaWQpXG4gICAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzIHN1YnRlc3QsIGN1cnJpY3VsdW0sIHF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyBzdWJ0ZXN0LCBjdXJyaWN1bHVtXG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cblxuICAjXG4gICMgUXVlc3Rpb25cbiAgI1xuICBlZGl0UXVlc3Rpb246IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgcXVlc3Rpb24gPSBuZXcgUXVlc3Rpb24gX2lkIDogaWRcbiAgICAgICAgcXVlc3Rpb24uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAocXVlc3Rpb24sIHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBxdWVzdGlvbi5nZXQoXCJhc3Nlc3NtZW50SWRcIilcbiAgICAgICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3RcbiAgICAgICAgICAgICAgICAgIFwiX2lkXCIgOiBxdWVzdGlvbi5nZXQoXCJzdWJ0ZXN0SWRcIilcbiAgICAgICAgICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFF1ZXN0aW9uRWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBcInF1ZXN0aW9uXCIgICA6IHF1ZXN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0XCIgICAgOiBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgXCJhc3Nlc3NtZW50XCIgOiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG5cbiAgZWRpdEtsYXNzUXVlc3Rpb246IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgcXVlc3Rpb24gPSBuZXcgUXVlc3Rpb24gXCJfaWRcIiA6IGlkXG4gICAgICAgIHF1ZXN0aW9uLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKHF1ZXN0aW9uLCByZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bVxuICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwic3VidGVzdElkXCIpXG4gICAgICAgICAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBRdWVzdGlvbkVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvblwiICAgOiBxdWVzdGlvblxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICAgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgIFwiYXNzZXNzbWVudFwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gICNcbiAgIyBVc2VyXG4gICNcbiAgbG9naW46IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG4gICAgICBpc1VucmVnaXN0ZXJlZDogLT5cblxuICAgICAgICBzaG93VmlldyA9ICh1c2VycyA9IFtdKSAtPlxuICAgICAgICAgIHZpZXcgPSBuZXcgTG9naW5WaWV3XG4gICAgICAgICAgICB1c2VyczogdXNlcnNcbiAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICBzaG93VmlldygpXG5cbiAgbG9nb3V0OiAtPlxuICAgIFRhbmdlcmluZS51c2VyLmxvZ291dCgpXG5cbiAgYWNjb3VudDogLT5cbiAgICAjIGNoYW5nZSB0aGUgbG9jYXRpb24gdG8gdGhlIHRydW5rLCB1bmxlc3Mgd2UncmUgYWxyZWFkeSBpbiB0aGUgdHJ1bmtcbiAgICBpZiBUYW5nZXJpbmUuZGJfbmFtZSAhPSBcInRhbmdlcmluZVwiXG4gICAgICB3aW5kb3cubG9jYXRpb24gPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsSW5kZXgoXCJ0cnVua1wiLCBcImFjY291bnRcIilcbiAgICBlbHNlXG4gICAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICAgIHZpZXcgPSBuZXcgQWNjb3VudFZpZXdcbiAgICAgICAgICAgIHVzZXIgOiBUYW5nZXJpbmUudXNlclxuICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHNldHRpbmdzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IFNldHRpbmdzVmlld1xuICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIGxvZ3M6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGxvZ3MgPSBuZXcgTG9nc1xuICAgICAgICBsb2dzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgTG9nVmlld1xuICAgICAgICAgICAgICBsb2dzOiBsb2dzXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG5cblxuICAjIFRyYW5zZmVyIGEgbmV3IHVzZXIgZnJvbSB0YW5nZXJpbmUtY2VudHJhbCBpbnRvIHRhbmdlcmluZVxuICB0cmFuc2ZlcjogLT5cbiAgICBnZXRWYXJzID0gVXRpbHMuJF9HRVQoKVxuICAgIG5hbWUgPSBnZXRWYXJzLm5hbWVcbiAgICAkLmNvdWNoLmxvZ291dFxuICAgICAgc3VjY2VzczogPT5cbiAgICAgICAgJC5jb29raWUgXCJBdXRoU2Vzc2lvblwiLCBudWxsXG4gICAgICAgICQuY291Y2gubG9naW5cbiAgICAgICAgICBcIm5hbWVcIiAgICAgOiBuYW1lXG4gICAgICAgICAgXCJwYXNzd29yZFwiIDogbmFtZVxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICAkLmNvdWNoLnNpZ251cFxuICAgICAgICAgICAgICBcIm5hbWVcIiA6ICBuYW1lXG4gICAgICAgICAgICAgIFwicm9sZXNcIiA6IFtcIl9hZG1pblwiXVxuICAgICAgICAgICAgLCBuYW1lLFxuICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgdXNlciA9IG5ldyBVc2VyXG4gICAgICAgICAgICAgIHVzZXIuc2F2ZVxuICAgICAgICAgICAgICAgIFwibmFtZVwiICA6IG5hbWVcbiAgICAgICAgICAgICAgICBcImlkXCIgICAgOiBcInRhbmdlcmluZS51c2VyOlwiK25hbWVcbiAgICAgICAgICAgICAgICBcInJvbGVzXCIgOiBbXVxuICAgICAgICAgICAgICAgIFwiZnJvbVwiICA6IFwidGNcIlxuICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgd2FpdDogdHJ1ZVxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAkLmNvdWNoLmxvZ2luXG4gICAgICAgICAgICAgICAgICAgIFwibmFtZVwiICAgICA6IG5hbWVcbiAgICAgICAgICAgICAgICAgICAgXCJwYXNzd29yZFwiIDogbmFtZVxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzIDogLT5cbiAgICAgICAgICAgICAgICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICAgICAgICAgICAgICBVdGlscy5zdGlja3kgXCJFcnJvciB0cmFuc2ZlcmluZyB1c2VyLlwiXG4iXX0=
