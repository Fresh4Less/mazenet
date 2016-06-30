/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />
import RootPages = require('../../../models/pages/RootPages');
import Page = require('../../../models/pages/Page');
import PageStyles = require("../../../models/pages/PageStyles");
import IElement = require("../../../models/interfaces/IElement");

export = IActivePageService;

interface IActivePageService {
    PageData:Page;
    RootPages:RootPages;
    Styles:PageStyles;
    UpdatePage(page:Page);
    LoadPage(page:Page);
    AddElement(element:IElement);
    OnAddElement(func:(e:IElement)=>void);
    ContainsLinkOfName(name:string):boolean;
}