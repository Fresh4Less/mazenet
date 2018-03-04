
// Handles popping up tools and such.
import * as React from 'react';

import { Models } from '../../../../common/api/v1';
import { SocketAPI } from '../../services/SocketAPI';
import ActiveUser from './activeUser';

interface ActiveUsersState {
    roomId: string;
    users: { [id: string]: Models.ActiveUser};
}

export default class ActiveUsers extends React.Component<any, ActiveUsersState> {

    private ourActiveUserId: string;

    constructor(props: any) {
        super(props);
        this.state = {
            roomId: '',
            users: {}
        };
        this.ourActiveUserId = '';
        SocketAPI.Instance.connectedObservable.subscribe(value => {
            this.ourActiveUserId = value.activeUser.id;
        });

        SocketAPI.Instance.roomEnteredObservable.subscribe(value => {
            this.setState({
                roomId: value.room.id,
                users: value.users,
            });
        });
        SocketAPI.Instance.activeUserEnteredObservable.subscribe(value => {
            this.state.users[value.id] = value;
            this.setState({
                users: this.state.users
            });
        });
        SocketAPI.Instance.activeUserExitedObservable.subscribe(value => {
            delete this.state.users[value.id];
            this.setState({
                users: this.state.users
            });
        });
        // TODO: Create callback magic to avoid re-rendering a zillion times
        SocketAPI.Instance.activeUserDesktopCursorMovedObservable.subscribe(value => {
            const pData = this.state.users[value.activeUserId].platformData;
            if ( pData.pType === 'desktop') { // TODO: Compare roomid when fixed on server.
                pData.cursorPos = value.pos;
                this.setState({
                    users: this.state.users
                });
            }
        });
    }

    render() {
        const users = Object.keys(this.state.users).filter(key => {
            return this.state.users[key].id !== this.ourActiveUserId;
        }).map(key => {

           return (
               <ActiveUser key={key} user={this.state.users[key]}/>
            );
        });
        return (
            <div id={'ActiveUsers'}>{users}</div>
        );

    }

}