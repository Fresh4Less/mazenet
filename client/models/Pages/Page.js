define(["require", "exports"], function (require, exports) {
    var Page = (function () {
        function Page() {
            this.resetPage();
        }
        Page.prototype.UpdatePage = function (otherPage) {
            if (otherPage) {
                //Id
                if (otherPage._id != this._id) {
                    throw "cannot UpdatePage with a different page. Use LoadPage instead";
                }
                if (otherPage.creator) {
                    this.creator = otherPage.creator;
                }
                if (otherPage.permissions) {
                    this.permissions = otherPage.permissions;
                }
                if (otherPage.title) {
                    this.title = otherPage.title;
                }
                if (otherPage.background) {
                    this.background.bType = otherPage.background.bType;
                    this.background.data = angular.copy(otherPage.background.data);
                }
                if (otherPage.owners) {
                    this.owners = otherPage.owners;
                }
                if (otherPage.elements) {
                    this.elements = angular.copy(otherPage.elements);
                }
                if (otherPage.cursors) {
                    this.cursors = angular.copy(otherPage.cursors);
                }
                this.enterTime = (new Date()).getTime();
            }
            else {
                throw "cannot UpdatePage undefined page";
            }
        };
        Page.prototype.LoadPage = function (otherPage) {
            if (otherPage) {
                if (otherPage._id) {
                    this.resetPage();
                    this._id = otherPage._id;
                    this.UpdatePage(otherPage);
                }
                else {
                    throw "cannot LoadPage page contains no _id";
                }
            }
            else {
                throw "cannot LoadPage page undefined";
            }
        };
        Page.prototype.resetPage = function () {
            this._id = '0';
            this.creator = null;
            this.permissions = 'all';
            this.title = '';
            this.background = {
                bType: 'color',
                data: {
                    color: '#000000'
                }
            };
            this.owners = [];
            this.elements = [];
            this.cursors = [];
            this.enterTime = (new Date()).getTime();
        };
        return Page;
    })();
    return Page;
});
//# sourceMappingURL=Page.js.map