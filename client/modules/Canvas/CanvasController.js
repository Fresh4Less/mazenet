var canvasController = function ($scope, $timeout, BackgroundCanvasService, ActivePageService, CursorService) {
	var fps = 30;
	var canvas = null;
	var width = window.innerWidth;
	var height = window.innerHeight;
	var ctx = null;
    var cursorTimeMarkers = [];
    var cursorMaxTime = 0;
	var timer = 0;
	var activeRoomTime = 0;
    
	$scope.id = 0;
	$scope.target = null;
	$scope.globalPageStyles = ActivePageService.styles;
    
    /* Reset the canvas when the user cycles the DrawMode */
    CursorService.OnCycleDrawMode(resetCanvas);
	
    /* Wait for the DOM to load then get the canvas element. */
	$scope.$watch('target', function(newValue, oldValue) {
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
    
	/* Sprite object helps with rendering sprites for each frame. */
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
    
	/* Run once every animation frame. Chooses the draw style  and renders it.
     * Resets the canvas if that page has changed. */
	function rootRenderLoop () {
		setTimeout(function() {
			window.requestAnimationFrame(rootRenderLoop);
			if(ctx) {
				
                /* Check if the user has resized the window */
				if(width != window.innerWidth) {
					width = window.innerWidth;
					canvas.setAttribute('width', width);
				}
				if(height != window.innerHeight) {
					height = window.innerHeight;
					canvas.setAttribute('height', height);	
				}
                
				/* Enter time mismatch means the room changed. */
				if(activeRoomTime != ActivePageService.PageData.enterTime) { 
					resetCanvas();
				}
				
				/* Draw the next frame depending on the DrawMode */
				if(ActivePageService.PageData.cursors) {
                    if(CursorService.DrawMode.mode === 'sprite') {
                        if(CursorService.DrawMode.playback === 'live') {
                            LiveSpriteNextFrame();
                        } else if(CursorService.DrawMode.playback === 'static') {
                            StaticSpriteNextFrame();
                        }   
                    } else if(CursorService.DrawMode.mode === 'shape') {
                        if(CursorService.DrawMode.playback === 'live') {
                            LiveShapeNextFrame();
                        } else if(CursorService.DrawMode.playback === 'static') {
                            StaticShapeNextFrame();
                        }   
                    }
                    
				}		
			}
		}, 1000/fps);
	}
    /* Draws the next frame of the cursors in the form of a sprite.
     * The sprite info is defined within the CursorService.
     * If the DrawMode is set to cumulative, the canvas does not clear between frames. */
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
            
            var cursorsToRender = GetNextCursors();
			_.forEach(cursorsToRender, function(cursorData) {
                cursorSprite.render(cursorData.pos.x * width, cursorData.pos.y * height);
            });
            
			timer++;
		}
    }
    /* Draws a static form of the cursor data in the form of sprites.
     * The sprite info is defined within the CursorService.
     * If the DrawMode is set to cumulative all cursors frames are rendered together. */
    function StaticSpriteNextFrame() {
        if(CursorService.DrawMode.data.ready){
            if(timer == 0) {
                var cursorSprite = sprite({
                    context: ctx,
                    width: CursorService.DrawMode.data.width,
                    height: CursorService.DrawMode.data.height,
                    image: CursorService.DrawMode.data.sprite
                });
                
                var cursorsToRender;
                if(CursorService.DrawMode.cumulative) {
                    for (var i = 0; i < cursorMaxTime.length; i++) {
                        cursorsToRender = GetNextCursors();
                        _.forEach(cursorsToRender, function(cursorData) {
                            cursorSprite.render(cursorData.pos.x * width, cursorData.pos.y * height);
                        });   
                    }
                }
                cursorsToRender = GetLastCursors();
                _.forEach(cursorsToRender, function(cursorData) {
                    cursorSprite.render(cursorData.pos.x * width, cursorData.pos.y * height);
                });	   
                timer++;
            }
        }
    }
    /* Draws the next frame of the cursors in the form of a shape.
     * The shape info is defined within the CursorService.
     * If the DrawMode is set to cumulative, the canvas does not clear between frames. */
    function LiveShapeNextFrame() {
		ConfigureContextByShapeData(CursorService.DrawMode.data);
		
        if(!CursorService.DrawMode.cumulative) {
                ctx.clearRect(0,0,width,height);    
        }
        var previousCursors = GetCurrentCursors();
        var cursorsToRender = GetNextCursors();
        for (var i = 0; i < cursorsToRender.length; i++) {
           DrawShapeFrame(CursorService.DrawMode.data, cursorsToRender[i],previousCursors[i]); 
        }
        
		timer++;
    }
    /* Draws a static form of the cursor data in the form of shapes.
     * The shape info is defined within the CursorService.
     * If the DrawMode is set to cumulative all cursors frames are rendered together. */
    function StaticShapeNextFrame() {
        if(timer < 30) {
            ConfigureContextByShapeData(CursorService.DrawMode.data);
            var previousCursors;
            var cursorsToRender;
            if(CursorService.DrawMode.cumulative) {
                for (var i = 0; i < cursorMaxTime.length; i++) {
                    previousCursors = GetCurrentCursors();
                    cursorsToRender = GetNextCursors();
                    _.forEach(cursorsToRender, function(cursorData) {
                        DrawShapeFrame(CursorService.DrawMode.data, cursorData);
                    });   
                }
            }
            
            previousCursors = GetCurrentCursors();
            cursorsToRender = GetNextCursors();
            for (var i = 0; i < cursorsToRender.length; i++) {
            DrawShapeFrame(CursorService.DrawMode.data, cursorsToRender[i],previousCursors[i]); 
            }   
            
            timer++;
        }
    }
    function ConfigureContextByShapeData(shapeData) {
        var colorString = "rgba(10, 10, 10, 0.01)";
        if(shapeData.color) {
            colorString = "rgba(" + shapeData.color.red + ", " + shapeData.color.green + ", " + shapeData.color.blue + ", " + shapeData.color.alpha  + ")";
        } else {
            console.error("ConfigureContextByShapeData: shapeData does not contain color info.", shapeData);
        }
        if(shapeData.shape === 'line') {
            ctx.strokeStyle = colorString;
            ctx.lineWidth = shapeData.size | 1;
        } else if(shapeData.shape === 'rect') {
            ctx.fillStyle = colorString;
        } else if(shapeData.shape === 'circle') {
            /* Must be done with the specific cursor frame data present. */
        } else {
            console.error("ConfigureContextByShapeData: shapeData.shape unsupported.", shapeData);
        }
    }
    
    function DrawShapeFrame(shapeData, cursor, prevCursor) {
        if(shapeData.shape === 'line') {
            if(!prevCursor) {
                console.error("DrawShapeFrame: prevCursor required to draw a line.");
                return;
            }
            ctx.beginPath();
            ctx.moveTo(prevCursor.pos.x * width, prevCursor.pos.x * height);
            ctx.moveTo(cursor.pos.x * width, cursor.pos.x * height);
            ctx.stroke();
        } else if(shapeData.shape === 'rect') {
            ctx.fillRect(cursor.pos.x * width, cursor.pos.y * height, shapeData.size, shapeData.size);
        } else if(shapeData.shape === 'circle') {
            var colorString = "rgba(10, 10, 10, 0.01)";
            var colorStringTransparent = "rgba(10, 10, 10, 0.0)";
            if(shapeData.color) {
                colorString = "rgba(" + shapeData.color.red + ", " + shapeData.color.green + ", " + shapeData.color.blue + ", " + shapeData.color.alpha  + ")";
                colorStringTransparent = "rgba(" + shapeData.color.red + ", " + shapeData.color.green + ", " + shapeData.color.blue + ", 0.0)";
            } else {
                console.error("ConfigureContextByShapeData: shapeData does not contain color info.", shapeData);
            }
            var radius = 20;
            var gradient = ctx.createRadialGradient(cursor.pos.x * width + radius, cursor.pos.y * height + radius, radius, cursor.pos.x * width+radius, cursor.pos.y * height+radius,radius*0.95);
            gradient.addColorStop(1, colorString);
            gradient.addColorStop(0, colorStringTransparent);
            ctx.fillStyle = gradient;
            ctx.fillRect(cursor.pos.x * width, cursor.pos.y * height, radius*2, radius*2);
        } else {
            console.error("DrawShapeFrame: shapeData.shape unsupported.", shapeData);
        }
    }
    
    /* Gets the next cursor for the timer. 
     * If the next cursor is on a timestamp far ahead of the timer,
     * it interpolates a cursor postion for the timer.
     * GetCurrentCursors will return whatever the most recent call to GetNextCursors returned.*/
    function GetNextCursors() {
        var outArr = [];
        for(var i = 0; i < ActivePageService.PageData.cursors.length; i++) {
            var currentCursor = ActivePageService.PageData.cursors[i].frames[cursorTimeMarkers[i]];
            if((ActivePageService.PageData.cursors[i].frames.length - 1) > cursorTimeMarkers[i]) { //There are more cursors
                var nextCursor = ActivePageService.PageData.cursors[i].frames[cursorTimeMarkers[i] + 1];
                if(nextCursor.t > timer) {
                    if(currentCursor.pos.x === 0 || currentCursor.pos.y === 0) {
                        outArr.push(currentCursor);
                    } else {
                        var interpPercent = (timer - currentCursor.t)/(nextCursor.t - currentCursor.t);
                        var interpolatedCursor = {
                            t: timer,
                            pos: {
                                x: (currentCursor.pos.x + ((nextCursor.pos.x - currentCursor.pos.x) * interpPercent)),
                                y: (currentCursor.pos.y + ((nextCursor.pos.y - currentCursor.pos.y) * interpPercent))
                            }
                        }
                        outArr.push(interpolatedCursor);   
                    }
                } else {
                    outArr.push(nextCursor);
                    cursorTimeMarkers[i]++;
                }
            } else {
                outArr.push(currentCursor);
            }
        }
        return outArr;
    }
    /* Get the current cursors as specified by the cursorTimeMarkers array. 
     * Returns whatever the most recent call to GetNextCursors returned. */
    function GetCurrentCursors() {
        var outArr = [];
        for(var i = 0; i < ActivePageService.PageData.cursors.length; i++) {
            var currentCursor = ActivePageService.PageData.cursors[i].frames[cursorTimeMarkers[i]];
            outArr.push(currentCursor);
        }
        return outArr;
    }
    /* Gets the final cursor frame for every page's cursors. */
    function GetLastCursors() {
        var outArr = [];
        for(var i = 0; i < ActivePageService.PageData.cursors.length; i++) {
            var framesLen = ActivePageService.PageData.cursors[i].frames.length;
            outArr.push(ActivePageService.PageData.cursors.length[i][framesLen - 1]);
        }
        return outArr;
    }
    
    /* Resets the canvas by resetting timers, cursors, and clearing the canvas */
	function resetCanvas() {
		activeRoomTime = ActivePageService.PageData.enterTime;
		timer = 0;
		ctx.clearRect(0, 0, width, height);
        
        cursorTimeMarkers = [];
        cursorMaxTime = 0;
        _.forEach(ActivePageService.PageData.cursors, function(cursor) {
            var oldestTime = cursor.frames[cursor.frames.length-1].t;
            if(oldestTime > cursorMaxTime) {
                cursorMaxTime = oldestTime;
            };
            cursorTimeMarkers.push(0);
        });   
	}
}
angular.module('mazenet').controller('CanvasController', ['$scope', '$timeout', 'BackgroundCanvasService', 'ActivePageService', 'CursorService', canvasController]);