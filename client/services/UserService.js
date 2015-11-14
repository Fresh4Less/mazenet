var userService = function () {
	var serviceObject = {};
	serviceObject.UserData = {
		id: '',
		username: 'username'
	};
	
	return serviceObject;
}

angular.module('mazenet').factory('UserService', [userService]);