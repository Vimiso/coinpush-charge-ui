var path = require('path');
var less = require('gulp-less');
var gulp = require('gulp')
var minifyCss = require('gulp-clean-css');
var minifyJs = require("gulp-uglify-es").default;

gulp.task('compile', function(callback) {
    gulp.src('./resources/a/styles/charge-ui.less')
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('./public/a/styles'));

    gulp.src('./resources/a/scripts/charge-ui.js')
        .pipe(minifyJs())
        .pipe(gulp.dest('./public/a/scripts'));

    return callback();
});