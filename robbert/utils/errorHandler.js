'use strict';
/** Handles errors in a standardized way.
 * usage:
 *   fn(req, res) {
 *     (new Promise(fn)).catch(errorHandler(res))
 *   }
*/

const errorHandler = function(res){
  return function(err){
    if (err.stack) { console.error(err.stack); }
    let result = { message : err.message };
    if (err.suggest) { result.suggest = err.suggest; }
    if (err.next)    { result.next    = err.next; }
    res
      .status(err.status)
      .json(result);
  };
};

module.exports = errorHandler;
