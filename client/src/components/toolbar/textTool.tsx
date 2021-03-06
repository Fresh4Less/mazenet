import { Models } from '../../../../common/api/v1';
import * as React from 'react';
import ToolbarToolInterface from './toolbarToolInterface';
import { StructureWorkshopService } from '../../services/StructureWorkshopService';

import svg from './text.svg';

interface TextToolProps {
    room: Models.Room;
}

export default class TextTool extends React.PureComponent<TextToolProps, any> implements ToolbarToolInterface {

    private enabled: boolean = true;

    public Use() {
        StructureWorkshopService.Instance.CreateStructureText(this.props.room);
    }

    render() {
        const disabledClass = this.enabled ? '' : ' disabled';
        return  (
            <span
                className={'noselect tool' + disabledClass}
                title={'(W)rite room text.'}
                onClick={() => {this.Use(); }}
                dangerouslySetInnerHTML={{__html: svg}}
            />
        );
    }
}