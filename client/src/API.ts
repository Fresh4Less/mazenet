/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import * as SocketIo from 'socket.io-client';
import Socket = SocketIOClient.Socket;
import {MzPosition} from './models/MzPosition';
import {WebRequest} from './models/freshIO/WebRequest';
import {Page} from './models/pages/Page';

class API {

    private socket: Socket;

    /*
    * Constructor for the API singleton service.
    * Performs all the Socket IO communications with the server.
    */
    constructor() {
        const loc = window.location;
        this.socket = SocketIo(`${loc.protocol}//${loc.hostname}/mazenet`);

        if (this.socket.connected) {
            this.socket.on('/users/connect', this.connectedCallback());
            this.socket.on('/pages/userEntered', this.peerEnteredCallback());
            this.socket.on('/pages/userLeft', this.peerLeftCallback());
            this.socket.on('/pages/cursors/moved', this.peerMovedCursorCallback());
            this.socket.on('/pages/enter', this.userEnterPageCallback());
            this.socket.on('/pages/elements/create', this.elementCreateCallback());
            this.socket.on('/pages/elements/created', this.elementCreatedCallback());
            this.socket.on('/pages/update', this.pageUpdateCallback());
            this.socket.on('/pages/updated', this.pageUpdatedCallback());

            this.socket.emit('/users/connect', new WebRequest('GET', {}, '1'));
        }

    }

    public EnterPage(pageId: string, entryPosition: MzPosition):void {

        let self = this;

        return new Promise((resolve,reject)=> {

            let id:string = self.pageEnterPromiseMapper.GetNewId();

            self.pageEnterPromiseMapper.SetPromiseForId(id, {resolve:resolve, reject:reject});

            self.socket.emit('/pages/enter', new WebRequest('GET',{
                pId: pageId,
                pos: {
                    x: entryPosition.x,
                    y: entryPosition.y
                }
            }, id));
        });
    }

    public UpdatePage(pageData:Page):Promise<Page> {

        let self = this;

        return new Promise((resolve,reject)=> {
            let id:string = self.pageUpdatePromiseMapper.GetNewId();
            self.pageUpdatePromiseMapper.SetPromiseForId(id, {resolve:resolve, reject:reject});
            self.socket.emit('/pages/update', new WebRequest('GET', pageData.GetJSON(), id));
        });
    }

    public CreateElement(element:IElement):Promise<IElement> {

        let self = this;

        return new Promise((resolve,reject)=> {
            let id:string = self.elementCreatePromiseMapper.GetNewId();
            self.elementCreatePromiseMapper.SetPromiseForId(id, {resolve:resolve, reject:reject});
            self.socket.emit('/pages/elements/create', new WebRequest('GET', element, id));
        });
    }

    public CursorMove(cursor:CursorFrame):void {
        this.socket.emit('/pages/cursors/moved', cursor);
    }

    /* ********** Event Handlers ********** */

    private connectedCallback():(response:WebResponse)=>void {
        let self = this;
        return (response:WebResponse)=> {
            if(response.status == 200) {

                let user = new UserData();
                user.uId = response.body.uId;
                user.RootPageId = response.body.rootPageId;
                user.HomePageId = response.body.homePageId;

                self.userService.SetUserData(user);
                self.pageService.SetRootPages(new RootPages(user.RootPageId, user.HomePageId));

                self.loadInitialPage();

            } else {
                console.error("Could not connect to the Mazenet.", response);
            }
        };
    };
    private peerEnteredCallback():(peer:PeerData)=>void {
        let self = this;
        return (peer)=> {

            self.peerService.AddPeer(peer);
        }
    };
    private peerLeftCallback():(peer:PeerData)=>void {
        let self = this;
        return (peer) => {
            self.peerService.RemovePeer(peer);
        }
    };
    private peerMovedCursorCallback():(peer:PeerData)=>void {
        let self = this;
        return (peer) => {
            self.peerService.UpdatePeer(peer);
        };
    };
    private userEnterPageCallback():(response:WebResponse)=>void {
        let self = this;
        return (response:WebResponse) => {

            let promise = self.pageEnterPromiseMapper.GetPromiseForId(response.headers['X-Fresh-Request-Id']);

            if(promise) { //Check if somehow we got a response that we didn't ask for.
                if(response.status == 200) {
                    let page:Page = response.body.page;
                    let peers:PeerData[] = response.body.users;
                    self.pageService.SetActivePage(page);
                    self.peerService.SetPeers(peers);
                    promise.resolve(page);
                } else {
                    promise.reject(response.body);
                }
            } else {
                console.error('userEnterPageCallback', 'Got response we did not ask for:', response);
            }
        };
    };
    private elementCreateCallback():(response:WebResponse)=>void {

        let self = this;

        return (response:WebResponse) => {

            let promise = self.elementCreatePromiseMapper.GetPromiseForId(response.headers['X-Fresh-Request-Id']);

            if(promise) {
                if(response.status == 201) {
                    //TODO: Remove me.
                    console.error('fix the API docs because it says this should return 200 not 201');
                }

                if(response.status == 200) {

                    let element:IElement = response.body;
                    self.pageService.AddElementToActivePage(element);

                    promise.resolve(element);

                } else {

                    promise.reject(response);
                }
            } else {
                console.error('elementCreateCallback', 'Got response we did not ask for:', response);
            }
        };
    };
    private elementCreatedCallback():(response:IElement)=>void {
        let self = this;
        return (response:IElement) => {

            self.pageService.AddElementToActivePage(response);

        };
    };
    private pageUpdateCallback():(response:WebResponse)=>void {
        let self = this;
        return (response:WebResponse) => {

            let promise = self.pageUpdatePromiseMapper.GetPromiseForId(response.headers['X-Fresh-Request-Id']);

            if(promise) {
                if(response.status == 200) {

                    let page:Page = response.body;

                    self.pageService.UpdateActivePage(page);

                    promise.resolve(page);
                } else {
                    console.error('Error updating page.', response);
                    promise.reject(response);
                }
            }
        };
    };
    private pageUpdatedCallback():(response:Page)=>void {
        let self = this;
        return (response:Page) => {

            self.pageService.UpdateActivePage(response);

        };
    };
    private loadInitialPage() {
        let self = this;

        let successCallback = (page:Page) => {
            console.log('Welcome to Mazenet.', self.userService.GetUserData());
        };

        let failureCallback = (error:any) => {
            console.error('Could not enter page... redirecting to root.');
            self.EnterPage(error.rootPageId, {x: 0, y: 0}).then(successCallback, function(error) {
                console.error('Error loading root page. The Mazenet is dead.');
            });
        };

        if(!!self.pageService.GetRootPage().url) {
            self.EnterPage(self.pageService.GetRootPage().url, {x: 0.5, y: 0.5}).then(successCallback, failureCallback);
        } else if(!!self.pageService.GetRootPage().homepage) {
            self.EnterPage(self.pageService.GetRootPage().homepage, {x: 0.5, y: 0.5}).then(successCallback, failureCallback);
        } else if(!!self.pageService.GetRootPage().root) {
            self.EnterPage(self.pageService.GetRootPage().root, {x: 0.5, y: 0.5}).then(successCallback, failureCallback);
        } else {
            console.error('No root page, homepage, or url page defined.');
        }
    }
}


let instance = new API();

export default instance;