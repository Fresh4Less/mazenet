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

    constructor(props: TunnelProps) {
        super(props);
    }

    render() {
        // Positioning
        const x = Math.min(Math.max(this.props.structure.pos.x, 0.0), 1.0) * 100;
        const y = Math.min(Math.max(this.props.structure.pos.y, 0.0), 1.0) * 100;
        if (  this.props.isEditing) {
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
                className={'structure'}
                style={style}
            >
                <div className={'tunnel-edit-top-text'}>Tunnel Name:</div>
                <input
                    placeholder="Tunnel Name"
                />
            </div>
        );
    }
}