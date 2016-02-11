'use strict';

var through = require('through2');
var rs = require('replacestream');
var istextorbinary = require('istextorbinary');
var btoa = require('btoa'),
  Path = require('path');

/**
 * Extract path information
 * @param path
 * @returns {{dirname: *, basename: *, extname: *}}
 */
function parsePath(path) {
  var extname = Path.extname(path);
  return {
    dirname: Path.dirname(path),
    basename: Path.basename(path, extname),
    extname: extname
  };
}

/**
 * Find the last index of a regex within a string
 * @param str
 * @param regex
 * @param startpos
 * @returns {number}
 */
var regexLastIndexOf = function (str, regex, startpos) {
  regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
  if (typeof (startpos) == "undefined") {
    startpos = str.length;
  } else if (startpos < 0) {
    startpos = 0;
  }
  var stringToWorkWith = str.substring(0, startpos + 1);
  var lastIndexOf = -1;
  var nextStop = 0;
  var result;
  while ((result = regex.exec(stringToWorkWith)) != null) {
    lastIndexOf = result.index;
    regex.lastIndex = ++nextStop;
  }
  return lastIndexOf;
};

module.exports = function (config) {
  config.skipBinary = true;
  var doReplace = function (file, enc, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    function doReplace() {
      if (file.isStream()) {
        file.contents = file.contents.pipe(rs(search, replacement));
        return callback(null, file);
      }

      if (file.isBuffer()) {
        var pchar = '/';
        if (file.path.toString().indexOf('\\') > -1) {
          pchar = '\\';
        }

        var parsedPath = parsePath(file.relative),
          cnts = String(file.contents),
          fname = file.path.substr(file.path.lastIndexOf(pchar) + 1);
        var resobj = {
          filename: (config.key ? config.key : "" ) + fname,
          contents: btoa(cnts)
        };

        var path = file.path.substr(0, file.path.lastIndexOf(pchar) + 1) + Path.join(parsedPath.dirname, parsedPath.basename + parsedPath.extname.replace(/\./gi, '___') + '.js');
        file.path = path;
        file.contents = new Buffer(config.callback + '(' + JSON.stringify(resobj) + ');');

        return callback(null, file);
      }

      callback(null, file);
    }

    if (config && config.skipBinary) {
      istextorbinary.isText('', file.contents, function (err, result) {
        if (err) {
          return callback(err, file);
        }

        if (!result) {
          callback(null, file);
        } else {
          doReplace();
        }
      });

      return;
    }

    doReplace();
  };

  return through.obj(doReplace);
};
