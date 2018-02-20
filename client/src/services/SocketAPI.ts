/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import * as SocketIo from 'socket.io-client';
import { Events, Models, Routes } from '../../../common/api/v1';
import Socket = SocketIOClient.Socket;
import { WebRequest } from '../models/freshIO/WebRequest';
import { Page } from '../models/pages/Page';
import { CursorFrame } from '../models/cursors/CursorFrame';
import { WebResponse } from '../models/freshIO/WebResponse';
import { ErrorService } from './ErrorService';

import { Observable, Observer } from 'rxjs';

export class SocketAPI {

    private static _instance: SocketAPI;

    readonly connectedObservable: Observable<Routes.Users.Connect.Post.Response200>;
    readonly userCreateObservable: Observable<Models.User>;
    readonly roomEnteredObservable: Observable<Routes.Rooms.Enter.Post.Response200>;
    readonly roomUpdatedObservable: Observable<Models.Room>;
    readonly structureCreatedObservable: Observable<Models.Structure>;
    readonly structureUpdatedObservable: Observable<Models.Structure>;
    readonly activeUserEnteredObservable: Observable<Models.ActiveUser>;
    readonly activeUserExitedObservable: Observable<Models.ActiveUser>;
    readonly activeUserDesktopCursorMovedObservable: Observable<Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved>;

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
        this.connectedObservable = this.initConnectedObservable();
        // TODO userCreatedObservable
        this.roomEnteredObservable = this.initRoomEnteredObservable();
        // TODO roomUpdatedObservable
        this.structureCreatedObservable = this.initStructureCreatedObservable();
        // TODO structureUpdatedObservable
        // TODO activeUser... Observables

        const device: Models.PlatformData.Desktop = {pType: 'desktop', cursorPos: {x: 0, y: 0}};
        this.socket.emit('/users/connect', new WebRequest('POST', device, '1'));

    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    public EnterPage(roomId: string): void {
        this.socket.emit('/rooms/enter', new WebRequest('POST', {id: roomId}, '1'));
    }

    public UpdatePage(pageData: Page): void {

        this.socket.emit('/pages/update', new WebRequest('GET', pageData.GetJSON(), '1'));
    }

    public CreateStructure(roomId: string, blueprint: Models.Structure.Blueprint): void {
        this.socket.emit('/rooms/structures/create', new WebRequest('POST', {
            roomId: roomId,
            structure: blueprint
        }, '1'));
    }

    public CursorMove(cursor: CursorFrame): void {
        this.socket.emit('/pages/cursors/moved', cursor);
    }

    /* ********** Private ********** */

    private initConnectedObservable() {
        return new Observable<Routes.Users.Connect.Post.Response200>(
            (observer: Observer<Routes.Users.Connect.Post.Response200>) => {
                this.socket.on('/users/connect', (res: WebResponse) => {
                    if (res.status === 200) {
                        const res200 = (res.body as Routes.Users.Connect.Post.Response200);
                        observer.next(res200);
                        this.socket.emit('/rooms/enter',
                            new WebRequest('POST', {id: res200.rootRoomId}, '1'));
                        observer.complete();
                    } else {
                        ErrorService.Fatal('Could not connect to the server.', res);
                    }
                });
            }).publishReplay().refCount();
    }

    private initRoomEnteredObservable() {
        return new Observable((observer: Observer<Routes.Rooms.Enter.Post.Response200>) => {
            this.socket.on('/rooms/enter', (res: WebResponse) => {
                if (res.status === 200) {
                    observer.next(res.body as Routes.Rooms.Enter.Post.Response200);
                } else {
                    ErrorService.Warning('Error entering room.',  res);
                }
            });
        }).share();
    }

    private initStructureCreatedObservable() {
        return new Observable((observer: Observer<Models.Structure>) => {
            this.socket.on('/rooms/structures/create', (res: WebResponse) => {
               if (res.status === 201) {
                   const struct = (res.body as Models.Structure);
                   observer.next(struct);
               }  else {
                   ErrorService.Warning('Could not create structure.', res);
               }
            });
            this.socket.on('/rooms/structures/created', (structure: Models.Structure) => {
                observer.next(structure);
            });
        }).share();
    }
}