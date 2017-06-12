'use strict';

const Result = require('../../Result');

const HttpStatus = require('http-status-codes');

const errorHandler = require('../../utils/errorHandler');
const logger = require('../../logger');

/** Returns some basic user info. */
const getResultPhoto = function(req, res) {

  const groupName = req.params.group.replace("group-", "");
  const resultId = req.params.result;
  const subtestId = req.params.subtest;

  const result = new Result({
    groupName : groupName,
    id        : resultId
  });

  result.fetch()
    .then(function(response){
      var singleSubtest = null;

      response.attributes.subtestData.forEach(function(subtestEl){
        if(subtestEl.subtestId === subtestId){
          singleSubtest = subtestEl;
        }
      });

      if(singleSubtest != null){
        var data = singleSubtest.data.imageBase64;
        var img = new Buffer(data, 'base64');

        res.writeHead(200, {
          'Content-Type': singleSubtest.data.mimeType,
          'Content-Length': img.length
        });
        res.end(img); 
      } else {
        errorHandler(res)
      }
    })
    .catch(errorHandler(res));

};

module.exports = getResultPhoto;