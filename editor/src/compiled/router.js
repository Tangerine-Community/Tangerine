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
          collections: ["Klasses", "Teachers", "Curricula", "Assessments"],
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

//# sourceMappingURL=data:application/json;base64,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QUFhLElBRGI7d0JBRUEsT0FBQSxFQUFVLFNBQUE7MEJBQ1IsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFqQixDQUFBO2lDQUNBLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBaEIsQ0FBQTt3QkFGUSxDQUZWO3dCQUtBLEtBQUEsRUFBTyxTQUFBO2lDQUNMLEtBQUssQ0FBQyxNQUFOLENBQWEseUJBQWI7d0JBREssQ0FMUDt1QkFERjtvQkFETyxDQURUO21CQU5GO2dCQUZPLENBQVQ7ZUFKQTtZQURLLENBTFA7V0FERjtRQUZPO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFUO0tBREY7RUFIUTs7OztHQTl4QlMsUUFBUSxDQUFDIiwiZmlsZSI6ImFwcC9yb3V0ZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBSb3V0ZXIgZXh0ZW5kcyBCYWNrYm9uZS5Sb3V0ZXJcbiMgIGJlZm9yZTogKCkgLT5cbiMgICAgY29uc29sZS5sb2coJ2JlZm9yZScpXG4jICAgICQoJyNmb290ZXInKS5zaG93KClcbiNcbiMgIGFmdGVyOiAoKSAtPlxuIyAgICBjb25zb2xlLmxvZygnYWZ0ZXInKTtcbiAgZXhlY3V0ZTogKGNhbGxiYWNrLCBhcmdzLCBuYW1lKSAtPlxuICAgICQoJyNmb290ZXInKS5zaG93KClcbiAgICBpZiAoY2FsbGJhY2spXG4gICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmdzKVxuXG4gIHJvdXRlczpcbiAgICAnbG9naW4nICAgIDogJ2xvZ2luJ1xuICAgICdyZWdpc3RlcicgOiAncmVnaXN0ZXInXG4gICAgJ2xvZ291dCcgICA6ICdsb2dvdXQnXG4gICAgJ2FjY291bnQnICA6ICdhY2NvdW50J1xuXG4gICAgJ3RyYW5zZmVyJyA6ICd0cmFuc2ZlcidcblxuICAgICdzZXR0aW5ncycgOiAnc2V0dGluZ3MnXG4gICAgJ3VwZGF0ZScgOiAndXBkYXRlJ1xuXG4gICAgJycgOiAnbGFuZGluZydcblxuICAgICdsb2dzJyA6ICdsb2dzJ1xuXG4gICAgIyBDbGFzc1xuICAgICdjbGFzcycgICAgICAgICAgOiAna2xhc3MnXG4gICAgJ2NsYXNzL2VkaXQvOmlkJyA6ICdrbGFzc0VkaXQnXG4gICAgJ2NsYXNzL3N0dWRlbnQvOnN0dWRlbnRJZCcgICAgICAgIDogJ3N0dWRlbnRFZGl0J1xuICAgICdjbGFzcy9zdHVkZW50L3JlcG9ydC86c3R1ZGVudElkJyA6ICdzdHVkZW50UmVwb3J0J1xuICAgICdjbGFzcy9zdWJ0ZXN0LzppZCcgOiAnZWRpdEtsYXNzU3VidGVzdCdcbiAgICAnY2xhc3MvcXVlc3Rpb24vOmlkJyA6IFwiZWRpdEtsYXNzUXVlc3Rpb25cIlxuXG4gICAgJ2NsYXNzLzppZC86cGFydCcgOiAna2xhc3NQYXJ0bHknXG4gICAgJ2NsYXNzLzppZCcgICAgICAgOiAna2xhc3NQYXJ0bHknXG5cbiAgICAnY2xhc3MvcnVuLzpzdHVkZW50SWQvOnN1YnRlc3RJZCcgOiAncnVuU3VidGVzdCdcblxuICAgICdjbGFzcy9yZXN1bHQvc3R1ZGVudC9zdWJ0ZXN0LzpzdHVkZW50SWQvOnN1YnRlc3RJZCcgOiAnc3R1ZGVudFN1YnRlc3QnXG5cbiAgICAnY3VycmljdWxhJyAgICAgICAgIDogJ2N1cnJpY3VsYSdcbiAgICAnY3VycmljdWx1bS86aWQnICAgIDogJ2N1cnJpY3VsdW0nXG4gICAgJ2N1cnJpY3VsdW1JbXBvcnQnICA6ICdjdXJyaWN1bHVtSW1wb3J0J1xuXG4gICAgJ3JlcG9ydC9rbGFzc0dyb3VwaW5nLzprbGFzc0lkLzpwYXJ0JyA6ICdrbGFzc0dyb3VwaW5nJ1xuICAgICdyZXBvcnQvbWFzdGVyeUNoZWNrLzpzdHVkZW50SWQnICAgICAgOiAnbWFzdGVyeUNoZWNrJ1xuICAgICdyZXBvcnQvcHJvZ3Jlc3MvOnN0dWRlbnRJZC86a2xhc3NJZCcgOiAncHJvZ3Jlc3NSZXBvcnQnXG5cblxuICAgICMgc2VydmVyIC8gbW9iaWxlXG4gICAgJ2dyb3VwcycgOiAnZ3JvdXBzJ1xuXG4gICAgJ2Fzc2Vzc21lbnRzJyAgICAgICAgOiAnYXNzZXNzbWVudHMnXG5cbiAgICAncnVuLzppZCcgICAgICAgOiAncnVuJ1xuICAgICdwcmludC86aWQvOmZvcm1hdCcgICAgICAgOiAncHJpbnQnXG4gICAgJ2RhdGFFbnRyeS86aWQnIDogJ2RhdGFFbnRyeSdcblxuICAgICdyZXN1bWUvOmFzc2Vzc21lbnRJZC86cmVzdWx0SWQnICAgIDogJ3Jlc3VtZSdcblxuICAgICdyZXN0YXJ0LzppZCcgICA6ICdyZXN0YXJ0J1xuICAgICdlZGl0LzppZCcgICAgICA6ICdlZGl0J1xuICAgICdyZXN1bHRzLzppZCcgICA6ICdyZXN1bHRzJ1xuICAgICdpbXBvcnQnICAgICAgICA6ICdpbXBvcnQnXG5cbiAgICAnc3VidGVzdC86aWQnICAgICAgIDogJ2VkaXRTdWJ0ZXN0J1xuXG4gICAgJ3F1ZXN0aW9uLzppZCcgOiAnZWRpdFF1ZXN0aW9uJ1xuICAgICdkYXNoYm9hcmQnIDogJ2Rhc2hib2FyZCdcbiAgICAnZGFzaGJvYXJkLypvcHRpb25zJyA6ICdkYXNoYm9hcmQnXG4gICAgJ2FkbWluJyA6ICdhZG1pbidcblxuICAgICdzeW5jLzppZCcgICAgICA6ICdzeW5jJ1xuXG5cbiAgYWRtaW46IChvcHRpb25zKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgJC5jb3VjaC5hbGxEYnNcbiAgICAgICAgICBzdWNjZXNzOiAoZGF0YWJhc2VzKSA9PlxuICAgICAgICAgICAgZ3JvdXBzID0gZGF0YWJhc2VzLmZpbHRlciAoZGF0YWJhc2UpIC0+IGRhdGFiYXNlLmluZGV4T2YoXCJncm91cC1cIikgPT0gMFxuICAgICAgICAgICAgdmlldyA9IG5ldyBBZG1pblZpZXdcbiAgICAgICAgICAgICAgZ3JvdXBzIDogZ3JvdXBzXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBkYXNoYm9hcmQ6IChvcHRpb25zKSAtPlxuICAgIG9wdGlvbnMgPSBvcHRpb25zPy5zcGxpdCgvXFwvLylcbiAgICBjb25zb2xlLmxvZyhcIm9wdGlvbnM6IFwiICsgb3B0aW9ucylcbiAgICAjZGVmYXVsdCB2aWV3IG9wdGlvbnNcbiAgICByZXBvcnRWaWV3T3B0aW9ucyA9XG4gICAgICBhc3Nlc3NtZW50OiBcIkFsbFwiXG4gICAgICBncm91cEJ5OiBcImVudW1lcmF0b3JcIlxuXG4gICAgIyBBbGxvd3MgdXMgdG8gZ2V0IG5hbWUvdmFsdWUgcGFpcnMgZnJvbSBVUkxcbiAgICBfLmVhY2ggb3B0aW9ucywgKG9wdGlvbixpbmRleCkgLT5cbiAgICAgIHVubGVzcyBpbmRleCAlIDJcbiAgICAgICAgcmVwb3J0Vmlld09wdGlvbnNbb3B0aW9uXSA9IG9wdGlvbnNbaW5kZXgrMV1cblxuICAgIHZpZXcgPSBuZXcgRGFzaGJvYXJkVmlldyAgcmVwb3J0Vmlld09wdGlvbnNcblxuICAgIHZtLnNob3cgdmlld1xuXG4gIGxhbmRpbmc6IC0+XG5cbiAgICBpZiB+U3RyaW5nKHdpbmRvdy5sb2NhdGlvbi5ocmVmKS5pbmRleE9mKFwidGFuZ2VyaW5lL19kZXNpZ25cIikgIyBpbiBtYWluIGdyb3VwP1xuICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImdyb3Vwc1wiLCB0cnVlXG4gICAgZWxzZVxuICAgICAgVGFuZ2VyaW5lLnJvdXRlci5uYXZpZ2F0ZSBcImFzc2Vzc21lbnRzXCIsIHRydWVcblxuXG4gIGdyb3VwczogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgdmlldyA9IG5ldyBHcm91cHNWaWV3XG4gICAgICAgIHZtLnNob3cgdmlld1xuXG4gICNcbiAgIyBDbGFzc1xuICAjXG4gIGN1cnJpY3VsYTogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgY3VycmljdWxhID0gbmV3IEN1cnJpY3VsYVxuICAgICAgICBjdXJyaWN1bGEuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgIHZpZXcgPSBuZXcgQ3VycmljdWxhVmlld1xuICAgICAgICAgICAgICBcImN1cnJpY3VsYVwiIDogY29sbGVjdGlvblxuICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgY3VycmljdWx1bTogKGN1cnJpY3VsdW1JZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtIFwiX2lkXCIgOiBjdXJyaWN1bHVtSWRcbiAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyBhbGxTdWJ0ZXN0cy53aGVyZSBcImN1cnJpY3VsdW1JZFwiIDogY3VycmljdWx1bUlkXG4gICAgICAgICAgICAgICAgYWxsUXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgIGFsbFF1ZXN0aW9ucy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gW11cbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdHMuZWFjaCAoc3VidGVzdCkgLT4gcXVlc3Rpb25zID0gcXVlc3Rpb25zLmNvbmNhdChhbGxRdWVzdGlvbnMud2hlcmUgXCJzdWJ0ZXN0SWRcIiA6IHN1YnRlc3QuaWQgKVxuICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zIHF1ZXN0aW9uc1xuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEN1cnJpY3VsdW1WaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtXCIgOiBjdXJyaWN1bHVtXG4gICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0c1wiICAgOiBzdWJ0ZXN0c1xuICAgICAgICAgICAgICAgICAgICAgIFwicXVlc3Rpb25zXCIgIDogcXVlc3Rpb25zXG5cbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICBjdXJyaWN1bHVtRWRpdDogKGN1cnJpY3VsdW1JZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtIFwiX2lkXCIgOiBjdXJyaWN1bHVtSWRcbiAgICAgICAgY3VycmljdWx1bS5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBhbGxTdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0c1xuICAgICAgICAgICAgYWxsU3VidGVzdHMuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IGFsbFN1YnRlc3RzLndoZXJlIFwiY3VycmljdWx1bUlkXCIgOiBjdXJyaWN1bHVtSWRcbiAgICAgICAgICAgICAgICBhbGxQYXJ0cyA9IChzdWJ0ZXN0LmdldChcInBhcnRcIikgZm9yIHN1YnRlc3QgaW4gc3VidGVzdHMpXG4gICAgICAgICAgICAgICAgcGFydENvdW50ID0gTWF0aC5tYXguYXBwbHkgTWF0aCwgYWxsUGFydHNcbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEN1cnJpY3VsdW1WaWV3XG4gICAgICAgICAgICAgICAgICBcImN1cnJpY3VsdW1cIiA6IGN1cnJpY3VsdW1cbiAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICBcInBhcnRzXCIgOiBwYXJ0Q291bnRcbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gIGN1cnJpY3VsdW1JbXBvcnQ6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgQXNzZXNzbWVudEltcG9ydFZpZXdcbiAgICAgICAgICBub3VuIDogXCJjdXJyaWN1bHVtXCJcbiAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAga2xhc3M6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIGFsbEtsYXNzZXMgPSBuZXcgS2xhc3Nlc1xuICAgICAgICBhbGxLbGFzc2VzLmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKCBrbGFzc0NvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgdGVhY2hlcnMgPSBuZXcgVGVhY2hlcnNcbiAgICAgICAgICAgIHRlYWNoZXJzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgYWxsQ3VycmljdWxhID0gbmV3IEN1cnJpY3VsYVxuICAgICAgICAgICAgICAgIGFsbEN1cnJpY3VsYS5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKCBjdXJyaWN1bGFDb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IFRhbmdlcmluZS51c2VyLmlzQWRtaW4oKVxuICAgICAgICAgICAgICAgICAgICAgIGtsYXNzQ29sbGVjdGlvbiA9IG5ldyBLbGFzc2VzIGtsYXNzQ29sbGVjdGlvbi53aGVyZShcInRlYWNoZXJJZFwiIDogVGFuZ2VyaW5lLnVzZXIuZ2V0KFwidGVhY2hlcklkXCIpKVxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEtsYXNzZXNWaWV3XG4gICAgICAgICAgICAgICAgICAgICAga2xhc3NlcyAgIDoga2xhc3NDb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgY3VycmljdWxhIDogY3VycmljdWxhQ29sbGVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgIHRlYWNoZXJzICA6IHRlYWNoZXJzXG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gIGtsYXNzRWRpdDogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBrbGFzcyA9IG5ldyBLbGFzcyBfaWQgOiBpZFxuICAgICAgICBrbGFzcy5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6ICggbW9kZWwgKSAtPlxuICAgICAgICAgICAgdGVhY2hlcnMgPSBuZXcgVGVhY2hlcnNcbiAgICAgICAgICAgIHRlYWNoZXJzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgYWxsU3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICAgICAgICAgICAgICBhbGxTdHVkZW50cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGFsbFN0dWRlbnRzKSAtPlxuICAgICAgICAgICAgICAgICAgICBrbGFzc1N0dWRlbnRzID0gbmV3IFN0dWRlbnRzIGFsbFN0dWRlbnRzLndoZXJlIHtrbGFzc0lkIDogaWR9XG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NFZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgIGtsYXNzICAgICAgIDogbW9kZWxcbiAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50cyAgICA6IGtsYXNzU3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICBhbGxTdHVkZW50cyA6IGFsbFN0dWRlbnRzXG4gICAgICAgICAgICAgICAgICAgICAgdGVhY2hlcnMgICAgOiB0ZWFjaGVyc1xuICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBrbGFzc1BhcnRseTogKGtsYXNzSWQsIHBhcnQ9bnVsbCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAga2xhc3MgPSBuZXcgS2xhc3MgXCJfaWRcIiA6IGtsYXNzSWRcbiAgICAgICAga2xhc3MuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtIFwiX2lkXCIgOiBrbGFzcy5nZXQoXCJjdXJyaWN1bHVtSWRcIilcbiAgICAgICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBhbGxTdHVkZW50cyA9IG5ldyBTdHVkZW50c1xuICAgICAgICAgICAgICAgIGFsbFN0dWRlbnRzLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbikgLT5cbiAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgU3R1ZGVudHMgKCBjb2xsZWN0aW9uLndoZXJlKCBcImtsYXNzSWRcIiA6IGtsYXNzSWQgKSApXG5cbiAgICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IChjb2xsZWN0aW9uKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgKCBjb2xsZWN0aW9uLndoZXJlKCBcImtsYXNzSWRcIiA6IGtsYXNzSWQgKSApXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoY29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHMgKCBjb2xsZWN0aW9uLndoZXJlKCBcImN1cnJpY3VsdW1JZFwiIDoga2xhc3MuZ2V0KFwiY3VycmljdWx1bUlkXCIpICkgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgS2xhc3NQYXJ0bHlWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcnRcIiAgICAgICA6IHBhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiAgIDogc3VidGVzdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVzdWx0c1wiICAgIDogcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50c1wiICAgOiBzdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjdXJyaWN1bHVtXCIgOiBjdXJyaWN1bHVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtsYXNzXCIgICAgICA6IGtsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cblxuICBzdHVkZW50U3VidGVzdDogKHN0dWRlbnRJZCwgc3VidGVzdElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzdHVkZW50ID0gbmV3IFN0dWRlbnQgXCJfaWRcIiA6IHN0dWRlbnRJZFxuICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBcIl9pZFwiIDogc3VidGVzdElkXG4gICAgICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgVGFuZ2VyaW5lLiRkYi52aWV3IFwiI3tUYW5nZXJpbmUuZGVzaWduX2RvY30vcmVzdWx0c0J5U3R1ZGVudFN1YnRlc3RcIixcbiAgICAgICAgICAgICAgICAgIGtleSA6IFtzdHVkZW50SWQsc3VidGVzdElkXVxuICAgICAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PlxuICAgICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKGNvbGxlY3Rpb24pIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gY29sbGVjdGlvbi53aGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RJZFwiIDogc3VidGVzdElkXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudElkXCIgOiBzdHVkZW50SWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrbGFzc0lkXCIgICA6IHN0dWRlbnQuZ2V0KFwia2xhc3NJZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc1N1YnRlc3RSZXN1bHRWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxsUmVzdWx0c1wiIDogYWxsUmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgOiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdFwiICA6IHN1YnRlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgIDogc3R1ZGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInByZXZpb3VzXCIgOiByZXNwb25zZS5yb3dzLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgcnVuU3VidGVzdDogKHN0dWRlbnRJZCwgc3VidGVzdElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3QgXCJfaWRcIiA6IHN1YnRlc3RJZFxuICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBcIl9pZFwiIDogc3R1ZGVudElkXG5cbiAgICAgICAgICAgICMgdGhpcyBmdW5jdGlvbiBmb3IgbGF0ZXIsIHJlYWwgY29kZSBiZWxvd1xuICAgICAgICAgICAgb25TdHVkZW50UmVhZHkgPSAoc3R1ZGVudCwgc3VidGVzdCkgLT5cbiAgICAgICAgICAgICAgc3R1ZGVudC5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG5cbiAgICAgICAgICAgICAgICAgICMgdGhpcyBmdW5jdGlvbiBmb3IgbGF0ZXIsIHJlYWwgY29kZSBiZWxvd1xuICAgICAgICAgICAgICAgICAgb25TdWNjZXNzID0gKHN0dWRlbnQsIHN1YnRlc3QsIHF1ZXN0aW9uPW51bGwsIGxpbmtlZFJlc3VsdD17fSkgLT5cbiAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc1N1YnRlc3RSdW5WaWV3XG4gICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50XCIgICAgICA6IHN0dWRlbnRcbiAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RcIiAgICAgIDogc3VidGVzdFxuICAgICAgICAgICAgICAgICAgICAgIFwicXVlc3Rpb25zXCIgICAgOiBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICBcImxpbmtlZFJlc3VsdFwiIDogbGlua2VkUmVzdWx0XG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBudWxsXG4gICAgICAgICAgICAgICAgICBpZiBzdWJ0ZXN0LmdldChcInByb3RvdHlwZVwiKSA9PSBcInN1cnZleVwiXG4gICAgICAgICAgICAgICAgICAgIFRhbmdlcmluZS4kZGIudmlldyBcIiN7VGFuZ2VyaW5lLmRlc2lnbl9kb2N9L3Jlc3VsdHNCeVN0dWRlbnRTdWJ0ZXN0XCIsXG4gICAgICAgICAgICAgICAgICAgICAga2V5IDogW3N0dWRlbnRJZCxzdWJ0ZXN0LmdldChcImdyaWRMaW5rSWRcIildXG4gICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3BvbnNlKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgcmVzcG9uc2Uucm93cyAhPSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmtlZFJlc3VsdCA9IG5ldyBLbGFzc1Jlc3VsdCBfLmxhc3QocmVzcG9uc2Uucm93cyk/LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBcInFcIiArIHN1YnRlc3QuZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyhxdWVzdGlvbnMud2hlcmUge3N1YnRlc3RJZCA6IHN1YnRlc3RJZCB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU3VjY2VzcyhzdHVkZW50LCBzdWJ0ZXN0LCBxdWVzdGlvbnMsIGxpbmtlZFJlc3VsdClcbiAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzKHN0dWRlbnQsIHN1YnRlc3QpXG4gICAgICAgICAgICAgICMgZW5kIG9mIG9uU3R1ZGVudFJlYWR5XG5cbiAgICAgICAgICAgIGlmIHN0dWRlbnRJZCA9PSBcInRlc3RcIlxuICAgICAgICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT4gb25TdHVkZW50UmVhZHkoIHN0dWRlbnQsIHN1YnRlc3QpXG4gICAgICAgICAgICAgICAgZXJyb3I6IC0+XG4gICAgICAgICAgICAgICAgICBzdHVkZW50LnNhdmUgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogLT4gb25TdHVkZW50UmVhZHkoIHN0dWRlbnQsIHN1YnRlc3QpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgb25TdHVkZW50UmVhZHkoc3R1ZGVudCwgc3VidGVzdClcblxuICByZWdpc3RlcjogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzVW5yZWdpc3RlcmVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IFJlZ2lzdGVyVGVhY2hlclZpZXdcbiAgICAgICAgICB1c2VyIDogbmV3IFVzZXJcbiAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cbiAgc3R1ZGVudEVkaXQ6ICggc3R1ZGVudElkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IF9pZCA6IHN0dWRlbnRJZFxuICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogKG1vZGVsKSAtPlxuICAgICAgICAgICAgYWxsS2xhc3NlcyA9IG5ldyBLbGFzc2VzXG4gICAgICAgICAgICBhbGxLbGFzc2VzLmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6ICgga2xhc3NDb2xsZWN0aW9uICktPlxuICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgU3R1ZGVudEVkaXRWaWV3XG4gICAgICAgICAgICAgICAgICBzdHVkZW50IDogbW9kZWxcbiAgICAgICAgICAgICAgICAgIGtsYXNzZXMgOiBrbGFzc0NvbGxlY3Rpb25cbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG4gICNcbiAgIyBBc3Nlc3NtZW50XG4gICNcblxuXG4gIGRhdGFFbnRyeTogKCBhc3Nlc3NtZW50SWQgKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgYXNzZXNzbWVudCA9IG5ldyBBc3Nlc3NtZW50IFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgICAgICAgICBxdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAgICAgICAga2V5OiBcInFcIiArIGFzc2Vzc21lbnRJZFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uc0J5U3VidGVzdElkID0gcXVlc3Rpb25zLmluZGV4QnkoXCJzdWJ0ZXN0SWRcIilcbiAgICAgICAgICAgICAgICBmb3Igc3VidGVzdElkLCBxdWVzdGlvbnMgb2YgcXVlc3Rpb25zQnlTdWJ0ZXN0SWRcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnQuc3VidGVzdHMuZ2V0KHN1YnRlc3RJZCkucXVlc3Rpb25zID0gbmV3IFF1ZXN0aW9ucyBxdWVzdGlvbnNcbiAgICAgICAgICAgICAgICB2bS5zaG93IG5ldyBBc3Nlc3NtZW50RGF0YUVudHJ5VmlldyBhc3Nlc3NtZW50OiBhc3Nlc3NtZW50XG5cblxuXG4gIHN5bmM6ICggYXNzZXNzbWVudElkICkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudCBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgdm0uc2hvdyBuZXcgQXNzZXNzbWVudFN5bmNWaWV3IFwiYXNzZXNzbWVudFwiOiBhc3Nlc3NtZW50XG5cbiAgaW1wb3J0OiAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRJbXBvcnRWaWV3XG4gICAgICAgICAgbm91biA6XCJhc3Nlc3NtZW50XCJcbiAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgYXNzZXNzbWVudHM6IC0+XG4gICAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICAgIFV0aWxzLmxvYWRDb2xsZWN0aW9uc1xuICAgICAgICAgICAgY29sbGVjdGlvbnM6IFtcbiAgICAgICAgICAgICAgXCJLbGFzc2VzXCJcbiAgICAgICAgICAgICAgXCJUZWFjaGVyc1wiXG4gICAgICAgICAgICAgIFwiQ3VycmljdWxhXCJcbiAgICAgICAgICAgICAgXCJBc3Nlc3NtZW50c1wiXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBjb21wbGV0ZTogKG9wdGlvbnMpIC0+XG4gICAgICAgICAgICAgIHZtLnNob3cgbmV3IEFzc2Vzc21lbnRzTWVudVZpZXcgb3B0aW9uc1xuXG4gIGVkaXRJZDogKGlkKSAtPlxuICAgIGlkID0gVXRpbHMuY2xlYW5VUkwgaWRcbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgIF9pZDogaWRcbiAgICAgICAgYXNzZXNzbWVudC5zdXBlckZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICggbW9kZWwgKSAtPlxuICAgICAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50RWRpdFZpZXcgbW9kZWw6IG1vZGVsXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuXG4gIGVkaXQ6IChpZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQWRtaW46IC0+XG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgIFwiX2lkXCIgOiBpZFxuICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgc3VjY2VzcyA6ICggbW9kZWwgKSAtPlxuICAgICAgICAgICAgdmlldyA9IG5ldyBBc3Nlc3NtZW50RWRpdFZpZXcgbW9kZWw6IG1vZGVsXG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuICByZXN0YXJ0OiAobmFtZSkgLT5cbiAgICBUYW5nZXJpbmUucm91dGVyLm5hdmlnYXRlIFwicnVuLyN7bmFtZX1cIiwgdHJ1ZVxuXG4jICBXaWRnZXRSdW5WaWV3IHRha2VzIGEgbGlzdCBvZiBzdWJ0ZXN0cyBhbmQgdGhlIGFzc2Vzc21lbnQuXG4gIHJ1bjogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBkS2V5ID0gSlNPTi5zdHJpbmdpZnkoaWQuc3Vic3RyKC01LCA1KSlcbiAgICAgICAgdXJsID0gVGFuZ2VyaW5lLnNldHRpbmdzLnVybFZpZXcoXCJncm91cFwiLCBcImJ5REtleVwiKVxuICAgICAgICAkLmFqYXhcbiAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICB0eXBlOiBcIkdFVFwiXG4gICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiXG4gICAgICAgICAgZGF0YToga2V5OiBkS2V5XG4gICAgICAgICAgZXJyb3I6IChhLCBiKSA9PiBAdHJpZ2dlciBcInN0YXR1c1wiLCBcImltcG9ydCBlcnJvclwiLCBcIiN7YX0gI3tifVwiXG4gICAgICAgICAgc3VjY2VzczogKGRhdGEpID0+XG4gICAgICAgICAgICBkb2NMaXN0ID0gW11cbiAgICAgICAgICAgIGZvciBkYXR1bSBpbiBkYXRhLnJvd3NcbiAgICAgICAgICAgICAgZG9jTGlzdC5wdXNoIGRhdHVtLmlkXG4gICAgICAgICAgICAgIGtleUxpc3QgPSBfLnVuaXEoZG9jTGlzdClcbiAgICAgICAgICAgIFRhbmdlcmluZS4kZGIuYWxsRG9jc1xuICAgICAgICAgICAgICBrZXlzIDoga2V5TGlzdFxuICAgICAgICAgICAgICBpbmNsdWRlX2RvY3M6dHJ1ZVxuICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzcG9uc2UpIC0+XG4gICAgICAgICAgICAgICAgZG9jcyA9IFtdXG4gICAgICAgICAgICAgICAgZm9yIHJvdyBpbiByZXNwb25zZS5yb3dzXG4gICAgICAgICAgICAgICAgICBkb2NzLnB1c2ggcm93LmRvY1xuIyAgICAgICAgICAgICAgICBib2R5ID1cbiMgICAgICAgICAgICAgICAgICBkb2NzOiBkb2NzXG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBXaWRnZXRSdW5WaWV3IG1vZGVsOiBkb2NzXG4gICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgcHJpbnQ6ICggYXNzZXNzbWVudElkLCBmb3JtYXQgKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogKCBtb2RlbCApIC0+XG4gICAgICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRQcmludFZpZXdcbiAgICAgICAgICAgICAgbW9kZWwgIDogbW9kZWxcbiAgICAgICAgICAgICAgZm9ybWF0IDogZm9ybWF0XG4gICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICByZXN1bWU6IChhc3Nlc3NtZW50SWQsIHJlc3VsdElkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBdXRoZW50aWNhdGVkOiAtPlxuICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICBcIl9pZFwiIDogYXNzZXNzbWVudElkXG4gICAgICAgIGFzc2Vzc21lbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzIDogKCBhc3Nlc3NtZW50ICkgLT5cbiAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBSZXN1bHRcbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHJlc3VsdElkXG4gICAgICAgICAgICByZXN1bHQuZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogKHJlc3VsdCkgLT5cbiAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IEFzc2Vzc21lbnRSdW5WaWV3XG4gICAgICAgICAgICAgICAgICBtb2RlbDogYXNzZXNzbWVudFxuXG4gICAgICAgICAgICAgICAgaWYgcmVzdWx0LmhhcyhcIm9yZGVyX21hcFwiKVxuICAgICAgICAgICAgICAgICAgIyBzYXZlIHRoZSBvcmRlciBtYXAgb2YgcHJldmlvdXMgcmFuZG9taXphdGlvblxuICAgICAgICAgICAgICAgICAgb3JkZXJNYXAgPSByZXN1bHQuZ2V0KFwib3JkZXJfbWFwXCIpLnNsaWNlKCkgIyBjbG9uZSBhcnJheVxuICAgICAgICAgICAgICAgICAgIyByZXN0b3JlIHRoZSBwcmV2aW91cyBvcmRlcm1hcFxuICAgICAgICAgICAgICAgICAgdmlldy5vcmRlck1hcCA9IG9yZGVyTWFwXG5cbiAgICAgICAgICAgICAgICBmb3Igc3VidGVzdCBpbiByZXN1bHQuZ2V0KFwic3VidGVzdERhdGFcIilcbiAgICAgICAgICAgICAgICAgIGlmIHN1YnRlc3QuZGF0YT8gJiYgc3VidGVzdC5kYXRhLnBhcnRpY2lwYW50X2lkP1xuICAgICAgICAgICAgICAgICAgICBUYW5nZXJpbmUubmF2LnNldFN0dWRlbnQgc3VidGVzdC5kYXRhLnBhcnRpY2lwYW50X2lkXG5cbiAgICAgICAgICAgICAgICAjIHJlcGxhY2UgdGhlIHZpZXcncyByZXN1bHQgd2l0aCBvdXIgb2xkIG9uZVxuICAgICAgICAgICAgICAgIHZpZXcucmVzdWx0ID0gcmVzdWx0XG5cbiAgICAgICAgICAgICAgICAjIEhpamFjayB0aGUgbm9ybWFsIFJlc3VsdCBhbmQgUmVzdWx0VmlldywgdXNlIG9uZSBmcm9tIHRoZSBkYlxuICAgICAgICAgICAgICAgIHZpZXcuc3VidGVzdFZpZXdzLnBvcCgpXG4gICAgICAgICAgICAgICAgdmlldy5zdWJ0ZXN0Vmlld3MucHVzaCBuZXcgUmVzdWx0Vmlld1xuICAgICAgICAgICAgICAgICAgbW9kZWwgICAgICAgICAgOiByZXN1bHRcbiAgICAgICAgICAgICAgICAgIGFzc2Vzc21lbnQgICAgIDogYXNzZXNzbWVudFxuICAgICAgICAgICAgICAgICAgYXNzZXNzbWVudFZpZXcgOiB2aWV3XG4gICAgICAgICAgICAgICAgdmlldy5pbmRleCA9IHJlc3VsdC5nZXQoXCJzdWJ0ZXN0RGF0YVwiKS5sZW5ndGhcbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuXG5cbiAgcmVzdWx0czogKGFzc2Vzc21lbnRJZCkgLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgYWZ0ZXJGZXRjaCA9IChhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnQoXCJfaWRcIjphc3Nlc3NtZW50SWQpLCBhc3Nlc3NtZW50SWQpIC0+XG4gICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBSZXN1bHRzXG4gICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgaW5jbHVkZV9kb2NzOiBmYWxzZVxuICAgICAgICAgICAga2V5OiBcInJcIiArIGFzc2Vzc21lbnRJZFxuICAgICAgICAgICAgc3VjY2VzczogKHJlc3VsdHMpID0+XG4gICAgICAgICAgICAgIHZpZXcgPSBuZXcgUmVzdWx0c1ZpZXdcbiAgICAgICAgICAgICAgICBcImFzc2Vzc21lbnRcIiA6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgICA6IHJlc3VsdHMubW9kZWxzXG4gICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gICAgICAgIGFzc2Vzc21lbnQgPSBuZXcgQXNzZXNzbWVudFxuICAgICAgICAgIFwiX2lkXCIgOiBhc3Nlc3NtZW50SWRcbiAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3MgOiAgLT5cbiAgICAgICAgICAgIGFmdGVyRmV0Y2goYXNzZXNzbWVudCwgYXNzZXNzbWVudElkKVxuICAgICAgICAgIGVycm9yIDogIC0+XG4gICAgICAgICAgICBhZnRlckZldGNoKGFzc2Vzc21lbnQsIGFzc2Vzc21lbnRJZClcblxuXG4gICNcbiAgIyBSZXBvcnRzXG4gICNcbiAga2xhc3NHcm91cGluZzogKGtsYXNzSWQsIHBhcnQpIC0+XG4gICAgcGFydCA9IHBhcnNlSW50KHBhcnQpXG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgICAgYWxsU3VidGVzdHMgPSBuZXcgU3VidGVzdHNcbiAgICAgICAgICBhbGxTdWJ0ZXN0cy5mZXRjaFxuICAgICAgICAgICAgc3VjY2VzczogKCBjb2xsZWN0aW9uICkgLT5cbiAgICAgICAgICAgICAgc3VidGVzdHMgPSBuZXcgU3VidGVzdHMgY29sbGVjdGlvbi53aGVyZSBcInBhcnRcIiA6IHBhcnRcbiAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgYWxsUmVzdWx0cy5mZXRjaFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggcmVzdWx0cyApIC0+XG4gICAgICAgICAgICAgICAgICByZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyByZXN1bHRzLndoZXJlIFwia2xhc3NJZFwiIDoga2xhc3NJZFxuICAgICAgICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgU3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgIHN0dWRlbnRzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG5cbiAgICAgICAgICAgICAgICAgICAgICAjIGZpbHRlciBgUmVzdWx0c2AgYnkgYEtsYXNzYCdzIGN1cnJlbnQgYFN0dWRlbnRzYFxuICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IFN0dWRlbnRzIHN0dWRlbnRzLndoZXJlIFwia2xhc3NJZFwiIDoga2xhc3NJZFxuICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRJZHMgPSBzdHVkZW50cy5wbHVjayhcIl9pZFwiKVxuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNGcm9tQ3VycmVudFN0dWRlbnRzID0gW11cbiAgICAgICAgICAgICAgICAgICAgICBmb3IgcmVzdWx0IGluIHJlc3VsdHMubW9kZWxzXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50cy5wdXNoKHJlc3VsdCkgaWYgcmVzdWx0LmdldChcInN0dWRlbnRJZFwiKSBpbiBzdHVkZW50SWRzXG4gICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWRSZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50c1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBLbGFzc0dyb3VwaW5nVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHVkZW50c1wiIDogc3R1ZGVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgOiBmaWx0ZXJlZFJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcblxuICBtYXN0ZXJ5Q2hlY2s6IChzdHVkZW50SWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHN0dWRlbnQgPSBuZXcgU3R1ZGVudCBcIl9pZFwiIDogc3R1ZGVudElkXG4gICAgICAgIHN0dWRlbnQuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAoc3R1ZGVudCkgLT5cbiAgICAgICAgICAgIGtsYXNzSWQgPSBzdHVkZW50LmdldCBcImtsYXNzSWRcIlxuICAgICAgICAgICAga2xhc3MgPSBuZXcgS2xhc3MgXCJfaWRcIiA6IHN0dWRlbnQuZ2V0IFwia2xhc3NJZFwiXG4gICAgICAgICAgICBrbGFzcy5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAoa2xhc3MpIC0+XG4gICAgICAgICAgICAgICAgYWxsUmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHNcbiAgICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAoIGNvbGxlY3Rpb24gKSAtPlxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyBjb2xsZWN0aW9uLndoZXJlIFwic3R1ZGVudElkXCIgOiBzdHVkZW50SWQsIFwicmVwb3J0VHlwZVwiIDogXCJtYXN0ZXJ5XCIsIFwia2xhc3NJZFwiIDoga2xhc3NJZFxuICAgICAgICAgICAgICAgICAgICAjIGdldCBhIGxpc3Qgb2Ygc3VidGVzdHMgaW52b2x2ZWRcbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdElkTGlzdCA9IHt9XG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RJZExpc3RbcmVzdWx0LmdldChcInN1YnRlc3RJZFwiKV0gPSB0cnVlIGZvciByZXN1bHQgaW4gcmVzdWx0cy5tb2RlbHNcbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdElkTGlzdCA9IF8ua2V5cyhzdWJ0ZXN0SWRMaXN0KVxuXG4gICAgICAgICAgICAgICAgICAgICMgbWFrZSBhIGNvbGxlY3Rpb24gYW5kIGZldGNoXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RDb2xsZWN0aW9uID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgIHN1YnRlc3RDb2xsZWN0aW9uLmFkZCBuZXcgU3VidGVzdChcIl9pZFwiIDogc3VidGVzdElkKSBmb3Igc3VidGVzdElkIGluIHN1YnRlc3RJZExpc3RcbiAgICAgICAgICAgICAgICAgICAgc3VidGVzdENvbGxlY3Rpb24uZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBNYXN0ZXJ5Q2hlY2tWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3R1ZGVudFwiICA6IHN0dWRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZXN1bHRzXCIgIDogcmVzdWx0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcImtsYXNzXCIgICAgOiBrbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RzXCIgOiBzdWJ0ZXN0Q29sbGVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgcHJvZ3Jlc3NSZXBvcnQ6IChzdHVkZW50SWQsIGtsYXNzSWQpIC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgICMgc2F2ZSB0aGlzIGNyYXp5IGZ1bmN0aW9uIGZvciBsYXRlclxuICAgICAgICAjIHN0dWRlbnRJZCBjYW4gaGF2ZSB0aGUgdmFsdWUgXCJhbGxcIiwgaW4gd2hpY2ggY2FzZSBzdHVkZW50IHNob3VsZCA9PSBudWxsXG4gICAgICAgIGFmdGVyRmV0Y2ggPSAoIHN0dWRlbnQsIHN0dWRlbnRzICkgLT5cbiAgICAgICAgICBrbGFzcyA9IG5ldyBLbGFzcyBcIl9pZFwiIDoga2xhc3NJZFxuICAgICAgICAgIGtsYXNzLmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiAoa2xhc3MpIC0+XG4gICAgICAgICAgICAgIGFsbFN1YnRlc3RzID0gbmV3IFN1YnRlc3RzXG4gICAgICAgICAgICAgIGFsbFN1YnRlc3RzLmZldGNoXG4gICAgICAgICAgICAgICAgc3VjY2VzczogKCBhbGxTdWJ0ZXN0cyApIC0+XG4gICAgICAgICAgICAgICAgICBzdWJ0ZXN0cyA9IG5ldyBTdWJ0ZXN0cyBhbGxTdWJ0ZXN0cy53aGVyZVxuICAgICAgICAgICAgICAgICAgICBcImN1cnJpY3VsdW1JZFwiIDoga2xhc3MuZ2V0KFwiY3VycmljdWx1bUlkXCIpXG4gICAgICAgICAgICAgICAgICAgIFwicmVwb3J0VHlwZVwiICAgOiBcInByb2dyZXNzXCJcbiAgICAgICAgICAgICAgICAgIGFsbFJlc3VsdHMgPSBuZXcgS2xhc3NSZXN1bHRzXG4gICAgICAgICAgICAgICAgICBhbGxSZXN1bHRzLmZldGNoXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6ICggY29sbGVjdGlvbiApIC0+XG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IG5ldyBLbGFzc1Jlc3VsdHMgY29sbGVjdGlvbi53aGVyZSBcImtsYXNzSWRcIiA6IGtsYXNzSWQsIFwicmVwb3J0VHlwZVwiIDogXCJwcm9ncmVzc1wiXG5cbiAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyBzdHVkZW50c1xuICAgICAgICAgICAgICAgICAgICAgIGlmIHN0dWRlbnRzP1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBmaWx0ZXIgYFJlc3VsdHNgIGJ5IGBLbGFzc2AncyBjdXJyZW50IGBTdHVkZW50c2BcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRJZHMgPSBzdHVkZW50cy5wbHVjayhcIl9pZFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0c0Zyb21DdXJyZW50U3R1ZGVudHMgPSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzLm1vZGVsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50cy5wdXNoKHJlc3VsdCkgaWYgcmVzdWx0LmdldChcInN0dWRlbnRJZFwiKSBpbiBzdHVkZW50SWRzXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gbmV3IEtsYXNzUmVzdWx0cyByZXN1bHRzRnJvbUN1cnJlbnRTdHVkZW50c1xuXG4gICAgICAgICAgICAgICAgICAgICAgdmlldyA9IG5ldyBQcm9ncmVzc1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3VidGVzdHNcIiA6IHN1YnRlc3RzXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0dWRlbnRcIiAgOiBzdHVkZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBcInJlc3VsdHNcIiAgOiByZXN1bHRzXG4gICAgICAgICAgICAgICAgICAgICAgICBcImtsYXNzXCIgICAgOiBrbGFzc1xuICAgICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gICAgICAgIGlmIHN0dWRlbnRJZCAhPSBcImFsbFwiXG4gICAgICAgICAgc3R1ZGVudCA9IG5ldyBTdHVkZW50IFwiX2lkXCIgOiBzdHVkZW50SWRcbiAgICAgICAgICBzdHVkZW50LmZldGNoXG4gICAgICAgICAgICBzdWNjZXNzOiAtPiBhZnRlckZldGNoIHN0dWRlbnRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHN0dWRlbnRzID0gbmV3IFN0dWRlbnRzXG4gICAgICAgICAgc3R1ZGVudHMuZmV0Y2hcbiAgICAgICAgICAgIHN1Y2Nlc3M6IC0+IGFmdGVyRmV0Y2ggbnVsbCwgc3R1ZGVudHNcblxuICAjXG4gICMgU3VidGVzdHNcbiAgI1xuICBlZGl0U3VidGVzdDogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgaWQgPSBVdGlscy5jbGVhblVSTCBpZFxuICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3QgX2lkIDogaWRcbiAgICAgICAgc3VidGVzdC5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChtb2RlbCwgcmVzcG9uc2UpIC0+XG4gICAgICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHN1YnRlc3QuZ2V0KFwiYXNzZXNzbWVudElkXCIpXG4gICAgICAgICAgICBhc3Nlc3NtZW50LmZldGNoXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgdmlldyA9IG5ldyBTdWJ0ZXN0RWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgIG1vZGVsICAgICAgOiBtb2RlbFxuICAgICAgICAgICAgICAgICAgYXNzZXNzbWVudCA6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICB2bS5zaG93IHZpZXdcbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuICBlZGl0S2xhc3NTdWJ0ZXN0OiAoaWQpIC0+XG5cbiAgICBvblN1Y2Nlc3MgPSAoc3VidGVzdCwgY3VycmljdWx1bSwgcXVlc3Rpb25zPW51bGwpIC0+XG4gICAgICB2aWV3ID0gbmV3IEtsYXNzU3VidGVzdEVkaXRWaWV3XG4gICAgICAgIG1vZGVsICAgICAgOiBzdWJ0ZXN0XG4gICAgICAgIGN1cnJpY3VsdW0gOiBjdXJyaWN1bHVtXG4gICAgICAgIHF1ZXN0aW9ucyAgOiBxdWVzdGlvbnNcbiAgICAgIHZtLnNob3cgdmlld1xuXG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0FkbWluOiAtPlxuICAgICAgICBpZCA9IFV0aWxzLmNsZWFuVVJMIGlkXG4gICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdCBfaWQgOiBpZFxuICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIGN1cnJpY3VsdW0gPSBuZXcgQ3VycmljdWx1bVxuICAgICAgICAgICAgICBcIl9pZFwiIDogc3VidGVzdC5nZXQoXCJjdXJyaWN1bHVtSWRcIilcbiAgICAgICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBpZiBzdWJ0ZXN0LmdldChcInByb3RvdHlwZVwiKSA9PSBcInN1cnZleVwiXG4gICAgICAgICAgICAgICAgICBxdWVzdGlvbnMgPSBuZXcgUXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgICBxdWVzdGlvbnMuZmV0Y2hcbiAgICAgICAgICAgICAgICAgICAga2V5IDogY3VycmljdWx1bS5pZFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9ucyA9IG5ldyBRdWVzdGlvbnMgcXVlc3Rpb25zLndoZXJlKFwic3VidGVzdElkXCI6c3VidGVzdC5pZClcbiAgICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3Mgc3VidGVzdCwgY3VycmljdWx1bSwgcXVlc3Rpb25zXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgb25TdWNjZXNzIHN1YnRlc3QsIGN1cnJpY3VsdW1cbiAgICAgIGlzVXNlcjogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcblxuXG4gICNcbiAgIyBRdWVzdGlvblxuICAjXG4gIGVkaXRRdWVzdGlvbjogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgaWQgPSBVdGlscy5jbGVhblVSTCBpZFxuICAgICAgICBxdWVzdGlvbiA9IG5ldyBRdWVzdGlvbiBfaWQgOiBpZFxuICAgICAgICBxdWVzdGlvbi5mZXRjaFxuICAgICAgICAgIHN1Y2Nlc3M6IChxdWVzdGlvbiwgcmVzcG9uc2UpIC0+XG4gICAgICAgICAgICBhc3Nlc3NtZW50ID0gbmV3IEFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgXCJfaWRcIiA6IHF1ZXN0aW9uLmdldChcImFzc2Vzc21lbnRJZFwiKVxuICAgICAgICAgICAgYXNzZXNzbWVudC5mZXRjaFxuICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgIHN1YnRlc3QgPSBuZXcgU3VidGVzdFxuICAgICAgICAgICAgICAgICAgXCJfaWRcIiA6IHF1ZXN0aW9uLmdldChcInN1YnRlc3RJZFwiKVxuICAgICAgICAgICAgICAgIHN1YnRlc3QuZmV0Y2hcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IC0+XG4gICAgICAgICAgICAgICAgICAgIHZpZXcgPSBuZXcgUXVlc3Rpb25FZGl0Vmlld1xuICAgICAgICAgICAgICAgICAgICAgIFwicXVlc3Rpb25cIiAgIDogcXVlc3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICBcInN1YnRlc3RcIiAgICA6IHN1YnRlc3RcbiAgICAgICAgICAgICAgICAgICAgICBcImFzc2Vzc21lbnRcIiA6IGFzc2Vzc21lbnRcbiAgICAgICAgICAgICAgICAgICAgdm0uc2hvdyB2aWV3XG4gICAgICBpc1VzZXI6IC0+XG4gICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG5cblxuICBlZGl0S2xhc3NRdWVzdGlvbjogKGlkKSAtPlxuICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgaXNBZG1pbjogLT5cbiAgICAgICAgaWQgPSBVdGlscy5jbGVhblVSTCBpZFxuICAgICAgICBxdWVzdGlvbiA9IG5ldyBRdWVzdGlvbiBcIl9pZFwiIDogaWRcbiAgICAgICAgcXVlc3Rpb24uZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiAocXVlc3Rpb24sIHJlc3BvbnNlKSAtPlxuICAgICAgICAgICAgY3VycmljdWx1bSA9IG5ldyBDdXJyaWN1bHVtXG4gICAgICAgICAgICAgIFwiX2lkXCIgOiBxdWVzdGlvbi5nZXQoXCJjdXJyaWN1bHVtSWRcIilcbiAgICAgICAgICAgIGN1cnJpY3VsdW0uZmV0Y2hcbiAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICBzdWJ0ZXN0ID0gbmV3IFN1YnRlc3RcbiAgICAgICAgICAgICAgICAgIFwiX2lkXCIgOiBxdWVzdGlvbi5nZXQoXCJzdWJ0ZXN0SWRcIilcbiAgICAgICAgICAgICAgICBzdWJ0ZXN0LmZldGNoXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICAgICAgICB2aWV3ID0gbmV3IFF1ZXN0aW9uRWRpdFZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBcInF1ZXN0aW9uXCIgICA6IHF1ZXN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgXCJzdWJ0ZXN0XCIgICAgOiBzdWJ0ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgXCJhc3Nlc3NtZW50XCIgOiBjdXJyaWN1bHVtXG4gICAgICAgICAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgI1xuICAjIFVzZXJcbiAgI1xuICBsb2dpbjogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgVGFuZ2VyaW5lLnJvdXRlci5sYW5kaW5nKClcbiAgICAgIGlzVW5yZWdpc3RlcmVkOiAtPlxuXG4gICAgICAgIHNob3dWaWV3ID0gKHVzZXJzID0gW10pIC0+XG4gICAgICAgICAgdmlldyA9IG5ldyBMb2dpblZpZXdcbiAgICAgICAgICAgIHVzZXJzOiB1c2Vyc1xuICAgICAgICAgIHZtLnNob3cgdmlld1xuXG4gICAgICAgIHNob3dWaWV3KClcblxuICBsb2dvdXQ6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIubG9nb3V0KClcblxuICBhY2NvdW50OiAtPlxuICAgICMgY2hhbmdlIHRoZSBsb2NhdGlvbiB0byB0aGUgdHJ1bmssIHVubGVzcyB3ZSdyZSBhbHJlYWR5IGluIHRoZSB0cnVua1xuICAgIGlmIFRhbmdlcmluZS5kYl9uYW1lICE9IFwidGFuZ2VyaW5lXCJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IFRhbmdlcmluZS5zZXR0aW5ncy51cmxJbmRleChcInRydW5rXCIsIFwiYWNjb3VudFwiKVxuICAgIGVsc2VcbiAgICAgIFRhbmdlcmluZS51c2VyLnZlcmlmeVxuICAgICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgICAgdmlldyA9IG5ldyBBY2NvdW50Vmlld1xuICAgICAgICAgICAgdXNlciA6IFRhbmdlcmluZS51c2VyXG4gICAgICAgICAgdm0uc2hvdyB2aWV3XG5cbiAgc2V0dGluZ3M6IC0+XG4gICAgVGFuZ2VyaW5lLnVzZXIudmVyaWZ5XG4gICAgICBpc0F1dGhlbnRpY2F0ZWQ6IC0+XG4gICAgICAgIHZpZXcgPSBuZXcgU2V0dGluZ3NWaWV3XG4gICAgICAgIHZtLnNob3cgdmlld1xuXG5cbiAgbG9nczogLT5cbiAgICBUYW5nZXJpbmUudXNlci52ZXJpZnlcbiAgICAgIGlzQXV0aGVudGljYXRlZDogLT5cbiAgICAgICAgbG9ncyA9IG5ldyBMb2dzXG4gICAgICAgIGxvZ3MuZmV0Y2hcbiAgICAgICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAgICAgdmlldyA9IG5ldyBMb2dWaWV3XG4gICAgICAgICAgICAgIGxvZ3M6IGxvZ3NcbiAgICAgICAgICAgIHZtLnNob3cgdmlld1xuXG5cblxuXG4gICMgVHJhbnNmZXIgYSBuZXcgdXNlciBmcm9tIHRhbmdlcmluZS1jZW50cmFsIGludG8gdGFuZ2VyaW5lXG4gIHRyYW5zZmVyOiAtPlxuICAgIGdldFZhcnMgPSBVdGlscy4kX0dFVCgpXG4gICAgbmFtZSA9IGdldFZhcnMubmFtZVxuICAgICQuY291Y2gubG9nb3V0XG4gICAgICBzdWNjZXNzOiA9PlxuICAgICAgICAkLmNvb2tpZSBcIkF1dGhTZXNzaW9uXCIsIG51bGxcbiAgICAgICAgJC5jb3VjaC5sb2dpblxuICAgICAgICAgIFwibmFtZVwiICAgICA6IG5hbWVcbiAgICAgICAgICBcInBhc3N3b3JkXCIgOiBuYW1lXG4gICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAgICAgICBlcnJvcjogLT5cbiAgICAgICAgICAgICQuY291Y2guc2lnbnVwXG4gICAgICAgICAgICAgIFwibmFtZVwiIDogIG5hbWVcbiAgICAgICAgICAgICAgXCJyb2xlc1wiIDogW1wiX2FkbWluXCJdXG4gICAgICAgICAgICAsIG5hbWUsXG4gICAgICAgICAgICBzdWNjZXNzOiAtPlxuICAgICAgICAgICAgICB1c2VyID0gbmV3IFVzZXJcbiAgICAgICAgICAgICAgdXNlci5zYXZlXG4gICAgICAgICAgICAgICAgXCJuYW1lXCIgIDogbmFtZVxuICAgICAgICAgICAgICAgIFwiaWRcIiAgICA6IFwidGFuZ2VyaW5lLnVzZXI6XCIrbmFtZVxuICAgICAgICAgICAgICAgIFwicm9sZXNcIiA6IFtdXG4gICAgICAgICAgICAgICAgXCJmcm9tXCIgIDogXCJ0Y1wiXG4gICAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICB3YWl0OiB0cnVlXG4gICAgICAgICAgICAgICAgc3VjY2VzczogLT5cbiAgICAgICAgICAgICAgICAgICQuY291Y2gubG9naW5cbiAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCIgICAgIDogbmFtZVxuICAgICAgICAgICAgICAgICAgICBcInBhc3N3b3JkXCIgOiBuYW1lXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgOiAtPlxuICAgICAgICAgICAgICAgICAgICAgIFRhbmdlcmluZS5yb3V0ZXIubGFuZGluZygpXG4gICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAtPlxuICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLnN0aWNreSBcIkVycm9yIHRyYW5zZmVyaW5nIHVzZXIuXCJcbiJdfQ==
