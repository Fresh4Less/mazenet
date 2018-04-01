import { Models } from '../../../../common/api/v1';
import * as React from 'react';
import ToolbarToolInterface from './toolbarToolInterface';

interface ConfigToolProps {
    room: Models.Room;
}

export default class ConfigTool extends React.PureComponent<ConfigToolProps, any> implements ToolbarToolInterface {

    public Use() {
        alert('Room Config!');
    }

    render() {
        const configToolIcon = '⚙️';
        return  (
            <span
                className={'noselect tool'}
                title={'(C)onfigure the current room.'}
                onClick={() => {this.Use(); }}
            >
               {configToolIcon}
            </span>
        );
    }
}