/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import * as SocketIo from 'socket.io-client';
import { Events, Models, Routes } from '../../../common/api/v1';
import Socket = SocketIOClient.Socket;
import { WebRequest } from '../models/freshIO/WebRequest';
import { WebResponse } from '../models/freshIO/WebResponse';
import { ErrorService } from './ErrorService';

import { Observable, Observer } from 'rxjs';
import TransactionManager from './TransactionManager';
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
    readonly structureCreatedObservable: Observable<Models.Structure>;
    readonly structureUpdatedObservable: Observable<Models.Structure>;
    readonly activeUserEnteredObservable: Observable<Models.ActiveUser>;
    readonly activeUserExitedObservable: Observable<Models.ActiveUser.Id>;
    readonly activeUserDesktopCursorMovedObservable: Observable<Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved>;

    private socket: Socket;
    private uniqueIdCounter: number;
    private rootPage: Models.Room.Id;
    private cursorRecordingTransactionManager: TransactionManager;
    private activePageId: Models.Room.Id;

    /*
    * Constructor for the API singleton service.
    * Performs all the Socket IO communications with the server.
    */
    private constructor() {
        const loc = window.location;
        this.activePageId = '';
        this.socket = SocketIo(`${loc.protocol}//${loc.hostname}:${loc.port}/mazenet`);
        this.uniqueIdCounter = 0;
        this.rootPage = '';
        this.cursorRecordingTransactionManager = new TransactionManager(this.socket, '/rooms/cursor-recordings');

        /* Setup the Observable feeds */
        this.connectedObservable = this.initConnectedObservable();
        // TODO userCreatedObservable
        this.roomEnteredObservable = this.initRoomEnteredObservable();
        this.roomUpdatedObservable = this.initRoomUpdatedObservable();
        this.structureCreatedObservable = this.initStructureCreatedObservable();
        this.structureUpdatedObservable = this.initStructureUpdatedObservable();
        this.activeUserEnteredObservable = this.initActiveUserEnteredObservable();
        this.activeUserExitedObservable = this.initActiveUserExitedObservable();
        this.activeUserDesktopCursorMovedObservable = this.initActiveUserDesktopCursorMovedObservable();
        window.addEventListener('hashchange', this.checkURLAndLoadPage.bind(this));
        const device: Models.PlatformData.Desktop = {pType: 'desktop', cursorPos: {x: 0, y: 0}};
        this.socket.emit(Routes.Users.Connect.Route, new WebRequest('POST', device, '1'));
    }

    public static get Instance(): SocketAPI {
        return this._instance || (this._instance = new this());
    }

    public EnterRootPage(): void {
        if (this.rootPage.length > 0) {
            this.socket.emit(Routes.Rooms.Enter.Route,
                new WebRequest('POST', {id: this.rootPage}, 'todo'));
        }
    }

    public EnterRoom(roomId: string): void {
        this.socket.emit(Routes.Rooms.Enter.Route, new WebRequest('POST', {id: roomId}, 'todo'));
    }

    public UpdateRoom(roomId: string, data: Models.Room.Patch): void {
        this.socket.emit(Routes.Rooms.Update.Route, new WebRequest('POST', {id: roomId, patch: data}, 'todo'));
    }

    public CreateStructure(roomId: string, blueprint: Models.Structure.Blueprint): void {
        this.socket.emit(Routes.Rooms.Structures.Create.Route, new WebRequest('POST', {
            roomId: roomId,
            structure: blueprint
        }, 'todo'));
    }

    public UpdateStructure(structureId: string, patch: Models.Structure.Patch): void {
        this.socket.emit(Routes.Rooms.Structures.Update.Route , new WebRequest('POST', {
            id: structureId,
            patch: patch,
        }, 'todo'));
    }

    public CursorMove(cursor: Events.Client.Rooms.ActiveUsers.Desktop.CursorMoved): void {
        this.socket.emit(Events.Client.Rooms.ActiveUsers.Desktop.CursorMoved.Route, cursor);
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
                this.socket.emit(Routes.Rooms.CursorRecordings.Route, new WebRequest('GET', {
                    roomId: roomId
                }, uniqueId));
            });
    }

    /* ********** Private ********** */

    private initConnectedObservable() {
        return new Observable<Routes.Users.Connect.Post.Response200>(
            (observer: Observer<Routes.Users.Connect.Post.Response200>) => {
                this.socket.on(Routes.Users.Connect.Route, (res: WebResponse) => {
                    if (res.status === 200) {
                        const res200 = (res.body as Routes.Users.Connect.Post.Response200);
                        observer.next(res200);
                        this.rootPage = res200.rootRoomId;
                        let urlRoom = URLManager.ParseRoomId();
                        let roomToLoad = urlRoom ? urlRoom : this.rootPage;

                        this.socket.emit(Routes.Rooms.Enter.Route,
                            new WebRequest('POST', {id: roomToLoad}, '1'));
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
            this.socket.on(Routes.Rooms.Enter.Route, (res: WebResponse) => {
                if (res.status === 200) {
                    const res200 = (res.body as Routes.Rooms.Enter.Post.Response200);
                    this.activePageId = res200.room.id;
                    URLManager.UpdateRoomId(this.activePageId);
                    observer.next(res200);
                } else {
                    ErrorService.Warning('could not enter room.',  res);
                    if (this.activePageId === '') {
                        this.activePageId = this.rootPage;
                        ErrorService.Warning('Entering root room instead.');
                        this.EnterRootPage();
                    }
                }
            });
        }).share();
    }

    private initRoomUpdatedObservable() {
        return new Observable((observer: Observer<Models.Room>) => {
            this.socket.on(Routes.Rooms.Update.Route, (res: WebResponse) => {
                if (res.status === 200) {
                    observer.next(res.body as Models.Room);
                } else {
                    ErrorService.Warning('Could not update room.', res);
                    observer.error(res.body);
                }
            });
            this.socket.on(Events.Server.Rooms.Updated.Route, (res: Models.Room) => {
                if (this.activePageId === res.id) {
                    observer.next(res);
                }
            });
        }).share();
    }

    private initStructureCreatedObservable() {
        return new Observable((observer: Observer<Models.Structure>) => {
            this.socket.on(Routes.Rooms.Structures.Create.Route, (res: WebResponse) => {
                if (res.status === 201) {
                   observer.next(res.body as Models.Structure);
                }  else {
                   ErrorService.Warning('Could not create structure.', res);
                   observer.error(res.body);
                }
            });
            this.socket.on(Events.Server.Rooms.Structures.Created.Route,
                (created: Events.Server.Rooms.Structures.Created) => {
                if (this.activePageId === created.roomId) {
                    observer.next(created.structure);
                }
            });
        }).share();
    }

    private initStructureUpdatedObservable() {
        return new Observable((observer: Observer<Models.Structure>) => {
            this.socket.on(Routes.Rooms.Structures.Update.Route, (res: WebResponse) => {
                if (res.status === 200) {
                    observer.next(res.body as Models.Structure);
                } else {
                    ErrorService.Warning('Could not create structure.', res);
                    observer.error(res.body);
                }
            });
            this.socket.on(Events.Server.Rooms.Structures.Updated.Route,
                (updated: Events.Server.Rooms.Structures.Updated) => {
                if (this.activePageId === updated.roomId) {
                    observer.next(updated.structure);
                }
            });
        }).share();
    }

    private initActiveUserEnteredObservable() {
        return new Observable((observer: Observer<Models.ActiveUser>) => {
            this.socket.on(Events.Server.Rooms.ActiveUsers.Entered.Route,
                (user: Events.Server.Rooms.ActiveUsers.Entered) => {
                if (this.activePageId === user.roomId) {
                    observer.next(user.activeUser);
                }
            });
        }).share();
    }

    private initActiveUserExitedObservable() {
        return new Observable((observer: Observer<Models.ActiveUser.Id>) => {
            this.socket.on(Events.Server.Rooms.ActiveUsers.Exited.Route,
                (user: Events.Server.Rooms.ActiveUsers.Exited) => {
                if (this.activePageId === user.roomId) {
                    observer.next(user.activeUserId);
                }
            });
        }).share();
    }

    private initActiveUserDesktopCursorMovedObservable() {
        return new Observable((observer: Observer<Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved>) => {
            this.socket.on(Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved.Route,
                (cursor: Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved) => {
                if (this.activePageId === cursor.roomId) {
                    observer.next(cursor);
                }

            });
        }).share();
    }

    private checkURLAndLoadPage() {
        let urlRoom = URLManager.ParseRoomId();
        if (urlRoom && urlRoom !== this.activePageId) {
            this.EnterRoom(urlRoom);
        }
    }
}
