var activePageService = function($q, PageFactory) { 
	var rootPages = {
		root: '',
		homepage: '',
		url: '',
	};
	var pageData = PageFactory.GetEmptyPage();
	
	var styles = {
		background: {
			bType : 'color',
			data : {
				color : '#000000'
			}
		},
		stringified: '',
		canvasStringified: 'background : #000000'
	};
	
	var Callbacks = {
		cbAddElement: []
	};

	/* Replaces data on current page with all the truthy data on input page. */
	function updatePage ( newPage ) {
		var pageUpdateErrors = "";
		if(newPage) {
			//Id
			if(newPage._id) {
				pageData._id = newPage._id;
			} else {
				pageUpdateErrors += 'Page contains no "_id".\n';
			}
            if(newPage.creator) {
				pageData.creator = newPage.creator;
			}
            if(newPage.permissions) {
				pageData.permissions = newPage.permissions;
			}
			if(newPage.title) {
				pageData.title = newPage.title;
			}
            if(newPage.background){
				newPage.background.bType = newPage.background.bType;
			
				if(newPage.background.bType && newPage.background.data) {
					pageData.background = newPage.background;
				} else {
					pageUpdateErrors += 'Page contains invalid background.\n';
				}
			}
			if(newPage.owners) {
				pageData.owners = newPage.owners;
			}
			if(newPage.elements) {
				pageData.elements = newPage.elements;
			}
			if(newPage.cursors) {
				pageData.cursors = newPage.cursors;
			}
			
            /* Clientside parameters */
            pageData.enterTime = (new Date()).getTime();
			updateStyles();	
		} else {
			pageUpdateErrors += 'Page is undefined.\n';
		}
		//(Optional) Error Reporting.
		if(pageUpdateErrors.length > 0) {
			console.error('"ActivePageService.UpdatePage" Warning(s) / Error(s):\n' + pageUpdateErrors, newPage);
		}
	};
	function loadPage(page) {
        pageData = PageFactory.GetEmptyPage();
        updatePage(page);
    };
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
			Callbacks.cbAddElement.forEach(function(cbFunc){
				cbFunc(element);
			});
		}
	}
	function onAddElement(func) {
		if(_.isFunction(func)) {
			Callbacks.cbAddElement.push(func);
		}
	}
	return {
		PageData : pageData,
		RootPages : rootPages,
		styles : styles,
		UpdatePage : updatePage,
        LoadPage : loadPage,
		AddElement : addElement,
		OnAddElement: onAddElement
	};
    
};

angular.module('mazenet').factory('ActivePageService', ['$q', 'PageFactory', activePageService]);