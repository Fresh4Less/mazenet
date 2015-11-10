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
      closeCallback: null,
      position : {
        x: 0,
        y: 0
      }
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

          $element.bind('contextmenu dblclick', function(event) {
            if (!$scope.disabled()) {
              if (ContextMenuService.menuElement !== null) {
                close(ContextMenuService.menuElement);
              }
              ContextMenuService.menuElement = angular.element(
                document.getElementById($attrs.target)
              );
              
              ContextMenuService.element = event.target;
              ContextMenuService.position.x = (event.pageX / event.view.innerWidth);
              ContextMenuService.position.y = (event.pageY / event.view.innerHeight);
              
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
          $document.bind('dblclick', handleClickEvent);

          $scope.$on('$destroy', function() {
            //console.log('destroy');
            $document.unbind('keyup', handleKeyUpEvent);
            $document.unbind('click', handleClickEvent);
            $document.unbind('contextmenu', handleClickEvent);
            $document.bind('dblclick', handleClickEvent);
          });
        }
      };
    }
  ]);
