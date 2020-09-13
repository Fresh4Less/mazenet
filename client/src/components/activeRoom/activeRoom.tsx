import * as React from 'react';
import * as css from './activeRoom.css';

import { Models } from '../../../../common/api/v1';
import Structure from '../structure/structure';
import { stylesheetToString } from '../../../../common/util/stylesheet';

interface ActiveRoomProps {
    room: Models.Room;
}

interface ActiveRoomState {
    styleString: string;
}

export class ActiveRoom extends React.Component<ActiveRoomProps, ActiveRoomState> {
    private styleElement: HTMLStyleElement;

    constructor(props: any) {
        super(props);
        this.state = {
            styleString: stylesheetToString(props.room.stylesheet, true, `#id-${props.room.id} `),
        };

        /* Room Styles */
        this.styleElement = document.createElement('style');
        this.styleElement.type = 'text/css';
        this.styleElement.id = 'RoomStyles';
        document.head.appendChild(this.styleElement);
    }

    componentWillReceiveProps(nextProps: ActiveRoomProps) {
        this.setState({
            styleString: stylesheetToString(nextProps.room.stylesheet, true, `#id-${nextProps.room.id} `)
        });
    }

    render() {
        /* Set the styles */
        this.styleElement.innerHTML = this.state.styleString;

        const room: Models.Room = this.props.room;
        let structureElements: JSX.Element[] = Object.keys(room.structures).map((key) => {
            const structure = room.structures[key];
            return (
                <Structure
                    key={structure.id}
                    structure={structure}
                    room={room}
                    doneEditingCb={null}
                    isEditing={false}
                />);
        });

        return (
            <div id={`id-${room.id}`}>
                <div className={`${css.room} room`}>
                    {structureElements}
                </div>
            </div>
        );

    }

}