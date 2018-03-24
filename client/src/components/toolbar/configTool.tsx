import { Models } from '../../../../common/api/v1';
import * as React from 'react';

interface ConfigToolProps {
    room: Models.Room;
}

export default class ConfigTool extends React.PureComponent<ConfigToolProps, any> {
    render() {
        const configToolIcon = '⚙️';
        return  (
            <span
                className={'noselect tool'}
                title={'Configure the current room.'}
                onClick={() => {alert('Room Config!'); }}
            >
               {configToolIcon}
            </span>
        );
    }
}