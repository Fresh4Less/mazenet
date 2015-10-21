//App module

var mazenetApp = angular.module('mazenetApp', ['ngRoute', 'mazenetControllers', 'mazenetServices', 'mazenetDirectives', 'ng-context-menu']);

mazenetApp.config(['$routeProvider',
	function($routeProvider) {
	$routeProvider.when('/pages/', {
			redirectTo: '/pages/54b726e40f786c2f0b7a58ed'
	}).
	when('/pages/:pageId', {
		templateUrl: 'partials/page.html',
		controller: 'PageCtrl'
	}).
	otherwise({
		redirectTo: '/pages'
	});
}]); 
