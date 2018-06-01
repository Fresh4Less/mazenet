import { Models } from '../../../../common/api/v1';
import * as React from 'react';
import ToolbarToolInterface from './toolbarToolInterface';
import { StructureWorkshopService } from '../../services/StructureWorkshopService';

import svg from './config.svg';

interface ConfigToolProps {
    room: Models.Room;
}

export default class ConfigTool extends React.PureComponent<ConfigToolProps, any> implements ToolbarToolInterface {

    public Use() {
        StructureWorkshopService.Instance.SelectStructureAndEdit(this.props.room);
    }

    render() {
        return  (
            <span
                className={'noselect tool'}
                title={'(E)dit structures in the room.'}
                onClick={() => {this.Use(); }}
                dangerouslySetInnerHTML={{__html: svg}}
            />
        );
    }
}