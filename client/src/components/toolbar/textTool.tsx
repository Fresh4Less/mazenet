import { Models } from '../../../../common/api/v1';
import * as React from 'react';

interface TextToolProps {
    room: Models.Room;
}

export default class TextTool extends React.PureComponent<TextToolProps, any> {
    render() {
        const textToolIcon = '📝';
        return  (
            <span
                className={'noselect tool disabled'}
                title={'Add text to room.'}
            >
               {textToolIcon}
            </span>
        );
    }
}