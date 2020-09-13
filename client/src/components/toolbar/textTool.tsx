import * as React from 'react';
import * as css from './toolbar.css';

import { Models } from '../../../../common/api/v1';
import ToolbarToolInterface from './toolbarToolInterface';
import { StructureWorkshopService } from '../../services/StructureWorkshopService';

import svg from './text.svg';

interface TextToolProps {
    room: Models.Room;
}

export default class TextTool extends React.PureComponent<TextToolProps, any> implements ToolbarToolInterface {

    private enabled: boolean = true;

    public Use() {
        if (StructureWorkshopService.Instance.WorkshopIsActive()) {
            StructureWorkshopService.Instance.CloseWorkshop(false);
        } else {
            StructureWorkshopService.Instance.CreateStructureText(this.props.room);
        }
        
    }

    render() {
        const disabledClass = this.enabled ? '' : ' disabled'
        return  (
            <span
            className={`${css.noselect} ${css.tool} ${disabledClass}`}
                title={'Write room text.'}
                onClick={() => {this.Use(); }}
                dangerouslySetInnerHTML={{__html: svg}}
            />
        );
    }
}