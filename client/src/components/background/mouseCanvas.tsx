
// Handles popping up tools and such.
import * as React from 'react';

import './mouseCanvas.css';
import { SocketAPI } from '../../services/SocketAPI';
import { Models } from '../../../../common/api/v1';

interface MouseCanvasState {
    mouseRecordings: { [cursorRecordingId: string]: Models.CursorRecording };
}

export default class MouseCanvas extends React.PureComponent<any, MouseCanvasState> {

    constructor(props: any) {
        super(props);
        SocketAPI.Instance.roomEnteredObservable.subscribe((value => {
            SocketAPI.Instance.GetRecordingForRoom(value.room.id).subscribe(val => {
                this.setState({
                    mouseRecordings: val.cursorRecordings
                });
            });
        }));

        this.state = {
            mouseRecordings: {}
        };

    }

    initAnimation(c: HTMLCanvasElement | null) {
        console.log('initAnimation', c);
    }

    render() {
        return (
            <canvas ref={(c) => { this.initAnimation(c); }} id={'Background'}/>
        );
    }

}