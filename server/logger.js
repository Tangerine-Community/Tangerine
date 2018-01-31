'use strict';

const winston = require('winston');
const Settings = require('./Settings');

// Set up the logger
var logger = new winston.Logger({
  level: Settings.T_LOG_LEVEL,
  transports: [
    new (winston.transports.Console)(
      {
        timestamp: function () {
          var ts = new Date()
          return JSON.stringify(ts)
        }
      }
    )//,
    //new (winston.transports.File)({ filename: 'robbert.log' })
  ],
  formatter: function(options) {
    let time = options.timestamp();
    let level = options.level.toUpperCase();
    let message = (undefined !== options.message ? options.message : '');
    let meta = (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
    return `${time} ${level} ${message} ${meta}`;
  }
});

module.exports = logger;