import * as React from 'react';
import { Models } from '../../../../common/api/v1';

const cursorIcon = require('./../../media/cursor.png');
import './activeUser.css';

interface ActiveUserProps {
    user: Models.ActiveUser;
}

export default class ActiveUser extends React.Component<ActiveUserProps, any> {

    private colors: string[];

    constructor(props: ActiveUserProps) {
        super(props);
        this.colors = this.getColorsForUUIDv4(props.user.id);
    }

    private getColorsForUUIDv4(uuid: string): string[] {
        let hex = uuid.split('-').join('');
        const out: string[] = [];
        while (hex.length > 0) {
            let col = hex.slice(0, 6);
            while (col.length < 6) {
                col = (col + col).slice(0, 6);
            }
            out.push('#' + col);
            hex = hex.substr(6);
        }
        return out;
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
                        className={'active-user'}
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
                return null;
        }
    }
}