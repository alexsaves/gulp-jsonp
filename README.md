Gulp JSONP plugin
===================
Simple JSONP wrapper Gulp Plugin.
### Installation
[![npm version](https://badge.fury.io/js/gulp-jsonp.svg)](http://badge.fury.io/js/gulp-jsonp)
```sh
npm install gulp-jsonp
```
### Simple Usage
```javascript
var gjsonp = require("gulp-jsonp");

/**
 * Build JS
 */
gulp.task('js', function () {
  gulp.src(['./src/**/*.html'])
    .pipe(gjsonp({
        callback: "__myJSONPCallbackFunction",
        key: "optionalFilePrefix_"
      }))
    .pipe(gulp.dest('./dist/'));
});
```
### Output
The plugin will rename files to have a .js extension, and wrap the contents in an object like so:
```javascript
__myJSONPCallbackFunction({"filename":"optionalFilePrefix_index.html","contents":"[BASE64 ENCODED CONTENTS]"});
```

