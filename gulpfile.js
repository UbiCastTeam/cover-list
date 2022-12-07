/* globals require */
/* sudo npm install -g gulp gulp-concat gulp-minify gulp-clean-css */
const gulp = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');

gulp.task('autobuild', function () {
    gulp.watch('src/**', {'ignoreInitial': false}, gulp.series('build'));
});

gulp.task('build', function () {
    gulp.src([
        'src/cover-list.css',
    ])
        .pipe(concat('dist/cover-list.min.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('.'));

    return gulp.src(['src/cover-list.js'])
        .pipe(concat('dist/cover-list.js'))
        .pipe(minify({
            ext: {'src': '.tmp.js', 'min': '.min.js'},
            compress: {'hoist_vars': true}
        }))
        .pipe(gulp.dest('.'));
});
