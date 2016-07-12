/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />
declare var _;
import IActivePageService = require("./interfaces/IActivePageService");
import Page = require("../../models/pages/Page");
import IElement = require("../../models/interfaces/IElement");
import RootPages = require("../../models/pages/RootPages");
import PageStyles = require("../../models/pages/PageStyles");

export = ActivePageService;

class ActivePageService implements IActivePageService{
    static moduleName:string = 'ActivePageService';
    public PageData:Page;
    public RootPages:RootPages;
    public Styles:PageStyles;

    private callbacks = {
        cbAddElement: []
    };

    static FactoryDefinition = ['$rootScope',
                                ($rootScope:ng.IRootScopeService)=>{return new ActivePageService($rootScope)}];

    constructor(private $rootScope:ng.IRootScopeService) {
        this.PageData = new Page();
        this.RootPages = new RootPages();
        this.Styles = new PageStyles();
    }

    public UpdatePage(page:Page) {
        try {
            this.PageData.UpdatePage(page);
            this.updateStyles();
            this.$rootScope.$broadcast('activePageChanged');
        } catch(e) {
            console.error(e, page);
        }
    }

    public LoadPage(page:Page) {
        try {
            this.PageData.LoadPage(page);
            this.updateStyles();
            this.$rootScope.$broadcast('activePageChanged');
        } catch(e) {
            console.error(e, page);
        }
    }

    public AddElement(element:IElement) {
        if(element) {
            this.PageData.elements.push(element);
            _.each(this.callbacks.cbAddElement, (func:(e:IElement)=>void) => {
                func(element);
            });
        }
    }

    public OnAddElement(func:(e:IElement)=>void) {
        if(func) {
            this.callbacks.cbAddElement.push(func);
        }
    }

    public ContainsLinkOfName(name:string):boolean {
        return !_.every(this.PageData.elements, (element:IElement) => {
            /* Checks if its a link and not the return link then compares.
            * Iteration will stop as soon as false is returned. */
            return element.eType != 'link' || !!element.data.isReturnLink || element.data.text != name;
        });
    }

    private updateStyles() {

        this.Styles.background = this.PageData.background;
        this.Styles.SetStringifications();
    }

}