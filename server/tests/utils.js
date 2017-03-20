'use strict';

/*
 * utility functions
 */

const randomness = function(len) {
  'use strict';
  const cSet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const cSetLen = cSet.length;
  let result = '';
  while(len--) { result += cSet.charAt(Math.floor(Math.random() * cSet.length)); }
  return result;
};

module.exports = {
  randomness: randomness
};