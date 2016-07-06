/*
Copyright (c) 2010 Ryan Schuft (ryan.schuft@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
  This code is based in part on the work done in Ruby to support
  infection as part of Ruby on Rails in the ActiveSupport's Inflector
  and Inflections classes.  It was initally ported to Javascript by
  Ryan Schuft (ryan.schuft@gmail.com) in 2007.

  The code is available at http://code.google.com/p/inflection-js/

  The basic usage is:
    1. Include this script on your web page.
    2. Call functions on any String object in Javascript

  Currently implemented functions:

    String.pluralize(plural) == String
      renders a singular English language noun into its plural form
      normal results can be overridden by passing in an alternative

    String.singularize(singular) == String
      renders a plural English language noun into its singular form
      normal results can be overridden by passing in an alterative

    String.camelize(lowFirstLetter) == String
      renders a lower case underscored word into camel case
      the first letter of the result will be upper case unless you pass true
      also translates "/" into "::" (underscore does the opposite)

    String.underscore() == String
      renders a camel cased word into words seperated by underscores
      also translates "::" back into "/" (camelize does the opposite)

    String.humanize(lowFirstLetter) == String
      renders a lower case and underscored word into human readable form
      defaults to making the first letter capitalized unless you pass true

    String.capitalize() == String
      renders all characters to lower case and then makes the first upper

    String.dasherize() == String
      renders all underbars and spaces as dashes

    String.titleize() == String
      renders words into title casing (as for book titles)

    String.demodulize() == String
      renders class names that are prepended by modules into just the class

    String.tableize() == String
      renders camel cased singular words into their underscored plural form

    String.classify() == String
      renders an underscored plural word into its camel cased singular form

    String.foreign_key(dropIdUbar) == String
      renders a class name (camel cased singular noun) into a foreign key
      defaults to seperating the class from the id with an underbar unless
      you pass true

    String.ordinalize() == String
      renders all numbers found in the string into their sequence like "22nd"
*/
window&&!window.InflectionJS&&(window.InflectionJS=null); InflectionJS={uncountable_words:"equipment information rice money species series fish sheep moose deer news".split(" "),plural_rules:[[RegExp("(m)an$","gi"),"$1en"],[RegExp("(pe)rson$","gi"),"$1ople"],[RegExp("(child)$","gi"),"$1ren"],[RegExp("^(ox)$","gi"),"$1en"],[RegExp("(ax|test)is$","gi"),"$1es"],[RegExp("(octop|vir)us$","gi"),"$1i"],[RegExp("(alias|status)$","gi"),"$1es"],[RegExp("(bu)s$","gi"),"$1ses"],[RegExp("(buffal|tomat|potat)o$","gi"),"$1oes"],[RegExp("([ti])um$","gi"),"$1a"],[RegExp("sis$", "gi"),"ses"],[RegExp("(?:([^f])fe|([lr])f)$","gi"),"$1$2ves"],[RegExp("(hive)$","gi"),"$1s"],[RegExp("([^aeiouy]|qu)y$","gi"),"$1ies"],[RegExp("(x|ch|ss|sh)$","gi"),"$1es"],[RegExp("(matr|vert|ind)ix|ex$","gi"),"$1ices"],[RegExp("([m|l])ouse$","gi"),"$1ice"],[RegExp("(quiz)$","gi"),"$1zes"],[RegExp("s$","gi"),"s"],[RegExp("$","gi"),"s"]],singular_rules:[[RegExp("(m)en$","gi"),"$1an"],[RegExp("(pe)ople$","gi"),"$1rson"],[RegExp("(child)ren$","gi"),"$1"],[RegExp("([ti])a$","gi"),"$1um"],[RegExp("((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$", "gi"),"$1$2sis"],[RegExp("(hive)s$","gi"),"$1"],[RegExp("(tive)s$","gi"),"$1"],[RegExp("(curve)s$","gi"),"$1"],[RegExp("([lr])ves$","gi"),"$1f"],[RegExp("([^fo])ves$","gi"),"$1fe"],[RegExp("([^aeiouy]|qu)ies$","gi"),"$1y"],[RegExp("(s)eries$","gi"),"$1eries"],[RegExp("(m)ovies$","gi"),"$1ovie"],[RegExp("(x|ch|ss|sh)es$","gi"),"$1"],[RegExp("([m|l])ice$","gi"),"$1ouse"],[RegExp("(bus)es$","gi"),"$1"],[RegExp("(o)es$","gi"),"$1"],[RegExp("(shoe)s$","gi"),"$1"],[RegExp("(cris|ax|test)es$","gi"),"$1is"], [RegExp("(octop|vir)i$","gi"),"$1us"],[RegExp("(alias|status)es$","gi"),"$1"],[RegExp("^(ox)en","gi"),"$1"],[RegExp("(vert|ind)ices$","gi"),"$1ex"],[RegExp("(matr)ices$","gi"),"$1ix"],[RegExp("(quiz)zes$","gi"),"$1"],[RegExp("s$","gi"),""]],non_titlecased_words:"and or nor a an the so but to of at by from into on onto off out in over with for".split(" "),id_suffix:RegExp("(_ids|_id)$","g"),underbar:RegExp("_","g"),space_or_underbar:RegExp("[ _]","g"),uppercase:RegExp("([A-Z])","g"),underbar_prefix:/^_/, apply_rules:function(a,b,c,d){if(d)a=d;else if(!(-1<c.indexOf(a.toLowerCase())))for(c=0;c<b.length;c++)if(a.match(b[c][0])){a=a.replace(b[c][0],b[c][1]);break}return a}};Array.prototype.indexOf||(Array.prototype.indexOf=function(a,b,c){b||(b=-1);for(var d=-1;b<this.length;b++)if(this[b]===a||c&&c(this[b],a)){d=b;break}return d});String.prototype._uncountable_words||(String.prototype._uncountable_words=InflectionJS.uncountable_words); String.prototype._plural_rules||(String.prototype._plural_rules=InflectionJS.plural_rules);String.prototype._singular_rules||(String.prototype._singular_rules=InflectionJS.singular_rules);String.prototype._non_titlecased_words||(String.prototype._non_titlecased_words=InflectionJS.non_titlecased_words);String.prototype.pluralize||(String.prototype.pluralize=function(a){return InflectionJS.apply_rules(this,this._plural_rules,this._uncountable_words,a)}); String.prototype.singularize||(String.prototype.singularize=function(a){return InflectionJS.apply_rules(this,this._singular_rules,this._uncountable_words,a)});String.prototype.camelize||(String.prototype.camelize=function(a){for(var b=this.toLowerCase(),b=b.split("/"),c=0;c<b.length;c++){for(var d=b[c].split("_"),e=a&&c+1===b.length?1:0;e<d.length;e++)d[e]=d[e].charAt(0).toUpperCase()+d[e].substring(1);b[c]=d.join("")}return b=b.join("::")}); String.prototype.underscore||(String.prototype.underscore=function(){var a;a=this.split("::");for(var b=0;b<a.length;b++)a[b]=a[b].replace(InflectionJS.uppercase,"_$1"),a[b]=a[b].replace(InflectionJS.underbar_prefix,"");return a=a.join("/").toLowerCase()});String.prototype.humanize||(String.prototype.humanize=function(a){var b=this.toLowerCase(),b=b.replace(InflectionJS.id_suffix,""),b=b.replace(InflectionJS.underbar," ");a||(b=b.capitalize());return b}); String.prototype.capitalize||(String.prototype.capitalize=function(){var a=this.toLowerCase();return a=a.substring(0,1).toUpperCase()+a.substring(1)});String.prototype.dasherize||(String.prototype.dasherize=function(){var a;return a=this.replace(InflectionJS.space_or_underbar,"-")}); String.prototype.titleize||(String.prototype.titleize=function(){for(var a=this.toLowerCase(),a=a.replace(InflectionJS.underbar," "),a=a.split(" "),b=0;b<a.length;b++){for(var c=a[b].split("-"),d=0;d<c.length;d++)0>this._non_titlecased_words.indexOf(c[d].toLowerCase())&&(c[d]=c[d].capitalize());a[b]=c.join("-")}a=a.join(" ");return a=a.substring(0,1).toUpperCase()+a.substring(1)});String.prototype.demodulize||(String.prototype.demodulize=function(){var a;a=this.split("::");return a=a[a.length-1]}); String.prototype.tableize||(String.prototype.tableize=function(){var a;return a=this.underscore().pluralize()});String.prototype.classify||(String.prototype.classify=function(){var a;return a=this.camelize().singularize()});String.prototype.foreign_key||(String.prototype.foreign_key=function(a){return a=this.demodulize().underscore()+(a?"":"_")+"id"}); String.prototype.ordinalize||(String.prototype.ordinalize=function(){var a;a=this.split(" ");for(var b=0;b<a.length;b++)if(NaN===parseInt(a[b])){var c=a[b].substring(a[b].length-2),d=a[b].substring(a[b].length-1),e="th";"11"!=c&&("12"!=c&&"13"!=c)&&("1"===d?e="st":"2"===d?e="nd":"3"===d&&(e="rd"));a[b]+=e}return a=a.join(" ")});
