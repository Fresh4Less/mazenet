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
	var cursorDrawMode = 0;
	var activeRoomTime = 0;
	defaultCursor.image.src = "images/cursors/default.png";	
	defaultCursor.image.onload = function() {defaultCursor.loaded = true;};
	
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
		});
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
				
				if(activeRoomTime != ActivePageService.PageData.enterTime || cursorDrawMode != ActivePageService.PageData.cursorDrawMode) {
					resetCanvas();
				}
				
				// Cursors
				if(ActivePageService.PageData.cursors) {
					switch(cursorDrawMode){
						case 0:
							cursorsAsSquaresRT();
							break;
						case 1:
							cursorsAsLinesRT();
							break;
						case 2:
							cursorsAsSquaresI();
							break;
						case 3:
							cursorsAsLinesI();
							break;
						case 4:
							cursorsAsIconsRT();
							break;
					}
				}		
			}
		}, 1000/fps);
	}
	
	function cursorsAsLinesI() {
		ctx.strokeStyle = "rgba(255, 50, 50, 0.01)";
		ctx.lineWidth = 1;
		if(timer < 100) {
			_.each(ActivePageService.PageData.cursors, function (cursor) { //SPEED UP THIS CODE
				var start = false;
				ctx.beginPath();
				cursor.frames.some(function(cursorInstant) {
					if(cursorInstant.pos.x !== 0 && cursorInstant.pos.y !== 0 && cursorInstant.pos.x < 1 && cursorInstant.pos.y < 1){
						if(!start) {
							ctx.moveTo(cursorInstant.pos.x * width,cursorInstant.pos.y * height);
							start = true;
						} else {
							ctx.lineTo(cursorInstant.pos.x * width,cursorInstant.pos.y * height);
						}	
					}
				});
				ctx.stroke();
			});		
		}
		timer++;
	}
	function cursorsAsLinesRT() {
		ctx.strokeStyle = "rgba(50, 50, 50, 0.2)";
		ctx.lineWidth = 6;
		ctx.clearRect(0,0,width,height);
		_.each(ActivePageService.PageData.cursors, function (cursor) { //SPEED UP THIS CODE
			var start = false;
			ctx.beginPath();
			cursor.frames.some(function(cursorInstant) {
				if(cursorInstant.pos.x !== 0 && cursorInstant.pos.y !== 0 && cursorInstant.pos.x < 1 && cursorInstant.pos.y < 1){
					if(!start) {
						ctx.moveTo(cursorInstant.pos.x * width,cursorInstant.pos.y * height);
						start = true;
					} else if(cursorInstant.t <= timer){
						ctx.lineTo(cursorInstant.pos.x * width,cursorInstant.pos.y * height);
					} else {
						return true;
					}
				}
			});
			ctx.stroke();
		});
		timer++;	
	}
	
	function cursorsAsSquaresI() {
		ctx.fillStyle = "rgba(255, 50, 50, 0.1)";
		if(timer === 0) {
			_.each(ActivePageService.PageData.cursors, function (cursor) { //SPEED UP THIS CODE
				cursor.frames.some(function(cursorInstant) {
					ctx.fillRect(cursorInstant.pos.x * width, cursorInstant.pos.y * height, 30, 30);
				});
			});	
		}
		timer++;
	}
	function cursorsAsSquaresRT() {
		ctx.fillStyle = "rgba(255, 50, 50, 0.1)";
		_.each(ActivePageService.PageData.cursors, function (cursor) { //SPEED UP THIS CODE
			cursor.frames.some(function(cursorInstant) {
				if(cursorInstant.t === timer){
					ctx.fillRect(cursorInstant.pos.x * width, cursorInstant.pos.y * height, 30, 30);
					return true;	
				} else if(cursorInstant.t > timer) {
					return true;
				}
			});
		});	
		timer++;
	}
	
	function cursorsAsIconsRT() { //Terrible and needs more work.
		if(defaultCursor.loaded){
			ctx.clearRect(0,0,width,height); 
			var cursorSprite = sprite({
				context: ctx,
				width: 25,
				height: 25,
				image: defaultCursor.image
			});
			_.each(ActivePageService.PageData.cursors, function (cursor) { //SPEED UP THIS CODE
				var prevX = 0;
				var prevY = 0;
				cursor.frames.some(function(cursorInstant) {
					if(cursorInstant.pos.x === 0 || cursorInstant.pos.y === 0) {
						cursorSprite.render(prevX * width, prevY * height);
						return true;
					} else if(cursorInstant.t >= timer){
						prevX = cursorInstant.pos.x;
						prevY = cursorInstant.pos.y;
						cursorSprite.render(cursorInstant.pos.x * width, cursorInstant.pos.y * height);
						return true;	
					}
				});
			});	
			timer++;
		}
	}
	
	function resetCanvas() {
		activeRoomTime = ActivePageService.PageData.enterTime;
		cursorDrawMode = ActivePageService.PageData.cursorDrawMode;
		timer = 0;
		ctx.clearRect(0, 0, width, height);
	}

};
angular.module('mazenet').controller('CanvasController', ['$scope', '$timeout', 'BackgroundCanvasService', 'ActivePageService', canvasController]);