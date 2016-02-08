var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
    allTestFiles.push(normalizedTestModule);
  }
});
require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

  // dynamically load all test files
  deps: allTestFiles,

  paths : {
    'mazenet':'client/module',
    'socketio': '/socket.io/socket.io',
    'angular': '/bower_components/angular/angular',
    'angular-route': '/bower_components/angular-route/angular-route',
    'angular-bootstrap': '/bower_components/angular-bootstrap/ui-bootstrap-tpls',
    'angular-mocks': '/bower_components/angular-mocks/angular-mocks',
    'jquery':'/bower_components/jquery/dist/jquery',
    'bootstrap':'/bower_components/bootstrap/dist/js/bootstrap',
    'underscore':'/bower_components/underscore/underscore'
  },
  shim: {
    'mazenet': {
      deps: ['angular', 'angular-route', 'angular-bootstrap', 'angular-mocks', 'socketio', 'bootstrap', 'underscore']
    },
    'angular-route': {
      deps: ['angular']
    },
    'angular-bootstrap': {
      deps: ['angular']
    },
    'angular-mocks': {
      deps: ['angular']
    },
    'bootstrap': {
      deps: ['jquery']
    }
  },

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
