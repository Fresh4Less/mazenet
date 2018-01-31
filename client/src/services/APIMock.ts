/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import { MzPosition } from '../models/MzPosition';
import { CursorFrame } from '../models/cursors/CursorFrame';
import { Page } from '../models/pages/Page';
import { IElement } from '../models/interfaces/IElement';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

class API {

    // Emits whenever the user enters a page.
    readonly pageEnterObservable: Observable<Page>;
    // Emits whenever the current page updates.
    readonly pageUpdatedObservable: Observable<Page>;

    private pageEnterObserver: Observer<Page>;
    private pageUpdatedObserver: Observer<Page>;

    constructor() {
        console.log('constructing new API mock');

        /* Setup the Observable feeds */
        this.pageEnterObservable = new Observable((observer: Observer<Page>) => {
           this.pageEnterObserver = observer;
        }).share();

        this.pageUpdatedObservable = new Observable((observer: Observer<Page>) => {
            this.pageUpdatedObserver = observer;
        }).share();
    }

    public EnterPage(pageId: string, entryPosition: MzPosition): void {
        this.pageEnterObserver.next(new Page());
    }

    public UpdatePage(pageData: Page): void {
        this.pageUpdatedObserver.next(pageData);
    }

    public CreateElement(element: IElement): void {
    }

    public CursorMove(cursor: CursorFrame): void {
    }
}

const instance = new API();

export default instance;