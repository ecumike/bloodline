var browserSync = require('browser-sync'),
	concat = require('gulp-concat'),
	cleancss = require('gulp-clean-css'),
	del = require('del'),
	ghpages = require('gulp-gh-pages'),
	gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	notify = require('gulp-notify'),
	notifier = require('node-notifier'),
	plumber = require('gulp-plumber'),
	reload = browserSync.reload,
	rename = require("gulp-rename"),
	sass = require('gulp-sass')(require('sass')),
	sasslint = require('gulp-sass-lint'),
	size = require('gulp-size'),
	uglify = require('gulp-uglify-es').default;

const buildDir = './build/';


// Error handler for sass build.
const onError = function (err) {
	notify.onError({
		title: "Gulp",
		subtitle: "Failure!",
		message: "Error: <%= error.message %>"
	})(err);
	this.emit('end');
};


// CSS linting.
gulp.task('sass-lint', function (callback) {
	// gulp.src('src/scss/**/*.scss')
	// 	.pipe(sasslint().on('error', function(e){
	// 		console.log(e);
	// 	 }));
	callback();
});


gulp.task('NEW-sass-lint', function lintCssTask() {
	const gulpStylelint = require('@ronilaukkarinen/gulp-stylelint');
 	return gulp
		.src('src/scss/**/*.scss')
		.pipe(gulpStylelint({
			reporters: [
			{formatter: 'string', console: true}
			]
		}));
});


// JS linting.
gulp.task('js-hint', function (callback) {
	gulp.src(['src/*.js', '!src/*.min.js'])
		.pipe(jshint('.jshint_config'))
		.pipe(jshint.reporter('jshint-stylish')); // Pretty-prints errors.
	callback();
});


// Creates CSS file for each .scss file listed in /src/ root.
gulp.task('sass-build', function () {
	return gulp.src('src/*.scss')
		.pipe(plumber({errorHandler: onError}))
		.pipe(sass())
		.pipe(cleancss())
		.pipe(size({
			showFiles: true,
			title: 'CSS minimized:'
		}))
		.pipe(rename(function(opt) {
			opt.basename += '.min';
			return opt;
		}))
		.pipe(gulp.dest(buildDir + 'css/'))
		.pipe(browserSync.stream());
	}
);


// Creates JS file for each .source.js file listed in /src/ root.
gulp.task('js-build', function () {
	return gulp.src('src/*.source.js')
		.pipe(uglify())
		.pipe(rename(function(opt) {
			opt.basename = opt.basename.replace('.source', '.min');
			return opt;
		}))
		.pipe(size({
			showFiles: true,
			title: 'JS minimized:'
		}))
		.pipe(gulp.dest(buildDir + 'js/'))
		.pipe(reload({ stream: true }));
});


// Create JS bundle, exclude c3/d3.
gulp.task('js-build-bundle', function () {
	return gulp.src([
			'build/js/jquery.min.js',
			'build/js/datatables-bundle.min.js',
			'build/js/enjoyhint.min.js',
			'build/js/micromodal.min.js',
			'build/js/select2.min.js',
			'build/js/bloodline.min.js',
		])
		.pipe(concat('bloodline-bundle.min.js'))
		.pipe(gulp.dest('build/js'));
});


// Create FULL CSS bundle, exclude c3/d3.
gulp.task('css-build-full-bundle', function () {
	return gulp.src([
			'build/css/tachyons.min.css',
			'build/css/datatables-bundle.min.css',
			'build/css/enjoyhint.min.css',
			'build/css/hint.min.css',
			'build/css/select2.min.css',
			'build/css/bloodline.min.css',
		])
		.pipe(concat('bloodline-bundle.min.css'))
		.pipe(gulp.dest('build/css'));
});

// Create core, design-only CSS bundle
gulp.task('css-build-design-bundle', function () {
	return gulp.src([
			'build/css/tachyons.min.css',
			'build/css/bloodline.min.css',
		])
		.pipe(concat('bloodline-design-bundle.min.css'))
		.pipe(gulp.dest('build/css'));
});


// Copy all 3rd party files as-is.
gulp.task('copy-files', function () {
	return gulp.src('src/files/**/*.*').pipe(gulp.dest(buildDir));
});


// Create each html file in root
gulp.task('html-build', function () {
	return gulp.src('src/*.html')
		.pipe(gulp.dest(buildDir))
		.pipe(reload({ stream: true }));
});


// Delete everything and force full rebuild
gulp.task('clean', function () {
	return del([
		buildDir
	]);
});


// Watch files for auto-rebuild.
gulp.task('watch', function (cb) {
	gulp.watch('src/**/*.scss', gulp.series('sass-lint', 'sass-build', 'copy-files', 'sass-notify'));
	gulp.watch('src/*.js', gulp.series('js-hint', 'js-build', 'copy-files', 'js-notify'));
	gulp.watch('src/*.html', gulp.series('html-build', 'html-notify'));
	cb();
});


// Sync browsers and auto-reloads.
gulp.task('browser-sync', function (callback) {
	browserSync({
		server: { baseDir: buildDir }
	});
	callback();
});


// Notifications
gulp.task('watch-notify', function (cb) {
	notifier.notify({
		title: 'Bloodline',
		message: 'Watching for changes.',
		timeout: 2
	});
	return cb()
});

gulp.task('html-notify', function (cb) {
	notifier.notify({
		title: 'Bloodline',
		message: 'HTML has been built and reloaded.',
		timeout: 2
	});
	return cb()
});

gulp.task('js-notify', function (cb) {
	notifier.notify({
		title: 'Bloodline',
		message: 'JS has been built and reloaded.',
		timeout: 2
	});
	return cb()
});

gulp.task('sass-notify', function (cb) {
	notifier.notify({
		title: 'Bloodline',
		message: 'CSS has been built and reloaded.',
		timeout: 2
	});
	return cb()
});

gulp.task('build-notify', function (cb) {
	notifier.notify({
		title: 'Bloodline',
		message: 'Build is complete.',
		timeout: 1
	});
	return cb()
});


// Build files.
gulp.task('build', 
	gulp.series('clean', 'js-hint', 'js-build', 'copy-files', 'sass-lint', 'sass-build', 'html-build', 'js-build-bundle', 'css-build-full-bundle', 'css-build-design-bundle', 'build-notify')
);


// Default npm task.
gulp.task('default', 
	gulp.series('build', gulp.parallel('browser-sync', 'watch', 'watch-notify'))
);


// Sub-process, don't call directly. Runs GHpages deploy script.
gulp.task('deploy', 
	function () {
		return gulp.src(buildDir + '**/*')
			.pipe(ghpages());
	}
);


// Build files and then deploy to GH pages.
gulp.task('publish-ghpages', 
	gulp.series('build', 'deploy')
);

