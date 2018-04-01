import { Models } from '../../../common/api/v1';
import { SocketAPI } from './SocketAPI';

export class StructureWorkshop {
    private static _instance: StructureWorkshop;

    private overlayDiv: HTMLDivElement;
    private textH1: HTMLHeadingElement;
    private getPositionCallback: ((pos: Models.Position | null) => void) | null;

    private isOpen: boolean;

    private constructor() {
        this.overlayDiv = document.createElement('div');
        this.overlayDiv.style.width = '100%';
        this.overlayDiv.style.height = '100%';
        this.overlayDiv.style.position = 'absolute';
        this.overlayDiv.style.backgroundColor = 'rgba(0,0,0,0.3)';
        this.overlayDiv.addEventListener('click', this.positionClicked.bind(this));

        this.textH1 = document.createElement('h1');
        this.textH1.innerText = '';
        this.textH1.style.pointerEvents = 'none';
        this.textH1.style.position = 'absolute';
        this.textH1.style.top = '50%';
        this.textH1.style.left = '50%';
        this.textH1.style.transform = 'translate(-50%,-50%)';
        this.textH1.style.color = 'rgba(255,255,255,0.3)';
        this.overlayDiv.appendChild(this.textH1);

        this.getPositionCallback = null;
        this.isOpen = false;

        document.body.addEventListener('click', this.closeWorkshop.bind(this));
        document.body.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    public CreateStructureTunnel(room: Models.Room) {
        if (this.openWorkshop(room)) {
            this.getPosition((pos: Models.Position | null) => {
                this.textH1.innerText = 'Type Tunnel Text';
                    if (pos) {
                        const sourceText = prompt('Text of this tunnel?');
                        if (sourceText) {
                            const targetText = prompt('Text of the tunnel on the other side?',
                                room.title);
                            if (targetText) {
                                const blueprint: Models.Structure.Blueprint = {
                                    pos: pos,
                                    data: {
                                        sType: 'tunnel',
                                        sourceText: sourceText,
                                        targetText: targetText
                                    }
                                };
                                SocketAPI.Instance.CreateStructure(room.id, blueprint);
                                this.closeWorkshop();
                            }
                        }
                    }
            });
        }
    }
    private getPosition(cb: (pos: Models.Position | null) => void) {
        this.textH1.innerText = 'Click Anywhere To Position';
        this.overlayDiv.style.cursor = 'crosshair';
        this.getPositionCallback = cb;
    }
    // Returns true if the open call was successful. If already open or failure returns false
    private openWorkshop(room: Models.Room): boolean {
        if (this.isOpen) {
            return false;
        }
        const roomElement = document.getElementById(room.id);
        if (roomElement && roomElement.parentElement) {
            roomElement.parentElement.appendChild(this.overlayDiv);
            this.isOpen = true;
            return true;
        }
        return false;
    }

    private positionClicked(e: MouseEvent) {
        this.textH1.innerText = '';
        this.overlayDiv.style.cursor = 'default';
        e.stopPropagation();
        e.preventDefault();
        let pos: Models.Position = {
            x: e.offsetX / this.overlayDiv.clientWidth,
            y: e.offsetY / this.overlayDiv.clientHeight
        };
        if (this.getPositionCallback) {
            this.getPositionCallback(pos);
        }
        this.getPositionCallback = null;
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.closeWorkshop();
        }

    }

    private closeWorkshop() {
        if (this.overlayDiv.parentElement) {
            this.overlayDiv.parentElement.removeChild(this.overlayDiv);
        }
        if (this.getPositionCallback) {
            this.getPositionCallback(null);
        }
        this.getPositionCallback = null;
        this.isOpen = false;
    }

    public static get Instance() {
        return this._instance || (this._instance = new StructureWorkshop());
    }
}