import * as React from 'react';
import { Models } from '../../../../common/api/v1';

import './styles.css';
import { StylesService } from '../../services/StylesService';
import { stylesheetToString } from '../../../../common/util/stylesheet';
import { WindowPane } from '../windowPane/windowPane';

interface StylesProps {
    room: Models.Room;
}

interface StylesState {
    active: boolean;
    cssSheetText: string;
}

export class Styles extends React.PureComponent<StylesProps, StylesState> {

    constructor(props: StylesProps) {
        super(props);

        StylesService.Instance.SetStructureWorkshopComponent(this);

        this.state = {
            active: false,
            cssSheetText: stylesheetToString(props.room.stylesheet, false),
        };
    }

    componentWillReceiveProps(nextProps: StylesProps) {
        console.log('receive new props', stylesheetToString(nextProps.room.stylesheet, false));
        this.setState({
            cssSheetText: stylesheetToString(nextProps.room.stylesheet, false),
        });
    }

    public Activate(): void {
        this.setState({
            active: true
        });
    }

    public render(): JSX.Element {
        return (
            <WindowPane
                startPos={{x: 0.2, y: 0.2}}
                closePressed={() => {
                    this.setState({
                        active: false
                    });
                }}
                title={'Room Styles'}
                hidden={!this.state.active}
            >
                <div className={'styles'}>
                    <div className={'header'}>
                        {this.props.room.title}
                    </div>
                    <textarea
                        className={'body'}
                        placeholder="Type some styles."
                        value={this.state.cssSheetText}
                        onChange={(e) => {
                            this.setState({cssSheetText: e.target.value});
                        }}
                    />
                    <div className={'footer'}>
                        <div>
                            <button
                                title={'Reset the styles to whatever was last saved.'}
                            >
                                Reset
                            </button>
                            <button
                                title={'Apply the current styles to this room without saving.'}
                            >
                                Try
                            </button>
                            <button
                                title={'Save the current styles to this room.'}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </WindowPane>
        );
    }
}
