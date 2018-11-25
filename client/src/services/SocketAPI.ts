/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import * as SocketIo from 'socket.io-client';
import { Events, Models, Routes } from '../../../common/api/v1';
import Socket = SocketIOClient.Socket;
import { WebRequest } from '../models/freshIO/WebRequest';
import { WebResponse } from '../models/freshIO/WebResponse';
import { ErrorService } from './ErrorService';

import { Observable, Observer } from 'rxjs';
import { TransactionManager } from './TransactionManager';
import URLManager from './URLManager';

export class SocketAPI {

    private static _instance: SocketAPI;

    /*
     * Managers for transactional SocketIO requests. Maps callbacks
     */
    readonly connectedObservable: Observable<Routes.Users.Connect.Post.Response200>;
    readonly userCreateObservable: Observable<Models.User>;
    readonly roomEnteredObservable: Observable<Routes.Rooms.Enter.Post.Response200>;
    readonly roomUpdatedObservable: Observable<Models.Room>;
    readonly cursorRecordingsObservable: Observable<Routes.Rooms.CursorRecordings.Get.Response200>;
    readonly structureCreatedObservable: Observable<Models.Structure>;
    readonly structureUpdatedObservable: Observable<Models.Structure>;
    readonly activeUserEnteredObservable: Observable<Models.ActiveUser>;
    readonly activeUserExitedObservable: Observable<Models.ActiveUser.Id>;
    readonly activeUserDesktopCursorMovedObservable: Observable<Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved>;

    private socket: Socket;
    private transactionManager: TransactionManager;
    private rootPageId: Models.Room.Id;
    private activePageId: Models.Room.Id;

    /*
    * Constructor for the API singleton service.
    * Performs all the Socket IO communications with the server.
    */
    private constructor() {
        window.Mazenet.SocketAPI = this;
        const loc = window.location;
        this.socket = SocketIo(`${loc.protocol}//${loc.hostname}:${loc.port}/mazenet`);
        this.transactionManager = new TransactionManager();
        this.activePageId = '';
        this.rootPageId = '';

        /* Setup the Observable feeds */
        this.connectedObservable = this.initConnectedObservable();
        // TODO userCreatedObservable
        this.roomEnteredObservable = this.initRoomEnteredObservable();
        this.roomUpdatedObservable = this.initRoomUpdatedObservable();
        this.cursorRecordingsObservable = this.initCursorRecordingsObservable();
        this.structureCreatedObservable = this.initStructureCreatedObservable();
        this.structureUpdatedObservable = this.initStructureUpdatedObservable();
        this.activeUserEnteredObservable = this.initActiveUserEnteredObservable();
        this.activeUserExitedObservable = this.initActiveUserExitedObservable();
        this.activeUserDesktopCursorMovedObservable = this.initActiveUserDesktopCursorMovedObservable();
        window.addEventListener('hashchange', this.checkURLAndLoadPage.bind(this));

        /* Connect and enter the initial room */
        this.Connect().subscribe(res200 => {
            this.rootPageId = res200.rootRoomId;
            const urlRoom = URLManager.ParseRoomId();
            this.EnterRoom(urlRoom ? urlRoom : this.rootPageId);
        });
    }

    public static get Instance(): SocketAPI {
        return this._instance || (this._instance = new this());
    }

    private Connect(): Observable<Routes.Users.Connect.Post.Response200> {
        const o = new Observable<Routes.Users.Connect.Post.Response200>(
            observer => {
                const requestID = this.transactionManager.NewTransactionWithObserver(observer);
                this.socket.emit(Routes.Users.Connect.Route, new WebRequest('POST', SocketAPI.Platform(), requestID));
            }).publish();
        o.connect();
        return o;
    }

    public EnterRootPage(): Observable<Routes.Rooms.Enter.Post.Response200> {
        if (this.rootPageId === '') {
            return new Observable(obs => obs.error('root page ID is empty'));
        }
        return this.EnterRoom(this.rootPageId);
    }

    public EnterRoom(roomId: string): Observable<Routes.Rooms.Enter.Post.Response200> {
        const o = new Observable<Routes.Rooms.Enter.Post.Response200>(observer => {
            const requestID = this.transactionManager.NewTransactionWithObserver(observer);
            this.socket.emit(Routes.Rooms.Enter.Route,
                new WebRequest('POST', {id: roomId}, requestID));
        }).publish();
        o.connect();
        return o;
    }

