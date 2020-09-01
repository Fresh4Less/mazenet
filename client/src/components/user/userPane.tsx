import * as React from 'react';

import { WindowPane } from '../windowPane/windowPane';
import { ErrorService } from '../../services/ErrorService';
import { Models } from '../../../../common/api/v1';

interface UserPaneProps {
    user: Models.User;
}

interface UserPaneState {
    active: boolean;
}

export class UserPane extends React.Component<UserPaneProps, UserPaneState> {
    private static _instance: UserPane;

    constructor(props: UserPaneProps) {
        super(props);

        if (UserPane._instance) {
            ErrorService.Warning('Multiple Styles panes initialized.');
        }
        UserPane._instance = this;

        this.state = {
            active: false,
        };
    }

    public Activate(): void {
        this.setState({
            active: true
        });
    }

    public render(): JSX.Element {
        return (
            <WindowPane
                startPos={{x: 0.5, y: 0.2}}
                startWidth={0.5}
                startHeight={0.6}
                closePressed={() => {
                    this.setState({
                        active: false
                    });
                }}
                title={'User'}
                hidden={!this.state.active}
            >
                User pane!
                {JSON.stringify(this.props.user)}
            </WindowPane>
        );
    }


    public static get Instance(): UserPane {
        return UserPane._instance;
    }
}
