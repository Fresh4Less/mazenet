/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import * as React from 'react';
import { Toolbar } from './toolbar/toolbar';

import './mazenet.css';
import { ActiveRoom } from './activeRoom/activeRoom';
import { ActiveUsers } from './activeUsers/activeUsers';
import { StructureWorkshop } from './structureWorkshop/structureWorkshop';
import MouseCanvas from './mouseCanvas/mouseCanvas';
import { Styles } from './styles/styles';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import { SocketAPI } from '../services/socketAPI/SocketAPI';
import { Models } from '../../../common/api/v1';

interface MouseMoveInfo {
    element: HTMLDivElement;
    mouseClientX: number;
    mouseClientY: number;
}

interface MazenetState {
    room: Models.Room | null;
}

export default class Mazenet extends React.PureComponent<any, MazenetState> {

    private mouseMoveHandler: (e: React.MouseEvent<HTMLDivElement>) => void;
    private mouseMoveObserver: Observer<MouseMoveInfo>;
    private cursorFPS: number = 20;

    constructor(props: any) {
        super(props);

        this.state = {
            room: null,
        };

        /* Room */
        SocketAPI.Instance.roomEnteredObservable.subscribe(val => {
            this.setState({
                room: val.room,
            });
        });
        SocketAPI.Instance.roomUpdatedObservable.subscribe(val => {
            this.setState({
                room: val
            });
        });

        let structureChangeCallback = (value: Models.Structure) => {
            if (this.state.room) {
                this.state.room.structures[value.id] = value;
                this.forceUpdate();
            }

        };

        SocketAPI.Instance.structureCreatedObservable.subscribe(structureChangeCallback);
        SocketAPI.Instance.structureUpdatedObservable.subscribe(structureChangeCallback);

        /* Mouse Recording Stuff */
        this.mouseMoveHandler = this.mouseMove.bind(this);
        new Observable<MouseMoveInfo>((observer: Observer<MouseMoveInfo>) => {
            this.mouseMoveObserver = observer;
        }).throttleTime(1000 / this.cursorFPS).subscribe(info => {
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

    render() {
        return (
            <div id={'Mazenet'} className={this.state.room ? 'loaded' : 'loading'}>
                {this.state.room && <Toolbar room={this.state.room}/>}
                {!this.state.room && 'Loading...'}
                <div
                    id={'BelowToolbar'}
                    onMouseMove={this.mouseMoveHandler}
                >

                    {this.state.room && <ActiveRoom room={this.state.room}/>}
                    <MouseCanvas/>
                    <ActiveUsers/>
                    {this.state.room && <StructureWorkshop room={this.state.room}/>}
                    {this.state.room && <Styles room={this.state.room}/>}
                </div>
            </div>
        );
    }

    private mouseMove(event: React.MouseEvent<HTMLDivElement>) {
        this.mouseMoveObserver.next({
            element: event.currentTarget,
            mouseClientX: event.clientX,
            mouseClientY: event.clientY
        });
    }
}
