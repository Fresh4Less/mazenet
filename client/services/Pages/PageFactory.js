var pageFactoryService = function() {
	var getPageTemplate = function() {
		
		var setBackground = function ($type, data) {
			var errors = '';
			
			if($type && data){
				if($type == 'color') {
					if(data.color) {
						this.background.$type = $type;
						this.background.data = data;
					} else {
						errors += 'Color is not defined.\n';
					}
				} else {
					errors += 'Unsupported background $type.\n';
				}	
			} else {
				errors += '$type and data must both be defined.\n';
			}
			
			if(errors.length > 0) {
				console.error('PageFactoryService.setBackground: Warning(s) / Error(s):\n' + errors, $type, data);
			}
			
		};
		
		return {
			title: 'Untitled',
			background: {
				$type: 'color',
				data: {
					color: '#ffffff'
				}
			},
			SetBackground : setBackground
		};
	};
	
	return {
		GetPageTemplate : getPageTemplate
	};
};

angular.module('mazenet').factory('PageFactory', pageFactoryService);