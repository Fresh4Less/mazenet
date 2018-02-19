/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import { Observable } from 'rxjs';

export class ObservableMapper<T> {

    constructor() {
        this.observableContainer = {};
        this.idCounter = 0;
    }

    private observableContainer: { [key: string]: Observable<T> };
    private idCounter: number;

    GetNewId() {
        this.idCounter++;

        return 'id' + this.idCounter;
    }

    GetObservableForId(id: string): Observable<T> {

        var ob = this.observableContainer[id];

        if (ob) {
            delete this.observableContainer[id];
        }

        return ob;
    }

    SetObservableForId(id: string, observable: Observable<T>): void {
        if (this.observableContainer[id]) {
            throw new Error('Promise already exist for given ID');
        } else {
            this.observableContainer[id] = observable;
        }
    }
}