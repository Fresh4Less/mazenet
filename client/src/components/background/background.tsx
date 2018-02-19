
// Handles popping up tools and such.
import * as React from 'react';

import './background.css';
import { SocketAPI } from '../../services/SocketAPI';

interface BackgroundState {
}

export default class Background extends React.Component<any, BackgroundState> {

    constructor(props: any) {
        super(props);
        SocketAPI.Instance.pageEnterObservable.subscribe((value => {
            console.log('Background', value);
        }));

    }

    render() {
        return (
            <div id={'Background'}/>
        );
    }

}