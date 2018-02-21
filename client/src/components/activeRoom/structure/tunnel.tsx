import * as React from 'react';
import { Models } from '../../../../../common/api/v1';

import './tunnel.css';
import { SocketAPI } from '../../../services/SocketAPI';

interface TunnelProps {
    room: Models.Room;
    structure: Models.Structure;
    tunnelData: Models.StructureData.Tunnel;
}

export default class Tunnel extends React.Component<TunnelProps, any> {

    constructor(props: TunnelProps) {
        super(props);
    }

    render() {
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

        // Positioning
        const x = Math.min(Math.max(this.props.structure.pos.x, 0.0), 1.0) * 100;
        const y = Math.min(Math.max(this.props.structure.pos.y, 0.0), 1.0) * 100;
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
}