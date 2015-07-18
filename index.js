'use strict';

var through = require('through2');
var rs = require('replacestream');
var istextorbinary = require('istextorbinary');
var btoa = require('btoa'),
  Path = require('path');

function parsePath(path) {
  var extname = Path.extname(path);
  return {
    dirname: Path.dirname(path),
    basename: Path.basename(path, extname),
    extname: extname
  };
}

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
        var parsedPath = parsePath(file.relative),
          cnts = String(file.contents),
          fname = file.path.substr(file.path.lastIndexOf('/') + 1);

        var resobj = {
          filename: fname,
          contents: btoa(cnts)
        };

        var path = file.path.substr(0, file.path.lastIndexOf('/') + 1) + Path.join(parsedPath.dirname, parsedPath.basename + parsedPath.extname.replace(/\./gi, '___') + '.js');
        file.path = path;
        //console.log(file.path, path);
        //console.log(parsedPath, path);

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