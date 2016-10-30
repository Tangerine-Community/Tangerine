// convert from UTF-8 to ISO-8859-1
var Buffer = require('buffer').Buffer;
var Iconv  = require('iconv').Iconv;
var assert = require('assert');

var iconv = new Iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE');
var buffer = iconv.convert('7 AM_የአበባ_አዳዲስ_ልብሶች');
// var buffer = iconv.convert('wassap');
// var buffer = iconv.convert('ça va');
var buffer2 = iconv.convert(new Buffer('wassap'));
// assert.equals(buffer.inspect(), buffer2.inspect());
// do something useful with the buffers
console.log(buffer.toString('utf8'))