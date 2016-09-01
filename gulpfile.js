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
            case 'backbone' :
                concatList.push('./node_modules/backbone/backbone.js');
                break;
        }
    }

    concatList.push('./dist/mapinator.js')

    return gulp.src( concatList )
        .pipe(concat( fileName ))
        .pipe( destPath );
}

gulp.task('concat:bundle', concatFactory(['jquery', 'backbone'], 'mapinator.bundle.js') );
gulp.task('concat:backbone', concatFactory(['backbone'], 'mapinator.backbone.js') );
gulp.task('concat:only', concatFactory([], 'mapinator.js') );

gulp.task('concat', ['concat:bundle', 'concat:backbone', 'concat:only']);

gulp.task('build', ['concat']);