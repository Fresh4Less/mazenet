import * as React from 'react';
import { Models } from '../../../../common/api/v1';
import { StructureProps } from './structure';

import './text.css';

interface TextProps extends StructureProps {
    textData: Models.StructureData.Text;
}

interface TextState {
    width: number;
    height: number;
    text: string;
}

export default class Text extends React.Component<TextProps, TextState> {

    private editTextArea: HTMLTextAreaElement | null;

    constructor(props: TextProps) {
        super(props);

        this.state = {
            width: props.textData.width,
            height: 22,
            text: props.textData.text,
        };
    }

    render() {
        // Positioning
        const x = Math.min(Math.max(this.props.structure.pos.x, 0.0), 1.0) * 100;
        const y = Math.min(Math.max(this.props.structure.pos.y, 0.0), 1.0) * 100;

        if (this.props.isEditing) {
            return this.renderEditing(x, y);
        } else {
            return this.renderDefault(x, y);
        }
    }

    private renderDefault(x: number, y: number) {
        const style = {
            width: `${this.props.textData.width * 100}%`,
            left: `${x}%`,
            top: `${y}%`
        };
        return (
            <pre
                id={this.props.structure.id}
                style={style}
                className={'structure text'}
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
                className={'structure text'}
                onClick={(e) => {
                    e.stopPropagation(); // Keep from repositioning in StructureWorkshop.
                }}
            >
                <div>
                <textarea
                    style={textAreaStyle}
                    value={this.state.text}
                    onChange={(e) => {
                        this.updateTextArea(e.target);
                    }}
                    ref={(el) => {
                        if (!el) {
                            return;
                        }
                        this.editTextArea = el;
                        this.updateTextArea(el);
                        el.focus();
                    }}
                />
                </div>
                <button
                    onClick={() => {
                        this.submit();
                    }}
                >
                    Submit
                </button>
            </div>
        );

    }

    private submit() {
        if (!this.props.doneEditingCb) {
            return;
        }
        if (!this.editTextArea ||
            this.state.text.length === 0) {
            this.props.doneEditingCb(null);
            return;
        }

        let editedTextStructure = Object.assign({}, this.props.structure);
        editedTextStructure.data = Object.assign({}, this.props.textData);
        editedTextStructure.data.text = this.state.text;
        editedTextStructure.data.width = this.editTextArea.clientWidth / window.innerWidth;
        this.props.doneEditingCb(editedTextStructure);
    }

    private updateTextArea(el: HTMLTextAreaElement): void {
        let oldHeight = el.style.height;
        el.style.height = '5px';
        // let width = this.state.width;
        // if (el.style.width) {
        //     console.log(el.style.width);
        //     width = parseInt(el.style.width, 10) / window.innerWidth;
        //     console.log(width);
        // }
        if (this.state.text !== el.value || this.state.height !== el.scrollHeight) {
            this.setState({
                height: el.scrollHeight,
                text: el.value,
            });
        }
        el.style.height = oldHeight;
    }
}