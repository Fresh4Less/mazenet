import * as React from 'react';
import ToolbarToolInterface from './toolbarToolInterface';
import { Models } from '../../../../common/api/v1';
import { MazenetUtils } from '../../services/MazenetUtils';

const cursorIcon = require('./../../media/cursor.png');

interface UserToolProps {
    user: Models.ActiveUser;
}

interface UserToolState {
    colors: string[];
}

export class UserTool extends React.PureComponent<UserToolProps, UserToolState> implements ToolbarToolInterface {

    constructor(props: UserToolProps) {
        super(props);
        this.state = {
            colors: MazenetUtils.GetColorsForUUIDv4(props.user.id)
        };
    }

    static getDerivedStateFromProps(nextProps: UserToolProps, prevState: UserToolState): UserToolState {
        return {
            colors: MazenetUtils.GetColorsForUUIDv4(nextProps.user.id)
        };
    }

    public Use() {
        console.log('Use info pane coming soon!');
    }

    render() {
        const cols = this.state.colors.slice(0, 2); // Lets just care about the first few. This is temporary anyways.

        const spanStyle = {
            transform: 'translateY(-5px)'
        };

        const idBarStyle = {
            border: '1px solid black',
            height: '4px',
            background: `linear-gradient(to right, ${cols.join(', ')})`,
            transform: 'translateY(-5px)'
        };

        return (
            <span
                className={'noselect tool'}
                style={spanStyle}
                title={'What you look like to others'}
                onClick={() => {
                    this.Use();
                }}
            >
                <img src={cursorIcon}/>
                <div style={idBarStyle}/>
            </span>
        );
    }
}