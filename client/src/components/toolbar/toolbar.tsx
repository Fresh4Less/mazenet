
// Handles popping up tools and such.
import * as React from 'react';

import './toolbar.css';
import { SocketAPI } from '../../services/SocketAPI';
import TunnelTool from './tunnelTool';
import { Models } from '../../../../common/api/v1';
import TextTool from './textTool';
import ConfigTool from './configTool';
import StyleTool from './styleTool';
import { InfoTool } from './infoTool';
import { UserTool } from './userTool';

interface ToolbarProps {
    room: Models.Room;
}

interface ToolbarState {
    rootRoomId: string;
    user: Models.ActiveUser | null;
}

export class Toolbar extends React.Component<ToolbarProps, ToolbarState> {

    constructor(props: any) {
        super(props);
        this.state = {
            rootRoomId: '',
            user: null
        };
    }

    componentDidMount() {
        SocketAPI.Instance.connectedObservable.subscribe(value => {
            this.setState({
                rootRoomId: value.rootRoomId,
                user: value.activeUser
            });
        });
    }

    render() {
        let tools = (
            <span className={'right'}>
                <TunnelTool
                    room={this.props.room}
                />
                <TextTool
                    room={this.props.room}
                />
                <ConfigTool
                    room={this.props.room}
                />
                <StyleTool
                    room={this.props.room}
                />
                <UserTool/>
                <InfoTool/>
            </span>
        );

        const subtitle = this.props.room.title;
        return (
            <div id={'Toolbar'}>
                <span
                    id={'Title'}
                    title={this.notInRoot() ? 'Return to the root room.' : 'Welcome to Mazenet!'}
                    onClick={() => {
                        if (this.notInRoot() && window.confirm('Leave the current room and return to the root?')) {
                            SocketAPI.Instance.EnterRootPage();
                        }
                    }}
                >
                    mazenet
                </span>
                <span title={`In the room '${subtitle}'`} id={'Subtitle'}>
                    {subtitle}
                </span>
                {tools}
            </div>
        );
    }

    private notInRoot(): boolean {
        return this.props.room.id !== this.state.rootRoomId;
    }
}