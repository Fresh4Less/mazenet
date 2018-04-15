import { Models } from '../../../common/api/v1';
import StructureWorkshop from '../components/structureWorkshop/structureWorkshop';
import { SocketAPI } from './SocketAPI';
import { ErrorService } from './ErrorService';

export class StructureWorkshopService {
    private static _instance: StructureWorkshopService;

    private structureWorkshopComponent: StructureWorkshop | null = null;

    private constructor() {

    }

    public SetStructureWorkshopComponent(sw: StructureWorkshop) {
        this.structureWorkshopComponent = sw;
    }

    public CreateStructureTunnel(room: Models.Room) {
        if (!this.structureWorkshopComponent) {
            return;
        }
        let tunnelData: Models.StructureData.Tunnel = {
            sType: 'tunnel',
            sourceId: room.id,
            targetId: '',
            sourceText: '',
            targetText: 'back',
        };
        let tunnelStructure: Models.Structure = {
            id: '',
            creator: '',
            pos: { // Positions outside the unit square are treated as null.
                x: -1,
                y: -1
            },
            data: tunnelData,
        };
        this.structureWorkshopComponent.SetStructure(tunnelStructure, room);
    }

    public CreateStructureText(room: Models.Room) {
        if (!this.structureWorkshopComponent) {
            return;
        }
        let textData: Models.StructureData.Text = {
            sType: 'text',
            roomId: room.id,
            text: '',
            width: 0.1,
        };
        let textStructure: Models.Structure = {
            id: '',
            creator: '',
            pos: { // Positions outside the unit square are treated as null.
                x: -1,
                y: -1
            },
            data: textData,
        };
        this.structureWorkshopComponent.SetStructure(textStructure, room);
    }

    public SelectStructureAndEdit(room: Models.Room) {
        if (!this.structureWorkshopComponent) {
            return;
        }
        this.structureWorkshopComponent.SelectStructureAndSet(room);
    }

    public SaveStructure(structure: Models.Structure, room: Models.Room) {
        if (structure.id.length > 0) {
            let structurePatchData: Models.StructureData.Patch | null = null;

            switch (structure.data.sType) {
                case 'tunnel':
                    structurePatchData = {
                        sourceText: structure.data.sourceText,
                        targetText: structure.data.targetText,
                    };
                    break;
                case 'text':
                    structurePatchData = {
                        text: structure.data.text,
                        width: structure.data.width,
                    };
                    break;
                default:
                    ErrorService.Warning('Attempt to save undefined Structure.', structure);
            }
            if (structurePatchData) {
                SocketAPI.Instance.UpdateStructure(structure.id, {
                    pos: structure.pos,
                    data: structurePatchData,
                });
            }
        } else { // Create new structure
            let blueprintData: Models.StructureDataBlueprint | null = null;
            switch (structure.data.sType) {
                case 'tunnel':
                    blueprintData = {
                        sType: 'tunnel',
                        sourceText: structure.data.sourceText,
                        targetText: structure.data.targetText,
                    };
                    break;
                case 'text':
                    blueprintData = {
                        sType: 'text',
                        text: structure.data.text,
                        width: structure.data.width,
                    };
                    break;
                default:
                    ErrorService.Warning('Attempt to save undefined Structure.', structure);
            }
            if (blueprintData !== null) {
                SocketAPI.Instance.CreateStructure(room.id, {
                    pos: structure.pos,
                    data: blueprintData,
                });
            }
        }
    }

    public static get Instance(): StructureWorkshopService {
        return this._instance || (this._instance = new StructureWorkshopService());
    }
}