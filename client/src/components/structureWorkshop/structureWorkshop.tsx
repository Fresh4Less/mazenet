import * as React from 'react';

import './structureWorkshop.css';
import { Models } from '../../../../common/api/v1';
import { StructureWorkshopService } from '../../services/StructureWorkshopService';
import Structure from '../structure/structure';

import svg from '../windowPane/close.svg';

interface StructureWorkshopProps {
    room: Models.Room;
}

interface StructureWorkshopState {
    active: boolean;
    positioning: boolean;
    structure: Models.Structure | null;
}

export class StructureWorkshop extends React.Component<StructureWorkshopProps, StructureWorkshopState> {

    private clickHandler: (e: React.MouseEvent<HTMLDivElement>) => void;
    private overlayDiv: HTMLDivElement | null = null;

    constructor(props: any) {
        super(props);
        this.clickHandler = this.click.bind(this);

        this.state = {
            active: false,
            positioning: true,
            structure: null,
        };
        StructureWorkshopService.Instance.SetStructureWorkshopComponent(this);

        document.body.addEventListener('keydown', this.keyDown.bind(this));
    }

    public SelectStructureAndSet(room: Models.Room) {
        if (!this.Close(false)) {
            return; // Use didn't want to cancel whatever they were doing.
        }
        this.setState({
            active: true,
            positioning: false,
            structure: null,
        });
    }

    public SetStructure(structure: Models.Structure, room: Models.Room) {
        if (!this.Close(false)) {
            return; // Use didn't want to cancel whatever they were doing.
        }
        this.setState({
            active: true,
            positioning: true,
            structure: structure,
        });
    }

    public Close(force: boolean): boolean {
        if (this.state.active && this.state.structure && !force) {
            let result = confirm('Unsaved changes will be lost. Are you sure?');
            if (!result) {
                return false;
            }
        }

        this.setState({
            active: false,
            positioning: true,
            structure: null,
        });
        return true;
    }

    public IsActive(): boolean {
        return this.state.active;
    }

    private click(e: React.MouseEvent<HTMLDivElement>): void {
        if (this.overlayDiv === null ||
            this.state.structure === null ||
            this.state.positioning === false) {
            return;
        }
        let yOffset = this.overlayDiv.getBoundingClientRect().top;
        let clickX = e.clientX;
        let clickY = e.clientY - yOffset;
        this.state.structure.pos = {
            x: clickX / this.overlayDiv.clientWidth,
            y: clickY / this.overlayDiv.clientHeight
        };
        this.setState({
            structure: this.state.structure,
        });
    }

    private keyDown(e: KeyboardEvent): void {
        if (!this.state.active) {
            return;
        }

        if (e.key === 'Escape') {
            this.Close(false);
        }
    }

    private doneEditing(data: Models.Structure | null): void {
        if (data === null ||
            this.state.structure === null) {
            this.Close(true);
            return;
        }
        StructureWorkshopService.Instance.SaveStructure(data, this.props.room);
        this.Close(true);
    }

    render() {
        if (!this.state.active) {
            return null;
        }
        let structure: JSX.Element | null = this.renderStateStructure();
        let roomStructureSelectors = this.state.structure === null ? this.renderRoomStructureSelectors() : null;
        return (
            <div
                id={'StructureWorkshop'}
                className={this.state.positioning ? 'seeking-position' : ''}
                ref={(el) => {
                    this.overlayDiv = el;
                }}
                onClick={this.clickHandler}
            >
                {structure}
                {roomStructureSelectors}
                <div
                    className={'close-button'}
                    title={'Close Structure Workshop.'}
                    onClick={() => {
                        this.Close(false);
                    }}
                    dangerouslySetInnerHTML={{__html: svg}}
                />
            </div>
        );
    }

    private renderRoomStructureSelectors(): JSX.Element[] {
        let room = this.props.room;
        let notNull = function (value: JSX.Element | null): value is JSX.Element { // Hack to make TS happy :)
            return value !== null;
        };

        return Object.keys(room.structures).map((id) => {
            const structure = room.structures[id];
            const structureElement = document.getElementById(`id-${id}`);
            if (structureElement === null) {
                return null;
            }
            const rect = structureElement.getBoundingClientRect(); // TODO: Find an alternative
            const style = {
                top: `${structure.pos.y * 100}%`,
                left: `${structure.pos.x * 100}%`,
                width: `${rect.width + 4}px`,
                height: `${rect.height + 4}px`,
                transform: `translate(-2px, -2px)`,
            };
            return (
                <div
                    key={id}
                    className={'structure-selector'}
                    title={`Structure ID: ${structure.id}`}
                    style={style}
                    onClick={(e) => {
                        let copiedStructure = JSON.parse(JSON.stringify(structure)); // deep copy
                        this.SetStructure(copiedStructure, room);
                    }}
                />
            );
        }).filter(notNull);
    }

    private renderStateStructure(): JSX.Element | null {
        if (this.state.structure) {
            let x = this.state.structure.pos.x;
            let y = this.state.structure.pos.y;
            let realStructurePosition = x >= 0 && x <= 1 && y >= 0 && y <= 1;
            if (realStructurePosition) {
                return (
                    <Structure
                        room={this.props.room}
                        structure={this.state.structure}
                        doneEditingCb={(data) => {
                            this.doneEditing(data);
                        }}
                        isEditing={true}
                    />
                );
            }
        }
        return null;
    }
}