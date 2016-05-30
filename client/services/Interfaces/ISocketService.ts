/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
import MzPosition = require('./../../models/MzPosition');
import Page = require('./../../models/Pages/Page');
import IElement = require('./../../models/Interfaces/IElement');
import CursorFrame = require("../../models/Cursors/CursorFrame");

export = ISocketService;

interface ISocketService {
    InitialLoadComplete:boolean;
    Init();
    EnterPage(pageId:string, pos:MzPosition):angular.IPromise<Page>;
    UpdatePage(pageData:Page):angular.IPromise<Page>;
    CreateElement(element:IElement):angular.IPromise<IElement>;
    CursorMove(cursor:CursorFrame);
}