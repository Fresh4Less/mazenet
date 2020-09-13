
import * as React from 'react';
import * as css from './toolbar.css';

import { Models } from '../../../../common/api/v1';
import ToolbarToolInterface from './toolbarToolInterface';
import { StructureWorkshopService } from '../../services/StructureWorkshopService';

import svg from './config.svg';

interface ConfigToolProps {
    room: Models.Room;
}

export default class ConfigTool extends React.PureComponent<ConfigToolProps, any> implements ToolbarToolInterface {

    public Use() {
        if (StructureWorkshopService.Instance.WorkshopIsActive()) {
            StructureWorkshopService.Instance.CloseWorkshop(false);
        } else {
            StructureWorkshopService.Instance.SelectStructureAndEdit(this.props.room);
        }
    }

    render() {
        return  (
            <span
                className={`${css.noselect} ${css.tool}`}
                title={'Edit structures in the room.'}
                onClick={() => {this.Use(); }}
                dangerouslySetInnerHTML={{__html: svg}}
            />
        );
    }
}