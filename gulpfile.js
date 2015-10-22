var gulp = require('gulp'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	jshint = require('gulp-jshint'),
	autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload;

//style task
// two arguments: name of the task and the callback function
gulp.task('styles', function(){
	return gulp.src('styles/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(concat('style.css'))
	.pipe(autoprefixer('last 2 versions', 'ie8'))
	.pipe(gulp.dest('styles/'))
	.pipe(reload({stream: true}));
});

//JS task
gulp.task('js', function(){
	return gulp.src('scripts/*.js')
	.pipe(jshint())
	.pipe(jshint.reporter('jshint-stylish'))
	.pipe(reload({stream: true}));
});

// Browser-sync
gulp.task('bstask', function(){
	browserSync.init({
		server: {
			baseDir: './'
		}
	});
});

//watch task
gulp.task('watch', function(){
	gulp.watch('styles/*.scss', ['styles']);
	gulp.watch('scripts/*.js', ['js']);
	gulp.watch('*.html', reload);
});

// Master Task
gulp.task('default', ['bstask', 'styles', 'js', 'watch']);