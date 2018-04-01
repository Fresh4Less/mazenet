import * as React from 'react';

import { Models } from '../../../../../common/api/v1';
import Tunnel from './tunnel';
import Text from './text';

import './structure.css';

interface StructureProps {
    room: Models.Room;
    structure: Models.Structure;
    isEditing: boolean;
}

export default class Structure extends React.Component<StructureProps, any> {

    constructor(props: StructureProps) {
        super(props);
    }

    render() {
        let structureElement: JSX.Element | null = null;
        switch (this.props.structure.data.sType) {
            case 'tunnel':
                const tunnelData = (this.props.structure.data as Models.StructureData.Tunnel);
                structureElement = (
                    <Tunnel
                        structure={this.props.structure}
                        tunnelData={tunnelData}
                        room={this.props.room}
                        isEditing={this.props.isEditing}
                    />
                );
                break;
            case 'text':
                const textData = (this.props.structure.data as Models.StructureData.Text);
                structureElement = (
                    <Text
                        structure={this.props.structure}
                        textData={textData}
                        room={this.props.room}
                    />
                );
                break;
            default:
                break;
        }
        return structureElement;
    }

}