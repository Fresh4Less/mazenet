/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import * as SocketIo from 'socket.io-client';
import { Events, Models, Routes } from '../../../common/api/v1';
import Socket = SocketIOClient.Socket;
import { WebRequest } from '../models/freshIO/WebRequest';
import { WebResponse } from '../models/freshIO/WebResponse';
import { ErrorService } from './ErrorService';

import { Observable, Observer } from 'rxjs';
import TransactionManager from './TransactionManager';

export class SocketAPI {

    private static _instance: SocketAPI;

    readonly connectedObservable: Observable<Routes.Users.Connect.Post.Response200>;
    readonly userCreateObservable: Observable<Models.User>;
    readonly roomEnteredObservable: Observable<Routes.Rooms.Enter.Post.Response200>;
    readonly roomUpdatedObservable: Observable<Models.Room>;
    readonly structureCreatedObservable: Observable<Models.Structure>;
    readonly structureUpdatedObservable: Observable<Models.Structure>;
    readonly activeUserEnteredObservable: Observable<Models.ActiveUser>;
    readonly activeUserExitedObservable: Observable<Models.ActiveUser.Id>;
    readonly activeUserDesktopCursorMovedObservable: Observable<Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved>;

    private socket: Socket;
    private uniqueIdCounter: number;
    private rootPage: string;
    private cursorRecordingTransactionManager: TransactionManager;
    private activePageId: string;

    /*
     * Managers for transactional SocketIO requests. Maps callbacks
     */

    /*
    * Constructor for the API singleton service.
    * Performs all the Socket IO communications with the server.
    */
    private constructor() {
        const loc = window.location;
        const serverPort = 8080; // TODO Edit when server serves front end.
        this.activePageId = '';
        this.socket = SocketIo(`${loc.protocol}//${loc.hostname}:${serverPort}/mazenet`);
        this.uniqueIdCounter = 0;
        this.rootPage = '';
        this.cursorRecordingTransactionManager = new TransactionManager(this.socket, '/rooms/cursor-recordings');

        /* Setup the Observable feeds */
        this.connectedObservable = this.initConnectedObservable();
        // TODO userCreatedObservable
        this.roomEnteredObservable = this.initRoomEnteredObservable();
        // TODO roomUpdatedObservable
        this.structureCreatedObservable = this.initStructureCreatedObservable();
        this.structureUpdatedObservable = this.initStructureUpdatedObservable();
        this.activeUserEnteredObservable = this.initActiveUserEnteredObservable();
        this.activeUserExitedObservable = this.initActiveUserExitedObservable();
        this.activeUserDesktopCursorMovedObservable = this.initActiveUserDesktopCursorMovedObservable();

        const device: Models.PlatformData.Desktop = {pType: 'desktop', cursorPos: {x: 0, y: 0}};
        this.socket.emit('/users/connect', new WebRequest('POST', device, '1'));

    }

    public static get Instance(): SocketAPI {
        return this._instance || (this._instance = new this());
    }

    public EnterRootPage(): void {
        if (this.rootPage.length > 0) {
            this.socket.emit('/rooms/enter', new WebRequest('POST', {id: this.rootPage}, 'todo'));
        }
    }

    public EnterRoom(roomId: string): void {
        this.socket.emit('/rooms/enter', new WebRequest('POST', {id: roomId}, 'todo'));
    }

    public UpdateRoom(pageData: Models.Room): void {

        this.socket.emit('/pages/update', new WebRequest('GET', pageData, 'todo'));
    }

    public CreateStructure(roomId: string, blueprint: Models.Structure.Blueprint): void {
        this.socket.emit('/rooms/structures/create', new WebRequest('POST', {
            roomId: roomId,
            structure: blueprint
        }, 'todo'));
    }

    public UpdateStructure(structureId: string, patch: Models.Structure.Patch): void {
        this.socket.emit('/rooms/structures/update' , new WebRequest('POST', {
            id: structureId,
            patch: patch,
        }, 'todo'));
    }

    public CursorMove(cursor: Events.Client.Rooms.ActiveUsers.Desktop.CursorMoved): void {
        this.socket.emit('/rooms/active-users/desktop/cursor-moved', cursor);
    }

