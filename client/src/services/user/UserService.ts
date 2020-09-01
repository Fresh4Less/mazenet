import Socket = SocketIOClient.Socket;
import { Models, Routes } from '../../../../common/api/v1';
import { Observable, Observer } from 'rxjs';
import { ErrorService } from '../ErrorService';
import { TransactionManager } from '../TransactionManager';
import { WebResponse } from '../../models/freshIO/WebResponse';
import { WebRequest } from '../../models/freshIO/WebRequest';

export class UserService {

    readonly userObservable: Observable<Models.User>;
    private userObserver: Observer<Models.User>;

    private socket: Socket;
    private transactionManager: TransactionManager;

    constructor(socket: Socket) {
        this.socket = socket;
        this.transactionManager = new TransactionManager();

        this.userObservable = this.initUserObservable();
    }
    
    // Used by the SocketAPI to manually set the initial user.
    public SetUser(user: Models.User) {
        this.userObserver.next(user);
    }

    public Login(username: string, password: string): Observable<Models.User> {
        const o = new Observable<Models.User>(observer => {
            const id = this.transactionManager.NewTransactionWithObserver(observer);
            const req: Routes.Users.Login.Post.Request = {username, password};
            this.socket.emit(Routes.Users.Login.Route, 
                new WebRequest('POST', req, id))
        }).publish();
        o.connect();
        return o;
    }

    public Register(username: string, password: string): Observable<Models.User> {
        const o = new Observable<Models.User>(observer => {
            const id = this.transactionManager.NewTransactionWithObserver(observer);
            const req: Routes.Users.Register.Post.Request = {username, password};
            this.socket.emit(Routes.Users.Register.Route, 
                new WebRequest('POST', req, id))
        }).publish();
        o.connect();
        return o;
    }

    private initUserObservable(): Observable<Models.User> {
        const o = new Observable((observer: Observer<Models.User>) => {
            this.userObserver = observer;
            this.socket.on(Routes.Users.Login.Route, (res: WebResponse) => {
                if (res.status === 200) {
                    const res200 = (res.body as Routes.Users.Login.Post.Response200);
                    observer.next(res200);
                    this.transactionManager.CompleteTransaction(res, res200);
                } else {
                    this.transactionManager.ErrorTransaction(res);
                    ErrorService.Warning('could not login', res);
                }
            })
            this.socket.on(Routes.Users.Register.Route, (res: WebResponse) => {
                if (res.status === 201) {
                    const res201 = (res.body as Routes.Users.Register.Post.Response201);
                    observer.next(res201);
                    this.transactionManager.CompleteTransaction(res, res201);
                } else {
                    this.transactionManager.ErrorTransaction(res);
                    ErrorService.Warning('could not register', res);
                }
            })
        }).publish();
        o.connect();
        return o;
    }
}