var gulp = require('gulp');
var ts = require('gulp-typescript');
var typedoc = require('gulp-typedoc');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('build', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('build'));
});

gulp.task('docs', function () {
    return gulp.src(['src/**/*.ts'])
        .pipe(typedoc({
            module: "commonjs",
            target: "es6",
            out: "docs/",
            name: "Mazenet",
            ignoreCompilerErrors: true
        }));
});

gulp.task('default', gulp.series(gulp.parallel('build'), function(done) {done();}));
