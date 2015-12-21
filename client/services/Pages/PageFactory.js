var pageFactoryService = function() {
    /* This returns an empty page. Update date it as the model for pages is updated. */
	function getEmptyPage() {
        return {
            _id: 0,
            creator: null,
            permissions: 'all',
            title: '',
            background: {
                bType: 'color',
                data: {
                    color: '#000000'
                }
            },
            owners:  [],
            elements: [],
            cursors: [],
            enterTime: (new Date()).getTime()
        };
	};
    
    return {
        GetEmptyPage: getEmptyPage
    }
};

angular.module('mazenet').factory('PageFactory', pageFactoryService);