    public UpdateRoom(roomId: string, data: Models.Room.Patch): Observable<Models.Room> {
        const o = new Observable<Models.Room>(observer => {
            const requestID = this.transactionManager.NewTransactionWithObserver(observer);
            this.socket.emit(Routes.Rooms.Update.Route, new WebRequest('POST', {id: roomId, patch: data}, requestID));
        }).publish();
        o.connect();
        return o;
    }

    public GetCursorRecordings(roomId: string, limit: number): Observable<Routes.Rooms.CursorRecordings.Get.Response200> {
        const o = new Observable<Routes.Rooms.CursorRecordings.Get.Response200>(
            (observer: Observer<Routes.Rooms.CursorRecordings.Get.Response200>) => {
                const uniqueId = this.transactionManager.NewTransactionWithObserver(observer);
                this.socket.emit(Routes.Rooms.CursorRecordings.Route,
                    new WebRequest('GET', {roomId, limit}, uniqueId));
            }).publish();
        o.connect();
        return o;
    }

    public CreateStructure(roomId: string, blueprint: Models.Structure.Blueprint): Observable<Models.Structure> {
        const o = new Observable<Models.Structure>(observer => {
            const requestID = this.transactionManager.NewTransactionWithObserver(observer);
            this.socket.emit(Routes.Rooms.Structures.Create.Route, new WebRequest('POST', {
                roomId: roomId,
                structure: blueprint
            }, requestID));
        }).publish();
        o.connect();
        return o;
    }

    public UpdateStructure(structureId: string, patch: Models.Structure.Patch): Observable<Models.Structure> {
        const o = new Observable<Models.Structure>(observer => {
            const requestID = this.transactionManager.NewTransactionWithObserver(observer);
            this.socket.emit(Routes.Rooms.Structures.Update.Route, new WebRequest('POST', {
                id: structureId,
                patch: patch,
            }, requestID));
        }).publish();
        o.connect();
        return o;
    }

    public CursorMove(cursor: Events.Client.Rooms.ActiveUsers.Desktop.CursorMoved): void {
        // This is called a LOT, keep it lightweight.
        this.socket.emit(Events.Client.Rooms.ActiveUsers.Desktop.CursorMoved.Route, cursor);
    }

    /* ********** Observable Initializers ********** */

    private initConnectedObservable(): Observable<Routes.Users.Connect.Post.Response200> {
        const o = new Observable<Routes.Users.Connect.Post.Response200>(
            (observer: Observer<Routes.Users.Connect.Post.Response200>) => {
                this.socket.on(Routes.Users.Connect.Route, (res: WebResponse) => {
                    if (res.status === 200) {
                        const res200 = (res.body as Routes.Users.Connect.Post.Response200);
                        observer.next(res200);
                        this.transactionManager.CompleteTransaction(res, res200);
                    } else {
                        ErrorService.Fatal('could not connect to the server.', res);
                        this.transactionManager.ErrorTransaction(res);
                    }
                });
            }).publish();
        o.connect();
        return o;
    }

    private initRoomEnteredObservable(): Observable<Routes.Rooms.Enter.Post.Response200> {
        const o = new Observable((observer: Observer<Routes.Rooms.Enter.Post.Response200>) => {
            this.socket.on(Routes.Rooms.Enter.Route, (res: WebResponse) => {
                if (res.status === 200) {
                    const res200 = (res.body as Routes.Rooms.Enter.Post.Response200);
                    URLManager.UpdateRoomId(this.activePageId = res200.room.id);
                    observer.next(res200);
                    this.transactionManager.CompleteTransaction(res, res200);
                } else {
                    this.transactionManager.ErrorTransaction(res);
                    if (this.activePageId === '') {
                        this.activePageId = this.rootPageId;
                        ErrorService.Warning('could not enter room, entering root room instead');
                        this.EnterRootPage();
                    } else {
                        ErrorService.Warning('could not enter room', res);
                    }
                }
            });
        }).publish();
        o.connect();
        return o;
    }

    private initRoomUpdatedObservable(): Observable<Models.Room> {
        const o = new Observable((observer: Observer<Models.Room>) => {
            this.socket.on(Routes.Rooms.Update.Route, (res: WebResponse) => {
                if (res.status === 200) {
                    const room = (res.body as Models.Room);
                    observer.next(room);
                    this.transactionManager.CompleteTransaction(res, room);
                } else {
                    ErrorService.Warning('could not update room', res);
                    this.transactionManager.ErrorTransaction(res);
                }
            });
            this.socket.on(Events.Server.Rooms.Updated.Route, (res: Models.Room) => {
                if (this.activePageId === res.id) {
                    observer.next(res);
                }
            });
        }).publish();
        o.connect();
        return o;
    }

