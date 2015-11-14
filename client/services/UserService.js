var userService = function () {
	var serviceObject = {};
	serviceObject.UserData = {
		id: '',
		username: 'username'
	};
	
	return serviceObject;
}

angular.module('maenet').factory('UserService', [userService]);