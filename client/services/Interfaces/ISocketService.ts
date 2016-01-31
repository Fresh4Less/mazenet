/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
import Position = require('./../../models/Position');
import Cursor = require('./../../models/Cursor');
import Page = require('./../../models/Page');
import IElement = require('./../../models/Interfaces/IElement');

export = ISocketService;

interface ISocketService {
    Init();
    EnterPage(pageId:string, pos:Position);
    UpdatePage(pageData:Page);
    CreateElement(element:IElement);
    CursorMove(cursor:Cursor);
}