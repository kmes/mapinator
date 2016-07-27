const gulp = require('gulp');
const concat = require('gulp-concat');

gulp.task('concat', function() {
    return gulp.src(
        [
            './node_modules/jquery/dist/jquery.js',
            './node_modules/typeahead.js/dist/typeahead.bundle.js',
            './node_modules/typeahead-addresspicker/dist/typeahead-addresspicker.js',

            './dist/main.js'
        ])
        .pipe(concat('mapinator.js'))
        .pipe(gulp.dest('./dist/'));
});