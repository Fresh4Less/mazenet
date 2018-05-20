import * as React from 'react';
import { Models } from '../../../../common/api/v1';
import ToolbarToolInterface from './toolbarToolInterface';

import svg from './style.svg';
import { Styles } from '../styles/styles';

interface StyleToolProps {
    room: Models.Room;
}

export default class StyleTool extends React.PureComponent<StyleToolProps, any> implements ToolbarToolInterface {
    private enabled: boolean;

    public Use() {
        Styles.Instance.Activate();
    }

    render() {
        this.enabled = true;

        const disabledClass = this.enabled ? '' : ' disabled';
        return  (
            <span
                className={'noselect tool' + disabledClass}
                title={'(S)tyle room.'}
                onClick={() => {this.Use(); }}
                dangerouslySetInnerHTML={{__html: svg}}
            />
         );
    }
}