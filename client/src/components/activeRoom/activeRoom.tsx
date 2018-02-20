
// Handles popping up tools and such.
import * as React from 'react';

import './activeRoom.css';
import { Models } from '../../../../common/api/v1';
import Structure from './structure/structure';

interface ActiveRoomProps {
    room: Models.Room;
}

export default class ActiveRoom extends React.Component<ActiveRoomProps, any> {
    render() {
        let structureElements: JSX.Element[] = Object.keys(this.props.room.structures).map((key) => {
            const structure = this.props.room.structures[key];
            return (<Structure key={structure.id} structure={structure} room={this.props.room}/>);
        });
        return (
            <div id={this.props.room.id} className={'activeRoom'}>
                {structureElements}
            </div>
        );
    }

}