import * as React from 'react';
import { Models } from '../../../../../common/api/v1';

interface TextProps {
    room: Models.Room;
    structure: Models.Structure;
    textData: Models.StructureData.Text;
}

export default class Text extends React.Component<TextProps, any> {
    constructor(props: TextProps) {
        super(props);
    }
    render() {
        // Positioning
        const x = Math.min(Math.max(this.props.structure.pos.x, 0.0), 1.0) * 100;
        const y = Math.min(Math.max(this.props.structure.pos.y, 0.0), 1.0) * 100;
        const style = {
            left: `${x}%`,
            top: `${y}%`
        };
        return (
            <div
                style={style}
                className={'structure'}
                title={this.props.structure.id}
            >
                {this.props.textData.text}
            </div>
        );
    }
}