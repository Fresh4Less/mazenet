import * as React from 'react';
import * as tunnelCSS from './tunnel.css';
import * as structureCSS from './structure.css';

import { Models } from '../../../../common/api/v1';

import { SocketAPI } from '../../services/SocketAPI';
import { ChangeEvent } from 'react';
import { StructureProps } from './structure';

interface TunnelProps extends StructureProps {
    tunnelData: Models.StructureData.Tunnel;
}

interface  TunnelState {
    text: string;
    dirty: boolean;
    targetId: Models.Room.Id;
}

export default class Tunnel extends React.Component<TunnelProps, TunnelState> {

    private previousPosition: Models.Position | null = null;
    private editInput: HTMLInputElement | null;
    private editOnChangeHandler: (event: ChangeEvent<HTMLInputElement>) => void;
    private characterWidth: number;

    constructor(props: TunnelProps) {
        super(props);

        this.state = this.generateStateFromProps(props);
        this.editOnChangeHandler = this.editOnChange.bind(this);
        this.characterWidth = Tunnel.measureCharacterWidth();
    }

    componentWillReceiveProps(props: TunnelProps) {
        this.characterWidth = Tunnel.measureCharacterWidth();
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
                id={`id-${this.props.structure.id}`}
                style={style}
                className={`${structureCSS.structure} ${tunnelCSS.tunnel} tunnel ${tunnelCSS.noselect}`}
                onClick={() => {SocketAPI.Instance.EnterRoom(this.state.targetId); }}
            >
                {this.state.text}
            </div>
        );
    }

    private renderEditing(x: number, y: number) {
        const placeholder = 'Tunnel Name';
        const minWidth = 16;
        const containerStyle = {
            cursor: 'text',
            left: `${x}%`,
            top: `${y}%`,
        };
        const inputStyle = {
            width: Math.max(this.characterWidth * this.state.text.length,
                Math.max(this.characterWidth * placeholder.length, this.characterWidth * minWidth))
        };
        return (
            <div
                className={`${structureCSS.structure} ${tunnelCSS.tunnelEdit}`}
                style={containerStyle}
                onClick={(e) => {
                    this.focusOnInput();
                    e.stopPropagation(); // Keep from repositioning in StructureWorkshop.
                }}
            >
                <div className={`${structureCSS.actionButtons}`}>
                    <button
                        onClick={() => {
                            this.cancel();
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!this.state.dirty}
                        onClick={() => {
                            this.submit();
                        }}
                    >
                        Submit
                    </button>
                </div>
                <input
                    className={`${tunnelCSS.tunnel}`}
                    style={inputStyle}
                    value={this.state.text}
                    placeholder={placeholder}
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
                    style={inputStyle}
                >
                    <span className={`${tunnelCSS.inputUnderline}`}/>
                </div>
            </div>
        );
    }

    private cancel() {
        if (!this.props.doneEditingCb) {
            return;
        }
        if (!this.state.dirty || confirm('Unsaved changes will be lost. Are you sure?')) {
            this.props.doneEditingCb(null);
        }
    }

    private submit() {
        if (!this.props.doneEditingCb) {
            return;
        }
        if (!this.state.dirty) {
            this.props.doneEditingCb(null);
            return;
        }

        let editedTunnelStructure = Object.assign({}, this.props.structure);
        editedTunnelStructure.data = Object.assign({}, this.props.tunnelData);
        if (this.inSourceRoom(this.props)) {
            editedTunnelStructure.data.sourceText = this.state.text;
        } else {
            editedTunnelStructure.data.targetText = this.state.text;
        }

        this.props.doneEditingCb(editedTunnelStructure);
    }

    private generateStateFromProps(props: TunnelProps): TunnelState {
        let text = '';
        let targetId = '';
        let dirty = this.state && this.state.dirty;

        // If it was repositioned mark it as dirty.
        if (this.previousPosition &&
            (this.props.structure.pos.x !== this.previousPosition.x ||
            this.props.structure.pos.y !== this.previousPosition.y)) {
            dirty = true;
        }
        this.previousPosition = this.props.structure.pos;

        if (this.inSourceRoom(props)) {
            text = props.tunnelData.sourceText;
            targetId =  props.tunnelData.targetId;
        } else {
            text = props.tunnelData.targetText;
            targetId = props.tunnelData.sourceId;
        }
        if (props.isEditing && this.state && dirty) {
            // If we are editing the tunnel don't reset the text constantly.
            // consider refactoring so that the state isn't necessary and it is all props.
            text = this.state.text;
        }

        return {
            text: text,
            dirty: dirty,
            targetId: targetId,
        };
    }

    private editOnChange(event: ChangeEvent<HTMLInputElement>): void {
        this.setState({
            dirty: true,
            text: event.target.value
        });
    }

    private focusOnInput() {
        if (this.editInput) {
            this.editInput.focus();
        }
    }

    private inSourceRoom(props: TunnelProps): boolean {
        return props.room.id === props.tunnelData.sourceId;
    }

    private static measureCharacterWidth(): number {
        let sizerDiv = document.createElement('div');
        sizerDiv.className = `${tunnelCSS.inputTextWidthTester} ${tunnelCSS.tunnel}`;
        sizerDiv.innerText = 'c';
        document.body.appendChild(sizerDiv);
        let width = sizerDiv.clientWidth;
        document.body.removeChild(sizerDiv);
        return width + 1;
    }
}