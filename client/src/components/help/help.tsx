import * as React from 'react';

import { WindowPane } from '../windowPane/windowPane';
import { ErrorService } from '../../services/ErrorService';

import * as css from './help.css';

interface HelpState {
    active: boolean;
}

export class Help extends React.Component<any, HelpState> {
    private static _instance: Help;
    public static get Instance(): Help {
        return Help._instance;
    }

    constructor(props: any) {
        super(props);

        if (Help._instance) {
            ErrorService.Warning('Multiple Help panes initialized.');
        }
        Help._instance = this;

        this.state = {
            active: false,
        };
    }

    public Toggle(): void {
        this.setState({
            active: !this.state.active
        });
    }

    public render(): JSX.Element {
        return (
            <WindowPane
                startPos={{x: 0.4, y: 0.4}}
                startWidth={0.4}
                startHeight={0.5}
                closePressed={() => {
                    this.setState({
                        active: false
                    });
                }}
                hidden={!this.state.active}
                title={'Help'}
            >
                <div className={css.help}>
                    <h2>Tutorial</h2>
                    <div>A tutorial would go here.</div>
                    <h2>About</h2>
                    <div>
                        <b>Mazenet: 2014-2020</b>
                        <div>
                            Created by <a href="https://github.com/sambdavidson" target='_blank'>Samuel Davidson</a> and <a href="https://github.com/elliothatch" target='_blank'>Elliot Hatch</a>
                        </div>
                        <div>
                            <b>Star us on Github:</b>
                        </div>
                        <div>
                            <a href='https://github.com/Fresh4Less/mazenet' target='_blank'>github.com/Fresh4Less/mazenet</a>
                        </div>
                        <div>
                            <b>Credits:</b>
                        </div>
                        <div>
                        <div>
                            Icons made by <a href="https://www.flaticon.com/authors/prosymbols" title="Prosymbols">Prosymbols</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
                        </div>
                        <div>
                            Account icon made by https://freeicons.io/profile/714
                        </div>
                    </div>
                </div>
            </WindowPane>
        );
    }
}