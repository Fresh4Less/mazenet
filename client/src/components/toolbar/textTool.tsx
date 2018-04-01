import { Models } from '../../../../common/api/v1';
import * as React from 'react';
import ToolbarToolInterface from './toolbarToolInterface';

interface TextToolProps {
    room: Models.Room;
}

export default class TextTool extends React.PureComponent<TextToolProps, any> implements ToolbarToolInterface {

    private enabled: boolean = false;

    public Use() {
        alert('Create Text!');
    }

    render() {
        const textToolIcon = '📝';
        const disabledClass = this.enabled ? '' : ' disabled';
        return  (
            <span
                className={'noselect tool' + disabledClass}
                title={'(W)rite room text.'}
            >
               {textToolIcon}
            </span>
        );
    }
}