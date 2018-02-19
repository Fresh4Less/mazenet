/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import * as React from 'react';
import * as API from '../../../common/api/v1';
import Tools from './tools/tools';

import './mazenet.css';
import ActiveRoom from './activeRoom/activeRoom';
import { SocketAPI } from '../services/SocketAPI';

interface MazenetState {
    activeRoom: API.Models.Room | null;
}

export default class Mazenet extends React.Component<any, MazenetState> {

    constructor(props: any) {
        super(props);
        this.state = {
          activeRoom: null
        };
        SocketAPI.Instance.pageEnterObservable.subscribe((value => {
            this.setState({
                activeRoom: value.room
            });
        }));
    }
    render() {
        let activeRoom = <div>Loading...</div>;
        if (this.state.activeRoom) {
            activeRoom = (<ActiveRoom room={this.state.activeRoom}/>);
        }
        return (
            <div id={'Mazenet'}>
                <Tools/>
                <div id={'BelowToolbar'}>
                    {activeRoom}
                </div>
            </div>
        );
    }
}
