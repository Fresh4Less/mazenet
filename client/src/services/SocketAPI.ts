/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import * as SocketIo from 'socket.io-client';
import * as API from '../../../common/api/v1';
import Socket = SocketIOClient.Socket;
import { MzPosition } from '../models/MzPosition';
import { WebRequest } from '../models/freshIO/WebRequest';
import { Page } from '../models/pages/Page';
import { IElement } from '../models/interfaces/IElement';
import { CursorFrame } from '../models/cursors/CursorFrame';
import { WebResponse } from '../models/freshIO/WebResponse';
import { PeerData } from '../models/PeerData';
import { ErrorService } from './ErrorService';

import { Observable, Observer } from 'rxjs';

export class SocketAPI {

    private static _instance: SocketAPI;

    readonly connectedObservable: Observable<API.Routes.Users.Connect.Post.Response200>;
    readonly pageEnterObservable: Observable<API.Routes.Rooms.Enter.Post.Response200>;
    readonly pageUpdatedObservable: Observable<Page>;

    private socket: Socket;

    /*
    * Constructor for the API singleton service.
    * Performs all the Socket IO communications with the server.
    */
    private constructor() {
        const loc = window.location;
        const serverPort = 9090; // TODO Edit when server serves front end.
        this.socket = SocketIo(`${loc.protocol}//${loc.hostname}:${serverPort}/mazenet`);

        /* Setup the Observable feeds */
        this.connectedObservable = new Observable<API.Routes.Users.Connect.Post.Response200>(
            (observer: Observer<API.Routes.Users.Connect.Post.Response200>) => {
                this.socket.on('/users/connect', (res: WebResponse) => {
                    if (res.status === 200) {
                        const res200 = (res.body as API.Routes.Users.Connect.Post.Response200);
                        observer.next(res200);
                        this.socket.emit('/rooms/enter',
                            new WebRequest('POST', {id: res200.rootRoomId}, '1'));
                        observer.complete();
                    } else {
                        ErrorService.Fatal('Could not connect to the server.', res);
                    }
                });
        }).publishReplay().refCount();

        this.pageEnterObservable =
            new Observable((observer: Observer<API.Routes.Rooms.Enter.Post.Response200>) => {
            this.socket.on('/rooms/enter', (res: WebResponse) => {
                if (res.status === 200) {
                    observer.next(res.body as API.Routes.Rooms.Enter.Post.Response200);
                } else {
                    ErrorService.Warning('Error entering room.',  res);
                }
            });
        }).share();
        this.socket.on('/pages/userEntered', this.peerEnteredCallback.bind(this));
        this.socket.on('/pages/userLeft', this.peerLeftCallback.bind(this));
        this.socket.on('/pages/cursors/moved', this.peerMovedCursorCallback.bind(this));
        this.socket.on('/pages/elements/create', this.elementCreateCallback.bind(this));
        this.socket.on('/pages/elements/created', this.elementCreatedCallback.bind(this));
        this.socket.on('/pages/update', this.pageUpdateCallback.bind(this));
        this.socket.on('/pages/updated', this.pageUpdatedCallback.bind(this));

        const device: API.Models.PlatformData.Desktop = {pType: 'desktop', cursorPos: {x: 0, y: 0}};
        this.socket.emit('/users/connect', new WebRequest('POST', device, '1'));

    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public EnterPage(pageId: string, entryPosition: MzPosition): void {

        this.socket.emit('/pages/enter', new WebRequest('GET', {
            pId: pageId,
            pos: {
                x: entryPosition.x,
                y: entryPosition.y
            }},                                         'TODO'));
    }

    public UpdatePage(pageData: Page): void {

        this.socket.emit('/pages/update', new WebRequest('GET', pageData.GetJSON(), 'TODO'));
    }

    public CreateElement(element: IElement): void {
        this.socket.emit('/pages/elements/create', new WebRequest('GET', element, 'TODO'));
    }

    public CursorMove(cursor: CursorFrame): void {
        this.socket.emit('/pages/cursors/moved', cursor);
    }

    /* ********** Event Handlers ********** */

    private peerEnteredCallback(peer: PeerData): void {
        // TODO
        // this.peerService.AddPeer(peer);
    }

    private peerLeftCallback(peer: PeerData): void {
        // TODO
        // this.peerService.RemovePeer(peer);
    }

    private peerMovedCursorCallback(peer: PeerData): void {
        // TODO
        // this.peerService.UpdatePeer(peer);
    }
    //
    // private userEnterPageCallback(response: WebResponse): void {
    //     // TODO
    //     // let promise = self.pageEnterPromiseMapper.GetPromiseForId(response.headers['X-Fresh-Request-Id']);
    //     //
    //     // if (promise) { //Check if somehow we got a response that we didn't ask for.
    //     //     if (response.status == 200) {
    //     //         let page: Page = response.body.page;
    //     //         let peers: PeerData[] = response.body.users;
    //     //         self.pageService.SetActivePage(page);
    //     //         self.peerService.SetPeers(peers);
    //     //         promise.resolve(page);
    //     //     } else {
    //     //         promise.reject(response.body);
    //     //     }
    //     // } else {
    //     //     console.error('userEnterPageCallback', 'Got response we did not ask for:', response);
    //     // }
    // }

    private elementCreateCallback(response: WebResponse): void {

        // TODO
        // let self = this;
        //
        // return (response: WebResponse) => {
        //
        //     let promise = self.elementCreatePromiseMapper.GetPromiseForId(response.headers['X-Fresh-Request-Id']);
        //
        //     if (promise) {
        //         if (response.status == 201) {
        //             //TODO: Remove me.
        //             console.error('fix the API docs because it says this should return 200 not 201');
        //         }
        //
        //         if (response.status == 200) {
        //
        //             let element: IElement = response.body;
        //             self.pageService.AddElementToActivePage(element);
        //
        //             promise.resolve(element);
        //
        //         } else {
        //
        //             promise.reject(response);
        //         }
        //     } else {
        //         console.error('elementCreateCallback', 'Got response we did not ask for:', response);
        //     }
        // };
    }

    private elementCreatedCallback(response: IElement): void {
        // TODO
        // this.pageService.AddElementToActivePage(response);
    }

    private pageUpdateCallback(response: WebResponse): void {
        // TODO
        // let self = this;
        // return (response: WebResponse) => {
        //
        //     let promise = self.pageUpdatePromiseMapper.GetPromiseForId(response.headers['X-Fresh-Request-Id']);
        //
        //     if (promise) {
        //         if (response.status == 200) {
        //
        //             let page: Page = response.body;
        //
        //             self.pageService.UpdateActivePage(page);
        //
        //             promise.resolve(page);
        //         } else {
        //             console.error('Error updating page.', response);
        //             promise.reject(response);
        //         }
        //     }
        // };
    }

    private pageUpdatedCallback(response: Page): void {
        // TODO
        // let self = this;
        // return (response: Page) => {
        //
        //     self.pageService.UpdateActivePage(response);
        //
        // };
    }

    // private loadInitialPage() {
    //     TODO
    //     let self = this;
    //
    //     let successCallback = (page: Page) => {
    //         console.log('Welcome to Mazenet.', self.userService.GetUserData());
    //     };
    //
    //     let failureCallback = (error: any) => {
    //         console.error('Could not enter page... redirecting to root.');
    //         self.EnterPage(error.rootPageId, {x: 0, y: 0}).then(successCallback, function (error) {
    //             console.error('Error loading root page. The Mazenet is dead.');
    //         });
    //     };
    //
    //     if (!!self.pageService.GetRootPage().url) {
    //         self.EnterPage(self.pageService.GetRootPage().url, {x: 0.5, y: 0.5})
    //     .then(successCallback, failureCallback);
    //     } else if (!!self.pageService.GetRootPage().homepage) {
    //         self.EnterPage(self.pageService.GetRootPage().homepage, {
    //             x: 0.5,
    //             y: 0.5
    //         }).then(successCallback, failureCallback);
    //     } else if (!!self.pageService.GetRootPage().root) {
    //         self.EnterPage(self.pageService.GetRootPage().root, {
    //             x: 0.5,
    //             y: 0.5
    //         }).then(successCallback, failureCallback);
    //     } else {
    //         console.error('No root page, homepage, or url page defined.');
    //     }
    // }
}