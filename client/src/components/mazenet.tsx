/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import * as React from 'react';
import * as API from '../../../common/api/v1';
import Toolbar from './toolbar/toolbar';

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

        SocketAPI.Instance.roomEnteredObservable.subscribe((value => {
            this.setState({
                activeRoom: value.room
            });
        }));

        SocketAPI.Instance.structureCreatedObservable.subscribe(value => {
            const room = Object.assign({}, this.state.activeRoom);
            room.structures[value.id] = value;
            this.setState({
                activeRoom: room
            });
        });
    }
    render() {
        let activeRoom = <div>Loading...</div>;
        if (this.state.activeRoom) {
            activeRoom = (<ActiveRoom room={this.state.activeRoom}/>);
        }
        return (
            <div id={'Mazenet'}>
                <Toolbar/>
                <div id={'BelowToolbar'}>
                    {activeRoom}
                </div>
            </div>
        );
    }
}
