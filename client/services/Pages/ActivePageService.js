var activePageService = function($q) { 
	var rootPages = {
		root: '',
		homepage: '',
		url: '',
	}
	var pageData = {
		_id : '563ff6d5ed248da731bcfae6',
		creator: "0",
		title: 'Welcome to Mazenet',
		background : {
			bType : 'color',
			data : {
				color : '#cccccc'
			}
		},
		owners : [],
		permissions : 'all',
		elements : [],
		enterTime: 0
	}
	
	var styles = {
		background: {
			bType : 'color',
			data : {
				color : '#cccccc'
			}
		},
		stringified: '',
		canvasStringified: 'background : #cccccc'
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
			if(newPage.title) {
				pageData.title = newPage.title;
			}
			if(newPage.creator) {
				pageData.creator = newPage.creator;
			}
			if(newPage.owners) {
				pageData.owners = newPage.owners;
			}
			if(newPage.permissions) {
				pageData.permissions = newPage.permissions;
			}
			if(newPage.elements) {
				pageData.elements = newPage.elements;
			}
			//Background
			if(newPage.background){
				//REMOVE after elliot fixes type to $type
				newPage.background.bType = newPage.background.bType;
				//END REMOVE
				if(newPage.background.bType && newPage.background.data) {
					pageData.background = newPage.background;
				} else {
					pageUpdateErrors += 'Page contains invalid background.\n';
				}
			}
			/* TODO: Add other fields */
			pageData.enterTime = (new Date()).getTime();
			updateStyles();	
		} else {
			pageUpdateErrors += 'Page is undefined.\n';
		}
		//(Optional) Error Reporting.
		if(pageUpdateErrors.length > 0) {
			console.error('"ActivePageService.UpdatePage" Warning(s) / Error(s):\n' + pageUpdateErrors, newPage);
		}
	}
	
	function updateStyles() {
		//Background
		if(pageData.background.bType == 'color' && pageData.background.data) {
			styles.background = pageData.background;
		} else {
			styles.background.data.color = '#cccccc';
		}
		
		styles.stringified = '';
		styles.canvasStringified = '';

		//Stringify for 'styles'.
		if(styles.background.bType == 'color') {
			styles.canvasStringified += 'background : ' + styles.background.data.color + ';';
		}
	}
	function addElement(element) {
		if(element) {
			pageData.elements.push(element);	
		}
	}
	return {
		pageData : pageData,
		RootPages : rootPages,
		styles : styles,
		UpdatePage : UpdatePage,
		AddElement : addElement 
	};
};

angular.module('mazenet').factory('ActivePageService', ['$q', activePageService]);