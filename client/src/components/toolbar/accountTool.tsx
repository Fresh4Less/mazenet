import * as React from 'react';
import ToolbarToolInterface from './toolbarToolInterface';

import svg from './account.svg';
import { AccountPane } from '../account/accountPane';

interface AccountToolProps {
}

interface AccountToolState {
}

export class AccountTool extends React.PureComponent<AccountToolProps, AccountToolState> implements ToolbarToolInterface {

    constructor(props: AccountToolProps) {
        super(props);
        this.state = {
        };
    }

    public Use() {
        AccountPane.Instance.Activate();
    }

    render() {

        return (
            <span
                className={'noselect tool'}
                title={'View Account | Icon made by https://freeicons.io/profile/714'}
                onClick={() => {
                    this.Use();
                }}
                dangerouslySetInnerHTML={{__html: svg}}
            />
        );
    }
}