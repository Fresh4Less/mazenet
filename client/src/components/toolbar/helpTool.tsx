import * as React from 'react';
import ToolbarToolInterface from './toolbarToolInterface';

import svg from './help.svg';
import { Help } from '../help/help';

export class HelpTool extends React.PureComponent<any, any> implements ToolbarToolInterface {

    public Use() {
        Help.Instance.Toggle();
    }

    render() {
        return  (
            <span
                className={'noselect tool'}
                title={'Help.'}
                onClick={() => {this.Use(); }}
                dangerouslySetInnerHTML={{__html: svg}}
            />
        );
    }
}