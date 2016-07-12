// Karma configuration
// Generated on Sat Feb 06 2016 22:24:58 GMT-0700 (Mountain Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs', 'socketio-server'],


    // list of files / patterns to load in the browser
    files: [
      'test/client/test-main.js',
      {pattern: 'bower_components/underscore/underscore-min.js', included:false, served:true},
      {pattern: 'bower_components/jquery/dist/jquery.js', included:false, served:true},
      {pattern: 'bower_components/angular-material/angular-material.js', included:false, served:true},
      {pattern: 'bower_components/angular-animate/angular-animate.js', included:false, served:true},
      {pattern: 'bower_components/angular-aria/angular-aria.js', included:false, served:true},
      {pattern: 'bower_components/angular-route/angular-route.js', included:false, served:true},
      {pattern: 'bower_components/angular-mocks/angular-mocks.js', included:false, served:true},
      {pattern: 'bower_components/angular/angular.js', included:false, served:true},
      {pattern: 'test/client/**/*.spec.js', included: false, served: true},
      {pattern: 'client/**/*.js', included: false, served: true},
      {pattern: 'client/**/*.html', included: false, served: true}
    ],


    // list of files to exclude
    exclude: [
      'client/main.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'client/**/*!(*spec).js': ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    },

    socketioServer: {
      port: 9999, //default port unless you set something different
      onConnect: function (socket) {
        // do something with the connected client
        socket.on('message', function (msg) {
          console.log('i got a message!', msg)
        })
      },
      ready: function (io) {
        // do something with the socket.io instance
      }
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
