
var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation



/* ==========================================================
 Create a Route (/upload) to handle the Form submission
 (handle POST requests to /upload)
 Express v4  Route definition
 ============================================================ */
var upload = function (req, res, next) {

        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where file will be uploaded
            fstream = fs.createWriteStream(__dirname + '/../../../client/src/lesson_plan_media/' + filename);
            file.pipe(fstream);
            fstream.on('close', function () {
                console.log("Upload Finished of " + filename);
                // res.redirect('back');           //where to go next
            });
        });
    }

module.exports = upload;