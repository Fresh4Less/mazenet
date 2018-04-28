import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Models } from '../../../../common/api/v1';

import './stylePane.css';
import { StylePaneService } from '../../services/StylePaneService';

interface StylePaneProps {
    room: Models.Room;
}

interface StylePaneState {
    pos: Models.Position;
    active: boolean;
    dragging: boolean;
    draggingMouseRelation: Models.Position;
    draggingContainerOffset: Models.Position;
    cssSheet: string;
}

export class StylePane extends React.PureComponent<StylePaneProps, StylePaneState> {

    private onMouseMoveBound: (e: MouseEvent) => void;
    private onMouseUpBound: (e: MouseEvent) => void;

    constructor(props: StylePaneProps) {
        super(props);

        this.onMouseMoveBound = this.onMouseMove.bind(this);
        this.onMouseUpBound = this.onMouseUp.bind(this);

        StylePaneService.Instance.SetStructureWorkshopComponent(this);

        this.state = {
            pos: {
                x: 0.2,
                y: 0.2,
            },
            active: false,
            dragging: false,
            draggingMouseRelation: {
                x: 0,
                y: 0,
            },
            draggingContainerOffset: {
                x: 0,
                y: 0,
            },
            cssSheet: '',
        };
    }

    public Activate(): void {
        this.setState({
            active: true
        });
    }

    public render(): JSX.Element {
        let left = Math.max(0.0, Math.min(0.9, this.state.pos.x));
        let top = Math.max(0.0, Math.min(0.9, this.state.pos.y));

        const style = {
            left: `${left * 100}%`,
            top: `${top * 100}%`,
            width: `30%`,
            height: `60%`,
        };
        return (
            <div
                id={'StylePane'}
                className={this.state.active ? '' : 'hidden'}
                style={style}
            >
                <div
                    className={'toolbar'}
                    title={'Style Pane'}
                    onMouseDown={(e) => {
                        this.onMouseDown(e);
                    }}
                >
                    Style Pane
                    <span
                        className={'close'}
                        title={'Close Style Pane'}
                        onClick={(e) => {this.setState({active: false}); }}
                    >
                        ❌
                    </span>
                </div>
                <div>
                    <div>
                        <button>Reset</button>
                        <button>Save</button>
                    </div>
                    Room {this.props.room.id}
                </div>
                <textarea
                    value={this.state.cssSheet}
                    onChange={(e) => {
                        this.setState({cssSheet: e.target.value});
                    }}
                />
            </div>
        );
    }

    componentDidUpdate(prevProps: StylePaneProps, prevState: StylePaneState) {
        if (this.state.dragging && !prevState.dragging) {
            document.addEventListener('mousemove', this.onMouseMoveBound);
            document.addEventListener('mouseup', this.onMouseUpBound);
        } else if (!this.state.dragging && prevState.dragging) {
            document.removeEventListener('mousemove', this.onMouseMoveBound);
            document.removeEventListener('mouseup', this.onMouseUpBound);
        }

    }

    private onMouseDown(e: React.MouseEvent<HTMLDivElement>): void {
        if (e.button !== 0) {
            return;
        }
        let element = ReactDOM.findDOMNode(this);
        if (!element.parentElement) {
            return;
        }
        let containerRect = element.parentElement.getBoundingClientRect();
        let rect = element.getBoundingClientRect();
        this.setState({
            dragging: true,
            draggingMouseRelation: {
                x: e.pageX - rect.left,
                y: e.pageY - rect.top,
            },
            draggingContainerOffset: {
                x: containerRect.left,
                y: containerRect.top,
            }

        });
        e.stopPropagation();
        e.preventDefault();
    }

    private onMouseMove(e: MouseEvent): void {
        if (!this.state.dragging) {
            return;
        }
        this.setState({
            pos: {
                x: (e.pageX - this.state.draggingMouseRelation.x - this.state.draggingContainerOffset.x) /
                (window.innerWidth - this.state.draggingContainerOffset.x),
                y: (e.pageY - this.state.draggingMouseRelation.y - this.state.draggingContainerOffset.y) /
                (window.innerHeight - this.state.draggingContainerOffset.y)
            }
        });
        e.stopPropagation();
        e.preventDefault();
    }

    private onMouseUp(e: MouseEvent): void {
        this.setState({
            dragging: false,
        });
        e.stopPropagation();
        e.preventDefault();
    }
}
