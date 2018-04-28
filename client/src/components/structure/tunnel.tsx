import * as React from 'react';
import { Models } from '../../../../common/api/v1';

import './tunnel.css';
import { SocketAPI } from '../../services/SocketAPI';
import { ChangeEvent } from 'react';
import { StructureProps } from './structure';

interface TunnelProps extends StructureProps {
    tunnelData: Models.StructureData.Tunnel;
}

interface  TunnelState {
    text: string;
    targetId: Models.Room.Id;
}

export default class Tunnel extends React.Component<TunnelProps, TunnelState> {

    private editInput: HTMLInputElement | null;
    private editOnChangeHandler: (event: ChangeEvent<HTMLInputElement>) => void;
    private characterWidth: number;

    constructor(props: TunnelProps) {
        super(props);

        this.state = this.generateStateFromProps(props);
        this.editOnChangeHandler = this.editOnChange.bind(this);
        this.characterWidth = this.getCharacterWidth();
    }

    componentWillReceiveProps(props: TunnelProps) {
        this.characterWidth = this.getCharacterWidth();
        this.setState(this.generateStateFromProps(props));
    }

    render() {
        const x = Math.min(Math.max(this.props.structure.pos.x, 0.0), 1.0) * 100;
        const y = Math.min(Math.max(this.props.structure.pos.y, 0.0), 1.0) * 100;
        if (this.props.isEditing) {
            return this.renderEditing(x, y);
        } else {
            return this.renderDefault(x, y);
        }

    }

    private renderDefault(x: number, y: number) {
        const style = {
            left: `${x}%`,
            top: `${y}%`
        };
        return (
            <div
                id={this.props.structure.id}
                style={style}
                className={'structure tunnel noselect tunnel-font'}
                onClick={() => {SocketAPI.Instance.EnterRoom(this.state.targetId); }}
            >
                {this.state.text}
            </div>
        );
    }

    private renderEditing(x: number, y: number) {
        const containerStyle = {
            cursor: 'text',
            left: `${x}%`,
            top: `${y}%`,
        };
        const widthStyle = {
            width: this.characterWidth * this.state.text.length,
        };
        return (
            <div
                className={'structure tunnel-edit'}
                style={containerStyle}
                onClick={(e) => {
                    this.focusOnInput();
                    e.stopPropagation(); // Keep from repositioning in StructureWorkshop.
                }}
            >
                <div className={'tunnel-edit-top-text'}>Tunnel Name</div>
                <input
                    className={'tunnel-font'}
                    style={widthStyle}
                    value={this.state.text}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && this.state.text.length > 0) {
                            this.submit();
                        }
                    }}
                    onChange={this.editOnChangeHandler}
                    ref={(el) => {
                        if (!el) {return; }
                        this.editInput = el;
                        el.focus();
                    }}
                />
                <div
                    style={widthStyle}
                >
                    <span className={'input-underline'}/>
                </div>
            </div>
        );
    }

    private submit() {
        if (!this.props.doneEditingCb) {
            return;
        }

        let editedTunnelStructure = Object.assign({}, this.props.structure);
        editedTunnelStructure.data = Object.assign({}, this.props.tunnelData);
        editedTunnelStructure.data.sourceText = this.state.text;
        this.props.doneEditingCb(editedTunnelStructure);
    }

    private generateStateFromProps(props: TunnelProps): TunnelState {
        let text = '';
        let targetId = '';
        if (props.room.id === props.tunnelData.sourceId) {
            text = props.tunnelData.sourceText;
            targetId =  props.tunnelData.targetId;
        } else {
            text = props.tunnelData.targetText;
            targetId = props.tunnelData.sourceId;
        }
        if (props.isEditing && this.state && this.state.text.length > 0) {
            // If we are editing the tunnel don't reset the text constantly.
            // consider refactoring so that the state isn't necessary and it is all props.
            text = this.state.text;
        }

        return {
            text: text,
            targetId: targetId,
        };
    }

    private getCharacterWidth(): number {
        let sizerDiv = document.createElement('div');
        sizerDiv.className = 'input-text-width-tester tunnel-font';
        sizerDiv.innerText = 'c';
        document.body.appendChild(sizerDiv);
        let width = sizerDiv.clientWidth;
        document.body.removeChild(sizerDiv);
        return width + 1;
    }

    private editOnChange(event: ChangeEvent<HTMLInputElement>): void {
        this.setState({
            text: event.target.value
        });
    }

    private focusOnInput() {
        if (this.editInput) {
            this.editInput.focus();
        }
    }
}