
// Handles popping up tools and such.
import * as React from 'react';

import './activeRoom.css';
import { Models } from '../../../../common/api/v1';
import Structure from './structure/structure';
import { SocketAPI } from '../../services/SocketAPI';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

interface MouseMoveInfo {
    element: HTMLDivElement;
    mouseClientX: number;
    mouseClientY: number;
}

interface ActiveRoomState {
    room: Models.Room | null;
}

export default class ActiveRoom extends React.Component<any, ActiveRoomState> {

    private boundMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    private mouseMoveObserver: Observer<MouseMoveInfo>;

    constructor(props: any) {
        super(props);
        this.state = {
            room: null
        };

        SocketAPI.Instance.roomEnteredObservable.subscribe((value => {
            this.setState({
                room: value.room,
            });
        }));

        SocketAPI.Instance.structureCreatedObservable.subscribe(value => {
            if (this.state.room) {
                this.state.room.structures[value.id] = value;
                this.setState({
                    room: this.state.room
                });
            }
        });

        /* Mouse Recording Stuff */
        this.boundMouseMove = this.mouseMove.bind(this);
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
            const room: Models.Room = this.state.room;
            let structureElements: JSX.Element[] = Object.keys(this.state.room.structures).map((key) => {
                const structure = room.structures[key];
                return (<Structure key={structure.id} structure={structure} room={room} isEditing={false}/>);
            });

            return (
                <div id={room.id} className={'active-room'} onMouseMove={this.boundMouseMove}>
                    {structureElements}
                </div>
            );
        } else {
            return (
                <div>Loading room...</div>
            );
        }

    }

}