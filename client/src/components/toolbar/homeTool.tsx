import * as React from 'react';
import { SocketAPI } from '../../services/SocketAPI';

export default class HomeTool extends React.PureComponent<any, any> {
    private returnConfirmation() {
        if (window.confirm('Leave the current room and return to the root?')) {
            SocketAPI.Instance.EnterRootPage();
        }

    }

    render() {
        const homeToolIcon = '🏠';
        return  (
            <span
                className={'noselect tool'}
                title={'Return to the root room.'}
                onClick={this.returnConfirmation}
            >
               {homeToolIcon}
            </span>
        );
    }
}