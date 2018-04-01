import * as React from 'react';
import { Models } from '../../../../../common/api/v1';

import './tunnel.css';
import { SocketAPI } from '../../../services/SocketAPI';

interface TunnelProps {
    room: Models.Room;
    structure: Models.Structure;
    tunnelData: Models.StructureData.Tunnel;
    isEditing: boolean;
}

export default class Tunnel extends React.Component<TunnelProps, any> {

    private editInput: HTMLInputElement | null;
    private editInputUnderline: HTMLDivElement | null;
    private editTextWidthDiv: HTMLDivElement | null;

    constructor(props: TunnelProps) {
        super(props);
    }

    render() {
        // Positioning
        const x = Math.min(Math.max(this.props.structure.pos.x, 0.0), 1.0) * 100;
        const y = Math.min(Math.max(this.props.structure.pos.y, 0.0), 1.0) * 100;
        if (!this.props.isEditing) {
            return this.renderEditing(x, y);
        } else {
            return this.renderDefault(x, y);
        }

    }

    private renderDefault(x: number, y: number) {
        // Figure out if we are the source or the target.
        let text = '';
        let targetId = '';
        if (this.props.room.id === this.props.tunnelData.sourceId) {
            text = this.props.tunnelData.sourceText;
            targetId = this.props.tunnelData.targetId;
        } else {
            text = this.props.tunnelData.targetText;
            targetId = this.props.tunnelData.sourceId;
        }

        const style = {
            left: `${x}%`,
            top: `${y}%`
        };
        return (
            <div
                id={this.props.structure.id}
                style={style}
                className={'structure tunnel noselect'}
                onClick={() => {SocketAPI.Instance.EnterPage(targetId); }}
            >
                {text}
            </div>
        );
    }

    private renderEditing(x: number, y: number) {
        const style = {
            left: `${x}%`,
            top: `${y}%`,
        };
        return (
            <div
                className={'structure tunnel-edit'}
                style={style}
                onClick={() => {this.focusOnInput(); }}
            >
                <div className={'tunnel-edit-top-text'}>Tunnel Name</div>
                <input className={'input-text'} ref={(e: HTMLInputElement) => {this.setInputElement(e); }}/>
                <div
                    className={'input-underline-container'}
                    ref={(e: HTMLDivElement) => {
                        this.editInputUnderline = e;
                        this.sizeInputElement();
                    }}
                >
                    <span className={'input-underline'}/>
                </div>
                <div
                    className={'input-text input-text-width-tester'}
                    ref={(e: HTMLDivElement) => {
                        this.editTextWidthDiv = e;
                        this.sizeInputElement();
                    }}
                />
            </div>
        );
    }

    private setInputElement(i: HTMLInputElement) {
        this.editInput = i;
        i.style.width = '10px';
        i.addEventListener('keydown', (e: KeyboardEvent) => {
            this.sizeInputElement(e);
        });
        // register input events to resize
    }

    private sizeInputElement(e?: KeyboardEvent) {
        if (this.editInput && this.editTextWidthDiv && this.editInputUnderline) {
            if (e && e.key === 'Backspace') {
                this.editTextWidthDiv.innerText = '';
            } else {
                this.editTextWidthDiv.innerText = this.editInput.value;
            }
            this.editInput.style.width = (this.editTextWidthDiv.clientWidth + 20) + 'px';
            this.editInputUnderline.style.width = (this.editTextWidthDiv.clientWidth + 20) + 'px';
        }
    }

    private focusOnInput() {
        if (this.editInput) {
            this.editInput.focus();
        }
    }
}