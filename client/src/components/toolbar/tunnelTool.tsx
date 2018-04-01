import * as React from 'react';
import { Models } from '../../../../common/api/v1';
import { StructureWorkshop } from '../../services/StructureWorkshop';
import ToolbarToolInterface from './toolbarToolInterface';

interface TunnelToolProps {
    room: Models.Room;
}

export default class TunnelTool extends React.PureComponent<TunnelToolProps, any> implements ToolbarToolInterface {

    constructor(props: TunnelToolProps) {
        super(props);
    }

    public Use() {
        StructureWorkshop.Instance.CreateStructureTunnel(this.props.room);
    }

    render() {
        const tunnelToolIcon = '⛏️';
        return  (
           <span
               className={'noselect tool'}
               title={'(T)unnel a new room.'}
               onClick={() => {this.Use(); }}
           >
               {tunnelToolIcon}
           </span>);
    }
}