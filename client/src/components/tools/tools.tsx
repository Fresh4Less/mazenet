
// Handles popping up tools and such.
import * as React from 'react';

import './tools.css';
import { SocketAPI } from '../../services/SocketAPI';

interface ToolsState {
    title: string;
    username: string;
}

export default class Tools extends React.Component<any, ToolsState> {

    constructor(props: any) {
        super(props);
        this.state = {
            title: 'loading',
            username: ''
        };
        console.log('Constructing Tools');
        SocketAPI.Instance.connectedObservable.subscribe(value => {
            this.setState({
                username: value.activeUser.username
            });
        });
        SocketAPI.Instance.pageEnterObservable.subscribe((value => {
            this.setState({
                title: value.room.title
            });
        }));

    }

    render() {
        let userString = 'Loading...';
        if (this.state.username.length > 0) {
            userString = `Hello ${this.state.username}!`;
        }
        return (
            <div id={'Tools'}>
                <span id={'Title'}>{this.state.title}</span>
                <span id={'User'}>{userString}</span>
            </div>
        );
    }

}