var tests = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    //var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
    tests.push(file);
  }
});
require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/client',

  paths : {
    'mazenet':'module',
    'socketio': '../../socket.io/socket.io',
    'angular': '../bower_components/angular/angular',
    'angular-route': '../bower_components/angular-route/angular-route',
    'angular-aria': '../bower_components/angular-aria/angular-aria',
    'angular-animate': '../bower_components/angular-animate/angular-animate',
    'angular-material': '../bower_components/angular-material/angular-material',
    'angular-mocks': '../bower_components/angular-mocks/angular-mocks',
    'jquery':'../bower_components/jquery/dist/jquery',
    'underscore':'../bower_components/underscore/underscore-min'
  },
  shim: {
    'mazenet': {
      deps: ['angular', 'angular-route', 'angular-material', 'angular-mocks', 'socketio',  'underscore']
    },
    'angular-route': {
      deps: ['angular'],
      exports: 'angular'
    },
    'angular-material': {
      deps: ['angular', 'angular-animate', 'angular-aria']
    },
    'angular-animate': {
      deps: ['angular']
    },
    'angular-aria': {
      deps: ['angular']
    },
    'angular-mocks': {
      deps: ['angular']
    },
    'underscore': {
      exports: ''
    }
  },

  // dynamically load all test files
  deps: tests,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
