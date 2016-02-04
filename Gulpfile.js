// Util
var gulp =require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var minifyCss = require('gulp-minify-css');
var prettify = require('gulp-prettify');
var uglify = require('gulp-uglify');

// Plugins
var compass = require('gulp-compass');
var browserify = require('gulp-browserify');
var jade = require('gulp-jade');
var imagemin = require('gulp-imagemin');
var annotate = require('gulp-ng-annotate')

var servers = {
   test: 'localhost', 
   dist: '46.101.23.228' 
}

var p = {
  html: {
    src:'*.html',
    dest:'build/'
  },
  sass: {
    src:'public/sass/main.scss',
    dest:'build/public/css/'
  },
  scripts: {
    src: 'public/scripts/main.js',
    coffee: [
      'public/scripts/main.coffee',
      'public/scripts/tagline.coffee'],
    js: [
      'public/scripts/template.js'],
    dest: 'build/public/scripts/'
  },
  jade: {
    src: 'components/jade/*.jade',
    dest: 'build/' 
  }
}

// Compass
gulp.task('compass', function() {
  gulp.src(p.sass.src)
    .pipe(compass({
      css: 'build/public/css',
      sass: 'public/sass', 
      require: ['susy', 'breakpoint', 'modular-scale'],
      sourcemap: true
    }))
    .on('error', function(err) {
      console.log(err) // plumber was not very good with compass
    })
    .pipe(minifyCss())
    .pipe(gulp.dest(p.sass.dest))
    .pipe(connect.reload())
}) 

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
    .pipe(gulp.dest('build/public/images/'))
    .pipe(connect.reload())
})

// Javascript
gulp.task('js', function() {
  gulp.src(p.js)
    .pipe(concat('script.js'))
    .pipe(browserify())
    //.pipe(uglify())
    .pipe(gulp.dest('build/public/js/'))
    .pipe(connect.reload())
})

// Coffee
gulp.task('browserify', function() {
  
    gulp.src(p.scripts.src, {read: false})  

    .pipe(plumber())
    .pipe(browserify({
      transform: ['coffeeify'],
      extensions: ['.coffee']
    }))
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
})


gulp.task('prettify', function() {
  gulp.src(p.html.src)
    .pipe(prettify({indent_size: 2}))
    .pipe(gulp.dest(p.html.dest))
});


// Livereload
gulp.task('connect', function() {
  connect.server({
    root:'build',
    livereload: true,
    port: 8000,
    host: servers.dist,
    open: {
      browser: 'chrome' // if not working OS X browser: 'Google Chrome'
    }
  })
})

// Go
gulp.task('default', ['connect','jade', 'compass', 'browserify', 'images', 'prettify','watch'], function() {
  console.log('Starting gulp!')
})
