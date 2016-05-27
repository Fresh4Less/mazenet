/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import IClickNetService = require("../../services/interfaces/IClickNetService");

export = ClickNetController;

class ClickNetController {
    static $inject = ['ClickNetService'];
    constructor(public ClickNetService:IClickNetService) {
    };
}