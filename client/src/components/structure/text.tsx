import * as React from 'react';
import * as textCSS from './text.css';
import * as structureCSS from './structure.css';

import { Models } from '../../../../common/api/v1';
import { StructureProps } from './structure';

interface TextProps extends StructureProps {
    textData: Models.StructureData.Text;
}

interface TextState {
    width: number;
    height: number;
    dirty: boolean;
    text: string;
}

export default class Text extends React.Component<TextProps, TextState> {

    private previousPosition: Models.Position | null = null;
    private editTextArea: HTMLTextAreaElement | null;

    constructor(props: TextProps) {
        super(props);

        this.previousPosition = props.structure.pos;
        this.state = {
            width: props.textData.width,
            height: 22,
            dirty: false,
            text: props.textData.text,
        };
    }

    componentWillReceiveProps(props: TextProps) {
        // If it was repositioned mark it as dirty.
        if (this.previousPosition &&
            (props.structure.pos.x !== this.previousPosition.x ||
                props.structure.pos.y !== this.previousPosition.y)) {
            this.setState({
                dirty: true
            });
        }
        this.previousPosition = props.structure.pos;

    }

    render() {
        const x = Math.min(Math.max(this.props.structure.pos.x, 0.0), 1.0) * 100;
        const y = Math.min(Math.max(this.props.structure.pos.y, 0.0), 1.0) * 100;
        return this.props.isEditing ? this.renderEditing(x, y) : this.renderDefault(x, y);
    }

    private renderDefault(x: number, y: number) {
        const style = {
            width: `${this.props.textData.width * 100}%`,
            left: `${x}%`,
            top: `${y}%`
        };
        return (
            <pre
                id={`id-${this.props.structure.id}`}
                style={style}
                className={`${structureCSS.structure} ${textCSS.text} text`}
            >
                {this.props.textData.text}
            </pre>
        );
    }

    private renderEditing(x: number, y: number) {
        const style = {
            width: `${this.state.width * 100}%`,
            left: `${x}%`,
            top: `${y}%`
        };
        const textAreaStyle = {
            width: '100%',
            height: `${this.state.height}px`,
        };
        return (
            <div
                style={style}
                className={`${structureCSS.structure} ${textCSS.text} text`}
                onClick={(e) => {
                    e.stopPropagation(); // Keep from repositioning in StructureWorkshop.
                }}
            >
                <div className={`${structureCSS.actionButtons}`}>
                    <button
                        onClick={() => {
                            this.cancel();
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!this.state.dirty}
                        onClick={() => {
                            this.submit();
                        }}
                    >
                        Submit
                    </button>
                </div>
                <textarea
                    style={textAreaStyle}
                    value={this.state.text}
                    onChange={(e) => {
                        this.updateTextArea(e.target);
                    }}
                    onMouseUp={(e) => {
                        this.updateTextArea(e.currentTarget);
                    }}
                    ref={(el) => {
                        if (!el) {
                            return;
                        }
                        this.editTextArea = el;
                        this.updateTextArea(el, true);
                        el.focus();
                    }}
                />
            </div>
        );
    }

    private cancel() {
        if (!this.props.doneEditingCb) {
            return;
        }
        if (!this.state.dirty || confirm('Unsaved changes will be lost. Are you sure?')) {
            this.props.doneEditingCb(null);
        }
    }

    private submit() {
        if (!this.props.doneEditingCb) {
            return;
        }
        if (!this.editTextArea ||
            !this.state.dirty) {
            this.props.doneEditingCb(null);
            return;
        }

        let editedTextStructure = Object.assign({}, this.props.structure);
        editedTextStructure.data = Object.assign({}, this.props.textData);
        editedTextStructure.data.text = this.state.text;
        editedTextStructure.data.width = this.editTextArea.clientWidth / window.innerWidth;
        this.props.doneEditingCb(editedTextStructure);
    }

    private updateTextArea(el: HTMLTextAreaElement, dontDirty?: boolean): void {
        let oldHeight = el.style.height;
        el.style.height = '5px';
        if (this.state.text !== el.value || this.state.height !== el.scrollHeight) {
            this.setState({
                height: el.scrollHeight,
                dirty: !dontDirty && el.value.length > 0,
                text: el.value,
            });
        }
        el.style.height = oldHeight;
    }
}