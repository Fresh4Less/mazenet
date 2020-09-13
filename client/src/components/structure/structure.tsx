import * as React from 'react';

import { Models } from '../../../../common/api/v1';
import Tunnel from './tunnel';
import Text from './text';

export interface StructureProps {
    room: Models.Room;
    structure: Models.Structure;
    doneEditingCb: ((m: Models.Structure | null) => void) | null;
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
                        room={this.props.room}
                        doneEditingCb={this.props.doneEditingCb}
                        isEditing={this.props.isEditing}
                        tunnelData={tunnelData}
                    />
                );
                break;
            case 'text':
                const textData = (this.props.structure.data as Models.StructureData.Text);
                structureElement = (
                    <Text
                        structure={this.props.structure}
                        room={this.props.room}
                        doneEditingCb={this.props.doneEditingCb}
                        isEditing={this.props.isEditing}
                        textData={textData}
                    />
                );
                break;
            default:
                break;
        }
        return structureElement;
    }

}