import * as React from 'react';
import * as css from './toolbar.css';

import { Models } from '../../../../common/api/v1';
import { StructureWorkshopService } from '../../services/StructureWorkshopService';
import ToolbarToolInterface from './toolbarToolInterface';

import svg from './tunnel.svg';

interface TunnelToolProps {
    room: Models.Room;
}

export default class TunnelTool extends React.PureComponent<TunnelToolProps, any> implements ToolbarToolInterface {

    constructor(props: TunnelToolProps) {
        super(props);
    }

    public Use() {
        if (StructureWorkshopService.Instance.WorkshopIsActive()) {
            StructureWorkshopService.Instance.CloseWorkshop(false);
        } else {
            StructureWorkshopService.Instance.CreateStructureTunnel(this.props.room);
        }
    }

    render() {
        return  (
           <span
                className={`${css.noselect} ${css.tool}`}
                title={'Tunnel a new room.'}
                onClick={() => {this.Use(); }}
                dangerouslySetInnerHTML={{__html: svg}}
           />);
    }
}