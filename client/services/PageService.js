angular.module('mazenet').factory('PageService', function($q) {
	var ret = {
		GetColor : getColor,
		UpdateColorCallback : null,
		SetColor : setColor
	}; 
	var color = '#af2266';
	function setColor(newColor) {
		color = newColor;
		if(ret.UpdateColorCallback){
			ret.UpdateColorCallback();
		}
	}
	function getColor() {
		return color;
	}
	return ret;
});