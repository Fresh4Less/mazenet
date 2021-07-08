// Handles popping up tools and such.
import * as React from 'react';
import * as css from './mouseCanvas.css';

import { Models } from '../../../../common/api/v1';
import { ErrorService } from '../../services/ErrorService';
import { Sprite } from '../../models/canvas/Sprite';
import MediaPreloader from '../../services/MediaPreloader';

interface MouseCanvasProps {
    mouseRecordings: { [cursorRecordingId: string]: Models.CursorRecording };
}

interface MouseCanvasState {}

export default class MouseCanvas extends React.PureComponent<MouseCanvasProps, MouseCanvasState> {

    private activeAnimation: number = 0;
    private nextFrameMarkers: { [cursorRecordingId: string]: number } = {};
    private resizeCb: () => void | null;

    constructor(props: MouseCanvasProps) {
        super(props);

        this.state = {};
    }

    shouldComponentUpdate(nextProps: MouseCanvasProps, nextState: MouseCanvasProps): boolean {
        if (nextProps.mouseRecordings != this.props.mouseRecordings) {
            this.nextFrameMarkers = {};
            return true;
        }
        return false
       
    }

    render() {
        return (
            <canvas ref={(c) => { this.initAnimation(c); }} id={css.MouseCanvas}/>
        );
    }

    private initAnimation(c: HTMLCanvasElement | null) {
        if (c && Object.keys(this.props.mouseRecordings).length) {
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
        const cursorImg = MediaPreloader.Instance.CursorSprite
        let cursorSprite = new Sprite(cursorImg.width, cursorImg.height, cursorImg);
        const frameLoop = () => { // TODO: Rewrite with throttled Observable?
            /* Check if a new animation got started by entering a new room or something. */
            if (this.activeAnimation > animationNumber) {
                return;
            }
            setTimeout(() => {
                frameLoop();
                ctx.globalAlpha = 0.3; // TODO: Magic number, move into user-config or something.
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                Object.keys(this.props.mouseRecordings).forEach((cursorRecordingId: string) => {
                    /* Figure out what frame to draw. */
                    const frames = this.props.mouseRecordings[cursorRecordingId].frames;
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
