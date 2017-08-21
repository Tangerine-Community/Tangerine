#!/usr/bin/env node

var Summary =  require('./server/Summary.js')
Summary(function(summary) { 
  console.log(JSON.stringify(summary, null, 2)) 
})
