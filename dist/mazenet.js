/*MAZENET - Fresh4Less [ Elliot Hatch, Samuel Davidson ]*/

var app = angular.module('mazenet', ['ui.bootstrap', 'ngRoute', 'ng-context-menu']);

var rootController = function($scope, ActivePageService) {
	$scope.globalPageStyles = ActivePageService.styles;
};

app.controller('RootController', ['$scope' , 'ActivePageService', rootController]);;
var buildMenuController = function ($scope, SocketService, ActivePageService, ContextMenuService) {
	
	$scope.newPage = {
		hyperlinkName: 'New Page',
		title: 'Untitled',
		color: '#ffffff'
	};
	$scope.state = "root";
	$scope.backToRoot = function() {
		$scope.state = "root";
	}
	$scope.newRoomSelected = function() {
		$scope.state = "newRoom"
	}
	$scope.newImageSelected = function() {
		$scope.state = "root";
	}
	$scope.createPage = function() {
		$scope.closeContextMenu();
		SocketService.CreatePage($scope.newPage).then(function(data) {
			ActivePageService.UpdatePage(data.data);
		}, function(error) {
			console.error(error);
		});
	}
	
	$scope.closeContextMenu = function() {
		ContextMenuService.forceClose = true;
	}
	
	ContextMenuService.closeCallback = function() {
		$scope.state = 'root';
	}
	
}
angular.module('mazenet').controller('BuildMenuController', ['$scope', 'SocketService','ActivePageService', 'ContextMenuService', buildMenuController]);;
angular.module('mazenet').directive('mzBuildMenu', function() {
	return {
		restrict: 'E',
		templateUrl: '/modules/BuildMenu/BuildMenuTemplate.html',
		controller: 'BuildMenuController'
	}
});;
var canvasController = function ($scope, $timeout, BackgroundCanvasService, ActivePageService) {
	var canvas = null;
	var cContext = null;
	
	$scope.id = 0;
	$scope.target = null;
	$scope.globalPageStyles = ActivePageService.styles;
	
	$scope.$watch('target', function(newValue, oldValue) {
		//Do something with id and target
		$timeout(function() {
			canvas = document.getElementById('canvas-'+$scope.id);
			if(canvas) {
				cContext = canvas.getContext("2d");
				cContext.font = "30px Arial";
				cContext.fillText("Hello World",10,50);
			} else {
				console.error("Error loading canvas.", newValue);	
			}
		})
	});

}
angular.module('mazenet').controller('CanvasController', ['$scope', '$timeout', 'BackgroundCanvasService', 'ActivePageService', canvasController]);;
angular.module('mazenet').directive('mzCanvas', function() {
	return {
		restrict: 'E',
		templateUrl: '/modules/Canvas/CanvasTemplate.html',
		scope : {
			target: '@',
		},
		controller: 'CanvasController',
		replace: true
	}
});;
function mazenetController($scope, SocketService, ActivePageService) {
	//Scope Variables
	$scope.pageId = '';
	$scope.page = ActivePageService.pageData;
	
	//Scope Functions
	$scope.loadPage = function() { 
		SocketService.LoadPage($scope.pageId).then(function(data) {
			console.log('Loaded Data', data);
			ActivePageService.UpdatePage(data);
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
/**
 * ng-context-menu - v1.0.1 - An AngularJS directive to display a context menu
 * when a right-click event is triggered
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 * 
 * Edited by Samuel Davidson to add optional closing functionality
 */
angular
  .module('ng-context-menu', [])
  .factory('ContextMenuService', function() {
    return {
      element: null,
      menuElement: null,
      forceClose: false,
      closeCallback: null
    };
  })
  .directive('contextMenu', [
    '$document',
    'ContextMenuService',
    function($document, ContextMenuService) {
      return {
        restrict: 'A',
        scope: {
          'callback': '&contextMenu',
          'disabled': '&contextMenuDisabled',
          'closeCallback': '&contextMenuClose'
        },
        link: function($scope, $element, $attrs) {
          var opened = false;
          var mouseover = false;

          function open(event, menuElement) {
            menuElement.addClass('open');

            var doc = $document[0].documentElement;
            var docLeft = (window.pageXOffset || doc.scrollLeft) -
                          (doc.clientLeft || 0),
                docTop = (window.pageYOffset || doc.scrollTop) -
                         (doc.clientTop || 0),
                elementWidth = menuElement[0].scrollWidth,
                elementHeight = menuElement[0].scrollHeight;
            var docWidth = doc.clientWidth + docLeft,
              docHeight = doc.clientHeight + docTop,
              totalWidth = elementWidth + event.pageX,
              totalHeight = elementHeight + event.pageY,
              left = Math.max(event.pageX - docLeft, 0),
              top = Math.max(event.pageY - docTop, 0);

            if (totalWidth > docWidth) {
              left = left - (totalWidth - docWidth);
            }

            if (totalHeight > docHeight) {
              top = top - (totalHeight - docHeight);
            }

            menuElement.css('top', top + 'px');
            menuElement.css('left', left + 'px');

            menuElement.bind('mouseenter', mouseEnterEvent);
            menuElement.bind('mouseleave', mouseLeaveEvent);
            
            opened = true;
          }

          function close(menuElement) {
            menuElement.removeClass('open');

            if (opened) {
              $scope.closeCallback();
            }
            
            menuElement.unbind();
            menuElement.unbind();
            
            ContextMenuService.closeCallback();
      
            opened = false;
          }

          $element.bind('contextmenu', function(event) {
            if (!$scope.disabled()) {
              if (ContextMenuService.menuElement !== null) {
                close(ContextMenuService.menuElement);
              }
              ContextMenuService.menuElement = angular.element(
                document.getElementById($attrs.target)
              );
              ContextMenuService.element = event.target;

              event.preventDefault();
              event.stopPropagation();
              $scope.$apply(function() {
                $scope.callback({ $event: event });
              });
              $scope.$apply(function() {
                open(event, ContextMenuService.menuElement);
              });
            }
          });

          function handleKeyUpEvent(event) {
            if (!$scope.disabled() && opened && event.keyCode === 27) {
              $scope.$apply(function() {
                close(ContextMenuService.menuElement);
              });
            }
          }

          function handleClickEvent(event) {
            if (!$scope.disabled() &&
              opened &&
              (!mouseover || ContextMenuService.forceClose) &&
              (event.button !== 2 ||
               event.target !== ContextMenuService.element)) {
                $scope.$apply(function() {
                  ContextMenuService.forceClose = false;
                  close(ContextMenuService.menuElement);
                });
            }
          }
          
          function mouseEnterEvent(event) {
            mouseover = true;
          }
          
          function mouseLeaveEvent(event) {
            mouseover = false;
          }

          $document.bind('keyup', handleKeyUpEvent);
          // Firefox treats a right-click as a click and a contextmenu event
          // while other browsers just treat it as a contextmenu event
          $document.bind('click', handleClickEvent);
          $document.bind('contextmenu', handleClickEvent);

          $scope.$on('$destroy', function() {
            //console.log('destroy');
            $document.unbind('keyup', handleKeyUpEvent);
            $document.unbind('click', handleClickEvent);
            $document.unbind('contextmenu', handleClickEvent);
          });
        }
      };
    }
  ]);
;
angular.module('mazenet').factory('BackgroundCanvasService', function() {
	var drawSomething = function () {
		console.log("draw!")
	};
	return {
		DrawSomething: drawSomething
	};
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
		stringified: '',
		canvasStringified: 'background : #cccccc'
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
		styles.canvasStringified = '';

		//Stringify for 'styles'.
		if(styles.background.$type == 'color') {
			styles.canvasStringified += 'background : ' + styles.background.data.color + ';';
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
});