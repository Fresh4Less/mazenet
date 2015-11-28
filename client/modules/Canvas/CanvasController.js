var canvasController = function ($scope, $timeout, BackgroundCanvasService, ActivePageService) {
	var fps = 30;
	var canvas = null;
	var width = window.innerWidth;
	var height = window.innerHeight;
	var ctx = null;
	var defaultCursor = {
		image: new Image(),
		loaded: false
	};
	
	var timer = 0;
	var activeRoomTime = 0;
	defaultCursor.image.src = "images/cursors/default.png";	
	defaultCursor.image.onload = function() {defaultCursor.loaded = true};
	
	$scope.id = 0;
	$scope.target = null;
	$scope.globalPageStyles = ActivePageService.styles;
	
	$scope.$watch('target', function(newValue, oldValue) {
		//Do something with id and target
		$timeout(function() {
			canvas = document.getElementById('canvas-'+$scope.id);
			if(!canvas) {
				console.error("Error loading canvas.", newValue);
				return;
			}
			canvas.setAttribute('width', window.innerWidth);
			canvas.setAttribute('height', window.innerHeight);
			ctx = canvas.getContext('2d');
			rootRenderLoop();
		})
	});
	
	function sprite (options) {
		var that = {};
		that.context = options.context;
		that.width = options.width;
		that.height = options.height;
		that.image = options.image;
		that.render = function(x, y) {
			that.context.drawImage(
				that.image,
				0,
				0,
				that.width,
				that.height,
				x,
				y,
				that.width,
				that.height);	
		};
		return that;
	}
	
	function rootRenderLoop () {
		setTimeout(function() {
			window.requestAnimationFrame(rootRenderLoop);
			if(ctx) {
				
				if(width != window.innerWidth) {
					width = window.innerWidth;
					canvas.setAttribute('width', width);
				}
				if(height != window.innerHeight) {
					height = window.innerHeight;
					canvas.setAttribute('height', height);	
				}
				
				if(ActivePageService.PageData.enterTime != activeRoomTime) {
					activeRoomTime = ActivePageService.PageData.enterTime;
					timer = 0;
					ctx.clearRect(0, 0, canvas.width, canvas.height);
				}
				
				// Cursors -- TODO: ADD DIFFERENT DRAWING ALGORITHMS
				if(defaultCursor.loaded){ 
					var cursorSprite = sprite({
						context: ctx,
						width: 25,
						height: 25,
						image: defaultCursor.image
					});
					ctx.strokeStyle = "rgba(255, 50, 50, 0.01)"
					if(ActivePageService.PageData.cursors) {
						_.each(ActivePageService.PageData.cursors, function (cursor) { //SPEED UP THIS CODE
							var start = false;
							ctx.beginPath();
							cursor.frames.some(function(cursorInstant) {
								if(cursorInstant.pos.x != 0 && cursorInstant.pos.y != 0 && cursorInstant.pos.x < 1 && cursorInstant.pos.y < 1){
									if(!start) {
										ctx.moveTo(cursorInstant.pos.x * width,cursorInstant.pos.y * height);
										start = true;
									} else {
										ctx.lineTo(cursorInstant.pos.x * width,cursorInstant.pos.y * height);
									}	
								}
								//ctx.fillRect(cursorInstant.pos.x * width, cursorInstant.pos.y * height, 30, 30);
							});
							ctx.stroke();
						});	
					}
				}		
			}
			timer++;
		}, 1000/fps);
	}

}
angular.module('mazenet').controller('CanvasController', ['$scope', '$timeout', 'BackgroundCanvasService', 'ActivePageService', canvasController]);