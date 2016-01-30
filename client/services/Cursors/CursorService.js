var cursorService = function() {
    var Callbacks = {
		cbDrawModeCycle: []
	};
    
    function onCycleDrawMode(func) {
		if(_.isFunction(func)) {
			Callbacks.cbDrawModeCycle.push(func);
		}
	}
    
    var cursorMode = {
        name: 'live cursors',
        mode: 'sprite',
        playback: 'live',
        cumulative: false,
        data: {
            ready: false,
            sprite: new Image(),
            width: 25,
            height: 25,
        }   
    };
    cursorMode.data.sprite.src = "images/cursors/cursor.png";	
    cursorMode.data.sprite.onload = function() {cursorMode.data.ready = true;};
    
    var redCircleMode = {
        name: 'red circles',
        mode: 'shape',
        playback: 'live',
        cumulative: true,
        data: {
            shape: 'circle',
            size: 20,
            color: {
                red: 255,
                green: 50,
                blue: 50,
                alpha: 0.1
            }
        }   
    };
    
    var grayLinesMode = {
        name: 'gray lines',
        mode: 'shape',
        playback: 'live',
        cumulative: true,
        data: {
            shape: 'line',
            size: 6,
            color: {
                red: 50,
                green: 50,
                blue: 50,
                alpha: 0.2
            }
        } 
    };
    
    var staticRedLinesMode = {
        name: 'static red lines',
        mode: 'shape',
        playback: 'static',
        cumulative: true,
        data: {
            shape: 'line',
            size: 1,
            color: {
                red: 255,
                green: 50,
                blue: 50,
                alpha: 0.1
            }
        } 
    };
    
    var jensenMode = {
        name: 'Peter Jensen',
        mode: 'sprite',
        playback: 'live',
        cumulative: false,
        data: {
            ready: false,
            sprite: new Image(),
            width: 37,
            height: 50,
        }   
    };
    jensenMode.data.sprite.src = "images/cursors/peter_jensen.png";	
    jensenMode.data.sprite.onload = function() {jensenMode.data.ready = true;};
    
    var mattFlattMode = {
        name: 'Matt Flatt Stack',
        mode: 'sprite',
        playback: 'live',
        cumulative: true,
        data: {
            ready: false,
            sprite: new Image(),
            width: 40,
            height: 54,
        }   
    };
    mattFlattMode.data.sprite.src = "images/cursors/matt_flatt.png";	
    mattFlattMode.data.sprite.onload = function() {mattFlattMode.data.ready = true;};
    
    var drawModes = [
        cursorMode,
        redCircleMode,
        grayLinesMode,
        staticRedLinesMode,
        jensenMode,
        mattFlattMode
    ];
    var drawModeIndex = _.size(drawModes)-1;
    var drawMode = {};
    
    function cycleDrawMode() {
        drawModeIndex = (drawModeIndex + 1) % _.size(drawModes);
        drawMode.name = drawModes[drawModeIndex].name;
        drawMode.mode = drawModes[drawModeIndex].mode;
        drawMode.playback = drawModes[drawModeIndex].playback;
        drawMode.cumulative = drawModes[drawModeIndex].cumulative;
        drawMode.data = drawModes[drawModeIndex].data;
        
        Callbacks.cbDrawModeCycle.forEach(function(cbFunc){
            cbFunc();
        });
    }
    cycleDrawMode();
    
    return {
        DrawMode: drawMode,
        CycleDrawMode: cycleDrawMode,
        OnCycleDrawMode: onCycleDrawMode
    };
};
angular.module('mazenet').factory('CursorService', cursorService);