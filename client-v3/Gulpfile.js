
var gulp = require("gulp");
var rename = require("gulp-rename");
var modifyFile = require("gulp-modify-file");
var async = require("async");
var cheerio = require("gulp-cheerio");
var pd = require("pretty-data").pd;
var removeEmptyLines = require('gulp-remove-empty-lines');

function copyArray(source) {
    var copy = [];
    for (elem of source) {
        copy.push(elem);
    }
    return copy;
}

function getNodeIndexFromNodeList(nodeList, node) {
    for (var i = 0, iLen = nodeList.length; i < iLen; i++) {
        if (nodeList[i].attr("id") == node.attr("id")) {
            return i;
        }
    }
    return -1;
}

function removeNodeFromList(nodeList, node) {
    return nodeList.splice(getNodeIndexFromNodeList(nodeList, node), 1);
}

const PATH_I18N_LANGUAGES = "./src/i18n";
const FILE_SOURCE_I18N = "./src/i18n/messages.xlf";
const XLF_MASK = "/*.xlf";


var currentNodes = [];


/**
 * Create translation files for languages passed as arguments from source translation file
 * It must be run after extracting i18n labels from templates "node_modules/.bin/ng-xi18n"
 *
 * Sample: gulp i18n-init --languages "es, en, de, fr"
 */
gulp.task("i18n-init", function (done) {
    console.log("Creating translation files...");

    if (5 > process.argv.length) {
        throw new Error('Not enough arguments. Sample: gulp i18n-init --languages "es, en, de, fr"');
    }

    var tasks = [];
    var languages = process.argv[4].replace(/\s+/g, "").split(",");

    for (var i = 0; i < languages.length; i++) {
        tasks.push(function () {
            var language = languages[i];
            return function (callback) {
                gulp.src(FILE_SOURCE_I18N)
                    .pipe(rename(function (path) {
                        path.basename = "messages." + language;
                        console.log("==>", PATH_I18N_LANGUAGES + "/" + path.basename + path.extname);
                    }))
                    .pipe(gulp.dest(PATH_I18N_LANGUAGES))
                    .on("end", callback)
            }
        }());
    }
    async.parallel(tasks, done);
});

/**
 * Process source translation file to generate a list of its nodes
 * It must be run before "i18n-update:merge" task
 */
gulp.task("i18n-update:init", function () {
    console.log("Processing source file...");

    return gulp.src(FILE_SOURCE_I18N)
        .pipe(cheerio({
            run: function ($, file) {
                $("trans-unit").each(function () {
                    var node = $(this);
                    currentNodes.push(node);
                });
                console.log("==>", file.path);
            }
            ,
            parserOptions: {
                xmlMode: true
            }
        }))
});

/**
 * Merge source translation file with existing ones
 * Remove unused nodes (not in source)
 * Keep nodes intersection
 * It must be run after "i18n-update:init" task
 */
gulp.task("i18n-update:merge", ["i18n-update:init"], function () {
    console.log("Processing translation files...");

    return gulp.src(PATH_I18N_LANGUAGES + XLF_MASK)
        .pipe(cheerio({
            run: function ($, file) {
                var transNodes = copyArray(currentNodes);

                $("trans-unit").each(function () {
                    var node = $(this);

                    if (-1 === getNodeIndexFromNodeList(transNodes, node)) {
                        node.remove();

                    } else {
                        removeNodeFromList(transNodes, node);
                    }
                });

                for (elem of transNodes) {
                    $("body").append(elem);
                }
                console.log("==>", file.path);
            }
            ,
            parserOptions: {
                xmlMode: true
            }
        }))
        .pipe(modifyFile(function (content) {
            return pd.xml(content)
        }))
        .pipe(removeEmptyLines())
        .pipe(gulp.dest(PATH_I18N_LANGUAGES));
});

/**
 * Task pipe to init & merge i18n translation files
 */
gulp.task("i18n-update", ["i18n-update:merge", "i18n-update:init"]);
