import { WebResponse } from '../models/freshIO/WebResponse';
import { ErrorService } from './ErrorService';
import { Observer } from 'rxjs/Observer';

/**
 * Stores and completes Observers of pending transactions.
 */
export class TransactionManager {

    private idCounter: number;
    private requestObserverMap: { [id: string]: Observer<any>};

    constructor() {
        this.idCounter = 0;
        this.requestObserverMap = {};
    }

    /**
     * Stores the observer for a new transaction and returns a unique request ID. That observer will be stored until
     * CompleteTransaction() or ErrorTransaction() is called with a WebResponse containing the same unique request ID.
     * @param {Observer<any>} o observer to be held for a transaction
     * @returns {string} the request ID to send with this transaction's request
     */
    public NewTransactionWithObserver(o: Observer<any>): string {
        const id = `id-${this.idCounter++}`;
        this.requestObserverMap[id] = o;
        return id;
    }

    /**
     * Completes the observer stored for the unique request ID of the passed WebResponse. Calls `next(...)` on the
     * stored observer with nextValue followed by `complete()`.
     * @param {WebResponse} response
     * @param nextValue value to emit from the stored Observer
     */
    public CompleteTransaction(response: WebResponse, nextValue: any): void {
        const id = response.headers['X-Fresh-Request-Id'];
        const o  = this.requestObserverMap[id];
        if (o) {
            o.next(nextValue);
            o.complete();
            delete this.requestObserverMap[id];
        } else {
            ErrorService.Warning(
                `attempted to complete non-added transaction: ${
                    id}`, response);
        }
    }

    /**
     * Errors the observer stored for the unique request ID of the passed WebResounse. Calls `error(...)` with the
     * WebResponse containing which presumably contains the error.
     * @param response
     */
    public ErrorTransaction(response: WebResponse): void {
        const id = response.headers['X-Fresh-Request-Id'];
        const o  = this.requestObserverMap[id];
        if (o) {
            o.error(response);
            delete this.requestObserverMap[id];
        } else {
            ErrorService.Warning(
                `attempted to error non-added transaction: ${
                    id}`, response);
        }
    }
}