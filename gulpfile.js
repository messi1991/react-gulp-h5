/* eslint-disable */

let gulp = require('gulp');
let gulpLoadPlugins = require('gulp-load-plugins');
let browserify = require('browserify');
let babelify = require('babelify');
let htmlreplace = require('gulp-html-replace');
let $ = gulpLoadPlugins({ lazyload: true, rename: { } });

let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');

const env = process.env.NODE_ENV;
const isPord = env === 'prod' ? true : false;
console.log("env", env);

// 汇总当前输入输出的文件路径
const path = {
	entry:{
		all: ['src/index.html','src/css/*.scss','src/script/*.jsx'],
		css: ['src/css/*.scss'],
		js: ['src/script/*.jsx'],
		allJs: ['src/script/index.jsx'],
		html: ['src/index.html'],
		img: ['src/images/**.*'],
		lib: ['src/lib/**/**.*', 'src/lib/**.*']
	},
	output:{
		all: ['dist/'],
		html: ['dist/'],
		css: ['dist/css/'],
		js: ['dist/script/'],
		img: ['dist/images/'],
		lib: ['dist/lib/']
	}
}

const browserifyJs = (done) =>{
	return browserify({
		entries: path.entry.allJs,
		debug: true,
	}).
	transform (babelify , {
			presets: ['es2015','react']
	})
	.bundle()
	.pipe(source("bundle.min.js"))
	.pipe(buffer())
	.pipe(
		$.preprocess({
			context: {
				NODE_ENV: env || 'development',
			},
		})
	)
	.pipe($.if(isPord, $.sourcemaps.init({loadMaps: true})))
	.pipe($.if(isPord, $.uglify()))
	.pipe($.if(isPord, $.sourcemaps.write('./')))
	.pipe(gulp.dest(path.output.js))
	.pipe($.connect.reload())
}


// 拷贝html文件
const copyHtml = (done) => {
	return gulp.src(path.entry.html)
		.pipe(htmlreplace({
			'css': {
				src: './css/style.min.css',
				tpl: '<link type="text/css" rel="stylesheet" href="%s">'
			}, 
			'js': './script/bundle.min.js'
		}))
		.pipe(gulp.dest(path.output.html))
		.pipe($.connect.reload())
}

const copyImg = (done) => {
	return gulp.src(path.entry.img, {allowEmpty: true})
		.pipe(gulp.dest(path.output.img))
		.pipe($.connect.reload())
}
const copyLib = (done) => {
	return gulp.src(path.entry.lib, {allowEmpty: true})
		.pipe(gulp.dest(path.output.lib))
		.pipe($.connect.reload())
}

/**
* rename options {String or Object or Function} 这里以{Object}为例
* {
* 	dirname: "js",		文件路径
* 	basename: "main",	文件名
* 	prefix: "",		文件名前缀
* 	suffix: ".min",	文件名后缀
* 	extname: ".js"		文件扩展名
* }
*/
const outputStyle = (done) => {
	gulp.src(path.entry.css)
		//.pipe($.concat('style.css'))
		 .pipe($.sass({ outputStyle: 'compressed' }))
		 .pipe($.autoprefixer()
		 )
		.pipe($.rename({
			suffix: ".min" // 清空路径
		}))
		.pipe(gulp.dest(path.output.css))
		.pipe($.connect.reload());
	
	done();
}

// 清理文件
const clear = (done) => {
		return gulp.src(path.output.all, {allowEmpty: true})
		.pipe($.clean())
}

// 监听文件修改启动服务
const watchEdit = (done) => {
	// 启动服务
	$.connect.server({
      name: 'Gulp React',
	    root: 'dist',
	    port: 8008,
	    livereload: true
    });

	// 分别对文件进行监听
    gulp.watch(path.entry.js, gulp.parallel(browserifyJs));
    gulp.watch(path.entry.css, gulp.parallel(outputStyle, browserifyJs));
    gulp.watch(path.entry.html, gulp.parallel(copyHtml));
    gulp.watch(path.entry.img, gulp.parallel(copyImg));
    gulp.watch(path.entry.lib, gulp.parallel(copyLib));
	done()
}
exports.clean = gulp.series(clear)
exports.default = gulp.series(clear, outputStyle, copyHtml, copyLib, browserifyJs, copyImg, watchEdit)
exports.build = gulp.series(clear, outputStyle, copyHtml, copyLib, browserifyJs, copyImg)