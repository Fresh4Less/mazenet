import * as React from 'react';
import * as css from './toolbar.css';

import ToolbarToolInterface from './toolbarToolInterface';
import svg from './account.svg';
import { Account } from '../account/account';

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
        Account.Instance.Toggle();
    }

    render() {

        return (
            <span
                className={`${css.noselect} ${css.tool}`}
                title={'View Account'}
                onClick={() => {
                    this.Use();
                }}
                dangerouslySetInnerHTML={{__html: svg}}
            />
        );
    }
}