/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import * as React from 'react';
import Toolbar from './toolbar/toolbar';

import './mazenet.css';
import ActiveRoom from './activeRoom/activeRoom';
import MouseCanvas from './background/mouseCanvas';
import ActiveUsers from './activeUsers/activeUsers';

export default class Mazenet extends React.PureComponent<any, any> {

    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <div id={'Mazenet'}>
                <Toolbar/>
                <div id={'BelowToolbar'}>
                    <MouseCanvas/>
                    <ActiveRoom/>
                    <ActiveUsers/>
                </div>
            </div>
        );
    }
}
