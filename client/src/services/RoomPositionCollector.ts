import { Models } from '../../../common/api/v1';

export class RoomPositionCollector {
    private static _instance: RoomPositionCollector;

    private overlayElement: HTMLDivElement;
    private waitingCallbacks: ((pos: Models.Position | null) => void)[];

    private constructor() {
        this.waitingCallbacks = [];
        this.overlayElement = document.createElement('div');
        this.overlayElement.style.width = '100%';
        this.overlayElement.style.height = '100%';
        this.overlayElement.style.position = 'absolute';
        this.overlayElement.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this.overlayElement.style.cursor = 'pointer';
        this.overlayElement.addEventListener('click', this.overlayClicked.bind(this));
        document.body.addEventListener('click', this.cleanupWithResult.bind(this, null));
        document.body.addEventListener('keydown', this.cleanupWithResult.bind(this, null));
    }

    public GetPositionInRoom(roomId: string, callback: (pos: Models.Position | null) => void) {
        const roomElement = document.getElementById(roomId);
        if (roomElement && roomElement.parentElement) {
            roomElement.parentElement.appendChild(this.overlayElement);
            this.waitingCallbacks.push(callback);
        }
        callback(null);
    }

    private overlayClicked(e: MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        let pos: Models.Position = {
            x: e.offsetX / this.overlayElement.clientWidth,
            y: e.offsetY / this.overlayElement.clientHeight
        };
        this.cleanupWithResult(pos);
    }

    private cleanupWithResult(pos: Models.Position | null) {
        if (this.overlayElement.parentElement) {
            this.overlayElement.parentElement.removeChild(this.overlayElement);
        }
        const callbacks = this.waitingCallbacks;
        this.waitingCallbacks = [];
        callbacks.forEach((cb) => {
            cb(pos);
        });
    }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }
}