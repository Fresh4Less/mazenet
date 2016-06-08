/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />
import MzPosition = require('./../../models/MzPosition');
import Page = require('./../../models/pages/Page');
import IElement = require('./../../models/interfaces/IElement');
import CursorFrame = require("../../models/cursors/CursorFrame");

export = ISocketService;

interface ISocketService {
    InitialLoadComplete:boolean;
    Init();
    EnterPage(pageId:string, pos:MzPosition):angular.IPromise<Page>;
    UpdatePage(pageData:Page):angular.IPromise<Page>;
    CreateElement(element:IElement):angular.IPromise<IElement>;
    CursorMove(cursor:CursorFrame);
}