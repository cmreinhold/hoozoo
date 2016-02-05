// Util
var gulp =require('gulp'),
    gulpif = require('gulp-if'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    minifyHtml = require('gulp-minify-html'),
    minifyCss = require('gulp-minify-css'),
    prettify = require('gulp-prettify'),
    uglify = require('gulp-uglify');

// Plugins
var compass = require('gulp-compass'),
    browserify = require('gulp-browserify'),
    jade = require('gulp-jade'),
    imagemin = require('gulp-imagemin'),
    annotate = require('gulp-ng-annotate');

var env = process.env.NODE_ENV || 'production';
var server, destDir, dataIn, dataOut, jsonDest, p;

var updateConstants = function(){
  dataIn = destDir + '/data';
  p = {
    html: {
      src:'*.html',
      dest: destDir + ''
    },
    json: {
      src:'data/json/*.json',
      dest: dataIn + '/*.json',
      din : dataIn + '/*.json',
      dout: dataOut + '/*.json',
    },
    scripts: {
      src: 'public/scripts/main.js',
      coffee: [
        'public/scripts/main.coffee',
        'public/scripts/tagline.coffee'],
      js: [
        'public/scripts/template.js'
        ],
      dest: destDir + '/scripts/'
    },
    sass: {
      src:'public/sass/main.scss',
      dest: destDir + '/css/'
    },
    jade: {
      src: 'components/jade/*.jade',
      dest: destDir + '/'
    }
  };
}

// Configuration tasks
gulp.task('production-config', function() {
  destDir = 'build/production';
  server = '46.101.23.228';
  sassStyle = 'compressed';
  updateConstants();
});

gulp.task('test-config', function() {
  destDir = 'build/test';
  server = '46.101.23.228';
  sassStyle = 'compressed';
  updateConstants();
});

gulp.task('development-config', function() {
  destDir = 'build/development'
  server = 'localhost';
  sassStyle = 'expanded';
  updateConstants();
});

// Compass
gulp.task('compass', function() {
  gulp.src(p.sass.src)
    .pipe(compass({
      sass: 'public/sass', 
      css: destDir + '/css',
      style: sassStyle,
      require: ['susy', 'breakpoint', 'modular-scale'],
      sourcemap: true
    }))
    .on('error', function(err) {
      console.log(err) // plumber was not very good with compass
    })
    .pipe(minifyCss())
    .pipe(gulp.dest(p.sass.dest))
    .pipe(connect.reload())
});

// Jade
gulp.task('jade', function() {
  gulp.src(p.jade.src)
    .pipe(plumber())
    .pipe(jade())
    .pipe(gulp.dest(p.jade.dest))
    .pipe(connect.reload())
})

// Images
gulp.task('images', function() {
  gulp.src('public/images/**/*')
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(destDir + '/images/'))
    .pipe(connect.reload())
})

// Javascript
gulp.task('js', function() {
  gulp.src(p.js)
    .pipe(concat('script.js'))
    .pipe(browserify())
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest(destDir + '/js/'))
    .pipe(connect.reload())
})

// Coffee
gulp.task('browserify', function() {
  
    gulp.src(p.scripts.src, {read: false})  
      .pipe(plumber())
      .pipe(browserify({
        transform: ['coffeeify'],
        extensions: ['.coffee']
      })
    )
    .pipe(rename('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest(p.scripts.dest))
    .pipe(connect.reload())
})

// Watch
gulp.task('watch', function() {
  gulp.watch('jade/**/*.jade', ['jade']);
  gulp.watch('public/sass/**/*.scss', ['compass']);
  gulp.watch('public/coffee/**/*', ['browserify']);
  gulp.watch('public/scripts/**/*', ['browserify']);
  gulp.watch('public/images/**',['images']);
  gulp.watch(p.html.src, ['html'])
})

gulp.task('html', function() {
  gulp.src(p.html.src)
    .pipe(gulpif(env === 'production', minifyHtml()))
    .pipe(gulpif(env === 'test', minifyHtml()))
    .pipe(gulpif(env === 'development', prettify({indent_size: 2})))
    .pipe(gulp.dest(p.html.dest))
});

// Livereload
gulp.task('connect', function() {
  connect.server({
    root: destDir + '/',
    host: server,
    port: 8000,
    livereload: true
  })
})

// Runnable tasks

gulp.task('default', ['development-config', 'connect','jade', 'compass', 'browserify', 'images', 'html','watch'], function() {
  console.log('Starting gulp!')
});

gulp.task('development', ['development-config', 'connect','jade', 'compass', 'browserify', 'images', 'html','watch'], function() {
  console.log('Starting development gulp!')
});

gulp.task('production', ['production-config', 'connect','jade', 'compass', 'browserify', 'images', 'html','watch'], function() {
  console.log('Starting production gulp!')
});

gulp.task('test', ['test-config', 'connect','jade', 'compass', 'browserify', 'images', 'html','watch'], function() {
  console.log('Starting test gulp!')
});

