
// Handles popping up tools and such.
import * as React from 'react';

import './tools.css';

export default class Tools extends React.Component<any, any> {

    constructor(props: any) {
        super(props);

    }

    render() {
        return (
            <div id={'Tools'}>
                I am the toolbar
            </div>
        );
    }

}