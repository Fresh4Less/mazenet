import * as React from 'react';
import ToolbarToolInterface from './toolbarToolInterface';

import svg from './info.svg';

export class InfoTool extends React.PureComponent<any, any> implements ToolbarToolInterface {

    public Use() {
        alert(`
         Mazenet : 2014 - 2018
         
         Created by Samuel Davidson and Elliot Hatch
         
         Star us on:
         github.com/Fresh4Less/mazenet
         
         Credits:
         Icon(s) made by Prosymbols from www.flaticon.com
        `);
        // <div>Icons made by <a href="https://www.flaticon.com/authors/prosymbols" title="Prosymbols">Prosymbols</a>
        // from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by
        // <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">
        // CC 3.0 BY</a></div>
    }

    render() {
        return  (
            <span
                className={'noselect tool'}
                title={'Help and information.'}
                onClick={() => {this.Use(); }}
                dangerouslySetInnerHTML={{__html: svg}}
            />
        );
    }
}