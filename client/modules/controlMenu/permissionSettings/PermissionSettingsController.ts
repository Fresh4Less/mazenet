/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

export = PermissionSettingsController;

class PermissionSettingsController {

    public permissions:string;
    static $inject = [];
    constructor() {}

    public GetPermissionWord():string {
        if(this.permissions == 'all') {
            return 'anything';
        } else if(this.permissions == 'links') {
            return 'links';
        } else if(this.permissions == 'none') {
            return 'nothing';
        } else {
            return '...';
        }
    }
}