
var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation



/* ==========================================================
 Create a Route (/upload) to handle the Form submission
 (handle POST requests to /upload)
 Express v4  Route definition
 ============================================================ */
var upload = function (req, res, next) {

    var fstream, savedFile, groupName;
    var lpPath = __dirname + '/../../../client/lesson_plan_media/';
    var tmpDir = lpPath + 'tmp/';
    fs.ensureDir(tmpDir, function (err) {
        // if (err) return console.error(err)
        // dir has now been created, including the directory it is to be placed in
    })

    req.pipe(req.busboy);

    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);

        //Path where file will be uploaded
        fstream = fs.createWriteStream(tmpDir + filename);
        savedFile = filename
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log("Upload Finished of " + filename);
            // res.redirect('back');           //where to go next
        });
    });
    req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        // console.log('Field [' + fieldname + ']: value: ' + val);
        if (fieldname == "groupName") {
            groupName = val
        }
    });
    req.busboy.on('finish', function() {
        console.log('Done parsing form for savedFile: ' + savedFile + " and groupName: " + groupName);
        var fs = require('fs-extra')

        var dest = lpPath + groupName + '/' + savedFile
        fs.ensureDir(lpPath + groupName, function (err) {
            // console.log(err) // => null
            // dir has now been created, including the directory it is to be placed in
            fs.move(tmpDir + savedFile, dest, function (err) {
                if (err) {
                    if (err.code == 'EEXIST') {
                        // it's ok
                    } else {
                        return console.error(err)
                    }
                } else {
                    console.log("File copied to " + dest)
                }
            })
        })
        res.writeHead(200, { 'Connection': 'close' });
        res.end("That's all folks!");
    });
    }

module.exports = upload;