    private initCursorRecordingsObservable(): Observable<Routes.Rooms.CursorRecordings.Get.Response200> {
        const o = new Observable((observer: Observer<Routes.Rooms.CursorRecordings.Get.Response200>) => {
            this.socket.on(Routes.Rooms.CursorRecordings.Route, (res: WebResponse) => {
                if (res.status === 200) {
                    const res200 = (res.body as Routes.Rooms.CursorRecordings.Get.Response200);
                    observer.next(res200);
                    this.transactionManager.CompleteTransaction(res, res200);
                } else {
                    ErrorService.Warning('could not get cursors', res);
                    this.transactionManager.ErrorTransaction(res);
                }
            });
        }).publish();
        o.connect();
        return o;
    }

    private initStructureCreatedObservable(): Observable<Models.Structure> {
        const o = new Observable((observer: Observer<Models.Structure>) => {
            this.socket.on(Routes.Rooms.Structures.Create.Route, (res: WebResponse) => {
                if (res.status === 201) {
                    const structure = (res.body as Models.Structure);
                    observer.next(structure);
                    this.transactionManager.CompleteTransaction(res, structure);
                } else {
                    ErrorService.Warning('could not create structure', res);
                    this.transactionManager.ErrorTransaction(res);
                }
            });
            this.socket.on(Events.Server.Rooms.Structures.Created.Route,
                (created: Events.Server.Rooms.Structures.Created) => {
                    if (this.activePageId === created.roomId) {
                        observer.next(created.structure);
                    }
                });
        }).publish();
        o.connect();
        return o;
    }

    private initStructureUpdatedObservable(): Observable<Models.Structure> {
        const o = new Observable((observer: Observer<Models.Structure>) => {
            this.socket.on(Routes.Rooms.Structures.Update.Route, (res: WebResponse) => {
                if (res.status === 200) {
                    const structure = (res.body as Models.Structure);
                    observer.next(structure);
                    this.transactionManager.CompleteTransaction(res, structure);
                } else {
                    ErrorService.Warning('could not create structure', res);
                    this.transactionManager.ErrorTransaction(res);
                }
            });
            this.socket.on(Events.Server.Rooms.Structures.Updated.Route,
                (updated: Events.Server.Rooms.Structures.Updated) => {
                    if (this.activePageId === updated.roomId) {
                        observer.next(updated.structure);
                    }
                });
        }).publish();
        o.connect();
        return o;
    }

    private initActiveUserEnteredObservable(): Observable<Models.ActiveUser> {
        let o = new Observable((observer: Observer<Models.ActiveUser>) => {
            this.socket.on(Events.Server.Rooms.ActiveUsers.Entered.Route,
                (user: Events.Server.Rooms.ActiveUsers.Entered) => {
                    if (this.activePageId === user.roomId) {
                        observer.next(user.activeUser);
                    }
                });
        }).publish();
        o.connect();
        return o;
    }

    private initActiveUserExitedObservable(): Observable<Models.ActiveUser.Id> {
        const o = new Observable((observer: Observer<Models.ActiveUser.Id>) => {
            this.socket.on(Events.Server.Rooms.ActiveUsers.Exited.Route,
                (user: Events.Server.Rooms.ActiveUsers.Exited) => {
                    if (this.activePageId === user.roomId) {
                        observer.next(user.activeUserId);
                    }
                });
        }).publish();
        o.connect();
        return o;
    }

    private initActiveUserDesktopCursorMovedObservable(): Observable<Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved> {
        const o = new Observable((observer: Observer<Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved>) => {
            this.socket.on(Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved.Route,
                (cursor: Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved) => {
                    if (this.activePageId === cursor.roomId) {
                        observer.next(cursor);
                    }
                });
        }).publish();
        o.connect();
        return o;
    }

    /* ********** Utility ********** */

    private checkURLAndLoadPage() {
        let urlRoom = URLManager.ParseRoomId();
        if (urlRoom && urlRoom !== this.activePageId) {
            this.EnterRoom(urlRoom);
        }
    }

    // TODO: Make this depend on the actual platform.
    private static Platform(): Models.PlatformData {
        return {pType: 'desktop', cursorPos: {x: 0, y: 0}};
    }
}
