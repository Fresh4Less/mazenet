import * as React from 'react';
import * as css from './styles.css';

import { Models } from '../../../../common/api/v1';

import { WindowPane } from '../windowPane/windowPane';
import { SocketAPI } from '../../services/SocketAPI';
import { AdvancedStyles } from './advancedStyles';
import { SimpleStyles } from './simpleStyles';
import { ErrorService } from '../../services/ErrorService';

export interface StylesMode {
    Stylesheet(): [Models.Stylesheet | null, Error | null];
    Reset(): void;
}

interface StylesProps {
    room: Models.Room;
}

interface StylesState {
    active: boolean;
    errorText: string;
    advancedMode: boolean;
}

export class Styles extends React.Component<StylesProps, StylesState> {
    private static _instance: Styles;

    private simpleStyles: StylesMode = Styles.placeholderStyleMode();
    private advancedStyles: StylesMode = Styles.placeholderStyleMode();

    constructor(props: StylesProps) {
        super(props);

        if (Styles._instance) {
            ErrorService.Warning('Multiple Styles panes initialized.');
        }
        Styles._instance = this;

        this.state = {
            active: false,
            errorText: '',
            advancedMode: true
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
                startPos={{x: 0.1, y: 0.1}}
                startWidth={0.7}
                startHeight={0.6}
                closePressed={() => {
                    this.setState({
                        active: false
                    });
                }}
                title={'Room Styles'}
                hidden={!this.state.active}
            >
                <div className={css.styles}>
                    <div className={css.header}>
                        <button
                            title={'Reset the styles to whatever is currently saved within this room.'}
                            onClick={() => {
                                this.resetCSS();
                            }}
                        >
                            Reset/Refresh
                        </button>
                        <button
                            title={'Save the current styles to this room.'}
                            onClick={() => {
                                this.saveCSS();
                            }}
                        >
                            Save
                        </button>
                        <button
                            title={'Toggle styles mode.'}
                            onClick={() => {
                                this.setState({
                                    advancedMode: !this.state.advancedMode
                                });
                            }}
                        >
                            {this.state.advancedMode ? 'Simple Mode' : 'Advanced Mode'}
                        </button>
                    </div>
                    <SimpleStyles
                        room={this.props.room}
                        active={!this.state.advancedMode}
                        ref={e => {if (e) {this.simpleStyles = e; }}}
                    />
                    <AdvancedStyles
                        room={this.props.room}
                        active={this.state.advancedMode}
                        ref={e => {if (e) {this.advancedStyles = e; }}}
                    />
                    <div className={css.footer}>
                        <div className={css.error}>
                            {this.state.errorText}
                        </div>
                    </div>
                </div>
            </WindowPane>
        );
    }

    private resetCSS() {
        this.simpleStyles.Reset();
        this.advancedStyles.Reset();
    }

    private saveCSS() {
        let out: [Models.Stylesheet | null, Error | null] = this.state.advancedMode ?
            this.advancedStyles.Stylesheet() : this.simpleStyles.Stylesheet();
        let stylesheet: Models.Stylesheet | null = out[0];
        let error: Error | null = out[1];

        if (error !== null) {
            this.setState({
                errorText: error.message
            });
            return;
        } else if (stylesheet !== null) {
            this.setState({
                errorText: ''
            });
            SocketAPI.Instance.UpdateRoom(this.props.room.id, {stylesheet: stylesheet});
        }

    }

    public static get Instance(): Styles {
        return Styles._instance;
    }

    private static placeholderStyleMode(): StylesMode {
        return {
            Stylesheet: () => [null, null],
            Reset: () => {
                // NO-OP
            }
        };
    }
}
