var userService = function () {
	var serviceObject = {};
	var redraw = function() {
		if(serviceObject.RedrawCallback) {
			serviceObject.RedrawCallback();
		}
	}
	serviceObject.UserData = {
		uId: '',
		username: 'username'
	};
	serviceObject.OtherUsers = {};
	
	serviceObject.AddUser = function(user) {
		serviceObject.OtherUsers[user.uId] = user;
		redraw();
	}
	serviceObject.RemoveUser = function(user) {
		delete serviceObject.OtherUsers[user.uId];
		redraw();
	}
	
	serviceObject.SetUsers = function(userArr) {
		serviceObject.otherUsers = {};
		userArr.forEach(function(user) {
			serviceObject.OtherUsers[user.uId] = user;
		}, this);
		redraw();
	}
	
	serviceObject.GetUsername = function(userId) {
		return serviceObject.OtherUsers[userId] || 'NO USER';
	}
	
	serviceObject.UpdatePosition = function(cursor) {
		if(serviceObject.OtherUsers[cursor.uId]){
			serviceObject.OtherUsers[cursor.uId].pos.x = cursor.pos.x;
			serviceObject.OtherUsers[cursor.uId].pos.y = cursor.pos.y;			
		}
		redraw();
	}
	
	return serviceObject;
}

angular.module('mazenet').factory('UserService', [userService]);