const gulp = require('gulp');
const concat = require('gulp-concat');

function concatFactory( libs, fileName, destPath ) {
    if( !destPath ) destPath = './dist/';

    var concatList = [];

    for(var n in libs) {
        var lib = libs[n];
        switch(lib) {
            case 'jquery' :
                concatList.push('./node_modules/jquery/dist/jquery.js');
                break;
            case 'underscore' :
                concatList.push('./node_modules/underscore/underscore.js');
                break;
            case 'backbone' :
                concatList.push('./node_modules/backbone/backbone.js');
                break;
            case 'typeahead' :
                concatList.push('./node_modules/typeahead.js/dist/typeahead.bundle.js');
                break;
        }
    }

    concatList.push('./dist/mapinator.js')

    return function() {
        return gulp.src( concatList )
            .pipe(concat( fileName ))
            .pipe(gulp.dest( destPath ));
    };
}

gulp.task('concat:bundle', concatFactory(['jquery', 'typeahead', 'underscore', 'backbone'], 'mapinator.bundle.js') );
gulp.task('concat:backbone', concatFactory(['typeahead', 'underscore', 'backbone'], 'mapinator.backbone.js') );
gulp.task('concat:core', concatFactory(['typeahead'], 'mapinator.core.js') );

gulp.task('concat', ['concat:bundle', 'concat:backbone', 'concat:core']);

gulp.task('build', ['concat']);