import { Models } from '../../../../common/api/v1';
import * as React from 'react';

interface TextToolProps {
    room: Models.Room;
}

export default class TextTool extends React.Component<TextToolProps, any> {
    render() {
        const tunnelToolIcon = '📝';
        return  (
            <span
                className={'noselect tool disabled'}
                title={'Add text to room.'}
            >
               {tunnelToolIcon}
            </span>
        );
    }
}