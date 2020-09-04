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
import { SocketAPI } from '../services/SocketAPI';
import { Models } from '../../../common/api/v1';
import EllipsisLoader from './widgets/ellipsisLoader';
import MediaPreloader from '../services/MediaPreloader';
import { ErrorService } from '../services/ErrorService';
import { AccountPane } from './account/accountPane';
import { AccountService } from '../services/account/AccountService';

const cursorLimit = 500;

interface MouseMoveInfo {
    element: HTMLDivElement;
    mouseClientX: number;
    mouseClientY: number;
}

interface MazenetState {
    room: Models.Room | null;
    account: Models.Account | null;
    mouseRecordings: { [cursorRecordingId: string]: Models.CursorRecording } | null;
    mediaLoaded: boolean
}

export default class Mazenet extends React.PureComponent<any, MazenetState> {

    private mouseMoveHandler: (e: React.MouseEvent<HTMLDivElement>) => void;
    private mouseMoveObserver: Observer<MouseMoveInfo>;
    private cursorFPS: number = 20;

    constructor(props: any) {
        super(props);

        this.state = {
            room: null,
            account: null,
            mouseRecordings: null,
            mediaLoaded: false,
        };

        /* Room */
        SocketAPI.Instance.roomEnteredObservable.subscribe(val => {
            this.setState({room: val.room});
            const roomID = val.room.id;
            SocketAPI.Instance.GetCursorRecordings(roomID, cursorLimit).subscribe(cursorVal => {
                /**
                 * Check to see if we have actually entered a different room by
                 * the time this observable returns something.
                 */
                if (this.state.room && this.state.room.id == roomID) {
                    this.setState({
                        mouseRecordings: cursorVal.cursorRecordings
                    });
                }
            });
            
        });
        SocketAPI.Instance.roomUpdatedObservable.subscribe(val => {
            this.setState({room: val});
        });

        let structureChangeCallback = (value: Models.Structure) => {
            if (this.state.room) {
                this.state.room.structures[value.id] = value;
                this.forceUpdate();
            }
        };

        SocketAPI.Instance.structureCreatedObservable.subscribe(structureChangeCallback);
        SocketAPI.Instance.structureUpdatedObservable.subscribe(structureChangeCallback);

        /* Account */
        AccountService.Instance.accountObservable.subscribe(val => {
            this.setState({account: val});
        })

        /* Media */
        MediaPreloader.Instance.Loaded.subscribe({
            complete: () => {
                this.setState({mediaLoaded: true});
            },
            error: (err) => {
                ErrorService.Fatal('error preloading media', err);
            }
        })

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
        if (this.state.room == null || this.state.account == null || this.state.mouseRecordings == null) {
            return (
                <div id={'Mazenet'}>
                    <div className={'loading'}>
                        <div>&gt; Loading into Mazenet</div>
                        <div>&gt; Room<EllipsisLoader animate={this.state.room == null}/>
                            {this.state.room != null && <span>OK</span>}
                        </div>
                        <div>&gt; Account<EllipsisLoader animate={this.state.account == null}/>
                            {this.state.account != null && <span>OK</span>}
                        </div>
                        <div>&gt; Cursors<EllipsisLoader animate={this.state.mouseRecordings == null}/>
                            {this.state.mouseRecordings != null && <span>OK</span>}
                        </div>
                        <div>&gt; Media<EllipsisLoader animate={this.state.mediaLoaded == null}/>
                            {this.state.mediaLoaded != null && <span>OK</span>}
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div id={'Mazenet'} className={'loaded'}>
                    <Toolbar room={this.state.room}/>
                    <div
                        id={'BelowToolbar'}
                        onMouseMove={this.mouseMoveHandler}
                    >
                        {/* Order is important, things render in the order listed. */}
                        <ActiveRoom room={this.state.room}/>
                        <MouseCanvas mouseRecordings={this.state.mouseRecordings}/>
                        <ActiveUsers/>
                        <StructureWorkshop room={this.state.room}/>
                        <Styles room={this.state.room}/>
                        <AccountPane account={this.state.account}/>
                    </div>
                </div>
            );
        }
    }

    private mouseMove(event: React.MouseEvent<HTMLDivElement>) {
        this.mouseMoveObserver.next({
            element: event.currentTarget,
            mouseClientX: event.clientX,
            mouseClientY: event.clientY
        });
    }
}
