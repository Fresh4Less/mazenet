import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Models } from '../../../../common/api/v1';

import './windowPane.css';
import svg from './close.svg';

interface WindowPaneProps {
    startPos: Models.Position;
    startWidth: number;
    startHeight: number;
    hidden: boolean;
    closePressed: () => void;
    title: string;
}

interface WindowPaneState {
    pos: Models.Position;
    width: number; // Percent (0 - 1.0)
    height: number; // Percent (0 - 1.0)
    dragging: boolean;
    mouseRelation: Models.Position;
    containerOffset: Models.Position;
    resizing: boolean;
    resizingStartWidth: number;
    resizingStartHeight: number;
}

export class WindowPane extends React.PureComponent<WindowPaneProps, WindowPaneState> {

    private minimumWidth: number = 0.1;
    private minimumHeight: number = 0.2;
    private onMouseMoveBound: (e: MouseEvent) => void;
    private onMouseUpBound: (e: MouseEvent) => void;

    constructor(props: WindowPaneProps) {
        super(props);

        this.onMouseMoveBound = this.onMouseMove.bind(this);
        this.onMouseUpBound = this.onMouseUp.bind(this);

        const zero = {
            x: 0,
            y: 0,
        };

        this.state = {
            pos: props.startPos,
            width: props.startWidth,
            height: props.startHeight,
            dragging: false,
            mouseRelation: zero,
            containerOffset: zero,
            resizing: false,
            resizingStartWidth: 0,
            resizingStartHeight: 0,
        };
    }

    public render(): JSX.Element {


        const style = {
            left: `${this.state.pos.x * 100}%`,
            top: `${this.state.pos.y * 100}%`,
            width: `${this.state.width * 100}%`,
            height: `${this.state.height * 100}%`,
        };
        return (
            <div
                className={'windowPane' + (this.props.hidden ? ' hidden' : '')}
                style={style}
            >
                <div
                    className={'toolbar'}
                    onMouseDown={(e) => {
                        this.draggingOnMouseDown(e);
                    }}
                >
                    <span
                        className={'title'}
                    >
                        {this.props.title}
                    </span>
                    <span
                        className={'close'}
                        title={'Close'}
                        onClick={() => {
                            this.props.closePressed();
                        }}
                        dangerouslySetInnerHTML={{__html: svg}}
                    />
                </div>
                {this.props.children}
                <div
                    className={'resizer'}
                    onMouseDown={(e) => {
                        this.resizingOnMouseDown(e);
                    }}
                />
            </div>
        );
    }

    componentDidUpdate(prevProps: WindowPaneProps, prevState: WindowPaneState) {
        const draggingOrResizing = this.state.dragging || this.state.resizing;
        const prevDraggingOrResizing = prevState.dragging || prevState.resizing;

        if (draggingOrResizing && !prevDraggingOrResizing) {
            document.addEventListener('mousemove', this.onMouseMoveBound);
            document.addEventListener('mouseup', this.onMouseUpBound);
        } else if (!draggingOrResizing && prevDraggingOrResizing) {
            document.removeEventListener('mousemove', this.onMouseMoveBound);
            document.removeEventListener('mouseup', this.onMouseUpBound);
        }

    }

    private draggingOnMouseDown(e: React.MouseEvent<HTMLDivElement>): void {
        if (e.button !== 0) {
            return;
        }
        let element = ReactDOM.findDOMNode(this);
        if (!element || !element.parentElement) {
            return;
        }
        let containerRect = element.parentElement.getBoundingClientRect();
        let rect = (element as Element).getBoundingClientRect();
        this.setState({
            dragging: true,
            mouseRelation: {
                x: e.pageX - rect.left,
                y: e.pageY - rect.top,
            },
            containerOffset: {
                x: containerRect.left,
                y: containerRect.top,
            }
        });
        e.stopPropagation();
        e.preventDefault();
    }

    private resizingOnMouseDown(e: React.MouseEvent<HTMLDivElement>): void {
        if (e.button !== 0) {
            return;
        }
        let element = ReactDOM.findDOMNode(this);
        if (!element || !element.parentElement) {
            return;
        }
        let containerRect = element.parentElement.getBoundingClientRect();
        this.setState({
            resizing: true,
            resizingStartWidth: this.state.width,
            resizingStartHeight: this.state.height,
            mouseRelation: {
                x: e.pageX,
                y: e.pageY,
            },
            containerOffset: {
                x: containerRect.left,
                y: containerRect.top,
            }

        });
        e.stopPropagation();
        e.preventDefault();
    }

    private onMouseMove(e: MouseEvent): void {
        if (!this.state.dragging && !this.state.resizing) {
            return;
        }
        if (this.state.dragging) {
            let nextX = (e.pageX - this.state.mouseRelation.x - this.state.containerOffset.x) /
                (window.innerWidth - this.state.containerOffset.x);
            let nextY = (e.pageY - this.state.mouseRelation.y - this.state.containerOffset.y) /
                (window.innerHeight - this.state.containerOffset.y);
            nextX = Math.max(0.0, Math.min( 1.0 - this.state.width, nextX));
            nextY = Math.max(0.0, Math.min( 1.0 - this.state.height, nextY));
            this.setState({
                pos: {
                    x: nextX,
                    y: nextY
                }
            });
        } else {
            let nextWidth = this.state.resizingStartWidth +
                ((e.pageX - this.state.mouseRelation.x) /
                (window.innerWidth - this.state.containerOffset.x));
            let nextHeight = this.state.resizingStartHeight +
                ((e.pageY - this.state.mouseRelation.y) /
                (window.innerHeight - this.state.containerOffset.y));
            nextWidth = Math.max(this.minimumWidth, Math.min( 1.0 - this.state.pos.x, nextWidth));
            nextHeight = Math.max(this.minimumHeight, Math.min( 1.0 - this.state.pos.y, nextHeight));
            this.setState({
               width: nextWidth,
                height: nextHeight,
            });
        }
        e.stopPropagation();
        e.preventDefault();
    }

    private onMouseUp(e: MouseEvent): void {
        this.setState({
            dragging: false,
            resizing: false,
        });
        e.stopPropagation();
        e.preventDefault();
    }
}
