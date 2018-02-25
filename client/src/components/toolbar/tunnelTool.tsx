import * as React from 'react';
import { Models } from '../../../../common/api/v1';
import { SocketAPI } from '../../services/SocketAPI';
import { RoomPositionCollector } from '../../services/RoomPositionCollector';

interface TunnelToolProps {
    room: Models.Room;
}

export default class TunnelTool extends React.PureComponent<TunnelToolProps, any> {

    constructor(props: TunnelToolProps) {
        super(props);
        this.tunnelRoom = this.tunnelRoom.bind(this);
    }

    tunnelRoom() {
        const sourceText = prompt('What should the tunnel link text be in this room?');
        if (sourceText) {
            const targetText = prompt('What should the tunnel link text be in the created room?');
            if (targetText) {
                RoomPositionCollector.Instance.GetPositionInRoom(this.props.room.id,
                    (pos: Models.Position | null) => {
                    if (pos) {
                        const blueprint: Models.Structure.Blueprint = {
                            pos: pos,
                            data: {
                               sType: 'tunnel',
                               sourceText: sourceText,
                               targetText: targetText
                            }
                        };
                        SocketAPI.Instance.CreateStructure(this.props.room.id, blueprint);
                    }
                });
            }
        }
    }

    render() {
        const tunnelToolIcon = '⛏️';
        return  (
           <span
               className={'noselect tool'}
               title={'Tunnel a new room.'}
               onClick={this.tunnelRoom}
           >
               {tunnelToolIcon}
           </span>);
    }
}