// Handles popping up tools and such.
import * as React from 'react';

import './mouseCanvas.css';
import { SocketAPI } from '../../services/SocketAPI';
import { Models } from '../../../../common/api/v1';
import { ErrorService } from '../../services/ErrorService';
import { Sprite } from '../../models/canvas/Sprite';
import { MazenetUtils } from '../../services/MazenetUtils';

const cursorIcon = require('./../../media/cursor.png');

interface MouseCanvasState {
    room: Models.Room | null;
    mouseRecordings: { [cursorRecordingId: string]: Models.CursorRecording };
}

export default class MouseCanvas extends React.PureComponent<any, MouseCanvasState> {

    private activeAnimation: number = 0;
    private nextFrameMarkers: { [cursorRecordingId: string]: number } = {};
    private cursorSprite: HTMLImageElement = document.createElement('img');
    private resizeCb: () => void | null;

    constructor(props: any) {
        super(props);
        SocketAPI.Instance.roomEnteredObservable.subscribe((enterVal => {
            SocketAPI.Instance.GetRecordingForRoom(enterVal.room.id).subscribe(cursorVal => {
                this.nextFrameMarkers = {};
                this.setState({
                    room: enterVal.room,
                    mouseRecordings: cursorVal.cursorRecordings
                });
            });
        }));

        this.state = {
            room: null,
            mouseRecordings: {}
        };
        this.cursorSprite.src = cursorIcon;
    }

    render() {
        // Set the background gradient to be a fun rainbow based on the room id.
        // TODO: Delete this when room CSS is implemented.
        let bg = 'white';
        if (this.state.room !== null) {
            const twoColors = MazenetUtils.GetColorsForUUIDv4(this.state.room.id).slice(0, 2);
            bg = `linear-gradient(${twoColors.join(', ')}`;
        }

        const style = {
            background: bg
        };
        // END of background stuff.
        return (
            <canvas ref={(c) => { this.initAnimation(c); }} id={'Background'} style={style}/>
        );
    }

    private initAnimation(c: HTMLCanvasElement | null) {
        if (c && Object.keys(this.state.mouseRecordings).length) {
            const ctxNullable = c.getContext('2d');
            let ctx: CanvasRenderingContext2D;
            if (ctxNullable === null) {
                ErrorService.Warning('Unable to start mouse animation. Could not get 2D canvas context.');
                return;
            } else {
                ctx = ctxNullable;
            }
            const resizeCanvas = () => {
                c.width = c.clientWidth;
                c.height = c.clientHeight;
            };

            if (this.resizeCb) {
                window.removeEventListener('resize', this.resizeCb);
            }
            window.addEventListener('resize', resizeCanvas);
            this.resizeCb = resizeCanvas;
            this.resizeCb();
            this.rootFrameLoop(ctx);

        }
    }

    private rootFrameLoop(ctx: CanvasRenderingContext2D) {
        const animationNumber = ++this.activeAnimation;
        let t: number = 0;
        let cursorSprite = new Sprite(this.cursorSprite.width, this.cursorSprite.height, this.cursorSprite);

        const frameLoop = () => { // TODO: Rewrite with throttled Observable?
            /* Check if a new animation got started by entering a new room or something. */
            if (this.activeAnimation > animationNumber) {
                return;
            }
            setTimeout(() => {
                frameLoop();
                ctx.globalAlpha = 0.3; // TODO: Magic number, move into user-config or something.
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                Object.keys(this.state.mouseRecordings).forEach((cursorRecordingId: string) => {
                    /* Figure out what frame to draw. */
                    const frames = this.state.mouseRecordings[cursorRecordingId].frames;
                    if (frames.length === 0) {
                        return;
                    }
                    const nextFrameIdx = this.nextFrameMarkers[cursorRecordingId] || 0;
                    const nextFrame: Models.CursorRecordingFrame = frames[nextFrameIdx];
                    let frameToRender: Models.CursorRecordingFrame | null = null;
                    if (nextFrame.t <= t) {
                        frameToRender = nextFrame;
                        this.nextFrameMarkers[cursorRecordingId] =
                            (frames.length - 1) > nextFrameIdx ? nextFrameIdx + 1 : nextFrameIdx;
                    } else if (nextFrameIdx > 0) {
                        frameToRender = frames[nextFrameIdx - 1];
                    }
                    /* Render frame to canvas. */
                    if (!frameToRender) {
                        return;
                    }
                    cursorSprite.Render(ctx,
                        frameToRender.pos.x * ctx.canvas.width,
                        frameToRender.pos.y * ctx.canvas.height);
                });
                t++;
            }, 1000 / 30);
        };
        frameLoop();
    }
}