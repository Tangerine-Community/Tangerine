/*********************************************************************
*  #### Twitter Post Fetcher v15.0.1 ####
*  Coded by Jason Mayes 2015. A present to all the developers out there.
*  www.jasonmayes.com
*  Please keep this disclaimer with my code if you use it. Thanks. :-)
*  Got feedback or questions, ask here:
*  http://www.jasonmayes.com/projects/twitterApi/
*  Github: https://github.com/jasonmayes/Twitter-Post-Fetcher
*  Updates will be posted to this site.
*********************************************************************/
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals.
    factory();
  }
}(this, function() {
  var domNode = '';
  var maxTweets = 20;
  var parseLinks = true;
  var queue = [];
  var inProgress = false;
  var printTime = true;
  var printUser = true;
  var formatterFunction = null;
  var supportsClassName = true;
  var showRts = true;
  var customCallbackFunction = null;
  var showInteractionLinks = true;
  var showImages = false;
  var targetBlank = true;
  var lang = 'en';
  var permalinks = true;
  var dataOnly = false;
  var script = null;
  var scriptAdded = false;

  function handleTweets(tweets){
    if (customCallbackFunction === null) {
      var x = tweets.length;
      var n = 0;
      var element = document.getElementById(domNode);
      var html = '<ul>';
      while(n < x) {
        html += '<li style="list-style-type:none">' + tweets[n] + '</li>';
        n++;
      }
      html += '</ul>';
      element.innerHTML = html;
    } else {
      customCallbackFunction(tweets);
    }
  }

  function strip(data) {
    return data.replace(/<b[^>]*>(.*?)<\/b>/gi, function(a,s){return s;})
        .replace(/class="(?!(tco-hidden|tco-display|tco-ellipsis))+.*?"|data-query-source=".*?"|dir=".*?"|rel=".*?"/gi,
        '');
  }

  function targetLinksToNewWindow(el) {
    var links = el.getElementsByTagName('a');
    var linksText = '';
    for (var i = links.length - 1; i >= 0; i--) {
      linksText = links[i].innerHTML;
      //alert(linksText);//jw added this to shorten long links and does not apply to twitter image for avatar
      links[i].setAttribute('target', '_blank');
      if (linksText.length >= 110 && linksText.indexOf('TweetAuthor-avatar') == -1) { links[i].innerHTML = 'More...'};
    }
  }

  function getElementsByClassName (node, classname) {
    var a = [];
    var regex = new RegExp('(^| )' + classname + '( |$)');
    var elems = node.getElementsByTagName('*');
    for (var i = 0, j = elems.length; i < j; i++) {
        if(regex.test(elems[i].className)){
          a.push(elems[i]);
        }
    }
    return a;
  }

  function extractImageUrl(image_data) {
    if (image_data !== undefined && image_data.innerHTML.indexOf('data-srcset') >= 0) {
      var data_src = image_data.innerHTML
          .match(/data-srcset="([A-z0-9%_\.-]+)/i)[0];
      return decodeURIComponent(data_src).split('"')[1];
    }
  }

  var twitterFetcher = {
    fetch: function(config) {
      if (config.maxTweets === undefined) {
        config.maxTweets = 20;
      }
      if (config.enableLinks === undefined) {
        config.enableLinks = true;
      }
      if (config.showUser === undefined) {
        config.showUser = true;
      }
      if (config.showTime === undefined) {
        config.showTime = true;
      }
      if (config.dateFunction === undefined) {
        config.dateFunction = 'default';
      }
      if (config.showRetweet === undefined) {
        config.showRetweet = true;
      }
      if (config.customCallback === undefined) {
        config.customCallback = null;
      }
      if (config.showInteraction === undefined) {
        config.showInteraction = true;
      }
      if (config.showImages === undefined) {
        config.showImages = false;
      }
      if (config.linksInNewWindow === undefined) {
        config.linksInNewWindow = true;
      }
      if (config.showPermalinks === undefined) {
        config.showPermalinks = true;
      }
      if (config.dataOnly === undefined) {
        config.dataOnly = false;
      }

      if (inProgress) {
        queue.push(config);
      } else {
        inProgress = true;

        domNode = config.domId;
        maxTweets = config.maxTweets;
        parseLinks = config.enableLinks;
        printUser = config.showUser;
        printTime = config.showTime;
        showRts = config.showRetweet;
        formatterFunction = config.dateFunction;
        customCallbackFunction = config.customCallback;
        showInteractionLinks = config.showInteraction;
        showImages = config.showImages;
        targetBlank = config.linksInNewWindow;
        permalinks = config.showPermalinks;
        dataOnly = config.dataOnly;

        var head = document.getElementsByTagName('head')[0];
        if (script !== null) {
          head.removeChild(script);
        }
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://cdn.syndication.twimg.com/widgets/timelines/' +
            config.id + '?&lang=' + (config.lang || lang) +
            '&callback=twitterFetcher.callback&' +
            'suppress_response_codes=true&rnd=' + Math.random();
        head.appendChild(script);
      }
    },
    callback: function(data) {
      var div = document.createElement('div');
      div.innerHTML = data.body;
      if (typeof(div.getElementsByClassName) === 'undefined') {
         supportsClassName = false;
      }

      function swapDataSrc(element) {
        var avatarImg = element.getElementsByTagName('img')[0];
        avatarImg.src = avatarImg.getAttribute('data-src-1x');
        return element;
      };

      var tweets = [];
      var authors = [];
      var times = [];
      var images = [];
      var rts = [];
      var tids = [];
      var permalinksURL = [];
      var x = 0;

      if (supportsClassName) {
        var tmp = div.getElementsByClassName('timeline-Tweet');
        while (x < tmp.length) {
          if (tmp[x].getElementsByClassName('timeline-Tweet-retweetCredit').length > 0) {
            rts.push(true);
          } else {
            rts.push(false);
          }
          if (!rts[x] || rts[x] && showRts) {
            tweets.push(tmp[x].getElementsByClassName('timeline-Tweet-text')[0]);
            tids.push(tmp[x].getAttribute('data-tweet-id'));
            authors.push(swapDataSrc(tmp[x]
                .getElementsByClassName('timeline-Tweet-author')[0]));
            times.push(tmp[x].getElementsByClassName('dt-updated')[0]);
            permalinksURL.push(tmp[x].getElementsByClassName('timeline-Tweet-timestamp')[0]);
            if (tmp[x].getElementsByClassName('timeline-Tweet-media')[0] !==
                undefined) {
              images.push(tmp[x].getElementsByClassName('timeline-Tweet-media')[0]);
            } else {
              images.push(undefined);
            }
          }
          x++;
        }
      } else {
        var tmp = getElementsByClassName(div, 'timeline-Tweet');
        while (x < tmp.length) {
          if (getElementsByClassName(tmp[x], 'timeline-Tweet-retweetCredit').length > 0) {
            rts.push(true);
          } else {
            rts.push(false);
          }
          if (!rts[x] || rts[x] && showRts) {
            tweets.push(getElementsByClassName(tmp[x], 'timeline-Tweet-text')[0]);
            tids.push(tmp[x].getAttribute('data-tweet-id'));
            authors.push(swapDataSrc(getElementsByClassName(tmp[x],
                'timeline-Tweet-author')[0]));
            times.push(getElementsByClassName(tmp[x], 'dt-updated')[0]);
            permalinksURL.push(getElementsByClassName(tmp[x], 'timeline-Tweet-timestamp')[0]);
            if (getElementsByClassName(tmp[x], 'timeline-Tweet-media')[0] !== undefined) {
              images.push(getElementsByClassName(tmp[x], 'timeline-Tweet-media')[0]);
            } else {
              images.push(undefined);
            }
          }
          x++;
        }
      }

      if (tweets.length > maxTweets) {
        tweets.splice(maxTweets, (tweets.length - maxTweets));
        authors.splice(maxTweets, (authors.length - maxTweets));
        times.splice(maxTweets, (times.length - maxTweets));
        rts.splice(maxTweets, (rts.length - maxTweets));
        images.splice(maxTweets, (images.length - maxTweets));
        permalinksURL.splice(maxTweets, (permalinksURL.length - maxTweets));
      }

      var arrayTweets = [];
      var x = tweets.length;
      var n = 0;
      if (dataOnly) {
        while (n < x) {
          arrayTweets.push({
            tweet: tweets[n].innerHTML,
            author: authors[n].innerHTML,
            time: times[n].textContent,
            image: extractImageUrl(images[n]),
            rt: rts[n],
            tid: tids[n],
            permalinkURL: (permalinksURL[n] === undefined) ?
                '' : permalinksURL[n].href 
          });
          n++;
        }
      } else {
        while (n < x) {
          if (typeof(formatterFunction) !== 'string') {
            var datetimeText = times[n].getAttribute('datetime');
            var newDate = new Date(times[n].getAttribute('datetime')
                .replace(/-/g,'/').replace('T', ' ').split('+')[0]);
            var dateString = formatterFunction(newDate, datetimeText);
            times[n].setAttribute('aria-label', dateString);

            if (tweets[n].textContent) {
              // IE hack.
              if (supportsClassName) {
                times[n].textContent = dateString;
              } else {
                var h = document.createElement('p');
                var t = document.createTextNode(dateString);
                h.appendChild(t);
                h.setAttribute('aria-label', dateString);
                times[n] = h;
              }
            } else {
              times[n].textContent = dateString;
            }
          }
          var op = '';
          if (parseLinks) {
            if (targetBlank) {
              targetLinksToNewWindow(tweets[n]);
              if (printUser) {
                targetLinksToNewWindow(authors[n]);
              }
            }
            if (printUser) {
              op += '<div class="user">' + strip(authors[n].innerHTML) +
                  '</div>';
            }
            op += '<p class="tweet">' + strip(tweets[n].innerHTML) + '</p>';
            if (printTime) {
              if (permalinks) {
                op += '<p class="timePosted"><a href="' + permalinksURL[n] +
                   '">' + times[n].getAttribute('aria-label') + '</a></p>';
              } else {
                op += '<p class="timePosted">' +
                    times[n].getAttribute('aria-label') + '</p>';
              }
            }
          } else {
            if (tweets[n].textContent) {
              if (printUser) {
                op += '<p class="user">' + authors[n].textContent + '</p>';
              }
              op += '<p class="tweet">' +  tweets[n].textContent + '</p>';
              if (printTime) {
                op += '<p class="timePosted">' + times[n].textContent + '</p>';
              }

            } else {
              if (printUser) {
                op += '<p class="user">' + authors[n].textContent + '</p>';
              }
              op += '<p class="tweet">' +  tweets[n].textContent + '</p>';
              if (printTime) {
                op += '<p class="timePosted">' + times[n].textContent + '</p>';
              }
            }
          }
          if (showInteractionLinks) {
            op += '<p class="interact"><a href="https://twitter.com/intent/' +
                'tweet?in_reply_to=' + tids[n] +
                '" class="twitter_reply_icon"' +
                (targetBlank ? ' target="_blank">' : '>') +
                'Reply</a><a href="https://twitter.com/intent/retweet?' +
                'tweet_id=' + tids[n] + '" class="twitter_retweet_icon"' +
                (targetBlank ? ' target="_blank">' : '>') + 'Retweet</a>' +
                '<a href="https://twitter.com/intent/favorite?tweet_id=' +
                tids[n] + '" class="twitter_fav_icon"' +
                (targetBlank ? ' target="_blank">' : '>') + 'Favorite</a></p>';
          }

          if (showImages && images[n] !== undefined) {
            op += '<div class="media">' +
                '<img src="' + extractImageUrl(images[n]) +
                '" alt="Image from tweet" />' + '</div>';
          }

          arrayTweets.push(op);
          n++;
        }
      }

      handleTweets(arrayTweets);
      inProgress = false;

      if (queue.length > 0) {
        twitterFetcher.fetch(queue[0]);
        queue.splice(0,1);
      }
    }
  };

  // It must be a global variable because it will be called by JSONP.
  window.twitterFetcher = twitterFetcher;
  return twitterFetcher;
}));