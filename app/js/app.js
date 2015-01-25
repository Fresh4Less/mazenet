//App module

var mazenetApp = angular.module('mazenetApp', ['ngRoute', 'mazenetControllers', 'mazenetServices', 'mazenetDirectives']);

mazenetApp.config(['$routeProvider',
	function($routeProvider) {
	$routeProvider.when('/items', {
		templateUrl: 'partials/item-list.html',
		controller: 'ItemListCtrl'
	}).
	when('/items/:itemId', {
		templateUrl: 'partials/item-detail.html',
		controller: 'ItemDetailCtrl'
	}).
	when('/pages/', {
			redirectTo: '/pages/54b726e40f786c2f0b7a58ed'
	}).
	when('/pages/:pageId', {
		templateUrl: 'partials/page.html',
		controller: 'PageCtrl'
	}).
	otherwise({
		redirectTo: '/items'
	});
}]); 

