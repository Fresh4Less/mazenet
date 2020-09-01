import * as React from 'react';
import ToolbarToolInterface from './toolbarToolInterface';

import svg from './user.svg';
import { UserPane } from '../user/userPane';

interface UserToolProps {
}

interface UserToolState {
}

export class UserTool extends React.PureComponent<UserToolProps, UserToolState> implements ToolbarToolInterface {

    constructor(props: UserToolProps) {
        super(props);
        this.state = {
        };
    }

    static getDerivedStateFromProps(nextProps: UserToolProps, prevState: UserToolState): UserToolState {
        return {};
    }

    public Use() {
        UserPane.Instance.Activate();
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