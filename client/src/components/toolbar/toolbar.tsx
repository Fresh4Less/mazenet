
// Handles popping up tools and such.
import * as React from 'react';

import './toolbar.css';
import { SocketAPI } from '../../services/SocketAPI';
import TunnelTool from './tunnelTool';
import { Models } from '../../../../common/api/v1';
import TextTool from './textTool';

interface ToolbarState {
    room: Models.Room | null;
    username: string;
}

export default class Toolbar extends React.Component<any, ToolbarState> {

    constructor(props: any) {
        super(props);
        this.state = {
            room: null,
            username: ''
        };
        console.log('Constructing Tools');
        SocketAPI.Instance.connectedObservable.subscribe(value => {
            this.setState({
                username: value.activeUser.username
            });
        });
        SocketAPI.Instance.roomEnteredObservable.subscribe((value => {
            this.setState({
                room: value.room
            });
        }));

    }

    render() {
        let tools: JSX.Element | null = null;
        if (this.state.room) {
            tools = (
                <span className={'right'}>
                    <TunnelTool room={this.state.room}/>
                    <TextTool room={this.state.room}/>
                </span>
            );
        }
        return (
            <div id={'Tools'}>
                <span id={'Title'}>MZ: {this.state.room ? this.state.room.title : 'Loading...'}</span>
                {tools}
            </div>
        );
    }

}