    public GetRecordingForRoom(roomId: string): Observable<Routes.Rooms.CursorRecordings.Get.Response200> {
        return new Observable<Routes.Rooms.CursorRecordings.Get.Response200>(
            (observer: Observer<Routes.Rooms.CursorRecordings.Get.Response200>) => {
                const uniqueId = `id-${++this.uniqueIdCounter}`;
                this.cursorRecordingTransactionManager.AddTransactionListener(uniqueId, (res: WebResponse) => {
                    if (res.status === 200) {
                        observer.next(res.body as Routes.Rooms.CursorRecordings.Get.Response200);
                    } else {
                        ErrorService.Warning(`Could not get recording for room: ${roomId}`, res);
                    }
                    observer.complete();
                });
                this.socket.emit('/rooms/cursor-recordings', new WebRequest('GET', {
                    roomId: roomId
                }, uniqueId));
            });
    }

    /* ********** Private ********** */

    private initConnectedObservable() {
        return new Observable<Routes.Users.Connect.Post.Response200>(
            (observer: Observer<Routes.Users.Connect.Post.Response200>) => {
                this.socket.on('/users/connect', (res: WebResponse) => {
                    if (res.status === 200) {
                        const res200 = (res.body as Routes.Users.Connect.Post.Response200);
                        this.rootPage = res200.rootRoomId;
                        observer.next(res200);
                        this.socket.emit('/rooms/enter',
                            new WebRequest('POST', {id: res200.rootRoomId}, '1'));
                        observer.complete();
                    } else {
                        ErrorService.Fatal('Could not connect to the server.', res);
                        observer.error(res.body);
                        observer.complete();
                    }
                });
            }).publishReplay().refCount();
    }

    private initRoomEnteredObservable() {
        return new Observable((observer: Observer<Routes.Rooms.Enter.Post.Response200>) => {
            this.socket.on('/rooms/enter', (res: WebResponse) => {
                if (res.status === 200) {
                    const res200 = (res.body as Routes.Rooms.Enter.Post.Response200);
                    this.activePageId = res200.room.id;
                    observer.next(res200);
                } else {
                    ErrorService.Warning('Error entering room.',  res);
                    observer.error(res.body);
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
                   observer.error(res.body);
                }
            });
            this.socket.on('/rooms/structures/created', (created: Events.Server.Rooms.Structures.Created) => {
                if (this.activePageId === created.roomId) {
                    observer.next(created.structure);
                }
            });
        }).share();
    }

    private initStructureUpdatedObservable() {
        return new Observable((observer: Observer<Models.Structure>) => {
            this.socket.on('/rooms/structures/update', (res: WebResponse) => {
                if (res.status === 200) {
                    const structure = (res.body as Models.Structure);
                    observer.next(structure);
                } else {
                    ErrorService.Warning('Could not create structure.', res);
                    observer.error(res.body);
                }
            });
            this.socket.on('/rooms/structures/updated', (updated: Events.Server.Rooms.Structures.Updated) => {
                if (this.activePageId === updated.roomId) {
                    observer.next(updated.structure);
                }
            });
        }).share();
    }

    private initActiveUserEnteredObservable() {
        return new Observable((observer: Observer<Models.ActiveUser>) => {
            this.socket.on('/rooms/active-users/entered', (user: Events.Server.Rooms.ActiveUsers.Entered) => {
                if (this.activePageId === user.roomId) {
                    observer.next(user.activeUser);
                }
            });
        }).share();
    }

    private initActiveUserExitedObservable() {
        return new Observable((observer: Observer<Models.ActiveUser.Id>) => {
            this.socket.on('/rooms/active-users/exited', (user: Events.Server.Rooms.ActiveUsers.Exited) => {
                if (this.activePageId === user.roomId) {
                    observer.next(user.activeUserId);
                }
            });
        }).share();
    }

    private initActiveUserDesktopCursorMovedObservable() {
        return new Observable((observer: Observer<Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved>) => {
            this.socket.on('/rooms/active-users/desktop/cursor-moved',
                (cursor: Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved) => {
                if (this.activePageId === cursor.roomId) {
                    observer.next(cursor);
                }

            });
        }).share();
    }
}