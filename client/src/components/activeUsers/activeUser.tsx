import * as React from 'react';
import { Models } from '../../../../common/api/v1';

const cursorIcon = require('./../../media/cursor.png');
import * as css from './activeUser.css';
import { MazenetUtils } from '../../services/MazenetUtils';

interface ActiveUserProps {
    user: Models.ActiveUser;
}

export default class ActiveUser extends React.Component<ActiveUserProps, any> {

    private colors: string[];

    constructor(props: ActiveUserProps) {
        super(props);
        this.colors = MazenetUtils.GetColorsForUUIDv4(props.user.id);
    }

    render() {
        switch (this.props.user.platformData.pType) {
            case 'desktop':
                const desktopData: Models.PlatformData.Desktop = this.props.user.platformData;
                // Positioning
                const x = Math.min(Math.max(desktopData.cursorPos.x, 0.0), 1.0) * 100;
                const y = Math.min(Math.max(desktopData.cursorPos.y, 0.0), 1.0) * 100;
                const style = {
                    left: `${x}%`,
                    top: `${y}%`
                };
                const cols = this.colors.slice(0, 2); // Lets just care about the first few. This is temporary anyways.

                const idBarStyle = {
                    border: '1px solid black',
                    height: '4px',
                    background: `linear-gradient(to right, ${cols.join(', ')})`
                };
                return (
                    <div
                        style={style}
                        className={css.activeUser}
                        onClick={() => {
                            alert(`ActiveUser: \n${JSON.stringify(this.props.user, null, 4)}`);
                        }}
                    >
                        <img src={cursorIcon}/>
                        <div style={idBarStyle}/>
                    </div>
                );
            case 'mobile':
            default:
                return null; // Currently unhandled displaying mobile users.
        }
    }
}