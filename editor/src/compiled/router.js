var Router,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice,
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
    'lesson/:subject/:grade/:week/:day': 'lesson',
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

  Router.prototype.lesson = function() {
    var day, grade, lesson, options, subject, week;
    options = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    console.log("lesson route");
    subject = options[0];
    grade = options[1];
    week = options[2];
    day = options[3];
    subject = Tangerine["enum"].iSubjects[subject];
    lesson = new Lesson;
    return lesson.fetch(subject, grade, week, day, (function(_this) {
      return function() {
        var id;
        console.log("got the lesson. TBD - now run runMar");
        id = lesson.get(id);
        return _this.run(id);
      };
    })(this));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9yb3V0ZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUEsTUFBQTtFQUFBOzs7OztBQUFNOzs7Ozs7O21CQU9KLE9BQUEsR0FBUyxTQUFDLFFBQUQsRUFBVyxJQUFYLEVBQWlCLElBQWpCO0lBQ1AsQ0FBQSxDQUFFLFNBQUYsQ0FBWSxDQUFDLElBQWIsQ0FBQTtJQUNBLElBQUksUUFBSjthQUNFLFFBQVEsQ0FBQyxLQUFULENBQWUsSUFBZixFQUFxQixJQUFyQixFQURGOztFQUZPOzttQkFLVCxNQUFBLEdBQ0U7SUFBQSxPQUFBLEVBQWEsT0FBYjtJQUNBLFVBQUEsRUFBYSxVQURiO0lBRUEsUUFBQSxFQUFhLFFBRmI7SUFHQSxTQUFBLEVBQWEsU0FIYjtJQUtBLFVBQUEsRUFBYSxVQUxiO0lBT0EsVUFBQSxFQUFhLFVBUGI7SUFRQSxRQUFBLEVBQVcsUUFSWDtJQVVBLEVBQUEsRUFBSyxTQVZMO0lBWUEsTUFBQSxFQUFTLE1BWlQ7SUFlQSxPQUFBLEVBQW1CLE9BZm5CO0lBZ0JBLGdCQUFBLEVBQW1CLFdBaEJuQjtJQWlCQSwwQkFBQSxFQUFvQyxhQWpCcEM7SUFrQkEsaUNBQUEsRUFBb0MsZUFsQnBDO0lBbUJBLG1CQUFBLEVBQXNCLGtCQW5CdEI7SUFvQkEsb0JBQUEsRUFBdUIsbUJBcEJ2QjtJQXNCQSxpQkFBQSxFQUFvQixhQXRCcEI7SUF1QkEsV0FBQSxFQUFvQixhQXZCcEI7SUF5QkEsaUNBQUEsRUFBb0MsWUF6QnBDO0lBMkJBLG9EQUFBLEVBQXVELGdCQTNCdkQ7SUE2QkEsV0FBQSxFQUFzQixXQTdCdEI7SUE4QkEsZ0JBQUEsRUFBc0IsWUE5QnRCO0lBK0JBLGtCQUFBLEVBQXNCLGtCQS9CdEI7SUFpQ0EscUNBQUEsRUFBd0MsZUFqQ3hDO0lBa0NBLGdDQUFBLEVBQXdDLGNBbEN4QztJQW1DQSxxQ0FBQSxFQUF3QyxnQkFuQ3hDO0lBdUNBLFFBQUEsRUFBVyxRQXZDWDtJQXlDQSxhQUFBLEVBQXVCLGFBekN2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QUssQ0FBQyxNQUFOLENBQWEseUJBQWI7d0JBREssQ0FMUDt1QkFERjtvQkFETyxDQURUO21CQU5GO2dCQUZPLENBQVQ7ZUFKQTtZQURLLENBTFA7V0FERjtRQUZPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO0tBREY7RUFIUTs7OztHQXAxQlMsUUFBUSxDQUFDIiwiZmlsZSI6ImFwcC9yb3V0ZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSb3V0ZXIgZXh0ZW5kcyBCYWNrYm9uZS5Sb3V0ZXJcbiMgIGJlZm9yZTogKCkgLT5cbiMgICAgY29uc29sZS5sb2coJ2JlZm9yZScpXG4jICAgICQoJyNmb290ZXInKS5zaG93KClcbiNcbiMgIGFmdGVyOiAoKSAtPlxuIyAgICBjb25zb2xlLmxvZygnYWZ0ZXInKTtcbiAgZXhlY3V0ZTogKGNhbGxiYWNrLCBhcmdzLCBuYW1lKSAtPlxuICAgICQoJyNmb290ZXInKS5zaG93KClcbiAgICBpZiAoY2FsbGJhY2spXG4gICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmdzKVxuXG4gIHJvdXRlczpcbiAgICAnbG9naW4nICAgIDogJ2xvZ2luJ1xuICAgICdyZWdpc3RlcicgOiAncmVnaXN0ZXInXG4gICAgJ2xvZ291dCcgICA6ICdsb2dvdXQnXG4gICAgJ2FjY291bnQnICA6ICdhY2NvdW50J1xuXG4gICAgJ3RyYW5zZmVyJyA6ICd0cmFuc2ZlcidcblxuICAgICdzZXR0aW5ncycgOiAnc2V0dGluZ3MnXG4gICAgJ3VwZGF0ZScgOiAndXBkYXRlJ1xuXG4gICAgJycgOiAnbGFuZGluZydcblxuICAgICdsb2dzJyA6ICdsb2dzJ1xuXG4gICAgIyBDbGFzc1xuICAgICdjbGFzcycgICAgICAgICAgOiAna2xhc3MnXG4gICAgJ2NsYXNzL2VkaXQvOmlkJyA6ICdrbGFzc0VkaXQnXG4gICAgJ2NsYXNzL3N0dWRlbnQvOnN0dWRlbnRJZCcgICAgICAgIDogJ3N0dWRlbnRFZGl0J1xuICAgICdjbGFzcy9zdHVkZW50L3JlcG9ydC86c3R1ZGVudElkJyA6ICdzdHVkZW50UmVwb3J0J1xuICAgICdjbGFzcy9zdWJ0ZXN0LzppZCcgOiAnZWRpdEtsYXNzU3VidGVzdCdcbiAgICAnY2xhc3MvcXVlc3Rpb24vOmlkJyA6IFwiZWRpdEtsYXNzUXVlc3Rpb25cIlxuXG4gICAgJ2NsYXNzLzppZC86cGFydCcgOiAna2xhc3NQYXJ0bHknXG4gICAgJ2NsYXNzLzppZCcgICAgICAgOiAna2xhc3NQYXJ0bHknXG5cbiAgICAnY2xhc3MvcnVuLzpzdHVkZW50SWQvOnN1YnRlc3RJZCcgOiAncnVuU3VidGVzdCdcblxuICAgICdjbGFzcy9yZXN1bHQvc3R1ZGVudC9zdWJ0ZXN0LzpzdHVkZW50SWQvOnN1YnRlc3RJZCcgOiAnc3R1ZGVudFN1YnRlc3QnXG5cbiAgICAnY3VycmljdWxhJyAgICAgICAgIDogJ2N1cnJpY3VsYSdcbiAgICAnY3VycmljdWx1bS86aWQnICAgIDogJ2N1cnJpY3VsdW0nXG4gICAgJ2N1cnJpY3VsdW1JbXBvcnQnICA6ICdjdXJyaWN1bHVtSW1wb3J0J1xuXG4gICAgJ3JlcG9ydC9rbGFzc0dyb3VwaW5nLzprbGFzc0lkLzpwYXJ0JyA6ICdrbGFzc0dyb3VwaW5nJ1xuICAgICdyZXBvcnQvbWFzdGVyeUNoZWNrLzpzdHVkZW50SWQnICAgICAgOiAnbWFzdGVyeUNoZWNrJ1xuICAgICdyZXBvcnQvcHJvZ3Jlc3MvOnN0dWRlbnRJZC86a2xhc3NJZCcgOiAncHJvZ3Jlc3NSZXBvcnQnXG5cblxuICAgICMgc2VydmVyIC8gbW9iaWxlXG4gICAgJ2dyb3VwcycgOiAnZ3JvdXBzJ1xuXG4gICAgJ2Fzc2Vzc21lbnRzJyAgICAgICAgOiAnYXNzZXNzbWVudHMnXG5cbiAgICAncnVuLzppZCcgICAgICAgOiAncnVuJ1xuICAgICdsZXNzb24vOnN1YmplY3QvOmdyYWRlLzp3ZWVrLzpkYXknIDogJ2xlc3NvbidcblxuICAgICdwcmludC86aWQvOmZvcm1hdCcgICAgICAgOiAncHJpbnQnXG4gICAgJ2RhdGFFbnRyeS86aWQnIDogJ2RhdGFFbnRyeSdcblxuICAgICdyZXN1bWUvOmFzc2Vzc21lbnRJZC86cmVzdWx0SWQnICAgIDogJ3Jlc3VtZSdcblxuICAgICdyZXN0YXJ0LzppZCcgICA6ICdyZXN0YXJ0J1xuICAgICdlZGl0LzppZCcgICAgICA6ICdlZGl0J1xuICAgICdlZGl0TFAvOmlkJyAgICAgIDogJ2VkaXRMUCdcbiAgICAncmVzdWx0cy86aWQnICAgOiAncmVzdWx0cydcbiAgICAnaW1wb3J0JyAgICAgICAgOiAnaW1wb3J0J1xuXG4gICAgJ3N1YnRlc3QvOmlkJyAgICAgICA6ICdlZGl0U3VidGVzdCdcbiAgICAnZWxlbWVudC86aWQnICAgICAgIDogJ2VkaXRFbGVtZW50J1xuXG4gICAgJ3F1ZXN0aW9uLzppZCcgOiAnZWRpdFF1ZXN0aW9uJ1xuICAgICdkYXNoYm9hcmQnIDogJ2Rhc2hib2FyZCdcbiAgICAnZGFzaGJvYXJkLypvcHRpb25zJyA6ICdkYXNoYm9hcmQnXG4gICAgJ2FkbWluJyA6ICdhZG1pbidcblxuICAgICdzeW5jLzppZCcgICAgICA6ICdzeW5jJ1xuXG5cbiAgYWRtaW46IChvcHRpb25zKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgJC5jb3VjaC5hbGxEYnNcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YWJhc2VzKSA9PlxuICAgICAgICAgICAgZ3JvdXBzID0gZGF0YWJhc2VzLmZpbHRlciAoZGF0YWJhc2UpIC0+IGRhdGFiYXNlLmluZGV4T2YoXCJncm91cC1cIikgPT0gMFxuICAgICAgICAgICAgdmlldyA9IG5ldyBBZG1pblZpZXdcbiAgICAgICAgICAgICAgZ3JvdXBzIDogZ3JvdXBzXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBkYXNoYm9hcmQ6IChvcHRpb25zKSAtPlxuICAgIG9wdGlvbnMgPSBvcHRpb25zPy5zcGxpdCgvXFwvLylcbiAgICBjb25zb2xlLmxvZyhcIm9wdGlvbnM6IFwiICsgb3B0aW9ucylcbiAgICAjZGVmYXVsdCB2aWV3IG9wdGlvbnNcbiAgICByZXBvcnRWaWV3T3B0aW9ucyA9XG4gICAgICBhc3Nlc3NtZW50OiBcIkFsbFwiXG4gICAgICBncm91cEJ5OiBcImVudW1lcmF0b3JcIlxuXG4gICAgIyBBbGxvd3MgdXMgdG8gZ2V0IG5hbWUvdmFsdWUgcGFpcnMgZnJvbSBVUkxcbiAgICBfLmVhY2ggb3B0aW9ucywgKG9wdGlvbixpbmRleCkgLT5cbiAgICAgIHVubGVzcyBpbmRleCAlIDJcbiAgICAgICAgcmVwb3J0Vmlld09wdGlvbnNbb3B0aW9uXSA9IG9wdGlvbnNbaW5kZXgrMV1cblxuICAgIHZpZXcgPSBuZXcgRGFzaGJvYXJkVmlldyAgcmVwb3J0Vmlld09wdGlvbnNcblxuICAgIHZtLnNob3cgdmlld1xuXG4gIGxhbmRpbmc6IC0+XG5cbiAgICBpZiB+U3RyaW5nKHdpbmRvdy5sb2NhdGlvbi5ocmVmKS5pbmRleE9mKFwiYXBwL3RhbmdlcmluZVwiKSAjIGluIG1haW4gZ3JvdXA/XG4gICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiZ3JvdXBzXCIsIHRydWVcbiAgICBlbHNlXG4gICAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwiYXNzZXNzbWVudHNcIiwgdHJ1ZVxuXG5cbiAgZ3JvdXBzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IEdyb3Vwc1ZpZXdcbiAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgI1xuICAjIENsYXNzXG4gICNcbiAgY3VycmljdWxhOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBjdXJyaWN1bGEgPSBuZXcgQ3VycmljdWxhXG4gICAgICAgIGN1cnJpY3VsYS5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgdmlldyA9IG5ldyBDdXJyaWN1bGFWaWV3XG4gICAgICAgICAgICAgIFwiY3VycmljdWxhXCIgOiBjb2xsZWN0aW9uXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBjdXJyaWN1bHVtOiAoY3VycmljdWx1bUlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW0gXCJfaWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzIGFsbFN1YnRlc3RzLndoZXJlIFwiY3VycmljdWx1bUlkXCIgOiBjdXJyaWN1bHVtSWRcbiAgICAgICAgICAgICAgICBhbGxRdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgYWxsUXVlc3Rpb25zLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBbXVxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0cy5lYWNoIChzdWJ0ZXN0KSAtPiBxdWVzdGlvbnMgPSBxdWVzdGlvbnMuY29uY2F0KGFsbFF1ZXN0aW9ucy53aGVyZSBcInN1YnRlc3RJZFwiIDogc3VidGVzdC5pZCApXG4gICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMgcXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgQ3VycmljdWx1bVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBcImN1cnJpY3VsdW1cIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgICA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvbnNcIiAgOiBxdWVzdGlvbnNcblxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIGN1cnJpY3VsdW1FZGl0OiAoY3VycmljdWx1bUlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW0gXCJfaWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICBjdXJyaWN1bHVtLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3RzID0gYWxsU3VidGVzdHMud2hlcmUgXCJjdXJyaWN1bHVtSWRcIiA6IGN1cnJpY3VsdW1JZFxuICAgICAgICAgICAgICAgIGFsbFBhcnRzID0gKHN1YnRlc3QuZ2V0KFwicGFydFwiKSBmb3Igc3VidGVzdCBpbiBzdWJ0ZXN0cylcbiAgICAgICAgICAgICAgICBwYXJ0Q291bnQgPSBNYXRoLm1heC5hcHBseSBNYXRoLCBhbGxQYXJ0c1xuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgQ3VycmljdWx1bVZpZXdcbiAgICAgICAgICAgICAgICAgIFwiY3VycmljdWx1bVwiIDogY3VycmljdWx1bVxuICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgIFwicGFydHNcIiA6IHBhcnRDb3VudFxuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgY3VycmljdWx1bUltcG9ydDogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50SW1wb3J0Vmlld1xuICAgICAgICAgIG5vdW4gOiBcImN1cnJpY3VsdW1cIlxuICAgICAgICB2bS5zaG93IHZpZXdcblxuICBrbGFzczogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYWxsS2xhc3NlcyA9IG5ldyBLbGFzc2VzXG4gICAgICAgIGFsbEtsYXNzZXMuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAoIGtsYXNzQ29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBUZWFjaGVyc1xuICAgICAgICAgICAgdGVhY2hlcnMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBhbGxDdXJyaWN1bGEgPSBuZXcgQ3VycmljdWxhXG4gICAgICAgICAgICAgICAgYWxsQ3VycmljdWxhLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGN1cnJpY3VsYUNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgVGFuZ2VyaW5lLnVzZXIuaXNBZG1pbigpXG4gICAgICAgICAgICAgICAgICAgICAga2xhc3NDb2xsZWN0aW9uID0gbmV3IEtsYXNzZXMga2xhc3NDb2xsZWN0aW9uLndoZXJlKFwidGVhY2hlcklkXCIgOiBUYW5nZXJpbmUudXNlci5nZXQoXCJ0ZWFjaGVySWRcIikpXG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3Nlc1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBrbGFzc2VzICAgOiBrbGFzc0NvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICBjdXJyaWN1bGEgOiBjdXJyaWN1bGFDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgdGVhY2hlcnMgIDogdGVhY2hlcnNcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAga2xhc3NFZGl0OiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIF9pZCA6IGlkXG4gICAgICAgIGtsYXNzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKCBtb2RlbCApIC0+XG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBUZWFjaGVyc1xuICAgICAgICAgICAgdGVhY2hlcnMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBhbGxTdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoYWxsU3R1ZGVudHMpIC0+XG4gICAgICAgICAgICAgICAgICAgIGtsYXNzU3R1ZGVudHMgPSBuZXcgU3R1ZGVudHMgYWxsU3R1ZGVudHMud2hlcmUge2tsYXNzSWQgOiBpZH1cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc0VkaXRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAga2xhc3MgICAgICAgOiBtb2RlbFxuICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzICAgIDoga2xhc3NTdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzIDogYWxsU3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICB0ZWFjaGVycyAgICA6IHRlYWNoZXJzXG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGtsYXNzUGFydGx5OiAoa2xhc3NJZCwgcGFydD1udWxsKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBrbGFzcyA9IG5ldyBLbGFzcyBcIl9pZFwiIDoga2xhc3NJZFxuICAgICAgICBrbGFzcy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW0gXCJfaWRcIiA6IGtsYXNzLmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50cyAoIGNvbGxlY3Rpb24ud2hlcmUoIFwia2xhc3NJZFwiIDoga2xhc3NJZCApIClcblxuICAgICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyAoIGNvbGxlY3Rpb24ud2hlcmUoIFwia2xhc3NJZFwiIDoga2xhc3NJZCApIClcblxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyAoIGNvbGxlY3Rpb24ud2hlcmUoIFwiY3VycmljdWx1bUlkXCIgOiBrbGFzcy5nZXQoXCJjdXJyaWN1bHVtSWRcIikgKSApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc1BhcnRseVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFydFwiICAgICAgIDogcGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiICAgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgICAgOiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRzXCIgICA6IHN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImN1cnJpY3VsdW1cIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2xhc3NcIiAgICAgIDoga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIHN0dWRlbnRTdWJ0ZXN0OiAoc3R1ZGVudElkLCBzdWJ0ZXN0SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBcIl9pZFwiIDogc3R1ZGVudElkXG4gICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IFwiX2lkXCIgOiBzdWJ0ZXN0SWRcbiAgICAgICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBUYW5nZXJpbmUuJGRiLnZpZXcgXCIje1RhbmdlcmluZS5kZXNpZ25fZG9jfS9yZXN1bHRzQnlTdHVkZW50U3VidGVzdFwiLFxuICAgICAgICAgICAgICAgICAga2V5IDogW3N0dWRlbnRJZCxzdWJ0ZXN0SWRdXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+XG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBjb2xsZWN0aW9uLndoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdElkXCIgOiBzdWJ0ZXN0SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50SWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcImtsYXNzSWRcIiAgIDogc3R1ZGVudC5nZXQoXCJrbGFzc0lkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzU3VidGVzdFJlc3VsdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGxSZXN1bHRzXCIgOiBhbGxSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0XCIgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwicHJldmlvdXNcIiA6IHJlc3BvbnNlLnJvd3MubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBydW5TdWJ0ZXN0OiAoc3R1ZGVudElkLCBzdWJ0ZXN0SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBcIl9pZFwiIDogc3VidGVzdElkXG4gICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IFwiX2lkXCIgOiBzdHVkZW50SWRcblxuICAgICAgICAgICAgIyB0aGlzIGZ1bmN0aW9uIGZvciBsYXRlciwgcmVhbCBjb2RlIGJlbG93XG4gICAgICAgICAgICBvblN0dWRlbnRSZWFkeSA9IChzdHVkZW50LCBzdWJ0ZXN0KSAtPlxuICAgICAgICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cblxuICAgICAgICAgICAgICAgICAgIyB0aGlzIGZ1bmN0aW9uIGZvciBsYXRlciwgcmVhbCBjb2RlIGJlbG93XG4gICAgICAgICAgICAgICAgICBvblN1Y2Nlc3MgPSAoc3R1ZGVudCwgc3VidGVzdCwgcXVlc3Rpb249bnVsbCwgbGlua2VkUmVzdWx0PXt9KSAtPlxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzU3VidGVzdFJ1blZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgICAgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICAgICAgOiBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvbnNcIiAgICA6IHF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgIFwibGlua2VkUmVzdWx0XCIgOiBsaW5rZWRSZXN1bHRcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG51bGxcbiAgICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QuZ2V0KFwicHJvdG90eXBlXCIpID09IFwic3VydmV5XCJcbiAgICAgICAgICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi52aWV3IFwiI3tUYW5nZXJpbmUuZGVzaWduX2RvY30vcmVzdWx0c0J5U3R1ZGVudFN1YnRlc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICBrZXkgOiBbc3R1ZGVudElkLHN1YnRlc3QuZ2V0KFwiZ3JpZExpbmtJZFwiKV1cbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiByZXNwb25zZS5yb3dzICE9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua2VkUmVzdWx0ID0gbmV3IEtsYXNzUmVzdWx0IF8ubGFzdChyZXNwb25zZS5yb3dzKT8udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IFwicVwiICsgc3VidGVzdC5nZXQoXCJjdXJyaWN1bHVtSWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zKHF1ZXN0aW9ucy53aGVyZSB7c3VidGVzdElkIDogc3VidGVzdElkIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzKHN0dWRlbnQsIHN1YnRlc3QsIHF1ZXN0aW9ucywgbGlua2VkUmVzdWx0KVxuICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Moc3R1ZGVudCwgc3VidGVzdClcbiAgICAgICAgICAgICAgIyBlbmQgb2Ygb25TdHVkZW50UmVhZHlcblxuICAgICAgICAgICAgaWYgc3R1ZGVudElkID09IFwidGVzdFwiXG4gICAgICAgICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPiBvblN0dWRlbnRSZWFkeSggc3R1ZGVudCwgc3VidGVzdClcbiAgICAgICAgICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICAgICAgICAgIHN0dWRlbnQuc2F2ZSBudWxsLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPiBvblN0dWRlbnRSZWFkeSggc3R1ZGVudCwgc3VidGVzdClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICBvblN0dWRlbnRSZWFkeShzdHVkZW50LCBzdWJ0ZXN0KVxuXG4gIHJlZ2lzdGVyOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNVbnJlZ2lzdGVyZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgUmVnaXN0ZXJUZWFjaGVyVmlld1xuICAgICAgICAgIHVzZXIgOiBuZXcgVXNlclxuICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuICBzdHVkZW50RWRpdDogKCBzdHVkZW50SWQgKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgX2lkIDogc3R1ZGVudElkXG4gICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAobW9kZWwpIC0+XG4gICAgICAgICAgICBhbGxLbGFzc2VzID0gbmV3IEtsYXNzZXNcbiAgICAgICAgICAgIGFsbEtsYXNzZXMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogKCBrbGFzc0NvbGxlY3Rpb24gKS0+XG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBTdHVkZW50RWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgIHN0dWRlbnQgOiBtb2RlbFxuICAgICAgICAgICAgICAgICAga2xhc3NlcyA6IGtsYXNzQ29sbGVjdGlvblxuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgI1xuICAjIEFzc2Vzc21lbnRcbiAgI1xuXG5cbiAgZGF0YUVudHJ5OiAoIGFzc2Vzc21lbnRJZCApIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnQgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICBrZXk6IFwicVwiICsgYXNzZXNzbWVudElkXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgcXVlc3Rpb25zQnlTdWJ0ZXN0SWQgPSBxdWVzdGlvbnMuaW5kZXhCeShcInN1YnRlc3RJZFwiKVxuICAgICAgICAgICAgICAgIGZvciBzdWJ0ZXN0SWQsIHF1ZXN0aW9ucyBvZiBxdWVzdGlvbnNCeVN1YnRlc3RJZFxuICAgICAgICAgICAgICAgICAgYXNzZXNzbWVudC5zdWJ0ZXN0cy5nZXQoc3VidGVzdElkKS5xdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zIHF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgIHZtLnNob3cgbmV3IEFzc2Vzc21lbnREYXRhRW50cnlWaWV3IGFzc2Vzc21lbnQ6IGFzc2Vzc21lbnRcblxuXG5cbiAgc3luYzogKCBhc3Nlc3NtZW50SWQgKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50IFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICB2bS5zaG93IG5ldyBBc3Nlc3NtZW50U3luY1ZpZXcgXCJhc3Nlc3NtZW50XCI6IGFzc2Vzc21lbnRcblxuICBpbXBvcnQ6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudEltcG9ydFZpZXdcbiAgICAgICAgICBub3VuIDpcImFzc2Vzc21lbnRcIlxuICAgICAgICB2bS5zaG93IHZpZXdcblxuICBhc3Nlc3NtZW50czogLT5cbiAgICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgICAgVXRpbHMubG9hZENvbGxlY3Rpb25zXG4gICAgICAgICAgICBjb2xsZWN0aW9uczogW1xuICAgICAgICAgICAgICBcIktsYXNzZXNcIlxuICAgICAgICAgICAgICBcIlRlYWNoZXJzXCJcbiAgICAgICAgICAgICAgXCJDdXJyaWN1bGFcIlxuICAgICAgICAgICAgICBcIkFzc2Vzc21lbnRzXCJcbiAgICAgICAgICAgICAgXCJMZXNzb25QbGFuc1wiXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBjb21wbGV0ZTogKG9wdGlvbnMpIC0+XG4gICAgICAgICAgICAgIHZtLnNob3cgbmV3IEFzc2Vzc21lbnRzTWVudVZpZXcgb3B0aW9uc1xuXG4gIGVkaXRJZDogKGlkKSAtPlxuICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgIF9pZDogaWRcbiAgICAgICAgYXNzZXNzbWVudC5zdXBlckZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICggbW9kZWwgKSAtPlxuICAgICAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50RWRpdFZpZXcgbW9kZWw6IG1vZGVsXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuXG4gIGVkaXQ6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgIFwiX2lkXCIgOiBpZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICggbW9kZWwgKSAtPlxuICAgICAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50RWRpdFZpZXcgbW9kZWw6IG1vZGVsXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuICBlZGl0TFA6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGxlc3NvblBsYW4gPSBuZXcgTGVzc29uUGxhblxuICAgICAgICAgIFwiX2lkXCIgOiBpZFxuICAgICAgICBsZXNzb25QbGFuLmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICggbW9kZWwgKSAtPlxuICAgICAgICAgICAgdmlldyA9IG5ldyBMZXNzb25QbGFuRWRpdFZpZXcgbW9kZWw6IG1vZGVsXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuICByZXN0YXJ0OiAobmFtZSkgLT5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwicnVuLyN7bmFtZX1cIiwgdHJ1ZVxuXG4jICBXaWRnZXRSdW5WaWV3IHRha2VzIGEgbGlzdCBvZiBzdWJ0ZXN0cyBhbmQgdGhlIGFzc2Vzc21lbnQuXG4gIHJ1bjogKGlkLCBrbGFzcykgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgZEtleSA9IEpTT04uc3RyaW5naWZ5KGlkLnN1YnN0cigtNSwgNSkpXG4gICAgICAgIHVybCA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxWaWV3KFwiZ3JvdXBcIiwgXCJieURLZXlcIilcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgdHlwZTogXCJHRVRcIlxuICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIlxuICAgICAgICAgIGRhdGE6IGtleTogZEtleVxuICAgICAgICAgIGVycm9yOiAoYSwgYikgPT4gQHRyaWdnZXIgXCJzdGF0dXNcIiwgXCJpbXBvcnQgZXJyb3JcIiwgXCIje2F9ICN7Yn1cIlxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgICAgICAgZG9jTGlzdCA9IFtdXG4gICAgICAgICAgICBmb3IgZGF0dW0gaW4gZGF0YS5yb3dzXG4gICAgICAgICAgICAgIGRvY0xpc3QucHVzaCBkYXR1bS5pZFxuICAgICAgICAgICAgICBrZXlMaXN0ID0gXy51bmlxKGRvY0xpc3QpXG4gICAgICAgICAgICBUYW5nZXJpbmUuJGRiLmFsbERvY3NcbiAgICAgICAgICAgICAga2V5cyA6IGtleUxpc3RcbiAgICAgICAgICAgICAgaW5jbHVkZV9kb2NzOnRydWVcbiAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgICAgIGRvY3MgPSBbXVxuICAgICAgICAgICAgICAgIGZvciByb3cgaW4gcmVzcG9uc2Uucm93c1xuICAgICAgICAgICAgICAgICAgZG9jcy5wdXNoIHJvdy5kb2NcbiMgICAgICAgICAgICAgICAgYm9keSA9XG4jICAgICAgICAgICAgICAgICAgZG9jczogZG9jc1xuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgV2lkZ2V0UnVuVmlldyBtb2RlbDogZG9jc1xuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGxlc3NvbjogKG9wdGlvbnMuLi4pIC0+XG4gICAgY29uc29sZS5sb2coXCJsZXNzb24gcm91dGVcIilcbiAgICBzdWJqZWN0ID0gb3B0aW9uc1swXVxuICAgIGdyYWRlICAgPSBvcHRpb25zWzFdXG4gICAgd2VlayAgICA9IG9wdGlvbnNbMl1cbiAgICBkYXkgICAgID0gb3B0aW9uc1szXVxuXG4gICAgIyAgICBUYW5nZXJpbmUuTGVzc29uUGxhbkl0ZW1WaWV3LnNlbGVjdCBzdWJqZWN0LCBncmFkZSwgd2VlaywgZGF5XG4gICAgc3ViamVjdCA9IFRhbmdlcmluZS5lbnVtLmlTdWJqZWN0c1tzdWJqZWN0XVxuICAgIGxlc3NvbiA9IG5ldyBMZXNzb25cbiAgICBsZXNzb24uZmV0Y2ggc3ViamVjdCwgZ3JhZGUsIHdlZWssIGRheSwgPT5cbiAgICAgIGNvbnNvbGUubG9nKFwiZ290IHRoZSBsZXNzb24uIFRCRCAtIG5vdyBydW4gcnVuTWFyXCIpXG4gICAgICBpZCA9IGxlc3Nvbi5nZXQoaWQpXG4gICAgICBAcnVuKGlkKVxuXG4gIHByaW50OiAoIGFzc2Vzc21lbnRJZCwgZm9ybWF0ICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICggbW9kZWwgKSAtPlxuICAgICAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50UHJpbnRWaWV3XG4gICAgICAgICAgICAgIG1vZGVsICA6IG1vZGVsXG4gICAgICAgICAgICAgIGZvcm1hdCA6IGZvcm1hdFxuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgcmVzdW1lOiAoYXNzZXNzbWVudElkLCByZXN1bHRJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgXCJfaWRcIiA6IGFzc2Vzc21lbnRJZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICggYXNzZXNzbWVudCApIC0+XG4gICAgICAgICAgICByZXN1bHQgPSBuZXcgUmVzdWx0XG4gICAgICAgICAgICAgIFwiX2lkXCIgOiByZXN1bHRJZFxuICAgICAgICAgICAgcmVzdWx0LmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXN1bHQpIC0+XG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50UnVuVmlld1xuICAgICAgICAgICAgICAgICAgbW9kZWw6IGFzc2Vzc21lbnRcblxuICAgICAgICAgICAgICAgIGlmIHJlc3VsdC5oYXMoXCJvcmRlcl9tYXBcIilcbiAgICAgICAgICAgICAgICAgICMgc2F2ZSB0aGUgb3JkZXIgbWFwIG9mIHByZXZpb3VzIHJhbmRvbWl6YXRpb25cbiAgICAgICAgICAgICAgICAgIG9yZGVyTWFwID0gcmVzdWx0LmdldChcIm9yZGVyX21hcFwiKS5zbGljZSgpICMgY2xvbmUgYXJyYXlcbiAgICAgICAgICAgICAgICAgICMgcmVzdG9yZSB0aGUgcHJldmlvdXMgb3JkZXJtYXBcbiAgICAgICAgICAgICAgICAgIHZpZXcub3JkZXJNYXAgPSBvcmRlck1hcFxuXG4gICAgICAgICAgICAgICAgZm9yIHN1YnRlc3QgaW4gcmVzdWx0LmdldChcInN1YnRlc3REYXRhXCIpXG4gICAgICAgICAgICAgICAgICBpZiBzdWJ0ZXN0LmRhdGE/ICYmIHN1YnRlc3QuZGF0YS5wYXJ0aWNpcGFudF9pZD9cbiAgICAgICAgICAgICAgICAgICAgVGFuZ2VyaW5lLm5hdi5zZXRTdHVkZW50IHN1YnRlc3QuZGF0YS5wYXJ0aWNpcGFudF9pZFxuXG4gICAgICAgICAgICAgICAgIyByZXBsYWNlIHRoZSB2aWV3J3MgcmVzdWx0IHdpdGggb3VyIG9sZCBvbmVcbiAgICAgICAgICAgICAgICB2aWV3LnJlc3VsdCA9IHJlc3VsdFxuXG4gICAgICAgICAgICAgICAgIyBIaWphY2sgdGhlIG5vcm1hbCBSZXN1bHQgYW5kIFJlc3VsdFZpZXcsIHVzZSBvbmUgZnJvbSB0aGUgZGJcbiAgICAgICAgICAgICAgICB2aWV3LnN1YnRlc3RWaWV3cy5wb3AoKVxuICAgICAgICAgICAgICAgIHZpZXcuc3VidGVzdFZpZXdzLnB1c2ggbmV3IFJlc3VsdFZpZXdcbiAgICAgICAgICAgICAgICAgIG1vZGVsICAgICAgICAgIDogcmVzdWx0XG4gICAgICAgICAgICAgICAgICBhc3Nlc3NtZW50ICAgICA6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnRWaWV3IDogdmlld1xuICAgICAgICAgICAgICAgIHZpZXcuaW5kZXggPSByZXN1bHQuZ2V0KFwic3VidGVzdERhdGFcIikubGVuZ3RoXG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuXG4gIHJlc3VsdHM6IChhc3Nlc3NtZW50SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFmdGVyRmV0Y2ggPSAoYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50KFwiX2lkXCI6YXNzZXNzbWVudElkKSwgYXNzZXNzbWVudElkKSAtPlxuICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgUmVzdWx0c1xuICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgIGluY2x1ZGVfZG9jczogZmFsc2VcbiAgICAgICAgICAgIGtleTogXCJyXCIgKyBhc3Nlc3NtZW50SWRcbiAgICAgICAgICAgIHN1Y2Nlc3M6IChyZXN1bHRzKSA9PlxuICAgICAgICAgICAgICB2aWV3ID0gbmV3IFJlc3VsdHNWaWV3XG4gICAgICAgICAgICAgICAgXCJhc3Nlc3NtZW50XCIgOiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgICAgOiByZXN1bHRzLm1vZGVsc1xuICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogIC0+XG4gICAgICAgICAgICBhZnRlckZldGNoKGFzc2Vzc21lbnQsIGFzc2Vzc21lbnRJZClcbiAgICAgICAgICBlcnJvciA6ICAtPlxuICAgICAgICAgICAgYWZ0ZXJGZXRjaChhc3Nlc3NtZW50LCBhc3Nlc3NtZW50SWQpXG5cblxuICAjXG4gICMgUmVwb3J0c1xuICAjXG4gIGtsYXNzR3JvdXBpbmc6IChrbGFzc0lkLCBwYXJ0KSAtPlxuICAgIHBhcnQgPSBwYXJzZUludChwYXJ0KVxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6ICggY29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgIHN1YnRlc3RzID0gbmV3IFN1YnRlc3RzIGNvbGxlY3Rpb24ud2hlcmUgXCJwYXJ0XCIgOiBwYXJ0XG4gICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgIGFsbFJlc3VsdHMuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIHJlc3VsdHMgKSAtPlxuICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0cy53aGVyZSBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICBzdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuXG4gICAgICAgICAgICAgICAgICAgICAgIyBmaWx0ZXIgYFJlc3VsdHNgIGJ5IGBLbGFzc2AncyBjdXJyZW50IGBTdHVkZW50c2BcbiAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50cyBzdHVkZW50cy53aGVyZSBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50SWRzID0gc3R1ZGVudHMucGx1Y2soXCJfaWRcIilcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50cyA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzLm1vZGVsc1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMucHVzaChyZXN1bHQpIGlmIHJlc3VsdC5nZXQoXCJzdHVkZW50SWRcIikgaW4gc3R1ZGVudElkc1xuICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHNcblxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NHcm91cGluZ1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudHNcIiA6IHN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogZmlsdGVyZWRSZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgbWFzdGVyeUNoZWNrOiAoc3R1ZGVudElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKHN0dWRlbnQpIC0+XG4gICAgICAgICAgICBrbGFzc0lkID0gc3R1ZGVudC5nZXQgXCJrbGFzc0lkXCJcbiAgICAgICAgICAgIGtsYXNzID0gbmV3IEtsYXNzIFwiX2lkXCIgOiBzdHVkZW50LmdldCBcImtsYXNzSWRcIlxuICAgICAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogKGtsYXNzKSAtPlxuICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCBjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgY29sbGVjdGlvbi53aGVyZSBcInN0dWRlbnRJZFwiIDogc3R1ZGVudElkLCBcInJlcG9ydFR5cGVcIiA6IFwibWFzdGVyeVwiLCBcImtsYXNzSWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICAgICAgICAgICAgIyBnZXQgYSBsaXN0IG9mIHN1YnRlc3RzIGludm9sdmVkXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RJZExpc3QgPSB7fVxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0SWRMaXN0W3Jlc3VsdC5nZXQoXCJzdWJ0ZXN0SWRcIildID0gdHJ1ZSBmb3IgcmVzdWx0IGluIHJlc3VsdHMubW9kZWxzXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RJZExpc3QgPSBfLmtleXMoc3VidGVzdElkTGlzdClcblxuICAgICAgICAgICAgICAgICAgICAjIG1ha2UgYSBjb2xsZWN0aW9uIGFuZCBmZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0Q29sbGVjdGlvbiA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICBzdWJ0ZXN0Q29sbGVjdGlvbi5hZGQgbmV3IFN1YnRlc3QoXCJfaWRcIiA6IHN1YnRlc3RJZCkgZm9yIHN1YnRlc3RJZCBpbiBzdWJ0ZXN0SWRMaXN0XG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RDb2xsZWN0aW9uLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgTWFzdGVyeUNoZWNrVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICA6IHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc1wiICAgIDoga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiIDogc3VidGVzdENvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIHByb2dyZXNzUmVwb3J0OiAoc3R1ZGVudElkLCBrbGFzc0lkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICAjIHNhdmUgdGhpcyBjcmF6eSBmdW5jdGlvbiBmb3IgbGF0ZXJcbiAgICAgICAgIyBzdHVkZW50SWQgY2FuIGhhdmUgdGhlIHZhbHVlIFwiYWxsXCIsIGluIHdoaWNoIGNhc2Ugc3R1ZGVudCBzaG91bGQgPT0gbnVsbFxuICAgICAgICBhZnRlckZldGNoID0gKCBzdHVkZW50LCBzdHVkZW50cyApIC0+XG4gICAgICAgICAga2xhc3MgPSBuZXcgS2xhc3MgXCJfaWRcIiA6IGtsYXNzSWRcbiAgICAgICAgICBrbGFzcy5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogKGtsYXNzKSAtPlxuICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggYWxsU3VidGVzdHMgKSAtPlxuICAgICAgICAgICAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHMgYWxsU3VidGVzdHMud2hlcmVcbiAgICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtSWRcIiA6IGtsYXNzLmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgICAgICAgICBcInJlcG9ydFR5cGVcIiAgIDogXCJwcm9ncmVzc1wiXG4gICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzIGNvbGxlY3Rpb24ud2hlcmUgXCJrbGFzc0lkXCIgOiBrbGFzc0lkLCBcInJlcG9ydFR5cGVcIiA6IFwicHJvZ3Jlc3NcIlxuXG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgc3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICBpZiBzdHVkZW50cz9cbiAgICAgICAgICAgICAgICAgICAgICAgICMgZmlsdGVyIGBSZXN1bHRzYCBieSBgS2xhc3NgJ3MgY3VycmVudCBgU3R1ZGVudHNgXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50SWRzID0gc3R1ZGVudHMucGx1Y2soXCJfaWRcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciByZXN1bHQgaW4gcmVzdWx0cy5tb2RlbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMucHVzaChyZXN1bHQpIGlmIHJlc3VsdC5nZXQoXCJzdHVkZW50SWRcIikgaW4gc3R1ZGVudElkc1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHNcblxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgUHJvZ3Jlc3NWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc1wiICAgIDoga2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICAgICAgICBpZiBzdHVkZW50SWQgIT0gXCJhbGxcIlxuICAgICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBcIl9pZFwiIDogc3R1ZGVudElkXG4gICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogLT4gYWZ0ZXJGZXRjaCBzdHVkZW50XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgIHN0dWRlbnRzLmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiAtPiBhZnRlckZldGNoIG51bGwsIHN0dWRlbnRzXG5cbiAgI1xuICAjIFN1YnRlc3RzXG4gICNcbiAgZWRpdFN1YnRlc3Q6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IF9pZCA6IGlkXG4gICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAobW9kZWwsIHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50XG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBzdWJ0ZXN0LmdldChcImFzc2Vzc21lbnRJZFwiKVxuICAgICAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgU3VidGVzdEVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICBtb2RlbCAgICAgIDogbW9kZWxcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnQgOiBhc3Nlc3NtZW50XG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cbiAgI1xuICAjIEVsZW1lbnRzXG4gICNcbiAgZWRpdEVsZW1lbnQ6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgZWxlbWVudCA9IG5ldyBFbGVtZW50IF9pZCA6IGlkXG4gICAgICAgIGVsZW1lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAobW9kZWwsIHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgbGVzc29uUGxhbiA9IG5ldyBMZXNzb25QbGFuXG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBlbGVtZW50LmdldChcImFzc2Vzc21lbnRJZFwiKVxuICAgICAgICAgICAgbGVzc29uUGxhbi5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgRWxlbWVudEVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICBtb2RlbCAgICAgIDogbW9kZWxcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnQgOiBsZXNzb25QbGFuXG4gICAgICAgICAgICAgICAgICBsZXNzb25QbGFuIDogbGVzc29uUGxhblxuICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG4gIGVkaXRLbGFzc1N1YnRlc3Q6IChpZCkgLT5cblxuICAgIG9uU3VjY2VzcyA9IChzdWJ0ZXN0LCBjdXJyaWN1bHVtLCBxdWVzdGlvbnM9bnVsbCkgLT5cbiAgICAgIHZpZXcgPSBuZXcgS2xhc3NTdWJ0ZXN0RWRpdFZpZXdcbiAgICAgICAgbW9kZWwgICAgICA6IHN1YnRlc3RcbiAgICAgICAgY3VycmljdWx1bSA6IGN1cnJpY3VsdW1cbiAgICAgICAgcXVlc3Rpb25zICA6IHF1ZXN0aW9uc1xuICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0IF9pZCA6IGlkXG4gICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtXG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBzdWJ0ZXN0LmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QuZ2V0KFwicHJvdG90eXBlXCIpID09IFwic3VydmV5XCJcbiAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICBrZXkgOiBjdXJyaWN1bHVtLmlkXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyBxdWVzdGlvbnMud2hlcmUoXCJzdWJ0ZXN0SWRcIjpzdWJ0ZXN0LmlkKVxuICAgICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyBzdWJ0ZXN0LCBjdXJyaWN1bHVtLCBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Mgc3VidGVzdCwgY3VycmljdWx1bVxuICAgICAgaXNVc2VyOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuXG5cbiAgI1xuICAjIFF1ZXN0aW9uXG4gICNcbiAgZWRpdFF1ZXN0aW9uOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHF1ZXN0aW9uID0gbmV3IFF1ZXN0aW9uIF9pZCA6IGlkXG4gICAgICAgIHF1ZXN0aW9uLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKHF1ZXN0aW9uLCByZXNwb25zZSkgLT5cbiAgICAgICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwiYXNzZXNzbWVudElkXCIpXG4gICAgICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgc3VidGVzdCA9IG5ldyBTdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICBcIl9pZFwiIDogcXVlc3Rpb24uZ2V0KFwic3VidGVzdElkXCIpXG4gICAgICAgICAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBRdWVzdGlvbkVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvblwiICAgOiBxdWVzdGlvblxuICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICAgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgIFwiYXNzZXNzbWVudFwiIDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuXG4gIGVkaXRLbGFzc1F1ZXN0aW9uOiAoaWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHF1ZXN0aW9uID0gbmV3IFF1ZXN0aW9uIFwiX2lkXCIgOiBpZFxuICAgICAgICBxdWVzdGlvbi5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChxdWVzdGlvbiwgcmVzcG9uc2UpIC0+XG4gICAgICAgICAgICBjdXJyaWN1bHVtID0gbmV3IEN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHF1ZXN0aW9uLmdldChcImN1cnJpY3VsdW1JZFwiKVxuICAgICAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdFxuICAgICAgICAgICAgICAgICAgXCJfaWRcIiA6IHF1ZXN0aW9uLmdldChcInN1YnRlc3RJZFwiKVxuICAgICAgICAgICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgUXVlc3Rpb25FZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwicXVlc3Rpb25cIiAgIDogcXVlc3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RcIiAgICA6IHN1YnRlc3RcbiAgICAgICAgICAgICAgICAgICAgICBcImFzc2Vzc21lbnRcIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICAjXG4gICMgVXNlclxuICAjXG4gIGxvZ2luOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBUYW5nZXJpbmUucm91dGVyLmxhbmRpbmcoKVxuICAgICAgaXNVbnJlZ2lzdGVyZWQ6IC0+XG5cbiAgICAgICAgc2hvd1ZpZXcgPSAodXNlcnMgPSBbXSkgLT5cbiAgICAgICAgICB2aWV3ID0gbmV3IExvZ2luVmlld1xuICAgICAgICAgICAgdXNlcnM6IHVzZXJzXG4gICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgICAgICAgc2hvd1ZpZXcoKVxuXG4gIGxvZ291dDogLT5cbiAgICBUYW5nZXJpbmUudXNlci5sb2dvdXQoKVxuXG4gIGFjY291bnQ6IC0+XG4gICAgIyBjaGFuZ2UgdGhlIGxvY2F0aW9uIHRvIHRoZSB0cnVuaywgdW5sZXNzIHdlJ3JlIGFscmVhZHkgaW4gdGhlIHRydW5rXG4gICAgaWYgVGFuZ2VyaW5lLmRiX25hbWUgIT0gXCJ0YW5nZXJpbmVcIlxuICAgICAgd2luZG93LmxvY2F0aW9uID0gVGFuZ2VyaW5lLnNldHRpbmdzLnVybEluZGV4KFwidHJ1bmtcIiwgXCJhY2NvdW50XCIpXG4gICAgZWxzZVxuICAgICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgICB2aWV3ID0gbmV3IEFjY291bnRWaWV3XG4gICAgICAgICAgICB1c2VyIDogVGFuZ2VyaW5lLnVzZXJcbiAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBzZXR0aW5nczogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBTZXR0aW5nc1ZpZXdcbiAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICBsb2dzOiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBsb2dzID0gbmV3IExvZ3NcbiAgICAgICAgbG9ncy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IExvZ1ZpZXdcbiAgICAgICAgICAgICAgbG9nczogbG9nc1xuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuXG5cbiAgIyBUcmFuc2ZlciBhIG5ldyB1c2VyIGZyb20gdGFuZ2VyaW5lLWNlbnRyYWwgaW50byB0YW5nZXJpbmVcbiAgdHJhbnNmZXI6IC0+XG4gICAgZ2V0VmFycyA9IFV0aWxzLiRfR0VUKClcbiAgICBuYW1lID0gZ2V0VmFycy5uYW1lXG4gICAgJC5jb3VjaC5sb2dvdXRcbiAgICAgIHN1Y2Nlc3M6ID0+XG4gICAgICAgICQuY29va2llIFwiQXV0aFNlc3Npb25cIiwgbnVsbFxuICAgICAgICAkLmNvdWNoLmxvZ2luXG4gICAgICAgICAgXCJuYW1lXCIgICAgIDogbmFtZVxuICAgICAgICAgIFwicGFzc3dvcmRcIiA6IG5hbWVcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgJC5jb3VjaC5zaWdudXBcbiAgICAgICAgICAgICAgXCJuYW1lXCIgOiAgbmFtZVxuICAgICAgICAgICAgICBcInJvbGVzXCIgOiBbXCJfYWRtaW5cIl1cbiAgICAgICAgICAgICwgbmFtZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgIHVzZXIgPSBuZXcgVXNlclxuICAgICAgICAgICAgICB1c2VyLnNhdmVcbiAgICAgICAgICAgICAgICBcIm5hbWVcIiAgOiBuYW1lXG4gICAgICAgICAgICAgICAgXCJpZFwiICAgIDogXCJ0YW5nZXJpbmUudXNlcjpcIituYW1lXG4gICAgICAgICAgICAgICAgXCJyb2xlc1wiIDogW11cbiAgICAgICAgICAgICAgICBcImZyb21cIiAgOiBcInRjXCJcbiAgICAgICAgICAgICAgLFxuICAgICAgICAgICAgICAgIHdhaXQ6IHRydWVcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgJC5jb3VjaC5sb2dpblxuICAgICAgICAgICAgICAgICAgICBcIm5hbWVcIiAgICAgOiBuYW1lXG4gICAgICAgICAgICAgICAgICAgIFwicGFzc3dvcmRcIiA6IG5hbWVcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyA6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgVXRpbHMuc3RpY2t5IFwiRXJyb3IgdHJhbnNmZXJpbmcgdXNlci5cIlxuIl19
