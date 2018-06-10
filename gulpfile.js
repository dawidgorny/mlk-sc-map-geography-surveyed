'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var log = require('gulplog');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');
var browserifyReplace = require('browserify-replace');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var babelify = require('babelify');
var uglifyify = require('uglifyify');

// add custom browserify options here
var customOpts = {
  entries: ['./frontend.js'],
  debug: true,
  noParse: [
    require.resolve('mapbox-gl')
  ]/* ,
  transform: [
    [babelify, {
      presets: ["es2015", "react"],
      sourceMaps: true
    }]
  ] */
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts).ignore('mapbox-gl'));

// add transformations here
// i.e. b.transform(coffeeify);
b.transform(browserifyReplace, {
  replace: [
    { from: /const[ ]+mapboxgl/, to: 'const ____mapboxgl' },
    { from: /var[ ]+mapboxgl/, to: 'const ____mapboxgl' },
    { from: /let[ ]+mapboxgl/, to: 'const ____mapboxgl' }
  ]
});
b.transform(uglifyify, { global: true });

gulp.task('js', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', log.info); // output build logs to terminal

function bundle () {
  return b.bundle()
    // log errors if they happen
    .on('error', log.error.bind(log, 'Browserify Error'))
    .pipe(source('frontend.web.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    // .pipe(uglify())
    .on('error', gutil.log)
    // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./www'));
}
