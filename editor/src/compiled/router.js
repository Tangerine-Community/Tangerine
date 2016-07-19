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

//# sourceMappingURL=data:application/json;base64,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QUNBLFVBQUEsRUFBYSxJQURiO3dCQUVBLE9BQUEsRUFBVSxTQUFBOzBCQUNSLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBakIsQ0FBQTtpQ0FDQSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQWhCLENBQUE7d0JBRlEsQ0FGVjt3QkFLQSxLQUFBLEVBQU8sU0FBQTtpQ0FDTCxLQUFLLENBQUMsTUFBTixDQUFhLHlCQUFiO3dCQURLLENBTFA7dUJBREY7b0JBRE8sQ0FEVDttQkFORjtnQkFGTyxDQUFUO2VBSkE7WUFESyxDQUxQO1dBREY7UUFGTztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtLQURGO0VBSFE7Ozs7R0EveEJTLFFBQVEsQ0FBQyIsImZpbGUiOiJhcHAvcm91dGVyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgUm91dGVyIGV4dGVuZHMgQmFja2JvbmUuUm91dGVyXG4jICBiZWZvcmU6ICgpIC0+XG4jICAgIGNvbnNvbGUubG9nKCdiZWZvcmUnKVxuIyAgICAkKCcjZm9vdGVyJykuc2hvdygpXG4jXG4jICBhZnRlcjogKCkgLT5cbiMgICAgY29uc29sZS5sb2coJ2FmdGVyJyk7XG4gIGV4ZWN1dGU6IChjYWxsYmFjaywgYXJncywgbmFtZSkgLT5cbiAgICAkKCcjZm9vdGVyJykuc2hvdygpXG4gICAgaWYgKGNhbGxiYWNrKVxuICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJncylcblxuICByb3V0ZXM6XG4gICAgJ2xvZ2luJyAgICA6ICdsb2dpbidcbiAgICAncmVnaXN0ZXInIDogJ3JlZ2lzdGVyJ1xuICAgICdsb2dvdXQnICAgOiAnbG9nb3V0J1xuICAgICdhY2NvdW50JyAgOiAnYWNjb3VudCdcblxuICAgICd0cmFuc2ZlcicgOiAndHJhbnNmZXInXG5cbiAgICAnc2V0dGluZ3MnIDogJ3NldHRpbmdzJ1xuICAgICd1cGRhdGUnIDogJ3VwZGF0ZSdcblxuICAgICcnIDogJ2xhbmRpbmcnXG5cbiAgICAnbG9ncycgOiAnbG9ncydcblxuICAgICMgQ2xhc3NcbiAgICAnY2xhc3MnICAgICAgICAgIDogJ2tsYXNzJ1xuICAgICdjbGFzcy9lZGl0LzppZCcgOiAna2xhc3NFZGl0J1xuICAgICdjbGFzcy9zdHVkZW50LzpzdHVkZW50SWQnICAgICAgICA6ICdzdHVkZW50RWRpdCdcbiAgICAnY2xhc3Mvc3R1ZGVudC9yZXBvcnQvOnN0dWRlbnRJZCcgOiAnc3R1ZGVudFJlcG9ydCdcbiAgICAnY2xhc3Mvc3VidGVzdC86aWQnIDogJ2VkaXRLbGFzc1N1YnRlc3QnXG4gICAgJ2NsYXNzL3F1ZXN0aW9uLzppZCcgOiBcImVkaXRLbGFzc1F1ZXN0aW9uXCJcblxuICAgICdjbGFzcy86aWQvOnBhcnQnIDogJ2tsYXNzUGFydGx5J1xuICAgICdjbGFzcy86aWQnICAgICAgIDogJ2tsYXNzUGFydGx5J1xuXG4gICAgJ2NsYXNzL3J1bi86c3R1ZGVudElkLzpzdWJ0ZXN0SWQnIDogJ3J1blN1YnRlc3QnXG5cbiAgICAnY2xhc3MvcmVzdWx0L3N0dWRlbnQvc3VidGVzdC86c3R1ZGVudElkLzpzdWJ0ZXN0SWQnIDogJ3N0dWRlbnRTdWJ0ZXN0J1xuXG4gICAgJ2N1cnJpY3VsYScgICAgICAgICA6ICdjdXJyaWN1bGEnXG4gICAgJ2N1cnJpY3VsdW0vOmlkJyAgICA6ICdjdXJyaWN1bHVtJ1xuICAgICdjdXJyaWN1bHVtSW1wb3J0JyAgOiAnY3VycmljdWx1bUltcG9ydCdcblxuICAgICdyZXBvcnQva2xhc3NHcm91cGluZy86a2xhc3NJZC86cGFydCcgOiAna2xhc3NHcm91cGluZydcbiAgICAncmVwb3J0L21hc3RlcnlDaGVjay86c3R1ZGVudElkJyAgICAgIDogJ21hc3RlcnlDaGVjaydcbiAgICAncmVwb3J0L3Byb2dyZXNzLzpzdHVkZW50SWQvOmtsYXNzSWQnIDogJ3Byb2dyZXNzUmVwb3J0J1xuXG5cbiAgICAjIHNlcnZlciAvIG1vYmlsZVxuICAgICdncm91cHMnIDogJ2dyb3VwcydcblxuICAgICdhc3Nlc3NtZW50cycgICAgICAgIDogJ2Fzc2Vzc21lbnRzJ1xuXG4gICAgJ3J1bi86aWQnICAgICAgIDogJ3J1bidcbiAgICAncHJpbnQvOmlkLzpmb3JtYXQnICAgICAgIDogJ3ByaW50J1xuICAgICdkYXRhRW50cnkvOmlkJyA6ICdkYXRhRW50cnknXG5cbiAgICAncmVzdW1lLzphc3Nlc3NtZW50SWQvOnJlc3VsdElkJyAgICA6ICdyZXN1bWUnXG5cbiAgICAncmVzdGFydC86aWQnICAgOiAncmVzdGFydCdcbiAgICAnZWRpdC86aWQnICAgICAgOiAnZWRpdCdcbiAgICAncmVzdWx0cy86aWQnICAgOiAncmVzdWx0cydcbiAgICAnaW1wb3J0JyAgICAgICAgOiAnaW1wb3J0J1xuXG4gICAgJ3N1YnRlc3QvOmlkJyAgICAgICA6ICdlZGl0U3VidGVzdCdcblxuICAgICdxdWVzdGlvbi86aWQnIDogJ2VkaXRRdWVzdGlvbidcbiAgICAnZGFzaGJvYXJkJyA6ICdkYXNoYm9hcmQnXG4gICAgJ2Rhc2hib2FyZC8qb3B0aW9ucycgOiAnZGFzaGJvYXJkJ1xuICAgICdhZG1pbicgOiAnYWRtaW4nXG5cbiAgICAnc3luYy86aWQnICAgICAgOiAnc3luYydcblxuXG4gIGFkbWluOiAob3B0aW9ucykgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgICQuY291Y2guYWxsRGJzXG4gICAgICAgICAgc3VjY2VzczogKGRhdGFiYXNlcykgPT5cbiAgICAgICAgICAgIGdyb3VwcyA9IGRhdGFiYXNlcy5maWx0ZXIgKGRhdGFiYXNlKSAtPiBkYXRhYmFzZS5pbmRleE9mKFwiZ3JvdXAtXCIpID09IDBcbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQWRtaW5WaWV3XG4gICAgICAgICAgICAgIGdyb3VwcyA6IGdyb3Vwc1xuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgZGFzaGJvYXJkOiAob3B0aW9ucykgLT5cbiAgICBvcHRpb25zID0gb3B0aW9ucz8uc3BsaXQoL1xcLy8pXG4gICAgY29uc29sZS5sb2coXCJvcHRpb25zOiBcIiArIG9wdGlvbnMpXG4gICAgI2RlZmF1bHQgdmlldyBvcHRpb25zXG4gICAgcmVwb3J0Vmlld09wdGlvbnMgPVxuICAgICAgYXNzZXNzbWVudDogXCJBbGxcIlxuICAgICAgZ3JvdXBCeTogXCJlbnVtZXJhdG9yXCJcblxuICAgICMgQWxsb3dzIHVzIHRvIGdldCBuYW1lL3ZhbHVlIHBhaXJzIGZyb20gVVJMXG4gICAgXy5lYWNoIG9wdGlvbnMsIChvcHRpb24saW5kZXgpIC0+XG4gICAgICB1bmxlc3MgaW5kZXggJSAyXG4gICAgICAgIHJlcG9ydFZpZXdPcHRpb25zW29wdGlvbl0gPSBvcHRpb25zW2luZGV4KzFdXG5cbiAgICB2aWV3ID0gbmV3IERhc2hib2FyZFZpZXcgIHJlcG9ydFZpZXdPcHRpb25zXG5cbiAgICB2bS5zaG93IHZpZXdcblxuICBsYW5kaW5nOiAtPlxuXG4gICAgaWYgflN0cmluZyh3aW5kb3cubG9jYXRpb24uaHJlZikuaW5kZXhPZihcInRhbmdlcmluZS9fZGVzaWduXCIpICMgaW4gbWFpbiBncm91cD9cbiAgICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJncm91cHNcIiwgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJhc3Nlc3NtZW50c1wiLCB0cnVlXG5cblxuICBncm91cHM6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgR3JvdXBzVmlld1xuICAgICAgICB2bS5zaG93IHZpZXdcblxuICAjXG4gICMgQ2xhc3NcbiAgI1xuICBjdXJyaWN1bGE6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGN1cnJpY3VsYSA9IG5ldyBDdXJyaWN1bGFcbiAgICAgICAgY3VycmljdWxhLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IEN1cnJpY3VsYVZpZXdcbiAgICAgICAgICAgICAgXCJjdXJyaWN1bGFcIiA6IGNvbGxlY3Rpb25cbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGN1cnJpY3VsdW06IChjdXJyaWN1bHVtSWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bSBcIl9pZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHMgYWxsU3VidGVzdHMud2hlcmUgXCJjdXJyaWN1bHVtSWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICAgICAgICAgIGFsbFF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgICAgICBhbGxRdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IFtdXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RzLmVhY2ggKHN1YnRlc3QpIC0+IHF1ZXN0aW9ucyA9IHF1ZXN0aW9ucy5jb25jYXQoYWxsUXVlc3Rpb25zLndoZXJlIFwic3VidGVzdElkXCIgOiBzdWJ0ZXN0LmlkIClcbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBDdXJyaWN1bHVtVmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bVwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiAgIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICBcInF1ZXN0aW9uc1wiICA6IHF1ZXN0aW9uc1xuXG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgY3VycmljdWx1bUVkaXQ6IChjdXJyaWN1bHVtSWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bSBcIl9pZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdHMgPSBhbGxTdWJ0ZXN0cy53aGVyZSBcImN1cnJpY3VsdW1JZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgICAgICAgICAgYWxsUGFydHMgPSAoc3VidGVzdC5nZXQoXCJwYXJ0XCIpIGZvciBzdWJ0ZXN0IGluIHN1YnRlc3RzKVxuICAgICAgICAgICAgICAgIHBhcnRDb3VudCA9IE1hdGgubWF4LmFwcGx5IE1hdGgsIGFsbFBhcnRzXG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBDdXJyaWN1bHVtVmlld1xuICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtXCIgOiBjdXJyaWN1bHVtXG4gICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgXCJwYXJ0c1wiIDogcGFydENvdW50XG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICBjdXJyaWN1bHVtSW1wb3J0OiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRJbXBvcnRWaWV3XG4gICAgICAgICAgbm91biA6IFwiY3VycmljdWx1bVwiXG4gICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGtsYXNzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhbGxLbGFzc2VzID0gbmV3IEtsYXNzZXNcbiAgICAgICAgYWxsS2xhc3Nlcy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6ICgga2xhc3NDb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgIHRlYWNoZXJzID0gbmV3IFRlYWNoZXJzXG4gICAgICAgICAgICB0ZWFjaGVycy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGFsbEN1cnJpY3VsYSA9IG5ldyBDdXJyaWN1bGFcbiAgICAgICAgICAgICAgICBhbGxDdXJyaWN1bGEuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggY3VycmljdWxhQ29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBUYW5nZXJpbmUudXNlci5pc0FkbWluKClcbiAgICAgICAgICAgICAgICAgICAgICBrbGFzc0NvbGxlY3Rpb24gPSBuZXcgS2xhc3NlcyBrbGFzc0NvbGxlY3Rpb24ud2hlcmUoXCJ0ZWFjaGVySWRcIiA6IFRhbmdlcmluZS51c2VyLmdldChcInRlYWNoZXJJZFwiKSlcbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc2VzVmlld1xuICAgICAgICAgICAgICAgICAgICAgIGtsYXNzZXMgICA6IGtsYXNzQ29sbGVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgIGN1cnJpY3VsYSA6IGN1cnJpY3VsYUNvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICB0ZWFjaGVycyAgOiB0ZWFjaGVyc1xuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBrbGFzc0VkaXQ6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAga2xhc3MgPSBuZXcgS2xhc3MgX2lkIDogaWRcbiAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAoIG1vZGVsICkgLT5cbiAgICAgICAgICAgIHRlYWNoZXJzID0gbmV3IFRlYWNoZXJzXG4gICAgICAgICAgICB0ZWFjaGVycy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChhbGxTdHVkZW50cykgLT5cbiAgICAgICAgICAgICAgICAgICAga2xhc3NTdHVkZW50cyA9IG5ldyBTdHVkZW50cyBhbGxTdHVkZW50cy53aGVyZSB7a2xhc3NJZCA6IGlkfVxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzRWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBrbGFzcyAgICAgICA6IG1vZGVsXG4gICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHMgICAgOiBrbGFzc1N0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMgOiBhbGxTdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgIHRlYWNoZXJzICAgIDogdGVhY2hlcnNcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAga2xhc3NQYXJ0bHk6IChrbGFzc0lkLCBwYXJ0PW51bGwpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIFwiX2lkXCIgOiBrbGFzc0lkXG4gICAgICAgIGtsYXNzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bSBcIl9pZFwiIDoga2xhc3MuZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICAgICAgICAgICAgICBhbGxTdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IFN0dWRlbnRzICggY29sbGVjdGlvbi53aGVyZSggXCJrbGFzc0lkXCIgOiBrbGFzc0lkICkgKVxuXG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzICggY29sbGVjdGlvbi53aGVyZSggXCJrbGFzc0lkXCIgOiBrbGFzc0lkICkgKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzICggY29sbGVjdGlvbi53aGVyZSggXCJjdXJyaWN1bHVtSWRcIiA6IGtsYXNzLmdldChcImN1cnJpY3VsdW1JZFwiKSApIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzUGFydGx5Vmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJ0XCIgICAgICAgOiBwYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgICA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudHNcIiAgIDogc3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bVwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc1wiICAgICAgOiBrbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgc3R1ZGVudFN1YnRlc3Q6IChzdHVkZW50SWQsIHN1YnRlc3RJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IFwiX2lkXCIgOiBzdHVkZW50SWRcbiAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3QgXCJfaWRcIiA6IHN1YnRlc3RJZFxuICAgICAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIFRhbmdlcmluZS4kZGIudmlldyBcIiN7VGFuZ2VyaW5lLmRlc2lnbl9kb2N9L3Jlc3VsdHNCeVN0dWRlbnRTdWJ0ZXN0XCIsXG4gICAgICAgICAgICAgICAgICBrZXkgOiBbc3R1ZGVudElkLHN1YnRlc3RJZF1cbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IGNvbGxlY3Rpb24ud2hlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0SWRcIiA6IHN1YnRlc3RJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRJZFwiIDogc3R1ZGVudElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NJZFwiICAgOiBzdHVkZW50LmdldChcImtsYXNzSWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NTdWJ0ZXN0UmVzdWx0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsbFJlc3VsdHNcIiA6IGFsbFJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RcIiAgOiBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudFwiICA6IHN0dWRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwcmV2aW91c1wiIDogcmVzcG9uc2Uucm93cy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHJ1blN1YnRlc3Q6IChzdHVkZW50SWQsIHN1YnRlc3RJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IFwiX2lkXCIgOiBzdWJ0ZXN0SWRcbiAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuXG4gICAgICAgICAgICAjIHRoaXMgZnVuY3Rpb24gZm9yIGxhdGVyLCByZWFsIGNvZGUgYmVsb3dcbiAgICAgICAgICAgIG9uU3R1ZGVudFJlYWR5ID0gKHN0dWRlbnQsIHN1YnRlc3QpIC0+XG4gICAgICAgICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuXG4gICAgICAgICAgICAgICAgICAjIHRoaXMgZnVuY3Rpb24gZm9yIGxhdGVyLCByZWFsIGNvZGUgYmVsb3dcbiAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyA9IChzdHVkZW50LCBzdWJ0ZXN0LCBxdWVzdGlvbj1udWxsLCBsaW5rZWRSZXN1bHQ9e30pIC0+XG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NTdWJ0ZXN0UnVuVmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudFwiICAgICAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0XCIgICAgICA6IHN1YnRlc3RcbiAgICAgICAgICAgICAgICAgICAgICBcInF1ZXN0aW9uc1wiICAgIDogcXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgXCJsaW5rZWRSZXN1bHRcIiA6IGxpbmtlZFJlc3VsdFxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbnVsbFxuICAgICAgICAgICAgICAgICAgaWYgc3VidGVzdC5nZXQoXCJwcm90b3R5cGVcIikgPT0gXCJzdXJ2ZXlcIlxuICAgICAgICAgICAgICAgICAgICBUYW5nZXJpbmUuJGRiLnZpZXcgXCIje1RhbmdlcmluZS5kZXNpZ25fZG9jfS9yZXN1bHRzQnlTdHVkZW50U3VidGVzdFwiLFxuICAgICAgICAgICAgICAgICAgICAgIGtleSA6IFtzdHVkZW50SWQsc3VidGVzdC5nZXQoXCJncmlkTGlua0lkXCIpXVxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHJlc3BvbnNlLnJvd3MgIT0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rZWRSZXN1bHQgPSBuZXcgS2xhc3NSZXN1bHQgXy5sYXN0KHJlc3BvbnNlLnJvd3MpPy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogXCJxXCIgKyBzdWJ0ZXN0LmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMocXVlc3Rpb25zLndoZXJlIHtzdWJ0ZXN0SWQgOiBzdWJ0ZXN0SWQgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Moc3R1ZGVudCwgc3VidGVzdCwgcXVlc3Rpb25zLCBsaW5rZWRSZXN1bHQpXG4gICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyhzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgICAjIGVuZCBvZiBvblN0dWRlbnRSZWFkeVxuXG4gICAgICAgICAgICBpZiBzdHVkZW50SWQgPT0gXCJ0ZXN0XCJcbiAgICAgICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IG9uU3R1ZGVudFJlYWR5KCBzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgICAgICAgc3R1ZGVudC5zYXZlIG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IG9uU3R1ZGVudFJlYWR5KCBzdHVkZW50LCBzdWJ0ZXN0KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgIG9uU3R1ZGVudFJlYWR5KHN0dWRlbnQsIHN1YnRlc3QpXG5cbiAgcmVnaXN0ZXI6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc1VucmVnaXN0ZXJlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBSZWdpc3RlclRlYWNoZXJWaWV3XG4gICAgICAgICAgdXNlciA6IG5ldyBVc2VyXG4gICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIHN0dWRlbnRFZGl0OiAoIHN0dWRlbnRJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBfaWQgOiBzdHVkZW50SWRcbiAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChtb2RlbCkgLT5cbiAgICAgICAgICAgIGFsbEtsYXNzZXMgPSBuZXcgS2xhc3Nlc1xuICAgICAgICAgICAgYWxsS2xhc3Nlcy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAoIGtsYXNzQ29sbGVjdGlvbiApLT5cbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFN0dWRlbnRFZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgc3R1ZGVudCA6IG1vZGVsXG4gICAgICAgICAgICAgICAgICBrbGFzc2VzIDoga2xhc3NDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICAjXG4gICMgQXNzZXNzbWVudFxuICAjXG5cblxuICBkYXRhRW50cnk6ICggYXNzZXNzbWVudElkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudCBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgcXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgIGtleTogXCJxXCIgKyBhc3Nlc3NtZW50SWRcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBxdWVzdGlvbnNCeVN1YnRlc3RJZCA9IHF1ZXN0aW9ucy5pbmRleEJ5KFwic3VidGVzdElkXCIpXG4gICAgICAgICAgICAgICAgZm9yIHN1YnRlc3RJZCwgcXVlc3Rpb25zIG9mIHF1ZXN0aW9uc0J5U3VidGVzdElkXG4gICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50LnN1YnRlc3RzLmdldChzdWJ0ZXN0SWQpLnF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMgcXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudERhdGFFbnRyeVZpZXcgYXNzZXNzbWVudDogYXNzZXNzbWVudFxuXG5cblxuICBzeW5jOiAoIGFzc2Vzc21lbnRJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnQgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHZtLnNob3cgbmV3IEFzc2Vzc21lbnRTeW5jVmlldyBcImFzc2Vzc21lbnRcIjogYXNzZXNzbWVudFxuXG4gIGltcG9ydDogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50SW1wb3J0Vmlld1xuICAgICAgICAgIG5vdW4gOlwiYXNzZXNzbWVudFwiXG4gICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGFzc2Vzc21lbnRzOiAtPlxuICAgICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgICBVdGlscy5sb2FkQ29sbGVjdGlvbnNcbiAgICAgICAgICAgIGNvbGxlY3Rpb25zOiBbXG4gICAgICAgICAgICAgIFwiS2xhc3Nlc1wiXG4gICAgICAgICAgICAgIFwiVGVhY2hlcnNcIlxuICAgICAgICAgICAgICBcIkN1cnJpY3VsYVwiXG4gICAgICAgICAgICAgIFwiQXNzZXNzbWVudHNcIlxuICAgICAgICAgICAgICBcIkxlc3NvblBsYW5zXCJcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIGNvbXBsZXRlOiAob3B0aW9ucykgLT5cbiAgICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudHNNZW51VmlldyBvcHRpb25zXG5cbiAgZWRpdElkOiAoaWQpIC0+XG4gICAgaWQgPSBVdGlscy5jbGVhblVSTCBpZFxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgX2lkOiBpZFxuICAgICAgICBhc3Nlc3NtZW50LnN1cGVyRmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogKCBtb2RlbCApIC0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRFZGl0VmlldyBtb2RlbDogbW9kZWxcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG5cbiAgZWRpdDogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGlkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogKCBtb2RlbCApIC0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRFZGl0VmlldyBtb2RlbDogbW9kZWxcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIHJlc3RhcnQ6IChuYW1lKSAtPlxuICAgIFRhbmdlcmluZS5yb3V0ZXIubmF2aWdhdGUgXCJydW4vI3tuYW1lfVwiLCB0cnVlXG5cbiMgIFdpZGdldFJ1blZpZXcgdGFrZXMgYSBsaXN0IG9mIHN1YnRlc3RzIGFuZCB0aGUgYXNzZXNzbWVudC5cbiAgcnVuOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGRLZXkgPSBKU09OLnN0cmluZ2lmeShpZC5zdWJzdHIoLTUsIDUpKVxuICAgICAgICB1cmwgPSBUYW5nZXJpbmUuc2V0dGluZ3MudXJsVmlldyhcImdyb3VwXCIsIFwiYnlES2V5XCIpXG4gICAgICAgICQuYWpheFxuICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgIHR5cGU6IFwiR0VUXCJcbiAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCJcbiAgICAgICAgICBkYXRhOiBrZXk6IGRLZXlcbiAgICAgICAgICBlcnJvcjogKGEsIGIpID0+IEB0cmlnZ2VyIFwic3RhdHVzXCIsIFwiaW1wb3J0IGVycm9yXCIsIFwiI3thfSAje2J9XCJcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICAgICAgIGRvY0xpc3QgPSBbXVxuICAgICAgICAgICAgZm9yIGRhdHVtIGluIGRhdGEucm93c1xuICAgICAgICAgICAgICBkb2NMaXN0LnB1c2ggZGF0dW0uaWRcbiAgICAgICAgICAgICAga2V5TGlzdCA9IF8udW5pcShkb2NMaXN0KVxuICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi5hbGxEb2NzXG4gICAgICAgICAgICAgIGtleXMgOiBrZXlMaXN0XG4gICAgICAgICAgICAgIGluY2x1ZGVfZG9jczp0cnVlXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXNwb25zZSkgLT5cbiAgICAgICAgICAgICAgICBkb2NzID0gW11cbiAgICAgICAgICAgICAgICBmb3Igcm93IGluIHJlc3BvbnNlLnJvd3NcbiAgICAgICAgICAgICAgICAgIGRvY3MucHVzaCByb3cuZG9jXG4jICAgICAgICAgICAgICAgIGJvZHkgPVxuIyAgICAgICAgICAgICAgICAgIGRvY3M6IGRvY3NcbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFdpZGdldFJ1blZpZXcgbW9kZWw6IGRvY3NcbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBwcmludDogKCBhc3Nlc3NtZW50SWQsIGZvcm1hdCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgIFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAoIG1vZGVsICkgLT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudFByaW50Vmlld1xuICAgICAgICAgICAgICBtb2RlbCAgOiBtb2RlbFxuICAgICAgICAgICAgICBmb3JtYXQgOiBmb3JtYXRcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHJlc3VtZTogKGFzc2Vzc21lbnRJZCwgcmVzdWx0SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgIFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAoIGFzc2Vzc21lbnQgKSAtPlxuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlc3VsdFxuICAgICAgICAgICAgICBcIl9pZFwiIDogcmVzdWx0SWRcbiAgICAgICAgICAgIHJlc3VsdC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzdWx0KSAtPlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudFJ1blZpZXdcbiAgICAgICAgICAgICAgICAgIG1vZGVsOiBhc3Nlc3NtZW50XG5cbiAgICAgICAgICAgICAgICBpZiByZXN1bHQuaGFzKFwib3JkZXJfbWFwXCIpXG4gICAgICAgICAgICAgICAgICAjIHNhdmUgdGhlIG9yZGVyIG1hcCBvZiBwcmV2aW91cyByYW5kb21pemF0aW9uXG4gICAgICAgICAgICAgICAgICBvcmRlck1hcCA9IHJlc3VsdC5nZXQoXCJvcmRlcl9tYXBcIikuc2xpY2UoKSAjIGNsb25lIGFycmF5XG4gICAgICAgICAgICAgICAgICAjIHJlc3RvcmUgdGhlIHByZXZpb3VzIG9yZGVybWFwXG4gICAgICAgICAgICAgICAgICB2aWV3Lm9yZGVyTWFwID0gb3JkZXJNYXBcblxuICAgICAgICAgICAgICAgIGZvciBzdWJ0ZXN0IGluIHJlc3VsdC5nZXQoXCJzdWJ0ZXN0RGF0YVwiKVxuICAgICAgICAgICAgICAgICAgaWYgc3VidGVzdC5kYXRhPyAmJiBzdWJ0ZXN0LmRhdGEucGFydGljaXBhbnRfaWQ/XG4gICAgICAgICAgICAgICAgICAgIFRhbmdlcmluZS5uYXYuc2V0U3R1ZGVudCBzdWJ0ZXN0LmRhdGEucGFydGljaXBhbnRfaWRcblxuICAgICAgICAgICAgICAgICMgcmVwbGFjZSB0aGUgdmlldydzIHJlc3VsdCB3aXRoIG91ciBvbGQgb25lXG4gICAgICAgICAgICAgICAgdmlldy5yZXN1bHQgPSByZXN1bHRcblxuICAgICAgICAgICAgICAgICMgSGlqYWNrIHRoZSBub3JtYWwgUmVzdWx0IGFuZCBSZXN1bHRWaWV3LCB1c2Ugb25lIGZyb20gdGhlIGRiXG4gICAgICAgICAgICAgICAgdmlldy5zdWJ0ZXN0Vmlld3MucG9wKClcbiAgICAgICAgICAgICAgICB2aWV3LnN1YnRlc3RWaWV3cy5wdXNoIG5ldyBSZXN1bHRWaWV3XG4gICAgICAgICAgICAgICAgICBtb2RlbCAgICAgICAgICA6IHJlc3VsdFxuICAgICAgICAgICAgICAgICAgYXNzZXNzbWVudCAgICAgOiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50VmlldyA6IHZpZXdcbiAgICAgICAgICAgICAgICB2aWV3LmluZGV4ID0gcmVzdWx0LmdldChcInN1YnRlc3REYXRhXCIpLmxlbmd0aFxuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cblxuICByZXN1bHRzOiAoYXNzZXNzbWVudElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhZnRlckZldGNoID0gKGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudChcIl9pZFwiOmFzc2Vzc21lbnRJZCksIGFzc2Vzc21lbnRJZCkgLT5cbiAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IFJlc3VsdHNcbiAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICBpbmNsdWRlX2RvY3M6IGZhbHNlXG4gICAgICAgICAgICBrZXk6IFwiclwiICsgYXNzZXNzbWVudElkXG4gICAgICAgICAgICBzdWNjZXNzOiAocmVzdWx0cykgPT5cbiAgICAgICAgICAgICAgdmlldyA9IG5ldyBSZXN1bHRzVmlld1xuICAgICAgICAgICAgICAgIFwiYXNzZXNzbWVudFwiIDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICAgIDogcmVzdWx0cy5tb2RlbHNcbiAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICAtPlxuICAgICAgICAgICAgYWZ0ZXJGZXRjaChhc3Nlc3NtZW50LCBhc3Nlc3NtZW50SWQpXG4gICAgICAgICAgZXJyb3IgOiAgLT5cbiAgICAgICAgICAgIGFmdGVyRmV0Y2goYXNzZXNzbWVudCwgYXNzZXNzbWVudElkKVxuXG5cbiAgI1xuICAjIFJlcG9ydHNcbiAgI1xuICBrbGFzc0dyb3VwaW5nOiAoa2xhc3NJZCwgcGFydCkgLT5cbiAgICBwYXJ0ID0gcGFyc2VJbnQocGFydClcbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiAoIGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyBjb2xsZWN0aW9uLndoZXJlIFwicGFydFwiIDogcGFydFxuICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKCByZXN1bHRzICkgLT5cbiAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIHJlc3VsdHMud2hlcmUgXCJrbGFzc0lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgICAgICAgICAgc3R1ZGVudHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cblxuICAgICAgICAgICAgICAgICAgICAgICMgZmlsdGVyIGBSZXN1bHRzYCBieSBgS2xhc3NgJ3MgY3VycmVudCBgU3R1ZGVudHNgXG4gICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgU3R1ZGVudHMgc3R1ZGVudHMud2hlcmUgXCJrbGFzc0lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudElkcyA9IHN0dWRlbnRzLnBsdWNrKFwiX2lkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMgPSBbXVxuICAgICAgICAgICAgICAgICAgICAgIGZvciByZXN1bHQgaW4gcmVzdWx0cy5tb2RlbHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzLnB1c2gocmVzdWx0KSBpZiByZXN1bHQuZ2V0KFwic3R1ZGVudElkXCIpIGluIHN0dWRlbnRJZHNcbiAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzXG5cbiAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzR3JvdXBpbmdWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRzXCIgOiBzdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IGZpbHRlcmVkUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIG1hc3RlcnlDaGVjazogKHN0dWRlbnRJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IFwiX2lkXCIgOiBzdHVkZW50SWRcbiAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChzdHVkZW50KSAtPlxuICAgICAgICAgICAga2xhc3NJZCA9IHN0dWRlbnQuZ2V0IFwia2xhc3NJZFwiXG4gICAgICAgICAgICBrbGFzcyA9IG5ldyBLbGFzcyBcIl9pZFwiIDogc3R1ZGVudC5nZXQgXCJrbGFzc0lkXCJcbiAgICAgICAgICAgIGtsYXNzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChrbGFzcykgLT5cbiAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggY29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIGNvbGxlY3Rpb24ud2hlcmUgXCJzdHVkZW50SWRcIiA6IHN0dWRlbnRJZCwgXCJyZXBvcnRUeXBlXCIgOiBcIm1hc3RlcnlcIiwgXCJrbGFzc0lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAgICAgICAgICAgICMgZ2V0IGEgbGlzdCBvZiBzdWJ0ZXN0cyBpbnZvbHZlZFxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0SWRMaXN0ID0ge31cbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdElkTGlzdFtyZXN1bHQuZ2V0KFwic3VidGVzdElkXCIpXSA9IHRydWUgZm9yIHJlc3VsdCBpbiByZXN1bHRzLm1vZGVsc1xuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0SWRMaXN0ID0gXy5rZXlzKHN1YnRlc3RJZExpc3QpXG5cbiAgICAgICAgICAgICAgICAgICAgIyBtYWtlIGEgY29sbGVjdGlvbiBhbmQgZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdENvbGxlY3Rpb24gPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdENvbGxlY3Rpb24uYWRkIG5ldyBTdWJ0ZXN0KFwiX2lkXCIgOiBzdWJ0ZXN0SWQpIGZvciBzdWJ0ZXN0SWQgaW4gc3VidGVzdElkTGlzdFxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0Q29sbGVjdGlvbi5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IE1hc3RlcnlDaGVja1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgOiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NcIiAgICA6IGtsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiA6IHN1YnRlc3RDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBwcm9ncmVzc1JlcG9ydDogKHN0dWRlbnRJZCwga2xhc3NJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgIyBzYXZlIHRoaXMgY3JhenkgZnVuY3Rpb24gZm9yIGxhdGVyXG4gICAgICAgICMgc3R1ZGVudElkIGNhbiBoYXZlIHRoZSB2YWx1ZSBcImFsbFwiLCBpbiB3aGljaCBjYXNlIHN0dWRlbnQgc2hvdWxkID09IG51bGxcbiAgICAgICAgYWZ0ZXJGZXRjaCA9ICggc3R1ZGVudCwgc3R1ZGVudHMgKSAtPlxuICAgICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIFwiX2lkXCIgOiBrbGFzc0lkXG4gICAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChrbGFzcykgLT5cbiAgICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGFsbFN1YnRlc3RzICkgLT5cbiAgICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzIGFsbFN1YnRlc3RzLndoZXJlXG4gICAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bUlkXCIgOiBrbGFzcy5nZXQoXCJjdXJyaWN1bHVtSWRcIilcbiAgICAgICAgICAgICAgICAgICAgXCJyZXBvcnRUeXBlXCIgICA6IFwicHJvZ3Jlc3NcIlxuICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCBjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyBjb2xsZWN0aW9uLndoZXJlIFwia2xhc3NJZFwiIDoga2xhc3NJZCwgXCJyZXBvcnRUeXBlXCIgOiBcInByb2dyZXNzXCJcblxuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nIHN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgaWYgc3R1ZGVudHM/XG4gICAgICAgICAgICAgICAgICAgICAgICAjIGZpbHRlciBgUmVzdWx0c2AgYnkgYEtsYXNzYCdzIGN1cnJlbnQgYFN0dWRlbnRzYFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudElkcyA9IHN0dWRlbnRzLnBsdWNrKFwiX2lkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50cyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgcmVzdWx0IGluIHJlc3VsdHMubW9kZWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzLnB1c2gocmVzdWx0KSBpZiByZXN1bHQuZ2V0KFwic3R1ZGVudElkXCIpIGluIHN0dWRlbnRJZHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzXG5cbiAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFByb2dyZXNzVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudFwiICA6IHN0dWRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NcIiAgICA6IGtsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgaWYgc3R1ZGVudElkICE9IFwiYWxsXCJcbiAgICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IGFmdGVyRmV0Y2ggc3R1ZGVudFxuICAgICAgICBlbHNlXG4gICAgICAgICAgc3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICAgICAgICBzdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogLT4gYWZ0ZXJGZXRjaCBudWxsLCBzdHVkZW50c1xuXG4gICNcbiAgIyBTdWJ0ZXN0c1xuICAjXG4gIGVkaXRTdWJ0ZXN0OiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBfaWQgOiBpZFxuICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKG1vZGVsLCByZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgICAgICBcIl9pZFwiIDogc3VidGVzdC5nZXQoXCJhc3Nlc3NtZW50SWRcIilcbiAgICAgICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFN1YnRlc3RFZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgbW9kZWwgICAgICA6IG1vZGVsXG4gICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50IDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIGVkaXRLbGFzc1N1YnRlc3Q6IChpZCkgLT5cblxuICAgIG9uU3VjY2VzcyA9IChzdWJ0ZXN0LCBjdXJyaWN1bHVtLCBxdWVzdGlvbnM9bnVsbCkgLT5cbiAgICAgIHZpZXcgPSBuZXcgS2xhc3NTdWJ0ZXN0RWRpdFZpZXdcbiAgICAgICAgbW9kZWwgICAgICA6IHN1YnRlc3RcbiAgICAgICAgY3VycmljdWx1bSA6IGN1cnJpY3VsdW1cbiAgICAgICAgcXVlc3Rpb25zICA6IHF1ZXN0aW9uc1xuICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IF9pZCA6IGlkXG4gICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtXG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBzdWJ0ZXN0LmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QuZ2V0KFwicHJvdG90eXBlXCIpID09IFwic3VydmV5XCJcbiAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICBrZXkgOiBjdXJyaWN1bHVtLmlkXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyBxdWVzdGlvbnMud2hlcmUoXCJzdWJ0ZXN0SWRcIjpzdWJ0ZXN0LmlkKVxuICAgICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyBzdWJ0ZXN0LCBjdXJyaWN1bHVtLCBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Mgc3VidGVzdCwgY3VycmljdWx1bVxuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG5cbiAgI1xuICAjIFF1ZXN0aW9uXG4gICNcbiAgZWRpdFF1ZXN0aW9uOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHF1ZXN0aW9uID0gbmV3IFF1ZXN0aW9uIF9pZCA6IGlkXG4gICAgICAgIHF1ZXN0aW9uLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKHF1ZXN0aW9uLCByZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwiYXNzZXNzbWVudElkXCIpXG4gICAgICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwic3VidGVzdElkXCIpXG4gICAgICAgICAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBRdWVzdGlvbkVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvblwiICAgOiBxdWVzdGlvblxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICAgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgIFwiYXNzZXNzbWVudFwiIDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuXG4gIGVkaXRLbGFzc1F1ZXN0aW9uOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHF1ZXN0aW9uID0gbmV3IFF1ZXN0aW9uIFwiX2lkXCIgOiBpZFxuICAgICAgICBxdWVzdGlvbi5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChxdWVzdGlvbiwgcmVzcG9uc2UpIC0+XG4gICAgICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHF1ZXN0aW9uLmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdFxuICAgICAgICAgICAgICAgICAgXCJfaWRcIiA6IHF1ZXN0aW9uLmdldChcInN1YnRlc3RJZFwiKVxuICAgICAgICAgICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgUXVlc3Rpb25FZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwicXVlc3Rpb25cIiAgIDogcXVlc3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RcIiAgICA6IHN1YnRlc3RcbiAgICAgICAgICAgICAgICAgICAgICBcImFzc2Vzc21lbnRcIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICAjXG4gICMgVXNlclxuICAjXG4gIGxvZ2luOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuICAgICAgaXNVbnJlZ2lzdGVyZWQ6IC0+XG5cbiAgICAgICAgc2hvd1ZpZXcgPSAodXNlcnMgPSBbXSkgLT5cbiAgICAgICAgICB2aWV3ID0gbmV3IExvZ2luVmlld1xuICAgICAgICAgICAgdXNlcnM6IHVzZXJzXG4gICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgc2hvd1ZpZXcoKVxuXG4gIGxvZ291dDogLT5cbiAgICBUYW5nZXJpbmUudXNlci5sb2dvdXQoKVxuXG4gIGFjY291bnQ6IC0+XG4gICAgIyBjaGFuZ2UgdGhlIGxvY2F0aW9uIHRvIHRoZSB0cnVuaywgdW5sZXNzIHdlJ3JlIGFscmVhZHkgaW4gdGhlIHRydW5rXG4gICAgaWYgVGFuZ2VyaW5lLmRiX25hbWUgIT0gXCJ0YW5nZXJpbmVcIlxuICAgICAgd2luZG93LmxvY2F0aW9uID0gVGFuZ2VyaW5lLnNldHRpbmdzLnVybEluZGV4KFwidHJ1bmtcIiwgXCJhY2NvdW50XCIpXG4gICAgZWxzZVxuICAgICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgICB2aWV3ID0gbmV3IEFjY291bnRWaWV3XG4gICAgICAgICAgICB1c2VyIDogVGFuZ2VyaW5lLnVzZXJcbiAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBzZXR0aW5nczogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBTZXR0aW5nc1ZpZXdcbiAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICBsb2dzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBsb2dzID0gbmV3IExvZ3NcbiAgICAgICAgbG9ncy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IExvZ1ZpZXdcbiAgICAgICAgICAgICAgbG9nczogbG9nc1xuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuXG5cbiAgIyBUcmFuc2ZlciBhIG5ldyB1c2VyIGZyb20gdGFuZ2VyaW5lLWNlbnRyYWwgaW50byB0YW5nZXJpbmVcbiAgdHJhbnNmZXI6IC0+XG4gICAgZ2V0VmFycyA9IFV0aWxzLiRfR0VUKClcbiAgICBuYW1lID0gZ2V0VmFycy5uYW1lXG4gICAgJC5jb3VjaC5sb2dvdXRcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICQuY29va2llIFwiQXV0aFNlc3Npb25cIiwgbnVsbFxuICAgICAgICAkLmNvdWNoLmxvZ2luXG4gICAgICAgICAgXCJuYW1lXCIgICAgIDogbmFtZVxuICAgICAgICAgIFwicGFzc3dvcmRcIiA6IG5hbWVcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgJC5jb3VjaC5zaWdudXBcbiAgICAgICAgICAgICAgXCJuYW1lXCIgOiAgbmFtZVxuICAgICAgICAgICAgICBcInJvbGVzXCIgOiBbXCJfYWRtaW5cIl1cbiAgICAgICAgICAgICwgbmFtZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgIHVzZXIgPSBuZXcgVXNlclxuICAgICAgICAgICAgICB1c2VyLnNhdmVcbiAgICAgICAgICAgICAgICBcIm5hbWVcIiAgOiBuYW1lXG4gICAgICAgICAgICAgICAgXCJpZFwiICAgIDogXCJ0YW5nZXJpbmUudXNlcjpcIituYW1lXG4gICAgICAgICAgICAgICAgXCJyb2xlc1wiIDogW11cbiAgICAgICAgICAgICAgICBcImZyb21cIiAgOiBcInRjXCJcbiAgICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIHdhaXQ6IHRydWVcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgJC5jb3VjaC5sb2dpblxuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIiAgICAgOiBuYW1lXG4gICAgICAgICAgICAgICAgICAgIFwicGFzc3dvcmRcIiA6IG5hbWVcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyA6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgVXRpbHMuc3RpY2t5IFwiRXJyb3IgdHJhbnNmZXJpbmcgdXNlci5cIlxuIl19
