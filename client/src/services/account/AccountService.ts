import { Models, Routes } from '../../../../common/api/v1';
import { Observable, Subject } from 'rxjs';
import { SocketAPI } from '../SocketAPI';

export class AccountService {
    private static _instance: AccountService
    public static get Instance(): AccountService {
        return this._instance || (this._instance = new this());
    }

    readonly accountObservable: Observable<Models.Account>;
    private accountSubject: Subject<Models.Account>;

    constructor() {

        this.accountSubject = new Subject<Models.Account>();
        this.accountObservable = this.accountSubject.asObservable();


        SocketAPI.Instance.connectedObservable.subscribe((res200)=>{
            this.accountSubject.next(res200.account);
        })
    }

    public Login(username: string, password: string): Promise<Models.Account> {
        return this.fetchAndReconnect(
            Routes.Users.Login.Route,
            JSON.stringify(<Routes.Users.Login.Post.Request> {
                username,
                password,
            })
        );
    }

    public Register(username: string, password: string): Promise<Models.Account> {
        return this.fetchAndReconnect(
            Routes.Users.Register.Route,
            JSON.stringify(<Routes.Users.Register.Post.Request> {
                username,
                password,
            })
        );
    }

    private fetchAndReconnect(
        route: string,
        body: string
    ): Promise<Models.Account> {
        return new Promise((resolve, reject) => {
            fetch(route, {
                method: 'POST',
                headers: new Headers({'content-type': 'application/json'}),
                credentials: 'same-origin', // Required for HTTP-only cookies.
                body: body,
            }).then((res)=>{
                if (res.status == 200 || res.status == 201) {
                    SocketAPI.Instance.Reconnect().subscribe({
                        next: (res200) => {
                            resolve(res200.account);
                        },
                        error: (err) => {
                            reject(err);
                        }
                    })   
                } else {
                    res.json().then((body) => {
                        reject(JSON.stringify(body));
                    })
                }
            }).catch((err) => {
                reject(err);
            })
        });
    }
}