/*MAZENET - Fresh4Less [ Elliot Hatch, Samuel Davidson ]*/

var app = angular.module('mazenet', ['ui.bootstrap', 'ngRoute', 'ng-context-menu']);

var rootController = function($scope, ActivePageService) {
	$scope.globalPageStyles = ActivePageService.styles;
};

app.controller('RootController', ['$scope' , 'ActivePageService', rootController]);;
function mazenetController($scope, SocketService, ActivePageService) {
	//Scope Variables
	$scope.pageId = '5629b4171d18d8fd01c83513';
	$scope.page = ActivePageService.pageData;
	$scope.newPage = {
		hyperlinkName: 'New Page',
		title: 'Untitled',
		color: '#ffffff'
	};
	
	//Scope Functions
	$scope.loadPage = function() { 
		SocketService.LoadPage($scope.pageId).then(function(data) {
			console.log('Loaded Data', data);
			ActivePageService.UpdatePage(data);
		}, function(error) {
			console.error(error);
		});
	}
	$scope.createPage = function() {
		SocketService.CreatePage($scope.newPage).then(function(data) {
			console.log('Created Page Data', data);
			ActivePageService.UpdatePage(data.data);
		}, function(error) {
			console.error(error);
		});
	}
	
	$scope.doubleClick = function(event) {
		console.log("Double clicked!!", event);
	}
	
	//End Scope
};

angular.module('mazenet').controller('MazenetController', ['$scope', 'SocketService','ActivePageService', mazenetController]);;
angular.module('mazenet').directive('mzMazenet', function() {
	return {
		restrict: 'E',
		templateUrl: '/modules/MazenetTemplate.html',
		controller: 'MazenetController'
	}
});;
var activePageService = function($q) { 
	var pageData = {
		_id : 0,
		title: 'Welcome to Mazenet',
		background : {
			$type : 'color',
			data : {
				color : '#cccccc'
			}
		}
	}
	
	var styles = {
		background: {
			$type : 'color',
			data : {
				color : '#cccccc'
			}
		},
		stringified: 'background : #cccccc'
	};

	
	function UpdatePage ( newPage ) {
		var pageUpdateErrors = "";
		if(newPage) {
			//Id
			if(newPage._id) {
				pageData._id = newPage._id;
			} else {
				pageUpdateErrors += 'Page contains no "_id".\n'
			}
			if(newPage.title) {
				pageData.title = newPage.title;
			}
			//Background
			if(newPage.background){
				//REMOVE after elliot fixes type to $type
				newPage.background.$type = newPage.background.type;
				//END REMOVE
				if(newPage.background.$type && newPage.background.data) {
					pageData.background = newPage.background;
				} else {
					pageUpdateErrors += 'Page contains invalid background.\n';
				}
			}
			/* TODO: Add other fields */
			updateStyles();	
		} else {
			pageUpdateErrors += 'Page is undefined.\n';
		}
		//(Optional) Error Reporting.
		if(pageUpdateErrors.length > 0) {
			console.error('"PageService.UpdatePage" Warning(s) / Error(s):\n' + pageUpdateErrors, newPage);
		}
	}
	
	function updateStyles() {
		//Background
		if(pageData.background.$type == 'color' && pageData.background.data) {
			styles.background = pageData.background;
		} else {
			styles.background.data.color = '#cccccc';
		}
		
		styles.stringified = '';
		//Stringify for 'styles'.
		if(styles.background.$type == 'color') {
			styles.stringified += 'background : ' + styles.background.data.color + ';';
		}
	}
	return {
		pageData : pageData,
		styles : styles,
		UpdatePage : UpdatePage
	};
};

angular.module('mazenet').factory('ActivePageService', ['$q', activePageService]);;
var pageFactoryService = function() {
	var getPageTemplate = function() {
		
		var setBackground = function ($type, data) {
			var errors = '';
			
			if($type && data){
				if($type == 'color') {
					if(data.color) {
						this.background.$type = $type;
						this.background.data = data;
					} else {
						errors += 'Color is not defined.\n';
					}
				} else {
					errors += 'Unsupported background $type.\n';
				}	
			} else {
				errors += '$type and data must both be defined.\n';
			}
			
			if(errors.length > 0) {
				console.error('PageFactoryService.setBackground: Warning(s) / Error(s):\n' + errors, $type, data);
			}
			
		}
		
		return {
			title: 'Untitled',
			background: {
				$type: 'color',
				data: {
					color: '#ffffff'
				}
			},
			SetBackground : setBackground
		}
	}
	
	return {
		GetPageTemplate : getPageTemplate
	}
};

angular.module('mazenet').factory('PageFactory', pageFactoryService);;
angular.module('mazenet').factory ('SocketService', function ($q, $http) {
	function loadPage(pageId) {
		var promise = $q.defer();
		var startPage = pageId;
  		var socket = io('http://localhost:8090/mazenet');
  		socket.on('pages/enter:success', function(page) {
			promise.resolve(page);
		});
  		socket.on('pages/enter:failure', function(error) {
			promise.reject(error);
		});
  		socket.emit('pages/enter', startPage);
		return promise.promise;	
	}
	
	function createPage(page) {
		var promise = $q.defer();
		$http.post('/pages', {
			"creator": "101010101010101010101010",
    		"permissions": "all",
    		"title": page.title,
    		"background": {
        	"type": "color",
       		"data": {
           		"color": page.color
        	}
   		 }
		}).then(function(page) {
			promise.resolve(page);
		}, function (error){
			promise.reject(error);
		});
		
		return promise.promise;
	}
	
	return {
		LoadPage : loadPage,
		CreatePage : createPage
	}
})