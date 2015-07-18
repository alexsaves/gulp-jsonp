'use strict';

var through = require('through2');
var rs = require('replacestream');
var istextorbinary = require('istextorbinary');

module.exports = function (config) {
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
        if (search instanceof RegExp) {
          file.contents = new Buffer(String(file.contents).replace(search, replacement));
        }
        else {
          var cnts = String(file.contents);


          file.contents = new Buffer(cnts);
        }
        return callback(null, file);
      }

      callback(null, file);
    }

    if (options && options.skipBinary) {
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