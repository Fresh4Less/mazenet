var gulp = require('gulp');
var ts = require('gulp-typescript');
var typedoc = require('gulp-typedoc');
var tslint = require('gulp-tslint');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('build', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest('build'));
});

gulp.task('tslint', function () {
    return tsProject.src()
        .pipe(tslint({
            formatter: 'verbose'
        }))
        .pipe(tslint.report());
});

gulp.task('default', gulp.series(gulp.parallel('build', 'tslint'), function(done) {done();}));

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
