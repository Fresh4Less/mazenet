/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import * as React from 'react';
import API from './services/API';
import Tools from './tools/tools';

import './mazenet.css';

export default class Mazenet extends React.Component {

    constructor(props: any) {
        super(props);
        console.log(API);
    }
    render() {
        return (
            <div id={'Mazenet'}>
                <Tools/>
                <div id={'NonToolbar'}>
                    I am mazenet
                </div>
            </div>
        );
    }
}
