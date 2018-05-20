import * as React from 'react';
import { Models } from '../../../../common/api/v1';
import { parseCss, stylesheetToString } from '../../../../common/util/stylesheet';
import { StylesMode } from './styles';

interface AdvancedStylesProps {
    room: Models.Room;
    active: boolean;
}

interface AdvancedStylesState {
    dirty: boolean;
    cssString: string;
    help: boolean;
}

export class AdvancedStyles extends React.Component<AdvancedStylesProps, AdvancedStylesState> implements StylesMode {

    constructor(props: AdvancedStylesProps) {
        super(props);

        this.state = {
            dirty: false,
            help: true,
            cssString: stylesheetToString(props.room.stylesheet, false),
        };
    }

    public Stylesheet(): [Models.Stylesheet | null, Error | null] {
        let stylesheet: Models.Stylesheet | null = null;
        let error: Error | null = null;
        try {
            stylesheet = parseCss(this.state.cssString);
        } catch (e) {
            error = e;
        }
        return [stylesheet, error];
    }

    public Reset() {
        this.setState({
            dirty: false,
            cssString: stylesheetToString(this.props.room.stylesheet, false),
        });
    }

    componentWillReceiveProps(nextProps: AdvancedStylesProps) {
        if (!this.state.dirty || this.props.room.id !== nextProps.room.id) {
            this.setState({
                dirty: false,
                cssString: stylesheetToString(nextProps.room.stylesheet, false),
            });
        }
    }

    public render(): JSX.Element | null {
        if (!this.props.active) {
            return null;
        }
        return (
            <div className={'body'}>
                <textarea
                    placeholder="Type some styles."
                    value={this.state.cssString}
                    onChange={(e) => {
                        this.setState({
                            dirty: true,
                            cssString: e.target.value
                        });
                    }}
                />
                <div
                    className={'help-toggler'}
                    title={'Toggle Help'}
                    onClick={() => {
                        this.setState({
                            help: !this.state.help
                        });
                    }}
                >
                    <span className={'arrow'}>
                        {this.state.help ? '<' : '>'}
                    </span>
                </div>
                {this.renderHelp()}
            </div>
        );
    }

    private renderHelp(): JSX.Element | null {
        if (!this.state.help) {
            return null
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
                <h1>Advanced Styles Help</h1>
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
                    <li>- Custom classes and a better CSS editor are coming soon.</li>
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
}