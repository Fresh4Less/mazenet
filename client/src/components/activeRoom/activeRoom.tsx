
// Handles popping up tools and such.
import * as React from 'react';

import './activeRoom.css';
import { Models } from '../../../../common/api/v1';

interface ActiveRoomProps {
    room: Models.Room;
}

interface ActiveRoomState {
}

export default class ActiveRoom extends React.Component<ActiveRoomProps, ActiveRoomState> {

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div id={'ActiveRoom'}>You are inside the room:
                <pre>
                    {JSON.stringify(this.props.room, null, 4)}
                </pre>
            </div>
        );
    }

}