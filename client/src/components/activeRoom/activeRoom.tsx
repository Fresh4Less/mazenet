import * as React from 'react';

import './activeRoom.css';
import { Models, Routes } from '../../../../common/api/v1';
import Structure from '../structure/structure';
import { SocketAPI } from '../../services/SocketAPI';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { stylesheetToString } from '../../../../common/util/stylesheet';

interface MouseMoveInfo {
    element: HTMLDivElement;
    mouseClientX: number;
    mouseClientY: number;
}

interface ActiveRoomState {
    room: Models.Room | null;
    styleString: string;
}

export default class ActiveRoom extends React.Component<any, ActiveRoomState> {

    private mouseMoveHandler: (e: React.MouseEvent<HTMLDivElement>) => void;
    private mouseMoveObserver: Observer<MouseMoveInfo>;
    private styleElement: HTMLStyleElement;

    constructor(props: any) {
        super(props);
        this.state = {
            room: null,
            styleString: '',
        };

        let roomEnteredCallback = (value: Routes.Rooms.Enter.Post.Response200) => {
            this.setState({
                room: value.room,
                styleString: stylesheetToString(value.room.stylesheet, true, `#id-${value.room.id} `),
            });
        };
        let roomUpdatedCallback = (room: Models.Room) => {
            this.setState({
                room: room,
                styleString: stylesheetToString(room.stylesheet, true, `#id-${room.id} `),
            });
        };

        let structureChangeCallback = (value: Models.Structure) => {
            if (this.state.room) {
                this.state.room.structures[value.id] = value;
                this.setState({
                    room: this.state.room
                });
            }
        };

        SocketAPI.Instance.roomEnteredObservable.subscribe(roomEnteredCallback);
        SocketAPI.Instance.roomUpdatedObservable.subscribe(roomUpdatedCallback);
        SocketAPI.Instance.structureCreatedObservable.subscribe(structureChangeCallback);
        SocketAPI.Instance.structureUpdatedObservable.subscribe(structureChangeCallback);

        /* Mouse Recording Stuff */
        this.mouseMoveHandler = this.mouseMove.bind(this);
        new Observable<MouseMoveInfo>((observer: Observer<MouseMoveInfo>) => {
            this.mouseMoveObserver = observer;
        }).throttleTime(1000 / 30).subscribe(info => {
            const divRect = info.element.getBoundingClientRect();

            const x = Math.min(1, Math.max(0, info.mouseClientX / divRect.width));
            const y = Math.min(1, Math.max(0, (info.mouseClientY - divRect.top) / divRect.height));

            SocketAPI.Instance.CursorMove({
                pos: {
                    x: x,
                    y: y
                }
            });
        });

        /* Room Styles */
        this.styleElement = document.createElement('style');
        this.styleElement.type = 'text/css';
        this.styleElement.id = 'RoomStyles';
        document.head.appendChild(this.styleElement);
    }

    mouseMove(event: React.MouseEvent<HTMLDivElement>) {
        this.mouseMoveObserver.next({
            element: event.currentTarget,
            mouseClientX: event.clientX,
            mouseClientY: event.clientY
        });
    }

    render() {
        if (this.state.room) {
            /* Set the styles */
            this.styleElement.innerHTML = this.state.styleString;

            const room: Models.Room = this.state.room;
            let structureElements: JSX.Element[] = Object.keys(this.state.room.structures).map((key) => {
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
                    <div className={'room'} onMouseMove={this.mouseMoveHandler}>
                        {structureElements}
                    </div>
                </div>
            );
        } else {
            return (
                <div>Loading room...</div>
            );
        }

    }

}