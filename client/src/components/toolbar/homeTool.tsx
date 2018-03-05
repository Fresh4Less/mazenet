import * as React from 'react';
import { SocketAPI } from '../../services/SocketAPI';
import { Models } from '../../../../common/api/v1';

interface HomeToolProps {
    rootRoomId: string;
    room: Models.Room;
}

export default class HomeTool extends React.PureComponent<HomeToolProps, any> {
    private enabled: boolean;

    private returnConfirmation() {
        if (this.enabled && window.confirm('Leave the current room and return to the root?')) {
            SocketAPI.Instance.EnterRootPage();
        }

    }

    render() {
        const homeToolIcon = '🏠';
        this.enabled = this.props.room.id !== this.props.rootRoomId;

        const disabledClass = this.enabled ? '' : ' disabled';
        return  (
            <span
                className={'noselect tool' + disabledClass}
                title={'Return to the root room.'}
                onClick={() => {this.returnConfirmation(); }}
            >
               {homeToolIcon}
            </span>
        );
    }
}