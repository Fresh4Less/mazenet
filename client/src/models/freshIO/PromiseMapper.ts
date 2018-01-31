/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

export class PromiseMapper {

    private promiseContainer: { [key: string]: { resolve: (value?: {} | PromiseLike<{}>) => void, reject: (reason?: any) => void } };
    private idCounter: number;

    constructor() {
        this.promiseContainer = {};
        this.idCounter = 0;
    }

    GetNewId() {
        this.idCounter++;

        return 'id' + this.idCounter;
    }

    GetPromiseForId(id: string): { resolve: (value?: {} | PromiseLike<{}>) => void, reject: (reason?: any) => void } {

        let p = this.promiseContainer[id];

        if (p) {
            delete this.promiseContainer[id];
        }

        return p;
    }

    SetPromiseForId(id: string, resolverContainer: {
        resolve: (value?: {} | PromiseLike<{}>) => void,
        reject: (reason?: any) => void
    }): void {
        if (this.promiseContainer[id]) {
            throw new Error('Promise already exist for given ID');
        } else {
            this.promiseContainer[id] = resolverContainer;
        }
    }
}