var canvasController = function ($scope, $timeout, BackgroundCanvasService, ActivePageService, CursorService) {
	var fps = 30;
	var canvas = null;
	var width = window.innerWidth;
	var height = window.innerHeight;
	var ctx = null;
    var compiledCursors = [];
	var timer = 0;
	var activeRoomTime = 0;
	
    CursorService.OnCycleDrawMode(resetCanvas);
    
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
				
				if(activeRoomTime != ActivePageService.PageData.enterTime) { //Page has switched
                    compileCursorsIntoFrames(ActivePageService.PageData.cursors);
					resetCanvas();
				}
				
				// Cursors
				if(ActivePageService.PageData.cursors) {
                    if(CursorService.DrawMode.mode === 'sprite') {
                        if(CursorService.DrawMode.playback === 'live') {
                            LiveSpriteNextFrame();
                        }   
                    } else if(CursorService.DrawMode.mode === 'shape') {
                        if(CursorService.DrawMode.playback === 'live') {
                            LiveShapeNextFrame();
                        }
                    }
                    
				}		
			}
		}, 1000/fps);
	}
	function LiveSpriteNextFrame() {
        if(CursorService.DrawMode.data.ready){
            if(!CursorService.DrawMode.cumulative) {
                ctx.clearRect(0,0,width,height);    
            }
			var cursorSprite = sprite({
				context: ctx,
				width: CursorService.DrawMode.data.width,
				height: CursorService.DrawMode.data.height,
				image: CursorService.DrawMode.data.sprite
			});
			for(var i = 0; i < compiledCursors.length; i++) {
				var index = Math.min(timer, compiledCursors[i].length - 1);
				cursorSprite.render(compiledCursors[i][index].pos.x * width, compiledCursors[i][index].pos.y * height);
			}	
			timer++;
		}
    }
    function LiveShapeNextFrame() {
		ctx.fillStyle = "rgba(" + CursorService.DrawMode.data.color.red 
        + ", " + CursorService.DrawMode.data.color.green  
        + ", " + CursorService.DrawMode.data.color.blue  
        + ", " + CursorService.DrawMode.data.color.alpha  + ")";
        ctx.lineWidth = CursorService.DrawMode.data.size; 
		if(timer === 0) {
			_.each(ActivePageService.PageData.cursors, function (cursor) { //SPEED UP THIS CODE
				cursor.frames.some(function(cursorInstant) {
					ctx.fillRect(cursorInstant.pos.x * width, cursorInstant.pos.y * height, 30, 30);
				});
			});	
		}
		timer++;
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
	
		_.each(ActivePageService.PageData.cursors, function (cursor) { //SPEED UP THIS CODE
			cursor.frames.some(function(cursorInstant) {
				if(cursorInstant.t === timer){
					var radius = 20;
					var gradient = ctx.createRadialGradient(cursorInstant.pos.x * width + radius, cursorInstant.pos.y * height + radius,radius,cursorInstant.pos.x * width+radius,cursorInstant.pos.y * height+radius,radius*0.95);
					gradient.addColorStop(1,"rgba(255, 50, 50, 0.1)");
					gradient.addColorStop(0,"rgba(255, 50, 50, 0)");
					ctx.fillStyle = gradient;
					ctx.fillRect(cursorInstant.pos.x * width, cursorInstant.pos.y * height, radius*2, radius*2);
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
			for(var i = 0; i < compiledCursors.length; i++) {
				var index = Math.min(timer, compiledCursors[i].length - 1);
				cursorSprite.render(compiledCursors[i][index].pos.x * width, compiledCursors[i][index].pos.y * height);
			}	
			timer++;
		}
	}
	function compileCursorsIntoFrames(cursors) { //TODO fix so that it doesn't interpolate hours worth of stuff.
		compiledCursors = [];
		cursors.forEach(function() {
			compiledCursors.push([]);
			
		});

		for(var i = 0; i < cursors.length; i++) {
			for(var j = 0; j < cursors[i].frames.length; j++) {
				if(j == 0) {
					compiledCursors[i].push(cursors[i].frames[j]);
				} else {
					var prevCursor = compiledCursors[compiledCursors.length - 1];
					var currentCursor = cursors[i].frames[j];
					var framesToGenerate = currentCursor.t - prevCursor.t - 1;
					for(var k = 0; k < framesToGenerate; k++) {
						var interpolationPercent = (k+1)/(framesToGenerate+1);
						var interpedCursor = {
							pos: {
								x: (prevCursor.pos.x + ((currentCursor.pos.x - prevCursor.pos.x) * interpolationPercent)),
								y: (prevCursor.pos.y + ((currentCursor.pos.y - prevCursor.pos.y) * interpolationPercent))
								},
							t: prevCursor.t + 1 + k
						};
						compiledCursors[i].push(interpedCursor);
					}
					compiledCursors[i].push(currentCursor);
				}
			}	
		}
	}
	
	function resetCanvas() {
		activeRoomTime = ActivePageService.PageData.enterTime;
		cursorDrawMode = ActivePageService.PageData.cursorDrawMode;
		timer = 0;
		ctx.clearRect(0, 0, width, height);
	}

};
angular.module('mazenet').controller('CanvasController', ['$scope', '$timeout', 'BackgroundCanvasService', 'ActivePageService', 'CursorService', canvasController]);