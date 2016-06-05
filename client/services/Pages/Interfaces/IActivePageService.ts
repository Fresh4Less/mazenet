/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />
import RootPages = require('../../../models/Pages/RootPages');
import Page = require('../../../models/Pages/Page');
import PageStyles = require("../../../models/Pages/PageStyles");
import IElement = require("../../../models/Interfaces/IElement");

export = IActivePageService;

interface IActivePageService {
    PageData:Page;
    RootPages:RootPages;
    Styles:PageStyles;
    UpdatePage(page:Page);
    LoadPage(page:Page);
    AddElement(element:IElement);
    OnAddElement(func:(e:IElement)=>void);
}