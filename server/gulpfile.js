var gulp = require('gulp');
var ts = require('gulp-typescript');
var typedoc = require('gulp-typedoc');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('default', function() {
	return tsProject.src()
		.pipe(tsProject())
		.js.pipe(gulp.dest('build'));
});

gulp.task('docs', function() {
	return gulp.src(['src/**/*.ts'])
		.pipe(typedoc({
            module: "commonjs",
            target: "es6",
            out: "docs/",
            name: "Mazenet"
		}));
});
