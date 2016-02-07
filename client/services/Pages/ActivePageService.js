/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports", "../../models/Pages/Page", "../../models/Pages/RootPages", "../../models/Pages/PageStyles"], function (require, exports, Page, RootPages, PageStyles) {
    var ActivePageService = (function () {
        function ActivePageService() {
            this.callbacks = {
                cbAddElement: []
            };
            this.PageData = new Page();
            this.RootPages = new RootPages();
            this.Styles = new PageStyles();
        }
        ActivePageService.prototype.UpdatePage = function (page) {
            try {
                this.PageData.UpdatePage(page);
                this.updateStyles();
            }
            catch (e) {
                console.error(e, page);
            }
        };
        ActivePageService.prototype.LoadPage = function (page) {
            try {
                this.PageData.LoadPage(page);
                this.updateStyles();
            }
            catch (e) {
                console.error(e, page);
            }
        };
        ActivePageService.prototype.AddElement = function (element) {
            if (element) {
                this.PageData.elements.push(element);
                _.each(this.callbacks.cbAddElement, function (func) {
                    func(element);
                });
            }
        };
        ActivePageService.prototype.OnAddElement = function (func) {
            if (func) {
                this.callbacks.cbAddElement.push(func);
            }
        };
        ActivePageService.prototype.updateStyles = function () {
            //Background
            if (this.PageData.background.bType == 'color') {
                this.Styles.background = this.PageData.background;
            }
            else {
                this.Styles.background.data.color = '#cccccc';
            }
            this.Styles.stringified = '';
            this.Styles.canvasStringified = '';
            //Stringify for 'styles'.
            if (this.Styles.background.bType == 'color') {
                this.Styles.canvasStringified += 'background : ' + this.Styles.background.data.color + ';';
            }
        };
        ActivePageService.name = 'ActivePageService';
        ActivePageService.FactoryDefinition = [function () { return new ActivePageService(); }];
        return ActivePageService;
    })();
    return ActivePageService;
});
//# sourceMappingURL=ActivePageService.js.map