/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import * as React from 'react';
import Toolbar from './toolbar/toolbar';

import './mazenet.css';
import ActiveRoom from './activeRoom/activeRoom';
import ActiveUsers from './activeUsers/activeUsers';
import StructureWorkshop from './structureWorkshop/structureWorkshop';

export default class Mazenet extends React.PureComponent<any, any> {

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div id={'Mazenet'}>
                <Toolbar/>
                <div id={'BelowToolbar'}>
                    <ActiveRoom/>
                    <ActiveUsers/>
                    <StructureWorkshop/>
                </div>
            </div>
        );
    }
}
