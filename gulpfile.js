'use strict';

var gulp = require('gulp');
var fs = require('fs');
//var assign = require('lodash.assign');
// var requireDir = require('require-dir');

var gulpif = require('gulp-if');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var notify = require('gulp-notify');
var rename = require('gulp-rename');

//var moduleImporter = require('sass-module-importer');
//var globImporter = require('sass-glob-importer');

var browserSync = require('browser-sync').create();

var autoprefixer = require('gulp-autoprefixer');


var config = {
    sourceDir: './',
    buildDir: './',
    gzip: false,
    modernizr: true,
    autoreload: false,
    pagespeed: true,
    domain: 'example.com',

    styles: {
        src: './scss/**/*.scss',
        dest: './css',
        sourcemaps: true
    }
};


gulp.task('styles', function () {

    return gulp.src(config.styles.src)
        .pipe(gulpif(config.styles.sourcemaps, sourcemaps.init()))
        .pipe(sass({
            outputStyle: 'extended'
        }))
        .on('error', notify.onError('<%= error.message %>'))
        .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 9'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulpif(config.styles.sourcemaps, sourcemaps.write()))
        .pipe(gulp.dest(config.styles.dest))
        .pipe(gulpif(config.autoreload, browserSync.stream()));
});

gulp.task('browser-sync', function() {

    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

});

gulp.task('watch', function() {
    gulp.watch(config.styles.src, ['styles']);
});


gulp.task('default', ['styles', 'browser-sync']);

gulp.task('dev', ['watch', 'browser-sync']);