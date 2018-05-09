import * as React from 'react';
import { Models } from '../../../../common/api/v1';

import './styles.css';
import { StylesService } from '../../services/StylesService';
import { parseCss, stylesheetToString } from '../../../../common/util/stylesheet';
import { WindowPane } from '../windowPane/windowPane';
import { SocketAPI } from '../../services/SocketAPI';

interface StylesProps {
    room: Models.Room;
}

interface StylesState {
    active: boolean;
    cssString: string;
    errorText: string;
    helpActive: boolean;
}

export class Styles extends React.Component<StylesProps, StylesState> {

    constructor(props: StylesProps) {
        super(props);

        StylesService.Instance.SetStructureWorkshopComponent(this);

        this.state = {
            active: false,
            cssString: stylesheetToString(props.room.stylesheet, false),
            errorText: '',
            helpActive: true,
        };
    }

    // TODO: Figure out a "dirty" system so this isn't constantly refreshed when other users edit the page.
    // componentWillReceiveProps(nextProps: StylesProps) {
    //     this.setState({
    //         cssString: stylesheetToString(nextProps.room.stylesheet, false),
    //     });
    // }

    public Activate(): void {
        this.setState({
            active: true
        });
    }

    public render(): JSX.Element {
        return (
            <WindowPane
                startPos={{x: 0.1, y: 0.2}}
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
                <div className={'styles'}>
                    <div className={'header'}>
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
                            onClick={() => {
                                this.setState({
                                    helpActive: !this.state.helpActive
                                });
                            }}
                        >
                            Toggle Help
                        </button>
                    </div>
                    <div className={'body'}>
                        <textarea
                            placeholder="Type some styles."
                            value={this.state.cssString}
                            onChange={(e) => {
                                this.setState({cssString: e.target.value});
                            }}
                        />
                        {this.renderHelp()}
                    </div>
                    <div className={'footer'}>
                        <div className={'error'}>
                            {this.state.errorText}
                        </div>
                    </div>
                </div>
            </WindowPane>
        );
    }

    private renderHelp(): JSX.Element | null {
        if (!this.state.helpActive) {
            return null;
        }

        const sharedSelectors = [
            {selector: '.room', description: 'Selects this room.'},
            {selector: '.structure', description: 'Selects all structures.'},
            {selector: '.tunnel', description: 'Selects all tunnel structures.'},
            {selector: '.text', description: 'Selects all text structures.'},
        ];
        const sharedSelectorElements = sharedSelectors.map((e) => {
            return (
                <li
                    key={e.selector}
                    className={'selector'}
                    onClick={() => {
                        this.addSelectorToSheet(e.selector);
                    }}
                    title={`Click to append a ${e.selector} selector.`}
                >
                    <b>{e.selector}</b> - <i>{e.description}</i>
                </li>
            );
        });

        const structureSelectorElements = Object.keys(this.props.room.structures).map((id) => {
            const structure = this.props.room.structures[id];
            const selector = `#id-${id}`;
            return (
                <li
                    key={id}
                    className={'selector'}
                    onClick={() => {
                        this.addSelectorToSheet(selector);
                    }}
                    title={`Click to append a ${selector} selector.`}
                >
                    <b>{selector}</b> - <i>{structure.data.sType} at
                        (x: {Math.floor(structure.pos.x * 100)}%,
                        y: {Math.floor(structure.pos.y * 100)}%)</i>
                </li>
            );
        });

        return (
            <div className={'help'}>
                <h1>Styles Help</h1>
                <h2>Info</h2>
                <ul>
                    <li>- You are writing&nbsp;
                        <a
                            title="Mozilla's introduction to CSS."
                            target="_blank"
                            href="https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Syntax"
                        >CSS
                        </a>.
                        It will be filtered of illegal rules and namespaced within the room.</li>
                    <li>- Hover over structures with the Structure Workshop open see their IDs.</li>
                    <li>- Custom classes and a better UI are coming soon.</li>
                </ul>
                <h2>Selectors</h2>
                (You can click the selectors.)
                <h3>Shared</h3>
                <ul>{sharedSelectorElements}</ul>
                <h3>Structures</h3>
                <ul>{structureSelectorElements}</ul>
            </div>
        );
    }

    private addSelectorToSheet(selector: string) {
        const selectorString = `\n${selector} {\n  \n}`;
        this.setState({
            cssString: this.state.cssString + selectorString
        });
    }

    private resetCSS() {
        this.setState({
            cssString: stylesheetToString(this.props.room.stylesheet, false),
        });
    }

    private saveCSS() {
        let stylesheet: Models.Stylesheet | null = null;
        try {
            stylesheet = parseCss(this.state.cssString);
        } catch (e) {
            this.setState({
                errorText: e.message
            });
            return;
        }
        this.setState({
            errorText: ''
        });
        SocketAPI.Instance.UpdateRoom(this.props.room.id, {
            stylesheet: stylesheet
        });

    }
}
