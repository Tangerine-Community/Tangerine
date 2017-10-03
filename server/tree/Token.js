/** Generates tokens for downloading APKs */
var Token = function() {};

// How long the download token is
Object.defineProperty(Token, 'TOKEN_LENGTH', {
  value : 6,
  writable: false,
  configurable: false,
  enumerable: true
});

/** this character set is used to create a token that will be used to download
* an APK. We assumed that the token will be entered by a human using a mobile
* devices' keyboard. To expedite entry, only lower case it used and no numbers.
* To eliminate human error the chracters below omit
* omitted  | looks like
*  l           I, 1
*  f           t
*  q           g
*  j           i
*/
Object.defineProperty(Token, 'CHARACTER_SET', {
  value: ['a','b','c','d','e','g','h','i','k','m','n','o','p','r','s','t','u','w','x','y','z'],
  writable: false,
  configurable: false,
  enumerable: true
});

Token.make = function() {
  var result = ''
  for (var i = 0; i < Token.TOKEN_LENGTH; i++) {
    result += Token.CHARACTER_SET[Math.round(Math.random() * Token.CHARACTER_SET.length - 1)];
  }
  return result;
};

module.exports = Token;
