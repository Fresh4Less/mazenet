var activePageService = function($q) { 
	var pageData = {
		_id : 0,
		title: 'Welcome to Mazenet',
		background : {
			$type : 'color',
			data : {
				color : '#cccccc'
			}
		}
	}
	
	var styles = {
		background: {
			$type : 'color',
			data : {
				color : '#cccccc'
			}
		},
		stringified: 'background : #cccccc'
	};

	
	function UpdatePage ( newPage ) {
		var pageUpdateErrors = "";
		if(newPage) {
			//Id
			if(newPage._id) {
				pageData._id = newPage._id;
			} else {
				pageUpdateErrors += 'Page contains no "_id".\n'
			}
			//Background
			if(newPage.background){
				//REMOVE after elliot fixes type to $type
				newPage.background.$type = newPage.background.type;
				//END REMOVE
				if(newPage.background.$type && newPage.background.data) {
					pageData.background = newPage.background;
				} else {
					pageUpdateErrors += 'Page contains invalid background.\n';
				}
			}
			/* TODO: Add other fields */
			updateStyles();	
		} else {
			pageUpdateErrors += 'Page is undefined.\n';
		}
		//(Optional) Error Reporting.
		if(pageUpdateErrors.length > 0) {
			console.error('"PageService.UpdatePage" Warning(s) / Error(s):\n' + pageUpdateErrors, newPage);
		}
	}
	
	function updateStyles() {
		//Background
		if(pageData.background.$type == 'color' && pageData.background.data) {
			styles.background = pageData.background;
		} else {
			styles.background.data.color = '#cccccc';
		}
		
		styles.stringified = '';
		//Stringify for 'styles'.
		if(styles.background.$type == 'color') {
			styles.stringified += 'background : ' + styles.background.data.color + ';';
		}
	}
	return {
		pageData : pageData,
		styles : styles,
		UpdatePage : UpdatePage
	};
};

angular.module('mazenet').factory('ActivePageService', ['$q', activePageService]);