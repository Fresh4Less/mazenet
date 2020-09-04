import * as React from 'react';

import { WindowPane } from '../windowPane/windowPane';
import { ErrorService } from '../../services/ErrorService';
import { Models } from '../../../../common/api/v1';
import { AccountService } from '../../services/account/AccountService';

import './accountPane.css';

interface AccountPaneProps {
    account: Models.Account;
}

interface AccountPaneState {
    active: boolean;

    loginUsername: string;
    loginPassword: string;
    pendingLogin: boolean;

    registerUsername: string;
    registerPassword: string;
    registerConfirmPassword: string;
    pendingRegister: boolean;

    loginError: string;
    registerError: string;
    
}

export class AccountPane extends React.Component<AccountPaneProps, AccountPaneState> {
    private static _instance: AccountPane;
    public static get Instance(): AccountPane {
        return AccountPane._instance;
    }

    constructor(props: AccountPaneProps) {
        super(props);

        if (AccountPane._instance) {
            ErrorService.Warning('Multiple Styles panes initialized.');
        }
        AccountPane._instance = this;

        this.state = {
            active: false,

            loginUsername: '',
            loginPassword: '',
            pendingLogin: false,

            registerUsername: '',
            registerPassword: '',
            registerConfirmPassword: '',
            pendingRegister: false,

            loginError: '', 
            registerError: '',
        };
    }

    public Activate(): void {
        this.setState({
            active: true
        });
    }

    private login(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        AccountService.Instance.Login(this.state.loginUsername, this.state.loginPassword)
        .then(() => {
            this.setState({
                loginUsername: '',
                loginPassword: '',
                loginError: '',
                pendingLogin: false,
            })
        })
        .catch((err) => {
            this.setState({
                loginError: err,
                pendingLogin: false,
            });
        });
        this.setState({
            pendingLogin: true
        })
    }

    private register(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (this.state.registerPassword != this.state.registerConfirmPassword) {
            this.setState({
                registerError: 'passwords dont match'
            })
            return;
        }
        AccountService.Instance.Register(this.state.registerUsername, this.state.registerPassword)
        .then(() => {
            this.setState({
                registerUsername: '',
                registerPassword: '',
                registerConfirmPassword: '',
                registerError: '',
                pendingRegister: false,
            })
        })
        .catch((err) => {
            this.setState({
                registerError: err,
                pendingRegister: false,
            });
        });
        this.setState({
            pendingRegister: true
        })
    }

    public render(): JSX.Element {
        let view: JSX.Element;
        
        if (this.loggedIn()) {
            view = this.accountView();
        } else {
            view = this.loginOrRegisterView();
        }

        return (
            <WindowPane
                startPos={{x: 0.5, y: 0.2}}
                startWidth={0.5}
                startHeight={0.6}
                closePressed={() => {
                    this.setState({
                        active: false
                    });
                }}
                hidden={!this.state.active}
                title={'Account'}
            ><div className={'account'}>{view}</div></WindowPane>
        );
    }

    private loggedIn(): boolean {
        return Object.keys(this.props.account.profiles).length > 0;
    }

    private accountView(): JSX.Element {
        return (
            <table>
                <thead>
                    <tr><th colSpan={2}>Your Account</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>USERNAME</td>
                        <td>{this.props.account.user.username}</td>
                    </tr>
                    <tr>
                        <td>EMAIL</td>
                        <td>{this.props.account.email}</td>
                    </tr>
                    <tr>
                        <td>ID</td>
                        <td>{this.props.account.user.id}</td>
                    </tr>
                    <tr>
                        <td>CONNECTED PROFILES:</td>
                        <td>{this.profilesString()}</td>
                    </tr>
                </tbody>
            </table>
        
        )
    }

    private profilesString(): string {
        return  Object.keys(this.props.account.profiles).join(', ')
    }

    private loginOrRegisterView(): JSX.Element {
        return (
            <div className={'login-columns'}>
                <div className={'column'}>
                    {this.loginView()}
                </div>
                <div className={'column'}>
                    {this.registerView()}
                </div>
            </div>
        )
    }

    private loginView(): JSX.Element {
        return (
        <form onSubmit={(e)=>{this.login(e)}} >
            <h2>Login</h2>
            <div>
                <input
                    name='username'
                    type='text'
                    placeholder='username'
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        this.setState({loginUsername: e.currentTarget.value});
                    }}/>
            </div>
            <div>
                <input
                    name='password'
                    type='password'
                    placeholder='password'
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        this.setState({loginPassword: e.currentTarget.value});
                    }}/>
            </div>
            <div>
                <input
                    type='submit'
                    value='Login'
                    disabled={this.state.pendingLogin}
                />
            </div>
            <div className={'error'}>{this.state.loginError}</div>
        </form>);
    }

    private registerView(): JSX.Element {
        return (
        <form onSubmit={(e)=>{this.register(e)}} >
            <h2>Register</h2>
            <div>
                <input
                    name='username'
                    type='text'
                    placeholder='username'
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        this.setState({registerUsername: e.currentTarget.value});
                    }}/>
            </div>
            <div>
                <input
                    name='password'
                    type='password'
                    placeholder='password'
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        this.setState({registerPassword: e.currentTarget.value});
                    }}/>
            </div>
            <div>
                <input
                    name='confirmPassword'
                    type='password'
                    placeholder='confirm password'
                    required
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        this.setState({registerConfirmPassword: e.currentTarget.value});
                    }}/>
            </div>
            <div>
                <input
                    type='submit'
                    value='Register'
                    disabled={this.state.pendingRegister}
                />
            </div>
            <div className={'error'}>{this.state.registerError}</div>
        </form>
        );
    }
}
