#!/usr/bin/env node

'use strict';

var gulp = require('gulp'),
    template = require('gulp-template'),
    inject   = require('gulp-inject-string'),
    prompt   = require('gulp-prompt'),
    gutil    = require('gulp-util'),
    install  = require('gulp-install'),
    rename   = require('gulp-rename');

const argv = require('yargs')
  .usage('Generate a Vue-based Vimeography 2 theme with ease.\nUsage: yarn theme:create --name playlister')
  .example('yarn theme:create -n playlister', 'Generates a Vimeography theme called "playlister"')
  .options({
    'n': {
      alias: 'name',
      demand: true,
      describe: 'The name of your theme',
      type: 'string'
    },
    'm': {
      alias: 'modal',
      describe: 'Use vue-js-modal in this theme',
      type: 'boolean'
    },
    's': {
      alias: 'slider',
      describe: 'Use Swiper.js in this theme',
      type: 'boolean'
    },
    'si': {
      alias: 'skip-install',
      describe: 'Do not install node modules in the theme directory',
      type: 'boolean',
      default: false
    }
  })
  .argv;

var template_data = {},
    theme_slug   = "vimeography-" + argv.name.toLowerCase(),
    theme_folder = "../../../" + theme_slug,
    plugin_file  = theme_folder + '/' + theme_slug + '.php',
    tasks = [];

if (argv.modal) tasks.push('adding modal library');
if (argv.slider) tasks.push('adding slider library');

/**
 * Add modal library to current theme
 */
gulp.task(
  'adding modal library',
  ['installing node modules'],
  () => {
    return gulp.src([theme_folder + '/package.json']).pipe( install({
      commands: {
        'package.json': 'yarn'
      },
      yarn: ['add vue-js-modal']
    }) )
  }
);


/**
 * Add slider library to current theme
 */
gulp.task(
  'adding slider library',
  ['installing node modules'],
  () => {
    return gulp.src([theme_folder + '/package.json']).pipe( install({
      commands: {
        'package.json': 'yarn'
      },
      yarn: ['add swiper']
    }) )
  }
);


/**
 * Prompt the user for information to be used in the theme headers.
 * @param  {[type]}
 * @return {[type]}
 */
gulp.task('requesting more information', function () {

  return gulp.src('./create.js', {read: false})
    .pipe(prompt.prompt([{
        type: 'input',
        name: 'theme_description',
        message: 'Enter a short description',
        default: 'displays your videos in a modern gallery layout for your portfolio or membership site.'
    },
    {
        type: 'input',
        name: 'theme_uri',
        message: 'Enter the Theme URI',
        default: 'https://vimeography.com/themes/' + argv.name.toLowerCase()
    },
    {
        type: 'input',
        name: 'author_name',
        message: 'Enter the author name',
        default: 'Vimeography Blueprint'
    },
    {
        type: 'input',
        name: 'author_uri',
        message: 'Enter the author URI',
        default: 'https://vimeography.com'
    }
    ], function(res){
        //value is in res.first and res.second
        console.log(res)
        template_data = res;
        template_data.name = argv.name;
    }));
});


/**
 * [description]
 * @param  {[type]}   [description]
 * @return {[type]}   [description]
 */
gulp.task('inserting template data', ['requesting more information'], function () {
  return gulp.src([theme_folder + '/**/*', '!' + theme_folder + '/**/*.jpg'])
      .pipe(template(template_data))
      .pipe(gulp.dest(theme_folder));
});


/**
 * [description]
 * @param  {[type]} [description]
 * @return {[type]} [description]
 */
gulp.task('copying template files', function () {
  gutil.log( gutil.colors.green('Generating a new Vimeography theme called ' + argv.name.toUpperCase() + '…') );

  return gulp.src("./templates/**/*", { dot: true })
    .pipe(rename(function (path) {
      path.basename = path.basename.replace(/blueprint/g, argv.name);
    }))
    .pipe(gulp.dest(theme_folder));
});


/**
 * Install node modules in the generated theme
 */
gulp.task(
  'installing node modules',
  ['inserting template data'],
  () => {
    if ( ! argv['skip-install'] ) {
      return gulp.src([theme_folder + '/package.json']).pipe( install() )
    } else {
      gutil.log( gutil.colors.red('Skipping installation of node modules…') );
    }
  }
);

gulp.task('default', tasks.concat(['installing node modules', 'inserting template data', 'copying template files']) );

/**
 * [description]
 * @param  {[type]}   [description]
 * @return {[type]}   [description]
 */
gulp.task('finish', ['requesting more information'], function () {
  gutil.beep();
  gutil.log( gutil.colors.green('Ding! Your new theme is ready, fresh out of the oven.') );
});


/** Helper function to return a capitalized string */
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
}


/** Helper function to allow sprintf functionality */
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

/** Helper function to reduce array to only unique entries */
function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}
