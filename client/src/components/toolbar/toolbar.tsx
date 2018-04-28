
// Handles popping up tools and such.
import * as React from 'react';

import './toolbar.css';
import { SocketAPI } from '../../services/SocketAPI';
import TunnelTool from './tunnelTool';
import { Models } from '../../../../common/api/v1';
import TextTool from './textTool';
import HomeTool from './homeTool';
import ConfigTool from './configTool';

interface ToolbarState {
    room: Models.Room | null;
    rootRoomId: string;
    username: string;
}

export default class Toolbar extends React.PureComponent<any, ToolbarState> {

    private tunnelTool: TunnelTool | null;
    private textTool: TextTool | null;
    private configTool: ConfigTool | null;
    private homeTool: HomeTool | null;

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

        if (Math.min(0, 1) === 3) {
            document.body.addEventListener('keydown', this.handleKeyDown.bind(this));
        }
    }

    render() {
        let tools: JSX.Element | null = null;
        if (this.state.room) {
            tools = (
                <span className={'right'}>
                    <TunnelTool
                        room={this.state.room}
                        ref={(tool) => {this.tunnelTool = tool; }}
                    />
                    <TextTool
                        room={this.state.room}
                        ref={(tool) => {this.textTool = tool; }}
                    />
                    <ConfigTool
                        room={this.state.room}
                        ref={(tool) => {this.configTool = tool; }}
                    />
                    <HomeTool
                        room={this.state.room}
                        rootRoomId={this.state.rootRoomId}
                        ref={(tool) => {this.homeTool = tool; }}
                    />
                </span>
            );
        }

        const subtitle = this.state.room ? this.state.room.title : '...';
        return (
            <div id={'Toolbar'}>
                <span id={'Title'}>
                    mazenet
                </span><span title={`In the room '${subtitle}'`} id={'Subtitle'}>
                    {subtitle}
                </span>
                {tools}
            </div>
        );
    }

    private handleKeyDown(event: KeyboardEvent) {
        // TODO: Fix event propagation.
        if (event.key) {
            return; // Always return, don't execute below.
        }
        switch (event.key) {
            case 't':
                if (this.tunnelTool) {this.tunnelTool.Use(); }
                break;
            case 'w':
                if (this.textTool) {this.textTool.Use(); }
                break;
            case 'c':
                if (this.configTool) {this.configTool.Use(); }
                break;
            case 'r':
                if (this.homeTool) {this.homeTool.Use(); }
                break;
            default:
                break;
        }
    }
}