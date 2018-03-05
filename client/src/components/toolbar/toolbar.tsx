
// Handles popping up tools and such.
import * as React from 'react';

import './toolbar.css';
import { SocketAPI } from '../../services/SocketAPI';
import TunnelTool from './tunnelTool';
import { Models } from '../../../../common/api/v1';
import TextTool from './textTool';
import HomeTool from './homeTool';

interface ToolbarState {
    room: Models.Room | null;
    rootRoomId: string;
    username: string;
}

export default class Toolbar extends React.PureComponent<any, ToolbarState> {

    constructor(props: any) {
        super(props);
        this.state = {
            room: null,
            rootRoomId: '',
            username: ''
        };
        SocketAPI.Instance.connectedObservable.subscribe(value => {
            this.setState({
                rootRoomId: value.rootRoomId,
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
                    <HomeTool room={this.state.room} rootRoomId={this.state.rootRoomId}/>
                </span>
            );
        }

        const subtitle = this.state.room ? this.state.room.title : '...';
        return (
            <div id={'Tools'}>
                <span id={'Title'}>
                    mazenet
                </span><span title={'Title of the current room.'} id={'Subtitle'}>
                    {subtitle}
                </span>
                {tools}
            </div>
        );
    }

}