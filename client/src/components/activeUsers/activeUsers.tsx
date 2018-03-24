
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
    private activeUserRefs: { [id: string]: ActiveUser};

    constructor(props: any) {
        super(props);
        this.state = {
            roomId: '',
            users: {}
        };
        this.activeUserRefs = {};
        this.ourActiveUserId = '';
        SocketAPI.Instance.connectedObservable.subscribe(value => {
            this.ourActiveUserId = value.activeUser.id;
        });

        SocketAPI.Instance.roomEnteredObservable.subscribe(value => {
            this.activeUserRefs = {};
            this.setState({
                roomId: value.room.id,
                users: value.users,
            });
        });
        SocketAPI.Instance.activeUserEnteredObservable.subscribe(value => {
            this.activeUserRefs = {};
            this.state.users[value.id] = value;
            this.setState({
                users: this.state.users
            });
        });
        SocketAPI.Instance.activeUserExitedObservable.subscribe(value => {
            this.activeUserRefs = {};
            delete this.state.users[value];
            this.setState({
                users: this.state.users
            });
        });
        SocketAPI.Instance.activeUserDesktopCursorMovedObservable.subscribe(value => {
            const pData = this.state.users[value.activeUserId].platformData;
            // TODO: Compare roomid when fixed on server.
            if ( pData.pType === 'desktop' && this.activeUserRefs[value.activeUserId]) {
                // Force a re-render of only the ActiveUser that moved. The appears to work great.
                // Supposedly forceUpdate is bad practice. Consider investigating `shouldComponentUpdate` someday.
                pData.cursorPos = value.pos;
                this.activeUserRefs[value.activeUserId].forceUpdate();
            }
        });
    }

    private registerActiveUserComponent(user: ActiveUser | null) {
        if (user !== null) {
            this.activeUserRefs[user.props.user.id] = user;
        }
    }

    render() {
        const users = Object.keys(this.state.users).filter(key => {
            return this.state.users[key].id !== this.ourActiveUserId;
        }).map(key =>
            (
                <ActiveUser
                    key={key}
                    ref={(user) => this.registerActiveUserComponent(user)}
                    user={this.state.users[key]}
                />
            )
        );
        return (
            <div id={'ActiveUsers'}>{users}</div>
        );

    }

}